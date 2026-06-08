import { create } from 'zustand'

/**
 * useNavStore — Estado de navegação leve (sem persist).
 *
 * Propósito: coordenar estado cross-component que não faz parte do domínio
 * financeiro e não precisa ser salvo no localStorage/Firestore.
 */
interface NavStore {
  /** Controla a seção "Meses futuros" no Fluxo */
  fluxoFutureOpen: boolean
  setFluxoFutureOpen: (open: boolean) => void
  /** Contador de pulso: incrementar dispara animação de glow uma vez */
  fluxoFuturePulse: number
  triggerFluxoFuturePulse: () => void
  /** Controla abertura automática da seção "Lançados" no Fluxo (vindo da Home) */
  fluxoLancadosOpen: boolean
  setFluxoLancadosOpen: (open: boolean) => void
  /** Persiste o estado de collapse das seções Pendentes e Lançamentos no Fluxo */
  fluxoPendingCollapsed: boolean
  setFluxoPendingCollapsed: (v: boolean) => void
  fluxoRealizedCollapsed: boolean
  setFluxoRealizedCollapsed: (v: boolean) => void
}

export const useNavStore = create<NavStore>()(set => ({
  fluxoFutureOpen: false,
  setFluxoFutureOpen: (open) => set({ fluxoFutureOpen: open }),
  fluxoFuturePulse: 0,
  triggerFluxoFuturePulse: () => set(s => ({ fluxoFuturePulse: s.fluxoFuturePulse + 1 })),
  fluxoLancadosOpen: false,
  setFluxoLancadosOpen: (open) => set({ fluxoLancadosOpen: open }),
  fluxoPendingCollapsed: false,
  setFluxoPendingCollapsed: (v) => set({ fluxoPendingCollapsed: v }),
  fluxoRealizedCollapsed: false,
  setFluxoRealizedCollapsed: (v) => set({ fluxoRealizedCollapsed: v }),
}))
