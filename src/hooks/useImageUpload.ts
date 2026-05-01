import { useState, useCallback } from 'react'

interface ImageUploadResult {
  /** Base64 data URL string (data:image/webp;base64,...) */
  dataUrl: string
  /** Size in bytes of the compressed image */
  sizeBytes: number
}

interface UseImageUpload {
  upload: (file: File) => Promise<ImageUploadResult | null>
  isProcessing: boolean
  error: string | null
}

/** Max dimension for resized images */
const MAX_DIMENSION = 800
/** JPEG quality (0-1) */
const QUALITY = 0.75
/** Max file size in bytes (500KB) — Firestore doc limit is 1MB */
const MAX_SIZE_BYTES = 500 * 1024

/**
 * Compresses an image file to a base64 data URL.
 * Since Firebase Storage requires the Blaze plan, we store images
 * as base64 strings directly in Firestore documents.
 *
 * Compression pipeline:
 * 1. Load image into canvas
 * 2. Resize to max 800px (longest side)
 * 3. Export as JPEG at 75% quality
 * 4. Convert to base64 data URL
 */
function compressImage(file: File): Promise<ImageUploadResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Draw to canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas not supported'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        // Export as JPEG base64
        const dataUrl = canvas.toDataURL('image/jpeg', QUALITY)
        const sizeBytes = Math.round((dataUrl.length * 3) / 4) // base64 → bytes approx

        if (sizeBytes > MAX_SIZE_BYTES) {
          // Try with lower quality
          const lowerQuality = canvas.toDataURL('image/jpeg', 0.5)
          const lowerSize = Math.round((lowerQuality.length * 3) / 4)
          resolve({ dataUrl: lowerQuality, sizeBytes: lowerSize })
        } else {
          resolve({ dataUrl, sizeBytes })
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = reader.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Hook for compressing images to base64 for Firestore storage.
 * No Firebase Storage needed — images are stored inline in documents.
 */
export function useImageUpload(): UseImageUpload {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File): Promise<ImageUploadResult | null> => {
    setIsProcessing(true)
    setError(null)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem')
      }

      // Validate raw file size (reject > 10MB raw)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Imagem muito grande (máx 10MB)')
      }

      const result = await compressImage(file)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar imagem'
      setError(message)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return { upload, isProcessing, error }
}
