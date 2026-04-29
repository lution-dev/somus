# CONTEXT.md — Somus
> Estado atual do projeto. Atualizado ao final de cada sessão.

**Última atualização:** 2026-04-29
**Status geral:** 🔄 Sprint MVP em andamento (T-01 parcial)

## O Que É
App de planejamento financeiro para casais com renda variável. Mobile-first, dark mode only. Lançamentos incrementais de renda, distribuição automática por caixinhas (método Nati Arcuri adaptado).

## Usuários
- **Lucas Pires** — renda variável (Lidtek salário+lucro, Glide, mentorias), ~R$8.5-9.2k/mês
- **Mírian Bernardo** — renda fixa ~R$2.8-2.9k/mês

## Stack
Vite + React 18 + TypeScript + TailwindCSS + Zustand + Wouter + Framer Motion + PWA

## Paleta
Bg: #0D1B2A · Cards: #1A2D42 · Accent: #3B82F6 · Lucas: azul · Mírian: rosa · Casal: lilás · Font: Inter

## Como Rodar
```bash
npm install && npm run dev
```

## O Que Foi Feito
- PRD v1.0 completo
- Vite scaffoldado (React + TS base)
- Harness v2 conectado à memória global

## O Que Falta
8.5 tasks do Sprint MVP (ver BACKLOG.md) — T-01 parcial, T-02 a T-09 pendentes

## Decisões
| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-04-29 | Mock data + localStorage, sem Supabase no MVP | Validar UX primeiro |
| 2026-04-29 | PWA em vez de React Native | Faster to ship |
| 2026-04-29 | Dark mode only | Identidade visual |

## Bloqueios
Nenhum.
