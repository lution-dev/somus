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
  confirmEntrada: (id: string, confirmationDate: string, confirmedAmount?: number) => void
  editEntrada: (id: string, updates: { amount?: number; sourceName?: string; date?: string; note?: string; divisaoId?: string }) => void
  deleteEntrada: (id: string) => void

  // Divisoes
  updateDivisaoBalance: (divisaoId: string, amount: number, description: string) => void
  setDivisoes: (divisoes: Divisao[]) => void
  editDivisaoMovement: (divisaoId: string, movementId: string, updates: Partial<DivisaoMovement>) => void
  deleteDivisaoMovement: (divisaoId: string, movementId: string) => void

  // Saídas Fixas
  markSaidaFixaPaid: (id: string, date: string, targetMonth?: string, overrideAmount?: number) => void
  markSaidaFixaUnpaid: (id: string, targetMonth: string) => void
  addSaidaFixa: (sf: Omit<SaidaFixa, 'id' | 'payments' | 'startDate'>) => void
  editSaidaFixa: (id: string, updates: Partial<SaidaFixa>) => void
  editSaidaFixaForMonth: (id: string, yearMonth: string, amount: number) => void
  skipSaidaFixaForMonth: (id: string, yearMonth: string) => void
  unskipSaidaFixaForMonth: (id: string, yearMonth: string) => void
  deleteSaidaFixa: (id: string) => void

  // Saídas Variáveis
  addSaidaVariavel: (saida: Omit<SaidaVariavel, 'id'>) => void
  confirmSaidaVariavel: (id: string, confirmationDate: string, confirmedAmount?: number) => void
  editSaidaVariavel: (id: string, updates: { amount?: number; description?: string; date?: string; category?: string; divisaoId?: string }) => void
  deleteSaidaVariavel: (id: string) => void
  autoConfirmPastPending: () => void
  fixPhantomBalances: () => void
  fixSaidaFixaPaymentAmounts: () => void

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
  setPartner: (partner: { id: string; name: string; partnerCode: string; avatar?: string } | null) => void

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
        const today = new Date().toISOString().slice(0, 10)
        const isFuture = entrada.date > today
        const status: 'realized' | 'pending' = isFuture ? 'pending' : 'realized'
        const newEntrada: Entrada = { ...entrada, id, status }

        // ── kind === 'direct': vai só para uma divisão específica ──────────
        if (entrada.kind === 'direct' && entrada.targetDivisaoId) {
          const divisaoId = entrada.targetDivisaoId
          set((state) => ({
            entradas: [...state.entradas, newEntrada],
            divisoes: isFuture ? state.divisoes : state.divisoes.map((cx) =>
              cx.id !== divisaoId ? cx : {
                ...cx,
                balance: cx.balance + entrada.amount,
                movements: [
                  ...cx.movements,
                  {
                    id: `mv-${id}-direct`,
                    date: entrada.date,
                    amount: entrada.amount,
                    description: entrada.sourceName,
                    type: 'income' as const,
                  },
                ],
              }
            ),
          }))
          return
        }

        // ── kind === 'distributable' (default): distribui por todas as divisões ──
        if (isFuture) {
          set((state) => ({
            entradas: [...state.entradas, newEntrada],
          }))
          return
        }

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


      confirmEntrada: (id, confirmationDate, confirmedAmount) =>
        set((state) => {
          const e = state.entradas.find(x => x.id === id)
          if (!e || e.status !== 'pending') return state

          // Se confirmedAmount foi passado, redistribui proporcionalmente entre as divisões
          const ratio = confirmedAmount !== undefined ? confirmedAmount / e.amount : 1

          const updatedDivisoes = state.divisoes.map((cx) => {
            const dist = e.distribution.find(d => d.divisaoId === cx.id)
            if (!dist) return cx
            const effectiveAmount = confirmedAmount !== undefined ? dist.amount * ratio : dist.amount
            return {
              ...cx,
              balance: cx.balance + effectiveAmount,
              movements: [
                ...cx.movements,
                {
                  id: `mv-${Date.now()}-${cx.id}`,
                  date: confirmationDate,
                  amount: effectiveAmount,
                  description: `Distribuição — ${e.sourceName}`,
                  type: 'income' as const,
                },
              ],
            }
          })

          return {
            entradas: state.entradas.map(x =>
              x.id === id ? { ...x, status: 'realized' as const, date: confirmationDate, amount: confirmedAmount ?? e.amount } : x
            ),
            divisoes: updatedDivisoes,
          }
        }),

      editEntrada: (id, updates) =>
        set((state) => {
          const e = state.entradas.find(x => x.id === id)
          if (!e) return state

          const newAmount = updates.amount ?? e.amount
          const amountDiff = newAmount - e.amount
          const newDivisaoId = updates.divisaoId

          // Caso simples: troca de divisão com distribuição única
          if (newDivisaoId && newDivisaoId !== e.distribution[0]?.divisaoId && e.distribution.length === 1) {
            const oldDivisaoId = e.distribution[0].divisaoId
            const oldAmount    = e.distribution[0].amount
            const newDist = [{ ...e.distribution[0], divisaoId: newDivisaoId, divisaoName: state.divisoes.find(d => d.id === newDivisaoId)?.name ?? newDivisaoId }]
            return {
              entradas: state.entradas.map(x => x.id !== id ? x : { ...x, ...updates, distribution: newDist }),
              divisoes: state.divisoes.map(cx => {
                if (cx.id === oldDivisaoId) return { ...cx, balance: cx.balance - oldAmount }
                if (cx.id === newDivisaoId) return { ...cx, balance: cx.balance + (amountDiff !== 0 ? newAmount : oldAmount) }
                return cx
              }),
            }
          }

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

      markSaidaFixaPaid: (id, date, targetMonth, overrideAmount) =>
        set((state) => {
          const sf = state.saidasFixas.find(s => s.id === id)
          if (!sf) return state

          const yearMonth = targetMonth || date.slice(0, 7)
          const svId = `sv-fixed-${id}-${yearMonth}`

          // Guard: evita pagamento duplicado (sv já existe para este mês)
          if (state.saidasVariaveis.some(sv => sv.id === svId)) return state

          // overrideAmount: valor digitado pelo usuário no modal de confirmação.
          // Tem precedência sobre monthlyAmountOverrides e sf.amount.
          // Quando fornecido, também é persistido em monthlyAmountOverrides para que
          // futuras execuções de fixSaidaFixaPaymentAmounts não revertam o valor.
          const effectiveAmount = overrideAmount ?? sf.monthlyAmountOverrides?.[yearMonth] ?? sf.amount

          const mvId = `mv-fixed-${id}-${yearMonth}`

          return {
            saidasFixas: state.saidasFixas.map(s =>
              s.id !== id ? s : {
                ...s,
                payments: { ...s.payments, [yearMonth]: date },
                // Se o usuário confirmou com valor diferente, salva como override do mês
                ...(overrideAmount !== undefined
                  ? { monthlyAmountOverrides: { ...(s.monthlyAmountOverrides ?? {}), [yearMonth]: overrideAmount } }
                  : {}),
              }
            ),
            saidasVariaveis: [
              ...state.saidasVariaveis,
              {
                id: svId,
                userId: sf.userId,
                divisaoId: sf.divisaoId,
                amount: effectiveAmount,
                description: sf.name,
                category: sf.category,
                paymentMethod: sf.paymentMethod,
                date,
                status: 'realized',
              } as SaidaVariavel,
            ],
            divisoes: state.divisoes.map(cx =>
              cx.id !== sf.divisaoId ? cx : {
                ...cx,
                balance: cx.balance - effectiveAmount,
                movements: [
                  ...(cx.movements ?? []).filter(m => m.id !== mvId),
                  {
                    id: mvId,
                    date,
                    amount: -effectiveAmount,
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

          // Usa o amount do sv existente para restaurar o balance correto.
          // NÃO usar sf.amount pois pode ser 0 em faturas variáveis (ex: Fatura Inter).
          // Fallback em cascata: sv.amount → |movement.amount| → override → sf.amount
          const existingSv = state.saidasVariaveis.find(sv => sv.id === svId)
          const existingMvAmount = state.divisoes
            .find(cx => cx.id === sf.divisaoId)
            ?.movements?.find(mv => mv.id === mvId)?.amount
          const amountToRestore =
            existingSv?.amount ??
            (existingMvAmount !== undefined ? Math.abs(existingMvAmount) : undefined) ??
            sf.monthlyAmountOverrides?.[targetMonth] ??
            sf.amount

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
                balance: cx.balance + amountToRestore,
                movements: (cx.movements ?? []).filter(mv => mv.id !== mvId),
              }
            ),
          }
        }),

      addSaidaVariavel: (saida) =>
        set((state) => {
          const id = `sv-${Date.now()}`

          // Lançamento = realizado imediatamente, independente da data
          const newSaida: SaidaVariavel = { ...saida, id, status: 'realized' }

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

      confirmSaidaVariavel: (id, confirmationDate, confirmedAmount) =>
        set((state) => {
          const sv = state.saidasVariaveis.find(s => s.id === id)
          if (!sv || sv.status !== 'pending') return state
          const finalAmount = confirmedAmount ?? sv.amount

          return {
            saidasVariaveis: state.saidasVariaveis.map(s =>
              s.id === id ? { ...s, status: 'realized', date: confirmationDate, amount: finalAmount } : s
            ),
            divisoes: state.divisoes.map(cx =>
              cx.id !== sv.divisaoId ? cx : {
                ...cx,
                balance: cx.balance - finalAmount,
                movements: [
                  ...(cx.movements ?? []),
                  {
                    id: `mv-${id}-sv`,
                    date: confirmationDate,
                    amount: -finalAmount,
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

          const isPending   = sv.status === 'pending'
          const newAmount   = updates.amount ?? sv.amount
          const newDivisaoId = updates.divisaoId

          // Troca de divisão: estorna na antiga e credita na nova
          if (newDivisaoId && newDivisaoId !== sv.divisaoId && !isPending) {
            const mvId = `mv-${id}-sv`
            return {
              saidasVariaveis: state.saidasVariaveis.map(s =>
                s.id === id ? { ...s, ...updates } : s
              ),
              divisoes: state.divisoes.map(cx => {
                if (cx.id === sv.divisaoId) {
                  // Estorna na divisão antiga
                  return {
                    ...cx,
                    balance: cx.balance + sv.amount,
                    movements: (cx.movements ?? []).filter(mv => mv.id !== mvId),
                  }
                }
                if (cx.id === newDivisaoId) {
                  // Lança na divisão nova
                  return {
                    ...cx,
                    balance: cx.balance - newAmount,
                    movements: [
                      ...(cx.movements ?? []),
                      {
                        id: mvId,
                        date: updates.date ?? sv.date,
                        amount: -newAmount,
                        description: updates.description ?? sv.description,
                        type: 'expense' as const,
                      },
                    ],
                  }
                }
                return cx
              }),
            }
          }

          // Sem troca de divisão — lógica original
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

      // Confirma automaticamente saidasVariaveis com status 'pending' cuja data já passou.
      // Corrige lançamentos que foram criados como futuros mas agora são passados/hoje.
      autoConfirmPastPending: () =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10)
          const toConfirm = state.saidasVariaveis.filter(
            sv => sv.status === 'pending' && sv.date <= today
          )
          if (toConfirm.length === 0) return state

          const confirmedIds = new Set(toConfirm.map(sv => sv.id))
          let divisoes = state.divisoes

          for (const sv of toConfirm) {
            // Evita duplicar movimento se já existe um com o mesmo id
            divisoes = divisoes.map(cx => {
              if (cx.id !== sv.divisaoId) return cx
              const mvId = `mv-${sv.id}-sv`
              const alreadyHasMovement = (cx.movements ?? []).some(m => m.id === mvId)
              return {
                ...cx,
                balance: alreadyHasMovement ? cx.balance : cx.balance - sv.amount,
                movements: alreadyHasMovement
                  ? cx.movements
                  : [
                      ...(cx.movements ?? []),
                      {
                        id: mvId,
                        date: sv.date,
                        amount: -sv.amount,
                        description: sv.description,
                        type: 'expense' as const,
                      },
                    ],
              }
            })
          }

          return {
            divisoes,
            saidasVariaveis: state.saidasVariaveis.map(sv =>
              confirmedIds.has(sv.id) ? { ...sv, status: 'realized' as const } : sv
            ),
          }
        }),

      /**
       * Detecta e corrige balances fantasma: quando cx.balance > soma(movements).
       *
       * Isso acontece quando uma entrada atualiza o balance mas não cria um
       * movimento correspondente (race condition ou bug histórico). A função
       * também remove movimentos órfãos conhecidos e duplicatas.
       *
       * Só aplica correção quando a diferença é > R$0,50 (evita flòat noise).
       */
      fixPhantomBalances: () =>
        set((state) => {
          let changed = false

          const divisoes = state.divisoes.map((cx) => {
            let movements = [...(cx.movements ?? [])]

            // ── Remove duplicatas de movimento pelo mesmo ID ────────────────
            const seenIds = new Set<string>()
            const deduped: typeof movements = []
            for (const mv of movements) {
              if (!seenIds.has(mv.id)) {
                seenIds.add(mv.id)
                deduped.push(mv)
              } else {
                changed = true
                console.warn(`[fixPhantom] Removendo movimento duplicado: ${mv.id} em ${cx.name}`)
              }
            }
            movements = deduped

            // ── Remove movimentos órfãos conhecidos (sem ID padrão do sistema) ──
            // IDs órfãos: não começam com mv-e-, mv-sv-, mv-fixed-, mv-1778, Distribuição
            // mas têm saldo POSITIVO grande e sem entrada correspondente.
            // Detecta pelo padrão de ID: só um timestamp puro (sem sufixo)
            movements = movements.filter((mv) => {
              if (mv.amount > 0) {
                const isPureTimestamp = /^mv-\d{13}$/.test(mv.id)
                if (isPureTimestamp) {
                  changed = true
                  console.warn(`[fixPhantom] Removendo movimento órfão: ${mv.id} R$${mv.amount} em ${cx.name}`)
                  return false
                }
              }
              return true
            })

            // ── Ajusta balance para bater com a soma dos movements ──────────
            const movementsSum = movements.reduce((s, m) => s + m.amount, 0)
            const diff = cx.balance - movementsSum

            if (Math.abs(diff) > 0.5) {
              changed = true
              console.warn(
                `[fixPhantom] ${cx.name}: balance R$${cx.balance.toFixed(2)} vs movements R$${movementsSum.toFixed(2)} → diff R$${diff.toFixed(2)} → corrigindo`
              )
              return { ...cx, balance: movementsSum, movements }
            }

            if (movements.length !== (cx.movements ?? []).length) {
              // Apenas movements mudaram (dedup ou orphão), balance estava certo
              return { ...cx, movements }
            }

            return cx
          })

          if (!changed) return state
          console.log('[fixPhantom] Correção aplicada. Novo total:',
            divisoes.reduce((s, cx) => s + cx.balance, 0).toFixed(2))
          return { divisoes }
        }),

      /**
       * Detecta e corrige pagamentos de saidasFixas lançados com amount errado.
       *
       * Caso típico: saidaFixa variável (ex: Fatura Inter) tem sf.amount=0
       * mas o valor real do mês está em monthlyAmountOverrides. A versão
       * antiga de markSaidaFixaPaid usava sf.amount, gerando sv e movement
       * com R$0 em vez do valor correto — sem alterar o balance.
       *
       * Para cada sv com padrão sv-fixed-sf-X-YYYY-MM:
       *   1. Encontra saidaFixa sf-X
       *   2. Calcula effectiveAmount = monthlyAmountOverrides[YYYY-MM] ?? sf.amount
       *   3. Se sv.amount !== effectiveAmount, corrige sv + movement + balance
       */
      fixSaidaFixaPaymentAmounts: () =>
        set((state) => {
          let changed = false

          // Parse dos svIds que vieram de markSaidaFixaPaid
          const fixedSvPattern = /^sv-fixed-(sf-.+)-([0-9]{4}-[0-9]{2})$/

          const saidasVariaveis = state.saidasVariaveis.map(sv => {
            const match = sv.id.match(fixedSvPattern)
            if (!match) return sv

            const [, sfId, yearMonth] = match
            const sf = state.saidasFixas.find(s => s.id === sfId)
            if (!sf) return sv

            const effectiveAmount = sf.monthlyAmountOverrides?.[yearMonth] ?? sf.amount
            if (Math.abs(sv.amount - effectiveAmount) < 0.01) return sv // já correto

            changed = true
            console.warn(
              `[fixSFPayments] ${sf.name} (${yearMonth}): sv.amount R$${sv.amount} → R$${effectiveAmount}`
            )
            return { ...sv, amount: effectiveAmount, status: 'realized' as const }
          })

          let divisoes = state.divisoes
          if (changed) {
            // Corrige movements e balances das divisões afetadas
            divisoes = state.divisoes.map(cx => {
              let balanceDelta = 0
              const movements = (cx.movements ?? []).map(mv => {
                // Movement ID correspondente: mv-fixed-sf-X-YYYY-MM
                const mvMatch = mv.id.match(/^mv-fixed-(sf-.+)-([0-9]{4}-[0-9]{2})$/)
                if (!mvMatch) return mv

                const [, sfId, yearMonth] = mvMatch
                if (cx.id !== (state.saidasFixas.find(s => s.id === sfId)?.divisaoId)) return mv

                const sf = state.saidasFixas.find(s => s.id === sfId)
                if (!sf) return mv

                const effectiveAmount = sf.monthlyAmountOverrides?.[yearMonth] ?? sf.amount
                const expectedMvAmount = -effectiveAmount

                if (Math.abs(mv.amount - expectedMvAmount) < 0.01) return mv

                balanceDelta += expectedMvAmount - mv.amount // negativo → reduz balance

                console.warn(
                  `[fixSFPayments] Movement ${mv.id}: amount R$${mv.amount} → R$${expectedMvAmount}`
                )
                return { ...mv, amount: expectedMvAmount }
              })

              if (balanceDelta === 0) return cx
              const newBalance = cx.balance + balanceDelta
              console.warn(
                `[fixSFPayments] ${cx.name}: balance R$${cx.balance.toFixed(2)} → R$${newBalance.toFixed(2)}`
              )
              return { ...cx, balance: newBalance, movements }
            })
          }

          if (!changed) return state
          console.log('[fixSFPayments] Correção aplicada. Novo total:',
            divisoes.reduce((s, cx) => s + cx.balance, 0).toFixed(2))
          return { saidasVariaveis, divisoes }
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
        set((state) => {
          const sf = state.saidasFixas.find(s => s.id === id)
          if (!sf) return state

          // Atualiza o override mensal na saidaFixa
          const updatedSaidasFixas = state.saidasFixas.map(s =>
            s.id !== id ? s : {
              ...s,
              monthlyAmountOverrides: {
                ...(s.monthlyAmountOverrides ?? {}),
                [yearMonth]: amount,
              },
            }
          )

          // Se o mês já foi pago, propaga o novo valor para sv + movement + balance.
          // Sem isso, editar o valor após o pagamento deixa os dados inconsistentes.
          const svId = `sv-fixed-${id}-${yearMonth}`
          const mvId = `mv-fixed-${id}-${yearMonth}`
          const existingSv = state.saidasVariaveis.find(sv => sv.id === svId)

          if (!existingSv) {
            // Mês ainda não pago — só atualiza o override
            return { saidasFixas: updatedSaidasFixas }
          }

          // Mês já pago: atualiza sv + movement + cx.balance com a diferença
          const oldAmount = existingSv.amount
          const amountDiff = amount - oldAmount // positivo = debitar mais, negativo = devolver

          return {
            saidasFixas: updatedSaidasFixas,
            saidasVariaveis: state.saidasVariaveis.map(sv =>
              sv.id !== svId ? sv : { ...sv, amount }
            ),
            divisoes: state.divisoes.map(cx =>
              cx.id !== sf.divisaoId ? cx : {
                ...cx,
                balance: cx.balance - amountDiff,
                movements: (cx.movements ?? []).map(mv =>
                  mv.id !== mvId ? mv : { ...mv, amount: -amount }
                ),
              }
            ),
          }
        }),

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

/**
 * Retorna as divisões do usuário atual.
 *
 * Em modo `couple`: retorna TODAS as divisões (Lucas + Mírian juntas).
 * Em modo `personal`: filtra por `userId` do usuário logado.
 *
 * Fallback: se nenhuma divisão bate com o userId (ex: após re-login com UID
 * diferente), retorna todas as existentes para evitar tela vazia. O App.tsx
 * detecta e corrige o userId automaticamente em seguida.
 */
export const selectCurrentDivisoes = (state: AppState) => {
  if (state.viewContext === 'couple') return state.divisoes
  const userId = state.currentUser?.id ?? ''
  const mine = state.divisoes.filter(cx => cx.userId === userId)
  // Fallback: if no divisions match current userId (e.g. after re-login / uid mismatch)
  // adopt all existing divisions so they're never invisible
  return mine.length > 0 ? mine : state.divisoes
}

/**
 * Retorna as fontes de renda do usuário atual (ou todas em modo couple).
 */
export const selectCurrentIncomeSources = (state: AppState) =>
  state.viewContext === 'couple'
    ? state.incomeSources
    : state.incomeSources.filter(src => src.userId === (state.currentUser?.id ?? ''))

/**
 * Retorna as entradas do usuário atual (ou todas em modo couple).
 * Inclui entradas com `status: 'pending'`.
 */
export const selectCurrentEntradas = (state: AppState) =>
  state.viewContext === 'couple'
    ? state.entradas
    : state.entradas.filter(e => e.userId === (state.currentUser?.id ?? ''))

/**
 * Retorna as saídas fixas do usuário atual (ou todas em modo couple).
 */
export const selectCurrentSaidasFixas = (state: AppState) =>
  state.viewContext === 'couple'
    ? state.saidasFixas
    : state.saidasFixas.filter(sf => sf.userId === (state.currentUser?.id ?? ''))

/**
 * Calcula a renda mensal esperada do usuário atual.
 * Soma `expectedAmount` de todas as fontes de renda ativas.
 */
export const selectExpectedMonthlyIncome = (state: AppState): number =>
  selectCurrentIncomeSources(state)
    .reduce((sum, src) => sum + (src.expectedAmount ?? 0), 0)

// Re-export distribution calculator for convenience
export { calculateDistribution } from '../lib/calculations'
export type { DivisaoDistributionItem }
