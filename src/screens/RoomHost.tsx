// 선생님 관전 화면 (교실 큰 화면용)
// 대기실(참여 번호·QR·들어온 학생) → [시작] → 민원마다 투표 → 결과 → 다음 민원 → 우리 반이 만든 지구
// 진행 규칙: 모두 투표했거나 시간이 끝나면 마감, 결과는 잠깐 보여 주고 다음 민원으로 (자동 넘김)

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import Gauges from '../components/Gauges.tsx'
import Minsim from '../components/Minsim.tsx'
import Monitor from '../components/Monitor.tsx'
import Panorama from '../components/Panorama.tsx'
import Petition from '../components/Petition.tsx'
import Stage from '../components/Stage.tsx'
import { CARDS } from '../data/cards.ts'
import {
  TERM_YEARS,
  YEARS_PER_TURN,
  choose,
  deltaText,
  endingId,
  getEnding,
  grade,
  managerType,
  newGame,
  nextCard,
  stampLabels,
} from '../game/engine.ts'
import { loadBoard, saveState } from '../game/room.ts'
import type { Board, RoomState } from '../game/room.ts'
import { sfx } from '../game/sound.ts'
import { zoneViews } from '../game/zones.ts'

const REFRESH_MS = 2000
const VOTE_MS = 45000 // 민원 하나 투표 시간 45초
const REVEAL_MS = 9000 // 결과 보여 주는 시간 9초

export default function RoomHost({ code, roomKey }: { code: string; roomKey: string }) {
  const [board, setBoard] = useState<Board | null>(null)
  const [failed, setFailed] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [qr, setQr] = useState('')
  // 자동 넘김을 끄면 결과 화면에서 선생님이 [다음 민원]을 눌러야 넘어감 (토론할 때)
  const [auto, setAuto] = useState(true)
  const acting = useRef(false)
  const joinUrl = `${location.origin}${location.pathname}?room=${code}`

  // 학생용 참여 주소를 QR 그림으로
  useEffect(() => {
    QRCode.toString(joinUrl, { type: 'svg', margin: 1, color: { dark: '#1f1c18', light: '#fffaf0' } }).then(setQr)
  }, [joinUrl])

  // 2초마다 방 상태·학생 목록 받아 오기, 1초마다 시계
  useEffect(() => {
    let alive = true
    const refresh = async () => {
      const data = await loadBoard(code, roomKey)
      if (!alive) return
      if (data) {
        setBoard(data)
        setFailed(false)
      } else setFailed(true)
    }
    refresh()
    const poll = window.setInterval(refresh, REFRESH_MS)
    const clock = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      alive = false
      window.clearInterval(poll)
      window.clearInterval(clock)
    }
  }, [code, roomKey])

  // 진행 상태를 서버에 저장하고 화면에도 바로 반영
  const update = async (next: RoomState) => {
    const ok = await saveState(code, roomKey, next)
    if (ok) setBoard((b) => (b ? { ...b, state: next } : b))
  }

  // 한 번에 하나의 진행만 (2초마다 겹쳐서 두 번 넘어가지 않게)
  const act = async (job: () => Promise<void>) => {
    if (acting.current) return
    acting.current = true
    try {
      await job()
    } finally {
      acting.current = false
    }
  }

  // [시작]: 새 지구와 첫 민원
  const start = () =>
    act(async () => {
      const game = newGame()
      const card = nextCard(game, CARDS, Math.random)
      sfx.paper()
      await update({ status: 'vote', round: 1, cardId: card.id, game, endsAt: Date.now() + VOTE_MS, result: null, history: [] })
    })

  // 투표 마감: 가장 최근 표를 다시 받아 세고, 많은 쪽으로 결정 (같으면 반려)
  const closeVote = () =>
    act(async () => {
      const fresh = (await loadBoard(code, roomKey)) ?? board
      if (!fresh || fresh.state.status !== 'vote' || !fresh.state.game) return
      const st = fresh.state
      const card = CARDS.find((c) => c.id === st.cardId)
      if (!card || !st.game) return
      let yes = 0
      let no = 0
      for (const p of fresh.players) {
        if (p.round !== st.round) continue
        if (p.pick === 'yes') yes++
        if (p.pick === 'no') no++
      }
      const approved = yes > no
      const r = choose(st.game, card, approved)
      sfx.stamp()
      await update({
        ...st,
        status: 'reveal',
        game: r.state,
        endsAt: Date.now() + REVEAL_MS,
        result: { cardId: card.id, approved, yes, no, deltas: r.deltas, reactions: r.reactions },
        history: [...(st.history ?? []), { cardId: card.id, approved, yes, no }],
      })
    })

  // 다음 민원 (임기가 끝났으면 마지막 화면으로)
  const nextRound = () =>
    act(async () => {
      if (!board || !board.state.game) return
      const st = board.state
      const game = board.state.game
      if (endingId(game)) {
        await update({ ...st, status: 'end', endsAt: null })
        return
      }
      const card = nextCard(game, CARDS, Math.random)
      sfx.paper()
      await update({ ...st, status: 'vote', round: st.round + 1, cardId: card.id, endsAt: Date.now() + VOTE_MS, result: null })
    })

  // 자동 진행
  useEffect(() => {
    if (!board) return
    const st = board.state
    if (st.status === 'vote') {
      let voted = 0
      for (const p of board.players) if (p.round === st.round && p.pick) voted++
      const everyone = board.players.length > 0 && voted >= board.players.length
      if (everyone || (st.endsAt !== null && now >= st.endsAt)) closeVote()
    }
    if (st.status === 'reveal' && auto && st.endsAt !== null && now >= st.endsAt) nextRound()
  })

  if (!board) {
    return (
      <main className="screen board-new">
        <article className="doc board-new__doc">
          <h2 className="doc__title">관전석 여는 중</h2>
          {failed && <p className="board-new__error">방 번호나 열쇠가 맞지 않아요. 토론방을 만든 주소로 다시 열어 주세요.</p>}
          <a className="board-new__back" href="?teacher">
            ← 토론방 만들기로
          </a>
        </article>
      </main>
    )
  }

  const st = board.state
  const players = board.players

  // ───── 대기실 ─────
  if (st.status === 'lobby' || !st.game) {
    return (
      <Stage>
        <main className="screen host-lobby">
          <section className="host-lobby__join">
            <span>NEO GAIA 수업 토론방 · {board.title}</span>
            <b className="host-lobby__code">{code}</b>
            <ol className="host-lobby__steps">
              <li>
                <b>1</b>폰으로 QR 찍기
                <small>또는 첫 화면 ‘참여 번호’에 입력</small>
              </li>
              <li>
                <b>2</b>임명장에 이름 쓰기
              </li>
              <li>
                <b>3</b>수락 도장 쾅!
                <small>아래에 이름표가 붙어요</small>
              </li>
            </ol>
            <small>{joinUrl.replace(/^https?:\/\//, '')}</small>
          </section>
          <div className="host-lobby__qr" dangerouslySetInnerHTML={{ __html: qr }} />
          <section className="host-lobby__people">
            <b>
              들어온 관리자 <em>{players.length}명</em>
            </b>
            <ul>
              {players.map((p, i) => (
                <li key={p.id} className={`sticky sticky--${i % 3}`}>
                  {p.name}
                </li>
              ))}
              {players.length === 0 && <li className="board__empty host-lobby__waiting">QR을 찍고 들어오면 여기에 이름표가 붙어요</li>}
            </ul>
          </section>
          <button className="btn btn--ink host-lobby__start" onClick={start} disabled={players.length === 0}>
            {players.length === 0 ? '학생을 기다리는 중…' : `${players.length}명과 게임 시작 ▶`}
          </button>
        </main>
      </Stage>
    )
  }

  const game = st.game

  // ───── 임기 끝: 우리 반이 만든 지구 ─────
  if (st.status === 'end') {
    const ending = getEnding(endingId(game) ?? 'cracked', game)
    const g = grade(game)
    const type = managerType(game)
    const owners = players.filter((p) => p.vote === '주인')
    const guests = players.filter((p) => p.vote === '손님')
    const voted = owners.length + guests.length
    return (
      <Stage>
        <main className="screen host-end">
          <section className="host-end__world">
            <div className="host-end__title">
              <span>{board.title}</span>
              <h1>우리 반이 만든 지구</h1>
            </div>
            <figure className="polaroid host-end__photo">
              <Panorama game={game} highlight={ending.id === 'gaia' ? 'all' : null} />
            </figure>
          </section>

          <div className="host-end__cols">
            <section className="board__panel">
              <b className="board__label">임기 보고서</b>
              <div className="host-end__grade">
                <b className="grade-stamp">{g.mark}</b>
                <div>
                  <h2>
                    {ending.emoji} {ending.title}
                  </h2>
                  <small>
                    {type.name} · {g.note}
                  </small>
                </div>
              </div>
              <p className="host-end__text">{ending.text}</p>
              <p className="host-end__stats">
                지구 <b>{game.stats.earth}</b> · 인간 <b>{game.stats.human}</b> · 경제 <b>{game.stats.economy}</b>
              </p>
              <b className="board__label host-end__zones-title">기후대별 마지막 모습</b>
              <ul className="host-end__zones">
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

            <section className="board__panel">
              <b className="board__label">우리 반 결재 대장</b>
              <ul className="host-end__ledger">
                {(st.history ?? []).map((h, i) => {
                  const card = CARDS.find((c) => c.id === h.cardId)
                  if (!card) return null
                  const label = stampLabels(card)
                  return (
                    <li key={i}>
                      <span>{card.policy}</span>
                      <i className={`mini-stamp ${h.approved ? 'ok' : 'no'}`}>{h.approved ? label.approve : label.reject}</i>
                      <small>
                        {h.yes}:{h.no}
                      </small>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="board__panel">
              <b className="board__label">인류는 지구의 주인인가, 손님인가?</b>
              <div className="board__vote-nums">
                <span>
                  주인 <b>{owners.length}</b>
                </span>
                <span>
                  손님 <b>{guests.length}</b>
                </span>
              </div>
              <span className="board__bar board__bar--vote">
                <s className="owner" style={{ width: voted ? `${(owners.length / voted) * 100}%` : '50%' }} />
                <s className="guest" style={{ width: voted ? `${(guests.length / voted) * 100}%` : '50%' }} />
              </span>
              <ul className="board__reasons">
                {players
                  .filter((p) => p.vote && p.reason)
                  .slice(0, 4)
                  .map((p) => (
                    <li key={p.id}>
                      <i className={`mini-stamp ${p.vote === '손님' ? 'guest' : 'owner'}`}>{p.vote}</i> {p.reason}
                      <small> — {p.name}</small>
                    </li>
                  ))}
              </ul>
              <b className="board__label host-end__zones-title">다시 태어난 우리 반</b>
              <ul className="host-end__lives">
                {players
                  .filter((p) => p.life)
                  .map((p) => (
                    <li key={p.id}>
                      <span>{p.name}</span> {p.life} · <em>{p.outcome}</em>
                    </li>
                  ))}
                {players.every((p) => !p.life) && <li className="board__empty">학생들이 폰에서 환생 캡슐을 뽑는 중이에요</li>}
              </ul>
            </section>
          </div>
        </main>
      </Stage>
    )
  }

  // ───── 투표 · 결과 ─────
  const card = CARDS.find((c) => c.id === st.cardId) ?? CARDS[0]
  const label = stampLabels(card)
  const result = st.status === 'reveal' ? st.result : null
  const year = Math.min(st.round, 15) * YEARS_PER_TURN
  const left = st.endsAt ? Math.max(0, Math.ceil((st.endsAt - now) / 1000)) : 0
  let voted = 0
  for (const p of players) if (p.round === st.round && p.pick) voted++

  return (
    <Stage>
      <main className="screen desk host-desk">
        <div className="desk__top">
          <Monitor
            game={game}
            highlight={card.kind === 'gaia' ? 'all' : (card.zone ?? null)}
            alarm={card.kind === 'gaia' && !result}
            ticker={
              result
                ? `[우리 반 결정: ${result.approved ? label.approve : label.reject}] ${card.policy} — ${result.reactions[0]?.name}: "${result.reactions[0]?.text}"`
                : `${board.title} · 민원 ${st.round}번 투표 중 · 참여 번호 ${code}`
            }
            flash={
              result
                ? {
                    zone: card.kind === 'gaia' ? 'all' : (card.zone ?? 'all'),
                    good: result.deltas.earth + result.deltas.human + result.deltas.economy >= 0,
                    text: deltaText(result.deltas) || '변화 없음',
                    id: st.round,
                  }
                : null
            }
            status={
              <>
                <span>관리 {year}년차 / {TERM_YEARS}</span>
                <span>민원 {st.round}번</span>
                <span>참여 {players.length}명</span>
              </>
            }
          />
          <aside className="desk__side">
            <Gauges stats={game.stats} deltas={result ? result.deltas : null} />
            <Minsim game={game} />
          </aside>
        </div>

        <div className="desk__bottom">
          <section className="desk__left host-people">
            <b className="board__label">
              관리자 {players.length}명 <small>· 참여 번호 {code}</small>
            </b>
            {!result && (
              <div className="host-progress">
                <span>
                  투표 <b>{voted}</b> / {players.length}
                </span>
                <i>
                  <s style={{ width: `${players.length ? (voted / players.length) * 100 : 0}%` }} />
                </i>
              </div>
            )}
            <ul>
              {players.map((p) => {
                const done = p.round === st.round && p.pick
                // 투표 중에는 낸 사람만 ✓, 결과 때는 누가 어느 쪽인지 색으로
                const cls = !done ? '' : result ? (p.pick === 'yes' ? 'yes' : 'no') : 'done'
                return (
                  <li key={p.id} className={cls}>
                    {p.name}
                  </li>
                )
              })}
            </ul>
            {result && (
              <div className="notes host-notes">
                {result.reactions.map((n, i) => (
                  <p key={`${st.round}-${i}`} className={`sticky sticky--${i}`}>
                    <b>
                      {n.emoji} {n.name}
                    </b>
                    {n.text}
                  </p>
                ))}
              </div>
            )}
          </section>

          <section className="desk__center">
            <Petition
              key={st.round}
              card={card}
              game={game}
              number={st.round}
              year={year}
              stamped={result ? { approved: result.approved, label: result.approved ? label.approve : label.reject } : null}
              leaving={false}
              peeked={false}
              onPeek={() => {}}
              approveLabel={label.approve}
              rejectLabel={label.reject}
              noAttach
            />
          </section>

          <section className="desk__right">
            <div className="host-tally">
              {result ? (
                <>
                  <b>우리 반 결정</b>
                  <p className={`class-vote__result ${result.approved ? 'ok' : 'no'}`}>
                    {result.approved ? label.approve : label.reject}
                  </p>
                  <span className="board__bar">
                    <s className="yes" style={{ width: `${result.yes + result.no ? (result.yes / (result.yes + result.no)) * 100 : 50}%` }} />
                    <s className="no" style={{ width: `${result.yes + result.no ? (result.no / (result.yes + result.no)) * 100 : 50}%` }} />
                  </span>
                  <small>
                    {label.approve} {result.yes}표 · {label.reject} {result.no}표{result.yes === result.no && ' (같으면 반려)'}
                  </small>
                  <button className="btn btn--ink btn--wide" onClick={nextRound}>
                    {endingId(game) ? '임기 끝 ▶' : '다음 민원 ▶'}
                  </button>
                  <label className="host-auto">
                    <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
                    {auto ? `${left}초 뒤 자동으로 넘김` : '자동 넘김 꺼짐 (토론 중)'}
                  </label>
                </>
              ) : (
                <>
                  <b>투표 중</b>
                  <p className="class-vote__timer">{left}초</p>
                  <small>
                    {voted} / {players.length}명 투표 · 결과는 마감 뒤 공개
                  </small>
                  <button className="btn btn--paper btn--wide" onClick={closeVote}>
                    바로 마감
                  </button>
                </>
              )}
            </div>
            <figure className="host-qr">
              <div dangerouslySetInnerHTML={{ __html: qr }} />
              <figcaption>늦게 온 친구는 QR로</figcaption>
            </figure>
          </section>
        </div>
      </main>
    </Stage>
  )
}
