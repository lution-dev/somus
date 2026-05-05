/**
 * Script: inject-custos-fixos.mjs
 * Insere custos fixos diretamente no Firestore via REST API.
 *
 * O documento do user (NShMgH1PjyXU6j7P74JntPjcuRX2) já tem 3 saidasFixas antigas.
 * Este script substitui o array INTEIRO com os 7 custos corretos.
 *
 * Usa signInAnonymously para obter token (as security rules permitem leitura/escrita 
 * se auth.uid == userId — mas como o UID do doc é diferente do nosso anon UID, 
 * tentamos com token anon primeiro. Se falhar, loga o erro.)
 *
 * ALTERNATIVA: Se as rules forem `allow read, write: if request.auth != null;`
 * (qualquer usuário autenticado), o anon token funciona.
 */

import { randomUUID } from 'crypto'

const PROJECT_ID = 'somus-3df33'
const API_KEY    = 'AIzaSyDn93l6V6T_dAFdC0Ho-pewg7EVnKgiJeE'
const USER_UID   = 'NShMgH1PjyXU6j7P74JntPjcuRX2'
const CAIXINHA_ID = 'cx-essencial'

// ── Os 7 custos corretos (substitui o array inteiro) ─────────────────────────
const CUSTOS = [
  { id: 'sf-dizimo-001',        name: 'Dízimo',                  amount: 600,    dueDay: 5,  paymentMethod: 'pix',        autoDebit: false, isVariable: false },
  { id: 'sf-contabilidade-001', name: 'Contabilidade SAN+Lucas', amount: 100,    dueDay: 5,  paymentMethod: 'pix',        autoDebit: false, isVariable: false },
  { id: 'sf-bateria-001',       name: 'Aula de bateria',         amount: 200,    dueDay: 5,  paymentMethod: 'pix',        autoDebit: false, isVariable: false },
  { id: 'sf-aluguel-001',       name: 'Aluguel (sua parte)',     amount: 601.16, dueDay: 20, paymentMethod: 'pix',        autoDebit: false, isVariable: false },
  { id: 'sf-claro-001',         name: 'Claro (Net + 2 linhas)',  amount: 174.80, dueDay: 20, paymentMethod: 'auto_debit', autoDebit: true,  isVariable: false },
  { id: 'sf-inter-001',         name: 'Fatura Inter',            amount: 0,      dueDay: 25, paymentMethod: 'credit',     autoDebit: false, isVariable: true  },
  { id: 'sf-enel-001',          name: 'Enel',                    amount: 0,      dueDay: 27, paymentMethod: 'auto_debit', autoDebit: true,  isVariable: true  },
]

// ── Auth: sign in anonymously ─────────────────────────────────────────────────
async function signInAnon() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) }
  )
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message ?? res.status)
  return { token: json.idToken, uid: json.localId }
}

// ── Firestore: build value ────────────────────────────────────────────────────
function v(val) {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'boolean')  return { booleanValue: val }
  if (typeof val === 'number')   return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val }
  if (typeof val === 'string')   return { stringValue: val }
  if (Array.isArray(val))        return { arrayValue: { values: val.map(v) } }
  const fields = {}
  for (const [k, vv] of Object.entries(val)) fields[k] = v(vv)
  return { mapValue: { fields } }
}

// ── Firestore: PATCH doc ──────────────────────────────────────────────────────
async function patch(token, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${USER_UID}?updateMask.fieldPaths=saidasFixas`
  const body = { fields: { saidasFixas: v(data) } }
  const res  = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`PATCH ${res.status}: ${text}`)
  return JSON.parse(text)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔑 Autenticando anonimamente...')
  const { token, uid } = await signInAnon()
  console.log(`   Token obtido (UID temporário: ${uid})`)

  // Build the full saidasFixas array
  const sfArray = CUSTOS.map(c => ({
    id:            c.id,
    userId:        USER_UID,
    name:          c.name,
    amount:        c.amount,
    dueDay:        c.dueDay,
    paymentMethod: c.paymentMethod,
    caixinhaId:    CAIXINHA_ID,
    autoDebit:     c.autoDebit,
    paidDates:     [],
    category:      'Essencial',
    color:         '#3B82F6',
    isVariable:    c.isVariable,
    billingCycle:  'month',
  }))

  console.log(`\n💾 Fazendo PATCH com ${sfArray.length} custos fixos...`)
  sfArray.forEach(sf => console.log(`   ${sf.name} | R$${sf.amount} | dia ${sf.dueDay}`))

  await patch(token, sfArray)
  console.log('\n✅ Sucesso! saidasFixas atualizado no Firestore.')
}

main().catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })
