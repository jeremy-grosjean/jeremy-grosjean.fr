/* jeremy-grosjean.fr — Lot 16 : ergonomie et visuel des jeux (catégories, écran de fin, progression, raccourcis,
   taille du texte, contraste élevé). Textes en 6 langues. */
(function (L) {
  'use strict';
  const D = {
    fr: {
      catAll: 'Tous', catSup: 'Support', catSys: 'Système', catNet: 'Réseau', catSec: 'Sécurité', catLbl: 'Catégories de jeux',
      gMin: (n) => `~${n} min`, gDiff: ['Facile', 'Moyen', 'Difficile'], gDiffL: (d) => `Difficulté : ${d}`, gNew: 'Nouveau', gPlayed: (b) => `Déjà joué, meilleur score ${b}`,
      endRecord: 'Nouveau record !', endNext: 'À essayer ensuite :', endOther: 'Autre jeu', endStars: (n) => `${n} étoile${n > 1 ? 's' : ''} sur 3`, endOf: (m) => `sur ${m}`,
      kbdHint: '1 à 9 : répondre · Entrée : suite · Échap : quitter',
      sizeBtn: 'Taille du texte', sizeNames: { s: 'A−', m: 'A', l: 'A+', xl: 'A++' },
      psWin: 'Windows PowerShell', rwFiles: 'Fichiers chiffrés',
      keysAdd: [['1 / 2 / 3', 'répondre dans un jeu'], ['Entrée', 'suite du jeu']]
    },
    en: {
      catAll: 'All', catSup: 'Support', catSys: 'Systems', catNet: 'Network', catSec: 'Security', catLbl: 'Game categories',
      gMin: (n) => `~${n} min`, gDiff: ['Easy', 'Medium', 'Hard'], gDiffL: (d) => `Difficulty: ${d}`, gNew: 'New', gPlayed: (b) => `Already played, best score ${b}`,
      endRecord: 'New record!', endNext: 'Try next:', endOther: 'Another game', endStars: (n) => `${n} star${n > 1 ? 's' : ''} out of 3`, endOf: (m) => `out of ${m}`,
      kbdHint: '1 to 9: answer · Enter: next · Esc: quit',
      sizeBtn: 'Text size', sizeNames: { s: 'A−', m: 'A', l: 'A+', xl: 'A++' },
      psWin: 'Windows PowerShell', rwFiles: 'Encrypted files',
      keysAdd: [['1 / 2 / 3', 'answer in a game'], ['Enter', 'next step in a game']]
    },
    'zh-Hans': {
      catAll: '全部', catSup: '支持', catSys: '系统', catNet: '网络', catSec: '安全', catLbl: '游戏分类',
      gMin: (n) => `约 ${n} 分钟`, gDiff: ['简单', '中等', '困难'], gDiffL: (d) => `难度：${d}`, gNew: '新', gPlayed: (b) => `已玩过，最高分 ${b}`,
      endRecord: '新纪录！', endNext: '接下来试试：', endOther: '其他游戏', endStars: (n) => `3 颗星中的 ${n} 颗`, endOf: (m) => `满分 ${m}`,
      kbdHint: '1–9：作答 · Enter：继续 · Esc：退出',
      sizeBtn: '文字大小', sizeNames: { s: 'A−', m: 'A', l: 'A+', xl: 'A++' },
      psWin: 'Windows PowerShell', rwFiles: '被加密的文件',
      keysAdd: [['1 / 2 / 3', '在游戏中作答'], ['Enter', '游戏下一步']]
    },
    'zh-Hant': {
      catAll: '全部', catSup: '支援', catSys: '系統', catNet: '網路', catSec: '資安', catLbl: '遊戲分類',
      gMin: (n) => `約 ${n} 分鐘`, gDiff: ['簡單', '中等', '困難'], gDiffL: (d) => `難度：${d}`, gNew: '新', gPlayed: (b) => `已玩過，最高分 ${b}`,
      endRecord: '新紀錄！', endNext: '接下來試試：', endOther: '其他遊戲', endStars: (n) => `3 顆星中的 ${n} 顆`, endOf: (m) => `滿分 ${m}`,
      kbdHint: '1–9：作答 · Enter：繼續 · Esc：離開',
      sizeBtn: '文字大小', sizeNames: { s: 'A−', m: 'A', l: 'A+', xl: 'A++' },
      psWin: 'Windows PowerShell', rwFiles: '被加密的檔案',
      keysAdd: [['1 / 2 / 3', '在遊戲中作答'], ['Enter', '遊戲下一步']]
    },
    yue: {
      catAll: '全部', catSup: '支援', catSys: '系統', catNet: '網絡', catSec: '保安', catLbl: '遊戲分類',
      gMin: (n) => `大約 ${n} 分鐘`, gDiff: ['易', '中等', '難'], gDiffL: (d) => `難度：${d}`, gNew: '新', gPlayed: (b) => `玩過，最高分 ${b}`,
      endRecord: '新紀錄！', endNext: '跟住試下：', endOther: '其他遊戲', endStars: (n) => `3 粒星入面 ${n} 粒`, endOf: (m) => `滿分 ${m}`,
      kbdHint: '1–9：作答 · Enter：繼續 · Esc：離開',
      sizeBtn: '文字大小', sizeNames: { s: 'A−', m: 'A', l: 'A+', xl: 'A++' },
      psWin: 'Windows PowerShell', rwFiles: '被加密嘅檔案',
      keysAdd: [['1 / 2 / 3', '喺遊戲入面作答'], ['Enter', '遊戲下一步']]
    },
    ko: {
      catAll: '전체', catSup: '지원', catSys: '시스템', catNet: '네트워크', catSec: '보안', catLbl: '게임 분류',
      gMin: (n) => `약 ${n}분`, gDiff: ['쉬움', '보통', '어려움'], gDiffL: (d) => `난이도: ${d}`, gNew: '새 게임', gPlayed: (b) => `플레이함, 최고 점수 ${b}`,
      endRecord: '신기록!', endNext: '다음에 해 볼 게임:', endOther: '다른 게임', endStars: (n) => `별 3개 중 ${n}개`, endOf: (m) => `만점 ${m}`,
      kbdHint: '1~9: 답하기 · Enter: 다음 · Esc: 나가기',
      sizeBtn: '글자 크기', sizeNames: { s: 'A−', m: 'A', l: 'A+', xl: 'A++' },
      psWin: 'Windows PowerShell', rwFiles: '암호화된 파일',
      keysAdd: [['1 / 2 / 3', '게임에서 답하기'], ['Enter', '게임 다음 단계']]
    }
  };
  for (const k in D) {
    if (!L[k]) continue;
    const d = Object.assign({}, D[k]); const add = d.keysAdd; delete d.keysAdd;
    Object.assign(L[k], d);
    const K = L[k].keysList;
    if (K && !K.some(x => x[0] === add[0][0])) { const at = K.findIndex(x => x[0] === '?'); K.splice(at < 0 ? K.length : at, 0, ...add); }
  }
})(window.JG_I18N || {});
