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
    zone: 'polar',
    speaker: { emoji: '🐧', name: '펭귄 대표' },
    text: '남극 얼음이 해마다 줄어들고 있어요. 온실가스 좀 줄여 주세요!',
    evidence: {
      text: '남극은 2002년부터 해마다 얼음을 평균 약 1,350억 톤씩 잃고 있어요.',
      from: 'NASA · Ice Sheets (위성 관측, 2002년~)',
      url: 'https://science.nasa.gov/earth/explore/earth-indicators/ice-sheets',
    },
    example: {
      text: '영국은 2024년 마지막 석탄발전소를 닫았어요. 2012년 약 40%였던 석탄 발전 비중이 0%가 됐어요.',
      from: '영국 정부 GOV.UK (2024)',
      url: 'https://www.gov.uk/government/news/new-coal-mining-licences-will-be-banned',
    },
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
    faction: 'human',
    zone: 'tropical',
    speaker: { emoji: '🧑‍🎓', name: '고등학생 대표' },
    text: '급식에 고기 반찬 매일 나오게 해 주세요! 저희 성장기란 말이에요.',
    evidence: {
      text: '소고기 1kg을 만들 때 온실가스가 약 99.5kg 나와요. 완두콩 1kg은 약 1kg이에요.',
      from: 'Our World in Data (Poore & Nemecek, Science 2018)',
      url: 'https://ourworldindata.org/grapher/ghg-per-kg-poore',
    },
    example: {
      text: '프랑스는 모든 학교 급식에서 일주일에 한 번 이상 채식 식단을 내야 해요. 2019년에 시범으로 시작해 2021년에 의무가 됐어요.',
      from: '프랑스 농업식품부 (EGalim 법)',
      url: 'https://agriculture.gouv.fr/egalim-depuis-le-1er-novembre-2019-un-menu-vegetarien-par-semaine-dans-toutes-les-cantines',
    },
    policy: '급식 고기 반찬 매일 제공',
    approve: {
      effects: { earth: -6, human: 6, economy: -2 },
      flag: 'meat_daily',
      reactions: [
        { emoji: '🧑‍🎓', name: '고등학생', text: '역시 네오 가이아님! 오늘 돈가스래!' },
        { emoji: '🌳', name: '아마존 열대우림', text: '소 먹일 사료용 콩밭 만든다고 제 숲을 또 밀었어요.' },
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
    zone: 'rural',
    speaker: { emoji: '🐄', name: '소 대표' },
    text: '저희 트림 때문에 지구가 더워진다고요? 억울해요! 저희가 원해서 이렇게 많아진 게 아니에요. 차라리 대형 목장을 줄여 주세요.',
    evidence: {
      text: '브라질 아마존에서 숲이 사라진 땅의 66%가 소를 키우는 목초지예요. (2024년)',
      from: '브라질 국립우주연구소 INPE · TerraClass (2026)',
      url: 'https://www.gov.br/inpe/pt-br/assuntos/ultimas-noticias/terraclass-divulga-dados-atualizados-sobre-cobertura-e-uso-da-terra-no-bioma-amazonia',
    },
    example: {
      text: '브라질 아마존 숲 파괴 면적은 2024년에 28% 줄었고, 2025년(5,731㎢)에 12% 더 줄었어요.',
      from: '브라질 국립우주연구소 INPE · PRODES (2026)',
      url: 'https://www.gov.br/inpe/pt-br/assuntos/ultimas-noticias/sistema-do-inpe-aponta-5-731-km2-de-desmatamento-na-amazonia-em-2025',
    },
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
    zone: 'city',
    speaker: { emoji: '🐟', name: '하천 물고기 대표' },
    text: '공장 폐수 때문에 숨쉬기가 힘들어요. 강변 공장 좀 멈춰 주세요.',
    evidence: {
      text: '1991년 3월 구미의 한 공장에서 페놀 원액 30톤이 낙동강으로 흘러들어 대구 수돗물이 오염됐어요.',
      from: '국가기록원 · 낙동강 페놀유출사건',
      url: 'https://www.archives.go.kr/next/newsearch/listSubjectDescription.do?id=006961&sitePage=',
    },
    example: {
      text: '이 사건 뒤 「환경범죄의 처벌에 관한 특별조치법」이 만들어지고, 수돗물 검사 항목도 다시 정비됐어요.',
      from: '국가기록원 · 낙동강 페놀유출사건',
      url: 'https://www.archives.go.kr/next/newsearch/listSubjectDescription.do?id=006961&sitePage=',
    },
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
    faction: 'human',
    zone: 'city',
    speaker: { emoji: '👵', name: '경로당 할머니' },
    text: '요즘 여름은 에어컨 없으면 못 버텨요. 경로당 에어컨 마음껏 틀게 해 줘요.',
    evidence: {
      text: '2024년 여름 열대야는 평균 20.2일로 1973년 이후 가장 많았어요. 평년은 6.5일이에요.',
      from: '기상청 · 2024년 여름철 기후특성 (2024)',
      url: 'https://www.kma.go.kr/kma/flexer/html/press/2024/09/05/ATC202409051216232_55db3886-6a11-4c3b-b2a3-d2d22c9ed6ff.hwp.files/Sections1.html',
    },
    example: {
      text: '에어컨과 선풍기를 돌리는 데 전 세계 전기의 약 10%가 쓰여요. 건물 전기로만 따지면 약 20%예요.',
      from: '국제에너지기구 IEA · The Future of Cooling (2018)',
      url: 'https://www.iea.org/reports/the-future-of-cooling',
    },
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
    faction: 'human',
    zone: 'rural',
    speaker: { emoji: '🏗️', name: '건설회사 대표' },
    text: '뒷산 숲을 밀고 아파트를 지으면 3만 명이 살 수 있어요. 집이 모자란 거 아시잖아요?',
    evidence: {
      text: '우리나라 숲은 국토의 62.6%예요. 그런데 도로·집·공장을 짓느라 5년 새 4만 8천ha가 줄었어요.',
      from: '산림청 (2021)',
      url: 'https://forest.go.kr/kfsweb/cop/bbs/selectBoardArticle.do?bbsId=BBSMSTR_1036&mn=NKFS_04_02_01&nttId=3163039',
    },
    example: {
      text: '2024년 여름, 낮 폭염일이 도시숲은 2일, 도심은 10일이었어요. 숲이 있으면 덜 뜨거워요.',
      from: '산림청·국립산림과학원 (2024)',
      url: 'https://forest.go.kr/kfsweb/cop/bbs/selectBoardArticle.do?bbsId=BBSMSTR_1036&mn=NKFS_04_02_01&nttId=3199625',
    },
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
    zone: 'tropical',
    speaker: { emoji: '🐢', name: '바다거북 대표' },
    text: '바다에 비닐이 너무 많아요. 해파리인 줄 알고 먹었다가 배탈 났어요.',
    evidence: {
      text: '우리 바다에서 죽은 채 발견된 푸른바다거북은 조사한 모두가, 붉은바다거북은 81%가 플라스틱을 먹었어요.',
      from: '한국해양과학기술원 연구 (Environmental Pollution, 2022)',
      url: 'https://sciwatch.kiost.ac.kr/handle/2020.kiost/42277?mode=full',
    },
    example: {
      text: '우리나라는 2019년부터 대형마트에서 일회용 비닐봉투를 못 쓰게 했어요. 어기면 과태료가 최대 300만 원이에요.',
      from: '대한민국 정책브리핑 (2019)',
      url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148859569',
    },
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
  {
    id: 'palm',
    phase: 1,
    kind: 'normal',
    faction: 'nature',
    zone: 'tropical',
    speaker: { emoji: '🦧', name: '오랑우탄 대표' },
    text: '과자랑 라면에 들어가는 팜유를 만든다고 우리 숲을 불태워요. 팜유 수입 좀 줄여 주세요.',
    evidence: {
      text: '보르네오 오랑우탄은 2016년 멸종 위기 최고 단계인 ‘위급(CR)’이 됐어요. 사는 숲이 기름야자·고무·종이 농장으로 바뀌면서 줄고 있어요.',
      from: '세계자연보전연맹 IUCN (2016)',
      url: 'https://iucn.org/news/secretariat/201607/whale-sharks-winghead-sharks-and-bornean-orangutans-slide-towards-extinction',
    },
    example: {
      text: '팜유는 슈퍼마켓 포장 제품의 50% 가까이에 들어 있어요. 인도네시아·말레이시아가 세계 팜유의 85% 이상을 만들어요.',
      from: '세계자연기금 WWF 영국',
      url: 'https://www.wwf.org.uk/updates/8-things-know-about-palm-oil',
    },
    policy: '팜유 수입 제한',
    approve: {
      effects: { earth: 9, human: -3, economy: -6 },
      flag: 'palm_limit',
      reactions: [
        { emoji: '🦧', name: '오랑우탄', text: '타는 냄새가 줄었어요. 오늘은 나무 위에서 푹 잤어요.' },
        { emoji: '🍪', name: '과자 회사', text: '대신 쓸 기름을 찾느라 과자값이 올랐어요.' },
      ],
    },
    reject: {
      effects: { earth: -8, human: 2, economy: 5 },
      flag: 'palm_keep',
      reactions: [
        { emoji: '🍜', name: '라면 회사', text: '휴, 라면 값은 그대로예요.' },
        { emoji: '🦧', name: '오랑우탄', text: '어제 자던 나무가 오늘은 기름야자 밭이 됐어요.' },
      ],
    },
  },

  // ───────── 중반: 지난 선택의 후폭풍 (후속 사건) ─────────
  {
    id: 'fu_worker',
    phase: 2,
    kind: 'followup',
    faction: 'human',
    zone: 'city',
    requires: { flags: ['factory_limit'] },
    speaker: { emoji: '👷', name: '실직한 노동자 대표' },
    text: '공장이 멈춘 뒤로 3년째 일자리가 없어요. 강이 맑아진 건 알아요. 그런데 저희도 지구의 구성원 아닌가요?',
    evidence: {
      text: '전 세계 재생에너지 일자리는 최소 1,660만 개로, 지금까지 가장 많아요.',
      from: 'IRENA·ILO · Renewable energy and jobs (2026)',
      url: 'https://www.irena.org/Publications/2026/Jan/Renewable-energy-and-jobs-Annual-review-2025',
    },
    example: {
      text: '독일은 석탄 발전을 2038년까지 끝내기로 하고, 탄광 지역에 최대 400억 유로를 지원하기로 했어요.',
      from: '독일 연방정부 · 구조강화법',
      url: 'https://www.bundesregierung.de/breg-en/service/archive/kohleregionen-foerderung-1665150',
    },
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
    faction: 'human',
    zone: 'city',
    requires: { flags: ['factory_run'] },
    speaker: { emoji: '🧒', name: '강가 마을 어린이' },
    text: '강에서 이상한 냄새가 나요. 어제는 물고기가 잔뜩 떠올랐어요. 강 좀 고쳐 주세요.',
    evidence: {
      text: '울산 태화강은 1996년 오염이 너무 심해서 공업용수로도 쓸 수 없는 강이었어요.',
      from: '울산광역시 · 태화강 살리기 사업',
      url: 'https://www.ulsan.go.kr/s/garden/contents.ulsan?mId=001005003000000000',
    },
    example: {
      text: '시·기업·시민이 함께 강을 살려 2007년부터 1등급 물이 됐고, 연어와 은어가 돌아왔어요. 2019년엔 국가정원이 됐어요.',
      from: '울산광역시 · 대한민국 정책브리핑 (2019)',
      url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148862636',
    },
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
    faction: 'human',
    zone: 'rural',
    requires: { flags: ['cattle_cut'] },
    speaker: { emoji: '🧑‍🌾', name: '축산 농부 대표' },
    text: '목장을 줄였더니 빚만 남았어요. 소 대신 다른 걸 키울 수 있게 도와주세요.',
    evidence: {
      text: '단백질 100g을 얻는 데 소고기는 땅이 약 164㎡, 완두콩은 약 3.4㎡ 필요해요.',
      from: 'Our World in Data (Poore & Nemecek, Science 2018)',
      url: 'https://ourworldindata.org/grapher/land-use-protein-poore',
    },
    example: {
      text: '덴마크는 콩 같은 식물성 식품 산업을 키우려고 2023~2030년 기금 6억 7,500만 크로네를 마련했어요.',
      from: '덴마크 식물성식품기금 Plantefonden',
      url: 'https://plantefonden.dk/hvem-er-vi/om-plantefonden',
    },
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
    faction: 'human',
    zone: 'tropical',
    requires: { flags: ['fossil_free'] },
    speaker: { emoji: '🏝️', name: '태평양 섬마을 주민 대표' },
    text: '바닷물이 마을 앞까지 올라왔어요. 우리 산호섬은 제일 높은 곳도 겨우 몇 미터예요. 방파제를 쌓아 주세요.',
    evidence: {
      text: '1993년 이후 전 세계 바닷물 높이가 약 11cm 올라갔어요. 지금은 해마다 약 0.44cm씩 올라요.',
      from: 'NASA · Global Mean Sea Level',
      url: 'https://sealevel.nasa.gov/vital-signs/global-mean-sea-level/',
    },
    example: {
      text: '호주는 2023년 섬나라 투발루와 조약을 맺어, 해마다 최대 280명이 호주로 이주할 수 있게 했어요.',
      from: '호주 외교통상부 DFAT (2023)',
      url: 'https://www.dfat.gov.au/geo/tuvalu/australia-tuvalu-falepili-union-treaty',
    },
    policy: '해안 방파제 건설',
    approve: {
      effects: { earth: -3, human: 8, economy: -10 },
      flag: 'seawall',
      reactions: [
        { emoji: '🏝️', name: '섬마을 주민', text: '이제 밤에 편히 잘 수 있어요.' },
        { emoji: '🦀', name: '게', text: '벽 때문에 모래사장으로 못 가요.' },
      ],
    },
    reject: {
      effects: { earth: 0, human: -10, economy: 2 },
      flag: 'coast_flooded',
      reactions: [
        { emoji: '🏝️', name: '섬마을 주민', text: '결국 섬을 떠나 다른 나라로 이주하기로 했어요.' },
        { emoji: '🦀', name: '게', text: '사람들이 떠난 골목에 바닷물이 들어와요.' },
      ],
    },
  },
  {
    id: 'fu_deer',
    phase: 2,
    kind: 'followup',
    faction: 'nature',
    zone: 'rural',
    requires: { flags: ['forest_dev'] },
    speaker: { emoji: '🦌', name: '사슴 대표' },
    text: '아파트 단지 때문에 숲이 둘로 끊겼어요. 길을 건너다 차에 치일 뻔한 친구가 많아요.',
    evidence: {
      text: '우리나라 로드킬은 2019년 2만 1,397건에서 2021년 3만 7,261건으로 늘었어요.',
      from: '대한민국 정책브리핑 (2022)',
      url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148906851',
    },
    example: {
      text: '국립공원 생태통로 18곳을 살펴보니, 통로를 쓰는 동물은 약 30% 늘고 로드킬은 평균 약 18% 줄었어요.',
      from: '국립공원공단 (2026)',
      url: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156753490',
    },
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
    faction: 'human',
    zone: 'city',
    speaker: { emoji: '🚙', name: '자동차 회사 대표' },
    text: '전기차로 바꾸는 사람한테 보조금 주시면, 매연 없는 도시 금방 만들어 드릴게요!',
    evidence: {
      text: '칠레 아타카마 소금호수의 리튬 채굴 지역에서 플라밍고 두 종이 11년 새 약 10~12% 줄었어요.',
      from: 'Gutiérrez 외, 영국왕립학회보 B (2022)',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8905151',
    },
    example: {
      text: '2023년에 팔린 전기차는 평생 내는 온실가스가 같은 급 휘발유·경유차의 절반쯤이에요.',
      from: '국제에너지기구 IEA · Global EV Outlook 2024',
      url: 'https://www.iea.org/reports/global-ev-outlook-2024/outlook-for-emissions-reductions',
    },
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
    faction: 'human',
    zone: 'rural',
    speaker: { emoji: '☀️', name: '태양광 회사 대표' },
    text: '산비탈에 태양광 패널을 깔면 석탄 없이 깨끗한 전기를 만들 수 있어요. 나무를 좀 베야 하지만요.',
    evidence: {
      text: '2017년 5월부터 3년 동안 산을 태양광 용도로 쓰도록 허가한 면적이 4,768ha예요.',
      from: '산림청 (2020)',
      url: 'https://fmc.forest.go.kr/fmc/showTwbbsContDetail.do?bbrssId=BBRSS_0005&twbbsNo=400154',
    },
    example: {
      text: '정부가 2018년 말 산지 태양광 경사 기준을 25도에서 15도로 강화하자, 허가가 2018년 5,553건에서 2019년 2,129건으로 줄었어요.',
      from: '산림청 (2020)',
      url: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156411343',
    },
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
    zone: 'rural',
    speaker: { emoji: '🐝', name: '꿀벌 대표' },
    text: '농약 때문에 친구들이 집에 돌아오지 않아요. 우리가 없으면 사과도 딸기도 없다고요!',
    evidence: {
      text: '세계 주요 식량 작물의 4분의 3 이상이 벌 같은 동물의 꽃가루받이에 기대요.',
      from: 'IPBES 생물다양성 과학기구 (2016)',
      url: 'https://www.ipbes.net/article/press-release-pollinators-vital-our-food-supply-under-threat',
    },
    example: {
      text: '유럽연합은 2018년 꿀벌에 해로운 네오니코티노이드 농약 3종을 밭에서 못 쓰게 했어요. 온실 안에서만 쓸 수 있어요.',
      from: '유럽연합 집행위원회 (2018)',
      url: 'https://food.ec.europa.eu/plants/pesticides/approval-active-substances-safeners-and-synergists/renewal-approval/neonicotinoids_en',
    },
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
    faction: 'human',
    zone: 'city',
    speaker: { emoji: '🚄', name: '고속열차 대표' },
    text: '서울에서 부산까지 비행기 탈 필요 있나요? 저 타면 2시간 반쯤이에요. 가까운 거리 비행기는 없애 주세요!',
    evidence: {
      text: '2019년 항공기는 전 세계 이산화탄소 배출의 2.5%를 차지했어요.',
      from: 'Our World in Data',
      url: 'https://ourworldindata.org/global-aviation-emissions',
    },
    example: {
      text: '프랑스는 2023년 5월, 기차로 2시간 30분 안에 갈 수 있는 국내선 비행을 금지했어요.',
      from: '프랑스 생태전환부 (2023)',
      url: 'https://www.ecologie.gouv.fr/clement-beaune-salue-publication-du-decret-qui-rend-effective-linterdiction-des-lignes-aeriennes-en',
    },
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
    faction: 'human',
    zone: 'rural',
    speaker: { emoji: '🧑‍🌾', name: '산골 마을 농부' },
    text: '멧돼지가 너무 많아져서 밤마다 밭을 다 파헤쳐요. 멧돼지 수를 좀 줄여 주세요.',
    evidence: {
      text: '2020~2024년 야생동물 농작물 피해는 약 478억 원이고, 그중 멧돼지 피해가 약 300억 원이었어요.',
      from: '더팩트 (농식품부·환경부 국회 제출 자료, 2025)',
      url: 'https://news.tf.co.kr/read/ogmeta/2250316.htm',
    },
    example: {
      text: '2019년 아프리카돼지열병이 들어온 뒤 2년 반 동안 야생 멧돼지 2,577마리에서 확인돼, 정부가 전국 감시를 강화했어요.',
      from: '대한민국 정책브리핑 (2022)',
      url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148901279',
    },
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

  {
    id: 'arctic_gas',
    phase: 2,
    kind: 'normal',
    faction: 'human',
    zone: 'subarctic',
    speaker: { emoji: '⛽', name: '에너지 회사 대표' },
    text: '시베리아의 얼어붙은 땅 밑에 가스가 엄청 묻혀 있어요. 뽑아 쓰면 겨울 난방비가 확 내려가요.',
    evidence: {
      text: '영구동토층에는 탄소 약 1조 4천억 톤이 얼어 있어요. 지금 대기 속 탄소(약 8,500억 톤)보다 많아요.',
      from: '미국 국립설빙데이터센터 NSIDC',
      url: 'https://nsidc.org/learn/parts-cryosphere/frozen-ground-permafrost/why-frozen-ground-matters',
    },
    example: {
      text: '얼음이 많은 땅이 녹으면 땅이 꺼져서 건물·도로·파이프라인이 망가질 수 있어요.',
      from: '미국 국립설빙데이터센터 NSIDC',
      url: 'https://nsidc.org/learn/parts-cryosphere/frozen-ground-permafrost/why-frozen-ground-matters',
    },
    policy: '시베리아 가스전 개발',
    approve: {
      effects: { earth: -10, human: 4, economy: 8 },
      flag: 'arctic_gas',
      reactions: [
        { emoji: '⛽', name: '에너지 회사', text: '가스관 공사 시작! 올겨울 난방비 걱정 끝이에요.' },
        { emoji: '🦌', name: '순록', text: '땅이 푹푹 꺼져요. 땅속 얼음이 녹고 있대요.' },
      ],
    },
    reject: {
      effects: { earth: 6, human: -3, economy: -3 },
      reactions: [
        { emoji: '⛽', name: '에너지 회사', text: '그럼 비싼 가스를 계속 사 와야죠.' },
        { emoji: '🦌', name: '순록', text: '이끼밭이 그대로예요. 다행이에요.' },
      ],
    },
  },
  {
    id: 'desert',
    phase: 2,
    kind: 'normal',
    faction: 'human',
    zone: 'dry',
    speaker: { emoji: '🏜️', name: '사막 마을 대표' },
    text: '모래 언덕이 해마다 마을 쪽으로 다가와요. 마을 둘레에 나무를 심어서 모래를 막아 주세요.',
    evidence: {
      text: '2015~2019년 세계는 해마다 최소 1억 ha의 건강한 땅을 잃었어요. 다 합치면 그린란드의 2배 넓이예요.',
      from: '유엔사막화방지협약 UNCCD (2023)',
      url: 'https://www.unccd.int/news-stories/press-releases/least-100-million-hectares-healthy-land-now-lost-each-year',
    },
    example: {
      text: '아프리카는 2007년부터 8,000km 길이의 ‘거대한 녹색 장벽’을 만들고 있어요. 지금까지 약 1,800만 ha를 되살렸어요.',
      from: '유엔사막화방지협약 UNCCD · Great Green Wall',
      url: 'https://www.unccd.int/our-work/ggwi/great-green-wall-accelerator',
    },
    policy: '사막 나무 장벽 심기',
    approve: {
      effects: { earth: 8, human: 4, economy: -6 },
      flag: 'green_wall',
      reactions: [
        { emoji: '🏜️', name: '사막 마을 사람들', text: '나무가 자라니까 모래바람이 덜 들어와요.' },
        { emoji: '🏛️', name: '국세청', text: '나무 심고 물 주는 데 나라 돈이 꽤 들어가요.' },
      ],
    },
    reject: {
      effects: { earth: -6, human: -6, economy: 3 },
      flag: 'desert_spread',
      reactions: [
        { emoji: '🏜️', name: '사막 마을 사람들', text: '우물이 모래에 묻혔어요. 이제 떠나야 해요.' },
        { emoji: '🐪', name: '낙타', text: '…(물 냄새가 안 나요)' },
      ],
    },
  },

  // ───────── 후반: 쉽게 풀리지 않는 문제 ─────────
  {
    id: 'refugee',
    phase: 3,
    kind: 'normal',
    faction: 'human',
    zone: 'dry',
    speaker: { emoji: '🧳', name: '기후 난민 대표' },
    text: '비가 오지 않아 우리 마을 땅이 사막이 됐어요. 더 이상 농사를 지을 수 없어요. 우리를 받아 줄 수 있나요?',
    evidence: {
      text: '최근 10년 동안 날씨 재난 때문에 약 2억 5천만 건의 국내 피란이 생겼어요. 하루 6만 7천 건이 넘어요.',
      from: '유엔난민기구 UNHCR · No Escape II (2025)',
      url: 'https://data.unhcr.org/en/documents/details/119766',
    },
    example: {
      text: '세계은행은 2050년까지 최대 2억 1,600만 명이 기후 때문에 자기 나라 안에서 이주할 수 있다고 내다봤어요.',
      from: '세계은행 World Bank · Groundswell (2021)',
      url: 'https://www.worldbank.org/en/news/press-release/2021/09/13/climate-change-could-force-216-million-people-to-migrate-within-their-own-countries-by-2050',
    },
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
    faction: 'human',
    zone: 'polar',
    speaker: { emoji: '🧑‍🏫', name: '경제학자' },
    text: '탄소를 많이 내뿜는 기업에 세금을 매기면, 다들 알아서 줄이려고 할 거예요.',
    evidence: {
      text: '스웨덴은 1991년 탄소세를 도입했어요. 세금은 1톤당 250크로나에서 2026년 1,520크로나로 올랐어요.',
      from: '국제에너지기구 IEA · 정책 데이터베이스 (2026)',
      url: 'https://www.iea.org/policies/12725-government-bill-19909119-sweden-carbon-tax',
    },
    example: {
      text: '1990~2018년 스웨덴 경제(GDP)는 83% 커졌고, 온실가스는 27% 줄었어요.',
      from: '스웨덴 재무부 · Carbon Taxation in Sweden (2021)',
      url: 'https://www.government.se/contentassets/419eb2cafa93423c891c09cb9914801b/210111-carbon-tax-sweden---general-info.pdf',
    },
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
    faction: 'human',
    zone: 'polar',
    speaker: { emoji: '🧑‍🔬', name: '기후 과학자' },
    text: '하늘 높이 햇빛을 반사하는 물질을 뿌리면 지구 온도를 바로 낮출 수 있어요. 부작용은… 아직 잘 몰라요.',
    evidence: {
      text: '1991년 피나투보 화산이 이산화황 약 2천만 톤을 뿜은 뒤, 지구 기온이 1993년까지 잠시 약 0.5℃ 내려갔어요.',
      from: '미국지질조사국 USGS (1997)',
      url: 'https://pubs.usgs.gov/fs/1997/fs113-97/',
    },
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
    faction: 'human',
    zone: 'city',
    speaker: { emoji: '🧑‍💼', name: '직장인 대표' },
    text: '주 4일만 일하게 해 주세요. 출퇴근이 줄면 탄소도 줄잖아요? (진짜 이유는 쉬고 싶어서지만요)',
    example: {
      text: '2022년 영국 주 4일제 실험에 61개 회사가 참여했어요. 56곳(92%)이 계속하기로 했고, 직원 71%는 번아웃이 줄었어요.',
      from: 'Autonomy 외 · 영국 주 4일제 실험 결과 (2023)',
      url: 'https://autonomy.work/wp-content/uploads/2023/02/The-results-are-in-The-UKs-four-day-week-pilot.pdf',
    },
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
    faction: 'human',
    zone: 'dry',
    speaker: { emoji: '🛢️', name: '산유국 대표' },
    text: '사막 한가운데 있는 우리 나라는 석유를 팔아서 먹고살아요. 석유를 계속 사 주세요.',
    evidence: {
      text: '석유·가스·석탄 같은 화석연료가 아직 세계 에너지 수요의 약 80%를 채워요.',
      from: '국제에너지기구 IEA (2024)',
      url: 'https://www.iea.org/events/weo24-webinar-fuels-outlook',
    },
    example: {
      text: '사우디아라비아는 2025년 정부 수입의 약 55%를 석유로 벌었어요.',
      from: '사우디아라비아 재무부 · 2025년 예산 실적 보고서',
      url: 'https://www.mof.gov.sa/en/financialreport/2025/Documents/Q4%202025-%20En.pdf',
    },
    policy: '석유 수입 계속하기',
    approve: {
      effects: { earth: -8, human: 3, economy: 7 },
      flag: 'oil_keep',
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

  {
    id: 'taiga_fire',
    phase: 3,
    kind: 'normal',
    faction: 'human',
    zone: 'subarctic',
    speaker: { emoji: '🧑‍🚒', name: '산불 진화대 대표' },
    text: '북쪽 침엽수림의 산불이 해마다 더 커지고 길어져요. 감시 위성이랑 진화대를 늘려 주세요.',
    evidence: {
      text: '2023년 캐나다 산불은 약 1,500만 ha를 태웠어요. 보통 해(250만 ha)의 6배예요.',
      from: '캐나다 천연자원부 (2023)',
      url: 'https://natural-resources.canada.ca/stories/simply-science/canada-s-record-breaking-wildfires-2023-fiery-wake-call',
    },
    example: {
      text: '이 산불은 탄소 약 4억 8천만 톤을 내뿜었어요. 2023년 전 세계 산불 탄소 배출의 23%예요.',
      from: '코페르니쿠스 대기감시서비스 CAMS (2023)',
      url: 'https://atmosphere.copernicus.eu/copernicus-canada-produced-23-global-wildfire-carbon-emissions-2023',
    },
    policy: '북쪽 숲 산불 대응 지원',
    approve: {
      effects: { earth: 7, human: 3, economy: -6 },
      flag: 'fire_crew',
      reactions: [
        { emoji: '🧑‍🚒', name: '진화대', text: '올여름은 불씨를 일찍 잡았어요!' },
        { emoji: '🦌', name: '순록', text: '연기 냄새가 덜 나요.' },
      ],
    },
    reject: {
      effects: { earth: -8, human: -3, economy: 4 },
      flag: 'fire_ignored',
      reactions: [
        { emoji: '🧑‍🚒', name: '진화대', text: '사람이 모자라서 불이 다 탈 때까지 지켜만 봤어요.' },
        { emoji: '🦌', name: '순록', text: '겨울에 먹을 이끼밭이 다 탔어요.' },
      ],
    },
  },

  // ───────── 부작용 사건: 한 지표가 너무 높아지면 등장 ─────────
  {
    id: 'over_economy',
    phase: 2,
    kind: 'sideEffect',
    faction: 'human',
    zone: 'city',
    requires: { min: { economy: 85 } },
    speaker: { emoji: '📈', name: '투자자 대표' },
    text: '경제가 역대 최고 호황이에요! 이 기세로 공장을 두 배로 늘리죠!',
    evidence: {
      text: '2023년 우리나라 황산화물(초미세먼지를 만드는 원료)의 약 66%가 공장에서 나왔어요.',
      from: '국가미세먼지정보센터 · 2023년 부문별 배출량',
      url: 'https://www.air.go.kr/capss/emission/sector.do?menuId=30',
    },
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
    faction: 'human',
    zone: 'city',
    requires: { min: { human: 85 } },
    speaker: { emoji: '🛍️', name: '쇼핑몰 대표' },
    text: '사람들이 다들 살 만해지니까 쇼핑을 엄청 해요! 24시간 영업하게 해 주세요.',
    evidence: {
      text: '코로나19 때 1년 새(2019→2020년 3월) 폐플라스틱은 18.1%, 폐비닐은 10.0% 늘었어요.',
      from: '국무조정실 등 관계부처 합동 (2022)',
      url: 'https://m.korea.kr/briefing/pressReleaseView.do?newsId=156493659',
    },
    example: {
      text: '정부는 택배 포장 횟수와 빈 공간 비율을 줄이는 기준을 2024년 4월 30일부터 시행했어요.',
      from: '대한민국 정책브리핑 (2024)',
      url: 'https://www.korea.kr/news/policyNewsView.do?newsId=156619045',
    },
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
    faction: 'human',
    zone: 'rural',
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

  // ───────── 항의 사건: 자연·인간 민심이 바닥나거나 경제가 무너지면 등장 ─────────
  {
    id: 'protest_nature',
    phase: 2,
    kind: 'protest',
    requires: { trustMax: { nature: 25 } },
    faction: 'nature',
    zone: 'tropical',
    speaker: { emoji: '🌳', name: '숲·바다·하늘 연합 대표단' },
    text: '우리 부탁은 한 번도 제대로 들어준 적이 없어요. 펭귄도, 물고기도, 꿀벌도 같이 왔어요. 지금 당장 자연 보호 구역을 넓혀 주세요.',
    evidence: {
      text: '2024년 보호구역은 육지의 17.6%, 바다의 8.4%뿐이에요.',
      from: '유엔환경계획 UNEP·IUCN · Protected Planet Report (2024)',
      url: 'https://www.unep.org/en/news-and-stories/press-release/world-must-act-faster-protect-30-planet-2030',
    },
    example: {
      text: '2022년 유엔 생물다양성 총회는 2030년까지 육지와 바다의 30% 이상을 보전하자는 ‘30x30’ 목표를 채택했어요.',
      from: '생물다양성협약 CBD (2022)',
      url: 'https://www.cbd.int/gbf/targets/3',
    },
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
    id: 'protest_human',
    phase: 2,
    kind: 'protest',
    requires: { trustMax: { human: 25 } },
    faction: 'human',
    zone: 'city',
    speaker: { emoji: '📢', name: '시민 연대 대표' },
    text: '네오 가이아는 사람을 숫자로만 봐요! 노동자도, 가게 사장님도, 학생도 광장에 모였어요. 기후 위기로 힘든 사람들한테 생활 지원금을 주세요.',
    example: {
      text: '우리나라 에너지바우처는 취약계층에 냉난방비를 줘요. 2026년엔 1인 세대 29만 5,200원, 4인 이상 세대 70만 1,300원이에요.',
      from: '한국에너지공단 · 에너지바우처 (2026)',
      url: 'https://www.energyv.or.kr/info/support_info.do',
    },
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
    requires: { max: { economy: 28 } },
    faction: 'human',
    zone: 'city',
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
    evidence: {
      text: '에콰도르는 2008년 헌법에 ‘자연이 존재를 존중받고 되살아날 권리’를 넣었어요.',
      from: '에콰도르 헌법 제71조 (2008)',
      url: 'https://pdba.georgetown.edu/Constitutions/Ecuador/english08.html',
    },
    example: {
      text: '뉴질랜드는 2017년 법으로 황거누이(Whanganui)강을 ‘법적 인격체’로 인정하고, 강을 대신해 말할 대리인을 두었어요.',
      from: '뉴질랜드 Te Awa Tupua 법 (2017)',
      url: 'https://www.legislation.govt.nz/act/public/2017/0007/latest/whole.html',
    },
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
    evidence: {
      text: '세계 인구는 2024년 82억 명이에요. 2080년대 중반 약 103억 명으로 가장 많아진 뒤 줄어들 전망이에요.',
      from: '유엔 UN DESA · 세계 인구 전망 (2024)',
      url: 'https://www.un.org/en/UN-projects-world-population-to-peak-within-this-century',
    },
    example: {
      text: '가장 부유한 10%가 세계 탄소 배출의 절반을 냈어요. 최상위 1%는 가난한 50억 명만큼 배출했어요. 사람 수보다 사는 방식이 더 크게 달라요.',
      from: '옥스팜 Oxfam·SEI (2023)',
      url: 'https://www.oxfam.org/en/press-releases/richest-1-emit-much-planet-heating-pollution-two-thirds-humanity',
    },
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
