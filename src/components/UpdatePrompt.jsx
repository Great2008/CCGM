/**
 * UpdatePrompt.jsx
 * Shows a bottom sheet prompt when a new app version is available.
 * Non-blocking — user can dismiss and continue using the app.
 */
import { useAppUpdate } from '../hooks/useAppUpdate'

export default function UpdatePrompt() {
  const { updateAvailable, latestVersion, dismiss, openDownload } = useAppUpdate()

  if (!updateAvailable) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 9001,
        background: 'white',
        borderRadius: '24px 24px 0 0',
        padding: '32px 28px 48px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {/* Handle bar */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: '#e2e8f0',
          margin: '-16px auto 24px',
        }} />

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', marginBottom: 16,
          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
        }}>
          🤖
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem', fontWeight: 900,
          color: 'var(--brand-deep)',
          margin: '0 0 8px',
        }}>
          Update Available!
        </h2>

        <p style={{
          color: 'var(--text-mid)', fontSize: '0.92rem',
          lineHeight: 1.7, margin: '0 0 8px',
        }}>
          A new version of CCG World is ready. Update now to get the latest features and improvements.
        </p>

        {latestVersion && (
          <div style={{
            display: 'inline-block',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700,
            color: '#16a34a', marginBottom: 24,
          }}>
            ✨ New version: {latestVersion}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={openDownload}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white', fontWeight: 900, fontSize: '1rem',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
          >
            ⬇️ Download Update
          </button>

          <button
            onClick={dismiss}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 14,
              border: '1.5px solid #e2e8f0',
              background: 'white',
              color: 'var(--text-mid)', fontWeight: 600,
              fontSize: '0.9rem', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Remind me later
          </button>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '0.7rem',
          color: 'var(--text-light)', marginTop: 14, marginBottom: 0,
        }}>
          You'll be reminded again in 24 hours
        </p>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  )
}
