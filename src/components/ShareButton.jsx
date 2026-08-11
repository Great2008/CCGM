import { useState } from 'react'

/**
 * shareNative — tries @capacitor/share first (guaranteed native sheet on Android/iOS),
 * falls back to Web Share API, then clipboard copy.
 *
 * Image attachment (imageUrl) is best-effort at every layer and never blocks
 * the actual share — if it fails for any reason, we silently fall through to
 * a text/link-only share rather than error out.
 */

// Native path: Capacitor's Share plugin can only attach local file:// URIs,
// not remote URLs or in-memory blobs directly — so we fetch the image,
// write it to the app's cache directory via @capacitor/filesystem, and hand
// Share the resulting on-device URI. (Confirmed pattern per Capacitor's own
// Share plugin docs/issue tracker — there's no direct blob/base64 share.)
async function prepareNativeImageFile(imageUrl) {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    const res = await fetch(imageUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) return null
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const ext = (blob.type.split('/')[1] || 'jpg').split('+')[0]
    const fileName = `share-image-${Date.now()}.${ext}`
    await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Cache })
    const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache })
    return uri
  } catch {
    return null
  }
}

// Web Share API path (browser/PWA) — attaches the image as a File if the
// browser supports file-sharing and the image host allows cross-origin fetch.
async function prepareWebImageFile(imageUrl) {
  try {
    const res = await fetch(imageUrl, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) return null
    const ext = (blob.type.split('/')[1] || 'jpg').split('+')[0]
    const file = new File([blob], `share-image.${ext}`, { type: blob.type })
    if (navigator.canShare && navigator.canShare({ files: [file] })) return file
    return null
  } catch {
    return null
  }
}

async function shareNative(shareData, imageUrl) {
  // 1. Capacitor Share (native Android/iOS share sheet)
  try {
    const { Share } = await import('@capacitor/share')
    const { value } = await Share.canShare()
    if (value) {
      const fileUri = imageUrl ? await prepareNativeImageFile(imageUrl) : null
      await Share.share({
        title:       shareData.title,
        text:        shareData.text,
        url:         shareData.url,
        dialogTitle: shareData.title,
        ...(fileUri ? { files: [fileUri] } : {}),
      })
      return 'shared'
    }
  } catch {}

  // 2. Web Share API (PWA / browser)
  if (navigator.share) {
    try {
      const imageFile = imageUrl ? await prepareWebImageFile(imageUrl) : null
      await navigator.share(imageFile ? { ...shareData, files: [imageFile] } : shareData)
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'
    }
  }

  // 3. Clipboard fallback (desktop)
  try {
    await navigator.clipboard.writeText(shareData.url || shareData.text || '')
    return 'copied'
  } catch {}

  return 'failed'
}

export default function ShareButton({ title, text, url, imageUrl, label = 'Share', variant = 'full', suffix = 'Read more on CCG World', style: extraStyle = {} }) {
  const [state, setState] = useState('idle')

  const shareData = {
    title: title || 'CCG World',
    text:  text ? `${text}\n\n${suffix}` : 'Check this out on CCG World',
    url:   url || window.location.href,
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    if (state === 'sharing') return
    setState('sharing')
    const result = await shareNative(shareData, imageUrl)
    if (result === 'copied') {
      setState('copied')
      setTimeout(() => setState('idle'), 2500)
    } else {
      setState('idle')
    }
  }

  const copied = state === 'copied'

  return (
    <button onClick={handleShare} title="Share" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: variant === 'icon-only' ? '8px' : '8px 16px',
      borderRadius: 30, border: '1.5px solid',
      borderColor: copied ? '#22c55e' : 'rgba(255,255,255,0.3)',
      background:   copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.1)',
      color:        copied ? '#22c55e' : 'white',
      fontSize: '0.8rem', fontWeight: 700,
      cursor: 'pointer', fontFamily: 'var(--font-body)',
      transition: 'all 0.2s', flexShrink: 0,
      ...extraStyle,
    }}>
      {copied ? '✅' : '↗'}
      {variant !== 'icon-only' && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  )
}

export function ShareButtonLight({ title, text, url, imageUrl, label = 'Share', suffix = 'Read more on CCG World', style: extraStyle = {} }) {
  const [state, setState] = useState('idle')

  const shareData = {
    title: title || 'CCG World',
    text:  text ? `${text}\n\n${suffix}` : 'Check this out on CCG World',
    url:   url || window.location.href,
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    if (state === 'sharing') return
    setState('sharing')
    const result = await shareNative(shareData, imageUrl)
    if (result === 'copied') {
      setState('copied')
      setTimeout(() => setState('idle'), 2500)
    } else {
      setState('idle')
    }
  }

  const copied = state === 'copied'

  return (
    <button onClick={handleShare} title="Share" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 16px', borderRadius: 30, border: '1.5px solid',
      borderColor: copied ? '#22c55e' : '#e2e8f0',
      background:   copied ? '#f0fdf4' : 'white',
      color:        copied ? '#16a34a' : 'var(--text-mid)',
      fontSize: '0.8rem', fontWeight: 700,
      cursor: 'pointer', fontFamily: 'var(--font-body)',
      transition: 'all 0.2s', flexShrink: 0,
      ...extraStyle,
    }}>
      {copied ? '✅' : '↗'}
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  )
}
