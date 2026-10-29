/* jeremy-grosjean.fr — Lot 15 : jeux « Prépare un poste », « Attaque par rançongiciel », « Réponds au ticket »
   et badges sur l'ensemble des jeux (textes en 6 langues). Utilisateurs et entreprise inventés. */
(function (L) {
  'use strict';
  const D = {
    fr: {
      play: 'Jouer : 13 mini-jeux',
      pickPrepT: 'Prépare un poste', pickPrepD: 'Un nouvel arrivant lundi : remettez les étapes de préparation de son PC dans l’ordre.',
      pickRansomT: 'Attaque par rançongiciel', pickRansomD: 'Des fichiers sont chiffrés : choisissez les bons réflexes, dans le bon ordre.',
      pickReplyT: 'Réponds au ticket', pickReplyD: 'Composez une réponse claire et polie à un utilisateur, phrase par phrase.',
      badgesBtn: 'Badges',
      prTag: (n, t) => `Étape ${n}/${t}`, prTitle: 'Préparez le PC d’un nouvel arrivant',
      prSub: 'Touchez les étapes dans l’ordre, de la première à la dernière.',
      prBad: 'Pas encore : une autre étape doit venir avant celle-ci.', prOk: '✓ Poste prêt et remis à l’utilisateur !',
      prEnd: 'Voir le résultat', prDoneTitle: (e) => e ? `Poste prêt, avec ${e} erreur${e > 1 ? 's' : ''}` : 'Poste prêt, sans aucune erreur',
      prDoneMsg: (s, m) => `Score : ${s}/${m}.`,
      prSteps: [
        ['Vérifier le matériel et coller l’étiquette d’inventaire', 'On contrôle le PC reçu et on l’enregistre dans le parc avant tout.'],
        ['Mettre à jour le BIOS/UEFI et activer le démarrage sécurisé', 'Le micrologiciel se règle avant d’installer le système.'],
        ['Installer Windows 11 (clé USB ou déploiement réseau)', 'Le système d’exploitation, base de tout le reste.'],
        ['Installer les pilotes et les mises à jour Windows', 'Un système à jour et des périphériques reconnus.'],
        ['Joindre le poste au domaine Active Directory', 'Le PC rejoint le réseau de l’entreprise et ses comptes.'],
        ['Appliquer les stratégies de groupe (gpupdate /force) et vérifier', 'Les règles de l’entreprise (sécurité, lecteurs, imprimantes) s’appliquent une fois dans le domaine.'],
        ['Installer l’antivirus et les logiciels métier', 'Les outils de travail, sur un poste déjà sécurisé et configuré.'],
        ['Remettre le poste à l’utilisateur et faire signer le bon de remise', 'On explique l’essentiel et on garde une trace de la remise.']
      ],
      rwTag: (n, t) => `Étape ${n}/${t}`, rwTitle: 'Alerte : « Vos fichiers ont été chiffrés » sur un PC de la comptabilité',
      rwGood: '✓ Bon réflexe.', rwBad: '✗ Mauvais réflexe.', rwRetry: 'Choisissez une autre action.', rwNext: 'Étape suivante', rwEnd: 'Voir le résultat',
      rwDoneTitle: (ok, n) => `${ok}/${n} bons réflexes du premier coup`, rwDoneMsg: (s, m) => `Score : ${s}/${m}.`,
      rw321: 'La règle 3-2-1 : 3 copies des données, sur 2 supports différents, dont 1 hors ligne ou hors site.',
      ransom: [
        ['Un message de rançon s’affiche sur le PC. Première action ?', ['Débrancher le câble réseau et couper le Wi-Fi, sans éteindre le PC', 'Éteindre le PC tout de suite', 'Payer la rançon pour récupérer les fichiers'],
          'On isole pour stopper la propagation, sans éteindre : la mémoire garde des traces utiles à l’analyse. Payer ne garantit rien.'],
        ['Le poste est isolé. Ensuite ?', ['Prévenir le responsable informatique selon la procédure d’incident', 'Ne rien dire et réinstaller le PC discrètement', 'Envoyer un e-mail d’alerte à toute l’entreprise depuis le PC infecté'],
          'Un incident se signale tout de suite : d’autres postes peuvent être touchés, et des décisions sont à prendre.'],
        ['Le responsable est prévenu. Que vérifier ?', ['Les autres postes et les partages réseau, dans la console de l’antivirus', 'Rien : un seul PC est touché', 'Reconnecter le PC au réseau pour voir s’il fonctionne'],
          'Un rançongiciel chiffre souvent aussi les dossiers partagés : on mesure l’étendue avant de restaurer.'],
        ['Comment récupérer les fichiers ?', ['Restaurer la sauvegarde hors ligne, après avoir vérifié qu’elle est saine', 'Restaurer depuis le dossier synchronisé dans le cloud', 'Attendre qu’un outil de déchiffrement sorte'],
          'Une copie synchronisée a souvent été chiffrée elle aussi : la copie hors ligne de la règle 3-2-1 est celle qui sauve.'],
        ['Les fichiers sont restaurés. Pour finir ?', ['Changer les mots de passe, faire les mises à jour, documenter et déclarer l’incident', 'Remettre le PC en service tel quel', 'Désactiver l’antivirus qui a ralenti la restauration'],
          'On corrige la faille, on garde une trace, et on déclare : la CNIL sous 72 h si des données personnelles sont concernées.']
      ],
      rpTag: (n, t) => `Ticket ${n}/${t}`, rpTitle: 'Réponds au ticket',
      rpSlots: ['Salutation', 'Accusé de réception', 'Solution', 'Conclusion'], rpPick: (s) => `Choisissez : ${s.toLowerCase()}`,
      rpPreview: 'Votre réponse', rpSign: 'Jérémy, support informatique', rpNext: 'Ticket suivant', rpEnd: 'Voir le résultat',
      rpDoneTitle: 'Réponses envoyées', rpDoneMsg: (s, m) => `Qualité de l’écrit : ${s}/${m}.`,
      replies: [
        ['Bonjour, depuis ce matin je n’arrive plus à imprimer, c’est urgent : j’ai un dossier à rendre à 14 h.', 'Mme Leroy, ressources humaines', [
          [['Bonjour Madame Leroy,', 10, 'Poli et personnel.'], ['Salut,', 5, 'Trop familier avec une utilisatrice qu’on connaît peu.'], ['Re,', 0, 'Sec et impersonnel.']],
          [['Merci pour votre message, je comprends l’urgence avec votre dossier de 14 h.', 10, 'Vous montrez que vous avez compris le besoin.'], ['Votre ticket a bien été reçu.', 5, 'Correct, mais froid : l’urgence n’est pas reprise.'], ['Il faudrait lire la procédure avant d’ouvrir un ticket.', 0, 'Un reproche n’aide pas l’utilisatrice.']],
          [['J’ai relancé le service d’impression : pouvez-vous réessayer ? En attendant, l’imprimante du 2ᵉ étage fonctionne.', 10, 'Action claire, et une solution de secours.'], ['Le spouleur était planté, j’ai fait un Restart-Service Spooler.', 5, 'Juste, mais trop technique pour l’utilisatrice.'], ['Essayez de redémarrer, on verra.', 0, 'Vague : rien ne dit ce qui a été fait.']],
          [['Je reste joignable au 4321 si le problème revient. Bonne journée,', 10, 'Elle sait comment vous recontacter.'], ['Cordialement.', 5, 'Poli, mais sans suite possible.'], ['Ticket fermé.', 0, 'Brutal : l’utilisatrice ne sait pas si c’est réglé.']]
        ]],
        ['Mon mot de passe a expiré et je suis bloqué, je ne peux plus travailler !!', 'Karim, commercial', [
          [['Bonjour Karim,', 10, 'Simple et chaleureux.'], ['Bonjour Monsieur,', 5, 'Poli, mais distant alors qu’il signe par son prénom.'], ['Yo,', 0, 'Pas professionnel.']],
          [['Désolé pour ce blocage, on règle ça tout de suite.', 10, 'Empathie et prise en charge.'], ['Ce sont les règles de sécurité de l’entreprise.', 5, 'Vrai, mais ça ne l’aide pas sur le moment.'], ['C’est la troisième fois ce mois-ci.', 0, 'Un reproche, au pire moment.']],
          [['Votre compte est débloqué : choisissez un nouveau mot de passe à la connexion, une phrase de passe de 12 caractères ou plus.', 10, 'Clair, sûr, et il garde la main sur son mot de passe.'], ['J’ai fait un Unlock-ADAccount et un reset.', 5, 'Jargon incompréhensible pour l’utilisateur.'], ['Je vous envoie votre nouveau mot de passe par e-mail.', 0, 'Jamais de mot de passe en clair par e-mail.']],
          [['Rappelez-moi si la connexion ne fonctionne pas. Bonne journée,', 10, 'Il sait quoi faire en cas de souci.'], ['Normalement ça devrait marcher.', 5, 'Peu rassurant.'], ['Merci de ne plus l’oublier.', 0, 'Leçon de morale inutile.']]
        ]]
      ],
      bdTitle: 'Badges', bdSub: 'Gagnez des badges en jouant : ils restent enregistrés dans ce navigateur.',
      bdCount: (n, t) => `${n}/${t} badges débloqués`, bdShare: 'Partager mon récapitulatif', bdCopied: 'Récapitulatif copié',
      bdShareText: (n, t, list, url) => `J’ai débloqué ${n}/${t} badges sur le site de Jérémy Grosjean, technicien informatique en alternance${list ? ' : ' + list : ''}. À vous de jouer : ${url}`,
      bdNew: (b) => `🏅 Nouveau badge : ${b}`, bdLocked: 'À débloquer',
      badges: [
        ['Premier pas', 'Terminer un premier jeu.'], ['Gardien du serveur', 'Terminer une partie de « Protéger le serveur ».'],
        ['Support N1 parfait', 'Score maximal au support N1.'], ['Support N2 parfait', 'Score maximal au support N2.'],
        ['Diagnostic sans faute', 'Score maximal à « Trouve la panne ».'], ['As de l’Active Directory', 'Score maximal au quiz AD.'],
        ['Œil de lynx', 'Repérer tous les e-mails d’hameçonnage.'], ['Calcul mental', 'Marquer des points aux sous-réseaux.'],
        ['Priorités maîtrisées', 'Tous les tickets bien priorisés.'], ['PowerShell sans faute', 'Toutes les commandes du premier coup.'],
        ['Câble parfait', 'Score maximal au câble RJ45.'], ['Voix rassurante', 'Appel parfait, relation et technique.'],
        ['Poste prêt du premier coup', 'Préparer un poste sans erreur.'], ['Réflexes de crise', 'Tous les bons réflexes face au rançongiciel.'],
        ['Plume du support', 'Les meilleures réponses aux deux tickets.'], ['Régulier', 'Réussir 3 défis du jour de suite.'],
        ['Curieux', 'Trouver 5 secrets cachés.'], ['Tous les secrets', 'Trouver les 11 secrets cachés.'],
        ['Touche-à-tout', 'Jouer aux 13 mini-jeux.'], ['Technicien accompli', 'Débloquer tous les autres badges.']
      ],
      help: [['poste', 'jeu : préparer un poste'], ['rancon', 'jeu : attaque par rançongiciel'], ['reponse', 'jeu : répondre à un ticket'], ['badges', 'mes badges']]
    },
    en: {
      play: 'Play: 13 mini-games',
      pickPrepT: 'Set up a workstation', pickPrepD: 'A new hire starts on Monday: put the steps to prepare their PC in order.',
      pickRansomT: 'Ransomware attack', pickRansomD: 'Files have been encrypted: pick the right reflexes, in the right order.',
      pickReplyT: 'Answer the ticket', pickReplyD: 'Write a clear, polite reply to a user, one sentence at a time.',
      badgesBtn: 'Badges',
      prTag: (n, t) => `Step ${n}/${t}`, prTitle: 'Prepare a new hire’s PC',
      prSub: 'Tap the steps in order, from first to last.',
      prBad: 'Not yet: another step must come before this one.', prOk: '✓ Workstation ready and handed over!',
      prEnd: 'See the result', prDoneTitle: (e) => e ? `Workstation ready, with ${e} mistake${e > 1 ? 's' : ''}` : 'Workstation ready, without a single mistake',
      prDoneMsg: (s, m) => `Score: ${s}/${m}.`,
      prSteps: [
        ['Check the hardware and stick on the asset tag', 'First inspect the PC and record it in the inventory.'],
        ['Update the BIOS/UEFI and enable Secure Boot', 'Firmware is set up before installing the system.'],
        ['Install Windows 11 (USB drive or network deployment)', 'The operating system, the base for everything else.'],
        ['Install drivers and Windows updates', 'An up-to-date system and recognised devices.'],
        ['Join the PC to the Active Directory domain', 'The PC joins the company network and its accounts.'],
        ['Apply Group Policy (gpupdate /force) and check it', 'Company rules (security, drives, printers) apply once in the domain.'],
        ['Install the antivirus and business software', 'Work tools, on a PC that is already secured and configured.'],
        ['Hand the PC over to the user and get the handover form signed', 'Explain the essentials and keep a record of the handover.']
      ],
      rwTag: (n, t) => `Step ${n}/${t}`, rwTitle: 'Alert: “Your files have been encrypted” on an accounting PC',
      rwGood: '✓ Good reflex.', rwBad: '✗ Bad reflex.', rwRetry: 'Choose another action.', rwNext: 'Next step', rwEnd: 'See the result',
      rwDoneTitle: (ok, n) => `${ok}/${n} right reflexes on the first try`, rwDoneMsg: (s, m) => `Score: ${s}/${m}.`,
      rw321: 'The 3-2-1 rule: 3 copies of the data, on 2 different media, with 1 offline or off-site.',
      ransom: [
        ['A ransom note appears on the PC. First action?', ['Unplug the network cable and turn off Wi-Fi, without shutting the PC down', 'Shut the PC down immediately', 'Pay the ransom to get the files back'],
          'Isolate it to stop the spread, without shutting down: memory holds traces useful for the investigation. Paying guarantees nothing.'],
        ['The PC is isolated. Next?', ['Notify the IT manager following the incident procedure', 'Say nothing and quietly reinstall the PC', 'Email a warning to the whole company from the infected PC'],
          'An incident is reported straight away: other PCs may be affected, and decisions need to be made.'],
        ['The manager knows. What do you check?', ['The other PCs and the network shares, in the antivirus console', 'Nothing: only one PC is affected', 'Reconnect the PC to see whether it works'],
          'Ransomware often encrypts shared folders too: assess the scope before restoring.'],
        ['How do you get the files back?', ['Restore the offline backup, after checking it is clean', 'Restore from the folder synced to the cloud', 'Wait for a decryption tool to come out'],
          'A synced copy has often been encrypted too: the offline copy from the 3-2-1 rule is the one that saves you.'],
        ['The files are restored. To finish?', ['Change passwords, install updates, document and report the incident', 'Put the PC back into service as it is', 'Disable the antivirus that slowed the restore'],
          'Fix the weakness, keep a record and report it: to the data protection authority within 72 h if personal data is involved.']
      ],
      rpTag: (n, t) => `Ticket ${n}/${t}`, rpTitle: 'Answer the ticket',
      rpSlots: ['Greeting', 'Acknowledgement', 'Solution', 'Closing'], rpPick: (s) => `Choose: ${s.toLowerCase()}`,
      rpPreview: 'Your reply', rpSign: 'Jérémy, IT support', rpNext: 'Next ticket', rpEnd: 'See the result',
      rpDoneTitle: 'Replies sent', rpDoneMsg: (s, m) => `Writing quality: ${s}/${m}.`,
      replies: [
        ['Hello, since this morning I can’t print, and it’s urgent: I have a file due at 2 pm.', 'Ms Leroy, HR', [
          [['Hello Ms Leroy,', 10, 'Polite and personal.'], ['Hey,', 5, 'Too casual with a user you barely know.'], ['Re,', 0, 'Curt and impersonal.']],
          [['Thank you for your message, I understand the urgency with your 2 pm deadline.', 10, 'You show you understood the need.'], ['Your ticket has been received.', 5, 'Correct but cold: the urgency is not acknowledged.'], ['You should read the procedure before opening a ticket.', 0, 'Blaming the user does not help.']],
          [['I restarted the print service: could you try again? Meanwhile, the 2nd-floor printer works.', 10, 'A clear action, plus a fallback.'], ['The spooler had crashed, I ran Restart-Service Spooler.', 5, 'Right, but too technical for the user.'], ['Try restarting, we’ll see.', 0, 'Vague: nothing says what was done.']],
          [['You can reach me on 4321 if it happens again. Have a good day,', 10, 'She knows how to get back to you.'], ['Regards.', 5, 'Polite, but no follow-up offered.'], ['Ticket closed.', 0, 'Abrupt: she doesn’t know whether it’s fixed.']]
        ]],
        ['My password has expired and I’m locked out, I can’t work!!', 'Karim, sales', [
          [['Hi Karim,', 10, 'Simple and friendly.'], ['Dear Sir,', 5, 'Polite, but distant when he signs with his first name.'], ['Yo,', 0, 'Not professional.']],
          [['Sorry about the lockout, let’s fix it right away.', 10, 'Empathy and ownership.'], ['These are the company’s security rules.', 5, 'True, but it doesn’t help him right now.'], ['That’s the third time this month.', 0, 'Blame, at the worst moment.']],
          [['Your account is unlocked: choose a new password when you sign in, a passphrase of 12 characters or more.', 10, 'Clear, secure, and he stays in control of his password.'], ['I ran Unlock-ADAccount and a reset.', 5, 'Jargon the user won’t understand.'], ['I’ll email you your new password.', 0, 'Never send a password in plain text by email.']],
          [['Call me back if signing in doesn’t work. Have a good day,', 10, 'He knows what to do if there’s a problem.'], ['It should normally work.', 5, 'Not very reassuring.'], ['Please don’t forget it again.', 0, 'Unnecessary lecture.']]
        ]]
      ],
      bdTitle: 'Badges', bdSub: 'Earn badges by playing: they are saved in this browser.',
      bdCount: (n, t) => `${n}/${t} badges unlocked`, bdShare: 'Share my summary', bdCopied: 'Summary copied',
      bdShareText: (n, t, list, url) => `I unlocked ${n}/${t} badges on the site of Jérémy Grosjean, IT technician looking for a work-study contract${list ? ': ' + list : ''}. Your turn: ${url}`,
      bdNew: (b) => `🏅 New badge: ${b}`, bdLocked: 'Locked',
      badges: [
        ['First steps', 'Finish a first game.'], ['Server guardian', 'Finish a round of “Protect the server”.'],
        ['Perfect L1 support', 'Top score in L1 support.'], ['Perfect L2 support', 'Top score in L2 support.'],
        ['Flawless diagnosis', 'Top score in “Find the fault”.'], ['Active Directory ace', 'Top score in the AD quiz.'],
        ['Eagle eye', 'Spot every phishing email.'], ['Mental maths', 'Score points in subnetting.'],
        ['Priorities mastered', 'Every ticket correctly prioritised.'], ['Flawless PowerShell', 'Every command on the first try.'],
        ['Perfect cable', 'Top score in the RJ45 cable game.'], ['Reassuring voice', 'Perfect call, attitude and skills.'],
        ['Ready first time', 'Set up a workstation without a mistake.'], ['Crisis reflexes', 'Every right reflex against ransomware.'],
        ['Help desk writer', 'The best replies to both tickets.'], ['Regular', 'Pass 3 daily challenges in a row.'],
        ['Curious', 'Find 5 hidden secrets.'], ['All the secrets', 'Find all 11 hidden secrets.'],
        ['All-rounder', 'Play all 13 mini-games.'], ['Accomplished technician', 'Unlock every other badge.']
      ],
      help: [['setup', 'game: set up a workstation'], ['ransom', 'game: ransomware attack'], ['reply', 'game: answer a ticket'], ['badges', 'my badges']]
    },
    'zh-Hans': {
      play: '玩：13 个小游戏',
      pickPrepT: '准备一台电脑', pickPrepD: '新员工周一入职：把准备电脑的步骤按顺序排好。',
      pickRansomT: '勒索软件攻击', pickRansomD: '文件被加密了：按正确顺序做出正确反应。',
      pickReplyT: '回复工单', pickReplyD: '逐句组成一封清楚、礼貌的用户回复。',
      badgesBtn: '徽章',
      prTag: (n, t) => `第 ${n}/${t} 步`, prTitle: '为新员工准备电脑',
      prSub: '按从第一步到最后一步的顺序点击。',
      prBad: '还不行：应该先做另一步。', prOk: '✓ 电脑已准备好并交给用户！',
      prEnd: '查看结果', prDoneTitle: (e) => e ? `电脑已准备好，有 ${e} 处错误` : '电脑已准备好，没有任何错误',
      prDoneMsg: (s, m) => `得分：${s}/${m}。`,
      prSteps: [
        ['检查硬件并贴上资产标签', '先检查收到的电脑，并登记到资产清单。'],
        ['更新 BIOS/UEFI 并启用安全启动', '安装系统前先设置固件。'],
        ['安装 Windows 11（U 盘或网络部署）', '操作系统是其他一切的基础。'],
        ['安装驱动程序和 Windows 更新', '系统保持最新，设备能被识别。'],
        ['将电脑加入 Active Directory 域', '电脑接入公司网络和账户体系。'],
        ['应用组策略（gpupdate /force）并检查', '加入域后，公司的规则（安全、驱动器、打印机）才会生效。'],
        ['安装杀毒软件和业务软件', '在已加固并配置好的电脑上安装工作工具。'],
        ['把电脑交给用户并签署交接单', '讲解要点，并留下交接记录。']
      ],
      rwTag: (n, t) => `第 ${n}/${t} 步`, rwTitle: '警报：财务部一台电脑显示“您的文件已被加密”',
      rwGood: '✓ 正确的反应。', rwBad: '✗ 错误的反应。', rwRetry: '请选择其他操作。', rwNext: '下一步', rwEnd: '查看结果',
      rwDoneTitle: (ok, n) => `${ok}/${n} 次第一次就做对`, rwDoneMsg: (s, m) => `得分：${s}/${m}。`,
      rw321: '3-2-1 原则：数据保留 3 份，存放在 2 种不同介质上，其中 1 份离线或异地保存。',
      ransom: [
        ['电脑上出现勒索信息。第一步怎么做？', ['拔掉网线并关闭 Wi-Fi，但不要关机', '立即关机', '支付赎金取回文件'],
          '先隔离以阻止扩散，但不关机：内存中保留着对调查有用的痕迹。付款并不能保证任何事。'],
        ['电脑已隔离。接下来？', ['按事件处理流程通知 IT 负责人', '什么都不说，悄悄重装电脑', '用被感染的电脑给全公司发警告邮件'],
          '事件要立即上报：其他电脑可能也受影响，需要做出决定。'],
        ['负责人已知情。要检查什么？', ['在杀毒软件控制台检查其他电脑和网络共享', '不用检查：只有一台电脑受影响', '把电脑重新联网看看能否使用'],
          '勒索软件通常也会加密共享文件夹：恢复前先确认影响范围。'],
        ['如何找回文件？', ['确认离线备份未被感染后进行恢复', '从同步到云端的文件夹恢复', '等待解密工具出现'],
          '同步副本往往也被加密了：3-2-1 原则中的离线副本才能救命。'],
        ['文件已恢复。最后？', ['修改密码、安装更新、记录并上报事件', '让电脑原样重新投入使用', '关闭拖慢恢复速度的杀毒软件'],
          '修补漏洞、保留记录并上报：如涉及个人数据，需在 72 小时内通知数据保护机构（法国为 CNIL）。']
      ],
      rpTag: (n, t) => `工单 ${n}/${t}`, rpTitle: '回复工单',
      rpSlots: ['称呼', '确认收到', '解决方案', '结尾'], rpPick: (s) => `请选择：${s}`,
      rpPreview: '你的回复', rpSign: 'Jérémy，IT 支持', rpNext: '下一张工单', rpEnd: '查看结果',
      rpDoneTitle: '回复已发送', rpDoneMsg: (s, m) => `书面表达：${s}/${m}。`,
      replies: [
        ['你好，从今天早上开始我无法打印，很急：我下午 2 点要交一份文件。', 'Leroy 女士，人力资源部', [
          [['Leroy 女士，您好：', 10, '礼貌而且有针对性。'], ['嗨，', 5, '对不太熟的用户太随意。'], ['回复：', 0, '生硬、冷淡。']],
          [['谢谢您的留言，我理解您下午 2 点交文件的急迫。', 10, '表明你理解了需求。'], ['您的工单已收到。', 5, '没错，但很冷淡：没有回应紧急程度。'], ['提工单前应该先看操作说明。', 0, '指责对用户没有帮助。']],
          [['我已重启打印服务，请再试一次？在此期间，3 楼的打印机可以使用。', 10, '操作清楚，还提供了备用方案。'], ['后台打印程序崩了，我执行了 Restart-Service Spooler。', 5, '正确，但对用户来说太技术化。'], ['重启试试，再看看。', 0, '含糊：没说明做了什么。']],
          [['如果问题再出现，可拨打分机 4321 联系我。祝您一天顺利。', 10, '她知道如何再联系你。'], ['此致。', 5, '礼貌，但没有后续。'], ['工单已关闭。', 0, '太生硬：她不知道问题是否已解决。']]
        ]],
        ['我的密码过期了，账户被锁，没法工作了！！', 'Karim，销售部', [
          [['Karim，你好：', 10, '简单亲切。'], ['先生，您好：', 5, '礼貌，但他用名字署名，这样显得疏远。'], ['哟，', 0, '不专业。']],
          [['抱歉给你带来不便，我们马上解决。', 10, '有同理心，并主动负责。'], ['这是公司的安全规定。', 5, '没错，但对他眼下没帮助。'], ['这已经是这个月第三次了。', 0, '在最糟的时候指责。']],
          [['你的账户已解锁：登录时请设置新密码，使用 12 个字符以上的密码短语。', 10, '清楚、安全，密码仍由他自己掌握。'], ['我执行了 Unlock-ADAccount 并重置了。', 5, '用户听不懂的术语。'], ['我把新密码用邮件发给你。', 0, '绝不能用邮件发送明文密码。']],
          [['如果登录不了，请回电给我。祝你一天顺利。', 10, '他知道出问题时该怎么做。'], ['应该没问题了吧。', 5, '不太让人放心。'], ['请别再忘了。', 0, '没必要的说教。']]
        ]]
      ],
      bdTitle: '徽章', bdSub: '玩游戏赢徽章：徽章保存在本浏览器中。',
      bdCount: (n, t) => `已解锁 ${n}/${t} 枚徽章`, bdShare: '分享我的成绩', bdCopied: '成绩已复制',
      bdShareText: (n, t, list, url) => `我在 IT 技术员 Jérémy Grosjean（寻找工学交替岗位）的网站上解锁了 ${n}/${t} 枚徽章${list ? '：' + list : ''}。轮到你了：${url}`,
      bdNew: (b) => `🏅 新徽章：${b}`, bdLocked: '未解锁',
      badges: [
        ['第一步', '完成第一个游戏。'], ['服务器守护者', '完成一局“保护服务器”。'],
        ['一线支持满分', '一线支持获得最高分。'], ['二线支持满分', '二线支持获得最高分。'],
        ['诊断零失误', '“找出故障”获得最高分。'], ['Active Directory 高手', 'AD 测验获得最高分。'],
        ['火眼金睛', '识别出所有钓鱼邮件。'], ['心算', '在子网游戏中得分。'],
        ['优先级掌握', '所有工单优先级都正确。'], ['PowerShell 零失误', '所有命令一次答对。'],
        ['完美网线', 'RJ45 网线游戏获得最高分。'], ['令人安心的声音', '完美的电话：沟通和技术都满分。'],
        ['一次准备到位', '零失误准备好一台电脑。'], ['危机反应', '面对勒索软件全部做对。'],
        ['支持文笔', '两张工单都给出最佳回复。'], ['坚持不懈', '连续 3 天完成每日挑战。'],
        ['好奇心', '找到 5 个隐藏彩蛋。'], ['全部彩蛋', '找到全部 11 个隐藏彩蛋。'],
        ['全能选手', '玩过全部 13 个小游戏。'], ['资深技术员', '解锁其他所有徽章。']
      ],
      help: [['poste', '游戏：准备一台电脑'], ['rancon', '游戏：勒索软件攻击'], ['reponse', '游戏：回复工单'], ['badges', '我的徽章']]
    },
    'zh-Hant': {
      play: '玩：13 個小遊戲',
      pickPrepT: '準備一台電腦', pickPrepD: '新同仁週一報到：把準備電腦的步驟依序排好。',
      pickRansomT: '勒索軟體攻擊', pickRansomD: '檔案被加密了：依正確順序做出正確反應。',
      pickReplyT: '回覆工單', pickReplyD: '逐句組成一封清楚、有禮貌的使用者回覆。',
      badgesBtn: '徽章',
      prTag: (n, t) => `第 ${n}/${t} 步`, prTitle: '為新同仁準備電腦',
      prSub: '依照從第一步到最後一步的順序點選。',
      prBad: '還不行：應該先做另一步。', prOk: '✓ 電腦已準備好並交給使用者！',
      prEnd: '查看結果', prDoneTitle: (e) => e ? `電腦已準備好，有 ${e} 處錯誤` : '電腦已準備好，沒有任何錯誤',
      prDoneMsg: (s, m) => `得分：${s}/${m}。`,
      prSteps: [
        ['檢查硬體並貼上資產標籤', '先檢查收到的電腦，並登記到資產清冊。'],
        ['更新 BIOS/UEFI 並啟用安全開機', '安裝系統前先設定韌體。'],
        ['安裝 Windows 11（USB 隨身碟或網路部署）', '作業系統是其他一切的基礎。'],
        ['安裝驅動程式與 Windows 更新', '系統保持最新，裝置能被辨識。'],
        ['將電腦加入 Active Directory 網域', '電腦接入公司網路與帳號體系。'],
        ['套用群組原則（gpupdate /force）並檢查', '加入網域後，公司的規則（安全、磁碟機、印表機）才會生效。'],
        ['安裝防毒軟體與業務軟體', '在已強化並設定好的電腦上安裝工作工具。'],
        ['把電腦交給使用者並簽署交接單', '說明重點，並留下交接紀錄。']
      ],
      rwTag: (n, t) => `第 ${n}/${t} 步`, rwTitle: '警報：會計部一台電腦顯示「您的檔案已被加密」',
      rwGood: '✓ 正確的反應。', rwBad: '✗ 錯誤的反應。', rwRetry: '請選擇其他動作。', rwNext: '下一步', rwEnd: '查看結果',
      rwDoneTitle: (ok, n) => `${ok}/${n} 次第一次就做對`, rwDoneMsg: (s, m) => `得分：${s}/${m}。`,
      rw321: '3-2-1 原則：資料保留 3 份，存放在 2 種不同媒體上，其中 1 份離線或異地保存。',
      ransom: [
        ['電腦上出現勒索訊息。第一步怎麼做？', ['拔掉網路線並關閉 Wi-Fi，但不要關機', '立刻關機', '支付贖金取回檔案'],
          '先隔離以阻止擴散，但不關機：記憶體中保留著對調查有用的痕跡。付款並不能保證任何事。'],
        ['電腦已隔離。接下來？', ['依事件處理程序通知 IT 主管', '什麼都不說，悄悄重灌電腦', '用受感染的電腦寄警告信給全公司'],
          '事件要立刻通報：其他電腦可能也受影響，需要做出決定。'],
        ['主管已知情。要檢查什麼？', ['在防毒軟體主控台檢查其他電腦和網路共用資料夾', '不用檢查：只有一台電腦受影響', '把電腦重新連上網路看看能否使用'],
          '勒索軟體通常也會加密共用資料夾：還原前先確認影響範圍。'],
        ['如何找回檔案？', ['確認離線備份未受感染後進行還原', '從同步到雲端的資料夾還原', '等待解密工具推出'],
          '同步的副本往往也被加密了：3-2-1 原則中的離線副本才能救命。'],
        ['檔案已還原。最後？', ['變更密碼、安裝更新、記錄並通報事件', '讓電腦原樣重新上線使用', '停用拖慢還原速度的防毒軟體'],
          '修補漏洞、保留紀錄並通報：如涉及個人資料，須在 72 小時內通知資料保護機關（法國為 CNIL）。']
      ],
      rpTag: (n, t) => `工單 ${n}/${t}`, rpTitle: '回覆工單',
      rpSlots: ['稱呼', '確認收到', '解決方法', '結尾'], rpPick: (s) => `請選擇：${s}`,
      rpPreview: '你的回覆', rpSign: 'Jérémy，IT 支援', rpNext: '下一張工單', rpEnd: '查看結果',
      rpDoneTitle: '回覆已送出', rpDoneMsg: (s, m) => `書面表達：${s}/${m}。`,
      replies: [
        ['您好，從今天早上開始我無法列印，很急：我下午 2 點要交一份文件。', 'Leroy 女士，人力資源部', [
          [['Leroy 女士，您好：', 10, '有禮貌而且有針對性。'], ['嗨，', 5, '對不太熟的使用者太隨便。'], ['回覆：', 0, '生硬、冷淡。']],
          [['謝謝您的留言，我了解您下午 2 點交文件的急迫。', 10, '表示你了解了需求。'], ['您的工單已收到。', 5, '沒錯，但很冷淡：沒有回應緊急程度。'], ['開工單前應該先看操作說明。', 0, '指責對使用者沒有幫助。']],
          [['我已重新啟動列印服務，請再試一次好嗎？在此期間，3 樓的印表機可以使用。', 10, '動作清楚，還提供了備用方案。'], ['列印多工緩衝器當掉了，我執行了 Restart-Service Spooler。', 5, '正確，但對使用者來說太技術性。'], ['重開機試試，再看看。', 0, '含糊：沒說明做了什麼。']],
          [['如果問題再出現，可撥分機 4321 聯絡我。祝您順心。', 10, '她知道如何再聯絡你。'], ['敬上。', 5, '有禮貌，但沒有後續。'], ['工單已關閉。', 0, '太生硬：她不知道問題是否已解決。']]
        ]],
        ['我的密碼過期了，帳號被鎖，沒辦法工作了！！', 'Karim，業務部', [
          [['Karim，你好：', 10, '簡單親切。'], ['先生，您好：', 5, '有禮貌，但他用名字署名，這樣顯得疏遠。'], ['喲，', 0, '不專業。']],
          [['抱歉造成不便，我們馬上處理。', 10, '有同理心，並主動負責。'], ['這是公司的資安規定。', 5, '沒錯，但對他眼下沒幫助。'], ['這已經是這個月第三次了。', 0, '在最糟的時候指責。']],
          [['你的帳號已解鎖：登入時請設定新密碼，使用 12 個字元以上的密碼片語。', 10, '清楚、安全，密碼仍由他自己掌握。'], ['我執行了 Unlock-ADAccount 並重設了。', 5, '使用者聽不懂的術語。'], ['我把新密碼用電子郵件寄給你。', 0, '絕不能用電子郵件寄送明文密碼。']],
          [['如果登入不了，請回電給我。祝你順心。', 10, '他知道出問題時該怎麼做。'], ['應該沒問題了吧。', 5, '不太讓人放心。'], ['請別再忘了。', 0, '沒必要的說教。']]
        ]]
      ],
      bdTitle: '徽章', bdSub: '玩遊戲贏徽章：徽章儲存在這個瀏覽器中。',
      bdCount: (n, t) => `已解鎖 ${n}/${t} 枚徽章`, bdShare: '分享我的成績', bdCopied: '成績已複製',
      bdShareText: (n, t, list, url) => `我在 IT 技術員 Jérémy Grosjean（尋找建教合作職缺）的網站上解鎖了 ${n}/${t} 枚徽章${list ? '：' + list : ''}。換你了：${url}`,
      bdNew: (b) => `🏅 新徽章：${b}`, bdLocked: '未解鎖',
      badges: [
        ['第一步', '完成第一個遊戲。'], ['伺服器守護者', '完成一局「保護伺服器」。'],
        ['一線支援滿分', '一線支援獲得最高分。'], ['二線支援滿分', '二線支援獲得最高分。'],
        ['診斷零失誤', '「找出故障」獲得最高分。'], ['Active Directory 高手', 'AD 測驗獲得最高分。'],
        ['火眼金睛', '辨識出所有釣魚郵件。'], ['心算', '在子網路遊戲中得分。'],
        ['優先順序掌握', '所有工單優先順序都正確。'], ['PowerShell 零失誤', '所有指令一次答對。'],
        ['完美網路線', 'RJ45 網路線遊戲獲得最高分。'], ['令人安心的聲音', '完美的電話：溝通和技術都滿分。'],
        ['一次準備到位', '零失誤準備好一台電腦。'], ['危機反應', '面對勒索軟體全部做對。'],
        ['支援文筆', '兩張工單都給出最佳回覆。'], ['持之以恆', '連續 3 天完成每日挑戰。'],
        ['好奇心', '找到 5 個隱藏彩蛋。'], ['全部彩蛋', '找到全部 11 個隱藏彩蛋。'],
        ['全能選手', '玩過全部 13 個小遊戲。'], ['資深技術員', '解鎖其他所有徽章。']
      ],
      help: [['poste', '遊戲：準備一台電腦'], ['rancon', '遊戲：勒索軟體攻擊'], ['reponse', '遊戲：回覆工單'], ['badges', '我的徽章']]
    },
    yue: {
      play: '玩：13 個小遊戲',
      pickPrepT: '準備一部電腦', pickPrepD: '新同事星期一返工：將準備電腦嘅步驟排好次序。',
      pickRansomT: '勒索軟件攻擊', pickRansomD: '啲檔案俾人加密咗：按正確次序做啱嘅反應。',
      pickReplyT: '回覆工單', pickReplyD: '逐句砌出一個清楚、有禮貌嘅用戶回覆。',
      badgesBtn: '徽章',
      prTag: (n, t) => `第 ${n}/${t} 步`, prTitle: '幫新同事準備電腦',
      prSub: '由第一步到最後一步，順序㩒。',
      prBad: '未得：應該先做另一步。', prOk: '✓ 電腦準備好，已經交俾用戶！',
      prEnd: '睇結果', prDoneTitle: (e) => e ? `電腦準備好，有 ${e} 個錯` : '電腦準備好，一個錯都冇',
      prDoneMsg: (s, m) => `分數：${s}/${m}。`,
      prSteps: [
        ['檢查硬件，貼資產標籤', '先檢查收到嘅電腦，登記入資產清單。'],
        ['更新 BIOS/UEFI，開啟安全開機', '裝系統之前先設定韌體。'],
        ['安裝 Windows 11（USB 手指或者網絡部署）', '作業系統係其他一切嘅基礎。'],
        ['安裝驅動程式同 Windows 更新', '系統保持最新，裝置認得到。'],
        ['將電腦加入 Active Directory 網域', '電腦接入公司網絡同帳戶。'],
        ['套用群組原則（gpupdate /force）再檢查', '加入網域之後，公司嘅規則（保安、磁碟機、打印機）先會生效。'],
        ['安裝防毒軟件同業務軟件', '喺已經加固同設定好嘅電腦上面裝工作工具。'],
        ['將電腦交俾用戶，簽交接單', '講解重點，留低交接記錄。']
      ],
      rwTag: (n, t) => `第 ${n}/${t} 步`, rwTitle: '警報：會計部一部電腦顯示「你嘅檔案已經被加密」',
      rwGood: '✓ 反應啱。', rwBad: '✗ 反應唔啱。', rwRetry: '揀過第二個做法。', rwNext: '下一步', rwEnd: '睇結果',
      rwDoneTitle: (ok, n) => `${ok}/${n} 次一次就做啱`, rwDoneMsg: (s, m) => `分數：${s}/${m}。`,
      rw321: '3-2-1 原則：資料留 3 份，放喺 2 種唔同媒體，其中 1 份離線或者異地保存。',
      ransom: [
        ['電腦出現勒索訊息。第一步點做？', ['拔走網線同關 Wi-Fi，但唔好熄機', '即刻熄機', '俾贖金攞返啲檔案'],
          '先隔離阻止擴散，但唔熄機：記憶體入面有對調查有用嘅痕跡。俾錢都冇保證。'],
        ['電腦隔離咗。跟住？', ['按事故處理程序通知 IT 主管', '乜都唔講，靜靜雞重裝電腦', '用中咗毒嘅電腦發警告電郵俾全公司'],
          '事故要即刻通報：其他電腦可能都中咗，要做決定。'],
        ['主管知道咗。要檢查乜？', ['喺防毒軟件控制台檢查其他電腦同網絡共享資料夾', '唔使檢查：得一部電腦中', '將電腦重新連網睇下用唔用到'],
          '勒索軟件通常連共享資料夾都會加密：還原之前先睇清楚影響範圍。'],
        ['點樣攞返啲檔案？', ['確認離線備份冇中毒之後再還原', '由同步咗上雲嘅資料夾還原', '等解密工具出'],
          '同步嘅副本通常都一齊被加密：3-2-1 原則入面嘅離線副本先救到你。'],
        ['檔案還原咗。最後？', ['改密碼、裝更新、記錄同通報事故', '原封不動將電腦再用', '停用拖慢還原嘅防毒軟件'],
          '修補漏洞、留記錄同通報：如果涉及個人資料，要喺 72 小時內通知資料保護機構（法國係 CNIL）。']
      ],
      rpTag: (n, t) => `工單 ${n}/${t}`, rpTitle: '回覆工單',
      rpSlots: ['稱呼', '確認收到', '解決方法', '結尾'], rpPick: (s) => `請揀：${s}`,
      rpPreview: '你嘅回覆', rpSign: 'Jérémy，IT 支援', rpNext: '下一張工單', rpEnd: '睇結果',
      rpDoneTitle: '回覆已經發出', rpDoneMsg: (s, m) => `書面表達：${s}/${m}。`,
      replies: [
        ['你好，由今朝開始我打印唔到，好急：我下晝 2 點要交一份文件。', 'Leroy 女士，人力資源部', [
          [['Leroy 女士，你好：', 10, '有禮貌又有針對性。'], ['Hi，', 5, '對唔係好熟嘅用戶太隨便。'], ['回覆：', 0, '生硬、冷淡。']],
          [['多謝你嘅訊息，我明白你下晝 2 點要交文件好急。', 10, '表示你明白佢嘅需要。'], ['你嘅工單已經收到。', 5, '冇錯，但好冷淡：冇回應佢有幾急。'], ['開工單之前應該睇咗操作指引先。', 0, '怪責用戶冇幫助。']],
          [['我已經重新啟動打印服務，可唔可以再試一次？同時，3 樓部打印機用得。', 10, '做法清楚，仲有後備方案。'], ['打印緩衝器死咗，我行咗 Restart-Service Spooler。', 5, '啱，但對用戶嚟講太技術。'], ['試下重新開機，睇下點。', 0, '含糊：冇講做咗乜。']],
          [['如果問題再出現，可以打內線 4321 搵我。祝你今日順利。', 10, '佢知道點樣再搵你。'], ['此致。', 5, '有禮貌，但冇跟進。'], ['工單已關閉。', 0, '太硬：佢唔知問題解決咗未。']]
        ]],
        ['我個密碼過咗期，帳戶鎖咗，做唔到嘢！！', 'Karim，銷售部', [
          [['Karim，你好：', 10, '簡單親切。'], ['先生，你好：', 5, '有禮貌，但佢用名簽名，咁樣好疏離。'], ['喂，', 0, '唔專業。']],
          [['唔好意思令你受阻，我哋即刻搞掂。', 10, '有同理心，主動跟進。'], ['呢啲係公司嘅保安規定。', 5, '冇錯，但對佢而家冇幫助。'], ['呢個月已經係第三次。', 0, '喺最差嘅時候怪人。']],
          [['你個帳戶已經解鎖：登入時請設定新密碼，用 12 個字元或以上嘅密碼短句。', 10, '清楚、安全，密碼仲係由佢自己控制。'], ['我行咗 Unlock-ADAccount 同重設。', 5, '用戶聽唔明嘅術語。'], ['我用電郵將新密碼發俾你。', 0, '絕對唔可以用電郵發明文密碼。']],
          [['如果登入唔到，請覆電話俾我。祝你今日順利。', 10, '佢知道有問題時點做。'], ['應該冇問題㗎喇。', 5, '唔係好令人放心。'], ['唔該唔好再唔記得。', 0, '冇必要嘅說教。']]
        ]]
      ],
      bdTitle: '徽章', bdSub: '玩遊戲贏徽章：徽章儲存喺呢個瀏覽器。',
      bdCount: (n, t) => `已經解鎖 ${n}/${t} 個徽章`, bdShare: '分享我嘅成績', bdCopied: '成績已經複製',
      bdShareText: (n, t, list, url) => `我喺 IT 技術員 Jérémy Grosjean（搵緊工讀職位）嘅網站解鎖咗 ${n}/${t} 個徽章${list ? '：' + list : ''}。到你喇：${url}`,
      bdNew: (b) => `🏅 新徽章：${b}`, bdLocked: '未解鎖',
      badges: [
        ['第一步', '完成第一個遊戲。'], ['伺服器守護者', '完成一局「保護伺服器」。'],
        ['一線支援滿分', '一線支援攞最高分。'], ['二線支援滿分', '二線支援攞最高分。'],
        ['診斷零失誤', '「搵出故障」攞最高分。'], ['Active Directory 高手', 'AD 測驗攞最高分。'],
        ['火眼金睛', '認出晒所有釣魚電郵。'], ['心算', '喺子網遊戲攞分。'],
        ['優先次序掌握', '所有工單優先次序都啱。'], ['PowerShell 零失誤', '所有指令一次答啱。'],
        ['完美網線', 'RJ45 網線遊戲攞最高分。'], ['令人安心嘅聲音', '完美嘅電話：溝通同技術都滿分。'],
        ['一次準備好', '零失誤準備好一部電腦。'], ['危機反應', '面對勒索軟件全部做啱。'],
        ['支援文筆', '兩張工單都揀最好嘅回覆。'], ['持之以恆', '連續 3 日完成每日挑戰。'],
        ['好奇心', '搵到 5 個隱藏彩蛋。'], ['全部彩蛋', '搵晒 11 個隱藏彩蛋。'],
        ['全能選手', '玩過晒 13 個小遊戲。'], ['資深技術員', '解鎖晒其他所有徽章。']
      ],
      help: [['poste', '遊戲：準備一部電腦'], ['rancon', '遊戲：勒索軟件攻擊'], ['reponse', '遊戲：回覆工單'], ['badges', '我嘅徽章']]
    },
    ko: {
      play: '게임하기: 미니게임 13개',
      pickPrepT: 'PC 준비하기', pickPrepD: '신입 사원이 월요일에 출근합니다. PC 준비 단계를 순서대로 맞추세요.',
      pickRansomT: '랜섬웨어 공격', pickRansomD: '파일이 암호화되었습니다. 올바른 대응을 올바른 순서로 고르세요.',
      pickReplyT: '티켓에 답하기', pickReplyD: '사용자에게 보낼 명확하고 정중한 답장을 한 문장씩 완성하세요.',
      badgesBtn: '배지',
      prTag: (n, t) => `${n}/${t}단계`, prTitle: '신입 사원의 PC를 준비하세요',
      prSub: '첫 단계부터 마지막 단계까지 순서대로 누르세요.',
      prBad: '아직 아닙니다. 이 단계보다 먼저 할 일이 있습니다.', prOk: '✓ PC가 준비되어 사용자에게 전달되었습니다!',
      prEnd: '결과 보기', prDoneTitle: (e) => e ? `PC 준비 완료, 오류 ${e}개` : 'PC 준비 완료, 오류 없음',
      prDoneMsg: (s, m) => `점수: ${s}/${m}.`,
      prSteps: [
        ['하드웨어를 확인하고 자산 라벨 붙이기', '받은 PC를 먼저 점검하고 자산 목록에 등록합니다.'],
        ['BIOS/UEFI 업데이트 및 보안 부팅 활성화', '시스템을 설치하기 전에 펌웨어를 설정합니다.'],
        ['Windows 11 설치(USB 또는 네트워크 배포)', '운영체제는 다른 모든 작업의 기반입니다.'],
        ['드라이버와 Windows 업데이트 설치', '최신 시스템과 인식되는 장치.'],
        ['PC를 Active Directory 도메인에 가입', 'PC가 회사 네트워크와 계정 체계에 연결됩니다.'],
        ['그룹 정책 적용(gpupdate /force) 및 확인', '도메인에 가입한 뒤에야 회사 규칙(보안, 드라이브, 프린터)이 적용됩니다.'],
        ['백신과 업무용 소프트웨어 설치', '보안과 설정이 끝난 PC에 업무 도구를 설치합니다.'],
        ['사용자에게 PC 전달 및 인수인계서 서명', '핵심을 설명하고 인계 기록을 남깁니다.']
      ],
      rwTag: (n, t) => `${n}/${t}단계`, rwTitle: '경고: 회계팀 PC에 “파일이 암호화되었습니다” 표시',
      rwGood: '✓ 올바른 대응입니다.', rwBad: '✗ 잘못된 대응입니다.', rwRetry: '다른 행동을 고르세요.', rwNext: '다음 단계', rwEnd: '결과 보기',
      rwDoneTitle: (ok, n) => `${ok}/${n}개를 한 번에 맞힘`, rwDoneMsg: (s, m) => `점수: ${s}/${m}.`,
      rw321: '3-2-1 규칙: 데이터 사본 3개를 서로 다른 매체 2곳에 두고, 그중 1개는 오프라인이나 외부에 보관합니다.',
      ransom: [
        ['PC에 몸값 요구 메시지가 떴습니다. 첫 행동은?', ['전원을 끄지 말고 네트워크 케이블을 뽑고 Wi-Fi를 끈다', '즉시 PC 전원을 끈다', '파일을 되찾기 위해 몸값을 지불한다'],
          '확산을 막기 위해 격리하되 전원은 끄지 않습니다. 메모리에 조사에 유용한 흔적이 남아 있습니다. 돈을 내도 보장되는 것은 없습니다.'],
        ['PC를 격리했습니다. 다음은?', ['사고 대응 절차에 따라 IT 책임자에게 알린다', '아무 말 없이 조용히 PC를 재설치한다', '감염된 PC로 전 직원에게 경고 메일을 보낸다'],
          '사고는 즉시 보고합니다. 다른 PC도 감염되었을 수 있고 결정이 필요합니다.'],
        ['책임자에게 알렸습니다. 무엇을 확인할까요?', ['백신 관리 콘솔에서 다른 PC와 네트워크 공유 폴더', '아무것도: PC 한 대만 감염됐다', 'PC를 다시 네트워크에 연결해 작동하는지 본다'],
          '랜섬웨어는 공유 폴더도 암호화하는 경우가 많습니다. 복원 전에 범위를 파악합니다.'],
        ['파일은 어떻게 복구할까요?', ['오프라인 백업이 깨끗한지 확인한 뒤 복원한다', '클라우드와 동기화된 폴더에서 복원한다', '복호화 도구가 나오기를 기다린다'],
          '동기화된 사본도 함께 암호화된 경우가 많습니다. 3-2-1 규칙의 오프라인 사본이 해결책입니다.'],
        ['파일을 복원했습니다. 마무리는?', ['비밀번호 변경, 업데이트 설치, 사고 기록 및 신고', 'PC를 그대로 다시 사용한다', '복원을 느리게 한 백신을 끈다'],
          '취약점을 고치고 기록을 남기고 신고합니다. 개인정보가 관련되면 72시간 안에 감독 기관(프랑스는 CNIL)에 알립니다.']
      ],
      rpTag: (n, t) => `티켓 ${n}/${t}`, rpTitle: '티켓에 답하기',
      rpSlots: ['인사', '접수 확인', '해결 방법', '마무리'], rpPick: (s) => `선택: ${s}`,
      rpPreview: '내 답장', rpSign: 'Jérémy, IT 지원', rpNext: '다음 티켓', rpEnd: '결과 보기',
      rpDoneTitle: '답장 전송 완료', rpDoneMsg: (s, m) => `글쓰기 품질: ${s}/${m}.`,
      replies: [
        ['안녕하세요, 오늘 아침부터 인쇄가 안 돼요. 급해요: 오후 2시까지 제출할 서류가 있어요.', '인사팀 Leroy 님', [
          [['Leroy 님, 안녕하세요.', 10, '정중하고 개인적입니다.'], ['안녕~', 5, '잘 모르는 사용자에게는 너무 가볍습니다.'], ['Re:', 0, '딱딱하고 무성의합니다.']],
          [['메시지 감사합니다. 오후 2시 서류 때문에 급하신 점 이해합니다.', 10, '요청을 이해했다는 것을 보여 줍니다.'], ['티켓이 접수되었습니다.', 5, '맞지만 차갑습니다. 급한 상황을 언급하지 않았습니다.'], ['티켓을 열기 전에 절차를 읽어 보셔야 합니다.', 0, '사용자를 탓해도 도움이 되지 않습니다.']],
          [['인쇄 서비스를 다시 시작했습니다. 다시 시도해 주시겠어요? 그동안 3층 프린터를 쓰실 수 있습니다.', 10, '명확한 조치와 대안까지 제시합니다.'], ['스풀러가 멈춰서 Restart-Service Spooler를 실행했습니다.', 5, '맞지만 사용자에게 너무 기술적입니다.'], ['재부팅해 보세요, 두고 보죠.', 0, '모호합니다. 무엇을 했는지 알 수 없습니다.']],
          [['문제가 다시 생기면 내선 4321로 연락 주세요. 좋은 하루 보내세요.', 10, '다시 연락하는 방법을 알려 줍니다.'], ['감사합니다.', 5, '정중하지만 후속 안내가 없습니다.'], ['티켓 종료.', 0, '퉁명스럽습니다. 해결됐는지 알 수 없습니다.']]
        ]],
        ['비밀번호가 만료돼서 계정이 잠겼어요, 일을 못 해요!!', '영업팀 Karim 님', [
          [['Karim 님, 안녕하세요.', 10, '간단하고 친근합니다.'], ['고객님께,', 5, '정중하지만 이름으로 서명한 사람에게는 거리감이 있습니다.'], ['야,', 0, '전문적이지 않습니다.']],
          [['불편을 드려 죄송합니다. 바로 해결해 드리겠습니다.', 10, '공감과 책임감을 보여 줍니다.'], ['회사 보안 규정 때문입니다.', 5, '사실이지만 지금 당장은 도움이 되지 않습니다.'], ['이번 달에만 세 번째네요.', 0, '최악의 순간에 탓하는 말입니다.']],
          [['계정 잠금을 해제했습니다. 로그인할 때 12자 이상의 암호 문구로 새 비밀번호를 설정해 주세요.', 10, '명확하고 안전하며, 비밀번호는 본인이 관리합니다.'], ['Unlock-ADAccount를 실행하고 초기화했습니다.', 5, '사용자가 이해하기 어려운 용어입니다.'], ['새 비밀번호를 메일로 보내 드릴게요.', 0, '비밀번호를 평문 메일로 보내면 절대 안 됩니다.']],
          [['로그인이 안 되면 다시 전화 주세요. 좋은 하루 보내세요.', 10, '문제가 생기면 어떻게 할지 알 수 있습니다.'], ['아마 될 거예요.', 5, '별로 안심이 되지 않습니다.'], ['다음엔 잊지 마세요.', 0, '불필요한 훈계입니다.']]
        ]]
      ],
      bdTitle: '배지', bdSub: '게임을 하며 배지를 모으세요. 배지는 이 브라우저에 저장됩니다.',
      bdCount: (n, t) => `배지 ${n}/${t}개 획득`, bdShare: '내 결과 공유하기', bdCopied: '결과가 복사되었습니다',
      bdShareText: (n, t, list, url) => `IT 기술자 Jérémy Grosjean(일·학습 병행 구직 중)의 사이트에서 배지 ${n}/${t}개를 얻었어요${list ? ': ' + list : ''}. 이제 당신 차례예요: ${url}`,
      bdNew: (b) => `🏅 새 배지: ${b}`, bdLocked: '잠김',
      badges: [
        ['첫걸음', '첫 게임을 끝내세요.'], ['서버 수호자', '“서버 지키기”를 한 판 끝내세요.'],
        ['1차 지원 만점', '1차 지원에서 최고 점수.'], ['2차 지원 만점', '2차 지원에서 최고 점수.'],
        ['완벽한 진단', '“고장 찾기”에서 최고 점수.'], ['Active Directory 고수', 'AD 퀴즈에서 최고 점수.'],
        ['매의 눈', '모든 피싱 메일을 찾아내세요.'], ['암산왕', '서브넷 게임에서 점수를 얻으세요.'],
        ['우선순위 마스터', '모든 티켓의 우선순위를 맞히세요.'], ['완벽한 PowerShell', '모든 명령을 한 번에 맞히세요.'],
        ['완벽한 케이블', 'RJ45 케이블 게임에서 최고 점수.'], ['안심되는 목소리', '응대와 기술 모두 완벽한 통화.'],
        ['한 번에 준비 완료', '오류 없이 PC를 준비하세요.'], ['위기 대응', '랜섬웨어에 모두 올바르게 대응하세요.'],
        ['지원팀 글솜씨', '두 티켓 모두 최고의 답장.'], ['꾸준함', '오늘의 도전을 3일 연속 성공하세요.'],
        ['호기심', '숨겨진 비밀 5개를 찾으세요.'], ['모든 비밀', '숨겨진 비밀 11개를 모두 찾으세요.'],
        ['만능 플레이어', '미니게임 13개를 모두 해 보세요.'], ['노련한 기술자', '다른 배지를 모두 얻으세요.']
      ],
      help: [['poste', '게임: PC 준비하기'], ['rancon', '게임: 랜섬웨어 공격'], ['reponse', '게임: 티켓에 답하기'], ['badges', '내 배지']]
    }
  };

  for (const k in D) {
    if (!L[k]) continue;
    const d = Object.assign({}, D[k]); const help = d.help; delete d.help;
    Object.assign(L[k], d);
    const H = L[k].tHelp;
    if (H && !H.some(h => h[0] === help[0][0])) { const at = H.findIndex(x => x[0] === 'clear'); H.splice(at < 0 ? H.length : at, 0, ...help); }
  }
})(window.JG_I18N || {});
