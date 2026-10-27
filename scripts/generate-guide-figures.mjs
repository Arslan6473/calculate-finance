/**
 * Generates the static SVG charts and diagrams embedded in the guides
 * (`public/images/guides/*.svg`). Every number comes from the worked example
 * in the matching guide — when a guide's example changes, update it here and
 * re-run `npm run figures`.
 *
 * Figures are drawn on a fixed light surface so they read the same in either
 * site theme and when shared on their own (e.g. in image search).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'guides')

const W = 800
const H = 450

// Categorical slots validated with the dataviz palette checker (all-pairs, light surface).
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a']
const C = {
  surface: '#ffffff',
  border: '#e4e6e9',
  grid: '#eceef1',
  axis: '#cdd1d6',
  ink: '#14191f',
  muted: '#535960',
  subtle: '#7b8187',
  boxFill: '#f4f6f8',
}
const FONT = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const money = (v, digits = 0) =>
  (v < 0 ? '−$' : '$') +
  Math.abs(v).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const moneyShort = (v) => {
  const a = Math.abs(v)
  const sign = v < 0 ? '−' : ''
  if (a >= 1000)
    return `${sign}$${(a / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`
  return `${sign}$${a.toLocaleString('en-US')}`
}
const pct = (v, digits = 0) => `${v.toFixed(digits)}%`

function niceStep(range, count) {
  const raw = range / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * mag >= raw) return m * mag
  return 10 * mag
}

function ticks(min, max, count = 5) {
  const step = niceStep(max - min, count)
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const out = []
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6)
  return out
}

function text(
  x,
  y,
  s,
  { size = 13, fill = C.muted, weight = 400, anchor = 'start', baseline } = {}
) {
  const b = baseline ? ` dominant-baseline="${baseline}"` : ''
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}"${b}>${esc(s)}</text>`
}

/** Bar with a 4px rounded data-end and a square base. */
function bar(x, y, w, h, fill, { horizontal = false, r = 4 } = {}) {
  if (w <= 0 || h <= 0) return ''
  if (horizontal) {
    const rr = Math.min(r, w, h / 2)
    return `<path d="M${x},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h - rr} Q${x + w},${y + h} ${x + w - rr},${y + h} H${x} Z" fill="${fill}"/>`
  }
  const rr = Math.min(r, h, w / 2)
  return `<path d="M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z" fill="${fill}"/>`
}

function legend(items, y = 82) {
  let x = 32
  return items
    .map(({ name, color }) => {
      const s = `<rect x="${x}" y="${y - 9}" width="12" height="12" rx="3" fill="${color}"/>${text(x + 18, y + 1, name, { size: 13, fill: C.muted })}`
      x += 18 + name.length * 7.2 + 24
      return s
    })
    .join('')
}

function frame(title, subtitle, body, { source } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}" font-family="${esc(FONT)}">
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${C.surface}" stroke="${C.border}"/>
${text(32, 40, title, { size: 20, fill: C.ink, weight: 600 })}
${subtitle ? text(32, 62, subtitle, { size: 14, fill: C.muted }) : ''}
${body}
${text(W - 32, H - 14, source ?? 'calcxs.site', { size: 11, fill: C.subtle, anchor: 'end' })}
</svg>
`
}

/** Spreads label y-positions so neighbors are at least `gap` apart. */
function spreadLabels(items, gap, min, max) {
  const sorted = [...items].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i].y - sorted[i - 1].y < gap) sorted[i].y = sorted[i - 1].y + gap
  const overflow = sorted.length ? sorted[sorted.length - 1].y - max : 0
  if (overflow > 0) for (const s of sorted) s.y -= overflow
  for (let i = sorted.length - 2; i >= 0; i--)
    if (sorted[i + 1].y - sorted[i].y < gap) sorted[i].y = sorted[i + 1].y - gap
  for (const s of sorted) s.y = Math.max(min, s.y)
  return items
}

/**
 * Line chart. `series` = [{ name, points: [[x, y]], label? }]. Lines are
 * direct-labeled at their end; a legend is added for two or more series.
 */
function lineChart({
  title,
  subtitle,
  series,
  xLabel,
  xFmt = String,
  yFmt = moneyShort,
  yMin,
  yMax,
  xTicks,
  refLines = [],
  endLabel = (s, y) => `${s.name}: ${yFmt(y)}`,
  markers = [],
  legendList,
}) {
  const top = series.length > 1 && !legendList ? 104 : 88
  const left = 76
  const right = W - 196
  const bottom = H - 64
  const allX = series.flatMap((s) => s.points.map((p) => p[0]))
  const allY = series.flatMap((s) => s.points.map((p) => p[1])).concat(refLines.map((r) => r.y))
  const yt = ticks(yMin ?? Math.min(0, ...allY), yMax ?? Math.max(...allY))
  const x0 = Math.min(...allX)
  const x1 = Math.max(...allX)
  const sx = (v) => left + ((v - x0) / (x1 - x0)) * (right - left)
  const sy = (v) => bottom - ((v - yt[0]) / (yt[yt.length - 1] - yt[0])) * (bottom - top)

  let g = ''
  for (const t of yt) {
    g += `<line x1="${left}" x2="${right}" y1="${sy(t)}" y2="${sy(t)}" stroke="${t === 0 ? C.axis : C.grid}" stroke-width="1"/>`
    g += text(left - 10, sy(t) + 4, yFmt(t), { size: 12, fill: C.subtle, anchor: 'end' })
  }
  for (const t of xTicks ?? ticks(x0, x1, 6)) {
    if (t < x0 || t > x1) continue
    g += text(sx(t), bottom + 22, xFmt(t), { size: 12, fill: C.subtle, anchor: 'middle' })
  }
  g += text((left + right) / 2, bottom + 46, xLabel, { size: 13, fill: C.muted, anchor: 'middle' })

  for (const r of refLines) {
    g += `<line x1="${left}" x2="${right}" y1="${sy(r.y)}" y2="${sy(r.y)}" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="5 4"/>`
    g += text(left + 8, sy(r.y) - 7, r.label, { size: 12, fill: C.muted })
  }

  const labels = []
  series.forEach((s, i) => {
    const color = s.color ?? SERIES[i]
    const d = s.points
      .map((p, j) => `${j ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`)
      .join(' ')
    g += `<path d="${d}" fill="none" stroke="${C.surface}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`
    g += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`
    const last = s.points[s.points.length - 1]
    g += `<circle cx="${sx(last[0])}" cy="${sy(last[1])}" r="4.5" fill="${color}" stroke="${C.surface}" stroke-width="2"/>`
    labels.push({ y: sy(last[1]), text: endLabel(s, last[1]), x: sx(last[0]) + 12 })
  })
  spreadLabels(labels, 18, top, bottom - 12)
  for (const l of labels)
    if (l.text) g += text(l.x, l.y + 4, l.text, { size: 13, fill: C.ink, weight: 500 })
  for (const m of markers) {
    g += `<circle cx="${sx(m.x)}" cy="${sy(m.y)}" r="5" fill="${C.ink}" stroke="${C.surface}" stroke-width="2"/>`
    g += text(sx(m.x) + (m.dx ?? -10), sy(m.y) + (m.dy ?? -12), m.label, {
      size: 13,
      fill: C.ink,
      weight: 600,
      anchor: m.anchor ?? 'end',
    })
  }

  let leg = ''
  if (legendList) {
    // Vertical legend inside the plot, for series whose labels carry the results.
    const longest = Math.max(...series.map((s) => s.name.length))
    leg += `<rect x="${legendList.x - 12}" y="${legendList.y - 24}" width="${longest * 7 + 44}" height="${series.length * 24 + 16}" rx="8" fill="${C.surface}" stroke="${C.border}"/>`
    series.forEach((s, i) => {
      const y = legendList.y + i * 24
      leg += `<rect x="${legendList.x}" y="${y - 10}" width="12" height="12" rx="3" fill="${s.color ?? SERIES[i]}"/>`
      leg += text(legendList.x + 20, y, s.name, { size: 13, fill: C.ink })
    })
  } else if (series.length > 1)
    leg = legend(series.map((s, i) => ({ name: s.name, color: s.color ?? SERIES[i] })))
  return frame(title, subtitle, g + leg)
}

/**
 * Vertical bar chart. `categories` labels the x axis; `series` = [{ name, values }].
 * Bars in a group sit 2px apart and every bar carries its value, since a static
 * image has no tooltip to fall back on.
 */
function columnChart({
  title,
  subtitle,
  categories,
  series,
  xLabel,
  yFmt = moneyShort,
  valueFmt,
  refLines = [],
  yMax,
}) {
  const top = series.length > 1 ? 110 : 94
  const left = 76
  const right = W - (refLines.length ? 150 : 32)
  const bottom = H - 64
  const allY = series.flatMap((s) => s.values).concat(refLines.map((r) => r.y))
  const yt = ticks(0, yMax ?? Math.max(...allY))
  const sy = (v) => bottom - (v / yt[yt.length - 1]) * (bottom - top)
  const band = (right - left) / categories.length
  const groupW = Math.min(band * 0.7, series.length * 64)
  const barW = (groupW - (series.length - 1) * 2) / series.length
  const vf = valueFmt ?? yFmt

  let g = ''
  for (const t of yt) {
    g += `<line x1="${left}" x2="${right}" y1="${sy(t)}" y2="${sy(t)}" stroke="${t === 0 ? C.axis : C.grid}"/>`
    g += text(left - 10, sy(t) + 4, yFmt(t), { size: 12, fill: C.subtle, anchor: 'end' })
  }
  categories.forEach((cat, ci) => {
    const gx = left + band * ci + (band - groupW) / 2
    series.forEach((s, si) => {
      const v = s.values[ci]
      const x = gx + si * (barW + 2)
      g += bar(x, sy(v), barW, bottom - sy(v), s.color ?? SERIES[si])
      g += text(x + barW / 2, sy(v) - 7, vf(v), {
        size: 12,
        fill: C.ink,
        weight: 500,
        anchor: 'middle',
      })
    })
    g += text(left + band * ci + band / 2, bottom + 22, cat, {
      size: 13,
      fill: C.muted,
      anchor: 'middle',
    })
  })
  if (xLabel)
    g += text((left + right) / 2, bottom + 46, xLabel, {
      size: 13,
      fill: C.muted,
      anchor: 'middle',
    })
  for (const r of refLines) {
    g += `<line x1="${left}" x2="${right}" y1="${sy(r.y)}" y2="${sy(r.y)}" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="5 4"/>`
    g += text(right + 8, sy(r.y) + 4, r.label, { size: 12, fill: C.muted })
  }
  const leg =
    series.length > 1
      ? legend(series.map((s, i) => ({ name: s.name, color: s.color ?? SERIES[i] })))
      : ''
  return frame(title, subtitle, leg + g)
}

/** Horizontal bar chart for long category names. `rows` = [{ label, value, color? }]. */
function barChart({
  title,
  subtitle,
  rows,
  valueFmt = money,
  labelWidth = 250,
  refLine,
  legendItems,
  footnote,
  valuesInside = false,
}) {
  const top = legendItems ? 104 : 88
  const left = 32 + labelWidth
  const right = W - 120
  const bottom = H - (footnote ? 66 : 40)
  const max = Math.max(...rows.map((r) => r.value), refLine?.value ?? 0)
  const sx = (v) => left + (v / max) * (right - left)
  const rowH = (bottom - top) / rows.length
  const barH = Math.min(30, rowH - 8)

  let g = ''
  if (refLine) {
    g += `<line x1="${sx(refLine.value)}" x2="${sx(refLine.value)}" y1="${top - 8}" y2="${bottom}" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="5 4"/>`
    g += text(sx(refLine.value), top - 14, refLine.label, {
      size: 12,
      fill: C.muted,
      anchor: 'middle',
    })
  }
  rows.forEach((r, i) => {
    const y = top + i * rowH + (rowH - barH) / 2
    g += text(left - 14, y + barH / 2 + 5, r.label, {
      size: 14,
      fill: C.ink,
      anchor: 'end',
      weight: r.bold ? 600 : 400,
    })
    g += bar(left, y, sx(r.value) - left, barH, r.color ?? SERIES[0], { horizontal: true })
    g += valuesInside
      ? text(sx(r.value) - 10, y + barH / 2 + 5, valueFmt(r.value), {
          size: 13,
          fill: C.surface,
          weight: 600,
          anchor: 'end',
        })
      : text(sx(r.value) + 8, y + barH / 2 + 5, valueFmt(r.value), {
          size: 13,
          fill: C.ink,
          weight: 600,
        })
  })
  g += `<line x1="${left}" x2="${left}" y1="${top - 4}" y2="${bottom}" stroke="${C.axis}"/>`
  if (footnote) g += text(32, H - 36, footnote, { size: 13, fill: C.muted })
  return frame(title, subtitle, (legendItems ? legend(legendItems) : '') + g)
}

/** A row of labeled boxes joined by operators — for formulas and step-by-step calculations. */
function formulaDiagram({ title, subtitle, rows, footnote }) {
  let g = ''
  let y = 104
  for (const row of rows) {
    const opW = 34
    const boxCount = row.items.length
    const totalW = W - 64
    const boxW = (totalW - (boxCount - 1) * opW) / boxCount
    row.items.forEach((item, i) => {
      const x = 32 + i * (boxW + opW)
      const highlight = item.highlight
      g += `<rect x="${x}" y="${y}" width="${boxW}" height="${row.height ?? 104}" rx="10" fill="${highlight ? '#eaf2fc' : C.boxFill}" stroke="${highlight ? SERIES[0] : C.border}" stroke-width="${highlight ? 2 : 1}"/>`
      g += text(x + boxW / 2, y + 30, item.label, { size: 13, fill: C.muted, anchor: 'middle' })
      g += text(x + boxW / 2, y + 66, item.value, {
        size: item.valueSize ?? 24,
        fill: highlight ? '#1c5cab' : C.ink,
        weight: 700,
        anchor: 'middle',
      })
      if (item.note)
        g += text(x + boxW / 2, y + 90, item.note, { size: 12, fill: C.subtle, anchor: 'middle' })
      if (i < boxCount - 1)
        g += text(x + boxW + opW / 2, y + (row.height ?? 104) / 2 + 9, row.ops[i], {
          size: 26,
          fill: C.muted,
          weight: 600,
          anchor: 'middle',
        })
    })
    if (row.caption) g += text(32, y - 12, row.caption, { size: 14, fill: C.ink, weight: 600 })
    y += (row.height ?? 104) + 54
  }
  if (footnote) g += text(32, H - 40, footnote, { size: 13, fill: C.muted })
  return frame(title, subtitle, g)
}

/** Floating horizontal bars stepping from a starting amount down to a result. */
function waterfall({ title, subtitle, steps, valueFmt = money }) {
  const top = 106
  const left = 262
  const right = W - 130
  const bottom = H - 40
  const max = Math.max(...steps.map((s) => (s.kind === 'total' ? s.value : 0)))
  const sx = (v) => left + (v / max) * (right - left)
  const rowH = (bottom - top) / steps.length
  const barH = Math.min(28, rowH - 8)
  let running = 0
  let g = ''
  steps.forEach((s, i) => {
    const y = top + i * rowH + (rowH - barH) / 2
    let from
    let to
    if (s.kind === 'total') {
      running = s.value
      from = 0
      to = s.value
    } else {
      from = running - s.value
      to = running
      running = from
    }
    const color = s.kind === 'total' ? SERIES[0] : SERIES[1]
    g += text(left - 14, y + barH / 2 + 5, s.label, {
      size: 14,
      fill: C.ink,
      anchor: 'end',
      weight: s.kind === 'total' ? 600 : 400,
    })
    g += bar(sx(from), y, sx(to) - sx(from), barH, color, {
      horizontal: true,
      r: s.kind === 'total' ? 4 : 2,
    })
    g += text(
      sx(to) + 8,
      y + barH / 2 + 5,
      s.kind === 'total' ? valueFmt(s.value) : `−${valueFmt(s.value)}`,
      { size: 13, fill: C.ink, weight: 600 }
    )
  })
  g += `<line x1="${left}" x2="${left}" y1="${top - 4}" y2="${bottom}" stroke="${C.axis}"/>`
  const leg = legend([
    { name: 'Income and subtotals', color: SERIES[0] },
    { name: 'Costs subtracted', color: SERIES[1] },
  ])
  return frame(title, subtitle, leg + g)
}

/** Stacked columns (bottom series first), 2px gap between segments. */
function stackedColumns({
  title,
  subtitle,
  categories,
  series,
  xLabel,
  yFmt = moneyShort,
  labelEvery = 5,
}) {
  const top = 110
  const left = 76
  const right = W - 32
  const bottom = H - 64
  const totals = categories.map((_, i) => series.reduce((a, s) => a + s.values[i], 0))
  const yt = ticks(0, Math.max(...totals))
  const sy = (v) => bottom - (v / yt[yt.length - 1]) * (bottom - top)
  const band = (right - left) / categories.length
  const bw = band * 0.72
  let g = ''
  for (const t of yt) {
    g += `<line x1="${left}" x2="${right}" y1="${sy(t)}" y2="${sy(t)}" stroke="${t === 0 ? C.axis : C.grid}"/>`
    g += text(left - 10, sy(t) + 4, yFmt(t), { size: 12, fill: C.subtle, anchor: 'end' })
  }
  categories.forEach((cat, i) => {
    const x = left + band * i + (band - bw) / 2
    let base = 0
    series.forEach((s, si) => {
      const v = s.values[i]
      const yTop = sy(base + v)
      const yBot = sy(base) - (si > 0 ? 2 : 0)
      const isTop = si === series.length - 1
      g += isTop
        ? bar(x, yTop, bw, yBot - yTop, SERIES[si], { r: 3 })
        : `<rect x="${x}" y="${yTop}" width="${bw}" height="${Math.max(0, yBot - yTop)}" fill="${SERIES[si]}"/>`
      base += v
    })
    if ((i + 1) % labelEvery === 0 || i === 0)
      g += text(x + bw / 2, bottom + 22, cat, { size: 12, fill: C.subtle, anchor: 'middle' })
  })
  g += text((left + right) / 2, bottom + 46, xLabel, { size: 13, fill: C.muted, anchor: 'middle' })
  const leg = legend(series.map((s, i) => ({ name: s.name, color: SERIES[i] })))
  return frame(title, subtitle, leg + g)
}

// ---------- Finance helpers (match the guides' worked examples) ----------

const payment = (P, annualRate, n) => {
  const r = annualRate / 12
  return (P * r * (1 + r) ** n) / ((1 + r) ** n - 1)
}

function amortizeYears(P, annualRate, years) {
  const r = annualRate / 12
  const pmt = payment(P, annualRate, years * 12)
  let bal = P
  const rows = []
  for (let y = 1; y <= years; y++) {
    let interest = 0
    let principal = 0
    for (let m = 0; m < 12; m++) {
      const i = bal * r
      const p = Math.min(pmt - i, bal)
      interest += i
      principal += p
      bal -= p
    }
    rows.push({ year: y, interest, principal, balance: Math.max(0, bal) })
  }
  return rows
}

function rateForPayment(P, pmt, n) {
  let lo = 0.0001
  let hi = 0.3
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2
    if (payment(P, mid, n) > pmt) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

/** Credit card balance by month for the guide's $5,000 / 24% APR example. */
function cardPayoff(strategy) {
  let bal = 5000
  const pts = [[0, bal]]
  let month = 0
  let interestTotal = 0
  while (bal > 0.005 && month < 600) {
    month++
    const interest = bal * 0.02
    interestTotal += interest
    let pay = strategy === 'min' ? Math.max(bal * 0.01 + interest, 25) : strategy
    pay = Math.min(pay, bal + interest)
    bal = bal + interest - pay
    pts.push([month, Math.max(0, bal)])
  }
  return { pts, month, interestTotal }
}

// ---------- Figures ----------

const figures = {}

figures['how-to-calculate-roi-formula'] = formulaDiagram({
  title: 'The ROI formula, worked through',
  subtitle:
    'Stock fund held 4 years: $10,000 plus fees, sold for $12,400, with $1,000 of dividends',
  rows: [
    {
      caption: 'Step 1: Net profit',
      ops: ['−', '='],
      items: [
        { label: 'Total returned', value: '$13,350', note: 'sale after fees + dividends' },
        { label: 'Total invested', value: '$10,050', note: 'price + fees to buy' },
        { label: 'Net profit', value: '$3,300' },
      ],
    },
    {
      caption: 'Step 2: Divide by what you invested',
      ops: ['÷', '='],
      items: [
        { label: 'Net profit', value: '$3,300' },
        { label: 'Total invested', value: '$10,050' },
        { label: 'ROI', value: '32.8%', note: '≈ 7.36% a year, annualized', highlight: true },
      ],
    },
  ],
})

figures['how-to-calculate-roi-break-even'] = columnChart({
  title: 'A loss needs a bigger gain to recover',
  subtitle: 'Gain required to get back to break-even after a loss',
  categories: ['10% loss', '20% loss', '30% loss', '50% loss'],
  series: [{ name: 'Gain needed', values: [11.1, 25, 42.9, 100] }],
  yFmt: (v) => pct(v),
  valueFmt: (v) => pct(v, v % 1 ? 1 : 0),
})

{
  const min = cardPayoff('min')
  const p150 = cardPayoff(150)
  const p200 = cardPayoff(200)
  const thin = (pts) => pts.filter((p, i) => i % 3 === 0 || i === pts.length - 1)
  figures['how-credit-card-interest-works-payoff'] = lineChart({
    title: 'Paying only the minimum takes almost 20 years',
    subtitle: '$5,000 balance at 24% APR, no new charges',
    series: [
      {
        name: `Minimum payment only: ${min.month} months, ${money(min.interestTotal)} interest`,
        points: thin(min.pts),
      },
      {
        name: `Fixed $150 a month: ${p150.month} months, ${money(p150.interestTotal)} interest`,
        points: thin(p150.pts),
      },
      {
        name: `Fixed $200 a month: ${p200.month} months, ${money(p200.interestTotal)} interest`,
        points: thin(p200.pts),
      },
    ],
    xLabel: 'Months',
    xTicks: [0, 36, 56, 120, 180, 234],
    legendList: { x: 300, y: 130 },
    endLabel: () => '',
  })
}

figures['how-credit-card-interest-works-daily-rate'] = formulaDiagram({
  title: 'How a card turns its APR into an interest charge',
  subtitle: 'Average daily balance method, 30-day billing cycle',
  rows: [
    {
      caption: 'Step 1: Daily periodic rate',
      ops: ['÷', '='],
      items: [
        { label: 'APR', value: '24%' },
        { label: 'Days in a year', value: '365' },
        { label: 'Daily rate', value: '0.06575%' },
      ],
    },
    {
      caption: 'Step 2: Interest for the cycle',
      ops: ['×', '×', '='],
      items: [
        { label: 'Avg. daily balance', value: '$2,233', valueSize: 22 },
        { label: 'Daily rate', value: '0.06575%', valueSize: 22 },
        { label: 'Days', value: '30', valueSize: 22 },
        { label: 'Interest charged', value: '$44.05', valueSize: 22, highlight: true },
      ],
    },
  ],
})

{
  const years = Array.from({ length: 31 }, (_, i) => i)
  const pp = (rate) => years.map((y) => [y, 10000 / (1 + rate) ** y])
  figures['how-inflation-affects-savings-purchasing-power'] = lineChart({
    title: 'What $10,000 in cash can buy over time',
    subtitle: "Purchasing power in today's dollars at three inflation rates",
    series: [
      { name: '2% inflation', points: pp(0.02) },
      { name: '3% inflation', points: pp(0.03) },
      { name: '4% inflation', points: pp(0.04) },
    ],
    xLabel: 'Years',
    yMin: 0,
    yMax: 10000,
    endLabel: (s, y) => `${s.name}: ${money(Math.round(y))}`,
  })
}

figures['how-inflation-affects-savings-real-growth'] = columnChart({
  title: "$10,000 after 20 years, in today's dollars",
  subtitle: 'Nominal return minus 3% inflation, before taxes',
  categories: ['0.5% savings', '4.5% high-yield savings', '7% diversified portfolio'],
  series: [{ name: "Value in today's dollars", values: [6118, 13353, 21426] }],
  refLines: [{ y: 10000, label: 'Starting $10,000' }],
  valueFmt: (v) => money(v),
})

{
  const steps = [
    [0, 2155],
    [60, 2155],
    [60, 2576],
    [66, 2576],
    [66, 2795],
    [72, 2795],
    [72, 3019],
    [78, 3019],
    [78, 3246],
    [120, 3246],
  ]
  figures['fixed-vs-adjustable-rate-mortgage-worst-case'] = lineChart({
    title: 'Worst-case payment: 5/6 ARM vs. 30-year fixed',
    subtitle: 'Principal and interest on the guide example, with every rate cap hit',
    series: [
      { name: '5/6 ARM, worst case', points: steps },
      {
        name: '30-year fixed',
        points: [
          [0, 2328.56],
          [120, 2328.56],
        ],
      },
    ],
    xLabel: 'Months',
    xTicks: [0, 24, 60, 78, 120],
    yMin: 1500,
    yMax: 3500,
    yFmt: (v) => money(v),
    endLabel: (s, y) => money(Math.round(y)),
  })
}

{
  const years = Array.from({ length: 31 }, (_, i) => i)
  figures['how-compound-interest-works-growth'] = lineChart({
    title: 'Compound vs. simple interest on $10,000 at 7%',
    subtitle: 'Interest earned on interest makes the curve bend upward',
    series: [
      { name: 'Compound interest', points: years.map((y) => [y, 10000 * 1.07 ** y]) },
      { name: 'Simple interest', points: years.map((y) => [y, 10000 + 700 * y]) },
    ],
    xLabel: 'Years',
    endLabel: (s, y) => money(Math.round(y)),
  })
}

figures['how-to-calculate-debt-to-income-ratio-scenarios'] = barChart({
  title: 'How paying off debt lowers your DTI',
  subtitle: '$78,000 income, proposed $1,850 housing payment',
  rows: [
    { label: 'Current debts', value: 41.8 },
    { label: 'Pay off both credit cards', value: 40.0 },
    { label: 'Pay off the car loan', value: 34.9 },
  ],
  valueFmt: (v) => pct(v, 1),
  refLine: { value: 36, label: '36% guideline' },
  labelWidth: 210,
  valuesInside: true,
})

{
  const rows = amortizeYears(320000, 0.065, 30)
  figures['how-mortgage-amortization-works-split'] = stackedColumns({
    title: 'Where each year of payments goes',
    subtitle: '$320,000, 30-year fixed at 6.5% — $24,271 paid every year',
    categories: rows.map((r) => `Yr ${r.year}`),
    series: [
      { name: 'Principal', values: rows.map((r) => r.principal) },
      { name: 'Interest', values: rows.map((r) => r.interest) },
    ],
    xLabel: 'Year of the loan',
  })
}

figures['how-much-house-can-i-afford-on-60k-rates'] = columnChart({
  title: 'Home price you can afford on $60,000 a year',
  subtitle: '$1,400 monthly housing budget (28% rule), 1% property tax, $150/mo insurance',
  categories: ['6.0%', '6.5%', '7.0%', '7.5%', '8.0%'],
  series: [
    { name: '10% down', values: [189000, 181000, 174000, 167000, 160000] },
    { name: '20% down', values: [222000, 212000, 203000, 194000, 186000] },
  ],
  xLabel: '30-year mortgage rate',
})

figures['how-to-analyze-a-rental-property-cash-flow'] = waterfall({
  title: 'From rent to cash flow on a $200,000 rental',
  subtitle: '$1,900 a month rent, 25% down, 7% mortgage — annual figures',
  steps: [
    { label: 'Gross scheduled rent', value: 22800, kind: 'total' },
    { label: 'Vacancy (5%)', value: 1140 },
    { label: 'Operating expenses', value: 7612.8 },
    { label: 'Net operating income', value: 14047.2, kind: 'total' },
    { label: 'Mortgage payments', value: 11975.4 },
    { label: 'Annual cash flow', value: 2071.8, kind: 'total' },
  ],
})

{
  const years = Array.from({ length: 16 }, (_, i) => i)
  figures['rent-vs-buy-how-to-decide-break-even'] = lineChart({
    title: 'When buying catches up with renting',
    subtitle: '$400,000 home vs. $2,000/mo rent: $44,000 of transaction costs, $4,000 a year saved',
    series: [{ name: 'Owning vs. renting', points: years.map((y) => [y, -44000 + 4000 * y]) }],
    xLabel: 'Years in the home',
    xTicks: [0, 5, 10, 15],
    refLines: [{ y: 0, label: 'Break-even' }],
    markers: [{ x: 11, y: 0, label: 'Breaks even in year 11', dx: 10, dy: 22, anchor: 'start' }],
    endLabel: (s, y) => `${y >= 0 ? '+' : ''}${money(y)}`,
  })
}

figures['how-to-convert-hourly-to-salary-table'] = barChart({
  title: 'Hourly pay as an annual salary',
  subtitle: '40 hours a week × 52 weeks = 2,080 paid hours',
  rows: [15, 20, 25, 30, 40, 50].map((h) => ({ label: `$${h} an hour`, value: h * 2080 })),
  labelWidth: 150,
})

figures['how-much-house-can-i-afford-by-income'] = columnChart({
  title: 'How much house the 28/36 rule allows by income',
  subtitle:
    'Assumes $600 a month of other debts; see the guide for rate, tax, and insurance assumptions',
  categories: ['$50,000', '$80,000', '$120,000', '$160,000'],
  series: [
    { name: '10% down', values: [118000, 236000, 368000, 490000] },
    { name: '20% down', values: [137000, 274000, 426000, 568000] },
  ],
  xLabel: 'Annual household income',
})

figures['apr-vs-interest-rate-term'] = columnChart({
  title: 'The same $500 fee raises APR more on short loans',
  subtitle: '$10,000 loan at an 8% interest rate',
  categories: ['1-year loan', '3-year loan', '5-year loan'],
  series: [{ name: 'APR with $500 fee', values: [17.76, 11.52, 10.2] }],
  refLines: [{ y: 8, label: '8% interest rate' }],
  yFmt: (v) => pct(v),
  valueFmt: (v) => pct(v, 2),
})

figures['how-much-rent-can-i-afford-rules'] = barChart({
  title: 'Rent budget on $60,000 a year, by rule',
  subtitle: 'Different rules give different answers for the same income',
  rows: [
    { label: '30% of gross income', value: 1500 },
    { label: 'Landlord 40x rule', value: 1500 },
    { label: '36% DTI with $500 of debts', value: 1300 },
    { label: '50/30/20 budget', value: 1195 },
  ],
  labelWidth: 230,
})

figures['debt-snowball-vs-avalanche-comparison'] = barChart({
  title: 'Total interest: snowball vs. avalanche',
  subtitle: '$11,700 across three debts, $600 a month — only the payoff order differs',
  rows: [
    { label: 'Snowball (smallest balance first)', value: 2353 },
    { label: 'Avalanche (highest rate first)', value: 1734 },
  ],
  labelWidth: 250,
  footnote: 'First debt gone: month 5 vs. month 18 · Debt-free: month 24 vs. month 23',
})

{
  const r30 = rateForPayment(300000, 1995.91, 360)
  const r15 = rateForPayment(300000, 2572.27, 180)
  const bal = (rate, years) => [
    [0, 300000],
    ...amortizeYears(300000, rate, years).map((r) => [r.year, r.balance]),
  ]
  figures['15-vs-30-year-mortgage-balance'] = lineChart({
    title: 'Loan balance: 15-year vs. 30-year mortgage',
    subtitle: '$300,000 borrowed — the 15-year costs $255,519 less in interest',
    series: [
      { name: '30-year', points: bal(r30, 30) },
      { name: '15-year', points: bal(r15, 15) },
    ],
    xLabel: 'Years',
    endLabel: (s) => `${s.name} paid off`,
  })
}

figures['how-extra-mortgage-payments-save-interest-savings'] = barChart({
  title: 'Interest saved by paying extra on a mortgage',
  subtitle: 'Guide example 30-year loan; extra payments go straight to principal',
  rows: [
    { label: '$100 extra a month', value: 69338 },
    { label: 'One extra payment a year', value: 102424 },
    { label: '$200 extra a month', value: 116640 },
    { label: '$500 extra a month', value: 200235 },
  ],
  labelWidth: 220,
})

figures['how-much-emergency-fund-expenses'] = barChart({
  title: 'Sizing an emergency fund from essential expenses',
  subtitle: 'Monthly essentials total $3,100',
  rows: [
    { label: 'Rent', value: 1500 },
    { label: 'Groceries', value: 500 },
    { label: 'Transportation', value: 350 },
    { label: 'Health costs', value: 250 },
    { label: 'Utilities', value: 200 },
    { label: 'Minimum debt payments', value: 200 },
    { label: 'Phone and internet', value: 100 },
  ],
  labelWidth: 200,
  footnote: '3 months = $9,300 · 6 months = $18,600',
})

{
  const years = Array.from({ length: 31 }, (_, i) => i)
  figures['simple-vs-compound-interest-comparison'] = lineChart({
    title: 'Simple vs. compound interest on $10,000 at 5%',
    subtitle: 'After 30 years, compounding earns $18,219 more',
    series: [
      { name: 'Compound interest', points: years.map((y) => [y, 10000 * 1.05 ** y]) },
      { name: 'Simple interest', points: years.map((y) => [y, 10000 + 500 * y]) },
    ],
    xLabel: 'Years',
    endLabel: (s, y) => money(Math.round(y)),
  })
}

figures['how-much-do-i-need-to-retire-savings'] = columnChart({
  title: 'Monthly savings to reach $900,000',
  subtitle: "Today's dollars, assumed 6% return — starting earlier costs far less",
  categories: ['40 years to go', '30 years to go', '20 years to go'],
  series: [{ name: 'Monthly savings needed', values: [452, 896, 1948] }],
  valueFmt: (v) => money(v),
})

figures['do-savings-rates-rise-with-inflation-real-value'] = columnChart({
  title: 'Interest earned on $10,000 vs. 3% inflation',
  subtitle: 'One year — accounts below the line lose purchasing power',
  categories: ['Average savings (0.38%)', 'Middling savings (2.0%)', 'High-yield savings (4.0%)'],
  series: [{ name: 'Interest earned', values: [38, 200, 400] }],
  valueFmt: (v) => money(v),
  refLines: [{ y: 300, label: 'Inflation: $300' }],
})

figures['how-to-calculate-rate-of-return-annualized'] = columnChart({
  title: 'The same 30% total return, annualized',
  subtitle: 'Annualized return = (1 + total return)^(1 ÷ years) − 1',
  categories: ['1 year', '3 years', '5 years', '10 years'],
  series: [{ name: 'Annualized return', values: [30, 9.14, 5.39, 2.66] }],
  xLabel: 'Holding period',
  yFmt: (v) => pct(v),
  valueFmt: (v) => pct(v, 2),
})

{
  const i = 0.05 / 12
  const months = Array.from({ length: 31 }, (_, y) => y)
  const fv = (y, dep) => 10000 * (1 + i) ** (12 * y) + dep * (((1 + i) ** (12 * y) - 1) / i)
  figures['compound-interest-formula-deposits'] = lineChart({
    title: '$10,000 at 5% compounded monthly',
    subtitle: 'Adding $200 a month turns $44,677 into $211,129 after 30 years',
    series: [
      { name: 'With $200 monthly deposits', points: months.map((y) => [y, fv(y, 200)]) },
      { name: 'No deposits', points: months.map((y) => [y, fv(y, 0)]) },
    ],
    xLabel: 'Years',
    endLabel: (s, y) => money(Math.round(y)),
  })
}

figures['do-credit-cards-compound-daily-effective-rate'] = columnChart({
  title: 'APR vs. effective annual rate',
  subtitle: 'Effective rate = (1 + APR ÷ 365)^365 − 1 with daily compounding',
  categories: ['18% APR', '24% APR', '30% APR'],
  series: [
    { name: 'Stated APR', values: [18, 24, 30] },
    { name: 'Effective rate, compounded daily', values: [19.72, 27.11, 34.97] },
  ],
  yFmt: (v) => pct(v),
  valueFmt: (v) => (Number.isInteger(v) ? pct(v) : pct(v, 2)),
})

figures['how-much-loan-do-i-need-trading-in-car-scenarios'] = barChart({
  title: 'Loan needed for a $35,000 car with a trade-in',
  subtitle: '$15,000 trade-in, 7% tax on the difference, $800 fees, $2,000 down',
  rows: [
    { label: 'Owe $12,000 (+$3,000 equity)', value: 32200 },
    { label: 'Owe $18,000 (−$3,000 equity)', value: 38200, color: SERIES[1] },
  ],
  labelWidth: 260,
  footnote: 'At 7% for 60 months: $638 vs. $756 a month',
})

figures['when-does-credit-card-interest-start-grace-days'] = columnChart({
  title: 'Interest-free days on a purchase',
  subtitle: '30-day billing cycle, payment due 25 days after the statement closes',
  categories: ['Bought on day 1', 'Bought on day 15', 'Bought on day 30'],
  series: [{ name: 'Days until payment is due', values: [54, 40, 25] }],
  yFmt: (v) => String(v),
  valueFmt: (v) => `${v} days`,
})

figures['is-60000-a-good-down-payment-percent'] = columnChart({
  title: '$60,000 as a share of the home price',
  subtitle: 'It reaches the 20% that avoids PMI on homes up to $300,000',
  categories: ['$200K', '$300K', '$400K', '$500K', '$600K', '$750K'],
  series: [{ name: 'Down payment', values: [30, 20, 15, 12, 10, 8] }],
  xLabel: 'Home price',
  yFmt: (v) => pct(v),
  refLines: [{ y: 20, label: '20% — no PMI' }],
})

figures['good-debt-to-income-ratio-limits'] = barChart({
  title: 'Typical maximum back-end DTI by loan type',
  subtitle: 'Approvals above these depend on compensating factors',
  rows: [
    { label: 'Conventional, automated', value: 50 },
    { label: 'Conventional, manual + factors', value: 45 },
    { label: 'FHA (manual benchmark)', value: 43 },
    { label: 'VA (guideline)', value: 41 },
    { label: 'USDA', value: 41 },
    { label: 'Conventional, manual', value: 36 },
  ],
  valueFmt: (v) => pct(v),
  labelWidth: 260,
  refLine: { value: 36, label: '28/36 guideline' },
})

figures['how-are-credit-card-interest-rates-determined-prime'] = columnChart({
  title: 'Credit card APR = prime rate + margin',
  subtitle: 'Illustrative margins at the 2020–22 and 2023–24 prime rates',
  categories: ['11-point margin', '15-point margin', '19-point margin'],
  series: [
    { name: 'Prime at 3.25%', values: [14.25, 18.25, 22.25] },
    { name: 'Prime at 8.50%', values: [19.5, 23.5, 27.5] },
  ],
  yFmt: (v) => pct(v),
  valueFmt: (v) => pct(v, 2),
})

mkdirSync(OUT_DIR, { recursive: true })
for (const [name, svg] of Object.entries(figures)) writeFileSync(join(OUT_DIR, `${name}.svg`), svg)
console.log(`Wrote ${Object.keys(figures).length} figures to ${OUT_DIR}`)
