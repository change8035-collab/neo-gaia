# NEO GAIA

<p align="center">
  <a href="https://neo-gaia.netlify.app">
    <img src="https://img.shields.io/badge/%E2%96%B6%20%EC%A7%80%EA%B8%88%20%EB%B0%94%EB%A1%9C%20%ED%94%8C%EB%A0%88%EC%9D%B4-NEO%20GAIA-c8322a?style=for-the-badge" alt="지금 바로 플레이" height="48">
  </a>
</p>

<p align="center"><b>👉 <a href="https://neo-gaia.netlify.app">neo-gaia.netlify.app</a></b><br>위 버튼이나 주소를 누르면 설치 없이 브라우저에서 바로 게임이 시작돼요.</p>


원작 김소연 「가이아의 선택」(『일인용 캡슐』 수록)을 바탕으로 만든 웹 게임.
플레이어가 기후관리 AI '네오 가이아'의 결재 책상에 앉아 30년 동안 자연(동물·숲)과 인간(시민·기업)이 낸 민원서에
승인/반려 도장을 찍고, 임기가 끝나면 환생 캡슐을 뽑아 자신이 만든 지구의 생명체로 다시 태어난다.

- 창밖 풍경은 기후대별로 나뉜다: 한대(남극) · 냉대(타이가) · 온대(농촌·도시) · 건조(사막) · 열대(우림·산호섬)
- 민원서마다 **실제 통계와 출처 링크**가 붙고(첨부 · 실제 자료), 도장 옆에는 **실제 세계 사례** 쪽지가 뜬다
- 첫 화면의 '오늘의 실제 지구'는 빌드할 때 NOAA(이산화탄소)·NASA(기온)·NSIDC(북극 바다얼음)에서 받아 온 관측값이다

## 배포

- 게임 주소: https://neo-gaia.netlify.app (Netlify) — 고친 뒤 `npm run deploy` 한 줄이면 다시 올라감
- 예비 주소: https://change8035-collab.github.io/neo-gaia/ (GitHub Pages) — `main` 에 올리면 자동 반영

## 실행

```bash
npm install
npm run dev        # http://localhost:8796
npm run build      # 관측값 받기 → 타입 검사 → dist/ 폴더에 배포용 파일 생성
npm run observed   # 관측값만 다시 받기 (src/data/observed.json)
npm run sim        # 밸런스 시뮬레이션 (여러 플레이 성향으로 수천 판)
```

## 폴더

| 위치 | 내용 |
|---|---|
| `src/data/cards.ts` | 정책 카드 (대표, 대사, 정책, 승인·거부 효과, 반응) |
| `src/data/lives.ts` | 재탄생할 수 있는 생명체와 장면별 이야기 |
| `src/game/engine.ts` | 게임 규칙 (카드 고르기, 점수, 신뢰, 엔딩, 재탄생) |
| `src/game/zones.ts` | 기후대 6칸(한대·냉대·온대 농촌·온대 도시·건조·열대)의 상태 계산 |
| `src/data/observed.json` | 실제 관측값 (`scripts/fetch-observed.mjs` 가 받아 옴) |
| `src/components/Panorama.tsx` | 모니터 속 지구 풍경 그림 (SVG). 결정에 따라 빙하·연기·바닷물이 바뀜 |
| `src/game/sound.ts` | 도장 쾅, 종이 소리 같은 효과음 (파일 없이 합성) |
| `src/screens/` | 임명장 → 결재 책상 → 임기 보고서 → 환생 캡슐·생애 기록부 → 회고 일기·자료 출처 |

## 카드 추가하는 법

`src/data/cards.ts` 에 아래 모양으로 하나 추가하면 끝. 저장하면 바로 게임에 반영됨.

```ts
{
  id: 'bike',                 // 겹치지 않는 이름
  phase: 2,                   // 1 초반, 2 중반, 3 후반
  kind: 'normal',
  faction: 'human',           // nature 자연 / human 인간 (민심)
  zone: 'city',               // 반짝일 기후대: polar 한대 / subarctic 냉대 / rural·city 온대 / dry 건조 / tropical 열대
  speaker: { emoji: '🚲', name: '자전거 동호회' },
  text: '자전거 도로 좀 늘려 주세요!',
  evidence: { text: '실제 통계 한두 문장', from: '기관 이름 (연도)', url: 'https://...' },  // 민원서 첨부
  example: { text: '비슷한 정책을 해 본 곳의 결과', from: '기관 이름 (연도)', url: 'https://...' }, // 도장 옆 쪽지
  policy: '자전거 도로 확충',
  approve: { effects: { earth: 6, economy: -4 }, flag: 'bike_road', reactions: [/* 1~2개 */] },
  reject: { effects: { earth: -3 }, reactions: [/* 1~2개 */] },
},
```

카드를 고친 뒤엔 `npm run check` 로 오타가 없는지, `npm run sim` 으로 밸런스가 깨지지 않았는지 확인.
계기판 수치와 대사는 가상 설정이다. 반대로 `evidence`·`example` 에는 출처 페이지에서 직접 확인한 숫자만 넣는다.
