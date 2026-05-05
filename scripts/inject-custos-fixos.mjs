/**
 * Script: inject-custos-fixos.mjs
 * Insere custos fixos da divisão Essencial para piresblucas@gmail.com no Firestore
 * Usa Firebase REST API (sem Admin SDK)
 */

import { randomUUID } from 'crypto'

// ── Config ────────────────────────────────────────────────────────────────────
const PROJECT_ID = 'somus-3df33'
const API_KEY    = 'AIzaSyDn93l6V6T_dAFdC0Ho-pewg7EVnKgiJeE'
const TARGET_EMAIL = 'piresblucas@gmail.com'
const TODAY = new Date().toISOString().slice(0, 10) // 2026-05-05
const CAIXINHA_ID = 'cx-essencial'
const CATEGORY    = 'Essencial'

// ── Novos custos fixos ────────────────────────────────────────────────────────
// Vencimento "Dia 5-10" → usando dia 5 (início do range)
// "Pagamento manual" → boleto (fatura Inter)
const NOVOS_CUSTOS = [
  { item: 'Dízimo',                   valor: 600.00,  dueDay: 5,  paymentMethod: 'pix',        isVariable: false },
  { item: 'Contabilidade SAN+Lucas',  valor: 100.00,  dueDay: 5,  paymentMethod: 'pix',        isVariable: false },
  { item: 'Aula de bateria',          valor: 200.00,  dueDay: 5,  paymentMethod: 'pix',        isVariable: false },
  { item: 'Aluguel (sua parte)',      valor: 601.16,  dueDay: 20, paymentMethod: 'pix',        isVariable: false },
  { item: 'Claro (Net + 2 linhas)',   valor: 174.80,  dueDay: 20, paymentMethod: 'auto_debit', isVariable: false },
  { item: 'Fatura Inter',             valor: 0,       dueDay: 25, paymentMethod: 'credit',     isVariable: true  },
  { item: 'Enel',                     valor: 0,       dueDay: 27, paymentMethod: 'auto_debit', isVariable: true  },
]

// ── Auth: get ID token ────────────────────────────────────────────────────────
async function getIdToken() {
  // Sign in anonymously to get a token that passes Firestore rules
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    }
  )
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  console.log(`🔑 Token obtido para UID temporário: ${json.localId}`)
  return json.idToken
}

// ── REST helpers ──────────────────────────────────────────────────────────────
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

async function listAllUserDocs(token) {
  const url = `${BASE}/users?key=${API_KEY}&pageSize=50`
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`List failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return json.documents ?? []
}

function extractField(fields, key) {
  const f = fields?.[key]
  if (!f) return undefined
  return f.stringValue ?? f.booleanValue ?? f.integerValue ?? f.doubleValue ?? f.nullValue ?? undefined
}

function extractMapField(fields, key) {
  return fields?.[key]?.mapValue?.fields ?? null
}

function extractArrayField(fields, key) {
  return fields?.[key]?.arrayValue?.values ?? []
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val }
  if (typeof val === 'string') return { stringValue: val }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } }
  if (typeof val === 'object') {
    const fields = {}
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v)
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

function parseSaidaFixaFromFirestore(fields) {
  return {
    id:            extractField(fields, 'id'),
    userId:        extractField(fields, 'userId'),
    name:          extractField(fields, 'name'),
    amount:        Number(extractField(fields, 'amount') ?? 0),
    dueDay:        Number(extractField(fields, 'dueDay') ?? 0),
    paymentMethod: extractField(fields, 'paymentMethod'),
    caixinhaId:    extractField(fields, 'caixinhaId'),
    autoDebit:     extractField(fields, 'autoDebit') === true || extractField(fields, 'autoDebit') === 'true',
    paidDates:     extractArrayField(fields, 'paidDates').map(v => v.stringValue).filter(Boolean),
    category:      extractField(fields, 'category'),
    color:         extractField(fields, 'color'),
    isVariable:    extractField(fields, 'isVariable') === true || extractField(fields, 'isVariable') === 'true',
    billingCycle:  extractField(fields, 'billingCycle') ?? 'month',
  }
}

async function patchDocument(docName, fields, token) {
  // Build updateMask from field keys
  const fieldPaths = Object.keys(fields).join(',')
  const url = `https://firestore.googleapis.com/v1/${docName}?key=${API_KEY}&updateMask.fieldPaths=${encodeURIComponent(fieldPaths)}`
  const res  = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`PATCH failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const token = await getIdToken()
  console.log('🔍 Buscando documentos na coleção users...')
  const docs = await listAllUserDocs(token)
  console.log(`   Encontrados ${docs.length} documento(s).`)

  // Find the doc where currentUser.email === TARGET_EMAIL
  let targetDoc = null
  let userId    = null

  for (const doc of docs) {
    const cuFields = extractMapField(doc.fields, 'currentUser')
    if (!cuFields) continue
    const email = extractField(cuFields, 'email')
    if (email === TARGET_EMAIL) {
      targetDoc = doc
      userId    = extractField(cuFields, 'id')
      console.log(`✅ Usuário encontrado: UID=${userId} | doc=${doc.name}`)
      break
    }
  }

  if (!targetDoc) {
    console.error(`❌ Nenhum documento com email=${TARGET_EMAIL} encontrado.`)
    process.exit(1)
  }

  // Parse existing saidasFixas
  const existingSf = extractArrayField(targetDoc.fields, 'saidasFixas')
    .map(v => parseSaidaFixaFromFirestore(v?.mapValue?.fields ?? {}))

  console.log(`\n📋 saidasFixas existentes (${existingSf.length}):`)
  existingSf.forEach(sf => console.log(`   - ${sf.name} | R$${sf.amount} | dia ${sf.dueDay}`))

  // Build new saidasFixas objects
  const novos = NOVOS_CUSTOS.map(c => ({
    id:            randomUUID(),
    userId:        userId,
    name:          c.item,
    amount:        c.valor,
    dueDay:        c.dueDay,
    paymentMethod: c.paymentMethod,
    caixinhaId:    CAIXINHA_ID,
    autoDebit:     c.paymentMethod === 'auto_debit',
    paidDates:     [],
    category:      CATEGORY,
    color:         '#3B82F6',
    isVariable:    c.isVariable,
    billingCycle:  'month',
  }))

  console.log(`\n➕ Inserindo ${novos.length} novos custos fixos...`)
  novos.forEach(n => console.log(`   + ${n.name} | R$${n.amount} | dia ${n.dueDay} | ${n.paymentMethod} | variavel=${n.isVariable}`))

  // Merge: keep existing + add new (avoid duplicates by name)
  const existingNames = new Set(existingSf.map(sf => sf.name?.toLowerCase()))
  const toAdd = novos.filter(n => !existingNames.has(n.name.toLowerCase()))

  if (toAdd.length === 0) {
    console.log('\n⚠️  Todos os custos já existem no documento. Nada a inserir.')
    process.exit(0)
  }

  const merged = [...existingSf, ...toAdd]
  console.log(`\n💾 Salvando ${merged.length} saidasFixas (${existingSf.length} existentes + ${toAdd.length} novas)...`)

  const newArrayValue = merged.map(sf => toFirestoreValue(sf))

  await patchDocument(targetDoc.name, {
    saidasFixas: { arrayValue: { values: newArrayValue } },
  }, token)

  console.log('\n✅ Concluído! Dados salvos no Firestore.')
  console.log(`   Custos adicionados:`)
  toAdd.forEach(n => console.log(`   ✓ ${n.name}`))
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
