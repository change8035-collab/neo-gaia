import { useRef, useState } from 'react'
import Monitor from '../components/Monitor.tsx'
import MuteButton from '../components/MuteButton.tsx'
import Stage from '../components/Stage.tsx'
import StampFlight, { makeFlight, reducedMotion } from '../components/StampFlight.tsx'
import type { Flight } from '../components/StampFlight.tsx'
import { LIVES } from '../data/lives.ts'
import { loadCollection } from '../game/collection.ts'
import { CONSULTS, ENDING_IDS, TERM_YEARS, newGame } from '../game/engine.ts'
import { sfx } from '../game/sound.ts'

const NAME_KEY = 'neo-gaia-name'

function savedName() {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function TitleScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState(savedName)
  const [sealed, setSealed] = useState(false)
  const [flight, setFlight] = useState<Flight | null>(null)
  const stampRef = useRef<HTMLButtonElement>(null)
  const seen = loadCollection()
  const finalName = name.trim() || '이름 없는 관리자'

  const seal = () => {
    try {
      localStorage.setItem(NAME_KEY, name.trim())
    } catch {
      // 저장 실패는 무시
    }
    sfx.stamp()
    setSealed(true)
  }

  const accept = () => {
    if (sealed || flight) return
    const target = document.querySelector('.doc--appoint .doc__result')
    if (!stampRef.current || !target || reducedMotion()) {
      seal()
      window.setTimeout(() => onStart(finalName), 900)
      return
    }
    setFlight(makeFlight(stampRef.current, target, 'approve', '수락'))
  }

  return (
    <Stage>
    <main className={`screen desk title-desk ${sealed ? 'shake' : ''}`}>
      <div className="title-desk__monitor">
        <Monitor
          game={newGame()}
          overlay={{ title: 'NEO GAIA', desc: '기후관리 시스템 · 관리자 임명 대기 중' }}
          ticker="인류는 지구를 되살리기 위해 모든 권한을 한 존재에게 넘기기로 했습니다"
        />
      </div>

      <div className="desk__bottom">
        <section className="desk__left">
          <div className="notes">
            <p className="sticky sticky--0">
              <b>① 민원 처리</b>
              펭귄, 노동자, 꿀벌, 기업이 민원을 넣어요. 도장으로 승인 / 반려!
            </p>
            <p className="sticky sticky--1">
              <b>② 계기판 지키기</b>
              지구·인간·경제 중 하나라도 0이 되면 끝. 창밖 풍경도 바뀌어요.
            </p>
            <p className="sticky sticky--2">
              <b>③ 그다음엔…</b>
              {TERM_YEARS}년 임기가 끝나면 내가 만든 지구에서 다시 태어나요. 분석서는 {CONSULTS}장뿐!
            </p>
          </div>
          {seen.endings.length > 0 && (
            <p className="title-desk__record px">
              엔딩 {seen.endings.length}/{ENDING_IDS.length} · 삶 {seen.lives.length}/{LIVES.length}
            </p>
          )}
        </section>

        <section className="desk__center">
          <article className="doc doc--appoint">
            <header className="doc__head">
              <span>인류 공동 결정 제1호</span>
              <span>NEO GAIA</span>
            </header>
            <h1 className="doc__title appoint__title">임 명 장</h1>
            <label className="appoint__name">
              <span>성명</span>
              <input
                value={name}
                maxLength={10}
                placeholder="여기에 이름을 적으세요"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && accept()}
                autoFocus
              />
            </label>
            <p className="appoint__text">
              위 사람을 기후관리 시스템 <b>NEO GAIA</b>의
              <br />
              제1대 지구 관리자로 임명합니다.
            </p>
            <dl className="appoint__terms">
              <div>
                <dt>임기</dt>
                <dd>{TERM_YEARS}년</dd>
              </div>
              <div>
                <dt>권한</dt>
                <dd>지구를 되살리는 데 필요한 모든 정치·경제·군사 권한</dd>
              </div>
            </dl>
            <p className="appoint__from">
              인류 일동 <span className="seal">인류</span>
            </p>
            <div className="doc__result">
              <span>관리자 수락</span>
              {sealed && <b className="impression impression--ok">수락</b>}
            </div>
          </article>
        </section>

        <section className="desk__right">
          <div className="stamps stamps--single">
            <button
              ref={stampRef}
              className={`stamp stamp--approve ${flight ? 'stamp--away' : ''}`}
              onClick={accept}
              disabled={sealed || !!flight}
              aria-label="수락"
            >
              <span className="stamp__handle" />
              <span className="stamp__neck" />
              <span className="stamp__face">수락</span>
            </button>
          </div>
          <p className="desk__hint">이름을 적고 도장을 쾅 찍으면 임기가 시작돼요</p>
          <MuteButton />
        </section>
      </div>

      {flight && (
        <StampFlight flight={flight} onPress={seal} onDone={() => window.setTimeout(() => onStart(finalName), 350)} />
      )}

      <footer className="credit">
        원작 김소연, 「가이아의 선택」 (『일인용 캡슐』 수록) · 게임 속 수치와 대사는 실제 예측이 아닌 가상 설정입니다
      </footer>
    </main>
    </Stage>
  )
}
