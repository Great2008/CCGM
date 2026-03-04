/**
 * usePullToRefresh.jsx
 * Native pull-to-refresh for Capacitor — works like every other mobile app.
 * Usage: wrap your page content with <PullToRefresh onRefresh={loadData} />
 */
import { useEffect, useRef, useState, useCallback } from 'react'

const THRESHOLD   = 80   // px pulled before refresh triggers
const MAX_PULL    = 120  // max pull distance
const RESISTANCE  = 0.4  // pull resistance factor

export function usePullToRefresh(onRefresh) {
  const [pulling, setPulling]     = useState(false)
  const [pullY, setPullY]         = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY  = useRef(0)
  const active  = useRef(false)

  const doRefresh = useCallback(async () => {
    setRefreshing(true)
    setPullY(0)
    try {
      // Haptic feedback
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics').catch(() => ({}))
      Haptics?.impact?.({ style: ImpactStyle?.MEDIUM })
      await onRefresh()
    } catch {}
    setRefreshing(false)
    setPulling(false)
  }, [onRefresh])

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
        active.current = true
      }
    }

    const onTouchMove = (e) => {
      if (!active.current) return
      const dy = (e.touches[0].clientY - startY.current) * RESISTANCE
      if (dy > 0) {
        setPulling(true)
        setPullY(Math.min(dy, MAX_PULL))
      }
    }

    const onTouchEnd = () => {
      if (!active.current) return
      active.current = false
      if (pullY >= THRESHOLD * RESISTANCE) {
        doRefresh()
      } else {
        setPulling(false)
        setPullY(0)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove',  onTouchMove,  { passive: true })
    document.addEventListener('touchend',   onTouchEnd)
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove',  onTouchMove)
      document.removeEventListener('touchend',   onTouchEnd)
    }
  }, [pullY, doRefresh])

  return { pulling, pullY, refreshing }
}

// ── Drop-in component ────────────────────────────────────────────────
export function PullToRefresh({ onRefresh, children }) {
  const { pulling, pullY, refreshing } = usePullToRefresh(onRefresh)
  const progress = Math.min(pullY / (80 * 0.4), 1)

  return (
    <div style={{ position: 'relative' }}>
      {/* Pull indicator */}
      {(pulling || refreshing) && (
        <div style={{
          position: 'fixed', top: 66, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          transform: `translateY(${refreshing ? 12 : pullY - 10}px)`,
          transition: refreshing ? 'transform 0.2s' : 'none',
          zIndex: 800, pointerEvents: 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            transform: `rotate(${refreshing ? 0 : progress * 180}deg)`,
            animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
            transition: 'transform 0.1s',
          }}>
            {refreshing ? '⟳' : '↓'}
          </div>
        </div>
      )}
      {children}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}
