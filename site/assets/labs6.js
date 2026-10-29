/* jeremy-grosjean.fr — Lot 18 : indices progressifs dans les jeux, réglages d'affichage (taille par défaut,
   ciel de Paris, initiales « JG », décor de saison : désactivés par défaut). Textes en 6 langues. */
(function (L) {
  'use strict';
  const D = {
    fr: {
      hint2s: (c) => `Indice 2 : la bonne réponse commence par « ${c}… ».`,
      hintBtn: '💡 Indice', hintMore: (n, t) => `💡 Indice suivant (${n}/${t})`, hintCost: 'Un indice compte comme une erreur pour cette question.',
      hint1: (n) => n > 1 ? `Indice 1 : ${n} mauvaises réponses sont retirées.` : 'Indice 1 : une mauvaise réponse est retirée.',
      hint2w: (w) => `Indice 2 : la bonne réponse contient « ${w} ».`, hint2r: 'Indice 2 : il ne reste plus qu’une mauvaise réponse.',
      hint3: 'Indice 3 : la bonne réponse est mise en évidence.',
      phHint: (n, t) => `Indice ${n} : regardez l’élément surligné (${n}/${t}).`, phHintAll: 'Indice 3 : tous les éléments suspects sont surlignés.',
      phHintNone: 'Indice : aucun élément suspect n’a été relevé dans cet e-mail.',
      a11ySizeReset: 'Taille par défaut', a11yResetAll: 'Tout remettre par défaut', a11yResetDone: 'Affichage remis par défaut',
      a11yExtra: 'Effets visuels (désactivés par défaut)', a11ySky: 'Ciel selon l’heure de Paris (thème sombre)',
      a11yJg: 'Initiales « JG » dans le réseau animé', a11yJgPlay: 'Rejouer', a11ySeason: 'Décor de saison', a11ySeasonNone: 'rien en ce moment',
      seasons: { halloween: 'Halloween', winter: 'hiver', valentine: 'Saint-Valentin' }
    },
    en: {
      hint2s: (c) => `Hint 2: the right answer starts with “${c}…”.`,
      hintBtn: '💡 Hint', hintMore: (n, t) => `💡 Next hint (${n}/${t})`, hintCost: 'A hint counts as a mistake for this question.',
      hint1: (n) => n > 1 ? `Hint 1: ${n} wrong answers are removed.` : 'Hint 1: one wrong answer is removed.',
      hint2w: (w) => `Hint 2: the right answer contains “${w}”.`, hint2r: 'Hint 2: only one wrong answer is left.',
      hint3: 'Hint 3: the right answer is highlighted.',
      phHint: (n, t) => `Hint ${n}: look at the highlighted part (${n}/${t}).`, phHintAll: 'Hint 3: every suspicious part is highlighted.',
      phHintNone: 'Hint: nothing suspicious was found in this email.',
      a11ySizeReset: 'Default size', a11yResetAll: 'Reset everything to default', a11yResetDone: 'Display reset to default',
      a11yExtra: 'Visual effects (off by default)', a11ySky: 'Sky following Paris time (dark theme)',
      a11yJg: '“JG” initials in the animated network', a11yJgPlay: 'Replay', a11ySeason: 'Seasonal decoration', a11ySeasonNone: 'nothing right now',
      seasons: { halloween: 'Halloween', winter: 'winter', valentine: 'Valentine’s Day' }
    },
    'zh-Hans': {
      hint2s: (c) => `提示 2：正确答案以“${c}”开头。`,
      hintBtn: '💡 提示', hintMore: (n, t) => `💡 下一个提示（${n}/${t}）`, hintCost: '使用提示会算作这道题的一次错误。',
      hint1: (n) => n > 1 ? `提示 1：已去掉 ${n} 个错误答案。` : '提示 1：已去掉一个错误答案。',
      hint2w: (w) => `提示 2：正确答案包含“${w}”。`, hint2r: '提示 2：只剩下一个错误答案。',
      hint3: '提示 3：正确答案已高亮显示。',
      phHint: (n, t) => `提示 ${n}：看看高亮的部分（${n}/${t}）。`, phHintAll: '提示 3：所有可疑之处都已高亮。',
      phHintNone: '提示：这封邮件里没有发现可疑之处。',
      a11ySizeReset: '默认大小', a11yResetAll: '全部恢复默认', a11yResetDone: '显示已恢复默认',
      a11yExtra: '视觉效果（默认关闭）', a11ySky: '天空随巴黎时间变化（深色主题）',
      a11yJg: '动态网络中的 “JG” 字母', a11yJgPlay: '重播', a11ySeason: '节日装饰', a11ySeasonNone: '目前没有',
      seasons: { halloween: '万圣节', winter: '冬季', valentine: '情人节' }
    },
    'zh-Hant': {
      hint2s: (c) => `提示 2：正確答案以「${c}」開頭。`,
      hintBtn: '💡 提示', hintMore: (n, t) => `💡 下一個提示（${n}/${t}）`, hintCost: '使用提示會算作這一題的一次錯誤。',
      hint1: (n) => n > 1 ? `提示 1：已拿掉 ${n} 個錯誤答案。` : '提示 1：已拿掉一個錯誤答案。',
      hint2w: (w) => `提示 2：正確答案包含「${w}」。`, hint2r: '提示 2：只剩下一個錯誤答案。',
      hint3: '提示 3：正確答案已標示出來。',
      phHint: (n, t) => `提示 ${n}：看看標示的部分（${n}/${t}）。`, phHintAll: '提示 3：所有可疑之處都已標示。',
      phHintNone: '提示：這封郵件裡沒有發現可疑之處。',
      a11ySizeReset: '預設大小', a11yResetAll: '全部恢復預設', a11yResetDone: '顯示已恢復預設',
      a11yExtra: '視覺效果（預設關閉）', a11ySky: '天空隨巴黎時間變化（深色主題）',
      a11yJg: '動態網路中的「JG」字母', a11yJgPlay: '重播', a11ySeason: '節日裝飾', a11ySeasonNone: '目前沒有',
      seasons: { halloween: '萬聖節', winter: '冬季', valentine: '情人節' }
    },
    yue: {
      hint2s: (c) => `提示 2：啱嘅答案以「${c}」開頭。`,
      hintBtn: '💡 提示', hintMore: (n, t) => `💡 下一個提示（${n}/${t}）`, hintCost: '用提示會當做呢題錯咗一次。',
      hint1: (n) => n > 1 ? `提示 1：已經拎走 ${n} 個錯嘅答案。` : '提示 1：已經拎走一個錯嘅答案。',
      hint2w: (w) => `提示 2：啱嘅答案有「${w}」。`, hint2r: '提示 2：淨返一個錯嘅答案。',
      hint3: '提示 3：啱嘅答案已經標示咗。',
      phHint: (n, t) => `提示 ${n}：睇下標示咗嘅部分（${n}/${t}）。`, phHintAll: '提示 3：所有可疑嘅地方都標示咗。',
      phHintNone: '提示：呢封電郵冇發現可疑嘅地方。',
      a11ySizeReset: '預設大小', a11yResetAll: '全部還原預設', a11yResetDone: '顯示已經還原預設',
      a11yExtra: '視覺效果（預設關閉）', a11ySky: '天空跟巴黎時間變（深色主題）',
      a11yJg: '動態網絡入面嘅「JG」字母', a11yJgPlay: '重播', a11ySeason: '節日裝飾', a11ySeasonNone: '而家冇',
      seasons: { halloween: '萬聖節', winter: '冬天', valentine: '情人節' }
    },
    ko: {
      hint2s: (c) => `힌트 2: 정답은 “${c}”(으)로 시작합니다.`,
      hintBtn: '💡 힌트', hintMore: (n, t) => `💡 다음 힌트 (${n}/${t})`, hintCost: '힌트를 쓰면 이 문제에서 한 번 틀린 것으로 계산됩니다.',
      hint1: (n) => n > 1 ? `힌트 1: 오답 ${n}개를 지웠습니다.` : '힌트 1: 오답 하나를 지웠습니다.',
      hint2w: (w) => `힌트 2: 정답에는 “${w}”가 들어 있습니다.`, hint2r: '힌트 2: 오답이 하나만 남았습니다.',
      hint3: '힌트 3: 정답을 표시했습니다.',
      phHint: (n, t) => `힌트 ${n}: 표시된 부분을 보세요 (${n}/${t}).`, phHintAll: '힌트 3: 의심스러운 부분을 모두 표시했습니다.',
      phHintNone: '힌트: 이 메일에서 의심스러운 부분이 발견되지 않았습니다.',
      a11ySizeReset: '기본 크기', a11yResetAll: '모두 기본값으로', a11yResetDone: '화면 설정을 기본값으로 되돌렸습니다',
      a11yExtra: '시각 효과 (기본값: 꺼짐)', a11ySky: '파리 시간에 따라 바뀌는 하늘 (어두운 테마)',
      a11yJg: '움직이는 네트워크 속 “JG” 이니셜', a11yJgPlay: '다시 보기', a11ySeason: '계절 장식', a11ySeasonNone: '지금은 없음',
      seasons: { halloween: '핼러윈', winter: '겨울', valentine: '밸런타인데이' }
    }
  };
  for (const k in D) if (L[k]) Object.assign(L[k], D[k]);
})(window.JG_I18N || {});
