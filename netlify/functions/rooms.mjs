// 수업 토론방 서버 (Netlify Functions + Netlify Blobs 저장소)
// 반 전체가 하나의 지구를 함께 관리: 민원마다 학생들이 승인/반려 투표 → 많은 쪽으로 결정
//
// POST /api/rooms                          토론방 만들기 → { code, title, key }
// GET  /api/rooms/:code                    방 상태 (학생용) → { code, title, state, count }
// GET  /api/rooms/:code?key=선생님열쇠       위 내용 + 학생 목록 (선생님용) → { ..., players }
// PUT  /api/rooms/:code/state?key=열쇠      선생님 화면이 게임 진행 상태를 저장 (시작, 투표 마감, 다음 민원)
// PUT  /api/rooms/:code/players/:id        학생 한 명의 기록 저장 (이름, 이번 투표, 마지막 주인/손님 답)
//
// 저장 위치: 방 정보 rooms/123456, 진행 상태 rooms/123456/state, 학생 기록 rooms/123456/p/학생id
// (학생마다 자기 칸에만 쓰니까 여러 명이 동시에 투표해도 서로 덮어쓰지 않음)

import { getStore } from '@netlify/blobs'

// 결과를 JSON 으로 돌려주는 작은 도우미
function reply(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

// 무작위 글자 만들기 (선생님 열쇠용)
function randomKey(length) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// 문자열을 정해진 길이로 자르기 (이상한 값이 오면 빈 문자열)
function cut(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// 처음 만든 방의 진행 상태: 학생을 기다리는 중
const LOBBY = { status: 'lobby', round: 0, cardId: null, game: null, endsAt: null, result: null, history: [] }
const STATUSES = ['lobby', 'vote', 'reveal', 'end']

// 학생이 보낸 기록에서 필요한 칸만 골라 깨끗하게 만들기
function cleanPlayer(body) {
  return {
    name: cut(body.name, 12) || '이름 없음',
    // 몇 번째 민원에 투표했는지와 고른 쪽 (yes 승인 / no 반려)
    round: Number.isInteger(body.round) ? body.round : 0,
    pick: body.pick === 'yes' || body.pick === 'no' ? body.pick : null,
    // 게임이 끝난 뒤: 다시 태어난 삶, 주인/손님 답
    life: cut(body.life, 30) || null,
    outcome: cut(body.outcome, 20) || null,
    vote: body.vote === '주인' || body.vote === '손님' ? body.vote : null,
    reason: cut(body.reason, 120),
    updatedAt: new Date().toISOString(),
  }
}

export default async (req, context) => {
  // 같은 방을 여러 명이 바로바로 볼 수 있게 '강한 일관성'으로 엶
  const store = getStore({ name: 'rooms', consistency: 'strong' })
  const { code, id } = context.params
  const url = new URL(req.url)
  const isState = url.pathname.endsWith('/state')

  // 1) 토론방 만들기
  if (req.method === 'POST' && !code) {
    const body = await req.json().catch(() => ({}))
    let newCode = ''
    // 이미 있는 번호와 겹치지 않을 때까지 6자리 번호 뽑기
    for (let tries = 0; tries < 10; tries++) {
      newCode = String(Math.floor(100000 + Math.random() * 900000))
      const exists = await store.get(`rooms/${newCode}`)
      if (!exists) break
    }
    const room = {
      code: newCode,
      title: cut(body.title, 30) || '우리 반 토론방',
      key: randomKey(12),
      createdAt: new Date().toISOString(),
    }
    await store.setJSON(`rooms/${newCode}`, room)
    await store.setJSON(`rooms/${newCode}/state`, LOBBY)
    return reply({ code: room.code, title: room.title, key: room.key }, 201)
  }

  // 방 번호는 숫자 6자리만 허용
  if (!/^\d{6}$/.test(code ?? '')) return reply({ error: '방 번호가 이상해요' }, 400)
  const room = await store.get(`rooms/${code}`, { type: 'json' })
  if (!room) return reply({ error: '없는 방이에요' }, 404)
  const isTeacher = url.searchParams.get('key') === room.key

  // 2) 선생님 화면이 진행 상태 저장
  if (req.method === 'PUT' && isState) {
    if (!isTeacher) return reply({ error: '선생님 열쇠가 필요해요' }, 403)
    const text = await req.text()
    if (text.length > 60000) return reply({ error: '내용이 너무 커요' }, 413)
    const state = JSON.parse(text || 'null')
    if (!state || !STATUSES.includes(state.status)) return reply({ error: '진행 상태가 이상해요' }, 400)
    await store.setJSON(`rooms/${code}/state`, state)
    return reply({ ok: true })
  }

  // 3) 학생 기록 저장
  if (req.method === 'PUT' && id) {
    if (!/^[a-z0-9]{8,24}$/.test(id)) return reply({ error: '학생 번호가 이상해요' }, 400)
    const body = await req.json().catch(() => null)
    if (!body) return reply({ error: '보낸 내용이 없어요' }, 400)
    await store.setJSON(`rooms/${code}/p/${id}`, cleanPlayer(body))
    return reply({ ok: true })
  }

  // 4) 방 상태 보기
  if (req.method === 'GET') {
    const state = (await store.get(`rooms/${code}/state`, { type: 'json' })) ?? LOBBY
    const { blobs } = await store.list({ prefix: `rooms/${code}/p/` })
    const view = { code: room.code, title: room.title, state, count: blobs.length }
    if (!isTeacher) return reply(view)

    // 선생님: 학생 기록을 전부 모아서 같이 보냄
    const players = []
    for (const blob of blobs) {
      const player = await store.get(blob.key, { type: 'json' })
      if (player) players.push({ id: blob.key.split('/').pop(), ...player })
    }
    return reply({ ...view, players })
  }

  return reply({ error: '지원하지 않는 요청이에요' }, 405)
}

export const config = {
  path: ['/api/rooms', '/api/rooms/:code', '/api/rooms/:code/state', '/api/rooms/:code/players/:id'],
}
