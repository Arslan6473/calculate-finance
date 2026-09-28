import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={item.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3.5 text-ink-subtle" aria-hidden />}
            {isLast ? (
              <span className="font-medium text-ink" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
