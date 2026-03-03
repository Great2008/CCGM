/**
 * useMobileFeatures.js
 * Native Capacitor features for the CCG World mobile app.
 * Safely degrades on web (PWA) — nothing breaks if plugins are unavailable.
 */
import { useEffect, useState, useCallback } from 'react'

// ─── Haptic Feedback ────────────────────────────────────────────────────────
// Usage: const { impact, notification } = useHaptics()
//        impact()              → medium tap
//        notification('success') → success pattern
export function useHaptics() {
  const impact = useCallback(async (style = 'MEDIUM') => {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
      await Haptics.impact({ style: ImpactStyle[style] })
    } catch {}
  }, [])

  const notification = useCallback(async (type = 'SUCCESS') => {
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics')
      await Haptics.notification({ type: NotificationType[type] })
    } catch {}
  }, [])

  const vibrate = useCallback(async () => {
    try {
      const { Haptics } = await import('@capacitor/haptics')
      await Haptics.vibrate()
    } catch {}
  }, [])

  return { impact, notification, vibrate }
}

// ─── Native Share ────────────────────────────────────────────────────────────
// Usage: const { share } = useNativeShare()
//        share({ title, text, url }) → opens native share sheet
export function useNativeShare() {
  const share = useCallback(async ({ title, text, url, dialogTitle }) => {
    try {
      const { Share } = await import('@capacitor/share')
      const { value } = await Share.canShare()
      if (value) {
        await Share.share({ title, text, url, dialogTitle })
        return true
      }
    } catch {}
    // Fallback to Web Share API
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return true } catch {}
    }
    // Last resort: copy to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url || text || title)
    }
    return false
  }, [])

  return { share }
}

// ─── Network Status ──────────────────────────────────────────────────────────
// Usage: const { isOnline, connectionType } = useNetworkStatus()
export function useNetworkStatus() {
  const [isOnline, setIsOnline]           = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    let listener = null

    const init = async () => {
      try {
        const { Network } = await import('@capacitor/network')
        const status = await Network.getStatus()
        setIsOnline(status.connected)
        setConnectionType(status.connectionType)

        listener = await Network.addListener('networkStatusChange', status => {
          setIsOnline(status.connected)
          setConnectionType(status.connectionType)
        })
      } catch {
        // Fallback to browser events
        const onOnline  = () => setIsOnline(true)
        const onOffline = () => setIsOnline(false)
        window.addEventListener('online',  onOnline)
        window.addEventListener('offline', onOffline)
        return () => {
          window.removeEventListener('online',  onOnline)
          window.removeEventListener('offline', onOffline)
        }
      }
    }

    init()
    return () => { listener?.remove?.() }
  }, [])

  return { isOnline, connectionType }
}

// ─── Keep Screen Awake (for Live stream) ────────────────────────────────────
// Usage: const { keepAwake, allowSleep } = useScreenAwake()
//        keepAwake()   → prevent screen from sleeping
//        allowSleep()  → release the lock
export function useScreenAwake() {
  const keepAwake = useCallback(async () => {
    try {
      const { KeepAwake } = await import('@capacitor-community/keep-awake')
      await KeepAwake.keepAwake()
    } catch {
      // Fallback: Web Screen Wake Lock API
      try {
        if ('wakeLock' in navigator) {
          window._wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch {}
    }
  }, [])

  const allowSleep = useCallback(async () => {
    try {
      const { KeepAwake } = await import('@capacitor-community/keep-awake')
      await KeepAwake.allowSleep()
    } catch {
      try {
        if (window._wakeLock) {
          await window._wakeLock.release()
          window._wakeLock = null
        }
      } catch {}
    }
  }, [])

  return { keepAwake, allowSleep }
}

// ─── Offline Banner ──────────────────────────────────────────────────────────
// Usage: <OfflineBanner /> — drop this anywhere in your app tree
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus()
  const [wasOffline, setWasOffline] = useState(false)
  const [showBack, setShowBack]     = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    } else if (wasOffline) {
      setShowBack(true)
      setTimeout(() => { setShowBack(false); setWasOffline(false) }, 3000)
    }
  }, [isOnline])

  if (isOnline && !showBack) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: showBack ? '#16a34a' : '#1e293b',
      color: 'white', textAlign: 'center',
      padding: '12px 20px',
      fontSize: '0.85rem', fontWeight: 700,
      transition: 'background 0.4s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {showBack ? '✅ You\'re back online' : '📴 You\'re offline — some features may be unavailable'}
    </div>
  )
}
