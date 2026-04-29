# CONTEXT.md — Somus
> Estado atual do projeto. Atualizado ao final de cada sessão.

**Última atualização:** 2026-04-29
**Status geral:** ✅ Sprint MVP completo — 9/9 tasks concluídas

## O Que É
App de planejamento financeiro para casais com renda variável. Mobile-first, dark mode only. Resolve o problema de apps que exigem renda fixa no início do mês — o Somus permite lançar entradas incrementais conforme caem e distribui automaticamente por caixinhas (método Nati Arcuri adaptado).

## Usuários
- **Lucas Pires** — renda variável (Lidtek salário+lucro, Glide, mentorias), ~R$8.5-9.2k/mês
- **Mírian Bernardo** — renda fixa ~R$2.8-2.9k/mês

## Stack
Vite + React 18 + TypeScript + TailwindCSS + Zustand + Wouter + Framer Motion + PWA

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
- **T-S01-06** ✅ Caixinhas (lista + detalhe com histórico, alertas, RN05)
- **T-S01-07** ✅ Saídas Fixas (checklist, débito auto, alertas de vencimento)
- **T-S01-08** ✅ Lançar Entrada CORE (distribuição automática, editável, RN01/02/08)
- **T-S01-09** ✅ Dashboard Home (balance card, timeline 7 dias, grid caixinhas, toggle)

## Arquitetura de Arquivos
```
src/
  types/index.ts          # Tipos TypeScript
  lib/
    mockData.ts           # Mock data Lucas + Mírian
    calculations.ts       # Funções de negócio + formatação
  stores/
    useAppStore.ts        # Zustand store (persist localStorage)
  components/
    ui/                   # Design system (8 componentes)
    layout/AppLayout.tsx  # Shell com BottomNav
    features/
      LancarEntradaModal.tsx  # Modal core
  pages/
    Onboarding.tsx
    Home.tsx
    Fluxo.tsx
    Caixinhas.tsx
    CaixinhaDetalhe.tsx
    Casal.tsx
  App.tsx                 # Routing com guard onboarding
```

## Regras de Negócio Implementadas
- RN01: Distribuição proporcional às caixinhas ativas
- RN02: Mesma fonte pode ser lançada múltiplas vezes no mês
- RN05: Reserva atingiu meta → sugerir redirecionar para Objetivos
- RN08: Dízimo sempre primeiro no preview de distribuição

## O Que Falta (Próximas fases)
- Backend Supabase (autenticação real, sync multi-device)
- Página de Histórico completo
- Notificações push (PWA)
- Gráficos de evolução (recharts)
- Modo Casal real (parceiro conectado)
- Lançamento iOS/Android via PWA

## Decisões
| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-04-29 | Mock data + localStorage, sem Supabase no MVP | Validar UX primeiro |
| 2026-04-29 | PWA em vez de React Native | Faster to ship, migra depois |
| 2026-04-29 | Dark mode only | Identidade visual do produto |
| 2026-04-29 | Método Nati Arcuri como base das caixinhas | Referência conhecida do casal |
| 2026-04-29 | useShallow do Zustand v5 em todos seletores array | Evitar infinite loop com useSyncExternalStore |

## Bloqueios
Nenhum.
