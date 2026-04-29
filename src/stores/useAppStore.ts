import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  User,
  IncomeSource,
  Entrada,
  Caixinha,
  SaidaVariavel,
  Objetivo,
  UserContext,
  CaixinhaDistributionItem,
} from '../types'
import {
  MOCK_LUCAS,
  MOCK_MIRIAN,
  MOCK_INCOME_SOURCES_LUCAS,
  MOCK_INCOME_SOURCES_MIRIAN,
  MOCK_CAIXINHAS_LUCAS,
  MOCK_SAIDAS_FIXAS_LUCAS,
  MOCK_OBJETIVOS_LUCAS,
  MOCK_ENTRADAS_LUCAS,
} from '../lib/mockData'

// ─── Actions ─────────────────────────────────────────────────────────────────

interface AppActions {
  // Setup
  completeOnboarding: (user: User) => void
  setViewContext: (ctx: UserContext) => void

  // Entradas
  addEntrada: (entrada: Omit<Entrada, 'id'>) => void

  // Caixinhas
  updateCaixinhaBalance: (caixinhaId: string, amount: number, description: string) => void
  setCaixinhas: (caixinhas: Caixinha[]) => void

  // Saídas Fixas
  markSaidaFixaPaid: (id: string, date: string) => void
  markSaidaFixaUnpaid: (id: string, date: string) => void

  // Saídas Variáveis
  addSaidaVariavel: (saida: Omit<SaidaVariavel, 'id'>) => void

  // Income Sources
  addIncomeSource: (source: Omit<IncomeSource, 'id'>) => void

  // Objetivos
  addObjetivo: (obj: Omit<Objetivo, 'id'>) => void
  updateObjetivoAmount: (id: string, amount: number) => void

  // Reset
  resetAll: () => void
}

// ─── Initial State ────────────────────────────────────────────────────────────

const getInitialState = (): AppState => ({
  isOnboarded: false,
  currentUser: MOCK_LUCAS,
  partner: MOCK_MIRIAN,
  viewContext: 'lucas',
  incomeSources: [...MOCK_INCOME_SOURCES_LUCAS, ...MOCK_INCOME_SOURCES_MIRIAN],
  entradas: MOCK_ENTRADAS_LUCAS,
  caixinhas: MOCK_CAIXINHAS_LUCAS,
  saidasFixas: MOCK_SAIDAS_FIXAS_LUCAS,
  saidasVariaveis: [],
  objetivos: MOCK_OBJETIVOS_LUCAS,
})

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      ...getInitialState(),

      completeOnboarding: (user) =>
        set({ isOnboarded: true, currentUser: user }),

      setViewContext: (ctx) => set({ viewContext: ctx }),

      addEntrada: (entrada) => {
        const id = `e-${Date.now()}`
        const newEntrada: Entrada = { ...entrada, id }

        // Atualiza saldos das caixinhas
        set((state) => {
          const updatedCaixinhas = state.caixinhas.map((cx) => {
            const dist = entrada.distribution.find(d => d.caixinhaId === cx.id)
            if (!dist) return cx
            return {
              ...cx,
              balance: cx.balance + dist.amount,
              movements: [
                ...cx.movements,
                {
                  id: `mv-${Date.now()}-${cx.id}`,
                  date: entrada.date,
                  amount: dist.amount,
                  description: `Distribuição — ${entrada.sourceName}`,
                  type: 'income' as const,
                },
              ],
            }
          })
          return {
            entradas: [...state.entradas, newEntrada],
            caixinhas: updatedCaixinhas,
          }
        })
      },

      updateCaixinhaBalance: (caixinhaId, amount, description) =>
        set((state) => ({
          caixinhas: state.caixinhas.map((cx) =>
            cx.id !== caixinhaId ? cx : {
              ...cx,
              balance: cx.balance + amount,
              movements: [
                ...cx.movements,
                {
                  id: `mv-${Date.now()}`,
                  date: new Date().toISOString().slice(0, 10),
                  amount,
                  description,
                  type: amount > 0 ? 'income' as const : 'expense' as const,
                },
              ],
            }
          ),
        })),

      setCaixinhas: (caixinhas) => set({ caixinhas }),

      markSaidaFixaPaid: (id, date) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.map((sf) =>
            sf.id !== id ? sf : { ...sf, paidDates: [...sf.paidDates, date] }
          ),
        })),

      markSaidaFixaUnpaid: (id, date) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.map((sf) =>
            sf.id !== id ? sf : { ...sf, paidDates: sf.paidDates.filter(d => d !== date) }
          ),
        })),

      addSaidaVariavel: (saida) =>
        set((state) => ({
          saidasVariaveis: [...state.saidasVariaveis, { ...saida, id: `sv-${Date.now()}` }],
        })),

      addIncomeSource: (source) =>
        set((state) => ({
          incomeSources: [...state.incomeSources, { ...source, id: `src-${Date.now()}` }],
        })),

      addObjetivo: (obj) =>
        set((state) => ({
          objetivos: [...state.objetivos, { ...obj, id: `obj-${Date.now()}` }],
        })),

      updateObjetivoAmount: (id, amount) =>
        set((state) => ({
          objetivos: state.objetivos.map(o =>
            o.id !== id ? o : { ...o, currentAmount: o.currentAmount + amount }
          ),
        })),

      resetAll: () => set(getInitialState()),
    }),
    {
      name: 'somus-state',
      version: 1,
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        currentUser: state.currentUser,
        partner: state.partner,
        viewContext: state.viewContext,
        incomeSources: state.incomeSources,
        entradas: state.entradas,
        caixinhas: state.caixinhas,
        saidasFixas: state.saidasFixas,
        saidasVariaveis: state.saidasVariaveis,
        objetivos: state.objetivos,
      }),
    }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentCaixinhas = (state: AppState) =>
  state.caixinhas.filter(cx => cx.userId === (state.viewContext === 'couple' ? 'lucas' : (state.currentUser?.id ?? 'lucas')))

export const selectCurrentIncomeSources = (state: AppState) =>
  state.incomeSources.filter(src => src.userId === (state.viewContext === 'couple' ? 'lucas' : (state.currentUser?.id ?? 'lucas')))

export const selectCurrentEntradas = (state: AppState) =>
  state.entradas.filter(e => e.userId === (state.currentUser?.id ?? 'lucas'))

export const selectCurrentSaidasFixas = (state: AppState) =>
  state.saidasFixas.filter(sf => sf.userId === (state.currentUser?.id ?? 'lucas'))

export const selectExpectedMonthlyIncome = (state: AppState): number =>
  selectCurrentIncomeSources(state)
    .reduce((sum, src) => sum + (src.expectedAmount ?? 0), 0)

// Re-export distribution calculator for convenience
export { calculateDistribution } from '../lib/calculations'
export type { CaixinhaDistributionItem }
