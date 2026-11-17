const COLORS = { terracotta: '#a3422b', ochre: '#c28b28', sage: '#68745a', earth: '#563a2a', ink: '#211b16' }
import { fmt } from '../data/format.js'

function niceMax(value) {
  if (value <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(value))
  const n = value / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

function ChartDefs() {
  return (
    <defs>
      <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="#f2e6c8" /><line x1="0" y1="0" x2="0" y2="6" stroke="#211b16" strokeWidth="2.4" />
      </pattern>
      {Object.entries(COLORS).filter(([k]) => k !== 'ink').map(([name, color]) => (
        <pattern key={name} id={`wood-${name}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="7" height="7" fill={color} /><line x1="0" y1="0" x2="0" y2="7" stroke="#211b16" strokeWidth="1.5" opacity=".38" />
        </pattern>
      ))}
    </defs>
  )
}

/** Barras verticais. data: [{ label, value, color?, estimated? }] */
export function BarChart({ data, unit = '', title, desc, format = fmt, height = 250 }) {
  const width = 560
  const pad = { top: 22, right: 12, bottom: 54, left: 46 }
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const band = innerW / data.length
  const barW = Math.min(64, band * 0.62)
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <title>{title}</title>
      <desc>{desc ?? data.map((d) => `${d.label}: ${format(d.value)} ${unit}`).join('; ')}</desc>
      <ChartDefs />
      {ticks.map((t) => {
        const y = pad.top + innerH * (1 - t)
        return (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="chart-grid" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" className="chart-tick">{format(max * t)}</text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH
        const x = pad.left + band * i + (band - barW) / 2
        const y = pad.top + innerH - h
        const fill = d.estimated ? 'url(#hatch)' : `url(#wood-${COLORS[d.color] ? d.color : 'terracotta'})`
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} fill={fill} stroke={COLORS.ink} strokeWidth="2"><title>{`${d.label}: ${format(d.value)} ${unit}`}</title></rect>
            {data.length <= 12 && <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="chart-value">{format(d.value)}</text>}
            <foreignObject x={pad.left + band * i} y={height - pad.bottom + 6} width={band} height={pad.bottom - 6}>
              <div className="chart-xlabel">{d.label}</div>
            </foreignObject>
          </g>
        )
      })}
      {unit && <text x={pad.left} y={12} className="chart-unit">{unit}</text>}
    </svg>
  )
}

/** Barras horizontais para rótulos longos. */
export function HBarChart({ data, unit = '', title, desc, format = fmt }) {
  const rowH = 34
  const width = 560
  const labelW = 190
  const height = data.length * rowH + 28
  const max = Math.max(...data.map((d) => d.value))
  const innerW = width - labelW - 56
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <title>{title}</title>
      <desc>{desc ?? data.map((d) => `${d.label}: ${format(d.value)} ${unit}`).join('; ')}</desc>
      {unit && <text x={labelW} y={11} className="chart-unit">{unit}</text>}
      {data.map((d, i) => {
        const y = 22 + i * rowH
        const w = Math.max(2, (d.value / max) * innerW)
        return (
          <g key={d.label}>
            <text x={labelW - 8} y={y + 16} textAnchor="end" className="chart-tick">{d.label}</text>
            <rect x={labelW} y={y + 2} width={w} height={20} fill={`url(#wood-${COLORS[d.color] ? d.color : 'terracotta'})`} stroke={COLORS.ink} strokeWidth="2" />
            <text x={labelW + w + 6} y={y + 17} className="chart-value left">{format(d.value)}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function ChartCard({ eyebrow, title, children, note, source, cycle }) {
  return (
    <article className="chart-card">
      <p className="eyebrow">{eyebrow}{cycle && <span className="cycle-tag">{cycle}</span>}</p>
      <h3>{title}</h3>
      {children}
      {note && <p className="chart-note">{note}</p>}
      {source && <p className="chart-source">Fonte: {source}</p>}
    </article>
  )
}
