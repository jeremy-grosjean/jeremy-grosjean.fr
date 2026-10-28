/* jeremy-grosjean.fr — animation réseau, jeu, terminal (compatible CSP : aucun eval, aucun script en ligne) */
(() => {
  'use strict';
  /* Robustesse : si un élément manque (page en cache d'une ancienne version, extension…), on utilise
     un élément fantôme au lieu de planter : le reste du site continue de fonctionner. */
  const ghost = {};
  const $ = id => document.getElementById(id) || ghost[id] || (ghost[id] = document.createElement(id === 'net' ? 'canvas' : 'div'));
  const T = window.JG_I18N;
  if (!T) return; /* textes indisponibles : la page reste en français, sans animation */
  const LANGS = Object.keys(T);
  const NATIVE = { fr: 'Français', en: 'English', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', yue: '粵語', ko: '한국어' };
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Langues ================= */
  function detectLang() {
    const list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'fr']).map(l => l.toLowerCase());
    for (const l of list) {
      if (l.startsWith('fr')) return 'fr';
      if (l.startsWith('yue') || l === 'zh-hk' || l === 'zh-mo' || /^zh-hant-(hk|mo)$/.test(l)) return 'yue';
      if (l.startsWith('zh-hant') || l === 'zh-tw') return 'zh-Hant';
      if (l.startsWith('zh')) return 'zh-Hans';
      if (l.startsWith('ko')) return 'ko';
      if (l.startsWith('en')) return 'en';
    }
    return 'en';
  }
  const MATCH = {
    fr: l => l.startsWith('fr'),
    en: l => l.startsWith('en'),
    'zh-Hans': l => l === 'zh' || l === 'zh-cn' || l === 'zh-sg' || l.startsWith('zh-hans'),
    'zh-Hant': l => l === 'zh-tw' || (l.startsWith('zh-hant') && !/-(hk|mo)$/.test(l)),
    yue: l => l === 'zh-hk' || l === 'zh-mo' || l.startsWith('yue') || /^zh-hant-(hk|mo)$/.test(l),
    ko: l => l.startsWith('ko')
  };
  /* Format régional : on garde la région du visiteur si elle correspond à la langue choisie */
  function regionLocale(code) {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (const l of list) {
      if (l && MATCH[code](l.toLowerCase())) {
        try { if (Intl.DateTimeFormat.supportedLocalesOf([l]).length) return l; } catch (e) {}
      }
    }
    return T[code].locale;
  }
  let lang = LANGS.includes(store.get('jg-lang')) ? store.get('jg-lang') : detectLang();
  const t = k => T[lang][k];
  let fTime, fDate, fmtLoc = '';
  /* Démarrage en deux petites tâches : les outils de date du navigateur (Intl) coûtent cher la première fois,
     ils sont donc préparés juste après, dans une tâche séparée (« booted ») */
  let booted = false;
  function fmt() {
    const loc = regionLocale(lang); if (fTime && fmtLoc === loc) return;
    fmtLoc = loc;
    fTime = new Intl.DateTimeFormat(loc, { timeZone: 'Europe/Paris', hour: 'numeric', minute: '2-digit' });
    fDate = new Intl.DateTimeFormat(loc, { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function applyLang() {
    document.documentElement.lang = t('htmlLang');
    document.title = t('title');
    document.querySelectorAll('[data-i]').forEach(el => { const v = t(el.dataset.i); if (typeof v === 'string') el.textContent = v; });
    langUI();
    $('langLabel').textContent = t('langLabel');
    $('termClose').setAttribute('aria-label', t('close'));
    tick(); setSoundUI(); setThemeUI(); buildSecSoon(); heroLang(); netUI();
    if (typeof MAIL !== 'undefined') { $('openMail').href = mailHref(); webmailHrefs(); if (document.body.classList.contains('rec-on')) fillRec(); }
    { const el = $('loadT'); if (el.dataset && el.dataset.v) el.textContent = ' · ' + t('loadedIn')(el.dataset.v); }
    if (typeof htopOn !== 'undefined' && htopOn) htopDraw();
    updLine();
  }
  function setLang(l) { if (!LANGS.includes(l)) return false; lang = l; store.set('jg-lang', l); applyLang(); return true; }

  /* ================= Menu des langues (liste personnalisée, accessible au clavier) ================= */
  const langBtn = $('langBtn'), langPop = $('langPop'), langList = $('langList'), langHl = $('langHl');
  const opts = [...langList.querySelectorAll('[role="option"]')];
  let activeIdx = -1;
  opts.forEach((o, i) => { o.id = 'lang-opt-' + i; });
  function langUI() {
    $('langCur').textContent = NATIVE[lang];
    opts.forEach(o => o.setAttribute('aria-selected', String(o.dataset.v === lang)));
  }
  function moveHl(i, withSound) {
    if (i < 0 || i >= opts.length) return;
    if (i !== activeIdx && withSound) SND.langTick(i);
    activeIdx = i;
    opts.forEach((o, k) => o.classList.toggle('active', k === i));
    const o = opts[i];
    langHl.style.transform = `translateY(${o.offsetTop}px)`; langHl.style.height = o.offsetHeight + 'px'; langHl.classList.add('on');
    langList.setAttribute('aria-activedescendant', o.id);
  }
  const menuOpen = () => !langPop.hidden;
  function openMenu() {
    langPop.hidden = false; langBtn.setAttribute('aria-expanded', 'true');
    activeIdx = -1; moveHl(Math.max(0, LANGS.indexOf(lang)), false);
    SND.langOpen(); langList.focus();
  }
  function closeMenu(focusBtn) {
    langPop.hidden = true; langBtn.setAttribute('aria-expanded', 'false'); langHl.classList.remove('on');
    if (focusBtn) langBtn.focus();
  }
  function pick(i) {
    const o = opts[i]; if (!o) return;
    SND.langPick(i);
    o.classList.remove('picked'); void o.offsetWidth; o.classList.add('picked');
    setLang(o.dataset.v);
    setTimeout(() => closeMenu(true), 260);
  }
  langBtn.addEventListener('click', () => menuOpen() ? closeMenu(true) : openMenu());
  langBtn.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); openMenu(); } });
  langList.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'ArrowDown') { e.preventDefault(); moveHl((activeIdx + 1) % opts.length, true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveHl((activeIdx - 1 + opts.length) % opts.length, true); }
    else if (e.key === 'Home') { e.preventDefault(); moveHl(0, true); }
    else if (e.key === 'End') { e.preventDefault(); moveHl(opts.length - 1, true); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(activeIdx); }
    else if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
    else if (e.key === 'Tab') { closeMenu(false); }
  });
  /* Survol à la souris ou glissement du doigt : son et surbrillance à chaque langue traversée */
  const optAt = (cx, cy) => { const el = document.elementFromPoint(cx, cy); const o = el && el.closest && el.closest('[role="option"]'); return o ? opts.indexOf(o) : -1; };
  langPop.addEventListener('pointermove', e => { const i = optAt(e.clientX, e.clientY); if (i >= 0) moveHl(i, true); });
  langPop.addEventListener('pointerdown', e => { const i = optAt(e.clientX, e.clientY); if (i >= 0) moveHl(i, true); });
  langPop.addEventListener('pointerup', e => { const i = optAt(e.clientX, e.clientY); if (i >= 0) pick(i); });
  document.addEventListener('pointerdown', e => { if (menuOpen() && !e.target.closest('#langBox')) closeMenu(false); });

  /* ================= Heure de Paris ================= */
  function tick() {
    if (!booted) return;
    fmt();
    const d = new Date();
    $('cTime').textContent = fTime.format(d);
    $('cDate').textContent = t('city') + t('sep') + fDate.format(d);
    localClock(d);
  }
  /* Heure du visiteur, seulement s'il n'est pas dans le même fuseau que Paris (calcul local) */
  let visTz = null;
  const getTz = () => { if (visTz === null) { try { visTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { visTz = ''; } } return visTz; };
  function localClock(d) {
    const el = $('cLocal');
    if (!getTz() || !fTime) { el.hidden = true; return; }
    let vis, par;
    try {
      const o = { hour: 'numeric', minute: '2-digit' };
      vis = new Intl.DateTimeFormat(regionLocale(lang), Object.assign({ timeZone: visTz }, o)).format(d);
      par = fTime.format(d);
    } catch (e) { el.hidden = true; return; }
    if (vis === par) { el.hidden = true; document.body.classList.remove('has-local'); return; }
    const CITY = { Reunion: 'La Réunion', Noumea: 'Nouméa', Montreal: 'Montréal', Sao_Paulo: 'São Paulo', Mexico_City: 'Mexico', Bogota: 'Bogotá' };
    const raw = visTz.split('/').pop() || '', city = CITY[raw] || raw.replace(/_/g, ' ');
    el.textContent = t('localTime')(vis, city); el.hidden = false; document.body.classList.add('has-local');
  }

  /* ================= Thème clair / sombre ================= */
  const mqLight = window.matchMedia('(prefers-color-scheme: light)');
  let themeMode = ['auto', 'light', 'dark'].includes(store.get('jg-theme')) ? store.get('jg-theme') : 'auto';
  const resolvedTheme = () => themeMode === 'auto' ? (mqLight.matches ? 'light' : 'dark') : themeMode;
  /* Icônes construites élément par élément (aucun innerHTML : compatible Trusted Types) */
  const ICONS = {
    auto: [['circle', { cx: 12, cy: 12, r: 8 }], ['path', { d: 'M12 4a8 8 0 0 0 0 16z', fill: 'currentColor' }]],
    light: [['circle', { cx: 12, cy: 12, r: 4 }], ['path', { d: 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' }]],
    dark: [['path', { d: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z' }]]
  };
  function drawIcon(svg, parts) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    for (const [tag, attrs] of parts) { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) el.setAttribute(k, attrs[k]); svg.append(el); }
  }
  let P = {};
  function readPalette() {
    const cs = getComputedStyle(document.documentElement);
    const v = n => cs.getPropertyValue(n).trim();
    P = { cyan: v('--cyan-rgb'), violet: v('--violet-rgb'), threat: v('--threat-rgb'), node: v('--node-rgb'), warn: v('--warn-rgb'), light: resolvedTheme() === 'light' && !document.documentElement.dataset.retro };
    P.blend = P.light ? 'source-over' : 'lighter';
    P.k = P.light ? 1.35 : 1;
  }
  function setThemeUI() {
    const name = { auto: t('themeAuto'), light: t('themeLight'), dark: t('themeDark') }[themeMode];
    const colon = lang === 'fr' ? ' : ' : (lang === 'en' || lang === 'ko') ? ': ' : '：';
    const lbl = t('themeLabel') + colon + name;
    $('themeBtn').setAttribute('aria-label', lbl); $('themeBtn').title = lbl;
    drawIcon($('themeIcon'), ICONS[themeMode]);
  }
  function applyTheme() {
    if (themeMode === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', themeMode);
    const meta = document.querySelectorAll('meta[name="theme-color"]');
    if (themeMode !== 'auto') meta.forEach(m => m.setAttribute('content', themeMode === 'light' ? '#F7F9FF' : '#0A0F24'));
    /* Couleurs de l'animation lues à l'image suivante : les lire tout de suite, juste après le changement de thème,
       forcerait le navigateur à recalculer les styles (« ajustement forcé de la mise en page ») */
    requestAnimationFrame(readPalette); setThemeUI();
  }
  function setTheme(m) {
    if (!['auto', 'light', 'dark'].includes(m)) return false;
    themeMode = m; store.set('jg-theme', m); applyTheme();
    /* Son du thème : lumineux qui monte (clair), grave et feutré qui descend (sombre), deux notes neutres (automatique) */
    if (typeof SND !== 'undefined') (m === 'light' ? SND.themeLight : m === 'dark' ? SND.themeDark : SND.themeAuto)();
    return true;
  }
  $('themeBtn').addEventListener('click', () => setTheme({ auto: 'light', light: 'dark', dark: 'auto' }[themeMode]));
  const onScheme = () => { if (themeMode === 'auto') readPalette(); };
  if (mqLight.addEventListener) mqLight.addEventListener('change', onScheme); else if (mqLight.addListener) mqLight.addListener(onScheme);

  /* ================= Son (désactivé par défaut) ================= */
  let ac = null, soundOn = store.get('jg-sound') === '1', lastMoveSound = 0;
  function setSoundUI() {
    $('sound').setAttribute('aria-pressed', String(soundOn));
    $('sLabel').textContent = soundOn ? t('soundOn') : t('soundOff');
    $('sound').setAttribute('aria-label', soundOn ? t('soundOn') : t('soundOff'));
    $('sWave').setAttribute('opacity', soundOn ? '1' : '.25');
  }
  function audio() {
    if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A(); }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, dur = .18, type = 'sine', vol = .06, slide = 0) {
    if (!soundOn) return;
    const a = audio(); if (!a) return;
    const tt = a.currentTime, o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = type; o.frequency.setValueAtTime(freq, tt);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), tt + dur);
    f.type = 'lowpass'; f.frequency.value = 2400;
    g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(vol, tt + .012); g.gain.exponentialRampToValueAtTime(.0001, tt + dur);
    o.connect(f); f.connect(g); g.connect(a.destination); o.start(tt); o.stop(tt + dur + .02);
  }
  const SND = {
    wave: px => { const n = 392 + (px / W) * 392; tone(n, .5, 'sine', .07, .5); tone(n * 1.5, .35, 'sine', .03, .6); },
    move: (px, py) => tone(520 + (1 - py / H) * 700, .07, 'sine', .012),
    block: () => { tone(880, .12, 'triangle', .07, 1.5); tone(1320, .1, 'sine', .03); },
    filter: () => { tone(600, .25, 'triangle', .06, 1.8); },
    wrong: () => tone(196, .25, 'sawtooth', .035, .7),
    breach: () => tone(110, .45, 'square', .05, .5),
    deliver: () => tone(660, .08, 'sine', .02),
    level: () => [440, 554, 659].forEach((n, i) => setTimeout(() => tone(n, .25, 'sine', .05), i * 90)),
    end: () => [523, 659, 784].forEach((n, i) => setTimeout(() => tone(n, .3, 'sine', .05), i * 110)),
    key: () => tone(1200, .03, 'square', .012),
    konami: () => [392, 494, 587, 784, 988].forEach((n, i) => setTimeout(() => tone(n, .35, 'triangle', .05), i * 80)),
    /* Menu des langues : une note douce par langue (gamme pentatonique), puis un accord de validation */
    langOpen: () => { tone(520, .16, 'sine', .028, 1.6); },
    langTick: i => { const n = [784, 880, 988, 1175, 1319, 1568][i % 6]; tone(n, .11, 'sine', .032); tone(n * 2, .06, 'sine', .008); },
    themeLight: () => { [1047, 1319, 1568, 2093].forEach((n, i) => setTimeout(() => tone(n, .32, 'sine', .035), i * 55)); setTimeout(() => tone(3136, .5, 'sine', .012), 230); },
    themeDark: () => { [392, 330, 262].forEach((n, i) => setTimeout(() => tone(n, .5, 'triangle', .05, .97), i * 90)); setTimeout(() => tone(131, .7, 'sine', .04), 270); },
    themeAuto: () => { tone(659, .25, 'sine', .04); setTimeout(() => tone(523, .35, 'sine', .035), 120); },
    langPick: i => { const n = [523, 587, 659, 784, 880, 1047][i % 6]; tone(n, .22, 'triangle', .045); setTimeout(() => tone(n * 1.5, .3, 'sine', .04), 70); setTimeout(() => tone(n * 2, .45, 'sine', .03), 150); }
  };
  $('sound').addEventListener('click', () => { soundOn = !soundOn; store.set('jg-sound', soundOn ? '1' : '0'); setSoundUI(); if (soundOn) tone(660, .15, 'sine', .05); });

  /* ================= Réseau animé ================= */
  const c = $('net'), x = c.getContext ? c.getContext('2d') : null;
  const stack = $('stack'), domain = $('domain');
  const DRIFT = reduce ? 0.12 : 1;
  let W = 0, H = 0, dpr = 1, nodes = [], packets = [], rings = [], trail = [], sparks = [], baseCount = 0;
  let pointer = null; const glow = { x: 0, y: 0, a: 0 };
  const LINK = () => Math.min(170, Math.max(120, W / 8));
  const FIELD = () => Math.min(220, Math.max(140, W / 6));
  const makeNode = (px, py) => {
    const a = Math.random() * Math.PI * 2, s = (.12 + Math.random() * .18) * DRIFT;
    return { x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s, bx: Math.cos(a) * s, by: Math.sin(a) * s, r: Math.random() < .14 ? 2.6 : 1.4, heat: 0, tx: null, ty: null };
  };
  function setup(w, h) {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w || window.innerWidth; H = h || window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    baseCount = Math.round(Math.min(95, Math.max(44, (W * H) / 14500)));
    nodes = Array.from({ length: baseCount }, () => makeNode(Math.random() * W, Math.random() * H));
    packets = []; rings = []; morph.on = false;
    glow.x = W / 2; glow.y = H / 2;
  }
  function neighbours(a) {
    const out = [], L = LINK();
    for (const b of nodes) if (b !== a && Math.hypot(a.x - b.x, a.y - b.y) < L) out.push(b);
    return out;
  }
  function sendPacket(from, hue) {
    const nb = neighbours(from);
    if (nb.length) packets.push({ a: from, b: nb[(Math.random() * nb.length) | 0], t: 0, hops: 3 + (Math.random() * 4 | 0), hue });
  }
  function sparkle(px, py, col, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 3.5;
      sparks.push({ x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, col });
    }
  }
  function flashTitle() { domain.classList.remove('flash'); void domain.offsetWidth; domain.classList.add('flash'); }
  function burst(px, py, strong = true) {
    rings.push({ x: px, y: py, r: 0, life: strong ? 1 : .6 });
    if (!strong) return;
    SND.wave(px);
    const near = nodes.map(n => [n, Math.hypot(n.x - px, n.y - py)]).sort((a, b) => a[1] - b[1]).slice(0, 6);
    near.forEach(([n], i) => { n.heat = 1; setTimeout(() => sendPacket(n, i % 2 ? 'v' : 'c'), i * 60); });
    flashTitle();
  }

  /* ================= Code Konami : les nœuds dessinent « JG » ================= */
  const morph = { on: false, until: 0 };
  function konami() {
    const oc = document.createElement('canvas'), ow = Math.min(W, 900), oh = Math.min(H, 520);
    oc.width = ow; oc.height = oh;
    const o = oc.getContext('2d');
    o.fillStyle = '#000'; o.textAlign = 'center'; o.textBaseline = 'middle';
    o.font = `800 ${Math.round(Math.min(ow * .5, oh * .8))}px ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif`;
    o.fillText('JG', ow / 2, oh / 2);
    const data = o.getImageData(0, 0, ow, oh).data, pts = [];
    const step = Math.max(9, Math.round(Math.min(ow, oh) / 34));
    for (let yy = 0; yy < oh; yy += step) for (let xx = 0; xx < ow; xx += step) if (data[(yy * ow + xx) * 4 + 3] > 128) pts.push([xx + (W - ow) / 2, yy + (H - oh) / 2]);
    const target = Math.min(pts.length, 240);
    while (nodes.length < target) nodes.push(makeNode(Math.random() * W, Math.random() * H));
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    nodes.forEach((n, i) => { const p = pts[i % pts.length]; n.tx = p[0]; n.ty = p[1]; });
    morph.on = true; morph.until = performance.now() + 4200;
    document.body.classList.add('morph');
    SND.konami(); flashTitle(); toast(t('tKonami')); found('konami');
  }
  function endMorph() {
    morph.on = false;
    document.body.classList.remove('morph');
    rings.push({ x: W / 2, y: H / 2, r: 0, life: 1 });
    nodes.forEach(n => { n.tx = n.ty = null; const dx = n.x - W / 2, dy = n.y - H / 2, d = Math.hypot(dx, dy) || 1; n.vx += dx / d * 3; n.vy += dy / d * 3; n.heat = 1; });
    setTimeout(() => { if (!morph.on && nodes.length > baseCount) nodes.splice(baseCount); }, 2500);
  }

  /* ================= Jeu : 3 niveaux ================= */
  const LEVELS = [
    { dur: 25, speed: 1.1, every: [820, 430] },
    { dur: 20, speed: 1.7, every: [1150, 650] },
    { dur: 25, speed: 1.2, every: [800, 420] }
  ];
  const G = { on: false, active: false, lv: 0, score: 0, breach: 0, load: 0, time: 0, items: [], spawnIn: 0, last: 0, shake: 0, hit: 0 };
  const getBest = () => +store.get('jg-firewall-best') || 0;
  let toastT;
  function toast(msg, ms) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms || 1500); }
  function hud() {
    $('hLevel').textContent = `${G.lv + 1}/${LEVELS.length}`;
    $('hScore').textContent = G.score; $('hBreach').textContent = G.breach + '/3'; $('hTime').textContent = Math.ceil(G.time);
  }
  const server = () => ({ x: W / 2, y: H / 2, s: Math.min(64, Math.max(46, W / 22)) });
  const panels = ['intro', 'levelPanel', 'over', 'secPanel', 'contactPanel', 'keysPanel', 'gamesPanel', 'supportPanel', 'panPanel', 'quizPanel', 'newsPanel', 'briefPanel', 'supPanel'];
  function closePanels() { panels.forEach(p => $(p).classList.remove('open')); }
  function openPanel(id, focusId) { closePanels(); if (!$('tourTip').hidden) endTour(); $(id).classList.add('open'); if (focusId) $(focusId).focus(); }
  function openIntro() { closeTerm(); openPanel('intro', 'start'); }

  function legendItem(cls, label) { const s = document.createElement('span'), i = document.createElement('i'); i.className = 'sw ' + cls; s.append(i, label); return s; }
  function showLevel(k) {
    G.lv = k; G.active = false; G.items = [];
    const L = t('levels')[k];
    $('lvTag').textContent = t('levelOf')(k + 1, LEVELS.length);
    $('lvTitle').textContent = L.name; $('lvWhat').textContent = L.what;
    const how = $('lvHow'); how.textContent = ''; const b = document.createElement('b'); b.textContent = t('defense') + ' '; how.append(b, L.how);
    const lg = $('lvLegend'); lg.textContent = '';
    if (k === 0) lg.append(legendItem('bad', t('lgBad')), legendItem('good', t('lgGood')));
    if (k === 1) lg.append(legendItem('ddos', t('lgDdos')), legendItem('good', t('lgGood')));
    if (k === 2) lg.append(legendItem('phish', t('lgPhish')), legendItem('bad', t('lgBad')), legendItem('good', t('lgGood')));
    hud(); openPanel('levelPanel', 'lvGo');
  }
  function startGame() {
    Object.assign(G, { on: true, active: false, lv: 0, score: 0, breach: 0, load: 0, items: [], shake: 0, hit: 0 });
    document.body.classList.add('playing'); showLevel(0);
  }
  function beginLevel() {
    closePanels();
    Object.assign(G, { active: true, time: LEVELS[G.lv].dur, spawnIn: 500, last: performance.now(), load: 0 });
    SND.level(); hud();
  }
  function endGame(reason) {
    G.on = false; G.active = false; G.items = [];
    document.body.classList.remove('playing'); SND.end();
    const best = getBest(), record = G.score > best;
    if (record) store.set('jg-firewall-best', String(G.score));
    if (reason === 'win') found('win');
    $('overTitle').textContent = reason === 'down' ? t('down') : reason === 'win' ? t('win') : t('timeUp');
    $('finalScore').textContent = G.score;
    $('finalText').textContent = record && G.score > 0 ? t('newRecord') : t('record')(Math.max(best, G.score));
    openPanel('over', 'again');
  }
  function quitGame() { G.on = false; G.active = false; G.items = []; document.body.classList.remove('playing'); closePanels(); }

  function edgePoint() {
    const side = Math.random() * 4 | 0, m = 30;
    return [side === 0 ? -m : side === 1 ? W + m : Math.random() * W, side === 2 ? -m : side === 3 ? H + m : Math.random() * H];
  }
  function addItem(kind, sx, sy, sp) { G.items.push({ x: sx, y: sy, sp, kind, wob: Math.random() * Math.PI * 2, r: kind === 'ddos' ? 5 : kind === 'legit' ? 7 : 9 }); }
  function spawn() {
    const L = LEVELS[G.lv], el = L.dur - G.time, scale = Math.max(.8, Math.min(1.2, W / 1100));
    const sp = () => (L.speed + el * .045 + Math.random() * .5) * scale;
    if (G.lv === 0) { const [sx, sy] = edgePoint(); addItem(Math.random() < .68 ? 'malware' : 'legit', sx, sy, sp()); }
    else if (G.lv === 1) {
      const [sx, sy] = edgePoint(), n = 5 + (Math.random() * 5 | 0), s = sp();
      for (let i = 0; i < n; i++) addItem('ddos', sx + (Math.random() - .5) * 60, sy + (Math.random() - .5) * 60, s * (.9 + Math.random() * .25));
      if (Math.random() < .55) { const [lx, ly] = edgePoint(); addItem('legit', lx, ly, sp() * .7); }
    } else {
      const [sx, sy] = edgePoint(), r = Math.random();
      addItem(r < .35 ? 'phish' : r < .6 ? 'malware' : 'legit', sx, sy, sp());
    }
  }
  const isThreat = it => it.kind !== 'legit';
  function gameTap(px, py, touch) {
    if (!G.active) return;
    if (G.lv === 1) {
      const R = touch ? 90 : 72;
      let hits = 0, wrong = 0;
      for (let i = G.items.length - 1; i >= 0; i--) {
        const it = G.items[i];
        if (Math.hypot(it.x - px, it.y - py) < R) { G.items.splice(i, 1); if (isThreat(it)) { hits++; G.score += it.kind === 'ddos' ? 5 : 10; } else { wrong++; G.score = Math.max(0, G.score - 5); } }
      }
      rings.push({ x: px, y: py, r: 0, life: .9, col: P.warn });
      if (hits) { SND.filter(); sparkle(px, py, P.warn, 10 + hits * 2); }
      if (wrong) { SND.wrong(); toast(t('wrong')); }
      hud(); return;
    }
    const R = touch ? 34 : 24;
    let best = null, bd = R;
    for (const it of G.items) { const d = Math.hypot(it.x - px, it.y - py); if (d < bd) { bd = d; best = it; } }
    if (!best) { burst(px, py, false); return; }
    G.items.splice(G.items.indexOf(best), 1);
    if (isThreat(best)) { SND.block(); G.score += 10; sparkle(best.x, best.y, P.threat, 16); rings.push({ x: best.x, y: best.y, r: 0, life: .7, col: P.threat }); }
    else { SND.wrong(); G.score = Math.max(0, G.score - 5); sparkle(best.x, best.y, P.cyan, 10); toast(t('wrong')); }
    hud();
  }
  function updateGame(now) {
    const dt = Math.min(50, now - G.last); G.last = now;
    G.time -= dt / 1000;
    if (Math.ceil(G.time) !== G.shown) { G.shown = Math.ceil(G.time); $('hTime').textContent = G.shown; }
    if (G.time <= 0) {
      G.time = 0; hud();
      if (G.lv < LEVELS.length - 1) { G.score += 20; showLevel(G.lv + 1); } else endGame('win');
      return;
    }
    G.spawnIn -= dt;
    const L = LEVELS[G.lv], el = L.dur - G.time;
    if (G.spawnIn <= 0) { spawn(); if (G.lv !== 1 && el > L.dur * .5 && Math.random() < .35) spawn(); G.spawnIn = Math.max(L.every[1], L.every[0] - el * 16); }
    const S = server();
    for (let i = G.items.length - 1; i >= 0; i--) {
      const it = G.items[i];
      const dx = S.x - it.x, dy = S.y - it.y, d = Math.hypot(dx, dy) || 1;
      it.wob += .08;
      const w = Math.sin(it.wob) * .6;
      it.x += (dx / d) * it.sp + (-dy / d) * w; it.y += (dy / d) * it.sp + (dx / d) * w;
      if (d < S.s * .55) {
        G.items.splice(i, 1);
        if (it.kind === 'legit') { SND.deliver(); G.score += 2; sparkle(S.x, S.y, P.cyan, 6); }
        else if (it.kind === 'ddos') {
          G.load++; G.hit = Math.max(G.hit, .4);
          if (G.load % 6 === 0) { SND.breach(); G.breach++; G.shake = 10; G.hit = 1; toast(t('overload')); }
        } else { SND.breach(); G.breach++; G.shake = 14; G.hit = 1; sparkle(S.x, S.y, P.threat, 22); toast(t('breach')); }
        hud();
        if (G.breach >= 3) { endGame('down'); return; }
      }
    }
  }
  function roundRect(rx, ry, w, h, rr) { x.beginPath(); x.moveTo(rx + rr, ry); x.arcTo(rx + w, ry, rx + w, ry + h, rr); x.arcTo(rx + w, ry + h, rx, ry + h, rr); x.arcTo(rx, ry + h, rx, ry, rr); x.arcTo(rx, ry, rx + w, ry, rr); x.closePath(); }
  function drawGame() {
    const S = server(); G.hit *= .92;
    const pulse = .5 + .5 * Math.sin(performance.now() / 400);
    const g = x.createRadialGradient(S.x, S.y, 0, S.x, S.y, S.s * 2.2);
    g.addColorStop(0, G.hit > .05 ? `rgba(${P.threat},${.35 * G.hit + .1})` : `rgba(${P.cyan},${.12 + .08 * pulse})`);
    g.addColorStop(1, `rgba(${P.cyan},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(S.x, S.y, S.s * 2.2, 0, Math.PI * 2); x.fill();
    const s = S.s, rx = S.x - s / 2, ry = S.y - s / 2;
    x.fillStyle = P.light ? 'rgba(255,255,255,.95)' : 'rgba(20,28,64,.95)';
    x.strokeStyle = G.hit > .05 ? `rgba(${P.threat},.9)` : `rgba(${P.cyan},.85)`; x.lineWidth = 1.5;
    roundRect(rx, ry, s, s, 12); x.fill(); x.stroke();
    for (let k = 0; k < 3; k++) {
      const ly = ry + s * (.3 + k * .2);
      x.strokeStyle = `rgba(${P.node},.3)`; x.beginPath(); x.moveTo(rx + s * .22, ly); x.lineTo(rx + s * .62, ly); x.stroke();
      x.fillStyle = k < 3 - G.breach ? `rgba(${P.cyan},.95)` : `rgba(${P.threat},.95)`;
      x.beginPath(); x.arc(rx + s * .76, ly, 2.6, 0, Math.PI * 2); x.fill();
    }
    x.globalCompositeOperation = P.blend;
    for (const it of G.items) {
      const col = it.kind === 'legit' || it.kind === 'phish' ? P.cyan : it.kind === 'ddos' ? P.warn : P.threat;
      const gg = x.createRadialGradient(it.x, it.y, 0, it.x, it.y, it.r * 2.6);
      gg.addColorStop(0, `rgba(${col},1)`); gg.addColorStop(.35, `rgba(${col},.75)`); gg.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = gg; x.beginPath(); x.arc(it.x, it.y, it.r * 2.6, 0, Math.PI * 2); x.fill();
      if (it.kind === 'malware') { x.strokeStyle = `rgba(${col},.55)`; x.lineWidth = 1; x.beginPath(); x.arc(it.x, it.y, it.r + 4 + Math.sin(it.wob * 2) * 2, 0, Math.PI * 2); x.stroke(); }
      if (it.kind === 'phish') {
        x.save(); x.globalCompositeOperation = 'source-over'; x.setLineDash([3, 3]); x.lineDashOffset = -it.wob * 6;
        x.strokeStyle = `rgba(${P.threat},${.75 + .25 * Math.sin(it.wob * 3)})`; x.lineWidth = 1.6;
        x.beginPath(); x.arc(it.x, it.y, it.r + 6, 0, Math.PI * 2); x.stroke(); x.restore();
      }
    }
    x.globalCompositeOperation = 'source-over';
  }

  /* ================= Rendu ================= */
  function frame(now) {
    try { drawFrame(now); } catch (e) { if (window.console) console.warn('[jeremy-grosjean.fr] rendu :', e); }
    requestAnimationFrame(frame);
  }
  function drawFrame(now) {
    if (G.on && G.active) updateGame(now);
    if (morph.on && now > morph.until) endMorph();
    let ox = 0, oy = 0;
    if (G.shake > .3) { ox = (Math.random() - .5) * G.shake; oy = (Math.random() - .5) * G.shake; G.shake *= .86; }
    x.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
    x.clearRect(-20, -20, W + 40, H + 40);
    const L = LINK(), F = FIELD(), K = P.k;

    if (pointer) { glow.x += (pointer.x - glow.x) * .18; glow.y += (pointer.y - glow.y) * .18; glow.a += (1 - glow.a) * .08; } else glow.a *= .94;

    for (const p of nodes) {
      if (morph.on && p.tx !== null) {
        p.x += (p.tx - p.x) * .08; p.y += (p.ty - p.y) * .08; p.heat = Math.max(p.heat, .55); continue;
      }
      if (pointer && !G.on) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy) || 1;
        if (d < F) { const f = (1 - d / F) * .9; p.vx += (dx / d) * f * .35 + (-dy / d) * f * .18; p.vy += (dy / d) * f * .35 + (dx / d) * f * .18; p.heat = Math.max(p.heat, 1 - d / F); }
      }
      for (const r of rings) {
        const dx = p.x - r.x, dy = p.y - r.y, d = Math.hypot(dx, dy) || 1;
        if (Math.abs(d - r.r) < 26) { p.vx += (dx / d) * 1.6 * r.life; p.vy += (dy / d) * 1.6 * r.life; p.heat = 1; }
      }
      p.vx += (p.bx - p.vx) * .04; p.vy += (p.by - p.vy) * .04;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      p.heat *= .965;
    }

    const dim = G.on ? .45 : 1;
    if (glow.a > .02) {
      const g = x.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, F * 1.1);
      g.addColorStop(0, `rgba(${P.cyan},${.16 * glow.a * K})`); g.addColorStop(.5, `rgba(${P.violet},${.07 * glow.a * K})`); g.addColorStop(1, `rgba(${P.violet},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(glow.x, glow.y, F * 1.1, 0, Math.PI * 2); x.fill();
    }
    x.lineWidth = 1;
    const linkL = morph.on ? Math.max(18, Math.min(W, H) / 22) : L;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < linkL) {
          const k = (1 - d / linkL) * dim * K, h = Math.max(a.heat, b.heat);
          x.strokeStyle = h > .15 ? `rgba(${P.cyan},${k * (.25 + h * .6)})` : `rgba(${P.violet},${k * .32})`;
          x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
        }
      }
      if (pointer && !G.on && !morph.on) {
        const d = Math.hypot(a.x - glow.x, a.y - glow.y);
        if (d < F) { x.strokeStyle = `rgba(${P.cyan},${(1 - d / F) * .55 * K})`; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(glow.x, glow.y); x.stroke(); }
      }
    }

    x.globalCompositeOperation = P.blend;
    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1], p1 = trail[i], k = i / trail.length;
      x.strokeStyle = `rgba(${k > .5 ? P.cyan : P.violet},${k * .55 * p1.life * K})`;
      x.lineWidth = 1 + k * 3; x.lineCap = 'round';
      x.beginPath(); x.moveTo(p0.x, p0.y); x.lineTo(p1.x, p1.y); x.stroke();
    }
    for (const tr of trail) tr.life *= .92;
    while (trail.length && trail[0].life < .05) trail.shift();
    x.lineWidth = 1;

    for (const p of nodes) {
      const rr = p.r + p.heat * 2.2;
      if (p.heat > .1) {
        const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 5);
        g.addColorStop(0, `rgba(${P.cyan},${.5 * p.heat})`); g.addColorStop(1, `rgba(${P.cyan},0)`);
        x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, rr * 5, 0, Math.PI * 2); x.fill();
      }
      x.fillStyle = p.r > 2 || p.heat > .3 ? `rgba(${P.cyan},${.95 * dim})` : `rgba(${P.node},${(P.light ? .45 : .55) * dim})`;
      x.beginPath(); x.arc(p.x, p.y, rr, 0, Math.PI * 2); x.fill();
    }
    for (let k = rings.length - 1; k >= 0; k--) {
      const r = rings[k], col = r.col || P.cyan;
      r.r += 7 + r.r * .02; r.life *= .955;
      x.strokeStyle = `rgba(${col},${r.life * .8})`; x.lineWidth = 2 * r.life + .5;
      x.beginPath(); x.arc(r.x, r.y, r.r, 0, Math.PI * 2); x.stroke();
      if (!r.col) { x.strokeStyle = `rgba(${P.violet},${r.life * .45})`; x.lineWidth = 1; x.beginPath(); x.arc(r.x, r.y, r.r * .72, 0, Math.PI * 2); x.stroke(); }
      if (r.life < .03) rings.splice(k, 1);
    }
    if (!G.on && !reduce && !morph.on && packets.length < 16 && Math.random() < .07) sendPacket(nodes[(Math.random() * nodes.length) | 0], Math.random() < .8 ? 'c' : 'v');
    for (let k = packets.length - 1; k >= 0; k--) {
      const q = packets[k];
      q.t += .02;
      if (q.t >= 1) {
        q.hops--; q.b.heat = Math.max(q.b.heat, .6);
        const nb = neighbours(q.b).filter(n => n !== q.a);
        if (q.hops <= 0 || !nb.length) { packets.splice(k, 1); continue; }
        q.a = q.b; q.b = nb[(Math.random() * nb.length) | 0]; q.t = 0;
      }
      const px = q.a.x + (q.b.x - q.a.x) * q.t, py = q.a.y + (q.b.y - q.a.y) * q.t, col = q.hue === 'v' ? P.violet : P.cyan;
      const g = x.createRadialGradient(px, py, 0, px, py, 8);
      g.addColorStop(0, `rgba(${col},${dim})`); g.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(px, py, 8, 0, Math.PI * 2); x.fill();
    }
    for (let k = sparks.length - 1; k >= 0; k--) {
      const s = sparks[k];
      s.x += s.vx; s.y += s.vy; s.vx *= .93; s.vy *= .93; s.life *= .9;
      x.fillStyle = `rgba(${s.col},${s.life})`; x.beginPath(); x.arc(s.x, s.y, 2.2 * s.life + .4, 0, Math.PI * 2); x.fill();
      if (s.life < .04) sparks.splice(k, 1);
    }
    x.globalCompositeOperation = 'source-over';
    if (G.on && (G.active || G.items.length)) drawGame();
  }

  /* ================= Accueil : nom déchiffré, domaines tapés, journal de démarrage ================= */
  const BOOT_TAG = { ok: '[  OK  ]', wait: '[  ..  ]', info: '[ INFO ]' };
  const bootUl = $('bootlog'), rotEl = $('rot'), nameFx = $('nameFx'), whoEl = $('who'), whoCur = $('whoCur'), rotLine = $('rotLine');
  const whoText = () => 'whoami → ' + (t('whoRole') || '');
  let whoDone = false;
  let heroStarted = false, rotGen = 0;
  function buildBoot() {
    const list = t('boot'); if (!Array.isArray(list)) return;
    bootUl.textContent = '';
    for (const [k, txt] of list) {
      const li = document.createElement('li'), st = document.createElement('span'), tx = document.createElement('span');
      st.className = 'st ' + k; st.textContent = BOOT_TAG[k] || BOOT_TAG.info; tx.textContent = txt;
      li.append(st, ' ', tx); bootUl.append(li);
    }
  }
  function heroLang() {
    if (heroStarted) bootUl.classList.add('static'); /* changement de langue : pas de nouvelle animation */
    buildBoot();
    if (!heroStarted || whoDone) whoEl.textContent = whoText();
    if (heroStarted) startRotate(0);
  }
  function scrambleName(done) {
    const full = nameFx.textContent, CH = '!<>-_\\/[]{}=+*^?#01ABCDEFX';
    if (!full) { done(); return; }
    let s = 0; const steps = full.length * 3;
    (function step() {
      const n = (s / 3) | 0;
      nameFx.textContent = full.split('').map((ch, i) => (i < n || ch === ' ') ? ch : CH[(Math.random() * CH.length) | 0]).join('');
      if (s++ < steps) setTimeout(step, 28); else { nameFx.textContent = full; done(); }
    })();
  }
  /* Les domaines s'écrivent puis s'effacent, en boucle. Effets de texte sans grand mouvement : actifs même avec « Réduire les animations » */
  function startRotate(delay) {
    const gen = ++rotGen; let i = 0;
    const alive = () => gen === rotGen;
    const words = () => t('domains') || [];
    const later = (fn, ms) => setTimeout(() => { if (alive()) fn(); }, ms);
    rotEl.textContent = '';
    function type(word, k) {
      rotEl.textContent = word.slice(0, k);
      if (k < word.length) later(() => type(word, k + 1), 55); else later(() => erase(word, word.length), 1600);
    }
    function erase(word, k) {
      rotEl.textContent = word.slice(0, k);
      if (k > 0) later(() => erase(word, k - 1), 25); else { i++; later(next, 250); }
    }
    function next() { const w = words(); if (w.length) type(w[i % w.length], 1); }
    later(next, delay);
  }
  /* E : « whoami → métier » se tape une seule fois, puis reste affiché */
  function typeWho() {
    let k = 0;
    whoEl.textContent = '';
    (function step() {
      if (whoDone) return;
      const full = whoText();
      whoEl.textContent = full.slice(0, k);
      if (k++ < full.length) setTimeout(step, 50); else { whoDone = true; whoCur.classList.add('off'); }
    })();
  }
  function startHero() {
    heroStarted = true;
    whoEl.textContent = '';
    rotLine.classList.add('idle');
    scrambleName(() => {});
    setTimeout(typeWho, 1450);
    setTimeout(() => rotLine.classList.remove('idle'), 3300);
    startRotate(3400);
  }

  /* ================= Voyant de connexion (en direct) ================= */
  const netPill = $('netPill'), netTxt = $('netTxt');
  const isOnline = () => navigator.onLine !== false;
  function netUI() {
    const on = isOnline();
    netPill.classList.toggle('off', !on);
    netTxt.textContent = t(on ? 'netOn' : 'netOff') || '';
    netPill.title = netTxt.textContent;
  }
  window.addEventListener('offline', () => { netUI(); toast(t('netLost')); tone(330, .3, 'triangle', .05, .6); setTimeout(() => tone(220, .4, 'sine', .04), 140); });
  window.addEventListener('online', () => { netUI(); toast(t('netBack')); tone(523, .18, 'sine', .045); setTimeout(() => tone(784, .3, 'sine', .04), 110); });

  /* ================= Me contacter (adresse assemblée ici : invisible pour les robots qui lisent le HTML) ================= */
  const MAIL = ['contact', 'jeremy-grosjean.fr'].join('@');
  $('mailAddr').textContent = MAIL;
  function mailHref() { return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(t('mailSubject')) + '&body=' + encodeURIComponent(t('mailBody')); }
  /* Webmails : brouillon déjà rempli dans le compte du visiteur (simples liens, aucune donnée ne passe par ce site) */
  function webmailHrefs() {
    const q = encodeURIComponent, to = q(MAIL), su = q(t('mailSubject')), bo = q(t('mailBody'));
    $('wmGmail').href = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${bo}`;
    $('wmOutlook').href = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${bo}`;
    $('wmPro').href = `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${su}&body=${bo}`;
    $('wmYahoo').href = `https://compose.mail.yahoo.com/?to=${to}&subject=${su}&body=${bo}`;
  }
  $('openMail').href = mailHref(); webmailHrefs();
  /* Si aucune application d'e-mail ne s'ouvre (fréquent sur ordinateur), on propose les autres solutions */
  $('openMail').addEventListener('click', () => {
    let left = false; const away = () => { left = true; };
    window.addEventListener('blur', away, { once: true }); document.addEventListener('visibilitychange', away, { once: true });
    setTimeout(() => {
      window.removeEventListener('blur', away); document.removeEventListener('visibilitychange', away);
      if (!left && document.visibilityState === 'visible') { toast(t('mailNone'), 6000); $('wmGmail').focus({ preventScroll: true }); }
    }, 1800);
  });
  function copyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(() => true, () => legacyCopy(txt));
    return Promise.resolve(legacyCopy(txt));
  }
  function legacyCopy(txt) {
    try {
      const ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', '');
      ta.className = 'sr'; document.body.append(ta); ta.select(); ta.setSelectionRange(0, txt.length);
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  }
  $('contactBtn').addEventListener('click', () => { closeTerm(); openPanel('contactPanel', 'copyMail'); });
  $('copyMail').addEventListener('click', () => copyText(MAIL).then(ok => {
    toast(t(ok ? 'copied' : 'copyFail')); if (ok) SND.key();
    if (!ok) { const r = document.createRange(); r.selectNodeContents($('mailAddr')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
  }));
  $('contactClose').addEventListener('click', closePanels);

  /* ================= Secrets à trouver (progression gardée sur l'appareil du visiteur) ================= */
  const SECRETS = ['term', 'konami', 'win', 'sudo', 'neofetch', 'keys', 'support', 'support2', 'matrix', 'htop', 'retro'];
  const foundSet = () => { try { const v = JSON.parse(store.get('jg-secrets') || '[]'); return Array.isArray(v) ? v.filter(x => SECRETS.includes(x)) : []; } catch (e) { return []; } };
  function found(id) {
    const f = foundSet(); if (f.includes(id)) return;
    f.push(id); store.set('jg-secrets', JSON.stringify(f));
    setTimeout(() => { toast(t('secretFound')(f.length, SECRETS.length, t('secretNames')[id])); tone(784, .12, 'sine', .04); setTimeout(() => tone(1175, .25, 'sine', .035), 90); }, 700);
  }

  /* ================= Encadré « Ce site est sécurisé » ================= */
  const secUl = $('secList'), secBar = $('secBar'), secScore = $('secScore');
  let auditGen = 0, auditDone = false;
  /* Vérifications réelles quand le navigateur peut les faire ; les autres sont des réglages du serveur (note A+ sur securityheaders.com) */
  function realCheck(i, total) {
    try {
      if (i === 0) return location.protocol === 'https:';
      if (i === 3) return window.top === window.self;
      if (i === total - 1) return document.cookie === '';
    } catch (e) { return false; }
    return true;
  }
  function secItem(name, desc) {
    const li = document.createElement('li'), ck = document.createElement('span'), b = document.createElement('b'), d = document.createElement('span');
    ck.className = 'ck'; ck.setAttribute('aria-hidden', 'true'); b.textContent = name; d.textContent = desc;
    li.append(ck, b, d); return li;
  }
  function setCk(li, ok) { li.classList.remove('checking'); li.classList.toggle('fail', !ok); li.querySelector('.ck').textContent = ok ? '✓' : '✗'; }
  function scoreText(ok, total) { secScore.textContent = t('secScore')(ok, total); secScore.classList.toggle('bad', ok < total); }
  /* Liste de sécurité : construite quand le navigateur a un moment libre (pas pendant le démarrage),
     ou tout de suite si le panneau est ouvert : le démarrage reste découpé en petites tâches */
  var secStale = true;
  function buildSecSoon() {
    secStale = true;
    if ($('secPanel').classList.contains('open')) { buildSecList(); return; }
    (window.requestIdleCallback || (f => setTimeout(f, 300)))(() => { if (secStale) safe('sécurité', buildSecList); }, { timeout: 4000 });
  }
  function buildSecList() {
    secStale = false;
    secUl.textContent = '';
    const list = t('sec');
    list.forEach(([name, desc], i) => { const li = secItem(name, desc); secUl.append(li); if (auditDone) setCk(li, realCheck(i, list.length)); });
    if (auditDone) { const ok = list.filter((x, i) => realCheck(i, list.length)).length; scoreText(ok, list.length); secBar.style.width = '100%'; }
    buildEco();
  }
  function runAudit() {
    const gen = ++auditGen, items = [...secUl.children], total = items.length;
    auditDone = false; secScore.textContent = ''; secScore.classList.remove('bad'); secBar.style.width = '0%';
    items.forEach(li => { li.classList.remove('fail'); li.classList.add('pending'); li.querySelector('.ck').textContent = '·'; });
    let i = 0, ok = 0; const step = reduce ? 140 : 230;
    (function next() {
      if (gen !== auditGen) return;
      if (i >= total) { auditDone = true; scoreText(ok, total); SND.level(); return; }
      const li = items[i]; li.classList.remove('pending'); li.classList.add('checking'); li.querySelector('.ck').textContent = '…';
      setTimeout(() => {
        if (gen !== auditGen) return;
        const good = realCheck(i, total); if (good) ok++;
        setCk(li, good); SND.key(); i++; secBar.style.width = (i / total * 100) + '%';
        setTimeout(next, 60);
      }, step);
    })();
  }
  /* Mesures réelles de la page, prises dans le navigateur du visiteur */
  function measure() {
    let total = 0, n = 1, ext = 0;
    try {
      const sz = e => e.encodedBodySize || e.transferSize || 0;
      const nav = performance.getEntriesByType('navigation')[0]; if (nav) total += sz(nav);
      for (const r of performance.getEntriesByType('resource')) {
        n++; total += sz(r);
        try { if (new URL(r.name).origin !== location.origin) ext++; } catch (e) {}
      }
    } catch (e) {}
    return { kb: total / 1024, n, ext };
  }
  const EXT = [['SSL Labs', 'A+', 'https://www.ssllabs.com/ssltest/analyze.html?d=jeremy-grosjean.fr'], ['Mozilla Observatory', 'A+ · 150/100', 'https://developer.mozilla.org/fr/observatory/analyze?host=jeremy-grosjean.fr'], ['securityheaders.com', 'A+', 'https://securityheaders.com/?q=jeremy-grosjean.fr&followRedirects=on'], ['PageSpeed Insights', '100 · 100 · 100', 'https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fjeremy-grosjean.fr']];
  function buildExt() {
    const ul = $('extList'); ul.textContent = '';
    for (const [name, grade, url] of EXT) {
      const li = document.createElement('li'), a = document.createElement('a'), b = document.createElement('b');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = name + ' ↗'; b.textContent = grade; li.append(a, b); ul.append(li);
    }
  }
  function buildEco() {
    buildExt();
    const ul = $('ecoList'); ul.textContent = '';
    const m = measure(), nf = new Intl.NumberFormat(t('locale'), { maximumFractionDigits: 0 });
    const cookies = document.cookie ? document.cookie.split(';').length : 0;
    const rows = [[t('ecoWeight'), m.kb > 0 ? `${nf.format(m.kb)} ${t('kb')}` : '—'], [t('ecoReq'), nf.format(m.n)], [t('ecoExt'), nf.format(m.ext)], [t('ecoCookies'), nf.format(cookies)]];
    for (const [k, v] of rows) { const li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('b'); a.textContent = k; b.textContent = v; li.append(a, b); ul.append(li); }
    for (const f of t('ecoFacts')) { const li = document.createElement('li'); li.className = 'fact'; const ck = document.createElement('span'); ck.className = 'ck'; ck.textContent = '✓'; const tx = document.createElement('span'); tx.textContent = f; li.append(ck, tx); ul.append(li); }
    $('ecoNote').textContent = t('ecoNote');
    $('scores').title = t('scoresTitle');
  }
  $('secRerun').addEventListener('click', () => { buildEco(); runAudit(); });
  $('secBtn').addEventListener('click', () => { closeTerm(); if (secStale) buildSecList(); openPanel('secPanel', 'secClose'); buildEco(); runAudit(); });
  $('secClose').addEventListener('click', closePanels);

  /* ================= Terminal ================= */
  const term = $('term'), out = $('termOut'), input = $('termInput');
  const hist = []; let hIdx = 0, greeted = false;
  const COMMANDS = ['help', 'boot', 'legal', 'device', 'neofetch', 'secrets', 'htop', 'support', 'status', 'dig', 'ipcalc', 'install', 'tour', 'matrix', 'whoami', 'about', 'security', 'ping', 'date', 'lang', 'theme', 'play', 'konami', 'contact', 'cv', 'projets', 'panne', 'quiz', 'changelog', 'print', 'a11y', 'clear', 'exit'];
  const ALIAS = { aide: 'help', top: 'htop', fps: 'htop', ticket: 'support', tickets: 'support', supervision: 'status', nslookup: 'dig', host: 'dig', installer: 'install', visite: 'tour', appareil: 'device', sysinfo: 'device', fastfetch: 'neofetch', secret: 'secrets', mentions: 'legal', legales: 'legal', 'légales': 'legal', privacy: 'legal', demarrage: 'boot', 'démarrage': 'boot', journal: 'boot', dmesg: 'boot', apropos: 'about', 'à-propos': 'about', securite: 'security', 'sécurité': 'security', jouer: 'play', effacer: 'clear', cls: 'clear', quitter: 'exit', quit: 'exit', langue: 'lang', theme: 'theme', 'thème': 'theme', ls: 'help', man: 'help', recruteur: 'cv', recruiter: 'cv', resume: 'cv', imprimer: 'print', pdf: 'print', accessibilite: 'a11y', 'accessibilité': 'a11y', accessibility: 'a11y', mail: 'contact', email: 'contact', 'rétro': 'retro', crt: 'retro', phosphore: 'retro', vt100: 'retro', diagnostic: 'panne', depannage: 'panne', 'dépannage': 'panne', fault: 'panne', ad: 'quiz', gpo: 'quiz', news: 'changelog', nouveautes: 'changelog', 'nouveautés': 'changelog', quoideneuf: 'changelog' };
  function line(text, cls) { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = text; out.append(d); out.scrollTop = out.scrollHeight; return d; }
  function openTerm() {
    closePanels(); document.body.classList.add('term-open');
    if (!greeted) { greeted = true; line(t('tWelcome'), 'c'); }
    found('term');
    setTimeout(() => input.focus(), 30);
  }
  function closeTerm() { document.body.classList.remove('term-open'); if (document.activeElement === input) input.blur(); }
  const termOpen = () => document.body.classList.contains('term-open');
  function ping(host) {
    const h = host || 'jeremy-grosjean.fr';
    line(`PING ${h} (jeremy-grosjean.fr): 56 data bytes`, 'd');
    [0, 1, 2].forEach(i => setTimeout(() => {
      line(`64 bytes from jeremy-grosjean.fr: icmp_seq=${i} ttl=64 time=${(.3 + Math.random() * .6).toFixed(2)} ms`); SND.key();
      if (i === 2) setTimeout(() => {
        line(`--- ${h} ping statistics ---`, 'd'); line('3 packets transmitted, 3 packets received, 0.0% packet loss', 'd'); line(t('tPingReply'), 'g');
      }, 250);
    }, 300 + i * 420));
  }
  /* « device » : diagnostic du poste du visiteur, calculé localement, rien n'est envoyé */
  function browserName() {
    const ua = navigator.userAgent || '';
    if (navigator.brave) return 'Brave';
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\/|Opera/.test(ua)) return 'Opera';
    if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
    if (/Whale\//.test(ua)) return 'Whale';
    if (/Firefox\/|FxiOS/.test(ua)) return 'Firefox';
    if (/Chrome\/|CriOS/.test(ua)) return 'Chrome';
    if (/Safari\//.test(ua)) return 'Safari';
    return '?';
  }
  function osName() {
    const ua = navigator.userAgent || '', p = (navigator.userAgentData && navigator.userAgentData.platform) || '';
    if (/iPhone/.test(ua)) return 'iOS';
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iPadOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Mac/.test(p) || /Mac OS X/.test(ua)) return 'macOS';
    if (/Win/.test(p) || /Windows/.test(ua)) return 'Windows';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    if (/Linux/.test(p) || /Linux/.test(ua)) return 'Linux';
    return '?';
  }
  function device() {
    const L = t('devLabels'), yes = t('yes'), no = t('no');
    let tz = '?'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '?'; } catch (e) {}
    const rows = [
      [L.browser, browserName()], [L.os, osName()],
      [L.screen, `${screen.width} × ${screen.height} px (×${(window.devicePixelRatio || 1).toFixed(window.devicePixelRatio % 1 ? 1 : 0)})`],
      [L.window, `${innerWidth} × ${innerHeight} px`], [L.lang, (navigator.languages || [navigator.language]).slice(0, 3).join(', ')],
      [L.tz, tz], [L.theme, matchMedia('(prefers-color-scheme: dark)').matches ? t('themeDark') : t('themeLight')],
      [L.motion, reduce ? yes : no], [L.touch, navigator.maxTouchPoints > 0 ? yes : no]
    ];
    if (navigator.hardwareConcurrency) rows.push([L.cpu, `${navigator.hardwareConcurrency} ${L.cores}`]);
    if (navigator.deviceMemory) rows.push([L.ram, `≥ ${navigator.deviceMemory} ${t('gb')}`]);
    rows.push([L.net, isOnline() ? t('netOn') : t('netOff')], [L.https, location.protocol === 'https:' ? yes : no], [L.ip, t('ipNot')]);
    line(t('devHead'), 'c');
    const w = Math.max(...rows.map(r => r[0].length)) + 2;
    for (const [k, v] of rows) line(`  ${k.padEnd(w)}${v}`);
    line(t('devNote'), 'd');
  }
  /* « neofetch » : la fiche système façon Linux */
  const LOGO = ['     ██  ██████ ', '     ██ ██      ', '     ██ ██  ███ ', '██   ██ ██   ██ ', ' █████   ██████ ', '                ', '                ', '                '];
  function neofetch() {
    const N = t('neo'), info = [
      ['', 'jeremy@grosjean'], ['', '───────────────'],
      [N.os, 'jeremy-grosjean.fr'], [N.host, 'OVHcloud'], [N.shell, 'jgsh 1.0'], [N.job, t('whoRole')],
      [N.title, N.titleV], [N.goal, N.goalV], [N.avail, N.availV], [N.sec, 'A+ (securityheaders.com)'], [N.langs, '6']
    ];
    const narrow = innerWidth < 560;
    info.forEach(([k, v], i) => {
      const d = document.createElement('div'); d.className = 'neo';
      if (!narrow) { const lg = document.createElement('span'); lg.className = 'v'; lg.textContent = (LOGO[i] || '                ') + '  '; d.append(lg); }
      const kk = document.createElement('span'); kk.className = 'c'; kk.textContent = k ? k + ' : ' : '';
      const vv = document.createElement('span'); vv.textContent = v; if (!k && i === 0) vv.className = 'c';
      d.append(kk, vv); out.append(d);
    });
    const bar = document.createElement('div'); bar.className = 'neo-colors';
    for (const c of ['#5EE7FF', '#8B7CFF', '#4BE3A0', '#FFC857', '#FF5C7A', '#E8ECFF']) { const i = document.createElement('i'); i.style.background = c; bar.append(i); }
    out.append(bar); out.scrollTop = out.scrollHeight;
  }

  /* Secret : vieil écran vert phosphore, le temps de la visite (rien n'est enregistré) */
  function retro() {
    const r = document.documentElement, on = !r.dataset.retro;
    if (on) r.dataset.retro = '1'; else delete r.dataset.retro;
    requestAnimationFrame(readPalette);
    if (on) { line('> MODE PHOSPHORE', 'g'); line(t('tRetroOn'), 'd'); found('retro'); tone(440, .08, 'square', .03); setTimeout(() => tone(660, .12, 'square', .025), 90); }
    else line(t('tRetroOff'), 'g');
  }
  function run(raw) {
    const cmdLine = raw.trim();
    line(`~$ ${cmdLine}`, 'v');
    if (!cmdLine) return;
    hist.push(cmdLine); hIdx = hist.length;
    const [c0, ...args] = cmdLine.split(/\s+/);
    let cmd = c0.toLowerCase(); cmd = ALIAS[cmd] || cmd;
    const a = (args[0] || '').toLowerCase();
    switch (cmd) {
      case 'help': for (const [k, d] of t('tHelp')) line(`  ${k.padEnd(18)} ${d}`); break;
      case 'whoami':
        line(t('tWhoami'));
        if (a === '--long' || a === '-l') for (const [k, v] of t('brief')) line(`  ${k} : ${v}`, 'c');
        break;
      case 'legal': line(t('legalLink') + ' →', 'c'); setTimeout(() => { location.href = '/mentions-legales.html'; }, 400); break;
      case 'device': device(); break;
      case 'neofetch': neofetch(); found('neofetch'); break;
      case 'secrets': {
        const f = foundSet(); line(t('secretsHead')(f.length, SECRETS.length), 'c');
        for (const id of SECRETS) line(f.includes(id) ? `  ✓ ${t('secretNames')[id]}` : '  ○ ???', f.includes(id) ? 'g' : 'd');
        if (f.length < SECRETS.length) line(t('secretsHint'), 'd');
        break;
      }
      case 'boot': (t('boot') || []).forEach(([k, txt], i) => setTimeout(() => { line(`${BOOT_TAG[k] || BOOT_TAG.info} ${txt}`, { ok: 'g', wait: 'y', info: 'c' }[k] || 'c'); SND.key(); }, 180 + i * 380)); break;
      case 'about': line(t('tAbout')); break;
      case 'security': line(t('tSecHead'), 'c'); for (const [n, d] of t('sec')) line(`  ✓ ${n}: ${d}`, 'g'); break;
      case 'ping': ping(args.join(' ')); break;
      case 'date': { fmt(); const d = new Date(); line(`${fTime.format(d)}  ${t('city')}${t('sep')}${fDate.format(d)}`); break; }
      case 'lang': {
        const code = { fr: 'fr', en: 'en', 'zh-hans': 'zh-Hans', 'zh-hant': 'zh-Hant', yue: 'yue', ko: 'ko' }[a];
        if (setLang(code)) line(t('tLangSet')(NATIVE[code]), 'g'); else line(t('tUsageLang'), 'r');
        break;
      }
      case 'theme': {
        if (['retro', 'rétro', 'crt', 'phosphore'].includes(a)) { retro(); break; }
        const m = { auto: 'auto', light: 'light', clair: 'light', dark: 'dark', sombre: 'dark' }[a];
        if (m && setTheme(m)) line(t('tThemeSet')({ auto: t('themeAuto'), light: t('themeLight'), dark: t('themeDark') }[m]), 'g'); else line(t('tUsageTheme'), 'r');
        break;
      }
      case 'play': line(t('tGame'), 'g'); setTimeout(openIntro, 350); break;
      case 'support': line(t('tGame'), 'g'); setTimeout(() => openSupport(a === 'n2' || a === '2' ? 2 : 1), 350); break;
      case 'status': closeTerm(); setTimeout(openSup, 150); break;
      case 'tour': closeTerm(); setTimeout(() => startTour(true), 200); break;
      case 'matrix': closeTerm(); setTimeout(matrix, 150); break;
      case 'install': install(true); break;
      case 'htop': closeTerm(); setTimeout(() => htop(true), 150); break;
      case 'ipcalc': ipcalc(args[0]); break;
      case 'dig': dig(args); break;
      case 'konami': closeTerm(); setTimeout(konami, 150); break;
      case 'contact': {
        const wm = { gmail: 'wmGmail', outlook: 'wmOutlook', pro: 'wmPro', '365': 'wmPro', yahoo: 'wmYahoo' }[a];
        if (wm) { line(t('tWmOpen')($(wm).textContent.trim()), 'g'); $(wm).click(); break; }
        const d = line(t('tContact') + ' '), link = document.createElement('a');
        link.href = mailHref(); link.textContent = MAIL; d.append(link);
        line(t('tWmHint'), 'd'); break;
      }
      case 'retro': retro(); break;
      case 'changelog': closeTerm(); setTimeout(openNews, 150); break;
      case 'cv': line(t('tRecOpen'), 'g'); setTimeout(openRec, 250); break;
      case 'panne': line(t('tPanne'), 'g'); setTimeout(openPanne, 350); break;
      case 'quiz': line(t('tQuiz'), 'g'); setTimeout(openQuiz, 350); break;
      case 'print': line(t('tPrint'), 'g'); setTimeout(() => window.print(), 250); break;
      case 'a11y': line(t('a11yLink') + ' →', 'c'); setTimeout(() => { location.href = '/accessibilite.html'; }, 400); break;
      case 'clear': out.textContent = ''; break;
      case 'exit': closeTerm(); break;
      case 'sudo': line(t('tSudo'), 'r'); found('sudo'); break;
      case 'competences': case 'compétences': case 'skills': case 'projets': case 'projects': line(t('tSoon'), 'd'); break;
      default: line(t('tUnknown')(c0), 'r');
    }
  }
  $('termForm').addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; run(v); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { if (hIdx > 0) { hIdx--; input.value = hist[hIdx]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hIdx < hist.length - 1) { hIdx++; input.value = hist[hIdx]; } else { hIdx = hist.length; input.value = ''; } e.preventDefault(); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.toLowerCase(), m = COMMANDS.filter(k => k.startsWith(v));
      if (v && m.length === 1) input.value = m[0] + ' '; else if (v && m.length > 1) line(m.join('  '), 'd');
    } else if (e.key === 'Escape') { closeTerm(); }
    else if (e.key.length === 1) SND.key();
  });
  $('termBtn').addEventListener('click', () => termOpen() ? closeTerm() : openTerm());
  $('termClose').addEventListener('click', closeTerm);

  /* ================= Entrées ================= */
  function onMove(e) {
    if (soundOn && !G.on && pointer && !menuOpen() && !isUI(e.target)) {
      const now = performance.now(), d = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y);
      if (d > 14 && now - lastMoveSound > 110) { lastMoveSound = now; SND.move(e.clientX, e.clientY); }
    }
    pointer = { x: e.clientX, y: e.clientY };
    trail.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (trail.length > 28) trail.shift();
    if (!G.on && !reduce) stack.style.transform = `translate3d(${(e.clientX / W - .5) * -14}px, ${(e.clientY / H - .5) * -10}px, 0)`;
  }
  function onLeave() { pointer = null; if (!G.on) stack.style.transform = ''; }
  const isUI = el => el.closest && el.closest('button, a, input, select, label, .panel, .term, .topbar, .dock');
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', e => {
    if (isUI(e.target)) return;
    onMove(e);
    if (G.on) gameTap(e.clientX, e.clientY, e.pointerType !== 'mouse'); else burst(e.clientX, e.clientY);
  }, { passive: true });
  window.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') onLeave(); }, { passive: true });
  window.addEventListener('pointercancel', onLeave, { passive: true });
  document.addEventListener('mouseleave', onLeave);

  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let kIdx = 0;
  window.addEventListener('keydown', e => {
    const typing = e.target === input || menuOpen();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); termOpen() ? closeTerm() : openTerm(); return; }
    if (!typing && (e.code === 'Backquote' || e.key === '²' || e.key === '`')) { e.preventDefault(); termOpen() ? closeTerm() : openTerm(); return; }
    if (e.key === 'Escape') { if (termOpen()) closeTerm(); else if (G.on) quitGame(); else if (recOn() && !document.querySelector('.panel.open')) closeRec(); else closePanels(); return; }
    if (typing) return;
    const k = e.key.toLowerCase();
    if (k === KONAMI[kIdx]) { kIdx++; if (kIdx === KONAMI.length) { kIdx = 0; if (!G.on) konami(); } }
    else kIdx = k === KONAMI[0] ? 1 : 0;
  });

  /* ================= Fiche « En 30 secondes » ================= */
  function openBrief() {
    const dl = $('briefList'); dl.textContent = '';
    for (const [k, v] of t('brief')) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
    closeTerm(); openPanel('briefPanel', 'briefContact');
  }
  $('availBtn').addEventListener('click', openBrief);

  /* ================= Vue recruteur : une page sobre (lien direct : /#recruteur), aussi utilisée pour l'impression ================= */
  const REC_HASH = ['#recruteur', '#recruiter', '#cv'];
  function fillRec() {
    $('recRole').textContent = t('title').split(' · ')[1] || t('whoRole');
    const dl = $('recBrief'); dl.textContent = '';
    for (const [k, v] of t('brief')) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
    const ul = $('recTags'); ul.textContent = '';
    for (const d of t('domains')) { const li = document.createElement('li'); li.textContent = d; ul.append(li); }
    const a = $('recMail'); a.href = mailHref(); a.textContent = MAIL;
  }
  function recOn() { return document.body.classList.contains('rec-on'); }
  function openRec() {
    closeTerm(); closePanels(); fillRec();
    $('recView').hidden = false; document.body.classList.add('rec-on');
    if (!REC_HASH.includes(location.hash)) history.replaceState(null, '', '#recruteur');
    $('recView').scrollTop = 0; $('recName').setAttribute('tabindex', '-1'); $('recName').focus({ preventScroll: true });
  }
  function closeRec() {
    $('recView').hidden = true; document.body.classList.remove('rec-on');
    if (REC_HASH.includes(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  $('briefRec').addEventListener('click', openRec);
  $('recExit').addEventListener('click', closeRec);
  $('recContact').addEventListener('click', () => $('contactBtn').click());
  $('recPrint').addEventListener('click', () => window.print());
  window.addEventListener('beforeprint', fillRec);
  window.addEventListener('hashchange', () => { if (REC_HASH.includes(location.hash)) openRec(); else if (recOn()) closeRec(); });
  if (REC_HASH.includes(location.hash)) setTimeout(openRec, 0);
  $('briefClose').addEventListener('click', closePanels);
  $('briefContact').addEventListener('click', () => $('contactBtn').click());

  /* ================= Choix du jeu + simulateur de support N1 ================= */
  function openGames() { closeTerm(); openPanel('gamesPanel', 'pickServer'); }
  $('pickServer').addEventListener('click', openIntro);
  $('pickSupport').addEventListener('click', () => openSupport(1));
  $('pickSupport2').addEventListener('click', () => openSupport(2));
  $('pickPanne').addEventListener('click', () => openPanne());
  $('pickQuiz').addEventListener('click', () => openQuiz());
  $('gamesClose').addEventListener('click', closePanels);
  const SP = { level: 1, list: [], i: 0, score: 0, perfect: 0, answered: false };
  const ROUND = 5;
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pool = () => t(SP.level === 2 ? 'ticketsN2' : 'tickets') || [];
  /* 5 tickets tirés au hasard, réponses mélangées : on ne peut pas apprendre les positions par cœur */
  function openSupport(level) {
    closeTerm(); SP.done = false; SP.level = level === 2 ? 2 : 1; SP.i = 0; SP.score = 0; SP.perfect = 0;
    const p = pool(); SP.list = shuffle(p.map((x, k) => k)).slice(0, Math.min(ROUND, p.length)).map(k => ({ k, order: shuffle([0, 1, 2]) }));
    showTicket(); openPanel('supportPanel', null); SND.level();
  }
  const cur = () => { const it = SP.list[SP.i]; return { it, tk: pool()[it.k] }; };
  function showTicket() {
    const { it, tk } = cur(); SP.answered = false;
    $('tkTag').textContent = t('tkTag')(SP.i + 1, SP.list.length, tk.prio, 'N' + SP.level);
    $('tkScore').textContent = t('tkPts')(SP.score);
    $('tkTitle').textContent = t('tkTitle')((SP.level === 2 ? 2040 : 1040) + it.k * 7);
    $('tkFrom').textContent = t('tkFromL') + ' ' + tk.from;
    $('tkMsg').textContent = '« ' + tk.msg + ' »';
    const box = $('tkOpts'); box.textContent = '';
    it.order.forEach(k => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tk-opt'; b.textContent = tk.opts[k]; b.addEventListener('click', () => answer(k, b)); box.append(b); });
    $('tkExpl').hidden = true; $('tkNext').hidden = true;
    setTimeout(() => { const f = box.querySelector('button'); if (f) f.focus(); }, 30);
  }
  function answer(k, btn) {
    const { tk } = cur(); if (SP.answered) return;
    const good = k === tk.ok;
    if (good) { SP.answered = true; const first = !$('tkOpts').querySelector('.bad'); SP.score += first ? 10 : 5; if (first) SP.perfect++; btn.classList.add('good'); SND.block(); }
    else { btn.classList.add('bad'); btn.disabled = true; SND.wrong(); }
    const ex = $('tkExpl'); ex.hidden = false; ex.className = 'tk-expl ' + (good ? 'ok' : 'ko');
    ex.textContent = (good ? t('tkGood') : t('tkBad')) + ' ' + (good ? tk.why : t('tkRetry'));
    $('tkScore').textContent = t('tkPts')(SP.score);
    if (good) { $('tkOpts').querySelectorAll('button').forEach(b => { b.disabled = true; }); const nx = $('tkNext'); nx.hidden = false; nx.textContent = SP.i < SP.list.length - 1 ? t('tkNext') : t('tkEnd'); nx.focus(); }
  }
  $('tkNext').addEventListener('click', () => {
    if (SP.done) { openSupport(2); return; }
    if (SP.i < SP.list.length - 1) { SP.i++; showTicket(); return; }
    const total = SP.list.length;
    $('tkTag').textContent = t('tkDoneTag') + ' · N' + SP.level; $('tkTitle').textContent = t('tkDoneTitle')(SP.perfect, total, SP.level);
    $('tkFrom').textContent = ''; $('tkMsg').textContent = t('tkDoneMsg')(SP.score, total * 10);
    $('tkOpts').textContent = ''; $('tkExpl').hidden = true;
    const key = SP.level === 2 ? 'jg-support2-best' : 'jg-support-best', best = +store.get(key) || 0; if (SP.score > best) store.set(key, String(SP.score));
    if (SP.perfect === total) found(SP.level === 2 ? 'support2' : 'support');
    const nx = $('tkNext');
    SP.done = true;
    if (SP.level === 1 && SP.perfect >= 4) { nx.hidden = false; nx.textContent = t('tkToN2'); nx.focus(); }
    else nx.hidden = true;
    SND.end();
  });
  $('tkQuit').addEventListener('click', closePanels);

  /* ================= Mini-jeu « Trouve la panne » : commandes simulées, aucune requête réseau réelle ================= */
  const PN_NET = {
    dhcp: { ip: '169.254.3.7', apipa: true, mask: '255.255.0.0', gw: '', dns: '', ping: 'fail', ext: 'fail', ns: 'none' },
    dns: { ip: '192.168.1.42', mask: '255.255.255.0', gw: '192.168.1.1', dns: '192.168.1.250', ping: 'ok', ext: 'ok', ns: 'timeout' },
    gw: { ip: '192.168.1.42', mask: '255.255.255.0', gw: '192.168.2.1', dns: '192.168.1.1', ping: 'fail', ext: 'fail', ns: 'ok' },
    cable: { off: true, ping: 'fail', ext: 'fail', ns: 'none' },
    dup: { ip: '192.168.1.20', dup: true, mask: '255.255.255.0', gw: '192.168.1.1', dns: '192.168.1.1', ping: 'fail', ext: 'fail', ns: 'none' },
    isp: { ip: '192.168.1.42', mask: '255.255.255.0', gw: '192.168.1.1', dns: '192.168.1.1', ping: 'ok', ext: 'timeout', ns: 'timeout' }
  };
  const PN = { list: [], i: 0, score: 0, perfect: 0, cmds: 0, used: null, wrong: false, answered: false, done: false };
  const PN_ROUND = 4;
  const pnCur = () => { const k = PN.list[PN.i].k; return { k, net: PN_NET[k], sc: t('pnScen')[k] }; };
  function pnLine(txt, cls) { const box = $('pnTerm'), sp = document.createElement('span'); if (cls) sp.className = cls; sp.textContent = txt + '\n'; box.append(sp); box.scrollTop = box.scrollHeight; }
  const dots = l => { let x = '   ' + l; while (x.length < 38) x += x.length % 2 ? ' ' : '.'; return x + ': '; };
  function pnRun(id) {
    const { net } = pnCur(), O = t('pnOut'), gw = net.gw || '192.168.1.1';
    if (id === 'ip') {
      pnLine('C:\\> ipconfig /all', 'pr'); pnLine(O.nic); pnLine('');
      if (net.off) { pnLine(dots(O.media) + O.mediaOff, 'ko'); }
      else {
        pnLine(dots(net.apipa ? O.apipa : O.ip) + net.ip + (net.dup ? O.dup : ''), net.apipa || net.dup ? 'ko' : '');
        pnLine(dots(O.mask) + net.mask); pnLine(dots(O.gw) + net.gw, net.gw === '192.168.2.1' ? 'ko' : ''); pnLine(dots(O.dns) + net.dns);
      }
    } else if (id === 'gw' || id === 'ext') {
      const host = id === 'gw' ? gw : '8.8.8.8', r = id === 'gw' ? net.ping : net.ext;
      pnLine('C:\\> ping ' + host, 'pr'); pnLine(O.pingHead(host), 'dm');
      for (let n = 0; n < 4; n++) {
        if (r === 'ok') pnLine(O.reply(host, id === 'gw' ? 1 + (n % 2) : 14 + n), 'ok');
        else pnLine(r === 'timeout' ? O.timeout : O.fail, 'ko');
      }
      pnLine(O.stats(r === 'ok' ? 4 : 0), 'dm');
    } else {
      pnLine('C:\\> nslookup jeremy-grosjean.fr', 'pr');
      if (net.ns === 'ok') { pnLine(O.nsSrv(net.dns), 'dm'); pnLine(''); pnLine(O.nsOk, 'ok'); }
      else if (net.ns === 'timeout') pnLine(O.nsTimeout(net.dns), 'ko');
      else pnLine(O.nsNone, 'ko');
    }
    pnLine('');
    if (!PN.used.has(id)) { PN.used.add(id); PN.cmds++; }
    $('pnCmds').querySelector(`[data-c="${id}"]`).classList.add('done');
    $('pnOpts').querySelectorAll('button').forEach(b => { if (!PN.answered && !b.classList.contains('bad')) b.disabled = false; });
    if (!PN.answered) { const ex = $('pnExpl'); if (ex.dataset.need) { ex.hidden = true; delete ex.dataset.need; } }
    SND.key();
  }
  function openPanne() {
    closeTerm(); PN.done = false; PN.i = 0; PN.score = 0; PN.perfect = 0; PN.cmds = 0;
    PN.list = shuffle(Object.keys(PN_NET)).slice(0, PN_ROUND).map(k => ({ k }));
    pnShow(); openPanel('panPanel', null); SND.level();
  }
  function pnShow() {
    const { k, net, sc } = pnCur(); PN.used = new Set(); PN.wrong = false; PN.answered = false;
    $('pnTag').textContent = t('pnTag')(PN.i + 1, PN.list.length); $('pnScore').textContent = t('pnPts')(PN.score);
    $('pnTitle').textContent = t('pnTitle')(3040 + Object.keys(PN_NET).indexOf(k) * 7);
    $('pnFrom').textContent = t('pnFrom') + ' ' + sc[0]; $('pnFrom').hidden = false; $('pnMsg').textContent = '« ' + sc[1] + ' »'; $('pnMsg').hidden = false;
    $('pnTerm').textContent = ''; $('pnTerm').hidden = false; pnLine('C:\\>', 'dm'); $('pnCmdsL').hidden = false; $('pnAskL').hidden = false;
    const cmds = $('pnCmds'); cmds.textContent = ''; cmds.hidden = false;
    for (const [id, label] of [['ip', 'ipconfig /all'], ['gw', 'ping ' + (net.gw || '192.168.1.1')], ['ext', 'ping 8.8.8.8'], ['dns', 'nslookup']]) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pn-cmd'; b.dataset.c = id; b.textContent = label; b.addEventListener('click', () => pnRun(id)); cmds.append(b);
    }
    const C = t('pnCauses'), others = shuffle(Object.keys(C).filter(x => x !== k)).slice(0, 3), box = $('pnOpts'); box.textContent = '';
    for (const c of shuffle([k, ...others])) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tk-opt'; b.textContent = C[c]; b.disabled = true;
      b.addEventListener('click', () => pnAnswer(c === k, b)); box.append(b);
    }
    const ex = $('pnExpl'); ex.className = 'tk-expl'; ex.textContent = t('pnNeed'); ex.hidden = false; ex.dataset.need = '1';
    $('pnNext').hidden = true;
    setTimeout(() => { const f = cmds.querySelector('button'); if (f) f.focus(); }, 30);
  }
  function pnAnswer(good, btn) {
    if (PN.answered) return;
    const { sc } = pnCur(), ex = $('pnExpl'); ex.hidden = false; delete ex.dataset.need;
    if (good) {
      PN.answered = true; btn.classList.add('good'); SND.block();
      const pts = PN.wrong ? 20 : Math.max(40, 100 - 15 * Math.max(0, PN.used.size - 2)); PN.score += pts; if (!PN.wrong) PN.perfect++;
      ex.className = 'tk-expl ok'; ex.textContent = t('pnGood') + ' ' + sc[2];
      $('pnOpts').querySelectorAll('button').forEach(b => { b.disabled = true; });
      const nx = $('pnNext'); nx.hidden = false; nx.textContent = PN.i < PN.list.length - 1 ? t('pnNext') : t('pnEnd'); nx.focus();
    } else { PN.wrong = true; btn.classList.add('bad'); btn.disabled = true; SND.wrong(); ex.className = 'tk-expl ko'; ex.textContent = t('pnBad'); }
    $('pnScore').textContent = t('pnPts')(PN.score);
  }
  $('pnNext').addEventListener('click', () => {
    if (PN.done) { openPanne(); return; }
    if (PN.i < PN.list.length - 1) { PN.i++; pnShow(); return; }
    const total = PN.list.length, max = total * 100, best = Math.max(+store.get('jg-panne-best') || 0, PN.score); store.set('jg-panne-best', String(best));
    $('pnTag').textContent = t('pnDoneTag'); $('pnTitle').textContent = t('pnDoneTitle')(PN.perfect, total);
    $('pnFrom').hidden = true; $('pnMsg').textContent = t('pnDoneMsg')(PN.score, max, PN.cmds) + ' ' + t('pnBest')(best);
    for (const id of ['pnCmds', 'pnTerm', 'pnCmdsL', 'pnAskL']) $(id).hidden = true;
    $('pnOpts').textContent = ''; $('pnExpl').hidden = true;
    PN.done = true; const nx = $('pnNext'); nx.hidden = false; nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('pnQuit').addEventListener('click', closePanels);

  /* ================= Quiz Active Directory et GPO : 10 questions tirées parmi 12, réponses mélangées ================= */
  const QZ = { list: [], i: 0, score: 0, perfect: 0, answered: false, wrong: false, done: false };
  const QZ_ROUND = 10;
  function openQuiz() {
    closeTerm(); QZ.done = false; QZ.i = 0; QZ.score = 0; QZ.perfect = 0;
    QZ.list = shuffle(t('quizAD').map((x, k) => k)).slice(0, QZ_ROUND).map(k => ({ k, order: shuffle([0, 1, 2]) }));
    qzShow(); openPanel('quizPanel', null); SND.level();
  }
  function qzShow() {
    const it = QZ.list[QZ.i], q = t('quizAD')[it.k]; QZ.answered = false; QZ.wrong = false;
    $('qzTag').textContent = t('qzTag')(QZ.i + 1, QZ.list.length); $('qzScore').textContent = t('qzPts')(QZ.score);
    $('qzTitle').textContent = q[0]; $('qzSub').hidden = true;
    const box = $('qzOpts'); box.textContent = '';
    it.order.forEach(j => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tk-opt'; b.textContent = q[1][j]; b.addEventListener('click', () => qzAnswer(j === 0, b)); box.append(b); });
    $('qzExpl').hidden = true; $('qzNext').hidden = true;
    setTimeout(() => { const f = box.querySelector('button'); if (f) f.focus(); }, 30);
  }
  function qzAnswer(good, btn) {
    if (QZ.answered) return;
    const q = t('quizAD')[QZ.list[QZ.i].k], ex = $('qzExpl'); ex.hidden = false;
    if (good) {
      QZ.answered = true; btn.classList.add('good'); SND.block(); QZ.score += QZ.wrong ? 5 : 10; if (!QZ.wrong) QZ.perfect++;
      ex.className = 'tk-expl ok'; ex.textContent = t('qzGood') + ' ' + q[2];
      $('qzOpts').querySelectorAll('button').forEach(b => { b.disabled = true; });
      const nx = $('qzNext'); nx.hidden = false; nx.textContent = QZ.i < QZ.list.length - 1 ? t('qzNext') : t('qzEnd'); nx.focus();
    } else { QZ.wrong = true; btn.classList.add('bad'); btn.disabled = true; SND.wrong(); ex.className = 'tk-expl ko'; ex.textContent = t('qzBad') + ' ' + t('qzRetry'); }
    $('qzScore').textContent = t('qzPts')(QZ.score);
  }
  $('qzNext').addEventListener('click', () => {
    if (QZ.done) { openQuiz(); return; }
    if (QZ.i < QZ.list.length - 1) { QZ.i++; qzShow(); return; }
    const total = QZ.list.length, best = Math.max(+store.get('jg-quiz-best') || 0, QZ.score); store.set('jg-quiz-best', String(best));
    $('qzTag').textContent = t('qzDoneTag'); $('qzTitle').textContent = t('qzDoneTitle')(QZ.perfect, total);
    const sub = $('qzSub'); sub.textContent = t('qzDoneMsg')(QZ.score, total * 10) + ' ' + t('pnBest')(best); sub.hidden = false;
    $('qzOpts').textContent = ''; $('qzExpl').hidden = true;
    QZ.done = true; const nx = $('qzNext'); nx.hidden = false; nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('qzQuit').addEventListener('click', closePanels);

  /* ================= Journal « Quoi de neuf » : généré depuis les commits au moment de la mise en ligne ================= */
  function openNews() {
    const ul = $('newsList'), N = Array.isArray(window.JG_NEWS) ? window.JG_NEWS : [], tags = t('newsTags');
    ul.textContent = '';
    if (!N.length) { const li = document.createElement('li'); li.textContent = t('newsEmpty'); ul.append(li); }
    let f; try { f = new Intl.DateTimeFormat(regionLocale(lang), { day: '2-digit', month: '2-digit', timeZone: 'UTC' }); } catch (e) { f = null; }
    for (const n of N) {
      const li = document.createElement('li'), d = document.createElement('time'), k = document.createElement('span'), x = document.createElement('span');
      d.dateTime = n.d; d.textContent = f ? f.format(new Date(n.d + 'T12:00:00Z')) : n.d;
      k.className = 'news-tag ' + (tags[n.k] ? n.k : 'misc'); k.textContent = tags[n.k] || tags.misc; x.textContent = n.t;
      li.append(d, k, x); ul.append(li);
    }
    closeTerm(); openPanel('newsPanel', 'newsClose');
  }
  $('newsBtn').addEventListener('click', openNews);
  $('newsClose').addEventListener('click', closePanels);

  /* ================= Supervision : relevés faits par le script à chaque mise en ligne ================= */
  const ST = () => window.JG_STATUS || null;
  function fmtDate(iso, withTime) {
    try { return new Intl.DateTimeFormat(regionLocale(lang), withTime ? { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' } : { dateStyle: 'long', timeZone: 'Europe/Paris' }).format(new Date(iso)); } catch (e) { return iso; }
  }
  function updLine() {
    if (!booted) return;
    const st = ST(), el = $('updLine');
    if (!st || !st.checked) { el.hidden = true; return; }
    el.textContent = ' · ' + t('updatedOn')(fmtDate(st.checked, false)); el.hidden = false;
  }
  function supRows() {
    const st = ST(), S = t('supLabels'); if (!st) return null;
    const rows = [];
    rows.push([S.web, st.https === 200 ? 'OK (HTTPS)' : (st.https ? 'HTTP ' + st.https : '?'), st.https === 200 ? 'ok' : 'bad']);
    if (typeof st.tlsDays === 'number') rows.push([S.tls, t('supDays')(st.tlsDays), st.tlsDays > 20 ? 'ok' : st.tlsDays > 0 ? 'warn' : 'bad']);
    else rows.push([S.tls, '?', 'warn']);
    rows.push([S.mx, (st.mx || []).length ? st.mx.join(', ') : '?', (st.mx || []).length ? 'ok' : 'bad']);
    rows.push([S.spf, st.spf ? 'OK' : '?', st.spf ? 'ok' : 'bad']);
    const pol = (/p=(\w+)/.exec(st.dmarc || '') || [])[1];
    rows.push([S.dmarc, pol || '?', pol === 'reject' || pol === 'quarantine' ? 'ok' : pol ? 'warn' : 'bad']);
    rows.push([S.tlsrpt, st.tlsrpt ? 'OK' : '?', st.tlsrpt ? 'ok' : 'warn']);
    rows.push([S.dnssec, st.dnssec ? t('supSigned') : '?', st.dnssec ? 'ok' : 'warn']);
    if ('caa' in st) rows.push([S.caa || 'CAA', /letsencrypt\.org/.test(st.caa || '') ? 'Let’s Encrypt' : '?', /letsencrypt\.org/.test(st.caa || '') ? 'ok' : 'warn']);
    if ('methods' in st) rows.push([S.methods || 'HTTP', st.methods === 405 || st.methods === 403 ? t('supReadOnly') : '?', st.methods === 405 || st.methods === 403 ? 'ok' : 'warn']);
    if (typeof st.uptime30 === 'number') rows.push([S.uptime || 'Uptime', String(st.uptime30).replace('.', lang === 'fr' ? ',' : '.') + ' %', st.uptime30 >= 99.5 ? 'ok' : st.uptime30 >= 98 ? 'warn' : 'bad']);
    return rows;
  }
  /* 30 barres, une par jour : relevées sur UptimeRobot par le script de mise en ligne (le visiteur ne le contacte pas) */
  function upBars(st) {
    const old = $('upBox'); if (old) old.remove();
    const days = st && Array.isArray(st.uptimeDays) ? st.uptimeDays.slice(-30) : null; if (!days || !days.length) return;
    const box = document.createElement('div'), bars = document.createElement('div'), cap = document.createElement('div'), a = document.createElement('span'), b = document.createElement('span');
    box.id = 'upBox'; bars.className = 'up-bars'; bars.setAttribute('role', 'img'); bars.setAttribute('aria-label', t('supBarsAria')(days.filter(x => typeof x === 'number').length));
    for (const v of days) { const i = document.createElement('i'); i.className = typeof v !== 'number' ? 'none' : v >= 99.5 ? '' : v >= 98 ? 'warn' : 'bad'; i.title = typeof v === 'number' ? v + ' %' : '—'; bars.append(i); }
    cap.className = 'up-cap'; a.textContent = t('supBars30'); b.textContent = t('supBarsToday'); cap.append(a, b);
    box.append(bars, cap); $('supList').after(box);
  }
  function openSup() {
    const st = ST(), ul = $('supList'); ul.textContent = '';
    const rows = supRows();
    $('supIntro').textContent = st && st.checked ? t('supIntro')(fmtDate(st.checked, true)) : t('supNone');
    if (rows) for (const [k, v, c] of rows) {
      const li = document.createElement('li'), d = document.createElement('span'), a = document.createElement('span'), b = document.createElement('b');
      d.className = 'sdot ' + c; d.setAttribute('aria-hidden', 'true'); a.textContent = k; b.textContent = v; b.className = c; li.append(d, a, b); ul.append(li);
    }
    upBars(st);
    closeTerm(); openPanel('supPanel', 'supClose');
  }
  $('supBtn').addEventListener('click', openSup);
  $('supClose').addEventListener('click', closePanels);

  /* ================= Outils réseau du terminal ================= */
  function ipcalc(arg) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?:\/(\d{1,2}))?$/.exec(arg || '');
    if (!m || m.slice(1, 5).some(o => +o > 255) || (m[5] !== undefined && +m[5] > 32)) { line(t('ipUsage'), 'r'); return; }
    const ip = m.slice(1, 5).reduce((a, o) => (a * 256) + +o, 0), cidr = m[5] === undefined ? 24 : +m[5];
    const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0, net = (ip & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
    const q = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    const hosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;
    const first = cidr >= 31 ? net : net + 1, last = cidr >= 31 ? bc : bc - 1;
    const o1 = ip >>> 24, o2 = (ip >>> 16) & 255;
    const priv = o1 === 10 || (o1 === 172 && o2 >= 16 && o2 <= 31) || (o1 === 192 && o2 === 168);
    const I = t('ipLabels'), nf = new Intl.NumberFormat(t('locale'));
    const rows = [[I.addr, q(ip)], [I.net, `${q(net)}/${cidr}`], [I.mask, q(mask)], [I.wild, q(~mask >>> 0)], [I.first, q(first)], [I.last, q(last)], [I.bc, cidr >= 31 ? '—' : q(bc)], [I.hosts, nf.format(hosts)], [I.type, priv ? I.priv : I.pub]];
    const w = Math.max(...rows.map(r => r[0].length)) + 2;
    for (const [k, v] of rows) line(`  ${k.padEnd(w)}${v}`, k === I.net ? 'c' : undefined);
  }
  function dig(args) {
    const st = ST(); const a = args.map(x => x.toLowerCase());
    const type = (a.find(x => /^(mx|txt|ds|any|a)$/.test(x)) || 'any').toUpperCase();
    let name = a.find(x => !/^(mx|txt|ds|any|a)$/.test(x)) || 'jeremy-grosjean.fr';
    name = name.replace(/\.$/, '');
    if (!st) { line(t('supNone'), 'd'); return; }
    line(`;; ${t('digNote')(fmtDate(st.checked, true))}`, 'd');
    const out1 = (n, ty, v) => line(`${(n + '.').padEnd(30)} IN ${ty.padEnd(4)} ${v}`);
    const dom = 'jeremy-grosjean.fr';
    if (name === dom) {
      if (type === 'MX' || type === 'ANY') (st.mx || []).forEach(v => out1(dom, 'MX', v));
      if (type === 'TXT' || type === 'ANY') if (st.spf) out1(dom, 'TXT', `"${st.spf}"`);
      if (type === 'DS' || type === 'ANY') if (st.dnssec) out1(dom, 'DS', st.ds || '(DNSSEC)');
      if (type === 'A' || type === 'ANY') if (st.a) out1(dom, 'A', st.a);
    } else if (name === '_dmarc.' + dom && st.dmarc) out1(name, 'TXT', `"${st.dmarc}"`);
    else if (name === '_smtp._tls.' + dom && st.tlsrpt) out1(name, 'TXT', `"${st.tlsrpt}"`);
    else line(t('digOnly'), 'd');
  }

  /* ================= Application installable ================= */
  let installEvt = null;
  const standalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
  const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; installUI(); });
  window.addEventListener('appinstalled', () => { installEvt = null; installUI(); toast(t('installed')); });
  function installUI() {
    const b = $('installBtn'), ios = $('installIos');
    b.hidden = standalone() || !installEvt; ios.hidden = standalone() || !!installEvt || !isIOS();
    ios.textContent = t('installIos');
  }
  function install(fromTerm) {
    if (standalone()) { if (fromTerm) line(t('installAlready'), 'g'); return; }
    if (installEvt) { installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; installUI(); }); return; }
    if (fromTerm) line(isIOS() ? t('installIos') : t('installManual'), 'd');
  }
  $('installBtn').addEventListener('click', () => install(false));

  /* ================= Affichage : taille du texte, contraste, espacement ================= */
  const A11Y = (() => { try { return Object.assign({ size: 'm', contrast: false, font: false }, JSON.parse(store.get('jg-a11y') || '{}')); } catch (e) { return { size: 'm', contrast: false, font: false }; } })();
  function applyA11y() {
    const r = document.documentElement;
    if (A11Y.size === 'm') delete r.dataset.size; else r.dataset.size = A11Y.size;
    if (A11Y.contrast) r.dataset.contrast = '1'; else delete r.dataset.contrast;
    if (A11Y.font) r.dataset.font = '1'; else delete r.dataset.font;
    document.querySelectorAll('.seg [data-size]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === A11Y.size)));
    $('a11yContrast').checked = A11Y.contrast; $('a11yFont').checked = A11Y.font;
    store.set('jg-a11y', JSON.stringify(A11Y));
  }
  document.querySelectorAll('.seg [data-size]').forEach(b => b.addEventListener('click', () => { A11Y.size = b.dataset.size; applyA11y(); SND.key(); setup(); }));
  $('a11yContrast').addEventListener('change', e => { A11Y.contrast = e.target.checked; applyA11y(); requestAnimationFrame(readPalette); });
  $('a11yFont').addEventListener('change', e => { A11Y.font = e.target.checked; applyA11y(); });

  /* ================= Visite guidée (une seule fois, passable) ================= */
  const tourRing = $('tourRing'), tourTip = $('tourTip');
  let tourSteps = [], tourI = 0;
  const visible = el => { if (!el || !el.getBoundingClientRect) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  function startTour(force) {
    if (!force && store.get('jg-tour') === '1') return;
    if (G.on || panels.some(p => $(p).classList.contains('open')) || termOpen()) { if (!force) return; closePanels(); closeTerm(); }
    const map = { contactBtn: 'tourContact', availBtn: 'tourBrief', openGame: 'tourPlay', termBtn: 'tourTerm', secBtn: 'tourSec', supBtn: 'tourSup', keysBtn: 'tourKeys' };
    tourSteps = Object.keys(map).filter(id => visible(document.getElementById(id))).map(id => [id, map[id]]);
    if (!tourSteps.length) return;
    tourI = 0; showStep();
  }
  function placeTour() {
    const [id] = tourSteps[tourI], el = document.getElementById(id); if (!el) return;
    const r = el.getBoundingClientRect(), pad = 6;
    tourRing.style.left = (r.left - pad) + 'px'; tourRing.style.top = (r.top - pad) + 'px';
    tourRing.style.width = (r.width + pad * 2) + 'px'; tourRing.style.height = (r.height + pad * 2) + 'px';
    const tw = Math.min(300, innerWidth - 24); tourTip.style.width = tw + 'px';
    const th = tourTip.offsetHeight || 110;
    let left = Math.min(Math.max(12, r.left + r.width / 2 - tw / 2), innerWidth - tw - 12);
    let top = r.top - th - 14; if (top < 12) top = r.bottom + 14;
    tourTip.style.left = left + 'px'; tourTip.style.top = Math.min(top, innerHeight - th - 12) + 'px';
  }
  function showStep() {
    const [, key] = tourSteps[tourI];
    $('tourText').textContent = t(key);
    $('tourStep').textContent = `${tourI + 1}/${tourSteps.length}`;
    $('tourNext').textContent = tourI < tourSteps.length - 1 ? t('tourNext') : t('tourDone');
    tourRing.hidden = false; tourTip.hidden = false; placeTour(); SND.key();
    $('tourNext').focus({ preventScroll: true });
  }
  function endTour() { tourRing.hidden = true; tourTip.hidden = true; store.set('jg-tour', '1'); }
  $('tourNext').addEventListener('click', () => { if (tourI < tourSteps.length - 1) { tourI++; showStep(); } else endTour(); });
  $('tourSkip').addEventListener('click', endTour);
  window.addEventListener('resize', () => { if (!tourTip.hidden) placeTour(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !tourTip.hidden) endTour(); });

  /* ================= Commande « matrix » ================= */
  function matrix() {
    const cv = $('matrix'); if (!cv.getContext) return;
    const g = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.hidden = false; g.scale(dpr, dpr);
    const fs = 16, cols = Math.ceil(innerWidth / fs), drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = 'アカサタナハマヤラワ0123456789JGABCDEF<>/{}';
    const light = document.documentElement.dataset.theme === 'light' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: light)').matches);
    let stop = false, t0 = performance.now(); const dur = reduce ? 3000 : 6500;
    const end = () => { stop = true; cv.hidden = true; window.removeEventListener('keydown', end); cv.removeEventListener('pointerdown', end); };
    window.addEventListener('keydown', end); cv.addEventListener('pointerdown', end);
    found('matrix'); tone(220, .6, 'sine', .04, 2);
    (function f(now) {
      if (stop) return; if (now - t0 > dur) { end(); return; }
      g.fillStyle = light ? 'rgba(247,249,255,.16)' : 'rgba(10,15,36,.16)'; g.fillRect(0, 0, innerWidth, innerHeight);
      g.fillStyle = light ? '#0E8A5A' : '#4BE3A0'; g.font = fs + 'px ui-monospace, Menlo, monospace';
      for (let i = 0; i < cols; i++) { g.fillText(chars[(Math.random() * chars.length) | 0], i * fs, drops[i] * fs); drops[i] = drops[i] * fs > innerHeight && Math.random() > .975 ? 0 : drops[i] + (reduce ? .5 : 1); }
      requestAnimationFrame(f);
    })(t0);
  }

  /* ================= « htop » secret : FPS, nœuds, mémoire (touche F ou commande htop) ================= */
  let htopOn = false, htopFrames = 0, htopLast = 0, htopFps = 0, htopTimer = 0;
  const t0page = performance.now();
  function htopLoop(now) {
    if (!htopOn) return;
    htopFrames++;
    if (now - htopLast >= 500) { htopFps = Math.round(htopFrames * 1000 / (now - htopLast)); htopFrames = 0; htopLast = now; }
    requestAnimationFrame(htopLoop);
  }
  function htopDraw() {
    const dl = $('htopList'); dl.textContent = '';
    const H = t('htopL'), nf = new Intl.NumberFormat(t('locale'), { maximumFractionDigits: 1 });
    const up = Math.floor((performance.now() - t0page) / 1000), hh = String(Math.floor(up / 3600)).padStart(2, '0'), mm = String(Math.floor(up / 60) % 60).padStart(2, '0'), ss = String(up % 60).padStart(2, '0');
    const rows = [[H.fps, htopFps ? `${htopFps}` : '…', 'fps'], [H.nodes, String(nodes.length)], [H.packets, String(packets.length)]];
    if (performance.memory && performance.memory.usedJSHeapSize) rows.push([H.mem, `${nf.format(performance.memory.usedJSHeapSize / 1048576)} ${t('mb')}`]);
    rows.push([H.weight, `${nf.format(measure().kb)} ${t('kb')}`], [H.up, `${hh}:${mm}:${ss}`], [H.cpu, navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}` : '?']);
    for (const [k, v, kind] of rows) {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v;
      if (kind === 'fps') { dd.className = htopFps >= 50 ? 'ok' : htopFps >= 30 ? 'warn' : 'bad'; const bar = document.createElement('i'); bar.className = 'fbar'; bar.style.width = Math.min(100, (htopFps / 60) * 100) + '%'; dd.append(bar); }
      dl.append(dt, dd);
    }
  }
  function htop(force) {
    htopOn = force === undefined ? !htopOn : force;
    $('htop').hidden = !htopOn; clearInterval(htopTimer);
    if (htopOn) { htopFrames = 0; htopLast = performance.now(); requestAnimationFrame(htopLoop); htopDraw(); htopTimer = setInterval(htopDraw, 500); found('htop'); SND.key(); }
  }
  $('htopClose').addEventListener('click', () => htop(false));
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && htopOn) htop(false); });

  /* ================= Raccourcis clavier ================= */
  function openKeys() {
    const ul = $('keysList'); ul.textContent = '';
    const mod = document.getElementById('kbdMod') ? document.getElementById('kbdMod').textContent : 'Ctrl';
    for (const [combo, label] of t('keysList')) {
      const li = document.createElement('li'), k = document.createElement('span'); k.className = 'combo';
      combo.replace('MOD', mod).split(' ').forEach((part, i) => { if (i) k.append(' '); if (part === '/' || part === '+') { k.append(part); return; } const kb = document.createElement('kbd'); kb.textContent = part; k.append(kb); });
      const d = document.createElement('span'); d.textContent = label; li.append(k, d); ul.append(li);
    }
    closeTerm(); openPanel('keysPanel', 'keysClose'); found('keys');
  }
  $('keysBtn').addEventListener('click', openKeys);
  $('keysClose').addEventListener('click', closePanels);
  const anyPanelOpen = () => panels.some(p => $(p).classList.contains('open'));
  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target === input || menuOpen() || G.on) return;
    const tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    if (e.key === '?') { e.preventDefault(); anyPanelOpen() && $('keysPanel').classList.contains('open') ? closePanels() : openKeys(); return; }
    if (anyPanelOpen() || termOpen()) return;
    const k = e.key.toLowerCase();
    if (k === 't') { $('themeBtn').click(); }
    else if (k === 'l') { e.preventDefault(); openMenu(); }
    else if (k === 's') { $('sound').click(); }
    else if (k === 'j') { openGames(); }
    else if (k === 'c') { $('contactBtn').click(); }
    else if (k === 'f') { htop(); }
  });

  $('openGame').addEventListener('click', openGames);
  $('start').addEventListener('click', startGame);
  $('lvGo').addEventListener('click', beginLevel);
  $('again').addEventListener('click', startGame);
  $('cancel').addEventListener('click', closePanels);
  $('back').addEventListener('click', closePanels);
  $('quit').addEventListener('click', quitGame);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && G.on) G.last = performance.now(); });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(setup, 150); });

  /* Raccourci affiché selon l'appareil : ⌘ + K sur Mac, iPhone et iPad ; Ctrl + K ailleurs */
  (function showShortcut() {
    const ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
    const apple = /mac|iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    const k = document.getElementById('kbdMod');
    if (apple && k) { k.textContent = '⌘'; k.title = 'Cmd'; k.setAttribute('aria-label', 'Cmd'); }
  })();

  const safe = (name, fn) => { try { fn(); } catch (e) { if (window.console) console.warn('[jeremy-grosjean.fr] ' + name + ' :', e); } };
  safe('thème', applyTheme);
  safe('langue', applyLang);
  /* Puis trois petites tâches séparées, pour qu'aucune ne dépasse 50 ms sur un téléphone lent :
     1) l'heure (outils de date du navigateur), 2) l'affichage du contenu, masqué jusque-là pour éviter tout saut
     de mise en page, et l'animation du titre, 3) la date de dernière mise à jour du site */
  setTimeout(() => {
    booted = true; safe('heure', tick);
    setTimeout(() => {
      document.documentElement.dataset.ready = '1'; safe('accueil', startHero);
      setTimeout(() => safe('mise à jour', updLine), 0);
    }, 0);
  }, 0);
  safe('affichage', applyA11y);
  /* Temps de chargement réel, mesuré par le navigateur du visiteur */
  function showLoad() {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      const ms = nav && nav.loadEventEnd > 0 ? nav.loadEventEnd - nav.startTime : 0;
      if (!ms) return;
      const v = new Intl.NumberFormat(t('locale'), { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(ms / 1000);
      const el = $('loadT'); el.dataset.v = v; el.textContent = ' · ' + t('loadedIn')(v); el.hidden = false;
    } catch (e) {}
  }
  if (document.readyState === 'complete') setTimeout(showLoad, 0); else window.addEventListener('load', () => setTimeout(showLoad, 0));
  safe('installation', installUI);
  /* Visite guidée : proposée seulement à un vrai visiteur, 4 s après sa première action volontaire
     (clic, touche, molette, toucher, défilement). Pas de « pointermove » : le navigateur en envoie un tout seul au chargement. */
  (function () {
    const evts = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    const go = () => { evts.forEach(e => window.removeEventListener(e, go)); setTimeout(() => safe('visite', () => startTour(false)), 4000); };
    evts.forEach(e => window.addEventListener(e, go, { passive: true }));
  })();
  /* Hors ligne : une copie du site est gardée par le navigateur (réseau d'abord, copie seulement sans connexion) */
  safe('hors ligne', () => {
    if ('serviceWorker' in navigator && window.isSecureContext) {
      /* Trusted Types : une seule adresse de script autorisée, celle du service worker */
      let url = '/sw.js';
      if (window.trustedTypes && trustedTypes.createPolicy) {
        const pol = trustedTypes.createPolicy('jg', { createScriptURL: u => { if (u === '/sw.js') return u; throw new TypeError('adresse refusée'); } });
        url = pol.createScriptURL('/sw.js');
      }
      navigator.serviceWorker.register(url).catch(() => {});
    }
    if (!isOnline()) setTimeout(() => toast(t('netCached')), 1800);
  });
  setInterval(() => safe('heure', tick), 1000);
  /* L'animation démarre quand le navigateur donne la taille du canevas (ResizeObserver) : cette taille arrive
     après sa mise en page normale, au lieu d'être calculée de force pendant le script (« innerWidth ») */
  safe('animation', () => {
    if (!x) throw new Error('canvas indisponible');
    const go = (w, h) => safe('animation', () => { setup(w, h); requestAnimationFrame(frame); });
    if (window.ResizeObserver) { const ro = new ResizeObserver(es => { ro.disconnect(); const r = es[0].contentRect; go(r.width, r.height); }); ro.observe(c); }
    else requestAnimationFrame(() => go());
  });
})();
