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

## Ad-hoc — UI/UX Fixes (pós-MVP)

#### T-AD-18: Dev server — Port 1619 already in use
**Tipo:** DX / tooling
**Root cause:** `strictPort: true` + processo Vite residual (ex.: sessão anterior / agent) ocupa 1619 e `npm run dev` falha.
**Critérios:**
- [x] `scripts/free-port.mjs` libera 1619 antes do Vite
- [x] `npm run dev` chama free-port + vite
- [x] `strictPort: false` como fallback
- [x] Sensores + push em `main`
**Status:** ✅ done

#### T-AD-17: Git — commits sempre em main, sem PR
**Tipo:** Processo / regras de agente
**Root cause:** Cloud agents recebem default para criar branch `cursor/*` e abrir PR; o projeto Somus faz deploy Vercel a partir de `main` e o fluxo desejado é push direto.
**Critérios:**
- [x] Reforçar em `CLAUDE.md`, `AGENTS.md`, `harness/HARNESS.md`, `.agents/rules/harness-mode.md`
- [x] Commit + push desta task em `main` (sem PR) como prova do fluxo
**Status:** ✅ done

#### T-AD-16: Fluxo — Lançamentos do mês fora de ordem por data de pagamento
**Tipo:** Bug UX
**Root cause:** `dayGroups` preserva ordem de inserção; o sort de pagos usa `dueDay` em vez da data real (`payments[ym]` / `date`). Resultado: "Ontem" aparece acima de "Hoje". O cálculo de saldo do DayDivider assume ordem desc (mais recente primeiro).
**Critérios:**
- [x] Ordenar `dayGroups` por `dateStr` descendente (Hoje → Ontem → …)
- [x] Sort de itens pagos em `unifiedList` usa data de pagamento (`getDayKey`), não `dueDay`
- [x] Sensores (`npx tsc --noEmit`, `npm run build`)
**Status:** ✅ done

#### T-AD-15: Entrada recorrente no Fluxo — modal de valor+data ao confirmar recebimento
**Tipo:** Bug / parity UX
**Root cause:** Ao marcar recebimento de `EntradaFixa`, o Fluxo chama `markEntradaFixaReceived` direto com a data de hoje, sem abrir `ConfirmPaymentModal`. Saídas recorrentes já abrem o modal para digitar valor e data.
**Critérios:**
- [x] Botão Confirmar em `EntradaFixaItem` abre `ConfirmPaymentModal` (valor editável + data)
- [x] Action Sheet "Confirmar recebimento" também abre o mesmo modal
- [x] Passa `overrideAmount` e data escolhida para `markEntradaFixaReceived`
- [x] Sensores (`npx tsc --noEmit`, `npm run build`)
**Status:** ✅ done

#### T-AD-14: Bug de conciliação de Entradas → movements órfãos/ausentes
**Tipo:** Bug crítico de integridade financeira
**Root cause:** `editEntrada` atualizava `balance` sem atualizar `movements`/`distribution`; `addEntrada` e `confirmEntrada` ainda geravam IDs não rastreáveis em alguns fluxos; `deleteEntrada` removia movements por descrição. Ao rodar `fixPhantomBalances`, o app confiava na soma dos movements e rebaixava o saldo conciliado.
**Critérios:**
- [x] Padronizar IDs de movements de Entradas (`mv-{entradaId}-cx-{slugDaDivisao}` / `mv-{entradaId}-direct`) em add/confirm/edit/delete
- [x] Criar auto-cura idempotente para Entradas realizadas, recomputando distribution quando necessário e recriando/corrigindo movements ausentes
- [x] Rodar auto-cura antes de `fixPhantomBalances` no ciclo de sync
- [x] Atualizar documentação de integridade
- [x] Sensores (`npx tsc --noEmit`, `npm run build`)
**Status:** ✅ done

#### T-AD-13: Loop infinito splash → tela inicial (controllerchange reload)
**Tipo:** Bug crítico
**Root cause:** `controllerchange` listener em App.tsx chama `window.location.reload()`. Com `skipWaiting + clientsClaim` no workbox, o SW novo assume controle imediatamente ao registrar — disparando `controllerchange` no boot. Isso causa reload imediato, que registra o SW novamente, que dispara controllerchange novamente → loop infinito.
**Critérios:**
- [ ] Remover o listener `controllerchange` + `window.location.reload()` do App.tsx — o `skipWaiting + clientsClaim` já garante ativação automática sem reload manual
- [ ] Manter `registration.update()` e `setInterval` apenas para checar novas versões (sem recarregar)
**Status:** 🔄 Em progresso

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

## Sprint Atual — Timezone Fix (S-TZ)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-TZ-01 | 🔄 doing | Substituir `new Date().toISOString()` por `todayBR()`/`currentYM()` em 10 arquivos para corrigir virada de dia às 21h (UTC-3) | ConfirmPaymentModal, LancarDespesaModal, LancarEntradaModal, AddObjetivoModal, LancarObjetivoModal, UsarObjetivoModal, DivisaoDetalhe, Home, ObjetivoDetalhe, Fluxo |

## Sprint Atual — Extrato Bancário / Conciliação Mensal (S-EXTRATO)
> Status: **🔄 multi-banco** · Plano: [`harness/plans/extrato-bancario.md`](./plans/extrato-bancario.md)  
> Público: qualquer banco (99Pay, Inter, Nubank, Itaú, Santander, genérico) · Formatos: **PDF + OFX/CSV**  
> Lib PDF: `pdfjs-dist`. Estratégia: detectar banco → layouts específicos → fallback genérico.

#### T-EXTRATO-23: Remover conciliação do mês (enviar outro extrato)
**Tipo:** Feature
**Root cause:** Depois de confirmar, o mês fica marcado e não há como limpar o estado pra subir outro extrato.
**Critérios:**
- [x] Action `removeStatementReconciliationForMonth` no store
- [x] `addStatementReconciliation` substitui conciliação existente do mesmo mês/usuário
- [x] UI em ExtratoUpload quando mês já organizado: ver resumo + “Remover e enviar outro”
- [x] Limpa dismiss do banner ao remover
- [x] E2E + sensores
**Status:** ✅ done

#### T-EXTRATO-22: Mês com inicial maiúscula no Extrato
**Tipo:** Polish copy
**Critérios:**
- [x] `monthNameLong` retorna "Julho" (não "julho")
- [x] Sensores `tsc` + `build`
**Status:** ✅ done

#### T-EXTRATO-21: Hero da revisão Extrato (desktop)
**Tipo:** Design / UX
**Root cause:** Topo da revisão no desktop era texto solto (breadcrumb + filename longo + h1) — pobre vs hero glass das outras telas.
**Critérios:**
- [x] Hero glass com KPIs (pra lançar / já na base), meta em chips, filename truncado
- [x] Breadcrumb discreto no padrão DivisaoDetalhe
- [x] Mobile hero também mais rico (card glass no gradient)
- [x] Sensores `tsc` + `build`
**Status:** ✅ done

#### T-EXTRATO-20: Polish desktop Extrato — breadcrumb, ícones, chips
**Tipo:** Bug / UX polish
**Root cause:** Voltar estilo mobile no desktop; chips PDF/OFX redundantes com o texto da dropzone; `FileText` com `var(--color-accent-blue-light)` inexistente → ícone vazio.
**Critérios:**
- [x] Desktop/tablet: Breadcrumb (Home → Extrato / Extrato → Revisar)
- [x] Remover chips de formato abaixo da dropzone
- [x] Ícones “Como funciona” visíveis (cor hex válida + token CSS)
- [x] Sensores `tsc` + `build`
**Status:** ✅ done

#### T-EXTRATO-19: UX/UI Extrato — brand + responsive (upload + revisão)
**Tipo:** Design / UX
**Root cause:** Tela de upload (e revisão) esticavam layout mobile no desktop/tablet; sem hero atmosférico, drop zone pobre, footer fixo atravessando sidebar, hierarquia fraca vs Brand Book/DESIGN.
**Critérios:**
- [x] ExtratoUpload: hero seamless, glass dropzone, drag&drop desktop, tipografia calma Brand Book
- [x] Layout distinto mobile / tablet / desktop (PageHeader só mobile; título desktop; coluna focada)
- [x] ExtratoRevisao: mesmo shell responsivo; CTA sticky sem cobrir sidebar; grid 2 col no desktop
- [x] Banner Home alinhado tom calmo (azul, sem urgência âmbar)
- [x] Sensores `tsc` + `build` + `test:extrato`
**Status:** ✅ done

#### T-EXTRATO-18: Unmatched primeiro · matched no fim e nunca relança
**Tipo:** Bug / anti-duplicata UX
**Root cause:** Revisão misturava matched (já na base) com o que falta lançar; risco de relançar o que o match já reconheceu → duplicata.
**Critérios:**
- [x] UI: unmatched (editável) primeiro; matched no final, colapsado, só leitura
- [x] Import payload = só unmatched (`buildImportItemsFromMatches`)
- [x] E2E: matched nunca entra no import; ordem unmatched→matched
- [x] Sensores `test:extrato` + `tsc` + `build`
**Status:** ✅ done

#### T-EXTRATO-17: Suite E2E obrigatória das regras do extrato
**Tipo:** Qualidade
**Critérios:**
- [x] `npm run test:extrato` com vitest (18 casos)
- [x] Cobre: parsers multi-banco, match valor+data com memo genérico, 1↔1, import store, PDF real 99Pay
- [x] Sensor obrigatório no HARNESS/CLAUDE para mudanças S-EXTRATO
**Status:** ✅ done

#### T-EXTRATO-16: Matching por valor+data (memos genéricos)
**Tipo:** Bug / inteligência
**Root cause:** Extrato 99Pay usa `PIX PAGAMENTO` / `PIX RECEBIDO`; lançamentos têm nomes reais. Fuzzy nome bloqueava 100% dos matches.
**Critérios:**
- [x] Match principal = valor + data (±3 dias); nome é bônus
- [x] Memos genéricos (PIX/TED/PAGAM/CRE RCMP) não bloqueiam
- [x] 1 linha do extrato ↔ 1 lançamento; sync sf↔sv-fixed e ef↔e-fixed
- [x] Rendimentos miúdos sugerem Ignorar
- [x] Sensores
**Status:** ✅ done

#### T-EXTRATO-15: Parsers multi-banco (público)
**Tipo:** Feature
**Critérios:**
- [x] Detectar banco pelo texto/header (99Pay, Inter, Nubank, Itaú, Santander, genérico)
- [x] PDF: vários layouts de linha + scoring do melhor parse
- [x] CSV: aliases de colunas dos principais bancos BR + C/D
- [x] OFX: cross-banco; capturar ORG/BANKID como rótulo
- [x] Copy UI: “qualquer banco” + PDF/OFX/CSV
- [x] Fixtures: 99Pay, Inter, Itaú, Nubank, Santander OFX
- [x] Sensores `tsc` + `build`
**Status:** ✅ done

### Sprint A — Fundação + lembrete
| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-EXTRATO-01 | ✅ done | Tipos + AppState + migrate persist v17 + Firestore | types, useAppStore, firestoreService, migrationService |
| T-EXTRATO-02 | ✅ done | Helpers `previousYM()` / `monthNameLong()` | lib/months.ts |
| T-EXTRATO-03 | ✅ done | Banner Home (copy Brand Book sem travessão, PDF/OFX/CSV, dismiss 3 dias) | ExtratoReminderBanner.tsx, Home.tsx |
| T-EXTRATO-04 | ✅ done | Rotas `/extrato` e `/extrato/revisao` | App.tsx, ExtratoUpload.tsx |

### Sprint B — Parsers
| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-EXTRATO-05 | ✅ done | Parser OFX/OFC | lib/statement/parseOfx.ts |
| T-EXTRATO-06 | ✅ done | Parser CSV BR genérico + fixture sample | lib/statement/parseCsv.ts, fixtures/ |
| T-EXTRATO-07 | ✅ done | Upload UI → parse → revisão | ExtratoUpload.tsx |
| T-EXTRATO-14 | ✅ done | Parser PDF via pdfjs-dist + layout 99Pay | parsePdf.ts, parseStatementText.ts |

### Sprint C — Matching + import
| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-EXTRATO-08 | ✅ done | Matching puro | lib/statement/matchTransactions.ts |
| T-EXTRATO-09 | ✅ done | Tela revisão matched / unmatched / ignore | ExtratoRevisao.tsx |
| T-EXTRATO-10 | ✅ done | Mini-form: crédito→renda\|divisão · débito→divisão | ExtratoRevisao.tsx |
| T-EXTRATO-11 | ✅ done | Action `importStatementTransactions` | useAppStore.ts |
| T-EXTRATO-12 | ✅ done | Persistir reconciliation → banner some | useAppStore + ExtratoRevisao |
| T-EXTRATO-13 | ✅ done | Atualizar SPEC/DESIGN/CONTEXT + changelog | harness/ |

### Futuro (fora do v1)
| ID | Prioridade | Descrição |
|----|-----------|-----------|
| T-EXTRATO-FUT-01 | média | E-mail lembrete início do mês |
| T-EXTRATO-FUT-02 | baixa | Parser PDF (se 99Pay só oferecer PDF) |
| T-EXTRATO-FUT-03 | baixa | Open Finance |
| T-EXTRATO-FUT-04 | baixa | Sugestão vincular unmatched → saída fixa |

**Dependências:** 01→02→03; 01→04; [amostra 99Pay]→06; 05+06→07→08→09→10→11→12→13

**Decisões fechadas:** 99Pay · OFX+CSV · entrada/saída pelo sinal do extrato · pergunta renda|divisão / divisão · só corrente · lançamento diário permanece · banner dismiss 3 dias e volta · copy sem travessão  

**Bloqueio suave:** amostra real CSV/OFX 99Pay (anonimizada) para T-EXTRATO-06

---

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

## Sprint Atual — Campo de Valor nos Modais de Confirmação (S-CONFIRM)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-AD-01 | 🔄 doing | Exibir (e permitir editar) valor no modal de confirmar pagamento de SaidaFixa em todos os call sites | ConfirmPaymentModal.tsx, useAppStore.ts, Fluxo.tsx, Home.tsx, DivisaoDetalhe.tsx |

## Sprint Atual — Storytelling P3 (S-STORY3)

| ID | Status | Descrição | Arquivo |
|----|--------|-----------|---------|
| T-STORY3-01 | 🔄 doing | Momentos educacionais: card dismissível em cx-educacao, cx-reserva, cx-dizimo | DivisaoDetalhe.tsx |
| T-STORY3-02 | ⬜ todo | Copy narrativo nas telas de sucesso: LancarDespesa (por divisão) + LancarEntrada | LancarDespesaModal.tsx, LancarEntradaModal.tsx |
