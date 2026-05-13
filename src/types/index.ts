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
  isCouple?: boolean          // true = aparece na aba Casal
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
  divisoes: Divisao[]
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
