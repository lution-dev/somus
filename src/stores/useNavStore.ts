import { create } from 'zustand'

/**
 * useNavStore — Estado de navegação leve (sem persist).
 *
 * Propósito: coordenar estado cross-component que não faz parte do domínio
 * financeiro e não precisa ser salvo no localStorage/Firestore.
 *
 * Casos de uso atuais:
 * - GhostLink Fluxo→Essencial: ao clicar em "Custos Fixos" no Fluxo,
 *   o usuário navega para DivisaoDetalhe/Essencial e a seção "Meses futuros"
 *   abre automaticamente + recebe um pulso de highlight (glow 1x).
 *
 * Não usar para:
 * - Estado financeiro (→ useAppStore)
 * - Estado que precisa persistir entre sessões (→ useAppStore com persist)
 */
interface NavStore {
  /** Controla a seção "Meses futuros" no Fluxo */
  fluxoFutureOpen: boolean
  setFluxoFutureOpen: (open: boolean) => void
  /** Contador de pulso: incrementar dispara animação de glow uma vez */
  fluxoFuturePulse: number
  triggerFluxoFuturePulse: () => void
}

export const useNavStore = create<NavStore>()(set => ({
  fluxoFutureOpen: false,
  setFluxoFutureOpen: (open) => set({ fluxoFutureOpen: open }),
  fluxoFuturePulse: 0,
  triggerFluxoFuturePulse: () => set(s => ({ fluxoFuturePulse: s.fluxoFuturePulse + 1 })),
}))
