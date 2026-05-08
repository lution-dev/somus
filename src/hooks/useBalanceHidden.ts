import { useState, useEffect, useCallback } from 'react'

const KEY = 'somus:balanceHidden'

/**
 * Shared hook for bank-style balance hiding.
 * State is persisted in localStorage and stays in sync across
 * all components that use this hook via a storage event listener.
 */
export function useBalanceHidden() {
  const [hidden, setHidden] = useState(() => localStorage.getItem(KEY) === 'true')

  // Sync across tabs/pages via storage events
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) {
        setHidden(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const toggle = useCallback(() => {
    setHidden(prev => {
      const next = !prev
      localStorage.setItem(KEY, String(next))
      // Dispatch storage event so other components in the same tab also update
      window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: String(next) }))
      return next
    })
  }, [])

  return { hidden, toggle }
}
