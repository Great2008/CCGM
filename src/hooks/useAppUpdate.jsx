/**
 * useAppUpdate.jsx
 * Checks GitHub Releases API on app launch.
 * Compares bundled version.json against the GitHub release name (set by workflow).
 * If different, prompts user to update.
 */
import { useState, useEffect } from 'react'

const GITHUB_REPO  = 'Great2008/CCGM'
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/latest`
const APK_DOWNLOAD = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/apk/CCGWorld-latest.apk`
const VERSION_FILE = '/version.json'
const SNOOZE_KEY   = 'ccg-update-snoozed'
const SNOOZE_HOURS = 24

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [latestVersion,   setLatestVersion]   = useState(null)
  const [dismissed,       setDismissed]       = useState(false)

  useEffect(() => {
    // Respect snooze
    const snoozed = localStorage.getItem(SNOOZE_KEY)
    if (snoozed) {
      const hoursSince = (Date.now() - new Date(snoozed)) / (1000 * 60 * 60)
      if (hoursSince < SNOOZE_HOURS) return
    }

    const check = async () => {
      try {
        // 1. Bundled version (written by workflow at build time)
        const localRes = await fetch(VERSION_FILE + '?t=' + Date.now())
        const local    = await localRes.json()
        const installed = local.version

        // 2. Latest release from GitHub — version is stored in release `name`
        const ghRes  = await fetch(RELEASES_API)
        const ghData = await ghRes.json()

        // release name is set to VERSION by workflow e.g. "2026.04.12-abc1234"
        const remote = ghData.name || ''
        setLatestVersion(remote)

        // 3. Compare — different means a new build is available
        if (remote && installed && remote !== installed) {
          setUpdateAvailable(true)
        }
      } catch (err) {
        console.warn('Update check failed:', err)
      }
    }

    // Delay 6s so it doesn't compete with splash / app load
    const timer = setTimeout(check, 6000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem(SNOOZE_KEY, new Date().toISOString())
    setDismissed(true)
  }

  const openDownload = () => {
    window.open(APK_DOWNLOAD, '_blank')
    dismiss()
  }

  return {
    updateAvailable: updateAvailable && !dismissed,
    latestVersion,
    dismiss,
    openDownload,
  }
}
