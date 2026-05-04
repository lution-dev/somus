# AGENTS.md — Lidtek Engineering OS v2

## ⛔ MANDATORY — READ BEFORE ANY ACTION

This project operates under the **Lidtek Harness Engineering** protocol.

**You MUST complete these steps IN ORDER before writing ANY code, making ANY change, or responding to ANY request:**

### Step 1: Read the protocol
```
Read file: harness/HARNESS.md (ENTIRE file, do not skip)
```

### Step 2: Run the memory hook (Step 0 in HARNESS.md)
```powershell
node "c:\Users\Lucas\OneDrive\Documentos\Projetos\lidtek-memoria\hooks\entrada.js" "[describe the task]" "Somus"
```
Then read the generated `harness/MEMORY_CONTEXT.md`.

### Step 3: Read project state
```
Read file: harness/CONTEXT.md
Read file: harness/BACKLOG.md
```

### Step 4: Read design system (if UI changes)
```
Read file: harness/DESIGN.md
```

## Rules
- **NEVER skip steps.** Even for "simple" requests.
- **NEVER write code before registering the task** in `harness/BACKLOG.md`.
- **ALWAYS run sensors** (`npx tsc --noEmit`, `npm run build`) after each task.
- **ALWAYS update CONTEXT.md** at the end of a session.
- **ALWAYS run the exit hook** at the end of a session.

> Failure to follow this protocol causes inconsistency across the codebase and wastes developer time. There are no exceptions.
