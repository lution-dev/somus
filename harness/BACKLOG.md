# BACKLOG.md — Somus
> Tasks ativas. Quando concluída, mova para archive/changelog.md.

## Sprint MVP — Protótipo com Mock Data (9 tasks)

> Origem: PRD v1.0 + planejamento do chat de 29/04/2026.
> Modo: SPRINT. Sem backend — mock data + localStorage. Supabase fica pra fase futura.

---

#### T-S01-01: Scaffold Vite + React + TS + PWA
**Tipo:** Infra
**Critérios:**
- [x] Vite + React 18 + TypeScript
- [x] PWA com manifest.json e service worker básico
- [x] TailwindCSS configurado com tokens do design system
- [x] Estrutura de pastas: src/components, src/pages, src/hooks, src/stores, src/lib, src/types
- [x] Wouter para routing
- [x] Framer Motion para animações
**Status:** ✅ Concluído

---

#### T-S01-02: Design System Dark Mode
**Tipo:** Visual
**Critérios:**
- [x] Paleta de cores aplicada (bg: #0D1B2A, cards: #1A2D42, accent: #3B82F6)
- [x] Tipografia Inter configurada (display 36-48px, body 14-16px, label 11-12px)
- [x] Glassmorphism em cards e superfícies
- [x] Componentes base: Button, Card, Badge, Input, Dialog, BottomNav
- [x] Diferenciação visual por contexto (Lucas=azul, Mírian=rosa, Casal=lilás)
- [x] Micro-animações e transições suaves
**Status:** ✅ Concluído

---

#### T-S01-03: Mock Data Layer
**Tipo:** Dados
**Critérios:**
- [x] Types definidos: User, Entrada, SaidaFixa, SaidaVariavel, Caixinha, Objetivo
- [x] Mock data do Lucas pré-carregado (fontes de renda, saídas fixas, caixinhas)
- [x] Store com Zustand + localStorage para persistência
- [x] Funções de cálculo: distribuição automática por caixinha, saldo disponível
**Status:** ✅ Concluído

---

#### T-S01-04: App Shell + Routing
**Tipo:** Layout
**Critérios:**
- [x] Bottom Tab Bar (4 itens): Home, Fluxo, Caixinhas, Casal
- [x] Menu lateral (hamburger): Perfil, Configurações, Histórico, Objetivos
- [x] Layout responsivo mobile-first + desktop
- [x] Transições entre telas com Framer Motion
- [x] Safe area insets para iPhone
**Status:** ✅ Concluído

---

#### T-S01-05: Onboarding Wizard
**Tipo:** Flow
**Critérios:**
- [x] Tela 1: Nome, foto, email (mock, sem auth real)
- [x] Tela 2: Convidar parceiro(a) — link/código (visual only)
- [x] Tela 3: Configurar fontes de renda (nome, tipo fixo/variável, dia esperado)
- [x] Tela 4: Configurar percentuais das caixinhas (padrão Nati Arcuri pré-carregado)
- [x] Tela 5: Cadastrar saídas fixas recorrentes
- [x] Tela 6: Definir primeiro objetivo (nome, foto, valor-alvo)
- [x] Salva tudo no localStorage via store
**Status:** ✅ Concluído

---

#### T-S01-06: Caixinhas
**Tipo:** Feature
**Critérios:**
- [x] Lista de caixinhas com saldo atual, % meta, barra de progresso
- [x] Detalhe individual: histórico de movimentações, gráfico de evolução
- [x] 6 caixinhas padrão: Dízimo (10%), Reserva Emergência (~8%), Objetivos (20%), Essencial (55%), Educação (5%), Livre (restante)
- [x] Alerta visual quando caixinha abaixo do esperado
- [x] RN05: Reserva atingiu R$10k → sugerir redirecionar para Objetivos
**Status:** ✅ Concluído

---

#### T-S01-07: Saídas Fixas
**Tipo:** Feature
**Critérios:**
- [x] Lista de contas fixas com vencimento, valor, forma de pagamento, caixinha associada
- [x] Contas do Lucas pré-cadastradas (aluguel R$601, Claro R$175, Enel ~R$200, etc.)
- [x] Flag de débito automático (confirma sozinho no dia)
- [x] Botão "Pagar" para confirmar pagamento manual
- [x] Alerta N dias antes do vencimento
**Status:** ✅ Concluído

---

#### T-S01-08: Lançar Entrada (CORE)
**Tipo:** Feature — Core do produto
**Critérios:**
- [x] Botão "+ Lançar Entrada" acessível de qualquer tela
- [x] Modal: valor, fonte (dropdown com fontes salvas), data
- [x] Preview da distribuição automática pelas caixinhas (% configurado)
- [x] Usuário pode editar qualquer valor antes de confirmar (soma ≤ total)
- [x] RN01: Distribuição proporcional às caixinhas ativas
- [x] RN02: Mesma fonte pode ser lançada múltiplas vezes no mês
- [x] RN08: Dízimo sempre primeiro e destacado no preview
- [x] Saldos das caixinhas atualizados em tempo real após confirmar
**Status:** ✅ Concluído

---

#### T-S01-09: Dashboard Home
**Tipo:** Feature
**Critérios:**
- [x] Card de saldo disponível real (total caixinhas - comprometimentos futuros)
- [x] Barra de progresso do mês: % da renda esperada já lançada
- [x] Mini linha do tempo: próximos 7 dias (entradas esperadas + saídas vencendo)
- [x] Cards de caixinhas com saldo vs meta (barra de progresso + valor)
- [x] Toggle Pessoal / Casal no topo
- [x] Valores futuros com prefixo ~ e cor âmbar (RN06)
**Status:** ✅ Concluído
