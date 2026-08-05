# Plano — Importação de Extrato Bancário (S-EXTRATO)

> Status: **aguardando aprovação** · Criado: 2026-08-05  
> Tipo: SPRINT (feature complexa) · Pré-Open Finance

## Problema

Hoje cada compra/pagamento exige lançamento manual no momento. Sem Open Finance, a alternativa prática é **reconciliação mensal via extrato**: o usuário vive o mês, e no início do mês seguinte sobe o extrato do mês anterior. O Somus identifica o que já foi lançado e oferece mini-formulário só para o que falta.

## Visão do produto (v1)

```
Início do mês (ou mid-mês se ainda não subiu)
        │
        ▼
  Banner na Home: "Envie o extrato de Julho"
        │  CTA → upload
        ▼
  Upload (CSV | OFX/OFC | PDF*)
        │
        ▼
  Tela de conciliação
  ├── ✅ Já lançado (matched) → só badge, sem editar
  └── ⬜ Pendente → mini-form: valor · nome · divisão · data(auto)
        │  confirmar seleção
        ▼
  Cria entradas / saídas via store existente (DATA_INTEGRITY)
        │
        ▼
  Marca mês como reconciliado → banner some
```

\* PDF: ver fase e riscos abaixo.

## Escopo

### Dentro (v1)
- Lembrete na Home a partir do dia 1 do mês (e continua mid-mês se não enviou)
- Upload de **CSV** e **OFX/OFC** (formato padrão de extrato)
- Parser → lista normalizada de transações do mês alvo
- Matching com lançamentos já existentes
- Tela de revisão com matched vs unmatched
- Mini-form para unmatched → grava via `addEntrada` / `addSaidaVariavel` / `markSaidaFixaPaid` / `markEntradaFixaReceived`
- Persistência de `statementReconciliations` (mês reconciliado + hashes dos matches)

### Fora (v1) — backlog futuro
- E-mail de lembrete (T-EXTRATO-FUT-01)
- Open Finance / sync automático
- Parse robusto de PDF multi-banco (piloto opcional só Inter se amostra disponível)
- Upload de fatura de cartão como tipo separado (RN04 já trata fatura como lançamento único)
- Modo casal: extrato do parceiro na mesma tela

## Formatos de arquivo

| Formato | Prioridade | Por quê |
|--------|------------|---------|
| **OFX / OFC** | P0 | Estruturado (SGML/XML), padrão bancos BR, parsing confiável no client |
| **CSV** | P0 | Export comum; parser com detecção de colunas (data, valor, descrição) |
| **PDF** | P2 / piloto | Layout varia por banco; OCR/heurística frágil; só depois de amostra real |

> O “terceiro tipo” que o usuário citou = **OFX/OFC** (exportação “para outros sistemas” / Money / Conta Azul), não um formato proprietário.

## Modelo de dados (proposto)

```ts
/** Transação normalizada após parse (não persiste o arquivo bruto) */
interface BankTransaction {
  id: string              // hash estável: date|amount|description
  date: string            // YYYY-MM-DD (do extrato)
  amount: number          // +crédito / -débito
  description: string     // memo/payee do banco
  rawType?: 'credit' | 'debit'
}

type MatchStatus = 'matched' | 'unmatched' | 'ignored'

interface StatementMatch {
  transactionId: string
  status: MatchStatus
  /** referência ao lançamento existente, se matched */
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
  sourceFormat: 'ofx' | 'csv' | 'pdf'
  transactionCount: number
  matchedCount: number
  importedCount: number       // unmatched confirmados nesta sessão
  /** opcional: só metadados / hashes — NÃO guardar PDF/CSV completo no Firestore */
  transactionHashes: string[]
}

// AppState +=
statementReconciliations: StatementReconciliation[]
```

Bump de persist: **v16** (migração no-op: array vazio).

## Algoritmo de matching

Ordem de tentativa (primeira vitória ganha):

1. **Saída fixa paga no mês** — `|amount|` ≈ `effectiveAmount` (±R$0,50) + data no mês + fuzzy no nome da conta  
2. **Entrada fixa recebida no mês** — mesma lógica  
3. **Entrada avulsa** (`status !== 'pending'`) — amount + date (±2 dias) + fuzzy `sourceName`  
4. **Saída variável realizada** — amount + date (±2 dias) + fuzzy `description`

Regras:
- Match = **somente leitura** na UI (“Já adicionado”). Não altera valor/nome/divisão do lançamento existente.
- Sem match → aparece no bloco “Para lançar” com mini-form pré-preenchido:
  - **data** = data do extrato (somente leitura ou editável com default do extrato)
  - **valor** = `|amount|` editável
  - **nome** = descrição do banco (editável / limpeza sugerida)
  - **divisão** = default Essencial para débitos; para créditos perguntar renda (distributable) vs divisão direta
- Usuário pode marcar linha como **Ignorar** (transferência entre contas, estorno, etc.)

## UX — Home (lembrete)

Condição para exibir banner (acima ou no slot dos progressive cards, prioridade alta se já passou o onboarding básico):

```
hoje.dia >= 1
AND mêsAnterior sem StatementReconciliation do userId
AND (opcional) dismiss temporário “lembrar depois” só até D+3, depois volta
```

Copy sugerida:
- Título: `Extrato de {mêsAnterior} ainda não chegou`
- Corpo: `Envie o OFX/CSV do banco para conciliar o que já lançou e completar o que faltou.`
- CTA: `Enviar extrato`

Padrão visual: glass card existente (`ProgressiveOnboardingBanner`), accent warning (`#F59E0B`) — não é erro crítico.

## UX — Tela de conciliação (`/extrato/revisao`)

1. Header: mês + contadores (`N já lançados · M pendentes`)
2. Seção **Já no Somus** (colapsável): lista com badge verde, nome Somus + nome banco, sem form
3. Seção **Para lançar**: cada item = mini-form (valor, nome, divisão, data)
4. Footer sticky: `Confirmar M lançamentos` → batch no store → toast → volta Home

## Integridade financeira

Obrigatório ler `DATA_INTEGRITY.md` antes de implementar a gravação.

- Débito unmatched → `addSaidaVariavel` (ou `markSaidaFixaPaid` se o user escolher vincular a uma fixa)
- Crédito unmatched → `addEntrada` (distributable ou direct)
- IDs de movements seguem padrões existentes
- Nunca mutar `balance` fora das actions do store
- Batch: uma action `importStatementTransactions(payload)` no store que chama as actions internas em sequência (ou loop tipado) para um único ponto de auditoria

## Arquitetura de arquivos (proposta)

```
src/
  types/index.ts                         # + BankTransaction, StatementReconciliation…
  lib/
    statement/
      parseOfx.ts                        # OFX/OFC → BankTransaction[]
      parseCsv.ts                        # CSV → BankTransaction[]
      matchTransactions.ts               # matching puro (testável)
      suggestName.ts                     # limpeza de memo bancário
  stores/useAppStore.ts                  # reconciliations + importStatement*
  pages/
    ExtratoUpload.tsx                    # upload + parse
    ExtratoRevisao.tsx                   # tela de matching
  components/features/
    ExtratoReminderBanner.tsx            # Home
    ExtratoMatchRow.tsx                  # matched / unmatched row
    ExtratoImportForm.tsx                # mini-form
  App.tsx                                # rotas /extrato, /extrato/revisao
```

Parsers = funções puras em `lib/` (sem React). UI só orquestra.

## Fases / sprints

### Sprint A — Fundação + lembrete (sem parse ainda)
| ID | Task |
|----|------|
| T-EXTRATO-01 | Tipos + `statementReconciliations` no AppState + migrate v16 |
| T-EXTRATO-02 | Helpers: `previousYM()`, `hasReconciliation(ym)` |
| T-EXTRATO-03 | `ExtratoReminderBanner` na Home |
| T-EXTRATO-04 | Rotas stub `/extrato` (upload placeholder) |

### Sprint B — Parsers
| ID | Task |
|----|------|
| T-EXTRATO-05 | `parseOfx` + fixtures de teste manuais (Inter/Nubank se possível) |
| T-EXTRATO-06 | `parseCsv` com detecção de colunas BR (`;` / `,` / dd/mm/yyyy) |
| T-EXTRATO-07 | Página upload: file picker → parse → navega revisão com state |

### Sprint C — Matching + revisão + import
| ID | Task |
|----|------|
| T-EXTRATO-08 | `matchTransactions` puro |
| T-EXTRATO-09 | UI revisão (matched / unmatched / ignore) |
| T-EXTRATO-10 | Mini-form + validação |
| T-EXTRATO-11 | Action `importStatementTransactions` (respeitar DATA_INTEGRITY) |
| T-EXTRATO-12 | Persistir reconciliation + sumir banner |
| T-EXTRATO-13 | Spec + DESIGN notes + changelog |

### Futuro (não neste plano de execução)
| ID | Task |
|----|------|
| T-EXTRATO-FUT-01 | E-mail lembrete (Cloud Function / Resend) |
| T-EXTRATO-FUT-02 | PDF parser piloto (banco escolhido) |
| T-EXTRATO-FUT-03 | Open Finance |
| T-EXTRATO-FUT-04 | Sugestão “vincular a saída fixa X” no unmatched |

## Dependências

```
01 → 02 → 03
01 → 04
05 + 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13
FUT-* depois de 12 estável
```

## Riscos

| Risco | Mitigação |
|-------|-----------|
| PDF ilegível / layout muda | OFX/CSV primeiro; PDF só com amostra |
| Falso positivo no match | Threshold estrito + UI “já adicionado” revisável (unlink → unmatched) |
| Arquivo sensível no Firestore | Não persistir arquivo; só hashes + metadados |
| Extrato com transferências internas | Ação Ignorar |
| Free tier Firestore | Metadados leves; sem blob |

## Critérios de aceite (v1)

1. Em agosto sem extrato de julho → banner na Home  
2. Upload OFX ou CSV de julho → tela lista créditos/débitos  
3. Salário já lançado aparece como “Já adicionado”, sem form editável de sobrescrita  
4. Débito não lançado → mini-form com data do extrato; confirmar cria `SaidaVariavel` e atualiza balance/movement  
5. Após confirmar → reconciliation salva; banner some; reload mantém estado (Firestore)  
6. Sensores: `npx tsc --noEmit` + `npm run build` verdes  

## Ambiguidades a confirmar antes de codar

1. **Banco principal do piloto** — Inter? Nubank? Itaú? (define fixtures OFX/CSV)  
2. **PDF no v1?** — Recomendação: **não**; só OFX+CSV  
3. **Créditos** — sempre como “renda distributable” ou perguntar sempre?  
4. **Dismiss do banner** — pode adiar até quando?  
5. **Cartão vs conta corrente** — v1 só conta corrente/pagamento?  
6. **Escopo do “esperar o mês”** — o app continua permitindo lançamento diário (recomendado: **sim**, extrato é complemento)  

## Decisão recomendada (default se aprovado sem respostas)

- Pilot formats: **OFX + CSV**  
- Lançamento diário **permanece**  
- Crédito unmatched: pergunta Renda vs Divisão (igual `LancarEntradaModal` 2 etapas)  
- Débito unmatched: default Essencial, user troca divisão  
- Banner: dismiss “depois” esconde 3 dias, depois reaparece até reconciliar  
