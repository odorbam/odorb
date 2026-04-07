const ITEMS = [

  // ── 영구 적용 아이템 ──────────────────────────────────────────

  {
    id: 'winter_photo',
    name: '겨울이 사진',
    icon: '🐶',
    type: 'permanent',
    desc: '겨울이가 찍혀있다. 보기만 해도 기분이 좋아진다.',
    bonus: { 사랑스러움: 5 },
    unlock: {
      type: 'activity_drop',
      activityId: 'winter',
      chance: 0.25,
    },
    availableFrom: 'child',
  },

  {
    id: 'muhan_dvd',
    name: '무한도전 DVD',
    icon: '📀',
    type: 'permanent',
    desc: '소장각. 볼 때마다 웃음이 나온다.',
    bonus: { 장난스러움: 5 },
    unlock: {
      type: 'activity_count',
      activityId: 'muhan',
      count: 3,
    },
    availableFrom: 'teen',
  },

  {
    id: 'burger_coupon',
    name: '버거킹 쿠폰',
    icon: '🍔',
    type: 'permanent',
    desc: '불고기 와퍼 1+1. 인생 최고의 쿠폰.',
    bonus: { 활발함: 3 },
    unlock: {
      type: 'activity_drop',
      activityId: 'burger',
      chance: 0.30,
    },
    availableFrom: 'teen',
  },

  {
    id: 'notebook',
    name: '독서노트',
    icon: '📓',
    type: 'permanent',
    desc: '읽은 책을 기록하기 시작했다. 뭔가 달라진 느낌.',
    bonus: { 멋짐: 5, estp_T: 3 },
    unlock: {
      type: 'activity_count',
      activityId: 'read',
      count: 3,
    },
    availableFrom: 'teen',
  },

  {
    id: 'soccer_trophy',
    name: '축구 트로피',
    icon: '🏆',
    type: 'permanent',
    desc: '대회에서 받아왔다. 방에서 제일 빛나는 물건.',
    bonus: { 활발함: 7, estp_S: 3 },
    unlock: {
      type: 'activity_count',
      activityId: 'soccer',
      count: 5,
    },
    availableFrom: 'child',
  },


  // ── 장착형 아이템 ──────────────────────────────────────────────

  {
    id: 'soccer_shoes',
    name: '축구화',
    icon: '👟',
    type: 'equip',
    desc: '신으면 발이 가벼워지는 기분.',
    bonus: { 활발함: 8, estp_S: 4 },
    unlock: {
      type: 'shop',
      price: 3000,
    },
    availableFrom: 'child',
    sprite: 'item_soccer_shoes',
  },

  {
    id: 'madrid_uniform',
    name: '리얼밤드리드 유니폼',
    icon: '⚽',
    type: 'equip',
    desc: '입으면 왠지 골을 넣을 수 있을 것 같다.',
    bonus: { 활발함: 5, 멋짐: 4, estp_T: 3 },
    unlock: {
      type: 'shop',
      price: 8000,
    },
    availableFrom: 'child',
    sprite: 'item_madrid_uniform',
  },

  {
    id: 'dance_shoes',
    name: '댄스화',
    icon: '🩴',
    type: 'equip',
    desc: '박자가 저절로 맞춰진다.',
    bonus: { 장난스러움: 5, 활발함: 5 },
    unlock: {
      type: 'activity_count',
      activityId: 'dance',
      count: 3,
    },
    availableFrom: 'child',
    sprite: 'item_dance_shoes',
  },

  {
    id: 'gaming_mouse',
    name: '게이밍 마우스',
    icon: '🖱️',
    type: 'equip',
    desc: 'DPI 16000. 손이 빨라진다.',
    bonus: { 장난스러움: 8, estp_T: 5 },
    unlock: {
      type: 'activity_count',
      activityId: 'pcroom',
      count: 5,
    },
    availableFrom: 'teen',
    sprite: 'item_gaming_mouse',
  },

  {
    id: 'camera',
    name: '카메라',
    icon: '📷',
    type: 'equip',
    desc: '라이카 Q2. 예쁜 순간을 담고 싶어졌다.',
    bonus: { 멋짐: 6, 귀여움: 4 },
    unlock: {
      type: 'shop',
      price: 15000,
    },
    availableFrom: 'teen',
    sprite: 'item_camera',
  },

  {
    id: 'perfume',
    name: '향수',
    icon: '🌹',
    type: 'equip',
    desc: '장미향. 요즘 이게 좋다.',
    bonus: { 사랑스러움: 7, 귀여움: 5 },
    unlock: {
      type: 'shop',
      price: 10000,
    },
    availableFrom: 'teen',
    sprite: 'item_perfume',
  },

  {
    id: 'dog_snack',
    name: '개껌',
    icon: '🦴',
    type: 'equip',
    desc: '겨울이가 제일 좋아하는 간식. 들고 다니면 겨울이가 따라온다.',
    bonus: { 사랑스러움: 10 },
    unlock: {
      type: 'activity_count',
      activityId: 'winter',
      count: 5,
    },
    availableFrom: 'child',
    sprite: 'item_dog_snack',
  },

  {
    id: 'hairstyle',
    name: '멋진 앞머리',
    icon: '💇',
    type: 'equip',
    desc: '어쩐지 머리가 기르고 싶어졌다',
    bonus: {},
    unlock: {
      type: 'stat_threshold',
      stat: '멋짐',
      threshold: 60,
    },
    availableFrom: 'teen',
    isKeyItem: true,
    sprite: 'item_hairstyle',
  },

];

function getAvailableItems(stage, ownedIds) {
  return ITEMS.filter(item => {
    if (ownedIds.includes(item.id)) return false;
    if (item.availableFrom === 'teen' && stage === 'baby') return false;
    if (item.availableFrom === 'teen' && stage === 'child') return false;
    return true;
  });
}

function getShopItems(stage, ownedIds) {
  return getAvailableItems(stage, ownedIds).filter(
    item => item.unlock.type === 'shop'
  );
}

function checkDrops(activityId, stage, ownedIds) {
  return ITEMS.filter(item => {
    if (ownedIds.includes(item.id)) return false;
    if (item.availableFrom === 'teen' && (stage === 'baby' || stage === 'child')) return false;
    if (item.unlock.type !== 'activity_drop') return false;
    if (item.unlock.activityId !== activityId) return false;
    return Math.random() < item.unlock.chance;
  });
}

function checkActivityUnlocks(activityCounts, stage, ownedIds) {
  return ITEMS.filter(item => {
    if (ownedIds.includes(item.id)) return false;
    if (item.availableFrom === 'teen' && (stage === 'baby' || stage === 'child')) return false;
    if (item.unlock.type !== 'activity_count') return false;
    const count = activityCounts[item.unlock.activityId] || 0;
    return count >= item.unlock.count;
  });
}

function checkStatUnlocks(mainStats, ownedIds) {
  return ITEMS.filter(item => {
    if (ownedIds.includes(item.id)) return false;
    if (item.unlock.type !== 'stat_threshold') return false;
    return mainStats[item.unlock.stat] >= item.unlock.threshold;
  });
}

function applyPermanentBonus(item, stats) {
  for (const [key, val] of Object.entries(item.bonus)) {
    if (key.startsWith('estp_')) {
      const letter = key.replace('estp_', '');
      stats.estp[letter] = Math.min(100, (stats.estp[letter] || 0) + val);
    } else {
      stats.main[key] = Math.min(100, (stats.main[key] || 0) + val);
    }
  }
}
