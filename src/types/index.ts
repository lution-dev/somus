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
  partnerCode?: string
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

export interface CaixinhaDistributionItem {
  caixinhaId: string
  caixinhaName: string
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
  distribution: CaixinhaDistributionItem[]
}

// ─── Caixinhas ──────────────────────────────────────────────────────────────

export interface CaixinhaMovement {
  id: string
  date: string
  amount: number
  description: string
  type: 'income' | 'expense' | 'transfer'
}

export interface Caixinha {
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
  movements: CaixinhaMovement[]
}

// ─── Saídas Fixas ───────────────────────────────────────────────────────────

export interface SaidaFixa {
  id: string
  userId: string
  name: string
  amount: number        // always stored as monthly equivalent
  dueDay: number
  paymentMethod: PaymentMethod
  caixinhaId: string
  autoDebit: boolean
  paidDates: string[]
  category: string
  color?: string
  isVariable?: boolean   // valor não contabiliza no total
  billingCycle?: BillingCycle  // 'month' | 'year' — UI only, amount already normalized to monthly
}

// ─── Saídas Variáveis ───────────────────────────────────────────────────────

export interface SaidaVariavel {
  id: string
  userId: string
  caixinhaId: string
  amount: number
  description: string
  category: string
  subcategory?: string
  paymentMethod: PaymentMethod
  date: string
}

export interface ObjetivoMovement {
  id: string
  date: string
  amount: number
  description: string
  type: 'deposit' | 'withdraw'
}

export interface Objetivo {
  id: string
  userId: string
  name: string
  emoji: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  imageUrl?: string
  caixinhaId?: string
  createdAt?: string
  movements: ObjetivoMovement[]
}

// ─── App State ──────────────────────────────────────────────────────────────

export interface AppState {
  isOnboarded: boolean
  currentUser: User | null
  partner: User | null
  viewContext: UserContext
  incomeSources: IncomeSource[]
  entradas: Entrada[]
  caixinhas: Caixinha[]
  saidasFixas: SaidaFixa[]
  saidasVariaveis: SaidaVariavel[]
  objetivos: Objetivo[]
}

export interface MonthSummary {
  totalIncome: number
  totalExpenses: number
  availableBalance: number
  expectedMonthlyIncome: number
  incomeProgress: number
}
