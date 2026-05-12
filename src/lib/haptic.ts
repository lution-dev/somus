/**
 * Somus Haptic Engine
 * Provides subtle physical feedback using the Vibration API.
 * Designed to be "almost invisible" - a tactile confirmation, not an alert.
 */

export const haptic = {
  /** Light tap for navigation, tabs, and interactive cards (10ms) */
  selection: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  },
  
  /** Slightly stronger double tap for destructive actions, modals, or success (15ms, pause, 10ms) */
  impact: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 30, 10])
    }
  }
}