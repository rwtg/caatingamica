import { useMemo, useState } from 'react'
import data from '../data/cadeias.json'

const nodeById = Object.fromEntries(data.nodes.map((n) => [n.id, n]))
const pct = (v) => `${Math.round(v * 100)}%`

/** Modelo didático: perda direta (sensibilidade × intensidade) + efeito de baixo para cima pela dieta. */
function simulate(intensity, removed) {
  const memo = {}
  const calc = (id) => {
    if (id in memo) return memo[id]
    const n = nodeById[id]
    let value
    if (removed.has(id)) value = 0
    else {
      const direct = 1 - intensity * n.sens
      if (n.eats.length === 0) value = direct
      else {
        const food = n.eats.reduce((s, e) => s + calc(e), 0) / n.eats.length
        value = direct * (0.25 + 0.75 * food)
      }
    }
    memo[id] = value
    return value
  }
  data.nodes.forEach((n) => calc(n.id))
  return memo
}

function statusColor(v) {
  if (v >= 0.75) return '#68745a'
  if (v >= 0.45) return '#c28b28'
  if (v >= 0.15) return '#a3422b'
  return '#563a2a'
}

function IntensityControl({ intensity, setIntensity }) {
  return (
    <label className="intensity-control">
      <span>Intensidade do fogo: <strong>{pct(intensity)}</strong></span>
      <input type="range" min="0" max="1" step="0.05" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} aria-label="Intensidade do fogo" />
      <span className="intensity-scale"><i>sem fogo</i><i>fogo severo</i></span>
    </label>
  )
}

export default function FoodSections() {
  const [intensity, setIntensity] = useState(0.7)
  const [removed, setRemoved] = useState(() => new Set())
  const [selected, setSelected] = useState(null)
  const sim = useMemo(() => simulate(intensity, removed), [intensity, removed])

  const toggleRemoved = (id) => setRemoved((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  return (
    <>
      <ChainSection intensity={intensity} setIntensity={setIntensity} sim={sim} />
      <WebSection intensity={intensity} setIntensity={setIntensity} sim={sim} removed={removed} toggleRemoved={toggleRemoved} clearRemoved={() => setRemoved(new Set())} selected={selected} setSelected={setSelected} />
      <EnergySection intensity={intensity} setIntensity={setIntensity} sim={sim} />
    </>
  )
}

function ChainSection({ intensity, setIntensity, sim }) {
  const [chainId, setChainId] = useState(data.chains[0].id)
  const [after, setAfter] = useState(true)
  const chain = data.chains.find((c) => c.id === chainId)
  const steps = chain.path.map((id) => nodeById[id])
  return (
    <section className="section lab-section" id="cadeia" aria-labelledby="chain-title">
      <div className="section-heading">
        <p className="eyebrow">Tópico 1 · níveis tróficos</p>
        <h2 id="chain-title">Cadeias alimentares da Caatinga</h2>
        <p>Escolha uma cadeia, compare o antes e o depois do fogo e veja como o impacto sobe pelos níveis tróficos.</p>
      </div>
      <div className="lab-controls">
        <div className="compare-tabs" role="tablist" aria-label="Escolha uma cadeia alimentar">
          {data.chains.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={chainId === c.id} onClick={() => setChainId(c.id)}>{c.title}</button>
          ))}
        </div>
        <div className="toggle-pair" role="group" aria-label="Momento">
          <button type="button" aria-pressed={!after} onClick={() => setAfter(false)}>Antes do fogo</button>
          <button type="button" aria-pressed={after} onClick={() => setAfter(true)}>Depois do fogo</button>
        </div>
        {after && <IntensityControl intensity={intensity} setIntensity={setIntensity} />}
      </div>
      <ol className="chain">
        {steps.map((n, i) => {
          const level = data.levels[n.level]
          const value = after ? sim[n.id] : 1
          return (
            <li key={n.id} className="chain-step">
              <article className="cordel-card chain-card">
                <span className="level-badge">{level.short}</span>
                <h3>{n.name}</h3>
                <p>{n.role}</p>
                <div className="abundance" aria-label={`Abundância relativa: ${pct(value)}`}>
                  <span style={{ width: pct(value), background: statusColor(value) }} />
                </div>
                <small className="abundance-label">Abundância relativa: {pct(value)}</small>
                {after && <p className="fire-note"><b>Efeito do fogo:</b> {n.fire}</p>}
              </article>
              <span className="chain-arrow" aria-hidden="true">{i < steps.length ? '→' : ''}</span>
            </li>
          )
        })}
        <li className="chain-step">
          <article className="cordel-card chain-card decomposer-card">
            <span className="level-badge">Decompositor</span>
            <h3>{data.decomposers.name}</h3>
            <p>{data.decomposers.text}</p>
            {after && <p className="fire-note"><b>Efeito do fogo:</b> {data.decomposers.fire}</p>}
          </article>
        </li>
      </ol>
      <p className="lab-note">As setas indicam o sentido da energia: de quem é comido para quem come. Os percentuais vêm de um modelo didático (veja a teia a seguir), não de medições em campo.</p>
    </section>
  )
}

const W = 920
const ROW_Y = { 3: 20, 2: 140, 1: 260, 0: 380 }
const NW = 176
const NH = 62

function layout() {
  const pos = {}
  for (const level of [0, 1, 2, 3]) {
    const row = data.nodes.filter((n) => n.level === level)
    row.forEach((n, i) => { pos[n.id] = { x: (W * (i + 0.5)) / row.length - NW / 2, y: ROW_Y[level] } })
  }
  return pos
}
const POS = layout()

function WebSection({ intensity, setIntensity, sim, removed, toggleRemoved, clearRemoved, selected, setSelected }) {
  const sel = selected ? nodeById[selected] : null
  const edges = data.nodes.flatMap((n) => n.eats.map((e) => ({ from: e, to: n.id })))
  return (
    <section className="section lab-section web-section" id="teia" aria-labelledby="web-title">
      <div className="section-heading">
        <p className="eyebrow">Tópico 2 · cadeias conectadas</p>
        <h2 id="web-title">A teia alimentar e o efeito cascata</h2>
        <p>As três cadeias se cruzam: a mesma presa serve a vários predadores. Aumente a intensidade do fogo ou remova uma espécie para ver a desestabilização.</p>
      </div>
      <div className="lab-controls">
        <IntensityControl intensity={intensity} setIntensity={setIntensity} />
        <button type="button" className="ink-button" onClick={clearRemoved} disabled={removed.size === 0}>Restaurar espécies removidas</button>
      </div>
      <div className="web-scroll">
        <svg className="web-svg" viewBox={`0 0 ${W} 520`} role="group" aria-label="Teia alimentar da Caatinga">
          <defs>
            <pattern id="node-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="6" stroke="#211b16" strokeWidth="1.4" /></pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#211b16" /></marker>
          </defs>
          {[3, 2, 1, 0].map((l) => (
            <text key={l} x="0" y={ROW_Y[l] - 5} className="web-level">{data.levels[l].name.toUpperCase()}</text>
          ))}
          {edges.map(({ from, to }) => {
            const a = POS[from]; const b = POS[to]
            const same = nodeById[from].level === nodeById[to].level
            const x1 = same ? a.x + NW : a.x + NW / 2
            const y1 = same ? a.y + NH / 2 : a.y
            const x2 = same ? b.x : b.x + NW / 2
            const y2 = same ? b.y + NH / 2 : b.y + NH
            const active = selected && (from === selected || to === selected)
            return <line key={`${from}-${to}`} x1={x1} y1={y1} x2={x2} y2={y2} className={`web-edge ${active ? 'active' : ''} ${selected && !active ? 'dim' : ''}`} markerEnd="url(#arrow)" />
          })}
          {data.nodes.map((n) => {
            const p = POS[n.id]
            const v = sim[n.id]
            const isRemoved = removed.has(n.id)
            return (
              <g key={n.id} transform={`translate(${p.x} ${p.y})`} className={`web-node ${selected === n.id ? 'selected' : ''} ${isRemoved ? 'removed' : ''}`} role="button" tabIndex={0} aria-pressed={selected === n.id}
                aria-label={`${n.name}: abundância ${pct(v)}${isRemoved ? ', removida' : ''}`}
                onClick={() => setSelected(selected === n.id ? null : n.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === n.id ? null : n.id) } }}>
                <polygon points={`10,5 ${NW + 5},5 ${NW + 5},${NH + 5} 5,${NH + 5} 5,15`} className="web-shadow" />
                <polygon points={`10,0 ${NW},0 ${NW},${NH} 0,${NH} 0,10`} fill={statusColor(v)} />
                <polygon points={`10,0 ${NW},0 ${NW},${NH} 0,${NH} 0,10`} fill="url(#node-hatch)" className="web-hatch" />
                <foreignObject x="4" y="2" width={NW - 8} height={NH - 4}>
                  <div className="web-node-label" style={{ color: v >= 0.45 && v < 0.75 ? '#211b16' : '#fff7e2' }}><span>{n.name}</span><b>{isRemoved ? 'removida' : pct(v)}</b></div>
                </foreignObject>
              </g>
            )
          })}
          <g transform="translate(0 470)">
            <rect width={W} height="40" fill="#e8d6aa" stroke="#211b16" strokeWidth="2" strokeDasharray="6 4" />
            <text x={W / 2} y="25" textAnchor="middle" className="web-decomp">DECOMPOSITORES (fungos, bactérias, cupins) recebem energia de todos os níveis</text>
          </g>
        </svg>
      </div>
      <div className="web-legend" aria-hidden="true">
        <span><i style={{ background: '#68745a' }} /> ≥ 75%</span>
        <span><i style={{ background: '#c28b28' }} /> 45–74%</span>
        <span><i style={{ background: '#a3422b' }} /> 15–44%</span>
        <span><i style={{ background: '#563a2a' }} /> &lt; 15%</span>
        <span className="legend-text">Abundância relativa ao cenário sem fogo (modelo didático)</span>
      </div>
      <aside className="web-detail" aria-live="polite">
        {sel ? (
          <>
            <p className="eyebrow">{data.levels[sel.level].name}</p>
            <h3>{sel.name} · {removed.has(sel.id) ? 'removida' : pct(sim[sel.id])}</h3>
            <p>{sel.role}</p>
            <p><b>Come:</b> {sel.eats.length ? sel.eats.map((e) => nodeById[e].name).join(', ') : 'produz o próprio alimento por fotossíntese'}.</p>
            <p><b>Efeito do fogo:</b> {sel.fire}</p>
            <button type="button" className="ink-button" onClick={() => toggleRemoved(sel.id)}>{removed.has(sel.id) ? 'Devolver à teia' : 'Remover esta espécie da teia'}</button>
          </>
        ) : (
          <p>Selecione uma espécie na teia para ver sua dieta, o efeito do fogo sobre ela e simular o seu desaparecimento.</p>
        )}
      </aside>
      <div className="lab-explain">
        <h3>Como o fogo desestabiliza a teia</h3>
        <ul>
          <li><b>Base atingida primeiro:</b> o fogo remove a biomassa dos produtores, e os herbívoros perdem alimento e abrigo.</li>
          <li><b>Efeito cascata:</b> menos herbívoros significa menos alimento para lagartos, serpentes, aves e onças.</li>
          <li><b>Espécies-chave:</b> o preá e o calango alimentam vários predadores; quando caem, muitos fios da teia se rompem ao mesmo tempo.</li>
          <li><b>Teia mais simples:</b> sem a diversidade de presas, os predadores ficam dependentes de poucas espécies e a teia perde estabilidade.</li>
        </ul>
        <p className="lab-note">Limite do modelo: a abundância de cada espécie depende da perda direta pelo fogo e do alimento disponível. Ele não representa o efeito dos predadores sobre as presas, migração nem sazonalidade.</p>
      </div>
    </section>
  )
}

function EnergySection({ intensity, setIntensity, sim }) {
  const rows = [0, 1, 2, 3].map((level) => {
    const members = data.nodes.filter((n) => n.level === level)
    const mean = members.reduce((s, n) => s + sim[n.id], 0) / members.length
    const before = 10000 * 0.1 ** level
    return { level, name: data.levels[level].name, before, after: before * mean, mean }
  })
  const scale = (v) => Math.max(0.01, (Math.log10(Math.max(v, 0.1)) + 1) / 5)
  const lost = 1 - rows[0].mean
  return (
    <section className="section lab-section energy-section" id="energia" aria-labelledby="energy-title">
      <div className="section-heading">
        <p className="eyebrow">Tópico 3 · fluxo de energia</p>
        <h2 id="energy-title">Onde o fluxo de energia é interrompido</h2>
        <p>Em cada nível trófico só cerca de 10% da energia passa ao seguinte. Se a base diminui, todos os níveis acima diminuem também.</p>
      </div>
      <div className="lab-controls"><IntensityControl intensity={intensity} setIntensity={setIntensity} /></div>
      <div className="energy-grid">
        <div className="energy-chart" role="img" aria-label="Pirâmide de energia antes e depois do fogo">
          {[...rows].reverse().map((r) => (
            <div className="energy-row" key={r.level}>
              <span className="energy-name">{r.name}</span>
              <div className="energy-bars">
                <div className="energy-bar before" style={{ width: `${scale(r.before) * 100}%` }}><span>{Math.round(r.before).toLocaleString('pt-BR')}</span></div>
                <div className="energy-bar after" style={{ width: `${scale(r.after) * 100}%` }}><span>{Math.round(r.after).toLocaleString('pt-BR')}</span></div>
              </div>
            </div>
          ))}
          <div className="energy-legend"><span><i className="before" /> Sem fogo</span><span><i className="after" /> Após o fogo ({pct(intensity)})</span><span className="legend-text">Escala logarítmica; unidades didáticas de energia</span></div>
        </div>
        <div className="lab-explain">
          <h3>Quatro pontos de ruptura</h3>
          <ol>
            <li><b>Combustão da biomassa:</b> a energia química guardada em folhas e galhos vira calor, CO₂ e fumaça. Ela deixa de estar disponível aos herbívoros.</li>
            <li><b>Menos fotossíntese:</b> sem folhas, a entrada de energia no sistema cai. Neste cenário, os produtores ficam com {pct(rows[0].mean)} do normal, uma perda de {pct(lost)}.</li>
            <li><b>Presas escassas:</b> cada nível seguinte recebe uma fração do anterior, então a perda se acumula até os predadores de topo.</li>
            <li><b>Decompositores desorganizados:</b> o fogo mata parte da microbiota (45% menos carbono microbiano em área queimada da Caatinga; Nunes et al., 2009), e a ciclagem de nutrientes que realimenta os produtores fica mais lenta.</li>
          </ol>
        </div>
      </div>
    </section>
  )
}
