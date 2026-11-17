import { useMemo, useState } from 'react'
import dados from '../data/dados.json'
import inpe from '../data/serie-focos-inpe.json'
import useFocos from '../data/useFocos.js'
import { BarChart, ChartCard, HBarChart } from './Charts.jsx'
import { fmt } from '../data/format.js'

const dayFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const title = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()).replace(/ De /g, ' de ')

function countBy(list, key) {
  const out = {}
  list.forEach((f) => { const k = f[key]; if (k != null) out[k] = (out[k] ?? 0) + 1 })
  return out
}

function parseSeries(text) {
  const out = []
  text.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*(\d{4})\s*[;\t,]\s*([\d.\s]+?)\s*$/)
    if (!m) return
    const valor = Number(m[2].replace(/[.\s]/g, ''))
    if (Number.isFinite(valor)) out.push({ ano: Number(m[1]), valor, tipo: 'importado', nota: 'Importado por você' })
  })
  return out
}

export function DataSection() {
  const { focos, error } = useFocos()
  const [csv, setCsv] = useState('')
  const imported = useMemo(() => parseSeries(csv), [csv])

  const stats = useMemo(() => {
    if (!focos) return null
    const f = focos.features
    const byDay = countBy(f, 'dataPas')
    const days = Object.keys(byDay).sort().map((d) => ({ label: dayFmt.format(new Date(`${d}T00:00:00Z`)), value: byDay[d] }))
    const byState = Object.entries(countBy(f, 'estado')).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: title(k), value: v, color: 'earth' }))
    const veg = Object.entries(countBy(f, 'vegetacao')).sort((a, b) => b[1] - a[1])
    const natural = veg.filter(([k]) => /caatinga|savana|flores/i.test(k)).reduce((s, [, v]) => s + v, 0)
    const antro = veg.filter(([k]) => /pastag|agricult/i.test(k)).reduce((s, [, v]) => s + v, 0)
    const vegBars = [
      { label: 'Vegetação nativa', value: natural, color: 'sage' },
      { label: 'Pastagens e agricultura', value: antro, color: 'ochre' },
      { label: 'Outras classes', value: f.length - natural - antro, color: 'earth' },
    ]
    const dry = f.map((x) => x.diasSemChuva).filter((v) => typeof v === 'number' && v >= 0)
    const buckets = [['0 dia', (v) => v === 0], ['1 a 30', (v) => v >= 1 && v <= 30], ['31 a 60', (v) => v > 30 && v <= 60], ['Mais de 60', (v) => v > 60]]
    const dryBars = buckets.map(([label, fn]) => ({ label, value: dry.filter(fn).length, color: 'terracotta' }))
    const frp = f.map((x) => x.frp).filter((v) => typeof v === 'number' && v >= 0)
    const frpMean = frp.reduce((s, v) => s + v, 0) / frp.length
    const risco = f.map((x) => x.risco).filter((v) => typeof v === 'number' && v >= 0)
    const riscoAlto = risco.filter((v) => v >= 0.66).length / risco.length
    return { total: f.length, days, byState, vegBars, dryBars, frpMean, riscoAlto, nativePct: natural / f.length, antroPct: antro / f.length }
  }, [focos])

  const serie = useMemo(() => {
    const base = inpe.serie.length ? inpe.serie.map((d) => ({ ano: d.ano, valor: d.valor, tipo: 'publicado' })) : dados.serieFocos
    const map = new Map(base.map((d) => [d.ano, d]))
    imported.forEach((d) => map.set(d.ano, d))
    const many = map.size > 10
    return [...map.values()].sort((a, b) => a.ano - b.ano).map((d) => ({ label: many ? `’${String(d.ano).slice(2)}` : String(d.ano), value: d.valor, estimated: d.tipo === 'derivado', color: d.tipo === 'importado' ? 'ochre' : 'terracotta' }))
  }, [imported])

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then(setCsv)
  }

  return (
    <section className="section data-section" id="dados" aria-labelledby="data-title">
      <div className="section-heading">
        <p className="eyebrow">Tópico 6 · gráficos e dados</p>
        <h2 id="data-title">A evolução das queimadas na Caatinga</h2>
        <p>Gráficos feitos com dados do INPE, do MapBiomas e de estudos publicados. Barras hachuradas são valores derivados de variações percentuais divulgadas, não números publicados diretamente.</p>
      </div>

      <h3 className="data-group">Focos de calor (INPE)</h3>
      <div className="chart-grid-wrap">
        <ChartCard eyebrow="Série anual" title="Focos de calor por ano" note={inpe.serie.length ? `Série completa gerada em ${inpe.geradoEm}. O último ano pode estar incompleto.` : 'Só três anos publicados estavam disponíveis. Rode scripts/gerar_serie_focos.py (veja o README) ou importe a série abaixo para ver a evolução ano a ano.'} source={inpe.serie.length ? inpe.fonte : 'INPE/BDQueimadas, via Folhapress (2010 e 2023); 2022 derivado do aumento de 39%.'}>
          <BarChart data={serie} unit="focos" title="Focos de calor na Caatinga por ano" />
          <details className="import-box">
            <summary>Importar série anual (CSV)</summary>
            <p>No BDQueimadas, filtre o bioma Caatinga e exporte focos por ano. Cole linhas no formato <code>ano;focos</code> (uma por linha) ou envie um arquivo.</p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={6} placeholder={'2019;9102\n2020;12410\n2021;10560'} aria-label="Série anual em CSV" />
            <input type="file" accept=".csv,.txt" onChange={onFile} aria-label="Enviar arquivo CSV" />
            <p className="import-status">{imported.length ? `${imported.length} ano(s) lido(s); o gráfico acima foi atualizado.` : 'Nenhum dado importado.'}</p>
          </details>
        </ChartCard>
        {inpe.mensal.length === 12 && (
          <ChartCard eyebrow="Sazonalidade" title="Focos por mês do ano" note={`Soma de ${inpe.mensalPeriodo[0]} a ${inpe.mensalPeriodo[1]}. Mostra em que meses o fogo se concentra na Caatinga.`} source={inpe.fonte}>
            <BarChart data={inpe.mensal.map((m) => ({ label: MESES[m.mes - 1], value: m.valor, color: 'terracotta' }))} unit="focos" title="Focos de calor por mês" />
          </ChartCard>
        )}
        <ChartCard eyebrow="Evolução recente" title="Focos por dia, 1 a 8 de novembro de 2026" note="Dias com poucos focos podem refletir limites da detecção por satélite (nuvens, horário de passagem) e não ausência de fogo." source="INPE, satélite de referência AQUA_M-T; dados salvos em 9/11/2026." >
          {stats ? <BarChart data={stats.days} unit="focos" title="Focos por dia" /> : <p className="chart-loading">{error ? 'Não foi possível carregar os dados.' : 'Carregando dados…'}</p>}
        </ChartCard>
        <ChartCard eyebrow="Onde queimou" title="Focos por estado" note={stats ? `${fmt(stats.total)} focos no mês até 8/11. Bahia, Piauí e Ceará concentram a maior parte.` : ''} source="INPE, nov/2026.">
          {stats ? <HBarChart data={stats.byState} unit="focos" title="Focos por estado" /> : <p className="chart-loading">Carregando dados…</p>}
        </ChartCard>
        <ChartCard eyebrow="Em que tipo de terra" title="Focos por tipo de cobertura" note={stats ? `${Math.round(stats.antroPct * 100)}% dos focos caíram em pastagens e agricultura; ${Math.round(stats.nativePct * 100)}% em vegetação nativa. O fogo agrícola ou de manejo também aparece nos dados.` : ''} source="INPE, classificação de vegetação associada a cada foco.">
          {stats ? <HBarChart data={stats.vegBars} unit="focos" title="Focos por cobertura" /> : <p className="chart-loading">Carregando dados…</p>}
        </ChartCard>
        <ChartCard cycle="Ciclo da água" eyebrow="Seca e fogo" title="Dias sem chuva no momento do foco" note={stats ? `Potência radiativa média: ${fmt(stats.frpMean)} MW; ${Math.round(stats.riscoAlto * 100)}% dos focos com risco de fogo alto (≥ 0,66).` : ''} source="INPE, nov/2026.">
          {stats ? <BarChart data={stats.dryBars} unit="focos" title="Focos por faixa de dias sem chuva" /> : <p className="chart-loading">Carregando dados…</p>}
        </ChartCard>
      </div>

      <h3 className="data-group">Área queimada e uso da terra (MapBiomas)</h3>
      <div className="chart-grid-wrap">
        <ChartCard eyebrow="Área queimada" title="Área queimada por ano" note="A Caatinga queimou cerca de 11,4 milhões de ha entre 1985 e 2024 (mais de 13% do bioma); 77% do volume anual médio se concentra de setembro a novembro." source="MapBiomas Fogo, Caatinga Coleção 10; 2023 derivado da queda de 16% em 2024.">
          <BarChart data={dados.areaQueimada.map((d) => ({ label: String(d.ano), value: d.valor, estimated: d.tipo === 'derivado' }))} unit="mil hectares" title="Área queimada na Caatinga" />
        </ChartCard>
        <ChartCard cycle="Ciclo do carbono" eyebrow="Vegetação que volta" title="Vegetação secundária regenerada por período" note="A regeneração foi maior entre 2005 e 2014. Depois, o ritmo caiu mais de 50%." source="MapBiomas, Caatinga Coleção 10 (1985–2024).">
          <BarChart data={dados.vegSecundaria.map((d) => ({ ...d, color: 'sage' }))} unit="milhões de hectares" title="Vegetação secundária por período" />
        </ChartCard>
        <ChartCard eyebrow="Pressão sobre o bioma" title="Natural e antrópico, 1985 e 2024" note="A área natural caiu 9,25 milhões de ha (−15%) enquanto a antrópica cresceu 9,2 milhões de ha." source="MapBiomas, Caatinga Coleção 10.">
          <BarChart data={dados.usoDaTerra} unit="milhões de hectares" title="Natural e antrópico" />
        </ChartCard>
      </div>

      <h3 className="data-group">Carbono, água e solo</h3>
      <div className="chart-grid-wrap">
        <ChartCard cycle="Ciclo do carbono" eyebrow="Emissões no Brasil" title="Carbono emitido por incêndios em 2024" note="Total parcial do ano. Não encontramos valor publicado separado para a Caatinga, e a área queimada dela (404 mil ha) é pequena frente à da Amazônia (15,6 milhões de ha)." source="Copernicus CAMS (via Eixos), dados até 23/09/2024.">
          <HBarChart data={dados.carbono.map((d) => ({ ...d, color: 'terracotta' }))} unit="milhões de toneladas de carbono" title="Carbono emitido por incêndios" />
        </ChartCard>
        <ChartCard cycle="Ciclos do carbono e do nitrogênio" eyebrow="Solo da Caatinga" title="Carbono orgânico total do solo (g/kg)" note="Em Sobral (CE), a área queimada tinha 10% menos carbono orgânico que a mata." source="Nunes et al. (2009), Revista Caatinga; solo 0–20 cm.">
          <BarChart data={dados.solo.cot.map((d, i) => ({ ...d, color: i ? 'terracotta' : 'sage' }))} unit="g/kg" title="Carbono orgânico total" />
        </ChartCard>
        <ChartCard cycle="Ciclos do carbono e do nitrogênio" eyebrow="Solo da Caatinga" title="Carbono da biomassa microbiana (mg/kg)" note="A biomassa microbiana, que decompõe a matéria orgânica, foi 45% menor na área queimada: o indicador mais sensível ao fogo." source="Nunes et al. (2009), Revista Caatinga.">
          <BarChart data={dados.solo.cbm.map((d, i) => ({ ...d, color: i ? 'terracotta' : 'sage' }))} unit="mg/kg" title="Carbono da biomassa microbiana" />
        </ChartCard>
      </div>
      <div className="stat-row">
        <div className="stat"><strong>981 mil ha</strong><span>de superfície de água na Caatinga em 2024, 1,1% do bioma</span></div>
        <div className="stat"><strong>−21%</strong><span>de água natural entre 1985 e 2024 (−66 mil ha)</span></div>
        <div className="stat"><strong>14,7 t C/ha</strong><span>perdidas do solo ao converter floresta densa em pastagem degradada (até 20 cm)</span></div>
        <div className="stat"><strong>2017</strong><span>ano de menor superfície de água em 40 anos</span></div>
      </div>
      <p className="lab-note data-note">A superfície de água e a perda de carbono por pastagem (Bieluczyk et al., Pernambuco) não são medidas de áreas queimadas. Entram como contexto de água e solo degradado, e a relação com o fogo é indireta.</p>
    </section>
  )
}

const cycles = [
  { id: 'carbono', name: 'Ciclo do carbono', what: 'A biomassa guarda carbono. A queima devolve parte dele à atmosfera como CO₂, CO, metano e fuligem. Com menos vegetação, também diminui a captura de carbono pela fotossíntese.', datum: '183 milhões de toneladas de carbono emitidas por incêndios no Brasil em 2024 (até 23/09, CAMS). No solo da Caatinga, a área queimada tinha 10% menos carbono orgânico e 45% menos biomassa microbiana que a mata.', result: 'A vegetação em regeneração (8,3 milhões de ha de secundária em 2024) volta a absorver carbono, mas o fogo recorrente impede esse saldo.' },
  { id: 'agua', name: 'Ciclo da água', what: 'Sem cobertura vegetal, diminui a interceptação da chuva e a infiltração, e aumentam o escoamento e a erosão. A evapotranspiração das plantas, que devolve água ao ar, também cai.', datum: 'A superfície de água natural da Caatinga caiu 21% entre 1985 e 2024, e em 2017 chegou ao menor valor em 40 anos. Nos focos de 1–8/nov/2026, 37% ocorreram com mais de 30 dias sem chuva.', result: 'Menos água no solo atrasa a rebrota e a germinação, e a erosão leva embora a camada fértil.' },
  { id: 'nitrogenio', name: 'Ciclo do nitrogênio', what: 'O nitrogênio da biomassa e da serapilheira é perdido para a atmosfera durante a queima. Depois do fogo, a recuperação depende de bactérias fixadoras e de plantas leguminosas, como a jurema-preta.', datum: 'Sem medida específica de nitrogênio nos estudos consultados. O estudo de Sobral mediu o carbono microbiano e viu estresse nos microrganismos (qCO₂ 0,57 na área queimada contra 0,29 na mata).', result: 'A jurema-preta, pioneira que fixa nitrogênio, ajuda a repor o nutriente nos estágios iniciais da sucessão.' },
  { id: 'nutrientes', name: 'Nutrientes do solo (fósforo, cálcio)', what: 'A cinza libera nutrientes de uma só vez. Isso eleva o pH e o cálcio por pouco tempo, e a chuva depois leva boa parte embora.', datum: 'Em Sobral, o pH foi 7,3 na área queimada contra 6,4–6,6 nas demais, e o cálcio foi 97 contra 56–77 mmolc/dm³. Os autores citam que esse ganho é temporário.', result: 'O pulso de nutrientes favorece as pioneiras, mas o solo empobrece se o fogo se repete.' },
]

export function CyclesSection() {
  const [open, setOpen] = useState('carbono')
  return (
    <section className="section cycles-section" id="ciclos" aria-labelledby="cycles-title">
      <div className="section-heading">
        <p className="eyebrow">Tópico 5 · ciclos biogeoquímicos</p>
        <h2 id="cycles-title">O que os dados dizem sobre os ciclos</h2>
        <p>Cada indicador dos gráficos está ligado a um ciclo. Escolha um ciclo para ver o processo, o dado e a consequência.</p>
      </div>
      <div className="cycle-tabs" role="tablist" aria-label="Ciclos biogeoquímicos">
        {cycles.map((c) => <button key={c.id} type="button" role="tab" aria-selected={open === c.id} onClick={() => setOpen(c.id)}>{c.name}</button>)}
      </div>
      {cycles.filter((c) => c.id === open).map((c) => (
        <div className="cycle-panel" key={c.id} role="tabpanel">
          <article className="cordel-card"><p className="eyebrow">O que o fogo faz</p><p>{c.what}</p></article>
          <article className="cordel-card"><p className="eyebrow">O dado</p><p>{c.datum}</p></article>
          <article className="cordel-card"><p className="eyebrow">Consequência</p><p>{c.result}</p></article>
        </div>
      ))}
    </section>
  )
}
