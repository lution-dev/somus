#!/usr/bin/env node
/**
 * Libera a porta antes do Vite subir (evita "Port already in use" com strictPort).
 * Uso: node scripts/free-port.mjs [porta]
 */
import { execSync } from 'node:child_process'

const port = process.argv[2] || '1619'

function tryExec(cmd) {
  try {
    execSync(cmd, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// fuser (Linux) — mata quem está em LISTEN na porta
tryExec(`fuser -k ${port}/tcp`)

// fallback lsof
try {
  const out = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, { encoding: 'utf8' }).trim()
  if (out) {
    for (const pid of out.split(/\s+/)) {
      tryExec(`kill -9 ${pid}`)
    }
  }
} catch {
  // porta já livre
}

// dá um tick pro kernel soltar o socket
await new Promise((r) => setTimeout(r, 150))
