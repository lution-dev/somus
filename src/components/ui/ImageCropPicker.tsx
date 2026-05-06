import { useRef, useState, useEffect, useCallback } from 'react'
import { X, Check, ZoomIn, ZoomOut, Move } from 'lucide-react'

interface Props {
  /** Source image URL or dataURL to crop */
  imageSrc: string
  /** Output canvas dimensions (the final crop rectangle) */
  outputWidth?: number
  outputHeight?: number
  /** Aspect ratio for the crop window, e.g. 16/9. Defaults to 2.5 (banner) */
  aspect?: number
  onConfirm: (dataUrl: string) => void
  onCancel: () => void
}

export default function ImageCropPicker({
  imageSrc,
  outputWidth = 900,
  outputHeight = 360,
  aspect = 900 / 360,
  onConfirm,
  onCancel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Offset of the image relative to the crop frame (in px)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  // Scale multiplier (1 = natural fit)
  const [scale, setScale] = useState(1)
  // Image natural size once loaded
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  // Frame size (rendered)
  const [frameSize, setFrameSize] = useState({ w: 320, h: 128 })

  // drag state
  const drag = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0 })

  // Compute the frame size from container on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const { width } = el.getBoundingClientRect()
    const h = Math.round(width / aspect)
    setFrameSize({ w: width, h })
  }, [aspect])

  // Once image is loaded, set initial scale to fill the frame
  const onLoad = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    setImgSize({ w: nw, h: nh })
    // scale to fill frame
    const scaleX = frameSize.w / nw
    const scaleY = frameSize.h / nh
    const s = Math.max(scaleX, scaleY)
    setScale(s)
    // center
    const dw = nw * s
    const dh = nh * s
    setOffset({ x: -(dw - frameSize.w) / 2, y: -(dh - frameSize.h) / 2 })
  }, [frameSize])

  // Clamp offset so image always fills the frame
  const clampOffset = useCallback((ox: number, oy: number, s: number) => {
    const dw = imgSize.w * s
    const dh = imgSize.h * s
    const minX = frameSize.w - dw
    const minY = frameSize.h - dh
    return {
      x: Math.min(0, Math.max(minX, ox)),
      y: Math.min(0, Math.max(minY, oy)),
    }
  }, [imgSize, frameSize])

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    const clamped = clampOffset(drag.current.ox + dx, drag.current.oy + dy, scale)
    setOffset(clamped)
  }
  const onMouseUp = () => { drag.current.active = false }

  // Touch drag
  const touchStart = useRef({ x: 0, y: 0, ox: 0, oy: 0, dist: 0, s0: 1 })
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: offset.x, oy: offset.y, dist: 0, s0: scale }
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      touchStart.current = { ...touchStart.current, dist: Math.hypot(dx, dy), s0: scale }
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStart.current.x
      const dy = e.touches[0].clientY - touchStart.current.y
      const clamped = clampOffset(touchStart.current.ox + dx, touchStart.current.oy + dy, scale)
      setOffset(clamped)
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.max(0.5, Math.min(5, touchStart.current.s0 * (dist / touchStart.current.dist)))
      setScale(newScale)
      setOffset(prev => clampOffset(prev.x, prev.y, newScale))
    }
  }

  // Scroll to zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setScale(prev => {
      const minScale = Math.max(frameSize.w / imgSize.w, frameSize.h / imgSize.h)
      const next = Math.max(minScale, Math.min(5, prev + delta))
      setOffset(o => clampOffset(o.x, o.y, next))
      return next
    })
  }

  const zoomStep = (dir: 1 | -1) => {
    setScale(prev => {
      const minScale = Math.max(frameSize.w / (imgSize.w || 1), frameSize.h / (imgSize.h || 1))
      const next = Math.max(minScale, Math.min(5, prev + dir * 0.15))
      setOffset(o => clampOffset(o.x, o.y, next))
      return next
    })
  }

  // Render crop to canvas and call onConfirm
  const handleConfirm = () => {
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const ctx = canvas.getContext('2d')
    if (!ctx || !imgRef.current) return
    // scale factors from rendered frame to output canvas
    const rx = outputWidth / frameSize.w
    const ry = outputHeight / frameSize.h
    ctx.drawImage(
      imgRef.current,
      0, 0, imgSize.w, imgSize.h,
      offset.x * rx, offset.y * ry,
      imgSize.w * scale * rx, imgSize.h * scale * ry,
    )
    onConfirm(canvas.toDataURL('image/jpeg', 0.88))
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Header */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, opacity: 0.7 }}
        >
          <X size={18} /> Cancelar
        </button>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, fontFamily: 'var(--font-sans)' }}>
          <Move size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Arraste para reposicionar
        </p>
        <button
          onClick={handleConfirm}
          style={{
            background: 'var(--color-accent-primary)', border: 'none',
            color: 'white', cursor: 'pointer', borderRadius: 10,
            padding: '6px 14px', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <Check size={15} /> Usar
        </button>
      </div>

      {/* Crop frame */}
      <div
        ref={containerRef}
        style={{
          width: '100%', maxWidth: 480,
          aspectRatio: `${aspect}`,
          borderRadius: 16, overflow: 'hidden',
          position: 'relative', cursor: 'grab',
          border: '2px solid rgba(255,255,255,0.25)',
          background: '#000',
          userSelect: 'none',
          touchAction: 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="crop"
          onLoad={onLoad}
          draggable={false}
          style={{
            position: 'absolute',
            left: offset.x, top: offset.y,
            width: imgSize.w * scale, height: imgSize.h * scale,
            maxWidth: 'none',
            pointerEvents: 'none',
          }}
        />
        {/* Rule-of-thirds grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '33.33% 33.33%',
        }} />
      </div>

      {/* Zoom controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginTop: 16,
      }}>
        <button
          onClick={() => zoomStep(-1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
        >
          <ZoomOut size={18} />
        </button>

        <div style={{ flex: 1, maxWidth: 160, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 9999, position: 'relative', cursor: 'pointer' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            const minScale = Math.max(frameSize.w / (imgSize.w || 1), frameSize.h / (imgSize.h || 1))
            const next = minScale + pct * (5 - minScale)
            setScale(next)
            setOffset(o => clampOffset(o.x, o.y, next))
          }}
        >
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 9999,
            background: 'white',
            width: `${Math.min(100, ((scale - 1) / 4) * 100)}%`,
          }} />
        </div>

        <button
          onClick={() => zoomStep(1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </div>
  )
}
