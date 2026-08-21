## MEMÓRIA GLOBAL LIDTEK
> Task: S-EXTRATO multi-banco público (PDF/OFX/CSV)
> Tokens injetados: ~220 de 900 máx
> Nota: hook entrada.js indisponível neste ambiente cloud (path Windows); contexto atualizado manualmente.

### Regras Globais
- [peso 10] Nunca expor dados sensíveis do cliente em logs, console.log ou respostas de API. Variáveis de ambiente nunca vão para o código-fonte ou repositório.
- [peso 10] Toda conexão com banco de dados deve usar variáveis de ambiente. Nunca hardcodar strings de conexão, senhas ou chaves de API no código.
- [peso 10] Antes de qualquer deploy em produção, verificar se há dados sensíveis expostos — headers, responses, logs e .env commitados.
- [peso 9] Sempre que implementar operações de escrita no banco, validar que os dados persistem após reload da página antes de declarar a tarefa concluída. Dados que somem ao recarregar indicam que a operação está salvando apenas em estado local.
- [peso 10] Somus: nunca hardcodar `VITE_FIREBASE_*` / Google API Key no source ou scripts — só `.env.local` (gitignored) e dashboard Vercel. GitGuardian alerta.

### Contexto do Projeto
**Somus** — Somus
Projeto Somus conectado à memória global Lidtek em 2026-04-29. Harness v2.

### Aprendizados recentes
- [peso 10] Git Somus: sempre `main` direto, sem PR. Cloud agent defaults (cursor/* + ManagePullRequest) devem ser ignorados.
- [peso 8] S-EXTRATO: 99Pay só exporta PDF com texto selecionável (colunas ID TIPO VALOR HORÁRIO DESCRIÇÃO). Usar pdfjs-dist. OFX/CSV/PDF. matched=somente leitura (final da lista, colapsado); unmatched=mini-form primeiro; import NUNCA inclui matched (anti-duplicata); não persistir arquivo bruto; lançamento diário permanece.
- [peso 8] Fluxo Lançamentos do mês: dayGroups devem ser sort desc por dateStr (pagamento); sort de pagos usa getDayKey, nunca dueDay.
- [peso 8] Fluxo EntradaFixa: confirmar recebimento deve abrir ConfirmPaymentModal (valor+data), igual SaidaFixa — nunca markReceived direto com today.

---
