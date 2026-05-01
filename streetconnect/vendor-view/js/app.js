
  let currentView = 'view-welcome';
  let isLive = false;
  let isHappy = false;
  let currentStatus = 'available';
  let selectedCat = '';
  let currentLang = 0;
  const langs = ['EN', 'తె', 'हि'];
  
  const translations = {
    0: { live: 'Go Live', hint: 'Tap to start broadcasting your stall to nearby customers', available: '✅ Available', busy: '🟠 Busy', closing: '⏰ Closing Soon', happy: '🔥 Start Happy Hour', happyOff: '🛑 End Happy Hour', insights: "Today's Insights" },
    1: { live: 'లైవ్ అవ్వు', hint: 'మీ స్టాల్‌ను దగ్గర ఉన్న కస్టమర్లకు బ్రాడ్‌కాస్ట్ చేయడానికి నొక్కండి', available: '✅ అందుబాటులో', busy: '🟠 బిజీ', closing: '⏰ మూసుకుంటున్నాం', happy: '🔥 హ్యాపీ అవర్ ప్రారంభించు', happyOff: '🛑 హ్యాపీ అవర్ ఆపు', insights: 'ఈరోజు విశ్లేషణలు' },
    2: { live: 'लाइव जाएं', hint: 'अपनी दुकान को पास के ग्राहकों तक पहुँचाने के लिए टैप करें', available: '✅ उपलब्ध', busy: '🟠 व्यस्त', closing: '⏰ जल्द बंद', happy: '🔥 हैप्पी ऑवर शुरू करें', happyOff: '🛑 हैप्पी ऑवर बंद', insights: 'आज की जानकारी' }
  };

  function goTo(viewId, direction) {
    if (viewId === currentView) return;

    const cur = document.getElementById(currentView);
    const nxt = document.getElementById(viewId);

    // Default direction: forward (right→left feel = slide in from right)
    const dir = direction || 'right';
    const inClass  = dir === 'right' ? 'slide-in-right' : 'slide-in-left';

    // Hide current view
    cur.classList.add('hidden-right'); // class name doesn't matter — display:none kicks in
    cur.classList.remove('slide-in-right', 'slide-in-left');

    // Show next view
    nxt.classList.remove('hidden-right', 'hidden-left');
    // Force reflow so the animation fires fresh
    void nxt.offsetWidth;
    nxt.classList.add(inClass);

    currentView = viewId;

    // --- Per-view side-effects ---
    if (viewId === 'view-otp') {
      const ph = document.getElementById('phone-input').value || '9999999999';
      document.getElementById('shown-phone').textContent = ph;
    }

    const isDashContext = viewId === 'view-dashboard' || viewId === 'view-insights';
    document.getElementById('lang-fab').style.display = isDashContext ? 'block' : 'none';

    if (viewId === 'view-dashboard') {
      const name = document.getElementById('stall-name').value || 'Ravi Fruits';
      const cat  = selectedCat || 'Fruits & Veg';
      const emo  = {
        'Fruits & Veg': '🍎','Street Food': '🍜','Beverages': '🧃',
        'Snacks': '🍿','Flowers': '💐','Other': '🛍️'
      }[cat] || '🛒';
      document.getElementById('d-name').textContent   = emo + ' ' + name;
      document.getElementById('d-sub').textContent    = cat + ' · Kphb Colony';
      document.getElementById('d-avatar').textContent = name.charAt(0).toUpperCase();
    }

    if (viewId === 'view-insights') {
      // Mirror vendor info & live state into the Insights header
      document.getElementById('ins-name').textContent   = document.getElementById('d-name').textContent;
      document.getElementById('ins-sub').textContent    = document.getElementById('d-sub').textContent;
      document.getElementById('ins-avatar').textContent = document.getElementById('d-avatar').textContent;
      const srcBadge = document.getElementById('live-badge');
      const insBadge = document.getElementById('ins-live-badge');
      insBadge.className = srcBadge.className;
      document.getElementById('ins-live-badge-text').textContent =
        document.getElementById('live-badge-text').textContent;
    }
  }

  function checkPhone() {
    const v = document.getElementById('phone-input').value;
    const btn = document.getElementById('phone-next-btn');
    if(v.length === 10) { btn.style.opacity='1'; btn.style.pointerEvents='all'; }
    else { btn.style.opacity='0.5'; btn.style.pointerEvents='none'; }
  }

  function otpInput(el, idx) {
    el.classList.toggle('filled', el.value.length > 0);
    if(el.value.length === 1 && idx < 4) {
      document.getElementById('otp' + (idx+1)).focus();
    }
    const vals = [1,2,3,4].map(i => document.getElementById('otp'+i).value);
    const btn = document.getElementById('otp-verify-btn');
    if(vals.every(v => v.length === 1)) { btn.style.opacity='1'; btn.style.pointerEvents='all'; }
  }

  function verifyOTP() {
    const code = [1,2,3,4].map(i => document.getElementById('otp'+i).value).join('');
    if(code === '1234') { goTo('view-details'); }
    else { showToast('Invalid OTP. Use 1234 for demo.'); }
  }

  function selectCat(el, cat) {
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedCat = cat;
  }

  function enableLocation() {
    showToast('📍 Location enabled!');
    setTimeout(() => goTo('view-dashboard'), 800);
  }

  let mapPingInterval;
  function toggleLive() {
    isLive = !isLive;
    const toggle = document.getElementById('live-toggle');
    const thumb = document.getElementById('live-thumb');
    const badge = document.getElementById('live-badge');
    const badgeText = document.getElementById('live-badge-text');
    const titleText = document.getElementById('live-title-text');
    const hint = document.getElementById('live-hint');
    const t = translations[currentLang];

    toggle.classList.toggle('on', isLive);
    thumb.textContent = isLive ? '🟢' : '⚡';
    badge.classList.toggle('live', isLive);
    badgeText.textContent = isLive ? 'LIVE' : 'Offline';
    titleText.textContent = isLive ? '🟢 You are Live!' : t.live;
    hint.textContent = isLive ? 'Customers can now find and track your stall' : t.hint;
    
    // Map animation
    const outerPing = document.getElementById('map-ping-outer');
    const midPing = document.getElementById('map-ping-mid');
    const dot = document.getElementById('map-vendor-dot');
    const white = document.getElementById('map-vendor-white');
    const label = document.getElementById('map-label');
    const labelBg = document.getElementById('map-label-bg');
    const c1 = document.getElementById('cust1');
    const c2 = document.getElementById('cust2');
    const c3 = document.getElementById('cust3');
    
    if(isLive) {
      dot.setAttribute('r', '12');
      white.setAttribute('r', '5');
      label.textContent = document.getElementById('stall-name').value || 'Ravi Fruits';
      label.setAttribute('opacity', '1');
      labelBg.setAttribute('x', '85'); labelBg.setAttribute('y', '68');
      labelBg.setAttribute('width', '70'); labelBg.setAttribute('height', '18');
      c1.setAttribute('opacity', '0.6'); c2.setAttribute('opacity', '0.6'); c3.setAttribute('opacity', '0.6');
      clearInterval(mapPingInterval);
      mapPingInterval = setInterval(() => {
        outerPing.setAttribute('r', '28');
        outerPing.style.opacity = '0';
        midPing.setAttribute('r', '20');
        setTimeout(() => {
          outerPing.setAttribute('r', '0'); outerPing.style.opacity = '0.15';
          midPing.setAttribute('r', '0');
        }, 1200);
      }, 1800);
      showToast('🟢 You are now LIVE!');
    } else {
      dot.setAttribute('r', '0');
      white.setAttribute('r', '0');
      outerPing.setAttribute('r', '0');
      midPing.setAttribute('r', '0');
      label.setAttribute('opacity', '0');
      labelBg.setAttribute('width', '0');
      c1.setAttribute('opacity', '0'); c2.setAttribute('opacity', '0'); c3.setAttribute('opacity', '0');
      clearInterval(mapPingInterval);
      showToast('⚫ You are now Offline');
    }
  }

  function tapMap() {
    if(!isLive) { showToast('Go Live first to update your spot!'); return; }
    const overlay = document.getElementById('spot-overlay');
    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 1500);
  }

  function updateSpot() {
    if(!isLive) { showToast('Go Live first to update your spot!'); return; }
    showToast('📍 Location updated on map!');
  }

  function setStatus(s) {
    currentStatus = s;
    document.getElementById('chip-available').className = 'status-chip';
    document.getElementById('chip-busy').className = 'status-chip';
    document.getElementById('chip-closing').className = 'status-chip';
    if(s === 'available') document.getElementById('chip-available').className = 'status-chip active-green';
    if(s === 'busy') document.getElementById('chip-busy').className = 'status-chip active-orange';
    if(s === 'closing') document.getElementById('chip-closing').className = 'status-chip active-gray';
    const msgs = { available: '✅ Status: Available', busy: '🟠 Status: Busy — slow service', closing: '⏰ Customers notified you\'re closing soon' };
    showToast(msgs[s]);
  }

  function toggleHappy() {
    isHappy = !isHappy;
    const btn = document.getElementById('happy-btn');
    const t = translations[currentLang];
    // Update button text based on current lang and new state
    btn.textContent = isHappy ? t.happyOff : t.happy;
    btn.classList.toggle('active', isHappy);
    const items = [
      { price: 'price-wm', happy: 'happy-wm' },
      { price: 'price-mg', happy: 'happy-mg' },
      { price: 'price-bn', happy: 'happy-bn' },
      { price: 'price-gr', happy: 'happy-gr' }
    ];
    items.forEach(it => {
      const p = document.getElementById(it.price);
      const h = document.getElementById(it.happy);
      if (isHappy) {
        p.classList.add('happy');          // strikethrough on original price
        h.style.display = 'block';         // show discounted price
      } else {
        p.classList.remove('happy');       // restore original price style
        h.style.display = 'none';          // hide discounted price
      }
    });
    showToast(isHappy ? '🔥 Happy Hour is ON! Deals visible to customers' : '🛑 Happy Hour ended');
  }

  function showAddModal() {
    document.getElementById('add-modal').classList.add('show');
  }
  function closeModal() {
    document.getElementById('add-modal').classList.remove('show');
  }

  const itemEmojis = { default: '🛒', fruit: '🍑', veg: '🥬', street: '🌽', bev: '🥤' };
  function addItem() {
    const name = document.getElementById('new-item-name').value;
    const price = document.getElementById('new-item-price').value;
    const unit = document.getElementById('new-item-unit').value;
    if(!name || !price) { showToast('Please fill name and price'); return; }
    const list = document.getElementById('inv-list');
    const div = document.createElement('div');
    div.className = 'inv-item';
    div.innerHTML = `<div class="inv-left"><span class="inv-emoji">🛒</span><div><div class="inv-name">${name}</div><div class="inv-unit">${unit || 'Per unit'}</div></div></div><div class="inv-price-row"><div class="inv-price">₹${price}</div></div>`;
    div.style.animation = 'fadeSlideIn 0.4s cubic-bezier(0.34,1.2,0.64,1)';
    list.appendChild(div);
    closeModal();
    showToast(`✅ ${name} added to stock!`);
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    document.getElementById('new-item-unit').value = '';
  }

  function cycleLang() {
    currentLang = (currentLang + 1) % 3;
    const t = translations[currentLang];
    const fab = document.querySelector('.lang-fab-btn');
    fab.innerHTML = currentLang === 0 ? 'A/అ/<span style="font-family:serif">अ</span>' : langs[currentLang];
    document.getElementById('live-title-text').textContent = isLive ? (currentLang === 0 ? '🟢 You are Live!' : currentLang === 1 ? '🟢 లైవ్ లో ఉన్నారు!' : '🟢 आप लाइव हैं!') : t.live;
    document.getElementById('live-hint').textContent = isLive ? document.getElementById('live-hint').textContent : t.hint;
    document.getElementById('chip-available').textContent = t.available;
    document.getElementById('chip-busy').textContent = t.busy;
    document.getElementById('chip-closing').textContent = t.closing;
    document.getElementById('happy-btn').textContent = isHappy ? t.happyOff : t.happy;
    const msgs = ['English', 'తెలుగు', 'हिंदी'];
    showToast('🌐 Language: ' + msgs[currentLang]);
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }