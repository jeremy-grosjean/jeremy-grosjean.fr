/* jeremy-grosjean.fr — Lot 10 : mini-jeu « Trouve la panne » et quiz Active Directory / GPO (textes en 6 langues) */
(function (L) {
  'use strict';
  /* Sorties de commandes façon Windows : en français pour le français, en anglais pour les autres langues */
  const OUT_FR = {
    nic: 'Carte Ethernet Ethernet :', media: 'Statut du média', mediaOff: 'Média déconnecté', ip: 'Adresse IPv4', apipa: 'Adresse IPv4 autoconfigurée',
    mask: 'Masque de sous-réseau', gw: 'Passerelle par défaut', dns: 'Serveurs DNS', dup: '(Dupliquée)',
    pingHead: (h) => `Envoi d'une requête 'Ping'  ${h} avec 32 octets de données :`, reply: (h, ms) => `Réponse de ${h} : octets=32 temps=${ms} ms TTL=64`,
    timeout: "Délai d'attente de la demande dépassé.", fail: 'PING : échec de la transmission. Échec général.',
    stats: (r) => `Paquets : envoyés = 4, reçus = ${r}, perdus = ${4 - r} (perte ${(4 - r) * 25}%)`, noGw: 'Aucune passerelle par défaut configurée.',
    nsSrv: (s) => `Serveur :   UnKnown\nAddress:  ${s}`, nsOk: 'Réponse ne faisant pas autorité :\nNom :    jeremy-grosjean.fr\nAddress:  51.91.236.255',
    nsTimeout: (s) => `DNS request timed out.\n    timeout was 2 seconds.\n*** Le délai de la demande à UnKnown (${s}) a expiré`, nsNone: '*** Aucun serveur DNS disponible.'
  };
  const OUT_EN = {
    nic: 'Ethernet adapter Ethernet:', media: 'Media State', mediaOff: 'Media disconnected', ip: 'IPv4 Address', apipa: 'Autoconfiguration IPv4 Address',
    mask: 'Subnet Mask', gw: 'Default Gateway', dns: 'DNS Servers', dup: '(Duplicate)',
    pingHead: (h) => `Pinging ${h} with 32 bytes of data:`, reply: (h, ms) => `Reply from ${h}: bytes=32 time=${ms}ms TTL=64`,
    timeout: 'Request timed out.', fail: 'PING: transmit failed. General failure.',
    stats: (r) => `Packets: Sent = 4, Received = ${r}, Lost = ${4 - r} (${(4 - r) * 25}% loss)`, noGw: 'No default gateway configured.',
    nsSrv: (s) => `Server:  UnKnown\nAddress:  ${s}`, nsOk: 'Non-authoritative answer:\nName:    jeremy-grosjean.fr\nAddress:  51.91.236.255',
    nsTimeout: (s) => `DNS request timed out.\n    timeout was 2 seconds.\n*** Request to UnKnown (${s}) timed-out`, nsNone: '*** No DNS server available.'
  };

  const D = {
    fr: {
      ui: {
        play: 'Jouer : 4 mini-jeux',
        tourPlay: 'Quatre mini-jeux : protéger un serveur, résoudre des tickets de support, trouver une panne réseau ou répondre au quiz Active Directory.',
        pickPanneT: 'Trouve la panne', pickPanneD: "Un PC n’accède plus au réseau : lancez les bonnes commandes et trouvez la cause.",
        pickQuizT: 'Quiz Active Directory et GPO', pickQuizD: "10 questions sur AD, les GPO et le DNS, avec l’explication de chaque réponse.",
        pnTag: (n, t) => `Panne ${n}/${t} · Réseau`, pnPts: (s) => `${s} pts`, pnTitle: (n) => `Incident n° ${n}`, pnFrom: 'De :',
        pnCmdsL: 'Lancez des commandes sur le poste :', pnAskL: 'Votre diagnostic :', pnNeed: 'Lancez au moins une commande avant de répondre.',
        pnGood: '✓ Bon diagnostic.', pnBad: '✗ Ce n’est pas ça : relisez les résultats, du plus proche au plus lointain.', pnNext: 'Panne suivante', pnEnd: 'Voir le résultat',
        pnDoneTag: 'Résultat', pnDoneTitle: (p, t) => p === t ? 'Diagnostic parfait ✔' : `${p}/${t} pannes trouvées du premier coup`,
        pnDoneMsg: (s, m, c) => `Score : ${s}/${m} points, en ${c} commandes. La méthode : carte réseau, adresse IP, passerelle, Internet, puis DNS.`,
        pnBest: (b) => `Meilleur score : ${b}`,
        qzTag: (n, t) => `Question ${n}/${t} · Active Directory`, qzPts: (s) => `${s} pts`, qzGood: '✓ Bonne réponse.', qzBad: '✗ Pas tout à fait.', qzRetry: 'Essayez une autre réponse.',
        qzNext: 'Question suivante', qzEnd: 'Voir le résultat', qzDoneTag: 'Résultat', qzDoneTitle: (p, t) => p === t ? 'Sans faute ✔' : `${p}/${t} bonnes réponses du premier coup`,
        qzDoneMsg: (s, m) => `Score : ${s}/${m} points. Ces notions reviennent tous les jours en support N2.`,
        tPanne: 'Lancement de « Trouve la panne »…', tQuiz: 'Lancement du quiz Active Directory…'
      },
      help: [['panne', 'jeu : trouver une panne réseau'], ['quiz', 'quiz Active Directory et GPO']],
      causes: {
        dhcp: 'Le serveur DHCP ne répond pas', dns: 'Le serveur DNS configuré ne répond pas', gw: 'La passerelle par défaut est mal réglée',
        cable: 'Le câble réseau est débranché', dup: 'Conflit d’adresse IP avec un autre appareil', isp: 'La box ou l’accès Internet est en panne'
      },
      scen: {
        dhcp: ['Sophie, comptabilité', 'Depuis ce matin, plus rien ne marche : ni Internet, ni le serveur de fichiers.', 'L’adresse 169.254.x.x (APIPA) veut dire que Windows n’a reçu aucune réponse du serveur DHCP. On vérifie le câble et le switch, puis le service DHCP.'],
        dns: ['Marc, commercial', 'Aucun site ne s’ouvre, le navigateur dit « adresse introuvable ».', 'Le ping vers 8.8.8.8 répond : le réseau et Internet fonctionnent. Seuls les noms ne sont pas traduits, car le serveur DNS 192.168.1.250 ne répond pas. On corrige le DNS (dans le DHCP ou la carte réseau).'],
        gw: ['Léa, accueil', 'J’ai changé de bureau et un collègue a réglé mon adresse IP à la main. Depuis, plus d’Internet.', 'La passerelle 192.168.2.1 n’est pas dans le réseau 192.168.1.0/24 du poste : les paquets ne sortent jamais du réseau local. On met 192.168.1.1, ou on repasse en DHCP.'],
        cable: ['Paul, atelier', 'Mon PC fixe affiche « Pas d’accès réseau » avec une croix rouge.', '« Média déconnecté » : la carte réseau ne voit aucun lien. On vérifie le câble, la prise murale et le voyant du switch avant de toucher aux réglages.'],
        dup: ['Nadia, RH', 'Windows m’a affiché « conflit d’adresse IP », puis plus de réseau.', 'L’adresse fixe 192.168.1.20 est déjà utilisée par un autre appareil, souvent une imprimante. On repasse le poste en DHCP, ou on garde les adresses fixes hors de la plage DHCP.'],
        isp: ['Tout le service', 'Plus personne n’a Internet, mais l’imprimante et le serveur de fichiers marchent.', 'La passerelle (la box) répond, mais rien au-delà : ni 8.8.8.8, ni le DNS qui passe par la box. Le réseau local est sain : on redémarre la box, on regarde ses voyants, puis on appelle le fournisseur d’accès.']
      },
      quiz: [
        ['Vous avez modifié une GPO. Comment l’appliquer tout de suite sur un poste ?', ['gpupdate /force sur le poste', 'Redémarrer le contrôleur de domaine', 'Supprimer puis recréer l’OU'], 'gpupdate /force réapplique toutes les stratégies. Sinon, le poste les rafraîchit tout seul environ toutes les 90 minutes.'],
        ['Quelle commande affiche les GPO réellement appliquées à un utilisateur ?', ['gpresult /r', 'ipconfig /all', 'net use'], 'gpresult /r (ou gpresult /h rapport.html) montre les stratégies appliquées et celles filtrées : c’est le premier réflexe quand une GPO « ne marche pas ».'],
        ['Dans quel ordre les GPO sont-elles appliquées ?', ['Locale, site, domaine, OU', 'OU, domaine, site, locale', 'Domaine, site, OU, locale'], 'On retient « LSDOU ». En cas de conflit, la dernière appliquée l’emporte : la GPO de l’OU la plus proche gagne, sauf si une autre est « Appliquée » (Enforced).'],
        ['Un utilisateur a oublié son mot de passe et son compte est verrouillé. Que faites-vous ?', ['Déverrouiller le compte, réinitialiser le mot de passe et cocher « changer à la prochaine ouverture de session »', 'Supprimer le compte et en créer un nouveau', 'Lui donner le mot de passe d’un collègue'], 'On garde le compte, car ses groupes et ses droits en dépendent, et l’utilisateur choisit lui-même son nouveau mot de passe. Après avoir vérifié son identité.'],
        ['Un poste ne rejoint pas le domaine : « domaine introuvable ». Cause la plus probable ?', ['Son DNS ne pointe pas vers un contrôleur de domaine', 'Son pare-feu Windows est activé', 'Sa licence Office a expiré'], 'Le poste trouve les contrôleurs de domaine grâce au DNS. S’il utilise le DNS de la box ou 8.8.8.8, il ne peut pas les trouver.'],
        ['Quel type d’enregistrement DNS permet de trouver les contrôleurs de domaine ?', ['SRV (par exemple _ldap._tcp)', 'MX', 'CNAME'], 'Les enregistrements SRV annoncent les services (LDAP, Kerberos) et les serveurs qui les rendent. C’est pour cela que le DNS est indispensable à Active Directory.'],
        ['Bonne pratique pour donner accès à un dossier partagé à une équipe ?', ['Les utilisateurs dans un groupe global, placé dans un groupe domaine local qui reçoit le droit', 'Ajouter chaque utilisateur directement sur le dossier', 'Mettre l’équipe dans « Admins du domaine »'], 'C’est la méthode AGDLP : ensuite, on gère les arrivées et les départs en changeant seulement les membres du groupe, sans retoucher les droits du dossier.'],
        ['Vous supprimez le lien d’une GPO sur une OU. Que devient la GPO ?', ['Elle existe toujours et peut être liée ailleurs', 'Elle est supprimée définitivement', 'Elle s’applique alors à tout le domaine'], 'Supprimer un lien ne supprime pas la GPO : elle reste dans « Objets de stratégie de groupe ». Pratique pour retirer vite une stratégie sans la perdre.'],
        ['Une GPO de paramètres utilisateur est liée à une OU qui ne contient que des ordinateurs. Que se passe-t-il ?', ['Elle ne s’applique pas, sauf si le traitement en boucle de rappel est activé', 'Elle s’applique à tous les utilisateurs du domaine', 'Elle s’applique aux contrôleurs de domaine'], 'Les paramètres utilisateur suivent l’OU de l’utilisateur. Le traitement en boucle de rappel (loopback) sert justement à les appliquer selon l’ordinateur, par exemple sur des postes en libre-service.'],
        ['Quel port utilise LDAP sans chiffrement ?', ['389', '53', '3389'], '389 pour LDAP, 636 pour LDAPS (chiffré). 53 est le DNS et 3389 le Bureau à distance.'],
        ['L’horloge d’un poste a 10 minutes de retard. Que risque-t-il ?', ['L’authentification Kerberos échoue', 'Rien : l’heure n’a pas d’importance', 'Ses GPO s’appliquent deux fois'], 'Par défaut, Kerberos refuse plus de 5 minutes d’écart. Les postes synchronisent leur heure sur les contrôleurs de domaine (service w32time).'],
        ['Où sont stockés les fichiers des GPO sur un contrôleur de domaine ?', ['Dans le partage SYSVOL', 'Dans C:\\Windows\\Temp', 'Uniquement dans le registre de chaque poste'], 'SYSVOL est répliqué entre les contrôleurs de domaine : chaque poste y lit les fichiers des stratégies (modèles, scripts).']
      ]
    },

    en: {
      ui: {
        play: 'Play: 4 mini-games',
        tourPlay: 'Four mini-games: protect a server, solve support tickets, find a network fault or take the Active Directory quiz.',
        pickPanneT: 'Find the fault', pickPanneD: 'A PC has lost the network: run the right commands and find the cause.',
        pickQuizT: 'Active Directory & GPO quiz', pickQuizD: '10 questions on AD, Group Policy and DNS, with an explanation for each answer.',
        pnTag: (n, t) => `Fault ${n}/${t} · Network`, pnPts: (s) => `${s} pts`, pnTitle: (n) => `Incident #${n}`, pnFrom: 'From:',
        pnCmdsL: 'Run commands on the PC:', pnAskL: 'Your diagnosis:', pnNeed: 'Run at least one command before answering.',
        pnGood: '✓ Correct diagnosis.', pnBad: '✗ Not that: reread the results, from nearest to farthest.', pnNext: 'Next fault', pnEnd: 'See the result',
        pnDoneTag: 'Result', pnDoneTitle: (p, t) => p === t ? 'Perfect diagnosis ✔' : `${p}/${t} faults found on the first try`,
        pnDoneMsg: (s, m, c) => `Score: ${s}/${m} points, in ${c} commands. The method: network card, IP address, gateway, Internet, then DNS.`,
        pnBest: (b) => `Best score: ${b}`,
        qzTag: (n, t) => `Question ${n}/${t} · Active Directory`, qzPts: (s) => `${s} pts`, qzGood: '✓ Correct.', qzBad: '✗ Not quite.', qzRetry: 'Try another answer.',
        qzNext: 'Next question', qzEnd: 'See the result', qzDoneTag: 'Result', qzDoneTitle: (p, t) => p === t ? 'No mistakes ✔' : `${p}/${t} correct on the first try`,
        qzDoneMsg: (s, m) => `Score: ${s}/${m} points. These topics come up every day in level 2 support.`,
        tPanne: 'Starting “Find the fault”…', tQuiz: 'Starting the Active Directory quiz…'
      },
      help: [['panne', 'game: find a network fault'], ['quiz', 'Active Directory & GPO quiz']],
      causes: {
        dhcp: 'The DHCP server is not answering', dns: 'The configured DNS server is not answering', gw: 'The default gateway is set wrong',
        cable: 'The network cable is unplugged', dup: 'IP address conflict with another device', isp: 'The router or Internet access is down'
      },
      scen: {
        dhcp: ['Sophie, accounting', 'Since this morning nothing works: no Internet, no file server.', 'A 169.254.x.x address (APIPA) means Windows got no answer from the DHCP server. Check the cable and the switch, then the DHCP service.'],
        dns: ['Marc, sales', 'No website opens, the browser says “address not found”.', 'Pinging 8.8.8.8 works: the network and the Internet are fine. Only names fail, because the DNS server 192.168.1.250 does not answer. Fix the DNS setting (in DHCP or on the network card).'],
        gw: ['Léa, reception', 'I moved desks and a colleague set my IP address by hand. No Internet since.', 'The gateway 192.168.2.1 is not in the PC’s 192.168.1.0/24 network, so packets never leave the local network. Set 192.168.1.1, or switch back to DHCP.'],
        cable: ['Paul, workshop', 'My desktop PC shows “No network access” with a red cross.', '“Media disconnected”: the network card sees no link. Check the cable, the wall socket and the switch light before touching any setting.'],
        dup: ['Nadia, HR', 'Windows showed “IP address conflict”, then the network was gone.', 'The fixed address 192.168.1.20 is already used by another device, often a printer. Switch the PC back to DHCP, or keep fixed addresses outside the DHCP range.'],
        isp: ['The whole team', 'Nobody has Internet, but the printer and the file server still work.', 'The gateway (the router) answers, but nothing beyond it: neither 8.8.8.8 nor the DNS that goes through the router. The local network is fine: restart the router, check its lights, then call the provider.']
      },
      quiz: [
        ['You changed a GPO. How do you apply it right away on a PC?', ['gpupdate /force on the PC', 'Restart the domain controller', 'Delete and recreate the OU'], 'gpupdate /force reapplies every policy. Otherwise the PC refreshes them by itself about every 90 minutes.'],
        ['Which command shows the GPOs actually applied to a user?', ['gpresult /r', 'ipconfig /all', 'net use'], 'gpresult /r (or gpresult /h report.html) lists applied and filtered policies: the first thing to run when a GPO “does not work”.'],
        ['In which order are GPOs applied?', ['Local, site, domain, OU', 'OU, domain, site, local', 'Domain, site, OU, local'], 'Remember “LSDOU”. In a conflict the last one applied wins: the closest OU’s GPO wins, unless another one is Enforced.'],
        ['A user forgot their password and the account is locked. What do you do?', ['Unlock the account, reset the password and tick “must change at next logon”', 'Delete the account and create a new one', 'Give them a colleague’s password'], 'Keep the account, since its groups and rights depend on it, and let the user choose the new password. After checking who they are.'],
        ['A PC cannot join the domain: “domain not found”. Most likely cause?', ['Its DNS does not point to a domain controller', 'Its Windows firewall is on', 'Its Office licence has expired'], 'A PC finds domain controllers through DNS. If it uses the router’s DNS or 8.8.8.8, it cannot find them.'],
        ['Which DNS record type lets clients find domain controllers?', ['SRV (for example _ldap._tcp)', 'MX', 'CNAME'], 'SRV records advertise services (LDAP, Kerberos) and the servers providing them. That is why DNS is essential to Active Directory.'],
        ['Good practice to give a team access to a shared folder?', ['Users in a global group, placed in a domain local group that gets the permission', 'Add each user directly on the folder', 'Put the team in Domain Admins'], 'This is AGDLP: joiners and leavers are then handled by changing group members only, without touching the folder permissions.'],
        ['You delete a GPO’s link on an OU. What happens to the GPO?', ['It still exists and can be linked elsewhere', 'It is deleted for good', 'It now applies to the whole domain'], 'Deleting a link does not delete the GPO: it stays in Group Policy Objects. Handy to remove a policy quickly without losing it.'],
        ['A GPO with user settings is linked to an OU that contains only computers. What happens?', ['It does not apply, unless loopback processing is enabled', 'It applies to every user in the domain', 'It applies to the domain controllers'], 'User settings follow the user’s OU. Loopback processing exists precisely to apply them based on the computer, for example on shared kiosk PCs.'],
        ['Which port does unencrypted LDAP use?', ['389', '53', '3389'], '389 for LDAP, 636 for LDAPS (encrypted). 53 is DNS and 3389 is Remote Desktop.'],
        ['A PC’s clock is 10 minutes behind. What is the risk?', ['Kerberos authentication fails', 'Nothing: time does not matter', 'Its GPOs apply twice'], 'By default Kerberos rejects a gap of more than 5 minutes. PCs sync their time with the domain controllers (w32time service).'],
        ['Where are GPO files stored on a domain controller?', ['In the SYSVOL share', 'In C:\\Windows\\Temp', 'Only in each PC’s registry'], 'SYSVOL is replicated between domain controllers: every PC reads the policy files (templates, scripts) from it.']
      ]
    },

    'zh-Hans': {
      ui: {
        play: '玩：4 个小游戏',
        tourPlay: '四个小游戏：保护服务器、处理支持工单、排查网络故障或挑战 Active Directory 测验。',
        pickPanneT: '排查故障', pickPanneD: '一台电脑连不上网络：运行正确的命令，找出原因。',
        pickQuizT: 'Active Directory 与组策略测验', pickQuizD: '关于 AD、组策略和 DNS 的 10 道题，每题都有解释。',
        pnTag: (n, t) => `故障 ${n}/${t} · 网络`, pnPts: (s) => `${s} 分`, pnTitle: (n) => `事件 #${n}`, pnFrom: '来自：',
        pnCmdsL: '在电脑上运行命令：', pnAskL: '您的诊断：', pnNeed: '回答前请至少运行一条命令。',
        pnGood: '✓ 诊断正确。', pnBad: '✗ 不是这个：从近到远重新看看结果。', pnNext: '下一个故障', pnEnd: '查看结果',
        pnDoneTag: '结果', pnDoneTitle: (p, t) => p === t ? '诊断满分 ✔' : `${p}/${t} 个故障一次找到`,
        pnDoneMsg: (s, m, c) => `得分：${s}/${m}，共用 ${c} 条命令。方法：网卡、IP 地址、网关、互联网，最后是 DNS。`,
        pnBest: (b) => `最高分：${b}`,
        qzTag: (n, t) => `第 ${n}/${t} 题 · Active Directory`, qzPts: (s) => `${s} 分`, qzGood: '✓ 回答正确。', qzBad: '✗ 不太对。', qzRetry: '再试一个答案。',
        qzNext: '下一题', qzEnd: '查看结果', qzDoneTag: '结果', qzDoneTitle: (p, t) => p === t ? '全部答对 ✔' : `${p}/${t} 题一次答对`,
        qzDoneMsg: (s, m) => `得分：${s}/${m}。这些知识在二线支持中每天都会用到。`,
        tPanne: '正在启动“排查故障”…', tQuiz: '正在启动 Active Directory 测验…'
      },
      help: [['panne', '游戏：排查网络故障'], ['quiz', 'Active Directory 与组策略测验']],
      causes: {
        dhcp: 'DHCP 服务器没有响应', dns: '配置的 DNS 服务器没有响应', gw: '默认网关设置错误',
        cable: '网线被拔掉了', dup: '与其他设备发生 IP 地址冲突', isp: '路由器或互联网接入故障'
      },
      scen: {
        dhcp: ['Sophie，财务部', '从今天早上起什么都用不了：上不了网，也连不上文件服务器。', '169.254.x.x 地址（APIPA）表示 Windows 没有收到 DHCP 服务器的任何回应。先检查网线和交换机，再检查 DHCP 服务。'],
        dns: ['Marc，销售部', '所有网站都打不开，浏览器提示“找不到地址”。', 'ping 8.8.8.8 能通：网络和互联网都正常。只是域名无法解析，因为 DNS 服务器 192.168.1.250 没有响应。修正 DNS 设置（在 DHCP 或网卡中）。'],
        gw: ['Léa，前台', '我换了座位，同事手动设置了我的 IP 地址，从那以后就上不了网。', '网关 192.168.2.1 不在电脑所在的 192.168.1.0/24 网段，数据包永远出不了本地网络。改为 192.168.1.1，或改回 DHCP。'],
        cable: ['Paul，车间', '我的台式机显示“无网络访问”，还有一个红叉。', '“媒体已断开”：网卡检测不到连接。先检查网线、墙上插口和交换机指示灯，再去改设置。'],
        dup: ['Nadia，人事部', 'Windows 提示“IP 地址冲突”，然后就断网了。', '固定地址 192.168.1.20 已被其他设备（通常是打印机）占用。把电脑改回 DHCP，或把固定地址放在 DHCP 范围之外。'],
        isp: ['整个部门', '大家都上不了网，但打印机和文件服务器还能用。', '网关（路由器）有响应，但再往外就不通了：8.8.8.8 和经过路由器的 DNS 都没有回应。本地网络正常：重启路由器，查看指示灯，再联系运营商。']
      },
      quiz: [
        ['您修改了一个组策略。如何让它立即在电脑上生效？', ['在电脑上运行 gpupdate /force', '重启域控制器', '删除并重新创建 OU'], 'gpupdate /force 会重新应用所有策略。否则电脑大约每 90 分钟自动刷新一次。'],
        ['哪条命令能显示实际应用到用户的组策略？', ['gpresult /r', 'ipconfig /all', 'net use'], 'gpresult /r（或 gpresult /h report.html）会列出已应用和被筛选掉的策略：组策略“不生效”时首先运行它。'],
        ['组策略按什么顺序应用？', ['本地、站点、域、OU', 'OU、域、站点、本地', '域、站点、OU、本地'], '记住“LSDOU”。发生冲突时，最后应用的生效：离得最近的 OU 的策略优先，除非另一个策略设置了“强制”（Enforced）。'],
        ['用户忘记了密码，账户也被锁定了。您怎么做？', ['解锁账户，重置密码，并勾选“下次登录时须更改密码”', '删除账户再新建一个', '把同事的密码告诉他'], '保留账户，因为它的组和权限都依赖于它，并让用户自己设置新密码。先核实对方身份。'],
        ['一台电脑无法加入域，提示“找不到域”。最可能的原因？', ['它的 DNS 没有指向域控制器', '它开启了 Windows 防火墙', '它的 Office 许可证过期了'], '电脑通过 DNS 找到域控制器。如果它用的是路由器的 DNS 或 8.8.8.8，就找不到它们。'],
        ['哪种 DNS 记录让客户端找到域控制器？', ['SRV（例如 _ldap._tcp）', 'MX', 'CNAME'], 'SRV 记录公布服务（LDAP、Kerberos）以及提供这些服务的服务器。所以 DNS 对 Active Directory 必不可少。'],
        ['给一个团队开放共享文件夹的最佳做法？', ['把用户放进全局组，再把全局组放进获得权限的域本地组', '把每个用户直接加到文件夹上', '把团队加入“域管理员”'], '这就是 AGDLP 方法：以后人员进出只需调整组成员，不用改文件夹权限。'],
        ['您删除了某个 OU 上的组策略链接。这个组策略会怎样？', ['它仍然存在，可以链接到别处', '它被永久删除', '它会应用到整个域'], '删除链接不会删除组策略：它仍保留在“组策略对象”中。这样可以快速撤下策略而不丢失它。'],
        ['一个包含用户设置的组策略链接到只有计算机的 OU。会发生什么？', ['不会生效，除非启用了环回处理', '应用到域中所有用户', '应用到域控制器'], '用户设置跟随用户所在的 OU。环回处理（loopback）正是为了按计算机来应用用户设置，例如在公共自助电脑上。'],
        ['不加密的 LDAP 使用哪个端口？', ['389', '53', '3389'], 'LDAP 使用 389，LDAPS（加密）使用 636。53 是 DNS，3389 是远程桌面。'],
        ['一台电脑的时钟慢了 10 分钟。会有什么风险？', ['Kerberos 身份验证失败', '没事，时间不重要', '它的组策略会应用两次'], 'Kerberos 默认拒绝超过 5 分钟的时间差。电脑会与域控制器同步时间（w32time 服务）。'],
        ['组策略文件存放在域控制器的哪里？', ['SYSVOL 共享中', 'C:\\Windows\\Temp 中', '只存在每台电脑的注册表中'], 'SYSVOL 在域控制器之间复制：每台电脑都从这里读取策略文件（模板、脚本）。']
      ]
    },

    'zh-Hant': {
      ui: {
        play: '玩：4 個小遊戲',
        tourPlay: '四個小遊戲：保護伺服器、處理支援工單、排查網路故障或挑戰 Active Directory 測驗。',
        pickPanneT: '排查故障', pickPanneD: '一台電腦連不上網路：執行正確的指令，找出原因。',
        pickQuizT: 'Active Directory 與群組原則測驗', pickQuizD: '關於 AD、群組原則和 DNS 的 10 道題，每題都有說明。',
        pnTag: (n, t) => `故障 ${n}/${t} · 網路`, pnPts: (s) => `${s} 分`, pnTitle: (n) => `事件 #${n}`, pnFrom: '來自：',
        pnCmdsL: '在電腦上執行指令：', pnAskL: '您的診斷：', pnNeed: '回答前請至少執行一個指令。',
        pnGood: '✓ 診斷正確。', pnBad: '✗ 不是這個：由近到遠再看一次結果。', pnNext: '下一個故障', pnEnd: '查看結果',
        pnDoneTag: '結果', pnDoneTitle: (p, t) => p === t ? '診斷滿分 ✔' : `${p}/${t} 個故障一次找到`,
        pnDoneMsg: (s, m, c) => `得分：${s}/${m}，共用 ${c} 個指令。方法：網路卡、IP 位址、閘道、網際網路，最後是 DNS。`,
        pnBest: (b) => `最高分：${b}`,
        qzTag: (n, t) => `第 ${n}/${t} 題 · Active Directory`, qzPts: (s) => `${s} 分`, qzGood: '✓ 答對了。', qzBad: '✗ 不太對。', qzRetry: '再試另一個答案。',
        qzNext: '下一題', qzEnd: '查看結果', qzDoneTag: '結果', qzDoneTitle: (p, t) => p === t ? '全部答對 ✔' : `${p}/${t} 題一次答對`,
        qzDoneMsg: (s, m) => `得分：${s}/${m}。這些觀念在二線支援中每天都會用到。`,
        tPanne: '正在啟動「排查故障」…', tQuiz: '正在啟動 Active Directory 測驗…'
      },
      help: [['panne', '遊戲：排查網路故障'], ['quiz', 'Active Directory 與群組原則測驗']],
      causes: {
        dhcp: 'DHCP 伺服器沒有回應', dns: '設定的 DNS 伺服器沒有回應', gw: '預設閘道設定錯誤',
        cable: '網路線被拔掉了', dup: '與其他裝置發生 IP 位址衝突', isp: '路由器或網際網路連線故障'
      },
      scen: {
        dhcp: ['Sophie，會計部', '從今天早上開始什麼都不能用：上不了網，也連不到檔案伺服器。', '169.254.x.x 位址（APIPA）代表 Windows 沒有收到 DHCP 伺服器的任何回應。先檢查網路線和交換器，再檢查 DHCP 服務。'],
        dns: ['Marc，業務部', '所有網站都打不開，瀏覽器顯示「找不到位址」。', 'ping 8.8.8.8 會通：網路和網際網路都正常。只是名稱無法解析，因為 DNS 伺服器 192.168.1.250 沒有回應。修正 DNS 設定（在 DHCP 或網路卡中）。'],
        gw: ['Léa，櫃台', '我換了座位，同事手動設定了我的 IP 位址，之後就上不了網。', '閘道 192.168.2.1 不在電腦所在的 192.168.1.0/24 網段，封包永遠出不了區域網路。改成 192.168.1.1，或改回 DHCP。'],
        cable: ['Paul，工作坊', '我的桌機顯示「沒有網路存取」，還有一個紅色叉叉。', '「媒體已中斷連線」：網路卡偵測不到連線。先檢查網路線、牆上插孔和交換器燈號，再去改設定。'],
        dup: ['Nadia，人資部', 'Windows 顯示「IP 位址衝突」，接著就斷線了。', '固定位址 192.168.1.20 已被其他裝置（通常是印表機）使用。把電腦改回 DHCP，或把固定位址放在 DHCP 範圍之外。'],
        isp: ['整個部門', '大家都上不了網，但印表機和檔案伺服器還能用。', '閘道（路由器）有回應，但再往外就不通：8.8.8.8 和經過路由器的 DNS 都沒有回應。區域網路正常：重新啟動路由器、查看燈號，再聯絡網路業者。']
      },
      quiz: [
        ['您修改了一個群組原則。如何讓它立即在電腦上生效？', ['在電腦上執行 gpupdate /force', '重新啟動網域控制站', '刪除並重新建立 OU'], 'gpupdate /force 會重新套用所有原則。否則電腦大約每 90 分鐘會自動重新整理一次。'],
        ['哪個指令能顯示實際套用到使用者的群組原則？', ['gpresult /r', 'ipconfig /all', 'net use'], 'gpresult /r（或 gpresult /h report.html）會列出已套用和被篩選掉的原則：群組原則「沒作用」時第一個要執行的指令。'],
        ['群組原則依什麼順序套用？', ['本機、站台、網域、OU', 'OU、網域、站台、本機', '網域、站台、OU、本機'], '記住「LSDOU」。發生衝突時，最後套用的勝出：最近的 OU 的原則優先，除非另一個原則設為「強制」（Enforced）。'],
        ['使用者忘記密碼，帳戶也被鎖定了。您怎麼做？', ['解除鎖定帳戶、重設密碼，並勾選「使用者必須在下次登入時變更密碼」', '刪除帳戶再新建一個', '把同事的密碼告訴他'], '保留帳戶，因為它的群組和權限都依附於它，並讓使用者自己設定新密碼。先確認對方身分。'],
        ['一台電腦無法加入網域，顯示「找不到網域」。最可能的原因？', ['它的 DNS 沒有指向網域控制站', '它開啟了 Windows 防火牆', '它的 Office 授權過期了'], '電腦透過 DNS 找到網域控制站。如果它用的是路由器的 DNS 或 8.8.8.8，就找不到它們。'],
        ['哪種 DNS 記錄讓用戶端找到網域控制站？', ['SRV（例如 _ldap._tcp）', 'MX', 'CNAME'], 'SRV 記錄公告服務（LDAP、Kerberos）以及提供這些服務的伺服器。所以 DNS 對 Active Directory 不可或缺。'],
        ['讓一個團隊存取共用資料夾的最佳做法？', ['把使用者放進全域群組，再把它放進取得權限的網域本機群組', '把每位使用者直接加到資料夾上', '把團隊加入「Domain Admins」'], '這就是 AGDLP 方法：之後人員異動只需調整群組成員，不必改資料夾權限。'],
        ['您刪除了某個 OU 上的群組原則連結。這個群組原則會怎樣？', ['它仍然存在，可以連結到別處', '它會被永久刪除', '它會套用到整個網域'], '刪除連結不會刪除群組原則：它仍保留在「群組原則物件」中。方便快速撤下原則而不遺失它。'],
        ['一個包含使用者設定的群組原則連結到只有電腦的 OU。會發生什麼？', ['不會生效，除非啟用了迴路處理', '套用到網域中所有使用者', '套用到網域控制站'], '使用者設定跟隨使用者所在的 OU。迴路處理（loopback）正是用來依電腦套用使用者設定，例如在公用自助電腦上。'],
        ['未加密的 LDAP 使用哪個連接埠？', ['389', '53', '3389'], 'LDAP 使用 389，LDAPS（加密）使用 636。53 是 DNS，3389 是遠端桌面。'],
        ['一台電腦的時鐘慢了 10 分鐘。會有什麼風險？', ['Kerberos 驗證失敗', '沒事，時間不重要', '它的群組原則會套用兩次'], 'Kerberos 預設拒絕超過 5 分鐘的時間差。電腦會與網域控制站同步時間（w32time 服務）。'],
        ['群組原則檔案存放在網域控制站的哪裡？', ['SYSVOL 共用資料夾中', 'C:\\Windows\\Temp 中', '只存在每台電腦的登錄檔中'], 'SYSVOL 會在網域控制站之間複寫：每台電腦都從這裡讀取原則檔案（範本、指令碼）。']
      ]
    },

    yue: {
      ui: {
        play: '玩：4 個小遊戲',
        tourPlay: '四個小遊戲：保護伺服器、處理支援工單、搵網絡故障，或者玩 Active Directory 測驗。',
        pickPanneT: '搵出故障', pickPanneD: '一部電腦上唔到網絡：打啱嘅指令，搵出原因。',
        pickQuizT: 'Active Directory 同群組原則測驗', pickQuizD: '10 條關於 AD、群組原則同 DNS 嘅問題，每條都有解釋。',
        pnTag: (n, t) => `故障 ${n}/${t} · 網絡`, pnPts: (s) => `${s} 分`, pnTitle: (n) => `事件 #${n}`, pnFrom: '嚟自：',
        pnCmdsL: '喺電腦度打指令：', pnAskL: '你嘅診斷：', pnNeed: '答之前起碼打一個指令。',
        pnGood: '✓ 診斷啱咗。', pnBad: '✗ 唔係呢個：由近到遠再睇吓結果。', pnNext: '下一個故障', pnEnd: '睇結果',
        pnDoneTag: '結果', pnDoneTitle: (p, t) => p === t ? '診斷滿分 ✔' : `${p}/${t} 個故障一次搵到`,
        pnDoneMsg: (s, m, c) => `得分：${s}/${m}，用咗 ${c} 個指令。方法：網卡、IP 地址、閘道、互聯網，最後係 DNS。`,
        pnBest: (b) => `最高分：${b}`,
        qzTag: (n, t) => `第 ${n}/${t} 題 · Active Directory`, qzPts: (s) => `${s} 分`, qzGood: '✓ 啱咗。', qzBad: '✗ 唔係幾啱。', qzRetry: '試吓另一個答案。',
        qzNext: '下一題', qzEnd: '睇結果', qzDoneTag: '結果', qzDoneTitle: (p, t) => p === t ? '全部答啱 ✔' : `${p}/${t} 題一次答啱`,
        qzDoneMsg: (s, m) => `得分：${s}/${m}。呢啲概念喺二線支援日日都會用到。`,
        tPanne: '開緊「搵出故障」…', tQuiz: '開緊 Active Directory 測驗…'
      },
      help: [['panne', '遊戲：搵網絡故障'], ['quiz', 'Active Directory 同群組原則測驗']],
      causes: {
        dhcp: 'DHCP 伺服器冇回應', dns: '設定咗嘅 DNS 伺服器冇回應', gw: '預設閘道設定錯咗',
        cable: '網線甩咗', dup: '同另一部裝置撞 IP 地址', isp: '路由器或者上網線路壞咗'
      },
      scen: {
        dhcp: ['Sophie，會計部', '今朝開始乜都用唔到：上唔到網，又連唔到檔案伺服器。', '169.254.x.x 地址（APIPA）即係 Windows 收唔到 DHCP 伺服器任何回應。先檢查網線同交換器，再睇 DHCP 服務。'],
        dns: ['Marc，營業部', '所有網站都開唔到，瀏覽器話「搵唔到地址」。', 'ping 8.8.8.8 通到：網絡同互聯網都正常。淨係個名解析唔到，因為 DNS 伺服器 192.168.1.250 冇回應。改返啱個 DNS 設定（喺 DHCP 或者網卡度）。'],
        gw: ['Léa，接待處', '我轉咗位，同事幫我手動設定咗 IP 地址，之後就上唔到網。', '閘道 192.168.2.1 唔喺部電腦嘅 192.168.1.0/24 網段，啲封包永遠出唔到本地網絡。改做 192.168.1.1，或者改返 DHCP。'],
        cable: ['Paul，工場', '我部桌面電腦顯示「冇網絡存取」，仲有個紅色交叉。', '「媒體已中斷連線」：網卡偵測唔到連線。改設定之前，先檢查網線、牆身插口同交換器嘅燈。'],
        dup: ['Nadia，人事部', 'Windows 彈咗「IP 地址衝突」，跟住就冇網。', '固定地址 192.168.1.20 已經俾另一部裝置用緊，通常係打印機。將部電腦改返 DHCP，或者將固定地址放喺 DHCP 範圍以外。'],
        isp: ['成個部門', '個個都上唔到網，但係打印機同檔案伺服器仲用得。', '閘道（路由器）有回應，但再出去就唔通：8.8.8.8 同經路由器嘅 DNS 都冇回應。本地網絡冇問題：重新啟動路由器、睇吓啲燈，再搵網絡供應商。']
      },
      quiz: [
        ['你改咗一個群組原則。點樣即刻喺電腦度生效？', ['喺電腦度打 gpupdate /force', '重新啟動網域控制站', '刪除再重新建立 OU'], 'gpupdate /force 會重新套用所有原則。唔係嘅話，部電腦大約每 90 分鐘會自己更新一次。'],
        ['邊個指令可以睇到實際套用咗喺用戶身上嘅群組原則？', ['gpresult /r', 'ipconfig /all', 'net use'], 'gpresult /r（或者 gpresult /h report.html）會列出套用咗同被篩走嘅原則：群組原則「唔work」嗰陣第一樣要打嘅指令。'],
        ['群組原則係按咩次序套用？', ['本機、站台、網域、OU', 'OU、網域、站台、本機', '網域、站台、OU、本機'], '記住「LSDOU」。有衝突嗰陣，最後套用嗰個贏：最近嗰個 OU 嘅原則優先，除非另一個設咗「強制」（Enforced）。'],
        ['有用戶唔記得密碼，個戶口仲鎖咗。你點做？', ['解鎖戶口、重設密碼，再剔「下次登入時必須更改密碼」', '刪咗個戶口再開過個新嘅', '將同事嘅密碼話俾佢知'], '保留個戶口，因為佢嘅群組同權限都靠佢，再俾用戶自己揀新密碼。記得先核實對方身份。'],
        ['一部電腦加入唔到網域，話「搵唔到網域」。最大可能係咩原因？', ['佢嘅 DNS 冇指向網域控制站', '佢開咗 Windows 防火牆', '佢嘅 Office 授權過咗期'], '電腦靠 DNS 搵網域控制站。如果佢用緊路由器嘅 DNS 或者 8.8.8.8，就搵唔到。'],
        ['邊種 DNS 記錄等用戶端搵到網域控制站？', ['SRV（例如 _ldap._tcp）', 'MX', 'CNAME'], 'SRV 記錄公佈服務（LDAP、Kerberos）同提供呢啲服務嘅伺服器。所以 DNS 對 Active Directory 必不可少。'],
        ['俾一個團隊用共用資料夾，最好嘅做法係？', ['將用戶放入全域群組，再放入攞到權限嘅網域本機群組', '將每個用戶直接加落個資料夾度', '將成個團隊加入「Domain Admins」'], '呢個就係 AGDLP 方法：之後有人入職或者離職，淨係改群組成員就得，唔使郁資料夾權限。'],
        ['你刪咗某個 OU 上面嘅群組原則連結。個群組原則會點？', ['佢仲存在，可以連結去其他地方', '佢會永久刪除', '佢會套用去成個網域'], '刪連結唔會刪群組原則：佢仲喺「群組原則物件」入面。可以快啲撤走原則而唔會冇咗佢。'],
        ['一個有用戶設定嘅群組原則連結咗去一個淨係得電腦嘅 OU。會點？', ['唔會生效，除非開咗迴路處理', '套用去網域所有用戶', '套用去網域控制站'], '用戶設定跟用戶所屬嘅 OU。迴路處理（loopback）就係用嚟按電腦套用用戶設定，例如公用自助電腦。'],
        ['冇加密嘅 LDAP 用邊個埠？', ['389', '53', '3389'], 'LDAP 用 389，LDAPS（加密）用 636。53 係 DNS，3389 係遠端桌面。'],
        ['一部電腦嘅時鐘慢咗 10 分鐘。有咩風險？', ['Kerberos 驗證會失敗', '冇事，時間唔重要', '佢啲群組原則會套用兩次'], 'Kerberos 預設唔接受多過 5 分鐘嘅時差。電腦會同網域控制站對時（w32time 服務）。'],
        ['群組原則嘅檔案存喺網域控制站邊度？', ['SYSVOL 共用資料夾', 'C:\\Windows\\Temp', '淨係喺每部電腦嘅登錄檔'], 'SYSVOL 會喺網域控制站之間複寫：每部電腦都喺度讀原則檔案（範本、指令碼）。']
      ]
    },

    ko: {
      ui: {
        play: '게임하기: 미니게임 4개',
        tourPlay: '미니게임 4개: 서버 지키기, 지원 티켓 해결, 네트워크 장애 찾기, Active Directory 퀴즈.',
        pickPanneT: '장애 찾기', pickPanneD: 'PC가 네트워크에 연결되지 않습니다. 알맞은 명령을 실행해 원인을 찾으세요.',
        pickQuizT: 'Active Directory·그룹 정책 퀴즈', pickQuizD: 'AD, 그룹 정책, DNS에 관한 10문제와 정답 해설.',
        pnTag: (n, t) => `장애 ${n}/${t} · 네트워크`, pnPts: (s) => `${s}점`, pnTitle: (n) => `인시던트 #${n}`, pnFrom: '보낸 사람:',
        pnCmdsL: 'PC에서 명령 실행:', pnAskL: '진단:', pnNeed: '답하기 전에 명령을 하나 이상 실행하세요.',
        pnGood: '✓ 정확한 진단입니다.', pnBad: '✗ 아닙니다. 가까운 곳부터 먼 곳 순서로 결과를 다시 보세요.', pnNext: '다음 장애', pnEnd: '결과 보기',
        pnDoneTag: '결과', pnDoneTitle: (p, t) => p === t ? '완벽한 진단 ✔' : `${t}개 중 ${p}개를 한 번에 찾음`,
        pnDoneMsg: (s, m, c) => `점수: ${s}/${m}점, 명령 ${c}개 사용. 순서: 네트워크 카드, IP 주소, 게이트웨이, 인터넷, 마지막으로 DNS.`,
        pnBest: (b) => `최고 점수: ${b}`,
        qzTag: (n, t) => `문제 ${n}/${t} · Active Directory`, qzPts: (s) => `${s}점`, qzGood: '✓ 정답입니다.', qzBad: '✗ 조금 다릅니다.', qzRetry: '다른 답을 골라 보세요.',
        qzNext: '다음 문제', qzEnd: '결과 보기', qzDoneTag: '결과', qzDoneTitle: (p, t) => p === t ? '모두 정답 ✔' : `${t}문제 중 ${p}문제를 한 번에 맞힘`,
        qzDoneMsg: (s, m) => `점수: ${s}/${m}점. 2단계 지원에서 매일 쓰는 내용입니다.`,
        tPanne: '‘장애 찾기’를 시작합니다…', tQuiz: 'Active Directory 퀴즈를 시작합니다…'
      },
      help: [['panne', '게임: 네트워크 장애 찾기'], ['quiz', 'Active Directory·그룹 정책 퀴즈']],
      causes: {
        dhcp: 'DHCP 서버가 응답하지 않음', dns: '설정된 DNS 서버가 응답하지 않음', gw: '기본 게이트웨이가 잘못 설정됨',
        cable: '네트워크 케이블이 빠져 있음', dup: '다른 장치와 IP 주소 충돌', isp: '공유기 또는 인터넷 회선 장애'
      },
      scen: {
        dhcp: ['Sophie, 회계팀', '오늘 아침부터 아무것도 안 돼요. 인터넷도, 파일 서버도요.', '169.254.x.x 주소(APIPA)는 Windows가 DHCP 서버로부터 아무 응답도 받지 못했다는 뜻입니다. 케이블과 스위치를 확인한 뒤 DHCP 서비스를 점검합니다.'],
        dns: ['Marc, 영업팀', '어떤 사이트도 열리지 않고 브라우저에 ‘주소를 찾을 수 없음’이라고 나와요.', '8.8.8.8로 ping이 됩니다. 네트워크와 인터넷은 정상입니다. 이름만 변환되지 않는데, DNS 서버 192.168.1.250이 응답하지 않기 때문입니다. DNS 설정(DHCP 또는 네트워크 카드)을 고칩니다.'],
        gw: ['Léa, 안내 데스크', '자리를 옮겼는데 동료가 IP 주소를 직접 설정해 준 뒤로 인터넷이 안 돼요.', '게이트웨이 192.168.2.1은 PC가 속한 192.168.1.0/24 네트워크에 없어서 패킷이 로컬 네트워크 밖으로 나가지 못합니다. 192.168.1.1로 바꾸거나 DHCP로 되돌립니다.'],
        cable: ['Paul, 작업장', '데스크톱에 빨간 X와 함께 ‘네트워크 액세스 없음’이 떠요.', '‘미디어 연결 끊김’: 네트워크 카드가 링크를 감지하지 못합니다. 설정을 건드리기 전에 케이블, 벽면 단자, 스위치 표시등을 확인합니다.'],
        dup: ['Nadia, 인사팀', 'Windows에 ‘IP 주소 충돌’이 뜨더니 네트워크가 끊겼어요.', '고정 주소 192.168.1.20을 다른 장치(주로 프린터)가 이미 쓰고 있습니다. PC를 DHCP로 되돌리거나, 고정 주소를 DHCP 범위 밖에 둡니다.'],
        isp: ['팀 전체', '아무도 인터넷이 안 되는데 프린터와 파일 서버는 돼요.', '게이트웨이(공유기)는 응답하지만 그 너머는 안 됩니다. 8.8.8.8도, 공유기를 거치는 DNS도 응답이 없습니다. 로컬 네트워크는 정상이니 공유기를 재시작하고 표시등을 본 뒤 통신사에 연락합니다.']
      },
      quiz: [
        ['그룹 정책을 수정했습니다. PC에 바로 적용하려면?', ['PC에서 gpupdate /force 실행', '도메인 컨트롤러 재시작', 'OU를 삭제했다가 다시 만들기'], 'gpupdate /force는 모든 정책을 다시 적용합니다. 그렇지 않으면 PC가 약 90분마다 스스로 새로 고칩니다.'],
        ['사용자에게 실제로 적용된 그룹 정책을 보여 주는 명령은?', ['gpresult /r', 'ipconfig /all', 'net use'], 'gpresult /r(또는 gpresult /h report.html)은 적용된 정책과 필터링된 정책을 보여 줍니다. 그룹 정책이 ‘안 될 때’ 가장 먼저 실행합니다.'],
        ['그룹 정책은 어떤 순서로 적용되나요?', ['로컬, 사이트, 도메인, OU', 'OU, 도메인, 사이트, 로컬', '도메인, 사이트, OU, 로컬'], '‘LSDOU’로 기억합니다. 충돌하면 마지막에 적용된 것이 이깁니다. 가장 가까운 OU의 정책이 우선이며, 다른 정책이 ‘강제(Enforced)’로 설정된 경우는 예외입니다.'],
        ['사용자가 비밀번호를 잊었고 계정이 잠겼습니다. 어떻게 하나요?', ['계정 잠금을 풀고 비밀번호를 재설정한 뒤 ‘다음 로그온 시 변경’을 선택', '계정을 삭제하고 새로 만들기', '동료의 비밀번호를 알려 주기'], '그룹과 권한이 계정에 묶여 있으므로 계정은 유지하고, 새 비밀번호는 사용자가 직접 정하게 합니다. 먼저 본인 확인을 합니다.'],
        ['PC가 도메인에 가입하지 못하고 ‘도메인을 찾을 수 없음’이 뜹니다. 가장 가능성 높은 원인은?', ['DNS가 도메인 컨트롤러를 가리키지 않음', 'Windows 방화벽이 켜져 있음', 'Office 라이선스가 만료됨'], 'PC는 DNS로 도메인 컨트롤러를 찾습니다. 공유기 DNS나 8.8.8.8을 쓰면 찾을 수 없습니다.'],
        ['클라이언트가 도메인 컨트롤러를 찾게 해 주는 DNS 레코드는?', ['SRV (예: _ldap._tcp)', 'MX', 'CNAME'], 'SRV 레코드는 서비스(LDAP, Kerberos)와 이를 제공하는 서버를 알립니다. 그래서 DNS는 Active Directory에 꼭 필요합니다.'],
        ['팀에 공유 폴더 접근 권한을 주는 좋은 방법은?', ['사용자를 전역 그룹에 넣고, 그 그룹을 권한을 받는 도메인 로컬 그룹에 넣기', '사용자를 한 명씩 폴더에 직접 추가', '팀을 ‘Domain Admins’에 넣기'], 'AGDLP 방식입니다. 이후 입사·퇴사는 그룹 구성원만 바꾸면 되고 폴더 권한은 건드리지 않습니다.'],
        ['OU에서 그룹 정책 링크를 삭제했습니다. 그 그룹 정책은?', ['그대로 남아 있어 다른 곳에 연결할 수 있음', '영구 삭제됨', '도메인 전체에 적용됨'], '링크를 삭제해도 그룹 정책은 삭제되지 않고 ‘그룹 정책 개체’에 남습니다. 정책을 잃지 않고 빠르게 해제할 때 유용합니다.'],
        ['사용자 설정이 담긴 그룹 정책을 컴퓨터만 있는 OU에 연결하면?', ['루프백 처리를 켜지 않는 한 적용되지 않음', '도메인의 모든 사용자에게 적용됨', '도메인 컨트롤러에 적용됨'], '사용자 설정은 사용자가 속한 OU를 따릅니다. 루프백 처리는 공용 키오스크 PC처럼 컴퓨터에 따라 사용자 설정을 적용하기 위한 기능입니다.'],
        ['암호화하지 않은 LDAP가 쓰는 포트는?', ['389', '53', '3389'], 'LDAP는 389, LDAPS(암호화)는 636입니다. 53은 DNS, 3389는 원격 데스크톱입니다.'],
        ['PC 시계가 10분 늦습니다. 어떤 문제가 생기나요?', ['Kerberos 인증 실패', '아무 문제 없음: 시간은 중요하지 않음', '그룹 정책이 두 번 적용됨'], 'Kerberos는 기본적으로 5분이 넘는 시간 차이를 거부합니다. PC는 도메인 컨트롤러와 시간을 맞춥니다(w32time 서비스).'],
        ['도메인 컨트롤러에서 그룹 정책 파일은 어디에 저장되나요?', ['SYSVOL 공유', 'C:\\Windows\\Temp', '각 PC의 레지스트리에만'], 'SYSVOL은 도메인 컨트롤러 사이에 복제되며, 모든 PC가 여기서 정책 파일(템플릿, 스크립트)을 읽습니다.']
      ]
    }
  };

  for (const k in D) {
    if (!L[k]) continue;
    const d = D[k];
    Object.assign(L[k], d.ui, { pnCauses: d.causes, pnScen: d.scen, quizAD: d.quiz, pnOut: k === 'fr' ? OUT_FR : OUT_EN });
    const H = L[k].tHelp;
    if (H && !H.some(h => h[0] === 'panne')) { const at = H.findIndex(x => x[0] === 'clear'); H.splice(at < 0 ? H.length : at, 0, ...d.help); }
  }
})(window.JG_I18N || {});
