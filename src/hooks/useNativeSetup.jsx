/**
 * useNativeSetup.jsx
 * Runs once on app launch. Handles:
 * 1. Deep links from push notification taps → navigate to correct page
 * 2. App badge count from unread notifications
 * 3. Foreground notification display
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

const BELL_SEEN_KEY = 'ccg-notif-last-seen'

export function useNativeSetup() {
  const navigate = useNavigate()

  useEffect(() => {
    let pushListener = null
    let actionListener = null

    const setup = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        const { Badge } = await import('@capawesome/capacitor-badge').catch(() => ({ Badge: null }))

        // ── 1. Handle notification TAP (app in background/closed) ──────
        actionListener = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action) => {
            const data = action.notification.data
            const url  = data?.url || data?.click_action || '/'
            // Navigate inside the app
            navigate(url.startsWith('/') ? url : '/' + url)
            // Mark as seen
            localStorage.setItem(BELL_SEEN_KEY, new Date().toISOString())
            // Clear badge
            Badge?.clear?.()
          }
        )

        // ── 2. Handle notification received while app is OPEN ──────────
        pushListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          async (notification) => {
            // Update badge count
            await updateBadge(Badge)
          }
        )

        // ── 3. Set initial badge on launch ─────────────────────────────
        await updateBadge(Badge)

      } catch (err) {
        // Not native — silently ignore
      }
    }

    setup()

    // ── 4. Clear badge when user visits notifications page ─────────────
    const clearOnVisible = () => {
      if (document.visibilityState === 'visible') {
        import('@capawesome/capacitor-badge')
          .then(({ Badge }) => Badge?.clear?.())
          .catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', clearOnVisible)

    return () => {
      pushListener?.remove?.()
      actionListener?.remove?.()
      document.removeEventListener('visibilitychange', clearOnVisible)
    }
  }, [navigate])
}

async function updateBadge(Badge) {
  if (!Badge) return
  try {
    const lastSeen = localStorage.getItem(BELL_SEEN_KEY)
    const query = supabase
      .from('notification_logs')
      .select('*', { count: 'exact', head: true })
    if (lastSeen) query.gt('sent_at', lastSeen)
    const { count } = await query
    if (count > 0) {
      await Badge.set({ count })
    } else {
      await Badge.clear()
    }
  } catch {}
}
