import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

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

  useEffect(() => {
    if (!supported) return
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    )
  }, [supported])

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
      alert('SW ready. Attempting push subscribe...')
      
      let sub
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
        alert('Push subscribed! Endpoint: ' + sub.endpoint.substring(0, 60))
      } catch(pushErr) {
        alert('pushManager.subscribe FAILED: ' + pushErr.name + ' — ' + pushErr.message)
        throw pushErr
      }

      const subJson = sub.toJSON()

      // Delete any existing row with same endpoint first, then insert fresh
      await supabase.from('push_subscriptions').delete().eq('endpoint', subJson.endpoint)

      const { data, error } = await supabase.from('push_subscriptions').insert({
        user_id: user?.id || null,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
        user_agent: navigator.userAgent.substring(0, 200),
        subscribed_at: new Date().toISOString(),
      }).select()

      if (error) {
        alert('Supabase insert FAILED: ' + error.message + ' code:' + error.code)
        throw new Error(error.message)
      }
      alert('Saved to Supabase! Row: ' + JSON.stringify(data?.[0]?.id))

      setSubscribed(true)
      setLoading(false)
      return { success: true }
    } catch(err) {
      console.error('Subscribe error:', err)
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
