// 지구·인간·경제 계기판: 바늘이 흔들리며 움직임

import { STAT_INFO, STAT_KEYS } from '../game/types.ts'
import type { Stats } from '../game/types.ts'

interface Props {
  stats: Stats
  deltas?: Stats | null
  /** 도장에 마우스를 올렸을 때 바뀔 지표 (크기만 보여 줌) */
  preview?: Partial<Stats> | null
  compact?: boolean
}

function Dial({ value }: { value: number }) {
  const angle = -90 + (value / 100) * 180
  return (
    <svg viewBox="0 0 120 72" className="dial" aria-hidden>
      <path d="M12 64 A48 48 0 0 1 108 64" fill="none" stroke="#efe6cf" strokeWidth="12" />
      <path d="M12 64 A48 48 0 0 1 25.9 30.1" fill="none" stroke="#e0533f" strokeWidth="12" />
      <path d="M94.1 30.1 A48 48 0 0 1 108 64" fill="none" stroke="#e6c34a" strokeWidth="12" opacity="0.5" />
      {Array.from({ length: 11 }).map((_, i) => {
        const a = ((-180 + i * 18) * Math.PI) / 180
        return (
          <line
            key={i}
            x1={60 + Math.cos(a) * 40}
            y1={64 + Math.sin(a) * 40}
            x2={60 + Math.cos(a) * (i % 5 === 0 ? 33 : 36)}
            y2={64 + Math.sin(a) * (i % 5 === 0 ? 33 : 36)}
            stroke="#1d1b18"
            strokeWidth={i % 5 === 0 ? 2.2 : 1.2}
          />
        )
      })}
      <path d="M12 64 A48 48 0 0 1 108 64" fill="none" stroke="#1d1b18" strokeWidth="2" />
      <g className="needle" style={{ transform: `rotate(${angle}deg)` }}>
        <path d="M58.5 64 L60 22 L61.5 64 Z" fill="#c8322a" stroke="#1d1b18" strokeWidth="1" />
      </g>
      <circle cx="60" cy="64" r="6" fill="#1d1b18" />
    </svg>
  )
}

export default function Gauges({ stats, deltas, preview, compact }: Props) {
  return (
    <div className={`gauges ${compact ? 'gauges--compact' : ''}`}>
      {STAT_KEYS.map((key) => {
        const value = stats[key]
        const d = deltas?.[key] ?? 0
        const p = Math.abs(preview?.[key] ?? 0)
        return (
          <div key={key} className={`gauge ${value <= 25 ? 'gauge--danger' : ''}`}>
            <div className="gauge__face">
              <Dial value={value} />
              {p > 0 && <span className={`gauge__hint ${p > 6 ? 'big' : ''}`}>!</span>}
              {d !== 0 && (
                <span key={`${value}-${d}`} className={`gauge__delta ${d > 0 ? 'up' : 'down'}`}>
                  {d > 0 ? `+${d}` : d}
                </span>
              )}
            </div>
            <div className="gauge__label">
              <span>
                {STAT_INFO[key].emoji} {STAT_INFO[key].label}
              </span>
              <b className="lcd">{String(value).padStart(3, '0')}</b>
            </div>
          </div>
        )
      })}
    </div>
  )
}
