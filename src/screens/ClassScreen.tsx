// 학생 화면: 반 전체가 하나의 지구를 함께 관리
// 기다리기(선생님이 시작 누를 때까지) → 민원마다 승인/반려 투표 → 우리 반 결과 → … → 임기 끝
// 진행은 선생님 화면이 하고, 학생 화면은 2.5초마다 방 상태를 받아 와서 보여 줌

import { useEffect, useRef, useState } from 'react'
import Gauges from '../components/Gauges.tsx'
import Minsim from '../components/Minsim.tsx'
import Monitor from '../components/Monitor.tsx'
import Petition from '../components/Petition.tsx'
import Stage from '../components/Stage.tsx'
import { CARDS } from '../data/cards.ts'
import { TERM_YEARS, YEARS_PER_TURN, deltaText, stampLabels } from '../game/engine.ts'
import { findRoom, saveRecord } from '../game/room.ts'
import type { RoomSession, RoomView } from '../game/room.ts'
import { sfx } from '../game/sound.ts'
import type { GameState } from '../game/types.ts'

const REFRESH_MS = 2500

interface Props {
  room: RoomSession
  name: string
  /** 임기가 끝나면 우리 반 지구를 넘겨줌 → 임기 보고서·환생으로 */
  onEnd: (game: GameState) => void
}

export default function ClassScreen({ room, name, onEnd }: Props) {
  const [view, setView] = useState<RoomView | null>(null)
  // 내가 몇 번째 민원에 무엇을 골랐는지
  const [mine, setMine] = useState<{ round: number; pick: 'yes' | 'no' } | null>(null)
  const [now, setNow] = useState(Date.now())
  const lastStatus = useRef('')

  // 들어오자마자 이름을 서버에 알림 (선생님 화면 대기실에 뜨게)
  useEffect(() => {
    saveRecord(room, { name, round: 0, pick: null, life: null, outcome: null, vote: null, reason: '' })
  }, [room, name])

  // 2.5초마다 방 상태 받아 오기 + 1초마다 남은 시간 다시 그리기
  useEffect(() => {
    let alive = true
    const refresh = async () => {
      const data = await findRoom(room.code)
      if (alive && data) setView(data)
    }
    refresh()
    const poll = window.setInterval(refresh, REFRESH_MS)
    const clock = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      alive = false
      window.clearInterval(poll)
      window.clearInterval(clock)
    }
  }, [room.code])

  const state = view?.state
  // 상태가 바뀔 때 소리, 임기가 끝나면 다음 화면으로
  useEffect(() => {
    if (!state) return
    const key = `${state.status}-${state.round}`
    if (key === lastStatus.current) return
    lastStatus.current = key
    if (state.status === 'vote') sfx.paper()
    if (state.status === 'reveal' && state.result) state.result.approved ? sfx.good() : sfx.bad()
    if (state.status === 'end' && state.game) onEnd(state.game)
  }, [state, onEnd])

  // ───── 기다리는 중 ─────
  if (!state || state.status === 'lobby' || !state.game || !state.cardId) {
    return (
      <main className="screen class-wait">
        <article className="doc class-wait__doc">
          <header className="doc__head">
            <span>{room.title}</span>
            <span>참여 번호 {room.code}</span>
          </header>
          <h2 className="doc__title">대 기 실</h2>
          <p className="class-wait__name">
            <b>{name}</b> 관리자님, 들어왔어요.
          </p>
          <p className="class-wait__text">
            선생님이 <b>시작</b>을 누르면 바로 첫 민원이 올라와요.
            <br />
            이번에는 반 전체가 지구 하나를 함께 관리해요. 민원마다 승인·반려에 투표하면, 많은 쪽으로 결정돼요.
          </p>
          <p className="class-wait__count">
            지금 <b>{view?.count ?? 1}명</b> 들어옴
            <i className="class-wait__dots" />
          </p>
        </article>
      </main>
    )
  }

  // ───── 투표 · 결과 ─────
  const game = state.game
  const card = CARDS.find((c) => c.id === state.cardId) ?? CARDS[0]
  const label = stampLabels(card)
  const revealed = state.status === 'reveal' && state.result
  const myPick = mine && mine.round === state.round ? mine.pick : null
  const left = state.endsAt ? Math.max(0, Math.ceil((state.endsAt - now) / 1000)) : 0
  const year = Math.min(state.round, 15) * YEARS_PER_TURN
  const result = state.result

  const vote = (pick: 'yes' | 'no') => {
    if (state.status !== 'vote') return
    sfx.stamp()
    setMine({ round: state.round, pick })
    saveRecord(room, { name, round: state.round, pick, life: null, outcome: null, vote: null, reason: '' })
  }

  return (
    <Stage>
      <main className="screen desk class-desk">
        <div className="desk__top">
          <Monitor
            game={game}
            highlight={card.kind === 'gaia' ? 'all' : (card.zone ?? null)}
            ticker={
              revealed && result
                ? `[우리 반 결정: ${result.approved ? label.approve : label.reject}] ${card.policy} — ${label.approve} ${result.yes} · ${label.reject} ${result.no}`
                : `${room.title} · 민원 ${state.round}번 투표 중`
            }
            flash={
              revealed && result
                ? {
                    zone: card.kind === 'gaia' ? 'all' : (card.zone ?? 'all'),
                    good: result.deltas.earth + result.deltas.human + result.deltas.economy >= 0,
                    text: deltaText(result.deltas) || '변화 없음',
                    id: state.round,
                  }
                : null
            }
            status={
              <>
                <span>관리 {year}년차 / {TERM_YEARS}</span>
                <span>민원 {state.round}번</span>
                <span>토론방 {room.code}</span>
              </>
            }
          />
          <aside className="desk__side">
            <Gauges stats={game.stats} deltas={revealed && result ? result.deltas : null} />
            <Minsim game={game} />
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
                {revealed && result ? (
                  result.reactions.map((n, i) => (
                    <p key={`${state.round}-${i}`} className={`sticky sticky--${i}`}>
                      <b>
                        {n.emoji} {n.name}
                      </b>
                      {n.text}
                    </p>
                  ))
                ) : (
                  <p className="sticky sticky--hint">
                    민원서와 첨부 자료를 읽고
                    <br />내 생각대로 도장을 쾅!
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="desk__center">
            <Petition
              key={state.round}
              card={card}
              game={game}
              number={state.round}
              year={year}
              stamped={revealed && result ? { approved: result.approved, label: result.approved ? label.approve : label.reject } : null}
              leaving={false}
              peeked={false}
              onPeek={() => {}}
              approveLabel={label.approve}
              rejectLabel={label.reject}
              noAttach
            />
          </section>

          <section className="desk__right">
            <div className="stamps">
              {/* 폰에서만 보이는 한 줄: 남은 시간·내 표 / 우리 반 결정 (도장 막대 위에 붙음) */}
              <p className={`class-pill ${revealed && result ? (result.approved ? 'ok' : 'no') : ''}`}>
                {revealed && result
                  ? `우리 반 결정: ${result.approved ? label.approve : label.reject} (${result.yes}:${result.no})`
                  : `남은 ${left}초 · ${myPick ? `내 표 ${myPick === 'yes' ? label.approve : label.reject}` : '아직 투표 전'}`}
              </p>
              {(['no', 'yes'] as const).map((pick) => (
                <button
                  key={pick}
                  className={`stamp stamp--${pick === 'yes' ? 'approve' : 'reject'} ${myPick === pick ? 'stamp--picked' : ''}`}
                  onClick={() => vote(pick)}
                  disabled={state.status !== 'vote'}
                  aria-label={pick === 'yes' ? label.approve : label.reject}
                >
                  <span className="stamp__handle" />
                  <span className="stamp__neck" />
                  <span className="stamp__face">{pick === 'yes' ? label.approve : label.reject}</span>
                </button>
              ))}
            </div>
            <div className="class-vote">
              {revealed && result ? (
                <>
                  <b>우리 반 결정</b>
                  <p className={`class-vote__result ${result.approved ? 'ok' : 'no'}`}>
                    {result.approved ? label.approve : label.reject}
                  </p>
                  <small>
                    {label.approve} {result.yes}표 · {label.reject} {result.no}표
                    {myPick && ` · 나는 ${myPick === 'yes' ? label.approve : label.reject}`}
                  </small>
                  <small>잠시 뒤 다음 민원이 올라와요</small>
                </>
              ) : (
                <>
                  <b>{myPick ? `내 표: ${myPick === 'yes' ? label.approve : label.reject}` : '아직 투표 전'}</b>
                  <p className="class-vote__timer">{left}초</p>
                  <small>{myPick ? '마감 전까지는 다른 도장으로 바꿀 수 있어요' : '마감되면 많은 쪽으로 결정돼요'}</small>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </Stage>
  )
}
