# SPEC.md — Somus
> Especificação viva. Referência para regras de negócio e design.

## Visão Geral
**Nome:** Somus — "somos" em latim, remete à união do casal
**Plataforma:** Mobile First + Desktop (PWA)
**Tema:** Dark Mode Only
**Conceito:** App de clareza financeira para casais com renda variável.

## Navegação
**Bottom Tab Bar:** Home · Fluxo · Divisões · Casal
**Menu lateral:** Perfil · Configurações · Histórico · Objetivos

> ⚠️ O SPEC usa "Caixinhas" como nome de produto na aba — o código usa `Divisões`. Migração concluída na v10.

## Regras de Negócio

| Regra | Descrição |
|---|---|
| RN01 | Distribuição automática proporcional. Usuário edita antes de confirmar, soma ≤ total. |
| RN02 | Mesma fonte pode ser lançada múltiplas vezes no mês (renda parcial). |
| RN03 | Saídas fixas não debitam auto. Débito automático marcado confirma sozinho. |
| RN04 | Fatura do cartão = lançamento único na Essencial, com breakdown por categoria. |
| RN05 | Reserva Emergência atingiu meta → redirecionar % para Objetivos (com confirmação). |
| RN06 | Valores futuros = prefixo `~` + cor âmbar. Confirmados = sem prefixo. |
| RN07 | Saldos externos (99 Pago, Mercado Pago, Rico) = atualização manual no MVP. |
| RN08 | Dízimo = prioridade máxima. Sempre **primeiro** na distribuição (`calculateDistribution`). |
| RN09 | Despesas variáveis com data futura não abatem saldo imediatamente (Agendamento). Confirmação manual. |

## Divisões (Método Nati Arcuri Adaptado)

> Nota: no código e no banco as "caixinhas" foram renomeadas para "divisões" na v10.
> A divisão "Livre" foi **removida** na v8 (saldo transferido para Liberdade Financeira).

| ID | Divisão | % padrão | Descrição |
|---|---|---|---|
| cx-dizimo | Dízimo/Oferta | 10% | Prioridade máxima. Primeira na distribuição (RN08). |
| cx-reserva | Liberdade Financeira | 10% | Reserva de emergência + investimentos de longo prazo. |
| cx-objetivos | Objetivos | 20% | Múltiplos objetivos com foto e prazo. |
| cx-essencial | Essencial | 55% | Contas fixas, alimentação, transporte. |
| cx-educacao | Educação | 5% | Cursos, livros, mentorias. |

## Diferenciação Visual

| Contexto | Cor |
|---|---|
| Lucas | `#3B82F6` azul |
| Mírian | `#EC4899` rosa |
| Casal | `#8B5CF6` lilás |
| Entrada | `#10B981` verde ↑ |
| Saída | `#EF4444` vermelho ↓ |
| Estimado | `#F59E0B` âmbar + `~` |

## Dados Pré-cadastrados (Lucas)

**Fontes de renda:** Lidtek Salário (fixo, dia 5) · Lidtek Lucro 33% (variável, após dia 10) · Glide/PartnerStack (variável, até dia 20) · Mentorias (esporádico)

**Saídas fixas:** Aluguel R$601 (dia 20) · SAN R$80 (dia 20) · Claro R$175 (dia 20, débito auto) · Enel ~R$200 (dia 27, débito auto) · Bateria R$200 (dia 5-10) · Fatura Inter ~R$4.300 (dia 25)
