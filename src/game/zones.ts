// 지구 지도: 지금까지의 결정으로 기후대마다 어떤 모습인지 계산
// 숫자는 화면 표현용 가상 값 (0~100)
// 풍경은 극지방에서 적도 쪽으로 한대 → 냉대 → 온대(농촌·도시) → 건조 → 열대 순서

import type { GameState, ZoneId } from './types.ts'

export interface ZoneView {
  id: ZoneId
  /** 기후대 이름 (한대, 냉대 …) */
  climate: string
  /** 그 기후대에서 보여 주는 곳 */
  name: string
  /** 교과서 기준 한 줄 (쾨펜 기후 구분) */
  rule: string
  icon: string
  /** 지역 상태 (0 나쁨 ~ 100 좋음) */
  health: number
  status: string
}

const clamp = (n: number) => Math.round(Math.max(0, Math.min(100, n)))

export const ZONE_ORDER: ZoneId[] = ['polar', 'subarctic', 'rural', 'city', 'dry', 'tropical']

// 기준: 쾨펜 기후 구분 (표준국어대사전 뜻풀이, Kottek 외 2006)
export const ZONE_INFO: Record<ZoneId, { climate: string; name: string; rule: string; icon: string }> = {
  polar: { climate: '한대', name: '남극 빙하', rule: '가장 따뜻한 달 평균 기온 10℃ 미만', icon: '🧊' },
  subarctic: { climate: '냉대', name: '타이가 숲', rule: '가장 추운 달 -3℃ 이하, 가장 따뜻한 달 10℃ 이상', icon: '🌲' },
  rural: { climate: '온대', name: '농촌과 뒷산', rule: '가장 추운 달 평균 기온 -3℃ 초과 18℃ 미만', icon: '🌾' },
  city: { climate: '온대', name: '공업 도시', rule: '가장 추운 달 평균 기온 -3℃ 초과 18℃ 미만', icon: '🏙️' },
  dry: { climate: '건조', name: '사막 마을', rule: '내리는 비보다 증발하는 물이 더 많음', icon: '🏜️' },
  tropical: { climate: '열대', name: '우림과 산호섬', rule: '가장 추운 달 평균 기온 18℃ 이상', icon: '🌴' },
}

/* 풍경 그림이 따로 쓰는 세부 상태들 */

export function iceHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  return clamp(state.stats.earth + b('fossil_limit', 10) + b('oil_stop', 6) + b('carbon_tax', 6) - b('fossil_free', 10) - b('oil_keep', 4))
}

export function taigaHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  return clamp(
    55 +
      (state.stats.earth - 50) * 0.7 +
      b('fossil_limit', 6) +
      b('carbon_tax', 6) -
      b('fossil_free', 6) -
      b('arctic_gas', 18) +
      b('fire_crew', 14) -
      b('fire_ignored', 12) -
      b('deregulate', 6) +
      b('gaia', 20),
  )
}

export function woodsHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  return clamp(
    55 +
      (state.stats.earth - 50) * 0.6 +
      b('forest_protect', 15) -
      b('forest_dev', 25) +
      b('eco_bridge', 12) -
      b('solar_forest', 6) +
      b('bees_saved', 6) -
      b('bees_gone', 10) -
      b('reserve_open', 6) -
      b('deregulate', 8) +
      b('gaia', 25),
  )
}

export function fieldHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  return clamp(
    50 +
      (state.stats.earth - 50) * 0.6 +
      b('farm_shift', 12) +
      b('bees_saved', 10) -
      b('bees_gone', 15) -
      b('cattle_keep', 6) +
      b('cattle_cut', 4) -
      b('farm_closed', 10),
  )
}

export function riverHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  if (has('gaia')) return 90
  return clamp(
    50 +
      b('factory_limit', 20) +
      b('river_clean', 25) -
      b('factory_run', 10) -
      b('river_dead', 25) -
      b('factory_boom', 20) -
      b('deregulate', 10) +
      (state.stats.earth - 50) * 0.3,
  )
}

export function townHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  return clamp(
    (state.stats.earth + state.stats.human) / 2 +
      b('ev_cars', 8) -
      b('factory_boom', 12) -
      b('mall_24h', 6) +
      b('four_day', 6) +
      b('basic_support', 6),
  )
}

export function desertHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  return clamp(
    50 +
      (state.stats.earth - 50) * 0.6 +
      b('green_wall', 18) -
      b('desert_spread', 14) -
      b('ev_cars', 4) -
      b('oil_keep', 4) +
      b('oil_stop', 4) +
      b('gaia', 10),
  )
}

export function tropicHealth(state: GameState): number {
  const has = (f: string) => state.flags.includes(f)
  const b = (f: string, n: number) => (has(f) ? n : 0)
  return clamp(
    state.stats.earth * 0.6 +
      22 +
      b('plastic_ban', 10) +
      b('palm_limit', 14) -
      b('palm_keep', 14) -
      b('meat_daily', 8) +
      b('less_meat', 4) +
      b('reserve_wide', 12) +
      b('fossil_limit', 4) -
      b('fossil_free', 4) -
      b('coast_flooded', 20) +
      b('gaia', 15),
  )
}

export function zoneViews(state: GameState): ZoneView[] {
  const has = (f: string) => state.flags.includes(f)
  const gaia = has('gaia')
  const make = (id: ZoneId, health: number, status: string): ZoneView => ({ id, ...ZONE_INFO[id], health, status })

  const ice = iceHealth(state)
  const polar = make(
    'polar',
    ice,
    ice >= 65 ? '얼음이 다시 늘고 있어요' : ice >= 40 ? '얼음이 조금씩 녹는 중' : ice >= 20 ? '빙하가 빠르게 줄어요' : '빙하 붕괴 직전',
  )

  const taiga = taigaHealth(state)
  const subarctic = make(
    'subarctic',
    taiga,
    has('arctic_gas')
      ? '가스전 공사로 땅속 얼음이 녹아요'
      : has('fire_crew')
        ? '산불 감시대가 숲을 지켜요'
        : taiga >= 65
          ? '울창한 침엽수림'
          : taiga >= 40
            ? '땅속 얼음이 조금씩 녹아요'
            : '산불이 번지고 땅이 꺼져요',
  )

  const woods = woodsHealth(state)
  const field = fieldHealth(state)
  const rural = make(
    'rural',
    clamp((woods + field) / 2),
    has('bees_gone')
      ? '벌이 사라져 꽃가루받이가 힘들어요'
      : has('forest_dev')
        ? has('eco_bridge')
          ? '생태 통로로 숲이 다시 이어졌어요'
          : '아파트 때문에 숲이 둘로 끊겼어요'
        : has('farm_shift')
          ? '버섯 농장이 잘돼요'
          : field >= 60
            ? '풍년이고 숲도 울창해요'
            : field >= 35
              ? '평범한 한 해'
              : '가뭄이 이어져요',
  )

  const river = riverHealth(state)
  const town = townHealth(state)
  const smog = has('factory_boom') || state.stats.earth < 35
  const jobs = has('workers_left') ? '사람들이 떠남' : has('green_jobs') ? '새 일자리' : has('factory_limit') ? '불안' : '유지'
  const city = make(
    'city',
    clamp((river + town) / 2),
    gaia
      ? '공장도 거리도 텅 비었어요'
      : state.trust.human <= 25
        ? '광장에 시위가 열렸어요'
        : smog
          ? '미세먼지 경보가 울려요'
          : `강 ${river >= 60 ? '맑음' : river >= 35 ? '조금 탁함' : '오염 심각'} · 일자리 ${jobs}`,
  )

  const sand = desertHealth(state)
  const dry = make(
    'dry',
    sand,
    has('green_wall')
      ? '나무 장벽이 모래를 막아요'
      : has('refugee_reject')
        ? '국경 앞 난민 천막이 늘어요'
        : sand >= 60
          ? '오아시스에 물이 넉넉해요'
          : sand >= 35
            ? '사막이 조금씩 넓어져요'
            : '모래바람이 마을을 덮쳐요',
  )

  const tropic = tropicHealth(state)
  const tropical = make(
    'tropical',
    tropic,
    has('coast_flooded')
      ? '섬마을이 바다에 잠겼어요'
      : has('palm_keep')
        ? '기름야자 농장이 우림을 밀어내요'
        : has('seawall')
          ? '방파제가 섬마을을 지켜요'
          : tropic >= 60
            ? '우림이 울창하고 산호가 알록달록해요'
            : tropic >= 35
              ? '산호가 하얗게 변하기 시작했어요'
              : '우림이 타고 산호가 죽어 가요',
  )

  return [polar, subarctic, rural, city, dry, tropical]
}
