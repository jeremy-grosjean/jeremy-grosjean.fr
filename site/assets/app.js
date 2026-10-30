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

  /* Le nom du domaine n'est jamais coupé au tiret (« jeremy- » / « grosjean.fr ») : il est gardé d'un seul bloc */
  function setText(el, v) {
    if (!v.includes('jeremy-grosjean.fr')) { el.textContent = v; return; }
    el.textContent = '';
    for (const part of v.split(/(jeremy-grosjean\.fr)/)) {
      if (part === 'jeremy-grosjean.fr') { const s = document.createElement('span'); s.className = 'nobr'; s.textContent = part; el.append(s); } else if (part) el.append(part);
    }
  }
  let NB_JEUX = 0;
  function applyLang() {
    document.documentElement.lang = t('htmlLang');
    document.title = t('title');
    document.querySelectorAll('[data-i]').forEach(el => { const v = t(el.dataset.i); if (typeof v === 'string') setText(el, v); });
    /* Nombre de mini-jeux compté dans la liste (le défi du jour et le niveau N2 du support ne comptent pas) : toujours à jour */
    { const n = document.querySelectorAll('#gamesPanel .pick:not(#pickDaily):not(#pickSupport2)').length;
      if (n && typeof t('playN') === 'function') { $('openGame').textContent = t('playN')(n); NB_JEUX = n; } }
    langUI();
    $('langLabel').textContent = t('langLabel');
    $('termClose').setAttribute('aria-label', t('close'));
    tick(); setSoundUI(); setThemeUI(); buildSecSoon(); heroLang(); netUI();
    if (typeof MAIL !== 'undefined') { $('openMail').href = mailHref(); webmailHrefs(); if (document.body.classList.contains('rec-on')) fillRec(); }
    { const el = $('loadT'); if (el.dataset && el.dataset.v) el.textContent = ' · ' + t('loadedIn')(el.dataset.v); }
    if (typeof htopOn !== 'undefined' && htopOn) htopDraw();
    updLine();
    try { lot14Lang(); } catch (e) {}
    try { lot16Lang(); } catch (e) {}
    try { fxUI(); } catch (e) {}
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
    P = { cyan: v('--cyan-rgb'), violet: v('--violet-rgb'), threat: v('--threat-rgb'), node: v('--node-rgb'), warn: v('--warn-rgb'), light: resolvedTheme() === 'light' && !document.documentElement.dataset.retro && !document.documentElement.dataset.contrast };
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
  /* Fluidité identique quel que soit l'écran (1 à 240 Hz et plus) : chaque mouvement est calculé selon le temps réellement écoulé.
     FR = durée de l'image / 1/60 s (1 à 60 Hz, 0,25 à 240 Hz…). Vitesse exacte jusqu'à 8 images/s ; en dessous (écran 1 à 7 Hz, appareil très lent),
     le jeu passe au ralenti au lieu de faire « sauter » les objets, ce qui le garde jouable */
  let FR = 1, lastFrame = 0;
  const decay = a => Math.pow(a, FR), ease = k => 1 - Math.pow(1 - k, FR);
  let W = 0, H = 0, dpr = 1, UIS = 1, nodes = [], packets = [], rings = [], trail = [], sparks = [], baseCount = 0;
  let pointer = null; const glow = { x: 0, y: 0, a: 0 };
  const LINK = () => Math.min(170, Math.max(120, W / 8));
  const FIELD = () => Math.min(220, Math.max(140, W / 6));
  const makeNode = (px, py) => {
    const a = Math.random() * Math.PI * 2, s = (.12 + Math.random() * .18) * DRIFT;
    return { x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s, bx: Math.cos(a) * s, by: Math.sin(a) * s, r: Math.random() < .14 ? 2.6 : 1.4, heat: 0, tx: null, ty: null };
  };
  function setup(w, h) {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    /* Très grands écrans (4K, téléviseurs) : le réseau et le jeu sont agrandis comme le texte (variable --ui-scale du CSS) */
    UIS = Math.max(1, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-scale')) || 1);
    const pw = w || window.innerWidth, ph = h || window.innerHeight;
    W = pw / UIS; H = ph / UIS;
    c.width = Math.round(pw * dpr); c.height = Math.round(ph * dpr);
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
  function konami() { morphJG(); SND.konami(); flashTitle(); toast(t('tKonami')); found('konami'); }
  function morphJG() {
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
  const panels = ['intro', 'levelPanel', 'over', 'secPanel', 'contactPanel', 'keysPanel', 'gamesPanel', 'supportPanel', 'panPanel', 'quizPanel', 'newsPanel', 'briefPanel', 'supPanel', 'phPanel', 'snPanel', 'scPanel', 'glossPanel', 'pausePanel', 'resumePanel', 'slotPanel', 'skillsPanel', 'sharePanel', 'faqPanel', 'itPanel', 'psPanel', 'rjPanel', 'clPanel', 'dyPanel', 'prPanel', 'rwPanel', 'rpPanel', 'niPanel', 'bdPanel'];
  function closePanels() { panels.forEach(p => $(p).classList.remove('open')); }
  /* La fenêtre s'ouvre toujours en haut de son contenu (sur un écran bas, le focus sur un bouton du bas la faisait défiler) */
  /* Fermer une fenêtre : clic sur le fond flou autour (même action que son bouton Fermer / Quitter), ou sur le ✕ en haut à droite.
     Un clic dans la fenêtre ne la ferme pas ; un glisser qui commence dans la fenêtre et finit dehors non plus. */
  const PANEL_CLOSE = { prPanel: 'prQuit', rwPanel: 'rwQuit', rpPanel: 'rpQuit', niPanel: 'niQuit', bdPanel: 'bdClose', slotPanel: 'slotClose', skillsPanel: 'skClose', sharePanel: 'shClose', faqPanel: 'faqClose', itPanel: 'itQuit', psPanel: 'psQuit', rjPanel: 'rjQuit', clPanel: 'clQuit', dyPanel: 'dyClose', intro: 'cancel', over: 'back', secPanel: 'secClose', contactPanel: 'contactClose', keysPanel: 'keysClose', gamesPanel: 'gamesClose',
    supportPanel: 'tkQuit', panPanel: 'pnQuit', quizPanel: 'qzQuit', newsPanel: 'newsClose', briefPanel: 'briefClose', supPanel: 'supClose',
    phPanel: 'phQuit', snPanel: 'snQuit', scPanel: 'scClose', glossPanel: 'glossClose', pausePanel: 'pzResume', resumePanel: 'rsBack' };
  let downOn = null;
  document.addEventListener('pointerdown', e => { downOn = e.target; }, true);
  document.addEventListener('click', e => {
    const p = e.target;
    if (!p.classList || !p.classList.contains('panel') || !p.classList.contains('open') || downOn !== p) return;
    const b = document.getElementById(PANEL_CLOSE[p.id] || ''); if (b) b.click(); else closePanels();
  });
  for (const [pid, bid] of Object.entries(PANEL_CLOSE)) {
    const card = document.querySelector('#' + pid + ' .card'); if (!card || pid === 'pausePanel') continue;
    const x = document.createElement('button'); x.type = 'button'; x.className = 'panel-x'; x.textContent = '×';
    x.addEventListener('click', () => { const b = document.getElementById(bid); if (b) b.click(); else closePanels(); });
    const wrap = document.createElement('div'); wrap.className = 'panel-x-wrap'; wrap.append(x); card.prepend(wrap);
  }
  function openPanel(id, focusId) {
    const x = document.querySelector('#' + id + ' .panel-x'); if (x) { x.setAttribute('aria-label', t('close')); x.title = t('close'); } closePanels(); if (!$('tourTip').hidden) endTour(); $(id).classList.add('open'); if (focusId) $(focusId).focus({ preventScroll: true }); const c = $(id).querySelector('.card'); if (c) c.scrollTop = 0; try { onPanelOpen(id); } catch (e) {} }
  /* Partie sauvegardée (dans ce navigateur uniquement) : à l'ouverture du jeu, on propose de la reprendre ou d'en commencer une nouvelle */
  const SAVE_KEY = 'jg-firewall-save';
  const readSave = () => { try { const s = JSON.parse(store.get(SAVE_KEY) || 'null'); return s && s.v === 1 && s.lv >= 0 && s.lv < LEVELS.length ? s : null; } catch (e) { return null; } };
  const dropSave = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} };
  const saveStats = s => `${t('level')} ${s.lv + 1}/${LEVELS.length} · ${t('score')} ${s.score} · ${t('breaches')} ${s.breach}/3` + (s.intro ? '' : ` · ${t('time')} ${Math.ceil(s.time)}`);
  function writeSave() {
    if (!G.on) return;
    const intro = $('levelPanel').classList.contains('open') || (paused() && G.pausedLevel);
    store.set(SAVE_KEY, JSON.stringify({ v: 1, lv: G.lv, score: G.score, breach: G.breach, load: G.load, time: G.time, spawnIn: G.spawnIn || 500, intro,
      items: intro ? [] : G.items.map(it => ({ x: it.x / W, y: it.y / H, sp: it.sp, kind: it.kind, wob: it.wob, r: it.r })) }));
  }
  function openIntro() {
    closeTerm();
    const s = readSave();
    if (s) { $('rsStats').textContent = saveStats(s); openPanel('resumePanel', 'rsResume'); return; }
    openPanel('intro', 'start');
  }
  function resumeSaved() {
    const s = readSave(); if (!s) { openPanel('intro', 'start'); return; }
    Object.assign(G, { on: true, active: false, lv: s.lv, score: s.score | 0, breach: s.breach | 0, load: s.load | 0, items: [], shake: 0, hit: 0 });
    closeTerm(); setPlaying(true);
    if (s.intro) { showLevel(s.lv); return; }
    G.items = (s.items || []).map(it => ({ x: it.x * W, y: it.y * H, sp: it.sp, kind: it.kind, wob: it.wob, r: it.r }));
    Object.assign(G, { time: Math.max(1, +s.time || LEVELS[s.lv].dur), spawnIn: +s.spawnIn || 500, last: performance.now(), active: true });
    hud(); pauseGame();
  }

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
  /* Pendant la partie, seul « Quitter » reste cliquable : l'accueil, la barre du haut et le pied de page sont mis hors d'atteinte (souris, doigt et clavier) */
  function setPlaying(on) {
    document.body.classList.toggle('playing', on);
    for (const el of document.querySelectorAll('main, .clock, .topbar, .dock, #term')) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }
  }
  function startGame() {
    dropSave();
    Object.assign(G, { on: true, active: false, lv: 0, score: 0, breach: 0, load: 0, items: [], shake: 0, hit: 0 });
    closeTerm(); setPlaying(true); showLevel(0);
  }
  function beginLevel() {
    closePanels();
    Object.assign(G, { active: true, time: LEVELS[G.lv].dur, spawnIn: 500, last: performance.now(), load: 0 });
    SND.level(); hud();
  }
  function endGame(reason) {
    dropSave();
    G.on = false; G.active = false; G.items = [];
    setPlaying(false); SND.end();
    const best = getBest(), record = G.score > best;
    if (record) store.set('jg-firewall-best', String(G.score));
    if (reason === 'win') found('win');
    $('overTitle').textContent = reason === 'down' ? t('down') : reason === 'win' ? t('win') : t('timeUp');
    $('finalScore').textContent = G.score;
    $('finalText').textContent = record && G.score > 0 ? t('newRecord') : t('record')(Math.max(best, G.score));
    openPanel('over', 'again');
  }
  function quitGame() { dropSave(); G.on = false; G.active = false; G.items = []; setPlaying(false); closePanels(); }
  function saveAndQuit() { writeSave(); G.on = false; G.active = false; G.items = []; setPlaying(false); closePanels(); toast(t('tSaved'), 3500); }
  /* Pause : le temps s'arrête, on reprend exactement là où on en était ; quitter se fait depuis la pause (plus de partie perdue par erreur) */
  const paused = () => $('pausePanel').classList.contains('open');
  function pauseGame() {
    if (!G.on || paused()) return;
    G.pausedLevel = $('levelPanel').classList.contains('open'); G.wasActive = G.active; G.active = false;
    $('pzStats').textContent = saveStats({ lv: G.lv, score: G.score, breach: G.breach, time: G.time, intro: G.pausedLevel });
    openPanel('pausePanel', 'pzResume');
  }
  function resumeGame() {
    if (!G.on) return;
    closePanels();
    if (G.pausedLevel) { openPanel('levelPanel', 'lvGo'); return; }
    if (G.wasActive) { G.active = true; G.last = performance.now(); }
  }
  const togglePause = () => { if (paused()) resumeGame(); else pauseGame(); };

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
    const dt = Math.min(120, Math.max(0, now - G.last)); G.last = now; const gf = dt / 16.667;
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
      it.wob += .08 * gf;
      const w = Math.sin(it.wob) * .6, st = it.sp * gf;
      it.x += (dx / d) * st + (-dy / d) * w * gf; it.y += (dy / d) * st + (dx / d) * w * gf;
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
    const S = server(); G.hit *= decay(.92);
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
  /* Qualité adaptative : si l'appareil n'arrive pas à suivre (moins de 30 images/s pendant 3 s), le réseau de fond est allégé */
  let slowMs = 0, avgMs = 16.7;
  function frame(now) {
    const dt = lastFrame ? now - lastFrame : 16.7; lastFrame = now;
    FR = Math.min(7.2, Math.max(.05, dt / 16.667));
    if (dt < 1000) avgMs += (dt - avgMs) * .05;
    if (avgMs > 34 && !G.on && !morph.on && !document.hidden) { slowMs += dt; if (slowMs > 3000 && nodes.length > 28) { nodes.splice(Math.round(nodes.length * .8)); baseCount = nodes.length; slowMs = 0; avgMs = 22; } } else slowMs = 0;
    /* Vue recruteur ouverte (elle couvre tout l'écran) : rien à dessiner, on économise le processeur et la batterie */
    if (document.body.classList.contains('rec-on')) { requestAnimationFrame(frame); return; }
    try { drawFrame(now); } catch (e) { if (window.console) console.warn('[jeremy-grosjean.fr] rendu :', e); }
    requestAnimationFrame(frame);
  }
  function drawFrame(now) {
    if (G.on && G.active) updateGame(now);
    if (morph.on && now > morph.until) endMorph();
    let ox = 0, oy = 0;
    if (G.shake > .3) { ox = (Math.random() - .5) * G.shake; oy = (Math.random() - .5) * G.shake; G.shake *= decay(.86); }
    const k2 = dpr * UIS; x.setTransform(k2, 0, 0, k2, ox * k2, oy * k2);
    x.clearRect(-20, -20, W + 40, H + 40);
    const L = LINK(), F = FIELD(), K = P.k;

    const eG = ease(.18), eA = ease(.08), eM = ease(.08), eB = ease(.04), dH = decay(.965);
    if (pointer) { glow.x += (pointer.x - glow.x) * eG; glow.y += (pointer.y - glow.y) * eG; glow.a += (1 - glow.a) * eA; } else glow.a *= decay(.94);

    for (const p of nodes) {
      if (morph.on && p.tx !== null) {
        p.x += (p.tx - p.x) * eM; p.y += (p.ty - p.y) * eM; p.heat = Math.max(p.heat, .55); continue;
      }
      if (pointer && !G.on) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy) || 1;
        if (d < F) { const f = (1 - d / F) * .9 * FR; p.vx += (dx / d) * f * .35 + (-dy / d) * f * .18; p.vy += (dy / d) * f * .35 + (dx / d) * f * .18; p.heat = Math.max(p.heat, 1 - d / F); }
      }
      for (const r of rings) {
        const dx = p.x - r.x, dy = p.y - r.y, d = Math.hypot(dx, dy) || 1;
        if (Math.abs(d - r.r) < 26 + 7 * FR) { p.vx += (dx / d) * 1.6 * r.life * FR; p.vy += (dy / d) * 1.6 * r.life * FR; p.heat = 1; }
      }
      p.vx += (p.bx - p.vx) * eB; p.vy += (p.by - p.vy) * eB;
      p.x += p.vx * FR; p.y += p.vy * FR;
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      p.heat *= dH;
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
    const dT = decay(.92); for (const tr of trail) tr.life *= dT;
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
      r.r += (7 + r.r * .02) * FR; r.life *= decay(.955);
      x.strokeStyle = `rgba(${col},${r.life * .8})`; x.lineWidth = 2 * r.life + .5;
      x.beginPath(); x.arc(r.x, r.y, r.r, 0, Math.PI * 2); x.stroke();
      if (!r.col) { x.strokeStyle = `rgba(${P.violet},${r.life * .45})`; x.lineWidth = 1; x.beginPath(); x.arc(r.x, r.y, r.r * .72, 0, Math.PI * 2); x.stroke(); }
      if (r.life < .03) rings.splice(k, 1);
    }
    if (!G.on && !reduce && !morph.on && packets.length < 16 && Math.random() < 1 - decay(.93)) sendPacket(nodes[(Math.random() * nodes.length) | 0], Math.random() < .8 ? 'c' : 'v');
    for (let k = packets.length - 1; k >= 0; k--) {
      const q = packets[k];
      q.t += .02 * FR;
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
      s.x += s.vx * FR; s.y += s.vy * FR; s.vx *= decay(.93); s.vy *= decay(.93); s.life *= decay(.9);
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
    /* Animation du journal jouée une seule fois : sans cela, quand le téléphone passe à l'horizontale (journal masqué)
       puis revient à la verticale, le navigateur rejoue l'animation et le cadre reste vide 5 secondes */
    setTimeout(() => bootUl.classList.add('static'), 5500);
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
  function mailHref() { return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(coSubject(t('mailSubject'))) + '&body=' + encodeURIComponent(coBody(t('mailBody'))); }
  /* Webmails : brouillon déjà rempli dans le compte du visiteur (simples liens, aucune donnée ne passe par ce site) */
  function webmailHrefs() {
    const q = encodeURIComponent, to = q(MAIL), su = q(coSubject(t('mailSubject'))), bo = q(coBody(t('mailBody')));
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
    glossify(secUl); buildEco();
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
  const COMMANDS = ['help', 'boot', 'legal', 'device', 'neofetch', 'secrets', 'htop', 'support', 'status', 'dig', 'ipcalc', 'install', 'tour', 'matrix', 'whoami', 'about', 'security', 'ping', 'date', 'lang', 'theme', 'play', 'konami', 'contact', 'cv', 'projets', 'panne', 'quiz', 'changelog', 'print', 'a11y', 'curl', 'whois', 'traceroute', 'phish', 'subnet', 'scores', 'glossaire', 'define', 'report', 'lien', 'rdv', 'competences', 'faq', 'partager', 'priorite', 'powershell', 'rj45', 'appel', 'defi', 'poste', 'rancon', 'reponse', 'badges', 'clear', 'exit'];
  const ALIAS = { aide: 'help', top: 'htop', fps: 'htop', ticket: 'support', tickets: 'support', supervision: 'status', nslookup: 'dig', host: 'dig', installer: 'install', visite: 'tour', appareil: 'device', sysinfo: 'device', fastfetch: 'neofetch', secret: 'secrets', mentions: 'legal', legales: 'legal', 'légales': 'legal', privacy: 'legal', demarrage: 'boot', 'démarrage': 'boot', journal: 'boot', dmesg: 'boot', apropos: 'about', 'à-propos': 'about', securite: 'security', 'sécurité': 'security', jouer: 'play', effacer: 'clear', cls: 'clear', quitter: 'exit', quit: 'exit', langue: 'lang', theme: 'theme', 'thème': 'theme', ls: 'help', man: 'help', recruteur: 'cv', recruiter: 'cv', resume: 'cv', imprimer: 'print', pdf: 'print', accessibilite: 'a11y', 'accessibilité': 'a11y', accessibility: 'a11y', mail: 'contact', email: 'contact', 'rétro': 'retro', crt: 'retro', phosphore: 'retro', vt100: 'retro', diagnostic: 'panne', depannage: 'panne', 'dépannage': 'panne', fault: 'panne', ad: 'quiz', gpo: 'quiz', news: 'changelog', nouveautes: 'changelog', 'nouveautés': 'changelog', quoideneuf: 'changelog', tracert: 'traceroute', phishing: 'phish', hameconnage: 'phish', 'hameçonnage': 'phish', 'sous-reseaux': 'subnet', 'sous-réseaux': 'subnet', subnets: 'subnet', sousreseau: 'subnet', score: 'scores', records: 'scores', glossary: 'glossaire', lexique: 'glossaire', jargon: 'glossaire', def: 'define', definition: 'define', 'définition': 'define', rapport: 'report', link: 'lien', meeting: 'rdv', rendezvous: 'rdv', 'rendez-vous': 'rdv', entretien: 'rdv', interview: 'rdv', creneau: 'rdv', 'créneau': 'rdv', 'compétences': 'competences', skills: 'competences', titre: 'competences', tai: 'competences', share: 'partager', partage: 'partager', priority: 'priorite', 'priorité': 'priorite', itil: 'priorite', ps: 'powershell', pwsh: 'powershell', cable: 'rj45', 'câble': 'rj45', sertir: 'rj45', call: 'appel', telephone: 'appel', 'téléphone': 'appel', daily: 'defi', 'défi': 'defi', challenge: 'defi', questions: 'faq', setup: 'poste', deploiement: 'poste', 'déploiement': 'poste', ransom: 'rancon', 'rançon': 'rancon', ransomware: 'rancon', rancongiciel: 'rancon', 'rançongiciel': 'rancon', reply: 'reponse', 'réponse': 'reponse', repondre: 'reponse', 'répondre': 'reponse', succes: 'badges', 'succès': 'badges', badge: 'badges', achievements: 'badges' };
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
      case 'curl': curlI(args); break;
      case 'whois': whois(); break;
      case 'traceroute': traceroute(); break;
      case 'phish': line(t('tGame'), 'g'); setTimeout(openPhish, 350); break;
      case 'subnet': line(t('tGame'), 'g'); setTimeout(openSubnet, 350); break;
      case 'scores': closeTerm(); setTimeout(openScores, 150); break;
      case 'glossaire': closeTerm(); setTimeout(openGloss, 150); break;
      case 'define': define(args.join(' ')); break;
      case 'report': line(t('tReport'), 'g'); setTimeout(printRep, 300); break;
      case 'clear': out.textContent = ''; break;
      case 'exit': closeTerm(); break;
      case 'sudo': line(t('tSudo'), 'r'); found('sudo'); break;
      case 'competences': closeTerm(); setTimeout(openSkills, 150); break;
      case 'faq': closeTerm(); setTimeout(openFaq, 150); break;
      case 'rdv': closeTerm(); setTimeout(openSlots, 150); break;
      case 'partager': closeTerm(); setTimeout(openShare, 150); break;
      case 'priorite': line(t('tGame'), 'g'); setTimeout(openItil, 350); break;
      case 'powershell': line(t('tGame'), 'g'); setTimeout(openPs, 350); break;
      case 'rj45': line(t('tGame'), 'g'); setTimeout(openRj, 350); break;
      case 'appel': line(t('tGame'), 'g'); setTimeout(openCall, 350); break;
      case 'defi': closeTerm(); setTimeout(openDaily, 150); break;
      case 'poste': line(t('tGame'), 'g'); setTimeout(openPrep, 350); break;
      case 'rancon': line(t('tGame'), 'g'); setTimeout(openRansom, 350); break;
      case 'reponse': line(t('tGame'), 'g'); setTimeout(openReply, 350); break;
      case 'badges': closeTerm(); setTimeout(openBadges, 150); break;
      case 'lien': {
        const u = personalLink(args.join(' ').replace(/[^\p{L}\p{N} &'’.,()\-]/gu, ''));
        if (!u) { line(t('tLinkUsage'), 'd'); break; }
        const d = line(t('tLinkDone') + ' '), link = document.createElement('a'); link.href = u; link.textContent = u; d.append(link);
        copyText(u); break;
      }
      case 'projets': case 'projects': line(t('tSoon'), 'd'); break;
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
  /* Coordonnées du pointeur dans le repère du réseau (divisées par l'agrandissement des très grands écrans) */
  const px = e => e.clientX / UIS, py = e => e.clientY / UIS;
  function onMove(e) {
    if (soundOn && !G.on && pointer && !menuOpen() && !isUI(e.target)) {
      const now = performance.now(), d = Math.hypot(px(e) - pointer.x, py(e) - pointer.y);
      if (d > 14 && now - lastMoveSound > 110) { lastMoveSound = now; SND.move(px(e), py(e)); }
    }
    pointer = { x: px(e), y: py(e) };
    trail.push({ x: px(e), y: py(e), life: 1 });
    if (trail.length > 28) trail.shift();
    if (!G.on && !reduce) stack.style.transform = `translate3d(${(px(e) / W - .5) * -14}px, ${(py(e) / H - .5) * -10}px, 0)`;
  }
  function onLeave() { pointer = null; if (!G.on) stack.style.transform = ''; }
  const isUI = el => el.closest && el.closest('button, a, input, select, label, .panel, .term, .topbar, .dock');
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', e => {
    if (isUI(e.target)) return;
    onMove(e);
    if (G.on) gameTap(px(e), py(e), e.pointerType !== 'mouse'); else burst(px(e), py(e));
  }, { passive: true });
  window.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') onLeave(); }, { passive: true });
  window.addEventListener('pointercancel', onLeave, { passive: true });
  document.addEventListener('mouseleave', onLeave);

  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let kIdx = 0;
  window.addEventListener('keydown', e => {
    const typing = e.target === input || menuOpen();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (!G.on) termOpen() ? closeTerm() : openTerm(); return; }
    if (!typing && !G.on && (e.code === 'Backquote' || e.key === '²' || e.key === '`')) { e.preventDefault(); termOpen() ? closeTerm() : openTerm(); return; }
    if (G.on && !typing && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); togglePause(); return; }
    if (e.key === 'Escape') { if (termOpen()) closeTerm(); else if (G.on) togglePause(); else if (recOn() && !document.querySelector('.panel.open')) closeRec(); else closePanels(); return; }
    if (typing) return;
    const k = e.key.toLowerCase();
    if (k === KONAMI[kIdx]) { kIdx++; if (kIdx === KONAMI.length) { kIdx = 0; if (!G.on) konami(); } }
    else kIdx = k === KONAMI[0] ? 1 : 0;
  });

  /* ================= Fiche « En 30 secondes » ================= */
  function openBrief() {
    const dl = $('briefList'); dl.textContent = '';
    for (const [k, v] of t('brief')) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
    glossify(dl); closeTerm(); openPanel('briefPanel', 'briefContact');
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
    glossify(dl); glossify(ul); try { fillRecSkills(); } catch (e) {}
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
    const d = document.createElement('span'); d.className = 'upd-date'; d.textContent = ' · ' + t('updatedOn')(fmtDate(st.checked, false));
    el.replaceChildren(d); el.hidden = false;
    /* Numéro de la version en ligne (écrit par publier.sh), lien vers le code correspondant sur GitHub */
    const V = window.JG_VERSION;
    if (V && /^v\d{4}\.\d{2}\.\d{2}\.\d+$/.test(V.v) && /^https:\/\/github\.com\//.test(V.url)) {
      const a = document.createElement('a'); a.className = 'legal-link ver-link'; a.href = V.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = V.v; a.title = t('verTitle');
      const sp = document.createElement('span'); sp.className = 'upd-sep'; sp.textContent = ' · '; el.append(sp, a);
    }
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
    if ('mtasts' in st) rows.push([S.mtasts || 'MTA-STS', /v=STSv1/i.test(st.mtasts || '') ? 'OK' : '?', /v=STSv1/i.test(st.mtasts || '') ? 'ok' : 'warn']);
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
    else if (name === '_mta-sts.' + dom && st.mtasts) out1(name, 'TXT', `"${st.mtasts}"`);
    else line(t('digOnly'), 'd');
  }

  /* ================= Jeu « Repère l'hameçonnage » : e-mails inventés, indices révélés après la réponse ================= */
  function markup(el, s) {
    el.textContent = '';
    for (const part of String(s).split(/(\[\[[^\]]*\]\])/)) {
      if (!part) continue;
      if (part.startsWith('[[')) { const sp = document.createElement('span'); sp.className = 'ph-sus'; sp.textContent = part.slice(2, -2); el.append(sp); }
      else el.append(part);
    }
  }
  const sp = () => /^(zh|yue)/.test(lang) ? '' : ' ';
  const PH = { list: [], i: 0, score: 0, ok: 0, answered: false, done: false };
  function openPhish() {
    closeTerm(); PH.done = false; PH.i = 0; PH.score = 0; PH.ok = 0;
    PH.list = shuffle(t('phMails').map((x, k) => k));
    phShow(); openPanel('phPanel', null); SND.level();
  }
  function phShow() {
    const m = t('phMails')[PH.list[PH.i]]; PH.answered = false;
    $('phTag').textContent = t('phTag')(PH.i + 1, PH.list.length); $('phScore').textContent = t('phPts')(PH.score);
    $('phTitle').textContent = t('phQ'); $('phMail').hidden = false; $('phMail').classList.remove('reveal'); $('phSub').hidden = true;
    markup($('phFrom'), m.n + ' <' + m.a + '>'); markup($('phSubj'), m.s); markup($('phBody'), m.b);
    $('phOpts').hidden = false;
    for (const id of ['phSafeBtn', 'phPhishBtn']) { const b = $(id); b.disabled = false; b.classList.remove('good', 'bad'); }
    $('phExpl').hidden = true; $('phNext').hidden = true;
    setTimeout(() => $('phSafeBtn').focus(), 30);
  }
  function phAnswer(saysPhish) {
    if (PH.answered || PH.done) return; PH.answered = true;
    const m = t('phMails')[PH.list[PH.i]], good = saysPhish === m.p;
    const mine = $(saysPhish ? 'phPhishBtn' : 'phSafeBtn'), right = $(m.p ? 'phPhishBtn' : 'phSafeBtn');
    right.classList.add('good'); if (!good) mine.classList.add('bad');
    $('phSafeBtn').disabled = true; $('phPhishBtn').disabled = true;
    if (good) { PH.score += 10; PH.ok++; SND.block(); } else SND.wrong();
    $('phMail').classList.add('reveal');
    const ex = $('phExpl'); ex.hidden = false; ex.className = 'tk-expl ' + (good ? 'ok' : 'ko');
    ex.textContent = (good ? t('phGood') : t('phBad')) + sp() + (m.p ? t('phIsPhish') : t('phIsSafe')) + sp() + m.x;
    $('phScore').textContent = t('phPts')(PH.score);
    const nx = $('phNext'); nx.hidden = false; nx.textContent = PH.i < PH.list.length - 1 ? t('phNext') : t('phEnd'); nx.focus();
  }
  $('phSafeBtn').addEventListener('click', () => phAnswer(false));
  $('phPhishBtn').addEventListener('click', () => phAnswer(true));
  $('phNext').addEventListener('click', () => {
    if (PH.done) { openPhish(); return; }
    if (PH.i < PH.list.length - 1) { PH.i++; phShow(); return; }
    const n = PH.list.length, best = Math.max(+store.get('jg-phish-best') || 0, PH.score); store.set('jg-phish-best', String(best));
    $('phTag').textContent = t('phDoneTag'); $('phTitle').textContent = t('phDoneTitle')(PH.ok, n);
    $('phMail').hidden = true; $('phOpts').hidden = true; $('phExpl').hidden = true;
    const sub = $('phSub'); sub.textContent = t('phDoneMsg')(PH.ok, n) + sp() + t('pnBest')(best); sub.hidden = false;
    PH.done = true; const nx = $('phNext'); nx.hidden = false; nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('phQuit').addEventListener('click', closePanels);

  /* ================= Jeu « Sous-réseaux express » : calculs faits ici, contre la montre ================= */
  const SN = { list: [], i: 0, score: 0, ok: 0, answered: false, done: false, iv: 0, end: 0 };
  const SN_ROUND = 10, SN_TIME = 20;
  const ipq = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const maskOf = c => c <= 0 ? 0 : (0xFFFFFFFF << (32 - c)) >>> 0;
  function snMake(k) {
    const cidr = k < 3 ? 24 : k < 6 ? rnd(25, 27) : rnd(20, 30);
    const base = [() => ((192 << 24) | (168 << 16) | (rnd(0, 254) << 8)) >>> 0, () => ((10 << 24) | (rnd(0, 255) << 16) | (rnd(0, 255) << 8)) >>> 0, () => ((172 << 24) | (rnd(16, 31) << 16) | (rnd(0, 255) << 8)) >>> 0][rnd(0, 2)]();
    let ip = (base | rnd(1, 254)) >>> 0;
    const mask = maskOf(cidr), size = Math.pow(2, 32 - cidr), net = (ip & mask) >>> 0, bc = net + size - 1;
    if (ip === net) ip++; if (ip === bc) ip--;
    const types = k < 3 ? ['net', 'bc', 'hosts'] : ['net', 'bc', 'hosts', 'mask', 'first', 'last'];
    const type = types[rnd(0, types.length - 1)], nf = new Intl.NumberFormat(t('locale'));
    const ok32 = v => v >= 0 && v <= 0xFFFFFFFF;
    let cand;
    if (type === 'net') cand = [net, net + size, net - size, (ip & 0xFFFFFF00) >>> 0, net + size / 2, ip].filter(ok32).map(ipq);
    else if (type === 'bc') cand = [bc, bc - 1, bc + size, net - 1, bc - size, bc - size / 2].filter(ok32).map(ipq);
    else if (type === 'first') cand = [net + 1, net, net + 2, bc - 1, net + size + 1].filter(ok32).map(ipq);
    else if (type === 'last') cand = [bc - 1, bc, bc - 2, bc + 1, net + 1].filter(ok32).map(ipq);
    else if (type === 'hosts') cand = [size - 2, size, size - 1, size * 2 - 2, size / 2 - 2].filter(v => v > 0).map(v => nf.format(v));
    else cand = [cidr, cidr - 1, cidr + 1, cidr - 2, cidr + 2].filter(c => c >= 8 && c <= 32).map(c => ipq(maskOf(c)));
    const opts = [...new Set(cand)].slice(0, 4);
    return { ip: ipq(ip) + '/' + cidr, type, opts, order: shuffle(opts.map((x, j) => j)), expl: [ipq(net), ipq(bc), cidr, nf.format(size - 2), nf.format(size)] };
  }
  function snStop() { clearInterval(SN.iv); SN.iv = 0; }
  function openSubnet() {
    closeTerm(); snStop(); SN.done = false; SN.i = 0; SN.score = 0; SN.ok = 0;
    SN.list = Array.from({ length: SN_ROUND }, (x, k) => snMake(k));
    snShow(); openPanel('snPanel', null); SND.level();
  }
  function snShow() {
    const q = SN.list[SN.i]; SN.answered = false;
    $('snTag').textContent = t('snTag')(SN.i + 1, SN.list.length); $('snScore').textContent = t('snPts')(SN.score);
    $('snIp').hidden = false; $('snIp').textContent = q.ip; $('snQ').textContent = t('snQ')[q.type]; $('snSub').hidden = true; $('snTimer').hidden = false;
    const box = $('snOpts'); box.textContent = ''; box.hidden = false;
    q.order.forEach(j => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tk-opt'; b.textContent = q.opts[j]; b.dataset.j = j; b.addEventListener('click', () => snAnswer(j, b)); box.append(b); });
    $('snExpl').hidden = true; $('snNext').hidden = true;
    SN.end = performance.now() + SN_TIME * 1000; snBar(1); snStop();
    SN.iv = setInterval(() => {
      if (!$('snPanel').classList.contains('open')) { snStop(); return; }
      const left = Math.max(0, (SN.end - performance.now()) / 1000); snBar(left / SN_TIME);
      if (left <= 0) snAnswer(-1, null);
    }, 100);
    setTimeout(() => { const f = box.querySelector('button'); if (f) f.focus(); }, 30);
  }
  function snBar(r) { const p = Math.round(r * 100); $('snBar').style.width = p + '%'; $('snBar').className = r < .25 ? 'bad' : r < .5 ? 'warn' : ''; $('snTimer').setAttribute('aria-valuenow', String(p)); }
  function snAnswer(j, btn) {
    if (SN.answered) return; SN.answered = true; snStop();
    const q = SN.list[SN.i], good = j === 0, left = Math.max(0, (SN.end - performance.now()) / 1000);
    $('snOpts').querySelectorAll('button').forEach(b => { b.disabled = true; if (b.dataset.j === '0') b.classList.add('good'); });
    if (btn && !good) btn.classList.add('bad');
    if (good) { SN.ok++; SN.score += 10 + Math.round(left / 2); SND.block(); } else SND.wrong();
    const ex = $('snExpl'); ex.hidden = false; ex.className = 'tk-expl ' + (good ? 'ok' : 'ko');
    ex.textContent = (good ? t('snGood') : j < 0 ? t('snTimeout') : t('snBad')) + sp() + t('snExpl')(...q.expl);
    $('snScore').textContent = t('snPts')(SN.score);
    const nx = $('snNext'); nx.hidden = false; nx.textContent = SN.i < SN.list.length - 1 ? t('snNext') : t('snEnd'); nx.focus();
  }
  $('snNext').addEventListener('click', () => {
    if (SN.done) { openSubnet(); return; }
    if (SN.i < SN.list.length - 1) { SN.i++; snShow(); return; }
    const n = SN.list.length, best = Math.max(+store.get('jg-subnet-best') || 0, SN.score); store.set('jg-subnet-best', String(best));
    $('snTag').textContent = t('snDoneTag'); $('snQ').textContent = t('snDoneTitle')(SN.ok, n);
    $('snIp').hidden = true; $('snTimer').hidden = true; $('snOpts').hidden = true; $('snExpl').hidden = true;
    const sub = $('snSub'); sub.textContent = t('snDoneMsg')(SN.score) + sp() + t('pnBest')(best); sub.hidden = false;
    SN.done = true; const nx = $('snNext'); nx.hidden = false; nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('snQuit').addEventListener('click', () => { snStop(); closePanels(); });

  /* ================= Tableau des meilleurs scores (gardés dans ce navigateur uniquement) ================= */
  function openScores() {
    const ul = $('scList'); ul.textContent = '';
    const rows = [['pickServerT', 'jg-firewall-best', 0], ['pickSupportT', 'jg-support-best', 50], ['pickSupport2T', 'jg-support2-best', 50], ['pickPanneT', 'jg-panne-best', PN_ROUND * 100], ['pickQuizT', 'jg-quiz-best', QZ_ROUND * 10], ['pickPhishT', 'jg-phish-best', 60], ['pickSubnetT', 'jg-subnet-best', 0], ['pickItilT', 'jg-itil-best', 160], ['pickPsT', 'jg-ps-best', 80], ['pickRjT', 'jg-rj45-best', 200], ['pickCallT', 'jg-call-best', 16], ['pickPrepT', 'jg-prep-best', 80], ['pickRansomT', 'jg-ransom-best', 100], ['pickReplyT', 'jg-reply-best', 80], ['pickNoNetT', 'jg-noint-best', NI_ROUND * NI_PTS]];
    const nf = new Intl.NumberFormat(t('locale'));
    const add = (k, v, none) => { const li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('b'); a.textContent = k; b.textContent = v; if (none) b.className = 'none'; li.append(a, b); ul.append(li); };
    for (const [name, key, max] of rows) { const raw = store.get(key); add(t(name), raw === null || raw === undefined || raw === '' ? t('scNone') : nf.format(+raw) + (max ? '/' + nf.format(max) : ''), raw === null || raw === undefined || raw === ''); }
    add(t('scSecrets'), foundSet().length + '/' + SECRETS.length, false);
    closeTerm(); openPanel('scPanel', 'scClose');
  }
  $('scoresBtn').addEventListener('click', openScores);
  $('scPlay').addEventListener('click', openGames);
  $('scClose').addEventListener('click', closePanels);
  $('pickPhish').addEventListener('click', () => openPhish());
  $('pickSubnet').addEventListener('click', () => openSubnet());

  /* ================= Glossaire : les mots techniques soulignés donnent leur définition au toucher ================= */
  function glossEntries() { const g = t('gloss'); return Array.isArray(g) ? g : []; }
  function glossRegex() {
    const pats = [];
    glossEntries().forEach(([term, , al], i) => {
      for (const p of [term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ \\\/ | \/ /g, '\\s*/\\s*'), ...(al || [])]) pats.push({ p, i });
    });
    pats.sort((a, b) => b.p.length - a.p.length);
    return pats.map(({ p, i }) => {
      const latin = /^[\x20-\x7E\u00C0-\u017F\u2019]+$/.test(p), caps = /^[A-Z0-9-]+$/.test(p);
      return { re: new RegExp((latin ? '(?<![A-Za-z0-9\u00C0-\u017F])' : '') + '(' + p + ')' + (latin ? '(?![A-Za-z0-9\u00C0-\u017F])' : ''), caps ? 'u' : 'iu'), i };
    });
  }
  var glossCache = null;
  function glossify(root) {
    if (!root) return;
    try {
      if (!glossCache || glossCache.lang !== lang) glossCache = { lang, list: glossRegex() };
      const done = new Set(), walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentNode.closest('.gl-t, button, a') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      for (let node of nodes) {
        let guard = 0;
        while (node && guard++ < 12) {
          let best = null;
          for (const g of glossCache.list) { if (done.has(g.i)) continue; const m = g.re.exec(node.data); if (m && (!best || m.index < best.m.index || (m.index === best.m.index && m[1].length > best.m[1].length))) best = { m, g }; }
          if (!best) break;
          done.add(best.g.i);
          const rest = node.splitText(best.m.index), after = rest.splitText(best.m[1].length);
          const b = document.createElement('button'); b.type = 'button'; b.className = 'gl-t'; b.dataset.g = best.g.i; b.textContent = rest.data;
          b.setAttribute('aria-describedby', 'glTip'); rest.replaceWith(b); node = after;
        }
      }
    } catch (e) {}
  }
  let tipFor = null, tipAt = 0;
  function hideTip() { $('glTip').hidden = true; if (tipFor) tipFor.setAttribute('aria-expanded', 'false'); tipFor = null; }
  function showTip(btn) {
    const e = glossEntries()[+btn.dataset.g]; if (!e) return;
    if (tipFor === btn) { hideTip(); return; }
    hideTip(); tipFor = btn; tipAt = performance.now(); btn.setAttribute('aria-expanded', 'true');
    const tip = $('glTip'); $('glTipT').textContent = e[0]; $('glTipD').textContent = e[1]; tip.hidden = false;
    const r = btn.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
    const top = r.bottom + 8 + h > innerHeight - 8 ? Math.max(8, r.top - h - 8) : r.bottom + 8;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.gl-t');
    if (b) { e.preventDefault(); showTip(b); return; }
    if (!(e.target.closest && e.target.closest('#glTip'))) hideTip();
  });
  window.addEventListener('scroll', () => { if (performance.now() - tipAt > 400) hideTip(); }, { passive: true, capture: true });
  window.addEventListener('resize', hideTip, { passive: true });
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('glTip').hidden) { hideTip(); e.stopImmediatePropagation(); } }, true);
  function openGloss() {
    hideTip();
    const dl = $('glossList'); dl.textContent = '';
    for (const [term, def] of glossEntries()) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = term; dd.textContent = def; dl.append(dt, dd); }
    closeTerm(); openPanel('glossPanel', null); $('glossClose').focus({ preventScroll: true }); $('glossPanel').querySelector('.card').scrollTop = 0;
  }
  $('glTipMore').addEventListener('click', openGloss);
  $('glossBtn').addEventListener('click', openGloss);
  $('glossClose').addEventListener('click', closePanels);
  if (['#glossaire', '#glossary'].includes(location.hash)) setTimeout(openGloss, 0);
  function define(word) {
    if (!word) { line(t('tDefineUsage'), 'r'); return; }
    const w = word.toLowerCase(), list = glossEntries();
    const hit = list.find(([term, , al]) => term.toLowerCase() === w || term.toLowerCase().split(/\s*\/\s*|\s+/).includes(w) || (al || []).some(a => new RegExp('^(' + a + ')$', 'i').test(word)));
    if (hit) { line(hit[0], 'c'); line('  ' + hit[1]); } else line(t('tDefineNone')(word), 'r');
  }

  /* ================= Rapport de sécurité imprimable (ou en PDF) ================= */
  function fillRep() {
    const st = ST(), body = $('repBody'); body.textContent = '';
    $('repTitle').textContent = t('repTitle') + ' · jeremy-grosjean.fr';
    $('repSub').textContent = st && st.checked ? t('repSub')(fmtDate(st.checked, true)) : t('repNow')(fmtDate(new Date().toISOString(), true));
    const section = (title, rows) => {
      if (!rows.length) return;
      const h = document.createElement('h3'), tb = document.createElement('table'); h.textContent = title;
      for (const [k, v, c] of rows) { const tr = document.createElement('tr'), a = document.createElement('td'), b = document.createElement('td'); a.textContent = k; b.textContent = v; if (c) b.className = c; tr.append(a, b); tb.append(tr); }
      body.append(h, tb);
    };
    section(t('repExt'), EXT.map(([n, g]) => [n, g, 'ok']));
    section(t('repProt'), t('sec').map(([n, d]) => [n + ' — ' + d, '✓', 'ok']));
    section(t('repPub'), supRows() || []);
    const hd = st && st.hdrs && Array.isArray(st.hdrs.h) ? st.hdrs.h : [];
    section(t('repHdr'), hd.map(([k, v]) => [k, v.length > 90 ? v.slice(0, 88) + '…' : v, 'mono']));
    $('repFoot').textContent = t('repFoot');
  }
  function printRep() {
    fillRep(); document.body.classList.add('rep-print');
    const off = () => { document.body.classList.remove('rep-print'); window.removeEventListener('afterprint', off); };
    window.addEventListener('afterprint', off);
    setTimeout(() => { window.print(); setTimeout(off, 1500); }, 60);
  }
  $('secReport').addEventListener('click', printRep);

  /* ================= Terminal : curl -I, whois, traceroute (relevés de la mise en ligne, aucune requête du visiteur) ================= */
  const DOM = 'jeremy-grosjean.fr';
  function curlI(args) {
    const flags = args.filter(a => a.startsWith('-')), host = (args.find(a => !a.startsWith('-')) || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    if (!flags.some(f => /^-(I|-head|sI|Is)$/i.test(f)) || !host) { line(t('tCurlUsage'), 'r'); return; }
    if (host !== DOM && host !== 'www.' + DOM) { line(t('tCurlOnly'), 'd'); return; }
    const st = ST(); if (!st || !st.hdrs || !Array.isArray(st.hdrs.h)) { line(t('supNone'), 'd'); return; }
    line(st.hdrs.st || 'HTTP/2 200', 'd');
    for (const [k, v] of st.hdrs.h) { const d = line(''), a = document.createElement('span'); a.className = 'g'; a.textContent = k + ':'; d.append(a, ' ' + v); }
    line(t('tCurlNote')(fmtDate(st.checked, true)), 'd');
  }
  function whois() {
    const W = t('whois'), st = ST() || {};
    const rows = [[W.dom, DOM], [W.reg, W.regV], [W.rar, 'OVHcloud'], [W.host, 'OVHcloud'], [W.holder, W.holderV]];
    if (st.dnssec) rows.push([W.dnssec, W.signed]);
    if (st.a) rows.push([W.ip, st.a]);
    if (typeof st.tlsDays === 'number') rows.push([W.cert, W.certV(st.tlsDays)]);
    if ((st.mx || []).length) rows.push([W.mx, st.mx.join(', ')]);
    const w = Math.max(...rows.map(r => r[0].length)) + 2;
    for (const [k, v] of rows) line(`  ${(k + ' :').padEnd(w + 2)}${v}`, k === W.dom ? 'c' : undefined);
  }
  function traceroute() {
    const st = ST() || {}, H = t('trHops');
    const hops = [['192.168.1.1', 1], ['100.64.0.1', 6], ['203.0.113.17', 9], ['203.0.113.130', 12], ['198.51.100.42', 16], [st.a || DOM, 17]];
    line(t('trHead')(DOM), 'c');
    hops.forEach(([ip, ms], i) => setTimeout(() => {
      const t3 = [0, 1, 2].map(() => (ms + Math.random() * (ms / 4 + .5)).toFixed(1) + ' ms').join('  ');
      line(`${String(i + 1).padStart(2)}  ${ip.padEnd(16)} ${t3}   ← ${H[i]}`, i === hops.length - 1 ? 'g' : undefined); SND.key();
      if (i === hops.length - 1) setTimeout(() => line(t('trEnd'), 'd'), 250);
    }, 250 + i * 380));
  }


  /* ================= Lot 14 : candidature personnalisée, entretien, compétences, partage, FAQ, nouveaux jeux, mode forum ================= */
  const SITE_URL = 'https://jeremy-grosjean.fr';
  /* 1. Lien de candidature personnalisé : ?pour=Nom de l'entreprise (lu dans le lien, gardé le temps de la visite, jamais envoyé) */
  function coName() {
    if (coName.v !== undefined) return coName.v;
    let v = '';
    try { const q = new URLSearchParams(location.search); v = q.get('pour') || q.get('for') || sessionStorage.getItem('jg-pour') || ''; } catch (e) {}
    v = String(v).replace(/[^\p{L}\p{N} &'’.,()\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    try { if (v) sessionStorage.setItem('jg-pour', v); } catch (e) {}
    return (coName.v = v);
  }
  function renderHello() {
    const el = $('helloLine'), co = coName(); if (!co) { el.hidden = true; return; }
    $('helloTxt').textContent = t('hello')(co); el.hidden = false;
  }
  function coSubject(s) { const co = coName(); return co ? s + ' · ' + co : s; }
  function coBody(b) { const co = coName(); return co ? b.replace(/\n\n([^\n]{1,24}?[:：])[ \t]*\n/, (m, a) => `\n\n${a} ${co}\n`) : b; }
  function personalLink(name) {
    const n = String(name || '').trim().slice(0, 60);
    return n ? SITE_URL + '/?pour=' + encodeURIComponent(n).replace(/%20/g, '+') : '';
  }
  async function copyText(s) { try { await navigator.clipboard.writeText(s); return true; } catch (e) { return false; } }

  /* Liens d'écriture (application d'e-mail, Gmail, Outlook) avec un objet et un texte donnés */
  function mailLinks(subject, body) {
    const q = encodeURIComponent, to = q(MAIL), su = q(subject), bo = q(body);
    return { mailto: `mailto:${MAIL}?subject=${su}&body=${bo}`, gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${bo}`,
      outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${bo}` };
  }

  /* 2. Proposer un créneau : jours ouvrés à venir (hors week-ends et jours fériés fixes), heure de Paris, e-mail prérempli + fichier agenda */
  const SLOT_TIMES = ['09:30', '11:00', '14:00', '16:00'], FR_OFF = ['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'];
  const SL = { mode: 0, pick: null };
  function parisYMD(ts) {
    const p = {}; for (const x of new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ts))) p[x.type] = x.value;
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute };
  }
  function parisToUtc(y, m, d, h, mi) {
    let g = Date.UTC(y, m - 1, d, h, mi);
    for (let k = 0; k < 2; k++) { const p = parisYMD(g), seen = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi); g -= seen - Date.UTC(y, m - 1, d, h, mi); }
    return g;
  }
  function slotDays(n) {
    const t0 = parisYMD(Date.now()), out = [];
    for (let i = 1; out.length < n && i < 40; i++) {
      const dt = new Date(Date.UTC(t0.y, t0.m - 1, t0.d + i, 12)), wd = dt.getUTCDay();
      const md = String(dt.getUTCMonth() + 1).padStart(2, '0') + '-' + String(dt.getUTCDate()).padStart(2, '0');
      if (wd === 0 || wd === 6 || FR_OFF.includes(md)) continue;
      out.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() });
    }
    return out;
  }
  function slotLabel(ts) {
    try { return new Intl.DateTimeFormat(regionLocale(lang), { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(ts)); } catch (e) { return new Date(ts).toISOString(); }
  }
  function openSlots() {
    SL.pick = null;
    const seg = $('slotMode'); seg.querySelectorAll('button').forEach(b => b.remove());
    t('slotModes').forEach((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = m; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(i === SL.mode)); b.addEventListener('click', () => { SL.mode = i; seg.querySelectorAll('button').forEach((x, j) => x.setAttribute('aria-checked', String(j === i))); slotUpdate(); }); seg.append(b); });
    const box = $('slotDays'); box.textContent = '';
    let fDay; try { fDay = new Intl.DateTimeFormat(regionLocale(lang), { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (e) { fDay = null; }
    for (const d of slotDays(8)) {
      const wrap = document.createElement('div'), h = document.createElement('p'), row = document.createElement('div');
      wrap.className = 'slot-day'; h.className = 'slot-dlabel'; h.textContent = fDay ? fDay.format(new Date(Date.UTC(d.y, d.m - 1, d.d, 12))) : `${d.d}/${d.m}`; row.className = 'slot-row';
      for (const hm of SLOT_TIMES) {
        const [hh, mm] = hm.split(':').map(Number), ts = parisToUtc(d.y, d.m, d.d, hh, mm), b = document.createElement('button');
        b.type = 'button'; b.className = 'slot'; b.textContent = hm; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', slotLabel(ts));
        b.addEventListener('click', () => { box.querySelectorAll('.slot').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); SL.pick = ts; slotUpdate(); });
        row.append(b);
      }
      wrap.append(h, row); box.append(wrap);
    }
    $('slotSend').hidden = true; $('slotMsg').hidden = true;
    closeTerm(); openPanel('slotPanel', 'slotClose');
  }
  function slotUpdate() {
    if (SL.pick === null) return;
    const label = slotLabel(SL.pick), mode = t('slotModesIn')[SL.mode] || '';
    const L = mailLinks(coSubject(t('slotSubject')(label)), coBody(t('slotBody')(label, mode)));
    $('slotMail').href = L.mailto; $('slGmail').href = L.gmail; $('slOutlook').href = L.outlook;
    $('slotSend').hidden = false; $('slotMsg').hidden = true;
  }
  function icsDate(ts) { return new Date(ts).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  function slotIcs() {
    if (SL.pick === null) { const m = $('slotMsg'); m.hidden = false; m.className = 'tk-expl ko'; m.textContent = t('slotPick'); return; }
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//jeremy-grosjean.fr//entretien//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + icsDate(SL.pick) + '-' + Math.random().toString(36).slice(2, 10) + '@jeremy-grosjean.fr', 'DTSTAMP:' + icsDate(Date.now()),
      'DTSTART:' + icsDate(SL.pick), 'DTEND:' + icsDate(SL.pick + 45 * 60000), 'SUMMARY:' + icsEsc(t('slotIcsTitle') + (coName() ? ' · ' + coName() : '')),
      'DESCRIPTION:' + icsEsc(t('slotModes')[SL.mode] + ' · ' + MAIL + ' · ' + SITE_URL), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
    try {
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })), a = document.createElement('a');
      a.href = url; a.download = 'entretien-jeremy-grosjean.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {}
  }
  $('slotIcs').addEventListener('click', slotIcs);
  $('slotMail').addEventListener('click', e => { if (SL.pick === null) { e.preventDefault(); const m = $('slotMsg'); m.hidden = false; m.className = 'tk-expl ko'; m.textContent = t('slotPick'); } });
  $('slotClose').addEventListener('click', closePanels);
  for (const id of ['briefSlot', 'contactSlot', 'recSlot', 'faqSlot']) $(id).addEventListener('click', () => { if (id === 'recSlot') closeRec(); openSlots(); });

  /* 3. Compétences du titre TAI, chacune reliée aux jeux qui la montrent */
  const SK_GAMES = [['pickSupport', 'pickSupport2', 'pickCall', 'pickItil', 'pickReply'], ['pickPrep', 'pickRj', 'pickPanne', 'pickPhish', 'pickRansom'], ['pickSubnet', 'pickNoNet', 'pickQuiz', 'pickPs']];
  function openSkills() {
    const box = $('skList'); box.textContent = '';
    t('skBlocks').forEach(([title, items], i) => {
      const card = document.createElement('div'), h = document.createElement('h3'), ul = document.createElement('ul'), chips = document.createElement('p'), lbl = document.createElement('span');
      card.className = 'sk-block'; h.textContent = `${i + 1} · ${title}`;
      for (const it of items) { const li = document.createElement('li'); li.textContent = it; ul.append(li); }
      chips.className = 'sk-chips'; lbl.textContent = t('skTry'); chips.append(lbl);
      for (const g of SK_GAMES[i]) { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip-btn'; b.textContent = t(g + 'T') + ' ▸'; b.addEventListener('click', () => { closePanels(); $(g).click(); }); chips.append(b); }
      card.append(h, ul, chips); box.append(card);
    });
    closeTerm(); openPanel('skillsPanel', 'skClose');
  }
  function fillRecSkills() {
    const box = $('recSkills'); if (!box) return; box.textContent = '';
    t('skBlocks').forEach(([title, items], i) => { const p = document.createElement('p'), b = document.createElement('b'); b.textContent = `${i + 1} · ${title}`; p.append(b, document.createElement('br'), items.join(' · ')); box.append(p); });
  }
  $('briefSkills').addEventListener('click', openSkills);
  $('skClose').addEventListener('click', closePanels);
  $('skContact').addEventListener('click', () => $('contactBtn').click());

  /* 4. Partager ce profil : partage natif sur téléphone, sinon copier / e-mail / Teams / LinkedIn (simples liens, aucun bouton tiers chargé) */
  const SHARE_URL = SITE_URL + '/#recruteur';
  function openShare() {
    const coarse = matchMedia('(pointer: coarse)').matches;
    if (navigator.share && coarse) { navigator.share({ title: 'Jérémy Grosjean', text: t('shText'), url: SHARE_URL }).catch(() => {}); return; }
    const q = encodeURIComponent; $('shUrl').textContent = SHARE_URL;
    $('shMail').href = `mailto:?subject=${q(t('shMailSubject'))}&body=${q(t('shMailBody')(SHARE_URL))}`;
    $('shTeams').href = `https://teams.microsoft.com/share?href=${q(SHARE_URL)}&msgText=${q(t('shText'))}`;
    $('shLinkedin').href = `https://www.linkedin.com/sharing/share-offsite/?url=${q(SHARE_URL)}`;
    closeTerm(); openPanel('sharePanel', 'shCopy');
  }
  $('shCopy').addEventListener('click', async () => { if (await copyText(SHARE_URL)) toast(t('shCopied')); });
  $('shClose').addEventListener('click', closePanels);
  for (const id of ['briefShare', 'recShare']) $(id).addEventListener('click', openShare);

  /* 8. Questions fréquentes : les réponses reprennent la fiche « En 30 secondes » (aucune information inventée) */
  function openFaq() {
    const box = $('faqList'), qs = t('faqQ'), br = t('brief'); box.textContent = '';
    qs.forEach((q, i) => {
      const ex = t('faqExtra') || [], a = i < br.length ? br[i][1] : i - br.length < ex.length ? ex[i - br.length] : t('faqContact');
      const d = document.createElement('details'), s = document.createElement('summary'), p = document.createElement('p'); s.textContent = q; p.textContent = a; d.append(s, p); box.append(d);
    });
    const first = box.querySelector('details'); if (first) first.open = true;
    closeTerm(); openPanel('faqPanel', 'faqClose');
  }
  $('briefFaq').addEventListener('click', openFaq);
  $('faqClose').addEventListener('click', closePanels);

  /* Petit outil commun aux nouveaux jeux : boutons de réponse */
  function optBtn(text, onClick, cls) { const b = document.createElement('button'); b.type = 'button'; b.className = 'tk-opt' + (cls ? ' ' + cls : ''); b.textContent = text; b.addEventListener('click', () => onClick(b)); return b; }
  const bestOf = (key, v) => { const b = Math.max(+store.get(key) || 0, v); store.set(key, String(b)); return b; };

  /* 5. Jeu « Priorise les tickets » : impact × urgence, comme dans un centre de services */
  const IT = { list: [], i: 0, score: 0, ok: 0, imp: null, urg: null, done: false };
  const IT_ROUND = 8;
  function openItil() { closeTerm(); IT.done = false; IT.i = 0; IT.score = 0; IT.ok = 0; IT.list = shuffle(t('itTickets').map((x, k) => k)).slice(0, IT_ROUND); itShow(); openPanel('itPanel', null); SND.level(); }
  function itShow() {
    const tk = t('itTickets')[IT.list[IT.i]]; IT.imp = IT.urg = null;
    $('itTag').textContent = t('itTag')(IT.i + 1, IT.list.length); $('itScore').textContent = t('qzPts')(IT.score);
    $('itTitle').textContent = '« ' + tk[0] + ' »'; $('itFrom').textContent = t('tkFromL') + ' ' + tk[1]; $('itFrom').hidden = false;
    $('itAsk').hidden = false; $('itExpl').hidden = true; $('itNext').hidden = true; $('itCheck').hidden = false; $('itCheck').disabled = true;
    for (const box of ['itImp', 'itUrgBox']) $(box).querySelectorAll('button').forEach(b => { b.disabled = false; b.classList.remove('good', 'bad', 'sel'); b.setAttribute('aria-pressed', 'false'); });
  }
  for (const [box, key] of [['itImp', 'imp'], ['itUrgBox', 'urg']]) $(box).querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    IT[key] = +b.dataset.v; $(box).querySelectorAll('button').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $('itCheck').disabled = IT.imp === null || IT.urg === null;
  }));
  $('itCheck').addEventListener('click', () => {
    const tk = t('itTickets')[IT.list[IT.i]], gi = IT.imp === tk[2], gu = IT.urg === tk[3], p = tk[2] && tk[3] ? 0 : (tk[2] || tk[3]) ? 1 : 2;
    IT.score += (gi ? 10 : 0) + (gu ? 10 : 0); if (gi && gu) { IT.ok++; SND.block(); } else SND.wrong();
    for (const [box, ok, want] of [['itImp', gi, tk[2]], ['itUrgBox', gu, tk[3]]]) $(box).querySelectorAll('button').forEach(b => { b.disabled = true; if (+b.dataset.v === want) b.classList.add('good'); else if (b.classList.contains('sel') && !ok) b.classList.add('bad'); });
    const ex = $('itExpl'); ex.hidden = false; ex.className = 'tk-expl ' + (gi && gu ? 'ok' : 'ko');
    ex.textContent = (gi && gu ? t('itGood') : gi || gu ? t('itHalf') : t('itBad')) + ' ' + t('itIs')(t('itPrio')[p]) + ' ' + tk[4];
    $('itScore').textContent = t('qzPts')(IT.score); $('itCheck').hidden = true;
    const nx = $('itNext'); nx.hidden = false; nx.textContent = IT.i < IT.list.length - 1 ? t('itNext') : t('itEnd'); nx.focus();
  });
  $('itNext').addEventListener('click', () => {
    if (IT.done) { openItil(); return; }
    if (IT.i < IT.list.length - 1) { IT.i++; itShow(); return; }
    const n = IT.list.length, best = bestOf('jg-itil-best', IT.score);
    $('itTag').textContent = t('qzDoneTag'); $('itTitle').textContent = t('itDoneTitle')(IT.ok, n); $('itAsk').hidden = true; $('itCheck').hidden = true;
    $('itFrom').textContent = t('itDoneMsg')(IT.score, n * 20) + ' ' + t('pnBest')(best); $('itExpl').hidden = true;
    IT.done = true; const nx = $('itNext'); nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('itQuit').addEventListener('click', closePanels);

  /* 6. Défi PowerShell : 8 missions, bonne commande + explication (rien ne s'exécute) */
  const PS_CMD = [
    ['Get-NetIPConfiguration', 'Get-Process', 'Get-Service'],
    ['Test-NetConnection srv01 -Port 443', 'ping srv01 -p 443', 'Get-NetTCPConnection -RemotePort 443'],
    ['Search-ADAccount -AccountDisabled -UsersOnly', 'Get-ADUser -Disabled', 'Get-LocalUser | Where-Object Enabled'],
    ['Unlock-ADAccount -Identity jdupont', 'Enable-ADAccount -Identity jdupont', 'Set-ADUser jdupont -Unlock'],
    ['Set-ADAccountPassword -Identity jdupont -Reset -NewPassword (Read-Host -AsSecureString)', 'Reset-ADPassword jdupont', 'Set-ADUser jdupont -ResetPassword'],
    ["Get-Service | Where-Object Status -eq 'Stopped'", 'Get-Service -Stopped', 'Stop-Service *'],
    ['Restart-Service -Name Spooler', 'Start-Process Spooler', 'Restart-Computer -Name Spooler'],
    ['gpupdate /force', 'gpresult /r', 'Get-GPO -All'],
    ['Get-EventLog -LogName System -EntryType Error -Newest 20', 'Get-Content C:\\Windows\\System.log -Tail 20', 'Clear-EventLog -LogName System'],
    ['Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -ComputersOnly', 'Get-ADComputer -Inactive 90', 'Remove-ADComputer -Days 90']
  ];
  const PSG = { list: [], i: 0, score: 0, ok: 0, wrong: false, done: false };
  function openPs() { closeTerm(); PSG.done = false; PSG.i = 0; PSG.score = 0; PSG.ok = 0; PSG.list = shuffle(PS_CMD.map((x, k) => k)).slice(0, 8).map(k => ({ k, order: shuffle([0, 1, 2]) })); psShow(); openPanel('psPanel', null); SND.level(); }
  function psShow() {
    const it = PSG.list[PSG.i], m = t('ps')[it.k]; PSG.wrong = false;
    $('psTag').textContent = t('psTag')(PSG.i + 1, PSG.list.length); $('psScore').textContent = t('qzPts')(PSG.score); $('psTitle').textContent = m[0];
    const box = $('psOpts'); box.textContent = ''; box.hidden = false;
    it.order.forEach(j => box.append(optBtn(PS_CMD[it.k][j], b => psAnswer(j === 0, b), 'mono')));
    $('psTerm').hidden = true; $('psExpl').hidden = true; $('psNext').hidden = true;
  }
  function psAnswer(good, btn) {
    const it = PSG.list[PSG.i], m = t('ps')[it.k], ex = $('psExpl'); ex.hidden = false;
    if (!good) { PSG.wrong = true; btn.classList.add('bad'); btn.disabled = true; SND.wrong(); ex.className = 'tk-expl ko'; ex.textContent = t('psBad') + ' ' + t('psRetry'); return; }
    btn.classList.add('good'); SND.block(); PSG.score += PSG.wrong ? 5 : 10; if (!PSG.wrong) PSG.ok++;
    $('psOpts').querySelectorAll('button').forEach(b => { b.disabled = true; });
    const term = $('psTerm'); term.textContent = ''; const pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = 'PS C:\\> '; term.append(pr, PS_CMD[it.k][0]); term.hidden = false;
    ex.className = 'tk-expl ok'; ex.textContent = t('psGood') + ' ' + m[1]; $('psScore').textContent = t('qzPts')(PSG.score);
    const nx = $('psNext'); nx.hidden = false; nx.textContent = PSG.i < PSG.list.length - 1 ? t('psNext') : t('psEnd'); nx.focus();
  }
  $('psNext').addEventListener('click', () => {
    if (PSG.done) { openPs(); return; }
    if (PSG.i < PSG.list.length - 1) { PSG.i++; psShow(); return; }
    const n = PSG.list.length, best = bestOf('jg-ps-best', PSG.score);
    $('psTag').textContent = t('qzDoneTag'); $('psTitle').textContent = t('psDoneTitle')(PSG.ok, n); $('psOpts').hidden = true; $('psTerm').hidden = true;
    const ex = $('psExpl'); ex.hidden = false; ex.className = 'tk-expl'; ex.textContent = t('psDoneMsg')(PSG.score, n * 10) + ' ' + t('pnBest')(best);
    PSG.done = true; const nx = $('psNext'); nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('psQuit').addEventListener('click', closePanels);

  /* 7. Jeu « Sertis le câble RJ45 » : T568B, T568A, puis le testeur */
  const RJ_B = [0, 1, 2, 3, 4, 5, 6, 7], RJ_A = [2, 5, 0, 3, 4, 1, 6, 7];
  const RJ = { step: 0, pos: 0, err: 0, score: 0, done: false };
  function openRj() { closeTerm(); Object.assign(RJ, { step: 0, err: 0, score: 0, done: false }); rjShow(); openPanel('rjPanel', null); SND.level(); }
  function rjShow() {
    RJ.pos = 0; RJ.stepErr = 0; const C = t('rjColors');
    $('rjTag').textContent = [t('rjTagB'), t('rjTagA'), t('rjTagQ')][RJ.step]; $('rjScore').textContent = t('qzPts')(RJ.score);
    $('rjExpl').hidden = true; $('rjNext').hidden = true;
    const slots = $('rjSlots'), wires = $('rjWires'), opts = $('rjOpts'); slots.textContent = ''; wires.textContent = ''; opts.textContent = '';
    if (RJ.step === 2) {
      $('rjTitle').textContent = t('rjQ'); slots.hidden = true; wires.hidden = true; opts.hidden = false;
      shuffle([0, 1, 2]).forEach(j => opts.append(optBtn(t('rjOpts')[j], b => rjAnswer(j === 0, b))));
      return;
    }
    $('rjTitle').textContent = t('rjSub'); slots.hidden = false; wires.hidden = false; opts.hidden = true;
    for (let n = 0; n < 8; n++) { const s = document.createElement('span'); s.className = 'rj-slot'; s.title = t('rjPin')(n + 1); s.textContent = n + 1; slots.append(s); }
    for (const c of shuffle([0, 1, 2, 3, 4, 5, 6, 7])) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'rj-wire rj-c' + c; b.dataset.c = c; b.setAttribute('aria-label', C[c]); b.title = C[c];
      const lbl = document.createElement('span'); lbl.textContent = C[c]; b.append(lbl);
      b.addEventListener('click', () => rjTap(b)); wires.append(b);
    }
  }
  function rjTap(b) {
    const order = RJ.step === 0 ? RJ_B : RJ_A, want = order[RJ.pos], c = +b.dataset.c, ex = $('rjExpl');
    if (c !== want) { RJ.err++; RJ.stepErr++; SND.wrong(); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); ex.hidden = false; ex.className = 'tk-expl ko'; ex.textContent = t('rjBad')(RJ.pos + 1, t('rjColors')[want]); return; }
    SND.key(); const slot = $('rjSlots').children[RJ.pos]; slot.className = 'rj-slot full rj-c' + c; slot.title = t('rjColors')[c]; b.disabled = true; b.classList.add('used'); RJ.pos++; ex.hidden = true;
    if (RJ.pos === 8) {
      RJ.score += Math.max(0, 80 - RJ.stepErr * 10); SND.block(); ex.hidden = false; ex.className = 'tk-expl ok'; ex.textContent = t('rjOk'); $('rjScore').textContent = t('qzPts')(RJ.score);
      const nx = $('rjNext'); nx.hidden = false; nx.textContent = t('rjNext'); nx.focus();
    }
  }
  function rjAnswer(good, btn) {
    const ex = $('rjExpl'); ex.hidden = false;
    if (!good) { RJ.err++; RJ.qWrong = true; btn.classList.add('bad'); btn.disabled = true; SND.wrong(); ex.className = 'tk-expl ko'; ex.textContent = t('qzBad') + ' ' + t('qzRetry'); return; }
    btn.classList.add('good'); SND.block(); RJ.score += RJ.qWrong ? 20 : 40; $('rjOpts').querySelectorAll('button').forEach(b => { b.disabled = true; });
    ex.className = 'tk-expl ok'; ex.textContent = t('qzGood') + ' ' + t('rjExpl'); $('rjScore').textContent = t('qzPts')(RJ.score);
    const nx = $('rjNext'); nx.hidden = false; nx.textContent = t('rjEnd'); nx.focus();
  }
  $('rjNext').addEventListener('click', () => {
    if (RJ.done) { openRj(); return; }
    if (RJ.step < 2) { RJ.step++; RJ.qWrong = false; rjShow(); return; }
    const best = bestOf('jg-rj45-best', RJ.score);
    $('rjTag').textContent = t('qzDoneTag'); $('rjTitle').textContent = t('rjDoneTitle')(RJ.err); $('rjOpts').hidden = true;
    const ex = $('rjExpl'); ex.className = 'tk-expl'; ex.textContent = t('rjDoneMsg')(RJ.score, 200) + ' ' + t('pnBest')(best);
    RJ.done = true; const nx = $('rjNext'); nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('rjQuit').addEventListener('click', closePanels);

  /* 12. Simulateur d'appel : la relation avec l'utilisateur compte autant que la technique */
  const CL = { i: 0, rel: 0, tech: 0, done: false };
  const stars = (v, max) => '★'.repeat(Math.round(v / max * 3)) + '☆'.repeat(3 - Math.round(v / max * 3));
  function openCall() { closeTerm(); Object.assign(CL, { i: 0, rel: 0, tech: 0, done: false }); $('clChat').textContent = ''; clShow(); openPanel('clPanel', null); SND.level(); }
  function bubble(text, who) { const p = document.createElement('p'); p.className = 'cl-b ' + who; p.textContent = text; $('clChat').append(p); p.scrollIntoView({ block: 'nearest' }); }
  function clScore() { const n = t('call').length * 2; $('clScore').textContent = `${t('clRel')} ${stars(CL.rel, n)} · ${t('clTech')} ${stars(CL.tech, n)}`; }
  function clShow() {
    const st = t('call')[CL.i]; $('clTag').textContent = t('clStep')(CL.i + 1, t('call').length); clScore();
    bubble('« ' + st[0] + ' »', 'u');
    const box = $('clOpts'); box.textContent = ''; box.hidden = false;
    shuffle([0, 1, 2]).forEach(j => box.append(optBtn(st[1][j][0], () => clAnswer(j))));
    $('clExpl').hidden = true; $('clNext').hidden = true;
  }
  function clAnswer(j) {
    const r = t('call')[CL.i][1][j]; CL.rel += r[1]; CL.tech += r[2];
    $('clOpts').textContent = ''; bubble(r[0], 'm');
    const ex = $('clExpl'); ex.hidden = false; const top = r[1] + r[2] === 4; ex.className = 'tk-expl ' + (top ? 'ok' : 'ko'); ex.textContent = (top ? '✓ ' : '• ') + r[3];
    if (top) SND.block(); else SND.wrong(); clScore();
    const nx = $('clNext'); nx.hidden = false; nx.textContent = CL.i < t('call').length - 1 ? t('clNext') : t('clEnd'); nx.focus();
  }
  $('clNext').addEventListener('click', () => {
    if (CL.done) { openCall(); return; }
    if (CL.i < t('call').length - 1) { CL.i++; clShow(); return; }
    const m = t('call').length * 2, best = bestOf('jg-call-best', CL.rel + CL.tech);
    $('clTag').textContent = t('clDoneTitle'); $('clOpts').hidden = true;
    const ex = $('clExpl'); ex.className = 'tk-expl'; ex.textContent = t('clDoneMsg')(CL.rel, CL.tech, m) + ' ' + t('pnBest')(best + '/' + m * 2);
    CL.done = true; const nx = $('clNext'); nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('clQuit').addEventListener('click', closePanels);

  /* 11. Défi du jour : même question pour tous le même jour (heure de Paris), série gardée dans ce navigateur */
  function dayKey(ts) { const p = parisYMD(ts); return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`; }
  function dailyPool() { return t('quizAD').concat(t('ps').map((m, k) => [m[0], PS_CMD[k], m[1], 1])); }
  function dailyState() { try { const s = JSON.parse(store.get('jg-daily') || 'null'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
  function openDaily() {
    const today = dayKey(Date.now()), [y, m, d] = today.split('-').map(Number), n = Math.floor(Date.UTC(y, m - 1, d) / 864e5), pool = dailyPool(), q = pool[(n * 7 + 3) % pool.length], st = dailyState(); DY_OK = q[1][0];
    let lab; try { lab = new Intl.DateTimeFormat(regionLocale(lang), { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d, 12))); } catch (e) { lab = today; }
    $('dyTitle').textContent = t('dyTitle')(lab); $('dyQ').textContent = q[0];
    const box = $('dyOpts'); box.textContent = ''; const ex = $('dyExpl'); ex.hidden = true;
    const order = shuffle([0, 1, 2]), done = st.d === today;
    order.forEach(j => {
      const b = optBtn(q[1][j], () => {
        if (dailyState().d === today) return;
        const ok = j === 0, s = dailyState(), y1 = dayKey(Date.now() - 864e5);
        const streak = ok ? (s.okLast === y1 ? (s.streak || 0) + 1 : 1) : 0;
        store.set('jg-daily', JSON.stringify({ d: today, ok, streak, okLast: ok ? today : s.okLast })); bestOf('jg-daily-best', streak);
        box.querySelectorAll('button').forEach((x, k) => { x.disabled = true; if (order[k] === 0) x.classList.add('good'); });
        if (!ok) b.classList.add('bad');
        ex.hidden = false; ex.className = 'tk-expl ' + (ok ? 'ok' : 'ko'); ex.textContent = (ok ? t('qzGood') : t('qzBad')) + ' ' + q[2] + ' ' + t('dyDone');
        $('dyStreak').textContent = t('dyStreak')(streak); if (ok) SND.block(); else SND.wrong();
      }, q[3] ? 'mono' : '');
      if (done) { b.disabled = true; if (j === 0) b.classList.add('good'); }
      box.append(b);
    });
    if (done) { ex.hidden = false; ex.className = 'tk-expl ' + (st.ok ? 'ok' : 'ko'); ex.textContent = t('dyAlready')(st.ok) + ' ' + q[2] + ' ' + t('dyDone'); }
    const live = st.okLast === today || st.okLast === dayKey(Date.now() - 864e5) ? (st.streak || 0) : 0;
    $('dyStreak').textContent = t('dyStreak')(live);
    closeTerm(); openPanel('dyPanel', 'dyClose');
  }
  $('dyClose').addEventListener('click', closePanels);

  $('pickItil').addEventListener('click', openItil);
  $('pickPs').addEventListener('click', openPs);
  $('pickRj').addEventListener('click', openRj);
  $('pickCall').addEventListener('click', openCall);
  $('pickDaily').addEventListener('click', openDaily);

  /* 10. Mode « forum de l'alternance » (?mode=forum) : écran d'accueil en boucle, retour automatique après 60 s sans activité */
  const FORUM = (() => { try { return /^(forum|kiosk|salon)$/i.test(new URLSearchParams(location.search).get('mode') || ''); } catch (e) { return false; } })();
  let fmIdle = 0, fmCycle = 0, fmK = 0, fmLock = null;
  function fmFact() { const b = t('brief'); if (!b.length) return; const [k, v] = b[fmK++ % b.length]; $('fmFact').textContent = `${k} · ${v}`; }
  function fmShow() {
    try { if (G.on) quitGame(); } catch (e) {}
    closePanels(); closeTerm(); if (recOn()) closeRec(); window.scrollTo(0, 0);
    document.body.classList.add('forum-on'); $('forum').hidden = false; fmFact(); clearInterval(fmCycle); fmCycle = setInterval(fmFact, 5000);
  }
  function fmHide() { $('forum').hidden = true; document.body.classList.remove('forum-on'); clearInterval(fmCycle); fmPoke(); fmWake(); }
  function fmPoke() { clearTimeout(fmIdle); if (FORUM && $('forum').hidden) fmIdle = setTimeout(fmShow, 60000); }
  async function fmWake() { try { if (navigator.wakeLock && !fmLock) { fmLock = await navigator.wakeLock.request('screen'); fmLock.addEventListener('release', () => { fmLock = null; }); } } catch (e) {} }
  if (FORUM) {
    $('forum').addEventListener('click', e => { if (e.target.closest('#fmExit')) return; fmHide(); });
    $('fmExit').addEventListener('click', e => { e.stopPropagation(); clearTimeout(fmIdle); clearInterval(fmCycle); $('forum').hidden = true; document.body.classList.remove('forum-on');
      try { const u = new URL(location.href); u.searchParams.delete('mode'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e2) {} window.location.reload(); });
    for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.addEventListener(ev, fmPoke, { passive: true, capture: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('forum').hidden) fmWake(); });
    setTimeout(fmShow, 0);
  }

  function lot14Lang() { renderHello(); fillRecSkills(); }
  lot14Lang();


  /* ================= Lot 15 : « Prépare un poste », « Attaque par rançongiciel », « Réponds au ticket » et badges ================= */
  /* « Prépare un poste » : toucher les 8 étapes dans l'ordre ; chaque erreur coûte 10 points */
  const PR = { order: [], pos: 0, err: 0, done: false };
  function openPrep() {
    closeTerm(); Object.assign(PR, { pos: 0, err: 0, done: false }); PR.order = shuffle(t('prSteps').map((x, k) => k));
    $('prDone').textContent = ''; $('prExpl').hidden = true; $('prNext').hidden = true; $('prSub').hidden = false; prDraw(); openPanel('prPanel', null); SND.level();
  }
  function prDraw() {
    const S = t('prSteps'), box = $('prOpts'); box.textContent = ''; box.hidden = false;
    $('prTag').textContent = t('prTag')(Math.min(PR.pos + 1, S.length), S.length); $('prScore').textContent = t('qzPts')(Math.max(0, S.length * 10 - PR.err * 10));
    for (const k of PR.order) if (k >= PR.pos) box.append(optBtn(S[k][0], b => prTap(k, b)));
  }
  function prTap(k, b) {
    const S = t('prSteps'), ex = $('prExpl'); ex.hidden = false;
    if (k !== PR.pos) { PR.err++; SND.wrong(); b.classList.add('bad', 'shake'); setTimeout(() => b.classList.remove('bad', 'shake'), 450); ex.className = 'tk-expl ko'; ex.textContent = t('prBad'); $('prScore').textContent = t('qzPts')(Math.max(0, S.length * 10 - PR.err * 10)); return; }
    SND.key(); const li = document.createElement('li'), w = document.createElement('b'), y = document.createElement('span');
    w.textContent = S[k][0]; y.textContent = S[k][1]; li.append(w, y); $('prDone').append(li); PR.pos++;
    ex.hidden = true;
    if (PR.pos < S.length) { prDraw(); return; }
    ex.hidden = false; ex.className = 'tk-expl ok';
    $('prOpts').hidden = true; $('prSub').hidden = true; SND.block(); ex.textContent = t('prOk');
    $('prScore').textContent = t('qzPts')(Math.max(0, S.length * 10 - PR.err * 10)); const nx = $('prNext'); nx.textContent = t('prEnd'); nx.hidden = false; nx.focus();
  }
  $('prNext').addEventListener('click', () => {
    if (PR.done) { openPrep(); return; }
    const m = t('prSteps').length * 10, s = Math.max(0, m - PR.err * 10), best = bestOf('jg-prep-best', s);
    $('prTag').textContent = t('qzDoneTag'); $('prTitle').textContent = t('prDoneTitle')(PR.err);
    const ex = $('prExpl'); ex.className = 'tk-expl'; ex.textContent = t('prDoneMsg')(s, m) + ' ' + t('pnBest')(best);
    PR.done = true; $('prNext').textContent = t('again') || '↻'; SND.end();
  });
  $('prQuit').addEventListener('click', () => { closePanels(); $('prTitle').textContent = t('prTitle'); });

  /* « Attaque par rançongiciel » : 5 décisions, 20 points du premier coup, 10 au deuxième */
  const RS = { i: 0, score: 0, ok: 0, wrong: false, done: false };
  function openRansom() { closeTerm(); Object.assign(RS, { i: 0, score: 0, ok: 0, done: false }); rsShow(); openPanel('rwPanel', null); SND.breach(); }
  function rsShow() {
    const q = t('ransom')[RS.i]; RS.wrong = false;
    $('rwTag').textContent = t('rwTag')(RS.i + 1, t('ransom').length); $('rwScore').textContent = t('qzPts')(RS.score); $('rwTitle').textContent = q[0];
    const box = $('rwOpts'); box.textContent = ''; box.hidden = false;
    shuffle([0, 1, 2]).forEach(j => box.append(optBtn(q[1][j], b => rsAnswer(j === 0, b))));
    $('rwExpl').hidden = true; $('rwNext').hidden = true;
  }
  function rsAnswer(good, btn) {
    const q = t('ransom')[RS.i], ex = $('rwExpl'); ex.hidden = false;
    if (!good) { RS.wrong = true; btn.classList.add('bad'); btn.disabled = true; SND.wrong(); ex.className = 'tk-expl ko'; ex.textContent = t('rwBad') + ' ' + t('rwRetry'); return; }
    btn.classList.add('good'); SND.block(); RS.score += RS.wrong ? 10 : 20; if (!RS.wrong) RS.ok++;
    $('rwOpts').querySelectorAll('button').forEach(b => { b.disabled = true; });
    ex.className = 'tk-expl ok'; ex.textContent = t('rwGood') + ' ' + q[2]; $('rwScore').textContent = t('qzPts')(RS.score);
    const nx = $('rwNext'); nx.hidden = false; nx.textContent = RS.i < t('ransom').length - 1 ? t('rwNext') : t('rwEnd'); nx.focus();
  }
  $('rwNext').addEventListener('click', () => {
    if (RS.done) { openRansom(); return; }
    if (RS.i < t('ransom').length - 1) { RS.i++; rsShow(); return; }
    const n = t('ransom').length, best = bestOf('jg-ransom-best', RS.score);
    $('rwTag').textContent = t('qzDoneTag'); $('rwTitle').textContent = t('rwDoneTitle')(RS.ok, n); $('rwOpts').hidden = true;
    const ex = $('rwExpl'); ex.className = 'tk-expl'; ex.textContent = t('rwDoneMsg')(RS.score, n * 20) + ' ' + t('pnBest')(best) + ' · ' + t('rw321');
    RS.done = true; const nx = $('rwNext'); nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('rwQuit').addEventListener('click', closePanels);

  /* « Réponds au ticket » : 2 tickets, 4 phrases à choisir chacun (10, 5 ou 0 point) */
  const RP = { i: 0, slot: 0, score: 0, done: false };
  function openReply() { closeTerm(); Object.assign(RP, { i: 0, slot: 0, score: 0, done: false }); rpTicket(); openPanel('rpPanel', null); SND.level(); }
  function rpTicket() {
    const tk = t('replies')[RP.i]; RP.slot = 0;
    $('rpTag').textContent = t('rpTag')(RP.i + 1, t('replies').length); $('rpTitle').textContent = '« ' + tk[0] + ' »'; $('rpFrom').textContent = t('tkFromL') + ' ' + tk[1]; $('rpFrom').hidden = false;
    $('rpMail').textContent = ''; $('rpMail').hidden = false; $('rpExpl').hidden = true; $('rpNext').hidden = true; rpSlot();
  }
  function rpSlot() {
    const tk = t('replies')[RP.i], opts = tk[2][RP.slot], box = $('rpOpts'); box.textContent = ''; box.hidden = false;
    $('rpScore').textContent = t('qzPts')(RP.score); $('rpAsk').hidden = false; $('rpAsk').textContent = t('rpPick')(t('rpSlots')[RP.slot]);
    shuffle([0, 1, 2]).forEach(j => box.append(optBtn(opts[j][0], () => rpChoose(opts[j]))));
  }
  function rpChoose(o) {
    RP.score += o[1]; const p = document.createElement('p'); p.textContent = o[0]; p.className = o[1] === 10 ? 'good' : o[1] ? 'mid' : 'bad'; $('rpMail').append(p);
    const ex = $('rpExpl'); ex.hidden = false; ex.className = 'tk-expl ' + (o[1] === 10 ? 'ok' : 'ko'); ex.textContent = (o[1] === 10 ? '✓ ' : o[1] ? '• ' : '✗ ') + o[2];
    if (o[1] === 10) SND.block(); else SND.wrong(); $('rpScore').textContent = t('qzPts')(RP.score);
    if (RP.slot < 3) { RP.slot++; rpSlot(); return; }
    const sg = document.createElement('p'); sg.className = 'sign'; sg.textContent = t('rpSign'); $('rpMail').append(sg);
    $('rpOpts').hidden = true; $('rpAsk').hidden = true;
    const nx = $('rpNext'); nx.hidden = false; nx.textContent = RP.i < t('replies').length - 1 ? t('rpNext') : t('rpEnd'); nx.focus();
  }
  $('rpNext').addEventListener('click', () => {
    if (RP.done) { openReply(); return; }
    if (RP.i < t('replies').length - 1) { RP.i++; rpTicket(); return; }
    const m = t('replies').length * 40, best = bestOf('jg-reply-best', RP.score);
    $('rpTag').textContent = t('qzDoneTag'); $('rpTitle').textContent = t('rpDoneTitle'); $('rpFrom').hidden = true; $('rpMail').hidden = true;
    const ex = $('rpExpl'); ex.className = 'tk-expl'; ex.textContent = t('rpDoneMsg')(RP.score, m) + ' ' + t('pnBest')(best);
    RP.done = true; const nx = $('rpNext'); nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('rpQuit').addEventListener('click', closePanels);

  $('pickPrep').addEventListener('click', openPrep);
  $('pickRansom').addEventListener('click', openRansom);
  $('pickReply').addEventListener('click', openReply);

  /* « Plus d'Internet » : la méthode de diagnostic réseau, du câble au navigateur.
     3 postes tirés parmi 6 pannes (la panne n° k se trouve à l'étape k ; k = 5 : tout répond, c'est le proxy).
     50 points par poste : 30 pour la méthode (10 de moins par mauvais choix), 20 pour la bonne action du premier coup. */
  const NI_CASES = 6, NI_STEPS = 5, NI_ROUND = 3, NI_PTS = 50;
  const NI = { list: [], i: 0, step: 0, phase: 'step', wrong: 0, fixWrong: false, okTxt: '', score: 0, done: false };
  function openNoNet() { closeTerm(); Object.assign(NI, { list: shuffle([...Array(NI_CASES).keys()]).slice(0, NI_ROUND), i: 0, score: 0, done: false }); niCase(); openPanel('niPanel', null); SND.level(); }
  function niCase() {
    const sc = t('niScen')[NI.list[NI.i]]; Object.assign(NI, { step: 0, phase: 'step', wrong: 0, fixWrong: false });
    $('niTag').textContent = t('niTag')(NI.i + 1, NI.list.length); $('niTitle').textContent = '« ' + sc.t + ' »';
    $('niFrom').textContent = t('tkFromL') + ' ' + sc.who; $('niFrom').hidden = false;
    $('niLog').textContent = ''; $('niLog').hidden = false; $('niSteps').hidden = false; $('niStepsL').hidden = false;
    $('niExpl').hidden = true; $('niNext').hidden = true; niLadder(); niAsk();
  }
  function niLadder() {
    const k = NI.list[NI.i], ol = $('niSteps'); ol.textContent = '';
    t('niSteps').forEach((name, s) => {
      const li = document.createElement('li'); li.textContent = name;
      li.className = s < NI.step ? 'ok' : s === NI.step && NI.phase === 'fix' && s === k ? 'ko' : s === NI.step && NI.phase === 'step' ? 'now' : '';
      if (li.className === 'now') li.setAttribute('aria-current', 'step'); ol.append(li);
    });
  }
  function niAsk() {
    const k = NI.list[NI.i], box = $('niOpts'); box.textContent = ''; box.hidden = false; $('niAsk').hidden = false; $('niScore').textContent = t('qzPts')(NI.score);
    let opts;
    if (NI.phase === 'step') {
      const C = t('niChecks'), bad = shuffle(t('niBad')), s = NI.step;
      const later = s < NI_STEPS - 1 ? C[s + 1 + ((Math.random() * (NI_STEPS - 1 - s)) | 0)] : null;
      NI.okTxt = C[s]; $('niAsk').textContent = t('niAskStep');
      opts = [[C[s], 'ok'], later ? [later, 'early'] : [bad[1], 'rash'], [bad[0], 'rash']];
    } else {
      const sc = t('niScen')[k]; NI.okTxt = sc.fix[0][0]; $('niAsk').textContent = k < NI_STEPS ? t('niFound')(sc.cause) : t('niAskEnd');
      opts = sc.fix.map((f, j) => [f[0], j ? 'fix' : 'ok', f[1]]);
    }
    shuffle(opts).forEach(o => box.append(optBtn(o[0], b => niChoose(o, b))));
  }
  function niLog(txt, cls) { const p = document.createElement('p'); p.textContent = txt; p.className = cls; $('niLog').append(p); }
  function niChoose(o, b) {
    const k = NI.list[NI.i], ex = $('niExpl'); ex.hidden = false;
    if (o[1] !== 'ok') {
      b.classList.add('bad'); b.disabled = true; SND.wrong(); ex.className = 'tk-expl ko';
      if (NI.phase === 'step') { NI.wrong++; ex.textContent = '✗ ' + (o[1] === 'early' ? t('niEarly')(t('niSteps')[NI.step]) : t('niRash')); }
      else { NI.fixWrong = true; ex.textContent = '✗ ' + o[2]; }
      return;
    }
    SND.block();
    if (NI.phase === 'step') {
      const s = NI.step, found = s === k;
      niLog((found ? '✗ ' : '✓ ') + (found ? t('niScen')[k].ko : t('niOk')[s]), found ? 'bad' : 'good');
      ex.className = 'tk-expl ok'; ex.textContent = '✓ ' + (found ? t('niFoundL') : t('niGood'));
      if (found) NI.phase = 'fix'; else { NI.step++; if (NI.step === NI_STEPS) NI.phase = 'fix'; }
      niLadder(); niAsk(); return;
    }
    const pts = Math.max(0, 30 - NI.wrong * 10) + (NI.fixWrong ? 0 : 20); NI.score += pts;
    b.classList.add('good'); niLog('→ ' + o[0], 'good');
    ex.className = 'tk-expl ok'; ex.textContent = '✓ ' + o[2] + ' ' + t('niCasePts')(pts, NI_PTS);
    $('niScore').textContent = t('qzPts')(NI.score); $('niOpts').hidden = true; $('niAsk').hidden = true;
    const nx = $('niNext'); nx.hidden = false; nx.textContent = NI.i < NI.list.length - 1 ? t('niNext') : t('niEnd'); nx.focus();
  }
  $('niNext').addEventListener('click', () => {
    if (NI.done) { openNoNet(); return; }
    if (NI.i < NI.list.length - 1) { NI.i++; niCase(); return; }
    const m = NI.list.length * NI_PTS, best = bestOf('jg-noint-best', NI.score);
    $('niTag').textContent = t('qzDoneTag'); $('niTitle').textContent = t('niDoneTitle'); $('niFrom').hidden = true;
    $('niLog').hidden = true; $('niSteps').hidden = true; $('niStepsL').hidden = true;
    const ex = $('niExpl'); ex.hidden = false; ex.className = 'tk-expl'; ex.textContent = t('niDoneMsg')(NI.score, m) + ' ' + t('pnBest')(best) + ' · ' + t('niMethod');
    NI.done = true; const nx = $('niNext'); nx.textContent = t('again') || '↻'; nx.focus(); SND.end();
  });
  $('niQuit').addEventListener('click', closePanels);
  $('pickNoNet').addEventListener('click', openNoNet);

  /* Badges : calculés à partir des meilleurs scores enregistrés dans ce navigateur (rien n'est envoyé) */
  const num = k => +store.get(k) || 0, has = k => { const v = store.get(k); return v !== null && v !== undefined && v !== ''; };
  const GAME_KEYS = ['jg-firewall-best', 'jg-support-best', 'jg-support2-best', 'jg-panne-best', 'jg-quiz-best', 'jg-phish-best', 'jg-subnet-best', 'jg-itil-best', 'jg-ps-best', 'jg-rj45-best', 'jg-call-best', 'jg-prep-best', 'jg-ransom-best', 'jg-reply-best', 'jg-noint-best'];
  const BADGES = [
    ['🎮', () => GAME_KEYS.some(has)], ['🛡️', () => num('jg-firewall-best') > 0], ['🎧', () => num('jg-support-best') >= 50], ['🧰', () => num('jg-support2-best') >= 50],
    ['🔍', () => num('jg-panne-best') >= PN_ROUND * 100], ['🗂️', () => num('jg-quiz-best') >= QZ_ROUND * 10], ['🎣', () => num('jg-phish-best') >= 60], ['🧮', () => num('jg-subnet-best') > 0],
    ['📋', () => num('jg-itil-best') >= 160], ['⌨️', () => num('jg-ps-best') >= 80], ['🔌', () => num('jg-rj45-best') >= 200], ['📞', () => num('jg-call-best') >= 16],
    ['💻', () => num('jg-prep-best') >= 80], ['🚨', () => num('jg-ransom-best') >= 100], ['✍️', () => num('jg-reply-best') >= 80], ['📅', () => num('jg-daily-best') >= 3],
    ['🕵️', () => foundSet().length >= 5], ['🗝️', () => foundSet().length >= SECRETS.length],
    ['🧩', () => ['jg-firewall-best', 'jg-support-best', 'jg-panne-best', 'jg-quiz-best', 'jg-phish-best', 'jg-subnet-best', 'jg-itil-best', 'jg-ps-best', 'jg-rj45-best', 'jg-call-best', 'jg-prep-best', 'jg-ransom-best', 'jg-reply-best'].every(has)]
  ];
  function unlocked() { const u = BADGES.map(([, f]) => { try { return !!f(); } catch (e) { return false; } }); u.push(u.every(Boolean)); return u; }
  function badgeSeen() { try { const v = JSON.parse(store.get('jg-badges') || 'null'); return Array.isArray(v) ? v : null; } catch (e) { return null; } }
  let bdTimer = 0;
  function checkBadges(silent) {
    const u = unlocked(), seen = badgeSeen(), names = t('badges'), now = u.map((x, i) => x ? i : -1).filter(i => i >= 0);
    if (seen && !silent) { const fresh = now.filter(i => !seen.includes(i)); fresh.forEach((i, k) => setTimeout(() => toast(t('bdNew')(names[i][0]), 2600), k * 2700)); if (fresh.length) try { celebrate(); } catch (e) {} }
    if (!seen || now.length !== seen.length || now.some(i => !seen.includes(i))) storeSet('jg-badges', JSON.stringify(now));
  }
  const storeSet = store.set.bind(store);
  store.set = (k, v) => { storeSet(k, v); if (/-best$|^jg-secrets$/.test(k)) { clearTimeout(bdTimer); bdTimer = setTimeout(() => checkBadges(false), 400); } };
  checkBadges(true);
  function openBadges() {
    const u = unlocked(), names = t('badges'), ul = $('bdGrid'); ul.textContent = '';
    names.forEach(([n, d], i) => {
      const li = document.createElement('li'), ic = document.createElement('span'), b = document.createElement('b'), p = document.createElement('small');
      li.className = 'bd' + (u[i] ? ' on' : ''); ic.className = 'bd-ic'; ic.textContent = i < BADGES.length ? BADGES[i][0] : '🏆'; ic.setAttribute('aria-hidden', 'true');
      b.textContent = n; p.textContent = u[i] ? d : t('bdLocked') + ' · ' + d; li.append(ic, b, p); ul.append(li);
    });
    $('bdCount').textContent = t('bdCount')(u.filter(Boolean).length, names.length);
    closeTerm(); openPanel('bdPanel', 'bdShare');
  }
  $('bdShare').addEventListener('click', async () => {
    const u = unlocked(), names = t('badges'), got = names.filter((x, i) => u[i]).map(x => x[0]);
    const text = t('bdShareText')(got.length, names.length, got.join(', '), SITE_URL);
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { navigator.share({ title: 'Jérémy Grosjean', text, url: SITE_URL }).catch(() => {}); return; }
    if (await copyText(text)) toast(t('bdCopied'));
  });
  $('bdClose').addEventListener('click', closePanels);
  for (const id of ['badgesBtn', 'scBadges']) $(id).addEventListener('click', () => { closePanels(); openBadges(); });

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


  /* ================= Lot 16 : ergonomie et visuel des jeux ================= */
  const svgEl = (tag, attrs) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  /* Une icône au trait par jeu (dessinée élément par élément : compatible avec la politique de sécurité du site) */
  const GICON = {
    pickServer: [['path', { d: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z' }], ['path', { d: 'M9 12l2 2 4-4', class: 'a-ck', pathLength: 10 }]],
    pickSupport: [['path', { d: 'M4 13a8 8 0 0 1 16 0' }], ['rect', { x: 3, y: 13, width: 4, height: 6, rx: 1.5 }], ['rect', { x: 17, y: 13, width: 4, height: 6, rx: 1.5 }]],
    pickSupport2: [['path', { d: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z' }]],
    pickPanne: [['g', { class: 'a-loupe' }, [['circle', { cx: 11, cy: 11, r: 6 }], ['path', { d: 'M20 20l-4.5-4.5' }]]]],
    pickQuiz: [['path', { d: 'M3 7h7l2 2h9v10H3z' }], ['path', { d: 'M3 7V5h6l2 2' }]],
    pickPhish: [['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }], ['path', { d: 'M3 8l9 6 9-6' }]],
    pickItil: [['path', { d: 'M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z' }], ['path', { d: 'M10 6v12', 'stroke-dasharray': '2 2' }]],
    pickPs: [['rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }], ['path', { d: 'M7 10l3 2-3 2M12 15h5' }]],
    pickRj: [['g', { class: 'a-plug' }, [['path', { d: 'M6 4h12v9l-3 3v4H9v-4l-3-3z' }], ['path', { d: 'M9 4v4M12 4v4M15 4v4' }]]]],
    pickCall: [['path', { d: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2', class: 'a-ring' }]],
    pickDaily: [['rect', { x: 4, y: 5, width: 16, height: 15, rx: 2 }], ['path', { d: 'M4 9h16M8 3v4M16 3v4M9 14l2 2 4-4' }]],
    pickPrep: [['rect', { x: 3, y: 4, width: 18, height: 12, rx: 2 }], ['path', { d: 'M8 20h8M12 16v4' }]],
    pickRansom: [['rect', { x: 5, y: 10, width: 14, height: 10, rx: 2 }], ['path', { d: 'M8 10V7a4 4 0 0 1 8 0v3', class: 'a-shk' }], ['path', { d: 'M12 14v2' }]],
    pickReply: [['path', { d: 'M4 5h16v11H9l-5 4z' }], ['path', { d: 'M8 9h8M8 12h5' }]],
    pickNoNet: [['circle', { cx: 12, cy: 12, r: 8 }], ['path', { d: 'M4 12h16M12 4c-3 3-3 13 0 16M12 4c3 3 3 13 0 16' }], ['path', { d: 'M5 5l14 14', class: 'a-shk' }]],
    pickSubnet: [['circle', { cx: 12, cy: 5, r: 2 }], ['circle', { cx: 5, cy: 19, r: 2 }], ['circle', { cx: 19, cy: 19, r: 2 }], ['path', { d: 'M12 7v5M12 12l-6 5M12 12l6 5' }]]
  };
  function drawParts(parent, parts) { for (const [tg, at, kids] of parts) { const e = svgEl(tg, at); if (kids) drawParts(e, kids); parent.append(e); } }
  /* Fiche de chaque jeu : catégorie, durée, difficulté (1 à 3), clé du meilleur score, score maximal, fenêtre */
  const GAMES = [
    ['pickDaily', 'all', 1, 1, null, 0, 'dyPanel'],
    ['pickServer', 'sec', 3, 2, 'jg-firewall-best', 0, 'intro'], ['pickSupport', 'sup', 3, 1, 'jg-support-best', 50, 'supportPanel'],
    ['pickSupport2', 'sup', 4, 3, 'jg-support2-best', 50, 'supportPanel'], ['pickPanne', 'net', 4, 2, 'jg-panne-best', PN_ROUND * 100, 'panPanel'], ['pickNoNet', 'net', 3, 2, 'jg-noint-best', NI_ROUND * NI_PTS, 'niPanel'],
    ['pickQuiz', 'sys', 4, 2, 'jg-quiz-best', QZ_ROUND * 10, 'quizPanel'], ['pickPhish', 'sec', 3, 1, 'jg-phish-best', 60, 'phPanel'],
    ['pickItil', 'sup', 3, 2, 'jg-itil-best', 160, 'itPanel'], ['pickPs', 'sys', 3, 3, 'jg-ps-best', 80, 'psPanel'],
    ['pickRj', 'net', 2, 2, 'jg-rj45-best', 200, 'rjPanel'], ['pickCall', 'sup', 2, 1, 'jg-call-best', 16, 'clPanel'],
    ['pickPrep', 'sys', 2, 1, 'jg-prep-best', 80, 'prPanel'], ['pickRansom', 'sec', 2, 2, 'jg-ransom-best', 100, 'rwPanel'],
    ['pickReply', 'sup', 2, 1, 'jg-reply-best', 80, 'rpPanel'], ['pickSubnet', 'net', 3, 3, 'jg-subnet-best', 200, 'snPanel']
  ];
  const GNEW = ['pickNoNet'];
  const CATS = [['all', 'catAll'], ['sup', 'catSup'], ['sys', 'catSys'], ['net', 'catNet'], ['sec', 'catSec']];
  const GAME_PANELS = ['supportPanel', 'panPanel', 'quizPanel', 'phPanel', 'snPanel', 'itPanel', 'psPanel', 'rjPanel', 'clPanel', 'dyPanel', 'prPanel', 'rwPanel', 'rpPanel', 'niPanel'];
  let gTab = (() => { const v = store.get('jg-games-tab'); return CATS.some(c => c[0] === v) ? v : 'all'; })();
  const nfmt = v => { try { return new Intl.NumberFormat(t('locale')).format(v); } catch (e) { return String(v); } };
  function decoratePicks() {
    const box = document.querySelector('#gamesPanel .game-pick'); if (!box) return;
    let tabs = document.getElementById('gTabs');
    if (!tabs) { tabs = document.createElement('div'); tabs.id = 'gTabs'; tabs.className = 'g-tabs'; tabs.setAttribute('role', 'tablist'); box.before(tabs); }
    tabs.setAttribute('aria-label', t('catLbl')); tabs.textContent = '';
    for (const [c, key] of CATS) {
      const n = GAMES.filter(g => c === 'all' || g[1] === c).length, b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.cat = c; b.setAttribute('aria-selected', String(c === gTab));
      const s = document.createElement('span'); s.textContent = n; b.append(t(key) + ' ', s);
      b.addEventListener('click', () => { gTab = c; store.set('jg-games-tab', c); decoratePicks(); SND.key(); }); tabs.append(b);
    }
    for (const [id, cat, min, diff, key, max] of GAMES) {
      const p = $(id); if (!p) continue; p.classList.add('has-ic'); p.dataset.cat = cat; p.hidden = !(gTab === 'all' || cat === gTab);
      let ic = p.querySelector('.g-ic'); if (!ic) { ic = document.createElement('span'); ic.className = 'g-ic'; ic.setAttribute('aria-hidden', 'true'); const sv = svgEl('svg', { viewBox: '0 0 24 24' }); drawParts(sv, GICON[id] || []); ic.append(sv); p.prepend(ic); }
      let meta = p.querySelector('.g-meta'); if (!meta) { meta = document.createElement('small'); meta.className = 'g-meta'; p.append(meta); }
      const dots = '●'.repeat(diff) + '○'.repeat(3 - diff), dl = t('gDiff')[diff - 1];
      meta.textContent = `${t('gMin')(min)} · `; const d = document.createElement('span'); d.className = 'g-diff'; d.textContent = dots; d.title = t('gDiffL')(dl); d.setAttribute('aria-label', t('gDiffL')(dl)); meta.append(d);
      let st = p.querySelector('.g-state'); if (st) st.remove();
      p.classList.remove('has-state');
      const raw = key ? store.get(key) : null, played = raw !== null && raw !== undefined && raw !== '';
      if (played) { st = document.createElement('span'); st.className = 'g-state done'; st.textContent = '✓ ' + nfmt(+raw) + (max ? '/' + nfmt(max) : ''); st.title = t('gPlayed')(raw); p.append(st); p.classList.add('has-state'); }
      else if (GNEW.includes(id)) { st = document.createElement('span'); st.className = 'g-state new'; st.textContent = t('gNew'); p.append(st); p.classList.add('has-state'); }
    }
  }

  /* Fin de partie : anneau de score, étoiles, record, jeu suggéré et bouton « Autre jeu » */
  const BEST0 = {};
  const gameOf = pid => pid === 'supportPanel' ? (SP.level === 2 ? 'pickSupport2' : 'pickSupport') : (GAMES.find(g => g[6] === pid) || [])[0];
  const gmeta = id => GAMES.find(g => g[0] === id);
  function onPanelOpen(id) {
    const pn = $(id); if (!pn) return;
    pn.querySelectorAll('.end-viz').forEach(e => e.remove());
    const ob = pn.querySelector('.end-other'); if (ob) ob.hidden = true;
    const g = id === 'intro' || id === 'levelPanel' ? 'pickServer' : gameOf(id);
    if (g && id !== 'over') { const m = gmeta(g); if (m && m[4]) BEST0[g] = +store.get(m[4]) || 0; }
    if (GAME_PANELS.includes(id)) progressFor(pn, true);
    if (id === 'gamesPanel') decoratePicks();
  }
  function suggestFor(id) {
    const m = gmeta(id), list = GAMES.filter(g => g[0] !== id && g[0] !== 'pickDaily' && g[0] !== 'pickSupport2');
    const unplayed = g => !g[4] || store.get(g[4]) === null;
    return (list.find(g => g[1] === m[1] && unplayed(g)) || list.find(unplayed) || list.find(g => g[1] === m[1]) || list[0])[0];
  }
  function roundScore(pid) {
    switch (pid) {
      case 'supportPanel': return [SP.score, SP.list.length * 10];
      case 'panPanel': return [PN.score, PN.list.length * 100];
      case 'quizPanel': return [QZ.score, QZ.list.length * 10];
      case 'phPanel': return [PH.score, PH.list.length * 10];
      case 'snPanel': return [SN.score, SN.list.length * 20];
      case 'itPanel': return [IT.score, IT.list.length * 20];
      case 'psPanel': return [PSG.score, PSG.list.length * 10];
      case 'rjPanel': return [RJ.score, 200];
      case 'clPanel': return [CL.rel + CL.tech, t('call').length * 4];
      case 'prPanel': return [Math.max(0, t('prSteps').length * 10 - PR.err * 10), t('prSteps').length * 10];
      case 'rwPanel': return [RS.score, t('ransom').length * 20];
      case 'rpPanel': return [RP.score, t('replies').length * 40];
      case 'niPanel': return [NI.score, NI.list.length * NI_PTS];
      case 'over': return [G.score, 0];
    }
    return null;
  }
  function onGameEnd() {
    const pn = document.querySelector('.panel.open'); if (!pn) return;
    const pid = pn.id, sc = roundScore(pid); if (!sc) return;
    const id = pid === 'over' ? 'pickServer' : gameOf(pid); if (!id) return;
    const [score, max] = sc, prev = BEST0[id] || 0, record = score > 0 && score > prev, card = pn.querySelector('.card');
    pn.querySelectorAll('.end-viz').forEach(e => e.remove());
    const box = document.createElement('div'); box.className = 'end-viz';
    if (max) {
      const pct = Math.max(0, Math.min(100, Math.round(score / max * 100))), stars = pct >= 100 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
      const ring = document.createElement('div'); ring.className = 'end-ring'; ring.style.setProperty('--p', reduce ? pct : 0);
      const inner = document.createElement('div'), b = document.createElement('b'), s = document.createElement('small');
      b.textContent = nfmt(score); s.textContent = t('endOf')(nfmt(max)); inner.append(b, s); ring.append(inner);
      ring.setAttribute('role', 'img'); ring.setAttribute('aria-label', `${score} ${t('endOf')(max)}`);
      const st = document.createElement('p'); st.className = 'end-stars'; st.setAttribute('aria-label', t('endStars')(stars));
      for (let i = 0; i < 3; i++) { const x = document.createElement('span'); x.textContent = '★'; if (i < stars) x.className = 'on'; x.setAttribute('aria-hidden', 'true'); st.append(x); }
      box.append(ring, st);
      if (!reduce) requestAnimationFrame(() => requestAnimationFrame(() => ring.style.setProperty('--p', pct)));
      if (pct >= 100) celebrate();
    } else if (record) celebrate();
    if (record) { const r = document.createElement('p'); r.className = 'end-record'; r.textContent = t('endRecord'); box.append(r); }
    const nx = suggestFor(id), sg = document.createElement('p'), sb = document.createElement('button'); sg.className = 'end-next';
    sg.append(t('endNext') + ' '); sb.type = 'button'; sb.className = 'chip-btn'; sb.textContent = t(nx + 'T') + ' ▸';
    sb.addEventListener('click', () => { closePanels(); $(nx).click(); }); sg.append(sb); box.append(sg);
    const acts = card.querySelector(':scope > .actions'); if (acts) acts.before(box); else card.append(box);
    let ob = card.querySelector('.end-other');
    if (!ob && acts) { ob = document.createElement('button'); ob.type = 'button'; ob.className = 'btn-ghost end-other'; ob.addEventListener('click', () => { closePanels(); openGames(); }); const q = acts.querySelector('[id$="Quit"], #back'); if (q) q.before(ob); else acts.append(ob); }
    if (ob) { ob.textContent = t('endOther'); ob.hidden = false; }
  }
  const sndEnd = SND.end; SND.end = () => { sndEnd(); setTimeout(onGameEnd, 0); };

  /* Petite célébration : quelques confettis pendant une seconde (rien si l'on a demandé moins d'animations) */
  function celebrate() {
    if (reduce) return;
    const layer = document.createElement('div'); layer.className = 'confetti'; layer.setAttribute('aria-hidden', 'true');
    const cols = ['#5EE7FF', '#8B7CFF', '#4BE3A0', '#FFC857', '#FF5C7A'];
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('i'), s = c.style;
      s.left = (Math.random() * 100) + '%'; s.background = cols[i % cols.length];
      s.setProperty('--dx', ((Math.random() - .5) * 220).toFixed(0) + 'px'); s.setProperty('--r', ((Math.random() - .5) * 900).toFixed(0) + 'deg');
      s.animationDelay = (Math.random() * .25).toFixed(2) + 's'; s.animationDuration = (1 + Math.random() * .6).toFixed(2) + 's';
      layer.append(c);
    }
    document.body.append(layer); setTimeout(() => layer.remove(), 2200);
  }

  /* Barre de progression : lue dans l'étiquette « Étape 3/8 » de chaque jeu ; transition douce à chaque nouvelle question */
  function progressFor(pn, reset) {
    const tag = pn.querySelector('.tk-head .tag'); if (!tag) return;
    let bar = pn.querySelector('.prog-bar');
    if (!bar) { bar = document.createElement('div'); bar.className = 'prog-bar'; bar.setAttribute('aria-hidden', 'true'); tag.closest('.tk-head').after(bar); }
    const m = (tag.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) { if (reset) bar.hidden = true; else bar.querySelectorAll('i').forEach(i => { i.className = 'f'; }); return; }
    const n = +m[1], tot = Math.min(+m[2], 24); bar.hidden = false;
    if (bar.children.length !== tot) { bar.textContent = ''; for (let i = 0; i < tot; i++) bar.append(document.createElement('i')); }
    [...bar.children].forEach((i, k) => { i.className = k < n - 1 ? 'f' : k === n - 1 ? 'c' : ''; });
    const prev = +(bar.dataset.n || 0); bar.dataset.n = n;
    if (!reset && n !== prev && !reduce) { const card = pn.querySelector('.card'); card.classList.remove('q-in'); void card.offsetWidth; card.classList.add('q-in'); }
  }
  for (const pid of GAME_PANELS) {
    const pn = $(pid), tag = pn && pn.querySelector('.tk-head .tag'); if (!tag) continue;
    new MutationObserver(() => progressFor(pn, false)).observe(tag, { childList: true, characterData: true, subtree: true });
  }

  /* Raccourcis clavier dans les jeux : 1 à 9 pour répondre, Entrée pour la suite (Échap ferme déjà) */
  const isShown = el => !!(el && el.getClientRects().length);
  for (const pid of GAME_PANELS) {
    const card = $(pid) && $(pid).querySelector('.card'); if (!card || card.querySelector('.kbd-hint')) continue;
    const p = document.createElement('p'); p.className = 'kbd-hint'; p.dataset.i = 'kbdHint'; p.textContent = t('kbdHint'); card.append(p);
  }
  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || G.on || termOpen()) return;
    const pn = document.querySelector('.panel.open'); if (!pn || !GAME_PANELS.includes(pn.id)) return;
    const tag = (e.target && e.target.tagName) || ''; if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    if (/^[1-9]$/.test(e.key)) {
      const opts = [...pn.querySelectorAll('.card .tk-opt, .card .rj-wire')].filter(isShown), b = opts[+e.key - 1];
      if (b && !b.disabled) { e.preventDefault(); b.focus({ preventScroll: true }); b.click(); }
      return;
    }
    if (e.key === 'Enter' && !/^(BUTTON|A|SUMMARY)$/.test(tag)) {
      const b = [...pn.querySelectorAll('.card > .actions .btn')].find(x => isShown(x) && !x.disabled);
      if (b) { e.preventDefault(); b.click(); }
    }
  });

  /* Vibration légère sur téléphone (Android) pour une bonne ou une mauvaise réponse ; coupée avec le son */
  const canBuzz = () => soundOn && !G.on && typeof navigator.vibrate === 'function' && matchMedia('(pointer: coarse)').matches;
  const sndBlock = SND.block, sndWrong = SND.wrong;
  SND.block = (...a) => { sndBlock(...a); if (canBuzz()) try { navigator.vibrate(15); } catch (e) {} };
  SND.wrong = (...a) => { sndWrong(...a); if (canBuzz()) try { navigator.vibrate([25, 60, 25]); } catch (e) {} };

  /* Scènes : fenêtre PowerShell avec invite qui clignote, écran de rançon avec fichiers chiffrés */
  { const term = $('psTerm');
    if (term && !term.parentElement.classList.contains('ps-win')) {
      const win = document.createElement('div'), bar = document.createElement('div'), ttl = document.createElement('span'); win.className = 'ps-win'; bar.className = 'ps-bar';
      ttl.dataset.i = 'psWin'; ttl.textContent = t('psWin'); bar.append(document.createElement('i'), document.createElement('i'), document.createElement('i'), ttl);
      term.before(win); win.append(bar, term);
      new MutationObserver(() => { win.hidden = term.hidden && $('psOpts').hidden; if (term.hidden && !$('psOpts').hidden) { term.hidden = false; term.textContent = ''; const pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = 'PS C:\\> '; const cu = document.createElement('span'); cu.className = 'cur'; cu.textContent = '▌'; term.append(pr, cu); } })
        .observe($('psOpts'), { childList: true, attributes: true, attributeFilter: ['hidden'] });
    }
    const al = document.querySelector('#rwPanel .rs-alert');
    if (al && !al.nextElementSibling?.classList.contains('rw-files')) {
      const f = document.createElement('p'); f.className = 'rw-files'; f.setAttribute('aria-label', t('rwFiles'));
      for (const n of ['Comptabilite_2026.xlsx.locked', 'Factures_T3.pdf.locked', 'Paie_octobre.csv.locked']) { const s = document.createElement('span'); s.textContent = n; f.append(s); }
      al.after(f);
    }
  }

  /* Taille du texte : A++ en plus, et un bouton rapide dans la barre du bas */
  const SIZES = ['m', 'l', 'xl'];
  function sizeUI() {
    const b = $('sizeBtn'); if (!b) return; const nm = t('sizeNames')[A11Y.size] || 'A';
    b.querySelector('.lbl').textContent = nm; try { fxUI(); } catch (e) {} const lbl = t('sizeBtn') + (lang === 'fr' ? ' : ' : (lang === 'en' || lang === 'ko') ? ': ' : '：') + nm; b.setAttribute('aria-label', lbl); b.title = lbl;
  }
  { const seg = document.querySelector('.a11y .seg');
    if (seg && !seg.querySelector('[data-size="xl"]')) { const x = document.createElement('button'); x.type = 'button'; x.dataset.size = 'xl'; x.setAttribute('aria-pressed', String(A11Y.size === 'xl')); x.textContent = 'A++'; seg.append(x);
      x.addEventListener('click', () => { A11Y.size = 'xl'; applyA11y(); SND.key(); setup(); sizeUI(); }); }
    seg && seg.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => setTimeout(sizeUI, 0)));
    const sb = $('sizeBtn');
    if (sb) sb.addEventListener('click', () => { const i = SIZES.indexOf(A11Y.size); A11Y.size = SIZES[(i + 1) % SIZES.length]; applyA11y(); SND.key(); setup(); sizeUI(); });
    if (A11Y.size === 'xl') applyA11y();
  }

  /* Contraste élevé : suivi automatique du réglage du système tant que la personne n'a pas choisi elle-même */
  { let saved = {}; try { saved = JSON.parse(store.get('jg-a11y') || '{}'); } catch (e) {}
    const mq = matchMedia('(prefers-contrast: more)');
    if (!('contrastSet' in saved) && mq.matches && !A11Y.contrast) { A11Y.contrast = true; applyA11y(); requestAnimationFrame(readPalette); }
    $('a11yContrast').addEventListener('change', () => { A11Y.contrastSet = true; store.set('jg-a11y', JSON.stringify(A11Y)); });
  }


  /* ================= Lot 17 : graphisme (couleur par catégorie, bandeaux, jauges de supervision, ciel de Paris) ================= */
  const CAT_KEY = { sup: 'catSup', sys: 'catSys', net: 'catNet', sec: 'catSec' };
  const BAND_ICON = {
    contactPanel: ['cyan', [['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }], ['path', { d: 'M3 8l9 6 9-6' }]]],
    secPanel: ['ok', [['path', { d: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z' }], ['path', { d: 'M9 12l2 2 4-4' }]]],
    supPanel: ['net', [['path', { d: 'M3 12h4l2.5-6 4 12 2.5-6H21' }]]]
  };
  /* Bandeau en tête d'une fenêtre : grande icône sur un dégradé de la couleur de la catégorie */
  function bandFor(pn) {
    const card = pn.querySelector('.card'); if (!card) return;
    let band = card.querySelector(':scope > .g-band');
    const mk = () => { const b = document.createElement('div'); b.className = 'g-band'; b.setAttribute('aria-hidden', 'true'); const xw = card.querySelector(':scope > .panel-x-wrap'); if (xw) xw.after(b); else card.prepend(b); return b; };
    if (BAND_ICON[pn.id]) {
      const [cat, parts] = BAND_ICON[pn.id]; pn.dataset.cat = cat;
      if (!band) { const h2 = card.querySelector(':scope > h2'); band = mk(); band.classList.add('slim'); band.removeAttribute('aria-hidden'); const ic = document.createElement('span'); ic.className = 'gb-ic'; ic.setAttribute('aria-hidden', 'true'); const sv = svgEl('svg', { viewBox: '0 0 24 24' }); drawParts(sv, parts); ic.append(sv); band.append(ic); if (h2) band.append(h2); }
      return;
    }
    const id = gameOf(pn.id); if (!id) return; const m = gmeta(id); if (!m) return;
    const [, cat, min, diff] = m; pn.dataset.cat = cat;
    if (!band) band = mk(); band.textContent = '';
    const ic = document.createElement('span'), tx = document.createElement('span'), b = document.createElement('b'), sm = document.createElement('small');
    ic.className = 'gb-ic'; const sv = svgEl('svg', { viewBox: '0 0 24 24' }); drawParts(sv, GICON[id] || []); ic.append(sv);
    b.textContent = t(id + 'T'); sm.textContent = [CAT_KEY[cat] ? t(CAT_KEY[cat]) : null, t('gMin')(min), '●'.repeat(diff) + '○'.repeat(3 - diff)].filter(Boolean).join(' · ');
    tx.append(b, sm); band.append(ic, tx);
  }
  { const prevOpen = onPanelOpen; onPanelOpen = function (id) { prevOpen(id); const pn = $(id); if (pn && (GAME_PANELS.includes(id) || BAND_ICON[id])) bandFor(pn); if (id === 'supPanel') try { supGauges(); } catch (e) {} }; }

  /* Supervision : deux jauges (jours restants du certificat, disponibilité sur 30 jours) au-dessus de la liste */
  function arcGauge(frac, cls, big, small) {
    const g = document.createElement('div'), sv = svgEl('svg', { viewBox: '0 0 100 56', 'aria-hidden': 'true' }), b = document.createElement('b'), s = document.createElement('small');
    g.className = 'gauge ' + cls;
    sv.append(svgEl('path', { d: 'M8 52a42 42 0 0 1 84 0', class: 'g-track' }));
    const arc = svgEl('path', { d: 'M8 52a42 42 0 0 1 84 0', class: 'g-val', pathLength: 100, 'stroke-dasharray': (reduce ? Math.round(frac * 100) : 0) + ' 100' }); sv.append(arc);
    if (!reduce) requestAnimationFrame(() => requestAnimationFrame(() => arc.setAttribute('stroke-dasharray', Math.round(frac * 100) + ' 100')));
    b.textContent = big; s.textContent = small; g.append(sv, b, s); return g;
  }
  function supGauges() {
    const old = document.getElementById('supGauges'); if (old) old.remove();
    const st = ST(); if (!st) return; const S = t('supLabels'), box = document.createElement('div'); box.id = 'supGauges'; box.className = 'gauges';
    if (typeof st.tlsDays === 'number') box.append(arcGauge(Math.max(0, Math.min(1, st.tlsDays / 90)), st.tlsDays > 20 ? 'ok' : st.tlsDays > 0 ? 'warn' : 'bad', t('gDays')(st.tlsDays), S.tls));
    if (typeof st.uptime30 === 'number') box.append(arcGauge(Math.max(0, Math.min(1, (st.uptime30 - 95) / 5)), st.uptime30 >= 99.5 ? 'ok' : st.uptime30 >= 98 ? 'warn' : 'bad', String(st.uptime30).replace('.', lang === 'fr' ? ',' : '.') + ' %', S.uptime || 'Uptime'));
    if (box.children.length) $('supList').before(box);
  }

  /* Ciel de Paris : en thème sombre, le fond suit doucement l'heure (aube, journée, soir, nuit) */
  function skyNow() {
    if (!A11Y.sky) { delete document.documentElement.dataset.sky; return; }
    let h = 12; try { h = parseInt(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Paris' }).format(new Date()), 10); } catch (e) {}
    const s = h >= 6 && h < 9 ? 'dawn' : h >= 9 && h < 18 ? 'day' : h >= 18 && h < 21 ? 'dusk' : 'night';
    if (document.documentElement.dataset.sky !== s) document.documentElement.dataset.sky = s;
  }
  skyNow(); setInterval(skyNow, 60000);


  /* ================= Lot 18 : indices progressifs, taille par défaut, effets visuels sur demande ================= */
  /* Indices : 3 niveaux, de plus en plus précis (retirer des mauvaises réponses, un mot de la bonne réponse, la bonne réponse) */
  let DY_OK = '';
  const HINTS = {
    supportPanel: { box: 'tkOpts', ok: () => { const { tk } = cur(); return tk.opts[tk.ok]; }, pen: () => {}, cost: true },
    quizPanel: { box: 'qzOpts', ok: () => t('quizAD')[QZ.list[QZ.i].k][1][0], pen: () => { QZ.wrong = true; }, cost: true },
    psPanel: { box: 'psOpts', ok: () => PS_CMD[PSG.list[PSG.i].k][0], pen: () => { PSG.wrong = true; }, cost: true },
    rjPanel: { box: 'rjOpts', ok: () => t('rjOpts')[0], pen: () => { RJ.qWrong = true; }, cost: true },
    clPanel: { box: 'clOpts', ok: () => t('call')[CL.i][1][0][0], pen: () => {} },
    dyPanel: { box: 'dyOpts', ok: () => DY_OK, pen: () => {} },
    prPanel: { box: 'prOpts', ok: () => t('prSteps')[PR.pos][0], pen: () => { PR.err++; $('prScore').textContent = t('qzPts')(Math.max(0, t('prSteps').length * 10 - PR.err * 10)); }, cost: true },
    rwPanel: { box: 'rwOpts', ok: () => t('ransom')[RS.i][1][0], pen: () => { RS.wrong = true; }, cost: true },
    rpPanel: { box: 'rpOpts', ok: () => t('replies')[RP.i][2][RP.slot][0][0], pen: () => {} },
    niPanel: { box: 'niOpts', ok: () => NI.okTxt, pen: () => { if (NI.phase === 'step') NI.wrong++; else NI.fixWrong = true; }, cost: true },
    phPanel: { box: 'phOpts', phish: true, sig: () => 'm' + PH.i }
  };
  const HS = {};
  function clueWord(okTxt, others) {
    const low = others.map(o => o.toLowerCase()), free = w => w && !low.some(o => o.includes(w.toLowerCase()));
    if (/[\u3040-\u30ff\u3400-\u9fff]/.test(okTxt)) {
      /* chinois : pas d'espaces, on prend 2 à 4 caractères chinois absents des autres réponses */
      const runs = okTxt.match(/[\u3040-\u30ff\u3400-\u9fff]+/g) || [];
      for (const n of [4, 3, 2]) for (const r of runs) for (let k = 0; k + n <= r.length; k++) { const sub = r.slice(k, k + n); if (free(sub)) return sub; }
      return '';
    }
    const words = okTxt.split(/[\s,.;:!?()«»“”"'’/|=，。：；！？（）、]+/).filter(w => w.length >= (/[\uac00-\ud7af]/.test(w) ? 2 : 4) && !/^\d+$/.test(w) && free(w)).sort((a, b) => b.length - a.length);
    return words[0] || '';
  }
  function hintRow(pid) {
    const cfg = HINTS[pid], box = $(cfg.box); let row = box.parentElement.querySelector(':scope > .hint-row');
    if (!row) {
      row = document.createElement('div'); row.className = 'hint-row';
      const b = document.createElement('button'), p = document.createElement('p'), c = document.createElement('small');
      b.type = 'button'; b.className = 'chip-btn hint-btn'; p.className = 'hint-txt'; p.setAttribute('aria-live', 'polite'); c.className = 'hint-cost';
      b.addEventListener('click', () => useHint(pid)); row.append(b, p, c); box.after(row);
    }
    return row;
  }
  function hintRefresh(pid) {
    const cfg = HINTS[pid], box = $(cfg.box), row = hintRow(pid), st = HS[pid] || (HS[pid] = { lvl: 0, sig: '' });
    const btns = [...box.querySelectorAll('button')].filter(isShown);
    const sig = cfg.sig ? cfg.sig() : btns.map(b => b.textContent).join('|');
    if (sig !== st.sig) { st.sig = sig; st.lvl = 0; row.querySelector('.hint-txt').textContent = ''; row.querySelector('.hint-cost').textContent = ''; }
    const open = !box.hidden && btns.length > 1 && !box.querySelector('.good:not(.hint-good)') && btns.some(b => !b.disabled);
    row.hidden = !open;
    const hb = row.querySelector('.hint-btn'); hb.hidden = st.lvl >= 3; hb.textContent = st.lvl === 0 ? t('hintBtn') : t('hintMore')(st.lvl + 1, 3);
  }
  function useHint(pid) {
    const cfg = HINTS[pid], box = $(cfg.box), row = hintRow(pid), st = HS[pid], txt = row.querySelector('.hint-txt');
    if (!st || st.lvl >= 3) return;
    if (cfg.phish) {
      const sus = [...document.querySelectorAll('#phMail .ph-sus')];
      if (!sus.length) { txt.textContent = t('phHintNone'); st.lvl = 3; hintRefresh(pid); SND.key(); return; }
      st.lvl++; const n = st.lvl >= 3 ? sus.length : Math.min(sus.length, st.lvl);
      sus.slice(0, n).forEach(s => s.classList.add('hint-on')); if (n >= sus.length) st.lvl = 3;
      txt.textContent = st.lvl >= 3 ? t('phHintAll') : t('phHint')(st.lvl, 3); hintRefresh(pid); SND.key(); return;
    }
    const btns = [...box.querySelectorAll('button')].filter(isShown), okTxt = cfg.ok(), good = btns.find(b => b.textContent === okTxt);
    if (!good) return;
    const live = () => btns.filter(b => b !== good && !b.disabled);
    const drop = list => list.forEach(b => { b.classList.add('hint-off', 'bad'); b.disabled = true; });
    if (st.lvl === 0) {
      cfg.pen(); const w = shuffle(live()), n = Math.max(1, Math.floor(w.length / 2)); drop(w.slice(0, n));
      txt.textContent = t('hint1')(n); if (cfg.cost) row.querySelector('.hint-cost').textContent = t('hintCost'); st.lvl = 1;
    } else if (st.lvl === 1) {
      const w = live();
      if (w.length > 1) { drop(shuffle(w).slice(0, w.length - 1)); txt.textContent = t('hint2r'); st.lvl = 2; }
      else { const word = clueWord(okTxt, w.map(b => b.textContent)), first = okTxt.trim().slice(0, 1);
        if (word) { txt.textContent = t('hint2w')(word); st.lvl = 2; }
        else if (first && okTxt.trim().length > 1 && !w.some(b => b.textContent.trim().startsWith(first))) { txt.textContent = t('hint2s')(first); st.lvl = 2; }
        else { good.classList.add('hint-good'); txt.textContent = t('hint3'); st.lvl = 3; } }
    } else { good.classList.add('hint-good'); txt.textContent = t('hint3'); st.lvl = 3; }
    SND.key(); hintRefresh(pid);
  }
  for (const pid in HINTS) {
    const box = $(HINTS[pid].box); if (!box || !document.getElementById(HINTS[pid].box)) continue;
    hintRow(pid);
    new MutationObserver(() => hintRefresh(pid)).observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'hidden'] });
  }
  { const prevOpen2 = onPanelOpen; onPanelOpen = function (id) { prevOpen2(id); if (HINTS[id]) { HS[id] = { lvl: 0, sig: '' }; setTimeout(() => hintRefresh(id), 0); } }; }

  /* Taille du texte : retour à la taille par défaut (dans l'Affichage et à côté du bouton rapide) */
  function sizeDefault() { A11Y.size = 'm'; applyA11y(); SND.key(); setup(); sizeUI(); fxUI(); toast(t('a11ySizeReset')); }
  $('sizeReset').addEventListener('click', sizeDefault);
  $('sizeResetDock').addEventListener('click', sizeDefault);

  /* Effets visuels sur demande (désactivés par défaut, gardés dans ce navigateur) */
  function fxUI() {
    $('fxSky').checked = !!A11Y.sky; $('fxJg').checked = !!A11Y.jg; $('fxSeason').checked = !!A11Y.season; $('fxJgPlay').hidden = !A11Y.jg;
    const s = seasonNow(); $('fxSeasonNow').textContent = '(' + (s ? t('seasons')[s] : t('a11ySeasonNone')) + ')';
    $('sizeResetDock').hidden = A11Y.size === 'm'; $('sizeResetDock').setAttribute('aria-label', t('a11ySizeReset')); $('sizeResetDock').title = t('a11ySizeReset');
  }
  const saveA11y = () => store.set('jg-a11y', JSON.stringify(A11Y));
  $('fxSky').addEventListener('change', e => { A11Y.sky = e.target.checked; saveA11y(); skyNow(); SND.key(); });
  $('fxJg').addEventListener('change', e => { A11Y.jg = e.target.checked; saveA11y(); fxUI(); if (A11Y.jg) { closePanels(); setTimeout(jgPlay, 250); } });
  $('fxJgPlay').addEventListener('click', () => { closePanels(); setTimeout(jgPlay, 250); });
  $('fxSeason').addEventListener('change', e => { A11Y.season = e.target.checked; saveA11y(); seasonDraw(); SND.key(); });
  $('a11yResetAll').addEventListener('click', () => {
    for (const k of Object.keys(A11Y)) delete A11Y[k];
    Object.assign(A11Y, { size: 'm', contrast: !!matchMedia('(prefers-contrast: more)').matches, font: false, sky: false, jg: false, season: false });
    applyA11y(); requestAnimationFrame(readPalette); setup(); sizeUI(); skyNow(); seasonDraw(); fxUI(); SND.key(); toast(t('a11yResetDone'), 2200);
  });

  /* Initiales « JG » : les points du réseau se rassemblent puis se dispersent (comme le code Konami, sans le reste) */
  function jgPlay() {
    if (G.on || termOpen() || document.querySelector('.panel.open') || recOn() || morph.on) return;
    morphJG();
  }
  if (A11Y.jg) setTimeout(() => safe('jg', jgPlay), 2600);

  /* Décor de saison : Halloween, hiver, Saint-Valentin (heure de Paris), jamais sur la vue recruteur ni à l'impression */
  function seasonNow() {
    let md = ''; try { md = new Intl.DateTimeFormat('en-GB', { month: '2-digit', day: '2-digit', timeZone: 'Europe/Paris' }).format(new Date()).split('/').reverse().join('-'); } catch (e) { return null; }
    if (md >= '10-15' && md <= '11-02') return 'halloween';
    if (md >= '12-01' || md <= '01-06') return 'winter';
    if (md >= '02-07' && md <= '02-14') return 'valentine';
    return null;
  }
  function seasonDraw() {
    let layer = document.getElementById('seasonFx'); const s = A11Y.season ? seasonNow() : null;
    if (!s) { if (layer) layer.remove(); return; }
    if (layer && layer.dataset.s === s) return; if (layer) layer.remove();
    layer = document.createElement('div'); layer.id = 'seasonFx'; layer.className = 'season-fx ' + s; layer.dataset.s = s; layer.setAttribute('aria-hidden', 'true');
    const add = (txt, cls, css) => { const e = document.createElement('span'); e.textContent = txt; e.className = cls; for (const k in css) e.style.setProperty(k, css[k]); layer.append(e); };
    if (s === 'halloween') { add('🎃', 'sf-pk', { left: '3%', bottom: 'calc(4.5rem + 2vh)' }); add('🎃', 'sf-pk small', { right: '4%', top: '42%' }); for (let i = 0; i < 4; i++) add('🦇', 'sf-bat', { left: (12 + i * 22) + '%', top: (10 + (i % 2) * 9) + '%', '--d': (6 + i * 1.7) + 's', '--o': (-i * 1.3) + 's' }); }
    if (s === 'winter') for (let i = 0; i < 28; i++) add('❄', 'sf-flake', { left: (Math.random() * 100).toFixed(1) + '%', '--d': (7 + Math.random() * 7).toFixed(1) + 's', '--o': (-Math.random() * 12).toFixed(1) + 's', 'font-size': (8 + Math.random() * 9).toFixed(0) + 'px' });
    if (s === 'valentine') for (let i = 0; i < 10; i++) add(['💙', '💜', '🩵'][i % 3], 'sf-heart', { left: (5 + i * 9.5) + '%', '--d': (9 + i % 4 * 2) + 's', '--o': (-i * 1.4) + 's' });
    document.body.append(layer);
  }
  seasonDraw(); setInterval(seasonDraw, 3600000);
  fxUI();

  function lot16Lang() { sizeUI(); if ($('gamesPanel').classList.contains('open')) decoratePicks(); document.querySelectorAll('.end-other').forEach(b => { b.textContent = t('endOther'); }); }
  lot16Lang();

  /* Texte d'aide « Bougez la souris… » : toujours juste au-dessus des boutons du bas, même quand ils tiennent sur deux lignes */
  function placeHint() {
    const d = document.querySelector('.dock'); if (!d) return;
    const r = d.getBoundingClientRect();
    if (r.height && r.top < innerHeight && r.bottom > 0) document.documentElement.style.setProperty('--hint-b', Math.round(innerHeight - r.top + 6) + 'px');
    else document.documentElement.style.removeProperty('--hint-b');
    /* sur un petit écran, si le texte d'aide tomberait sur les boutons ou le contenu, on ne l'affiche pas (simple conseil passager) */
    const h = document.querySelector('.hint'); if (!h) return; h.classList.remove('hint-cache');
    requestAnimationFrame(() => {
      const s = [...h.querySelectorAll('span')].map(x => x.getBoundingClientRect()).find(x => x.width > 0); if (!s) return;
      const gene = [...document.querySelectorAll('.cta, .keys, .scores, .avail, .bootlog')].some(e => { const q = e.getBoundingClientRect(); return q.width > 0 && s.left < q.right && q.left < s.right && s.top < q.bottom && q.top < s.bottom; });
      h.classList.toggle('hint-cache', gene);
    });
  }
  placeHint(); addEventListener('resize', placeHint); addEventListener('scroll', placeHint, { passive: true }); setTimeout(placeHint, 1200);

  /* ================= Visite guidée (une seule fois, passable) ================= */
  const tourRing = $('tourRing'), tourTip = $('tourTip');
  let tourSteps = [], tourI = 0;
  const visible = el => { if (!el || !el.getBoundingClientRect) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  function startTour(force) {
    if (!force && store.get('jg-tour') === '1') return;
    if (G.on || panels.some(p => $(p).classList.contains('open')) || termOpen()) { if (!force) return; closePanels(); closeTerm(); }
    const map = { contactBtn: 'tourContact', availBtn: 'tourBrief', openGame: NB_JEUX && typeof t('tourPlayN') === 'function' ? 'tourPlayN' : 'tourPlay', termBtn: 'tourTerm', secBtn: 'tourSec', supBtn: 'tourSup', keysBtn: 'tourKeys' };
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
    const tx = t(key); $('tourText').textContent = typeof tx === 'function' ? tx(NB_JEUX) : tx;
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
    let mLast = t0;
    (function f(now) {
      if (stop) return; if (now - t0 > dur) { end(); return; }
      const mf = Math.min(7.2, Math.max(.05, (now - mLast) / 16.667)); mLast = now; const fade = (1 - Math.pow(.84, mf)).toFixed(3);
      g.fillStyle = light ? `rgba(247,249,255,${fade})` : `rgba(10,15,36,${fade})`; g.fillRect(0, 0, innerWidth, innerHeight);
      g.fillStyle = light ? '#0E8A5A' : '#4BE3A0'; g.font = fs + 'px ui-monospace, Menlo, monospace';
      for (let i = 0; i < cols; i++) { g.fillText(chars[(Math.random() * chars.length) | 0], i * fs, drops[i] * fs); drops[i] = drops[i] * fs > innerHeight && Math.random() > Math.pow(.975, mf) ? 0 : drops[i] + (reduce ? .5 : 1) * mf; }
      requestAnimationFrame(f);
    })(t0);
  }

  /* ================= « htop » secret : FPS, nœuds, mémoire (touche F ou commande htop) ================= */
  let htopOn = false, htopFrames = 0, htopLast = 0, htopFps = 0, htopTimer = 0, htopHz = 60, htopPrev = 0; const htopGaps = [];
  const t0page = performance.now();
  function htopLoop(now) {
    if (!htopOn) return;
    htopFrames++; if (htopPrev) { htopGaps.push(now - htopPrev); if (htopGaps.length > 60) htopGaps.shift(); } htopPrev = now;
    if (now - htopLast >= 500) {
      htopFps = Math.round(htopFrames * 1000 / (now - htopLast)); htopFrames = 0; htopLast = now;
      /* Fréquence de l'écran : intervalle médian entre deux images (1 Hz à 500 Hz) */
      if (htopGaps.length > 5) { const s = htopGaps.slice().sort((a, b) => a - b), med = s[s.length >> 1]; const raw = 1000 / Math.max(2, med), STD = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 175, 180, 200, 240, 280, 300, 360, 480, 500]; const near = STD.find(v => Math.abs(v - raw) / v < .07); htopHz = Math.max(1, Math.min(500, near || Math.round(raw))); }
    }
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
      if (kind === 'fps') { const ref = Math.max(1, htopHz); dd.textContent = htopFps ? `${htopFps} / ${ref} Hz` : '…'; dd.className = htopFps >= ref * .8 ? 'ok' : htopFps >= Math.min(30, ref * .5) ? 'warn' : 'bad'; const bar = document.createElement('i'); bar.className = 'fbar'; bar.style.width = Math.min(100, (htopFps / ref) * 100) + '%'; dd.append(bar); }
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
  $('pauseBtn').addEventListener('click', togglePause);
  $('pzResume').addEventListener('click', resumeGame);
  $('pzQuit').addEventListener('click', quitGame);
  $('pzSave').addEventListener('click', saveAndQuit);
  $('lvQuit').addEventListener('click', pauseGame);
  $('rsResume').addEventListener('click', resumeSaved);
  $('rsNew').addEventListener('click', () => { dropSave(); startGame(); });
  $('rsBack').addEventListener('click', closePanels);
  /* Fermeture de l'onglet ou départ vers une autre page en pleine partie : la partie est sauvegardée automatiquement */
  window.addEventListener('pagehide', () => { if (G.on) writeSave(); });
  /* Changement d'onglet ou d'application pendant la partie : pause automatique */
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.on && G.active) pauseGame(); else if (!document.hidden && G.on) G.last = performance.now(); });
  /* Barres du navigateur mobile qui se cachent ou reviennent : seule la hauteur change.
     Le réseau est alors étiré à la nouvelle hauteur au lieu d'être redessiné au hasard (pas de saut à l'écran). */
  function refit() {
    const ph = window.innerHeight, nh = ph / UIS, k = nh / H;
    c.height = Math.round(ph * dpr); H = nh; glow.y *= k;
    for (const n of nodes) n.y *= k;
  }
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => {
    if (!G.on && nodes.length && Math.abs(window.innerWidth / UIS - W) < 1 && Math.abs(Math.min(window.devicePixelRatio || 1, 2) - dpr) < .01) refit(); else setup();
  }, 150); });

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
