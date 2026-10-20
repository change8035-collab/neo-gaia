import { useEffect, useRef, useState } from 'react'
import GachaMachine from '../components/GachaMachine.tsx'
import type { GachaPhase } from '../components/GachaMachine.tsx'
import Panorama from '../components/Panorama.tsx'
import type { PhotoShot } from '../components/Panorama.tsx'
import Stage from '../components/Stage.tsx'
import { LIVES } from '../data/lives.ts'
import { markLife } from '../game/collection.ts'
import { sfx } from '../game/sound.ts'
import { zoneViews } from '../game/zones.ts'
import type { GameState, LifeResult } from '../game/types.ts'

interface Props {
  game: GameState
  life: LifeResult
  onDone: () => void
}

// 뽑힐 캡슐 색 (디자인 규칙의 색 안에서)
const CAPSULE_COLORS = ['#c43a2f', '#2a5bb5', '#f7e07c', '#6e6557', '#ded5c2', '#a6f3b6', '#9a6a44']
const TURN_MS = 1400

// 생애 사진 세 장: 주인공이 서는 자리와 나이 (클수록 몸이 커지고, 사진마다 구도가 조금씩 다름)
const SHOTS: Record<string, { anchor: PhotoShot['anchor']; x: number; ages: string[]; sizes: number[] }> = {
  worker_kid: { anchor: 'ground', x: 905, ages: ['만 7세', '만 16세', '만 35세'], sizes: [38, 46, 54] },
  coast_kid: { anchor: 'ground', x: 352, ages: ['만 6세', '만 15세', '만 32세'], sizes: [38, 46, 54] },
  farm_kid: { anchor: 'ground', x: 458, ages: ['만 8세', '만 17세', '만 38세'], sizes: [38, 46, 54] },
  deer: { anchor: 'ground', x: 690, ages: ['1살', '3살', '9살'], sizes: [34, 42, 50] },
  penguin: { anchor: 'ice', x: 70, ages: ['1살', '4살', '15살'], sizes: [30, 38, 44] },
  fish: { anchor: 'river', x: 905, ages: ['1살', '2살', '5살'], sizes: [24, 28, 32] },
  sparrow: { anchor: 'ledge', x: 1031, ages: ['1살', '2살', '4살'], sizes: [22, 26, 30] },
}
const FRAME_W = [150, 178, 205]
const SHIFT = [-16, 0, 20]

const mood = (score: number) =>
  score > 0 ? { label: '좋음', cls: 'ok' } : score < 0 ? { label: '힘듦', cls: 'no' } : { label: '보통', cls: 'mid' }

// 원작 『일인용 캡슐』에서 따온 환생 캡슐 뽑기 → 생애 기록부
// 개발할 때만: ?ruin=album 이면 사진을 다 펼친 상태로 시작 (그림 확인용)
const DEV_ALBUM = import.meta.env.DEV && new URLSearchParams(location.search).get('ruin') === 'album'

export default function RebirthScreen({ game, life, onDone }: Props) {
  const [phase, setPhase] = useState<GachaPhase>(DEV_ALBUM ? 'opened' : 'ready')
  const [shown, setShown] = useState(DEV_ALBUM ? 3 : 0)
  const [judged, setJudged] = useState(DEV_ALBUM)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (DEV_ALBUM) return
    setPhase('ready')
    setShown(0)
    setJudged(false)
  }, [life])

  // 누른 버튼에 포커스가 남아 있으면 Enter 로 다음 단계를 못 넘기므로 풀어 줌
  const release = () => (document.activeElement as HTMLElement | null)?.blur()

  const turn = () => {
    if (phase !== 'ready') return
    release()
    setPhase('turning')
    later(() => {
      sfx.clunk()
      setPhase('dropped')
    }, TURN_MS + 150)
  }

  const take = () => {
    if (phase !== 'dropped') return
    release()
    sfx.twist()
    setPhase('opening')
    later(() => sfx.pop(), 800)
    later(() => {
      markLife(life.life.id)
      setPhase('opened')
    }, 1900)
  }

  const total = life.scenes.length
  const advance = () => {
    if (phase === 'ready') return turn()
    if (phase === 'dropped') return take()
    if (phase !== 'opened') return
    if (shown < total) {
      sfx.paper()
      setShown(shown + 1)
    } else if (!judged) {
      sfx.stamp()
      setJudged(true)
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
  const place = zoneViews(game).find((z) => z.id === life.life.zone)?.name ?? ''
  const outcomeCls = life.outcome.label === '살 만한 삶' ? 'ok' : life.outcome.label === '힘겨운 삶' ? 'no' : 'mid'

  const hint = {
    ready: '손잡이를 돌려 보세요',
    turning: '딸깍, 딸깍…',
    dropped: '배출구에 캡슐이 떨어졌어요',
    opening: '캡슐을 비틀어 여는 중…',
    opened: `${gaia ? '사람이 거의 사라진 ' : '당신이 만든 '}지구에서 태어났습니다`,
  }[phase]

  const recordButton = shown < total ? (shown === 0 ? '첫 사진 보기 ▶' : '다음 사진 ▶') : judged ? '내 결정 돌아보기 ▶' : '삶 판정 받기 ▶'

  return (
    <Stage>
      <main className={`screen desk rebirth-desk ${phase === 'opened' ? 'rebirth-desk--opened' : 'rebirth-desk--waiting'}`}>
        <section className="gacha">
          <GachaMachine phase={phase} color={capsuleColor} onTurn={turn} onTake={take} />
          <p className="gacha__hint hand">{hint}</p>
        </section>

        <section className="rebirth__story">
          {phase === 'opened' ? (
            <>
              <article className="doc life-record">
                <header className="doc__head">
                  <span>생애 기록부</span>
                  <span>{place} 출생</span>
                </header>
                <h2 className="doc__title">생 애 기 록 부</h2>

                <div className="life-record__top">
                  <div className="photo">
                    <span>{life.life.emoji}</span>
                    <i className="clip" />
                  </div>
                  <dl>
                    <div>
                      <dt>이름</dt>
                      <dd>{life.life.name}</dd>
                    </div>
                    <div>
                      <dt>태어난 곳</dt>
                      <dd>{place}</dd>
                    </div>
                    <div>
                      <dt>출생 기록</dt>
                      <dd className="hand">{life.intro}</dd>
                    </div>
                  </dl>
                </div>

                <div className="album">
                  {life.scenes.map((sc, i) => {
                    const m = mood(sc.score)
                    const def = SHOTS[life.life.id] ?? SHOTS.worker_kid
                    const on = i < shown
                    return (
                      <figure key={sc.title} className={`snap snap--${m.cls} ${on ? 'is-shown' : ''}`}>
                        <div className="snap__img">
                          {on ? (
                            <div className="snap__pic">
                              <Panorama
                                game={game}
                                photo={{
                                  emoji: life.life.emoji,
                                  size: def.sizes[i],
                                  x: def.x + SHIFT[i],
                                  anchor: def.anchor,
                                  w: FRAME_W[i],
                                }}
                              />
                              {sc.score < 0 && <span className="snap__rain" />}
                            </div>
                          ) : (
                            <span className="snap__blank">{i + 1}</span>
                          )}
                          {on && <span className="snap__date">{def.ages[i]}</span>}
                          {on && <i className={`mini-stamp snap__stamp ${m.cls}`}>{m.label}</i>}
                        </div>
                        <figcaption>
                          <b>{sc.title}</b>
                          <span className="hand">{on ? sc.text : '아직 현상되지 않은 사진'}</span>
                        </figcaption>
                      </figure>
                    )
                  })}
                </div>

                <div className="doc__result">
                  <span>삶 판정</span>
                  {judged && <b className={`impression impression--${outcomeCls}`}>{life.outcome.label}</b>}
                </div>
              </article>
              <button className="btn btn--ink btn--wide" onClick={advance}>
                {recordButton}
              </button>
            </>
          ) : phase === 'opening' ? (
            <div className="capsule-open">
              <div className="big-cap" style={{ ['--c' as string]: capsuleColor }}>
                <span className="big-cap__item">{life.life.emoji}</span>
                <i className="big-cap__bottom" />
                <i className="big-cap__top" />
              </div>
              <p className="hand">비틀어서… 열었다!</p>
            </div>
          ) : (
            <div className="rebirth__wait">
              <p className="hand">
                관리자의 임기가 끝났습니다.
                <br />
                이제 당신은 당신이 만든 지구의 구성원 중 하나로 다시 태어납니다.
              </p>
              <p className="rebirth__note">인간일 수도, 펭귄일 수도, 강물고기일 수도 있습니다.</p>
              <button className="btn btn--ink" onClick={advance} disabled={phase === 'turning'}>
                {phase === 'dropped' ? '캡슐 꺼내서 열기 ▶' : phase === 'turning' ? '돌아가는 중…' : '손잡이 돌리기 ▶'}
              </button>
            </div>
          )}
        </section>
      </main>
    </Stage>
  )
}
