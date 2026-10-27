// 수업 토론방 서버 (Netlify Functions + Netlify Blobs 저장소)
//
// POST /api/rooms                         토론방 만들기 → { code, key }
// GET  /api/rooms/:code                   방이 있는지 확인 (학생용) → { code, title }
// GET  /api/rooms/:code?key=선생님열쇠      상황판 데이터 (선생님용) → { code, title, players }
// PUT  /api/rooms/:code/players/:id       학생 한 명의 진행 기록 저장
//
// 저장 방식: 방 정보는 rooms/123456, 학생 기록은 rooms/123456/p/학생id 에 따로 저장
// (학생마다 자기 칸에만 쓰니까 여러 명이 동시에 저장해도 서로 덮어쓰지 않음)

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

const ENDINGS = ['coexist', 'cracked', 'collapse_earth', 'collapse_human', 'collapse_economy', 'gaia']

// 학생이 보낸 기록에서 필요한 칸만 골라 깨끗하게 만들기
function cleanPlayer(body) {
  const decisions = []
  if (Array.isArray(body.decisions)) {
    for (const d of body.decisions.slice(0, 20)) {
      if (d && typeof d.c === 'string' && typeof d.a === 'boolean') decisions.push({ c: cut(d.c, 30), a: d.a })
    }
  }
  return {
    name: cut(body.name, 12) || '이름 없음',
    decisions,
    ending: ENDINGS.includes(body.ending) ? body.ending : null,
    grade: cut(body.grade, 2) || null,
    type: cut(body.type, 20) || null,
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
    return reply({ code: room.code, title: room.title, key: room.key }, 201)
  }

  // 방 번호는 숫자 6자리만 허용
  if (!/^\d{6}$/.test(code ?? '')) return reply({ error: '방 번호가 이상해요' }, 400)
  const room = await store.get(`rooms/${code}`, { type: 'json' })
  if (!room) return reply({ error: '없는 방이에요' }, 404)

  // 2) 학생 기록 저장
  if (req.method === 'PUT' && id) {
    if (!/^[a-z0-9]{8,24}$/.test(id)) return reply({ error: '학생 번호가 이상해요' }, 400)
    const body = await req.json().catch(() => null)
    if (!body) return reply({ error: '보낸 내용이 없어요' }, 400)
    await store.setJSON(`rooms/${code}/p/${id}`, cleanPlayer(body))
    return reply({ ok: true })
  }

  // 3) 방 확인 / 상황판
  if (req.method === 'GET') {
    // 열쇠가 없으면 방 이름만 알려 줌 (학생이 입장할 때)
    if (url.searchParams.get('key') !== room.key) return reply({ code: room.code, title: room.title })

    // 선생님: 학생 기록을 전부 모아서 보냄
    const { blobs } = await store.list({ prefix: `rooms/${code}/p/` })
    const players = []
    for (const blob of blobs) {
      const player = await store.get(blob.key, { type: 'json' })
      if (player) players.push({ id: blob.key.split('/').pop(), ...player })
    }
    return reply({ code: room.code, title: room.title, createdAt: room.createdAt, players })
  }

  return reply({ error: '지원하지 않는 요청이에요' }, 405)
}

export const config = {
  path: ['/api/rooms', '/api/rooms/:code', '/api/rooms/:code/players/:id'],
}
