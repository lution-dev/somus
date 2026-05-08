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
    saidasFixas: Omit<SaidaFixa, 'id' | 'payments' | 'startDate'>[]
    objetivos: Omit<Objetivo, 'id' | 'movements' | 'currentAmount'>[]
  }) => void
  setViewContext: (ctx: UserContext) => void

  // Entradas
  addEntrada: (entrada: Omit<Entrada, 'id'>) => void
  editEntrada: (id: string, updates: { amount?: number; sourceName?: string; date?: string; note?: string }) => void
  deleteEntrada: (id: string) => void

  // Divisoes
  updateDivisaoBalance: (divisaoId: string, amount: number, description: string) => void
  setDivisoes: (divisoes: Divisao[]) => void
  editDivisaoMovement: (divisaoId: string, movementId: string, updates: Partial<DivisaoMovement>) => void
  deleteDivisaoMovement: (divisaoId: string, movementId: string) => void

  // Saídas Fixas
  markSaidaFixaPaid: (id: string, date: string, targetMonth?: string) => void
  markSaidaFixaUnpaid: (id: string, targetMonth: string) => void
  addSaidaFixa: (sf: Omit<SaidaFixa, 'id' | 'payments' | 'startDate'>) => void
  editSaidaFixa: (id: string, updates: Partial<SaidaFixa>) => void
  editSaidaFixaForMonth: (id: string, yearMonth: string, amount: number) => void
  skipSaidaFixaForMonth: (id: string, yearMonth: string) => void
  unskipSaidaFixaForMonth: (id: string, yearMonth: string) => void
  deleteSaidaFixa: (id: string) => void

  // Saídas Variáveis
  addSaidaVariavel: (saida: Omit<SaidaVariavel, 'id'>) => void
  confirmSaidaVariavel: (id: string, confirmationDate: string) => void
  editSaidaVariavel: (id: string, updates: { amount?: number; description?: string; date?: string; category?: string }) => void
  deleteSaidaVariavel: (id: string) => void

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

  // Partner
  setPartner: (partner: { id: string; name: string; partnerCode: string } | null) => void

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
            ...sf, id: `sf-${Date.now()}-${i}`, payments: {}, startDate: new Date().toISOString().slice(0, 7)
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

      editEntrada: (id, updates) =>
        set((state) => {
          const e = state.entradas.find(x => x.id === id)
          if (!e) return state
          const amountDiff = (updates.amount ?? e.amount) - e.amount
          return {
            entradas: state.entradas.map(x => x.id !== id ? x : { ...x, ...updates }),
            divisoes: amountDiff !== 0
              ? state.divisoes.map(cx => {
                  const dist = e.distribution.find(d => d.divisaoId === cx.id)
                  if (!dist) return cx
                  const ratio = dist.amount / e.amount
                  return {
                    ...cx,
                    balance: cx.balance + amountDiff * ratio,
                  }
                })
              : state.divisoes,
          }
        }),

      deleteEntrada: (id) =>
        set((state) => {
          const e = state.entradas.find(x => x.id === id)
          if (!e) return state
          return {
            entradas: state.entradas.filter(x => x.id !== id),
            divisoes: state.divisoes.map(cx => {
              const dist = e.distribution.find(d => d.divisaoId === cx.id)
              if (!dist) return cx
              return {
                ...cx,
                balance: cx.balance - dist.amount,
                movements: (cx.movements ?? []).filter(mv => mv.description !== `Distribuição — ${e.sourceName}`),
              }
            }),
          }
        }),

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

      markSaidaFixaPaid: (id, date, targetMonth) =>
        set((state) => {
          const sf = state.saidasFixas.find(s => s.id === id)
          if (!sf) return state

          const yearMonth = targetMonth || date.slice(0, 7)
          const svId = `sv-fixed-${id}-${yearMonth}`

          return {
            saidasFixas: state.saidasFixas.map(s =>
              s.id !== id ? s : { 
                ...s, 
                payments: { ...s.payments, [yearMonth]: date } 
              }
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

      markSaidaFixaUnpaid: (id, targetMonth) =>
        set((state) => {
          const sf = state.saidasFixas.find(s => s.id === id)
          if (!sf) return state

          const svId = `sv-fixed-${id}-${targetMonth}`
          const mvId = `mv-fixed-${id}-${targetMonth}`

          return {
            saidasFixas: state.saidasFixas.map(s => {
              if (s.id !== id) return s
              const nextPayments = { ...s.payments }
              delete nextPayments[targetMonth]
              return { ...s, payments: nextPayments }
            }),
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
          const id = `sv-${Date.now()}`
          const today = new Date().toISOString().split('T')[0]
          const isPending = saida.date > today
          
          const newSaida: SaidaVariavel = { 
            ...saida, 
            id, 
            status: isPending ? 'pending' : 'realized' 
          }
          
          // Se for pendente, NÃO desconta do saldo agora
          if (isPending) {
            return {
              saidasVariaveis: [...state.saidasVariaveis, newSaida],
            }
          }

          // Se for realizado (hoje ou passado), desconta do saldo
          return {
            saidasVariaveis: [...state.saidasVariaveis, newSaida],
            divisoes: state.divisoes.map((cx) =>
              cx.id !== saida.divisaoId ? cx : {
                ...cx,
                balance: cx.balance - saida.amount,
                movements: [
                  ...(cx.movements ?? []),
                  {
                    id: `mv-${id}-sv`,
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

      confirmSaidaVariavel: (id, confirmationDate) =>
        set((state) => {
          const sv = state.saidasVariaveis.find(s => s.id === id)
          if (!sv || sv.status !== 'pending') return state

          return {
            saidasVariaveis: state.saidasVariaveis.map(s => 
              s.id === id ? { ...s, status: 'realized', date: confirmationDate } : s
            ),
            divisoes: state.divisoes.map(cx => 
              cx.id !== sv.divisaoId ? cx : {
                ...cx,
                balance: cx.balance - sv.amount,
                movements: [
                  ...(cx.movements ?? []),
                  {
                    id: `mv-${id}-sv`,
                    date: confirmationDate,
                    amount: -sv.amount,
                    description: sv.description,
                    type: 'expense' as const,
                  }
                ]
              }
            )
          }
        }),

      editSaidaVariavel: (id, updates) =>
        set((state) => {
          const sv = state.saidasVariaveis.find((s) => s.id === id)
          if (!sv) return state

          const isPending = sv.status === 'pending'
          
          // Se o valor mudou e NÃO era pendente, precisamos ajustar o saldo
          let nextDivisoes = state.divisoes
          if (!isPending && updates.amount !== undefined && updates.amount !== sv.amount) {
            const diff = updates.amount - sv.amount
            nextDivisoes = state.divisoes.map(cx => 
              cx.id !== sv.divisaoId ? cx : {
                ...cx,
                balance: cx.balance - diff,
                movements: (cx.movements ?? []).map(mv => 
                  mv.id === `mv-${id}-sv` ? { ...mv, amount: -updates.amount!, date: updates.date ?? mv.date } : mv
                )
              }
            )
          } else if (!isPending && (updates.date || updates.description)) {
            // Atualiza o movimento se mudou data ou descrição
            nextDivisoes = state.divisoes.map(cx => 
              cx.id !== sv.divisaoId ? cx : {
                ...cx,
                movements: (cx.movements ?? []).map(mv => 
                  mv.id === `mv-${id}-sv` ? { 
                    ...mv, 
                    date: updates.date ?? mv.date,
                    description: updates.description ?? mv.description
                  } : mv
                )
              }
            )
          }

          return {
            saidasVariaveis: state.saidasVariaveis.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
            divisoes: nextDivisoes,
          }
        }),

      deleteSaidaVariavel: (id) =>
        set((state) => {
          const sv = state.saidasVariaveis.find((s) => s.id === id)
          if (!sv) return state

          const isPending = sv.status === 'pending'

          return {
            saidasVariaveis: state.saidasVariaveis.filter((s) => s.id !== id),
            divisoes: isPending ? state.divisoes : state.divisoes.map((cx) =>
              cx.id !== sv.divisaoId ? cx : {
                ...cx,
                balance: cx.balance + sv.amount,
                movements: (cx.movements ?? []).filter(mv => mv.id !== `mv-${id}-sv`),
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
          saidasFixas: [
            ...state.saidasFixas, 
            { 
              ...sf, 
              id: `sf-${Date.now()}`, 
              payments: {}, 
              startDate: new Date().toISOString().slice(0, 7) 
            }
          ],
        })),

      editSaidaFixa: (id, updates) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.map(sf =>
            sf.id !== id ? sf : { ...sf, ...updates }
          ),
        })),

      editSaidaFixaForMonth: (id, yearMonth, amount) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.map(sf =>
            sf.id !== id ? sf : {
              ...sf,
              monthlyAmountOverrides: {
                ...(sf.monthlyAmountOverrides ?? {}),
                [yearMonth]: amount,
              },
            }
          ),
        })),

      skipSaidaFixaForMonth: (id, yearMonth) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.map(sf =>
            sf.id !== id ? sf : {
              ...sf,
              skippedMonths: [...(sf.skippedMonths ?? []), yearMonth],
            }
          ),
        })),

      unskipSaidaFixaForMonth: (id, yearMonth) =>
        set((state) => ({
          saidasFixas: state.saidasFixas.map(sf =>
            sf.id !== id ? sf : {
              ...sf,
              skippedMonths: (sf.skippedMonths ?? []).filter(m => m !== yearMonth),
            }
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

      setPartner: (partner) => set({ partner: partner as AppState['partner'] }),

      resetAll: () => set(getInitialState()),
    }),
    {
      name: 'somus-state',
      version: 15,
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
          // Migrate top-level caixinhas array → divisoes
          const oldCaixinhas = (state as Record<string, unknown>).caixinhas as Divisao[] | undefined
          if (oldCaixinhas && oldCaixinhas.length > 0 && (!state.divisoes || (state.divisoes as Divisao[]).length === 0)) {
            state.divisoes = oldCaixinhas
          }
          delete (state as Record<string, unknown>).caixinhas

          // Rename caixinhaId → divisaoId inside every saidaFixa
          const saidasFixas = state.saidasFixas as Array<Record<string, unknown>> | undefined
          if (Array.isArray(saidasFixas)) {
            state.saidasFixas = saidasFixas.map(sf => {
              if ('caixinhaId' in sf && !('divisaoId' in sf)) {
                const { caixinhaId, ...rest } = sf
                return { ...rest, divisaoId: caixinhaId }
              }
              return sf
            })
          }

          // Rename caixinhaId → divisaoId inside every saidaVariavel
          const saidasVariaveis = state.saidasVariaveis as Array<Record<string, unknown>> | undefined
          if (Array.isArray(saidasVariaveis)) {
            state.saidasVariaveis = saidasVariaveis.map(sv => {
              if ('caixinhaId' in sv && !('divisaoId' in sv)) {
                const { caixinhaId, ...rest } = sv
                return { ...rest, divisaoId: caixinhaId }
              }
              return sv
            })
          }

          // Rename caixinhaId → divisaoId inside each entrada's distribution items
          const entradas = state.entradas as Array<Record<string, unknown>> | undefined
          if (Array.isArray(entradas)) {
            state.entradas = entradas.map(e => {
              const dist = e.distribution as Array<Record<string, unknown>> | undefined
              if (!Array.isArray(dist)) return e
              return {
                ...e,
                distribution: dist.map(d => {
                  if ('caixinhaId' in d && !('divisaoId' in d)) {
                    const { caixinhaId, ...rest } = d
                    return { ...rest, divisaoId: caixinhaId }
                  }
                  return d
                }),
              }
            })
          }
        }

        // v11: re-run caixinhaId → divisaoId rename (v10 missed this for
        // users who were already migrated but still had old field names)
        if (version < 11) {
          const saidasFixas = state.saidasFixas as Array<Record<string, unknown>> | undefined
          if (Array.isArray(saidasFixas)) {
            state.saidasFixas = saidasFixas.map(sf => {
              if ('caixinhaId' in sf && !('divisaoId' in sf)) {
                const { caixinhaId, ...rest } = sf
                return { ...rest, divisaoId: caixinhaId }
              }
              return sf
            })
          }

          const saidasVariaveis = state.saidasVariaveis as Array<Record<string, unknown>> | undefined
          if (Array.isArray(saidasVariaveis)) {
            state.saidasVariaveis = saidasVariaveis.map(sv => {
              if ('caixinhaId' in sv && !('divisaoId' in sv)) {
                const { caixinhaId, ...rest } = sv
                return { ...rest, divisaoId: caixinhaId }
              }
              return sv
            })
          }

          const entradas = state.entradas as Array<Record<string, unknown>> | undefined
          if (Array.isArray(entradas)) {
            state.entradas = entradas.map(e => {
              const dist = e.distribution as Array<Record<string, unknown>> | undefined
              if (!Array.isArray(dist)) return e
              return {
                ...e,
                distribution: dist.map(d => {
                  if ('caixinhaId' in d && !('divisaoId' in d)) {
                    const { caixinhaId, ...rest } = d
                    return { ...rest, divisaoId: caixinhaId }
                  }
                  return d
                }),
              }
            })
          }
        }

        // v12: shorten old partnerCode from 'SOMUS-XXXXXXXX' format to 4-char code
        if (version < 12) {
          const user = state.currentUser as Record<string, unknown> | null
          if (user && typeof user.partnerCode === 'string') {
            const old = user.partnerCode as string
            // Old format: 'SOMUS-XXXXXXXX' → take last 4 chars of suffix
            if (old.startsWith('SOMUS-')) {
              user.partnerCode = old.replace('SOMUS-', '').slice(-4).toUpperCase()
            }
          }
        }

        // v13: add monthlyAmountOverrides to SaidaFixa — no-op, field is optional
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // v15: paidDates array -> payments Record + startDate
        if (version < 15) {
          const s = state as any
          if (s.saidasFixas) {
            s.saidasFixas = s.saidasFixas.map((sf: any) => {
              const payments: Record<string, string> = {}
              if (Array.isArray(sf.paidDates)) {
                sf.paidDates.forEach((d: string) => {
                  payments[d.slice(0, 7)] = d
                })
              }
              delete sf.paidDates
              return {
                ...sf,
                payments,
                startDate: sf.startDate || "2026-05" // Default for existing items
              }
            })
          }
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
