// 네오 가이아의 브라운관 모니터: 창밖 지구 풍경 + 상태 줄 + 속보 자막

import type { ReactNode } from 'react'
import Panorama from './Panorama.tsx'
import type { ComponentProps } from 'react'
import type { GameState, ZoneId } from '../game/types.ts'

interface Props {
  game: GameState
  highlight?: ZoneId | 'all' | null
  status?: ReactNode
  ticker?: string
  /** 화면 가운데 크게 띄울 안내 (단계 전환 등) */
  overlay?: { title: string; desc?: string } | null
  alarm?: boolean
  /** 도장을 찍은 순간 번쩍일 지역 */
  flash?: ComponentProps<typeof Panorama>['flash']
}

export default function Monitor({ game, highlight, status, ticker, overlay, alarm, flash }: Props) {
  return (
    <div className={`monitor ${alarm ? 'monitor--alarm' : ''}`}>
      <div className={`monitor__screen ${flash && !flash.good ? 'monitor__screen--hit' : ''}`} key={flash?.id}>
        <Panorama game={game} highlight={highlight} flash={flash} />
        <div className="monitor__scan" />
        {status && <div className="monitor__status px">{status}</div>}
        {overlay && (
          <div className="monitor__overlay" key={overlay.title}>
            <b className="px">{overlay.title}</b>
            {overlay.desc && <span className="px">{overlay.desc}</span>}
          </div>
        )}
      </div>
      <div className="monitor__chin">
        {ticker ? (
          <div className="monitor__ticker px">
            <span key={ticker}>{ticker}</span>
          </div>
        ) : (
          <span className="px">NEO GAIA · 기후관리 시스템</span>
        )}
        <i className="led" />
      </div>
    </div>
  )
}
