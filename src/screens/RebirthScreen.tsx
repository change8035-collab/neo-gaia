import { useEffect, useRef, useState } from 'react'
import Panorama from '../components/Panorama.tsx'
import { LIVES } from '../data/lives.ts'
import { markLife } from '../game/collection.ts'
import { sfx } from '../game/sound.ts'
import type { GameState, LifeResult } from '../game/types.ts'
import Stage from '../components/Stage.tsx'

interface Props {
  game: GameState
  life: LifeResult
  onDone: () => void
}

type GachaStage = 'machine' | 'turning' | 'capsule' | 'opened'

const CAPSULE_COLORS = ['#e8553f', '#3e7bd1', '#f2c33a', '#4fae6b', '#c46bd1', '#f08aa8', '#46b6c4']

// 원작 『일인용 캡슐』에서 따온 환생 캡슐 뽑기 → 내 삶 3컷 만화
export default function RebirthScreen({ game, life, onDone }: Props) {
  const [stage, setStage] = useState<GachaStage>('machine')
  const [shown, setShown] = useState(0)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    setStage('machine')
    setShown(0)
  }, [life])

  // 누른 버튼에 포커스가 남아 있으면 Enter 로 다음 컷을 못 넘기므로 풀어 줌
  const release = () => (document.activeElement as HTMLElement | null)?.blur()

  const crank = () => {
    if (stage !== 'machine') return
    release()
    sfx.crank()
    setStage('turning')
    timers.current.push(window.setTimeout(() => setStage('capsule'), 1300))
  }

  const open = () => {
    if (stage !== 'capsule') return
    release()
    sfx.pop()
    markLife(life.life.id)
    setStage('opened')
  }

  const total = life.scenes.length
  const advance = () => {
    if (stage === 'machine') return crank()
    if (stage === 'capsule') return open()
    if (stage !== 'opened') return
    if (shown < total) {
      sfx.paper()
      setShown(shown + 1)
    } else onDone()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement) return
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const capsuleColor = CAPSULE_COLORS[LIVES.findIndex((l) => l.id === life.life.id) % CAPSULE_COLORS.length]
  const gaia = game.flags.includes('gaia')

  return (
    <Stage>
    <main className={`screen desk rebirth-desk ${stage === 'opened' ? 'rebirth-desk--opened' : 'rebirth-desk--waiting'}`}>
      <section className={`gacha gacha--${stage}`}>
        <p className="gacha__sign px">환생 캡슐 · 1인 1회</p>
        <div className="gacha__dome">
          {LIVES.map((l, i) => (
            <span
              key={l.id}
              className="capsule capsule--mini"
              style={{
                ['--c' as string]: CAPSULE_COLORS[i % CAPSULE_COLORS.length],
                left: `${14 + ((i * 37) % 64)}%`,
                top: `${30 + ((i * 53) % 46)}%`,
                animationDelay: `${i * -0.13}s`,
              }}
            />
          ))}
        </div>
        <div className="gacha__body">
          <button className="gacha__crank" onClick={crank} disabled={stage !== 'machine'} aria-label="손잡이 돌리기">
            <span />
          </button>
          <div className="gacha__chute">
            {(stage === 'capsule' || stage === 'opened') && (
              <button
                className={`capsule capsule--big ${stage === 'opened' ? 'capsule--open' : ''}`}
                style={{ ['--c' as string]: capsuleColor }}
                onClick={open}
                aria-label="캡슐 열기"
              >
                <i className="capsule__top" />
                <i className="capsule__bottom" />
              </button>
            )}
          </div>
        </div>
        <p className="gacha__hint hand">
          {stage === 'machine' && '손잡이를 돌려 보세요'}
          {stage === 'turning' && '드르륵…'}
          {stage === 'capsule' && '캡슐을 눌러서 열어 보세요!'}
          {stage === 'opened' && `${gaia ? '사람이 거의 사라진 ' : '당신이 만든 '}지구에서 태어났습니다`}
        </p>
      </section>

      <section className="rebirth__story">
        {stage === 'opened' ? (
          <>
            <div className="born">
              <span className="born__emoji">{life.life.emoji}</span>
              <div>
                <h2>{life.life.name}</h2>
                <p className="hand">{life.intro}</p>
              </div>
            </div>
            <div className="comic">
              {life.scenes.map((s, i) => (
                <figure
                  key={s.title}
                  className={`panel ${i < shown ? 'panel--shown' : ''} ${s.score > 0 ? 'panel--sun' : s.score < 0 ? 'panel--rain' : ''}`}
                >
                  <div className="panel__art">
                    {i < shown ? (
                      <>
                        <Panorama game={game} crop={life.life.zone} zoom={i} />
                        <span className="panel__hero">{life.life.emoji}</span>
                        {s.score < 0 && <span className="panel__weather rain" />}
                        {s.score > 0 && <span className="panel__weather sun" />}
                        <span className="panel__no px">{i + 1}</span>
                      </>
                    ) : (
                      <span className="panel__blank px">{i + 1}</span>
                    )}
                  </div>
                  {i < shown && (
                    <figcaption>
                      <b>{s.title}</b>
                      {s.text}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            <button className="btn btn--ink btn--wide" onClick={advance}>
              {shown < total ? `${shown + 1}컷 보기 ▶` : '내 결정 돌아보기 ▶'}
            </button>
          </>
        ) : (
          <div className="rebirth__wait">
            <p className="hand">
              관리자의 임기가 끝났습니다.
              <br />
              이제 당신은 당신이 만든 지구의 구성원 중 하나로 다시 태어납니다.
            </p>
            <p className="px">인간일 수도, 펭귄일 수도, 강물고기일 수도 있습니다.</p>
            <button className="btn btn--ink" onClick={advance} disabled={stage === 'turning'}>
              {stage === 'capsule' ? '캡슐 열기 ▶' : '손잡이 돌리기 ▶'}
            </button>
          </div>
        )}
      </section>
    </main>
    </Stage>
  )
}
