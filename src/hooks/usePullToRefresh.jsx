/**
 * usePullToRefresh.jsx
 * Pull-to-refresh using a container ref instead of document events.
 * More reliable in Capacitor WebView.
 */
import { useEffect, useRef, useState, useCallback } from 'react'

const THRESHOLD = 65
const MAX_PULL  = 100

export function PullToRefresh({ onRefresh, children }) {
  const containerRef  = useRef(null)
  const startY        = useRef(0)
  const currentY      = useRef(0)
  const active        = useRef(false)
  const triggered     = useRef(false)
  const [pullY, setPullY]           = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const refreshingRef = useRef(false)

  const doRefresh = useCallback(async () => {
    if (triggered.current) return
    triggered.current  = true
    refreshingRef.current = true
    setRefreshing(true)
    setPullY(0)
    try {
      const mod = await import('@capacitor/haptics').catch(() => null)
      if (mod) await mod.Haptics.impact({ style: mod.ImpactStyle.Medium })
    } catch {}
    try { await onRefresh() } catch {}
    refreshingRef.current = false
    setRefreshing(false)
    triggered.current = false
    active.current    = false
  }, [onRefresh])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e) => {
      if (refreshingRef.current) return
      // Only trigger when scrolled to very top
      const scrollTop = el.scrollTop || window.scrollY || document.documentElement.scrollTop
      if (scrollTop > 2) return
      startY.current   = e.touches[0].clientY
      currentY.current = e.touches[0].clientY
      active.current   = true
    }

    const onTouchMove = (e) => {
      if (!active.current || refreshingRef.current) return
      currentY.current = e.touches[0].clientY
      const dy = currentY.current - startY.current
      if (dy > 0) {
        setPullY(Math.min(dy * 0.45, MAX_PULL))
      } else {
        // Scrolling up — deactivate
        active.current = false
        setPullY(0)
      }
    }

    const onTouchEnd = () => {
      if (!active.current || refreshingRef.current) return
      const dy = currentY.current - startY.current
      if (dy * 0.45 >= THRESHOLD) {
        doRefresh()
      } else {
        active.current = false
        setPullY(0)
      }
    }

    // Use both element and window to capture reliably
    el.addEventListener('touchstart',  onTouchStart, { passive: true })
    el.addEventListener('touchmove',   onTouchMove,  { passive: true })
    el.addEventListener('touchend',    onTouchEnd,   { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart',  onTouchStart)
      el.removeEventListener('touchmove',   onTouchMove)
      el.removeEventListener('touchend',    onTouchEnd)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [doRefresh])

  const showing  = pullY > 4 || refreshing
  const progress = Math.min(pullY / THRESHOLD, 1)

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Spinner indicator */}
      <div style={{
        position: 'fixed',
        top: 66,
        left: '50%',
        transform: `translateX(-50%) translateY(${
          refreshing ? 14 : Math.max(pullY - 24, -20)
        }px)`,
        zIndex: 1100,
        pointerEvents: 'none',
        opacity: showing ? 1 : 0,
        transition: refreshing ? 'opacity 0.15s' : 'opacity 0.1s',
      }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: refreshing ? 'ptr-spin 0.7s linear infinite' : 'none',
          transform: refreshing ? 'none' : `rotate(${progress * 220}deg)`,
          transition: 'transform 0.05s linear',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={refreshing ? '#16a34a' : '#2563eb'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </div>
      </div>

      {/* Content — slides down while pulling */}
      <div style={{
        transform: showing
          ? `translateY(${refreshing ? 48 : Math.min(pullY * 0.4, 40)}px)`
          : 'none',
        transition: (refreshing || pullY === 0) ? 'transform 0.3s cubic-bezier(0.4,0,0.2,1)' : 'none',
        willChange: 'transform',
      }}>
        {children}
      </div>

      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
