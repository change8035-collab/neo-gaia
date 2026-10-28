// 민심 판: 자연·인간 두 무리가 네오 가이아를 얼마나 믿는지

import { trustWord } from '../game/engine.ts'
import { FACTIONS, FACTION_INFO } from '../game/types.ts'
import type { GameState } from '../game/types.ts'

export default function Minsim({ game }: { game: GameState }) {
  return (
    <div className="minsim">
      <b className="minsim__title">민심</b>
      {FACTIONS.map((f) => {
        const t = game.trust[f]
        const word = trustWord(t)
        return (
          <div key={f} className={`minsim__row ${t <= 25 ? 'low' : ''}`}>
            <span className="minsim__who">
              <b>{FACTION_INFO[f].label}</b>
              <small>{FACTION_INFO[f].desc}</small>
            </span>
            <i>
              <s style={{ width: `${t}%` }} />
            </i>
            <em className={`mood mood--${word.tone}`}>{word.label}</em>
          </div>
        )
      })}
    </div>
  )
}
