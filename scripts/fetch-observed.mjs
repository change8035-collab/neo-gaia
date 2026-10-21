// 실제 관측값 받아오기: NOAA(이산화탄소), NASA(지구 기온), NSIDC(북극 바다얼음)
// 빌드할 때 한 번 받아서 src/data/observed.json 에 저장 (NASA·NSIDC는 브라우저에서 바로 못 받음)
// 인터넷이 안 되거나 형식이 바뀌면 그 항목은 지난번 값을 그대로 둠

import { readFileSync, writeFileSync } from 'node:fs'

const OUT = new URL('../src/data/observed.json', import.meta.url)
const old = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'))
  } catch {
    return {}
  }
})()

async function text(url) {
  // NASA 서버는 User-Agent 가 없으면 연결을 끊어 버림
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'neo-gaia-build (https://neo-gaia.netlify.app)', Accept: 'text/csv,*/*' },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

// NOAA 마우나로아 월별 이산화탄소: # 주석 뒤 year,month,decimal date,average,...
async function co2() {
  const rows = (await text('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv'))
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && /^\d/.test(l))
    .map((l) => l.split(','))
  const last = rows.at(-1)
  const value = Number(last[3])
  if (!(value > 300 && value < 600)) throw new Error('CO2 값 이상')
  return {
    value,
    year: Number(last[0]),
    month: Number(last[1]),
    from: 'NOAA 마우나로아 관측소',
    url: 'https://gml.noaa.gov/ccgg/trends/',
  }
}

// NASA GISTEMP v4: 1행 제목, 2행 머리글(Year,…,J-D,…), 결측은 ***
async function temp() {
  const lines = (await text('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv')).trim().split('\n').slice(1)
  const head = lines[0].split(',')
  const col = head.indexOf('J-D')
  const rows = lines
    .slice(1)
    .map((l) => l.split(','))
    .filter((r) => /^\d{4}$/.test(r[0]) && r[col] && !r[col].includes('*'))
  const last = rows.at(-1)
  const value = Number(last[col])
  if (!(value > -1 && value < 4)) throw new Error('기온 값 이상')
  return {
    value,
    year: Number(last[0]),
    base: '1951~1980년 평균보다',
    from: 'NASA GISTEMP',
    url: 'https://data.giss.nasa.gov/gistemp/',
  }
}

// NSIDC 북극 9월(1년 중 가장 작을 때) 바다얼음 면적: year, mo, source, region, extent, area
async function seaIce() {
  const rows = (await text('https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_09_extent_v4.0.csv'))
    .trim()
    .split('\n')
    .slice(1)
    .map((l) => l.split(',').map((v) => v.trim()))
    .filter((r) => /^\d{4}$/.test(r[0]) && Number(r[4]) > 0)
  const first = rows[0]
  const last = rows.at(-1)
  return {
    value: Number(last[4]),
    year: Number(last[0]),
    month: 9,
    first: { year: Number(first[0]), value: Number(first[4]) },
    from: 'NSIDC 해빙 지수',
    url: 'https://nsidc.org/data/seaice_index',
  }
}

const result = { ...old }
let changed = false
for (const [key, get] of Object.entries({ co2, temp, seaIce })) {
  try {
    result[key] = await get()
    changed = true
  } catch (e) {
    console.warn(`[관측값] ${key} 받기 실패, 지난 값 유지: ${e.message}`)
  }
}
if (changed) {
  result.fetchedAt = new Date().toISOString().slice(0, 10)
  writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n')
}
console.log('[관측값]', JSON.stringify(result))
