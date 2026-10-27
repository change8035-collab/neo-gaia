// 선생님용 수업 토론방
// ?teacher            → 토론방 만들기
// ?teacher=번호&key=열쇠 → 상황판 (학생들 결재·엔딩·주인/손님 투표가 4초마다 새로 모임)

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Stage from '../components/Stage.tsx'
import { CARDS } from '../data/cards.ts'
import { getEnding, newGame } from '../game/engine.ts'
import { createRoom, loadBoard, myRooms } from '../game/room.ts'
import type { Board, PlayerRecord } from '../game/room.ts'
import type { Card, EndingId } from '../game/types.ts'

const PARAMS = new URLSearchParams(location.search)
const CODE = PARAMS.get('teacher') ?? ''
const KEY = PARAMS.get('key') ?? ''
const REFRESH_MS = 4000

export default function TeacherScreen() {
  if (/^\d{6}$/.test(CODE) && KEY) return <RoomBoard code={CODE} roomKey={KEY} />
  return <NewRoom />
}

/* ───────── 토론방 만들기 ───────── */

function NewRoom() {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const rooms = myRooms()

  const make = async () => {
    setBusy(true)
    setError('')
    try {
      const room = await createRoom(title.trim())
      // 만든 방의 상황판으로 이동 (열쇠가 들어 있는 주소)
      location.href = `?teacher=${room.code}&key=${room.key}`
    } catch {
      setError('방을 만들지 못했어요. 인터넷 연결을 확인하거나, neo-gaia.netlify.app 주소에서 열어 주세요.')
      setBusy(false)
    }
  }

  return (
    <main className="screen board-new">
      <article className="doc board-new__doc">
        <header className="doc__head">
          <span>NEO GAIA</span>
          <span>선생님용</span>
        </header>
        <h2 className="doc__title">수업 토론방 만들기</h2>
        <p className="board-new__text">
          학생들이 각자 폰이나 PC로 게임을 하면, 민원마다 누가 승인·반려했는지와 엔딩, 그리고 마지막 질문
          <b> “인류는 지구의 주인인가, 손님인가?”</b>의 답이 이 방 상황판에 실시간으로 모여요.
        </p>
        <label className="board-new__field">
          <span>방 이름</span>
          <input
            value={title}
            maxLength={30}
            placeholder="예: 1학년 3반 독서 토론"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && make()}
          />
        </label>
        <button className="btn btn--ink btn--wide" onClick={make} disabled={busy}>
          {busy ? '만드는 중…' : '토론방 만들기'}
        </button>
        {error && <p className="board-new__error">{error}</p>}

        {rooms.length > 0 && (
          <section className="board-new__mine">
            <b>이 브라우저에서 만든 방</b>
            <ul>
              {rooms.map((r) => (
                <li key={r.code}>
                  <a href={`?teacher=${r.code}&key=${r.key}`}>
                    {r.title} <span>{r.code}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <a className="board-new__back" href="./">
          ← 게임 첫 화면으로
        </a>
      </article>
    </main>
  )
}

/* ───────── 상황판 ───────── */

interface CardRow {
  card: Card
  yes: number
  no: number
}

/** 민원별로 승인·반려 수 세기 */
function countCards(players: PlayerRecord[]): CardRow[] {
  const rows: CardRow[] = []
  for (const p of players) {
    for (const d of p.decisions) {
      let row = rows.find((r) => r.card.id === d.c)
      if (!row) {
        const card = CARDS.find((c) => c.id === d.c)
        if (!card) continue
        row = { card, yes: 0, no: 0 }
        rows.push(row)
      }
      if (d.a) row.yes++
      else row.no++
    }
  }
  // 많이 결재했고 의견이 반반에 가까울수록 위로 (토론하기 좋은 민원)
  const score = (r: CardRow) => {
    const total = r.yes + r.no
    return total * (1 - Math.abs(r.yes / total - 0.5) * 2) + total * 0.01
  }
  rows.sort((a, b) => score(b) - score(a))
  return rows
}

function endingTitle(id: string | null) {
  return id ? getEnding(id as EndingId, newGame()).title : null
}

function RoomBoard({ code, roomKey }: { code: string; roomKey: string }) {
  const [board, setBoard] = useState<Board | null>(null)
  const [failed, setFailed] = useState(false)
  const [updated, setUpdated] = useState('')
  const [qr, setQr] = useState('')
  const joinUrl = `${location.origin}${location.pathname}?room=${code}`

  // 학생용 참여 주소를 QR 그림으로
  useEffect(() => {
    QRCode.toString(joinUrl, { type: 'svg', margin: 1, color: { dark: '#1f1c18', light: '#fffaf0' } }).then(setQr)
  }, [joinUrl])

  // 4초마다 서버에서 새 기록 받아 오기
  useEffect(() => {
    let alive = true
    const refresh = async () => {
      const data = await loadBoard(code, roomKey)
      if (!alive) return
      if (data) {
        setBoard(data)
        setFailed(false)
        setUpdated(new Date().toLocaleTimeString('ko-KR'))
      } else setFailed(true)
    }
    refresh()
    const timer = window.setInterval(refresh, REFRESH_MS)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [code, roomKey])

  if (!board) {
    return (
      <main className="screen board-new">
        <article className="doc board-new__doc">
          <h2 className="doc__title">상황판 불러오는 중</h2>
          {failed && <p className="board-new__error">방 번호나 열쇠가 맞지 않아요. 토론방을 만든 주소로 다시 열어 주세요.</p>}
          <a className="board-new__back" href="?teacher">
            ← 토론방 만들기로
          </a>
        </article>
      </main>
    )
  }

  const players = [...board.players].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
  const rows = countCards(players)
  const owners = players.filter((p) => p.vote === '주인')
  const guests = players.filter((p) => p.vote === '손님')
  const voted = owners.length + guests.length
  const reasons = players.filter((p) => p.vote && p.reason)

  // 엔딩별 인원
  const endings: { title: string; n: number }[] = []
  for (const p of players) {
    const title = endingTitle(p.ending)
    if (!title) continue
    const found = endings.find((e) => e.title === title)
    if (found) found.n++
    else endings.push({ title, n: 1 })
  }
  endings.sort((a, b) => b.n - a.n)

  // 토론 질문: 2명 이상 결재했고 가장 갈린 민원
  const hot = rows.find((r) => r.yes + r.no >= 2 && r.yes > 0 && r.no > 0)

  return (
    <Stage>
      <main className="screen board">
        <header className="board__head">
          <div className="board__title">
            <span>NEO GAIA 수업 토론방</span>
            <h1>{board.title}</h1>
            <small>
              참여 {players.length}명 · 투표 {voted}명 · {updated} 갱신 {failed && '(연결 끊김, 다시 시도 중)'}
            </small>
          </div>
          <div className="board__join">
            <span>참여 번호</span>
            <b>{code}</b>
            <small>{joinUrl.replace(/^https?:\/\//, '')}</small>
          </div>
          <div className="board__qr" dangerouslySetInnerHTML={{ __html: qr }} />
        </header>

        <div className="board__body">
          <section className="board__panel board__players">
            <b className="board__label">참여 학생</b>
            {players.length === 0 ? (
              <p className="board__empty">아직 아무도 없어요. 학생들에게 번호나 QR을 보여 주세요.</p>
            ) : (
              <ol>
                {players.map((p) => (
                  <li key={p.id}>
                    <span className="board__name">{p.name}</span>
                    <small>{endingTitle(p.ending) ?? `결재 ${p.decisions.length}건`}</small>
                    {p.vote && <i className={`mini-stamp ${p.vote === '손님' ? 'guest' : 'owner'}`}>{p.vote}</i>}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="board__panel board__cards">
            <b className="board__label">민원별 우리 반 결재 · 의견이 갈린 순</b>
            {rows.length === 0 ? (
              <p className="board__empty">학생들이 도장을 찍으면 여기에 모여요.</p>
            ) : (
              <ul>
                {rows.slice(0, 9).map((r) => {
                  const total = r.yes + r.no
                  return (
                    <li key={r.card.id}>
                      <span className="board__policy">{r.card.policy}</span>
                      <span className="board__bar">
                        <s className="yes" style={{ width: `${(r.yes / total) * 100}%` }} />
                        <s className="no" style={{ width: `${(r.no / total) * 100}%` }} />
                      </span>
                      <small>
                        승인 {r.yes} · 반려 {r.no}
                      </small>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="board__side">
            <div className="board__panel board__vote">
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
                {reasons.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <i className={`mini-stamp ${p.vote === '손님' ? 'guest' : 'owner'}`}>{p.vote}</i> {p.reason}
                    <small> — {p.name}</small>
                  </li>
                ))}
                {reasons.length === 0 && <li className="board__empty">회고 일기 끝에서 도장과 한 줄 이유를 내면 여기에 떠요.</li>}
              </ul>
            </div>
            <div className="board__panel board__endings">
              <b className="board__label">엔딩</b>
              {endings.length === 0 ? (
                <p className="board__empty">아직 임기를 끝낸 학생이 없어요.</p>
              ) : (
                <ul>
                  {endings.map((e) => (
                    <li key={e.title}>
                      <span>{e.title}</span>
                      <b>{e.n}명</b>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <footer className="board__question">
          <b>토론 질문</b>
          {hot ? (
            <p>
              <strong>‘{hot.card.policy}’</strong>에서 우리 반 의견이 갈렸어요 (승인 {hot.yes}명 · 반려 {hot.no}명). 승인한 사람과 반려한
              사람이 각자 무엇을 먼저 생각했는지 들어 볼까요?
              {hot.card.evidence && <small>실제 자료: {hot.card.evidence.text} ({hot.card.evidence.from})</small>}
            </p>
          ) : (
            <p>두 명 이상이 같은 민원에서 다르게 결재하면, 가장 의견이 갈린 민원이 토론 질문으로 떠요.</p>
          )}
        </footer>
      </main>
    </Stage>
  )
}
