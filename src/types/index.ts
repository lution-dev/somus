// ─── Entidades base ─────────────────────────────────────────────────────────

export type UserContext = 'personal' | 'couple'
export type IncomeType = 'fixed' | 'variable'
export type PaymentMethod = 'debit' | 'credit' | 'pix' | 'cash' | 'auto_debit' | 'boleto'
export type BillingCycle = 'month' | 'year'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  photoURL?: string
  partnerCode?: string
  goal?: string   // objetivo selecionado no onboarding (etapa 3)
}

// ─── Fontes de renda ────────────────────────────────────────────────────────

export interface IncomeSource {
  id: string
  userId: string
  name: string
  type: IncomeType
  expectedAmount?: number
  expectedDay?: number
  color?: string
}

// ─── Entradas ───────────────────────────────────────────────────────────────

export interface DivisaoDistributionItem {
  divisaoId: string
  divisaoName: string
  amount: number
  percentage: number
}

export interface Entrada {
  id: string
  userId: string
  sourceId: string
  sourceName: string
  amount: number
  date: string
  note?: string
  distribution: DivisaoDistributionItem[]
  status?: 'realized' | 'pending'
  /** 'distributable' (default): distributes to all divisions by %; shown in global history
   *  'direct': goes only to targetDivisaoId; NOT in global income total; shown in Fluxo only */
  kind?: 'distributable' | 'direct'
  targetDivisaoId?: string
}

// ─── Entradas Fixas (Renda Recorrente) ─────────────────────────────────────

export interface EntradaFixa {
  id: string
  userId: string
  name: string                          // ex: "Salário Lidtek", "Freelance Glide"
  amount: number                        // valor base mensal
  dueDay: number                        // dia esperado de recebimento (1-31)
  kind: 'distributable' | 'direct'      // distribui por % ou vai pra 1 divisão
  targetDivisaoId?: string              // só quando kind='direct'
  payments: Record<string, string>      // 'YYYY-MM' → 'YYYY-MM-DD' (data real do recebimento)
  startDate?: string                    // 'YYYY-MM'
  isVariable?: boolean                  // se true, valor varia todo mês
  monthlyAmountOverrides?: Record<string, number>  // 'YYYY-MM' → valor override
  skippedMonths?: string[]              // meses a ignorar
}

// ─── Divisoes ──────────────────────────────────────────────────────────────

export interface DivisaoMovement {
  id: string
  date: string
  amount: number
  description: string
  type: 'income' | 'expense' | 'transfer'
}

export interface Divisao {
  id: string
  userId: string
  name: string
  emoji: string
  percentage: number
  targetAmount?: number
  balance: number
  color: string
  isDefault: boolean
  order: number
  movements: DivisaoMovement[]
}

// ─── Saídas Fixas ───────────────────────────────────────────────────────────

export interface SaidaFixa {
  id: string
  userId: string
  name: string
  amount: number        // always stored as monthly equivalent
  dueDay: number
  paymentMethod: PaymentMethod
  divisaoId: string
  autoDebit: boolean
  payments: Record<string, string>      // key: 'YYYY-MM', value: 'YYYY-MM-DD' (real payment date)
  startDate?: string                    // format: 'YYYY-MM' (when this recurring cost started)
  category: string
  color?: string
  isVariable?: boolean   // valor não contabiliza no total
  billingCycle?: BillingCycle  // 'month' | 'year' — UI only, amount already normalized to monthly
  monthlyAmountOverrides?: Record<string, number>  // key: 'YYYY-MM', value: override amount for that month
  skippedMonths?: string[]                        // list of 'YYYY-MM' to ignore this cost
}

// ─── Saídas Variáveis ───────────────────────────────────────────────────────

export interface SaidaVariavel {
  id: string
  userId: string
  divisaoId: string
  amount: number
  description: string
  category: string
  subcategory?: string
  paymentMethod: PaymentMethod
  date: string
  status?: 'realized' | 'pending'
}

export interface ObjetivoMovement {
  id: string
  date: string
  amount: number
  description: string
  type: 'deposit' | 'withdraw'
}

export type ObjetivoStatus = 'em_realizacao' | 'redistribuido'

export interface Objetivo {
  id: string
  userId: string
  name: string
  emoji: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  monthsToAchieve?: number   // meses para atingir o objetivo (calculado ou informado)
  imageUrl?: string
  divisaoId?: string
  createdAt?: string
  startDate?: string             // data de início (pode ser retroativa ou futura)
  isCouple?: boolean          // true = aparece na aba Casal
  movements: ObjetivoMovement[]
  status?: ObjetivoStatus     // estado pós-meta: em_realizacao | redistribuido
  originObjectiveName?: string // herança emocional: "Construído a partir de: Casamento ✨"
}

// ─── Extrato bancário (conciliação mensal) ───────────────────────────────────

/** Transação normalizada após parse (arquivo bruto não é persistido) */
export interface BankTransaction {
  id: string
  date: string            // YYYY-MM-DD
  amount: number          // +crédito / -débito
  description: string
  rawType?: 'credit' | 'debit'
}

export type StatementMatchStatus = 'matched' | 'unmatched' | 'ignored'

export interface StatementLinkedEntity {
  kind: 'entrada' | 'entradaFixa' | 'saidaVariavel' | 'saidaFixa'
  id: string
  label: string
}

export interface StatementReconciliation {
  id: string
  userId: string
  yearMonth: string           // mês do extrato, ex: '2026-07'
  uploadedAt: string
  sourceFormat: 'ofx' | 'csv' | 'pdf'
  /** Rótulo livre (ex: 99Pay, Inter). Piloto ainda em definição de export. */
  sourceLabel?: string
  accountKind: 'checking'
  transactionCount: number
  matchedCount: number
  importedCount: number
  ignoredCount: number
  transactionHashes: string[]
}

/** Item confirmado na tela de revisão para gravar no store */
export interface StatementImportItem {
  transactionId: string
  date: string
  amount: number
  name: string
  /** crédito: renda distributable ou direto numa divisão */
  direction: 'income' | 'expense'
  incomeKind?: 'distributable' | 'direct'
  divisaoId?: string
  ignored?: boolean
}

// ─── App State ──────────────────────────────────────────────────────────────

export interface AppState {
  isOnboarded: boolean
  currentUser: User | null
  partner: User | null
  viewContext: UserContext
  incomeSources: IncomeSource[]
  entradas: Entrada[]
  entradasFixas: EntradaFixa[]
  divisoes: Divisao[]
  saidasFixas: SaidaFixa[]
  saidasVariaveis: SaidaVariavel[]
  objetivos: Objetivo[]
  statementReconciliations: StatementReconciliation[]
}

export interface MonthSummary {
  totalIncome: number
  totalExpenses: number
  availableBalance: number
  expectedMonthlyIncome: number
  incomeProgress: number
}
