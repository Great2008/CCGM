// SEO.jsx — mobile app stub.
// The main PWA's SEO.jsx manages document <head> meta tags (title, Open
// Graph, Twitter Card, canonical link) via react-helmet-async — all of that
// targets a browser tab and social-media link crawlers, neither of which
// exist inside a Capacitor WebView. Rather than pull in react-helmet-async
// for zero user-visible benefit here, this is a lightweight stub with the
// same prop signature, so pages copied over from the main site work without
// modification. It only sets document.title, which is harmless and cheap.
import { useEffect } from 'react'

export default function SEO({ title }) {
  useEffect(() => {
    if (title) document.title = `${title} | CCG World`
  }, [title])
  return null
}
