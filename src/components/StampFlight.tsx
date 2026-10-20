// 도장이 직접 날아가서 서류에 쾅 찍고 제자리로 돌아오는 모션
// 버튼 자리에서 똑같이 생긴 도장을 띄워 서류의 '처리 결과' 칸까지 움직임
// 화면이 무대(Stage)로 줄어 있어도 크기가 맞도록 줄어든 비율(scale)을 함께 씀

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { isStaged } from './Stage.tsx'

export interface Flight {
  id: number
  side: 'approve' | 'reject'
  label: string
  /** 화면에 보이는 도장 위치 */
  from: DOMRect
  /** 화면에 보이는 '처리 결과' 칸 위치 */
  to: DOMRect
  /** 줄이기 전 도장 크기 */
  w: number
  h: number
}

interface Props {
  flight: Flight
  /** 도장이 종이에 닿는 순간 */
  onPress: () => void
  /** 제자리로 돌아온 뒤 */
  onDone: () => void
}

export const FLIGHT_MS = 900
const PRESS_AT = 0.52

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** 도장 버튼과 목표 칸으로 비행 정보를 만듦. 폰에서는 목표 칸이 가려지지 않게 먼저 스크롤 */
export function makeFlight(btn: HTMLElement, target: Element, side: Flight['side'], label: string): Flight {
  if (!isStaged()) {
    const r = target.getBoundingClientRect()
    if (r.top < 0 || r.bottom > window.innerHeight - 140) target.scrollIntoView({ block: 'center' })
  }
  return {
    id: Date.now(),
    side,
    label,
    from: btn.getBoundingClientRect(),
    to: target.getBoundingClientRect(),
    w: btn.offsetWidth,
    h: btn.offsetHeight,
  }
}

export default function StampFlight({ flight, onPress, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const press = useRef(onPress)
  const done = useRef(onDone)
  press.current = onPress
  done.current = onDone

  const { from, to, w, h } = flight
  const s = from.width / w

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const dx = to.left + to.width / 2 - (from.left + from.width / 2)
    const dy = to.top + to.height / 2 + 30 * s - from.bottom
    const at = (x: number, y: number, deg: number, k: number) =>
      `translate(${x}px, ${y}px) rotate(${deg}deg) scale(${s * k})`
    const anim = el.animate(
      [
        { transform: at(0, 0, 0, 1), offset: 0 },
        { transform: at(0, -34 * s, -10, 1.1), offset: 0.16 },
        { transform: at(dx, dy - 70 * s, -14, 1.14), offset: 0.44 },
        { transform: at(dx, dy, -12, 0.94), offset: PRESS_AT },
        { transform: at(dx, dy, -12, 0.94), offset: 0.62 },
        { transform: at(dx, dy - 56 * s, -6, 1.06), offset: 0.76 },
        { transform: at(0, 0, 0, 1), offset: 1 },
      ],
      { duration: FLIGHT_MS, easing: 'ease-in-out' },
    )
    const t = window.setTimeout(() => press.current(), FLIGHT_MS * PRESS_AT)
    anim.onfinish = () => done.current()
    return () => {
      clearTimeout(t)
      anim.cancel()
    }
  }, [flight, from, to, s])

  // 책상이 흔들리거나 무대가 줄어 있어도 위치가 틀어지지 않게 body 바로 아래에 띄움
  return createPortal(
    <div
      ref={ref}
      className={`stamp stamp--${flight.side} stamp--flying`}
      style={{
        left: from.left + from.width / 2 - w / 2,
        top: from.bottom - h,
        width: w,
        height: h,
        transform: `scale(${s})`,
      }}
      aria-hidden
    >
      <span className="stamp__handle" />
      <span className="stamp__neck" />
      <span className="stamp__face">{flight.label}</span>
    </div>,
    document.body,
  )
}
