import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// ── VAPID config ───────────────────────────────────────────────────
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')  || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT')     || 'mailto:info@ccgworld.org'

// ── Helpers ────────────────────────────────────────────────────────
function b64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - b64url.length % 4) % 4)
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

function bytesToB64url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── VAPID JWT ──────────────────────────────────────────────────────
async function makeVapidJWT(audience: string): Promise<string> {
  const enc = new TextEncoder()
  const encObj = (o: object) => bytesToB64url(enc.encode(JSON.stringify(o)))
  const header  = encObj({ typ: 'JWT', alg: 'ES256' })
  const payload = encObj({ aud: audience, exp: Math.floor(Date.now() / 1000) + 43200, sub: VAPID_SUBJECT })
  const sigInput = `${header}.${payload}`

  const privKey = await crypto.subtle.importKey(
    'raw', b64urlToBytes(VAPID_PRIVATE_KEY),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, enc.encode(sigInput))
  return `${sigInput}.${bytesToB64url(new Uint8Array(sig))}`
}

// ── Web Push Encryption (RFC 8291 / RFC 8188 aes128gcm) ────────────
async function encryptPayload(
  plaintext: string,
  p256dh: string,
  auth: string,
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const enc = new TextEncoder()

  // Recipient public key
  const recipientPubKey = await crypto.subtle.importKey(
    'raw', b64urlToBytes(p256dh),
    { name: 'ECDH', namedCurve: 'P-256' }, true, []
  )
  const authSecret = b64urlToBytes(auth)

  // Generate ephemeral server key pair
  const serverKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits'])
  const serverPubKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeyPair.publicKey))

  // ECDH shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: recipientPubKey }, serverKeyPair.privateKey, 256
  )
  const sharedSecret = new Uint8Array(sharedSecretBits)

  // Random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // HKDF to derive PRK from auth
  const prkKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits'])
  const prkInfo = concat(enc.encode('WebPush: info\0'), b64urlToBytes(p256dh), serverPubKeyRaw)
  const prk = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: prkInfo }, prkKey, 256
  ))

  // Derive CEK and nonce
  const prkAsKey = await crypto.subtle.importKey('raw', prk, { name: 'HKDF' }, false, ['deriveBits'])
  const cekInfo   = enc.encode('Content-Encoding: aes128gcm\0')
  const nonceInfo = enc.encode('Content-Encoding: nonce\0')

  const cek   = new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo   }, prkAsKey, 128))
  const nonce = new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, prkAsKey, 96))

  // Encrypt: pad plaintext + 0x02 delimiter
  const plaintextBytes = enc.encode(plaintext)
  const padded = new Uint8Array(plaintextBytes.length + 1)
  padded.set(plaintextBytes)
  padded[plaintextBytes.length] = 0x02 // delimiter

  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt'])
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded))

  // Build aes128gcm content-encoding header (salt[16] + rs[4] + keylen[1] + serverPubKey[65])
  const rs = 4096
  const header = new Uint8Array(16 + 4 + 1 + serverPubKeyRaw.length)
  header.set(salt, 0)
  new DataView(header.buffer).setUint32(16, rs, false)
  header[20] = serverPubKeyRaw.length
  header.set(serverPubKeyRaw, 21)

  return {
    ciphertext: concat(header, encrypted),
    salt,
    serverPublicKey: serverPubKeyRaw,
  }
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

// ── Send one push message ──────────────────────────────────────────
async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payloadObj: object): Promise<{ ok: boolean; error?: string }> {
  const url      = new URL(sub.endpoint)
  const audience = `${url.protocol}//${url.host}`

  try {
    const jwt = await makeVapidJWT(audience)
    const payloadStr = JSON.stringify(payloadObj)

    let body: Uint8Array
    let contentEncoding = 'aes128gcm'
    let extraHeaders: Record<string, string> = {}

    if (sub.p256dh && sub.auth) {
      const { ciphertext } = await encryptPayload(payloadStr, sub.p256dh, sub.auth)
      body = ciphertext
    } else {
      // Fallback: unencrypted (will likely be rejected by modern push services)
      body = new TextEncoder().encode(payloadStr)
      contentEncoding = 'identity'
    }

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization':      `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
        'Content-Encoding':   contentEncoding,
        'Content-Type':       'application/octet-stream',
        'TTL':                '86400',
        ...extraHeaders,
      },
      body,
    })

    if (res.ok || res.status === 201) return { ok: true }
    if (res.status === 410 || res.status === 404) return { ok: false, error: 'expired' }
    const text = await res.text().catch(() => '')
    return { ok: false, error: `HTTP ${res.status}: ${text.substring(0, 120)}` }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

// ── Edge Function entry ────────────────────────────────────────────
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { subscriptions, payload } = await req.json()

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ delivered: 0, failed: 0 }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    let delivered = 0, failed = 0
    const expired: string[] = []

    await Promise.all(subscriptions.map(async (sub: any) => {
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
      )
      if (result.ok) {
        delivered++
      } else {
        failed++
        console.error(`Push failed for ${sub.endpoint.substring(0, 60)}: ${result.error}`)
        if (result.error === 'expired') expired.push(sub.endpoint)
      }
    }))

    // Clean up expired subscriptions
    if (expired.length) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      )
      for (const ep of expired) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', ep)
      }
    }

    return new Response(JSON.stringify({ delivered, failed, expired: expired.length }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e: any) {
    console.error('send-push error:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
