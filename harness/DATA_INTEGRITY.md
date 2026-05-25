# DATA_INTEGRITY.md — Somus Financial Data Integrity

> **Leia este documento antes de tocar em qualquer função que envolva `balance`, `movements`, `saidasFixas`, ou `saidasVariaveis`.**

---

## O Problema Raiz

O Somus mantém o balance de cada divisão (`cx.balance`) sincronizado manualmente com os seus `cx.movements`. Não há recalculo automático de `balance` a partir dos movements — **o balance é mutado diretamente** em cada ação do store.

Isso significa que **qualquer função que atualiza o balance deve também criar o movement correspondente** (e vice-versa). Se uma das duas partes falhar ou usar o valor errado, os dados ficam inconsistentes para sempre.

---

## Regra #1 — Nunca use `sf.amount` diretamente

### ❌ Errado
```ts
balance: cx.balance - sf.amount         // sf.amount pode ser 0 em faturas variáveis
amount: sf.amount                        // idem
```

### ✅ Correto
```ts
const effectiveAmount = sf.monthlyAmountOverrides?.[yearMonth] ?? sf.amount
balance: cx.balance - effectiveAmount
amount: effectiveAmount
```

### Por quê?
`SaidaFixa.amount` é o valor **base/default**. Para faturas variáveis (ex: Fatura Inter, Plano de Saúde), o valor real do mês é armazenado em `monthlyAmountOverrides[YYYY-MM]`. Se você usa `sf.amount` diretamente e o valor base for `0`, a operação inteira vira um no-op silencioso — o balance não muda, o movement fica com R$0, e o usuário não percebe.

**Função correta para usar:** `getEffectiveAmount(sf, yearMonth)` de `src/lib/calculations.ts`.

### Lugares onde isso foi corrigido:
| Função | Arquivo | Linha | Fix |
|--------|---------|-------|-----|
| `markSaidaFixaPaid` | `useAppStore.ts` | ~330 | Usa `effectiveAmount` |
| `markSaidaFixaUnpaid` | `useAppStore.ts` | ~394 | Usa `existingSv.amount` (fallback cascade) |
| `getMonthSummary` | `calculations.ts` | ~72 | Usa `getEffectiveAmount(sf, target)` |

---

## Regra #2 — Balance e Movement devem ser atualizados juntos

Toda vez que `cx.balance` é modificado, **deve haver um movement correspondente** em `cx.movements` com o mesmo valor (negativo para despesa, positivo para receita).

### Invariante a manter sempre:
```
cx.balance === sum(cx.movements.map(m => m.amount))
```

Se esse invariante quebrar, `fixPhantomBalances` detecta e corrige na próxima sync.

### IDs de movements: padrões obrigatórios
| Origem | Padrão do ID |
|--------|-------------|
| `addEntrada` (distribuível) | `mv-{entradaId}-cx-{divisaoId}` |
| `addEntrada` (direct) | `mv-{entradaId}-direct` |
| `markSaidaFixaPaid` | `mv-fixed-{sfId}-{YYYY-MM}` |
| `addSaidaVariavel` | `mv-sv-{svId}-sv` → CORRETO: `mv-{svId}-sv` |
| `autoConfirmPastPending` | `mv-{svId}-sv` |

**Nunca crie movements com ID arbitrário** (ex: só um timestamp). Isso os torna "órfãos" — `fixPhantomBalances` remove movements positivos com ID puro de timestamp.

---

## Regra #3 — Quando desfazer um pagamento, restaure o valor real

`markSaidaFixaUnpaid` deve restaurar o balance com o **mesmo valor que foi debitado**, não com `sf.amount`.

### Cascata de fallback usada:
```ts
const amountToRestore =
  existingSv?.amount ??                                         // 1. valor da sv (melhor fonte)
  (existingMvAmount ? Math.abs(existingMvAmount) : undefined) ?? // 2. valor do movement
  sf.monthlyAmountOverrides?.[targetMonth] ??                   // 3. override do mês
  sf.amount                                                      // 4. valor base (último recurso)
```

---

## Regra #4 — Editar o valor de um mês já pago deve propagar a mudança

`editSaidaFixaForMonth` não pode simplesmente atualizar `monthlyAmountOverrides` se o mês já foi pago. Precisa também:
1. Atualizar `sv.amount`
2. Atualizar `movement.amount`  
3. Atualizar `cx.balance` com o delta (novo - antigo)

```ts
const amountDiff = newAmount - oldAmount  // positivo = débito extra, negativo = estorno
cx.balance = cx.balance - amountDiff
```

---

## Regra #5 — Guard contra pagamento duplicado

`markSaidaFixaPaid` tem um guard que previne criar dois `sv-fixed-{id}-{YYYY-MM}` para o mesmo mês:

```ts
const svId = `sv-fixed-${id}-${yearMonth}`
if (state.saidasVariaveis.some(sv => sv.id === svId)) return state  // no-op
```

**Não remova este guard.** Ele previne double-deduction quando o usuário clica duas vezes no botão.

---

## Mecanismos de Auto-Correção (Self-Healing)

O `useFirebaseSync.tsx` roda três funções de correção **após cada sync com o Firebase**, antes de `setSyncReady`:

### 1. `autoConfirmPastPending()`
Confirma `saidasVariaveis` com `status: 'pending'` cuja data já passou. Cria o movement e debita o balance.

### 2. `fixPhantomBalances()`
Detecta quando `cx.balance !== sum(cx.movements)` (diff > R$0,50) e:
- Remove movements duplicados (mesmo ID)
- Remove movements órfãos (income com ID puro de timestamp: `^mv-\d{13}$`)
- Ajusta `cx.balance = sum(movements)`

### 3. `fixSaidaFixaPaymentAmounts()`
Detecta `sv-fixed-*` com `sv.amount` diferente de `getEffectiveAmount(sf, yearMonth)` e:
- Corrige `sv.amount`
- Corrige `movement.amount`
- Corrige `cx.balance` com o delta

Após qualquer correção, o estado é salvo **imediatamente** no Firestore via `saveStateToFirestore` — antes do `onSnapshot` poder sobrescrever com dados velhos.

---

## Checklist para Novas Features

Antes de implementar qualquer feature que envolva dinheiro, confirme:

- [ ] Estou usando `getEffectiveAmount(sf, yearMonth)` e não `sf.amount` diretamente?
- [ ] Toda mudança em `cx.balance` tem um `movement` correspondente com mesmo valor?
- [ ] O ID do movement segue o padrão documentado acima?
- [ ] A operação inversa (desfazer) usa o valor real salvo, não recalcula?
- [ ] Há guard contra double-execution?
- [ ] O `status` da `SaidaVariavel` está sendo setado explicitamente (`'realized'` ou `'pending'`)?

---

## Histórico de Bugs Corrigidos

| Data | Bug | Impacto | Fix |
|------|-----|---------|-----|
| 2026-05-21 | Phantom R$1.200 nos balances (entrada distributable sem movement) | Balance inflado | `fixPhantomBalances` |
| 2026-05-21 | Movement órfão R$500 (Parte Aluguel Mãe) | Balance inflado | `fixPhantomBalances` (remove `^mv-\d{13}$`) |
| 2026-05-21 | Aula de bateria duplicada no Essencial | Balance deduziu 2x | `fixPhantomBalances` (dedup) |
| 2026-05-25 | `markSaidaFixaPaid` usava `sf.amount=0` → R$0 debitado | Balance não deduziu pagamento | `effectiveAmount` + `fixSaidaFixaPaymentAmounts` |
| 2026-05-25 | `markSaidaFixaUnpaid` usava `sf.amount=0` → R$0 estornado | Balance não restaurado ao desmarcar | Cascata de fallback via `existingSv.amount` |
| 2026-05-25 | `editSaidaFixaForMonth` não propagava mudança se mês pago | sv/movement/balance inconsistentes | Propagação de delta |
| 2026-05-25 | `getMonthSummary` usava `sf.amount` em totalExpenses | Resumo do mês mostrava valor errado | `getEffectiveAmount(sf, target)` |
