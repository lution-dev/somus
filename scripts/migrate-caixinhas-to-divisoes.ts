/**
 * One-time migration script: rename 'caixinhas' → 'divisoes' in Firestore
 *
 * Run this ONCE to update all user documents:
 * npx ts-node scripts/migrate-caixinhas-to-divisoes.ts
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, deleteField } from 'firebase/firestore'

const firebaseConfig = {
  // Copy from your .env.local or Firebase config
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrateCaixinhasToDivisoes() {
  console.log('🔄 Starting caixinhas → divisoes migration in Firestore...')

  try {
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)

    let migratedCount = 0

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()

      // Check if this user has 'caixinhas' field
      if (userData.caixinhas && Array.isArray(userData.caixinhas) && userData.caixinhas.length > 0) {
        console.log(`  Migrating user ${userDoc.id}...`)

        await updateDoc(userDoc.ref, {
          divisoes: userData.caixinhas,
          caixinhas: deleteField(),
        })

        migratedCount++
        console.log(`    ✓ Moved ${userData.caixinhas.length} divisões`)
      }
    }

    console.log(`\n✅ Migration complete! ${migratedCount} users updated.`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateCaixinhasToDivisoes()
