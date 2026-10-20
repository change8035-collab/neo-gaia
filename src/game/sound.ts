// 효과음: 파일 없이 브라우저에서 바로 합성 (Web Audio)
// 도장 쾅, 종이 스윽, 타자 소리, 경보음 등

const KEY = 'neo-gaia-muted'
let ctx: AudioContext | null = null
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
})()

export const isMuted = () => muted

export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(KEY, m ? '1' : '0')
  } catch {
    // 저장 실패는 무시
  }
}

function audio(): AudioContext | null {
  if (muted) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, at = 0, slideTo?: number) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + at
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise(dur: number, vol: number, filterFrom: number, filterTo: number, at = 0) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + at
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filterFrom, t)
  filter.frequency.exponentialRampToValueAtTime(filterTo, t + dur)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(gain).connect(ac.destination)
  src.start(t)
}

export const sfx = {
  /** 도장 쾅 */
  stamp() {
    tone(140, 0.18, 'sine', 0.55, 0, 45)
    noise(0.09, 0.35, 1200, 200)
  },
  /** 종이가 책상 위로 스윽 */
  paper() {
    noise(0.28, 0.12, 3500, 500)
  },
  /** 네오 가이아 타자 */
  type() {
    tone(1800 + Math.random() * 400, 0.02, 'square', 0.03)
  },
  /** 좋은 일 */
  good() {
    tone(660, 0.12, 'triangle', 0.15)
    tone(880, 0.16, 'triangle', 0.15, 0.09)
  },
  /** 나쁜 일 */
  bad() {
    tone(330, 0.2, 'triangle', 0.15, 0, 220)
  },
  /** 가이아의 선택 경보 */
  alarm() {
    for (let i = 0; i < 3; i++) {
      tone(520, 0.16, 'square', 0.08, i * 0.36)
      tone(390, 0.16, 'square', 0.08, i * 0.36 + 0.18)
    }
  },
  /** 동전이 투입구로 쏙 */
  coin() {
    tone(1900, 0.07, 'triangle', 0.14)
    tone(2600, 0.16, 'triangle', 0.1, 0.06)
    noise(0.05, 0.08, 4000, 1500, 0.18)
  },
  /** 손잡이가 한 칸 걸리는 딸깍 */
  click() {
    tone(900, 0.025, 'square', 0.06)
    noise(0.03, 0.1, 2500, 800)
  },
  /** 캡슐이 배출구에 떨어지는 덜컹 */
  clunk() {
    tone(120, 0.2, 'sine', 0.4, 0, 60)
    noise(0.12, 0.22, 900, 200)
    tone(240, 0.06, 'triangle', 0.08, 0.14)
  },
  /** 캡슐을 비트는 소리 */
  twist() {
    noise(0.22, 0.08, 3000, 1200)
  },
  /** 캡슐 열리는 소리 */
  pop() {
    tone(500, 0.08, 'sine', 0.25, 0, 1200)
    tone(1000, 0.25, 'triangle', 0.12, 0.08)
  },
}
