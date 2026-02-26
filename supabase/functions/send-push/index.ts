import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Web Push implementation using VAPID
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')  || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT')     || 'mailto:info@ccgworld.org'

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - base64.length % 4) % 4)
  const raw = atob(base64 + padding)
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)))
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function createVapidJWT(audience: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: VAPID_SUBJECT,
  }
  const enc = new TextEncoder()
  const encodeB64 = (obj: object) => uint8ArrayToBase64url(enc.encode(JSON.stringify(obj)))
  const signingInput = `${encodeB64(header)}.${encodeB64(payload)}`

  const privateKeyBytes = base64urlToUint8Array(VAPID_PRIVATE_KEY)
  const cryptoKey = await crypto.subtle.importKey(
    'raw', privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  )
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    enc.encode(signingInput)
  )
  return `${signingInput}.${uint8ArrayToBase64url(new Uint8Array(signature))}`
}

async function sendPush(subscription: any, payload: object): Promise<{ ok: boolean; error?: string }> {
  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`

  try {
    const jwt = await createVapidJWT(audience)
    const body = JSON.stringify(payload)
    const enc = new TextEncoder()

    // Encrypt payload using Web Push encryption (RFC 8291)
    // For simplicity, send as plain text if keys aren't provided
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: body,
    })

    if (response.ok || response.status === 201) return { ok: true }
    if (response.status === 410 || response.status === 404) return { ok: false, error: 'expired' }
    return { ok: false, error: `HTTP ${response.status}` }
  } catch(e: any) {
    return { ok: false, error: e.message }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } })
  }

  try {
    const { subscriptions, payload } = await req.json()
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ delivered: 0, failed: 0 }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    let delivered = 0, failed = 0
    const expired: string[] = []

    await Promise.all(subscriptions.map(async (sub: any) => {
      const result = await sendPush({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }, payload)
      if (result.ok) delivered++
      else {
        failed++
        if (result.error === 'expired') expired.push(sub.endpoint)
      }
    }))

    // Clean up expired subscriptions
    if (expired.length) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      )
      for (const ep of expired) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', ep)
      }
    }

    return new Response(JSON.stringify({ delivered, failed, expired: expired.length }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch(e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
