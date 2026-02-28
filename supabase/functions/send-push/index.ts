import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')  || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT')     || 'mailto:info@ccgworld.org'

function b64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - b64url.length % 4) % 4)
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

function bytesToB64url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Build a valid PKCS#8 DER for a raw P-256 private key scalar (32 bytes)
// Verified structure for Web Crypto importKey('pkcs8', ...)
function buildPkcs8(rawPriv: Uint8Array): Uint8Array {
  // ECPrivateKey (RFC 5915)
  const ecPrivSeq = new Uint8Array([
    0x30, 0x31,             // SEQUENCE, 49 bytes
      0x02, 0x01, 0x01,     // INTEGER version = 1
      0x04, 0x20,           // OCTET STRING, 32 bytes
        ...rawPriv,         // the raw key
      0xa0, 0x0a,           // [0] EXPLICIT
        0x06, 0x08,         // OID, 8 bytes
          0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07 // P-256
  ])

  // AlgorithmIdentifier for id-ecPublicKey + P-256
  const algId = new Uint8Array([
    0x30, 0x13,             // SEQUENCE, 19 bytes
      0x06, 0x07,           // OID, 7 bytes
        0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // id-ecPublicKey
      0x06, 0x08,           // OID, 8 bytes
        0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07 // P-256
  ])

  // PrivateKeyInfo (RFC 5958) = SEQUENCE { version, algId, OCTET STRING { ecPrivSeq } }
  const privKeyOctet = new Uint8Array(2 + ecPrivSeq.length)
  privKeyOctet[0] = 0x04             // OCTET STRING
  privKeyOctet[1] = ecPrivSeq.length
  privKeyOctet.set(ecPrivSeq, 2)

  const inner = new Uint8Array(3 + algId.length + privKeyOctet.length)
  inner[0] = 0x02; inner[1] = 0x01; inner[2] = 0x00  // version = 0
  inner.set(algId, 3)
  inner.set(privKeyOctet, 3 + algId.length)

  const pkcs8 = new Uint8Array(2 + inner.length)
  pkcs8[0] = 0x30            // SEQUENCE
  pkcs8[1] = inner.length    // length (fits in 1 byte: 3+21+2+51 = 77 < 128)
  pkcs8.set(inner, 2)
  return pkcs8
}

async function makeVapidJWT(audience: string): Promise<string> {
  const enc = new TextEncoder()
  const encObj = (o: object) => bytesToB64url(enc.encode(JSON.stringify(o)))
  const header  = encObj({ typ: 'JWT', alg: 'ES256' })
  const payload = encObj({ aud: audience, exp: Math.floor(Date.now() / 1000) + 43200, sub: VAPID_SUBJECT })
  const sigInput = `${header}.${payload}`

  const pkcs8   = buildPkcs8(b64urlToBytes(VAPID_PRIVATE_KEY))
  const privKey = await crypto.subtle.importKey(
    'pkcs8', pkcs8,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, enc.encode(sigInput))
  return `${sigInput}.${bytesToB64url(new Uint8Array(sig))}`
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

async function encryptPayload(plaintext: string, p256dh: string, auth: string): Promise<Uint8Array> {
  const enc = new TextEncoder()

  const recipientPubKey = await crypto.subtle.importKey(
    'raw', b64urlToBytes(p256dh),
    { name: 'ECDH', namedCurve: 'P-256' }, true, []
  )
  const authSecret  = b64urlToBytes(auth)
  const serverKP    = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits'])
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKP.publicKey))
  const sharedBits  = await crypto.subtle.deriveBits({ name: 'ECDH', public: recipientPubKey }, serverKP.privateKey, 256)
  const sharedSecret = new Uint8Array(sharedBits)
  const salt         = crypto.getRandomValues(new Uint8Array(16))

  const prkKey  = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits'])
  const prkInfo = concat(enc.encode('WebPush: info\0'), b64urlToBytes(p256dh), serverPubRaw)
  const prk     = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: prkInfo }, prkKey, 256
  ))

  const prkAsKey  = await crypto.subtle.importKey('raw', prk, { name: 'HKDF' }, false, ['deriveBits'])
  const cek   = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('Content-Encoding: aes128gcm\0') }, prkAsKey, 128
  ))
  const nonce = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('Content-Encoding: nonce\0') }, prkAsKey, 96
  ))

  const plain  = enc.encode(plaintext)
  const padded = new Uint8Array(plain.length + 1)
  padded.set(plain); padded[plain.length] = 0x02

  const aesKey    = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt'])
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded))

  // aes128gcm content-encoding header
  const hdr = new Uint8Array(16 + 4 + 1 + serverPubRaw.length)
  hdr.set(salt, 0)
  new DataView(hdr.buffer).setUint32(16, 4096, false)
  hdr[20] = serverPubRaw.length
  hdr.set(serverPubRaw, 21)

  return concat(hdr, encrypted)
}

async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payloadObj: object): Promise<{ ok: boolean; error?: string }> {
  const url      = new URL(sub.endpoint)
  const audience = `${url.protocol}//${url.host}`
  try {
    const jwt  = await makeVapidJWT(audience)
    const body = await encryptPayload(JSON.stringify(payloadObj), sub.p256dh, sub.auth)
    const res  = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization':    `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
        'Content-Encoding': 'aes128gcm',
        'Content-Type':     'application/octet-stream',
        'TTL':              '86400',
      },
      body,
    })
    if (res.ok || res.status === 201) return { ok: true }
    if (res.status === 410 || res.status === 404) return { ok: false, error: 'expired' }
    const text = await res.text().catch(() => '')
    return { ok: false, error: `HTTP ${res.status}: ${text.substring(0, 200)}` }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    const { subscriptions, payload } = await req.json()
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ delivered: 0, failed: 0 }), { headers: { 'Content-Type': 'application/json', ...cors } })
    }

    let delivered = 0, failed = 0
    const expired: string[] = []

    await Promise.all(subscriptions.map(async (sub: any) => {
      const result = await sendPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, payload)
      if (result.ok) {
        delivered++
      } else {
        failed++
        console.error(`Push failed for ${sub.endpoint.substring(0, 60)}: ${result.error}`)
        if (result.error === 'expired') expired.push(sub.endpoint)
      }
    }))

    if (expired.length) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const sb = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
      for (const ep of expired) await sb.from('push_subscriptions').delete().eq('endpoint', ep)
    }

    return new Response(JSON.stringify({ delivered, failed, expired: expired.length }), {
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  } catch (e: any) {
    console.error('send-push error:', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors } })
  }
})
