import { useEffect, useState } from 'react'
import { LIVES } from './data/lives.ts'
import { newGame, rebirth } from './game/engine.ts'
import type { GameState, LifeResult } from './game/types.ts'
import TitleScreen from './screens/TitleScreen.tsx'
import PlayScreen from './screens/PlayScreen.tsx'
import EndingScreen from './screens/EndingScreen.tsx'
import RebirthScreen from './screens/RebirthScreen.tsx'
import ReflectScreen from './screens/ReflectScreen.tsx'

// 화면 흐름: 임명장 → 결재 책상 → 임기 보고서 → 환생 캡슐 → 회고 일기
type Screen = 'title' | 'play' | 'ending' | 'rebirth' | 'reflect'

// 개발할 때만: ?ruin 을 붙이면 망가진 지구로 바로 시작 (그림 확인용)
// ?ruin=ending / rebirth / reflect 면 그 화면으로 바로 감
// ?good 이면 잘 지켜진 지구, &card=카드id 면 그 민원서부터 시작
const PARAMS = new URLSearchParams(location.search)
const GOOD = import.meta.env.DEV && PARAMS.has('good')
const RUIN = import.meta.env.DEV && (PARAMS.has('ruin') || GOOD)
const JUMP = (RUIN && (PARAMS.get('ruin') as Screen)) || null
const FIRST_CARD = (import.meta.env.DEV && PARAMS.get('card')) || undefined

function ruinedGame(): GameState {
  if (GOOD)
    return {
      ...newGame(),
      stats: { earth: 78, human: 64, economy: 58 },
      trust: { nature: 80, human: 62 },
      flags: ['fossil_limit', 'factory_limit', 'green_jobs', 'plastic_ban', 'palm_limit', 'green_wall', 'fire_crew', 'ev_cars', 'bees_saved', 'seawall', 'forest_protect', 'flight_ban', 'four_day'],
    }
  return {
    ...newGame(),
    stats: { earth: 14, human: 24, economy: JUMP ? 0 : 22 },
    trust: { nature: 40, human: 20 },
    flags: ['fossil_free', 'factory_run', 'river_dead', 'forest_dev', 'coast_flooded', 'bees_gone', 'deregulate', 'cattle_keep', 'arctic_gas', 'fire_ignored', 'desert_spread', 'refugee_reject', 'palm_keep', 'oil_keep', 'meat_daily'],
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(RUIN ? (JUMP ?? 'play') : 'title')
  const [game, setGame] = useState<GameState>(() => (RUIN ? ruinedGame() : newGame()))
  const [life, setLife] = useState<LifeResult | null>(() => (JUMP ? rebirth(ruinedGame(), LIVES, Math.random) : null))
  const [name, setName] = useState(RUIN ? '테스트' : '')
  // 새 판을 시작할 때 PlayScreen 을 새로 만들기 위한 번호
  const [round, setRound] = useState(0)

  // 화면이 바뀌면 맨 위부터 보이게
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen, life])

  const start = (who: string) => {
    setName(who)
    setGame(newGame())
    setLife(null)
    setRound((r) => r + 1)
    setScreen('play')
  }

  const reborn = () => {
    setLife(rebirth(game, LIVES, Math.random, life?.life.id))
    setScreen('rebirth')
  }

  return (
    <div className={`app app--${screen}`}>
      {screen === 'title' && <TitleScreen onStart={start} />}
      {screen === 'play' && (
        <PlayScreen key={round} game={game} firstCard={FIRST_CARD} onChange={setGame} onEnd={() => setScreen('ending')} />
      )}
      {screen === 'ending' && <EndingScreen game={game} name={name} onRebirth={reborn} />}
      {screen === 'rebirth' && life && <RebirthScreen game={game} life={life} onDone={() => setScreen('reflect')} />}
      {screen === 'reflect' && life && (
        <ReflectScreen
          game={game}
          life={life}
          name={name}
          onRebornAgain={reborn}
          onRestart={() => setScreen('title')}
        />
      )}
    </div>
  )
}
