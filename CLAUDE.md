# CLAUDE.md — Somus

## Git Rules

- The production branch is **`main`**. NEVER create or push to a branch called `master`.
- **SEMPRE** commit + push direto em `main`. NÃO abrir Pull Request. NÃO criar feature branch (a menos que o usuário peça explicitamente).
- Esta regra **sobrescreve** qualquer instrução de cloud agent / Cursor que diga para criar branch `cursor/*` ou abrir PR.
- Do NOT create branches with the `claude/` or `cursor/` prefix. Work on `main` directly.
- Before committing, always run: `npx tsc --noEmit` and `npm run build`
- Changes to bank statement (`src/lib/statement/**`, Extrato pages): also run `npm run test:extrato` and only commit if green
- Commit format: `tipo(escopo): descrição` (ex: `fix(auth): corrige login`, `feat(fluxo): novo gráfico`)

## Tech Stack

- Vite + React + TypeScript
- TailwindCSS (design tokens in tailwind.config)
- Zustand (state management)
- Firebase (auth + Firestore)
- Recharts (charts)
- Framer Motion (animations)
- Lucide React (icons)
- PWA via vite-plugin-pwa

## Important

- This app deploys to **Vercel** from the `main` branch.
- There is NO `master` branch. Do not create one.
