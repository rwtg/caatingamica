import { useMemo, useState } from 'react'

const stages = [
  { id: 0, time: '0 a 1 ano', title: 'Cinzas e solo exposto', veg: 'Só restam raízes, xilopódios e sementes no solo; algumas plantas rebrotam pela base.', fauna: 'Fauna reduzida: sobrevive quem fugiu ou se abrigou em tocas e rochas. Aves e insetos visitam a área.', soil: 'A cinza eleva o pH e o cálcio de forma temporária (Nunes et al., 2009: pH 7,3 na área queimada contra 6,4–6,6), mas o solo sem cobertura fica exposto à chuva forte.' },
  { id: 1, time: '1 a 3 anos', title: 'Herbáceas pioneiras', veg: 'Capins e ervas anuais cobrem o solo a cada estação chuvosa; plantas lenhosas rebrotam.', fauna: 'Voltam insetos herbívoros, aves granívoras e pequenos roedores.', soil: 'A cobertura herbácea segura parte do solo e começa a repor a matéria orgânica.' },
  { id: 2, time: '3 a 10 anos', title: 'Arbustos pioneiros', veg: 'Arbustos de crescimento rápido, como marmeleiro e jurema-preta, formam o primeiro dossel. A jurema é leguminosa e fixa nitrogênio.', fauna: 'Lagartos, pequenas aves e mamíferos voltam a usar a sombra e o abrigo.', soil: 'Serapilheira e raízes aumentam a matéria orgânica; a umidade do solo se mantém por mais tempo.' },
  { id: 3, time: '10 a 30 anos', title: 'Caatinga arbustivo-arbórea', veg: 'Árvores de espécies mais tardias entram e a estrutura em camadas se refaz.', fauna: 'Herbívoros maiores e seus predadores só voltam se houver fragmentos vizinhos e alimento suficiente.', soil: 'Ciclagem de nutrientes mais próxima à de áreas conservadas.' },
  { id: 4, time: '30+ anos', title: 'Vegetação madura', veg: 'Mata com estrutura complexa, semelhante à de áreas conservadas, desde que o fogo não volte.', fauna: 'Teia alimentar completa, incluindo predadores de topo, se a paisagem tiver conectividade.', soil: 'Em um estudo, áreas de mata com cerca de 50 anos tinham carbono da biomassa microbiana 82% maior do que a área queimada.' },
]

// gerador pseudo-aleatório determinístico: a cena não muda a cada renderização
function rng(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function Scene({ stage }) {
  const items = useMemo(() => {
    const r = rng(42)
    const spots = Array.from({ length: 40 }, () => ({ x: 20 + r() * 760, y: 250 + r() * 70, k: r(), h: r() }))
    return spots
  }, [])
  const showAsh = stage === 0
  const tufts = stage === 0 ? 0 : stage === 1 ? 34 : 22
  const shrubs = stage < 2 ? 0 : stage === 2 ? 14 : stage === 3 ? 9 : 4
  const trees = stage < 3 ? 0 : stage === 3 ? 4 : 8
  const stumps = stage === 0 ? 9 : 0
  const ground = ['#4b3626', '#7a5a3c', '#7a5f3e', '#6d6a3f', '#5f6a45'][stage]
  return (
    <svg className="scene" viewBox="0 0 800 340" role="img" aria-label={`Cena esquemática do estágio ${stages[stage].title}`}>
      <rect width="800" height="340" fill={stage === 0 ? '#c9b48a' : '#e8d6aa'} />
      <circle cx="670" cy="70" r="40" fill="#df9a4c" stroke="#211b16" strokeWidth="5" />
      <path d="M0 235Q150 200 300 232t300-6 200 6v108H0Z" fill={ground} stroke="#211b16" strokeWidth="5" />
      {showAsh && items.slice(0, 18).map((s, i) => <ellipse key={i} cx={s.x} cy={s.y + 10} rx={8 + s.k * 18} ry={3 + s.h * 4} fill="#2a2420" opacity=".55" />)}
      {items.slice(0, stumps).map((s, i) => <path key={`st${i}`} d={`M${s.x} ${s.y + 10}v-${28 + s.h * 40}m0 ${12}l-10-12m10 8l9-10`} stroke="#1f1a16" strokeWidth="5" strokeLinecap="round" fill="none" />)}
      {items.slice(0, tufts).map((s, i) => <path key={`t${i}`} d={`M${s.x} ${s.y + 14}q-6-${14 + s.h * 8} -9-${20 + s.h * 6}m9 ${20 + s.h * 6}q0-${18 + s.h * 6} 2-${28 + s.h * 6}m-2 ${28 + s.h * 6}q8-${16} 12-${22}`} stroke="#68745a" strokeWidth="3" strokeLinecap="round" fill="none" />)}
      {items.slice(4, 4 + shrubs).map((s, i) => (
        <g key={`s${i}`}><path d={`M${s.x} ${s.y + 14}v-18`} stroke="#211b16" strokeWidth="4" /><circle cx={s.x} cy={s.y - 8} r={12 + s.k * 8} fill="#68745a" stroke="#211b16" strokeWidth="4" /></g>
      ))}
      {items.slice(10, 10 + trees).map((s, i) => (
        <g key={`tr${i}`}><path d={`M${s.x} ${s.y + 16}v-${60 + s.h * 30}`} stroke="#211b16" strokeWidth="7" strokeLinecap="round" />
          <path d={`M${s.x - 34} ${s.y - 40 - s.h * 20}q34-${46} 68 0q-34 ${14} -68 0Z`} fill={stage === 4 ? '#5a7a4a' : '#68745a'} stroke="#211b16" strokeWidth="4" strokeLinejoin="round" /></g>
      ))}
      {stage >= 3 && <path d="M120 120q22-24 46 0 22-20 46 0" stroke="#211b16" strokeWidth="4" fill="none" strokeLinecap="round" />}
    </svg>
  )
}

export default function SuccessionSection() {
  const [stage, setStage] = useState(0)
  const s = stages[stage]
  return (
    <section className="section succession-section" id="sucessao" aria-labelledby="succession-title">
      <div className="section-heading">
        <p className="eyebrow">Tópico 4 · recuperação</p>
        <h2 id="succession-title">Sucessão ecológica depois do fogo</h2>
        <p>A Caatinga queimada passa por <strong>sucessão secundária</strong>: o solo, as raízes e o banco de sementes continuam lá. Arraste o tempo e veja os estágios.</p>
      </div>
      <div className="succession-layout">
        <div>
          <Scene stage={stage} />
          <label className="stage-range">
            <span>Tempo após o fogo: <strong>{s.time}</strong></span>
            <input type="range" min="0" max={stages.length - 1} step="1" value={stage} onChange={(e) => setStage(Number(e.target.value))} aria-label="Estágio da sucessão" aria-valuetext={`${s.title}, ${s.time}`} />
          </label>
          <div className="stage-dots" role="tablist" aria-label="Estágios da sucessão">
            {stages.map((st) => <button key={st.id} type="button" role="tab" aria-selected={stage === st.id} onClick={() => setStage(st.id)}>{st.id + 1}</button>)}
          </div>
          <p className="lab-note">Os tempos são faixas didáticas; variam com a chuva, o solo, a intensidade do fogo e o uso da área. A cena é esquemática.</p>
        </div>
        <article className="cordel-card stage-card" aria-live="polite">
          <p className="eyebrow">Estágio {stage + 1} de {stages.length} · {s.time}</p>
          <h3>{s.title}</h3>
          <dl>
            <dt>Vegetação</dt><dd>{s.veg}</dd>
            <dt>Fauna</dt><dd>{s.fauna}</dd>
            <dt>Solo</dt><dd>{s.soil}</dd>
          </dl>
        </article>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <caption>Primária ou secundária? A Caatinga queimada é secundária</caption>
          <thead><tr><th scope="col"></th><th scope="col">Sucessão primária</th><th scope="col" className="highlight">Sucessão secundária (Caatinga queimada)</th></tr></thead>
          <tbody>
            <tr><th scope="row">Ponto de partida</th><td>Substrato sem solo nem vida, como rocha nua ou duna nova</td><td className="highlight">Solo, raízes e sementes preservados após o fogo</td></tr>
            <tr><th scope="row">Primeiros colonizadores</th><td>Liquens e musgos que formam o solo</td><td className="highlight">Rebrota de raízes e germinação de sementes do solo</td></tr>
            <tr><th scope="row">Velocidade</th><td>Muito lenta (séculos)</td><td className="highlight">Mais rápida (anos a décadas)</td></tr>
          </tbody>
        </table>
      </div>

      <div className="factors">
        <article className="cordel-card">
          <h3>O que decide a recuperação da vegetação</h3>
          <ul>
            <li><b>Banco de sementes e rebrota:</b> sem eles, a área depende de sementes vindas de fora.</li>
            <li><b>Chuva:</b> a precipitação irregular do semiárido decide se as plântulas sobrevivem.</li>
            <li><b>Intensidade e recorrência do fogo:</b> 62% da área queimada foi atingida só uma vez em 40 anos; o restante queimou repetidamente, o que impede o avanço dos estágios (MapBiomas).</li>
            <li><b>Solo:</b> áreas degradadas se recuperam devagar; um estudo em Pernambuco viu que 3 anos de exclusão do gado não bastaram (Bieluczyk et al.).</li>
            <li><b>Pastejo e uso da terra:</b> o gado come os brotos e impede a regeneração.</li>
          </ul>
        </article>
        <article className="cordel-card">
          <h3>O que decide a recuperação da fauna</h3>
          <ul>
            <li><b>Estrutura da vegetação:</b> a fauna volta quando há abrigo, sombra e alimento.</li>
            <li><b>Fragmentos vizinhos:</b> animais recolonizam a partir de áreas não queimadas.</li>
            <li><b>Mobilidade:</b> espécies muito móveis, como aves, tendem a recolonizar primeiro; lagartos e insetos dependem da cobertura herbácea.</li>
            <li><b>Ordem de retorno:</b> a fauna segue a vegetação. Os predadores de topo são os últimos a voltar, porque dependem da recomposição da teia.</li>
            <li><b>Vegetação secundária:</b> a Caatinga tinha 8,3 milhões de ha de vegetação secundária em 2024 (MapBiomas), o que indica que a regeneração natural ocorre em grande escala no bioma.</li>
          </ul>
        </article>
      </div>
    </section>
  )
}
