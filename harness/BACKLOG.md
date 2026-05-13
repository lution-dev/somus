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

## Próximas fases

| ID | Prioridade | Descrição |
|----|-----------|-----------|
| T-NEXT-01 | alta | Auth real com Google/email (substituir Anonymous Auth) |
| T-NEXT-02 | alta | Modo Casal real: view compartilhada pós-link bilateral |
| T-NEXT-03 | média | Página de Histórico completo (filtros por mês/divisão) |
| T-NEXT-04 | média | Notificações push (PWA) para vencimentos |
| T-NEXT-05 | baixa | Firebase Storage para imagens de objetivos (requer Blaze plan) |
| T-NEXT-06 | baixa | Lançamento iOS/Android via PWA (manifest + service worker polish) |
