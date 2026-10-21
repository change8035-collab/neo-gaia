// 창밖으로 보이는 지구 풍경 (직접 그린 SVG)
// 극지방에서 적도 쪽으로: 한대(남극) → 냉대(타이가) → 온대(농촌, 공업 도시) → 건조(사막) → 열대(우림·산호섬)
// 결정할 때마다 빙하 크기, 땅속 얼음, 숲·사막 넓이, 바닷물 높이, 공장 연기 등이 바뀜

import {
  ZONE_INFO,
  desertHealth,
  fieldHealth,
  iceHealth,
  riverHealth,
  taigaHealth,
  tropicHealth,
  woodsHealth,
  zoneViews,
} from '../game/zones.ts'
import type { GameState, ZoneId } from '../game/types.ts'

const INK = '#1d1b18'
const W = 1200
const H = 340
const GROUND = 250
/** 위쪽 빈 하늘은 잘라서 풍경이 크게 보이게 */
const TOP = 80

export const ZONE_X: Record<ZoneId, [number, number]> = {
  polar: [0, 200],
  subarctic: [200, 400],
  rural: [400, 600],
  city: [600, 800],
  dry: [800, 1000],
  tropical: [1000, 1200],
}

const ZONE_LABEL: Record<ZoneId, string> = {
  polar: '한대 · 남극',
  subarctic: '냉대 · 타이가',
  rural: '온대 · 농촌',
  city: '온대 · 도시',
  dry: '건조 · 사막',
  tropical: '열대 · 우림',
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t
const hsl = (h: number, s: number, l: number, a = 1) => `hsl(${h} ${s}% ${l}% / ${a})`

interface Props {
  game: GameState
  highlight?: ZoneId | 'all' | null
  /** 한 지역만 잘라서 보여 줄 때 */
  crop?: ZoneId
  /** 잘라 보여 줄 때 조금씩 당겨 찍기 (0, 1, 2) */
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

function House({ x, y, color, dark, s = 1 }: { x: number; y: number; color: string; dark?: boolean; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-13" y="-22" width="26" height="22" fill={color} stroke={INK} strokeWidth="2" />
      <path d="M-17 -22 L0 -36 L17 -22 Z" fill="#c4553b" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="-5" y="-12" width="10" height="12" fill={dark ? '#3a3a3a' : '#6b4a32'} stroke={INK} strokeWidth="1.5" />
      <rect x="4" y="-19" width="6" height="5" fill={dark ? '#444' : '#ffe17a'} stroke={INK} strokeWidth="1" />
    </g>
  )
}

function Cow({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
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

/** 온대 숲의 소나무 */
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

/** 냉대 타이가의 가늘고 뾰족한 가문비나무. 땅속 얼음이 녹으면 비스듬히 기욺 */
function Spruce({ x, y, s = 1, tilt = 0, tone = 0 }: { x: number; y: number; s?: number; tilt?: number; tone?: number }) {
  const green = hsl(155 + tone * 6, 30, 19 + tone * 4)
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <g className="sway">
        <rect x="-2" y="-7" width="4" height="9" fill="#6b4529" stroke={INK} strokeWidth="1.3" />
        <path d="M0 -60 L8 -42 L-8 -42 Z" fill={green} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M0 -50 L11 -26 L-11 -26 Z" fill={green} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M0 -36 L13 -6 L-13 -6 Z" fill={green} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      </g>
    </g>
  )
}

function Reindeer({ x, y, s = 1, flip }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="graze">
        <path d="M17 -27 q-5 -7 -2 -14 M17 -27 q4 -8 1 -14 M15 -36 l-5 -2 M18 -35 l5 -3" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <ellipse cx="0" cy="-15" rx="13" ry="7" fill="#8a6a4f" stroke={INK} strokeWidth="2" />
        <path d="M8 -18 q4 -8 9 -9 l6 3 l-2 5 l-8 3z" fill="#8a6a4f" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7 -16 q4 5 9 1" fill="#efe9dc" stroke={INK} strokeWidth="1.2" />
        <path d="M-9 -9 v9 M-4 -9 v9 M5 -9 v9 M9 -9 v9" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </g>
  )
}

function Deer({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-14" rx="12" ry="7" fill="#b9784a" stroke={INK} strokeWidth="2" />
      <path d="M9 -18 l5 -10 h6 l-3 9z" fill="#b9784a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 -28 l-3 -8 M17 -28 l3 -8 M13 -33 l-4 -2 M19 -33 l4 -2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M-8 -8 v8 M-3 -8 v8 M4 -8 v8 M8 -8 v8" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  )
}

function Boar({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-9" rx="13" ry="8" fill="#5b4334" stroke={INK} strokeWidth="2" />
      <ellipse cx="13" cy="-7" rx="4" ry="3.5" fill="#d79b85" stroke={INK} strokeWidth="1.5" />
      <path d="M-7 -2 v3 M6 -2 v3" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function Factory({ x, y, smoke, dark, solar, s = 1 }: { x: number; y: number; smoke: number; dark?: boolean; solar?: boolean; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
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

/** 사막의 석유 펌프. 돌아갈 때는 머리를 끄덕끄덕 */
function PumpJack({ x, y, running, rusty }: { x: number; y: number; running: boolean; rusty?: boolean }) {
  const metal = rusty ? '#9a6a44' : '#4a4d55'
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-20 0 h40" stroke={INK} strokeWidth="3" />
      <path d="M-3 0 L1 -24 L5 0" fill="none" stroke={metal} strokeWidth="3" strokeLinejoin="round" />
      <rect x="11" y="-10" width="9" height="10" fill={metal} stroke={INK} strokeWidth="1.5" />
      <g>
        <rect x="-15" y="-28" width="32" height="5" fill={metal} stroke={INK} strokeWidth="1.5" />
        <path d="M-15 -31 q-7 5 0 13 h3 v-13z" fill={metal} stroke={INK} strokeWidth="1.5" />
        <path d="M-14 -18 V0" stroke={INK} strokeWidth="1.2" />
        {running && (
          <animateTransform attributeName="transform" type="rotate" values="-9 1 -25; 9 1 -25; -9 1 -25" dur="2.4s" repeatCount="indefinite" />
        )}
      </g>
    </g>
  )
}

function Camel({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="graze">
        <path d="M-16 -12 Q-15 -22 -8 -21 Q-3 -32 4 -21 Q10 -19 12 -12 Z" fill="#c9955a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 -16 q7 -3 7 -13 h6 v5 h-3 q-1 12 -8 13z" fill="#c9955a" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M-12 -12 v12 M-6 -12 v12 M4 -12 v12 M9 -12 v12" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </g>
  )
}

/** 오아시스의 대추야자 */
function DatePalm({ x, y, dead }: { x: number; y: number; dead?: boolean }) {
  const leaf = dead ? '#9c7a4a' : '#3f8a3a'
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 q-3 -18 3 -38" stroke="#7a5230" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g className={dead ? undefined : 'sway'}>
        <path
          d={dead ? 'M3 -38 q-8 2 -12 12 M3 -38 q8 2 12 12 M3 -38 q-2 6 -6 14' : 'M3 -38 q-12 -6 -20 4 M3 -38 q12 -6 20 4 M3 -38 q-6 -12 -16 -10 M3 -38 q6 -12 16 -10'}
          stroke={leaf}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

/** 사막 나무 장벽의 아카시아 */
function Acacia({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 V-14 M0 -9 l-6 -6 M0 -11 l5 -5" stroke="#6b4529" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="0" cy="-19" rx="13" ry="5" fill="#6f9a3a" stroke={INK} strokeWidth="1.6" />
    </g>
  )
}

function MudHouse({ x, y, buried }: { x: number; y: number; buried?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-11" y="-18" width="22" height="18" fill="#d9a86a" stroke={INK} strokeWidth="2" />
      <rect x="-13" y="-21" width="26" height="4" fill="#b98a52" stroke={INK} strokeWidth="1.5" />
      <path d="M-4 0 v-9 a4 4 0 0 1 8 0 v9" fill="#5b4334" stroke={INK} strokeWidth="1.3" />
      {buried && <path d="M-18 1 q10 -22 34 -8 l4 7z" fill="#e0bf78" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />}
    </g>
  )
}

function Tent({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-11 0 L0 -15 L11 0 Z" fill="#e8dcc0" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M0 -15 V0 M-3 0 L0 -6 L3 0" stroke={INK} strokeWidth="1.2" fill="#8a7a5a" />
    </g>
  )
}

/** 열대우림의 넓은 잎 나무 */
function RainTree({ x, y, s = 1, tone = 0 }: { x: number; y: number; s?: number; tone?: number }) {
  const green = hsl(115 + tone * 12, 48, 25 + tone * 4)
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2.5 0 V-30 h5 V0 Z" fill="#6b4529" stroke={INK} strokeWidth="1.4" />
      <g className="sway">
        <path
          d="M-18 -32 q-6 -12 6 -15 q2 -12 14 -9 q11 -6 15 6 q10 3 3 14 q-3 6 -12 4 q-6 6 -14 1 q-9 4 -12 -1z"
          fill={green}
          stroke={INK}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </g>
    </g>
  )
}

/** 팜유를 짜는 기름야자 (똑같은 모양으로 줄 맞춰 심음) */
function OilPalm({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 V-16" stroke="#7a5230" strokeWidth="3" />
      <path d="M0 -16 q-8 -4 -12 2 M0 -16 q8 -4 12 2 M0 -16 q-4 -8 -9 -8 M0 -16 q4 -8 9 -8" stroke="#5f8f2e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Stump({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-4" y="-6" width="8" height="6" fill="#8a5a36" stroke={INK} strokeWidth="1.3" />
      <ellipse cx="0" cy="-6" rx="4" ry="1.6" fill="#d8b48a" stroke={INK} strokeWidth="1" />
    </g>
  )
}

function Orangutan({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="bob">
        <path d="M5 -9 q7 -6 5 -18" stroke="#c4622d" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M-6 0 q-2 -10 6 -12 q8 2 6 12z" fill="#c4622d" stroke={INK} strokeWidth="1.5" />
        <circle cx="0" cy="-15" r="5" fill="#c4622d" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="0.5" cy="-14" rx="3" ry="2.4" fill="#e8b48a" />
      </g>
    </g>
  )
}

function Parrot({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="bob">
        <ellipse cx="0" cy="-6" rx="4" ry="6" fill="#d8453a" stroke={INK} strokeWidth="1.3" />
        <path d="M-1 -5 q-4 6 -2 12" stroke="#2a5bb5" strokeWidth="2.4" fill="none" />
        <path d="M3 -10 l4 1 -3 2z" fill="#f2c94c" stroke={INK} strokeWidth="0.8" />
      </g>
    </g>
  )
}

function Coral({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 v-12 M0 -6 l-5 -6 M0 -8 l5 -7 M0 -3 l6 -3" stroke={INK} strokeWidth="4.6" strokeLinecap="round" fill="none" />
      <path d="M0 0 v-12 M0 -6 l-5 -6 M0 -8 l5 -7 M0 -3 l6 -3" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </g>
  )
}

function Turtle({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g className="swim" style={{ animationDelay: `${delay}s` }}>
      <ellipse cx={x} cy={y} rx="10" ry="6" fill="#4f9a5a" stroke={INK} strokeWidth="2" />
      <circle cx={x + 12} cy={y - 2} r="3.5" fill="#7cc27f" stroke={INK} strokeWidth="1.5" />
    </g>
  )
}

/** 시베리아 가스전의 불꽃 탑 */
function GasFlare({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-9 0 L-2 -34 M9 0 L2 -34 M-6 -12 L5 -22 M6 -12 L-5 -22" stroke="#7d7670" strokeWidth="1.8" />
      <rect x="-2.5" y="-56" width="5" height="56" fill="#9a8f86" stroke={INK} strokeWidth="1.6" />
      <Flame x={0} y={-56} s={0.75} />
    </g>
  )
}

/** 산불 감시탑 */
function Lookout({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-8 0 L-4 -40 M8 0 L4 -40 M-6 -12 L6 -26 M6 -12 L-6 -26" stroke="#7a4f2e" strokeWidth="2.2" />
      <rect x="-9" y="-50" width="18" height="11" fill="#d9b77e" stroke={INK} strokeWidth="1.6" />
      <path d="M-11 -50 L0 -58 L11 -50 Z" fill="#c4553b" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
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

function BurntTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 V-32 M0 -20 l-9 -9 M0 -13 l8 -7 M0 -27 l6 -6" stroke="#2b2420" strokeWidth="3.6" strokeLinecap="round" fill="none" />
    </g>
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
        <text x="13" y="-26" fontSize="8" textAnchor="middle" fill="#c8322a">
          {word}
        </text>
      </g>
    </g>
  )
}

/* ───────── 전체 풍경 ───────── */

export default function Panorama({ game, highlight, crop, zoom = 0, flash, className = '' }: Props) {
  const has = (f: string) => game.flags.includes(f)
  const zones = Object.fromEntries(zoneViews(game).map((z) => [z.id, z])) as Record<ZoneId, ReturnType<typeof zoneViews>[number]>
  const earth = game.stats.earth
  const human = game.stats.human
  const economy = game.stats.economy
  const t = earth / 100
  const gaia = has('gaia')
  const smog = has('factory_boom') || earth < 35

  // 하늘: 지구 지표가 높으면 맑은 파랑, 낮으면 뿌연 주황
  const skyTop = hsl(mix(25, 208, t), mix(55, 75, t), mix(58, 70, t))
  const skyBottom = hsl(mix(38, 195, t), mix(70, 80, t), mix(78, 88, t))

  // 바다: 지구가 나빠질수록, 섬이 잠길수록 수위가 올라감 (남극 바다와 열대 바다 모두)
  const seaTop = 246 - Math.round(Math.max(0, 60 - earth) * 0.22) - (has('coast_flooded') ? 10 : 0)

  const ice = iceHealth(game)
  const iceW = 22 + ice * 1.3
  const penguins = ice >= 60 ? 3 : ice >= 30 ? 2 : 1

  const taiga = taigaHealth(game)
  const woods = woodsHealth(game)
  const field = fieldHealth(game)
  const river = riverHealth(game)
  const sand = desertHealth(game)
  const tropic = tropicHealth(game)

  // 지구 지표가 45 아래로 떨어질수록 0 → 1 로 커지는 '망가짐' 정도
  const burn = Math.max(0, Math.min(1, (45 - earth) / 40))
  const protest = !gaia && (game.trust.human <= 30 || human < 30)

  // 냉대: 나무 수, 땅속 얼음 두께, 녹아서 기운 나무
  const spruceCount = Math.max(2, Math.min(8, Math.round(taiga / 11)))
  const permafrost = 6 + taiga * 0.22
  const taigaBurning = taiga < 32
  const taigaBurnt = taiga < 32 ? 3 : taiga < 42 ? 1 : 0

  // 온대 농촌
  const pines = Math.max(1, Math.min(4, Math.round(woods / 20)))
  const woodsBurnt = woods < 30 ? 2 : woods < 42 ? 1 : 0

  // 건조
  const duneH = 6 + (100 - sand) * 0.24
  const oasisDry = sand < 30

  // 열대
  const rainTrees = Math.max(1, Math.min(5, Math.round(tropic / 18)))
  const coralColor = tropic >= 50 ? ['#ff7aa8', '#ff9f43', '#b57bff'] : tropic >= 30 ? ['#f6c9d6', '#f2efe6', '#e9d6f5'] : ['#e8e4da', '#d6d1c6', '#e8e4da']

  const viewBox = crop
    ? `${ZONE_X[crop][0] + zoom * 12} ${120 + zoom * 16} ${200 - zoom * 24} ${220 - zoom * 26}`
    : `0 ${TOP} ${W} ${H - TOP}`

  return (
    <svg
      className={`panorama ${gaia ? 'panorama--gaia' : ''} ${className}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="기후대별 지구 풍경"
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
        <linearGradient id="sea-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hsl(mix(170, 182, t), mix(25, 70, t), mix(46, 54, t))} />
          <stop offset="1" stopColor={hsl(mix(190, 200, t), mix(25, 62, t), mix(30, 36, t))} />
        </linearGradient>
        <linearGradient id="oil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7b4fd1" />
          <stop offset="0.35" stopColor="#3fb6c9" />
          <stop offset="0.65" stopColor="#e3d24a" />
          <stop offset="1" stopColor="#d9534f" />
        </linearGradient>
        <pattern id="frost" width="10" height="8" patternUnits="userSpaceOnUse">
          <path d="M3 2 h4 M5 0 v4" stroke="#ffffff" strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* 하늘 */}
      <rect x="0" y="0" width={W} height={H} fill="url(#sky)" />
      {earth < 35 && <circle cx="890" cy="122" r="46" fill="#ff8a4a" opacity="0.35" className="pulse" />}
      <circle
        cx="890"
        cy="122"
        r={earth < 35 ? 28 : 22}
        fill={earth >= 45 ? '#fff3b0' : earth >= 35 ? '#ffbe73' : '#ff6a3d'}
        stroke={INK}
        strokeWidth="2"
      />
      <g className="drift">
        <path d="M300 128 q10 -22 32 -12 q14 -16 32 0 q20 0 18 16 h-82 q-12 0 0 -4z" fill="#fff" stroke={INK} strokeWidth="2" opacity="0.92" />
        <path d="M640 116 q10 -18 28 -10 q12 -14 28 0 q18 0 16 14 h-72 q-10 0 0 -4z" fill="#fff" stroke={INK} strokeWidth="2" opacity="0.92" />
      </g>
      {earth < 35 && (
        <g className="shimmer" stroke="#fff" strokeWidth="2" fill="none" opacity="0.4">
          {[196, 210].map((y) => (
            <path key={y} d={`M400 ${y} ${Array.from({ length: 20 }, () => 'q10 -5 20 0 t20 0').join(' ')}`} />
          ))}
        </g>
      )}
      {has('sky_shield') && (
        <g opacity="0.6">
          <rect x="0" y="86" width={W} height="20" fill="#e9e7f5" />
          <text x="40" y="100" fontSize="11" fill="#6b6788">· · 햇빛 반사 물질 · · 햇빛 반사 물질 · · 햇빛 반사 물질 · ·</text>
        </g>
      )}
      {!has('flight_ban') && !gaia && (
        <g className="fly">
          <path d="M0 0 h34 l8 -4 v8 l-8 -4" fill="#fff" stroke={INK} strokeWidth="2" transform="translate(-60 150)" />
          <path d="M-46 150 l10 -10 h6 l-4 10z" fill="#fff" stroke={INK} strokeWidth="1.6" />
        </g>
      )}

      {/* ───── 바다 (남극 쪽 차가운 바다) ───── */}
      <rect x="0" y={seaTop} width="186" height={H - seaTop} fill="url(#sea)" />
      <g className="wave">
        <path d={`M-40 ${seaTop} ${Array.from({ length: 6 }, () => 'q10 -6 20 0 t20 0').join(' ')}`} fill="none" stroke="#e8f6ff" strokeWidth="2.5" />
      </g>
      <rect x="0" y={seaTop} width="186" height={H - seaTop} fill="none" stroke={INK} strokeWidth="2.5" />

      {/* ───── 바다 (열대 섬 바다): 섬을 먼저 그려야 바닷물이 차오르면 잠김 ───── */}
      <path d="M1128 254 Q1162 222 1204 248 V270 H1128 Z" fill="#ead9a6" stroke={INK} strokeWidth="2" />
      {has('seawall') && (
        <g>
          <rect x="1124" y="224" width="8" height="40" fill="#a9907a" stroke={INK} strokeWidth="2" />
          <path d="M1124 234 h8 M1124 244 h8 M1124 254 h8" stroke={INK} strokeWidth="1.2" />
        </g>
      )}
      <g>
        <path d="M1150 240 v-6 M1160 240 v-6 M1176 238 v-6 M1186 238 v-6" stroke="#7a5230" strokeWidth="2" />
        <House x={1155} y={234} color="#e9d8b4" s={0.7} dark={has('coast_flooded') || gaia} />
        {!gaia && <House x={1181} y={232} color="#bcd6e6" s={0.7} dark={has('coast_flooded')} />}
      </g>
      <rect x="1110" y={seaTop} width="94" height={H - seaTop} fill="url(#sea-warm)" opacity="0.94" />
      <g className="wave">
        <path d={`M1100 ${seaTop} ${Array.from({ length: 5 }, () => 'q10 -6 20 0 t20 0').join(' ')}`} fill="none" stroke="#e8fffb" strokeWidth="2.5" />
      </g>
      <path d={`M1110 ${H} V${seaTop} H1204`} fill="none" stroke={INK} strokeWidth="2.5" />
      {[1118, 1134, 1152, 1172, 1190].map((x, i) => (
        <Coral key={x} x={x} y={312} color={coralColor[i % 3]} s={0.9 + (i % 2) * 0.2} />
      ))}
      {has('plastic_ban') ? (
        <>
          <Turtle x={1130} y={seaTop + 30} />
          {tropic >= 55 && <path d={`M1170 ${seaTop + 22} l6 -3 v6z M1176 ${seaTop + 22} h5`} fill="#f2c94c" stroke={INK} strokeWidth="1" />}
        </>
      ) : (
        <g className="bob">
          {Array.from({ length: 2 + Math.round(burn * 3) }).map((_, i) => (
            <Trash key={i} x={1116 + ((i * 23) % 76)} y={seaTop + 10 + ((i * 13) % 26)} kind={i} />
          ))}
        </g>
      )}

      {/* ───── 땅 (기후대마다 땅 색이 다름) ───── */}
      <path d={`M176 ${GROUND + 2} q8 -10 24 -6 V${H} H176 Z`} fill="#8a8068" stroke={INK} strokeWidth="2" />
      <rect x="196" y={GROUND} width="204" height={H - GROUND} fill="#66704c" />
      <rect x="400" y={GROUND} width="200" height={H - GROUND} fill={hsl(mix(40, 105, field / 100), 40, mix(48, 42, field / 100))} />
      <rect x="600" y={GROUND} width="200" height={H - GROUND} fill="#8b8a86" />
      <rect x="800" y={GROUND} width="200" height={H - GROUND} fill={hsl(mix(32, 42, sand / 100), mix(45, 60, sand / 100), mix(58, 66, sand / 100))} />
      <rect x="1000" y={GROUND} width="110" height={H - GROUND} fill={hsl(mix(60, 115, tropic / 100), 38, mix(36, 30, tropic / 100))} />
      <path d={`M196 ${GROUND} H1110`} stroke={INK} strokeWidth="2.5" />
      <path d={`M1110 ${GROUND} V${H}`} stroke={INK} strokeWidth="2" />

      {/* ───── 한대: 남극 빙하 ───── */}
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
          <ellipse key={f} cx={iceW * f} cy={seaTop - 26} rx="10" ry="2.6" fill="#8cc8ea" stroke={INK} strokeWidth="1" />
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
          <path d={`M${iceW + 22} ${seaTop + 2} l7 -11 h12 l5 11z`} fill="#e9f6ff" stroke={INK} strokeWidth="2" />
          {ice < 40 && <path d={`M${iceW + 52} ${seaTop + 3} l5 -8 h9 l4 8z`} fill="#e9f6ff" stroke={INK} strokeWidth="2" />}
        </g>
      )}
      {Array.from({ length: penguins }).map((_, i) => (
        <Penguin key={i} x={20 + i * Math.max(18, (iceW - 36) / penguins)} y={seaTop - 28} />
      ))}

      {/* ───── 냉대: 타이가 숲과 땅속 얼음(영구동토층) ───── */}
      <g>
        {/* 땅을 잘라 본 단면: 아래쪽 하늘색 층이 땅속 얼음(영구동토층). 녹을수록 얇아짐 */}
        <rect x="200" y={GROUND + 36} width="200" height={permafrost} fill="#cfe0e6" stroke={INK} strokeWidth="1.4" />
        <rect x="200" y={GROUND + 36} width="200" height={permafrost} fill="url(#frost)" />
        {taiga < 50 && (
          <g>
            <ellipse cx="306" cy={GROUND + 5} rx="20" ry="4.5" fill="#6d8a86" stroke={INK} strokeWidth="1.5" />
            {taiga < 45 &&
              [0, 1, 2].map((i) => (
                <circle key={i} cx={298 + i * 8} cy={GROUND + 2} r="2.2" fill="none" stroke="#e8f6ff" strokeWidth="1.3" className="rise" style={{ animationDelay: `${i * 0.6}s` }} />
              ))}
          </g>
        )}
        {Array.from({ length: spruceCount }).map((_, i) => {
          const x = 212 + i * 24
          if (has('arctic_gas') && x > 330) return null
          if (has('fire_crew') && i === 0) return null
          const y = GROUND - 1 - (i % 2) * 4
          if (i < taigaBurnt) return <BurntTree key={i} x={x} y={y} s={0.9} />
          // 땅속 얼음이 녹으면 나무가 술 취한 듯 기울어짐 (실제로 '술 취한 숲'이라고 부름)
          const tilt = taiga < 50 ? [-12, 9, 0, -7, 11][i % 5] * ((50 - taiga) / 30) : 0
          return <Spruce key={i} x={x} y={y} s={0.95 + (i % 3) * 0.06} tilt={tilt} tone={i % 3} />
        })}
        {has('fire_crew') && <Lookout x={214} y={GROUND} />}
        {has('arctic_gas') && !gaia && (
          <g>
            <path d={`M330 ${GROUND + 6} H400`} stroke="#9a8f86" strokeWidth="5" />
            <path d={`M330 ${GROUND + 6} H400`} stroke={INK} strokeWidth="1.2" strokeDasharray="1 9" />
            <GasFlare x={372} y={GROUND} />
          </g>
        )}
        {taiga >= 30 && <Reindeer x={300} y={GROUND + 20} s={0.9} />}
        {taiga >= 60 && <Reindeer x={250} y={GROUND + 16} s={0.8} flip />}
        {taigaBurning && (
          <g>
            {[226, 262, 318, 352].map((x, i) => (
              <Flame key={x} x={x} y={GROUND - 2 - (i % 2) * 6} s={1.1} delay={i * 0.15} />
            ))}
            {[0, 1].map((i) => (
              <circle key={i} cx={250 + i * 70} cy={168} r={12 + i * 4} fill="#4b4540" stroke={INK} strokeWidth="1.2" className="smoke" style={{ animationDelay: `${i * 1.1}s` }} />
            ))}
          </g>
        )}
      </g>

      {/* ───── 온대: 농촌과 뒷산 ───── */}
      <g>
        <rect x="406" y={GROUND - 26} width="26" height="26" fill="#c94f3d" stroke={INK} strokeWidth="2" />
        <path d="M402 224 l17 -14 l17 14z" fill="#8f3a2c" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {Array.from({ length: Math.max(2, Math.min(6, Math.round(field / 16))) }).map((_, i) => (
          <path
            key={i}
            d={`M${442 + i * 12} ${GROUND + 24} v-14 m-3 2 l3 -6 l3 6`}
            stroke={field > 35 ? '#e2b53b' : '#9c7a4a'}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {!has('farm_closed') &&
          Array.from({ length: has('cattle_cut') ? 1 : has('cattle_keep') ? 3 : 2 }).map((_, i) => (
            <Cow key={i} x={454 + i * 25} y={GROUND - 2} s={0.8} />
          ))}
        {has('farm_closed') && (
          <g>
            <rect x="452" y={GROUND - 24} width="44" height="24" fill="#b7a58c" stroke={INK} strokeWidth="2" />
            <path d={`M452 ${GROUND - 16} h44`} stroke={INK} strokeWidth="1.2" />
          </g>
        )}
        {has('farm_shift') &&
          [410, 424].map((x) => (
            <g key={x}>
              <rect x={x - 2} y={GROUND + 18} width="4" height="8" fill="#f3ecd9" stroke={INK} strokeWidth="1.2" />
              <path d={`M${x - 8} ${GROUND + 18} q8 -12 16 0z`} fill="#d9412f" stroke={INK} strokeWidth="1.5" />
            </g>
          ))}
        {has('bees_gone') ? (
          <path d={`M508 ${GROUND + 20} q-4 -10 2 -16 M502 ${GROUND + 20} q2 -8 -3 -12`} stroke="#7a6046" strokeWidth="2" fill="none" />
        ) : (
          <g>
            <circle cx="510" cy={GROUND + 14} r="4" fill="#ffdd57" stroke={INK} strokeWidth="1.2" />
            <circle cx="500" cy={GROUND + 17} r="3.5" fill="#ff9fb8" stroke={INK} strokeWidth="1.2" />
          </g>
        )}
        {has('bees_saved') && (
          <g className="buzz">
            <ellipse cx="496" cy="236" rx="4" ry="3" fill="#ffd23f" stroke={INK} strokeWidth="1.2" />
            <ellipse cx="494" cy="232" rx="3" ry="2" fill="#fff" opacity="0.8" />
          </g>
        )}
        {field < 40 && (
          <path
            d={`M440 ${GROUND + 32} l10 6 l-6 8 M486 ${GROUND + 30} l-8 8 l10 7 M512 ${GROUND + 36} l8 -6 l6 10`}
            stroke="#4a3220"
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          />
        )}
        {field < 25 && (
          <g className="dust" fill="#c9a66b" opacity="0.6">
            <circle cx="452" cy="236" r="10" />
            <circle cx="470" cy="230" r="7" />
            <circle cx="500" cy="238" r="9" />
          </g>
        )}

        {/* 뒷산 숲 */}
        {Array.from({ length: Math.max(pines, woodsBurnt) }).map((_, i) => {
          const x = 532 + i * 20
          if (has('forest_dev') && x > 540 && x < 590) return null
          const y = GROUND - 4 - (i % 2) * 5
          if (i < woodsBurnt) return <BurntTree key={i} x={x} y={y} s={0.85} />
          return <Pine key={i} x={x} y={y} s={0.75 + (i % 3) * 0.06} tone={i % 3} />
        })}
        {has('forest_dev') && (
          <g>
            <Building x={544} w={22} h={74} lit={60} dark={gaia} />
            <Building x={568} w={20} h={58} lit={50} dark={gaia} />
          </g>
        )}
        {has('eco_bridge') && <path d={`M538 ${GROUND} q28 -32 56 0`} fill="none" stroke="#3f7d3a" strokeWidth="8" strokeLinecap="round" />}
        {has('solar_forest') && (
          <g>
            <path d={`M520 ${GROUND + 14} l12 -7 h14 l-12 7z`} fill="#3e6fd1" stroke={INK} strokeWidth="1.5" />
            <path d={`M532 ${GROUND + 24} l12 -7 h14 l-12 7z`} fill="#3e6fd1" stroke={INK} strokeWidth="1.5" />
          </g>
        )}
        {woods >= 30 && <Deer x={has('forest_dev') ? 590 : 566} y={GROUND + 20} s={0.8} />}
        {woods >= 65 && <Deer x={540} y={GROUND + 26} s={0.75} />}
        {!has('boar_cull') && <Boar x={582} y={GROUND + 32} s={0.75} />}
        {woods < 32 && (
          <g>
            {[530, 556, 584].map((x, i) => (
              <Flame key={x} x={x} y={GROUND - 4 - (i % 2) * 6} s={1.05} delay={i * 0.15} />
            ))}
            <circle cx="556" cy="170" r="13" fill="#4b4540" stroke={INK} strokeWidth="1.2" className="smoke" />
          </g>
        )}
      </g>

      {/* ───── 온대: 강변 공업 도시 ───── */}
      <path
        d="M600 300 q50 -10 100 0 t100 -2 V318 q-50 6 -100 2 t-100 0 Z"
        fill={hsl(mix(30, 205, river / 100), mix(35, 65, river / 100), mix(36, 52, river / 100))}
        stroke={INK}
        strokeWidth="2"
      />
      {river >= 60 && <path d="M672 302 q8 -14 16 -2" fill="#ff9a6b" stroke={INK} strokeWidth="1.5" className="jump" />}
      {river < 45 && <ellipse cx="712" cy="307" rx="30" ry="4" fill="url(#oil)" opacity="0.85" />}
      {river < 35 && (
        <>
          <DeadFish x={640} y={304} />
          <DeadFish x={760} y={306} />
          <g>
            <path d="M786 296 v-18" stroke={INK} strokeWidth="2.2" />
            <path d="M786 262 l9 15 h-18z" fill="#ffd23f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <text x="786" y="275" fontSize="10" textAnchor="middle" fill={INK}>!</text>
          </g>
        </>
      )}
      {river < 30 && !gaia && (
        <g fill="#3d3733" stroke={INK} strokeWidth="1.5" opacity="0.85" className="drift">
          <circle cx="630" cy="152" r="17" />
          <circle cx="652" cy="142" r="21" />
          <circle cx="676" cy="154" r="15" />
        </g>
      )}
      {gaia ? (
        <g opacity="0.75">
          <Factory x={636} y={GROUND} smoke={0} dark s={0.75} />
          <path d="M620 250 q8 -18 16 -8 q6 -14 14 -2" stroke="#4f8d45" strokeWidth="3" fill="none" />
        </g>
      ) : (
        Array.from({ length: Math.min(3, (has('factory_limit') ? 1 : has('factory_boom') ? 3 : 2) + (has('deregulate') ? 1 : 0)) }).map((_, i) => (
          <Factory
            key={i}
            x={622 + i * 34}
            y={GROUND}
            s={0.75}
            smoke={has('factory_limit') ? 0 : has('factory_boom') || has('deregulate') ? 3 : 2}
            dark={has('factory_boom')}
            solar={has('green_jobs') && i === 0}
          />
        ))
      )}
      {has('workers_left') && !gaia && (
        <g>
          <rect x="618" y="216" width="28" height="15" fill="#fff8e6" stroke={INK} strokeWidth="1.5" />
          <text x="632" y="227" fontSize="9" textAnchor="middle" fill={INK}>임대</text>
        </g>
      )}
      <Building x={712} w={24} h={96} lit={human} dark={gaia} />
      <Building x={738} w={20} h={70} lit={human} dark={gaia} />
      <Building x={760} w={34} h={120} lit={human} dark={gaia} />
      {has('mall_24h') && !gaia && (
        <g className="neon">
          <rect x="762" y="160" width="30" height="12" fill="#ff4fa3" stroke={INK} strokeWidth="1.5" />
          <text x="777" y="169" fontSize="8" textAnchor="middle" fill="#fff">24H</text>
        </g>
      )}
      {has('four_day') && !gaia && <Pine x={704} y={GROUND} s={0.5} />}
      {gaia && <path d="M716 250 q6 -24 14 -6 M766 250 q8 -30 16 -4" stroke="#4f8d45" strokeWidth="3" fill="none" />}
      {economy < 30 && !gaia && (
        <g>
          {[
            [712, 24],
            [760, 34],
          ].map(([x, w]) => (
            <g key={x}>
              <rect x={x} y={GROUND - 14} width={w} height="14" fill="#a3a3a3" stroke={INK} strokeWidth="1.5" />
              <path d={`M${x} ${GROUND - 9} h${w} M${x} ${GROUND - 5} h${w}`} stroke="#6f6f6f" strokeWidth="1.2" />
            </g>
          ))}
          <rect x="762" y={GROUND - 28} width="28" height="11" fill="#fff8d6" stroke={INK} strokeWidth="1.3" />
          <text x="776" y={GROUND - 19.5} fontSize="8" textAnchor="middle" fill="#c8322a">폐업</text>
        </g>
      )}
      {human < 30 && !gaia && (
        <path d="M778 140 l-6 14 l8 10 l-7 16 l6 12" stroke={INK} strokeWidth="2.4" fill="none" strokeLinejoin="round" />
      )}
      <rect x="600" y="272" width="200" height="12" fill="#55565a" stroke={INK} strokeWidth="2" />
      {protest && (
        <g>
          <Protester x={714} y={271} word="반대" />
          <Protester x={740} y={271} word="!!" />
          <Protester x={766} y={271} word="멈춰" />
        </g>
      )}
      {!gaia && (
        <g className="drive">
          <rect x="604" y="263" width="18" height="9" rx="3" fill={has('ev_cars') ? '#57c27a' : '#d7553f'} stroke={INK} strokeWidth="1.6" />
          {!has('ev_cars') && <circle cx="600" cy="268" r="3" fill="#a9a29a" />}
        </g>
      )}
      {has('flight_ban') && !gaia && (
        <g className="drive slow">
          <rect x="604" y="252" width="40" height="10" rx="5" fill="#f1f1f1" stroke={INK} strokeWidth="1.6" />
          <rect x="609" y="255" width="26" height="3.5" fill="#3e6fd1" />
        </g>
      )}

      {/* ───── 건조: 사막 마을과 오아시스 ───── */}
      <g>
        {has('green_wall') && [812, 858, 906, 954, 992].map((x) => <Acacia key={x} x={x} y={GROUND - 2} s={0.9} />)}
        <path
          d={`M800 ${GROUND} q24 ${-duneH} 52 -2 q30 ${-duneH * 1.3} 64 0 q30 ${-duneH * 0.8} 54 0 q16 ${-duneH} 30 0 Z`}
          fill={hsl(mix(30, 40, sand / 100), 55, mix(56, 62, sand / 100))}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <PumpJack x={824} y={GROUND} running={!gaia && !has('oil_stop')} rusty={has('oil_stop')} />
        {sand >= 25 && <Camel x={876} y={GROUND + 4} s={0.85} />}
        {oasisDry ? (
          <path d={`M904 ${GROUND + 14} q20 -6 40 0 q-20 6 -40 0z M912 ${GROUND + 13} l6 3 l6 -3 M928 ${GROUND + 12} l5 4`} fill="#b99a64" stroke={INK} strokeWidth="1.4" />
        ) : (
          <ellipse cx="924" cy={GROUND + 14} rx={6 + sand * 0.18} ry="5" fill="#4f9fd0" stroke={INK} strokeWidth="1.6" />
        )}
        <DatePalm x={946} y={GROUND + 8} dead={oasisDry} />
        <MudHouse x={968} y={GROUND} />
        <MudHouse x={990} y={GROUND + 2} buried={has('desert_spread')} />
        {has('ev_cars') && (
          <g>
            <rect x="808" y={GROUND + 20} width="26" height="10" fill="#5fd0c9" stroke={INK} strokeWidth="1.5" />
            <rect x="838" y={GROUND + 20} width="26" height="10" fill="#c9e27a" stroke={INK} strokeWidth="1.5" />
            <g transform={`translate(876 ${GROUND + 34})`}>
              <path d="M0 0 v-12 M3 0 l-3 -12" stroke="#c2577a" strokeWidth="1.3" />
              <ellipse cx="0" cy="-15" rx="6" ry="3.5" fill="#f29bb5" stroke={INK} strokeWidth="1.2" />
              <path d="M5 -16 q4 -8 0 -12 l3 1" stroke="#f29bb5" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </g>
        )}
        {has('refugee_reject') && !gaia && [944, 966, 988].map((x) => <Tent key={x} x={x} y={GROUND + 34} />)}
        {sand < 35 && (
          <g className="storm" stroke="#d9b56f" strokeWidth="2.4" opacity="0.7" strokeLinecap="round">
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={806 + i * 24} y1={176 + (i % 3) * 22} x2={826 + i * 24} y2={180 + (i % 3) * 22} />
            ))}
          </g>
        )}
      </g>

      {/* ───── 열대: 우림 ───── */}
      <g>
        {Array.from({ length: rainTrees }).map((_, i) => {
          const x = 1014 + i * 22
          if (has('palm_keep') && i >= 2) return null
          return <RainTree key={i} x={x} y={GROUND - (i % 2) * 6} s={0.95 + (i % 3) * 0.1} tone={i % 3} />
        })}
        {has('palm_keep') && (
          <g>
            {[1060, 1078, 1096].map((x) => (
              <g key={x}>
                <OilPalm x={x} y={GROUND} />
                <OilPalm x={x - 8} y={GROUND + 16} />
              </g>
            ))}
          </g>
        )}
        {(has('meat_daily') || tropic < 40) && [1018, 1036].map((x) => <Stump key={x} x={x} y={GROUND + 26} />)}
        {!has('palm_keep') && tropic >= 40 && <Orangutan x={1040} y={GROUND - 36} />}
        {tropic >= 55 && <Parrot x={1086} y={GROUND - 52} />}
        {tropic < 32 && (
          <g>
            {[1020, 1056, 1092].map((x, i) => (
              <Flame key={x} x={x} y={GROUND - 2 - (i % 2) * 6} s={1.1} delay={i * 0.15} />
            ))}
            <circle cx="1050" cy="166" r="15" fill="#4b4540" stroke={INK} strokeWidth="1.2" className="smoke" />
          </g>
        )}
      </g>

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

      {/* 기후대 경계선 (같은 온대인 농촌과 도시 사이는 긋지 않음) */}
      {!crop &&
        [200, 400, 800, 1000].map((x) => (
          <path key={x} d={`M${x} ${TOP + 4} V${H - 30}`} stroke="#fffaf0" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.55" />
        ))}

      {/* 지역 강조 + 이름표 */}
      {!crop &&
        (Object.keys(ZONE_X) as ZoneId[]).map((id) => {
          const [x0, x1] = ZONE_X[id]
          const lit = highlight === id
          const z = zones[id]
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
              <g transform={`translate(${(x0 + x1) / 2} ${H - 14})`} className={z.health < 20 ? 'svg-blink' : undefined}>
                <rect
                  x="-50"
                  y="-12"
                  width="100"
                  height="20"
                  rx="4"
                  fill={lit ? '#ffe45c' : z.health < 35 ? '#ff6b5b' : '#fffaf0'}
                  stroke={INK}
                  strokeWidth="2"
                />
                <text textAnchor="middle" y="3" fontSize="12" fill={INK}>
                  {z.health < 35 ? `⚠ ${ZONE_LABEL[id]}` : ZONE_LABEL[id]}
                </text>
              </g>
              <title>{`${ZONE_INFO[id].climate} 기후 (${ZONE_INFO[id].rule}) · ${z.name}: ${z.status}`}</title>
            </g>
          )
        })}
      {highlight === 'all' && <rect x="0" y="0" width={W} height={H} fill="#ff2040" className="alarm-tint" />}
      {flash && !crop && (
        <g key={flash.id}>
          {(() => {
            const [x0, x1] = flash.zone === 'all' ? [0, W] : ZONE_X[flash.zone]
            // 글씨 상자가 화면 밖으로 잘리지 않게 가운데를 안쪽으로 당김
            const half = flash.text.length * 6 + 12
            const cx = Math.max(half + 8, Math.min(W - half - 8, (x0 + x1) / 2))
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
                    <text textAnchor="middle" y="2" fontSize="17" fill={flash.good ? '#1d8a45' : '#c8322a'}>
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
