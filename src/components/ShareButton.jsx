import { useState } from 'react'

/**
 * shareNative — tries @capacitor/share first (guaranteed native sheet on Android/iOS),
 * falls back to Web Share API, then clipboard copy.
 */
async function shareNative(shareData) {
  // 1. Capacitor Share (native Android/iOS share sheet)
  try {
    const { Share } = await import('@capacitor/share')
    const { value } = await Share.canShare()
    if (value) {
      await Share.share({
        title:       shareData.title,
        text:        shareData.text,
        url:         shareData.url,
        dialogTitle: shareData.title,
      })
      return 'shared'
    }
  } catch {}

  // 2. Web Share API (PWA / browser)
  if (navigator.share) {
    try {
      await navigator.share(shareData)
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

export default function ShareButton({ title, text, url, label = 'Share', variant = 'full', style: extraStyle = {} }) {
  const [state, setState] = useState('idle')

  const shareData = {
    title: title || 'CCG World',
    text:  text ? `${text}\n\nRead more on CCG World` : 'Check this out on CCG World',
    url:   url || window.location.href,
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    if (state === 'sharing') return
    setState('sharing')
    const result = await shareNative(shareData)
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

export function ShareButtonLight({ title, text, url, label = 'Share', style: extraStyle = {} }) {
  const [state, setState] = useState('idle')

  const shareData = {
    title: title || 'CCG World',
    text:  text ? `${text}\n\nRead more on CCG World` : 'Check this out on CCG World',
    url:   url || window.location.href,
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    if (state === 'sharing') return
    setState('sharing')
    const result = await shareNative(shareData)
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
