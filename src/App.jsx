import { useState } from 'react'
import MapSection from './components/MapSection.jsx'
import FoodSections from './components/FoodSections.jsx'
import SuccessionSection from './components/SuccessionSection.jsx'
import { CyclesSection, DataSection } from './components/DataSection.jsx'
import {
  ActionsSection,
  CausesSection,
  GlossarySection,
  QuizSection,
  SourcesSection,
} from './components/LearningSections.jsx'
import './App.css'

const links = [
  ['Panorama', '#panorama'],
  ['Cadeia', '#cadeia'],
  ['Teia', '#teia'],
  ['Energia', '#energia'],
  ['Sucessão', '#sucessao'],
  ['Ciclos', '#ciclos'],
  ['Dados', '#dados'],
  ['Mapa', '#mapa'],
  ['Quiz', '#quiz'],
]

const topics = [
  ['Cadeia alimentar', 'níveis tróficos e o efeito do fogo em cada um', '#cadeia'],
  ['Teia alimentar', 'cadeias conectadas e efeito cascata', '#teia'],
  ['Fluxo de energia', 'onde a energia deixa de passar', '#energia'],
  ['Sucessão ecológica', 'primária ou secundária, e o que decide a volta da vida', '#sucessao'],
  ['Ciclos biogeoquímicos', 'carbono, água, nitrogênio e nutrientes', '#ciclos'],
  ['Gráficos e dados', 'evolução das queimadas na Caatinga', '#dados'],
  ['Tecnologia', 'como dados e satélites ajudam a recuperar', '#tecnologia'],
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Caatinga em foco, início">
          <span className="brand-mark" aria-hidden="true"><CactusMark /></span>
          <span>CAATINGA<br /><strong>EM FOCO</strong></span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? 'FECHAR ×' : 'ÍNDICE +'}
        </button>
        <nav className={`site-nav ${menuOpen ? 'nav-open' : ''}`} id="site-nav" aria-label="Navegação do site">
          {links.map(([label, href], index) => <a key={href} href={href} onClick={() => setMenuOpen(false)}><span>{String(index + 1).padStart(2, '0')}</span>{label}</a>)}
          <a className="nav-sources" href="#fontes" onClick={() => setMenuOpen(false)}>Fontes ↗</a>
        </nav>
      </header>

      <main id="conteudo">
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-overline"><span /> IMPACTO DAS QUEIMADAS · BIOMA CAATINGA</p>
            <h1 id="hero-title"><span className="hero-line">A Caatinga</span><br />não se <em>apaga.</em></h1>
            <p className="hero-description">Plataforma sobre o impacto das queimadas nos biomas brasileiros e o papel da tecnologia na recuperação sustentável: cadeia e teia alimentar, fluxo de energia, sucessão ecológica, ciclos biogeoquímicos e a evolução dos dados da Caatinga.</p>
            <a className="hero-cta" href="#panorama">COMEÇAR <span aria-hidden="true">↓</span></a>
            <div className="hero-edition">EQUIPE CAATINGA <span>·</span> </div>
          </div>
          <div className="hero-illustration" aria-label="Ilustração de mandacaru, sol e carcará na paisagem da Caatinga" role="img">
            <svg viewBox="0 0 640 610" aria-hidden="true">
              <path className="hero-sun" d="M470 63a67 67 0 1 1-134 0 67 67 0 0 1 134 0Z" />
              <path className="sun-rays" d="M403 0v-27m0 207v-27M309 63h-29m247 0h-29m-161-66-20-20m173 173-20-20m0-153 20-20M337 149l-20 20" />
              <path className="hero-hill back" d="M0 369q127-100 244-14t212-9q75-67 184 3v251H0Z" />
              <path className="hero-hill front" d="M0 441q94-87 207-29t214-10q111-79 219-5v213H0Z" />
              <g className="hero-cactus">
                <path d="M421 489V216m0 123h-52V250m0 60h31m21-18h48V196m0 72h-29m-79 221h111" />
                <path d="M108 494V343m0 68H79v-53m0 28h20m9-14h28v-55m0 34h-17m-42 143h64" />
              </g>
              <path className="hero-bird" d="M194 181q30-40 61 0 28-35 60-1-30-13-60 12-29-24-61-11Z" />
              <g className="etch-lines"><path d="M21 511q51-28 102 0m118-43q51-28 102 0m101 76q51-28 102 0M66 555q51-28 102 0m201-15q51-28 102 0" /></g>
            </svg>
            <span className="illustration-caption">TRAÇOS INSPIRADOS<br />NA XILOGRAVURA</span>
            <span className="side-stamp">BIOMA<br />BRASILEIRO</span>
          </div>
          <div className="hero-bottom"><span>NO SERTÃO, CADA VIDA CONTA.</span><span>DESLIZE E DESCUBRA <b>⌄</b></span></div>
        </section>

        <section className="section intro-section panorama" id="panorama" aria-labelledby="caatinga-title">
          <div className="intro-copy">
            <p className="eyebrow">Ponto de partida · Caatinga em números</p>
            <h2 id="caatinga-title">O fogo na Caatinga</h2>
            <p className="intro-lead">Entre 1985 e 2024, cerca de 11,4 milhões de hectares da Caatinga queimaram.</p>
            <p>Nas próximas seções, cada tópico do trabalho é respondido para a Caatinga: primeiro a cadeia e a teia alimentar, depois o fluxo de energia, a sucessão ecológica, os ciclos biogeoquímicos e os dados.</p>
          </div>
          <div className="stat-row panorama-stats">
            <div className="stat"><strong>11,4 mi ha</strong><span>queimados entre 1985 e 2024</span></div>
            <div className="stat"><strong>77%</strong><span>do volume anual médio queima de setembro a novembro</span></div>
            <div className="stat"><strong>78%</strong><span>das queimas atingem a formação savânica (caatinga arbórea e arbustiva)</span></div>
            <div className="stat"><strong>62%</strong><span>da área queimada pegou fogo uma única vez em 40 anos</span></div>
            <div className="stat"><strong>404 mil ha</strong><span>queimados em 2024, 16% menos que em 2023</span></div>
          </div>
          <p className="stat-source">Fonte: MapBiomas, Caatinga Coleção 10 (1985–2024).</p>
          <ol className="topic-index" aria-label="Tópicos do trabalho">
            {topics.map(([title, text, href], i) => (
              <li key={href}><a href={href}><span className="topic-num">{i + 1}</span><strong>{title}</strong><small>{text}</small></a></li>
            ))}
          </ol>
        </section>

        <CausesSection />
        <FoodSections />
        <SuccessionSection />
        <CyclesSection />
        <DataSection />
        <MapSection />
        <ActionsSection />
        <QuizSection />
        <GlossarySection />
        <SourcesSection />
      </main>
    </>
  )
}

function CactusMark() {
  return <svg viewBox="0 0 28 36" aria-hidden="true"><path d="M14 34V4m0 15H7V10m0 5h4m3 1h7V8m0 5h-4M9 34h10" /></svg>
}

export default App
