// 선생님용 수업 토론방
// ?teacher            → 토론방 만들기
// ?teacher=번호&key=열쇠 → 관전 화면 (RoomHost.tsx): 대기실 → 시작 → 투표·결과 → 우리 반이 만든 지구

import { useState } from 'react'
import { createRoom, myRooms } from '../game/room.ts'
import RoomHost from './RoomHost.tsx'

const PARAMS = new URLSearchParams(location.search)
const CODE = PARAMS.get('teacher') ?? ''
const KEY = PARAMS.get('key') ?? ''

export default function TeacherScreen() {
  if (/^\d{6}$/.test(CODE) && KEY) return <RoomHost code={CODE} roomKey={KEY} />
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
          반 전체가 <b>지구 하나를 함께</b> 관리해요. 학생들이 참여 번호로 들어와 기다리면, 선생님이 시작을 눌러요.
          민원마다 학생들이 승인·반려에 투표하고 많은 쪽으로 결정돼요. 선생님 화면은 큰 화면에 띄워 두는 관전석이에요.
          끝나면 각자 다시 태어나 <b>“인류는 지구의 주인인가, 손님인가?”</b>에 답해요.
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
