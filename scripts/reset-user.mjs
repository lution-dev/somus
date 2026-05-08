/**
 * reset-user.mjs
 * Reseta o onboarding de um usuário no Firestore do Somus.
 *
 * Como funciona:
 *   1. Busca o doc `users/{uid}` cujo `currentUser.email` == EMAIL informado
 *   2. Faz setDoc com { isOnboarded: false } (merge: true)
 *   3. O migrationService.ts já tem a lógica: se isOnboarded=false no Firestore
 *      o usuário é redirecionado para o onboarding na próxima abertura.
 *
 * Uso:
 *   node scripts/reset-user.mjs srtamirianbernardo@gmail.com
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDn93l6V6T_dAFdC0Ho-pewg7EVnKgiJeE',
  authDomain: 'somus-3df33.firebaseapp.com',
  projectId: 'somus-3df33',
  storageBucket: 'somus-3df33.firebasestorage.app',
  messagingSenderId: '463898313113',
  appId: '1:463898313113:web:7dace9eefe22973d6bb168',
}

const app  = initializeApp(firebaseConfig)
const db   = getFirestore(app)

const email = process.argv[2]

if (!email) {
  console.error('❌  Uso: node scripts/reset-user.mjs <email>')
  process.exit(1)
}

console.log(`🔍  Buscando usuário com email: ${email}`)

const q    = query(collection(db, 'users'), where('currentUser.email', '==', email))
const snap = await getDocs(q)

if (snap.empty) {
  // Tenta também pelo campo email diretamente (formato antigo)
  const q2    = query(collection(db, 'users'), where('email', '==', email))
  const snap2 = await getDocs(q2)

  if (snap2.empty) {
    console.error(`❌  Nenhum documento encontrado para: ${email}`)
    console.error('    Verifique se o email está correto e se o usuário já fez login.')
    process.exit(1)
  }
}

const docs = snap.empty
  ? (await getDocs(query(collection(db, 'users'), where('email', '==', email)))).docs
  : snap.docs

for (const userDoc of docs) {
  const data = userDoc.data()
  console.log(`\n📄  Documento encontrado: ${userDoc.id}`)
  console.log(`    Nome: ${data?.currentUser?.name ?? '(sem nome)'}`)
  console.log(`    isOnboarded: ${data?.isOnboarded}`)
  console.log(`    Parceiro: ${data?.partner?.name ?? '(nenhum)'}`)

  await setDoc(doc(db, 'users', userDoc.id), {
    isOnboarded: false,
    currentUser: null,
    partner: null,
  }, { merge: true })

  console.log(`✅  Reset aplicado! isOnboarded → false, currentUser → null, partner → null`)
  console.log(`    Na próxima abertura do app, o usuário será redirecionado para o onboarding.`)
}

console.log('\n✅  Concluído.')
process.exit(0)
