# Changelog — Somus

## [2026-08-05] S-EXTRATO — PDF 99Pay via pdfjs-dist
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-14: Parser PDF (pdfjs-dist) + layout 99Pay calibrado ✅
**Notas:** 99Pay só exporta PDF com texto; OFX/CSV continuam. Push direto em `main`.
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-05] S-EXTRATO — conciliação mensal via extrato
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-01…12: tipos v17, banner Home, parsers OFX/CSV, matching, upload/revisão, import via store ✅
- T-EXTRATO-13: docs harness ✅
**Notas:** Parsers genéricos BR. Banner dismiss 3 dias. Copy sem travessão.
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-05] Git — push direto em main
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-AD-17: Reforçar regra commit+push em `main` sem PR nos docs de agente ✅
**Commits:** f941972
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
