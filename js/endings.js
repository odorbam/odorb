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
      return stats.main.활발함 >= 75 && stats.main.멋짐 >= 55 && soccerCount >= 25;
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
    condition: (stats, flags) => {
      const singCount = (flags.activityCounts?.sing || 0);
      return stats.main.멋짐 >= 75 && stats.main.장난스러움 >= 55 && singCount >= 8;
    },
    priority: 7,
    estp: {
      high: '고음을 뽑고 마이크를 던졌다. 생쥐도 놀랐다. 아니 왜 이래?',
      low:  '눈을 감고 고음을 끌어올렸다. 관객이 숨을 참았다...... 엄청난 울림!',
    },
  },

  {
    id: 'gamer',
    name: '밤이커',
    icon: '🎮',
    desc: '리그오브락전전드 프로게임단 R1의 미드라이너. 정글러 BLACKSHADOW와 영원의 듀오.',
    sprite: 'ending_gamer',
    condition: (stats, flags) => {
      const pcTotal = flags.pcTotal || 0;
      const winRate = pcTotal > 0 ? (flags.pcWins / pcTotal) : 0;
      return stats.main.장난스러움 >= 65 && pcTotal >= 10 && winRate >= 0.7;
    },
    priority: 8,
    estp: {
      high: '3연속 우승을 해냈다! 이 영광을 현실의 FAK**님에게 돌립니다.',
      low:  'RAKBAM's SHOCKWAVE!! WILL FIND THEM ALL!!',
    },
  },

  {
    id: 'gamer_casual',
    name: '밤이커',
    icon: '🎮',
    desc: '우락대학교 락밤학과의 밤이커. 미드라이너로 대활약중!',
    sprite: 'ending_gamer',
    condition: (stats, flags) => {
      const pcTotal = flags.pcTotal || 0;
      const winRate = pcTotal > 0 ? (flags.pcWins / pcTotal) : 0;
      return stats.main.장난스러움 >= 65 && pcTotal >= 10 && winRate < 0.7;
    },
    priority: 7,
    estp: {
      high: '야호! 실버로 승급했어!',
      low:  'Black Shadow와의 영혼의 1대1, 그 결과는...',
    },
  },

  {
    id: 'dragon',
    name: '공주',
    icon: '🦕',
    desc: '강아지를 주웠다! 그런데 어쩐지 공룡같기도...?',
    sprite: 'ending_dragon',
    condition: (stats, flags) => {
      const winterCount = flags.activityCounts?.winter || 0;
      return stats.main.사랑스러움 >= 75 && stats.main.귀여움 >= 60 && winterCount >= 10;
    },
    priority: 7,
    estp: {
      high: '육아 브이로그를 시작했다. 구독자가 100만을 넘었다.',
      low:  '어느날 공룡이 말을 하기 시작했다! 뭐? 수호천사라고?',
    },
  },

  {
    id: 'romance',
    name: '순정만화',
    icon: '📖',
    desc: '순정만화 속 서브남주에 빙의했다! 경쟁자인 남자주인공은... 엥? 토끼야 고양이야?',
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
      high: '슈퍼스타 남주를 응원하기로 했다. 평화를 사랑하는 우락밤.',
      low:  '남자주인공이... 도망갔다! 그의 마지막 대사는 [무, 무서워] ',
    },
  },

  {
    id: 'pretty',
    name: '예쁜나이스물여섯살',
    icon: '💅',
    desc: '엄청나게 예쁜 스물여섯살이 되었다',
    sprite: 'ending_pretty',
    condition: (stats) => {
      return stats.main.귀여움 >= 70 && stats.main.사랑스러움 >= 70 && stats.estp.E <= 30;
    },
    priority: 6,
    estp: {
      high: '예쁜데 입도 살아있다. 본인도 알고 있고 숨기지도 않는다.',
      low:  '예쁜데 부끄러움도 많다. 그게 더 매력이라고 다들 말한다.',
    },
  },

  {
    id: 'burger',
    name: '햄부기탐험가',
    icon: '🍔',
    desc: '전세계를 돌아다니며 다양한 햄버거를 탐구하는 유일무이 햄문가로 성장했다.',
    sprite: 'ending_burger',
    condition: (stats, flags) => {
      const burgerCount = flags.activityCounts?.burger || 0;
      const allShops = ['숑도날드','우락킹','락데리아','밤스터치'];
      const triedAll = allShops.every(s => (flags.burgersEaten || []).includes(s));
      return stats.main.장난스러움 >= 65 && stats.main.활발함 >= 65 && burgerCount >= 8 && triedAll;
    },
    priority: 6,
    estp: {
      high: '버거 먹방 유튜브 1위. 엄청난 인기를 자랑하는 햄박사.',
      low:  '햄론가로 활동하며 명성을 떨치고 있다. 목표는 햄부기 지도앱 출시.',
    },
  },

  {
    id: 'trainer',
    name: '헬스 트레이너',
    icon: '💪',
    desc: '어쩐지 슬림하기만한 트레이너... 일본에서 온 회원님이 더 우락부락하다는 소문이 있다',
    sprite: 'ending_trainer',
    condition: (stats, flags) => {
      const soccerCount = (flags.activityCounts?.soccer || 0) + (flags.activityCounts?.soccer_teen || 0);
      return stats.main.활발함 >= 65 && stats.main.사랑스러움 >= 60 && soccerCount >= 8 && soccerCount <= 18;
    },
    priority: 6,
    estp: {
      high: '회원님과 함께 보디빌딩 대회에 나가보기로 했다! 팀 이름은... N.....',
      low:  '회원님 몰래 햄부기를 먹다가 걸렸다.',
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
      high: '18.6cm지만 어딜 가든 제일 시끄럽다. 작은 게 무기다.',
      low:  '엄청나게 거대해지는 꿈을 꿨다. 앗, 지금이 꿈인가...?',
    },
  },

];
