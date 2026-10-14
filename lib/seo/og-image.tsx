import { ImageResponse } from 'next/og'

import { SITE } from '@/config/site'

export const OG_SIZE = { width: 1200, height: 630 }

/** Matches `--accent` in globals.css (oklch(48% 0.09 205)), converted to hex for the renderer. */
const ACCENT = '#006c76'

/**
 * One layout for every social preview card — site default, calculators and
 * guides — so links shared anywhere read as the same brand. Uses the
 * renderer's built-in font to stay well under the 500KB bundle limit.
 */
export function renderOgImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#ffffff',
          borderTop: `16px solid ${ACCENT}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: ACCENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="20" x="4" y="2" rx="2" />
              <line x1="8" x2="16" y1="6" y2="6" />
              <line x1="16" x2="16" y1="14" y2="18" />
              <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
            </svg>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1a1f29' }}>{SITE.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: 2 }}>
            {eyebrow}
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: '#1a1f29', lineHeight: 1.1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 32, color: '#525a68', lineHeight: 1.35 }}>{subtitle}</div>}
        </div>

        <div style={{ fontSize: 26, color: '#525a68' }}>{SITE.url.replace(/^https?:\/\//, '')}</div>
      </div>
    ),
    OG_SIZE
  )
}
