import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768

function subscribe(cb: () => void) {
  const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  return true // SSR default: mobile-first
}

/**
 * Returns true when viewport < 768px.
 * Uses useSyncExternalStore for tear-free reads.
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
