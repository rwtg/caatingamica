import { useState } from 'react'
import quiz from '../data/quiz.json'
import glossary from '../data/glossario.json'

export function CausesSection() {
  return (
    <section className="section causes-section" id="causas" aria-labelledby="causes-title">
      <div className="section-heading">
        <p className="eyebrow">Entender para prevenir</p>
        <h2 id="causes-title">De onde vem a chama?</h2>
      </div>
      <div className="diptych">
        <article className="diptych-panel natural-panel">
          <EtchingIcon type="sun" />
          <p className="eyebrow">O ambiente favorece</p>
          <h3>Condições naturais</h3>
          <p>Calor, baixa umidade, ventos e vegetação seca podem favorecer a propagação. Raios podem iniciar incêndios, embora nem todo foco tenha origem natural.</p>
        </article>
        <span className="diptych-seam" aria-hidden="true">≋</span>
        <article className="diptych-panel human-panel">
          <EtchingIcon type="farm" />
          <p className="eyebrow">A atenção é essencial</p>
          <h3>Ação humana</h3>
          <p>Queima de lixo, preparo de roçado, fogueiras mal apagadas e incêndios criminosos são exemplos de ignição. A estiagem deixa a vegetação mais vulnerável.</p>
        </article>
      </div>
      <p className="caution-note">A origem deve ser verificada caso a caso. Fogo de manejo exige planejamento, autorização quando aplicável e orientação técnica.</p>
    </section>
  )
}

export function QuizSection() {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [choice, setChoice] = useState(null)
  const finished = step >= quiz.length
  const current = quiz[step]

  const answer = (index) => {
    if (choice !== null) return
    setChoice(index)
    if (index === current.answer) setScore((value) => value + 1)
  }
  const next = () => { setChoice(null); setStep((value) => value + 1) }
  const restart = () => { setChoice(null); setStep(0); setScore(0) }

  return (
    <section className="section quiz-section" id="quiz" aria-labelledby="quiz-title">
      <div className="quiz-paper">
        <p className="eyebrow">Desafio de saberes · {finished ? 'fim da peleja' : `pergunta ${step + 1} de ${quiz.length}`}</p>
        <h2 id="quiz-title">Teste o que você aprendeu</h2>
        {finished ? (
          <div className="quiz-result" aria-live="polite">
            <p className="score-seal">{score}<span>/{quiz.length}</span></p>
            <h3>{score >= 4 ? 'Acertou, cabra!' : 'Errou, mas aprendeu!'}</h3>
            <p>{score >= 4 ? 'Seu olhar para o bioma já está mais afiado.' : 'Conhecimento também floresce com cuidado. Tente de novo e siga aprendendo.'}</p>
            <button type="button" className="ink-button" onClick={restart}>Jogar outra vez</button>
          </div>
        ) : (
          <>
            <div className="quiz-progress" role="progressbar" aria-label="Progresso do quiz" aria-valuenow={step + 1} aria-valuemin="1" aria-valuemax={quiz.length}><span style={{ width: `${((step + 1) / quiz.length) * 100}%` }} /></div>
            <h3 className="quiz-question">{current.question}</h3>
            <div className="quiz-options">
              {current.options.map((option, index) => {
                let stateClass = ''
                if (choice !== null && index === current.answer) stateClass = 'is-correct'
                else if (choice === index) stateClass = 'is-wrong'
                return <button type="button" className={stateClass} key={option} onClick={() => answer(index)} disabled={choice !== null}>{option}</button>
              })}
            </div>
            {choice !== null && <div className={`quiz-feedback ${choice === current.answer ? 'correct' : 'wrong'}`} aria-live="polite"><p>{choice === current.answer ? 'Acertou, cabra! ' : 'Errou, mas aprenda: '}{current.explanation}</p><button className="text-button" type="button" onClick={next}>{step === quiz.length - 1 ? 'Ver resultado →' : 'Próxima pergunta →'}</button></div>}
          </>
        )}
      </div>
    </section>
  )
}

export function ActionsSection() {
  const tech = [
    ['Monitoramento por satélite', 'O INPE detecta focos de calor várias vezes ao dia e publica dados abertos de focos, risco de fogo e dias sem chuva, como os usados no mapa deste site.'],
    ['Mapeamento da área queimada', 'O MapBiomas Fogo mede a cicatriz de cada queimada desde 1985, mostrando onde o fogo se repete e onde a vegetação se regenera.'],
    ['Medição de emissões', 'Serviços como o Copernicus CAMS estimam o carbono emitido por incêndios, e é isso que permite relacionar o fogo ao ciclo do carbono.'],
    ['Restauração do solo', 'Pesquisadores recomendam adubação verde e plantio estratégico de árvores nativas, já que apenas cercar a área não restaurou o solo em 3 anos.'],
    ['Manejo integrado do fogo', 'Planejamento, prevenção, monitoramento e resposta combinados, com apoio de dados de risco de fogo.']
  ]
  const actions = [
    'Não ateie fogo a lixo, folhas ou terrenos.',
    'Avise os serviços de emergência locais ao ver um incêndio e mantenha distância.',
    'Apoie a regeneração natural: evite novas queimadas e o pastejo nas áreas em recuperação.'
  ]
  return (
    <section className="section actions-section" id="tecnologia" aria-labelledby="actions-title">
      <div className="actions-copy">
        <p className="eyebrow">Tópico 7 · tecnologia e recuperação sustentável</p>
        <h2 id="actions-title">O papel da tecnologia</h2>
        <p>Dados e satélites mostram onde o fogo ocorre e como a vegetação volta; a recuperação, porém, depende de reduzir o fogo e proteger a regeneração.</p>
        <ul className="action-list">{actions.map((action) => <li key={action}><span aria-hidden="true">✓</span>{action}</li>)}</ul>
      </div>
      <ul className="tech-list">{tech.map(([name, text]) => <li key={name}><strong>{name}</strong><span>{text}</span></li>)}</ul>
    </section>
  )
}

export function GlossarySection() {
  return (
    <section className="section glossary-section" id="glossario" aria-labelledby="glossary-title">
      <div className="section-heading">
        <p className="eyebrow">Palavras do chão e do céu</p>
        <h2 id="glossary-title">Pequeno glossário sertanejo</h2>
      </div>
      <div className="glossary-list">{glossary.map((entry) => <details key={entry.term}><summary>{entry.term}<span aria-hidden="true">＋</span></summary><p>{entry.definition}</p></details>)}</div>
    </section>
  )
}

export function SourcesSection() {
  const sources = [
    { name: 'INPE · Programa Queimadas', detail: 'Focos de calor e dados abertos (focos, risco de fogo, dias sem chuva)', href: 'https://data.inpe.br/queimadas/dados-abertos/' },
    { name: 'MapBiomas · Caatinga, Coleção 10 (1985–2024)', detail: 'Área queimada, vegetação nativa e secundária, superfície de água', href: 'https://brasil.mapbiomas.org/wp-content/uploads/sites/3/2026/09/Factsheet-Caatinga_C10_18.09_v2.pdf' },
    { name: 'MapBiomas · Área queimada no Brasil em 2024', detail: 'Área queimada por bioma em 2024', href: 'https://climainfo.org.br/2025/06/25/incendios-florestais-batem-recorde-no-brasil-em-2024-mostra-mapbiomas/' },
    { name: 'Eixos · Emissões por incêndios em 2024 (Copernicus CAMS)', detail: 'Carbono emitido no Brasil e por estado, até 23/09/2024', href: 'https://eixos.com.br/politica/meio-ambiente/emissao-de-gases-por-incendios-e-recorde-em-dois-estados/' },
    { name: 'Folhapress · Queimadas na Caatinga em 2023', detail: 'Focos de calor do INPE em 2023 e 2010', href: 'https://www.politicalivre.com.br/2024/01/numero-de-queimadas-na-caatinga-em-2023-foi-o-mais-alto-desde-2010' },
    { name: 'Nunes et al. (2009) · Revista Caatinga', detail: 'Efeito da queimada no solo em Sobral (CE)', href: 'https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/534086/1/APIImpactodaqueimada.pdf' },
    { name: 'Agência FAPESP · Solo degradado da Caatinga', detail: 'Bieluczyk et al., Journal of Environmental Management', href: 'https://agencia.fapesp.br/54542' },
  ]
  return (
    <footer className="sources-section" id="fontes">
      <div className="sources-inner">
        <p className="eyebrow">Para seguir aprendendo</p>
        <h2>Fontes de confiança</h2>
        <div className="source-list">{sources.map((source) => <a key={source.name} href={source.href} target="_blank" rel="noreferrer"><strong>{source.name}</strong><span>{source.detail}</span><span className="source-arrow" aria-hidden="true">↗</span></a>)}</div>
        <p className="footer-note">Conteúdo educativo. O mapa mostra detecções de satélite do INPE; elas não medem diretamente a área queimada nem confirmam, por si só, um incêndio ativo. As cenas ilustradas e o modelo da teia alimentar são didáticos.</p>
        <a className="top-link" href="#inicio"><SunMark /> Voltar ao começo</a>
        <p className="copyright">EQUIPE CAATINGA · HEITOR</p>
      </div>
    </footer>
  )
}

function EtchingIcon({ type }) {
  const figures = {
    people: <><circle cx="23" cy="17" r="6" /><circle cx="44" cy="19" r="5" /><path d="M11 49c1-11 5-17 12-17s11 6 12 17M33 36c9-4 17 2 18 13" /></>,
    bird: <><path d="M8 37c12-20 23-19 34-7 4 4 7 6 13 5-3 8-11 12-21 9-9-3-15-2-26 3Z" /><path d="m27 28 9-12 1 14M46 29l8-5-3 8" /></>,
    earth: <><path d="M8 43c9-8 15 8 24 0s15 6 24-1M10 50h44M15 35 20 20l5 8 5-17 6 19 5-11 7 16" /><path d="m18 48 4 5m13-5-3 5m13-6 4 6" /></>,
    sun: <><circle cx="32" cy="30" r="12" /><path d="M32 5v8m0 34v8M7 30h8m34 0h8M14 12l6 6m24 24 6 6m0-36-6 6M20 42l-6 6" /><path d="M19 48h27" /></>,
    farm: <><path d="M8 49h48M13 44 20 20l8 24m2 0 8-30 8 30m2 0 5-18 4 18" /><path d="M17 29h7m8 2h8m8 5h5M9 14h10m-5-5v10" /></>
  }
  return <svg className="etching-icon" viewBox="0 0 64 64" aria-hidden="true">{figures[type] || figures.sun}</svg>
}

function SunMark() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6" /><path d="M16 2v5m0 18v5M2 16h5m18 0h5M6 6l4 4m12 12 4 4m0-20-4 4m-12 12-4 4" /></svg>
}
