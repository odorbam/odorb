const UI = (() => {

  let state = null;

  // ── 초기화 ──────────────────────────────────────

  function init() {
    buildTitleLogo();
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('stage-overlay').addEventListener('click', dismissStageOverlay);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#item-popup') && !e.target.closest('.item-cell') && !e.target.closest('.equip-slot')) {
        closePopup();
      }
    });
  }

  // ── 타이틀 로고 애니메이션 ──────────────────────

  function buildTitleLogo() {
    const wrap = document.getElementById('title-logo');
    const text = '우락밤 키우기';
    wrap.innerHTML = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      wrap.appendChild(span);
    });
    animateTitleLoop();
  }

  function animateTitleLoop() {
    const spans = document.querySelectorAll('#title-logo span');
    const miniCanvas = document.getElementById('title-mini-canvas');
    let i = 0;

    function bounceNext() {
      if (i >= spans.length) {
        i = 0;
        setTimeout(bounceNext, 1200);
        return;
      }
      spans[i].classList.remove('bounce');
      void spans[i].offsetWidth;
      spans[i].classList.add('bounce');
      showMiniDot(miniCanvas, i);
      i++;
      setTimeout(bounceNext, 120);
    }

    setTimeout(bounceNext, 600);
  }

  function showMiniDot(canvas, idx) {
    if (!window.SPRITE_BABY) return;
    const data = SPRITE_BABY;
    const rows = data.length, cols = data[0].length;
    const px = 2;
    canvas.width  = cols * px;
    canvas.height = rows * px;
    canvas.classList.add('visible');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const on   = dark ? '#d8d4c8' : '#2a2620';
  console.log('캔버스 크기:', canvas.width, canvas.height);
  console.log('데이터 행수:', data.length);
  console.log('픽셀 색상:', on);
  for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (data[r][c]) { ctx.fillStyle = on; ctx.fillRect(c*px, r*px, px, px); }
    setTimeout(() => canvas.classList.remove('visible'), 300);
  }

  // ── 게임 시작 ────────────────────────────────────

  function startGame() {
    state = newGame();
    showScreen('game');
    render();
  }

  function restart() {
    state = newGame();
    showScreen('game');
    switchTab('main');
    render();
  }

  // ── 화면 전환 ────────────────────────────────────

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
  }

  // ── 탭 전환 ──────────────────────────────────────

  function switchTab(tab) {
    document.getElementById('tab-main').style.display = tab === 'main' ? 'block' : 'none';
    document.getElementById('tab-item').style.display = tab === 'item' ? 'flex'  : 'none';
    document.getElementById('nav-main').classList.toggle('active', tab === 'main');
    document.getElementById('nav-item').classList.toggle('active', tab === 'item');
    if (tab === 'item') renderItemTab();
  }

  // ── 전체 렌더 ────────────────────────────────────

  function render() {
    if (!state) return;
    const stageData = STAGES[state.stage];
    const eff       = getEffectiveStats(state);

    // 상단 바
    document.getElementById('tag-stage').textContent  = stageData.name;
    document.getElementById('tag-money').innerHTML    = `용돈 <b>₩${state.money.toLocaleString()}</b>`;
    document.getElementById('tag-energy').innerHTML   = `에너지 <b>${state.energy}</b>`;

    // ESTP
    ['E','S','T','P'].forEach(l => {
      document.getElementById(`estp-${l}`).style.width = `${eff.estp[l]}%`;
    });

    // 캐릭터 도트
    drawCharacter();

    // 장착 배지
    const badge = document.getElementById('equipped-badge');
    if (state.equippedItem) {
      const item = ITEMS.find(i => i.id === state.equippedItem);
      badge.style.display = 'flex';
      badge.textContent   = item?.icon || '';
    } else {
      badge.style.display = 'none';
    }

    // 스탯 바
    const statKeys = ['장난스러움','귀여움','사랑스러움','멋짐','활발함'];
    statKeys.forEach(k => {
      document.getElementById(`bar-${k}`).style.width = `${eff.main[k]}%`;
    });

    // 턴 레이블
    document.getElementById('turn-label').textContent =
      `${stageData.name} — 턴 ${state.turn} / ${stageData.maxTurns}`;

    // 활동 버튼
    renderActivities();
  }

  // ── 캐릭터 도트 렌더 ─────────────────────────────

  function drawCharacter() {
  const stageId = STAGES[state.stage].id;
  const data = stageId === 'baby' ? window.SPRITE_BABY
             : stageId === 'child' ? window.SPRITE_CHILD
             : window.SPRITE_TEEN;

  if (!data) { console.log('스프라이트 없음:', stageId); return; }

  const canvas = document.getElementById('char-canvas');
  const rows = data.length, cols = data[0].length;
  const px = 5;
  canvas.width  = cols * px;
  canvas.height = rows * px;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const on   = dark ? '#d8d4c8' : '#2a2620';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (data[r][c]) { ctx.fillStyle = on; ctx.fillRect(c*px, r*px, px, px); }
}

  // ── 활동 버튼 렌더 ───────────────────────────────

  function renderActivities() {
    const stageId   = STAGES[state.stage].id;
    const acts      = ACTIVITIES[stageId] || [];
    const grid      = document.getElementById('act-grid');
    grid.innerHTML  = '';

    acts.forEach(act => {
      const btn = document.createElement('button');
      btn.className = 'act-btn';

      const canAfford  = !act.money || act.money >= 0 || state.money >= Math.abs(act.money);
      const hasEnergy  = act.restores || state.energy >= act.energy;
      if (!canAfford || !hasEnergy) btn.classList.add('disabled');

      if (act.restores) btn.classList.add('restores');
      btn.innerHTML = `<span class="act-icon">${act.icon}</span><span class="act-name">${act.name}</span>`;
      btn.addEventListener('click', () => onActivity(act.id));
      grid.appendChild(btn);
    });
  }

  // ── 활동 실행 ────────────────────────────────────

  function onActivity(actId) {
    const { state: next, result } = doActivity(state, actId);
    if (result?.error) { showToast(result.error); return; }

    state = next;
    render();

    // 결과 토스트
    let msg = result.flavor;
    if (result.nFired)       msg += '\n💭 N이 발동했다...';
    if (result.moneyDelta > 0) msg += `\n💰 +₩${result.moneyDelta.toLocaleString()}`;
    if (result.moneyDelta < 0) msg += `\n💸 -₩${Math.abs(result.moneyDelta).toLocaleString()}`;
    showToast(msg);

    // 아이템 해금 알림
    if (result.drops?.length || result.unlocks?.length) {
      const items = [...(result.drops||[]), ...(result.unlocks||[])];
      setTimeout(() => {
        items.forEach((item, i) => {
          setTimeout(() => showUnlockToast(item), i * 600);
        });
      }, 600);
    }

    // 단계 전환
    if (result.stageUp) {
      setTimeout(() => showStageOverlay(result.stageUp), 800);
    }

    // 엔딩
    if (result.ending) {
      setTimeout(() => showEnding(result.ending), 1200);
    }
  }

  // ── 아이템 탭 렌더 ───────────────────────────────

  function renderItemTab() {
    const stageId = STAGES[state.stage].id;

    // 장착 슬롯
    const slot = document.getElementById('equip-slot');
    if (state.equippedItem) {
      const item = ITEMS.find(i => i.id === state.equippedItem);
      slot.textContent = item?.icon || '';
      slot.classList.remove('empty');
    } else {
      slot.textContent = '비어있음';
      slot.classList.add('empty');
    }

    // 보유 아이템
    const ownedGrid = document.getElementById('owned-grid');
    ownedGrid.innerHTML = '';
    state.ownedItems.forEach(id => {
      const item = ITEMS.find(i => i.id === id);
      if (!item) return;
      const cell = makeItemCell(item, state.equippedItem === id);
      cell.addEventListener('click', () => openItemPopup(item));
      ownedGrid.appendChild(cell);
    });

    // 상점
    const shopGrid = document.getElementById('shop-grid');
    shopGrid.innerHTML = '';
    getShopItems(stageId, state.ownedItems).forEach(item => {
      const cell = makeItemCell(item, false);
      cell.addEventListener('click', () => openItemPopup(item, true));
      shopGrid.appendChild(cell);
    });
  }

  function makeItemCell(item, isEquipped) {
    const cell = document.createElement('div');
    cell.className = `item-cell ${item.type}${isEquipped ? ' equipped' : ''}`;
    cell.innerHTML = `${item.icon}<span class="item-type-dot"></span>`;
    return cell;
  }

  // ── 아이템 팝업 ──────────────────────────────────

  function openItemPopup(item, isShopping = false) {
    document.getElementById('popup-name').textContent  = item.icon + ' ' + item.name;
    document.getElementById('popup-desc').textContent  = item.desc;

    const bonusEntries = Object.entries(item.bonus);
    document.getElementById('popup-bonus').textContent =
      bonusEntries.length
        ? '효과: ' + bonusEntries.map(([k,v]) =>
            `${k.replace('estp_','')} +${v}`).join(' · ')
        : item.isKeyItem ? '라이즈 데뷔 필수 아이템' : '효과 없음';

    const btns = document.getElementById('popup-btns');
    btns.innerHTML = '';

    if (isShopping) {
      const buyBtn = document.createElement('div');
      buyBtn.className = 'popup-btn primary';
      buyBtn.textContent = `구입 ₩${item.unlock.price?.toLocaleString()}`;
      buyBtn.addEventListener('click', () => { onBuy(item.id); closePopup(); });
      btns.appendChild(buyBtn);
    } else if (item.type === 'equip') {
      const equipBtn = document.createElement('div');
      equipBtn.className = 'popup-btn primary';
      if (state.equippedItem === item.id) {
        equipBtn.textContent = '해제';
        equipBtn.addEventListener('click', () => { state = unequipItem(state); render(); closePopup(); });
      } else {
        equipBtn.textContent = '장착';
        equipBtn.addEventListener('click', () => { state = equipItem(state, item.id); render(); closePopup(); });
      }
      btns.appendChild(equipBtn);
    }

    const closeBtn = document.createElement('div');
    closeBtn.className = 'popup-btn';
    closeBtn.textContent = '닫기';
    closeBtn.addEventListener('click', closePopup);
    btns.appendChild(closeBtn);

    document.getElementById('item-popup').classList.add('show');
  }

  function openEquipPopup() {
    if (state.equippedItem) {
      const item = ITEMS.find(i => i.id === state.equippedItem);
      if (item) openItemPopup(item);
    }
  }

  function closePopup() {
    document.getElementById('item-popup').classList.remove('show');
  }

  // ── 아이템 구입 ──────────────────────────────────

  function onBuy(itemId) {
    const { state: next, error } = buyItem(state, itemId);
    if (error) { showToast(error); return; }
    state = next;
    render();
    renderItemTab();
    const item = ITEMS.find(i => i.id === itemId);
    showToast(`${item.icon} ${item.name} 구입 완료!`);
  }

  // ── 단계 전환 오버레이 ───────────────────────────

  function showStageOverlay(stageName) {
    const overlay = document.getElementById('stage-overlay');
    document.getElementById('stage-overlay-text').textContent = `${stageName} 시대 시작!`;
    overlay.classList.add('show');
  }

  function dismissStageOverlay() {
    document.getElementById('stage-overlay').classList.remove('show');
  }

  // ── 엔딩 화면 ────────────────────────────────────

  function showEnding(endingResult) {
    const { ending, estpText, statLabel, activityLine } = endingResult;

    document.getElementById('ending-title').textContent         = ending.name;
    document.getElementById('ending-desc').textContent          = ending.desc;
    document.getElementById('ending-estp-text').textContent     = estpText;
    document.getElementById('ending-stat-label').textContent    = statLabel;
    document.getElementById('ending-activity-label').textContent = activityLine;
    document.getElementById('save-title').textContent           = ending.name;
    document.getElementById('save-stat-line').textContent       = statLabel;
    document.getElementById('save-activity-line').textContent   = activityLine;

    // 엔딩 일러스트 (스프라이트 없으면 빈 캔버스)
    drawEndingSprite('ending-canvas', ending.sprite, 4);
    drawEndingSprite('save-canvas',   ending.sprite, 2);

    showScreen('ending');
  }

  function drawEndingSprite(canvasId, spriteId, px) {
    const canvas = document.getElementById(canvasId);
    const data   = window[spriteId?.toUpperCase()?.replace(/-/g,'_')];
    if (!data) { canvas.width = 1; canvas.height = 1; return; }
    const rows = data.length, cols = data[0].length;
    canvas.width  = cols * px;
    canvas.height = rows * px;
    const ctx  = canvas.getContext('2d');
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const on   = dark ? '#d8d4c8' : '#2a2620';
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (data[r][c]) { ctx.fillStyle = on; ctx.fillRect(c*px, r*px, px, px); }
  }

  // ── 이미지 저장 ──────────────────────────────────

  function saveEndingImage() {
    const wrap = document.querySelector('.save-preview');
    if (!wrap) return;

    // html2canvas 없이 직접 오프스크린 캔버스에 합성
    const W = 320, H = 400;
    const offscreen = document.createElement('canvas');
    offscreen.width  = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');

    // 배경
    ctx.fillStyle = '#faf8f4';
    ctx.fillRect(0, 0, W, H);

    // 일러스트 영역
    const spriteCanvas = document.getElementById('save-canvas');
    if (spriteCanvas.width > 1) {
      const imgX = (W - 200) / 2, imgY = 20;
      ctx.drawImage(spriteCanvas, imgX, imgY, 200, 200);
      // 오버레이 그라디언트
      const grad = ctx.createLinearGradient(0, imgY + 120, 0, imgY + 200);
      grad.addColorStop(0, 'rgba(30,24,18,0)');
      grad.addColorStop(1, 'rgba(30,24,18,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(imgX, imgY, 200, 200);
    }

    // 엔딩명
    ctx.fillStyle = '#2a2620';
    ctx.font      = '600 20px "Gowun Dodum", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(document.getElementById('ending-title').textContent, W/2, 248);

    // 설명문
    ctx.fillStyle = '#6b6660';
    ctx.font      = '400 12px "Noto Sans KR", sans-serif';
    ctx.fillText(document.getElementById('ending-stat-label').textContent, W/2, 272);
    ctx.fillText(document.getElementById('ending-activity-label').textContent, W/2, 290);

    // 워터마크
    ctx.fillStyle = '#c4bfb0';
    ctx.font      = '400 10px "Noto Sans KR", sans-serif';
    ctx.fillText('우락밤 키우기', W/2, H - 16);

    // 다운로드
    const a    = document.createElement('a');
    a.download = `우락밤_${document.getElementById('ending-title').textContent}.png`;
    a.href     = offscreen.toDataURL('image/png');
    a.click();
  }

  // ── 토스트 ───────────────────────────────────────

  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('result-toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  let unlockTimer = null;
  function showUnlockToast(item) {
    const toast = document.getElementById('unlock-toast');
    toast.textContent = `✨ ${item.icon} ${item.name} 획득!`;
    toast.classList.add('show');
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ── public API ───────────────────────────────────

  return {
    init,
    switchTab,
    openEquipPopup,
    saveEndingImage,
    restart,
  };

})();

document.addEventListener('DOMContentLoaded', UI.init);
