import { useState, useEffect } from 'react'

export const DEFAULTS = {
  homepage: {
    hero: {
      title: 'Welcome to Christian Church Of God Mission',
      subtitle: 'A community rooted in faith, love, and the Word of God. Join us as we worship, grow, and serve together.',
      ctaText: 'Join Us This Saturday',
      ctaLink: '/events',
    },
    announcement: { show: false, text: '' },
    serviceTimes: [
      { day: 'Sunday',    name: 'Meetings of Different Bodies', time: '', icon: '🤝' },
      { day: 'Monday',    name: "Children's Prayer",            time: '', icon: '🙏' },
      { day: 'Tuesday',   name: 'Bible Study',                  time: '', icon: '📖' },
      { day: 'Wednesday', name: 'Midweek Service',              time: '', icon: '⛪' },
      { day: 'Thursday',  name: 'Deliverance Service',          time: '', icon: '🔥' },
      { day: 'Friday',    name: 'Sabbath Preparation',          time: '', icon: '✨' },
      { day: 'Saturday',  name: 'Divine Service',               time: '', icon: '🌟' },
    ],
    stats: [
      { label: 'Years of Ministry', value: '25+' },
      { label: 'Active Members',    value: '500+' },
      { label: 'Weekly Services',   value: '7' },
      { label: 'Countries Reached', value: '12+' },
    ],
    contact: { address: '', phone: '', email: 'info@ccogm.org', mapUrl: '' },
  },
}

const CACHE = 'ccogm_content_'

async function fetchContent(filename) {
  const key = CACHE + filename
  try {
    const res = await fetch(`/content/${filename}?t=${Date.now()}`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
    return data
  } catch {
    try { const c = localStorage.getItem(key); if (c) return JSON.parse(c) } catch {}
    return null
  }
}

export function useHomepageContent() {
  const [data, setData] = useState(DEFAULTS.homepage)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchContent('homepage.json').then(d => {
      if (d) setData(prev => ({ ...prev, ...d, serviceTimes: d.serviceTimes || prev.serviceTimes }))
      setLoading(false)
    })
  }, [])
  return { data, loading }
}

export function useSermonsContent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchContent('sermons.json').then(d => { if (d) setData(d); setLoading(false) }) }, [])
  return { data, loading }
}

export function useEventsContent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchContent('events.json').then(d => { if (d) setData(d); setLoading(false) }) }, [])
  return { data, loading }
}

export function useBlogContent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchContent('blog.json').then(d => { if (d) setData(d); setLoading(false) }) }, [])
  return { data, loading }
}

export function useGalleryContent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchContent('gallery.json').then(d => { if (d) setData(d); setLoading(false) }) }, [])
  return { data, loading }
}
