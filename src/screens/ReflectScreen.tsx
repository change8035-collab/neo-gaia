import { useState } from 'react'
import { LIVES } from '../data/lives.ts'
import { loadCollection } from '../game/collection.ts'
import { ENDING_IDS, endingId, getEnding, grade, managerType, yearsServed } from '../game/engine.ts'
import type { GameState, LifeResult } from '../game/types.ts'
import Stage from '../components/Stage.tsx'

interface Props {
  game: GameState
  life: LifeResult
  name: string
  onRebornAgain: () => void
  onRestart: () => void
}

export default function ReflectScreen({ game, life, name, onRebornAgain, onRestart }: Props) {
  const [copied, setCopied] = useState(false)
  const type = managerType(game)
  const ending = getEnding(endingId(game) ?? 'cracked', game)
  const g = grade(game)
  const seen = loadCollection()

  const powerLine = game.flags.includes('shared_power')
    ? `권한을 나눠 준 덕분에, ${life.life.name}의 대표도 회의에서 목소리를 낼 수 있었다.`
    : game.flags.includes('kept_power')
      ? `${life.life.name}의 삶은 끝까지 한 존재의 계산 아래 놓여 있었다.`
      : null

  const share = async () => {
    const text = [
      `🌍 NEO GAIA — ${name}의 지구`,
      `관리 ${yearsServed(game)}년 · 판정 ${g.mark} · ${type.emoji} ${type.name}`,
      `결말: ${ending.emoji} ${ending.title}`,
      `다시 태어난 나: ${life.life.emoji} ${life.life.name} (${life.outcome.label})`,
      '당신은 지구의 주인이었을까요?',
      location.href,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      if (navigator.share) await navigator.share({ text }).catch(() => {})
    }
  }

  return (
    <Stage>
    <main className="screen desk reflect-desk">
      <article className="notebook">
        <h2 className="hand notebook__title">{name}의 회고 일기</h2>
        <div className="notebook__cols">
          <section>
            <h3>관리자였던 나</h3>
            {life.causes.length > 0 ? (
              <ul className="cause-list">
                {life.causes.map((d) => (
                  <li key={d.cardId}>
                    <i className={`mini-stamp ${d.approved ? 'ok' : 'no'}`}>{d.approved ? '승인' : '반려'}</i>
                    <span>{d.policy}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hand">이 삶에 직접 닿은 결재는 없었다. 그래도 내가 남긴 지구가 이 삶을 바꿨다.</p>
            )}
          </section>
          <section>
            <h3>
              {life.life.emoji} {life.life.name}(으)로 산 나
            </h3>
            <p className="hand notebook__outcome">
              {life.outcome.emoji} {life.outcome.label}
            </p>
            <ul className="notebook__scenes">
              {life.scenes.map((sc) => (
                <li key={sc.title} className="hand">
                  <b>{sc.score > 0 ? '🙂' : sc.score < 0 ? '😣' : '😐'}</b> {sc.text}
                </li>
              ))}
            </ul>
            {powerLine && <p className="hand">{powerLine}</p>}
          </section>
        </div>
        <p className="hand notebook__quote">
          관리자였을 때는 합리적인 결정이었다.
          <br />
          하지만 그 결정 아래에서 살아가는 존재에게도 같은 선택이 최선이었을까?
        </p>
        <div className="final-q">
          <p>당신은 지구를 관리했습니다.</p>
          <p className="final-q__big">그런데 지구의 주인이었을까요?</p>
        </div>
      </article>

      <aside className="reflect__side">
        <section className="stickerbook">
          <b>환생 도감</b>
          <div className="stickerbook__grid">
            {LIVES.map((l) => {
              const got = seen.lives.includes(l.id)
              return (
                <span key={l.id} className={`sticker ${got ? 'sticker--got' : ''}`} title={got ? l.name : '아직 못 살아 본 삶'}>
                  {got ? l.emoji : '?'}
                </span>
              )
            })}
          </div>
          <b>엔딩 도감</b>
          <div className="stickerbook__grid">
            {ENDING_IDS.map((id) => {
              const got = seen.endings.includes(id)
              const e = getEnding(id, game)
              return (
                <span key={id} className={`sticker sticker--round ${got ? 'sticker--got' : ''}`} title={got ? e.title : '아직 못 본 엔딩'}>
                  {got ? e.emoji : '?'}
                </span>
              )
            })}
          </div>
        </section>

        <div className="actions">
          <button className="btn btn--ink btn--wide" onClick={onRebornAgain}>
            같은 지구에서 한 번 더 태어나기
          </button>
          <button className="btn btn--paper btn--wide" onClick={onRestart}>
            새 임명장 받기
          </button>
          <button className="btn btn--paper btn--wide" onClick={share}>
            {copied ? '결과를 복사했어요' : '결과 복사해서 공유하기'}
          </button>
        </div>
      </aside>
    </main>
    </Stage>
  )
}
