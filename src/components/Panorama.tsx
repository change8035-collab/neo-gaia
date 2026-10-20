// 창밖으로 보이는 지구 풍경 (직접 그린 SVG)
// 왼쪽부터 남극 → 해안 마을 → 농촌 → 뒷산 숲 → 강변 공업도시 → 도시
// 결정할 때마다 빙하 크기, 바닷물 높이, 공장 연기, 나무 수 등이 바뀜

import { zoneViews } from '../game/zones.ts'
import type { GameState, ZoneId } from '../game/types.ts'

const INK = '#1d1b18'
const W = 1200
const H = 340
const GROUND = 250
/** 위쪽 빈 하늘은 잘라서 풍경이 크게 보이게 */
const TOP = 80

export const ZONE_X: Record<ZoneId, [number, number]> = {
  antarctic: [0, 200],
  coast: [200, 400],
  farm: [400, 600],
  forest: [600, 800],
  industrial: [800, 1000],
  city: [1000, 1200],
}

const ZONE_LABEL: Record<ZoneId, string> = {
  antarctic: '남극',
  coast: '해안 마을',
  farm: '농촌',
  forest: '뒷산 숲',
  industrial: '공업도시',
  city: '도시',
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t
const hsl = (h: number, s: number, l: number, a = 1) => `hsl(${h} ${s}% ${l}% / ${a})`

interface Props {
  game: GameState
  highlight?: ZoneId | 'all' | null
  /** 한 지역만 잘라서 보여 줄 때 (3컷 만화) */
  crop?: ZoneId
  /** 3컷 만화에서 컷마다 조금씩 당겨 찍기 (0, 1, 2) */
  zoom?: number
  /** 도장을 찍은 순간 영향받은 지역을 번쩍이게 */
  flash?: { zone: ZoneId | 'all'; good: boolean; text: string; id: number } | null
  className?: string
}

/* ───────── 작은 그림들 ───────── */

function Penguin({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="bob">
      <ellipse cx="0" cy="-14" rx="9" ry="14" fill="#23262d" stroke={INK} strokeWidth="2" />
      <ellipse cx="1.5" cy="-11" rx="5.5" ry="10" fill="#f6f3ea" />
      <circle cx="2" cy="-22" r="1.6" fill="#fff" />
      <circle cx="2.3" cy="-22" r="0.8" fill={INK} />
      <path d="M8 -20 l6 2 -6 2z" fill="#f2a33a" stroke={INK} strokeWidth="1" />
      <path d="M-4 0 h5 M2 0 h5" stroke="#f2a33a" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  )
}

function House({ x, y, color, dark }: { x: number; y: number; color: string; dark?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-13" y="-22" width="26" height="22" fill={color} stroke={INK} strokeWidth="2" />
      <path d="M-17 -22 L0 -36 L17 -22 Z" fill="#c4553b" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="-5" y="-12" width="10" height="12" fill={dark ? '#3a3a3a' : '#6b4a32'} stroke={INK} strokeWidth="1.5" />
      <rect x="4" y="-19" width="6" height="5" fill={dark ? '#444' : '#ffe17a'} stroke={INK} strokeWidth="1" />
    </g>
  )
}

function Cow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="graze">
      <rect x="-14" y="-16" width="26" height="13" rx="6" fill="#fbf8f1" stroke={INK} strokeWidth="2" />
      <ellipse cx="-4" cy="-11" rx="4" ry="3" fill={INK} />
      <ellipse cx="5" cy="-13" rx="3" ry="2" fill={INK} />
      <rect x="10" y="-20" width="10" height="9" rx="3" fill="#fbf8f1" stroke={INK} strokeWidth="2" />
      <ellipse cx="17" cy="-13" rx="3" ry="2" fill="#f0a3a3" />
      <path d="M-10 -4 v5 M-3 -4 v5 M5 -4 v5 M9 -4 v5" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  )
}

function Pine({ x, y, s = 1, tone = 0 }: { x: number; y: number; s?: number; tone?: number }) {
  const green = hsl(130 + tone * 8, 45, 28 + tone * 4)
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="sway">
      <rect x="-3" y="-8" width="6" height="10" fill="#7a4f2e" stroke={INK} strokeWidth="1.5" />
      <path d="M0 -46 L15 -20 L-15 -20 Z" fill={green} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 -32 L18 -6 L-18 -6 Z" fill={green} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>
    </g>
  )
}

function Deer({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="-14" rx="12" ry="7" fill="#b9784a" stroke={INK} strokeWidth="2" />
      <path d="M9 -18 l5 -10 h6 l-3 9z" fill="#b9784a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 -28 l-3 -8 M17 -28 l3 -8 M13 -33 l-4 -2 M19 -33 l4 -2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M-8 -8 v8 M-3 -8 v8 M4 -8 v8 M8 -8 v8" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  )
}

function Boar({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="-9" rx="13" ry="8" fill="#5b4334" stroke={INK} strokeWidth="2" />
      <ellipse cx="13" cy="-7" rx="4" ry="3.5" fill="#d79b85" stroke={INK} strokeWidth="1.5" />
      <path d="M-7 -2 v3 M6 -2 v3" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function Factory({ x, y, smoke, dark, solar }: { x: number; y: number; smoke: number; dark?: boolean; solar?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="10" y="-62" width="9" height="40" fill={dark ? '#6b6560' : '#9a8f86'} stroke={INK} strokeWidth="2" />
      <path d="M-22 0 V-26 L-11 -36 V-26 L0 -36 V-26 L11 -36 V-26 L22 -36 V0 Z" fill={dark ? '#7d7670' : '#b9aea2'} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="-15" y="-16" width="8" height="8" fill="#ffd56b" stroke={INK} strokeWidth="1.2" />
      <rect x="2" y="-16" width="8" height="8" fill="#ffd56b" stroke={INK} strokeWidth="1.2" />
      {solar && <path d="M-22 -40 l12 -6 h12 l-12 6 z" fill="#3e6fd1" stroke={INK} strokeWidth="1.5" />}
      {Array.from({ length: smoke }).map((_, i) => (
        <circle
          key={i}
          cx={14}
          cy={-66}
          r={7 + i * 2}
          fill={dark ? '#5d5650' : '#c9c3bb'}
          stroke={INK}
          strokeWidth="1.2"
          className="smoke"
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}
    </g>
  )
}

function Building({ x, w, h, lit, dark }: { x: number; w: number; h: number; lit: number; dark?: boolean }) {
  const cols = Math.floor((w - 6) / 9)
  const rows = Math.floor((h - 8) / 12)
  const cells = []
  let n = 0
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      n++
      const on = !dark && (n * 37) % 100 < lit
      cells.push(<rect key={`${r}-${c}`} x={x + 5 + c * 9} y={GROUND - h + 6 + r * 12} width="5" height="7" fill={on ? '#ffd86b' : '#3d4659'} />)
    }
  return (
    <g>
      <rect x={x} y={GROUND - h} width={w} height={h} fill={dark ? '#4a4d55' : '#6f7a91'} stroke={INK} strokeWidth="2" />
      {cells}
    </g>
  )
}

/* ───────── 망가진 모습 ───────── */

function Flame({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="flicker" style={{ animationDelay: `${delay}s` }}>
        <path
          d="M0 0 C-11 -6 -9 -19 -2 -28 C-1 -19 4 -17 3 -26 C11 -17 13 -6 0 0Z"
          fill="#ff7a2f"
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M0 -3 C-5 -7 -4 -13 0 -18 C2 -12 6 -9 0 -3Z" fill="#ffe14d" />
      </g>
    </g>
  )
}

function BurntTree({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y} V${y - 32} M${x} ${y - 20} l-9 -9 M${x} ${y - 13} l8 -7 M${x} ${y - 27} l6 -6`}
      stroke="#2b2420"
      strokeWidth="3.6"
      strokeLinecap="round"
      fill="none"
    />
  )
}

function DeadFish({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="bob">
        <ellipse cx="0" cy="0" rx="9" ry="4.5" fill="#e9e6dd" stroke={INK} strokeWidth="1.5" />
        <path d="M8 0 l7 -5 v10z" fill="#e9e6dd" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M-6 -2 l3 3 M-3 -2 l-3 3" stroke={INK} strokeWidth="1.3" />
      </g>
    </g>
  )
}

function Trash({ x, y, kind }: { x: number; y: number; kind: number }) {
  if (kind % 3 === 0)
    return <path d={`M${x} ${y} q6 -10 12 0 q-6 8 -12 0z`} fill="#fff" stroke={INK} strokeWidth="1.4" opacity="0.92" />
  if (kind % 3 === 1)
    return <rect x={x} y={y - 4} width="12" height="5" rx="2" fill="#7fc4d8" stroke={INK} strokeWidth="1.3" transform={`rotate(-20 ${x} ${y})`} />
  return <rect x={x} y={y - 5} width="6" height="8" rx="1" fill="#d8453a" stroke={INK} strokeWidth="1.3" />
}

function Protester({ x, y, word }: { x: number; y: number; word: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="protest">
        <circle cx="0" cy="-20" r="4" fill="#f1c9a5" stroke={INK} strokeWidth="1.3" />
        <path d="M0 -16 v10 M0 -6 l-4 6 M0 -6 l4 6 M0 -13 l6 -8" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <rect x="2" y="-36" width="22" height="13" fill="#fff8d6" stroke={INK} strokeWidth="1.5" />
        <text x="13" y="-26" fontSize="8" textAnchor="middle" fill="#c8322a" className="px">
          {word}
        </text>
      </g>
    </g>
  )
}

/* ───────── 전체 풍경 ───────── */

export default function Panorama({ game, highlight, crop, zoom = 0, flash, className = '' }: Props) {
  const has = (f: string) => game.flags.includes(f)
  const zones = Object.fromEntries(zoneViews(game).map((z) => [z.id, z]))
  const earth = game.stats.earth
  const t = earth / 100
  const gaia = has('gaia')
  const smog = has('factory_boom') || earth < 35

  // 하늘: 지구 지표가 높으면 맑은 파랑, 낮으면 뿌연 주황
  const skyTop = hsl(mix(25, 208, t), mix(55, 75, t), mix(58, 70, t))
  const skyBottom = hsl(mix(38, 195, t), mix(70, 80, t), mix(78, 88, t))

  // 바다: 지구가 나빠질수록, 해안이 잠길수록 수위가 올라감
  const seaTop = 246 - Math.round(Math.max(0, 60 - earth) * 0.22) - (has('coast_flooded') ? 10 : 0)
  const shore = has('seawall') ? 292 : has('coast_flooded') ? 330 : 300

  const ice = zones.antarctic.health
  const iceW = 40 + ice * 1.45
  const penguins = ice >= 60 ? 3 : ice >= 30 ? 2 : 1

  const woods = zones.forest.health
  const river = zones.industrial.health
  const field = zones.farm.health
  const shoreHealth = zones.coast.health
  const human = game.stats.human
  const economy = game.stats.economy
  // 지구 지표가 45 아래로 떨어질수록 0 → 1 로 커지는 '망가짐' 정도
  const burn = Math.max(0, Math.min(1, (45 - earth) / 40))
  const burntTrees = woods < 30 ? 3 : woods < 40 ? 2 : woods < 50 ? 1 : 0
  const protest = !gaia && (game.trust.citizen <= 30 || human < 30)

  const viewBox = crop
    ? `${ZONE_X[crop][0] + zoom * 12} ${120 + zoom * 16} ${200 - zoom * 24} ${220 - zoom * 26}`
    : `0 ${TOP} ${W} ${H - TOP}`

  return (
    <svg
      className={`panorama ${gaia ? 'panorama--gaia' : ''} ${className}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="지구 풍경"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hsl(mix(190, 205, t), mix(25, 65, t), mix(42, 52, t))} />
          <stop offset="1" stopColor={hsl(mix(190, 215, t), mix(25, 60, t), mix(28, 34, t))} />
        </linearGradient>
        <linearGradient id="oil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7b4fd1" />
          <stop offset="0.35" stopColor="#3fb6c9" />
          <stop offset="0.65" stopColor="#e3d24a" />
          <stop offset="1" stopColor="#d9534f" />
        </linearGradient>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="1" opacity="0.18" />
        </pattern>
      </defs>

      {/* 하늘 */}
      <rect x="0" y="0" width={W} height={H} fill="url(#sky)" />
      {earth < 35 && <circle cx="150" cy="124" r="46" fill="#ff8a4a" opacity="0.35" className="pulse" />}
      <circle
        cx="150"
        cy="124"
        r={earth < 35 ? 28 : 22}
        fill={earth >= 45 ? '#fff3b0' : earth >= 35 ? '#ffbe73' : '#ff6a3d'}
        stroke={INK}
        strokeWidth="2"
      />
      <g className="drift">
        <path d="M360 128 q10 -22 32 -12 q14 -16 32 0 q20 0 18 16 h-82 q-12 0 0 -4z" fill="#fff" stroke={INK} strokeWidth="2" opacity="0.92" />
        <path d="M820 116 q10 -18 28 -10 q12 -14 28 0 q18 0 16 14 h-72 q-10 0 0 -4z" fill="#fff" stroke={INK} strokeWidth="2" opacity="0.92" />
      </g>
      {earth < 35 && (
        <g className="shimmer" stroke="#fff" strokeWidth="2" fill="none" opacity="0.4">
          {[196, 210].map((y) => (
            <path key={y} d={`M300 ${y} ${Array.from({ length: 22 }, () => 'q10 -5 20 0 t20 0').join(' ')}`} />
          ))}
        </g>
      )}
      {has('sky_shield') && (
        <g opacity="0.6">
          <rect x="0" y="86" width={W} height="20" fill="#e9e7f5" />
          <text x="40" y="100" fontSize="11" fill="#6b6788" className="px">· · 햇빛 반사 물질 · · 햇빛 반사 물질 · ·</text>
        </g>
      )}
      {!has('flight_ban') && !gaia && (
        <g className="fly">
          <path d="M0 0 h34 l8 -4 v8 l-8 -4" fill="#fff" stroke={INK} strokeWidth="2" transform="translate(-60 150)" />
          <path d="M-46 150 l10 -10 h6 l-4 10z" fill="#fff" stroke={INK} strokeWidth="1.6" />
        </g>
      )}

      {/* 땅 */}
      <path
        d={`M${shore - 10} ${GROUND} Q 420 238 520 ${GROUND - 4} T 760 ${GROUND - 8} T 1200 ${GROUND} V ${H} H ${shore - 10} Z`}
        fill={hsl(mix(40, 105, field / 100), 40, mix(48, 42, field / 100))}
        stroke={INK}
        strokeWidth="2.5"
      />
      <rect x="800" y={GROUND} width="400" height={H - GROUND} fill="#8b8a86" stroke={INK} strokeWidth="2" />
      <rect x={shore - 10} y={GROUND + 30} width={W} height={H} fill="#7b5a3a" opacity="0.35" />

      {/* ───── 남극 ───── */}
      <path
        d={`M0 ${seaTop - 28} H${iceW} L${iceW + 14} ${seaTop + 8} H0 Z`}
        fill="#f4fbff"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d={`M0 ${seaTop - 12} H${iceW * 0.8}`} stroke="#b9dcef" strokeWidth="3" />
      {ice < 55 &&
        [0.25, 0.55].map((f) => (
          <ellipse key={f} cx={iceW * f} cy={seaTop - 26} rx="11" ry="2.6" fill="#8cc8ea" stroke={INK} strokeWidth="1" />
        ))}
      {ice < 35 && (
        <>
          <path
            d={`M${iceW * 0.62} ${seaTop - 28} l-6 10 l8 6 l-5 10 l6 10`}
            stroke={INK}
            strokeWidth="2.2"
            fill="none"
            strokeLinejoin="round"
          />
          {[0.3, 0.7, 0.95].map((f) => (
            <circle key={f} cx={iceW * f} cy={seaTop + 10} r="2" fill="#8cc8ea" className="drip" style={{ animationDelay: `${f}s` }} />
          ))}
        </>
      )}
      {ice < 70 && (
        <g className="bob">
          <path d={`M${iceW + 26} ${seaTop + 2} l8 -12 h14 l6 12z`} fill="#e9f6ff" stroke={INK} strokeWidth="2" />
          {ice < 40 && <path d={`M${iceW + 64} ${seaTop + 3} l5 -8 h9 l4 8z`} fill="#e9f6ff" stroke={INK} strokeWidth="2" />}
        </g>
      )}
      {Array.from({ length: penguins }).map((_, i) => (
        <Penguin key={i} x={22 + i * Math.max(18, (iceW - 40) / penguins)} y={seaTop - 28} />
      ))}

      {/* ───── 바다 ───── */}
      <rect x="0" y={seaTop} width={shore} height={H - seaTop} fill="url(#sea)" />
      <g className="wave">
        <path
          d={`M-40 ${seaTop} ${Array.from({ length: 12 }, () => 'q10 -6 20 0 t20 0').join(' ')}`}
          fill="none"
          stroke="#e8f6ff"
          strokeWidth="2.5"
        />
      </g>
      <rect x="0" y={seaTop} width={shore} height={H - seaTop} fill="none" stroke={INK} strokeWidth="2.5" />
      {has('plastic_ban') ? (
        <>
          <g className="swim">
            <ellipse cx="230" cy={seaTop + 30} rx="11" ry="7" fill="#4f9a5a" stroke={INK} strokeWidth="2" />
            <circle cx="243" cy={seaTop + 28} r="4" fill="#7cc27f" stroke={INK} strokeWidth="1.5" />
          </g>
          <g className="swim" style={{ animationDelay: '-2s' }}>
            <ellipse cx="120" cy={seaTop + 50} rx="9" ry="6" fill="#4f9a5a" stroke={INK} strokeWidth="2" />
          </g>
        </>
      ) : (
        <g className="bob">
          {Array.from({ length: 2 + Math.round(burn * 6) }).map((_, i) => (
            <Trash key={i} x={60 + ((i * 53) % 220)} y={seaTop + 10 + ((i * 17) % 40)} kind={i} />
          ))}
        </g>
      )}

      {/* ───── 해안 마을 ───── */}
      {has('seawall') && (
        <g>
          <rect x="284" y={seaTop - 30} width="12" height={GROUND - seaTop + 40} fill="#a9907a" stroke={INK} strokeWidth="2" />
          <path d={`M284 ${seaTop - 20} h12 M284 ${seaTop - 8} h12 M284 ${seaTop + 4} h12`} stroke={INK} strokeWidth="1.2" />
        </g>
      )}
      {gaia ? (
        <House x={340} y={GROUND} color="#cfc6b6" dark />
      ) : (
        <>
          <House x={318} y={GROUND} color="#e9d8b4" dark={has('coast_flooded')} />
          <House x={350} y={GROUND - 2} color="#bcd6e6" dark={has('coast_flooded')} />
          <House x={382} y={GROUND - 4} color="#f0c9c4" />
          {has('refugee_welcome') && (
            <path d="M396 250 l10 -18 l10 18z" fill="#e7b24c" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          )}
        </>
      )}
      {has('coast_flooded') && (
        <rect x="296" y={GROUND - 12} width="80" height="30" fill="url(#sea)" opacity="0.85" stroke={INK} strokeWidth="2" />
      )}
      {shoreHealth < 45 && !has('coast_flooded') &&
        [0, 1, 2].map((i) => <Trash key={i} x={306 + i * 26} y={GROUND + 10 + (i % 2) * 6} kind={i + 1} />)}
      {shoreHealth < 30 && (
        <g className="storm" stroke="#9fb7d9" strokeWidth="2" opacity="0.8">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={205 + i * 19} y1={100 + (i % 3) * 20} x2={195 + i * 19} y2={130 + (i % 3) * 20} />
          ))}
        </g>
      )}

      {/* ───── 농촌 ───── */}
      <g>
        <rect x="414" y={GROUND - 30} width="30" height="26" fill="#c94f3d" stroke={INK} strokeWidth="2" />
        <path d="M410 220 l19 -16 l19 16z" fill="#8f3a2c" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {Array.from({ length: Math.max(2, Math.round(field / 14)) }).map((_, i) => (
          <path
            key={i}
            d={`M${452 + i * 13} ${GROUND + 22} v-14 m-3 2 l3 -6 l3 6`}
            stroke={field > 35 ? '#e2b53b' : '#9c7a4a'}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {Array.from({ length: has('cattle_cut') ? 1 : has('cattle_keep') ? 3 : 2 }).map((_, i) => (
          <Cow key={i} x={480 + i * 38} y={GROUND - 2} />
        ))}
        {has('farm_shift') && (
          <g>
            {[560, 574].map((x) => (
              <g key={x}>
                <rect x={x - 2} y={GROUND - 8} width="4" height="8" fill="#f3ecd9" stroke={INK} strokeWidth="1.2" />
                <path d={`M${x - 8} ${GROUND - 8} q8 -12 16 0z`} fill="#d9412f" stroke={INK} strokeWidth="1.5" />
              </g>
            ))}
          </g>
        )}
        {has('bees_gone') ? (
          <path d="M590 250 q-4 -10 2 -16 M584 250 q2 -8 -3 -12" stroke="#7a6046" strokeWidth="2" fill="none" />
        ) : (
          <g>
            <circle cx="592" cy="242" r="4" fill="#ffdd57" stroke={INK} strokeWidth="1.2" />
            <circle cx="582" cy="244" r="3.5" fill="#ff9fb8" stroke={INK} strokeWidth="1.2" />
          </g>
        )}
        {has('bees_saved') && (
          <g className="buzz">
            <ellipse cx="575" cy="222" rx="4" ry="3" fill="#ffd23f" stroke={INK} strokeWidth="1.2" />
            <ellipse cx="573" cy="218" rx="3" ry="2" fill="#fff" opacity="0.8" />
          </g>
        )}
        {has('farm_closed') && <rect x="530" y={GROUND - 26} width="40" height="26" fill="#b7a58c" stroke={INK} strokeWidth="2" />}
        {field < 40 && (
          <path
            d="M446 268 l10 6 l-6 8 l12 6 M520 266 l-8 8 l10 7 l-4 9 M566 274 l8 -6 l6 10 l9 -2 M480 292 l14 -4 l6 8"
            stroke="#4a3220"
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          />
        )}
        {field < 25 && (
          <g className="dust" fill="#c9a66b" opacity="0.6">
            <circle cx="470" cy="236" r="10" />
            <circle cx="486" cy="230" r="7" />
            <circle cx="540" cy="238" r="9" />
          </g>
        )}
      </g>

      {/* ───── 뒷산 숲 ───── */}
      <g>
        {Array.from({ length: Math.max(burntTrees + 1, Math.min(8, Math.round(woods / 12))) }).map((_, i) => {
          const x = 612 + i * 23
          if (has('forest_dev') && x > 660 && x < 740) return null
          const y = GROUND - 6 - (i % 2) * 6
          if (i < burntTrees) return <BurntTree key={i} x={x} y={y} />
          return <Pine key={i} x={x} y={y} s={0.9 + (i % 3) * 0.08} tone={i % 3} />
        })}
        {woods < 32 && (
          <g>
            {[618, 642, 760, 784].map((x, i) => (
              <Flame key={x} x={x} y={GROUND - 4 - (i % 2) * 8} s={1.2} delay={i * 0.15} />
            ))}
            {[0, 1].map((i) => (
              <circle
                key={i}
                cx={640 + i * 30}
                cy={170}
                r={12 + i * 4}
                fill="#4b4540"
                stroke={INK}
                strokeWidth="1.2"
                className="smoke"
                style={{ animationDelay: `${i * 1.1}s` }}
              />
            ))}
          </g>
        )}
        {has('forest_dev') &&
          [662, 744].map((x) => <rect key={x} x={x - 4} y={GROUND - 5} width="8" height="6" fill="#8a5a36" stroke={INK} strokeWidth="1.3" />)}
        {has('forest_dev') && (
          <g>
            <Building x={668} w={30} h={80} lit={60} dark={gaia} />
            <Building x={704} w={30} h={66} lit={50} dark={gaia} />
          </g>
        )}
        {has('eco_bridge') && (
          <path d="M660 250 q40 -36 80 0" fill="none" stroke="#3f7d3a" strokeWidth="9" strokeLinecap="round" />
        )}
        {has('solar_forest') && (
          <g>
            <path d="M760 236 l14 -8 h16 l-14 8z" fill="#3e6fd1" stroke={INK} strokeWidth="1.6" />
            <path d="M770 246 l14 -8 h12 l-14 8z" fill="#3e6fd1" stroke={INK} strokeWidth="1.6" />
          </g>
        )}
        {woods >= 30 && <Deer x={has('forest_dev') ? 752 : 700} y={GROUND + 18} />}
        {woods >= 65 && <Deer x={640} y={GROUND + 24} />}
        {!has('boar_cull') && <Boar x={770} y={GROUND + 26} />}
      </g>

      {/* ───── 강변 공업도시 ───── */}
      <path
        d="M800 300 q60 -14 120 0 t200 -4 V318 q-90 10 -160 2 t-160 0 Z"
        fill={hsl(mix(30, 205, river / 100), mix(35, 65, river / 100), mix(36, 52, river / 100))}
        stroke={INK}
        strokeWidth="2"
      />
      {river >= 60 && (
        <path d="M880 302 q8 -14 16 -2" fill="#ff9a6b" stroke={INK} strokeWidth="1.5" className="jump" />
      )}
      {river < 45 && <ellipse cx="910" cy="307" rx="34" ry="4" fill="url(#oil)" opacity="0.85" />}
      {river < 35 && (
        <>
          <DeadFish x={850} y={302} />
          <DeadFish x={975} y={306} />
          {[870, 890, 1010].map((x) => (
            <circle key={x} cx={x} cy={300} r="3" fill="#f4f1e6" stroke={INK} strokeWidth="1" />
          ))}
          <g>
            <path d="M985 270 v-22" stroke={INK} strokeWidth="2.5" />
            <path d="M985 230 l11 18 h-22z" fill="#ffd23f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <text x="985" y="245" fontSize="11" textAnchor="middle" fill={INK} className="px">!</text>
          </g>
        </>
      )}
      {river < 30 && !gaia && (
        <g fill="#3d3733" stroke={INK} strokeWidth="1.5" opacity="0.85" className="drift">
          <circle cx="870" cy="150" r="20" />
          <circle cx="895" cy="140" r="24" />
          <circle cx="922" cy="152" r="18" />
        </g>
      )}
      {gaia ? (
        <g opacity="0.75">
          <Factory x={860} y={GROUND} smoke={0} dark />
          <path d="M840 250 q10 -20 20 -10 q8 -18 18 -4" stroke="#4f8d45" strokeWidth="3" fill="none" />
        </g>
      ) : (
        Array.from({ length: zones.industrial.scene.filter((e) => e === '🏭').length }).map((_, i) => (
          <Factory
            key={i}
            x={840 + i * 52}
            y={GROUND}
            smoke={has('factory_limit') ? 0 : has('factory_boom') || has('deregulate') ? 3 : 2}
            dark={has('factory_boom')}
            solar={has('green_jobs') && i === 0}
          />
        ))
      )}
      {has('workers_left') && !gaia && (
        <g>
          <rect x="960" y="226" width="30" height="16" fill="#fff8e6" stroke={INK} strokeWidth="1.6" />
          <text x="964" y="238" fontSize="10" fill={INK} className="px">임대</text>
        </g>
      )}

      {/* ───── 도시 ───── */}
      <Building x={1012} w={38} h={110} lit={human} dark={gaia} />
      <Building x={1054} w={30} h={80} lit={human} dark={gaia} />
      <Building x={1088} w={44} h={128} lit={human} dark={gaia} />
      <Building x={1138} w={34} h={92} lit={human} dark={gaia} />
      {has('mall_24h') && !gaia && (
        <g className="neon">
          <rect x="1140" y="168" width="30" height="12" fill="#ff4fa3" stroke={INK} strokeWidth="1.5" />
          <text x="1143" y="177" fontSize="8" fill="#fff" className="px">24H</text>
        </g>
      )}
      {has('four_day') && !gaia && <Pine x={1182} y={GROUND} s={0.6} />}
      {gaia && <path d="M1020 250 q6 -24 14 -6 M1100 250 q8 -30 16 -4" stroke="#4f8d45" strokeWidth="3" fill="none" />}
      {economy < 30 && !gaia && (
        <g>
          {[
            [1016, 30],
            [1092, 36],
          ].map(([x, w]) => (
            <g key={x}>
              <rect x={x} y={GROUND - 16} width={w} height="16" fill="#a3a3a3" stroke={INK} strokeWidth="1.5" />
              <path d={`M${x} ${GROUND - 11} h${w} M${x} ${GROUND - 6} h${w}`} stroke="#6f6f6f" strokeWidth="1.2" />
            </g>
          ))}
          <rect x="1094" y={GROUND - 30} width="28" height="11" fill="#fff8d6" stroke={INK} strokeWidth="1.3" />
          <text x="1108" y={GROUND - 21} fontSize="8" textAnchor="middle" fill="#c8322a" className="px">폐업</text>
          <path d="M1176 252 q6 -12 12 0 q4 6 -6 6 q-10 0 -6 -6z" fill="#3f5a3a" stroke={INK} strokeWidth="1.4" />
        </g>
      )}
      {human < 30 && !gaia && (
        <path d="M1110 132 l-6 14 l8 10 l-7 16 l6 12" stroke={INK} strokeWidth="2.4" fill="none" strokeLinejoin="round" />
      )}
      <rect x="1000" y="272" width="200" height="14" fill="#55565a" stroke={INK} strokeWidth="2" />
      {protest && (
        <g>
          <Protester x={1030} y={271} word="반대" />
          <Protester x={1062} y={271} word="!!" />
          <Protester x={1094} y={271} word="멈춰" />
        </g>
      )}
      {!gaia && (
        <g className="drive">
          <rect x="1000" y="262" width="20" height="10" rx="3" fill={has('ev_cars') ? '#57c27a' : '#d7553f'} stroke={INK} strokeWidth="1.6" />
          {!has('ev_cars') && <circle cx="996" cy="268" r="3" fill="#a9a29a" />}
        </g>
      )}
      {has('flight_ban') && !gaia && (
        <g className="drive slow">
          <rect x="1000" y="240" width="46" height="12" rx="5" fill="#f1f1f1" stroke={INK} strokeWidth="1.6" />
          <rect x="1006" y="243" width="30" height="4" fill="#3e6fd1" />
        </g>
      )}

      {/* 스모그 */}
      {(smog || burn > 0) && !gaia && (
        <rect x="0" y="0" width={W} height={GROUND} fill="#7a4a24" opacity={0.1 + burn * 0.32 + (has('factory_boom') ? 0.1 : 0)} />
      )}
      {earth < 25 && !gaia && (
        <g fill="#6d6560">
          {Array.from({ length: 16 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 79) % 1200}
              cy={TOP + ((i * 37) % 60)}
              r={1.8 + (i % 3)}
              className="ash"
              style={{ animationDelay: `${(i % 7) * -0.9}s` }}
            />
          ))}
        </g>
      )}

      {/* 지역 강조 */}
      {!crop &&
        (Object.keys(ZONE_X) as ZoneId[]).map((id) => {
          const [x0, x1] = ZONE_X[id]
          const lit = highlight === id
          return (
            <g key={id}>
              {lit && (
                <>
                  <rect x={x0 + 4} y={TOP + 6} width={x1 - x0 - 8} height={H - TOP - 12} rx="10" fill="#fff" opacity="0.12" />
                  <rect
                    x={x0 + 4}
                    y={TOP + 6}
                    width={x1 - x0 - 8}
                    height={H - TOP - 12}
                    rx="10"
                    fill="none"
                    stroke="#ffe45c"
                    strokeWidth="4"
                    strokeDasharray="12 8"
                    className="march"
                  />
                </>
              )}
              <g
                transform={`translate(${(x0 + x1) / 2} ${H - 14})`}
                className={zones[id].health < 20 ? 'svg-blink' : undefined}
              >
                <rect
                  x="-42"
                  y="-12"
                  width="84"
                  height="20"
                  rx="4"
                  fill={lit ? '#ffe45c' : zones[id].health < 35 ? '#ff6b5b' : '#fffaf0'}
                  stroke={INK}
                  strokeWidth="2"
                />
                <text textAnchor="middle" y="3" fontSize="12" fill={INK} className="px">
                  {zones[id].health < 35 ? `⚠ ${ZONE_LABEL[id]}` : ZONE_LABEL[id]}
                </text>
              </g>
              <title>{`${ZONE_LABEL[id]}: ${zones[id].status}`}</title>
            </g>
          )
        })}
      {highlight === 'all' && <rect x="0" y="0" width={W} height={H} fill="#ff2040" className="alarm-tint" />}
      {flash && !crop && (
        <g key={flash.id}>
          {(() => {
            const [x0, x1] = flash.zone === 'all' ? [0, W] : ZONE_X[flash.zone]
            const cx = (x0 + x1) / 2
            return (
              <>
                <rect
                  x={x0}
                  y={TOP}
                  width={x1 - x0}
                  height={H - TOP}
                  fill={flash.good ? '#5dff8a' : '#ff2a2a'}
                  className="zone-flash"
                />
                <g transform={`translate(${cx} ${TOP + 44})`}>
                  <g className="flash-text">
                    <rect
                      x={-flash.text.length * 6 - 12}
                      y="-18"
                      width={flash.text.length * 12 + 24}
                      height="28"
                      rx="6"
                      fill="#fffaf0"
                      stroke={INK}
                      strokeWidth="2.5"
                    />
                    <text textAnchor="middle" y="2" fontSize="17" fill={flash.good ? '#1d8a45' : '#c8322a'} className="px">
                      {flash.text}
                    </text>
                  </g>
                </g>
              </>
            )
          })()}
        </g>
      )}
    </svg>
  )
}
