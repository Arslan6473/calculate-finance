'use client'

import * as React from 'react'

import { CURRENCIES, DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from '@/lib/formatting/currency'

const STORAGE_KEY = 'calcxs:currency'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null)

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getSnapshot(): CurrencyCode {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isCurrencyCode(stored) ? stored : DEFAULT_CURRENCY
}

function getServerSnapshot(): CurrencyCode {
  return DEFAULT_CURRENCY
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore, not useState+useEffect: localStorage is an external
  // store, and this is the store's read model — matching server (default) and
  // client (actual stored value) snapshots without a post-mount setState.
  const currency = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setCurrency = React.useCallback((next: CurrencyCode) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    // A real `storage` event only fires in OTHER tabs, not this one — dispatch
    // one manually so this tab's subscribers re-read the new snapshot too.
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
  }, [])

  const value = React.useMemo(() => ({ currency, setCurrency }), [currency, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const context = React.useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider')
  return context
}

export { CURRENCIES }
