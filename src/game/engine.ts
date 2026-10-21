// 게임 규칙 (화면과 상관없는 순수 로직)
// 점수 계산·카드 고르기·엔딩 판정·재탄생은 전부 여기서 처리함

import type {
  Card,
  Cond,
  Decision,
  Ending,
  EndingId,
  Faction,
  GameState,
  Life,
  LifeResult,
  ManagerType,
  Phase,
  Reaction,
  Stats,
  StatKey,
} from './types.ts'
import { FACTIONS, STAT_INFO, STAT_KEYS } from './types.ts'

export const TERM_TURNS = 15 // 결정 15번 = 임기 30년
export const YEARS_PER_TURN = 2
export const TERM_YEARS = TERM_TURNS * YEARS_PER_TURN
export const GAIA_TURN = 13 // 14번째 결정(28년차)에 가이아의 선택 등장
export const GAIA_DANGER = 25 // 후반에 지표가 이 아래로 떨어지면 더 일찍 등장
export const START_STAT = 50
export const STAT_MAX = 100
export const TRUST_STEP = 12 // 부탁을 들어주면 +12, 거절하면 -12
export const TRUST_LOW = 25 // 이 아래로 떨어지면 항의 사건
export const CONSULTS = 3 // 임기 중 '의견 듣기' 횟수

export type Rng = () => number

export function newGame(): GameState {
  return {
    stats: { earth: START_STAT, human: START_STAT, economy: START_STAT },
    trust: { nature: 50, human: 50 },
    consults: CONSULTS,
    flags: [],
    decisions: [],
    used: [],
  }
}

export function phaseOf(turn: number): Phase {
  if (turn < 5) return 1
  if (turn < 10) return 2
  return 3
}

export const PHASE_INFO: Record<Phase, { name: string; desc: string }> = {
  1: { name: '초반 · 단순한 부탁', desc: '지구의 구성원들이 하나둘 찾아옵니다.' },
  2: { name: '중반 · 선택의 후폭풍', desc: '지난 결정의 결과가 돌아오기 시작합니다.' },
  3: { name: '후반 · 가이아의 선택', desc: '쉽게 풀리지 않는 문제가 쌓여 갑니다.' },
}

export function check(cond: Cond | undefined, state: GameState): boolean {
  if (!cond) return true
  if (cond.flags && !cond.flags.every((f) => state.flags.includes(f))) return false
  if (cond.notFlags && cond.notFlags.some((f) => state.flags.includes(f))) return false
  for (const key of STAT_KEYS) {
    const min = cond.min?.[key]
    const max = cond.max?.[key]
    if (min !== undefined && state.stats[key] < min) return false
    if (max !== undefined && state.stats[key] > max) return false
  }
  for (const f of FACTIONS) {
    const max = cond.trustMax?.[f]
    if (max !== undefined && state.trust[f] > max) return false
  }
  return true
}

function pick<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)]
}

/** 다음에 보여 줄 카드 고르기 */
export function nextCard(state: GameState, cards: Card[], rng: Rng): Card {
  const turn = state.decisions.length
  const phase = phaseOf(turn)
  const unused = cards.filter((c) => !state.used.includes(c.id))
  const ok = (c: Card) => check(c.requires, state)

  // 임기 마지막: 권한 회의
  if (turn >= TERM_TURNS) {
    const finale = cards.find((c) => c.kind === 'finale')
    if (finale) return finale
  }

  // 가이아의 선택: 후반에 한 지표가 위험해지면 바로, 아니면 28년차에 등장
  const gaia = unused.find((c) => c.kind === 'gaia')
  const inDanger = Math.min(...STAT_KEYS.map((k) => state.stats[k])) <= GAIA_DANGER
  if (gaia && (turn === GAIA_TURN || (phase === 3 && inDanger))) return gaia

  // 한 무리의 신뢰가 바닥나면 항의 사건이 가장 먼저 끼어듦
  if (phase >= 2) {
    const protests = unused.filter((c) => c.kind === 'protest' && ok(c))
    if (protests.length) return pick(protests, rng)
  }

  // 한 지표가 너무 높아지면 부작용 사건이 끼어듦
  if (phase >= 2) {
    const sideEffects = unused.filter((c) => c.kind === 'sideEffect' && ok(c))
    if (sideEffects.length) return pick(sideEffects, rng)
  }

  // 중반부터는 홀수 차례마다 지난 선택의 후속 사건을 우선
  const followups = unused.filter((c) => c.kind === 'followup' && c.phase <= phase && ok(c))
  const normals = unused.filter((c) => c.kind === 'normal' && c.phase === phase)
  const preferFollowup = phase >= 2 && turn % 2 === 1
  if (followups.length && (preferFollowup || !normals.length)) return pick(followups, rng)
  if (normals.length) return pick(normals, rng)

  const rest = unused.filter((c) => c.kind === 'normal' || (c.kind === 'followup' && ok(c)))
  return pick(rest, rng)
}

/** 카드 본문 + 조건에 맞는 덧붙임 말 */
export function cardLines(card: Card, state: GameState): string[] {
  const extra = (card.extraText ?? []).filter((e) => check(e.if, state)).map((e) => e.text)
  return [card.text, ...extra]
}

const clamp = (n: number) => Math.max(0, Math.min(STAT_MAX, n))

/** 승인/거부했을 때 부탁한 무리의 신뢰 변화 */
export function trustChange(card: Card, approved: boolean): number {
  if (!card.faction) return 0
  const choice = approved ? card.approve : card.reject
  return choice.trust ?? (approved ? TRUST_STEP : -TRUST_STEP)
}

/** '의견 듣기' 한 번 쓰기 */
export function consult(state: GameState): GameState {
  return { ...state, consults: Math.max(0, state.consults - 1) }
}

/** 민심 수치를 말로: 불만 / 보통 / 신뢰 */
export function trustWord(t: number): { label: string; tone: 'low' | 'mid' | 'high' } {
  if (t <= 30) return { label: '불만', tone: 'low' }
  if (t >= 75) return { label: '신뢰', tone: 'high' }
  return { label: '보통', tone: 'mid' }
}

/** 민심에 따라 대표의 첫마디가 달라짐 */
export function speakerMood(card: Card, state: GameState): { label: string; tone: 'low' | 'mid' | 'high'; line?: string } {
  if (!card.faction) return { label: '', tone: 'mid' }
  const word = trustWord(state.trust[card.faction])
  if (word.tone === 'low') {
    const lines: Record<Faction, string> = {
      nature: '솔직히 이번에도 기대는 안 해요.',
      human: '이번에도 우리를 숫자로만 보실 건가요?',
    }
    return { ...word, line: lines[card.faction] }
  }
  if (word.tone === 'high') return { ...word, line: '지난번엔 고마웠어요. 이번에도 믿고 왔어요.' }
  return word
}

export interface ChoiceResult {
  state: GameState
  deltas: Stats
  reactions: Reaction[]
}

/** 승인/거부를 적용한 새 상태 */
export function choose(state: GameState, card: Card, approved: boolean): ChoiceResult {
  const choice = approved ? card.approve : card.reject
  const stats = { ...state.stats }
  for (const key of STAT_KEYS) stats[key] = clamp(stats[key] + (choice.effects[key] ?? 0))
  if (choice.set) for (const key of STAT_KEYS) if (choice.set[key] !== undefined) stats[key] = choice.set[key]!

  const deltas = { earth: 0, human: 0, economy: 0 }
  for (const key of STAT_KEYS) deltas[key] = stats[key] - state.stats[key]

  const trust = { ...state.trust }
  if (card.faction) trust[card.faction] = clamp(trust[card.faction] + trustChange(card, approved))

  const decision: Decision = {
    cardId: card.id,
    policy: card.policy,
    approved,
    flag: choice.flag,
    faction: card.faction,
    effects: choice.effects,
    year: Math.min(state.decisions.length + 1, TERM_TURNS) * YEARS_PER_TURN,
  }

  return {
    state: {
      ...state,
      stats,
      trust,
      flags: choice.flag && !state.flags.includes(choice.flag) ? [...state.flags, choice.flag] : state.flags,
      decisions: [...state.decisions, decision],
      used: [...state.used, card.id],
    },
    deltas,
    reactions: choice.reactions,
  }
}

export function yearsServed(state: GameState): number {
  return Math.min(state.decisions.length, TERM_TURNS) * YEARS_PER_TURN
}

/** 게임이 끝났으면 엔딩 id, 아니면 null */
export function endingId(state: GameState): EndingId | null {
  if (state.flags.includes('gaia')) return 'gaia'
  for (const key of STAT_KEYS) if (state.stats[key] <= 0) return `collapse_${key}`
  if (state.used.includes('finale')) {
    return Math.min(...STAT_KEYS.map((k) => state.stats[k])) >= 40 ? 'coexist' : 'cracked'
  }
  return null
}

function weakest(state: GameState): StatKey {
  return STAT_KEYS.reduce((a, b) => (state.stats[b] < state.stats[a] ? b : a))
}

/** 권한 회의 결과 한 줄 */
export function powerEpilogue(state: GameState): string | null {
  if (state.flags.includes('shared_power'))
    return '당신은 권한을 지구 구성원 대표 회의에 나눠 주었습니다. 이제 펭귄 대표도, 노동자 대표도 한 자리씩 앉아 함께 정합니다.'
  if (state.flags.includes('kept_power'))
    return '당신은 모든 권한을 다음 네오 가이아에게 그대로 넘겼습니다. 다음 관리자도 당신처럼 고민할까요?'
  return null
}

export function getEnding(id: EndingId, state: GameState): Ending {
  const years = yearsServed(state)
  switch (id) {
    case 'gaia':
      return {
        id,
        emoji: '🌑',
        title: '가이아의 선택',
        text: '인류 감축 프로그램이 실행되었습니다. 인류의 90%가 사라졌습니다. 하늘은 맑아졌고, 도시는 조용해졌습니다. 숫자로 보면 완벽한 결과였습니다.',
      }
    case 'collapse_earth':
      return {
        id,
        emoji: '🔥',
        title: '불타는 지구',
        text: `기온이 너무 올라 한여름엔 밖에 나갈 수 없는 날이 이어졌습니다. 지구를 되살리라고 만든 시스템이었지만, 지구가 먼저 버티지 못했습니다. 관리는 ${years}년 만에 멈췄습니다.`,
      }
    case 'collapse_human':
      return {
        id,
        emoji: '🔌',
        title: '전원 차단',
        text: `화가 난 사람들이 네오 가이아의 전원을 내렸습니다. "우리 삶을 계산기에 맡길 수는 없어." 관리는 ${years}년 만에 멈췄습니다.`,
      }
    case 'collapse_economy':
      return {
        id,
        emoji: '🏚️',
        title: '멈춘 세계',
        text: `공장도 가게도 문을 닫았습니다. 환경을 지킬 돈조차 남지 않았습니다. 관리는 ${years}년 만에 멈췄습니다.`,
      }
    case 'coexist':
      return {
        id,
        emoji: '🌱',
        title: '공존의 지구',
        text: `${TERM_YEARS}년 임기가 끝났습니다. 완벽하지는 않지만, 사람과 자연이 함께 버틴 지구가 남았습니다. 아직 남은 문제도 많습니다. 그건 다음 세대가 함께 풀어야 합니다.`,
      }
    case 'cracked': {
      const w = STAT_INFO[weakest(state)]
      return {
        id,
        emoji: '🩹',
        title: '금이 간 지구',
        text: `${TERM_YEARS}년을 버텼습니다. 하지만 ${w.emoji} ${w.label} 지표가 위태로운 채로 다음 세대에게 넘겨졌습니다.`,
      }
    }
  }
}

/** 임기 보고서의 종합 판정 도장 */
export function grade(state: GameState): { mark: string; note: string } {
  const id = endingId(state)
  const min = Math.min(...STAT_KEYS.map((k) => state.stats[k]))
  if (id === 'gaia') return { mark: '?', note: '숫자로는 A+' }
  if (id && id.startsWith('collapse')) return { mark: 'F', note: '관리 중단' }
  if (id === 'cracked') return min >= 30 ? { mark: 'C', note: '겨우 버팀' } : { mark: 'D', note: '위태로운 지구' }
  if (min >= 55) return { mark: 'S', note: '모두가 함께 살아남음' }
  if (min >= 47) return { mark: 'A', note: '공존에 가까움' }
  return { mark: 'B', note: '공존, 하지만 아슬아슬' }
}

export const ENDING_IDS: EndingId[] = ['coexist', 'cracked', 'collapse_earth', 'collapse_human', 'collapse_economy', 'gaia']

/** 선택 기록으로 정하는 관리 성향 */
export function managerType(state: GameState): ManagerType {
  if (state.flags.includes('gaia')) {
    return { emoji: '🤖', name: '냉정한 계산형', desc: '숫자로는 가장 완벽한 답을 골랐습니다.' }
  }
  const sum: Stats = { earth: 0, human: 0, economy: 0 }
  for (const d of state.decisions) for (const key of STAT_KEYS) sum[key] += d.effects[key] ?? 0
  const values = STAT_KEYS.map((k) => sum[k])
  if (Math.max(...values) - Math.min(...values) <= 24) {
    return { emoji: '⚖️', name: '조화 추구형', desc: '어느 한쪽도 크게 버리지 않으려 했습니다.' }
  }
  const top = STAT_KEYS.reduce((a, b) => (sum[b] > sum[a] ? b : a))
  if (top === 'earth') return { emoji: '🌳', name: '숲의 수호자형', desc: '자연의 부탁을 가장 많이 들어줬습니다.' }
  if (top === 'human') return { emoji: '🫂', name: '사람 먼저형', desc: '사람들의 삶을 가장 먼저 챙겼습니다.' }
  return { emoji: '📈', name: '성장 엔진형', desc: '경제가 멈추지 않게 하는 데 집중했습니다.' }
}

/** 승인한 정책 중 영향이 컸던 것 */
export function keyPolicies(state: GameState, limit = 4): Decision[] {
  const size = (d: Decision) => STAT_KEYS.reduce((s, k) => s + Math.abs(d.effects[k] ?? 0), 0)
  return state.decisions
    .filter((d) => d.approved && d.cardId !== 'gaia')
    .sort((a, b) => size(b) - size(a))
    .slice(0, limit)
}

/** 임기가 끝난 뒤 구성원들의 한마디 */
export function memberVoices(state: GameState): Reaction[] {
  const { earth, human, economy } = state.stats
  if (state.flags.includes('gaia')) {
    return [
      { emoji: '🐧', name: '펭귄', text: '얼음은 다시 늘겠죠. 그런데 우리는 이런 걸 부탁한 적 없어요.' },
      { emoji: '👥', name: '지역 주민', text: '(대답할 사람이 거의 남지 않았습니다.)' },
      { emoji: '🦌', name: '사슴', text: '숲은 넓어졌어요. 이상하게 조용하지만요.' },
    ]
  }
  const level = (n: number) => (n >= 60 ? 2 : n >= 35 ? 1 : 0)
  const penguin = [
    '솔직히 말하면… 우리는 점점 갈 곳이 없어요.',
    '우리를 지키려고 애쓴 건 알아요. 그래도 아직 바뀌어야 할 게 많아요.',
    '얼음이 다시 늘고 있어요. 들어 줘서 고마워요.',
  ]
  const people = [
    '당신의 계산 속에 우리 자리는 있었나요?',
    '우리 삶을 생각해 준 건 알지만, 모두가 만족하진 못했어요.',
    '살기 좋아졌어요. 우리 이야기를 들어 줘서 고마워요.',
  ]
  const shop = [
    '가게 문을 닫은 지 오래예요.',
    '빠듯하지만 버티고는 있어요.',
    '장사는 잘돼요. 근데 이게 언제까지 갈지는 모르겠어요.',
  ]
  return [
    { emoji: '🐧', name: '펭귄', text: penguin[level(earth)] },
    { emoji: '👥', name: '지역 주민', text: people[level(human)] },
    { emoji: '🏪', name: '동네 가게 사장님', text: shop[level(economy)] },
  ]
}

/** 내가 만든 지구에서 무작위 구성원으로 다시 태어나기 */
export function rebirth(state: GameState, lives: Life[], rng: Rng, excludeId?: string): LifeResult {
  const pool = lives.filter((l) => l.id !== excludeId)
  const life = pick(pool.length ? pool : lives, rng)
  const usedFlags = new Set<string>()

  const scenes = life.scenes.map((scene) => {
    const variant = scene.variants.find((v) => check(v.if, state)) ?? scene.variants[scene.variants.length - 1]
    variant.if?.flags?.forEach((f) => usedFlags.add(f))
    return { title: scene.title, text: variant.text, score: variant.score }
  })

  const total = scenes.reduce((s, sc) => s + sc.score, 0)
  const outcome =
    total >= 2
      ? { emoji: '🌤️', label: '살 만한 삶' }
      : total <= -2
        ? { emoji: '🌧️', label: '힘겨운 삶' }
        : { emoji: '⛅', label: '버텨 낸 삶' }

  const causes = state.decisions.filter((d) => d.flag && usedFlags.has(d.flag))

  return {
    life,
    intro: state.flags.includes('gaia') ? life.introGaia : life.intro,
    scenes,
    total,
    outcome,
    causes,
  }
}
