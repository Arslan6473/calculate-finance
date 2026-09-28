import Link from 'next/link'
import type { MDXRemoteProps } from 'next-mdx-remote/rsc'

/**
 * Custom element renderers for MDX content. Styled by hand rather than a
 * `@tailwindcss/typography` plugin (brief §2: "no unnecessary third-party
 * dependencies") — there are few enough element types in a calculator or
 * guide article that hand-mapping them is simpler than pulling in a plugin
 * and overriding its defaults.
 */
export const mdxComponents: MDXRemoteProps['components'] = {
  h2: (props) => <h2 className="mt-10 mb-4 text-2xl font-semibold text-ink" {...props} />,
  h3: (props) => <h3 className="mt-8 mb-3 text-lg font-semibold text-ink" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed text-ink-muted" {...props} />,
  ul: (props) => <ul className="mb-4 list-disc space-y-1.5 pl-5 text-ink-muted" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-ink-muted" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  a: ({ href, ...props }) =>
    href?.startsWith('/') ? (
      <Link href={href} className="text-accent underline underline-offset-2" {...props} />
    ) : (
      <a href={href} className="text-accent underline underline-offset-2" {...props} />
    ),
  code: (props) => (
    <code className="figures rounded bg-surface-muted px-1.5 py-0.5 text-sm text-ink" {...props} />
  ),
  pre: (props) => (
    <pre className="figures mb-4 overflow-x-auto rounded-card border border-line bg-surface-muted p-4 text-sm" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="mb-4 border-l-2 border-accent pl-4 text-ink-muted italic" {...props} />
  ),
  table: (props) => (
    <div className="mb-4 overflow-x-auto rounded-card border border-line">
      <table className="figures w-full text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b border-line bg-surface-muted text-left" {...props} />,
  tr: (props) => <tr className="border-b border-line last:border-b-0" {...props} />,
  th: (props) => <th className="px-3 py-2 font-medium text-ink-muted" {...props} />,
  td: (props) => <td className="px-3 py-2" {...props} />,
  hr: () => <hr className="my-8 border-line" />,
}
