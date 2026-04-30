import type { User, IncomeSource, Caixinha, SaidaFixa, Objetivo, Entrada } from '../types'

// ─── Usuários ───────────────────────────────────────────────────────────────

export const MOCK_LUCAS: User = {
  id: 'lucas',
  name: 'Lucas Pires',
  email: 'lucas@lidtek.com.br',
  context: 'lucas',
  partnerCode: 'SOMUS-MIRIAN',
}

export const MOCK_MIRIAN: User = {
  id: 'mirian',
  name: 'Mírian Bernardo',
  email: 'mirian@gmail.com',
  context: 'mirian',
  partnerCode: 'SOMUS-LUCAS',
}

// ─── Fontes de renda do Lucas ────────────────────────────────────────────────

export const MOCK_INCOME_SOURCES_LUCAS: IncomeSource[] = [
  {
    id: 'src-lidtek-salario',
    userId: 'lucas',
    name: 'Lidtek — Salário',
    type: 'variable',
    expectedAmount: 5000,
    expectedDay: 5,
    color: '#3B82F6',
  },
  {
    id: 'src-lidtek-lucro',
    userId: 'lucas',
    name: 'Lidtek — Lucro',
    type: 'variable',
    expectedAmount: 2000,
    expectedDay: 10,
    color: '#60A5FA',
  },
  {
    id: 'src-glide',
    userId: 'lucas',
    name: 'Glide',
    type: 'variable',
    expectedAmount: 1500,
    expectedDay: 15,
    color: '#8B5CF6',
  },
  {
    id: 'src-mentorias',
    userId: 'lucas',
    name: 'Mentorias',
    type: 'variable',
    expectedAmount: 700,
    expectedDay: 20,
    color: '#06B6D4',
  },
]

export const MOCK_INCOME_SOURCES_MIRIAN: IncomeSource[] = [
  {
    id: 'src-mirian-salario',
    userId: 'mirian',
    name: 'Salário',
    type: 'fixed',
    expectedAmount: 2850,
    expectedDay: 5,
    color: '#EC4899',
  },
]

// ─── Caixinhas padrão (método Nati Arcuri) ──────────────────────────────────

export const MOCK_CAIXINHAS_LUCAS: Caixinha[] = [
  {
    id: 'cx-dizimo',
    userId: 'lucas',
    name: 'Dízimo',
    emoji: '🕊️',
    percentage: 10,
    balance: 870,
    color: '#F59E0B',
    isDefault: true,
    order: 0,
    movements: [
      { id: 'm1', date: '2026-04-05', amount: 500, description: 'Distribuição — Lidtek Salário', type: 'income' },
      { id: 'm2', date: '2026-04-10', amount: 200, description: 'Distribuição — Lidtek Lucro', type: 'income' },
      { id: 'm3', date: '2026-04-15', amount: 170, description: 'Distribuição — Glide', type: 'income' },
    ],
  },
  {
    id: 'cx-reserva',
    userId: 'lucas',
    name: 'Liberdade Financeira',
    emoji: '🛡️',
    percentage: 8,
    targetAmount: 10000,
    balance: 7240,
    color: '#10B981',
    isDefault: true,
    order: 1,
    movements: [
      { id: 'm4', date: '2026-04-05', amount: 400, description: 'Distribuição — Lidtek Salário', type: 'income' },
      { id: 'm5', date: '2026-04-10', amount: 160, description: 'Distribuição — Lidtek Lucro', type: 'income' },
    ],
  },
  {
    id: 'cx-objetivos',
    userId: 'lucas',
    name: 'Objetivos',
    emoji: '🎯',
    percentage: 20,
    balance: 3120,
    color: '#8B5CF6',
    isDefault: true,
    order: 2,
    movements: [
      { id: 'm6', date: '2026-04-05', amount: 1000, description: 'Distribuição — Lidtek Salário', type: 'income' },
      { id: 'm7', date: '2026-04-10', amount: 400, description: 'Distribuição — Lidtek Lucro', type: 'income' },
    ],
  },
  {
    id: 'cx-essencial',
    userId: 'lucas',
    name: 'Essencial',
    emoji: '🏠',
    percentage: 55,
    balance: 2890,
    color: '#3B82F6',
    isDefault: true,
    order: 3,
    movements: [
      { id: 'm8', date: '2026-04-05', amount: 2750, description: 'Distribuição — Lidtek Salário', type: 'income' },
      { id: 'm9', date: '2026-04-12', amount: -601, description: 'Aluguel', type: 'expense' },
      { id: 'm10', date: '2026-04-15', amount: -175, description: 'Claro', type: 'expense' },
      { id: 'm11', date: '2026-04-20', amount: -195, description: 'Enel', type: 'expense' },
    ],
  },
  {
    id: 'cx-educacao',
    userId: 'lucas',
    name: 'Educação',
    emoji: '📚',
    percentage: 5,
    balance: 430,
    color: '#06B6D4',
    isDefault: true,
    order: 4,
    movements: [
      { id: 'm12', date: '2026-04-05', amount: 250, description: 'Distribuição — Lidtek Salário', type: 'income' },
      { id: 'm13', date: '2026-04-10', amount: 100, description: 'Distribuição — Lidtek Lucro', type: 'income' },
    ],
  },
  {
    id: 'cx-livre',
    userId: 'lucas',
    name: 'Livre',
    emoji: '✨',
    percentage: 2,
    balance: 185,
    color: '#EC4899',
    isDefault: true,
    order: 5,
    movements: [
      { id: 'm14', date: '2026-04-05', amount: 100, description: 'Distribuição — Lidtek Salário', type: 'income' },
      { id: 'm15', date: '2026-04-20', amount: 85, description: 'Distribuição — Glide', type: 'income' },
    ],
  },
]

// ─── Saídas Fixas do Lucas ───────────────────────────────────────────────────

export const MOCK_SAIDAS_FIXAS_LUCAS: SaidaFixa[] = [
  {
    id: 'sf-aluguel',
    userId: 'lucas',
    name: 'Aluguel',
    amount: 601,
    dueDay: 10,
    paymentMethod: 'pix',
    caixinhaId: 'cx-essencial',
    autoDebit: false,
    paidDates: ['2026-04-10'],
    category: 'Moradia',
    color: '#3B82F6',
  },
  {
    id: 'sf-claro',
    userId: 'lucas',
    name: 'Claro (Internet)',
    amount: 175,
    dueDay: 15,
    paymentMethod: 'auto_debit',
    caixinhaId: 'cx-essencial',
    autoDebit: true,
    paidDates: ['2026-04-15'],
    category: 'Utilities',
    color: '#EF4444',
  },
  {
    id: 'sf-enel',
    userId: 'lucas',
    name: 'Enel (Luz)',
    amount: 195,
    dueDay: 20,
    paymentMethod: 'auto_debit',
    caixinhaId: 'cx-essencial',
    autoDebit: true,
    paidDates: [],
    category: 'Utilities',
    color: '#F59E0B',
  },
  {
    id: 'sf-agua',
    userId: 'lucas',
    name: 'Água (SAAE)',
    amount: 85,
    dueDay: 18,
    paymentMethod: 'auto_debit',
    caixinhaId: 'cx-essencial',
    autoDebit: true,
    paidDates: [],
    category: 'Utilities',
    color: '#06B6D4',
  },
  {
    id: 'sf-seguro',
    userId: 'lucas',
    name: 'Seguro do Carro',
    amount: 240,
    dueDay: 25,
    paymentMethod: 'auto_debit',
    caixinhaId: 'cx-essencial',
    autoDebit: true,
    paidDates: [],
    category: 'Transporte',
    color: '#8B5CF6',
  },
]

// ─── Objetivos do Lucas ──────────────────────────────────────────────────────

export const MOCK_OBJETIVOS_LUCAS: Objetivo[] = [
  {
    id: 'obj-casamento',
    userId: 'lucas',
    name: 'Casamento',
    emoji: '💍',
    targetAmount: 25000,
    currentAmount: 3120,
    targetDate: '2027-12-01',
    caixinhaId: 'cx-objetivos',
    createdAt: '2026-02-01',
    movements: [
      { id: 'om1', date: '2026-04-05', amount: 1000, description: 'Distribuição — Salário', type: 'deposit' },
      { id: 'om2', date: '2026-04-10', amount: 400, description: 'Distribuição — Lucro', type: 'deposit' },
      { id: 'om3', date: '2026-03-05', amount: 1000, description: 'Distribuição — Salário', type: 'deposit' },
      { id: 'om4', date: '2026-03-10', amount: 400, description: 'Distribuição — Lucro', type: 'deposit' },
      { id: 'om5', date: '2026-02-05', amount: 320, description: 'Depósito inicial', type: 'deposit' },
    ],
  },
  {
    id: 'obj-apto',
    userId: 'lucas',
    name: 'Entrada Apartamento',
    emoji: '🏠',
    targetAmount: 60000,
    currentAmount: 8500,
    targetDate: '2028-06-01',
    caixinhaId: 'cx-objetivos',
    createdAt: '2025-06-01',
    movements: [
      { id: 'om6', date: '2026-04-05', amount: 500, description: 'Distribuição — Salário', type: 'deposit' },
      { id: 'om7', date: '2026-03-05', amount: 500, description: 'Distribuição — Salário', type: 'deposit' },
      { id: 'om8', date: '2026-02-05', amount: 500, description: 'Distribuição — Salário', type: 'deposit' },
      { id: 'om9', date: '2025-12-20', amount: 2000, description: 'Bônus de fim de ano', type: 'deposit' },
      { id: 'om10', date: '2025-06-01', amount: 5000, description: 'Depósito inicial', type: 'deposit' },
    ],
  },
]

// ─── Entradas de abril/2026 ──────────────────────────────────────────────────

export const MOCK_ENTRADAS_LUCAS: Entrada[] = [
  {
    id: 'e1',
    userId: 'lucas',
    sourceId: 'src-lidtek-salario',
    sourceName: 'Lidtek — Salário',
    amount: 5000,
    date: '2026-04-05',
    distribution: [
      { caixinhaId: 'cx-dizimo',    caixinhaName: 'Dízimo',              amount: 500,  percentage: 10 },
      { caixinhaId: 'cx-reserva',   caixinhaName: 'Liberdade Financeira', amount: 400, percentage: 8  },
      { caixinhaId: 'cx-objetivos', caixinhaName: 'Objetivos',           amount: 1000, percentage: 20 },
      { caixinhaId: 'cx-essencial', caixinhaName: 'Essencial',           amount: 2750, percentage: 55 },
      { caixinhaId: 'cx-educacao',  caixinhaName: 'Educação',            amount: 250,  percentage: 5  },
      { caixinhaId: 'cx-livre',     caixinhaName: 'Livre',               amount: 100,  percentage: 2  },
    ],
  },
  {
    id: 'e2',
    userId: 'lucas',
    sourceId: 'src-lidtek-lucro',
    sourceName: 'Lidtek — Lucro',
    amount: 2000,
    date: '2026-04-10',
    distribution: [
      { caixinhaId: 'cx-dizimo',    caixinhaName: 'Dízimo',              amount: 200,  percentage: 10 },
      { caixinhaId: 'cx-reserva',   caixinhaName: 'Liberdade Financeira', amount: 160, percentage: 8  },
      { caixinhaId: 'cx-objetivos', caixinhaName: 'Objetivos',           amount: 400,  percentage: 20 },
      { caixinhaId: 'cx-essencial', caixinhaName: 'Essencial',           amount: 1100, percentage: 55 },
      { caixinhaId: 'cx-educacao',  caixinhaName: 'Educação',            amount: 100,  percentage: 5  },
      { caixinhaId: 'cx-livre',     caixinhaName: 'Livre',               amount: 40,   percentage: 2  },
    ],
  },
]
