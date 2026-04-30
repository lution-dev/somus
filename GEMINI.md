# GEMINI.md — Lidtek Engineering OS v2

## ⛔ STOP — DO NOT CODE YET

Before you do ANYTHING:

1. **Read `harness/HARNESS.md`** — the full protocol (not a summary, the ENTIRE file)
2. **Run Step 0** — the memory hook command in HARNESS.md to load global context
3. **Read `harness/CONTEXT.md`** — current project state
4. **Read `harness/BACKLOG.md`** — active tasks
5. **Read `harness/DESIGN.md`** — design system (for ANY visual change)

## Workflow
- Classify request: QUICK (1-2 items) / BATCH (3+) / SPRINT (10+)
- Register task in BACKLOG.md BEFORE implementing
- Implement one task at a time
- Run sensors after EACH task: `npx tsc --noEmit` then `npm run build`
- Update CONTEXT.md at end of session
- Run exit hook at end of session

## Prohibited
- Coding before reading HARNESS.md
- Skipping the memory hook
- "I'll register the task later" — register FIRST
- Declaring "done" without running sensors
- Ignoring DESIGN.md tokens/colors for UI work
