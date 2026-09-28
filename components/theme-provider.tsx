'use client'

import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'calcxs:theme'

interface ThemeContextValue {
  /** The user's stored preference, or `'system'` if none is set. */
  theme: Theme
  /** The actual light/dark value in effect right now. */
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getStoredTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function getResolvedTheme(): 'light' | 'dark' {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function subscribe(callback: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', callback)
  window.addEventListener('storage', callback)
  return () => {
    media.removeEventListener('change', callback)
    window.removeEventListener('storage', callback)
  }
}

/**
 * A minimal theme provider, written in-house rather than pulling in
 * `next-themes`: that library injects its FOUC-prevention script as a raw
 * `<script>` element rendered by a React component, which React 19's dev
 * diagnostics now flag ("scripts inside React components are never executed
 * on the client") — harmless in production since the script runs from the
 * server-sent HTML before hydration, but there's no fixed release yet. The
 * actual pre-hydration script lives in the root layout via `next/script`
 * (`strategy="beforeInteractive"`), which is Next's own sanctioned mechanism
 * for exactly this case and doesn't trigger the warning. This component only
 * tracks theme state after that; `useSyncExternalStore` reads localStorage
 * and the OS color-scheme media query as the two external sources of truth.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getStoredTheme, () => 'system' as const)
  const resolvedTheme = React.useSyncExternalStore(subscribe, getResolvedTheme, () => 'light' as const)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  const setTheme = React.useCallback((next: Theme) => {
    if (next === 'system') window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, next)
    // Mirrors CurrencyProvider: a real `storage` event only fires in other
    // tabs, so dispatch one manually to update this tab's subscribers too.
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

/**
 * The pre-hydration script, rendered via `next/script` in the root layout.
 * Reads the same localStorage key and media query as the hooks above, so the
 * class it sets is never wrong by the time React takes over.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`
