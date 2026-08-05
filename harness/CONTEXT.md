# CONTEXT.md — Somus
> Estado atual do projeto. Atualizado ao final de cada sessão.

**Última atualização:** 2026-08-05
**Status geral:** ✅ Plano S-EXTRATO aprovado (falta amostra 99Pay). Importação OFX/CSV + matching + lembrete Home

## O Que É
App de planejamento financeiro para casais com renda variável. Mobile-first, dark mode only. Resolve o problema de apps que exigem renda fixa no início do mês — o Somus permite lançar entradas incrementais conforme caem e distribui automaticamente por divisões (método Nati Arcuri adaptado).

## Usuários
- **Lucas Pires** — renda variável (Lidtek salário+lucro, Glide, mentorias), ~R$8.5-9.2k/mês
- **Mírian Bernardo** — renda fixa ~R$2.8-2.9k/mês

## Stack
Vite + React 18 + TypeScript + Zustand + Wouter + Framer Motion + qrcode.react + PWA + **Firebase** (Firestore + Google Auth)

## Paleta
- Bg: #0D1B2A (azul escuro profundo) → Onboarding: #081120
- Cards: #1A2D42
- Accent: #3B82F6 (azul) | Lucas: #3B82F6 | Mírian: #EC4899 | Casal: #8B5CF6 (lilás)
- Font: Inter

## Como Rodar
```bash
npm install && npm run dev
```

## Arquitetura de Arquivos
```
src/
  types/index.ts              # Tipos TypeScript — fonte única da verdade
  lib/
    calculations.ts           # Funções de negócio + formatação (puras)
    divisoes.ts               # Metadados: DIVISAO_ORDER, DIVISAO_INFO, taglines
    icons.tsx                 # DIVISAO_ICONS com cor por divisão
    firebase.ts               # Firebase config (app, auth, db)
    firestoreService.ts       # saveStateToFirestore / loadStateFromFirestore / subscribeToState
    migrationService.ts       # Merge lógico local ↔ Firestore (SECURITY: discard stale user)
    haptic.ts                 # Vibration API: selection (10ms) / impact ([15,30,10]ms)
    utils.ts                  # Utilitários genéricos: formatCurrency, formatDate, generateId, clamp
  stores/
    useAppStore.ts            # Zustand store principal (persist localStorage v15 + Firestore sync)
                              # selectCurrentDivisoes: fallback userId para evitar tela vazia
    useNavStore.ts            # Zustand store leve SEM persist — estado de navegação cross-component
                              # GhostLink: fluxoFutureOpen + fluxoFuturePulse
  components/
    ui/                       # Design system (Button, Card, Badge, Dialog, BottomNav, ProgressBar...)
    layout/AppLayout.tsx      # Shell com BottomNav (mobile) + Sidebar (desktop)
    features/
      LancarEntradaModal.tsx  # Modal core de entrada
      ConfirmPaymentModal.tsx # Modal de confirmação (valor+data) — saídas E entradas fixas
      FluxoChart.tsx          # Gráfico Recharts de projeção
  hooks/
    useAuth.ts                # Firebase Google Auth (popup only — redirect bloqueado por 3rd-party cookies)
    useFirebaseSync.tsx       # Provider: migration + Zustand→Firestore (debounce 1.5s) + Firestore→Zustand
    useFluxoProjection.ts     # Projeção diária: histórico reconstruído + saldo projetado fim do mês
    usePartnerData.ts         # Real-time listener do doc Firestore do parceiro
                              # Retorna: divisoes, entradas, balance, objetivos isCouple=true apenas
                              # Backfill de avatar do parceiro se ausente no momento do link
    useImageUpload.ts         # Compressão JPEG→base64 (max 800px, 75% qual, 500KB)
    useIsMobile.ts            # useSyncExternalStore + matchMedia (<768px) — sem flicker
    usePWAInstall.ts          # beforeinstallprompt API para instalar o app
    useBalanceHidden.ts       # Toggle banco-style para ocultar saldos (localStorage + cross-tab sync)
    useCurrencyInput.ts       # Formatação estilo calculadora: dígitos→centavos→"1.234,56"
                              # Props: initialCents, displayValue, numericValue, handleChange, reset, setValue
  pages/
    Onboarding.tsx            # Wizard 5 steps + orchestrador + dissolve cinematic
    Home.tsx                  # Dashboard com Empty State Estruturado (dormant/ativo)
    Fluxo.tsx                 # Saídas Fixas + agendamento de variáveis + Entradas Fixas (modal ao confirmar)
    DivisaoDetalhe.tsx        # Detalhe de divisão + movimentações
    Relatorios.tsx            # Gráficos e histórico
    Casal.tsx                 # Modo casal + gerenciamento de parceiro
    InviteAccept.tsx          # Aceitação de convite via link /convite/:code
    Perfil.tsx                # Perfil do usuário
  App.tsx                     # Routing + guard onboarding + backfill divisões + userId re-adopt
```

## Fluxo de Autenticação / Dados
1. Login Google → `useAuth` expõe `uid`
2. `migrationService.ts` faz merge local ↔ Firestore (SECURITY: descarta estado local se `userId` diferente)
3. App.tsx monitora `isOnboarded` e `divisoesLen`:
   - Se `divisoesLen === 0`: cria divisões padrão com o `uid` correto
   - Se `divisoes.userId !== uid`: re-adota o uid correto silenciosamente
4. `selectCurrentDivisoes`: fallback — se nenhuma divisão bate com o userId atual, retorna todas (evita tela vazia pós re-login)

## Fluxo de Convite de Parceiro
1. Onboarding Step5 monta → `partnerCodeRef` gera código 4 chars estável (UMA vez por sessão)
2. Ao chegar no Step5: `useEffect` pré-salva `{ currentUser: { partnerCode } }` no Firestore (merge)
3. Step5B: usuário compartilha link `https://somus.vercel.app/convite/{code}` ou QR
   - `navigator.share`: avança para 5C só após `.then()` (confirmação do SO)
   - Desktop (sem share): copia, mostra "✓ Copiado!" verde 1.8s, avança
4. `handleFinish`: usa `partnerCodeRef.current` (MESMO código do link) para salvar no user object
5. `InviteAccept.tsx`: busca `where('currentUser.partnerCode', '==', code)` no Firestore → link bilateral

## Empty State Estruturado (Calm Technology)
- Divisões **sempre visíveis** mesmo com saldo zero
- **Estado dormant**: `opacity: 0.65`, `filter: saturate(0.55)`, barras zeradas, taglines filosóficos em itálico, badge "aguardando"
- **Taglines por divisão**: Essencial="O que sustenta sua rotina.", Objetivos="O que você quer construir.", Liberdade="Seu futuro com mais tranquilidade.", Dízimo="Generosidade como hábito.", Educação="O fermento da vida financeira."
- **Despertar**: ao adicionar primeira entrada, animação `opacity→1`, `saturate(1)`, barras crescem com glow

## Onboarding v2 — Estrutura
| Step | Tela | Detalhe |
|------|------|---------|
| 0 | Welcome | Atmospheric glow + breathing logo + headline + CTA |
| 1 | Seu Perfil | Header contextual, avatar Google auto-preenche, troca por câmera |
| 2 | Objetivo | 6 cards 2×3 com inner light e lift ao selecionar |
| 3 | Método Somus | 5 divisões animadas sequencialmente com barras e % |
| 4 | Convite | 3 sub-telas: 5A preview, 5B share+QR, 5C confirmação |

- Progress dots azuis (steps 1-5) + sub-dots roxos (sub-telas do Step5)
- Botões de "← Voltar" corretos em cada tela (5A→Step4, 5B→5A, QR→5B, 5C sem voltar)
- Dissolve cinematic ao finalizar (blur 16px → fade → navigate /home)

## Regras de Negócio Implementadas
- RN01: Distribuição proporcional às divisões ativas
- RN02: Mesma fonte pode ser lançada múltiplas vezes no mês
- RN05: Reserva atingiu meta → sugerir redirecionar para Objetivos
- RN08: Dízimo sempre primeiro no preview de distribuição
- RN09: Despesas variáveis com data futura não abatem saldo imediatamente (Agendamento)

## Decisões
| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-04-29 | PWA em vez de React Native | Faster to ship, migra depois |
| 2026-04-29 | Dark mode only | Identidade visual do produto |
| 2026-04-29 | Método Nati Arcuri como base das divisões | Referência conhecida do casal |
| 2026-04-29 | useShallow do Zustand v5 em todos seletores array | Evitar infinite loop com useSyncExternalStore |
| 2026-05-01 | Firebase (Firestore + Auth) em vez de Supabase | Limite de projetos free no Supabase atingido |
| 2026-05-01 | Base64 para imagens em vez de Firebase Storage | Storage requer Blaze plan (cartão) |
| 2026-05-01 | Single-document per user no Firestore | Volume pequeno, minimiza reads no free tier |
| 2026-05-08 | Instâncias Mensais de Custos Fixos (Overrides) | Permitir edição de valor pontual no Fluxo sem alterar o template base |
| 2026-05-08 | Carry-Over Financeiro Histórico | Rastrear pagamentos por mês para contas atrasadas acumularem no fluxo |
| 2026-05-08 | FluxoChart & Visão Projetada | Gráfico de área para visualização de tendência de saldo |
| 2026-05-08 | Variáveis Agendadas (Realized/Pending) | Despesas futuras sem impacto imediato no saldo, confirmação manual |
| 2026-05-12 | partnerCode via useRef (não Date.now() a cada render) | Garantir que QR, link e Firestore tenham exatamente o mesmo código |
| 2026-05-12 | Pré-salvar partnerCode no Firestore ao entrar no Step5 | Link funciona antes do host completar o onboarding |
| 2026-05-12 | selectCurrentDivisoes com fallback de userId | Divisões nunca ficam invisíveis após re-login com uid diferente |
| 2026-05-12 | Empty State Estruturado (Calm Technology) | Eliminar sensação de "produto não iniciado"; método Somus sempre visível |
| 2026-05-21 | `fixPhantomBalances` no ciclo de sync | Balance inflado por entradas sem movement correspondente + duplicatas; corrige e persiste no Firestore imediatamente |
| 2026-05-25 | `markSaidaFixaPaid` usa `effectiveAmount` | `sf.amount` pode ser 0 em faturas variáveis; usar `monthlyAmountOverrides ?? sf.amount` é obrigatório |
| 2026-05-25 | `markSaidaFixaUnpaid` usa cascata de fallback | Restaurar balance com o valor real do sv existente, não com `sf.amount` |
| 2026-05-25 | `editSaidaFixaForMonth` propaga delta quando mês pago | Editar valor de mês já pago deve atualizar sv + movement + balance com o delta |
| 2026-05-25 | `fixSaidaFixaPaymentAmounts` no ciclo de sync | Detecta sv-fixed com amount errado e corrige sv + movement + balance antes do Firestore sobrescrever |
| 2026-05-25 | `DATA_INTEGRITY.md` como documento permanente | Regras, invariantes, IDs de movements, checklist para novas features — leitura obrigatória antes de mexer em qualquer função financeira |
| 2026-07-14 | `fixEntradasMovements` antes de `fixPhantomBalances` | Recriar/corrigir histórico de Entradas realizadas antes de reconciliar `balance = sum(movements)`, evitando perda de saldo conciliado |
| 2026-07-21 | EntradaFixa confirma via ConfirmPaymentModal | Parity com SaidaFixa: botão Confirmar e Action Sheet abrem modal de valor+data; `markEntradaFixaReceived` já aceitava overrideAmount |
| 2026-07-21 | Lançamentos do mês ordenados por data de pagamento desc | `dayGroups.sort` + sort de pagos via `getDayKey` (não `dueDay`) — Hoje acima de Ontem; saldo do DayDivider depende dessa ordem |
| 2026-08-05 | Conciliação mensal via extrato (pré-Open Finance) | Piloto 99Pay corrente; OFX+CSV; banner tom Brand Book sem travessão; dismiss 3 dias; entrada/saída pelo sinal; mini-form renda\|divisão / divisão; lançamento diário permanece. |

## Bloqueios
Nenhum.

## Em planejamento
- **S-EXTRATO** — Conciliação mensal 99Pay (OFX/CSV), banner Home (tom Brand Book, sem travessão, dismiss 3 dias), matching + mini-form. Decisões fechadas. Precisa amostra CSV/OFX 99Pay. Plano: [`harness/plans/extrato-bancario.md`](./plans/extrato-bancario.md).

## Leitura Obrigatória
- [harness/DATA_INTEGRITY.md](./DATA_INTEGRITY.md) — antes de mexer em qualquer função que toque em `balance`, `movements`, `saidasFixas` ou `saidasVariaveis`.
- [harness/plans/extrato-bancario.md](./plans/extrato-bancario.md) — antes de implementar S-EXTRATO.
- [somus_complete_brand_book_master.md](../somus_complete_brand_book_master.md) — tom de voz do banner/upload (calm, sem urgência).
