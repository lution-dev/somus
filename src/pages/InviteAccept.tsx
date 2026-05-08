import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useAuth } from '../hooks/useAuth'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import SomusLogo from '../components/ui/SomusLogo'
import { Heart, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type State = 'loading' | 'found' | 'self' | 'already_linked' | 'not_found' | 'success' | 'error'

export default function InviteAccept() {
  const params = useParams<{ code: string }>()
  const code = (params.code ?? '').toUpperCase()
  const [, navigate] = useLocation()
  const { uid } = useAuth()
  const currentUser = useAppStore(s => s.currentUser)
  const setPartner  = useAppStore(s => s.setPartner)

  const [state, setState] = useState<State>('loading')
  const [inviterName, setInviterName] = useState('')
  const [inviterUid, setInviterUid] = useState('')

  useEffect(() => {
    if (!uid || !code) return

    async function lookup() {
      try {
        // Find the user whose partnerCode matches
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('currentUser.partnerCode', '==', code))
        const snap = await getDocs(q)

        if (snap.empty) { setState('not_found'); return }

        const inviterDoc = snap.docs[0]
        const inviterData = inviterDoc.data()
        const inviter = inviterData?.currentUser

        if (!inviter) { setState('not_found'); return }

        // Can't link yourself
        if (inviterDoc.id === uid) { setState('self'); return }

        // Already linked to someone else
        const partner = useAppStore.getState().partner
        if (partner?.id && partner.id !== inviterDoc.id) {
          setState('already_linked')
          return
        }

        setInviterName(inviter.name ?? 'Alguém')
        setInviterUid(inviterDoc.id)
        setState('found')
      } catch {
        setState('error')
      }
    }

    lookup()
  }, [uid, code, currentUser])

  async function handleAccept() {
    if (!uid || !inviterUid || !currentUser) return
    setState('loading')

    try {
      // Link both users to each other in Firestore
      // Update current user's doc
      await setDoc(doc(db, 'users', uid), {
        partner: { id: inviterUid, name: inviterName, partnerCode: code },
      }, { merge: true })

      // Update inviter's doc with current user info
      const myName = currentUser.name ?? 'Parceiro(a)'
      const myCode = currentUser.partnerCode ?? ''
      await setDoc(doc(db, 'users', inviterUid), {
        partner: { id: uid, name: myName, partnerCode: myCode },
      }, { merge: true })

      // Update local state
      setPartner({ id: inviterUid, name: inviterName, partnerCode: code })

      setState('success')
      setTimeout(() => navigate('/casal'), 2000)
    } catch {
      setState('error')
    }
  }

  const ACCENT = 'var(--color-accent-couple)'

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-primary)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

        {/* Logo */}
        <SomusLogo size={48} />

        {/* States */}
        {state === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Loader2 size={32} color={ACCENT} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', margin: 0 }}>Verificando convite...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {state === 'found' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(139,92,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={32} color={ACCENT} fill={ACCENT} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
                {inviterName} te convidou!
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Ao aceitar, vocês terão uma visão financeira compartilhada no Somus.
              </p>
            </div>

            <div style={{
              width: '100%',
              background: 'var(--color-bg-secondary)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Código</span>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.12em', color: ACCENT }}>{code}</span>
            </div>

            <button
              onClick={handleAccept}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: ACCENT, color: 'white',
                fontSize: 15, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Heart size={16} fill="white" />
              Aceitar convite
            </button>
            <button
              onClick={() => navigate('/casal')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Recusar
            </button>
          </div>
        )}

        {state === 'success' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={56} color="var(--color-success)" />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Vocês estão conectados! 💜
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Redirecionando para o Casal...
            </p>
          </div>
        )}

        {(state === 'not_found' || state === 'error') && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <XCircle size={48} color="var(--color-danger)" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              {state === 'not_found' ? 'Código não encontrado' : 'Erro ao processar'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              {state === 'not_found'
                ? `O código "${code}" não existe. Verifique com quem te enviou.`
                : 'Ocorreu um erro. Tente novamente mais tarde.'}
            </p>
            <button
              onClick={() => navigate('/casal')}
              style={{
                marginTop: 8, padding: '10px 24px', borderRadius: 10,
                background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
              }}
            >
              Voltar ao início
            </button>
          </div>
        )}

        {state === 'self' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <XCircle size={48} color="var(--color-warning)" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Este é seu próprio código
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Compartilhe o link com seu parceiro(a), não consigo você mesmo.
            </p>
            <button onClick={() => navigate('/casal')} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 10, background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>
              Voltar
            </button>
          </div>
        )}

        {state === 'already_linked' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <XCircle size={48} color="var(--color-warning)" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Você já tem um parceiro vinculado
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Desvincule o parceiro atual antes de aceitar um novo convite.
            </p>
            <button onClick={() => navigate('/casal')} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 10, background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
