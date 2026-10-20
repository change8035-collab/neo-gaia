// 밸런스 확인용 시뮬레이션: npm run sim
// 여러 플레이 성향으로 수천 판을 돌려서 엔딩·버틴 기간이 어떻게 나오는지 봄

import { CARDS } from '../src/data/cards.ts'
import { LIVES } from '../src/data/lives.ts'
import { choose, endingId, managerType, newGame, nextCard, rebirth, yearsServed } from '../src/game/engine.ts'
import type { Card, GameState } from '../src/game/types.ts'

type Strategy = (state: GameState, card: Card) => boolean

const minAfter = (state: GameState, card: Card, approved: boolean) => {
  const s = choose(state, card, approved).state.stats
  return Math.min(s.earth, s.human, s.economy)
}

const STRATEGIES: Record<string, Strategy> = {
  '무작위': (_s, card) => (card.kind === 'gaia' ? Math.random() < 0.3 : Math.random() < 0.5),
  '전부 승인': (_s, card) => card.kind !== 'gaia',
  '전부 거부': () => false,
  '균형 중시': (s, card) => card.kind !== 'gaia' && minAfter(s, card, true) >= minAfter(s, card, false),
  '환경만': (_s, card) => card.kind !== 'gaia' && (card.approve.effects.earth ?? 0) >= (card.reject.effects.earth ?? 0),
  '경제만': (_s, card) => card.kind !== 'gaia' && (card.approve.effects.economy ?? 0) >= (card.reject.effects.economy ?? 0),
  '사람만': (_s, card) => card.kind !== 'gaia' && (card.approve.effects.human ?? 0) >= (card.reject.effects.human ?? 0),
}

const RUNS = 5000
const count = (map: Record<string, number>, key: string) => (map[key] = (map[key] ?? 0) + 1)
const pct = (n: number) => `${((n / RUNS) * 100).toFixed(0)}%`

const cardSeen: Record<string, number> = {}

for (const [name, strategy] of Object.entries(STRATEGIES)) {
  const endings: Record<string, number> = {}
  const types: Record<string, number> = {}
  const outcomes: Record<string, number> = {}
  let years = 0

  for (let i = 0; i < RUNS; i++) {
    let state = newGame()
    while (!endingId(state)) {
      const card = nextCard(state, CARDS, Math.random)
      count(cardSeen, card.id)
      state = choose(state, card, strategy(state, card)).state
    }
    count(endings, endingId(state)!)
    count(types, managerType(state).name)
    count(outcomes, rebirth(state, LIVES, Math.random).outcome.label)
    years += yearsServed(state)
  }

  const fmt = (m: Record<string, number>) =>
    Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${pct(v)}`)
      .join(' · ')
  console.log(`\n[${name}] 평균 ${(years / RUNS).toFixed(1)}년`)
  console.log('  엔딩:', fmt(endings))
  console.log('  성향:', fmt(types))
  console.log('  삶  :', fmt(outcomes))
}

const total = Object.keys(STRATEGIES).length * RUNS
console.log('\n[카드 등장률 (판당)]')
console.log(
  CARDS.map((c) => `${c.id} ${((cardSeen[c.id] ?? 0) / total).toFixed(2)}`).join(' · '),
)
