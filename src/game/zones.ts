// 지구 지도: 지금까지의 결정으로 각 지역이 어떤 모습인지 계산
// 숫자는 화면 표현용 가상 값 (0~100)

import type { GameState, ZoneId } from './types.ts'

export interface ZoneView {
  id: ZoneId
  name: string
  icon: string
  /** 지역 상태 (0 나쁨 ~ 100 좋음) */
  health: number
  /** 지역 안에 그릴 그림들 */
  scene: string[]
  status: string
}

const clamp = (n: number) => Math.round(Math.max(0, Math.min(100, n)))
const times = (emoji: string, n: number) => Array.from({ length: Math.max(0, n) }, () => emoji)

export const ZONE_ORDER: ZoneId[] = ['antarctic', 'forest', 'industrial', 'coast', 'farm', 'city']

export function zoneViews(state: GameState): ZoneView[] {
  const has = (f: string) => state.flags.includes(f)
  const bonus = (f: string, n: number) => (has(f) ? n : 0)
  const { earth, human } = state.stats
  const gaia = has('gaia')

  // 남극
  const ice = clamp(
    earth + bonus('fossil_limit', 10) + bonus('oil_stop', 6) + bonus('carbon_tax', 6) - bonus('fossil_free', 10),
  )
  const antarctic: ZoneView = {
    id: 'antarctic',
    name: '남극',
    icon: '🧊',
    health: ice,
    scene: [
      ...times('🧊', Math.max(1, Math.round(ice / 20))),
      ...times('🐧', ice >= 60 ? 3 : ice >= 30 ? 2 : 1),
      ...(has('sky_shield') ? ['🌫️'] : []),
    ],
    status:
      ice >= 65 ? '얼음이 다시 늘고 있어요' : ice >= 40 ? '얼음이 조금씩 녹는 중' : ice >= 20 ? '빙하가 빠르게 줄어요' : '빙하 붕괴 직전',
  }

  // 뒷산 숲
  const woods = clamp(
    55 +
      (earth - 50) * 0.6 +
      bonus('forest_protect', 15) -
      bonus('forest_dev', 25) +
      bonus('eco_bridge', 12) -
      bonus('solar_forest', 6) +
      bonus('bees_saved', 6) -
      bonus('bees_gone', 10) +
      bonus('reserve_wide', 15) -
      bonus('reserve_open', 6) -
      bonus('deregulate', 8) +
      (gaia ? 25 : 0),
  )
  const forest: ZoneView = {
    id: 'forest',
    name: '뒷산 숲',
    icon: '🌲',
    health: woods,
    scene: [
      ...times('🌲', Math.min(6, Math.max(1, Math.round(woods / 17)))),
      ...(has('forest_dev') ? ['🏢', '🏢'] : []),
      ...(has('eco_bridge') ? ['🌉'] : []),
      ...(has('solar_forest') ? ['🔆'] : ['🦉']),
      ...times('🦌', woods >= 65 ? 2 : woods >= 30 ? 1 : 0),
      ...(has('boar_cull') ? [] : ['🐗']),
    ],
    status: has('forest_dev')
      ? has('eco_bridge')
        ? '생태 통로로 숲이 다시 이어졌어요'
        : '아파트 때문에 숲이 둘로 끊겼어요'
      : woods >= 65
        ? '숲이 울창해요'
        : woods >= 40
          ? '그럭저럭 버티는 숲'
          : '숲이 말라 가요',
  }

  // 강변 공업도시
  const river = gaia
    ? 90
    : clamp(
        50 +
          bonus('factory_limit', 20) +
          bonus('river_clean', 25) -
          bonus('factory_run', 10) -
          bonus('river_dead', 25) -
          bonus('factory_boom', 20) -
          bonus('deregulate', 10) +
          (earth - 50) * 0.3,
      )
  const factoryCount = gaia ? 0 : Math.min(3, (has('factory_limit') ? 1 : has('factory_boom') ? 3 : 2) + bonus('deregulate', 1))
  const jobs = has('workers_left')
    ? '사람들이 떠남'
    : has('green_jobs')
      ? '새 일자리'
      : has('factory_limit')
        ? '불안'
        : '유지'
  const industrial: ZoneView = {
    id: 'industrial',
    name: '강변 공업도시',
    icon: '🏭',
    health: river,
    scene: gaia
      ? ['🏚️', '🏚️', '🐟', '🐟', '🐟']
      : [
          ...times('🏭', factoryCount),
          ...(has('factory_limit') ? [] : times('💨', factoryCount)),
          ...times('🐟', river >= 60 ? 2 : river >= 35 ? 1 : 0),
          ...(has('workers_left') ? ['🧳'] : has('green_jobs') ? ['👷', '🔆'] : ['👷']),
        ],
    status: gaia
      ? '공장이 모두 멈췄어요'
      : `강 ${river >= 60 ? '맑음' : river >= 35 ? '조금 탁함' : '오염 심각'} · 일자리 ${jobs}`,
  }

  // 해안 마을
  const shore = clamp(
    earth * 0.7 +
      15 +
      bonus('plastic_ban', 12) +
      bonus('seawall', 5) -
      bonus('coast_flooded', 30) +
      bonus('fossil_limit', 6) -
      bonus('fossil_free', 6) +
      (gaia ? 10 : 0),
  )
  const coast: ZoneView = {
    id: 'coast',
    name: '해안 마을',
    icon: '🏖️',
    health: shore,
    scene: [
      ...(has('coast_flooded') ? ['🏚️'] : gaia ? ['🏠'] : ['🏠', '🏠', '🏠']),
      ...(has('seawall') ? ['🧱'] : []),
      ...times('🌊', has('coast_flooded') ? 3 : shore < 40 ? 2 : 1),
      ...(has('plastic_ban') ? ['🐢', '🐢'] : ['🛍️']),
      ...(has('refugee_welcome') ? ['🧳'] : []),
    ],
    status: has('coast_flooded')
      ? '마을이 바닷물에 잠겼어요'
      : has('seawall')
        ? '방파제가 마을을 지켜요'
        : has('plastic_ban')
          ? '바다가 깨끗해졌어요'
          : shore >= 50
            ? '평화로운 바닷가'
            : '바닷물이 차오르고 있어요',
  }

  // 농촌
  const field = clamp(
    50 +
      (earth - 50) * 0.6 +
      bonus('farm_shift', 12) +
      bonus('bees_saved', 10) -
      bonus('bees_gone', 15) -
      bonus('cattle_keep', 6) +
      bonus('cattle_cut', 4) -
      bonus('farm_closed', 10),
  )
  const farm: ZoneView = {
    id: 'farm',
    name: '농촌',
    icon: '🌾',
    health: field,
    scene: [
      ...times('🌾', Math.max(1, Math.round(field / 25))),
      ...times('🐄', has('cattle_cut') ? 1 : has('cattle_keep') ? 3 : 2),
      ...(has('farm_shift') ? ['🍄', '🍄'] : []),
      ...(has('farm_closed') ? ['📦'] : []),
      ...(has('bees_gone') ? ['🥀'] : has('bees_saved') ? ['🐝', '🌼'] : ['🌼']),
    ],
    status: has('bees_gone')
      ? '벌이 사라져 꽃가루받이가 힘들어요'
      : has('farm_shift')
        ? '버섯 농장이 잘돼요'
        : has('farm_closed')
          ? '목장이 문을 닫았어요'
          : field >= 60
            ? '풍년이에요'
            : field >= 35
              ? '평범한 한 해'
              : '가뭄이 이어져요',
  }

  // 도시
  const town = clamp(
    (earth + human) / 2 +
      bonus('ev_cars', 8) -
      bonus('factory_boom', 12) -
      bonus('mall_24h', 6) +
      bonus('four_day', 6) +
      bonus('basic_support', 6),
  )
  const smog = has('factory_boom') || earth < 35
  const city: ZoneView = {
    id: 'city',
    name: '도시',
    icon: '🏙️',
    health: town,
    scene: gaia
      ? ['🏚️', '🏚️', '🌿', '🌿', '🐦']
      : [
          ...times('👥', Math.max(1, Math.round(human / 34))),
          ...(has('ev_cars') ? ['🚙', '⚡'] : ['🚗', '🚗']),
          has('flight_ban') ? '🚄' : '✈️',
          ...(smog ? ['🌫️'] : []),
          ...(has('mall_24h') ? ['🛍️'] : []),
          ...(has('four_day') ? ['🧺'] : []),
        ],
    status: gaia
      ? '사람이 거의 남지 않았어요'
      : state.trust.citizen <= 25
        ? '광장에 시위가 열렸어요'
        : smog
          ? '미세먼지 경보가 울려요'
          : has('ev_cars')
            ? '거리가 조용해졌어요'
            : town >= 60
              ? '살기 좋은 도시'
              : '바쁘고 복잡한 도시',
  }

  return [antarctic, forest, industrial, coast, farm, city]
}
