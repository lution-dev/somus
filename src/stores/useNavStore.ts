import { create } from 'zustand'

interface NavStore {
  // Controls the "Meses futuros" section in Fluxo directly
  fluxoFutureOpen: boolean
  setFluxoFutureOpen: (open: boolean) => void
  // Pulse counter: increment to trigger a glow animation
  fluxoFuturePulse: number
  triggerFluxoFuturePulse: () => void
}

export const useNavStore = create<NavStore>()(set => ({
  fluxoFutureOpen: false,
  setFluxoFutureOpen: (open) => set({ fluxoFutureOpen: open }),
  fluxoFuturePulse: 0,
  triggerFluxoFuturePulse: () => set(s => ({ fluxoFuturePulse: s.fluxoFuturePulse + 1 })),
}))
