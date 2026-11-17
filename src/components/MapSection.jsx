import { Fragment, useEffect, useMemo, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import focosUrl from '../data/focos-inpe.json?url'
import caatingaUrl from '../data/caatinga.json?url'
import 'leaflet/dist/leaflet.css'

const riskColor = (value) => {
  if (value >= 0.66) return '#a3422b'
  if (value >= 0.33) return '#c28b28'
  return '#68745a'
}

const fireIcon = L.divIcon({
  className: 'fire-marker-wrap',
  html: '<span class="fire-marker" aria-hidden="true"><svg viewBox="0 0 24 30"><path d="M13.8 1.5c1.1 5.2-4.9 6.7-3.1 11.6 1-1.6 2.8-2.7 4.1-4.5 4.4 4 6.2 7.5 4.7 12.1-1.1 3.2-4 5.4-7.7 5.4-4.6 0-7.5-3.1-7.5-7.2 0-3.6 2.5-6.1 5.4-9.2-.2 3.1.1 4.1.7 4.8 1.1-4.4 5.7-6.7 3.4-13Z" fill="#a3422b" stroke="#211b16" stroke-width="1.5" stroke-linejoin="round"/></svg></span>',
  iconSize: [27, 33],
  iconAnchor: [13, 30],
  popupAnchor: [0, -26],
})

const polygonStyle = {
  color: '#563a2a',
  weight: 2,
  opacity: 0.9,
  fillColor: '#c28b28',
  fillOpacity: 0.08,
}

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'UTC',
})
const monthYear = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
export default function MapSection() {
  const [focos, setFocos] = useState(null)
  const [caatinga, setCaatinga] = useState(null)
  const [dataError, setDataError] = useState(false)
  const [period, setPeriod] = useState('48h')
  const [state, setState] = useState('Todos')
  const [layers, setLayers] = useState({ focos: true, risco: false, frp: false, bioma: true })
  useEffect(() => {
    let cancelled = false
    Promise.all([loadJson(focosUrl), loadJson(caatingaUrl)])
      .then(([fireData, biomeData]) => {
        if (!Array.isArray(fireData.features) || !biomeData.features?.length) {
          throw new Error('Os arquivos de focos ou do limite do bioma estão incompletos.')
        }
        if (!cancelled) {
          setFocos(fireData)
          setCaatinga(biomeData)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Não foi possível carregar os dados locais do mapa.', error)
          setDataError(true)
        }
      })
    return () => { cancelled = true }
  }, [])

  const snapshotTime = useMemo(() => focos ? new Date(focos.atualizadoEm) : null, [focos])
  const monthStart = useMemo(() => snapshotTime
    ? new Date(Date.UTC(snapshotTime.getUTCFullYear(), snapshotTime.getUTCMonth(), 1))
    : null, [snapshotTime])
  const states = useMemo(() => [
    'Todos',
    ...new Set((focos?.features ?? []).map((foco) => foco.estado).filter(Boolean).sort()),
  ], [focos])
  const periodFires = useMemo(() => {
    if (!focos || !snapshotTime || !monthStart) return []
    const start = period === '48h' ? snapshotTime.getTime() - (48 * 60 * 60 * 1000) : monthStart.getTime()
    return focos.features.filter((foco) => {
      const observedAt = Date.parse(foco.data)
      return Number.isFinite(observedAt) && observedAt >= start && observedAt <= snapshotTime.getTime()
    })
  }, [period, focos, snapshotTime, monthStart])
  const visibleFires = useMemo(() => periodFires.filter((foco) =>
    state === 'Todos' || foco.estado === state), [periodFires, state])
  const sourceDate = snapshotTime ? dateTime.format(snapshotTime) : null

  const toggleLayer = (name) => {
    setLayers((current) => ({ ...current, [name]: !current[name] }))
  }

  return (
    <section className="section map-section" id="mapa" aria-labelledby="map-title">
      <div className="section-heading">
        <p className="eyebrow">Dados observados · Programa Queimadas do INPE</p>
        <h2 id="map-title">O fogo no mapa</h2>
        <p>Explore focos detectados na Caatinga e escolha quais informações aparecem na paisagem.</p>
      </div>
      <div className="map-frame">
        <div className="map-toolbar">
          <label>PERÍODO
            <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Filtrar focos pelo período do conjunto de dados">
              <option value="48h">48 horas antes da coleta</option>
              <option value="mês">Mês da coleta{snapshotTime ? ` · ${monthYear.format(snapshotTime)}` : ''}</option>
            </select>
          </label>
          <label>ESTADO
            <select value={state} onChange={(event) => setState(event.target.value)} aria-label="Filtrar focos por estado">
              {states.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <span className="map-count" aria-live="polite">
            {dataError ? 'Dados do mapa indisponíveis' : focos ? `${visibleFires.length.toLocaleString('pt-BR')} focos neste recorte` : 'Carregando dados do mapa…'}
          </span>
        </div>
        <fieldset className="map-layers">
          <legend>CAMADAS VISÍVEIS</legend>
          <label><input type="checkbox" checked={layers.focos} onChange={() => toggleLayer('focos')} /> <FlameMark /> Focos</label>
          <label><input type="checkbox" checked={layers.risco} onChange={() => toggleLayer('risco')} /> <i className="layer-dot risk-dot" /> Risco de fogo</label>
          <label><input type="checkbox" checked={layers.frp} onChange={() => toggleLayer('frp')} /> <i className="layer-dot frp-dot" /> Potência radiativa</label>
          <label><input type="checkbox" checked={layers.bioma} onChange={() => toggleLayer('bioma')} /> <i className="layer-outline" /> Limite da Caatinga</label>
        </fieldset>
        <p className="map-layers-hint">Nas camadas circulares, a cor indica o risco e o tamanho indica a potência radiativa. Oculte “Focos” para ver os círculos sem sobreposição.</p>
        <MapContainer center={[-9.5, -39.5]} zoom={5} scrollWheelZoom={false} aria-label="Mapa dos focos de calor do INPE na Caatinga">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="sepia-tiles"
          />
          {layers.bioma && caatinga && <GeoJSON data={caatinga} style={polygonStyle} />}
          {visibleFires.map((foco) => (
            <Fragment key={foco.id}>
              {layers.risco && Number.isFinite(foco.risco) && (
                <CircleMarker
                  center={[foco.lat, foco.lng]}
                  radius={20}
                  pathOptions={{ color: riskColor(foco.risco), weight: 2, fillColor: riskColor(foco.risco), fillOpacity: 0.28 }}
                />
              )}
              {layers.frp && Number.isFinite(foco.frp) && (
                <CircleMarker
                  center={[foco.lat, foco.lng]}
                  radius={Math.min(26, 10 + Math.sqrt(Math.max(foco.frp, 0)))}
                  pathOptions={{ color: '#563a2a', weight: 1.5, fillColor: '#c28b28', fillOpacity: 0.32 }}
                />
              )}
              {layers.focos && (
                <Marker position={[foco.lat, foco.lng]} icon={fireIcon}>
                  <Popup>
                    <div className="cordel-popup">
                      <span className="popup-kicker">DETECÇÃO POR SATÉLITE · INPE</span>
                      <strong>{foco.municipio || 'Município não informado'}</strong>
                      <span>{foco.estado || 'Estado não informado'} · {dateTime.format(new Date(foco.data))} UTC</span>
                      <span>Satélite: {foco.satelite || 'não informado'}</span>
                      {Number.isFinite(foco.risco) && <span>Risco de fogo: {foco.risco.toLocaleString('pt-BR')} (escala INPE)</span>}
                      {Number.isFinite(foco.frp) && <span>FRP: {foco.frp.toLocaleString('pt-BR')} MW</span>}
                      {Number.isFinite(foco.precipitacao) && <span>Precipitação: {foco.precipitacao.toLocaleString('pt-BR')} mm</span>}
                      {Number.isFinite(foco.diasSemChuva) && <span>Dias sem chuva: {foco.diasSemChuva}</span>}
                      {foco.vegetacao && <span>Vegetação: {foco.vegetacao}</span>}
                    </div>
                  </Popup>
                </Marker>
              )}
            </Fragment>
          ))}
        </MapContainer>
        <MapLegend layers={layers} />
      </div>
      <p className="map-note">
        Fonte dos focos: <a href="https://terrabrasilis.dpi.inpe.br/queimadas/portal/" target="_blank" rel="noreferrer">Programa Queimadas do INPE</a>, camada do satélite de referência. Limite do bioma: camada oficial <code>biomas_brasileiros</code> do GeoServer do INPE. {focos && <>Recorte com {focos.totalRecebido.toLocaleString('pt-BR')} registros, consultado em {sourceDate} UTC. </>}Foco de calor é uma detecção por satélite; não mede diretamente a área queimada nem confirma, por si só, um incêndio ativo.
      </p>
      {dataError && <p className="map-error" role="status">Não foi possível carregar os arquivos locais do mapa. Verifique a conexão e tente recarregar a página.</p>}
    </section>
  )
}

async function loadJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Falha ao carregar dados do mapa: ${response.status}`)
  return response.json()
}

function MapLegend({ layers }) {
  if (!layers.risco && !layers.frp) return null

  return (
    <div className="map-legend" aria-label="Legenda das camadas adicionais">
      {layers.risco && (
        <div className="map-legend-group">
          <strong><i className="layer-dot risk-dot" /> Risco INPE (0–1) · faixas visuais</strong>
          <span><i className="legend-swatch low" /> 0–0,32</span>
          <span><i className="legend-swatch medium" /> 0,33–0,65</span>
          <span><i className="legend-swatch high" /> 0,66–1</span>
        </div>
      )}
      {layers.frp && (
        <div className="map-legend-group">
          <strong><i className="layer-dot frp-dot" /> Potência radiativa do fogo (MW)</strong>
          <span><i className="frp-size frp-small" /> menor</span>
          <span><i className="frp-size frp-large" /> maior</span>
        </div>
      )}
    </div>
  )
}

function FlameMark() {
  return <svg className="legend-flame" viewBox="0 0 24 30" aria-hidden="true"><path d="M14 2c1 5-5 7-3 12 1-2 3-3 4-5 5 5 6 9 4 13-1 3-4 5-7 5-5 0-8-3-8-7 0-4 3-7 6-10 0 3 0 4 1 5 1-5 5-7 3-13Z" fill="#a3422b" stroke="#211b16" strokeWidth="1.5" /></svg>
}
