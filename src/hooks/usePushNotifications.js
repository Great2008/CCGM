/**
 * usePushNotifications.js (Mobile version)
 * Detects Capacitor native platform reliably and uses FCM.
 * Falls back to Web Push (VAPID) in browser/PWA.
 */
import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

// Reliable native detection — called once at module load
function getNativePlatform() {
  try {
    const cap = window?.Capacitor
    if (!cap) return null
    if (typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      return typeof cap.getPlatform === 'function' ? cap.getPlatform() : 'android'
    }
    if (cap.platform && cap.platform !== 'web') return cap.platform
    return null
  } catch {
    return null
  }
}

const NATIVE_PLATFORM = getNativePlatform()
const IS_NATIVE = !!NATIVE_PLATFORM

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BOwHcCnXaOlM2krFyYhnW0_dAjdIt8067WjNuX1Tsa7uew6tblhFMTuqCEH7XU8BCdleHzMIhPLxEEhy02hs6zA'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

async function registerNativePush(user) {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    let permStatus = await PushNotifications.checkPermissions()
    if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
      permStatus = await PushNotifications.requestPermissions()
    }
    if (permStatus.receive !== 'granted') return { error: 'Permission denied' }

    await PushNotifications.register()

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ error: 'FCM registration timed out' }), 10000)

      PushNotifications.addListener('registration', async (token) => {
        clearTimeout(timeout)
        const { error } = await supabase.from('push_subscriptions').upsert({
          user_id:       user?.id || null,
          endpoint:      token.value,
          p256dh:        'fcm',
          auth:          'fcm',
          user_agent:    navigator.userAgent.substring(0, 200),
          subscribed_at: new Date().toISOString(),
          platform:      NATIVE_PLATFORM || 'android',
        }, { onConflict: 'endpoint' })
        if (error) resolve({ error: error.message })
        else resolve({ success: true })
      })

      PushNotifications.addListener('registrationError', (err) => {
        clearTimeout(timeout)
        resolve({ error: String(err.error || err) })
      })
    })
  } catch (err) {
    return { error: err.message }
  }
}

async function registerWebPush(user) {
  const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  if (!ok) return { error: 'Push not supported in this browser' }
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return { error: 'Permission denied' }
  const reg = await navigator.serviceWorker.ready
  let sub
  try {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  } catch (err) {
    return { error: `Subscription failed: ${err.message}` }
  }
  const subJson = sub.toJSON()
  await supabase.from('push_subscriptions').delete().eq('endpoint', subJson.endpoint)
  const { error } = await supabase.from('push_subscriptions').insert({
    user_id:       user?.id || null,
    endpoint:      subJson.endpoint,
    p256dh:        subJson.keys?.p256dh,
    auth:          subJson.keys?.auth,
    user_agent:    navigator.userAgent.substring(0, 200),
    subscribed_at: new Date().toISOString(),
    platform:      'web',
  })
  if (error) return { error: error.message }
  return { success: true }
}

export function usePushNotifications(user) {
  // Native is always supported — initialise to true so UI shows Enable button immediately
  const [supported, setSupported]   = useState(IS_NATIVE ? true : false)
  const [permission, setPermission] = useState('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (IS_NATIVE) {
      import('@capacitor/push-notifications').then(({ PushNotifications }) => {
        PushNotifications.checkPermissions().then(status => {
          setPermission(status.receive)
          setSubscribed(status.receive === 'granted')
          setSupported(true)
        }).catch(() => setSupported(true))
      }).catch(() => setSupported(true))
    } else {
      const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
      setSupported(ok)
      if (ok) {
        setPermission(Notification.permission)
        navigator.serviceWorker.ready
          .then(reg => reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub)))
          .catch(() => {})
      }
    }
  }, [])

  const subscribe = async () => {
    setLoading(true)
    const result = IS_NATIVE ? await registerNativePush(user) : await registerWebPush(user)
    if (result.success) { setSubscribed(true); setPermission('granted') }
    setLoading(false)
    return result
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      if (IS_NATIVE) {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        await PushNotifications.unregister()
      } else {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          await sub.unsubscribe()
        }
      }
      setSubscribed(false)
      setPermission('default')
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
    setLoading(false)
  }

  return { supported, permission, subscribed, loading, subscribe, unsubscribe }
}
