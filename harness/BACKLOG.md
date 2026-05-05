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

---

## Batch UI/UX Audit — Skill ui-ux-pro-max (9 tasks)

> Origem: Auditoria visual tela a tela, 30/04/2026.
> Modo: BATCH. Melhorias de UX/UI identificadas pela skill ui-ux-pro-max.

---

#### T-AD-01: CSS Global — border contrast, active states, card-interactive
**Tipo:** Visual
**Critérios:**
- [x] --color-border de #1E1E1E → #2A2A2A (contrast visível)
- [x] .btn-primary:active com scale(0.98)
- [x] .card-interactive:hover sem cor hardcoded
**Status:** ✅ Concluído

---

#### T-AD-02: BottomNav — active indicator dot
**Tipo:** Visual
**Critérios:**
- [x] Dot indicator abaixo do ícone ativo
- [x] Transição suave no active state
**Status:** ✅ Concluído

---

#### T-AD-03: Home — highlight "Hoje", icon na section label, spacing
**Tipo:** Visual
**Critérios:**
- [x] ProximosDias item "Hoje" com fundo sutil vermelho
- [x] section-label "Caixinhas" com ícone Wallet
- [x] Ajuste de spacing balance card
**Status:** ✅ Concluído

---

#### T-AD-04: Fluxo — touch target, dot size, mobile subtitle
**Tipo:** UX
**Critérios:**
- [x] SaidaItem checkbox: hit area ≥44px
- [x] Dot 6→8px
- [x] Subtitle mês no PageHeader mobile
**Status:** ✅ Concluído

---

#### T-AD-05: Caixinhas — tap feedback, chevron, mobile total
**Tipo:** UX
**Critérios:**
- [x] :active state nos cards (via CSS .card-interactive:active)
- [x] ChevronRight opacity 0.5→0.7
- [x] Subtitle total no PageHeader mobile
**Status:** ✅ Concluído

---

#### T-AD-06: Casal — emoji→SVG, copy feedback, monospace→Inter
**Tipo:** Visual/UX
**Critérios:**
- [x] ♥ substituído por <Heart> SVG
- [x] Botão Copiar com estado "Copiado!" por 2s
- [x] monospace substituído por Inter + letter-spacing
**Status:** ✅ Concluído

---

#### T-AD-07: CaixinhaDetalhe — hex color fix
**Tipo:** Bug
**Critérios:**
- [x] border: `${color}25` corrigido para hexToRgba()
**Status:** ✅ Concluído

---

#### T-AD-08: LancarEntradaModal — footer order, success cleanup
**Tipo:** UX
**Critérios:**
- [x] DialogFooter: Confirmar no topo, Cancelar embaixo
- [x] Success text: ✓ substituído por texto limpo
**Status:** ✅ Concluído

---

#### T-AD-09: Onboarding — back button, icon sizes
**Tipo:** Visual
**Critérios:**
- [x] Back button: 14px + ghost style + ← prefixo
- [x] Step4 ícones: 16→18px
**Status:** ✅ Concluído

---

#### T-AD-10: PWA Install Prompt + Ícones
**Tipo:** Infra + UX
**Critérios:**
- [x] Gerar ícones PWA (192x192, 512x512) e apple-touch-icon
- [x] Hook `usePWAInstall` para capturar `beforeinstallprompt`
- [x] Componente `PWAInstallPrompt` com hint que aparece 1x (localStorage) e depois some
- [x] Animação fluida (Framer Motion spring) + design dark mode
- [x] Montar no App.tsx dentro do layout protegido
**Status:** ✅ Concluído

---

## Sprint S02 — Firebase Integration (7 tasks)

> Origem: Necessidade de backend cloud, upload de imagens, sync multi-device.
> Modo: SPRINT. Firebase (Firestore + Auth anônimo). Imagens via base64 (Storage requer Blaze plan).

---

#### T-S02-01: Firebase SDK + Configuração
**Tipo:** Infra
**Critérios:**
- [x] Firebase SDK instalado
- [x] Projeto `somus-3df33` criado no Firebase Console (Spark plan)
- [x] `src/lib/firebase.ts` com initializeApp, getAuth, getFirestore
- [x] `.env` com variáveis VITE_FIREBASE_*
- [x] `.env.example` template seguro
- [x] `.gitignore` com .env protegido
**Status:** ✅ Concluído

---

#### T-S02-02: Firestore Service
**Tipo:** Data
**Critérios:**
- [x] `src/lib/firestoreService.ts` com saveState, loadState, subscribeToState
- [x] Single-document per user approach (users/{uid})
- [x] serverTimestamp para lastModified
**Status:** ✅ Concluído

---

#### T-S02-03: Firebase Sync Provider
**Tipo:** Infra
**Critérios:**
- [x] `src/hooks/useFirebaseSync.tsx` — Provider que orquestra sync
- [x] Dual-write: Zustand (localStorage) + Firestore
- [x] Debounced writes (2s) para minimizar Firestore usage
- [x] Não bloqueia UI — app carrega do localStorage, sync em background
- [x] Real-time listener para sync multi-device
**Status:** ✅ Concluído

---

#### T-S02-04: Anonymous Auth
**Tipo:** Auth
**Critérios:**
- [x] `src/hooks/useAuth.ts` com signInAnonymously
- [x] Auto sign-in no primeiro acesso
- [x] Sessão persistida pelo Firebase (sobrevive reload)
- [x] Auth Anônimo habilitado no Firebase Console
**Status:** ✅ Concluído

---

#### T-S02-05: Image Upload (base64)
**Tipo:** Feature
**Critérios:**
- [x] `src/hooks/useImageUpload.ts` com compressão client-side
- [x] Resize max 800px, JPEG 75% quality
- [x] Fallback para 50% quality se > 500KB
- [x] Sem Firebase Storage (requer Blaze) — armazena base64 no Firestore
**Status:** ✅ Concluído

---

#### T-S02-06: UI Upload nos Objetivos
**Tipo:** Visual/Feature
**Critérios:**
- [x] Cover image clicável no ObjetivoDetalhe (mobile + desktop)
- [x] Ícone Camera com dashed border quando sem foto
- [x] Preview circular com badge Camera quando tem foto
- [x] Loading state (opacity) durante processamento
- [x] `updateObjetivoImage` action no Zustand store
**Status:** ✅ Concluído

---

#### T-S02-07: Migration Service
**Tipo:** Data
**Critérios:**
- [x] `src/lib/migrationService.ts` com migrateToFirestore
- [x] One-time migration: localStorage → Firestore na primeira abertura
- [x] debouncedSaveToFirestore para writes subsequentes
- [x] Flag de migração em localStorage para não repetir
**Status:** ✅ Concluído

---

## Ad-hoc — UI/UX Fixes (pós-MVP)

---

#### T-AD-12: Sync cross-device — dados do celular não aparecem no PC
**Tipo:** Bug
**Critérios:**
- [ ] `migrateToFirestore` sempre carrega estado do Firestore (source of truth), independente do localStorage local
- [ ] `isFirstSnapshot` removido do listener — o primeiro snapshot deve ser aplicado para receber mudanças de outros dispositivos
- [ ] Proteção de echo mantida via `isRemoteUpdate` ref
**Status:** 🔄 Em progresso

---

#### T-AD-11: BottomNav — safe area nativa (fill-to-bottom)
**Tipo:** Visual/UX
**Critérios:**
- [ ] Pill estende background até o fundo da tela (cobre safe area region)
- [ ] Border-radius só no topo (22px 22px 0 0) — bottom square, sem gap visual
- [ ] Scrim gradient acima do pill para separação do conteúdo
- [ ] Spacer no AppLayout ajustado para nova altura do nav
**Status:** ✅ Concluído

---
