# ARCHITECTURE.md — Somus
> Padrões técnicos e decisões de arquitetura. Leia antes de modificar código estrutural.

---

## Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | Vite + React 18 | Build rápido, HMR, PWA support |
| Linguagem | TypeScript | Segurança de tipos no domínio financeiro |
| Estado | Zustand + persist | Simples, sem boilerplate Redux; persist via localStorage |
| Roteamento | Wouter | Leve, sem overhead do React Router |
| Animações | Framer Motion | AnimatePresence para transições de página/modal |
| Auth + DB | Firebase (Firestore + Google Auth) | Free tier generoso; Google Auth elimina senha no MVP |
| Imagens | Base64 inline | Firebase Storage requer Blaze plan (cartão) |
| Deploy | Vercel | CI/CD automático via GitHub |

---

## Estrutura de Diretórios

```
src/
  types/
    index.ts              # TODOS os tipos TypeScript do domínio. Fonte única da verdade.
  lib/
    calculations.ts       # Funções puras de negócio: formatação, distribuição, datas
    divisoes.ts           # Metadados estáticos: DIVISAO_ORDER, DIVISAO_INFO (Nati Arcuri)
    icons.tsx             # DIVISAO_ICONS: cor + ícone por divisão
    firebase.ts           # Inicialização Firebase (app, auth, db) — apenas config
    firestoreService.ts   # CRUD Firestore: save/load/subscribe; migração caixinhas→divisoes
    migrationService.ts   # Estratégia de merge local↔Firestore; debounce; flush
    haptic.ts             # Vibration API — feedback tátil (selection 10ms / impact [15,30,10])
    utils.ts              # Utilitários genéricos: formatCurrency, formatDate, generateId, clamp
  stores/
    useAppStore.ts        # Zustand store principal (persist localStorage + versioning)
    useNavStore.ts        # Zustand store leve para cross-component nav state (sem persist)
  hooks/
    useAuth.ts            # Firebase Google Auth (popup only)
    useFirebaseSync.tsx   # Provider: migration + Zustand→Firestore + Firestore→Zustand
    useFluxoProjection.ts # Projeção diária: histórico reconstruído + futuro projetado
    usePartnerData.ts     # Real-time listener do doc Firestore do parceiro
    useImageUpload.ts     # Compressão JPEG→base64 (max 800px, 500KB)
    useBalanceHidden.ts   # Toggle bank-style para ocultar saldos (localStorage persist)
    useCurrencyInput.ts   # Formatação estilo calculadora: centavos→"1.234,56"
    useIsMobile.ts        # useSyncExternalStore com matchMedia — sem flicker
    usePWAInstall.ts      # beforeinstallprompt API
  components/
    ui/                   # Design system atoms: Button, Card, Badge, Dialog, etc.
    layout/
      AppLayout.tsx       # Shell com BottomNav (mobile) + Sidebar (desktop)
    features/             # Modais e cards de domínio (LancarEntrada, ObjetivoCard, etc.)
    shared/               # Componentes compartilhados entre features
  pages/                  # Uma tela = um arquivo. Sem lógica de negócio — usa hooks e store.
  styles/                 # CSS global: tokens, reset, utilitários
  App.tsx                 # Routing (Wouter) + guards + backfill de divisões + FirebaseSyncProvider
  main.tsx                # Entry point: ReactDOM.createRoot
```

---

## Estado Global — useAppStore

**Estratégia:** Zustand com `persist` middleware (localStorage key: `somus-state`, versão atual: **15**).

### Estrutura do AppState

```ts
{
  isOnboarded: boolean       // guard que redireciona para Onboarding
  currentUser: User | null   // dados do usuário autenticado
  partner: User | null       // parceiro vinculado (sem dados financeiros aqui)
  viewContext: 'personal' | 'couple'
  incomeSources: IncomeSource[]
  entradas: Entrada[]        // recebimentos (realized + pending)
  divisoes: Divisao[]        // as 5 divisões (Essencial, Objetivos, etc.)
  saidasFixas: SaidaFixa[]   // custos mensais recorrentes
  saidasVariaveis: SaidaVariavel[]  // despesas avulsas e fixas pagas
  objetivos: Objetivo[]      // metas financeiras
}
```

### Seletores Exportados

| Seletor | Filtra por |
|---|---|
| `selectCurrentDivisoes` | `userId` do usuário atual (com fallback para evitar tela vazia) |
| `selectCurrentIncomeSources` | `userId` (ou todos no modo couple) |
| `selectCurrentEntradas` | `userId` (ou todos no modo couple) |
| `selectCurrentSaidasFixas` | `userId` (ou todos no modo couple) |
| `selectExpectedMonthlyIncome` | Soma `expectedAmount` das fontes do usuário atual |

> ⚠️ **Regra:** Sempre usar `useShallow` do Zustand ao selecionar arrays, para evitar re-renders infinitos com `useSyncExternalStore`.

### Versionamento / Migrações

| Versão | Mudança |
|---|---|
| < 6 | Reset completo (dados mock) |
| < 7 | Backfill: cria divisões padrão se `isOnboarded` mas sem divisões |
| < 8 | Remove cx-livre, transfere saldo para cx-reserva |
| < 9 | `viewContext`: 'lucas'/'mirian' → 'personal'; remove campo `context` do User |
| < 10 | Renomeia `caixinhas` → `divisoes`, `caixinhaId` → `divisaoId` em todas entidades |
| < 11 | Re-executa v10 (cobrir usuários com migração parcial) |
| < 12 | Encurta `partnerCode`: 'SOMUS-XXXXXXXX' → 4 chars |
| < 13 | `monthlyAmountOverrides` em SaidaFixa — no-op (campo opcional) |
| < 15 | `paidDates[]` → `payments Record<string,string>` + `startDate` |

---

## Sincronização Firebase

```
useFirebaseSync (Provider)
  ├── Step 1: Migration (uma vez por login)
  │     migrationService.migrateToFirestore()
  │       ├── DEV flag: somus-skip-remote (sessionStorage, single-use)
  │       ├── SECURITY: descarta localStorage se userId ≠ uid do Firebase
  │       ├── Case 1: sem doc remoto → push local (first-time user)
  │       └── Case 2: ambos existem → vence o de maior "peso" (mais dados)
  │
  ├── Step 2: Zustand → Firestore (debounce 1.5s)
  │     useAppStore.subscribe() → debouncedSaveToFirestore()
  │     Guard: isRemoteUpdate.current previne loop de escrita
  │
  ├── Step 3: Firestore → Zustand (real-time)
  │     subscribeToState() → JSON diff → setState se realmente diferente
  │     Ignora snapshots hasPendingWrites=true (próprias escritas ecoando)
  │
  └── Step 4: Flush no hide/unload
        visibilitychange:hidden + beforeunload → flushPendingSave()
        (fire-and-forget — não pode await em visibilitychange)
```

---

## Roteamento

```
/                  → Login (sem auth) / redirect /home (com auth)
/home              → Home (dashboard principal)
/fluxo             → Fluxo (saídas fixas + agendadas)
/divisoes/:id      → DivisaoDetalhe
/relatorios        → Relatórios
/casal             → Casal (patrimônio + objetivos compartilhados)
/objetivos/:id     → ObjetivoDetalhe
/convite/:code     → InviteAccept (link de parceiro)
/perfil            → Perfil
/extrato           → ExtratoUpload (S-EXTRATO — planejado)
/extrato/revisao   → ExtratoRevisao (S-EXTRATO — planejado)
```

**Guard de onboarding:** `App.tsx` redireciona para `/` se `!isOnboarded` em qualquer rota protegida.

> **Planejado:** S-EXTRATO — ver `harness/plans/extrato-bancario.md`.

---

## Padrões de Código

### Componentes
- **Páginas** = lógica de orquestração; delegam dados a hooks/store.
- **Componentes UI** = dumb, apenas props. Sem acesso ao store.
- **Modais** = renderizados via `createPortal(content, document.body)` com `zIndex: 9000/9001`.
- **FAB** = somente mobile (`{isMobile && ...}`), posição `fixed bottom`.

### Hooks
- Hooks customizados seguem o padrão `use[NomeDoConceito]`.
- Hooks que leem arrays do Zustand **sempre** envolvem com `useShallow`.
- Hooks com subscriptions retornam unsubscribe no cleanup do `useEffect`.

### IDs
- Entradas: `e-${Date.now()}`
- Saídas Fixas: `sf-${Date.now()}-${i}`
- Saídas Variáveis: `sv-${Date.now()}`
- Movimentos: `mv-${Date.now()}-${divisaoId}`
- Saída Fixa paga (como variável): `sv-fixed-${sfId}-${yearMonth}`
- Objetivo: `obj-${Date.now()}`
- Movement de objetivo: `om-${Date.now()}`

> Geração de IDs usa `Date.now()` (não `crypto.randomUUID()`) para manter compatibilidade com dados já existentes nos docs Firestore de produção. Não alterar sem migração.

### Nomenclatura Histórica
- **caixinhas** → **divisoes** (renomeado em v10). O código usa `divisoes` em todo lugar novo. A migração em `firestoreService.ts` e `useAppStore.ts` converte automaticamente dados antigos.
- **cx-livre** → removido em v8 (saldo transferido para cx-reserva).

---

## Segurança

1. **Nunca** expor Firebase config além de `src/lib/firebase.ts` (variáveis de ambiente via `.env`).
2. **SECURITY check** em `migrationService.ts`: se `localStorage.userId ≠ Firebase.uid`, descarta state local.
3. **SECURITY guard** em `useFirebaseSync.tsx`: bloqueia escrita para Firestore se `state.userId ≠ uid`.
4. **Sign out** em `useAuth.ts`: remove `somus-state` e `somus-firebase-migrated` do localStorage **antes** de `firebaseSignOut()`.
5. **Dados do parceiro** (`usePartnerData`): apenas divisoes, entradas e objetivos `isCouple=true` são lidos. Dados pessoais do parceiro ficam privados.

---

## PWA

- **Manifest:** `public/manifest.json` (ícones, `display: standalone`, `theme_color`)
- **Service Worker:** gerado pelo Vite PWA plugin
- **Install prompt:** `usePWAInstall` intercepta `beforeinstallprompt` e expõe `install()`
- **Safe area:** `env(safe-area-inset-*)` em header, BottomNav e modais para suporte ao notch/Dynamic Island do iPhone

---

## CSS / Design Tokens

Tokens definidos em `src/styles/` e documentados em `harness/DESIGN.md`.

Variáveis principais:
```css
--color-bg-primary: #0D1B2A
--color-bg-secondary: #1A2D42
--color-bg-tertiary: #243B55
--color-accent-primary: #3B82F6
--color-accent-couple: #8B5CF6
--color-success: #10B981
--color-warning: #F59E0B
--color-danger: #EF4444
--color-text-primary: #F1F5F9
--color-text-secondary: #94A3B8
--color-text-tertiary: #64748B
--color-border: rgba(255,255,255,0.08)
--radius-card: 16px
--space-md: 16px
--font-display: 'Inter', sans-serif
```

> **Regra de ouro:** Nunca usar valores hardcoded de cor ou espaçamento. Sempre via tokens CSS.

---

## Proibido

- Alterar IDs de chaves do Zustand sem criar migração `version++`.
- Salvar no Firestore fora do `FirebaseSyncProvider` (exceto `firestoreService.ts` diretamente chamado pela migração).
- Criar componentes que acessem o store dentro de `components/ui/` — esses são puros.
- Usar `gradient absoluto atrás do header` — ver §4.10 do DESIGN.md.
- Usar `useSelector` sem `useShallow` para arrays.
