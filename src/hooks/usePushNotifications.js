import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

// Your VAPID public key — also set this in Vercel env as VITE_VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'EH0Ewi8UZP4Jjflxsdm0363_I3SalbXHht3cruC-0GDZKwdkAIxehmW1NcwKfqkh-o5JR957slYk3dyPQF87Pw'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushNotifications(user) {
  const [permission, setPermission] = useState('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [supported, setSupported]   = useState(false)

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setSupported(ok)
    if (ok) setPermission(Notification.permission)
  }, [])

  // Check if already subscribed
  useEffect(() => {
    if (!supported || !user) return
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    )
  }, [supported, user])

  const subscribe = async () => {
    if (!supported) return { error: 'Push notifications not supported in this browser' }
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setLoading(false)
        return { error: 'Permission denied' }
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Save subscription to Supabase
      const subJson = sub.toJSON()
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user?.id || null,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
        user_agent: navigator.userAgent.substring(0, 200),
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' })

      if (error) throw error
      setSubscribed(true)
      setLoading(false)
      return { success: true }
    } catch(err) {
      setLoading(false)
      return { error: err.message }
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch(err) { console.error(err) }
    setLoading(false)
  }

  return { supported, permission, subscribed, loading, subscribe, unsubscribe }
}
