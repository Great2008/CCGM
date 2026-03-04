/**
 * useAppUpdate.jsx
 * Checks GitHub Releases API on app launch.
 * If a newer version is available, returns updateAvailable: true
 * and the download URL for the new APK.
 */
import { useState, useEffect } from 'react'

const GITHUB_REPO    = 'Great2008/CCGM'
const RELEASES_API   = `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/latest`
const APK_DOWNLOAD   = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/apk/CCGWorld-latest.apk`
const VERSION_FILE   = '/version.json'
const SNOOZE_KEY     = 'ccg-update-snoozed'
const SNOOZE_HOURS   = 24  // remind again after 24 hours

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [latestVersion, setLatestVersion]     = useState(null)
  const [currentVersion, setCurrentVersion]   = useState(null)
  const [dismissed, setDismissed]             = useState(false)

  useEffect(() => {
    // Check if user snoozed the prompt recently
    const snoozed = localStorage.getItem(SNOOZE_KEY)
    if (snoozed) {
      const snoozedAt = new Date(snoozed)
      const hoursSince = (Date.now() - snoozedAt) / (1000 * 60 * 60)
      if (hoursSince < SNOOZE_HOURS) return
    }

    const check = async () => {
      try {
        // 1. Get installed version from bundled version.json
        const localRes = await fetch(VERSION_FILE + '?t=' + Date.now())
        const local    = await localRes.json()
        setCurrentVersion(local.version)

        // 2. Get latest release info from GitHub API
        const ghRes  = await fetch(RELEASES_API)
        const ghData = await ghRes.json()

        // Extract version from release body or tag
        // The workflow writes the version as the release body first line
        const remoteVersion = ghData.tag_name || ghData.name || ''

        setLatestVersion(remoteVersion)

        // 3. Compare — if different, prompt update
        if (remoteVersion && local.version && remoteVersion !== local.version) {
          setUpdateAvailable(true)
        }
      } catch (err) {
        // Silently fail — never block the app over an update check
        console.warn('Update check failed:', err)
      }
    }

    // Delay check by 5 seconds so it doesn't slow down app launch
    const timer = setTimeout(check, 5000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    // Snooze for 24 hours
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
    currentVersion,
    dismiss,
    openDownload,
  }
}
