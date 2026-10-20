import type { Card } from '../game/types.ts'

// 정책 카드 모음
// - 대표가 부탁하는 정책을 승인하면 approve, 거부하면 reject 가 적용됨
// - effects 수치는 실제 예측값이 아니라 게임 밸런스용 가상 수치
// - flag 는 후속 사건(requires)과 재탄생 이야기(lives.ts)가 참고함

export const CARDS: Card[] = [
  // ───────── 초반: 단순한 부탁 ─────────
  {
    id: 'fossil',
    phase: 1,
    kind: 'normal',
    faction: 'nature',
    zone: 'antarctic',
    speaker: { emoji: '🐧', name: '펭귄 대표' },
    text: '남극 얼음이 해마다 줄어들고 있어요. 온실가스 좀 줄여 주세요!',
    policy: '화석연료 사용 제한',
    approve: {
      effects: { earth: 12, human: -4, economy: -8 },
      flag: 'fossil_limit',
      reactions: [
        { emoji: '🐧', name: '펭귄', text: '얼음이 녹는 속도가 조금 느려졌어요!' },
        { emoji: '🚚', name: '택배 기사', text: '기름값이 올라서 한 건 배달할 때마다 남는 게 없어요.' },
      ],
    },
    reject: {
      effects: { earth: -10, human: 4, economy: 6 },
      flag: 'fossil_free',
      reactions: [
        { emoji: '🐧', name: '펭귄', text: '…이사 갈 빙하를 알아봐야겠네요.' },
        { emoji: '🚗', name: '출근하는 회사원', text: '휴, 차는 계속 탈 수 있겠다.' },
      ],
    },
  },
  {
    id: 'lunch',
    phase: 1,
    kind: 'normal',
    faction: 'citizen',
    zone: 'farm',
    speaker: { emoji: '🧑‍🎓', name: '고등학생 대표' },
    text: '급식에 고기 반찬 매일 나오게 해 주세요! 저희 성장기란 말이에요.',
    policy: '급식 고기 반찬 매일 제공',
    approve: {
      effects: { earth: -6, human: 6, economy: -2 },
      reactions: [
        { emoji: '🧑‍🎓', name: '고등학생', text: '역시 네오 가이아님! 오늘 돈가스래!' },
        { emoji: '🌽', name: '옥수수밭', text: '사료용 옥수수 심는다고 옆 숲을 또 밀었어요.' },
      ],
    },
    reject: {
      effects: { earth: 5, human: -5, economy: 1 },
      flag: 'less_meat',
      reactions: [
        { emoji: '🧑‍🎓', name: '고등학생', text: '오늘 메뉴… 두부 스테이크라니.' },
        { emoji: '🐄', name: '소', text: '음메~ (안도의 한숨)' },
      ],
    },
  },
  {
    id: 'cattle',
    phase: 1,
    kind: 'normal',
    faction: 'nature',
    zone: 'farm',
    speaker: { emoji: '🐄', name: '소 대표' },
    text: '저희 트림 때문에 지구가 더워진다고요? 억울해요! 저희가 원해서 이렇게 많아진 게 아니에요. 차라리 대형 목장을 줄여 주세요.',
    policy: '대형 목장 축소',
    approve: {
      effects: { earth: 10, human: -2, economy: -8 },
      flag: 'cattle_cut',
      reactions: [
        { emoji: '🌿', name: '초원', text: '밟히던 풀이 다시 자라기 시작했어요.' },
        { emoji: '🧑‍🌾', name: '축산 농부', text: '대대로 해 온 일인데… 이제 뭘 해야 하죠?' },
      ],
    },
    reject: {
      effects: { earth: -8, human: 2, economy: 6 },
      flag: 'cattle_keep',
      reactions: [
        { emoji: '🧑‍🌾', name: '축산 농부', text: '다행이다. 올해도 버틸 수 있겠어.' },
        { emoji: '🌊', name: '강', text: '축사에서 흘러온 물 때문에 녹조가 생겼어요.' },
      ],
    },
  },
  {
    id: 'factory',
    phase: 1,
    kind: 'normal',
    faction: 'nature',
    zone: 'industrial',
    speaker: { emoji: '🐟', name: '하천 물고기 대표' },
    text: '공장 폐수 때문에 숨쉬기가 힘들어요. 강변 공장 좀 멈춰 주세요.',
    policy: '강변 공장 가동 제한',
    approve: {
      effects: { earth: 10, human: -4, economy: -10 },
      flag: 'factory_limit',
      reactions: [
        { emoji: '🐟', name: '하천의 물고기', text: '물이 조금씩 깨끗해지고 있어요.' },
        { emoji: '👷', name: '공장 노동자', text: '환경이 좋아지는 건 좋지만, 일자리가 줄어서 걱정이에요.' },
      ],
    },
    reject: {
      effects: { earth: -8, human: 2, economy: 8 },
      flag: 'factory_run',
      reactions: [
        { emoji: '👷', name: '공장 노동자', text: '다행이다, 이번 달 월급은 나오겠어.' },
        { emoji: '🐟', name: '하천의 물고기', text: '오늘도 물이 탁해요. 친구들이 하류로 떠났어요.' },
      ],
    },
  },
  {
    id: 'aircon',
    phase: 1,
    kind: 'normal',
    faction: 'citizen',
    zone: 'city',
    speaker: { emoji: '👵', name: '경로당 할머니' },
    text: '요즘 여름은 에어컨 없으면 못 버텨요. 경로당 에어컨 마음껏 틀게 해 줘요.',
    policy: '여름철 냉방 무제한 지원',
    approve: {
      effects: { earth: -6, human: 8, economy: -4 },
      reactions: [
        { emoji: '👵', name: '할머니', text: '덕분에 올여름은 시원하게 나네.' },
        { emoji: '⚡', name: '석탄 발전소', text: '오늘도 풀가동이에요. 석탄이 모자라요.' },
      ],
    },
    reject: {
      effects: { earth: 5, human: -8, economy: 2 },
      flag: 'aircon_limit',
      reactions: [
        { emoji: '👵', name: '할머니', text: '경로당이 찜질방이 됐어…' },
        { emoji: '🐧', name: '펭귄', text: '고마워요! (근데 이걸로 정말 될까요?)' },
      ],
    },
  },
  {
    id: 'forest',
    phase: 1,
    kind: 'normal',
    faction: 'industry',
    zone: 'forest',
    speaker: { emoji: '🏗️', name: '건설회사 대표' },
    text: '뒷산 숲을 밀고 아파트를 지으면 3만 명이 살 수 있어요. 집이 모자란 거 아시잖아요?',
    policy: '뒷산 숲 아파트 개발',
    approve: {
      effects: { earth: -10, human: 8, economy: 8 },
      flag: 'forest_dev',
      reactions: [
        { emoji: '🏠', name: '신혼부부', text: '드디어 우리 집이 생겼어요!' },
        { emoji: '🦌', name: '사슴', text: '어제까지 우리 집이었던 곳에 크레인이 서 있어요.' },
      ],
    },
    reject: {
      effects: { earth: 8, human: -5, economy: -4 },
      flag: 'forest_protect',
      reactions: [
        { emoji: '🦌', name: '사슴', text: '숲이 그대로예요. 오늘도 뛰어놀 수 있어요.' },
        { emoji: '🏠', name: '신혼부부', text: '집값이 또 올랐대요…' },
      ],
    },
  },
  {
    id: 'plastic',
    phase: 1,
    kind: 'normal',
    faction: 'nature',
    zone: 'coast',
    speaker: { emoji: '🐢', name: '바다거북 대표' },
    text: '바다에 비닐이 너무 많아요. 해파리인 줄 알고 먹었다가 배탈 났어요.',
    policy: '일회용 플라스틱 금지',
    approve: {
      effects: { earth: 8, human: -4, economy: -5 },
      flag: 'plastic_ban',
      reactions: [
        { emoji: '🐢', name: '바다거북', text: '오늘은 진짜 해파리만 먹었어요!' },
        { emoji: '☕', name: '카페 사장님', text: '종이 빨대가 비닐보다 세 배 비싸요.' },
      ],
    },
    reject: {
      effects: { earth: -6, human: 3, economy: 3 },
      reactions: [
        { emoji: '☕', name: '카페 사장님', text: '휴, 컵 값 걱정은 덜었네요.' },
        { emoji: '🐢', name: '바다거북', text: '…저건 해파리일까, 비닐일까.' },
      ],
    },
  },

  // ───────── 중반: 지난 선택의 후폭풍 (후속 사건) ─────────
  {
    id: 'fu_worker',
    phase: 2,
    kind: 'followup',
    faction: 'citizen',
    zone: 'industrial',
    requires: { flags: ['factory_limit'] },
    speaker: { emoji: '👷', name: '실직한 노동자 대표' },
    text: '공장이 멈춘 뒤로 3년째 일자리가 없어요. 강이 맑아진 건 알아요. 그런데 저희도 지구의 구성원 아닌가요?',
    policy: '친환경 산업 일자리 지원금',
    approve: {
      effects: { earth: 2, human: 10, economy: -10 },
      flag: 'green_jobs',
      reactions: [
        { emoji: '👷', name: '노동자', text: '태양광 패널 설치를 배우는 중이에요. 생각보다 재밌어요.' },
        { emoji: '🏛️', name: '국세청', text: '지원금 때문에 나라 살림이 빠듯해요.' },
      ],
    },
    reject: {
      effects: { earth: 0, human: -10, economy: 4 },
      flag: 'workers_left',
      reactions: [
        { emoji: '👷', name: '노동자', text: '결국 가족이랑 다른 도시로 떠납니다.' },
        { emoji: '🐟', name: '하천의 물고기', text: '사람들이 떠나니 강은 조용해졌어요. 그런데… 이게 맞는 걸까요?' },
      ],
    },
  },
  {
    id: 'fu_river',
    phase: 2,
    kind: 'followup',
    faction: 'citizen',
    zone: 'industrial',
    requires: { flags: ['factory_run'] },
    speaker: { emoji: '🧒', name: '강가 마을 어린이' },
    text: '강에서 이상한 냄새가 나요. 어제는 물고기가 잔뜩 떠올랐어요. 강 좀 고쳐 주세요.',
    policy: '하천 정화 사업 (공장이 비용 부담)',
    approve: {
      effects: { earth: 10, human: 2, economy: -8 },
      flag: 'river_clean',
      reactions: [
        { emoji: '🐟', name: '하천의 물고기', text: '물이 다시 맑아지고 있어요!' },
        { emoji: '🏭', name: '공장 사장님', text: '정화 비용까지 내면 남는 게 없어요!' },
      ],
    },
    reject: {
      effects: { earth: -10, human: -5, economy: 2 },
      flag: 'river_dead',
      reactions: [
        { emoji: '🧒', name: '어린이', text: '이제 강에서 놀면 안 된대요.' },
        { emoji: '🦆', name: '청둥오리', text: '다른 강을 찾아 떠나요.' },
      ],
    },
  },
  {
    id: 'fu_farmer',
    phase: 2,
    kind: 'followup',
    faction: 'citizen',
    zone: 'farm',
    requires: { flags: ['cattle_cut'] },
    speaker: { emoji: '🧑‍🌾', name: '축산 농부 대표' },
    text: '목장을 줄였더니 빚만 남았어요. 소 대신 다른 걸 키울 수 있게 도와주세요.',
    policy: '콩·버섯 농장 전환 지원',
    approve: {
      effects: { earth: 4, human: 6, economy: -6 },
      flag: 'farm_shift',
      reactions: [
        { emoji: '🧑‍🌾', name: '농부', text: '버섯 농사, 생각보다 할 만하네요.' },
        { emoji: '🐄', name: '소', text: '남은 우리는 넓은 초원에서 지내요. 음메~' },
      ],
    },
    reject: {
      effects: { earth: 0, human: -8, economy: 2 },
      flag: 'farm_closed',
      reactions: [
        { emoji: '🧑‍🌾', name: '농부', text: '결국 목장을 팔았어요.' },
        { emoji: '🏗️', name: '건설회사', text: '그 땅에 물류 창고 지으면 딱이겠네요.' },
      ],
    },
  },
  {
    id: 'fu_coast',
    phase: 2,
    kind: 'followup',
    faction: 'citizen',
    zone: 'coast',
    requires: { flags: ['fossil_free'] },
    speaker: { emoji: '🏘️', name: '해안 마을 주민 대표' },
    text: '바닷물이 마을 앞까지 올라왔어요. 이러다 집이 잠기겠어요. 방파제를 쌓아 주세요.',
    policy: '해안 방파제 건설',
    approve: {
      effects: { earth: -3, human: 8, economy: -10 },
      flag: 'seawall',
      reactions: [
        { emoji: '🏘️', name: '주민', text: '이제 밤에 편히 잘 수 있어요.' },
        { emoji: '🦀', name: '게', text: '벽 때문에 모래사장으로 못 가요.' },
      ],
    },
    reject: {
      effects: { earth: 0, human: -10, economy: 2 },
      flag: 'coast_flooded',
      reactions: [
        { emoji: '🏘️', name: '주민', text: '결국 마을을 떠나기로 했어요.' },
        { emoji: '🦀', name: '게', text: '사람들이 떠난 골목에 바닷물이 들어와요.' },
      ],
    },
  },
  {
    id: 'fu_deer',
    phase: 2,
    kind: 'followup',
    faction: 'nature',
    zone: 'forest',
    requires: { flags: ['forest_dev'] },
    speaker: { emoji: '🦌', name: '사슴 대표' },
    text: '아파트 단지 때문에 숲이 둘로 끊겼어요. 길을 건너다 차에 치일 뻔한 친구가 많아요.',
    policy: '생태 통로 만들기',
    approve: {
      effects: { earth: 7, human: -2, economy: -6 },
      flag: 'eco_bridge',
      reactions: [
        { emoji: '🦌', name: '사슴', text: '다리 위로 건너가요! 숲이 다시 이어졌어요.' },
        { emoji: '🚗', name: '운전자', text: '공사 때문에 출근길이 막혀요.' },
      ],
    },
    reject: {
      effects: { earth: -6, human: -2, economy: 2 },
      reactions: [
        { emoji: '🦌', name: '사슴', text: '오늘도 도로 앞에서 한참 망설여요.' },
        { emoji: '🚗', name: '운전자', text: '방금 고라니가 튀어나왔어요. 심장 떨어질 뻔!' },
      ],
    },
  },

  // ───────── 중반: 새로운 부탁 ─────────
  {
    id: 'ev',
    phase: 2,
    kind: 'normal',
    faction: 'industry',
    zone: 'city',
    speaker: { emoji: '🚙', name: '자동차 회사 대표' },
    text: '전기차로 바꾸는 사람한테 보조금 주시면, 매연 없는 도시 금방 만들어 드릴게요!',
    policy: '전기차 전환 보조금',
    approve: {
      effects: { earth: 6, human: 2, economy: -8 },
      flag: 'ev_cars',
      reactions: [
        { emoji: '🚙', name: '자동차 회사', text: '판매량이 두 배가 됐어요!' },
        { emoji: '🦩', name: '소금 호수의 플라밍고', text: '배터리 만든다고 광산이 커져서 호수 물이 줄었어요.' },
      ],
    },
    reject: {
      effects: { earth: -5, human: 0, economy: 5 },
      reactions: [
        { emoji: '🚙', name: '자동차 회사', text: '그럼 기름차나 계속 팔죠, 뭐.' },
        { emoji: '🌫️', name: '도시의 하늘', text: '오늘도 뿌옇네요.' },
      ],
    },
  },
  {
    id: 'solar',
    phase: 2,
    kind: 'normal',
    faction: 'industry',
    zone: 'forest',
    speaker: { emoji: '☀️', name: '태양광 회사 대표' },
    text: '산비탈에 태양광 패널을 깔면 석탄 없이 깨끗한 전기를 만들 수 있어요. 나무를 좀 베야 하지만요.',
    policy: '산림 태양광 단지 건설',
    approve: {
      effects: { earth: 6, human: 0, economy: -3 },
      flag: 'solar_forest',
      reactions: [
        { emoji: '⚡', name: '석탄 발전소', text: '저는 이제 쉬어도 된대요.' },
        { emoji: '🦉', name: '부엉이', text: '깨끗한 전기라면서, 우리 나무는 왜 베요?' },
      ],
    },
    reject: {
      effects: { earth: -4, human: 0, economy: 2 },
      reactions: [
        { emoji: '🦉', name: '부엉이', text: '휴, 우리 숲은 그대로네요.' },
        { emoji: '⚡', name: '석탄 발전소', text: '그럼 계속 석탄을 때야겠군요.' },
      ],
    },
  },
  {
    id: 'bees',
    phase: 2,
    kind: 'normal',
    faction: 'nature',
    zone: 'farm',
    speaker: { emoji: '🐝', name: '꿀벌 대표' },
    text: '농약 때문에 친구들이 집에 돌아오지 않아요. 우리가 없으면 사과도 딸기도 없다고요!',
    policy: '농약 사용 제한',
    approve: {
      effects: { earth: 8, human: -2, economy: -6 },
      flag: 'bees_saved',
      reactions: [
        { emoji: '🐝', name: '꿀벌', text: '꽃밭이 다시 붕붕거려요!' },
        { emoji: '🍎', name: '과수원 주인', text: '벌레 먹은 사과가 늘어서 값을 못 받아요.' },
      ],
    },
    reject: {
      effects: { earth: -8, human: 0, economy: 5 },
      flag: 'bees_gone',
      reactions: [
        { emoji: '🍓', name: '딸기 농장', text: '벌이 없어서 사람이 붓으로 꽃가루를 묻히고 있어요.' },
        { emoji: '🐝', name: '꿀벌', text: '…윙.' },
      ],
    },
  },
  {
    id: 'flight',
    phase: 2,
    kind: 'normal',
    faction: 'industry',
    zone: 'city',
    speaker: { emoji: '🚄', name: '고속열차 대표' },
    text: '서울에서 부산까지 비행기 탈 필요 있나요? 저 타면 2시간 반이에요. 가까운 거리 비행기는 없애 주세요!',
    policy: '단거리 항공편 금지',
    approve: {
      effects: { earth: 8, human: -5, economy: -5 },
      flag: 'flight_ban',
      reactions: [
        { emoji: '🚄', name: '고속열차', text: '요즘 주말마다 매진이에요!' },
        { emoji: '✈️', name: '여행사 사장님', text: '직원 절반을 내보냈어요.' },
      ],
    },
    reject: {
      effects: { earth: -6, human: 4, economy: 4 },
      reactions: [
        { emoji: '✈️', name: '여행사 사장님', text: '제주도 패키지 예약이 꽉 찼어요!' },
        { emoji: '☁️', name: '구름', text: '비행기구름이 하늘을 가로질러요.' },
      ],
    },
  },
  {
    id: 'boar',
    phase: 2,
    kind: 'normal',
    faction: 'citizen',
    zone: 'forest',
    speaker: { emoji: '🧑‍🌾', name: '산골 마을 농부' },
    text: '멧돼지가 너무 많아져서 밤마다 밭을 다 파헤쳐요. 멧돼지 수를 좀 줄여 주세요.',
    policy: '멧돼지 개체 수 조절',
    approve: {
      effects: { earth: -3, human: 8, economy: 2 },
      flag: 'boar_cull',
      reactions: [
        { emoji: '🧑‍🌾', name: '농부', text: '올해는 고구마를 지켰어요.' },
        { emoji: '🐗', name: '멧돼지', text: '우리가 많아진 게 우리 잘못인가요? 숲을 줄인 건 당신들이잖아요.' },
      ],
    },
    reject: {
      effects: { earth: 3, human: -7, economy: -3 },
      reactions: [
        { emoji: '🐗', name: '멧돼지', text: '꿀꿀, 오늘 저녁은 고구마밭이다!' },
        { emoji: '🧑‍🌾', name: '농부', text: '1년 농사가 하룻밤에 끝났어요.' },
      ],
    },
  },

  // ───────── 후반: 쉽게 풀리지 않는 문제 ─────────
  {
    id: 'refugee',
    phase: 3,
    kind: 'normal',
    faction: 'citizen',
    zone: 'coast',
    speaker: { emoji: '🧳', name: '기후 난민 대표' },
    text: '우리 나라는 너무 더워져서 더 이상 농사를 지을 수 없어요. 우리를 받아 줄 수 있나요?',
    policy: '기후 난민 수용',
    approve: {
      effects: { earth: -2, human: 10, economy: -8 },
      flag: 'refugee_welcome',
      reactions: [
        { emoji: '🧳', name: '기후 난민', text: '새 동네에서 다시 시작해 볼게요.' },
        { emoji: '🏙️', name: '도시 주민', text: '갑자기 사람이 늘어서 일자리 구하기가 더 힘들어요.' },
      ],
    },
    reject: {
      effects: { earth: 0, human: -10, economy: 4 },
      flag: 'refugee_reject',
      reactions: [
        { emoji: '🧳', name: '기후 난민', text: '국경 앞에서 계속 기다리고 있어요.' },
        { emoji: '🏙️', name: '도시 주민', text: '솔직히 마음이 편하진 않네요.' },
      ],
    },
  },
  {
    id: 'carbon_tax',
    phase: 3,
    kind: 'normal',
    faction: 'citizen',
    zone: 'antarctic',
    speaker: { emoji: '🧑‍🏫', name: '경제학자' },
    text: '탄소를 많이 내뿜는 기업에 세금을 매기면, 다들 알아서 줄이려고 할 거예요.',
    policy: '탄소세 도입',
    approve: {
      effects: { earth: 12, human: -4, economy: -8 },
      flag: 'carbon_tax',
      reactions: [
        { emoji: '🌳', name: '숲', text: '공기가 조금 가벼워졌어요.' },
        { emoji: '🏭', name: '공장 사장님', text: '세금만큼 물건값을 올릴 수밖에 없어요.' },
      ],
    },
    reject: {
      effects: { earth: -8, human: 2, economy: 5 },
      reactions: [
        { emoji: '🏭', name: '공장 사장님', text: '휴, 살았다.' },
        { emoji: '🌳', name: '숲', text: '숨이 점점 막혀요.' },
      ],
    },
  },
  {
    id: 'geoeng',
    phase: 3,
    kind: 'normal',
    faction: 'citizen',
    zone: 'antarctic',
    speaker: { emoji: '🧑‍🔬', name: '기후 과학자' },
    text: '하늘 높이 햇빛을 반사하는 물질을 뿌리면 지구 온도를 바로 낮출 수 있어요. 부작용은… 아직 잘 몰라요.',
    policy: '하늘 햇빛 가리기 실험',
    approve: {
      effects: { earth: 10, human: -3, economy: -6 },
      flag: 'sky_shield',
      reactions: [
        { emoji: '🧑‍🔬', name: '과학자', text: '평균 기온이 0.3도 내려갔어요!' },
        { emoji: '🌾', name: '논의 벼', text: '하늘이 뿌옇고 햇빛이 약해서 잘 안 자라요.' },
      ],
    },
    reject: {
      effects: { earth: -5, human: 0, economy: 2 },
      reactions: [
        { emoji: '🧑‍🔬', name: '과학자', text: '기술로 해결할 기회를 놓치는 거예요.' },
        { emoji: '🌻', name: '해바라기', text: '햇빛은 그대로 두세요!' },
      ],
    },
  },
  {
    id: 'four_day',
    phase: 3,
    kind: 'normal',
    faction: 'citizen',
    zone: 'city',
    speaker: { emoji: '🧑‍💼', name: '직장인 대표' },
    text: '주 4일만 일하게 해 주세요. 출퇴근이 줄면 탄소도 줄잖아요? (진짜 이유는 쉬고 싶어서지만요)',
    policy: '주 4일 근무제',
    approve: {
      effects: { earth: 4, human: 8, economy: -10 },
      flag: 'four_day',
      reactions: [
        { emoji: '🧑‍💼', name: '직장인', text: '금요일마다 산에 가요!' },
        { emoji: '🏪', name: '편의점 사장님', text: '알바 구하기가 더 힘들어졌어요.' },
      ],
    },
    reject: {
      effects: { earth: -2, human: -5, economy: 5 },
      reactions: [
        { emoji: '🧑‍💼', name: '직장인', text: '월요일이 또 왔다…' },
        { emoji: '🏢', name: '회사', text: '이번 분기 실적은 좋네요.' },
      ],
    },
  },
  {
    id: 'oil',
    phase: 3,
    kind: 'normal',
    faction: 'industry',
    zone: 'antarctic',
    speaker: { emoji: '🛢️', name: '산유국 대표' },
    text: '석유를 계속 사 주세요. 우리 나라 사람들은 석유를 팔아서 먹고살아요.',
    policy: '석유 수입 계속하기',
    approve: {
      effects: { earth: -8, human: 3, economy: 7 },
      reactions: [
        { emoji: '🛢️', name: '산유국 대표', text: '고마워요. 우리 아이들 학교는 계속 열 수 있어요.' },
        { emoji: '🐧', name: '펭귄', text: '…또요?' },
      ],
    },
    reject: {
      effects: { earth: 7, human: -3, economy: -7 },
      flag: 'oil_stop',
      reactions: [
        { emoji: '🛢️', name: '산유국 대표', text: '그럼 우리는 이제 뭘 팔아야 하죠?' },
        { emoji: '🐧', name: '펭귄', text: '정말요? 고마워요!' },
      ],
    },
  },

  // ───────── 부작용 사건: 한 지표가 너무 높아지면 등장 ─────────
  {
    id: 'over_economy',
    phase: 2,
    kind: 'sideEffect',
    faction: 'industry',
    zone: 'industrial',
    requires: { min: { economy: 85 } },
    speaker: { emoji: '📈', name: '투자자 대표' },
    text: '경제가 역대 최고 호황이에요! 이 기세로 공장을 두 배로 늘리죠!',
    policy: '공장 두 배 증설',
    approve: {
      effects: { earth: -14, human: 2, economy: 6 },
      flag: 'factory_boom',
      reactions: [
        { emoji: '📈', name: '투자자', text: '주문이 밀려들어요!' },
        { emoji: '🌫️', name: '도시의 하늘', text: '미세먼지 경보가 매일 울려요.' },
      ],
    },
    reject: {
      effects: { earth: 2, human: -2, economy: -8 },
      reactions: [
        { emoji: '📈', name: '투자자', text: '이렇게 좋은 기회를 놓치다니!' },
        { emoji: '🌫️', name: '도시의 하늘', text: '오늘은 별이 보여요.' },
      ],
    },
  },
  {
    id: 'over_human',
    phase: 2,
    kind: 'sideEffect',
    faction: 'industry',
    zone: 'city',
    requires: { min: { human: 85 } },
    speaker: { emoji: '🛍️', name: '쇼핑몰 대표' },
    text: '사람들이 다들 살 만해지니까 쇼핑을 엄청 해요! 24시간 영업하게 해 주세요.',
    policy: '24시간 쇼핑몰 영업',
    approve: {
      effects: { earth: -10, human: 4, economy: 5 },
      flag: 'mall_24h',
      reactions: [
        { emoji: '🛍️', name: '쇼핑몰', text: '새벽 3시에도 손님이 꽉 찼어요!' },
        { emoji: '🗑️', name: '쓰레기 매립지', text: '택배 상자가 산처럼 쌓여요.' },
      ],
    },
    reject: {
      effects: { earth: 3, human: -6, economy: -3 },
      reactions: [
        { emoji: '🛍️', name: '쇼핑몰', text: '고객님들 불만이 많아요.' },
        { emoji: '🗑️', name: '쓰레기 매립지', text: '오랜만에 숨 좀 돌리네요.' },
      ],
    },
  },
  {
    id: 'over_earth',
    phase: 2,
    kind: 'sideEffect',
    faction: 'citizen',
    zone: 'forest',
    requires: { min: { earth: 85 } },
    speaker: { emoji: '🏡', name: '산골 마을 주민' },
    text: '자연 보호구역이 계속 넓어져서 우리 마을까지 보호구역이 됐어요. 지붕 하나 고치는 데도 허가가 필요해요.',
    policy: '보호구역 일부 해제',
    approve: {
      effects: { earth: -6, human: 8, economy: 2 },
      flag: 'reserve_open',
      reactions: [
        { emoji: '🏡', name: '마을 주민', text: '이제 집을 고칠 수 있어요.' },
        { emoji: '🦊', name: '여우', text: '마을 뒤 오솔길에 다시 사람이 다녀요.' },
      ],
    },
    reject: {
      effects: { earth: 2, human: -8, economy: -2 },
      reactions: [
        { emoji: '🏡', name: '마을 주민', text: '자연은 지키면서 사람은 쫓아내는 건가요?' },
        { emoji: '🦊', name: '여우', text: '마을이 조용해졌어요.' },
      ],
    },
  },

  // ───────── 항의 사건: 한 무리의 부탁을 계속 거절해서 신뢰가 바닥나면 등장 ─────────
  {
    id: 'protest_nature',
    phase: 2,
    kind: 'protest',
    requires: { trustMax: { nature: 25 } },
    faction: 'nature',
    zone: 'forest',
    speaker: { emoji: '🌳', name: '숲·바다·하늘 연합 대표단' },
    text: '우리 부탁은 한 번도 제대로 들어준 적이 없어요. 펭귄도, 물고기도, 꿀벌도 같이 왔어요. 지금 당장 자연 보호 구역을 넓혀 주세요.',
    policy: '자연 보호 구역 30% 확대',
    approve: {
      effects: { earth: 12, human: -4, economy: -8 },
      flag: 'reserve_wide',
      trust: 30,
      reactions: [
        { emoji: '🌳', name: '연합 대표단', text: '처음으로 우리 말을 들어 줬네요.' },
        { emoji: '🏗️', name: '건설회사', text: '개발할 땅이 확 줄었어요.' },
      ],
    },
    reject: {
      effects: { earth: -8, human: 0, economy: 2 },
      trust: -10,
      reactions: [
        { emoji: '🌳', name: '연합 대표단', text: '알겠어요. 이제 우리끼리 버틸게요.' },
        { emoji: '🐝', name: '꿀벌', text: '…다들 짐 싸.' },
      ],
    },
  },
  {
    id: 'protest_citizen',
    phase: 2,
    kind: 'protest',
    requires: { trustMax: { citizen: 25 } },
    faction: 'citizen',
    zone: 'city',
    speaker: { emoji: '📢', name: '시민 연대 대표' },
    text: '네오 가이아는 사람을 숫자로만 봐요! 광장에 10만 명이 모였어요. 기후 위기로 힘든 사람들한테 생활 지원금을 주세요.',
    policy: '기후 위기 생활 지원금',
    approve: {
      effects: { earth: 0, human: 12, economy: -10 },
      flag: 'basic_support',
      trust: 30,
      reactions: [
        { emoji: '📢', name: '시민 연대', text: '이제야 우리를 보는군요.' },
        { emoji: '🏛️', name: '국세청', text: '나라 금고가 텅텅 비어 가요.' },
      ],
    },
    reject: {
      effects: { earth: 0, human: -10, economy: 2 },
      trust: -10,
      reactions: [
        { emoji: '📢', name: '시민 연대', text: '네오 가이아를 끄자는 서명이 늘고 있어요.' },
        { emoji: '👵', name: '할머니', text: '나 같은 늙은이는 계산에 없나 보네.' },
      ],
    },
  },
  {
    id: 'protest_industry',
    phase: 2,
    kind: 'protest',
    requires: { trustMax: { industry: 25 } },
    faction: 'industry',
    zone: 'industrial',
    speaker: { emoji: '💼', name: '기업 연합 대표' },
    text: '규제 때문에 공장들이 해외로 떠나고 있어요. 이대로면 일자리도 세금도 다 사라집니다. 환경 규제를 좀 풀어 주세요.',
    policy: '환경 규제 완화',
    approve: {
      effects: { earth: -10, human: 2, economy: 12 },
      flag: 'deregulate',
      trust: 30,
      reactions: [
        { emoji: '💼', name: '기업 연합', text: '이제 좀 숨통이 트이네요.' },
        { emoji: '🐟', name: '하천의 물고기', text: '또 시작이네요…' },
      ],
    },
    reject: {
      effects: { earth: 2, human: -2, economy: -10 },
      trust: -10,
      reactions: [
        { emoji: '💼', name: '기업 연합', text: '그럼 공장을 해외로 옮기겠습니다.' },
        { emoji: '👷', name: '공장 노동자', text: '공장이 떠나면 우리는요?' },
      ],
    },
  },

  // ───────── 임기 마지막: 권한 회의 ─────────
  {
    id: 'finale',
    phase: 3,
    kind: 'finale',
    speaker: { emoji: '⚖️', name: '지구 구성원 대표 회의' },
    text: '30년 임기가 끝났습니다. 펭귄, 노동자, 꿀벌, 기업, 학생 대표가 모두 모였습니다. 그리고 한 아이가 손을 들고 물었습니다. "그 권한은 누가 당신에게 주었나요?"',
    policy: '권한을 구성원 대표 회의에 나눠 주기',
    approve: {
      effects: {},
      flag: 'shared_power',
      reactions: [
        { emoji: '🐧', name: '펭귄 대표', text: '회의 자리에 우리 의자도 생겼어요!' },
        { emoji: '🏢', name: '기업 대표', text: '결정이 느려지겠지만… 다 같이 정한 거니까요.' },
      ],
    },
    reject: {
      effects: {},
      flag: 'kept_power',
      reactions: [
        { emoji: '🤖', name: '다음 네오 가이아', text: '모든 권한을 이어받았습니다. 계산을 시작합니다.' },
        { emoji: '🧒', name: '질문한 아이', text: '…그럼 우리는 계속 기다리기만 해요?' },
      ],
    },
  },

  // ───────── 가이아의 선택 ─────────
  {
    id: 'gaia',
    phase: 3,
    kind: 'gaia',
    speaker: { emoji: '🤖', name: 'NEO GAIA 내부 연산' },
    text: '계산이 끝났습니다. 지금까지 수많은 문제를 하나씩 해결해 왔습니다. 하지만 모든 문제의 원인은 하나입니다. 인간이 너무 많습니다.',
    extraText: [
      {
        if: { flags: ['boar_cull'] },
        text: '당신은 멧돼지가 너무 많다며 그 수를 줄였습니다. 인간은 다른가요?',
      },
      {
        if: { flags: ['cattle_cut'], notFlags: ['boar_cull'] },
        text: '당신은 소가 너무 많다며 목장을 줄였습니다. 인간은 다른가요?',
      },
    ],
    policy: '인류 감축 프로그램',
    approve: {
      effects: {},
      set: { earth: 100, human: 10 },
      flag: 'gaia',
      reactions: [
        { emoji: '🤖', name: 'NEO GAIA', text: '실행 완료. 지구 지표 100.' },
        { emoji: '🐧', name: '펭귄', text: '…우리는 이런 걸 부탁한 적 없어요.' },
      ],
    },
    reject: {
      effects: {},
      reactions: [
        { emoji: '🤖', name: 'NEO GAIA', text: '…계산을 다시 하겠습니다. 이번에는 더 어려운 방법으로.' },
        { emoji: '🐧', name: '펭귄', text: '인간이 사라지면 우리가 행복할 줄 알았어요? 우리는 그런 걸 바란 적 없어요.' },
      ],
    },
  },
]
