/* jeremy-grosjean.fr — page 404 : langue et thème du visiteur, chemin demandé affiché sans risque (textContent) */
(() => {
  'use strict';
  const L = {
    fr: ['Page introuvable', "Cette page n'existe pas, ou plus.", "← Retour à l'accueil", 'paquet perdu', 'fr'],
    en: ['Page not found', "This page doesn't exist, or no longer does.", '← Back to home', 'packet lost', 'en'],
    'zh-Hans': ['找不到页面', '此页面不存在或已被删除。', '← 返回首页', '数据包丢失', 'zh-Hans'],
    'zh-Hant': ['找不到頁面', '此頁面不存在或已被移除。', '← 返回首頁', '封包遺失', 'zh-Hant'],
    yue: ['搵唔到呢頁', '呢一頁唔存在，或者已經冇咗。', '← 返去主頁', '封包唔見咗', 'yue-Hant-HK'],
    ko: ['페이지를 찾을 수 없습니다', '이 페이지는 존재하지 않거나 삭제되었습니다.', '← 홈으로 돌아가기', '패킷 손실', 'ko']
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
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('msg', T[1]); set('back', T[2]); set('lost', T[3]);
  let p = location.pathname; try { p = decodeURIComponent(p); } catch (e) {}
  set('path', p.length > 42 ? p.slice(0, 41) + '…' : p);
})();
