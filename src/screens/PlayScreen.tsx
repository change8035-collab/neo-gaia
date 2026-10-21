import { useEffect, useRef, useState } from 'react'
import Gauges from '../components/Gauges.tsx'
import Monitor from '../components/Monitor.tsx'
import MuteButton from '../components/MuteButton.tsx'
import Petition from '../components/Petition.tsx'
import Stage from '../components/Stage.tsx'
import StampFlight, { makeFlight, reducedMotion } from '../components/StampFlight.tsx'
import type { Flight } from '../components/StampFlight.tsx'
import { CARDS } from '../data/cards.ts'
import { PHASE_INFO, TERM_TURNS, TERM_YEARS, YEARS_PER_TURN, choose, consult, endingId, nextCard, phaseOf, trustWord } from '../game/engine.ts'
import { sfx } from '../game/sound.ts'
import { FACTIONS, FACTION_INFO, STAT_INFO, STAT_KEYS } from '../game/types.ts'
import type { Card, GameState, Reaction, Stats, ZoneId } from '../game/types.ts'

interface Props {
  game: GameState
  /** 개발용: 이 id 의 민원서부터 시작 */
  firstCard?: string
  onChange: (game: GameState) => void
  onEnd: () => void
}

type Flash = { zone: ZoneId | 'all'; good: boolean; text: string; id: number }

const LEDGER_ROWS = 9

function labels(card: Card) {
  if (card.kind === 'gaia') return { approve: '실행', reject: '거부' }
  if (card.kind === 'finale') return { approve: '나누기', reject: '혼자 쥐기' }
  return { approve: '승인', reject: '반려' }
}

/** 지구 −8 · 인간 +4 처럼 바뀐 지표를 짧게 */
function deltaText(d: Stats) {
  return STAT_KEYS.filter((k) => d[k] !== 0)
    .map((k) => `${STAT_INFO[k].label} ${d[k] > 0 ? '+' : ''}${d[k]}`)
    .join(' · ')
}

export default function PlayScreen({ game, firstCard, onChange, onEnd }: Props) {
  const [card, setCard] = useState<Card>(() => CARDS.find((c) => c.id === firstCard) ?? nextCard(game, CARDS, Math.random))
  const [docNo, setDocNo] = useState(1)
  const [stamped, setStamped] = useState<{ approved: boolean; label: string } | null>(null)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [notes, setNotes] = useState<Reaction[]>([])
  const [deltas, setDeltas] = useState<Stats | null>(null)
  const [flash, setFlash] = useState<Flash | null>(null)
  const [ticker, setTicker] = useState('기후관리 시스템 가동 · 첫 민원이 도착했습니다')
  const [overlay, setOverlay] = useState<{ title: string; desc?: string } | null>({
    title: PHASE_INFO[1].name,
    desc: PHASE_INFO[1].desc,
  })
  const [shake, setShake] = useState(false)
  const [finished, setFinished] = useState(false)
  const [hover, setHover] = useState<'approve' | 'reject' | null>(null)

  const approveRef = useRef<HTMLButtonElement>(null)
  const rejectRef = useRef<HTMLButtonElement>(null)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // 단계 안내는 2.6초 뒤 저절로 사라짐
  useEffect(() => {
    if (!overlay) return
    const id = window.setTimeout(() => setOverlay(null), 2600)
    return () => clearTimeout(id)
  }, [overlay])

  const turn = game.decisions.length - (stamped ? 1 : 0)
  const year = Math.min(turn + 1, TERM_TURNS) * YEARS_PER_TURN
  const isGaia = card.kind === 'gaia'
  const label = labels(card)
  const busy = !!stamped || !!flight || finished

  /** 도장이 종이에 닿는 순간: 실제 결정 적용 */
  const press = (approved: boolean) => {
    if (stamped || finished) return
    const r = choose(game, card, approved)
    sfx.stamp()
    setShake(true)
    later(() => setShake(false), 280)
    setStamped({ approved, label: approved ? label.approve : label.reject })
    setHover(null)
    onChange(r.state)
    setDeltas(r.deltas)
    setNotes(r.reactions)
    const sum = r.deltas.earth + r.deltas.human + r.deltas.economy
    const text = deltaText(r.deltas)
    if (text) setFlash({ zone: isGaia ? 'all' : (card.zone ?? 'all'), good: sum >= 0, text, id: Date.now() })
    const first = r.reactions[0]
    setTicker(`[${approved ? '시행' : '반려'}] ${card.policy} — ${first.name}: "${first.text}"`)
    later(() => (sum >= 0 ? sfx.good() : sfx.bad()), 260)

    later(() => setLeaving(true), 900)
    later(() => {
      if (endingId(r.state)) {
        setFinished(true)
        return
      }
      const t = r.state.decisions.length
      if (t >= TERM_TURNS) setOverlay({ title: '임기 종료', desc: '마지막 안건이 올라왔습니다' })
      else if (phaseOf(t) !== phaseOf(t - 1)) setOverlay({ title: PHASE_INFO[phaseOf(t)].name, desc: PHASE_INFO[phaseOf(t)].desc })
      const next = nextCard(r.state, CARDS, Math.random)
      setCard(next)
      setDocNo((n) => n + 1)
      setStamped(null)
      setLeaving(false)
      setPeeked(false)
      setDeltas(null)
      if (next.kind === 'gaia') {
        sfx.alarm()
        setTicker('⚠ 경고 · 네오 가이아 내부 연산이 최종 해답을 제출했습니다')
      } else sfx.paper()
    }, 1400)
  }

  /** 도장을 집어 들어 서류로 날려 보냄 */
  const stamp = (approved: boolean) => {
    if (busy) return
    const btn = approved ? approveRef.current : rejectRef.current
    const target = document.querySelector('.desk__center .doc__result')
    if (!btn || !target || reducedMotion()) return press(approved)
    setHover(null)
    setFlight(makeFlight(btn, target, approved ? 'approve' : 'reject', approved ? label.approve : label.reject))
  }

  const peek = () => {
    if (busy || peeked || game.consults <= 0) return
    sfx.paper()
    onChange(consult(game))
    setPeeked(true)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (finished && e.key === 'Enter') return onEnd()
      if (e.key === 'ArrowLeft') stamp(false)
      else if (e.key === 'ArrowRight') stamp(true)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const hovered = hover ? card[hover] : null
  const preview = hovered ? (hovered.set ? { earth: 50, human: 50 } : hovered.effects) : null
  const approvedCount = game.decisions.filter((d) => d.approved).length
  const rejectedCount = game.decisions.length - approvedCount
  const ledger = [...game.decisions].reverse().slice(0, LEDGER_ROWS)

  return (
    <Stage>
    <main className={`screen desk ${shake ? 'shake' : ''} ${isGaia && !stamped ? 'desk--alarm' : ''}`}>
      <div className="desk__top">
        <Monitor
          game={game}
          highlight={isGaia ? 'all' : (card.zone ?? null)}
          alarm={isGaia && !stamped}
          overlay={overlay}
          ticker={ticker}
          flash={flash}
          status={
            <>
              <span>관리 {year}년차 / {TERM_YEARS}</span>
              <span>처리 {game.decisions.length}건</span>
              <span>분석서 {game.consults}장</span>
            </>
          }
        />
        <aside className="desk__side">
          <Gauges stats={game.stats} deltas={deltas} preview={preview} />
          <div className="minsim">
            <b className="minsim__title">민심</b>
            {FACTIONS.map((f) => {
              const t = game.trust[f]
              const word = trustWord(t)
              return (
                <div key={f} className={`minsim__row ${t <= 25 ? 'low' : ''}`}>
                  <span className="minsim__who">
                    <b>{FACTION_INFO[f].label}</b>
                    <small>{FACTION_INFO[f].desc}</small>
                  </span>
                  <i>
                    <s style={{ width: `${t}%` }} />
                  </i>
                  <em className={`mood mood--${word.tone}`}>{word.label}</em>
                </div>
              )
            })}
          </div>
        </aside>
      </div>

      <div className="desk__bottom">
        <section className="desk__left">
          <div className="desk__left-top">
            <div className="calendar">
              <span>임기</span>
              <b key={year}>{year}</b>
              <span>년차</span>
            </div>
            <div className="notes">
              {notes.length === 0 ? (
                <p className="sticky sticky--hint">
                  민원서를 읽고
                  <br />
                  오른쪽 도장을 쾅!
                </p>
              ) : (
                notes.map((n, i) => (
                  <p key={`${docNo}-${i}`} className={`sticky sticky--${i}`}>
                    <b>
                      {n.emoji} {n.name}
                    </b>
                    {n.text}
                  </p>
                ))
              )}
            </div>
          </div>
          <div className="ledger">
            <b className="ledger__title">결재 대장</b>
            <ol>
              {Array.from({ length: LEDGER_ROWS }).map((_, i) => {
                const d = ledger[i]
                return (
                  <li key={d ? d.cardId : `empty-${i}`} className={d && i === 0 ? 'ledger__new' : ''}>
                    {d && (
                      <>
                        <span className="ledger__year">{d.year}년</span>
                        <span className="ledger__policy">{d.policy}</span>
                        <i className={`mini-stamp ${d.approved ? 'ok' : 'no'}`}>{d.approved ? '승인' : '반려'}</i>
                      </>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        <section className="desk__center">
          <Petition
            key={docNo}
            card={card}
            game={game}
            number={docNo}
            year={year}
            stamped={stamped}
            leaving={leaving}
            peeked={peeked}
            onPeek={peek}
            approveLabel={label.approve}
            rejectLabel={label.reject}
          />
          {finished && (
            <div className="finish">
              <p className="px">관리 종료</p>
              <button className="btn btn--ink" onClick={onEnd} autoFocus>
                임기 보고서 받기 ▶
              </button>
            </div>
          )}
        </section>

        <section className="desk__right">
          <div className="stamps">
            {(['reject', 'approve'] as const).map((side) => (
              <button
                key={side}
                ref={side === 'approve' ? approveRef : rejectRef}
                className={`stamp stamp--${side} ${flight?.side === side ? 'stamp--away' : ''}`}
                onClick={() => stamp(side === 'approve')}
                onMouseEnter={() => setHover(side)}
                onMouseLeave={() => setHover(null)}
                disabled={busy}
                aria-label={side === 'approve' ? label.approve : label.reject}
              >
                <span className="stamp__handle" />
                <span className="stamp__neck" />
                <span className="stamp__face">{side === 'approve' ? label.approve : label.reject}</span>
              </button>
            ))}
          </div>
          <p className="desk__hint">
            키보드 ← 반려 · → 승인
            <br />
            도장에 마우스를 올리면 바뀔 계기판에 ! 표시
          </p>
          {card.example && (
            <aside className="clipping" key={docNo}>
              <span className="clipping__label">참고 · 실제 세계에서는</span>
              <p>{card.example.text}</p>
              <a href={card.example.url} target="_blank" rel="noreferrer">
                출처: {card.example.from}
              </a>
            </aside>
          )}
          <div className="desk__right-bottom">
            <div className="trays">
              <div className="tray">
                <span className="tray__stack" style={{ height: Math.min(40, approvedCount * 3) }} />
                <b>처리함 {approvedCount}</b>
              </div>
              <div className="tray tray--bin">
                <span className="tray__stack" style={{ height: Math.min(40, rejectedCount * 3) }} />
                <b>반려함 {rejectedCount}</b>
              </div>
            </div>
            <MuteButton />
          </div>
        </section>
      </div>

      {flight && (
        <StampFlight
          flight={flight}
          onPress={() => press(flight.side === 'approve')}
          onDone={() => setFlight(null)}
        />
      )}
    </main>
    </Stage>
  )
}
