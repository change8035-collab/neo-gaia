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
const PARAMS = new URLSearchParams(location.search)
const RUIN = import.meta.env.DEV && PARAMS.has('ruin')
const JUMP_RAW = RUIN ? PARAMS.get('ruin') : null
const JUMP = (JUMP_RAW === 'album' ? 'rebirth' : (JUMP_RAW as Screen)) || null

function ruinedGame(): GameState {
  return {
    ...newGame(),
    stats: { earth: 14, human: 24, economy: JUMP ? 0 : 22 },
    trust: { nature: 40, citizen: 20, industry: 50 },
    flags: ['fossil_free', 'factory_run', 'river_dead', 'forest_dev', 'coast_flooded', 'bees_gone', 'deregulate', 'cattle_keep'],
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(RUIN ? (JUMP ?? 'play') : 'title')
  const [game, setGame] = useState<GameState>(() => (RUIN ? ruinedGame() : newGame()))
  const [life, setLife] = useState<LifeResult | null>(() => {
    if (!JUMP) return null
    // 개발할 때 &life=penguin 처럼 생명체를 고를 수 있음
    const pick = LIVES.filter((l) => l.id === PARAMS.get('life'))
    return rebirth(ruinedGame(), pick.length ? pick : LIVES, Math.random)
  })
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
        <PlayScreen key={round} game={game} onChange={setGame} onEnd={() => setScreen('ending')} />
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
