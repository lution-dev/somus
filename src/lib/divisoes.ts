/**
 * Descriptions for each division (caixinha).
 * Used in onboarding Step 4 and in the "Entenda as divisões" info panel.
 * Based on the Nati Arcuri method, adapted.
 */
export const DIVISAO_INFO: Record<string, { name: string; pct: number; short: string; detail: string }> = {
  'cx-dizimo': {
    name: 'Dízimo',
    pct: 10,
    short: 'Contribuição e generosidade',
    detail: 'Essa divisão não faz parte da receita original, mas faz parte da vida de vocês. Reservada para dízimos, ofertas ou doações — é o hábito de generosidade como parte natural do orçamento do casal.',
  },
  'cx-reserva': {
    name: 'Liberdade Financeira',
    pct: 10,
    short: 'Reserva de emergência + investimentos',
    detail: 'São 10% pra aposentadoria — investimentos de longo prazo que rendem juros sobre juros (Tesouro IPCA, renda variável). Aqui no Somus, adaptamos pra incluir também a reserva de emergência. Esse dinheiro não é pra gastar: é pra construir segurança e independência financeira pro casal.',
  },
  'cx-objetivos': {
    name: 'Objetivos',
    pct: 20,
    short: 'Planos de curto, médio e longo prazo',
    detail: 'Viagem, carro novo, reforma, casamento — seus sonhos concretos. A Nati sugere que se você ainda não tem reserva de emergência, pode direcionar boa parte desses 20% pra construí-la primeiro, e depois focar nos outros objetivos. Curto prazo (até 2 anos), médio (2-7 anos) e longo (8+ anos).',
  },
  'cx-essencial': {
    name: 'Essencial',
    pct: 55,
    short: 'Tudo sem o qual você não vive',
    detail: 'A maior fatia — mas também o maior desafio. Cobre moradia, alimentação, transporte, saúde, escola dos filhos e todas as contas fixas. Como a Nati diz: se o essencial não cabe nos 55%, é hora de aumentar a renda ou encontrar formas mais baratas de viver. O segredo da receita é manter essa fatia enxuta.',
  },
  'cx-educacao': {
    name: 'Educação',
    pct: 5,
    short: 'O fermento da vida financeira',
    detail: 'A Nati chama de "fermento do bolo" — não é faculdade (isso vai no Essencial). São cursos de aperfeiçoamento, mentorias, livros e tudo que aumenta o seu valor de mercado. Investir em educação multiplica todas as outras divisões porque você aprende, ganha mais, e o ciclo cresce.',
  },
}

/** Ordered list of division IDs for consistent rendering */
export const DIVISAO_ORDER = [
  'cx-dizimo',
  'cx-reserva',
  'cx-objetivos',
  'cx-essencial',
  'cx-educacao',
] as const
