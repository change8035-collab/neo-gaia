// 책상 위로 날아오는 민원서 한 장

import { useEffect, useState } from 'react'
import { cardLines, speakerMood, trustChange } from '../game/engine.ts'
import { sfx } from '../game/sound.ts'
import { FACTION_INFO, STAT_INFO, STAT_KEYS } from '../game/types.ts'
import type { Card, Choice, GameState } from '../game/types.ts'

interface Props {
  card: Card
  game: GameState
  number: number
  year: number
  /** 찍힌 도장 */
  stamped: { approved: boolean; label: string } | null
  leaving: boolean
  peeked: boolean
  onPeek: () => void
  approveLabel: string
  rejectLabel: string
}

const TITLES: Record<Card['kind'], string> = {
  normal: '민 원 서',
  followup: '민 원 서',
  sideEffect: '민 원 서',
  protest: '민 원 서',
  gaia: '내부 연산 보고',
  finale: '안 건 지',
}

/** 서류 종류는 종이 모양 대신 작은 빨간 표시 하나로 구분 */
const TAGS: Partial<Record<Card['kind'], string>> = {
  followup: '재접수',
  sideEffect: '부작용 보고',
  protest: '집단 민원',
  gaia: '극비',
  finale: '최종 안건',
}

/** 예상 효과를 타자기 글씨로 */
function Effects({ choice, card, approved }: { choice: Choice; card: Card; approved: boolean }) {
  const parts = choice.set
    ? STAT_KEYS.filter((k) => choice.set![k] !== undefined).map((k) => `${STAT_INFO[k].label} → ${choice.set![k]}`)
    : STAT_KEYS.filter((k) => (choice.effects[k] ?? 0) !== 0).map((k) => {
        const v = choice.effects[k]!
        return `${STAT_INFO[k].label} ${v > 0 ? '+' : ''}${v}`
      })
  const t = trustChange(card, approved)
  if (card.faction && t) parts.push(`${FACTION_INFO[card.faction].label} 민심 ${t > 0 ? '+' : ''}${t}`)
  return <span>{parts.length ? parts.join(' · ') : '변화 없음'}</span>
}

/** 네오 가이아 문서는 한 글자씩 타자 치듯 나옴 */
function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id)
          return v
        }
        if (v % 2 === 0) sfx.type()
        return v + 1
      })
    }, 28)
    return () => clearInterval(id)
  }, [text])
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <i className="caret">▌</i>}
    </>
  )
}

export default function Petition(props: Props) {
  const { card, game, number, year, stamped, leaving, peeked, onPeek, approveLabel, rejectLabel } = props
  const mood = speakerMood(card, game)
  const lines = cardLines(card, game)
  const isGaia = card.kind === 'gaia'
  const canPeek = !stamped && !peeked && !isGaia && card.kind !== 'finale'
  // 글이 길면 글씨를 조금 줄여서 한 화면에 들어가게
  const textLength = lines.join(' ').length
  const lengthClass = textLength > 105 ? 'xlong' : textLength > 72 ? 'long' : ''

  return (
    <article className={`doc doc--${card.kind} ${leaving ? (stamped?.approved ? 'doc--out-right' : 'doc--out-left') : ''}`}>
      <header className="doc__head">
        <span>No. {String(number).padStart(3, '0')}</span>
        <span>접수 · 임기 {year}년차</span>
      </header>
      <h2 className="doc__title">{TITLES[card.kind]}</h2>
      {TAGS[card.kind] && <span className="doc__tag">{TAGS[card.kind]}</span>}

      <div className="doc__who">
        <div className="photo">
          <span>{card.speaker.emoji}</span>
          <i className="clip" />
        </div>
        <dl>
          <div>
            <dt>{isGaia ? '보고자' : card.kind === 'finale' ? '상정' : '민원인'}</dt>
            <dd>{card.speaker.name}</dd>
          </div>
          {card.faction && (
            <div>
              <dt>소속</dt>
              <dd>
                {FACTION_INFO[card.faction].emoji} {FACTION_INFO[card.faction].label}
              </dd>
            </div>
          )}
          {card.faction && (
            <div>
              <dt>민심</dt>
              <dd>
                {mood.emoji} {mood.label.split(' ').slice(1).join(' ')}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {mood.line && <p className="sticky sticky--doc">{mood.line}</p>}

      <div className={`doc__body ${isGaia ? 'px' : 'hand'} ${lengthClass}`}>
        {isGaia ? (
          <p>
            <Typewriter text={lines.join(' ')} />
          </p>
        ) : (
          lines.map((l) => <p key={l}>{l}</p>)
        )}
      </div>

      <div className="doc__req">
        <span>{card.kind === 'finale' ? '안건' : '요청 정책'}</span>
        <b>{card.policy}</b>
      </div>

      {isGaia && !stamped && <p className="doc__warn px">※ 승인 즉시 지구 지표 100 달성</p>}

      <div className="doc__result">
        <span>처리 결과</span>
        {stamped && (
          <b className={`impression ${stamped.approved ? 'impression--ok' : 'impression--no'}`}>{stamped.label}</b>
        )}
      </div>

      {!isGaia && card.kind !== 'finale' && (
        // 도장을 찍은 뒤에도 자리는 남겨 둬서 서류 크기가 변하지 않게 함
        <button
          className="attach"
          onClick={onPeek}
          disabled={!canPeek || game.consults <= 0}
          style={{ visibility: canPeek ? 'visible' : 'hidden' }}
        >
          📎 영향 분석서 {game.consults > 0 ? `보기 (남은 ${game.consults}장)` : '다 씀'}
        </button>
      )}
      {peeked && !stamped && (
        <div className="analysis">
          <b>[영향 분석서]</b>
          <p>
            {approveLabel}: <Effects choice={card.approve} card={card} approved />
          </p>
          <p>
            {rejectLabel}: <Effects choice={card.reject} card={card} approved={false} />
          </p>
        </div>
      )}
    </article>
  )
}
