/* jeremy-grosjean.fr — page 404 : langue et thème du visiteur, chemin demandé affiché sans risque (textContent),
   mini-jeu « retrouvez la route » : 3 questions réseau, réponses mélangées, aucune donnée enregistrée */
(() => {
  'use strict';
  const L = {
    fr: ['Page introuvable', "Cette page n’existe pas, ou plus.", "← Retour à l’accueil", 'paquet perdu', 'fr',
      { title: 'Aidez le paquet à retrouver sa route', step: (n, t) => `Saut ${n}/${t} · `, retry: '✗ Mauvaise route, le paquet se perd. Réessayez.',
        win: n => `✓ Route retrouvée en ${n} essai${n > 1 ? 's' : ''}. La page d’accueil vous attend.`, lostHop: 'mauvaise route',
        q: [['Votre PC a l’adresse 192.168.1.42/24. Quelle est sa passerelle ?', ['192.168.1.1', '192.168.2.1', '10.0.0.1'], 'passerelle'],
            ['Quel service traduit jeremy-grosjean.fr en adresse IP ?', ['DNS', 'DHCP', 'ARP'], 'DNS'],
            ['Sur quel port arrive une page web sécurisée (HTTPS) ?', ['443', '80', '22'], 'HTTPS']] }],
    en: ['Page not found', "This page doesn’t exist, or no longer does.", '← Back to home', 'packet lost', 'en',
      { title: 'Help the packet find its way', step: (n, t) => `Hop ${n}/${t} · `, retry: '✗ Wrong route, the packet gets lost. Try again.',
        win: n => `✓ Route found in ${n} attempt${n > 1 ? 's' : ''}. The home page is waiting for you.`, lostHop: 'wrong route',
        q: [['Your PC has the address 192.168.1.42/24. What is its gateway?', ['192.168.1.1', '192.168.2.1', '10.0.0.1'], 'gateway'],
            ['Which service turns jeremy-grosjean.fr into an IP address?', ['DNS', 'DHCP', 'ARP'], 'DNS'],
            ['Which port does a secure web page (HTTPS) use?', ['443', '80', '22'], 'HTTPS']] }],
    'zh-Hans': ['找不到页面', '此页面不存在或已被删除。', '← 返回首页', '数据包丢失', 'zh-Hans',
      { title: '帮数据包找回路线', step: (n, t) => `第 ${n}/${t} 跳 · `, retry: '✗ 路线错误，数据包丢失了。再试一次。',
        win: n => `✓ 用了 ${n} 次找回路线。首页正在等您。`, lostHop: '路线错误',
        q: [['您的电脑地址是 192.168.1.42/24。它的网关是哪个？', ['192.168.1.1', '192.168.2.1', '10.0.0.1'], '网关'],
            ['哪个服务把 jeremy-grosjean.fr 转换成 IP 地址？', ['DNS', 'DHCP', 'ARP'], 'DNS'],
            ['安全网页（HTTPS）使用哪个端口？', ['443', '80', '22'], 'HTTPS']] }],
    'zh-Hant': ['找不到頁面', '此頁面不存在或已被移除。', '← 返回首頁', '封包遺失', 'zh-Hant',
      { title: '幫封包找回路線', step: (n, t) => `第 ${n}/${t} 跳 · `, retry: '✗ 路線錯誤，封包遺失了。再試一次。',
        win: n => `✓ 用了 ${n} 次找回路線。首頁正在等您。`, lostHop: '路線錯誤',
        q: [['您的電腦位址是 192.168.1.42/24。它的閘道是哪個？', ['192.168.1.1', '192.168.2.1', '10.0.0.1'], '閘道'],
            ['哪個服務把 jeremy-grosjean.fr 轉換成 IP 位址？', ['DNS', 'DHCP', 'ARP'], 'DNS'],
            ['安全網頁（HTTPS）使用哪個連接埠？', ['443', '80', '22'], 'HTTPS']] }],
    yue: ['搵唔到呢頁', '呢一頁唔存在，或者已經冇咗。', '← 返去主頁', '封包唔見咗', 'yue-Hant-HK',
      { title: '幫個封包搵返條路', step: (n, t) => `第 ${n}/${t} 跳 · `, retry: '✗ 行錯路，封包唔見咗。再試吓。',
        win: n => `✓ 試咗 ${n} 次就搵返條路。主頁等緊你。`, lostHop: '行錯路',
        q: [['你部電腦嘅地址係 192.168.1.42/24。佢嘅閘道係邊個？', ['192.168.1.1', '192.168.2.1', '10.0.0.1'], '閘道'],
            ['邊個服務將 jeremy-grosjean.fr 變做 IP 地址？', ['DNS', 'DHCP', 'ARP'], 'DNS'],
            ['安全網頁（HTTPS）用邊個埠？', ['443', '80', '22'], 'HTTPS']] }],
    ko: ['페이지를 찾을 수 없습니다', '이 페이지는 존재하지 않거나 삭제되었습니다.', '← 홈으로 돌아가기', '패킷 손실', 'ko',
      { title: '패킷이 길을 찾도록 도와주세요', step: (n, t) => `${n}/${t}번째 홉 · `, retry: '✗ 잘못된 경로라 패킷이 사라졌습니다. 다시 시도하세요.',
        win: n => `✓ ${n}번 만에 경로를 찾았습니다. 홈페이지가 기다리고 있어요.`, lostHop: '잘못된 경로',
        q: [['PC 주소가 192.168.1.42/24입니다. 게이트웨이는 무엇일까요?', ['192.168.1.1', '192.168.2.1', '10.0.0.1'], '게이트웨이'],
            ['jeremy-grosjean.fr을 IP 주소로 바꾸는 서비스는?', ['DNS', 'DHCP', 'ARP'], 'DNS'],
            ['보안 웹 페이지(HTTPS)는 어느 포트를 사용할까요?', ['443', '80', '22'], 'HTTPS']] }]
  };
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  function detect() {
    const s = get('jg-lang'); if (L[s]) return s;
    for (const raw of (navigator.languages || [navigator.language || ''])) {
      const l = (raw || '').toLowerCase();
      if (l.startsWith('fr')) return 'fr';
      if (l.startsWith('yue') || l === 'zh-hk' || l === 'zh-mo' || /^zh-hant-(hk|mo)$/.test(l)) return 'yue';
      if (l.startsWith('zh-hant') || l === 'zh-tw') return 'zh-Hant';
      if (l.startsWith('zh')) return 'zh-Hans';
      if (l.startsWith('ko')) return 'ko';
      if (l.startsWith('en')) return 'en';
    }
    return 'fr';
  }
  const th = get('jg-theme'); if (th === 'light' || th === 'dark') document.documentElement.dataset.theme = th;
  const T = L[detect()];
  document.documentElement.lang = T[4];
  document.title = T[0] + ' · jeremy-grosjean.fr';
  const $ = id => document.getElementById(id);
  const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  set('msg', T[1]); set('back', T[2]); set('lost', T[3]);
  set('contact', { fr: 'Me contacter', en: 'Contact me', 'zh-Hans': '联系我', 'zh-Hant': '聯絡我', yue: '搵我', ko: '연락하기' }[Object.keys(L).find(k => L[k] === T)] || 'Me contacter');
  let p = location.pathname; try { p = decodeURIComponent(p); } catch (e) {}
  set('path', p.length > 42 ? p.slice(0, 41) + '…' : p);

  /* ---- Mini-jeu : chaque bonne réponse ajoute un saut au traceroute ---- */
  const G = T[5], game = $('game'), hops = $('hops'), opts = $('gOpts'), fb = $('gFb');
  if (!game || !hops) return;
  const HOPS = ['192.168.1.1  1.2 ms', 'dns.ovh.net  8.4 ms', 'jeremy-grosjean.fr:443  12.1 ms'];
  let i = 0, tries = 0;
  const shuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = (Math.random() * (k + 1)) | 0; [a[k], a[j]] = [a[j], a[k]]; } return a; };
  function hop(txt, cls) { const d = document.createElement('div'); d.className = cls; d.textContent = txt; hops.append(d); }
  function ask() {
    const [q, answers] = G.q[i];
    set('gQ', G.step(i + 1, G.q.length) + q); opts.textContent = '';
    for (const k of shuffle([0, 1, 2])) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = answers[k];
      b.addEventListener('click', () => pick(b, k === 0)); opts.append(b);
    }
  }
  function pick(b, good) {
    tries++;
    if (!good) { b.classList.add('no'); b.disabled = true; fb.textContent = G.retry; hop(`${i + 3}  * * *  ${G.lostHop}`, 'bad'); return; }
    hops.querySelectorAll('.bad').forEach(d => d.remove());
    hop(`${i + 3}  ${HOPS[i]}`, 'ok'); fb.textContent = ''; i++;
    if (i < G.q.length) { ask(); opts.firstChild.focus(); return; }
    opts.textContent = ''; set('gQ', ''); fb.textContent = G.win(tries); fb.className = 'g-fb win';
    $('lost').textContent = ''; $('back').focus();
  }
  set('gTitle', G.title); game.hidden = false; ask();
})();
