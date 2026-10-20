// 게임 화면을 정해진 크기(무대)로 그린 뒤, 브라우저 창 크기에 맞춰 통째로 줄이거나 늘림
// → 노트북이든 큰 모니터든 스크롤 없이 한 화면에 다 보임
// 폰처럼 좁은 화면에서는 너무 작아지므로 원래대로 세로로 쌓아서 보여 줌

import { useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'

export const STAGE_W = 1280
export const STAGE_H = 790
const PHONE = 760
const MARGIN = 20

/** 지금 무대가 축소/확대 중인지 (폰이 아니면 true) */
export const isStaged = () => typeof window !== 'undefined' && window.innerWidth > PHONE

export default function Stage({ children }: { children: ReactNode }) {
  const [view, setView] = useState({ staged: isStaged(), scale: 1 })

  useLayoutEffect(() => {
    const update = () =>
      setView({
        staged: isStaged(),
        scale: Math.min((window.innerWidth - MARGIN) / STAGE_W, (window.innerHeight - MARGIN) / STAGE_H),
      })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!view.staged) return <>{children}</>

  return (
    <div className="stage" style={{ height: STAGE_H * view.scale }}>
      <div
        className="stage__inner"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translateX(-50%) scale(${view.scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
