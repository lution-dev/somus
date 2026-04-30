# Design System — Somus
**Versão 1.0 · Abril 2026**

---

## 1. Filosofia

- **Dark mode only** — sem modo claro
- **Mobile-first** — cada tela funciona no celular primeiro
- **Clareza financeira** — valores legíveis, hierarquia visual clara
- **Premium sem exagero** — glassmorphism sutil, sem distrações

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

### 4.2 Cards
```css
background: var(--color-bg-secondary);
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.08);
padding: 16px;
```

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
- FAB: rounded-full, w-14 h-14, bg-accent-primary, shadow-lg

### 4.6 Modal (Lançar Entrada)
- Overlay: bg-black/60 + backdrop-blur
- Card: bg-bg-secondary, rounded-2xl, p-6
- Preview de distribuição: lista com barras + valores editáveis
- Botão confirmar: full-width, h-12, bg-success

---

## 5. Navegação

**Bottom Tab Bar (4 itens):** Home · Fluxo · Caixinhas · Casal
**Menu lateral (hamburger):** Perfil · Configurações · Histórico · Objetivos · Investimentos

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

1. **Nunca usar cores hardcoded** — sempre via tokens
2. **Valores monetários sempre formatados** — `R$ 1.234,56`
3. **Estimados sempre com `~`** — `~R$ 200,00` em âmbar
4. **Touch targets ≥ 44px** no mobile
5. **Glassmorphism sutil** — blur(12px) max, opacity baixa
6. **Hierarquia via opacidade** — não via tamanho excessivo
7. **Inter é a única fonte** — sem serif, sem monospace
8. **Contexto visual claro** — azul=Lucas, rosa=Mírian, lilás=Casal
