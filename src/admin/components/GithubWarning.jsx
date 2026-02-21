import { isConfigured } from '../github'
export default function GithubWarning() {
  if (isConfigured()) return null
  return (
    <div style={{ background: '#fff9e6', border: '1.5px solid #ffe066', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: '0.88rem', color: '#665500', lineHeight: 1.7 }}>
      <strong>⚠️ GitHub not configured.</strong> Content saves will not persist to your site.<br />
      Add these to your <strong>Vercel Environment Variables</strong>:<br />
      <code style={{ background: '#fff3cc', padding: '2px 6px', borderRadius: 4, marginRight: 6 }}>VITE_GH_TOKEN</code>
      <code style={{ background: '#fff3cc', padding: '2px 6px', borderRadius: 4, marginRight: 6 }}>VITE_GH_OWNER</code>
      <code style={{ background: '#fff3cc', padding: '2px 6px', borderRadius: 4, marginRight: 6 }}>VITE_GH_REPO</code>
      <code style={{ background: '#fff3cc', padding: '2px 6px', borderRadius: 4 }}>VITE_GH_BRANCH</code>
    </div>
  )
}
