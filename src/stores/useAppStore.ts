import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  User,
  IncomeSource,
  Entrada,
  Caixinha,
  CaixinhaMovement,
  SaidaFixa,
  SaidaVariavel,
  Objetivo,
  ObjetivoMovement,
  UserContext,
  CaixinhaDistributionItem,
} from '../types'

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
  editCaixinhaMovement: (caixinhaId: string, movementId: string, updates: Partial<CaixinhaMovement>) => void
  deleteCaixinhaMovement: (caixinhaId: string, movementId: string) => void

  // Saídas Fixas
  markSaidaFixaPaid: (id: string, date: string) => void
  markSaidaFixaUnpaid: (id: string, date: string) => void
  addSaidaFixa: (sf: Omit<SaidaFixa, 'id'>) => void
  editSaidaFixa: (id: string, updates: Partial<SaidaFixa>) => void
  deleteSaidaFixa: (id: string) => void

  // Saídas Variáveis
  addSaidaVariavel: (saida: Omit<SaidaVariavel, 'id'>) => void

  // Income Sources
  addIncomeSource: (source: Omit<IncomeSource, 'id'>) => void

  // Objetivos
  addObjetivo: (obj: Omit<Objetivo, 'id'>) => void
  updateObjetivoAmount: (id: string, amount: number) => void
  addObjetivoMovement: (objetivoId: string, mv: Omit<ObjetivoMovement, 'id'>) => void
  editObjetivoMovement: (objetivoId: string, movementId: string, updates: Partial<ObjetivoMovement>) => void
  deleteObjetivoMovement: (objetivoId: string, movementId: string) => void
  updateObjetivoImage: (objetivoId: string, imageUrl: string) => void

  // Reset
  resetAll: () => void
}

// ─── Initial State ────────────────────────────────────────────────────────────

const getInitialState = (): AppState => ({
  isOnboarded: false,
  currentUser: null,
  partner: null,
  viewContext: 'lucas',
  incomeSources: [],
  entradas: [],
  caixinhas: [],
  saidasFixas: [],
  saidasVariaveis: [],
  objetivos: [],
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
        set((state) => {
          const newSaida = { ...saida, id: `sv-${Date.now()}` }
          return {
            saidasVariaveis: [...state.saidasVariaveis, newSaida],
            caixinhas: state.caixinhas.map((cx) =>
              cx.id !== saida.caixinhaId ? cx : {
                ...cx,
                balance: cx.balance - saida.amount,
                movements: [
                  ...(cx.movements ?? []),
                  {
                    id: `mv-${Date.now()}-sv`,
                    date: saida.date,
                    amount: -saida.amount,
                    description: saida.description,
                    type: 'expense' as const,
                  },
                ],
              }
            ),
          }
        }),

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

      // ── Caixinha Movement CRUD ──
      editCaixinhaMovement: (caixinhaId, movementId, updates) =>
        set((state) => ({
          caixinhas: state.caixinhas.map(cx =>
            cx.id !== caixinhaId ? cx : {
              ...cx,
              balance: cx.balance
                - (cx.movements.find(m => m.id === movementId)?.amount ?? 0)
                + (updates.amount ?? cx.movements.find(m => m.id === movementId)?.amount ?? 0),
              movements: cx.movements.map(m =>
                m.id !== movementId ? m : { ...m, ...updates }
              ),
            }
          ),
        })),

      deleteCaixinhaMovement: (caixinhaId, movementId) =>
        set((state) => ({
          caixinhas: state.caixinhas.map(cx =>
            cx.id !== caixinhaId ? cx : {
              ...cx,
              balance: cx.balance - (cx.movements.find(m => m.id === movementId)?.amount ?? 0),
              movements: cx.movements.filter(m => m.id !== movementId),
            }
          ),
        })),

      // ── Saída Fixa CRUD ──
      addSaidaFixa: (sf) =>
        set((state) => ({
          saidasFixas: [...state.saidasFixas, { ...sf, id: `sf-${Date.now()}` }],
        })),

      editSaidaFixa: (id, updates) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.map(sf =>
            sf.id !== id ? sf : { ...sf, ...updates }
          ),
        })),

      deleteSaidaFixa: (id) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.filter(sf => sf.id !== id),
        })),

      // ── Objetivo Movement CRUD ──
      addObjetivoMovement: (objetivoId, mv) =>
        set((state) => ({
          objetivos: state.objetivos.map(o =>
            o.id !== objetivoId ? o : {
              ...o,
              currentAmount: o.currentAmount + mv.amount,
              movements: [...o.movements, { ...mv, id: `om-${Date.now()}` }],
            }
          ),
        })),

      editObjetivoMovement: (objetivoId, movementId, updates) =>
        set((state) => ({
          objetivos: state.objetivos.map(o =>
            o.id !== objetivoId ? o : {
              ...o,
              currentAmount: o.currentAmount
                - (o.movements.find(m => m.id === movementId)?.amount ?? 0)
                + (updates.amount ?? o.movements.find(m => m.id === movementId)?.amount ?? 0),
              movements: o.movements.map(m =>
                m.id !== movementId ? m : { ...m, ...updates }
              ),
            }
          ),
        })),

      deleteObjetivoMovement: (objetivoId, movementId) =>
        set((state) => ({
          objetivos: state.objetivos.map(o =>
            o.id !== objetivoId ? o : {
              ...o,
              currentAmount: o.currentAmount - (o.movements.find(m => m.id === movementId)?.amount ?? 0),
              movements: o.movements.filter(m => m.id !== movementId),
            }
          ),
        })),

      updateObjetivoImage: (id, imageUrl) =>
        set((state) => ({
          objetivos: state.objetivos.map(o =>
            o.id !== id ? o : { ...o, imageUrl }
          ),
        })),

      resetAll: () => set(getInitialState()),
    }),
    {
      name: 'somus-state',
      version: 6,
      migrate: (_persisted: unknown, version: number) => {
        // v6: clean break — no more mock data, force fresh state.
        // Handles any stale caches from earlier versions.
        if (version < 6) {
          return getInitialState() as unknown as AppState & AppActions
        }
        return _persisted as unknown as AppState & AppActions
      },
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
