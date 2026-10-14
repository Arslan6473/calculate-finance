import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'

import { SITE } from '@/config/site'
import { THEME_INIT_SCRIPT, ThemeProvider } from '@/components/theme-provider'
import { CurrencyProvider } from '@/components/currency-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' })
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono-jetbrains',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  // Google Search Console ownership verification.
  verification: {
    google: 'Id8_5a_g-zNFNdMKpQDPx-8Z3SIU0ur8z1y8CPCxqKY',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Browser extensions (e.g. ColorZilla's `cz-shortcut-listen`) inject
          attributes onto <body> before React hydrates, which React then
          reports as a mismatch. suppressHydrationWarning tells React to
          ignore attribute diffs on this element without hiding real
          hydration bugs elsewhere in the tree. */}
      <body className="flex min-h-full flex-col bg-canvas text-ink" suppressHydrationWarning>
        {/* Sets the `dark` class before hydration so there's no flash of the
            wrong theme. `beforeInteractive` is Next's own mechanism for this
            exact case — see the note in theme-provider.tsx for why this isn't
            handled by the theme library's own script injection instead. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
          <CurrencyProvider>
            <TooltipProvider delayDuration={200}>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </TooltipProvider>
          </CurrencyProvider>
        </ThemeProvider>
        {/* Cookieless page-view analytics — consistent with the privacy policy's
            "no individual profiles" commitment. Inactive outside Vercel. */}
        <Analytics />
      </body>
    </html>
  )
}
