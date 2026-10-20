# NEO GAIA

<p align="center">
  <a href="https://change8035-collab.github.io/neo-gaia/">
    <img src="https://img.shields.io/badge/%E2%96%B6%20%EC%A7%80%EA%B8%88%20%EB%B0%94%EB%A1%9C%20%ED%94%8C%EB%A0%88%EC%9D%B4-NEO%20GAIA-c8322a?style=for-the-badge" alt="지금 바로 플레이" height="48">
  </a>
</p>

<p align="center"><b>👉 <a href="https://change8035-collab.github.io/neo-gaia/">https://change8035-collab.github.io/neo-gaia/</a></b><br>위 버튼이나 주소를 누르면 설치 없이 브라우저에서 바로 게임이 시작돼요.</p>


원작 김소연 「가이아의 선택」(『일인용 캡슐』 수록)을 바탕으로 만든 웹 게임.
플레이어가 기후관리 AI '네오 가이아'의 결재 책상에 앉아 30년 동안 펭귄·노동자·기업이 낸 민원서에
승인/반려 도장을 찍고, 임기가 끝나면 환생 캡슐을 뽑아 자신이 만든 지구의 생명체로 다시 태어난다.

## 배포

`main` 브랜치에 올리면 GitHub Actions 가 자동으로 다시 빌드해서 위 주소에 반영함.

## 실행

```bash
npm install
npm run dev        # http://localhost:8796
npm run build      # dist/ 폴더에 배포용 파일 생성 (GitHub Pages 등에 그대로 올리면 됨)
npm run sim        # 밸런스 시뮬레이션 (여러 플레이 성향으로 수천 판)
```

## 폴더

| 위치 | 내용 |
|---|---|
| `src/data/cards.ts` | 정책 카드 (대표, 대사, 정책, 승인·거부 효과, 반응) |
| `src/data/lives.ts` | 재탄생할 수 있는 생명체와 장면별 이야기 |
| `src/game/engine.ts` | 게임 규칙 (카드 고르기, 점수, 신뢰, 엔딩, 재탄생) |
| `src/game/zones.ts` | 6개 지역(남극·해안·농촌·숲·공업도시·도시)의 상태 계산 |
| `src/components/Panorama.tsx` | 모니터 속 지구 풍경 그림 (SVG). 결정에 따라 빙하·연기·바닷물이 바뀜 |
| `src/game/sound.ts` | 도장 쾅, 종이 소리 같은 효과음 (파일 없이 합성) |
| `src/screens/` | 임명장 → 결재 책상 → 임기 보고서 → 환생 캡슐·3컷 만화 → 회고 일기 |

## 카드 추가하는 법

`src/data/cards.ts` 에 아래 모양으로 하나 추가하면 끝. 저장하면 바로 게임에 반영됨.

```ts
{
  id: 'bike',                 // 겹치지 않는 이름
  phase: 2,                   // 1 초반, 2 중반, 3 후반
  kind: 'normal',
  faction: 'citizen',         // nature 자연 / citizen 시민 / industry 산업
  zone: 'city',               // 지도에서 반짝일 지역
  speaker: { emoji: '🚲', name: '자전거 동호회' },
  text: '자전거 도로 좀 늘려 주세요!',
  policy: '자전거 도로 확충',
  approve: { effects: { earth: 6, economy: -4 }, flag: 'bike_road', reactions: [/* 1~2개 */] },
  reject: { effects: { earth: -3 }, reactions: [/* 1~2개 */] },
},
```

카드를 고친 뒤엔 `npm run check` 로 오타가 없는지, `npm run sim` 으로 밸런스가 깨지지 않았는지 확인.
게임 속 수치와 대사는 실제 예측이 아닌 가상 설정이다.
