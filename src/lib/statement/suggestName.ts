/** Limpa memos bancários típicos (PIX, transferências, códigos). */
export function suggestName(raw: string): string {
  let s = raw.trim()
  s = s.replace(/\s+/g, ' ')
  // Prefixos comuns BR
  s = s.replace(/^(PIX\s*(ENVIADO|RECEBIDO|QR\s*CODE)?\s*[-:]?\s*)/i, '')
  s = s.replace(/^(TED|DOC|TEF)\s*[-:]?\s*/i, '')
  s = s.replace(/^(PAGAMENTO\s+(DE\s+)?BOLETO)\s*[-:]?\s*/i, '')
  s = s.replace(/^(COMPRA\s+COM\s+CART[AÃ]O)\s*[-:]?\s*/i, '')
  s = s.replace(/^(TRANSFERENCIA|TRANSFERÊNCIA)\s*[-:]?\s*/i, '')
  // Códigos longos no fim
  s = s.replace(/\s+\d{8,}\s*$/g, '')
  s = s.replace(/\s{2,}/g, ' ').trim()
  if (!s) return raw.trim() || 'Lançamento'
  // Title-ish: primeira letra maiúscula se tudo veio em caps
  if (s === s.toUpperCase() && s.length > 3) {
    s = s.charAt(0) + s.slice(1).toLowerCase()
  }
  return s
}
