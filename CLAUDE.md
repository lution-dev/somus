# CLAUDE.md — Somus

## Git Rules

- The production branch is **`main`**. NEVER create or push to a branch called `master`.
- Always push directly to `main` unless explicitly asked to create a feature branch.
- Do NOT create branches with the `claude/` prefix. Work on `main` directly.
- Before committing, always run: `npx tsc --noEmit` and `npm run build`
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
