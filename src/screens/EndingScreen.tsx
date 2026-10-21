import { useEffect, useState } from 'react'
import Gauges from '../components/Gauges.tsx'
import Panorama from '../components/Panorama.tsx'
import { markEnding } from '../game/collection.ts'
import {
  endingId,
  getEnding,
  grade,
  keyPolicies,
  managerType,
  memberVoices,
  powerEpilogue,
  yearsServed,
} from '../game/engine.ts'
import { sfx } from '../game/sound.ts'
import { zoneViews } from '../game/zones.ts'
import type { GameState } from '../game/types.ts'
import Stage from '../components/Stage.tsx'

interface Props {
  game: GameState
  name: string
  onRebirth: () => void
}

export default function EndingScreen({ game, name, onRebirth }: Props) {
  const ending = getEnding(endingId(game) ?? 'cracked', game)
  const type = managerType(game)
  const policies = keyPolicies(game, 5)
  const voices = memberVoices(game)
  const epilogue = powerEpilogue(game)
  const g = grade(game)
  const [graded, setGraded] = useState(false)

  useEffect(() => {
    markEnding(ending.id)
    const id = window.setTimeout(() => {
      sfx.stamp()
      setGraded(true)
    }, 900)
    return () => clearTimeout(id)
  }, [ending.id])

  return (
    <Stage>
    <main className={`screen desk report-desk ${graded ? 'shake-once' : ''}`}>
      <article className={`doc doc--report ending--${ending.id}`}>
        <header className="doc__head">
          <span>NEO GAIA 임기 보고서</span>
          <span>관리자 · {name}</span>
        </header>
        <h2 className="doc__title">임 기 보 고 서</h2>

        <div className="report__top">
          <dl className="report__facts">
            <div>
              <dt>관리 기간</dt>
              <dd>{yearsServed(game)}년</dd>
            </div>
            <div>
              <dt>결말</dt>
              <dd>
                {ending.emoji} {ending.title}
              </dd>
            </div>
            <div>
              <dt>관리 성향</dt>
              <dd>
                {type.emoji} {type.name}
                <small>{type.desc}</small>
              </dd>
            </div>
          </dl>
          <div className="report__grade">
            <span>종합 판정</span>
            <div className="grade-box">{graded && <b className="grade-stamp">{g.mark}</b>}</div>
            <small className="hand">{graded ? g.note : ' '}</small>
          </div>
        </div>

        <p className="report__text hand">{ending.text}</p>
        {epilogue && <p className="report__epilogue">{epilogue}</p>}

        {policies.length > 0 && (
          <section className="report__list">
            <b>주요 결재 (승인)</b>
            <ul>
              {policies.map((d) => (
                <li key={d.cardId}>
                  {d.policy} <span>{d.year}년차</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="report__voices">
          <b>첨부 · 구성원들이 남긴 쪽지</b>
          <div className="notes notes--row">
            {voices.map((v, i) => (
              <p key={v.name} className={`sticky sticky--${i}`}>
                <b>
                  {v.emoji} {v.name}
                </b>
                {v.text}
              </p>
            ))}
          </div>
        </section>
      </article>

      <aside className="report__side">
        <figure className="polaroid">
          <Panorama game={game} highlight={ending.id === 'gaia' ? 'all' : null} />
          <figcaption className="hand">임기 마지막 날의 지구</figcaption>
        </figure>
        <section className="climate-log">
          <b>기후대별 마지막 모습</b>
          <ul>
            {zoneViews(game).map((z) => (
              <li key={z.id} className={z.health < 35 ? 'bad' : z.health >= 60 ? 'good' : ''}>
                <span>
                  {z.climate} · {z.name}
                </span>
                <em>{z.status}</em>
              </li>
            ))}
          </ul>
        </section>
        <Gauges stats={game.stats} compact />
        <div className="handoff">
          <p>
            지구의 주인처럼 결정한 당신,
            <br />
            이제 그 지구의 구성원으로 살아가세요.
          </p>
          <button className="btn btn--ink btn--wide" onClick={onRebirth}>
            환생 캡슐 뽑으러 가기 ▶
          </button>
        </div>
      </aside>
    </main>
    </Stage>
  )
}
