export const GITHUB_PAGES_URL = 'https://hoangkyanh05.github.io/Tool_Report/'
export const GITHUB_REPO_URL = 'https://github.com/HoangKyAnh05/Tool_Report'

/**
 * Open external URL in default system browser (Electron) or new tab (Web)
 * Defaults to GitHub Pages web app URL
 */
export function openExternalUrl(url: string = GITHUB_PAGES_URL) {
  if (typeof window !== 'undefined' && window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(url)
  } else if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
