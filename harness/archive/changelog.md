# Changelog — Somus

## [2026-08-05] S-EXTRATO — conciliação mensal via extrato
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-01…12: tipos v17, banner Home, parsers OFX/CSV, matching, upload/revisão, import via store ✅
- T-EXTRATO-13: docs harness ✅
**Notas:** Parsers genéricos BR (export 99Pay ainda em verificação). Banner dismiss 3 dias. Copy sem travessão.
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

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
