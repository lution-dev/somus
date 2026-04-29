# SPEC.md — Somus
> Especificação viva. Referência para regras de negócio e design.

## Visão Geral
**Nome:** Somus — "somos" em latim, remete à união do casal
**Plataforma:** Mobile First + Desktop (PWA)
**Tema:** Dark Mode Only
**Conceito:** App de clareza financeira para casais com renda variável.

## Navegação
**Bottom Tab Bar:** Home · Fluxo · Caixinhas · Casal
**Menu lateral:** Perfil · Configurações · Histórico · Objetivos · Investimentos

## Regras de Negócio

| Regra | Descrição |
|---|---|
| RN01 | Distribuição automática proporcional. Usuário edita antes de confirmar, soma ≤ total. |
| RN02 | Mesma fonte pode ser lançada múltiplas vezes no mês (renda parcial). |
| RN03 | Saídas fixas não debitam auto. Débito automático marcado confirma sozinho. |
| RN04 | Fatura do cartão = lançamento único na Essencial, com breakdown por categoria. |
| RN05 | Reserva Emergência atingiu R$10k → redirecionar % para Objetivos (com confirmação). |
| RN06 | Valores futuros = prefixo `~` + cor âmbar. Confirmados = sem prefixo. |
| RN07 | Saldos externos (99 Pago, Mercado Pago, Rico) = atualização manual no MVP. |
| RN08 | Dízimo = prioridade máxima. Sempre primeiro na distribuição. |

## Caixinhas (Método Nati Arcuri Adaptado)

| Caixinha | % | Descrição |
|---|---|---|
| Dízimo/Oferta | 10% | Prioridade máxima. Primeira a ser distribuída. |
| Reserva Emergência | ~8% | Meta: R$10.000. Vínculo Mercado Pago. |
| Objetivos | 20% | Apartamento. Múltiplos objetivos com foto e prazo. |
| Essencial | 55% | Contas fixas, alimentação, transporte. |
| Educação | 5% | Cursos, livros, mentorias. |
| Livre | Restante | O que sobra após todas. |

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
