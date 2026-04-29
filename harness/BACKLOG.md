# BACKLOG.md — Somus
> Tasks ativas. Quando concluída, mova para archive/changelog.md.

## Sprint MVP — Protótipo com Mock Data (9 tasks)

> Origem: PRD v1.0 + planejamento de 29/04/2026.
> Modo: SPRINT. Sem backend — mock data + localStorage. Supabase fica pra fase futura.

---

#### T-S01-01: Scaffold Vite + React + TS + PWA
**Tipo:** Infra
**Critérios:**
- [x] Vite + React 18 + TypeScript
- [ ] PWA com manifest.json e service worker básico
- [ ] TailwindCSS configurado com tokens do design system
- [ ] Estrutura de pastas: src/components, src/pages, src/hooks, src/stores, src/lib, src/types
- [ ] Wouter para routing
- [ ] Framer Motion para animações
**Status:** 🔄 Parcial (Vite scaffoldado pelo outro chat, falta PWA + Tailwind + estrutura)

---

#### T-S01-02: Design System Dark Mode
**Tipo:** Visual
**Critérios:**
- [ ] Paleta de cores aplicada (bg: #0D1B2A, cards: #1A2D42, accent: #3B82F6)
- [ ] Tipografia Inter configurada (display 36-48px, body 14-16px, label 11-12px)
- [ ] Glassmorphism em cards e superfícies
- [ ] Componentes base: Button, Card, Badge, Input, Dialog, BottomNav
- [ ] Diferenciação visual por contexto (Lucas=azul, Mírian=rosa, Casal=lilás)
- [ ] Micro-animações e transições suaves
**Status:** 🔲 Pendente

---

#### T-S01-03: Mock Data Layer
**Tipo:** Dados
**Critérios:**
- [ ] Types definidos: User, Entrada, SaidaFixa, SaidaVariavel, Caixinha, Objetivo
- [ ] Mock data do Lucas pré-carregado (fontes de renda, saídas fixas, caixinhas)
- [ ] Store com Zustand + localStorage para persistência
- [ ] Funções de cálculo: distribuição automática por caixinha, saldo disponível
**Status:** 🔲 Pendente

---

#### T-S01-04: App Shell + Routing
**Tipo:** Layout
**Critérios:**
- [ ] Bottom Tab Bar (4 itens): Home, Fluxo, Caixinhas, Casal
- [ ] Menu lateral (hamburger): Perfil, Configurações, Histórico, Objetivos
- [ ] Layout responsivo mobile-first + desktop
- [ ] Transições entre telas com Framer Motion
- [ ] Safe area insets para iPhone
**Status:** 🔲 Pendente

---

#### T-S01-05: Onboarding Wizard
**Tipo:** Flow
**Critérios:**
- [ ] Tela 1: Nome, foto, email (mock, sem auth real)
- [ ] Tela 2: Convidar parceiro(a) — link/código (visual only)
- [ ] Tela 3: Configurar fontes de renda (nome, tipo fixo/variável, dia esperado)
- [ ] Tela 4: Configurar percentuais das caixinhas (padrão Nati Arcuri pré-carregado)
- [ ] Tela 5: Cadastrar saídas fixas recorrentes
- [ ] Tela 6: Definir primeiro objetivo (nome, foto, valor-alvo)
- [ ] Salva tudo no localStorage via store
**Status:** 🔲 Pendente

---

#### T-S01-06: Caixinhas
**Tipo:** Feature
**Critérios:**
- [ ] Lista de caixinhas com saldo atual, % meta, barra de progresso
- [ ] Detalhe individual: histórico de movimentações, gráfico de evolução
- [ ] 6 caixinhas padrão: Dízimo 10%, Reserva ~8%, Objetivos 20%, Essencial 55%, Educação 5%, Livre restante
- [ ] Alerta visual quando caixinha abaixo do esperado
- [ ] RN05: Reserva atingiu R$10k → sugerir redirecionar para Objetivos
**Status:** 🔲 Pendente

---

#### T-S01-07: Saídas Fixas
**Tipo:** Feature
**Critérios:**
- [ ] Lista de contas fixas com vencimento, valor, forma de pagamento, caixinha associada
- [ ] Contas do Lucas pré-cadastradas (aluguel R$601, Claro R$175, Enel ~R$200, etc.)
- [ ] Flag de débito automático (confirma sozinho no dia)
- [ ] Botão "Pagar" para confirmar pagamento manual
- [ ] Alerta N dias antes do vencimento
**Status:** 🔲 Pendente

---

#### T-S01-08: Lançar Entrada (CORE)
**Tipo:** Feature — Core do produto
**Critérios:**
- [ ] Botão "+ Lançar Entrada" acessível de qualquer tela
- [ ] Modal: valor, fonte (dropdown com fontes salvas), data
- [ ] Preview da distribuição automática pelas caixinhas (% configurado)
- [ ] Usuário pode editar qualquer valor antes de confirmar (soma ≤ total)
- [ ] RN01: Distribuição proporcional às caixinhas ativas
- [ ] RN02: Mesma fonte pode ser lançada múltiplas vezes no mês
- [ ] RN08: Dízimo sempre primeiro e destacado no preview
- [ ] Saldos das caixinhas atualizados em tempo real após confirmar
**Status:** 🔲 Pendente

---

#### T-S01-09: Dashboard Home
**Tipo:** Feature
**Critérios:**
- [ ] Card de saldo disponível real (total caixinhas - comprometimentos futuros)
- [ ] Barra de progresso do mês: % da renda esperada já lançada
- [ ] Mini linha do tempo: próximos 7 dias (entradas esperadas + saídas vencendo)
- [ ] Cards de caixinhas com saldo vs meta (barra de progresso + valor)
- [ ] Toggle Pessoal / Casal no topo
- [ ] Valores futuros com prefixo ~ e cor âmbar (RN06)
**Status:** 🔲 Pendente
