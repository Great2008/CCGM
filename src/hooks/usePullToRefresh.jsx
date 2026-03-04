/**
 * usePullToRefresh.jsx
 * Pull-to-refresh for Capacitor WebView.
 */
import { useEffect, useRef, useState, useCallback } from 'react'

const THRESHOLD  = 65   // px needed to trigger refresh
const MAX_PULL   = 100  // max visual pull distance

export function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY]         = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const startY    = useRef(0)
  const currentY  = useRef(0)
  const active    = useRef(false)
  const triggered = useRef(false)

  const doRefresh = useCallback(async () => {
    if (triggered.current) return
    triggered.current = true
    setRefreshing(true)
    setPullY(0)
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics').catch(() => ({}))
      await Haptics?.impact?.({ style: ImpactStyle?.MEDIUM })
      await onRefresh()
    } catch {}
    setRefreshing(false)
    triggered.current = false
    active.current = false
  }, [onRefresh])

  useEffect(() => {
    const onTouchStart = (e) => {
      // Only activate when scrolled to top
      if (window.scrollY > 2) return
      startY.current  = e.touches[0].clientY
      currentY.current = e.touches[0].clientY
      active.current  = true
    }

    const onTouchMove = (e) => {
      if (!active.current || refreshing) return
      currentY.current = e.touches[0].clientY
      const dy = currentY.current - startY.current
      if (dy > 0) {
        // Apply resistance so it feels natural
        const pull = Math.min(dy * 0.5, MAX_PULL)
        setPullY(pull)
      } else {
        setPullY(0)
      }
    }

    const onTouchEnd = () => {
      if (!active.current) return
      const dy = currentY.current - startY.current
      if (dy * 0.5 >= THRESHOLD) {
        doRefresh()
      } else {
        active.current = false
        setPullY(0)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove',  onTouchMove,  { passive: true })
    document.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove',  onTouchMove)
      document.removeEventListener('touchend',   onTouchEnd)
    }
  }, [doRefresh, refreshing])

  const showing = pullY > 4 || refreshing
  const progress = Math.min(pullY / THRESHOLD, 1)
  const rotation = refreshing ? undefined : progress * 200

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Spinner */}
      <div style={{
        position: 'fixed',
        top: 66,
        left: '50%',
        transform: `translateX(-50%) translateY(${refreshing ? 14 : Math.min(pullY - 20, 14)}px)`,
        zIndex: 900,
        pointerEvents: 'none',
        opacity: showing ? 1 : 0,
        transition: refreshing ? 'transform 0.2s ease, opacity 0.15s' : 'opacity 0.15s',
      }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 3px 14px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: refreshing ? 'ptr-spin 0.75s linear infinite' : 'none',
          transform: refreshing ? 'none' : `rotate(${rotation}deg)`,
          transition: refreshing ? 'none' : 'transform 0.05s',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </div>
      </div>

      {/* Page content pushed down while pulling */}
      <div style={{
        transform: showing ? `translateY(${refreshing ? 52 : Math.min(pullY, MAX_PULL) * 0.4}px)` : 'none',
        transition: refreshing || pullY === 0 ? 'transform 0.25s ease' : 'none',
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
