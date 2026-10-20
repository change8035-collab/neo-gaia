// 환생 캡슐 뽑기 기계 (SVG)
// 통 안 캡슐은 간단한 물리(중력 + 서로 부딪힘 + 통 벽)로 움직임
// - 가만히 있을 땐 바닥부터 수북이 쌓여 멈춰 있음
// - 손잡이를 돌리면 바닥의 회전판이 휘저어 캡슐이 구르고 섞임
// - 맨 아래 캡슐 하나가 구멍으로 빠지고, 나머지는 빈자리로 굴러 내려와 다시 쌓임

import { useEffect, useRef } from 'react'
import { sfx } from '../game/sound.ts'

const INK = '#1f1c18'
const CX = 160
const CY = 160
const GLOBE_R = 104
const CAP_R = 16
const LIMIT = GLOBE_R - CAP_R - 3
const COUNT = 17
const GRAVITY = 0.32
const COLORS = ['#c43a2f', '#2a5bb5', '#f7e07c', '#6e6557', '#ded5c2', '#a6f3b6', '#9a6a44']
const HOLE_X = CX
const TURN_MS = 1400

export type GachaPhase = 'ready' | 'turning' | 'dropped' | 'opening' | 'opened'

interface Body {
  x: number
  y: number
  px: number
  py: number
  a: number
  color: string
  falling: boolean
  gone: boolean
}

interface Props {
  phase: GachaPhase
  /** 뽑힐 캡슐 색 */
  color: string
  onTurn: () => void
  onTake: () => void
}

/** 무작위 위치에서 떨어뜨려 미리 쌓아 둠 → 처음부터 바닥에 수북이 */
function makePile(): Body[] {
  let seed = 7
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const bodies: Body[] = Array.from({ length: COUNT }, (_, i) => {
    const x = CX - 64 + (i % 5) * 32 + rand() * 6
    const y = CY - 70 + Math.floor(i / 5) * 30
    return { x, y, px: x, py: y, a: rand() * Math.PI * 2, color: COLORS[i % COLORS.length], falling: false, gone: false }
  })
  for (let i = 0; i < 700; i++) step(bodies)
  for (const b of bodies) {
    b.px = b.x
    b.py = b.y
  }
  return bodies
}

/** 한 프레임 물리 계산 */
function step(bodies: Body[]) {
  for (const b of bodies) {
    if (b.gone) continue
    const vx = (b.x - b.px) * 0.985
    const vy = (b.y - b.py) * 0.985
    b.px = b.x
    b.py = b.y
    b.x += vx
    b.y += vy + GRAVITY
    b.a += vx / CAP_R // 굴러간 만큼 돌아감
  }
  for (let iter = 0; iter < 6; iter++) {
    for (let i = 0; i < bodies.length; i++) {
      const p = bodies[i]
      if (p.gone || p.falling) continue
      for (let j = i + 1; j < bodies.length; j++) {
        const q = bodies[j]
        if (q.gone || q.falling) continue
        const dx = q.x - p.x
        const dy = q.y - p.y
        const d2 = dx * dx + dy * dy
        const min = CAP_R * 2
        if (d2 > 0 && d2 < min * min) {
          const d = Math.sqrt(d2)
          const push = (min - d) / 2
          const nx = dx / d
          const ny = dy / d
          p.x -= nx * push
          p.y -= ny * push
          q.x += nx * push
          q.y += ny * push
        }
      }
    }
    for (const b of bodies) {
      if (b.gone || b.falling) continue
      const dx = b.x - CX
      const dy = b.y - CY
      const d = Math.hypot(dx, dy)
      if (d > LIMIT) {
        b.x = CX + (dx / d) * LIMIT
        b.y = CY + (dy / d) * LIMIT
      }
    }
  }
  for (const b of bodies) if (b.falling && b.y > CY + GLOBE_R + CAP_R * 2) b.gone = true
}

function energy(bodies: Body[]) {
  return bodies.reduce((s, b) => (b.gone ? s : s + (b.x - b.px) ** 2 + (b.y - b.py) ** 2), 0)
}

function Capsule({ color, r = CAP_R }: { color: string; r?: number }) {
  return (
    <>
      <circle r={r} fill="#fffaf0" stroke={INK} strokeWidth="2.4" />
      <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`} fill={color} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <ellipse cx={-r * 0.38} cy={-r * 0.5} rx={r * 0.26} ry={r * 0.14} fill="#fff" opacity="0.65" />
    </>
  )
}

export default function GachaMachine({ phase, color, onTurn, onTake }: Props) {
  // 처음 한 번만 더미를 쌓아 둠
  const pile = useRef<Body[] | null>(null)
  if (!pile.current) pile.current = makePile()
  const bodies = pile as { current: Body[] }
  const nodes = useRef<(SVGGElement | null)[]>([])
  const raf = useRef(0)

  const draw = () => {
    bodies.current.forEach((b, i) => {
      const el = nodes.current[i]
      if (!el) return
      el.setAttribute('transform', `translate(${b.x.toFixed(2)} ${b.y.toFixed(2)}) rotate(${((b.a * 180) / Math.PI).toFixed(1)})`)
      el.style.display = b.gone ? 'none' : ''
    })
  }

  // 움직임이 다 멈출 때까지만 계산 (멈추면 쉼)
  const run = () => {
    cancelAnimationFrame(raf.current)
    let calm = 0
    const tick = () => {
      step(bodies.current)
      draw()
      calm = energy(bodies.current) < 0.02 ? calm + 1 : 0
      if (calm < 30) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    draw()
    return () => cancelAnimationFrame(raf.current)
  }, [])

  // 손잡이를 돌리는 동안: 딸깍 네 번마다 바닥을 휘젓고, 세 번째쯤 맨 아래 캡슐이 구멍으로
  useEffect(() => {
    if (phase !== 'turning') return
    const timers: number[] = []
    const stir = (power: number) => {
      sfx.click()
      for (const b of bodies.current) {
        if (b.gone || b.falling) continue
        const depth = (b.y - CY) / GLOBE_R // 바닥 쪽일수록 세게
        if (depth < -0.2) continue
        b.px = b.x - (Math.random() - 0.5) * power * 1.6
        b.py = b.y + power * (0.6 + depth) * (0.7 + Math.random() * 0.6)
      }
      run()
    }
    ;[0, 0.27, 0.54, 0.81].forEach((t, i) => timers.push(window.setTimeout(() => stir(7 - i), t * TURN_MS)))
    timers.push(
      window.setTimeout(() => {
        // 구멍(가운데 아래)에 가장 가까운 캡슐이 빠짐
        const alive = bodies.current.filter((b) => !b.gone && !b.falling)
        const pick = alive.reduce((best, b) =>
          Math.hypot(b.x - HOLE_X, b.y - (CY + LIMIT)) < Math.hypot(best.x - HOLE_X, best.y - (CY + LIMIT)) ? b : best,
        )
        pick.color = color
        pick.falling = true
        pick.px = pick.x
        pick.py = pick.y - 1
        const i = bodies.current.indexOf(pick)
        const el = nodes.current[i]
        el?.querySelector('path')?.setAttribute('fill', color)
        run()
      }, 0.72 * TURN_MS),
    )
    return () => timers.forEach(clearTimeout)
  }, [phase, color])

  const turning = phase === 'turning'
  const canTurn = phase === 'ready'
  const inTray = phase === 'dropped'

  return (
    <svg className={`gacha-svg gacha-svg--${phase}`} viewBox="0 0 320 470" role="img" aria-label="환생 캡슐 뽑기 기계">
      <defs>
        <clipPath id="globe-clip">
          <circle cx={CX} cy={CY} r={GLOBE_R - 2} />
        </clipPath>
        <radialGradient id="glass" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ded5c2" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* 뚜껑 */}
      <rect x="112" y="38" width="96" height="22" rx="8" fill="#c43a2f" stroke={INK} strokeWidth="4" />
      <circle cx={CX} cy="34" r="8" fill="#c43a2f" stroke={INK} strokeWidth="3.5" />

      {/* 투명한 통 + 캡슐 더미 */}
      <circle cx={CX} cy={CY} r={GLOBE_R} fill="url(#glass)" />
      <ellipse cx={HOLE_X} cy={CY + GLOBE_R - 6} rx="22" ry="7" fill={INK} opacity="0.75" />
      <g clipPath="url(#globe-clip)">
        {bodies.current.map((b, i) => (
          <g key={i} ref={(el) => void (nodes.current[i] = el)}>
            <Capsule color={b.color} />
          </g>
        ))}
      </g>
      <path d={`M${CX - 70} ${CY - 66} A ${GLOBE_R - 14} ${GLOBE_R - 14} 0 0 1 ${CX + 10} ${CY - 92}`} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      <circle cx={CX} cy={CY} r={GLOBE_R} fill="none" stroke={INK} strokeWidth="5" />

      {/* 목 부분 */}
      <rect x="92" y="256" width="136" height="20" rx="5" fill="#c43a2f" stroke={INK} strokeWidth="4" />

      {/* 몸통 */}
      <rect x="58" y="272" width="204" height="168" rx="18" fill="#c43a2f" stroke={INK} strokeWidth="4" />
      <rect x="92" y="284" width="136" height="24" rx="5" fill="#f6f0e1" stroke={INK} strokeWidth="3" />
      <text x={CX} y="301" textAnchor="middle" fontSize="14" fill={INK} className="gacha-svg__label">
        환생 캡슐 · 1회 100원
      </text>

      {/* 손잡이 */}
      <g
        className={`gacha-svg__knob ${canTurn ? 'is-ready' : ''}`}
        role="button"
        tabIndex={canTurn ? 0 : -1}
        aria-label="손잡이 돌리기"
        onClick={() => canTurn && onTurn()}
        onKeyDown={(e) => canTurn && (e.key === 'Enter' || e.key === ' ') && onTurn()}
      >
        <circle cx="120" cy="356" r="38" fill="#ded5c2" stroke={INK} strokeWidth="4" />
        <g transform="translate(120 356)">
          <g className={turning ? 'knob-turn' : ''}>
            <circle r="29" fill="#fffaf0" stroke={INK} strokeWidth="3" />
            <rect x="-27" y="-8" width="54" height="16" rx="7" fill="#c43a2f" stroke={INK} strokeWidth="3" />
            <circle r="5" fill={INK} />
          </g>
        </g>
        {canTurn && <circle cx="120" cy="356" r="45" fill="none" stroke="#f7e07c" strokeWidth="3" strokeDasharray="7 6" />}
      </g>

      {/* 동전 투입구 */}
      <rect x="182" y="328" width="50" height="56" rx="6" fill="#ded5c2" stroke={INK} strokeWidth="3" />
      <rect x="203" y="336" width="8" height="30" rx="2" fill={INK} />
      <text x="207" y="379" textAnchor="middle" fontSize="11" fill={INK} className="gacha-svg__label">
        100원
      </text>

      {/* 배출구: 덮개 뒤로 캡슐이 떨어짐 */}
      <rect x="112" y="396" width="96" height="38" rx="9" fill="#14201a" stroke={INK} strokeWidth="4" />
      {inTray && (
        <g
          className="gacha-svg__tray"
          role="button"
          tabIndex={0}
          aria-label="캡슐 꺼내기"
          onClick={onTake}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onTake()}
        >
          <g transform="translate(160 418)">
            <g className="tray-drop">
              <Capsule color={color} r={15} />
            </g>
          </g>
          <circle cx="160" cy="418" r="24" fill="none" stroke="#f7e07c" strokeWidth="3" strokeDasharray="7 6" />
        </g>
      )}
      <rect x="116" y="398" width="88" height="20" rx="4" fill="#ffffff" opacity="0.16" stroke={INK} strokeWidth="2" pointerEvents="none" />

      {/* 받침 */}
      <rect x="48" y="438" width="224" height="16" rx="6" fill={INK} />
    </svg>
  )
}
