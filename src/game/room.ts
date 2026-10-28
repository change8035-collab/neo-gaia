// 수업 토론방 서버와 주고받는 함수들 (서버 코드: netlify/functions/rooms.mjs)
// 반 전체가 하나의 지구를 함께 관리: 민원마다 학생들이 투표하고, 많은 쪽으로 결정됨
// 진행은 선생님 화면이 맡음 (시작 → 투표 → 결과 → 다음 민원 → 끝)

import type { GameState, Reaction, Stats } from './types.ts'

/** 학생이 들어가 있는 토론방 */
export interface RoomSession {
  code: string
  title: string
  playerId: string
}

/** lobby 기다리는 중 · vote 투표 중 · reveal 결과 보기 · end 임기 끝 */
export type RoomStatus = 'lobby' | 'vote' | 'reveal' | 'end'

/** 한 민원의 투표 결과 */
export interface RoomResult {
  cardId: string
  approved: boolean
  yes: number
  no: number
  deltas: Stats
  reactions: Reaction[]
}

/** 반 전체가 함께 보는 진행 상태 (선생님 화면만 바꿈) */
export interface RoomState {
  status: RoomStatus
  /** 몇 번째 민원인지 (1부터) */
  round: number
  cardId: string | null
  /** 우리 반이 함께 만든 지구 */
  game: GameState | null
  /** 투표·결과 보기가 끝나는 시각 (밀리초) */
  endsAt: number | null
  result: RoomResult | null
  /** 지금까지의 결재 대장: 민원마다 우리 반 표 수 */
  history: { cardId: string; approved: boolean; yes: number; no: number }[]
}

/** 서버에 저장되는 학생 한 명의 기록 */
export interface PlayerRecord {
  id?: string
  name: string
  /** 몇 번째 민원에 투표했는지와 고른 쪽 */
  round: number
  pick: 'yes' | 'no' | null
  life: string | null
  outcome: string | null
  vote: '주인' | '손님' | null
  reason: string
  updatedAt?: string
}

/** 학생이 받는 방 정보 */
export interface RoomView {
  code: string
  title: string
  state: RoomState
  /** 들어온 학생 수 */
  count: number
}

/** 선생님이 받는 방 정보 (학생 목록 포함) */
export interface Board extends RoomView {
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

/** 방 번호로 방 상태 보기 (없으면 null) */
export async function findRoom(code: string): Promise<RoomView | null> {
  try {
    const res = await fetch(`/api/rooms/${code}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** 학생 기록 저장 (실패하면 false) */
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

/** 선생님: 방 상태 + 학생 목록 */
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

/** 선생님: 진행 상태 저장 */
export async function saveState(code: string, key: string, state: RoomState): Promise<boolean> {
  try {
    const res = await fetch(`/api/rooms/${code}/state?key=${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    return res.ok
  } catch {
    return false
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
