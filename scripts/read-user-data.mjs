// Script temporário de conciliação financeira — NÃO commitar
// Lê dados do Firestore para o usuário especificado
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getFirebaseConfig } from './load-firebase-env.mjs'

const app = initializeApp(getFirebaseConfig())
const db = getFirestore(app)

const UID = 'NShMgH1PjyXU6j7P74JntPjcuRX2'

async function main() {
  console.log(`\n📊 CONCILIAÇÃO FINANCEIRA — usuário: piresblucas@gmail.com (${UID})\n`)
  console.log('=' .repeat(70))

  const docRef = doc(db, 'users', UID)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    console.error('❌ Documento não encontrado!')
    process.exit(1)
  }

  const data = docSnap.data()
  console.log('\n✅ Documento encontrado. Campos disponíveis:', Object.keys(data))

  // ─── DIVISÕES ───────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70))
  console.log('1. DIVISÕES')
  console.log('═'.repeat(70))

  const divisoes = data.divisoes || []
  let totalBalance = 0

  for (const div of divisoes) {
    const balance = div.balance ?? div.saldo ?? 0
    totalBalance += balance
    console.log(`  ID: ${div.id}`)
    console.log(`  Nome: ${div.name}`)
    console.log(`  Balance: R$ ${balance.toFixed(2)}`)
    console.log('  ' + '-'.repeat(40))
  }
  console.log(`\n  💰 TOTAL DIVISÕES: R$ ${totalBalance.toFixed(2)}`)

  // ─── ENTRADAS ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70))
  console.log('2. ENTRADAS')
  console.log('═'.repeat(70))

  const entradas = data.entradas || []
  const realizedMay26 = []
  const pendingMay26 = []
  const otherRealized = []
  const otherPending = []

  for (const e of entradas) {
    const date = e.date || e.data || ''
    const isMay26 = date.startsWith('2026-05')
    const status = e.status || 'realized'
    const isRealized = status === 'realized'

    if (isMay26 && isRealized) realizedMay26.push(e)
    else if (isMay26 && !isRealized) pendingMay26.push(e)
    else if (isRealized) otherRealized.push(e)
    else otherPending.push(e)
  }

  const printEntrada = (e) => {
    console.log(`    ID: ${e.id}`)
    console.log(`    Fonte: ${e.sourceName || e.source || '(sem nome)'}`)
    console.log(`    Valor: R$ ${(e.amount || 0).toFixed(2)}`)
    console.log(`    Data: ${e.date || e.data || '(sem data)'}`)
    console.log(`    Status: ${e.status || 'realized'}`)
    console.log(`    Kind: ${e.kind || '(sem kind)'}`)
    console.log('    ' + '-'.repeat(36))
  }

  console.log(`\n  📅 MAIO/2026 — REALIZADAS (${realizedMay26.length}):`)
  realizedMay26.forEach(printEntrada)
  const totalRealizedMay = realizedMay26.reduce((s, e) => s + (e.amount || 0), 0)
  console.log(`  ✅ Total realized mai/26: R$ ${totalRealizedMay.toFixed(2)}`)

  console.log(`\n  📅 MAIO/2026 — PENDENTES (${pendingMay26.length}):`)
  pendingMay26.forEach(printEntrada)

  console.log(`\n  📋 OUTROS MESES — REALIZADAS (${otherRealized.length}):`)
  otherRealized.forEach(printEntrada)

  console.log(`\n  📋 OUTROS MESES — PENDENTES (${otherPending.length}):`)
  otherPending.forEach(printEntrada)

  // ─── SAÍDAS VARIÁVEIS ────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70))
  console.log('3. SAÍDAS VARIÁVEIS')
  console.log('═'.repeat(70))

  const saidasVariaveis = data.saidasVariaveis || []
  const saidasMay26Realized = []
  const saidasMay26Pending = []
  const saidasOther = []

  for (const s of saidasVariaveis) {
    const date = s.date || s.data || ''
    const isMay26 = date.startsWith('2026-05')
    const status = s.status || 'realized'

    if (isMay26 && status === 'realized') saidasMay26Realized.push(s)
    else if (isMay26) saidasMay26Pending.push(s)
    else saidasOther.push(s)
  }

  const printSaida = (s) => {
    console.log(`    ID: ${s.id}`)
    console.log(`    Descrição: ${s.description || s.descricao || '(sem desc)'}`)
    console.log(`    Valor: R$ ${(s.amount || 0).toFixed(2)}`)
    console.log(`    Data: ${s.date || s.data || '(sem data)'}`)
    console.log(`    Status: ${s.status || 'realized'}`)
    console.log(`    DivisaoId: ${s.divisaoId || s.divisaoId || '(sem divisao)'}`)
    console.log('    ' + '-'.repeat(36))
  }

  console.log(`\n  📅 MAIO/2026 — REALIZADAS (${saidasMay26Realized.length}):`)
  saidasMay26Realized.forEach(printSaida)
  const totalSaidasMayRealized = saidasMay26Realized.reduce((s, e) => s + (e.amount || 0), 0)
  console.log(`  ✅ Total saídas realized mai/26: R$ ${totalSaidasMayRealized.toFixed(2)}`)

  console.log(`\n  📅 MAIO/2026 — PENDENTES (${saidasMay26Pending.length}):`)
  saidasMay26Pending.forEach(printSaida)
  const totalSaidasMayPending = saidasMay26Pending.reduce((s, e) => s + (e.amount || 0), 0)
  console.log(`  ⏳ Total saídas pending mai/26: R$ ${totalSaidasMayPending.toFixed(2)}`)

  console.log(`\n  📋 OUTROS MESES (${saidasOther.length}):`)
  saidasOther.forEach(printSaida)

  // ─── RESUMO CONCILIAÇÃO ──────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70))
  console.log('📊 RESUMO CONCILIAÇÃO')
  console.log('═'.repeat(70))
  console.log(`  Saldo total divisões:     R$ ${totalBalance.toFixed(2)}`)
  console.log(`  Saldo real no banco:      R$ 7.144,38`)
  console.log(`  Diferença:                R$ ${(totalBalance - 7144.38).toFixed(2)}`)
  console.log(`\n  Total entradas realized mai/26: R$ ${totalRealizedMay.toFixed(2)}`)
  console.log(`  Total saídas realized mai/26:   R$ ${totalSaidasMayRealized.toFixed(2)}`)
  console.log(`  Total saídas pending mai/26:    R$ ${totalSaidasMayPending.toFixed(2)}`)
  console.log('\n' + '═'.repeat(70))

  // ─── DADOS BRUTOS ADICIONAIS ─────────────────────────────────────────────────
  console.log('\n📦 OUTROS CAMPOS NO DOCUMENTO:')
  const knownFields = ['divisoes', 'entradas', 'saidasVariaveis']
  for (const [key, val] of Object.entries(data)) {
    if (!knownFields.includes(key)) {
      if (typeof val === 'object' && val !== null) {
        console.log(`  ${key}: ${JSON.stringify(val).substring(0, 200)}`)
      } else {
        console.log(`  ${key}: ${val}`)
      }
    }
  }

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
