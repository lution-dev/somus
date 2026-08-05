# Plano — Importação de Extrato Bancário (S-EXTRATO)

> Status: **decisões fechadas · 1 ponto aberto** · Atualizado: 2026-08-05  
> Tipo: SPRINT (feature complexa) · Pré-Open Finance  
> Piloto: **99Pay** (conta corrente / carteira) · Sem fatura de cartão

## Problema

Hoje cada compra/pagamento exige lançamento manual no momento. Sem Open Finance, a alternativa prática é **reconciliação mensal via extrato**: o usuário vive o mês (e pode lançar no dia a dia se quiser), e no início do mês seguinte sobe o extrato do mês anterior. O Somus identifica o que já foi lançado e oferece mini-formulário só para o que falta.

## Decisões confirmadas (2026-08-05)

| # | Pergunta | Decisão |
|---|----------|--------|
| 1 | Banco piloto | **99Pay** |
| 2 | Formatos v1 | **OFX/OFC + CSV** (sem PDF). Banner e tela de upload deixam isso explícito |
| 3 | Entrada vs saída | Vem do sinal do extrato (+ crédito / − débito). **Entrada** → pergunta renda ou divisão. **Saída** → pergunta qual divisão |
| 4 | Dismiss do banner | ⏳ **ainda aberto** — ver pergunta simples abaixo |
| 5 | Escopo conta | **Só corrente / carteira 99Pay**. Sem fatura de cartão |
| 6 | Lançamento diário | **Permanece**. Extrato é atalho para facilitar, os dois coexistem |

### Ponto aberto — X do banner (em português simples)

Se a pessoa **fechar o banner sem enviar** o extrato:

- **Opção A:** some e **só volta no mês seguinte** (se ainda não tiver enviado o do mês que falta, ou o novo)  
- **Opção B:** some por **alguns dias** e **volta no mesmo mês** lembrando de novo  
- **Opção C:** **não tem X** — só some depois de enviar/reconciliar  

Qual prefere?

## Visão do produto (v1)

```
Início do mês (se extrato do mês anterior ainda não reconciliado)
        │
        ▼
  Banner Home (tom Somus + formatos explícitos)
        │  CTA → /extrato
        ▼
  Upload OFX/OFC ou CSV (99Pay · conta corrente)
        │
        ▼
  Tela de conciliação
  ├── ✅ Já na base (matched) → badge, sem editar
  ├── ⬜ Crédito unmatched → mini-form: renda OU divisão + valor/nome/data
  └── ⬜ Débito unmatched  → mini-form: qual divisão + valor/nome/data
        │  confirmar
        ▼
  Grava via store (DATA_INTEGRITY) → marca mês reconciliado → banner some
```

## Escopo

### Dentro (v1)
- Lembrete na Home a partir do dia 1 se o mês anterior não foi reconciliado
- Upload **CSV** e **OFX/OFC** — copy deixa claro; rejeita outros formatos com mensagem calma
- Parser → transações normalizadas do mês alvo (piloto 99Pay)
- Matching com lançamentos já existentes
- Tela de revisão: matched vs unmatched
- Mini-form unmatched:
  - crédito → tipo: **renda (distributable)** ou **direto numa divisão**
  - débito → **qual divisão**
  - campos comuns: valor, nome, data (default do extrato)
- Persistência de `statementReconciliations` (metadados + hashes; **sem** arquivo bruto)
- Lançamento diário permanece disponível em paralelo

### Fora (v1)
- E-mail de lembrete (T-EXTRATO-FUT-01)
- Open Finance
- PDF
- Fatura de cartão
- Modo casal / extrato do parceiro na mesma tela

## Formatos de arquivo

| Formato | v1 | Nota |
|--------|----|------|
| **CSV** | ✅ P0 | Provável formato principal da 99Pay — **precisa de amostra real** para o parser |
| **OFX / OFC** | ✅ P0 | Aceito se a 99Pay (ou conversão) gerar; fixtures genéricas + ajuste com amostra |
| **PDF** | ❌ | Fora do v1 |

> Ação pré-código: usuário envia 1 extrato real 99Pay (CSV e/ou OFX), **anonimizado**, para fixtures. Sem isso o parser 99Pay é chute.

## Copy do banner (tom Brand Book)

Regras (`somus_complete_brand_book_master.md` §7–8):
- tom **calm / intelligent / human** — sem urgência, sem hype fintech, sem “você precisa”
- clareza antes de complexidade
- organização sem pressão

**Proposta de copy (Home):**

| Elemento | Texto |
|----------|-------|
| Título | Organizar o mês passado |
| Corpo | Quando quiser, envie o extrato da 99Pay de {mês} — em **OFX ou CSV**. A Somus reconhece o que já está na sua base e ajuda a completar o resto. |
| CTA | Enviar extrato |
| Hint formatos | Aceitos: OFX, OFC ou CSV · Conta corrente |

**Evitar:** “Atenção!”, “Pendente!”, “Você ainda não enviou”, countdowns, vermelho de erro.

**Tela de upload — microcopy:**
- Headline: `Trazer o extrato pra base`
- Apoio: `Arquivo da 99Pay em OFX ou CSV. Só conta corrente — sem fatura de cartão.`
- Erro formato: `Esse arquivo ainda não encaixa. Use OFX, OFC ou CSV.`

## Classificação entrada / saída + mini-form

1. Parser define sinal: `amount > 0` → **entrada**; `amount < 0` → **saída**
2. Matching tenta achar lançamento existente (sem sobrescrever)
3. Se **matched** → só badge “Já na sua base”
4. Se **unmatched entrada** → pergunta:
   - Renda (distribui nas divisões por %) **ou**
   - Direto numa divisão
   - + valor, nome, data (default extrato)
5. Se **unmatched saída** → pergunta:
   - Qual divisão
   - + valor, nome, data (default extrato)
6. Opção **Ignorar** (ex.: transferência entre contas)

## Modelo de dados (proposto)

```ts
interface BankTransaction {
  id: string              // hash estável: date|amount|description
  date: string            // YYYY-MM-DD (do extrato)
  amount: number          // +crédito / -débito
  description: string
  rawType?: 'credit' | 'debit'
}

type MatchStatus = 'matched' | 'unmatched' | 'ignored'

interface StatementMatch {
  transactionId: string
  status: MatchStatus
  linkedEntity?: {
    kind: 'entrada' | 'entradaFixa' | 'saidaVariavel' | 'saidaFixa'
    id: string
    label: string
  }
}

interface StatementReconciliation {
  id: string
  userId: string
  yearMonth: string           // mês do extrato, ex: '2026-07'
  uploadedAt: string
  sourceFormat: 'ofx' | 'csv'
  sourceBank: '99pay'         // piloto; extensível depois
  accountKind: 'checking'     // v1 só corrente
  transactionCount: number
  matchedCount: number
  importedCount: number
  transactionHashes: string[]
}

// AppState +=
statementReconciliations: StatementReconciliation[]
```

Bump de persist: **v16** (migração no-op: array vazio).

## Algoritmo de matching

Ordem (primeira vitória):

1. Saída fixa paga no mês — `|amount|` ≈ effectiveAmount (±R$0,50) + fuzzy nome  
2. Entrada fixa recebida no mês — mesma lógica  
3. Entrada avulsa realized — amount + date (±2 dias) + fuzzy `sourceName`  
4. Saída variável realized — amount + date (±2 dias) + fuzzy `description`

Match = **somente leitura** na UI. Não altera o lançamento existente.

## Integridade financeira

Ler `DATA_INTEGRITY.md` antes de gravar.

- Débito unmatched → `addSaidaVariavel` (divisão escolhida)
- Crédito unmatched renda → `addEntrada` distributable
- Crédito unmatched divisão → `addEntrada` direct
- IDs de movements nos padrões existentes
- Action batch `importStatementTransactions` como único ponto de auditoria

## Arquitetura de arquivos (proposta)

```
src/
  types/index.ts
  lib/statement/
    parseOfx.ts
    parseCsv.ts          # priorizar layout 99Pay com fixture
    matchTransactions.ts
    suggestName.ts
  stores/useAppStore.ts
  pages/
    ExtratoUpload.tsx
    ExtratoRevisao.tsx
  components/features/
    ExtratoReminderBanner.tsx   # copy Brand Book + formatos
    ExtratoMatchRow.tsx
    ExtratoImportForm.tsx       # branch entrada vs saída
  App.tsx
```

## Fases / sprints

### Sprint A — Fundação + lembrete
| ID | Task |
|----|------|
| T-EXTRATO-01 | Tipos + `statementReconciliations` + migrate v16 |
| T-EXTRATO-02 | Helpers `previousYM()` / `hasReconciliation(ym)` |
| T-EXTRATO-03 | `ExtratoReminderBanner` — copy Brand Book + OFX/CSV explícitos |
| T-EXTRATO-04 | Rotas stub `/extrato` |

### Sprint B — Parsers (99Pay)
| ID | Task |
|----|------|
| T-EXTRATO-05 | `parseOfx` + fixture genérica |
| T-EXTRATO-06 | `parseCsv` calibrado com **amostra 99Pay** |
| T-EXTRATO-07 | Upload UI (só OFX/CSV; rejeita resto com copy calma) → revisão |

### Sprint C — Matching + import
| ID | Task |
|----|------|
| T-EXTRATO-08 | `matchTransactions` puro |
| T-EXTRATO-09 | UI revisão matched / unmatched / ignore |
| T-EXTRATO-10 | Mini-form: entrada→renda|divisão · saída→divisão |
| T-EXTRATO-11 | `importStatementTransactions` (DATA_INTEGRITY) |
| T-EXTRATO-12 | Persistir reconciliation → banner some |
| T-EXTRATO-13 | SPEC/DESIGN/CONTEXT + changelog |

### Futuro
| ID | Task |
|----|------|
| T-EXTRATO-FUT-01 | E-mail lembrete |
| T-EXTRATO-FUT-02 | PDF (se 99Pay só oferecer PDF no app) |
| T-EXTRATO-FUT-03 | Open Finance |
| T-EXTRATO-FUT-04 | Vincular unmatched → saída fixa |

## Dependências

```
01 → 02 → 03
01 → 04
[amostra 99Pay] → 06
05 + 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13
```

## Riscos

| Risco | Mitigação |
|-------|-----------|
| 99Pay exporta principalmente CSV/PDF, não OFX | CSV P0; OFX aceito se existir; PDF = futuro se necessário |
| Sem amostra real | Bloqueia T-EXTRATO-06 — pedir extrato anonimizado |
| Falso positivo no match | Threshold estrito + unlink na UI |
| Arquivo sensível | Não persistir blob; só hashes |
| Transferências internas | Ação Ignorar |

## Critérios de aceite (v1)

1. Agosto sem extrato de julho → banner Home com tom Somus + “OFX ou CSV” + 99Pay  
2. Upload OFX/CSV → lista créditos/débitos da conta corrente  
3. Já lançado → “Já na sua base”, sem sobrescrever  
4. Crédito novo → pergunta renda ou divisão; grava Entrada correta  
5. Débito novo → pergunta divisão; grava SaidaVariavel  
6. Após confirmar → reconciliation salva; banner some; sobrevive reload  
7. Lançamento diário (modais atuais) continua funcionando  
8. Sensores `tsc` + `build` verdes  
