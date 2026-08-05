# Changelog — Somus

## [2026-08-05] Git — push direto em main
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-AD-17: Reforçar regra commit+push em `main` sem PR nos docs de agente ✅
**Commits:** (este)
**Sensores:** docs-only (sem mudança de TS/build)

## [2026-07-21] Fluxo — ordem por data de pagamento
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-AD-16: Lançamentos do mês ordenados por data de pagamento (Hoje → Ontem → …) ✅
**Commits:** cb4a2ac
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-07-21] Entrada recorrente — modal ao confirmar recebimento
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-AD-15: Entrada recorrente no Fluxo abre ConfirmPaymentModal (valor+data), parity com saída fixa ✅
**Commits:** a77fffd
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅
