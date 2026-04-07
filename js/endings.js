const ENDINGS = [

  {
    id: 'riize',
    name: '라이즈 데뷔',
    icon: '🎊',
    desc: '드디어 데뷔했다. 우락밤의 이름이 전세계에 울려퍼진다.',
    sprite: 'ending_riize',
    condition: (stats, flags) => {
      const vals = Object.values(stats.main);
      const min = Math.min(...vals);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return min >= 60 && avg >= 75 && flags.hairstyleEquipped;
    },
    priority: 10,
    estp: {
      high: '무대 위에서 눈이 마주친 팬에게 윙크를 날렸다. 그 팬은 그날을 평생 기억할 것이다.',
      low:  '무대 뒤에서 혼자 조용히 숨을 고른 뒤, 조명 아래로 걸어나갔다. 완벽했다.',
    },
  },

  {
    id: 'soccer',
    name: '우드 벨락밤',
    icon: '⚽',
    desc: '축구선수로 자라나 리얼 밤드리드에 입단',
    sprite: 'ending_soccer',
    condition: (stats, flags) => {
  const soccerCount = (flags.activityCounts?.soccer || 0) + (flags.activityCounts?.soccer_teen || 0);
  return stats.main.활발함 >= 75 && stats.main.멋짐 >= 55 && soccerCount >= 5;
},
    priority: 7,
    estp: {
      high: '골을 넣고 관중석을 향해 달려갔다. 세레모니는 즉흥이었다. 완벽했다.',
      low:  '골 넣고 조용히 제자리로 돌아왔다. 팀원들이 달려와 안아줬다.',
    },
  },

  {
    id: 'singer',
    name: '브락트니 숑피어스',
    icon: '🎤',
    desc: '키만한 고음을 뽑아내고 있다. 뿔 뒤에 생쥐가 살고있다는 소문이..',
    sprite: 'ending_singer',
    condition: (stats) => {
      return stats.main.멋짐 >= 75 && stats.main.장난스러움 >= 55;
    },
    priority: 7,
    estp: {
      high: '고음을 뽑고 마이크를 던졌다. 생쥐도 놀랐다.',
      low:  '눈을 감고 고음을 끌어올렸다. 관객이 숨을 참았다.',
    },
  },

  {
    id: 'gamer',
    name: '밤이커',
    icon: '🎮',
    desc: '리그오브락전전드 프로게임단 R1의 미드라이너로 엄청난 성공. 같은 팀 정글러 BLACKSHADOW와 절친',
    sprite: 'ending_gamer',
    condition: (stats) => {
      return stats.main.장난스러움 >= 75 && stats.main.멋짐 >= 50;
    },
    priority: 7,
    estp: {
      high: 'GG 치고 바로 디스코드 켰다. BLACKSHADOW가 기다리고 있었다.',
      low:  '혼자 리플레이를 돌려봤다. 실수한 게 두 개 있었다. 내일은 없을 것이다.',
    },
  },

  {
    id: 'dragon',
    name: '공주',
    icon: '🦕',
    desc: '공(룡)주(인)가 된 우락밤... 날개달린 공룡을 육아하고 있다',
    sprite: 'ending_dragon',
    condition: (stats) => {
      return stats.main.사랑스러움 >= 75 && stats.main.귀여움 >= 60;
    },
    priority: 7,
    estp: {
      high: '공룡 육아 브이로그를 시작했다. 구독자가 100만을 넘었다.',
      low:  '공룡이랑 단둘이 조용한 성에서 살고 있다. 행복하다.',
    },
  },

  {
    id: 'romance',
    name: '순정만화',
    icon: '📖',
    desc: '눈을 떴더니 순정만화 속 서브남주!? 주인공 토냥덕을 만났는데, 어쩐지 토냥덕을 응원하고싶다...',
    sprite: 'ending_romance',
    condition: (stats, flags) => {
      return (
        flags.romanceCount >= 3 &&
        flags.nTriggered >= 1 &&
        stats.estp.S <= 35
      );
    },
    priority: 9,
    estp: {
      high: '서브남주인데 존재감이 주인공급이다. 토냥덕도 흔들리는 눈치다.',
      low:  '묵묵히 뒤에서 토냥덕만 응원한다. 독자들이 얘 주인공 해달라고 난리다.',
    },
  },

  {
    id: 'pretty',
    name: '예쁜나이스물여섯살',
    icon: '💅',
    desc: '엄청나게 예쁜 스물여섯살이 되었다',
    sprite: 'ending_pretty',
    condition: (stats) => {
      const { 귀여움, 사랑스러움, 멋짐 } = stats.main;
      return 귀여움 >= 65 && 사랑스러움 >= 65 && 멋짐 >= 65;
    },
    priority: 6,
    estp: {
      high: '예쁜데 입도 살아있다. 본인도 알고 있고 숨기지도 않는다.',
      low:  '엄청 예쁜데 본인은 그냥 평범한 줄 안다. 주변이 더 난리다.',
    },
  },

  {
    id: 'burger',
    name: '햄부기탐험가',
    icon: '🍔',
    desc: '전세계를 돌아다니며 다양한 햄버거를 탐구하는 유일무이 전문가로 성장',
    sprite: 'ending_burger',
    condition: (stats) => {
      return stats.main.장난스러움 >= 65 && stats.main.활발함 >= 65;
    },
    priority: 6,
    estp: {
      high: '버거 먹방 유튜브 1위. 편집도 혼자 한다.',
      low:  '혼자 조용히 전세계 버거집 지도를 완성하고 있다. 아무도 모른다.',
    },
  },

  {
    id: 'trainer',
    name: '헬스 트레이너',
    icon: '💪',
    desc: '어쩐지 슬림하기만한 트레이너... 분홍색의 회원이 더 튼튼하다는 소문이 있다',
    sprite: 'ending_trainer',
    condition: (stats) => {
      return stats.main.활발함 >= 65 && stats.main.사랑스러움 >= 60;
    },
    priority: 6,
    estp: {
      high: '회원들한테 인기가 너무 많아서 트레이닝이 잘 안 된다.',
      low:  '말수는 적지만 루틴은 완벽하다. 회원들이 알아서 따라한다.',
    },
  },

  {
    id: 'mini',
    name: '미니밤',
    icon: '🌰',
    desc: '아차, 18.6cm의 엄청나게 작은 미니밤으로 자라났다...!',
    sprite: 'ending_mini',
    condition: (stats) => {
      const vals = Object.values(stats.main);
      const max = Math.max(...vals);
      return stats.main.귀여움 === max && stats.main.귀여움 >= 60;
    },
    priority: 5,
    estp: {
      high: '18.6cm지만 E가 넘쳐서 어딜 가든 제일 시끄럽다. 작은 게 무기다.',
      low:  '18.6cm... 아차. 조용히 구석에서 자기만의 세계를 즐기는 중.',
    },
  },

];

const ENDING_STAT_LABELS = {
  장난스러움: '세상에서 제일 장난스럽다',
  귀여움:    '엄청나게 귀엽다',
  사랑스러움:  '숨막히게 사랑스럽다',
  멋짐:     '말도안되게 멋있다',
  활발함:    '지구상에서 제일 활발하다',
};

function getEnding(stats, flags) {
  const sorted = [...ENDINGS].sort((a, b) => b.priority - a.priority);
  return sorted.find(e => e.condition(stats, flags)) || ENDINGS[ENDINGS.length - 1];
}

function getEStpTier(estp) {
  const total = (estp.E || 0) + (estp.S || 0) + (estp.T || 0) + (estp.P || 0);
  return total >= 200 ? 'high' : 'low';
}

function getTopStat(mainStats) {
  return Object.entries(mainStats).sort((a, b) => b[1] - a[1])[0][0];
}
