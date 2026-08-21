# Changelog — Somus

## [2026-08-21] Segurança — remove Google API Key do source
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-AD-19: Firebase config só via `VITE_FIREBASE_*`; scripts usam `load-firebase-env.mjs` ✅
**Pendências humanas:** rotacionar key no Google Cloud + setar env no Vercel `somus`
**Sensores:** `./node_modules/.bin/tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-06] S-EXTRATO — remover conciliação / enviar outro
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-23: `removeStatementReconciliationForMonth` + UI “Remover e enviar outro” no upload ✅
**Sensores:** `npm run test:extrato` ✅ (22) · `tsc` ✅ · `build` ✅

## [2026-08-06] S-EXTRATO — hero glass na revisão
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-21: topo da revisão com hero glass + KPIs (padrão Divisão) ✅
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-06] S-EXTRATO — polish desktop (breadcrumb / ícones / chips)
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-20: Breadcrumb desktop; remove chips redundantes; fix ícone quebrado (`--color-accent-blue-light`) ✅
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-05] S-EXTRATO — UX brand + responsive (upload/revisão)
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-19: ExtratoUpload + ExtratoRevisao + banner alinhados ao Brand Book/DESIGN (hero, glass, desktop ≠ mobile) ✅
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅ · `npm run test:extrato` ✅ (20)

## [2026-08-05] DX — free-port no npm run dev
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-AD-18: `scripts/free-port.mjs` + `strictPort: false` — evita Port 1619 already in use ✅
**Commits:** 8e08284
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-05] S-EXTRATO — unmatched first / matched nunca relança
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-18: revisão puxa só o que não bate; matched no fim (colapsado, só leitura); import anti-duplicata ✅
**Commits:** (este)
**Sensores:** `npm run test:extrato` ✅ (20) · `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-05] S-EXTRATO — suite E2E das regras
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-17: vitest `npm run test:extrato` (18 casos, PDF real incluso) ✅
**Sensores:** `npm run test:extrato` ✅ · `npx tsc --noEmit` ✅ · `npm run build` ✅

## [2026-08-05] S-EXTRATO — parsers multi-banco (público)
**Autor:** IA (Cloud Agent)
**Tasks:**
- T-EXTRATO-15: detectar banco + layouts PDF/CSV/OFX (99Pay, Inter, Nubank, Itaú, Santander, genérico) ✅
**Sensores:** `npx tsc --noEmit` ✅ · `npm run build` ✅

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
