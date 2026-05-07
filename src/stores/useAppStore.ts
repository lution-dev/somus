import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  User,
  IncomeSource,
  Entrada,
  Divisao,
  DivisaoMovement,
  SaidaFixa,
  SaidaVariavel,
  Objetivo,
  ObjetivoMovement,
  UserContext,
  DivisaoDistributionItem,
} from '../types'
import { DIVISAO_ORDER, DIVISAO_INFO } from '../lib/divisoes'
import { DIVISAO_ICONS } from '../lib/icons'

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

  // Divisoes
  updateDivisaoBalance: (divisaoId: string, amount: number, description: string) => void
  setDivisoes: (divisoes: Divisao[]) => void
  editDivisaoMovement: (divisaoId: string, movementId: string, updates: Partial<DivisaoMovement>) => void
  deleteDivisaoMovement: (divisaoId: string, movementId: string) => void

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
  divisoes: [],
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
          const divisoes = state.divisoes.length > 0
            ? state.divisoes
            : DIVISAO_ORDER.map((id, i) => {
                const info = DIVISAO_INFO[id]
                const icon = DIVISAO_ICONS[id]
                return {
                  id, userId: user.id, name: info.name, emoji: '',
                  percentage: info.pct, balance: 0,
                  color: icon?.color ?? '#64748B',
                  isDefault: true, order: i, movements: [],
                } as Divisao
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
          return { isOnboarded: true, currentUser: user, divisoes, incomeSources, saidasFixas, objetivos }
        }),

      setViewContext: (ctx) => set({ viewContext: ctx }),

      addEntrada: (entrada) => {
        const id = `e-${Date.now()}`
        const newEntrada: Entrada = { ...entrada, id }

        // Atualiza saldos das divisoes
        set((state) => {
          const updatedDivisoes = state.divisoes.map((cx) => {
            const dist = entrada.distribution.find(d => d.divisaoId === cx.id)
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
            divisoes: updatedDivisoes,
          }
        })
      },

      updateDivisaoBalance: (divisaoId, amount, description) =>
        set((state) => ({
          divisoes: state.divisoes.map((cx) =>
            cx.id !== divisaoId ? cx : {
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

      setDivisoes: (divisoes) => set({ divisoes }),

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
                divisaoId: sf.divisaoId,
                amount: sf.amount,
                description: sf.name,
                category: sf.category,
                paymentMethod: sf.paymentMethod,
                date,
              } as SaidaVariavel,
            ],
            divisoes: state.divisoes.map(cx =>
              cx.id !== sf.divisaoId ? cx : {
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
            divisoes: state.divisoes.map(cx =>
              cx.id !== sf.divisaoId ? cx : {
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
            divisoes: state.divisoes.map((cx) =>
              cx.id !== saida.divisaoId ? cx : {
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

      // ── Divisao Movement CRUD ──
      editDivisaoMovement: (divisaoId, movementId, updates) =>
        set((state) => ({
          divisoes: state.divisoes.map(cx =>
            cx.id !== divisaoId ? cx : {
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

      deleteDivisaoMovement: (divisaoId, movementId) =>
        set((state) => ({
          divisoes: state.divisoes.map(cx =>
            cx.id !== divisaoId ? cx : {
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
      version: 10,
      migrate: (_persisted: unknown, version: number) => {
        const state = _persisted as Record<string, unknown>

        // v6: clean break — full reset from mock data
        if (version < 6) {
          return getInitialState() as unknown as AppState & AppActions
        }

        // v7: backfill divisoes for users who completed onboarding
        // but have none (old onboarding never created them)
        if (version < 7) {
          const divisoes = (state.divisoes as Divisao[] | undefined) ?? []
          if (divisoes.length === 0 && state.isOnboarded) {
            const currentUser = state.currentUser as User | null
            const userId = currentUser?.id ?? 'user'
            state.divisoes = DIVISAO_ORDER.map((id, i) => {
              const info = DIVISAO_INFO[id]
              const icon = DIVISAO_ICONS[id]
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
              } as Divisao
            })
          }
        }

        // v8: remove cx-livre, move its balance to cx-reserva (now 10%)
        if (version < 8) {
          const divisoes = (state.divisoes as Divisao[] | undefined) ?? []
          const livre = divisoes.find(cx => cx.id === 'cx-livre')
          const livreBalance = livre?.balance ?? 0
          state.divisoes = divisoes
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

        // v10: migrate caixinhas → divisoes (nomenclature change)
        if (version < 10) {
          const oldCaixinhas = (state as Record<string, unknown>).caixinhas as Divisao[] | undefined
          if (oldCaixinhas && oldCaixinhas.length > 0 && (!state.divisoes || (state.divisoes as Divisao[]).length === 0)) {
            state.divisoes = oldCaixinhas
          }
          delete (state as Record<string, unknown>).caixinhas
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
        divisoes: state.divisoes,
        saidasFixas: state.saidasFixas,
        saidasVariaveis: state.saidasVariaveis,
        objetivos: state.objetivos,
      }),
    }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentDivisoes = (state: AppState) =>
  state.viewContext === 'couple'
    ? state.divisoes
    : state.divisoes.filter(cx => cx.userId === (state.currentUser?.id ?? ''))

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
export type { DivisaoDistributionItem }
