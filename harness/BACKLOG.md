# BACKLOG.md — Somus

## Sprint Concluído — Onboarding v2 Premium (S-ONB)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-ONB-01 | ✅ done | Welcome: atmospheric glow, logo breathing, headline, CTA | Onboarding.tsx |
| T-ONB-02 | ✅ done | Seu Espaço: header contextual, nome + avatar Google, glow ao confirmar | Onboarding.tsx |
| T-ONB-03 | ✅ done | Objetivo Principal: 6 cards com inner light, lift e scale no select | Onboarding.tsx |
| T-ONB-04 | ✅ done | Método Somus: divisões animadas sequencialmente com barra e badge | Onboarding.tsx |
| T-ONB-05 | ✅ done | Conexão Compartilhada: 3 sub-telas (5A preview / 5B share+QR / 5C confirm) | Onboarding.tsx |
| T-ONB-06 | ✅ done | Orchestrator: progress dots azuis + sub-dots roxos Step5, transições globais, dissolve cinematic | Onboarding.tsx |
| T-ONB-07 | ✅ done | Store: campo `goal` em currentUser | types/index.ts + useAppStore.ts |
| T-ONB-08 | ✅ done | Progressive Onboarding: cards contextuais na Home com chips prefill | Home.tsx |

## Sprint Concluído — Home Empty State Estruturado (S-HOME-ES)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-HOME-ES-01 | ✅ done | Divisões sempre visíveis em modo dormant (opacity 65%, saturate 55%, taglines filosóficos) | Home.tsx |
| T-HOME-ES-02 | ✅ done | Barras animam de 0→valor real ao despertar (primeira entrada) | Home.tsx |
| T-HOME-ES-03 | ✅ done | Badge "aguardando" no header Divisões quando dormant | Home.tsx |
| T-HOME-ES-04 | ✅ done | Fix: selectCurrentDivisoes fallback quando userId não bate após re-login | useAppStore.ts |
| T-HOME-ES-05 | ✅ done | Fix: App.tsx re-adota userId correto nas divisões existentes automaticamente | App.tsx |

## Sprint Concluído — Bugfixes Fluxo de Convite (S-INVITE)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-INVITE-B1 | ✅ done | partnerCode instável (Date.now() a cada render) → useRef estável | Onboarding.tsx |
| T-INVITE-B2 | ✅ done | handleShare avançava ao cancelar o share dialog → usa .then() | Onboarding.tsx |
| T-INVITE-B3 | ✅ done | Desktop sem feedback ao "Compartilhar link" → estado shared com Check verde | Onboarding.tsx |
| T-INVITE-B4 | ✅ done | handleFinish gerava partnerCode novo diferente do compartilhado → usa ref | Onboarding.tsx |
| T-INVITE-B5 | ✅ done | Link inválido antes de completar onboarding → pré-salva no Firestore ao chegar no Step5 | Onboarding.tsx |

## Sprint Concluído — UX/UI Polish & Parity (S-POLISH)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-POLISH-01 | ✅ done | Layout Login: constrained content a 1440px enquanto background é full-bleed | Login.tsx |
| T-POLISH-02 | ✅ done | Filtros Essencial: padronização com estilo Fluxo (compacto, inline, accent colors) | DivisaoDetalhe.tsx |
| T-POLISH-03 | ✅ done | SearchBar Essencial: correção de espaçamento grudado | DivisaoDetalhe.tsx |
| T-POLISH-04 | ✅ done | Sidebar Cleanup: remoção de tagline redundante + redimensionamento wordmark (20px, 600) | AppLayout.tsx |
| T-POLISH-05 | ✅ done | Hint Essencial: ajuste de padding/margin hero para aproximar o banner das abas | DivisaoDetalhe.tsx |

## Sprint Atual — Documentação Completa (S-DOC)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-DOC-01 | ✅ done | Criar ARCHITECTURE.md (referenciado no HARNESS mas não existia) | harness/ARCHITECTURE.md |
| T-DOC-02 | ✅ done | Documentar useNavStore — contexto e propósito ausentes | stores/useNavStore.ts |
| T-DOC-03 | ✅ done | Documentar usePWAInstall — sem JSDoc | hooks/usePWAInstall.ts |
| T-DOC-04 | ✅ done | Documentar useAppStore — selectors sem comentários, migrações sem contexto | stores/useAppStore.ts |
| T-DOC-05 | ✅ done | Documentar Dialog/PageHeader — props sem JSDoc | components/ui/ |
| T-DOC-06 | ✅ done | Atualizar DESIGN.md — tokens CSS var não documentados, componentes novos faltando | harness/DESIGN.md |
| T-DOC-07 | ✅ done | Atualizar CONTEXT.md — novos hooks (usePartnerData, useCurrencyInput) e useNavStore ausentes | harness/CONTEXT.md |
| T-DOC-08 | ✅ done | Atualizar SPEC.md — SPEC usa nomenclatura antiga (Caixinhas/Livre), divergente do código atual | harness/SPEC.md |

## Próximas fases

| ID | Prioridade | Descrição |
|----|-----------|-----------|
| T-NEXT-01 | alta | Auth real com Google/email (substituir Anonymous Auth) |
| T-NEXT-02 | alta | Modo Casal real: view compartilhada pós-link bilateral |
| T-NEXT-03 | média | Página de Histórico completo (filtros por mês/divisão) |
| T-NEXT-04 | média | Notificações push (PWA) para vencimentos |
| T-NEXT-05 | baixa | Firebase Storage para imagens de objetivos (requer Blaze plan) |
| T-NEXT-06 | baixa | Lançamento iOS/Android via PWA (manifest + service worker polish) |
| T-NEXT-07 | média | GhostLink deep nav: ao navegar Fluxo→Essencial, scroll automático até "Custos Fixos" + micro highlight azul (pulse 1x) — "você veio daqui" |

## Sprint Atual — Desktop Polish: Casal + ObjetivoDetalhe (S-DESK)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-DESK-01 | ✅ done | Casal: 2-col layout (PatrimonioCard+InviteCard esquerda, Objetivos direita), ObjetivosSection extraída | Casal.tsx |
| T-DESK-02 | ✅ done | ObjetivoDetalhe: 2-col layout (progress+CTA esquerda sticky, Histórico direita), hero 220px | ObjetivoDetalhe.tsx |

## Sprint Atual — Bugfix: Inconsistência de Total nas Divisões (S-BUG)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------| 
| T-BUG-01 | ✅ done | Fix: calcPct e valor exibido no card da Home não filtravam por mês atual — usavam todos os movements de todos os tempos | Home.tsx |
| T-BUG-02 | ✅ done | Design: exibir gasto do mês e valor livre claramente nos cards da Home + hero do DivisaoDetalhe | Home.tsx, DivisaoDetalhe.tsx |
| T-BUG-03 | ✅ done | Fix: rota /relatorios/:id → /divisao/:slug (sem cx-), BottomNav mantém Home ativa | App.tsx, AppLayout.tsx, Home.tsx, DivisaoDetalhe.tsx |
| T-BUG-04 | ✅ done | Fix: % nos cards usava expectedBudget (renda esperada) → trocar por totalIn real da divisão | Home.tsx |
| T-BUG-05 | ✅ done | Modal Entrada em 2 etapas: Renda (distribui %) vs Divisão específica (direto na caixinha, sem dízimo) | LancarEntradaModal.tsx |

## Sprint Pendente — Agendamento de Entradas Futuras (S-ENT)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-ENT-01 | 🔄 doing | Adicionar `status` na interface `Entrada` | types/index.ts |
| T-ENT-02 | ⬜ todo | Lógica pending + action `confirmEntrada` no store | useAppStore.ts |
| T-ENT-03 | ⬜ todo | Hint dinâmico + mensagem de sucesso diferenciada | LancarEntradaModal.tsx |
| T-ENT-04 | ⬜ todo | Entradas pendentes na seção Pendentes do Fluxo + Action Sheet | Fluxo.tsx |
| T-ENT-05 | ⬜ todo | Entradas pendentes em ProximosDias + confirmação | Home.tsx |
| T-ENT-06 | ⬜ todo | Projeção inclui entradas pendentes futuras | useFluxoProjection.ts |
