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
import { DIVISAO_ORDER, DIVISAO_INFO } from '../lib/divisoes'
import { CAIXINHA_ICONS } from '../lib/icons'

// ─── Actions ─────────────────────────────────────────────────────────────────

interface AppActions {
  // Setup
  completeOnboarding: (user: User, initial: {
    incomeSources: Omit<IncomeSource, 'id'>[]
    saidasFixas: Omit<SaidaFixa, 'id'>[]
    objetivos: Omit<Objetivo, 'id' | 'movements' | 'currentAmount'>[]
  }) => void
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
  editObjetivo: (id: string, updates: Partial<Objetivo>) => void
  deleteObjetivo: (id: string) => void
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
  viewContext: 'personal',
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

      completeOnboarding: (user, initial) =>
        set((state) => {
          const caixinhas = state.caixinhas.length > 0
            ? state.caixinhas
            : DIVISAO_ORDER.map((id, i) => {
                const info = DIVISAO_INFO[id]
                const icon = CAIXINHA_ICONS[id]
                return {
                  id, userId: user.id, name: info.name, emoji: '',
                  percentage: info.pct, balance: 0,
                  color: icon?.color ?? '#64748B',
                  isDefault: true, order: i, movements: [],
                } as Caixinha
              })
          const incomeSources = initial.incomeSources.map((src, i) => ({
            ...src, id: `src-${Date.now()}-${i}`,
          }))
          const saidasFixas = initial.saidasFixas.map((sf, i) => ({
            ...sf, id: `sf-${Date.now()}-${i}`,
          }))
          const objetivos = initial.objetivos.map((obj, i) => ({
            ...obj, id: `obj-${Date.now()}-${i}`,
            currentAmount: 0, movements: [],
          }))
          return { isOnboarded: true, currentUser: user, caixinhas, incomeSources, saidasFixas, objetivos }
        }),

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
        set((state) => {
          const sf = state.saidasFixas.find(s => s.id === id)
          if (!sf) return state

          const yearMonth = date.slice(0, 7)
          const svId = `sv-fixed-${id}-${yearMonth}`

          return {
            saidasFixas: state.saidasFixas.map(s =>
              s.id !== id ? s : { ...s, paidDates: [...s.paidDates, date] }
            ),
            saidasVariaveis: [
              ...state.saidasVariaveis,
              {
                id: svId,
                userId: sf.userId,
                caixinhaId: sf.caixinhaId,
                amount: sf.amount,
                description: sf.name,
                category: sf.category,
                paymentMethod: sf.paymentMethod,
                date,
              } as SaidaVariavel,
            ],
            caixinhas: state.caixinhas.map(cx =>
              cx.id !== sf.caixinhaId ? cx : {
                ...cx,
                balance: cx.balance - sf.amount,
                movements: [
                  ...(cx.movements ?? []),
                  {
                    id: `mv-fixed-${id}-${yearMonth}`,
                    date,
                    amount: -sf.amount,
                    description: sf.name,
                    type: 'expense' as const,
                  },
                ],
              }
            ),
          }
        }),

      markSaidaFixaUnpaid: (id, date) =>
        set((state) => {
          const sf = state.saidasFixas.find(s => s.id === id)
          if (!sf) return state

          const yearMonth = date.slice(0, 7)
          const svId = `sv-fixed-${id}-${yearMonth}`
          const mvId = `mv-fixed-${id}-${yearMonth}`

          return {
            saidasFixas: state.saidasFixas.map(s =>
              s.id !== id ? s : {
                ...s,
                // remove qualquer data do mês corrente (independente do dia exato)
                paidDates: s.paidDates.filter(d => !d.startsWith(yearMonth)),
              }
            ),
            saidasVariaveis: state.saidasVariaveis.filter(sv => sv.id !== svId),
            caixinhas: state.caixinhas.map(cx =>
              cx.id !== sf.caixinhaId ? cx : {
                ...cx,
                balance: cx.balance + sf.amount,
                movements: (cx.movements ?? []).filter(mv => mv.id !== mvId),
              }
            ),
          }
        }),

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

      editObjetivo: (id, updates) =>
        set((state) => ({
          objetivos: state.objetivos.map(o =>
            o.id !== id ? o : { ...o, ...updates }
          ),
        })),

      deleteObjetivo: (id) =>
        set((state) => ({
          objetivos: state.objetivos.filter(o => o.id !== id),
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
      version: 9,
      migrate: (_persisted: unknown, version: number) => {
        const state = _persisted as Record<string, unknown>

        // v6: clean break — full reset from mock data
        if (version < 6) {
          return getInitialState() as unknown as AppState & AppActions
        }

        // v7: backfill caixinhas for users who completed onboarding
        // but have none (old onboarding never created them)
        if (version < 7) {
          const caixinhas = (state.caixinhas as Caixinha[] | undefined) ?? []
          if (caixinhas.length === 0 && state.isOnboarded) {
            const currentUser = state.currentUser as User | null
            const userId = currentUser?.id ?? 'user'
            state.caixinhas = DIVISAO_ORDER.map((id, i) => {
              const info = DIVISAO_INFO[id]
              const icon = CAIXINHA_ICONS[id]
              return {
                id,
                userId,
                name: info.name,
                emoji: '',
                percentage: info.pct,
                balance: 0,
                color: icon?.color ?? '#64748B',
                isDefault: true,
                order: i,
                movements: [],
              } as Caixinha
            })
          }
        }

        // v8: remove cx-livre, move its balance to cx-reserva (now 10%)
        if (version < 8) {
          const caixinhas = (state.caixinhas as Caixinha[] | undefined) ?? []
          const livre = caixinhas.find(cx => cx.id === 'cx-livre')
          const livreBalance = livre?.balance ?? 0
          state.caixinhas = caixinhas
            .filter(cx => cx.id !== 'cx-livre')
            .map(cx => {
              if (cx.id === 'cx-reserva') {
                return { ...cx, percentage: 10, balance: cx.balance + livreBalance }
              }
              return cx
            })
        }

        // v9: generalize viewContext from 'lucas'/'mirian' to 'personal'/'couple'
        // and remove hardcoded 'context' field from User
        if (version < 9) {
          const vc = state.viewContext as string
          if (vc !== 'couple') {
            state.viewContext = 'personal'
          }
          // Remove legacy 'context' field from user objects
          const user = state.currentUser as Record<string, unknown> | null
          if (user) delete user.context
          const partner = state.partner as Record<string, unknown> | null
          if (partner) delete partner.context
        }

        return state as unknown as AppState & AppActions
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
  state.viewContext === 'couple'
    ? state.caixinhas
    : state.caixinhas.filter(cx => cx.userId === (state.currentUser?.id ?? ''))

export const selectCurrentIncomeSources = (state: AppState) =>
  state.viewContext === 'couple'
    ? state.incomeSources
    : state.incomeSources.filter(src => src.userId === (state.currentUser?.id ?? ''))

export const selectCurrentEntradas = (state: AppState) =>
  state.viewContext === 'couple'
    ? state.entradas
    : state.entradas.filter(e => e.userId === (state.currentUser?.id ?? ''))

export const selectCurrentSaidasFixas = (state: AppState) =>
  state.viewContext === 'couple'
    ? state.saidasFixas
    : state.saidasFixas.filter(sf => sf.userId === (state.currentUser?.id ?? ''))

export const selectExpectedMonthlyIncome = (state: AppState): number =>
  selectCurrentIncomeSources(state)
    .reduce((sum, src) => sum + (src.expectedAmount ?? 0), 0)

// Re-export distribution calculator for convenience
export { calculateDistribution } from '../lib/calculations'
export type { CaixinhaDistributionItem }
