// 수업 토론방 서버와 주고받는 함수들 (서버 코드: netlify/functions/rooms.mjs)

/** 학생이 들어가 있는 토론방 */
export interface RoomSession {
  code: string
  title: string
  playerId: string
}

/** 서버에 저장되는 학생 한 명의 기록 */
export interface PlayerRecord {
  id?: string
  name: string
  /** c: 카드 id, a: 승인했으면 true */
  decisions: { c: string; a: boolean }[]
  ending: string | null
  grade: string | null
  type: string | null
  life: string | null
  outcome: string | null
  vote: '주인' | '손님' | null
  reason: string
  updatedAt?: string
}

export interface Board {
  code: string
  title: string
  createdAt: string
  players: PlayerRecord[]
}

/** 선생님이 만든 방 (이 브라우저에만 기억) */
export interface MyRoom {
  code: string
  title: string
  key: string
}

const MY_ROOMS = 'neo-gaia-my-rooms'

/** 토론방 만들기 */
export async function createRoom(title: string): Promise<MyRoom> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('방을 만들지 못했어요')
  const room = (await res.json()) as MyRoom
  rememberRoom(room)
  return room
}

/** 방 번호로 방 찾기 (없으면 null) */
export async function findRoom(code: string): Promise<{ code: string; title: string } | null> {
  try {
    const res = await fetch(`/api/rooms/${code}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** 학생 기록 저장 (실패해도 게임은 계속됨) */
export async function saveRecord(room: RoomSession, record: PlayerRecord): Promise<boolean> {
  try {
    const res = await fetch(`/api/rooms/${room.code}/players/${room.playerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
    return res.ok
  } catch {
    return false
  }
}

/** 선생님 상황판 데이터 */
export async function loadBoard(code: string, key: string): Promise<Board | null> {
  try {
    const res = await fetch(`/api/rooms/${code}?key=${encodeURIComponent(key)}`)
    if (!res.ok) return null
    const data = await res.json()
    // 열쇠가 틀리면 players 가 안 옴
    return data.players ? (data as Board) : null
  } catch {
    return null
  }
}

/** 이 방에서 쓸 내 학생 번호 (같은 방에 다시 들어오면 같은 번호) */
export function playerIdFor(code: string): string {
  const keyName = `neo-gaia-player-${code}`
  try {
    const saved = localStorage.getItem(keyName)
    if (saved) return saved
  } catch {
    // 저장소를 못 쓰면 매번 새 번호
  }
  let id = ''
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)]
  try {
    localStorage.setItem(keyName, id)
  } catch {
    // 무시
  }
  return id
}

/** 선생님이 만든 방 목록 */
export function myRooms(): MyRoom[] {
  try {
    return JSON.parse(localStorage.getItem(MY_ROOMS) ?? '[]')
  } catch {
    return []
  }
}

function rememberRoom(room: MyRoom) {
  const list = [room, ...myRooms().filter((r) => r.code !== room.code)].slice(0, 10)
  try {
    localStorage.setItem(MY_ROOMS, JSON.stringify(list))
  } catch {
    // 무시
  }
}
