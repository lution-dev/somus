/**
 * useCurrencyInput — Formatação automática estilo calculadora para moeda brasileira.
 *
 * Comportamento:
 *   - Usuário digita apenas dígitos (teclado numérico)
 *   - Valor é tratado como centavos à direita:
 *       "1"      → "0,01"
 *       "12"     → "0,12"
 *       "123"    → "1,23"
 *       "1234"   → "12,34"
 *       "12345"  → "123,45"
 *       "123456" → "1.234,56"
 *   - Backspace remove o último dígito
 *   - numericValue retorna o valor float para salvar no estado
 *
 * Uso:
 *   const { displayValue, numericValue, handleChange, reset } = useCurrencyInput()
 *   <Input value={displayValue} onChange={handleChange} inputMode="numeric" />
 */

import { useState, useCallback } from 'react'

interface UseCurrencyInputOptions {
  /** Valor inicial em centavos (opcional) */
  initialCents?: number
}

interface UseCurrencyInputResult {
  /** Valor formatado para exibição: "1.234,56" */
  displayValue: string
  /** Valor numérico (float) para salvar: 1234.56 */
  numericValue: number
  /** Handler para o onChange do input */
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Reseta para zero */
  reset: () => void
  /** Define valor programaticamente a partir de um float */
  setValue: (val: number) => void
}

function centsToDisplay(cents: number): string {
  if (cents === 0) return ''
  const str = String(cents).padStart(3, '0')
  const intPart = str.slice(0, -2) || '0'
  const decPart = str.slice(-2)
  // Format int part with thousand separators
  const formatted = Number(intPart).toLocaleString('pt-BR')
  return `${formatted},${decPart}`
}

export function useCurrencyInput(options: UseCurrencyInputOptions = {}): UseCurrencyInputResult {
  const [cents, setCents] = useState<number>(
    options.initialCents !== undefined ? Math.round(options.initialCents) : 0
  )

  const displayValue = centsToDisplay(cents)
  const numericValue = cents / 100

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Extract only digits from input
    const digits = raw.replace(/\D/g, '')
    if (digits === '') {
      setCents(0)
      return
    }
    const newCents = parseInt(digits, 10)
    // Cap at 999.999.999,99 (99999999999 cents)
    setCents(Math.min(newCents, 99999999999))
  }, [])

  const reset = useCallback(() => setCents(0), [])

  const setValue = useCallback((val: number) => {
    setCents(Math.round(val * 100))
  }, [])

  return { displayValue, numericValue, handleChange, reset, setValue }
}
