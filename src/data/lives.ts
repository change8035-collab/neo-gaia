import type { Life } from '../game/types.ts'

// 재탄생할 수 있는 지구 구성원
// - 장면마다 variants 를 위에서부터 확인해서 조건이 처음 맞는 문장을 씀
// - 그래서 더 구체적인 조건을 위에, 조건 없는 기본 문장을 맨 아래에 둬야 함
// - score: 그 장면이 삶에 준 영향 (+1 좋음, -1 힘듦, -2 아주 힘듦)

export const LIVES: Life[] = [
  {
    id: 'worker_kid',
    emoji: '👷',
    name: '공업 도시 노동자의 아이',
    kind: 'human',
    zone: 'industrial',
    intro: '당신은 강변 공업 도시의 노동자 가정에서 태어났습니다.',
    introGaia: '당신은 인류의 90%가 사라진 뒤, 텅 빈 공업 도시에서 태어났습니다.',
    scenes: [
      {
        title: '어린 시절',
        variants: [
          { if: { flags: ['gaia'] }, text: '공장 굴뚝은 모두 멈춰 있었습니다. 동네에 사는 아이는 당신 하나뿐이었습니다.', score: -1 },
          { if: { flags: ['river_clean'] }, text: '더러웠던 강이 정화 사업 덕분에 다시 맑아졌습니다. 아빠는 어릴 땐 상상도 못 했다고 했습니다.', score: 1 },
          { if: { flags: ['factory_limit'] }, text: '공장이 줄어든 뒤 강이 맑아져서, 여름마다 친구들과 물놀이를 했습니다.', score: 1 },
          { if: { flags: ['river_dead'] }, text: "강에는 '수영 금지' 팻말이 붙어 있었습니다. 냄새 때문에 여름에도 창문을 닫고 지냈습니다.", score: -1 },
          { if: { flags: ['factory_run'] }, text: '회색 강을 보며 자랐습니다. 그래도 강변 공터는 좋은 놀이터였습니다.', score: 0 },
          { text: '공장 기계 소리를 자장가 삼아 자랐습니다.', score: 0 },
        ],
      },
      {
        title: '학창 시절',
        variants: [
          { if: { flags: ['green_jobs'] }, text: '공장은 멈췄지만, 지원 정책 덕분에 아빠는 태양광 기술자가 되었습니다. 집안 형편도 다시 나아졌습니다.', score: 1 },
          { if: { flags: ['workers_left'] }, text: '아빠가 다니던 공장이 멈춘 뒤, 가족은 일자리를 찾아 낯선 도시로 이사했습니다. 친구들과 작별 인사도 제대로 못 했습니다.', score: -2 },
          { if: { flags: ['factory_boom'] }, text: '공장이 두 배로 늘어 아빠는 야근이 잦았습니다. 돈은 모였지만 하늘은 늘 뿌옜습니다.', score: 0 },
          { if: { flags: ['factory_run'] }, text: '공장은 쉬지 않고 돌아갔고, 아빠 월급은 꼬박꼬박 나왔습니다.', score: 1 },
          { text: '부모님은 공장과 집을 오가며 바쁘게 일했습니다.', score: 0 },
        ],
      },
      {
        title: '어른이 되어',
        variants: [
          { if: { flags: ['gaia'] }, text: '일할 공장도, 함께 일할 사람도 없었습니다. 남은 몇 사람과 텃밭을 일구며 살았습니다.', score: -1 },
          { if: { max: { economy: 25 } }, text: '물가가 너무 올라서 저녁 반찬 하나 고르는 것도 고민이 됐습니다.', score: -1 },
          { if: { max: { earth: 25 } }, text: '여름마다 폭염 경보가 울려 공장 일이 자주 멈췄습니다.', score: -1 },
          { if: { flags: ['four_day'] }, text: '주 4일 근무 덕분에 금요일마다 아이 손을 잡고 강변을 걸었습니다.', score: 1 },
          { if: { min: { earth: 55, economy: 40 } }, text: '맑아진 강변 공원에서 주말을 보내며, 안정된 삶을 꾸렸습니다.', score: 1 },
          { text: '넉넉하지는 않았지만, 그럭저럭 살아갈 만했습니다.', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'coast_kid',
    emoji: '🏖️',
    name: '해안 마을의 아이',
    kind: 'human',
    zone: 'coast',
    intro: '당신은 바닷가 작은 마을에서 태어났습니다.',
    introGaia: '당신은 인류의 90%가 사라진 뒤, 바닷가 작은 마을에서 태어났습니다.',
    scenes: [
      {
        title: '어린 시절',
        variants: [
          { if: { flags: ['gaia'] }, text: '마을에 아이는 당신 하나뿐이었습니다. 학교는 오래전에 문을 닫았습니다.', score: -1 },
          { if: { flags: ['coast_flooded'] }, text: '바닷물이 골목까지 들어와서, 가족은 언덕 위 임시 주택으로 이사했습니다.', score: -2 },
          { if: { flags: ['seawall'] }, text: '마을 앞에 높은 방파제가 있었습니다. 안전했지만, 바다는 벽 너머에서 소리로만 들렸습니다.', score: 0 },
          { if: { flags: ['fossil_limit'] }, text: '바닷물이 차오르는 속도가 느려져서, 할머니 집은 여전히 바닷가에 있었습니다.', score: 1 },
          { text: '여름마다 태풍이 조금씩 세졌습니다.', score: 0 },
        ],
      },
      {
        title: '학창 시절',
        variants: [
          { if: { flags: ['plastic_ban'] }, text: '바닷가 쓰레기 줍기 봉사 활동이 없어졌습니다. 주울 쓰레기가 거의 없었거든요.', score: 1 },
          { if: { flags: ['aircon_limit'] }, text: '교실 에어컨을 마음껏 틀 수 없어서, 여름이면 다들 부채질을 했습니다.', score: -1 },
          { if: { flags: ['less_meat'] }, text: '급식에 고기는 일주일에 두 번만 나왔습니다. 처음엔 투덜댔지만, 생선구이는 꽤 맛있었습니다.', score: 0 },
          { text: '방과 후엔 바다에서 수영하며 평범한 학교생활을 했습니다.', score: 0 },
        ],
      },
      {
        title: '어른이 되어',
        variants: [
          { if: { flags: ['gaia'] }, text: '바다는 아주 맑아졌습니다. 하지만 함께 바다를 볼 사람이 거의 없었습니다.', score: -1 },
          { if: { max: { earth: 30 } }, text: '결국 마을은 바닷물에 잠겨 지도에서 사라졌습니다.', score: -2 },
          { if: { min: { earth: 60 } }, text: '어른이 된 당신은 다시 돌아온 바다거북을 지키는 일을 하게 되었습니다.', score: 1 },
          { if: { flags: ['refugee_welcome'] }, text: '마을에 기후 난민 가족들이 이사 와서, 오랜만에 학교에 아이들 소리가 났습니다.', score: 1 },
          { text: '고향을 떠나 도시에서 살게 되었지만, 바다 냄새가 가끔 그리웠습니다.', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'farm_kid',
    emoji: '🧑‍🌾',
    name: '목장집 아이',
    kind: 'human',
    zone: 'farm',
    intro: '당신은 소를 키우는 목장집 아이로 태어났습니다.',
    introGaia: '당신은 인류의 90%가 사라진 뒤, 주인 잃은 목장 근처에서 태어났습니다.',
    scenes: [
      {
        title: '어린 시절',
        variants: [
          { if: { flags: ['gaia'] }, text: '울타리가 무너진 목장에서 소들이 제멋대로 돌아다녔습니다. 돌볼 사람이 없었습니다.', score: -1 },
          { if: { flags: ['cattle_cut'] }, text: '목장의 소가 절반으로 줄었고, 부모님은 밤마다 통장을 들여다봤습니다.', score: -1 },
          { if: { flags: ['cattle_keep'] }, text: '목장은 늘 소 울음소리로 가득했고, 집안 형편도 괜찮았습니다.', score: 1 },
          { text: '소들과 함께 뛰어놀며 자랐습니다.', score: 0 },
        ],
      },
      {
        title: '학창 시절',
        variants: [
          { if: { flags: ['farm_shift'] }, text: '부모님은 버섯 농장으로 바꿨습니다. 처음엔 힘들었지만, 지금은 동네에서 제일 유명한 버섯 농장입니다.', score: 1 },
          { if: { flags: ['farm_closed'] }, text: '결국 목장을 팔고 도시로 이사했습니다. 소들이 트럭에 실려 가던 날을 잊지 못했습니다.', score: -2 },
          { if: { flags: ['cattle_keep'] }, text: '축사 냄새와 폐수 문제로 이웃 마을과 자주 다퉜습니다.', score: -1 },
          { if: { flags: ['bees_gone'] }, text: '벌이 사라져서, 과수원 일을 도울 때마다 붓으로 꽃가루를 묻혔습니다.', score: -1 },
          { text: '가업을 이을지 고민하며 농업 고등학교에 다녔습니다.', score: 0 },
        ],
      },
      {
        title: '어른이 되어',
        variants: [
          { if: { flags: ['gaia'] }, text: '넓은 들판에 사람은 거의 없었습니다. 가끔은 너무 조용해서 무서웠습니다.', score: -1 },
          { if: { max: { earth: 30 } }, text: '가뭄이 이어져 해마다 농사를 망쳤습니다.', score: -2 },
          { if: { max: { economy: 25 } }, text: '농산물 값이 떨어져 빚이 계속 늘었습니다.', score: -1 },
          { if: { min: { earth: 55 } }, text: '날씨가 비교적 안정되어 농사 걱정이 줄었습니다.', score: 1 },
          { text: '땅을 지키며 그럭저럭 살았습니다.', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'deer',
    emoji: '🦌',
    name: '뒷산 숲의 사슴',
    kind: 'animal',
    zone: 'forest',
    intro: '당신은 도시 뒷산 숲의 사슴으로 태어났습니다.',
    introGaia: '당신은 사람이 거의 사라진 세상의 사슴으로 태어났습니다.',
    scenes: [
      {
        title: '어린 시절',
        variants: [
          { if: { flags: ['gaia'] }, text: '도로에는 차가 다니지 않았습니다. 숲은 끝없이 넓었습니다.', score: 1 },
          { if: { flags: ['forest_protect'] }, text: '개발 제한 덕분에 숲이 그대로 남아 있었습니다. 엄마를 따라 마음껏 뛰어다녔습니다.', score: 1 },
          { if: { flags: ['forest_dev', 'eco_bridge'] }, text: '숲 한가운데 아파트가 생겼지만, 생태 통로를 건너 건너편 숲으로 갈 수 있었습니다.', score: 0 },
          { if: { flags: ['forest_dev'] }, text: '엄마와 살던 숲에 아파트가 들어섰습니다. 갈 수 있는 곳이 확 줄었습니다.', score: -1 },
          { text: '작은 숲에서 태어났습니다.', score: 0 },
        ],
      },
      {
        title: '자라서',
        variants: [
          { if: { flags: ['forest_dev'], notFlags: ['eco_bridge', 'gaia'] }, text: '먹이를 찾아 도로를 건너다 차에 치일 뻔한 날이 많았습니다.', score: -1 },
          { if: { flags: ['solar_forest'] }, text: '숲 한쪽이 태양광 패널로 덮였습니다. 갈 수 있는 곳은 줄었지만, 여름 공기는 조금 덜 뜨거웠습니다.', score: 0 },
          { if: { flags: ['bees_gone'] }, text: '꽃이 피지 않는 들판이 늘어서 먹을 열매가 줄었습니다.', score: -1 },
          { if: { flags: ['bees_saved'] }, text: '들꽃이 가득 피어서 먹을 것이 넉넉했습니다.', score: 1 },
          { text: '계절마다 먹을 것을 찾아 숲을 돌아다녔습니다.', score: 0 },
        ],
      },
      {
        title: '다 자라서',
        variants: [
          { if: { flags: ['gaia'] }, text: '숲은 사람이 떠난 마을까지 번졌습니다. 당신은 텅 빈 학교 운동장에서 풀을 뜯었습니다.', score: 1 },
          { if: { flags: ['boar_cull'] }, text: '옆 숲의 멧돼지 가족이 어느 날 사라졌습니다. 다음은 누구일까, 가끔 생각했습니다.', score: -1 },
          { if: { max: { earth: 30 } }, text: '가뭄과 산불이 잦아져 숲이 해마다 줄었습니다.', score: -2 },
          { if: { min: { earth: 60 } }, text: '숲이 이어져 있어서, 새끼들과 함께 멀리까지 이동할 수 있었습니다.', score: 1 },
          { text: '조용한 숲에서 나이를 먹었습니다.', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'penguin',
    emoji: '🐧',
    name: '남극의 펭귄',
    kind: 'animal',
    zone: 'antarctic',
    intro: '당신은 남극의 황제펭귄으로 태어났습니다.',
    introGaia: '당신은 사람이 거의 사라진 세상의 황제펭귄으로 태어났습니다.',
    scenes: [
      {
        title: '어린 시절',
        variants: [
          { if: { flags: ['fossil_limit'] }, text: '얼음이 녹는 속도가 느려져서, 부모님이 태어난 그 빙하에서 태어날 수 있었습니다.', score: 1 },
          { if: { flags: ['fossil_free'] }, text: '당신이 태어난 빙하는 해마다 작아졌습니다.', score: -1 },
          { text: '남극의 얼음 위에서 태어났습니다.', score: 0 },
        ],
      },
      {
        title: '자라서',
        variants: [
          { if: { flags: ['sky_shield'] }, text: '하늘이 뿌옇게 변한 뒤로 날씨가 이상해졌습니다. 왜 그런지 아는 펭귄은 없었습니다.', score: -1 },
          { if: { flags: ['plastic_ban'] }, text: '바다에서 비닐 대신 크릴과 물고기를 배불리 먹었습니다.', score: 1 },
          { if: { flags: ['carbon_tax'] }, text: '바다가 조금씩 덜 뜨거워져서, 물고기 떼가 다시 가까이 왔습니다.', score: 1 },
          { if: { flags: ['oil_stop'] }, text: '바다가 조금씩 덜 뜨거워져서, 물고기 떼가 다시 가까이 왔습니다.', score: 1 },
          { text: '무리와 함께 바다를 누비며 자랐습니다.', score: 0 },
        ],
      },
      {
        title: '다 자라서',
        variants: [
          { if: { flags: ['gaia'] }, text: '사람들이 거의 사라진 뒤에도 얼음은 한동안 계속 녹았습니다. 이미 데워진 바다는 쉽게 식지 않았기 때문입니다.', score: 0 },
          { if: { max: { earth: 30 } }, text: '무리 전체가 새 빙하를 찾아 떠돌아야 했습니다.', score: -2 },
          { if: { min: { earth: 65 } }, text: '얼음이 다시 조금씩 늘었습니다. 새끼들에게 넓은 빙하를 물려줄 수 있었습니다.', score: 1 },
          { text: '얼음은 줄었지만, 아직은 버틸 만했습니다.', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'fish',
    emoji: '🐟',
    name: '도시 강의 물고기',
    kind: 'animal',
    zone: 'industrial',
    intro: '당신은 공업 도시를 흐르는 강의 물고기로 태어났습니다.',
    introGaia: '당신은 사람이 거의 사라진 세상의 강물고기로 태어났습니다.',
    scenes: [
      {
        title: '어린 시절',
        variants: [
          { if: { flags: ['gaia'] }, text: '공장이 모두 멈춘 강물은 바닥까지 훤히 보였습니다.', score: 1 },
          { if: { flags: ['river_dead'] }, text: '탁한 물속에서 태어났습니다. 함께 깨어난 형제 중 절반만 살아남았습니다.', score: -2 },
          { if: { flags: ['river_clean'] }, text: '정화 사업으로 맑아진 강에서 알을 깨고 나왔습니다.', score: 1 },
          { if: { flags: ['factory_limit'] }, text: '공장이 줄어든 덕분에 맑은 물에서 태어났습니다.', score: 1 },
          { if: { flags: ['factory_run'] }, text: '물에서 쇠 냄새가 났습니다.', score: -1 },
          { text: '강 상류에서 태어났습니다.', score: 0 },
        ],
      },
      {
        title: '자라서',
        variants: [
          { if: { flags: ['cattle_keep'] }, text: '여름마다 축사에서 흘러온 물 때문에 녹조가 생겨 숨이 막혔습니다.', score: -1 },
          { if: { flags: ['factory_boom'] }, text: '공장이 늘어난 뒤로 강물이 점점 따뜻해졌습니다.', score: -1 },
          { if: { flags: ['bees_saved'] }, text: '농약이 줄어서 강가 풀숲에 곤충이 많아졌습니다. 먹을 게 넉넉했습니다.', score: 1 },
          { text: '강을 오르내리며 자랐습니다.', score: 0 },
        ],
      },
      {
        title: '다 자라서',
        variants: [
          { if: { flags: ['gaia'] }, text: '낚싯줄 하나 없는 강에서 오래오래 살았습니다.', score: 1 },
          { if: { flags: ['workers_left'] }, text: '강가 마을 사람들이 떠난 뒤 강은 조용해졌습니다. 아이들 물장구 소리가 가끔 그리웠습니다.', score: 0 },
          { if: { max: { earth: 30 } }, text: '가뭄으로 강물이 줄어 바닥이 드러난 곳이 많았습니다.', score: -2 },
          { if: { min: { earth: 60 } }, text: '강이 막힘없이 이어져, 알을 낳으러 고향 상류로 돌아갈 수 있었습니다.', score: 1 },
          { text: '그럭저럭 살 만한 강에서 살았습니다.', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'sparrow',
    emoji: '🐦',
    name: '도시의 참새',
    kind: 'animal',
    zone: 'city',
    intro: '당신은 큰 도시 가로수에 사는 참새로 태어났습니다.',
    introGaia: '당신은 사람이 거의 사라진 도시의 참새로 태어났습니다.',
    scenes: [
      {
        title: '어린 시절',
        variants: [
          { if: { flags: ['gaia'] }, text: '거리는 텅 비어 있었습니다. 떨어진 과자 부스러기를 주워 줄 사람도 없었습니다.', score: -1 },
          { if: { flags: ['ev_cars'] }, text: '전기차가 늘어서 거리가 조용했습니다. 매연 냄새 대신 가로수 냄새가 났습니다.', score: 1 },
          { if: { flags: ['factory_boom'] }, text: '공장이 늘어난 뒤로 하늘이 늘 뿌옜습니다. 목이 자주 칼칼했습니다.', score: -1 },
          { text: '자동차 소리와 함께 가로수 위 둥지에서 자랐습니다.', score: 0 },
        ],
      },
      {
        title: '자라서',
        variants: [
          { if: { flags: ['mall_24h'] }, text: '쇼핑몰 불빛이 밤새 꺼지지 않아서, 밤인지 낮인지 헷갈려 잠을 설쳤습니다.', score: -1 },
          { if: { flags: ['four_day'] }, text: '금요일마다 공원에 사람들이 소풍을 와서 김밥 부스러기를 나눠 줬습니다.', score: 1 },
          { if: { flags: ['flight_ban'] }, text: '하늘을 가로지르던 비행기가 줄어서, 높이 날아도 무섭지 않았습니다.', score: 1 },
          { if: { flags: ['aircon_limit'] }, text: '에어컨 실외기 열기가 줄어서, 여름 골목이 조금 덜 뜨거웠습니다.', score: 1 },
          { text: '전깃줄 위에서 친구들과 수다를 떨며 자랐습니다.', score: 0 },
        ],
      },
      {
        title: '다 자라서',
        variants: [
          { if: { flags: ['gaia'] }, text: '도시는 금세 숲이 되어 갔습니다. 먹을 벌레는 많아졌지만, 왠지 쓸쓸했습니다.', score: 0 },
          { if: { max: { earth: 30 } }, text: '여름마다 폭염이 이어져, 그늘을 찾아 하루 종일 헤맸습니다.', score: -2 },
          { if: { min: { earth: 60, human: 50 } }, text: '가로수가 늘고 사람들 표정도 밝아졌습니다. 살기 좋은 도시였습니다.', score: 1 },
          { text: '복잡하지만 정든 도시에서 나이를 먹었습니다.', score: 0 },
        ],
      },
    ],
  },
]
