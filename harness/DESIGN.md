# Design System — Somus
**Versão 2.0 · Maio 2026**

> **v2.0 — Liquid Glass & Atmospheric Hero:** Atualização premium adicionando sistema visual de vidro líquido (estilo iOS 26) e padrão de hero gradient seamless em todas as telas mobile.

> **Ver também:** `harness/ARCHITECTURE.md` para tokens CSS var, regras de componentes e padrões de código.

---

## 1. Filosofia

- **Dark mode only** — sem modo claro
- **Mobile-first** — cada tela funciona no celular primeiro
- **Clareza financeira** — valores legíveis, hierarquia visual clara
- **Liquid Glass** — glassmorphism real com `backdrop-filter`, reflexos especulares e integração com o gradiente de fundo
- **Atmospheric Depth** — cores de contexto (azul/lilás/rosa) emanam do fundo e sangram através dos elementos de vidro

---

## 2. Paleta de Cores

### 2.1 Fundo e Superfícies

| Token | Hex | Uso |
|---|---|---|
| `--color-bg-primary` | `#0D1B2A` | Fundo principal (azul escuro profundo) |
| `--color-bg-secondary` | `#1A2D42` | Cards e superfícies elevadas |
| `--color-bg-tertiary` | `#243B55` | Inputs, itens de lista |

### 2.2 Acentos

| Token | Hex | Uso |
|---|---|---|
| `--color-accent-primary` | `#3B82F6` | CTAs, botões primários, links |
| `--color-accent-blue-light` | `#60A5FA` | Destaques e badges info |
| `--color-accent-couple` | `#8B5CF6` | Contexto casal (lilás/violeta) |

### 2.3 Status

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#10B981` | Valores positivos, metas atingidas, entradas ↑ |
| `--color-warning` | `#F59E0B` | Alertas, valores variáveis/estimados, prefixo `~` |
| `--color-danger` | `#EF4444` | Saídas ↓, déficit, alertas críticos |

### 2.4 Texto

| Token | Hex | Uso |
|---|---|---|
| `--color-text-primary` | `#F1F5F9` | Texto principal |
| `--color-text-secondary` | `#94A3B8` | Labels, subtítulos |
| `--color-text-tertiary` | `#64748B` | Placeholders, hints |

### 2.5 Diferenciação Visual por Contexto

| Contexto | Cor | Tratamento |
|---|---|---|
| **Lucas** (pessoal) | `#3B82F6` azul | Card header com borda azul |
| **Mírian** (pessoal) | `#EC4899` rosa | Card header com borda rosa |
| **Casal** (compartilhado) | `#8B5CF6` lilás | Fusão das duas identidades |
| **Entrada** (positivo) | `#10B981` verde | Seta ↑ |
| **Saída** (negativo) | `#EF4444` vermelho | Seta ↓ |
| **Estimado** (futuro) | `#F59E0B` âmbar | Prefixo `~` |

---

## 3. Tipografia

| Elemento | Font | Tamanho | Peso |
|---|---|---|---|
| Display / Valores grandes | Inter | 36–48px | 700 |
| Heading H1 | Inter | 24px | 600 |
| Heading H2 | Inter | 18px | 600 |
| Body | Inter | 14–16px | 400 |
| Label / Caption | Inter | 11–12px | 500, uppercase + letter-spacing |
| Valor monetário destaque | Inter | 28–32px | 700, cor success ou primary |

---

## 4. Componentes

### 4.1 Bottom Tab Bar
4 itens: Home · Fluxo · Caixinhas · Casal
- Touch targets ≥ 48px
- Ícone ativo: cor primary + label visível
- Ícone inativo: text-tertiary
- Safe area insets para iPhone

### 4.2 Cards (Liquid Glass)

Todos os cards usam o sistema **Liquid Glass** — fundo semitransparente com blur que permite que o gradiente de fundo sangre.

```css
/* Classe base .card */
background: rgba(23, 23, 23, 0.65);
backdrop-filter: blur(12px) saturate(180%);
-webkit-backdrop-filter: blur(12px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: var(--radius-card); /* 16px */
padding: var(--space-md);          /* 16px */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

/* Classe .glass-card — hero cards e modais */
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.10);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.08),
  0 8px 32px rgba(0, 0, 0, 0.28);
```

**Regra:** nunca usar fundo sólido opaco em cards — sempre glass.

### 4.3 Barras de Progresso
- Caixinhas: barra horizontal com % e valor
- Fundo: rgba(255,255,255,0.1)
- Preenchimento: cor da caixinha ou success
- Radius: rounded-full
- Altura: 8px (default), 4px (compact)

### 4.4 Valores Monetários
- Positivos: `text-success` + seta ↑
- Negativos: `text-danger` + seta ↓
- Estimados: `text-warning` + prefixo `~`
- Grandes: 28-32px, font-bold
- Inline: 14px, font-semibold

### 4.5 Botões
- Primário: bg-accent-primary, text-white, rounded-xl, h-12
- Secundário: bg-bg-tertiary, text-text-primary, rounded-xl
- Ghost: transparent, text-text-secondary, hover:bg-bg-tertiary

### 4.6 FAB (Floating Action Button)

**Padrão único — não desviar:**

| Propriedade | Valor |
|---|---|
| `width` / `height` | **52px × 52px** |
| `borderRadius` | **16px** |
| `bottom` | `calc(80px + env(safe-area-inset-bottom, 0px))` |
| `right` | `20px` |
| `zIndex` | `35` |
| `background` | cor temática da página (sem `boxShadow`) |
| Ícone | `Plus size={22} strokeWidth={2.5}` |

Design flat: **sem glow, sem boxShadow colorida**. Renderizar apenas no mobile (`{isMobile && ...}`).

### 4.7 Modal / Bottom Sheet
- Renderizar via **React portal** (`createPortal`) em `document.body`
- `zIndex` do backdrop: `9000`; do painel: `9001` (ou superior)
- Quando aberto: travar scroll do `<main>` e do `body`
- Conteúdo rolável: `overflowY: auto`, `overscrollBehavior: contain`
- Header fixo com `flexShrink: 0`; conteúdo com `flex: 1`

### 4.8 Modal (Lançar Entrada)
- Overlay: bg-black/60 + backdrop-blur
- Card: bg-bg-secondary, rounded-2xl, p-6
- Preview de distribuição: lista com barras + valores editáveis
- Botão confirmar: full-width, h-12, bg-success

---

## 4.9 Liquid Glass — Componentes Fixos

Componentes sticky/fixed usam **Liquid Glass premium** com blur maior:

### BottomNav (Mobile)
```css
background: rgba(15, 15, 15, 0.65);
backdrop-filter: blur(28px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.12);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 24px rgba(0, 0, 0, 0.4);
border-radius: 22px; /* floating pill */
```

### Sidebar (Desktop)
```css
background: rgba(10, 10, 10, 0.60);
backdrop-filter: blur(28px) saturate(180%);
border-right: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

### Modais / Bottom Sheets
```css
background: rgba(20, 20, 20, 0.70);
backdrop-filter: blur(28px) saturate(200%);
border: 1px solid rgba(255, 255, 255, 0.12);
/* Mobile: */  border-radius: 28px 28px 0 0;
/* Desktop: */ border-radius: 24px;
box-shadow: 0 -8px 32px rgba(0,0,0,0.35);
```

---

## 4.10 Hero Gradient — Padrão Seamless

Este é o **padrão obrigatório** para todas as telas com hero/contexto de cor. Garante **zero divisão visual** entre navbar e conteúdo.

### Estrutura JSX

```tsx
// ✅ CORRETO — in-flow gradient, junção pixelicamente perfeita
<>
  <PageHeader bg={HERO_BG} />   {/* sólido, mesma cor exata */}
  <div style={{
    background: `linear-gradient(to bottom, ${HERO_BG} 0%, transparent 100%)`,
    padding: '12px 16px 20px',
  }}>
    <HeroCard />  {/* BalanceCard, FluxoChart, PatrimonioCard, etc. */}
  </div>
</>

// ❌ ERRADO — gradient absoluto por trás gera diferença de composição de alpha
<div style={{ position: 'relative' }}>
  <div style={{ position: 'absolute', background: gradient, zIndex: 0 }} />
  <PageHeader bg="transparent" />  {/* ← blur/alpha cria divisão visível */}
  <div style={{ zIndex: 1 }}> ... </div>
</div>
```

### Por que funciona

`PageHeader` tem `bg={HERO_BG}` como cor **sólida sem blur**. O `div` adjacente abaixo inicia o `linear-gradient` na **mesma cor exata** em 0%. Como são adjacentes no fluxo normal e o valor na borda é idêntico, não há diferença matemática de composição — **zero seam**.

### Cores Hero por Contexto

| Tela | HERO_BG | Comentário |
|---|---|---|
| Home | `#001442` | Azul Lucas |
| Fluxo | `#001442` | Azul Lucas |
| Extrato / Revisar | `#001442` | Azul Lucas (organização calma) |
| Casal | `#150D27` | Roxo casal |
| Relatórios | dinâmico | `#001442` / `#150D27` / `#2D0A1A` conforme `reportCtx` |
| DivisaoDetalhe | `#001442` | Azul padrão |
| ObjetivoDetalhe | `#001442` | Azul padrão |

### PageHeader — Regras quando hero (`bg` fornecido)

```tsx
background: bg          // sólido exato, sem alpha (ex: "#001442")
backdropFilter: 'none'
WebkitBackdropFilter: 'none'
borderBottom: 'none'
boxShadow: 'none'

// Sem bg → Liquid Glass padrão:
background: 'rgba(10, 10, 10, 0.82)'
backdropFilter: 'blur(24px) saturate(180%)'
```

### Desktop — Atmospheric Glow (Radial)

No desktop, usar **radial spotlight** no topo em vez de linear:

```tsx
<div style={{
  position: 'absolute',
  top: 0, left: 0, right: 0, height: 500,
  background: 'radial-gradient(circle at 50% -50px, COR 0%, transparent 70%)',
  opacity: 0.12,
  pointerEvents: 'none',
  zIndex: 0,
}} />
```

| Tela | Cor do radial |
|---|---|
| Home / Fluxo | `var(--color-lucas)` (`#3B82F6`) |
| Casal | `var(--color-accent-couple)` (`#8B5CF6`) |
| DivisaoDetalhe / ObjetivoDetalhe | `#001442` |

## 4.11 Today Highlight — Itens que vencem hoje

Itens pendentes cuja data coincide com **hoje** recebem um background suave para urgência visual **sem agressividade**. O padrão é idêntico entre Home e Fluxo.

| Tipo de item | Background | Usado quando |
|---|---|---|
| **Saída (fixa/variável)** | `rgba(239, 68, 68, 0.06)` | `daysUntil === 0` ou `formatShortDate(date) === 'Hoje'` e pendente |
| **Entrada** | `rgba(16, 185, 129, 0.06)` | `formatShortDate(date) === 'Hoje'` e pendente (não atrasado) |

**Regras:**
- **Somente pendentes** — itens pagos/confirmados **não** recebem highlight
- **Itens atrasados** — usam a sinalização de atraso (badge laranja), **não** o today highlight
- A cor segue a semântica: vermelho suave para saídas, verde suave para entradas
- O texto da data exibe **"Hoje"** em vez da data formatada

### Exemplo em código

```tsx
// FixaItem (usa daysUntil do getDaysUntil)
background: !paid && daysUntil === 0 ? 'rgba(239,68,68,0.06)' : 'transparent'

// VariavelItem / EntradaItem (usa formatShortDate)
const isToday = isPending && formatShortDate(sv.date) === 'Hoje'
background: isToday ? 'rgba(239,68,68,0.06)' : 'transparent'

// EntradaItem — cor verde para entradas
background: isToday ? 'rgba(16,185,129,0.06)' : 'transparent'
```

---

## 4.12 Date Labels — Formato Padronizado

As datas de itens pendentes usam um **formato contextual** consistente entre Home e Fluxo:

| Condição | Label exibido | Exemplo |
|---|---|---|
| Data = hoje | `Hoje` | "Hoje · Pix" |
| Data = amanhã | `Amanhã` | "Amanhã · Crédito" |
| Data futura (> 1 dia) | `Para DD Mmm` | "Para 23 Mai" |
| Data passada (atrasado) | `Atrasado — DD Mmm` | "Atrasado — 10 Mai" |
| Item já pago/confirmado | `DD Mmm` (sem prefixo) | "14 Mai" |

**Função canônica:** `formatShortDate(dateString)` em `Fluxo.tsx`

```tsx
function formatShortDate(dateString: string) {
  const d = new Date(dateString + 'T12:00:00')
  const today = new Date(); today.setHours(12, 0, 0, 0)
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  const monthStr = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${d.getDate().toString().padStart(2, '0')} ${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}`
}
```

**Regra:** Quando `formatShortDate` retorna "Hoje" ou "Amanhã", **não** prefixar com "Para".

---

## 5. Navegação

### 5.1 Mobile — Tab Bar
- 4 itens: Home · Fluxo · Divisões · Casal
- Toque na aba usa **`replace: true`** para não empilhar histórico do browser
- Tab ativa: `startsWith(path + '/')` ou `=== path`
- Toque numa aba sempre parte do zero naquela seção (sem memória de sub-rotas)

### 5.2 Mobile — Botão Voltar
- Componente `<PageHeader back />` em todas as telas de detalhe
- Implementado com `window.history.back()` para respeitar a rota anterior real
- Não usar `navigate('/rota-hardcoded')` — quebra o fluxo quando o usuário chega de rotas diferentes

### 5.3 Desktop — Breadcrumb
- Telas de detalhe exibem **breadcrumb** no topo em vez de botão voltar
- Componente: `<Breadcrumb items={[{ label, href }, { label }]} />`
- Parent items: texto secondary, clicável via `navigate(href)`
- Item atual: texto primary, bold, sem link, com ícone opcional
- Posição: `paddingTop: 28, marginBottom: 20` antes do conteúdo principal

| Tela | Breadcrumb |
|---|---|
| CaixinhaDetalhe | `Divisões › [icon] Nome` |
| ObjetivoDetalhe | `Casal › Nome do objetivo` |

**Menu lateral (Sidebar):** também usa `replace: true` na navegação entre itens

---

## 6. Animações

| Situação | Config |
|---|---|
| Entrada de página | opacity 0→1, y 20→0, 400ms |
| Toggle contexto (Pessoal/Casal) | Slide horizontal + fade, 300ms |
| Lançar entrada (modal) | Scale 0.95→1, backdrop fade, 300ms |
| Progresso de caixinha | Width animada, 600ms ease-out |
| Bottom tab active | Spring scale + layoutId indicator |

---

## 7. Regras de Ouro

1. **Nunca usar cores hardcoded** — sempre via tokens CSS
2. **Valores monetários sempre formatados** — `R$ 1.234,56`
3. **Estimados sempre com `~`** — `~R$ 200,00` em âmbar
4. **Touch targets ≥ 44px** no mobile
5. **Liquid Glass obrigatório** — cards, modais, sidebar e BottomNav SEMPRE com `backdrop-filter`
6. **Hero gradient obrigatório** — telas com contexto de cor SEMPRE usam o padrão in-flow (PageHeader + gradient div)
7. **Nunca gradient absoluto atrás do header** — cria diferença de composição visual imperceptível mas presente
8. **Hierarquia via opacidade** — não via tamanho excessivo
9. **Inter é a única fonte** — sem serif, sem monospace
10. **Contexto visual claro** — azul=Lucas, rosa=Mírian, lilás=Casal
11. **PageHeader com bg: sempre sólido** — nunca aplicar alpha ou blur quando bg é fornecido
12. **Desktop usa radial glow** — não linear-gradient; apenas mobile usa linear hero
13. **Today Highlight obrigatório** — itens pendentes de hoje SEMPRE recebem `background: rgba(...)` suave (§4.11). Consistente entre Home e Fluxo
14. **Date labels contextuais** — usar "Hoje"/"Amanhã" em vez de data numérica (§4.12). Consistente entre Home e Fluxo

---

## 8. Tokens CSS (Variáveis Globais)

Todos definidos no CSS global em `src/styles/`. **Nunca usar valores hardcoded.**

```css
/* Fundos */
--color-bg-primary:   #0D1B2A   /* fundo principal */
--color-bg-secondary: #1A2D42   /* cards elevados */
--color-bg-tertiary:  #243B55   /* inputs, listas */

/* Acentos */
--color-accent-primary: #3B82F6  /* CTAs, botões, tabs ativas */
--color-accent-couple:  #8B5CF6  /* contexto casal */

/* Identidade por usuário */
--color-lucas:  #3B82F6
--color-mirian: #EC4899

/* Status */
--color-success: #10B981  /* entradas, saldo positivo */
--color-warning: #F59E0B  /* estimados, alertas */
--color-danger:  #EF4444  /* saídas, déficit */

/* Texto */
--color-text-primary:   #F1F5F9  /* texto principal */
--color-text-secondary: #94A3B8  /* labels, subtítulos */
--color-text-tertiary:  #64748B  /* placeholders, hints */

/* Bordas */
--color-border: rgba(255, 255, 255, 0.08)

/* Geometria */
--radius-card: 16px
--space-md:    16px

/* Tipografia */
--font-display: 'Inter', sans-serif
```

---

## 9. Componentes UI Adicionais

Componentes que existem em `src/components/ui/` e seguem as mesmas regras de design:

### 9.1 ItemActionSheet
Bottom sheet de ações contextuais (editar, excluir, pagar).
- Mobile only, abre com slide-up desde a base.
- Itens com ícone, label e variante (default / danger).
- Fundo: Liquid Glass (mesmo padrão do `Dialog`).

### 9.2 PullToRefresh
Indicador visual de pull-to-refresh para mobile.
- Exibe spinner suave ao puxar a página para baixo.
- Integrado ao topo do scroll principal.

### 9.3 ContextToggle
Toggle "Pessoal / Casal" na Home.
- Slide horizontal + fade (300ms) ao trocar contexto.
- Azul para pessoal, lilás para casal.

### 9.4 ImageCropPicker
Seletor de imagem com crop para objetivos.
- Permite upload via câmera ou galeria.
- Preview do crop antes de confirmar.
- Resultado: base64 comprimido via `useImageUpload`.

### 9.5 UserMenu
Menu de perfil do usuário (desktop: dropdown no sidebar).
- Avatar, nome, email.
- Links: Perfil, Configurações, Sair.
- `signOut` via `useAuth` ao clicar em Sair.

### 9.6 MonthGroup
Agrupador visual de itens por mês.
- Header com "Mês Ano" + separador.
- Usado em histórico de movimentos e relatórios.

### 9.7 Breadcrumb
Navegação de volta no desktop (ver §5.3).
- Parent items: `text-secondary`, clicável.
- Item atual: `text-primary`, bold, sem link.

