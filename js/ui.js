const UI = (() => {

  let state = null;

  // ── 초기화 ──────────────────────────────────────

  function init() {
    buildTitleLogo();
    const startBtn = document.getElementById('btn-start');
    if (startBtn) startBtn.addEventListener('click', startGame);
    
    const overlay = document.getElementById('stage-overlay');
    if (overlay) overlay.addEventListener('click', dismissStageOverlay);

    document.addEventListener('click', (e) => {
      const popup = document.getElementById('item-popup');
      if (popup && !e.target.closest('#item-popup') && !e.target.closest('.item-cell') && !e.target.closest('.equip-slot')) {
        closePopup();
      }
    });
  }

  // ── 타이틀 로고 애니메이션 ──────────────────────

  function buildTitleLogo() {
    const wrap = document.getElementById('title-logo');
    if (!wrap) return;
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
    if (!spans.length) return;
    let i = 0;

    function bounceNext() {
      if (i >= spans.length) {
        i = 0;
        setTimeout(bounceNext, 1200);
        return;
      }
      if (spans[i]) {
        spans[i].classList.remove('bounce');
        void spans[i].offsetWidth;
        spans[i].classList.add('bounce');
      }
      if (miniCanvas) showMiniDot(miniCanvas, i);
      i++;
      setTimeout(bounceNext, 120);
    }

    setTimeout(bounceNext, 600);
  }

  function showMiniDot(canvas, idx) {
    if (!window.SPRITE_BABY || !canvas) return;
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
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (data[r] && data[r][c]) { ctx.fillStyle = on; ctx.fillRect(c*px, r*px, px, px); }
    setTimeout(() => canvas.classList.remove('visible'), 300);
  }

  // ── 게임 시작 ────────────────────────────────────

  function startGame() {
    if (typeof newGame !== 'function') return;
    state = newGame();
    showScreen('game');
    render();
  }

  function restart() {
    if (typeof newGame !== 'function') return;
    state = newGame();
    showScreen('game');
    switchTab('main');
    render();
  }

  // ── 화면 전환 ────────────────────────────────────

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${id}`);
    if (target) target.classList.add('active');
  }

  // ── 탭 전환 ──────────────────────────────────────

  function switchTab(tab) {
    const tabs = { 'main': 'tab-main', 'item': 'tab-item', 'dex': 'tab-dex' };
    const navs = { 'main': 'nav-main', 'item': 'nav-item', 'dex': 'nav-dex' };

    Object.entries(tabs).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el) el.style.display = (tab === k) ? (k === 'item' ? 'flex' : 'block') : 'none';
    });

    Object.entries(navs).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', tab === k);
    });

    if (tab === 'item') renderItemTab();
    if (tab === 'dex')  renderDexTab();
  }

  // ── 전체 렌더 ────────────────────────────────────

  function render() {
    if (!state) return;
    const stageData = STAGES[state.stage];
    const eff       = getEffectiveStats(state);

    const setInfo = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setInfo('tag-stage', stageData.name);
    setInfo('tag-money', `용돈 <b>₩${state.money.toLocaleString()}</b>`);
    setInfo('tag-energy', `에너지 <b>${state.energy}</b>`);

    ['E','S','T','P'].forEach(l => {
      const bar = document.getElementById(`estp-${l}`);
      if (bar) bar.style.width = `${eff.estp[l]}%`;
    });

    drawCharacter();

    const badge = document.getElementById('equipped-badge');
    if (badge) {
      if (state.equippedItem) {
        const item = ITEMS.find(i => i.id === state.equippedItem);
        badge.style.display = 'flex';
        badge.textContent   = item?.icon || '';
      } else {
        badge.style.display = 'none';
      }
    }

    const statKeys = ['장난스러움','귀여움','사랑스러움','멋짐','활발함'];
    statKeys.forEach(k => {
      const bar = document.getElementById(`bar-${k}`);
      if (bar) bar.style.width = `${eff.main[k]}%`;
    });

    const turnLabel = document.getElementById('turn-label');
    if (turnLabel) turnLabel.textContent = `${stageData.name} — 턴 ${state.turn} / ${stageData.maxTurns}`;

    renderActivities();
  }

  // ── 캐릭터 도트 렌더 ─────────────────────────────

  function drawCharacter() {
    const stageId = STAGES[state.stage].id;
    const data = stageId === 'baby' ? window.SPRITE_BABY
               : stageId === 'child' ? window.SPRITE_CHILD
               : window.SPRITE_TEEN;

    if (!data) return;

    const canvas = document.getElementById('char-canvas');
    if (!canvas) return;
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
        if (data[r] && data[r][c]) { ctx.fillStyle = on; ctx.fillRect(c*px, r*px, px, px); }
  }

  // ── 활동 버튼 렌더 ───────────────────────────────

  function renderActivities() {
    const stageId   = STAGES[state.stage].id;
    const acts      = ACTIVITIES[stageId] || [];
    const grid      = document.getElementById('act-grid');
    if (!grid) return;
    grid.innerHTML  = '';

    acts.forEach(act => {
      const btn = document.createElement('button');
      btn.className = 'act-btn';
      const canAfford = !act.money || act.money >= 0 || state.money >= Math.abs(act.money);
      const hasEnergy = act.restores || state.energy >= act.energy;
      if (!canAfford || !hasEnergy) btn.classList.add('disabled');
      if (act.restores) btn.classList.add('restores');
      btn.innerHTML = `<span class="act-icon">${act.icon}</span><span class="act-name">${act.name}</span>`;
      btn.addEventListener('click', () => onActivity(act.id));
      grid.appendChild(btn);
    });
  }

  // ── 활동 실행 (오류 방어 강화) ──────────────────────────────────

  function onActivity(actId) {
    const actData = doActivity(state, actId);
    
    // 1. actData 자체가 없거나 에러가 있는 경우 방어
    if (!actData) return;
    if (actData.result && actData.result.error) {
      showToast(actData.result.error);
      return;
    }

    const { state: next, result } = actData;
    state = next;
    render();

    // 2. result가 null인 경우 flavor 에러 방어 (Optional Chaining)
    let msg = result?.flavor || "활동 완료!";
    if (result?.nFired)       msg += '\n💭 N이 발동했다...';
    if (result?.moneyDelta > 0) msg += `\n💰 +₩${result.moneyDelta.toLocaleString()}`;
    if (result?.moneyDelta < 0) msg += `\n💸 -₩${Math.abs(result.moneyDelta).toLocaleString()}`;
    showToast(msg);

    // 3. 아이템 획득 알림 안전 처리
    const items = [...(result?.drops || []), ...(result?.unlocks || [])];
    if (items.length > 0) {
      setTimeout(() => {
        items.forEach((item, i) => {
          setTimeout(() => showUnlockToast(item), i * 600);
        });
      }, 600);
    }

    if (result?.stageUp) setTimeout(() => showStageOverlay(result.stageUp), 800);
    if (result?.ending) setTimeout(() => showEnding(result.ending), 1200);
  }

  // ── 아이템 탭 렌더 ───────────────────────────────

  function renderItemTab() {
    const stageId = STAGES[state.stage].id;
    const slot = document.getElementById('equip-slot');
    if (slot) {
      if (state.equippedItem) {
        const item = ITEMS.find(i => i.id === state.equippedItem);
        slot.textContent = item?.icon || '';
        slot.classList.remove('empty');
      } else {
        slot.textContent = '비어있음';
        slot.classList.add('empty');
      }
    }

    const ownedGrid = document.getElementById('owned-grid');
    if (ownedGrid) {
      ownedGrid.innerHTML = '';
      state.ownedItems.forEach(id => {
        const item = ITEMS.find(i => i.id === id);
        if (!item) return;
        const cell = makeItemCell(item, state.equippedItem === id);
        cell.addEventListener('click', () => openItemPopup(item));
        ownedGrid.appendChild(cell);
      });
    }

    const shopGrid = document.getElementById('shop-grid');
    if (shopGrid) {
      shopGrid.innerHTML = '';
      getShopItems(stageId, state.ownedItems).forEach(item => {
        const cell = makeItemCell(item, false);
        cell.addEventListener('click', () => openItemPopup(item, true));
        shopGrid.appendChild(cell);
      });
    }
  }

  function makeItemCell(item, isEquipped) {
    const cell = document.createElement('div');
    cell.className = `item-cell ${item.type}${isEquipped ? ' equipped' : ''}`;
    cell.innerHTML = `${item.icon}<span class="item-type-dot"></span>`;
    return cell;
  }

  function renderDexTab() {
    const grid = document.getElementById('dex-grid');
    if (!grid) return;
    const unlocked = getUnlockedEndings();
    const total = ENDINGS.filter(e => e.id !== 'gamer_casual').length;
    const unlockedCount = unlocked.length;

    grid.innerHTML = `<div class="dex-count">${unlockedCount} / ${total} 달성</div>`;

    const shown = [];
    ENDINGS.forEach(e => {
      if (shown.includes(e.id)) return;
      shown.push(e.id);
      const isUnlocked = unlocked.includes(e.id);
      const card = document.createElement('div');
      card.className = `dex-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="dex-icon">${e.icon}</div>
        <div class="dex-info">
          <div class="dex-name ${isUnlocked ? '' : 'locked'}">${isUnlocked ? e.name : '???'}</div>
          ${isUnlocked ? `<div class="dex-desc">${e.desc}</div>` : ''}
          <div class="dex-hint">${e.hint || ''}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  
  // ── 아이템 팝업 ──────────────────────────────────

  function openItemPopup(item, isShopping = false) {
    const elements = {
      'popup-name': item.icon + ' ' + item.name,
      'popup-desc': item.desc
    };

    Object.entries(elements).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });

    const pBonus = document.getElementById('popup-bonus');
    if (pBonus) {
      const bonusEntries = Object.entries(item.bonus || {});
      pBonus.textContent = bonusEntries.length
        ? '효과: ' + bonusEntries.map(([k,v]) => `${k.replace('estp_','')} +${v}`).join(' · ')
        : item.isKeyItem ? '라이즈 데뷔 필수 아이템' : '효과 없음';
    }

    const pBtns = document.getElementById('popup-btns');
    if (pBtns) {
      pBtns.innerHTML = '';
      if (isShopping) {
        const buyBtn = document.createElement('div');
        buyBtn.className = 'popup-btn primary';
        buyBtn.textContent = `구입 ₩${item.unlock?.price?.toLocaleString() || 0}`;
        buyBtn.addEventListener('click', () => { onBuy(item.id); closePopup(); });
        pBtns.appendChild(buyBtn);
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
        pBtns.appendChild(equipBtn);
      }
      const closeBtn = document.createElement('div');
      closeBtn.className = 'popup-btn';
      closeBtn.textContent = '닫기';
      closeBtn.addEventListener('click', closePopup);
      pBtns.appendChild(closeBtn);
    }

    const popup = document.getElementById('item-popup');
    if (popup) popup.classList.add('show');
  }

  function openEquipPopup() {
    if (state && state.equippedItem) {
      const item = ITEMS.find(i => i.id === state.equippedItem);
      if (item) openItemPopup(item);
    }
  }

  function closePopup() {
    const popup = document.getElementById('item-popup');
    if (popup) popup.classList.remove('show');
  }

  // ── 아이템 구입 ──────────────────────────────────

  function onBuy(itemId) {
    const buyResult = buyItem(state, itemId);
    if (!buyResult || buyResult.error) { 
      if (buyResult?.error) showToast(buyResult.error); 
      return; 
    }
    state = buyResult.state;
    render();
    renderItemTab();
    const item = ITEMS.find(i => i.id === itemId);
    if (item) showToast(`${item.icon} ${item.name} 구입 완료!`);
  }

  // ── 단계 전환 오버레이 ───────────────────────────

  function showStageOverlay(stageName) {
    const overlay = document.getElementById('stage-overlay');
    const txt = document.getElementById('stage-overlay-text');
    if (txt) txt.textContent = `${stageName} 시대 시작!`;
    if (overlay) overlay.classList.add('show');
  }

  function dismissStageOverlay() {
    const overlay = document.getElementById('stage-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  // ── 엔딩 화면 (안전장치 강화) ───────────────────────────────────

  function showEnding(endingResult) {
    if (!endingResult || !endingResult.ending) return;
    const { ending, estpText, statLabel, activityLine } = endingResult;

    const elds = {
      'ending-title': ending.name,
      'ending-desc': ending.desc,
      'ending-estp-text': estpText,
      'ending-stat-label': statLabel,
      'ending-activity-label': activityLine,
      'save-title': ending.name,
      'save-stat-line': statLabel,
      'save-activity-line': activityLine
    };

    // 요소가 있을 때만 텍스트 설정 (setting properties of null 방어)
    Object.entries(elds).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || "";
    });

    drawEndingSprite('ending-canvas', ending.sprite, 4);
    drawEndingSprite('save-canvas',   ending.sprite, 2);

    if (typeof unlockEnding === 'function') unlockEnding(ending.id);
    showScreen('ending');
  }

  function drawEndingSprite(canvasId, spriteId, px) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
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
        if (data[r] && data[r][c]) { ctx.fillStyle = on; ctx.fillRect(c*px, r*px, px, px); }
  }

  // ── 이미지 저장 ──────────────────────────────────

  function saveEndingImage() {
    const W = 320, H = 400;
    const offscreen = document.createElement('canvas');
    offscreen.width  = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');

    ctx.fillStyle = '#faf8f4';
    ctx.fillRect(0, 0, W, H);

    const spriteCanvas = document.getElementById('save-canvas');
    if (spriteCanvas && spriteCanvas.width > 1) {
      const imgX = (W - 200) / 2, imgY = 20;
      ctx.drawImage(spriteCanvas, imgX, imgY, 200, 200);
    }

    ctx.fillStyle = '#2a2620';
    ctx.font      = '600 20px sans-serif';
    ctx.textAlign = 'center';
    const titleEl = document.getElementById('ending-title');
    ctx.fillText(titleEl ? titleEl.textContent : "엔딩", W/2, 248);

    const a    = document.createElement('a');
    a.download = `우락밤_엔딩.png`;
    a.href     = offscreen.toDataURL('image/png');
    a.click();
  }

  // ── 토스트 ───────────────────────────────────────

  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('result-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  let unlockTimer = null;
  function showUnlockToast(item) {
    const toast = document.getElementById('unlock-toast');
    if (!toast) return;
    toast.textContent = `✨ ${item.icon} ${item.name} 획득!`;
    toast.classList.add('show');
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  return {
    init,
    switchTab,
    openEquipPopup,
    saveEndingImage,
    restart,
  };

})();

document.addEventListener('DOMContentLoaded', UI.init);
