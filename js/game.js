const STAGES = [
  {
    id: 'baby',
    name: '아기',
    maxTurns: 15,
    energyMax: 100,
    energyStart: 100,
  },
  {
    id: 'child',
    name: '초등학생',
    maxTurns: 25,
    energyMax: 100,
    energyStart: 100,
  },
  {
    id: 'teen',
    name: '중고등학생',
    maxTurns: 35,
    energyMax: 100,
    energyStart: 100,
  },
];

const INITIAL_STATE = {
  stage: 0,
  turn: 0,
  energy: 100,
  money: 0,
  stats: {
    main: {
      장난스러움: 10,
      귀여움:    10,
      사랑스러움:  10,
      멋짐:     10,
      활발함:    10,
    },
    estp: { E: 0, S: 0, T: 0, P: 0 },
  },
  flags: {
  romanceCount:      0,
  nTriggered:        0,
  hairstyleEquipped: false,
  pcWins:            0,
  pcTotal:           0,
  burgersEaten:      [],
},
  activityCounts: {},
  equippedItem:   null,
  ownedItems:     [],
  log:            [],
  ended:          false,
};

// ── 유틸 ──────────────────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── 스탯 계산 ─────────────────────────────────────────────────────

function getEffectiveStats(state) {
  const eff = deepClone(state.stats);
  if (!state.equippedItem) return eff;

  const item = ITEMS.find(i => i.id === state.equippedItem);
  if (!item) return eff;

  for (const [key, val] of Object.entries(item.bonus)) {
    if (key.startsWith('estp_')) {
      const letter = key.replace('estp_', '');
      eff.estp[letter] = clamp(eff.estp[letter] + val);
    } else {
      eff.main[key] = clamp(eff.main[key] + val);
    }
  }
  return eff;
}

// ── 활동 실행 ─────────────────────────────────────────────────────

function doActivity(state, activityId) {
  if (state.ended) return { state, result: null };

  const stageData = STAGES[state.stage];
  const actList   = ACTIVITIES[stageData.id];
  const act       = actList.find(a => a.id === activityId);
  if (!act) return { state, result: null };

  const next = deepClone(state);
  const result = {
    actName:   act.name,
    flavor:    act.flavors[randInt(0, act.flavors.length - 1)],
    statGains: {},
    estpGains: {},
    moneyDelta: 0,
    energyDelta: 0,
    drops:     [],
    unlocks:   [],
    nFired:    false,
  };

  // 에너지 처리
  if (act.restores) {
    const gain = Math.abs(act.energy);
    next.energy = clamp(next.energy + gain, 0, stageData.energyMax);
    result.energyDelta = gain;
  } else {
    if (next.energy < act.energy) {
      return { state, result: { error: '에너지가 부족해요! 휴식이 필요해요.' } };
    }
    next.energy -= act.energy;
    result.energyDelta = -act.energy;
  }

  // 돈 처리
  if (act.money) {
    if (act.money < 0 && next.money < Math.abs(act.money)) {
      return { state, result: { error: '용돈이 부족해요!' } };
    }
    next.money += act.money;
    result.moneyDelta = act.money;
  }

  // 성공/실패 판정
  const failed = act.failChance > 0 && Math.random() < act.failChance;

  // 스탯 처리
  if (failed) {
    if (act.failStats) {
      for (const [stat, range] of Object.entries(act.failStats)) {
        const loss = randInt(Math.abs(range[0]), Math.abs(range[1]));
        next.stats.main[stat] = clamp(next.stats.main[stat] - loss);
        result.statGains[stat] = -loss;
      }
    }
    result.flavor = act.failFlavors
      ? act.failFlavors[randInt(0, act.failFlavors.length - 1)]
      : '실패했다...';
    result.failed = true;
  } else {
    if (act.stats) {
      for (const [stat, range] of Object.entries(act.stats)) {
        const gain = randInt(range[0], range[1]);
        next.stats.main[stat] = clamp(next.stats.main[stat] + gain);
        result.statGains[stat] = gain;
      }
    }
    if (act.estp) {
      for (const [letter, range] of Object.entries(act.estp)) {
        const gain = randInt(range[0], range[1]);
        next.stats.estp[letter] = clamp(next.stats.estp[letter] + gain);
        result.estpGains[letter] = gain;
      }
    }
  }

  // 로맨스 영화 특수처리
  if (act.id === 'romance') {
    next.flags.romanceCount += 1;
    if (act.nChance && Math.random() < act.nChance) {
      next.flags.nTriggered += 1;
      result.nFired = true;
    }
  }

  // PC방 승/패 처리
if (act.isPcroom) {
  const win = Math.random() < 0.5;
  next.flags.pcTotal += 1;
  if (win) {
    next.flags.pcWins += 1;
    next.stats.main.장난스러움 = clamp(next.stats.main.장난스러움 + randInt(5, 9));
    next.stats.main.멋짐 = clamp(next.stats.main.멋짐 + randInt(2, 4));
    result.flavor = ['캐리했다! MVP다.', '완벽한 플레이.', 'BLACKSHADOW한테 자랑해야지.'][randInt(0,2)];
  } else {
    next.stats.main.장난스러움 = clamp(next.stats.main.장난스러움 + randInt(1, 3));
    result.flavor = ['졌다... 다음엔 이긴다.', 'gg. 리턴즈.', '억울하다.'][randInt(0,2)];
  }
  result.pcResult = win ? '승' : '패';
}

// 햄버거 4종 추적
if (act.isBurger) {
  const shop = act.burgerShops[randInt(0, act.burgerShops.length - 1)];
  if (!next.flags.burgersEaten.includes(shop)) {
    next.flags.burgersEaten.push(shop);
  }
  result.burgerShop = shop;
  result.flavor = `${shop} 햄버거! ${act.flavors[randInt(0, act.flavors.length - 1)]}`;
}

  // 활동 횟수 기록
  next.activityCounts[activityId] = (next.activityCounts[activityId] || 0) + 1;

  // 랜덤 드롭 체크
  const drops = checkDrops(activityId, stageData.id, next.ownedItems);
  for (const item of drops) {
    next.ownedItems.push(item.id);
    if (item.type === 'permanent') applyPermanentBonus(item, next.stats);
    result.drops.push(item);
  }

  // 활동 횟수 해금 체크
  const actUnlocks = checkActivityUnlocks(next.activityCounts, stageData.id, next.ownedItems);
  for (const item of actUnlocks) {
    next.ownedItems.push(item.id);
    if (item.type === 'permanent') applyPermanentBonus(item, next.stats);
    result.unlocks.push(item);
  }

  // 스탯 해금 체크 (멋진 앞머리 등)
  const statUnlocks = checkStatUnlocks(next.stats.main, next.ownedItems);
  for (const item of statUnlocks) {
    next.ownedItems.push(item.id);
    result.unlocks.push(item);
  }

  // 턴 진행
  next.turn += 1;

  // 로그 추가
  next.log.unshift({
    turn:    next.turn,
    stage:   stageData.name,
    actName: act.name,
    flavor:  result.flavor,
  });
  if (next.log.length > 100) next.log.pop();

  // 단계 전환 or 엔딩 체크
  if (next.turn >= stageData.maxTurns) {
    if (next.stage < STAGES.length - 1) {
      next.stage += 1;
      next.turn   = 0;
      next.energy = STAGES[next.stage].energyStart;
      result.stageUp = STAGES[next.stage].name;
    } else {
      next.ended  = true;
      result.ending = resolveEnding(next);
    }
  }

  return { state: next, result };
}

// ── 아이템 장착 ───────────────────────────────────────────────────

function equipItem(state, itemId) {
  if (!state.ownedItems.includes(itemId)) return state;
  const item = ITEMS.find(i => i.id === itemId);
  if (!item || item.type !== 'equip') return state;

  const next = deepClone(state);
  next.equippedItem = itemId;

  if (item.isKeyItem) {
    next.flags.hairstyleEquipped = true;
  }

  return next;
}

function unequipItem(state) {
  const next = deepClone(state);
  next.equippedItem = null;
  return next;
}

// ── 아이템 구입 ───────────────────────────────────────────────────

function buyItem(state, itemId) {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item || item.unlock.type !== 'shop') return { state, error: null };
  if (state.ownedItems.includes(itemId)) return { state, error: '이미 보유한 아이템이에요.' };
  if (state.money < item.unlock.price) return { state, error: '용돈이 부족해요!' };

  const next = deepClone(state);
  next.money -= item.unlock.price;
  next.ownedItems.push(itemId);

  if (item.type === 'permanent') applyPermanentBonus(item, next.stats);

  return { state: next, error: null };
}

// ── 엔딩 판정 ─────────────────────────────────────────────────────

function resolveEnding(state) {
  const eff     = getEffectiveStats(state);
  const ending  = getEnding(eff, { ...state.flags, activityCounts: state.activityCounts });
  const tier    = getEStpTier(eff.estp);
  const topStat = getTopStat(eff.main);

  const totalTurns = STAGES.reduce((sum, s) => sum + s.maxTurns, 0);
  const topActivity = Object.entries(state.activityCounts)
    .sort((a, b) => b[1] - a[1])[0];
  const topActName = topActivity
    ? ACTIVITIES[STAGES.find(s =>
        ACTIVITIES[s.id]?.find(a => a.id === topActivity[0])
      )?.id]?.find(a => a.id === topActivity[0])?.name || topActivity[0]
    : '아무것도';
  const topActPct = topActivity
    ? Math.round((topActivity[1] / totalTurns) * 100)
    : 0;

  return {
    ending,
    tier,
    estpText:     ending.estp[tier],
    statLabel:    ENDING_STAT_LABELS[topStat],
    activityLine: `밤생의 약 ${topActPct}% 기간동안, ${topActName}을(를) 했다!`,
    finalStats:   eff,
  };
}

// ── 저장 / 불러오기 ───────────────────────────────────────────────

function saveGame(state) {
  try {
    localStorage.setItem('worakbam_save', JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem('worakbam_save');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function newGame() {
  return deepClone(INITIAL_STATE);
}

function getUnlockedEndings() {
  try {
    return JSON.parse(localStorage.getItem('worakbam_endings') || '[]');
  } catch { return []; }
}

function unlockEnding(endingId) {
  const list = getUnlockedEndings();
  if (!list.includes(endingId)) {
    list.push(endingId);
    localStorage.setItem('worakbam_endings', JSON.stringify(list));
  }
}
