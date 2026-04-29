# HARNESS.md — Somus
> Leia este arquivo INTEIRO antes de qualquer ação. Ele é sua única instrução obrigatória.

## Arquivos (ordem de leitura)
1. **Este arquivo** (HARNESS.md) — regras, protocolo, sensores
2. **CONTEXT.md** — estado atual do projeto (LEIA SEMPRE)
3. **BACKLOG.md** — tasks ativas (LEIA SEMPRE)
4. ARCHITECTURE.md — padrões técnicos (leia quando for modificar código)
5. SPEC.md — spec do produto (leia quando precisar de regra de negócio)
6. MEMORY_CONTEXT.md — memória global Lidtek (leia quando disponível)
7. archive/ — histórico (NUNCA leia automaticamente)

---

## Protocolo de Ingestão

Classifique o input do usuário automaticamente:

### QUICK — 1-2 itens, bug fix, ajuste pontual
Registre como T-AD-XX no BACKLOG.md → implemente → rode sensor → commit.

### BATCH — 3+ itens, lista de ajustes
ANTES DE QUALQUER CÓDIGO, gere o inventário para aprovação:
```
📋 INVENTÁRIO — N tasks identificadas:
1. T-XX-01: [nome] → [arquivo afetado]
2. T-XX-02: [nome] → [arquivo afetado]
...
⚠️ AMBIGUIDADES: [listar o que não ficou claro]
Confirma? Faltou algo?
```
Aguarde confirmação → registre no BACKLOG.md → implemente 1 por vez com commit atômico.

### SPRINT — transcript de reunião, feature complexa, 10+ itens
1. Gere INVENTÁRIO completo (como BATCH, mais detalhado)
2. Identifique dependências entre tasks
3. Proponha ordem de execução e agrupe em sprint(s)
4. Aguarde aprovação
5. Registre no BACKLOG.md → execute na ordem, commit por task
6. Gere mapa de cobertura ao final (task → status → commit)

---

## Regras Anti-Esquecimento

1. **Conte:** "Este pedido tem N tasks: T-01, T-02, ..., T-N"
2. **1 task = 1 commit:** Finalize T-01 antes de abrir T-02
3. **Check final:** Ao terminar, volte ao inventário e confirme cada item
4. **Justifique omissões:** Se item do input não virou task, explique por quê

---

## Sensores

Rode após CADA task (não ao final do sprint):

| Mudança | Comando |
|---|---|
| Qualquer .ts/.tsx | `npx tsc --noEmit` |
| Fim de task | `npm run build` |
| Mudança visual | Desktop + mobile — sem overflow, sem corte |

Se sensor falha → corrija → rode → só então marque.

---

## Memória Global Lidtek

### Início de sessão:
**Windows:**
```powershell
node "c:\Users\Lucas\OneDrive\Documentos\Projetos\lidtek-memoria\hooks\entrada.js" "[task]" "Somus" | Out-File harness\MEMORY_CONTEXT.md -Encoding utf8
```
**Linux/Mac:**
```bash
node "c:\Users\Lucas\OneDrive\Documentos\Projetos\lidtek-memoria/hooks/entrada.js" "[task]" "Somus" > harness/MEMORY_CONTEXT.md
```

### Fim de sessão:
**Windows:**
```powershell
node "c:\Users\Lucas\OneDrive\Documentos\Projetos\lidtek-memoria\hooks\saida.js" "Somus" "[resumo]"
```
**Linux/Mac:**
```bash
node "c:\Users\Lucas\OneDrive\Documentos\Projetos\lidtek-memoria/hooks/saida.js" "Somus" "[resumo]"
```

---

## Changelog

Ao final de cada batch/sprint, append em `archive/changelog.md`:
```markdown
## [YYYY-MM-DD] [Título]
**Autor:** [humano ou IA]
**Tasks:**
- T-XX-01: [descrição] ✅
**Commits:** [hashes]
**Sensores:** [resultados]
```

---

## Commit

Formato: `tipo(T-XX-NN): descrição`
Exemplos: `fix(T-AD-01): corrige filtro`, `feat(T-S12-03): painel financeiro`

---

## Proibido

- Implementar sem registrar a task
- "Esqueci" não existe — inventário aprovado é obrigatório
- Declarar "feito" sem sensor
- Over-engineering
- Alterar código funcional sem pedido explícito
