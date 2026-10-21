// 오늘의 실제 지구: 빌드할 때 NOAA·NASA·NSIDC에서 받아 온 관측값 (scripts/fetch-observed.mjs)

import observed from '../data/observed.json'

export default function Observed() {
  const { co2, temp, seaIce } = observed
  return (
    <div className="observed">
      <b className="observed__title">
        오늘의 실제 지구 <small>관측값</small>
      </b>
      <div className="observed__screen">
        <a href={co2.url} target="_blank" rel="noreferrer">
          <span>이산화탄소</span>
          <b>{co2.value.toFixed(1)} ppm</b>
          <small>
            {co2.from} · {co2.year}년 {co2.month}월
          </small>
        </a>
        <a href={temp.url} target="_blank" rel="noreferrer">
          <span>지구 평균 기온</span>
          <b>+{temp.value.toFixed(2)}℃</b>
          <small>
            {temp.from} · {temp.year}년, {temp.base}
          </small>
        </a>
        <a href={seaIce.url} target="_blank" rel="noreferrer">
          <span>북극 바다얼음</span>
          <b>{Math.round(seaIce.value * 100)}만㎢</b>
          <small>
            {seaIce.from} · {seaIce.year}년 {seaIce.month}월 ({seaIce.first.year}년엔 {Math.round(seaIce.first.value * 100)}만㎢)
          </small>
        </a>
      </div>
    </div>
  )
}
