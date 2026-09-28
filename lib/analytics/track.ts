/**
 * Analytics abstraction (brief §27). No provider is wired up yet — calls are a
 * no-op in production and log to the console in development, so instrumenting
 * a feature now costs nothing and swapping in Google Analytics, Search
 * Console, or Plausible later touches only this one file.
 *
 * Deliberately collects no personal information: every event below carries
 * only the data needed to understand feature usage.
 */

export type AnalyticsEvent =
  | { name: 'calculator_used'; slug: string }
  | { name: 'calculator_completed'; slug: string }
  | { name: 'affiliate_clicked'; id: string }
  | { name: 'guide_opened'; slug: string }

export function track(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[analytics]', event.name, event)
  }
}
