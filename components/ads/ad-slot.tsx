/**
 * A reserved ad placement (brief §17). No ad network is wired up yet — this
 * renders an empty, correctly-sized placeholder so the layout is stable once
 * a network is added, and never appears inside a calculator's input form.
 */
export type AdPlacement = 'after-calculator' | 'in-content' | 'sidebar-desktop' | 'bottom-of-article'

const PLACEMENT_HEIGHT: Record<AdPlacement, string> = {
  'after-calculator': 'h-24',
  'in-content': 'h-24',
  'sidebar-desktop': 'h-[600px]',
  'bottom-of-article': 'h-32',
}

export function AdSlot({ placement }: { placement: AdPlacement }) {
  return (
    <div
      data-ad-placement={placement}
      className={`${PLACEMENT_HEIGHT[placement]} flex items-center justify-center rounded-card border border-dashed border-line text-xs text-ink-subtle`}
      aria-hidden
    >
      Advertisement
    </div>
  )
}
