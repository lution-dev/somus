# CONTEXT.md — Somus
> Estado atual do projeto. Atualizado ao final de cada sessão.

**Última atualização:** 2026-05-01
**Status geral:** ✅ Sprint MVP + UI/UX Audit + Firebase Integration

## O Que É
App de planejamento financeiro para casais com renda variável. Mobile-first, dark mode only. Resolve o problema de apps que exigem renda fixa no início do mês — o Somus permite lançar entradas incrementais conforme caem e distribui automaticamente por caixinhas (método Nati Arcuri adaptado).

## Usuários
- **Lucas Pires** — renda variável (Lidtek salário+lucro, Glide, mentorias), ~R$8.5-9.2k/mês
- **Mírian Bernardo** — renda fixa ~R$2.8-2.9k/mês

## Stack
Vite + React 18 + TypeScript + TailwindCSS + Zustand + Wouter + Framer Motion + PWA + **Firebase** (Firestore + Auth)

## Paleta
- Bg: #0D1B2A (azul escuro profundo)
- Cards: #1A2D42
- Accent: #3B82F6 (azul elétrico)
- Lucas: #3B82F6 (azul) | Mírian: #EC4899 (rosa) | Casal: #8B5CF6 (lilás)
- Font: Inter

## Como Rodar
```bash
npm install && npm run dev
```

## O Que Foi Feito
- PRD v1.0 completo (10 features, 13 telas, 8 regras de negócio)
- Sprint MVP completo: 9 tasks, mock data, sem backend
- **T-S01-01** ✅ Scaffold Vite + React + TS + PWA
- **T-S01-02** ✅ Design System Dark Mode (Button, Card, Badge, Input, Dialog, BottomNav, ProgressBar, ContextToggle)
- **T-S01-03** ✅ Mock Data Layer (tipos, Zustand + localStorage, cálculos)
- **T-S01-04** ✅ App Shell + Routing (4 tabs, safe area, Framer Motion transitions)
- **T-S01-05** ✅ Onboarding Wizard (6 telas animadas)
- **T-S01-06** ✅ Divisões (refatoração de /caixinhas para /divisoes, histórico, alertas, RN05)
- **T-S01-07** ✅ Saídas Fixas (checklist, débito auto, alertas de vencimento)
- **T-S01-08** ✅ Lançar Entrada CORE (distribuição automática, editável, RN01/02/08)
- **T-S01-09** ✅ Dashboard Home (balance card, timeline 7 dias, grid divisoes, toggle)
- **T-S01-10** — Redesign Fluxo 10/10 (progress bar, desktop 2-column, tab badges, urgency)
- **T-AD-21** — Fluxo Redesign (lista unificada, monthly instances, overrides de valor, filtros)
- **T-AD-22** — Fluxo/Home: Refinamento de ícones e pendências (Glow, status icons, section labels)
- **T-AD-23** — Home: Exibição de pendências atrasadas (Atrasado há Xd) e expansão da janela para 15 dias
- **T-AD-24** — Fix: Cálculo de dias para atrasados (correção do salto de mês em getDaysUntil)
- **T-AD-25** — Fluxo: Recurso 'Pular este mês' (ignora custo sem deletar template)
- **T-AD-26** — Fluxo: Mês por extenso na Navbar (long format)
- **T-AD-27** — Fluxo: Padronização de espaçamentos (Choice/Busca/Lista)

## Arquitetura de Arquivos
```
src/
  types/index.ts          # Tipos TypeScript
  lib/
    mockData.ts           # Mock data Lucas + Mírian
    calculations.ts       # Funções de negócio + formatação
  stores/
    useAppStore.ts        # Zustand store (persist localStorage + Firestore sync)
  components/
    ui/                   # Design system (8 componentes)
    layout/AppLayout.tsx  # Shell com BottomNav
    features/
      LancarEntradaModal.tsx  # Modal core
  hooks/
    useAuth.ts            # Firebase Anonymous Auth
    useFirebaseSync.tsx   # Bidirectional Zustand ↔ Firestore sync
    useImageUpload.ts     # Client-side image compression → base64
    useIsMobile.ts        # Responsive breakpoint hook
    usePWAInstall.ts      # PWA install prompt
  pages/
    Onboarding.tsx
    Home.tsx
    Fluxo.tsx
    Caixinhas.tsx
    CaixinhaDetalhe.tsx
    Casal.tsx
    ObjetivoDetalhe.tsx   # Cover image upload para objetivos
  App.tsx                 # Routing com guard onboarding + FirebaseSyncProvider
```

## Regras de Negócio Implementadas
- RN01: Distribuição proporcional às caixinhas ativas
- RN02: Mesma fonte pode ser lançada múltiplas vezes no mês
- RN05: Reserva atingiu meta → sugerir redirecionar para Objetivos
- RN08: Dízimo sempre primeiro no preview de distribuição

## O Que Falta (Próximas fases)
- Auth real com email/senha (substituir anonymous)
- Modo Casal real (parceiro conectado via código de convite)
- Página de Histórico completo
- Notificações push (PWA)
- Gráficos de evolução (recharts)
- Lançamento iOS/Android via PWA
- Firebase Storage (quando migrar para Blaze plan)

## Decisões
| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-04-29 | Mock data + localStorage, sem Supabase no MVP | Validar UX primeiro |
| 2026-04-29 | PWA em vez de React Native | Faster to ship, migra depois |
| 2026-04-29 | Dark mode only | Identidade visual do produto |
| 2026-04-29 | Método Nati Arcuri como base das caixinhas | Referência conhecida do casal |
| 2026-04-29 | useShallow do Zustand v5 em todos seletores array | Evitar infinite loop com useSyncExternalStore |
| 2026-05-01 | Firebase (Firestore + Auth) em vez de Supabase | Limite de projetos free no Supabase atingido |
| 2026-05-01 | Base64 para imagens em vez de Firebase Storage | Storage requer Blaze plan (cartão) |
| 2026-05-01 | Auth anônimo em vez de email/senha | UX mais simples pro MVP, migra depois |
| 2026-05-01 | Single-document per user no Firestore | Volume pequeno, minimiza reads no free tier |
| 2026-05-08 | Instâncias Mensais de Custos Fixos (Overrides) | Permitir edição de valor pontual no Fluxo sem alterar o template base do custo |
| 2026-05-08 | Carry-Over Financeiro Histórico (v15) | Rastrear pagamentos por mês (Record) para garantir que contas atrasadas acumulem no fluxo até serem pagas. |
| 2026-05-08 | Refinamento de UI/UX Fluxo | Substituição de confirmações nativas por ConfirmDialog, correção de duplicados e ajuste de ordenação (mais recentes primeiro). |

## Bloqueios
Nenhum.
