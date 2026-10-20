// 도감: 지금까지 본 엔딩과 살아 본 삶을 이 브라우저에 저장
// 저장이 막힌 환경(시크릿 창 등)에서도 게임은 그대로 돌아가게 try/catch 로 감쌈

const KEY = 'neo-gaia-collection'

export interface Collection {
  endings: string[]
  lives: string[]
}

export function loadCollection(): Collection {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return { endings: data.endings ?? [], lives: data.lives ?? [] }
    }
  } catch {
    // 저장소를 못 쓰면 빈 도감
  }
  return { endings: [], lives: [] }
}

function save(c: Collection) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    // 저장 실패는 무시
  }
}

export function markEnding(id: string) {
  const c = loadCollection()
  if (!c.endings.includes(id)) save({ ...c, endings: [...c.endings, id] })
}

export function markLife(id: string) {
  const c = loadCollection()
  if (!c.lives.includes(id)) save({ ...c, lives: [...c.lives, id] })
}
