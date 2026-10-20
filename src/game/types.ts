// 게임 전체에서 쓰는 타입 모음
// 카드·삶 데이터(src/data)를 고칠 때 이 모양을 지키면 됨

export type StatKey = 'earth' | 'human' | 'economy'
export type Stats = Record<StatKey, number>

export const STAT_KEYS: StatKey[] = ['earth', 'human', 'economy']

export const STAT_INFO: Record<StatKey, { label: string; emoji: string }> = {
  earth: { label: '지구', emoji: '🌍' },
  human: { label: '인간', emoji: '👥' },
  economy: { label: '경제', emoji: '💰' },
}

/** 대표들이 속한 무리. 부탁을 들어주면 그 무리의 신뢰가 오르고, 거절하면 내려감 */
export type Faction = 'nature' | 'citizen' | 'industry'

export const FACTIONS: Faction[] = ['nature', 'citizen', 'industry']

export const FACTION_INFO: Record<Faction, { label: string; emoji: string }> = {
  nature: { label: '자연', emoji: '🌿' },
  citizen: { label: '시민', emoji: '🙋' },
  industry: { label: '산업', emoji: '🏢' },
}

/** 지구 지도의 지역 */
export type ZoneId = 'antarctic' | 'forest' | 'industrial' | 'coast' | 'farm' | 'city'

/** 등장 조건. 적힌 조건을 모두 만족해야 참 */
export interface Cond {
  /** 이 플래그가 전부 있어야 함 */
  flags?: string[]
  /** 이 플래그가 하나도 없어야 함 */
  notFlags?: string[]
  /** 지표가 이 값 이상이어야 함 */
  min?: Partial<Stats>
  /** 지표가 이 값 이하여야 함 */
  max?: Partial<Stats>
  /** 무리의 신뢰가 이 값 이하여야 함 */
  trustMax?: Partial<Record<Faction, number>>
}

export interface Speaker {
  emoji: string
  name: string
}

export interface Reaction {
  emoji: string
  name: string
  text: string
}

export interface Choice {
  /** 지표 변화량 (+면 오르고 -면 내려감) */
  effects: Partial<Stats>
  /** 지표를 이 값으로 바로 바꿈 (가이아의 선택 전용) */
  set?: Partial<Stats>
  /** 이 선택을 했다는 기록. 후속 사건과 재탄생 이야기가 이걸 보고 달라짐 */
  flag?: string
  /** 부탁한 무리의 신뢰 변화 (안 적으면 승인 +12, 거부 -12) */
  trust?: number
  /** 선택 직후 보여 줄 구성원들의 반응 (1~2개) */
  reactions: Reaction[]
}

export type Phase = 1 | 2 | 3

export type CardKind = 'normal' | 'followup' | 'sideEffect' | 'protest' | 'gaia' | 'finale'

export interface Card {
  id: string
  /** 1: 초반, 2: 중반, 3: 후반 */
  phase: Phase
  kind: CardKind
  /** 이 조건을 만족할 때만 등장 (후속 사건, 부작용 사건) */
  requires?: Cond
  /** 부탁하는 대표가 속한 무리 */
  faction?: Faction
  /** 이 정책이 영향을 주는 지역 (지도에서 반짝임) */
  zone?: ZoneId
  speaker: Speaker
  /** 대표가 하는 말 */
  text: string
  /** 조건에 따라 덧붙는 말 */
  extraText?: { if: Cond; text: string }[]
  /** 승인하면 시행되는 정책 이름 */
  policy: string
  approve: Choice
  reject: Choice
}

export interface Variant {
  if?: Cond
  text: string
  /** 이 장면이 삶에 준 영향 (+면 좋음, -면 힘듦) */
  score: number
}

export interface Scene {
  title: string
  /** 위에서부터 조건을 확인해서 처음 맞는 것 하나를 씀 */
  variants: Variant[]
}

export interface Life {
  id: string
  emoji: string
  name: string
  kind: 'human' | 'animal'
  /** 태어나는 지역 */
  zone: ZoneId
  intro: string
  introGaia: string
  scenes: Scene[]
}

export interface Decision {
  cardId: string
  policy: string
  approved: boolean
  flag?: string
  faction?: Faction
  effects: Partial<Stats>
  /** 이 결정을 내린 임기 연도 */
  year: number
}

export interface GameState {
  stats: Stats
  /** 무리별 신뢰 (0~100) */
  trust: Record<Faction, number>
  /** 남은 '의견 듣기' 횟수 */
  consults: number
  flags: string[]
  decisions: Decision[]
  /** 이미 나온 카드 id */
  used: string[]
}

export type EndingId =
  | 'gaia'
  | 'collapse_earth'
  | 'collapse_human'
  | 'collapse_economy'
  | 'coexist'
  | 'cracked'

export interface Ending {
  id: EndingId
  emoji: string
  title: string
  text: string
}

export interface ManagerType {
  emoji: string
  name: string
  desc: string
}

export interface LifeResult {
  life: Life
  intro: string
  scenes: { title: string; text: string; score: number }[]
  total: number
  outcome: { emoji: string; label: string }
  /** 이 삶에 영향을 준 관리자 시절의 결정 */
  causes: Decision[]
}
