/* jeremy-grosjean.fr — textes en 6 langues */
window.JG_I18N = {
  fr: {
    htmlLang: 'fr', locale: 'fr-FR', city: 'Paris', sep: ', ', langLabel: 'Langue',
    title: 'Site en construction · jeremy-grosjean.fr', status: 'Site en construction', note: 'Le réseau se met en place. Revenez bientôt.',
    play: 'Jouer : protéger le serveur', keysHint: 'Terminal :',
    level: 'Niveau', score: 'Score', breaches: 'Intrusions', time: 'Temps', quit: 'Quitter',
    introTitle: 'Protégez le serveur',
    introMouse: "Trois vagues d’attaques arrivent vers le serveur. Cliquez sur les menaces pour les bloquer avant qu’elles l’atteignent, et laissez passer le trafic légitime.",
    introTouch: "Trois vagues d’attaques arrivent vers le serveur. Touchez les menaces pour les bloquer avant qu’elles l’atteignent, et laissez passer le trafic légitime.",
    rules: '3 niveaux : logiciel malveillant, DDoS, hameçonnage. 3 intrusions et le serveur tombe.',
    start: 'Commencer', cancel: 'Retour', go: "C’est parti", again: 'Rejouer', back: 'Retour au site', close: 'Fermer',
    hintMouse: 'Bougez la souris, cliquez pour envoyer une onde', hintTouch: 'Glissez le doigt, touchez pour envoyer une onde',
    soundOff: 'Activer le son', soundOn: 'Son activé', secBtn: 'Sécurité', termBtn: 'Terminal',
    themeLabel: 'Thème', themeAuto: 'automatique', themeLight: 'clair', themeDark: 'sombre',
    levelOf: (a, b) => `Niveau ${a}/${b}`, defense: 'Défense :',
    down: 'Le serveur est tombé', timeUp: 'Partie terminée', win: 'Les 3 vagues sont arrêtées : serveur protégé',
    newRecord: 'points : nouveau record', record: b => `points (record : ${b})`,
    wrong: 'Paquet légitime bloqué : −5', breach: 'Intrusion détectée', overload: 'Serveur surchargé',
    lgBad: 'Malveillant : bloquer', lgGood: 'Légitime : laisser passer', lgDdos: 'DDoS : filtrer la zone', lgPhish: 'Faux légitime : bloquer',
    levels: [
      { name: 'Logiciel malveillant', what: "Des paquets infectés tentent d’installer un virus ou un rançongiciel sur le serveur. Bloquez-les un par un.", how: 'antivirus ou EDR à jour, mises à jour régulières et filtrage du trafic par le pare-feu.' },
      { name: 'Attaque DDoS', what: "Des milliers de requêtes arrivent en même temps pour saturer le serveur. Chaque blocage filtre toute une zone : visez les essaims et épargnez le trafic légitime.", how: "limitation de débit, filtrage en amont et protection anti-DDoS de l’hébergeur." },
      { name: 'Hameçonnage', what: "Certains paquets imitent le trafic légitime pour tromper le serveur. Repérez le contour en pointillés rouges et bloquez-les.", how: "vérifier l’expéditeur et les liens, activer la double authentification, publier SPF, DKIM et DMARC." }
    ],
    secTitle: 'Ce site est sécurisé', secIntro: 'Les protections réellement en place sur jeremy-grosjean.fr :',
    sec: [
      ['HTTPS', "Connexion chiffrée par TLS, certificat Let’s Encrypt."],
      ['HSTS', 'Le navigateur refuse toute connexion non chiffrée pendant deux ans.'],
      ['CSP', "Seuls les fichiers de ce site peuvent s’exécuter : aucun script externe."],
      ['Anti-clickjacking', 'Le site ne peut pas être intégré dans une autre page.'],
      ['DNSSEC', 'Les réponses DNS du domaine sont signées et vérifiables.'],
      ['SPF', "Seuls les serveurs d’OVHcloud peuvent envoyer des e-mails au nom du domaine."],
      ['DKIM', 'Chaque e-mail envoyé est signé numériquement.'],
      ['DMARC', 'Les e-mails qui usurpent le domaine sont mis en quarantaine.'],
      ['Aucun traceur', "Ni cookie, ni publicité, ni outil de mesure d’audience."]
    ],
    tWelcome: 'Bienvenue sur jeremy-grosjean.fr. Tapez help pour voir les commandes.',
    tHelp: [
      ['help', 'afficher cette aide'], ['whoami', 'qui êtes-vous ?'], ['about', 'à propos de ce site'], ['security', 'protections du site'],
      ['ping <hôte>', 'tester une connexion (essayez : ping recruteur)'], ['date', 'date et heure à Paris'],
      ['lang <code>', 'changer de langue : fr, en, zh-Hans, zh-Hant, yue, ko'], ['theme <mode>', 'thème : auto, light ou dark'],
      ['play', 'lancer le jeu'], ['konami', "déclencher l’effet secret"], ['contact', 'adresse e-mail'], ['clear', "effacer l’écran"], ['exit', 'fermer le terminal']
    ],
    tWhoami: 'visiteur : accès invité, lecture seule.', tAbout: 'jeremy-grosjean.fr, site personnel de Jérémy Grosjean. En construction.',
    tSoon: 'Bientôt disponible.', tSudo: "Permission refusée : cet incident sera signalé à l’administrateur. 😉",
    tUnknown: c => `commande introuvable : ${c}. Tapez help.`, tLangSet: l => `Langue : ${l}`, tThemeSet: m => `Thème : ${m}`,
    tUsageLang: 'Usage : lang fr | en | zh-Hans | zh-Hant | yue | ko', tUsageTheme: 'Usage : theme auto | light | dark',
    tPingReply: 'Réponse reçue : disponible pour échanger. Tapez contact.', tContact: 'E-mail :', tSecHead: 'Protections actives :',
    tKonami: 'Code Konami : mode administrateur activé.', tGame: 'Lancement du jeu…'
  },

  en: {
    htmlLang: 'en', locale: 'en-GB', city: 'Paris', sep: ', ', langLabel: 'Language',
    title: 'Under construction · jeremy-grosjean.fr', status: 'Under construction', note: 'The network is coming online. Check back soon.',
    play: 'Play: protect the server', keysHint: 'Terminal:',
    level: 'Level', score: 'Score', breaches: 'Breaches', time: 'Time', quit: 'Quit',
    introTitle: 'Protect the server',
    introMouse: 'Three waves of attacks are heading for the server. Click the threats to block them before they get through, and let legitimate traffic pass.',
    introTouch: 'Three waves of attacks are heading for the server. Tap the threats to block them before they get through, and let legitimate traffic pass.',
    rules: '3 levels: malware, DDoS, phishing. 3 breaches and the server goes down.',
    start: 'Start', cancel: 'Back', go: "Let’s go", again: 'Play again', back: 'Back to site', close: 'Close',
    hintMouse: 'Move your mouse, click to send a wave', hintTouch: 'Slide your finger, tap to send a wave',
    soundOff: 'Turn sound on', soundOn: 'Sound on', secBtn: 'Security', termBtn: 'Terminal',
    themeLabel: 'Theme', themeAuto: 'automatic', themeLight: 'light', themeDark: 'dark',
    levelOf: (a, b) => `Level ${a}/${b}`, defense: 'Defence:',
    down: 'The server went down', timeUp: 'Game over', win: 'All 3 waves stopped: server protected',
    newRecord: 'points: new best', record: b => `points (best: ${b})`,
    wrong: 'Legitimate packet blocked: −5', breach: 'Breach detected', overload: 'Server overloaded',
    lgBad: 'Malicious: block', lgGood: 'Legitimate: let through', lgDdos: 'DDoS: filter the area', lgPhish: 'Fake legitimate: block',
    levels: [
      { name: 'Malware', what: 'Infected packets are trying to install a virus or ransomware on the server. Block them one by one.', how: 'up-to-date antivirus or EDR, regular updates and firewall traffic filtering.' },
      { name: 'DDoS attack', what: 'Thousands of requests arrive at once to overwhelm the server. Each block filters a whole area: aim for the swarms and spare legitimate traffic.', how: "rate limiting, upstream filtering and the host’s DDoS protection." },
      { name: 'Phishing', what: 'Some packets imitate legitimate traffic to fool the server. Spot the red dashed outline and block them.', how: 'check the sender and links, turn on two-factor authentication, publish SPF, DKIM and DMARC.' }
    ],
    secTitle: 'This site is secure', secIntro: 'The protections actually in place on jeremy-grosjean.fr:',
    sec: [
      ['HTTPS', "TLS-encrypted connection with a Let’s Encrypt certificate."],
      ['HSTS', 'Browsers refuse any unencrypted connection for two years.'],
      ['CSP', 'Only files from this site can run: no third-party scripts.'],
      ['Anti-clickjacking', 'The site cannot be embedded in another page.'],
      ['DNSSEC', "The domain’s DNS answers are signed and verifiable."],
      ['SPF', "Only OVHcloud’s servers may send email for the domain."],
      ['DKIM', 'Every outgoing email is digitally signed.'],
      ['DMARC', 'Emails spoofing the domain are quarantined.'],
      ['No trackers', 'No cookies, no ads, no analytics.']
    ],
    tWelcome: 'Welcome to jeremy-grosjean.fr. Type help to see the commands.',
    tHelp: [
      ['help', 'show this help'], ['whoami', 'who are you?'], ['about', 'about this site'], ['security', "the site’s protections"],
      ['ping <host>', 'test a connection (try: ping recruiter)'], ['date', 'date and time in Paris'],
      ['lang <code>', 'change language: fr, en, zh-Hans, zh-Hant, yue, ko'], ['theme <mode>', 'theme: auto, light or dark'],
      ['play', 'start the game'], ['konami', 'trigger the secret effect'], ['contact', 'email address'], ['clear', 'clear the screen'], ['exit', 'close the terminal']
    ],
    tWhoami: 'visitor: guest access, read-only.', tAbout: "jeremy-grosjean.fr, Jérémy Grosjean’s personal site. Under construction.",
    tSoon: 'Coming soon.', tSudo: 'Permission denied: this incident will be reported to the administrator. 😉',
    tUnknown: c => `command not found: ${c}. Type help.`, tLangSet: l => `Language: ${l}`, tThemeSet: m => `Theme: ${m}`,
    tUsageLang: 'Usage: lang fr | en | zh-Hans | zh-Hant | yue | ko', tUsageTheme: 'Usage: theme auto | light | dark',
    tPingReply: 'Reply received: available for a chat. Type contact.', tContact: 'Email:', tSecHead: 'Active protections:',
    tKonami: 'Konami code: administrator mode enabled.', tGame: 'Starting the game…'
  },

  'zh-Hans': {
    htmlLang: 'zh-Hans', locale: 'zh-CN', city: '巴黎', sep: '，', langLabel: '语言',
    title: '网站建设中 · jeremy-grosjean.fr', status: '网站建设中', note: '网络正在部署中，敬请期待。',
    play: '开始游戏：保护服务器', keysHint: '终端：',
    level: '关卡', score: '得分', breaches: '入侵', time: '时间', quit: '退出',
    introTitle: '保护服务器',
    introMouse: '三波攻击正涌向服务器。点击威胁，在它们到达之前将其拦截，并放行合法流量。',
    introTouch: '三波攻击正涌向服务器。点按威胁，在它们到达之前将其拦截，并放行合法流量。',
    rules: '共 3 关：恶意软件、DDoS、网络钓鱼。被入侵 3 次，服务器就会宕机。',
    start: '开始', cancel: '返回', go: '出发', again: '再玩一次', back: '返回网站', close: '关闭',
    hintMouse: '移动鼠标，点击发送波纹', hintTouch: '滑动手指，点按发送波纹',
    soundOff: '开启声音', soundOn: '声音已开启', secBtn: '安全', termBtn: '终端',
    themeLabel: '主题', themeAuto: '自动', themeLight: '浅色', themeDark: '深色',
    levelOf: (a, b) => `第 ${a}/${b} 关`, defense: '防御：',
    down: '服务器已宕机', timeUp: '游戏结束', win: '3 波攻击全部挡下：服务器安全',
    newRecord: '分：新纪录', record: b => `分（最高纪录：${b}）`,
    wrong: '拦截了合法数据包：−5', breach: '检测到入侵', overload: '服务器过载',
    lgBad: '恶意：拦截', lgGood: '合法：放行', lgDdos: 'DDoS：过滤区域', lgPhish: '伪装合法：拦截',
    levels: [
      { name: '恶意软件', what: '受感染的数据包试图在服务器上安装病毒或勒索软件。逐个拦截它们。', how: '保持杀毒软件或 EDR 更新、定期打补丁，并用防火墙过滤流量。' },
      { name: 'DDoS 攻击', what: '成千上万的请求同时涌来，企图压垮服务器。每次拦截都会过滤一整片区域：瞄准数据包群，避开合法流量。', how: '限速、上游过滤，以及托管商的 DDoS 防护。' },
      { name: '网络钓鱼', what: '部分数据包伪装成合法流量来欺骗服务器。留意红色虚线轮廓，并拦截它们。', how: '核实发件人和链接，启用双重验证，发布 SPF、DKIM 和 DMARC。' }
    ],
    secTitle: '本网站安全可靠', secIntro: 'jeremy-grosjean.fr 实际启用的防护措施：',
    sec: [
      ['HTTPS', '采用 TLS 加密连接，证书由 Let’s Encrypt 签发。'],
      ['HSTS', '两年内浏览器会拒绝任何未加密的连接。'],
      ['CSP', '只有本站的文件可以执行：没有任何外部脚本。'],
      ['防点击劫持', '本站无法被嵌入其他网页。'],
      ['DNSSEC', '域名的 DNS 应答经过签名，可以验证。'],
      ['SPF', '只有 OVHcloud 的服务器可以代表本域名发送邮件。'],
      ['DKIM', '每封发出的邮件都带有数字签名。'],
      ['DMARC', '冒用本域名的邮件会被隔离。'],
      ['无跟踪', '没有 Cookie、没有广告、没有流量统计。']
    ],
    tWelcome: '欢迎来到 jeremy-grosjean.fr。输入 help 查看命令。',
    tHelp: [
      ['help', '显示此帮助'], ['whoami', '你是谁？'], ['about', '关于本站'], ['security', '本站的防护措施'],
      ['ping <主机>', '测试连接（试试：ping recruiter）'], ['date', '巴黎的日期和时间'],
      ['lang <代码>', '切换语言：fr、en、zh-Hans、zh-Hant、yue、ko'], ['theme <模式>', '主题：auto、light 或 dark'],
      ['play', '开始游戏'], ['konami', '触发隐藏效果'], ['contact', '电子邮箱'], ['clear', '清屏'], ['exit', '关闭终端']
    ],
    tWhoami: '访客：来宾权限，只读。', tAbout: 'jeremy-grosjean.fr，Jérémy Grosjean 的个人网站，正在建设中。',
    tSoon: '即将推出。', tSudo: '权限被拒绝：此事件将报告给管理员。😉',
    tUnknown: c => `找不到命令：${c}。请输入 help。`, tLangSet: l => `语言：${l}`, tThemeSet: m => `主题：${m}`,
    tUsageLang: '用法：lang fr | en | zh-Hans | zh-Hant | yue | ko', tUsageTheme: '用法：theme auto | light | dark',
    tPingReply: '收到回复：欢迎交流。输入 contact。', tContact: '邮箱：', tSecHead: '已启用的防护：',
    tKonami: 'Konami 秘籍：管理员模式已启用。', tGame: '正在启动游戏…'
  },

  'zh-Hant': {
    htmlLang: 'zh-Hant', locale: 'zh-TW', city: '巴黎', sep: '，', langLabel: '語言',
    title: '網站建置中 · jeremy-grosjean.fr', status: '網站建置中', note: '網路正在部署中，敬請期待。',
    play: '開始遊戲：保護伺服器', keysHint: '終端機：',
    level: '關卡', score: '分數', breaches: '入侵', time: '時間', quit: '離開',
    introTitle: '保護伺服器',
    introMouse: '三波攻擊正湧向伺服器。點擊威脅，在它們抵達之前加以攔截，並讓合法流量通過。',
    introTouch: '三波攻擊正湧向伺服器。輕觸威脅，在它們抵達之前加以攔截，並讓合法流量通過。',
    rules: '共 3 關：惡意軟體、DDoS、網路釣魚。遭入侵 3 次，伺服器就會當機。',
    start: '開始', cancel: '返回', go: '出發', again: '再玩一次', back: '返回網站', close: '關閉',
    hintMouse: '移動滑鼠，點擊發送波紋', hintTouch: '滑動手指，輕觸發送波紋',
    soundOff: '開啟聲音', soundOn: '聲音已開啟', secBtn: '安全性', termBtn: '終端機',
    themeLabel: '主題', themeAuto: '自動', themeLight: '淺色', themeDark: '深色',
    levelOf: (a, b) => `第 ${a}/${b} 關`, defense: '防禦：',
    down: '伺服器已當機', timeUp: '遊戲結束', win: '3 波攻擊全數擋下：伺服器安全',
    newRecord: '分：新紀錄', record: b => `分（最高紀錄：${b}）`,
    wrong: '攔截了合法封包：−5', breach: '偵測到入侵', overload: '伺服器超載',
    lgBad: '惡意：攔截', lgGood: '合法：放行', lgDdos: 'DDoS：過濾區域', lgPhish: '偽裝合法：攔截',
    levels: [
      { name: '惡意軟體', what: '受感染的封包試圖在伺服器上安裝病毒或勒索軟體。逐一攔截它們。', how: '保持防毒軟體或 EDR 為最新、定期更新，並以防火牆過濾流量。' },
      { name: 'DDoS 攻擊', what: '成千上萬的請求同時湧入，企圖癱瘓伺服器。每次攔截都會過濾一整片區域：瞄準封包群，避開合法流量。', how: '流量限制、上游過濾，以及主機商的 DDoS 防護。' },
      { name: '網路釣魚', what: '部分封包偽裝成合法流量來欺騙伺服器。留意紅色虛線外框，並攔截它們。', how: '確認寄件者與連結、啟用雙重驗證，並設定 SPF、DKIM 與 DMARC。' }
    ],
    secTitle: '本網站安全可靠', secIntro: 'jeremy-grosjean.fr 實際啟用的防護措施：',
    sec: [
      ['HTTPS', '採用 TLS 加密連線，憑證由 Let’s Encrypt 簽發。'],
      ['HSTS', '兩年內瀏覽器會拒絕任何未加密的連線。'],
      ['CSP', '只有本站的檔案可以執行：沒有任何外部指令碼。'],
      ['防點擊劫持', '本站無法被嵌入其他網頁。'],
      ['DNSSEC', '網域的 DNS 回應經過簽章，可以驗證。'],
      ['SPF', '只有 OVHcloud 的伺服器可以代表本網域寄送郵件。'],
      ['DKIM', '每封寄出的郵件都附有數位簽章。'],
      ['DMARC', '冒用本網域的郵件會被隔離。'],
      ['無追蹤', '沒有 Cookie、沒有廣告、沒有流量分析。']
    ],
    tWelcome: '歡迎來到 jeremy-grosjean.fr。輸入 help 查看指令。',
    tHelp: [
      ['help', '顯示此說明'], ['whoami', '你是誰？'], ['about', '關於本站'], ['security', '本站的防護措施'],
      ['ping <主機>', '測試連線（試試：ping recruiter）'], ['date', '巴黎的日期與時間'],
      ['lang <代碼>', '切換語言：fr、en、zh-Hans、zh-Hant、yue、ko'], ['theme <模式>', '主題：auto、light 或 dark'],
      ['play', '開始遊戲'], ['konami', '觸發隱藏效果'], ['contact', '電子郵件'], ['clear', '清除畫面'], ['exit', '關閉終端機']
    ],
    tWhoami: '訪客：來賓權限，唯讀。', tAbout: 'jeremy-grosjean.fr，Jérémy Grosjean 的個人網站，建置中。',
    tSoon: '即將推出。', tSudo: '權限遭拒：此事件將回報給管理員。😉',
    tUnknown: c => `找不到指令：${c}。請輸入 help。`, tLangSet: l => `語言：${l}`, tThemeSet: m => `主題：${m}`,
    tUsageLang: '用法：lang fr | en | zh-Hans | zh-Hant | yue | ko', tUsageTheme: '用法：theme auto | light | dark',
    tPingReply: '收到回應：歡迎交流。輸入 contact。', tContact: '電子郵件：', tSecHead: '已啟用的防護：',
    tKonami: 'Konami 祕技：管理員模式已啟用。', tGame: '正在啟動遊戲…'
  },

  yue: {
    htmlLang: 'yue-Hant-HK', locale: 'zh-HK', city: '巴黎', sep: '，', langLabel: '語言',
    title: '網站建設緊 · jeremy-grosjean.fr', status: '網站建設緊', note: '網絡準備緊，遲啲再嚟睇吓啦。',
    play: '玩遊戲：保護伺服器', keysHint: '終端機：',
    level: '關卡', score: '分數', breaches: '入侵', time: '時間', quit: '離開',
    introTitle: '保護伺服器',
    introMouse: '三輪攻擊湧緊去伺服器。撳啲威脅，喺佢哋到之前攔截佢哋，合法流量就俾佢過。',
    introTouch: '三輪攻擊湧緊去伺服器。㩒啲威脅，喺佢哋到之前攔截佢哋，合法流量就俾佢過。',
    rules: '一共 3 關：惡意軟件、DDoS、釣魚。俾人入侵 3 次，伺服器就會死機。',
    start: '開始', cancel: '返回', go: '開波', again: '再玩過', back: '返回網站', close: '關閉',
    hintMouse: '郁吓滑鼠，撳一下發出波紋', hintTouch: '掃吓手指，㩒一下發出波紋',
    soundOff: '開聲', soundOn: '已經開咗聲', secBtn: '安全', termBtn: '終端機',
    themeLabel: '主題', themeAuto: '自動', themeLight: '淺色', themeDark: '深色',
    levelOf: (a, b) => `第 ${a}/${b} 關`, defense: '防禦：',
    down: '伺服器死機咗', timeUp: '遊戲完咗', win: '3 輪攻擊全部擋晒：伺服器安全',
    newRecord: '分：新紀錄', record: b => `分（最高紀錄：${b}）`,
    wrong: '攔截咗合法數據包：−5', breach: '偵測到入侵', overload: '伺服器頂唔順',
    lgBad: '惡意：攔截', lgGood: '合法：放行', lgDdos: 'DDoS：過濾成個範圍', lgPhish: '扮合法：攔截',
    levels: [
      { name: '惡意軟件', what: '中咗毒嘅數據包想喺伺服器度裝病毒或者勒索軟件。逐個攔截佢哋。', how: '防毒軟件或者 EDR 要保持最新、定期更新，再用防火牆過濾流量。' },
      { name: 'DDoS 攻擊', what: '成千上萬個請求同一時間湧埋嚟，想搞冧個伺服器。每次攔截都會過濾成個範圍：瞄準啲數據包群，唔好掂到合法流量。', how: '限流、上游過濾，同埋主機商嘅 DDoS 防護。' },
      { name: '釣魚', what: '有啲數據包扮成合法流量嚟呃伺服器。留意紅色虛線外框，攔截佢哋。', how: '睇清楚寄件人同連結、開雙重認證，再設定 SPF、DKIM 同 DMARC。' }
    ],
    secTitle: '呢個網站好安全', secIntro: 'jeremy-grosjean.fr 真正用緊嘅防護：',
    sec: [
      ['HTTPS', '用 TLS 加密連線，證書由 Let’s Encrypt 簽發。'],
      ['HSTS', '兩年之內瀏覽器會拒絕任何冇加密嘅連線。'],
      ['CSP', '淨係本站嘅檔案先可以執行：冇任何外部程式碼。'],
      ['防點擊劫持', '本站唔可以俾人嵌入其他網頁。'],
      ['DNSSEC', '網域嘅 DNS 回應有簽署，可以核實。'],
      ['SPF', '淨係 OVHcloud 嘅伺服器先可以用呢個網域寄電郵。'],
      ['DKIM', '每封寄出嘅電郵都有數碼簽署。'],
      ['DMARC', '冒認呢個網域嘅電郵會俾隔離。'],
      ['冇追蹤', '冇 Cookie、冇廣告、冇流量分析。']
    ],
    tWelcome: '歡迎嚟到 jeremy-grosjean.fr。打 help 睇指令。',
    tHelp: [
      ['help', '顯示呢個說明'], ['whoami', '你係邊個？'], ['about', '關於本站'], ['security', '本站嘅防護'],
      ['ping <主機>', '測試連線（試吓：ping recruiter）'], ['date', '巴黎嘅日期同時間'],
      ['lang <代碼>', '轉語言：fr、en、zh-Hans、zh-Hant、yue、ko'], ['theme <模式>', '主題：auto、light 或者 dark'],
      ['play', '開始遊戲'], ['konami', '觸發隱藏效果'], ['contact', '電郵地址'], ['clear', '清除畫面'], ['exit', '關閉終端機']
    ],
    tWhoami: '訪客：來賓權限，淨係睇得。', tAbout: 'jeremy-grosjean.fr，Jérémy Grosjean 嘅個人網站，建設緊。',
    tSoon: '就嚟推出。', tSudo: '權限被拒：呢件事會報告俾管理員。😉',
    tUnknown: c => `搵唔到指令：${c}。打 help 啦。`, tLangSet: l => `語言：${l}`, tThemeSet: m => `主題：${m}`,
    tUsageLang: '用法：lang fr | en | zh-Hans | zh-Hant | yue | ko', tUsageTheme: '用法：theme auto | light | dark',
    tPingReply: '收到回應：歡迎傾吓。打 contact。', tContact: '電郵：', tSecHead: '用緊嘅防護：',
    tKonami: 'Konami 秘技：管理員模式已經開咗。', tGame: '開緊遊戲…'
  },

  ko: {
    htmlLang: 'ko', locale: 'ko-KR', city: '파리', sep: ', ', langLabel: '언어',
    title: '사이트 준비 중 · jeremy-grosjean.fr', status: '사이트 준비 중', note: '네트워크를 구축하고 있습니다. 곧 다시 방문해 주세요.',
    play: '게임하기: 서버 지키기', keysHint: '터미널:',
    level: '단계', score: '점수', breaches: '침입', time: '시간', quit: '나가기',
    introTitle: '서버를 지키세요',
    introMouse: '세 차례의 공격이 서버로 몰려옵니다. 위협을 클릭해 서버에 닿기 전에 차단하고, 정상 트래픽은 통과시키세요.',
    introTouch: '세 차례의 공격이 서버로 몰려옵니다. 위협을 탭해 서버에 닿기 전에 차단하고, 정상 트래픽은 통과시키세요.',
    rules: '총 3단계: 악성코드, DDoS, 피싱. 3번 침입당하면 서버가 다운됩니다.',
    start: '시작', cancel: '뒤로', go: '시작하기', again: '다시 하기', back: '사이트로 돌아가기', close: '닫기',
    hintMouse: '마우스를 움직이고 클릭해 파동을 보내 보세요', hintTouch: '손가락으로 밀고 탭해 파동을 보내 보세요',
    soundOff: '소리 켜기', soundOn: '소리 켜짐', secBtn: '보안', termBtn: '터미널',
    themeLabel: '테마', themeAuto: '자동', themeLight: '라이트', themeDark: '다크',
    levelOf: (a, b) => `${a}/${b}단계`, defense: '방어:',
    down: '서버가 다운되었습니다', timeUp: '게임 종료', win: '3차례 공격을 모두 막았습니다: 서버 안전',
    newRecord: '점: 신기록', record: b => `점 (최고 기록: ${b})`,
    wrong: '정상 패킷 차단: −5', breach: '침입 감지', overload: '서버 과부하',
    lgBad: '악성: 차단', lgGood: '정상: 통과', lgDdos: 'DDoS: 영역 필터링', lgPhish: '정상 위장: 차단',
    levels: [
      { name: '악성코드', what: '감염된 패킷이 서버에 바이러스나 랜섬웨어를 설치하려 합니다. 하나씩 차단하세요.', how: '백신이나 EDR을 최신으로 유지하고, 정기적으로 업데이트하며, 방화벽으로 트래픽을 필터링합니다.' },
      { name: 'DDoS 공격', what: '수많은 요청이 한꺼번에 몰려와 서버를 마비시키려 합니다. 한 번 차단할 때마다 주변 영역 전체가 필터링됩니다: 패킷 무리를 노리고 정상 트래픽은 피하세요.', how: '속도 제한, 상위 단계 필터링, 호스팅 업체의 DDoS 방어.' },
      { name: '피싱', what: '일부 패킷이 정상 트래픽으로 위장해 서버를 속입니다. 빨간 점선 테두리를 찾아 차단하세요.', how: '보낸 사람과 링크를 확인하고, 2단계 인증을 켜고, SPF·DKIM·DMARC를 설정합니다.' }
    ],
    secTitle: '이 사이트는 안전합니다', secIntro: 'jeremy-grosjean.fr에 실제로 적용된 보호 조치:',
    sec: [
      ['HTTPS', 'TLS로 암호화된 연결, Let’s Encrypt 인증서.'],
      ['HSTS', '2년 동안 브라우저가 암호화되지 않은 연결을 모두 거부합니다.'],
      ['CSP', '이 사이트의 파일만 실행됩니다: 외부 스크립트 없음.'],
      ['클릭재킹 방지', '이 사이트는 다른 페이지에 삽입될 수 없습니다.'],
      ['DNSSEC', '도메인의 DNS 응답은 서명되어 검증할 수 있습니다.'],
      ['SPF', 'OVHcloud 서버만 이 도메인으로 메일을 보낼 수 있습니다.'],
      ['DKIM', '발송되는 모든 메일에 전자 서명이 붙습니다.'],
      ['DMARC', '도메인을 사칭하는 메일은 격리됩니다.'],
      ['추적 없음', '쿠키도, 광고도, 방문자 분석도 없습니다.']
    ],
    tWelcome: 'jeremy-grosjean.fr에 오신 것을 환영합니다. help를 입력하면 명령어를 볼 수 있습니다.',
    tHelp: [
      ['help', '이 도움말 보기'], ['whoami', '당신은 누구인가요?'], ['about', '이 사이트 소개'], ['security', '사이트 보호 조치'],
      ['ping <호스트>', '연결 테스트 (예: ping recruiter)'], ['date', '파리의 날짜와 시간'],
      ['lang <코드>', '언어 변경: fr, en, zh-Hans, zh-Hant, yue, ko'], ['theme <모드>', '테마: auto, light, dark'],
      ['play', '게임 시작'], ['konami', '숨겨진 효과 실행'], ['contact', '이메일 주소'], ['clear', '화면 지우기'], ['exit', '터미널 닫기']
    ],
    tWhoami: '방문자: 게스트 권한, 읽기 전용.', tAbout: 'jeremy-grosjean.fr, Jérémy Grosjean의 개인 사이트입니다. 준비 중입니다.',
    tSoon: '곧 공개됩니다.', tSudo: '권한이 거부되었습니다: 이 사건은 관리자에게 보고됩니다. 😉',
    tUnknown: c => `명령어를 찾을 수 없습니다: ${c}. help를 입력하세요.`, tLangSet: l => `언어: ${l}`, tThemeSet: m => `테마: ${m}`,
    tUsageLang: '사용법: lang fr | en | zh-Hans | zh-Hant | yue | ko', tUsageTheme: '사용법: theme auto | light | dark',
    tPingReply: '응답 수신: 언제든 연락 주세요. contact를 입력하세요.', tContact: '이메일:', tSecHead: '적용 중인 보호 조치:',
    tKonami: '코나미 커맨드: 관리자 모드가 켜졌습니다.', tGame: '게임을 시작합니다…'
  }
};

/* Accueil : nom, domaines qui défilent, journal de démarrage */
(function (L) {
  const add = (k, o) => { if (L[k]) Object.assign(L[k], o); };
  add('fr', {
    availLine: 'Disponible immédiatement pour une alternance',
    privacyLine: '0 cookie · 0 traceur', secPrivacy: ['Vie privée (RGPD)', 'Aucun cookie, aucun traceur, aucun formulaire : le site ne collecte aucune donnée. Vos préférences restent sur votre appareil.'],
    legalLink: 'Mentions légales',
    contactBtn: 'Me contacter', contactTitle: 'Me contacter', contactIntro: 'Pour une alternance, une question ou un échange, écrivez-moi :', copyMail: 'Copier l’adresse', openMail: 'Ouvrir ma messagerie', copied: 'Adresse copiée', copyFail: 'Copie impossible : sélectionnez l’adresse',
    netOn: 'En ligne', netOff: 'Hors ligne', netLost: 'Connexion perdue : le site continue de fonctionner', netBack: 'Connexion rétablie',
    whoRole: 'technicien informatique',
    title: 'Jérémy Grosjean · Technicien informatique', domainsLbl: 'domaines :',
    domains: ['support utilisateurs', 'réseaux LAN et Wi-Fi', 'Active Directory', 'scripts PowerShell', 'parc informatique', 'cybersécurité'],
    boot: [["ok", "Titre professionnel TAI (niveau 4) obtenu"], ["wait", "Recherche un contrat de professionnalisation de 12 mois"], ["info", "4 jours en entreprise, 1 jour de formation"], ["info", "Formation visée : bac+2 (niveau 5), OpenClassrooms"]],
    bootHelp: 'journal de démarrage',
    tWhoami: 'Jérémy Grosjean, technicien informatique. Recherche une alternance. Tapez boot ou contact.',
    tAbout: 'jeremy-grosjean.fr, site personnel de Jérémy Grosjean, technicien informatique. En construction.'
  });
  add('en', {
    availLine: 'Available now for a work-study contract',
    privacyLine: '0 cookies · 0 trackers', secPrivacy: ['Privacy (GDPR)', 'No cookies, no trackers, no forms: the site collects no data. Your preferences stay on your device.'],
    legalLink: 'Legal notice',
    contactBtn: 'Contact me', contactTitle: 'Contact me', contactIntro: 'For a work-study contract, a question or a chat, write to me:', copyMail: 'Copy address', openMail: 'Open my mail app', copied: 'Address copied', copyFail: 'Copy failed: select the address',
    netOn: 'Online', netOff: 'Offline', netLost: 'Connection lost: the site keeps working', netBack: 'Back online',
    whoRole: 'IT technician',
    title: 'Jérémy Grosjean · IT Technician', domainsLbl: 'areas:',
    domains: ['user support', 'LAN & Wi-Fi networks', 'Active Directory', 'PowerShell scripting', 'IT asset management', 'cybersecurity'],
    boot: [["ok", "French professional title TAI, IT support technician (level 4)"], ["wait", "Seeking a 12-month professionalisation contract"], ["info", "4 days at work, 1 day of training"], ["info", "Target: 2-year degree (level 5), OpenClassrooms"]],
    bootHelp: 'boot log',
    tWhoami: 'Jérémy Grosjean, IT technician. Seeking a work-study contract. Type boot or contact.',
    tAbout: "jeremy-grosjean.fr, personal site of Jérémy Grosjean, IT technician. Under construction."
  });
  add('zh-Hans', {
    availLine: '可立即开始工学交替',
    privacyLine: '0 Cookie · 0 追踪器', secPrivacy: ['隐私（GDPR）', '没有 Cookie、没有追踪器、没有表单：网站不收集任何数据。您的偏好只保存在您的设备上。'],
    legalLink: '法律声明',
    contactBtn: '联系我', contactTitle: '联系我', contactIntro: '工学交替岗位、问题或交流，欢迎来信：', copyMail: '复制邮箱', openMail: '打开邮件应用', copied: '邮箱已复制', copyFail: '无法复制：请手动选择邮箱',
    netOn: '在线', netOff: '离线', netLost: '网络已断开：网站仍可继续使用', netBack: '网络已恢复',
    whoRole: 'IT 技术员',
    title: 'Jérémy Grosjean · IT 技术员', domainsLbl: '领域：',
    domains: ['用户支持', '局域网与 Wi-Fi', 'Active Directory', 'PowerShell 脚本', 'IT 资产管理', '网络安全'],
    boot: [["ok", "已获得法国 TAI 职业资格（IT 支持技术员，4 级）"], ["wait", "寻找 12 个月职业化合同（工学交替）"], ["info", "每周 4 天在企业，1 天培训"], ["info", "目标：Bac+2（5 级），OpenClassrooms"]],
    bootHelp: '启动日志',
    tWhoami: 'Jérémy Grosjean，IT 技术员，正在寻找工学交替岗位。输入 boot 或 contact。',
    tAbout: 'jeremy-grosjean.fr，IT 技术员 Jérémy Grosjean 的个人网站，正在建设中。'
  });
  add('zh-Hant', {
    availLine: '可立即開始建教合作',
    privacyLine: '0 Cookie · 0 追蹤器', secPrivacy: ['隱私（GDPR）', '沒有 Cookie、沒有追蹤器、沒有表單：網站不收集任何資料。您的偏好只儲存在您的裝置上。'],
    legalLink: '法律聲明',
    contactBtn: '聯絡我', contactTitle: '聯絡我', contactIntro: '建教合作職位、問題或交流，歡迎來信：', copyMail: '複製信箱', openMail: '開啟郵件程式', copied: '信箱已複製', copyFail: '無法複製：請手動選取信箱',
    netOn: '連線中', netOff: '離線', netLost: '網路已中斷：網站仍可繼續使用', netBack: '網路已恢復',
    whoRole: 'IT 技術員',
    title: 'Jérémy Grosjean · IT 技術員', domainsLbl: '領域：',
    domains: ['使用者支援', '區域網路與 Wi-Fi', 'Active Directory', 'PowerShell 腳本', 'IT 資產管理', '資訊安全'],
    boot: [["ok", "已取得法國 TAI 職業資格（IT 支援技術員，第 4 級）"], ["wait", "尋找 12 個月職業化契約（建教合作）"], ["info", "每週 4 天在企業，1 天上課"], ["info", "目標：Bac+2（第 5 級），OpenClassrooms"]],
    bootHelp: '開機日誌',
    tWhoami: 'Jérémy Grosjean，IT 技術員，正在尋找建教合作職位。輸入 boot 或 contact。',
    tAbout: 'jeremy-grosjean.fr，IT 技術員 Jérémy Grosjean 的個人網站，建置中。'
  });
  add('yue', {
    availLine: '即刻可以開始工讀交替',
    privacyLine: '0 Cookie · 0 追蹤器', secPrivacy: ['私隱（GDPR）', '冇 Cookie、冇追蹤器、冇表格：網站乜嘢資料都唔收集。你嘅設定只會留喺你部機度。'],
    legalLink: '法律聲明',
    contactBtn: '搵我', contactTitle: '搵我', contactIntro: '想傾工讀交替職位、有問題或者想交流，歡迎寫信俾我：', copyMail: '複製電郵', openMail: '打開電郵程式', copied: '電郵已經複製咗', copyFail: '複製唔到：請自己揀選電郵',
    netOn: '在線', netOff: '離線', netLost: '斷咗線：網站照用得', netBack: '重新連上咗',
    whoRole: 'IT 技術員',
    title: 'Jérémy Grosjean · IT 技術員', domainsLbl: '範疇：',
    domains: ['用戶支援', '區域網絡同 Wi-Fi', 'Active Directory', 'PowerShell 腳本', 'IT 資產管理', '網絡安全'],
    boot: [["ok", "已經攞咗法國 TAI 職業資格（IT 支援技術員，第 4 級）"], ["wait", "搵緊 12 個月職業化合約（工讀交替）"], ["info", "每星期 4 日返公司，1 日上堂"], ["info", "目標：Bac+2（第 5 級），OpenClassrooms"]],
    bootHelp: '開機日誌',
    tWhoami: 'Jérémy Grosjean，IT 技術員，搵緊工讀交替職位。打 boot 或者 contact。',
    tAbout: 'jeremy-grosjean.fr，IT 技術員 Jérémy Grosjean 嘅個人網站，建設緊。'
  });
  add('ko', {
    availLine: '일·학습 병행 즉시 가능',
    privacyLine: '쿠키 0개 · 추적기 0개', secPrivacy: ['개인정보 보호 (GDPR)', '쿠키, 추적기, 양식이 없습니다: 사이트는 어떤 데이터도 수집하지 않습니다. 설정은 사용자 기기에만 남습니다.'],
    legalLink: '법적 고지',
    contactBtn: '연락하기', contactTitle: '연락하기', contactIntro: '일·학습 병행, 문의 또는 교류를 원하시면 메일 주세요:', copyMail: '주소 복사', openMail: '메일 앱 열기', copied: '주소가 복사되었습니다', copyFail: '복사할 수 없습니다: 주소를 직접 선택하세요',
    netOn: '온라인', netOff: '오프라인', netLost: '연결이 끊겼습니다: 사이트는 계속 작동합니다', netBack: '다시 연결되었습니다',
    whoRole: 'IT 기술자',
    title: 'Jérémy Grosjean · IT 기술자', domainsLbl: '분야:',
    domains: ['사용자 지원', 'LAN 및 Wi-Fi 네트워크', 'Active Directory', 'PowerShell 스크립트', 'IT 자산 관리', '사이버 보안'],
    boot: [["ok", "프랑스 TAI 직업 자격 취득 (IT 지원 기술자, 4단계)"], ["wait", "12개월 직업화 계약(일·학습 병행) 구직 중"], ["info", "주 4일 근무, 1일 교육"], ["info", "목표: Bac+2(5단계), OpenClassrooms"]],
    bootHelp: '부팅 로그',
    tWhoami: 'Jérémy Grosjean, IT 기술자. 일·학습 병행 과정을 찾고 있습니다. boot 또는 contact를 입력하세요.',
    tAbout: 'jeremy-grosjean.fr, IT 기술자 Jérémy Grosjean의 개인 사이트입니다. 준비 중입니다.'
  });
  for (const k in L) if (L[k].tHelp && L[k].bootHelp && !L[k].tHelp.some(h => h[0] === 'boot')) L[k].tHelp.splice(2, 0, ['boot', L[k].bootHelp]);
  /* « Aucun traceur » devient « Vie privée (RGPD) » dans le panneau Sécurité */
  for (const k in L) if (Array.isArray(L[k].sec) && L[k].secPrivacy) L[k].sec[L[k].sec.length - 1] = L[k].secPrivacy;
  for (const k in L) if (L[k].tHelp && L[k].legalLink && !L[k].tHelp.some(h => h[0] === 'legal')) L[k].tHelp.splice(L[k].tHelp.length - 2, 0, ['legal', L[k].legalLink]);
})(window.JG_I18N || {});

/* Contact (QR, carte), audit, éco-conception, raccourcis, secrets, device, neofetch, hors ligne */
(function (L) {
  const add = (k, o) => { if (L[k]) Object.assign(L[k], o); };
  add('fr', {
    qrCap: 'Scannez pour enregistrer ma fiche dans votre téléphone', saveContact: 'Ajouter à mes contacts',
    secRerun: "Relancer l’audit", secScore: (a, b) => a === b ? `${a}/${b} protections actives · note A+ sur securityheaders.com` : `${a}/${b} protections actives`,
    ecoTitle: 'Léger et accessible', ecoWeight: 'Poids de la page (mesuré)', kb: 'Ko', ecoReq: 'Fichiers chargés', ecoExt: 'Requêtes vers d’autres sites', ecoCookies: 'Cookies',
    ecoFacts: ['Utilisable entièrement au clavier', 'Thème clair ou sombre selon votre appareil', 'Mouvements réduits si votre appareil le demande', 'Disponible en 6 langues', 'Fonctionne sans connexion après une première visite'],
    ecoNote: 'Mesuré à l’instant dans votre navigateur. Pour comparer : une page web moyenne pèse plus de 2 Mo (HTTP Archive).',
    keysTitle: 'Raccourcis clavier', keysHelp: 'raccourcis',
    keysList: [['MOD + K / `', 'ouvrir ou fermer le terminal'], ['Échap', 'fermer'], ['T', 'changer de thème'], ['L', 'choisir la langue'], ['S', 'activer ou couper le son'], ['J', 'jouer'], ['C', 'me contacter'], ['?', 'afficher cette aide']],
    secretFound: (n, tot, name) => `🏆 Secret trouvé ${n}/${tot} : ${name}`,
    secretNames: { term: 'Terminal ouvert', konami: 'Code Konami', win: 'Les 3 vagues arrêtées', sudo: 'Tentative sudo', neofetch: 'neofetch lancé', keys: 'Raccourcis découverts' },
    secretsHead: (n, tot) => `Secrets trouvés : ${n}/${tot}`, secretsHint: 'Indice : un vieux code de jeu vidéo, une commande d’administrateur, un point d’interrogation…',
    devHead: 'Votre appareil, vu par le site :', devNote: 'Calculé sur votre appareil. Rien n’est envoyé ni enregistré.',
    devLabels: { browser: 'Navigateur', os: 'Système', screen: 'Écran', window: 'Fenêtre', lang: 'Langues', tz: 'Fuseau horaire', theme: 'Thème préféré', motion: 'Mouvements réduits', touch: 'Écran tactile', cpu: 'Processeur', cores: 'cœurs', ram: 'Mémoire', net: 'Connexion', https: 'Connexion chiffrée' },
    yes: 'oui', no: 'non', gb: 'Go',
    neo: { os: 'Site', host: 'Hébergeur', shell: 'Shell', job: 'Métier', title: 'Titre', titleV: 'TAI (niveau 4)', goal: 'Objectif', goalV: 'alternance Technicien informatique (Bac+2)', avail: 'Disponibilité', availV: 'immédiate', sec: 'Sécurité', langs: 'Langues' },
    netCached: 'Hors ligne : vous consultez la copie enregistrée du site.',
    helpExtra: [['device', 'votre appareil, vu par le site'], ['neofetch', 'fiche système'], ['secrets', 'secrets trouvés']]
  });
  add('en', {
    qrCap: 'Scan to save my contact card on your phone', saveContact: 'Add to my contacts',
    secRerun: 'Run the audit again', secScore: (a, b) => a === b ? `${a}/${b} protections active · A+ grade on securityheaders.com` : `${a}/${b} protections active`,
    ecoTitle: 'Light and accessible', ecoWeight: 'Page weight (measured)', kb: 'KB', ecoReq: 'Files loaded', ecoExt: 'Requests to other sites', ecoCookies: 'Cookies',
    ecoFacts: ['Fully usable with a keyboard', 'Light or dark theme from your device', 'Reduced motion if your device asks for it', 'Available in 6 languages', 'Works offline after a first visit'],
    ecoNote: 'Measured just now in your browser. For comparison, an average web page weighs over 2 MB (HTTP Archive).',
    keysTitle: 'Keyboard shortcuts', keysHelp: 'shortcuts',
    keysList: [['MOD + K / `', 'open or close the terminal'], ['Esc', 'close'], ['T', 'change theme'], ['L', 'choose language'], ['S', 'turn sound on or off'], ['J', 'play'], ['C', 'contact me'], ['?', 'show this help']],
    secretFound: (n, tot, name) => `🏆 Secret found ${n}/${tot}: ${name}`,
    secretNames: { term: 'Terminal opened', konami: 'Konami code', win: 'All 3 waves stopped', sudo: 'sudo attempt', neofetch: 'neofetch run', keys: 'Shortcuts discovered' },
    secretsHead: (n, tot) => `Secrets found: ${n}/${tot}`, secretsHint: 'Hint: an old video game code, an admin command, a question mark…',
    devHead: 'Your device, as seen by the site:', devNote: 'Computed on your device. Nothing is sent or stored.',
    devLabels: { browser: 'Browser', os: 'System', screen: 'Screen', window: 'Window', lang: 'Languages', tz: 'Time zone', theme: 'Preferred theme', motion: 'Reduced motion', touch: 'Touchscreen', cpu: 'Processor', cores: 'cores', ram: 'Memory', net: 'Connection', https: 'Encrypted connection' },
    yes: 'yes', no: 'no', gb: 'GB',
    neo: { os: 'Site', host: 'Host', shell: 'Shell', job: 'Job', title: 'Title', titleV: 'TAI (level 4)', goal: 'Goal', goalV: 'work-study, IT Technician (2-year degree)', avail: 'Availability', availV: 'immediate', sec: 'Security', langs: 'Languages' },
    netCached: 'Offline: you are viewing the saved copy of the site.',
    helpExtra: [['device', 'your device, as seen by the site'], ['neofetch', 'system info'], ['secrets', 'secrets found']]
  });
  add('zh-Hans', {
    qrCap: '扫码把我的名片存到手机里', saveContact: '添加到通讯录',
    secRerun: '重新检测', secScore: (a, b) => a === b ? `${a}/${b} 项防护已启用 · securityheaders.com 评级 A+` : `${a}/${b} 项防护已启用`,
    ecoTitle: '轻量且无障碍', ecoWeight: '页面大小（实测）', kb: 'KB', ecoReq: '加载的文件', ecoExt: '对其他网站的请求', ecoCookies: 'Cookie',
    ecoFacts: ['可完全使用键盘操作', '根据设备自动切换浅色或深色主题', '设备要求时减少动画', '提供 6 种语言', '首次访问后可离线使用'],
    ecoNote: '刚刚在您的浏览器中测得。作为对比，普通网页超过 2 MB（HTTP Archive）。',
    keysTitle: '键盘快捷键', keysHelp: '快捷键',
    keysList: [['MOD + K / `', '打开或关闭终端'], ['Esc', '关闭'], ['T', '切换主题'], ['L', '选择语言'], ['S', '开启或关闭声音'], ['J', '开始游戏'], ['C', '联系我'], ['?', '显示本帮助']],
    secretFound: (n, tot, name) => `🏆 发现秘密 ${n}/${tot}：${name}`,
    secretNames: { term: '打开了终端', konami: '科乐美秘技', win: '挡住了全部 3 波攻击', sudo: '尝试 sudo', neofetch: '运行了 neofetch', keys: '发现了快捷键' },
    secretsHead: (n, tot) => `已发现的秘密：${n}/${tot}`, secretsHint: '提示：一个老游戏秘技、一条管理员命令、一个问号……',
    devHead: '网站眼中的您的设备：', devNote: '在您的设备上计算，不发送也不保存任何信息。',
    devLabels: { browser: '浏览器', os: '系统', screen: '屏幕', window: '窗口', lang: '语言', tz: '时区', theme: '偏好主题', motion: '减少动画', touch: '触摸屏', cpu: '处理器', cores: '核', ram: '内存', net: '网络', https: '加密连接' },
    yes: '是', no: '否', gb: 'GB',
    neo: { os: '网站', host: '托管', shell: 'Shell', job: '职业', title: '资格', titleV: 'TAI（4 级）', goal: '目标', goalV: '工学交替：IT 技术员（Bac+2）', avail: '可入职', availV: '立即', sec: '安全', langs: '语言' },
    netCached: '离线：您正在浏览本网站的已保存副本。',
    helpExtra: [['device', '网站眼中的您的设备'], ['neofetch', '系统信息'], ['secrets', '已发现的秘密']]
  });
  add('zh-Hant', {
    qrCap: '掃描即可把我的名片存到手機', saveContact: '加入聯絡人',
    secRerun: '重新檢測', secScore: (a, b) => a === b ? `${a}/${b} 項防護已啟用 · securityheaders.com 評等 A+` : `${a}/${b} 項防護已啟用`,
    ecoTitle: '輕量且無障礙', ecoWeight: '頁面大小（實測）', kb: 'KB', ecoReq: '載入的檔案', ecoExt: '對其他網站的請求', ecoCookies: 'Cookie',
    ecoFacts: ['可完全使用鍵盤操作', '依裝置自動切換淺色或深色主題', '裝置要求時減少動畫', '提供 6 種語言', '首次造訪後可離線使用'],
    ecoNote: '剛剛在您的瀏覽器中測得。作為比較，一般網頁超過 2 MB（HTTP Archive）。',
    keysTitle: '鍵盤快速鍵', keysHelp: '快速鍵',
    keysList: [['MOD + K / `', '開啟或關閉終端機'], ['Esc', '關閉'], ['T', '切換主題'], ['L', '選擇語言'], ['S', '開啟或關閉聲音'], ['J', '開始遊戲'], ['C', '聯絡我'], ['?', '顯示本說明']],
    secretFound: (n, tot, name) => `🏆 發現祕密 ${n}/${tot}：${name}`,
    secretNames: { term: '開啟了終端機', konami: '科樂美祕技', win: '擋下全部 3 波攻擊', sudo: '嘗試 sudo', neofetch: '執行了 neofetch', keys: '發現了快速鍵' },
    secretsHead: (n, tot) => `已發現的祕密：${n}/${tot}`, secretsHint: '提示：一個老遊戲祕技、一條管理員指令、一個問號……',
    devHead: '網站眼中的您的裝置：', devNote: '在您的裝置上計算，不傳送也不儲存任何資訊。',
    devLabels: { browser: '瀏覽器', os: '系統', screen: '螢幕', window: '視窗', lang: '語言', tz: '時區', theme: '偏好主題', motion: '減少動畫', touch: '觸控螢幕', cpu: '處理器', cores: '核心', ram: '記憶體', net: '網路', https: '加密連線' },
    yes: '是', no: '否', gb: 'GB',
    neo: { os: '網站', host: '主機', shell: 'Shell', job: '職業', title: '資格', titleV: 'TAI（第 4 級）', goal: '目標', goalV: '建教合作：IT 技術員（Bac+2）', avail: '可到職', availV: '立即', sec: '安全', langs: '語言' },
    netCached: '離線：您正在瀏覽本網站的已儲存副本。',
    helpExtra: [['device', '網站眼中的您的裝置'], ['neofetch', '系統資訊'], ['secrets', '已發現的祕密']]
  });
  add('yue', {
    qrCap: '掃一掃就可以將我張名片存落手機', saveContact: '加入聯絡人',
    secRerun: '再檢查一次', secScore: (a, b) => a === b ? `${a}/${b} 項保護已經開咗 · securityheaders.com 評級 A+` : `${a}/${b} 項保護已經開咗`,
    ecoTitle: '輕巧又無障礙', ecoWeight: '頁面大細（實測）', kb: 'KB', ecoReq: '載入咗嘅檔案', ecoExt: '去其他網站嘅請求', ecoCookies: 'Cookie',
    ecoFacts: ['淨用鍵盤都用得晒', '跟你部機自動轉淺色或者深色', '你部機要求嘅話會減少動畫', '有 6 種語言', '第一次睇過之後冇網都用得'],
    ecoNote: '啱啱喺你嘅瀏覽器度量出嚟。比較吓：一般網頁超過 2 MB（HTTP Archive）。',
    keysTitle: '鍵盤快捷鍵', keysHelp: '快捷鍵',
    keysList: [['MOD + K / `', '打開或者關閉終端機'], ['Esc', '關閉'], ['T', '轉主題'], ['L', '揀語言'], ['S', '開或者閂聲'], ['J', '玩遊戲'], ['C', '搵我'], ['?', '顯示呢個說明']],
    secretFound: (n, tot, name) => `🏆 搵到秘密 ${n}/${tot}：${name}`,
    secretNames: { term: '打開咗終端機', konami: 'Konami 秘技', win: '擋晒 3 輪攻擊', sudo: '試咗 sudo', neofetch: '行咗 neofetch', keys: '發現咗快捷鍵' },
    secretsHead: (n, tot) => `搵到嘅秘密：${n}/${tot}`, secretsHint: '提示：一個老遊戲秘技、一條管理員指令、一個問號……',
    devHead: '網站眼中你部機：', devNote: '喺你部機度計出嚟，乜都唔會傳出去或者儲存。',
    devLabels: { browser: '瀏覽器', os: '系統', screen: '螢幕', window: '視窗', lang: '語言', tz: '時區', theme: '偏好主題', motion: '減少動畫', touch: '觸控螢幕', cpu: '處理器', cores: '核心', ram: '記憶體', net: '網絡', https: '加密連線' },
    yes: '係', no: '唔係', gb: 'GB',
    neo: { os: '網站', host: '寄存', shell: 'Shell', job: '職業', title: '資格', titleV: 'TAI（第 4 級）', goal: '目標', goalV: '工讀交替：IT 技術員（Bac+2）', avail: '可以開工', availV: '即刻', sec: '安全', langs: '語言' },
    netCached: '離線：你而家睇緊呢個網站儲存咗嘅副本。',
    helpExtra: [['device', '網站眼中你部機'], ['neofetch', '系統資料'], ['secrets', '搵到嘅秘密']]
  });
  add('ko', {
    qrCap: '스캔하면 휴대폰에 제 연락처가 저장됩니다', saveContact: '연락처에 추가',
    secRerun: '다시 점검', secScore: (a, b) => a === b ? `보호 기능 ${a}/${b} 작동 중 · securityheaders.com 등급 A+` : `보호 기능 ${a}/${b} 작동 중`,
    ecoTitle: '가볍고 접근성 있는 사이트', ecoWeight: '페이지 용량 (측정값)', kb: 'KB', ecoReq: '불러온 파일', ecoExt: '다른 사이트로의 요청', ecoCookies: '쿠키',
    ecoFacts: ['키보드만으로 모두 사용 가능', '기기에 따라 라이트 또는 다크 테마', '기기가 요청하면 움직임 줄이기', '6개 언어 지원', '첫 방문 후 오프라인에서도 작동'],
    ecoNote: '방금 브라우저에서 측정한 값입니다. 참고로 평균 웹 페이지는 2 MB가 넘습니다 (HTTP Archive).',
    keysTitle: '키보드 단축키', keysHelp: '단축키',
    keysList: [['MOD + K / `', '터미널 열기 또는 닫기'], ['Esc', '닫기'], ['T', '테마 변경'], ['L', '언어 선택'], ['S', '소리 켜기 또는 끄기'], ['J', '게임하기'], ['C', '연락하기'], ['?', '이 도움말 보기']],
    secretFound: (n, tot, name) => `🏆 비밀 발견 ${n}/${tot}: ${name}`,
    secretNames: { term: '터미널 열기', konami: '코나미 커맨드', win: '3개 공격 웨이브 모두 저지', sudo: 'sudo 시도', neofetch: 'neofetch 실행', keys: '단축키 발견' },
    secretsHead: (n, tot) => `찾은 비밀: ${n}/${tot}`, secretsHint: '힌트: 오래된 게임 커맨드, 관리자 명령어, 물음표…',
    devHead: '사이트가 본 사용자 기기:', devNote: '사용자 기기에서 계산되며, 아무것도 전송하거나 저장하지 않습니다.',
    devLabels: { browser: '브라우저', os: '시스템', screen: '화면', window: '창', lang: '언어', tz: '시간대', theme: '선호 테마', motion: '움직임 줄이기', touch: '터치스크린', cpu: '프로세서', cores: '코어', ram: '메모리', net: '연결', https: '암호화 연결' },
    yes: '예', no: '아니요', gb: 'GB',
    neo: { os: '사이트', host: '호스팅', shell: '셸', job: '직업', title: '자격', titleV: 'TAI (4단계)', goal: '목표', goalV: '일·학습 병행: IT 기술자 (Bac+2)', avail: '근무 가능', availV: '즉시', sec: '보안', langs: '언어' },
    netCached: '오프라인: 저장된 사이트 사본을 보고 있습니다.',
    helpExtra: [['device', '사이트가 본 사용자 기기'], ['neofetch', '시스템 정보'], ['secrets', '찾은 비밀']]
  });
  for (const k in L) if (L[k].tHelp && L[k].helpExtra) for (const h of L[k].helpExtra) if (!L[k].tHelp.some(x => x[0] === h[0])) L[k].tHelp.splice(L[k].tHelp.length - 2, 0, h);
})(window.JG_I18N || {});

/* Lot 3 : e-mail pré-rempli, fiche 30 s, jeux, support N1, supervision, réseau, appli, affichage, visite, matrix */
(function (L) {
  const add = (k, o) => { if (L[k]) Object.assign(L[k], o); };
  add('fr', {
    play: 'Jouer : 2 mini-jeux',
    mailSubject: 'Alternance Technicien informatique : prise de contact',
    mailBody: "Bonjour Jérémy,\n\nJe vous contacte au sujet d’une alternance Technicien informatique.\n\nEntreprise :\nVille :\nDate de début souhaitée :\nTéléphone :\n\nCordialement,\n",
    briefTitle: 'En 30 secondes',
    brief: [["Titre", "Titre professionnel Technicien d’assistance en informatique (TAI), niveau 4, obtenu en 2023"], ["Recherche", "Contrat de professionnalisation de 12 mois (CDD ou CDI) : Technicien informatique en installation, maintenance et support, bac+2 (niveau 5), avec OpenClassrooms"], ["Rythme", "4 jours en entreprise, 1 jour de formation"], ["Durée", "12 mois"], ["Disponibilité", "Dès maintenant ou à convenir"], ["Domaines de la formation", "Support, réseaux, Active Directory, PowerShell, parc informatique, cybersécurité"]],
    gamesTitle: 'Choisissez un jeu', pickServerT: 'Protéger le serveur', pickServerD: 'Bloquez les attaques : logiciel malveillant, DDoS, hameçonnage.', pickSupportT: 'Support informatique N1', pickSupportD: "Résolvez 5 tickets d’utilisateurs en choisissant le bon diagnostic.",
    tkTag: (n, tot, p) => `Ticket ${n}/${tot} · Incident · Priorité ${p}`, tkPts: s => `${s} pts`, tkTitle: n => `Ticket n° ${n}`, tkFromL: 'De :',
    tkGood: '✓ Bonne réponse.', tkBad: '✗ Pas la meilleure piste.', tkRetry: "Essayez une autre option : en support, on cherche d’abord la cause la plus simple.",
    tkNext: 'Ticket suivant', tkEnd: 'Voir le résultat', tkDoneTag: 'Résultat',
    tkDoneTitle: (p, t) => p === t ? 'Niveau N1 validé ✔' : `${p}/${t} tickets résolus du premier coup`,
    tkDoneMsg: (s, m) => `Score : ${s}/${m} points. En support, la méthode compte : écouter, diagnostiquer du plus simple au plus complexe, puis documenter.`,
    tickets: [
      { from: 'Comptabilité, poste fixe', prio: 'moyenne', msg: "Je n’ai plus internet sur mon poste, alors que mon collègue à côté l’a.", opts: ['Réinstaller Windows sur le poste', "Vérifier le câble réseau, puis l’adresse IP avec ipconfig", "Redémarrer le serveur de l’entreprise"], ok: 1, why: "Un seul poste touché : on commence par le plus simple et le plus proche. ipconfig montre si l’adresse IP est valide ; une adresse en 169.254.x.x signale un problème de DHCP." },
      { from: 'Ressources humaines', prio: 'haute', msg: "J’ai cliqué sur un lien dans un e-mail de « la banque » et j’ai tapé mon mot de passe.", opts: ["Lui dire que ce n’est pas grave", "Supprimer l’e-mail et passer à autre chose", "Faire changer son mot de passe tout de suite et signaler l’e-mail à la sécurité"], ok: 2, why: "C’est de l’hameçonnage : le mot de passe est compromis. On le change immédiatement, on vérifie les connexions suspectes et on signale l’e-mail pour le bloquer chez tout le monde." },
      { from: 'Accueil, 2e étage', prio: 'moyenne', msg: "L’imprimante du 2e étage n’imprime plus, pour personne.", opts: ["Vérifier l’imprimante (papier, message d’erreur), puis la file d’impression", 'Réinstaller le pilote sur un seul poste', 'Commander une nouvelle imprimante'], ok: 0, why: "Tout le monde est touché : la panne vient de l’imprimante ou du serveur d’impression, pas d’un poste. On vérifie l’appareil, puis on débloque la file d’attente." },
      { from: 'Commercial en télétravail', prio: 'haute', msg: 'Mon compte est bloqué, je ne peux plus me connecter.', opts: ["Lui donner le mot de passe d’un collègue en attendant", "Vérifier son identité, puis déverrouiller le compte dans l’Active Directory", 'Désactiver la politique de mots de passe pour tout le monde'], ok: 1, why: "On vérifie d’abord que c’est bien lui (contre l’ingénierie sociale), puis on déverrouille le compte dans l’Active Directory. Ensuite, on cherche la cause : trop d’essais, ancien mot de passe enregistré sur un téléphone…" },
      { from: 'Direction', prio: 'basse', msg: 'Mon PC est très lent depuis ce matin.', opts: ['Ouvrir le Gestionnaire des tâches : processeur, mémoire, disque', 'Formater le disque dur', 'Ajouter de la mémoire tout de suite'], ok: 0, why: "On mesure avant d’agir : le Gestionnaire des tâches montre quel programme consomme. Souvent, c’est une mise à jour en cours, un disque presque plein ou un logiciel bloqué." }
    ],
    supBtn: 'Supervision', supTitle: 'Supervision',
    supLabels: { web: 'Site web', tls: 'Certificat TLS', mx: 'E-mail (MX)', spf: 'SPF', dmarc: 'DMARC', tlsrpt: 'TLS-RPT', dnssec: 'DNSSEC' },
    supDays: d => `valide encore ${d} j`, supSigned: 'signé',
    supIntro: d => `Relevé automatique lors de la dernière mise à jour du site, le ${d}.`,
    supNone: 'Les relevés seront disponibles après la prochaine mise à jour du site.',
    updatedOn: d => `Mis à jour le ${d}`,
    ipUsage: 'Usage : ipcalc 192.168.1.10/24',
    ipLabels: { addr: 'Adresse', net: 'Réseau', mask: 'Masque', wild: 'Masque inversé', first: 'Premier hôte', last: 'Dernier hôte', bc: 'Diffusion', hosts: 'Hôtes', type: 'Type', priv: 'privée (RFC 1918)', pub: 'publique' },
    digNote: d => `relevé du ${d} (votre navigateur n’interroge aucun serveur)`,
    digOnly: 'Disponible pour ce domaine : dig, dig mx, dig txt, dig _dmarc.jeremy-grosjean.fr',
    installBtn: "Installer l’application", installIos: "Sur iPhone ou iPad : touchez « ··· » puis Partager, puis « Sur l’écran d’accueil », et laissez « Ouvrir comme app web » activé.",
    installManual: "Utilisez le menu de votre navigateur : « Installer » ou « Ajouter à l’écran d’accueil ».", installAlready: "L’application est déjà installée.", installed: 'Application installée ✔',
    keysTitle: 'Raccourcis et affichage', a11yTitle: 'Affichage', a11ySize: 'Taille du texte', a11yContrast: 'Contraste renforcé', a11yFont: 'Texte plus espacé',
    tourSkip: 'Passer', tourNext: 'Suivant', tourDone: 'Terminer',
    tourContact: "Pour m’écrire : l’adresse à copier, la carte de contact et un QR code.",
    tourBrief: 'Mon profil en 30 secondes : titre, alternance recherchée, rythme, disponibilité.',
    tourPlay: 'Deux mini-jeux : protéger un serveur ou résoudre des tickets de support.',
    tourTerm: 'Un vrai terminal caché : tapez help pour voir les commandes.',
    tourSec: 'Un audit de sécurité du site en direct, avec des mesures réelles.',
    tourSup: "La supervision : l’état des services du site et des e-mails.",
    tourKeys: "Tous les raccourcis clavier et les réglages d’affichage.",
    secretNames2: { support: 'Support N1 parfait (5/5)', matrix: 'Entrer dans la Matrice' },
    secretsHint: 'Indice : un vieux code de jeu vidéo, une commande d’administrateur, un point d’interrogation, un film culte, un sans-faute…',
    helpExtra2: [['support', 'jeu : tickets de support N1'], ['status', 'supervision des services'], ['dig', 'enregistrements DNS du domaine'], ['ipcalc <ip/cidr>', 'calculer un sous-réseau'], ['install', "installer l’application"], ['tour', 'revoir la visite guidée'], ['matrix', '…']]
  });
  add('en', {
    play: 'Play: 2 mini-games',
    mailSubject: 'Work-study IT Technician: getting in touch',
    mailBody: "Hello Jérémy,\n\nI am contacting you about a work-study position as an IT Technician.\n\nCompany:\nCity:\nPreferred start date:\nPhone:\n\nBest regards,\n",
    briefTitle: 'In 30 seconds',
    brief: [["Title", "French professional title TAI (IT support technician), level 4, earned in 2023"], ["Looking for", "12-month professionalisation contract (fixed-term or permanent): IT Technician in installation, maintenance and support, 2-year degree (level 5), with OpenClassrooms"], ["Schedule", "4 days at work, 1 day of training"], ["Length", "12 months"], ["Availability", "Now, or at a date to agree"], ["Training topics", "Support, networks, Active Directory, PowerShell, IT assets, cybersecurity"]],
    gamesTitle: 'Choose a game', pickServerT: 'Protect the server', pickServerD: 'Block the attacks: malware, DDoS, phishing.', pickSupportT: 'IT support, level 1', pickSupportD: 'Solve 5 user tickets by choosing the right diagnosis.',
    tkTag: (n, tot, p) => `Ticket ${n}/${tot} · Incident · ${p} priority`, tkPts: s => `${s} pts`, tkTitle: n => `Ticket #${n}`, tkFromL: 'From:',
    tkGood: '✓ Correct.', tkBad: '✗ Not the best lead.', tkRetry: 'Try another option: in support, look for the simplest cause first.',
    tkNext: 'Next ticket', tkEnd: 'See the result', tkDoneTag: 'Result',
    tkDoneTitle: (p, t) => p === t ? 'Level 1 support passed ✔' : `${p}/${t} tickets solved on the first try`,
    tkDoneMsg: (s, m) => `Score: ${s}/${m} points. In support, method matters: listen, diagnose from simplest to most complex, then document.`,
    tickets: [
      { from: 'Accounting, desktop PC', prio: 'medium', msg: 'My computer has no internet, but my colleague next to me does.', opts: ['Reinstall Windows on the computer', 'Check the network cable, then the IP address with ipconfig', "Restart the company’s server"], ok: 1, why: 'Only one computer is affected: start with the simplest, closest cause. ipconfig shows whether the IP address is valid; an address in 169.254.x.x points to a DHCP problem.' },
      { from: 'Human resources', prio: 'high', msg: 'I clicked a link in an email from "the bank" and typed my password.', opts: ["Tell them it’s no big deal", 'Delete the email and move on', 'Have them change the password right away and report the email to security'], ok: 2, why: 'This is phishing: the password is compromised. Change it immediately, check for suspicious sign-ins and report the email so it gets blocked for everyone.' },
      { from: 'Reception, 2nd floor', prio: 'medium', msg: "The 2nd-floor printer doesn’t print anymore, for anyone.", opts: ['Check the printer (paper, error message), then the print queue', 'Reinstall the driver on one computer', 'Order a new printer'], ok: 0, why: "Everyone is affected: the fault is on the printer or the print server, not a single computer. Check the device, then clear the stuck queue." },
      { from: 'Sales, working from home', prio: 'high', msg: "My account is locked, I can’t sign in.", opts: ["Give them a colleague’s password for now", 'Verify their identity, then unlock the account in Active Directory', 'Turn off the password policy for everyone'], ok: 1, why: "First make sure it’s really them (against social engineering), then unlock the account in Active Directory. Then find the cause: too many attempts, an old password saved on a phone…" },
      { from: 'Management', prio: 'low', msg: 'My PC has been very slow since this morning.', opts: ['Open Task Manager: CPU, memory, disk', 'Format the hard drive', 'Add more memory right away'], ok: 0, why: 'Measure before acting: Task Manager shows which program is using resources. Often it is an update in progress, a nearly full disk or a frozen program.' }
    ],
    supBtn: 'Monitoring', supTitle: 'Monitoring',
    supLabels: { web: 'Website', tls: 'TLS certificate', mx: 'Email (MX)', spf: 'SPF', dmarc: 'DMARC', tlsrpt: 'TLS-RPT', dnssec: 'DNSSEC' },
    supDays: d => `valid for ${d} more days`, supSigned: 'signed',
    supIntro: d => `Checked automatically at the last site update, on ${d}.`,
    supNone: 'Checks will be available after the next site update.',
    updatedOn: d => `Updated ${d}`,
    ipUsage: 'Usage: ipcalc 192.168.1.10/24',
    ipLabels: { addr: 'Address', net: 'Network', mask: 'Netmask', wild: 'Wildcard', first: 'First host', last: 'Last host', bc: 'Broadcast', hosts: 'Hosts', type: 'Type', priv: 'private (RFC 1918)', pub: 'public' },
    digNote: d => `snapshot from ${d} (your browser queries no server)`,
    digOnly: 'Available for this domain: dig, dig mx, dig txt, dig _dmarc.jeremy-grosjean.fr',
    installBtn: 'Install the app', installIos: 'On iPhone or iPad: tap "···", then Share, then "Add to Home Screen", and leave "Open as Web App" on.',
    installManual: 'Use your browser menu: "Install" or "Add to Home Screen".', installAlready: 'The app is already installed.', installed: 'App installed ✔',
    keysTitle: 'Shortcuts and display', a11yTitle: 'Display', a11ySize: 'Text size', a11yContrast: 'Higher contrast', a11yFont: 'Wider text spacing',
    tourSkip: 'Skip', tourNext: 'Next', tourDone: 'Done',
    tourContact: 'To write to me: the address to copy, the contact card and a QR code.',
    tourBrief: 'My profile in 30 seconds: title, work-study wanted, schedule, availability.',
    tourPlay: 'Two mini-games: protect a server or solve support tickets.',
    tourTerm: 'A real hidden terminal: type help to see the commands.',
    tourSec: "A live security audit of the site, with real measurements.",
    tourSup: 'Monitoring: the status of the site and email services.',
    tourKeys: 'All keyboard shortcuts and display settings.',
    secretNames2: { support: 'Perfect level 1 support (5/5)', matrix: 'Enter the Matrix' },
    secretsHint: 'Hint: an old video game code, an admin command, a question mark, a cult film, a perfect score…',
    helpExtra2: [['support', 'game: level 1 support tickets'], ['status', 'service monitoring'], ['dig', "the domain’s DNS records"], ['ipcalc <ip/cidr>', 'subnet calculator'], ['install', 'install the app'], ['tour', 'replay the guided tour'], ['matrix', '…']]
  });
  add('zh-Hans', {
    play: '玩：2 个小游戏',
    mailSubject: 'IT 技术员工学交替岗位：联系',
    mailBody: '您好 Jérémy：\n\n我想就 IT 技术员工学交替岗位与您联系。\n\n公司：\n城市：\n希望开始日期：\n电话：\n\n此致\n',
    briefTitle: '30 秒了解我',
    brief: [["资格", "法国 TAI 职业资格（IT 支持技术员，4 级），2023 年取得"], ["寻找", "12 个月职业化合同（定期或无固定期限）：IT 安装、维护与支持技术员，Bac+2（5 级），OpenClassrooms 课程"], ["节奏", "每周 4 天在企业，1 天培训"], ["时长", "12 个月"], ["可入职", "立即，或另行商定"], ["培训方向", "技术支持、网络、Active Directory、PowerShell、IT 资产、网络安全"]],
    gamesTitle: '选择游戏', pickServerT: '保护服务器', pickServerD: '拦截攻击：恶意软件、DDoS、网络钓鱼。', pickSupportT: '一线 IT 支持', pickSupportD: '选择正确的诊断，解决 5 个用户工单。',
    tkTag: (n, tot, p) => `工单 ${n}/${tot} · 事件 · 优先级：${p}`, tkPts: s => `${s} 分`, tkTitle: n => `工单 #${n}`, tkFromL: '来自：',
    tkGood: '✓ 回答正确。', tkBad: '✗ 不是最好的思路。', tkRetry: '换个选项试试：做技术支持，先找最简单的原因。',
    tkNext: '下一个工单', tkEnd: '查看结果', tkDoneTag: '结果',
    tkDoneTitle: (p, t) => p === t ? '一线支持水平达标 ✔' : `${p}/${t} 个工单一次解决`,
    tkDoneMsg: (s, m) => `得分：${s}/${m}。做技术支持，方法很重要：先倾听，从简单到复杂地诊断，然后记录。`,
    tickets: [
      { from: '财务部，台式机', prio: '中', msg: '我的电脑上不了网，但旁边同事的可以。', opts: ['重装这台电脑的 Windows', '检查网线，再用 ipconfig 查看 IP 地址', '重启公司服务器'], ok: 1, why: '只有一台电脑出问题：先从最简单、最近的地方查起。ipconfig 能看出 IP 地址是否有效；169.254.x.x 开头的地址说明 DHCP 有问题。' },
      { from: '人力资源部', prio: '高', msg: '我点了一封“银行”邮件里的链接，还输入了密码。', opts: ['告诉他没关系', '删掉邮件，当作没发生', '立即让他修改密码，并把邮件报告给安全团队'], ok: 2, why: '这是网络钓鱼：密码已经泄露。立即修改密码，检查可疑登录，并报告该邮件，让所有人都拦截它。' },
      { from: '前台，2 楼', prio: '中', msg: '2 楼的打印机谁都打印不了了。', opts: ['检查打印机（纸张、错误提示），再检查打印队列', '在一台电脑上重装驱动', '订购一台新打印机'], ok: 0, why: '所有人都受影响：故障在打印机或打印服务器，而不是某台电脑。先检查设备，再清理卡住的打印队列。' },
      { from: '销售，远程办公', prio: '高', msg: '我的账户被锁定了，登录不了。', opts: ['先把同事的密码给他用', '核实身份后，在 Active Directory 中解锁账户', '为所有人关闭密码策略'], ok: 1, why: '先确认确实是本人（防范社会工程），再在 Active Directory 中解锁账户。然后找原因：尝试次数过多、手机上保存了旧密码……' },
      { from: '管理层', prio: '低', msg: '我的电脑从今天早上开始特别慢。', opts: ['打开任务管理器：CPU、内存、磁盘', '格式化硬盘', '马上加内存'], ok: 0, why: '先测量再动手：任务管理器能看出哪个程序在占用资源。常见原因：正在更新、磁盘快满了、或某个程序卡住了。' }
    ],
    supBtn: '监控', supTitle: '服务监控',
    supLabels: { web: '网站', tls: 'TLS 证书', mx: '邮件（MX）', spf: 'SPF', dmarc: 'DMARC', tlsrpt: 'TLS-RPT', dnssec: 'DNSSEC' },
    supDays: d => `还有 ${d} 天有效`, supSigned: '已签名',
    supIntro: d => `在 ${d} 网站最近一次更新时自动检测。`,
    supNone: '下次网站更新后即可查看检测结果。',
    updatedOn: d => `更新于 ${d}`,
    ipUsage: '用法：ipcalc 192.168.1.10/24',
    ipLabels: { addr: '地址', net: '网络', mask: '子网掩码', wild: '反掩码', first: '第一个主机', last: '最后一个主机', bc: '广播地址', hosts: '主机数', type: '类型', priv: '私有（RFC 1918）', pub: '公有' },
    digNote: d => `${d} 的记录（您的浏览器不会查询任何服务器）`,
    digOnly: '本域名可用：dig、dig mx、dig txt、dig _dmarc.jeremy-grosjean.fr',
    installBtn: '安装应用', installIos: '在 iPhone 或 iPad 上：点“···”，再点“分享”，然后点“添加到主屏幕”，并保持“作为网页 App 打开”开启。',
    installManual: '请使用浏览器菜单：“安装”或“添加到主屏幕”。', installAlready: '应用已安装。', installed: '应用已安装 ✔',
    keysTitle: '快捷键与显示', a11yTitle: '显示', a11ySize: '文字大小', a11yContrast: '增强对比度', a11yFont: '加大文字间距',
    tourSkip: '跳过', tourNext: '下一步', tourDone: '完成',
    tourContact: '给我写信：可复制的邮箱、联系人名片和二维码。',
    tourBrief: '30 秒了解我：资格、寻找的工学交替岗位、节奏、可入职时间。',
    tourPlay: '两个小游戏：保护服务器，或解决技术支持工单。',
    tourTerm: '一个隐藏的真终端：输入 help 查看命令。',
    tourSec: '网站的实时安全检测，使用真实测量数据。',
    tourSup: '服务监控：网站和邮件服务的状态。',
    tourKeys: '所有键盘快捷键和显示设置。',
    secretNames2: { support: '一线支持满分（5/5）', matrix: '进入黑客帝国' },
    secretsHint: '提示：一个老游戏秘技、一条管理员命令、一个问号、一部经典电影、一次满分……',
    helpExtra2: [['support', '游戏：一线支持工单'], ['status', '服务监控'], ['dig', '域名的 DNS 记录'], ['ipcalc <ip/cidr>', '子网计算'], ['install', '安装应用'], ['tour', '重新查看导览'], ['matrix', '……']]
  });
  add('zh-Hant', {
    play: '玩：2 個小遊戲',
    mailSubject: 'IT 技術員建教合作職位：聯絡',
    mailBody: '您好 Jérémy：\n\n我想就 IT 技術員建教合作職位與您聯絡。\n\n公司：\n城市：\n希望開始日期：\n電話：\n\n敬祝 順心\n',
    briefTitle: '30 秒認識我',
    brief: [["資格", "法國 TAI 職業資格（IT 支援技術員，第 4 級），2023 年取得"], ["尋找", "12 個月職業化契約（定期或不定期）：IT 安裝、維護與支援技術員，Bac+2（第 5 級），OpenClassrooms 課程"], ["節奏", "每週 4 天在企業，1 天上課"], ["期間", "12 個月"], ["可到職", "立即，或另行約定"], ["課程方向", "技術支援、網路、Active Directory、PowerShell、IT 資產、資訊安全"]],
    gamesTitle: '選擇遊戲', pickServerT: '保護伺服器', pickServerD: '攔截攻擊：惡意軟體、DDoS、網路釣魚。', pickSupportT: '第一線 IT 支援', pickSupportD: '選出正確的診斷，解決 5 張使用者工單。',
    tkTag: (n, tot, p) => `工單 ${n}/${tot} · 事件 · 優先順序：${p}`, tkPts: s => `${s} 分`, tkTitle: n => `工單 #${n}`, tkFromL: '來自：',
    tkGood: '✓ 答對了。', tkBad: '✗ 不是最好的方向。', tkRetry: '換個選項試試：做技術支援，先找最簡單的原因。',
    tkNext: '下一張工單', tkEnd: '查看結果', tkDoneTag: '結果',
    tkDoneTitle: (p, t) => p === t ? '第一線支援程度達標 ✔' : `${p}/${t} 張工單一次解決`,
    tkDoneMsg: (s, m) => `得分：${s}/${m}。做技術支援，方法很重要：先傾聽，由簡到繁地診斷，然後記錄。`,
    tickets: [
      { from: '會計部，桌上型電腦', prio: '中', msg: '我的電腦上不了網，但旁邊同事的可以。', opts: ['重灌這台電腦的 Windows', '檢查網路線，再用 ipconfig 查看 IP 位址', '重新啟動公司的伺服器'], ok: 1, why: '只有一台電腦出問題：先從最簡單、最近的地方查起。ipconfig 能看出 IP 位址是否有效；169.254.x.x 開頭的位址代表 DHCP 有問題。' },
      { from: '人力資源部', prio: '高', msg: '我點了一封「銀行」郵件裡的連結，還輸入了密碼。', opts: ['告訴他沒關係', '刪掉郵件，當作沒發生', '立刻請他更改密碼，並把郵件回報給資安團隊'], ok: 2, why: '這是網路釣魚：密碼已經外洩。立刻更改密碼，檢查可疑登入，並回報該郵件，讓所有人都封鎖它。' },
      { from: '櫃台，2 樓', prio: '中', msg: '2 樓的印表機誰都印不出來了。', opts: ['檢查印表機（紙張、錯誤訊息），再檢查列印佇列', '在一台電腦上重灌驅動程式', '訂購一台新印表機'], ok: 0, why: '所有人都受影響：故障在印表機或列印伺服器，而不是某台電腦。先檢查設備，再清除卡住的列印佇列。' },
      { from: '業務，遠端工作', prio: '高', msg: '我的帳號被鎖住了，無法登入。', opts: ['先把同事的密碼給他用', '確認身分後，在 Active Directory 中解鎖帳號', '為所有人關閉密碼原則'], ok: 1, why: '先確認確實是本人（防範社交工程），再在 Active Directory 中解鎖帳號。接著找原因：嘗試次數過多、手機上存了舊密碼……' },
      { from: '管理層', prio: '低', msg: '我的電腦從今天早上開始變得很慢。', opts: ['打開工作管理員：CPU、記憶體、磁碟', '格式化硬碟', '馬上加裝記憶體'], ok: 0, why: '先量測再動手：工作管理員能看出哪個程式在占用資源。常見原因：正在更新、磁碟快滿了、或某個程式當掉了。' }
    ],
    supBtn: '監控', supTitle: '服務監控',
    supLabels: { web: '網站', tls: 'TLS 憑證', mx: '郵件（MX）', spf: 'SPF', dmarc: 'DMARC', tlsrpt: 'TLS-RPT', dnssec: 'DNSSEC' },
    supDays: d => `還有 ${d} 天有效`, supSigned: '已簽章',
    supIntro: d => `於 ${d} 網站最近一次更新時自動檢測。`,
    supNone: '下次網站更新後即可查看檢測結果。',
    updatedOn: d => `更新於 ${d}`,
    ipUsage: '用法：ipcalc 192.168.1.10/24',
    ipLabels: { addr: '位址', net: '網路', mask: '子網路遮罩', wild: '反遮罩', first: '第一台主機', last: '最後一台主機', bc: '廣播位址', hosts: '主機數', type: '類型', priv: '私有（RFC 1918）', pub: '公有' },
    digNote: d => `${d} 的紀錄（您的瀏覽器不會查詢任何伺服器）`,
    digOnly: '本網域可用：dig、dig mx、dig txt、dig _dmarc.jeremy-grosjean.fr',
    installBtn: '安裝應用程式', installIos: '在 iPhone 或 iPad 上：點「···」，再點「分享」，然後點「加入主畫面」，並保持「以網頁 App 開啟」開啟。',
    installManual: '請使用瀏覽器選單：「安裝」或「加入主畫面」。', installAlready: '應用程式已安裝。', installed: '應用程式已安裝 ✔',
    keysTitle: '快速鍵與顯示', a11yTitle: '顯示', a11ySize: '文字大小', a11yContrast: '加強對比', a11yFont: '加大文字間距',
    tourSkip: '略過', tourNext: '下一步', tourDone: '完成',
    tourContact: '寫信給我：可複製的信箱、聯絡人名片和 QR 碼。',
    tourBrief: '30 秒認識我：資格、尋找的建教合作職位、節奏、可到職時間。',
    tourPlay: '兩個小遊戲：保護伺服器，或解決技術支援工單。',
    tourTerm: '一個隱藏的真終端機：輸入 help 查看指令。',
    tourSec: '網站的即時資安檢測，採用真實量測數據。',
    tourSup: '服務監控：網站和郵件服務的狀態。',
    tourKeys: '所有鍵盤快速鍵和顯示設定。',
    secretNames2: { support: '第一線支援滿分（5/5）', matrix: '進入駭客任務' },
    secretsHint: '提示：一個老遊戲祕技、一條管理員指令、一個問號、一部經典電影、一次滿分……',
    helpExtra2: [['support', '遊戲：第一線支援工單'], ['status', '服務監控'], ['dig', '網域的 DNS 紀錄'], ['ipcalc <ip/cidr>', '子網路計算'], ['install', '安裝應用程式'], ['tour', '重看導覽'], ['matrix', '……']]
  });
  add('yue', {
    play: '玩：2 個小遊戲',
    mailSubject: 'IT 技術員工讀交替職位：聯絡',
    mailBody: '你好 Jérémy：\n\n我想同你傾吓 IT 技術員工讀交替職位。\n\n公司：\n城市：\n想幾時開始：\n電話：\n\n多謝\n',
    briefTitle: '30 秒認識我',
    brief: [["資格", "法國 TAI 職業資格（IT 支援技術員，第 4 級），2023 年攞到"], ["搵緊", "12 個月職業化合約（定期或者長期）：IT 安裝、維修同支援技術員，Bac+2（第 5 級），OpenClassrooms 課程"], ["節奏", "每星期 4 日返公司，1 日上堂"], ["為期", "12 個月"], ["幾時開工", "即刻，或者再傾"], ["課程範疇", "技術支援、網絡、Active Directory、PowerShell、IT 資產、網絡安全"]],
    gamesTitle: '揀個遊戲', pickServerT: '保護伺服器', pickServerD: '擋住攻擊：惡意軟件、DDoS、網絡釣魚。', pickSupportT: '第一線 IT 支援', pickSupportD: '揀啱診斷方法，解決 5 張用戶工單。',
    tkTag: (n, tot, p) => `工單 ${n}/${tot} · 事故 · 優先程度：${p}`, tkPts: s => `${s} 分`, tkTitle: n => `工單 #${n}`, tkFromL: '嚟自：',
    tkGood: '✓ 答啱咗。', tkBad: '✗ 唔係最好嘅方向。', tkRetry: '試吓第二個選擇：做技術支援，先搵最簡單嘅原因。',
    tkNext: '下一張工單', tkEnd: '睇結果', tkDoneTag: '結果',
    tkDoneTitle: (p, t) => p === t ? '第一線支援合格 ✔' : `${p}/${t} 張工單一次過解決`,
    tkDoneMsg: (s, m) => `得分：${s}/${m}。做技術支援，方法好緊要：先聽清楚，由簡單到複雜咁診斷，跟住記錄低。`,
    tickets: [
      { from: '會計部，枱式電腦', prio: '中', msg: '我部電腦上唔到網，但隔籬同事部就得。', opts: ['幫部電腦重裝 Windows', '檢查網線，再用 ipconfig 睇 IP 地址', '重啟公司部伺服器'], ok: 1, why: '得一部電腦有事：先由最簡單、最近嘅地方查起。ipconfig 睇得出 IP 地址啱唔啱；169.254.x.x 開頭嘅地址即係 DHCP 有問題。' },
      { from: '人力資源部', prio: '高', msg: '我撳咗一封「銀行」電郵入面條連結，仲打咗密碼落去。', opts: ['話佢知冇問題', '刪咗封電郵當冇事', '即刻叫佢改密碼，再將封電郵報俾資安團隊'], ok: 2, why: '呢個係網絡釣魚：密碼已經洩露咗。即刻改密碼，檢查可疑登入，再報告封電郵，等全公司都封鎖佢。' },
      { from: '接待處，2 樓', prio: '中', msg: '2 樓部打印機邊個都印唔到嘢。', opts: ['檢查部打印機（紙、錯誤訊息），再睇列印佇列', '喺一部電腦重裝驅動程式', '訂過部新打印機'], ok: 0, why: '個個都受影響：問題喺打印機或者列印伺服器，唔係某部電腦。先檢查部機，再清咗卡住嘅列印佇列。' },
      { from: '營業部，喺屋企返工', prio: '高', msg: '我個戶口俾人鎖咗，登入唔到。', opts: ['住住先俾同事個密碼佢用', '核實佢身份，再喺 Active Directory 解鎖個戶口', '幫所有人閂咗密碼政策'], ok: 1, why: '先確認真係佢本人（防範社交工程），再喺 Active Directory 解鎖戶口。跟住搵原因：試錯太多次、手機仲存住舊密碼……' },
      { from: '管理層', prio: '低', msg: '我部電腦由今朝開始好慢。', opts: ['打開工作管理員：CPU、記憶體、磁碟', '格式化個硬碟', '即刻加記憶體'], ok: 0, why: '先量度再郁手：工作管理員睇得出邊個程式食晒資源。通常係更新緊、磁碟就爆，或者有程式冇反應。' }
    ],
    supBtn: '監察', supTitle: '服務監察',
    supLabels: { web: '網站', tls: 'TLS 證書', mx: '電郵（MX）', spf: 'SPF', dmarc: 'DMARC', tlsrpt: 'TLS-RPT', dnssec: 'DNSSEC' },
    supDays: d => `仲有 ${d} 日有效`, supSigned: '已簽署',
    supIntro: d => `喺 ${d} 網站最近一次更新嗰陣自動檢查。`,
    supNone: '下次網站更新之後就睇到檢查結果。',
    updatedOn: d => `更新於 ${d}`,
    ipUsage: '用法：ipcalc 192.168.1.10/24',
    ipLabels: { addr: '地址', net: '網絡', mask: '子網遮罩', wild: '反遮罩', first: '第一部主機', last: '最後一部主機', bc: '廣播地址', hosts: '主機數', type: '類型', priv: '私人（RFC 1918）', pub: '公共' },
    digNote: d => `${d} 嘅紀錄（你嘅瀏覽器唔會查詢任何伺服器）`,
    digOnly: '呢個域名用得：dig、dig mx、dig txt、dig _dmarc.jeremy-grosjean.fr',
    installBtn: '安裝應用程式', installIos: '喺 iPhone 或者 iPad：撳「···」，再撳「分享」，然後撳「加至主畫面」，保持「以網頁 App 開啟」開住。',
    installManual: '用瀏覽器選單：「安裝」或者「加至主畫面」。', installAlready: '應用程式已經裝咗。', installed: '應用程式裝好咗 ✔',
    keysTitle: '快捷鍵同顯示', a11yTitle: '顯示', a11ySize: '字體大細', a11yContrast: '加強對比', a11yFont: '加闊字距',
    tourSkip: '跳過', tourNext: '下一步', tourDone: '完成',
    tourContact: '寫信俾我：可以複製嘅電郵、聯絡人卡同 QR code。',
    tourBrief: '30 秒認識我：資格、搵緊嘅工讀交替職位、節奏、幾時開工。',
    tourPlay: '兩個小遊戲：保護伺服器，或者解決技術支援工單。',
    tourTerm: '一個收埋咗嘅真終端機：打 help 睇指令。',
    tourSec: '網站嘅即時資安檢查，用真實量度數據。',
    tourSup: '服務監察：網站同電郵服務嘅狀態。',
    tourKeys: '所有鍵盤快捷鍵同顯示設定。',
    secretNames2: { support: '第一線支援滿分（5/5）', matrix: '入咗 Matrix' },
    secretsHint: '提示：一個老遊戲秘技、一條管理員指令、一個問號、一套經典電影、一次滿分……',
    helpExtra2: [['support', '遊戲：第一線支援工單'], ['status', '服務監察'], ['dig', '域名嘅 DNS 紀錄'], ['ipcalc <ip/cidr>', '計子網'], ['install', '安裝應用程式'], ['tour', '再睇一次導覽'], ['matrix', '……']]
  });
  add('ko', {
    play: '게임하기: 미니 게임 2개',
    mailSubject: 'IT 기술자 일·학습 병행: 연락드립니다',
    mailBody: '안녕하세요 Jérémy 님,\n\nIT 기술자 일·학습 병행 과정과 관련해 연락드립니다.\n\n회사:\n도시:\n희망 시작일:\n전화:\n\n감사합니다.\n',
    briefTitle: '30초 요약',
    brief: [["자격", "프랑스 TAI 직업 자격 (IT 지원 기술자, 4단계), 2023년 취득"], ["구직", "12개월 직업화 계약(기간제 또는 정규직): IT 설치·유지보수·지원 기술자, Bac+2(5단계), OpenClassrooms 과정"], ["일정", "주 4일 근무, 1일 교육"], ["기간", "12개월"], ["근무 가능", "즉시 또는 협의"], ["교육 분야", "기술 지원, 네트워크, Active Directory, PowerShell, IT 자산, 사이버 보안"]],
    gamesTitle: '게임 선택', pickServerT: '서버 지키기', pickServerD: '공격을 막으세요: 악성코드, DDoS, 피싱.', pickSupportT: '1선 IT 지원', pickSupportD: '올바른 진단을 골라 사용자 티켓 5개를 해결하세요.',
    tkTag: (n, tot, p) => `티켓 ${n}/${tot} · 장애 · 우선순위 ${p}`, tkPts: s => `${s}점`, tkTitle: n => `티켓 #${n}`, tkFromL: '요청자:',
    tkGood: '✓ 정답입니다.', tkBad: '✗ 가장 좋은 방법은 아닙니다.', tkRetry: '다른 선택지를 골라 보세요. 기술 지원에서는 가장 간단한 원인부터 찾습니다.',
    tkNext: '다음 티켓', tkEnd: '결과 보기', tkDoneTag: '결과',
    tkDoneTitle: (p, t) => p === t ? '1선 지원 통과 ✔' : `티켓 ${p}/${t}개를 한 번에 해결`,
    tkDoneMsg: (s, m) => `점수: ${s}/${m}점. 기술 지원에서는 방법이 중요합니다: 듣고, 간단한 것부터 복잡한 것까지 진단하고, 기록합니다.`,
    tickets: [
      { from: '회계팀, 데스크톱', prio: '보통', msg: '제 컴퓨터만 인터넷이 안 되고 옆자리 동료는 됩니다.', opts: ['컴퓨터에 Windows 재설치', '네트워크 케이블을 확인한 뒤 ipconfig로 IP 주소 확인', '회사 서버 재시작'], ok: 1, why: '한 대만 문제가 있으니 가장 간단하고 가까운 곳부터 확인합니다. ipconfig로 IP 주소가 정상인지 볼 수 있으며, 169.254.x.x 주소는 DHCP 문제를 뜻합니다.' },
      { from: '인사팀', prio: '높음', msg: '"은행" 메일의 링크를 눌러 비밀번호를 입력했어요.', opts: ['괜찮다고 안심시킨다', '메일을 지우고 넘어간다', '즉시 비밀번호를 바꾸게 하고 메일을 보안팀에 신고한다'], ok: 2, why: '피싱입니다. 비밀번호가 유출되었으니 즉시 변경하고, 의심스러운 로그인을 확인한 뒤, 모든 사람에게서 차단되도록 메일을 신고합니다.' },
      { from: '안내데스크, 2층', prio: '보통', msg: '2층 프린터가 아무도 인쇄가 안 돼요.', opts: ['프린터(용지, 오류 메시지)를 확인한 뒤 인쇄 대기열 확인', '컴퓨터 한 대에 드라이버 재설치', '새 프린터 주문'], ok: 0, why: '모두에게 문제가 있으니 원인은 특정 PC가 아니라 프린터나 인쇄 서버입니다. 장치를 확인한 뒤 막힌 대기열을 정리합니다.' },
      { from: '영업팀, 재택근무', prio: '높음', msg: '계정이 잠겨서 로그인할 수 없어요.', opts: ['당분간 동료의 비밀번호를 알려 준다', '본인 확인 후 Active Directory에서 계정 잠금 해제', '모두의 비밀번호 정책을 끈다'], ok: 1, why: '먼저 본인이 맞는지 확인하고(사회공학 공격 대비), Active Directory에서 잠금을 해제합니다. 그다음 원인을 찾습니다: 잦은 시도, 휴대폰에 저장된 옛 비밀번호 등.' },
      { from: '경영진', prio: '낮음', msg: '오늘 아침부터 PC가 너무 느려요.', opts: ['작업 관리자 열기: CPU, 메모리, 디스크', '하드 디스크 포맷', '바로 메모리 추가'], ok: 0, why: '조치 전에 먼저 측정합니다. 작업 관리자로 어떤 프로그램이 자원을 쓰는지 볼 수 있습니다. 흔한 원인: 업데이트 진행 중, 디스크 부족, 멈춘 프로그램.' }
    ],
    supBtn: '모니터링', supTitle: '서비스 모니터링',
    supLabels: { web: '웹사이트', tls: 'TLS 인증서', mx: '메일 (MX)', spf: 'SPF', dmarc: 'DMARC', tlsrpt: 'TLS-RPT', dnssec: 'DNSSEC' },
    supDays: d => `${d}일 더 유효`, supSigned: '서명됨',
    supIntro: d => `${d} 마지막 사이트 업데이트 때 자동으로 점검했습니다.`,
    supNone: '다음 사이트 업데이트 후에 점검 결과를 볼 수 있습니다.',
    updatedOn: d => `${d} 업데이트`,
    ipUsage: '사용법: ipcalc 192.168.1.10/24',
    ipLabels: { addr: '주소', net: '네트워크', mask: '서브넷 마스크', wild: '와일드카드', first: '첫 호스트', last: '마지막 호스트', bc: '브로드캐스트', hosts: '호스트 수', type: '유형', priv: '사설 (RFC 1918)', pub: '공인' },
    digNote: d => `${d} 기록 (브라우저는 어떤 서버에도 질의하지 않습니다)`,
    digOnly: '이 도메인에서 사용 가능: dig, dig mx, dig txt, dig _dmarc.jeremy-grosjean.fr',
    installBtn: '앱 설치', installIos: 'iPhone 또는 iPad: "···"를 누르고 공유, "홈 화면에 추가"를 누른 뒤 "웹 앱으로 열기"를 켜 두세요.',
    installManual: '브라우저 메뉴에서 "설치" 또는 "홈 화면에 추가"를 사용하세요.', installAlready: '앱이 이미 설치되어 있습니다.', installed: '앱 설치 완료 ✔',
    keysTitle: '단축키 및 화면', a11yTitle: '화면', a11ySize: '글자 크기', a11yContrast: '고대비', a11yFont: '글자 간격 넓게',
    tourSkip: '건너뛰기', tourNext: '다음', tourDone: '완료',
    tourContact: '연락하기: 복사할 수 있는 주소, 연락처 카드, QR 코드.',
    tourBrief: '30초 요약: 자격, 희망하는 일·학습 병행, 일정, 근무 가능 시기.',
    tourPlay: '미니 게임 2개: 서버를 지키거나 지원 티켓을 해결하세요.',
    tourTerm: '숨겨진 진짜 터미널: help를 입력해 명령어를 보세요.',
    tourSec: '실제 측정값으로 하는 사이트 실시간 보안 점검.',
    tourSup: '모니터링: 사이트와 메일 서비스 상태.',
    tourKeys: '모든 키보드 단축키와 화면 설정.',
    secretNames2: { support: '1선 지원 만점 (5/5)', matrix: '매트릭스 입장' },
    secretsHint: '힌트: 오래된 게임 커맨드, 관리자 명령어, 물음표, 명작 영화, 만점…',
    helpExtra2: [['support', '게임: 1선 지원 티켓'], ['status', '서비스 모니터링'], ['dig', '도메인 DNS 레코드'], ['ipcalc <ip/cidr>', '서브넷 계산'], ['install', '앱 설치'], ['tour', '안내 다시 보기'], ['matrix', '…']]
  });
  for (const k in L) {
    const o = L[k];
    if (o.secretNames && o.secretNames2) Object.assign(o.secretNames, o.secretNames2);
    if (o.tHelp && o.helpExtra2) for (const h of o.helpExtra2) if (!o.tHelp.some(x => x[0] === h[0])) o.tHelp.splice(o.tHelp.length - 2, 0, h);
  }
})(window.JG_I18N || {});

/* Lot 4 : jeu de support, nouveaux tickets N1 et niveau N2 */
(function (L) {
  const add = (k, o, n1, help) => { if (!L[k]) return; Object.assign(L[k], o); if (Array.isArray(L[k].tickets)) L[k].tickets.push(...n1); if (L[k].tHelp) { const h = L[k].tHelp.find(x => x[0] === 'support'); if (h) h[1] = help; } };
  add('fr', {
    pickSupportT: 'Support informatique N1', pickSupportD: "Débutant : résolvez 5 tickets d’utilisateurs en choisissant le bon diagnostic.",
    pickSupport2T: 'Support informatique N2', pickSupport2D: "Avancé : réseau, DHCP, Active Directory, DNS, droits d’accès.",
    tkTag: (n, tot, p, lv) => `Ticket ${n}/${tot} · ${lv} · Incident · Priorité ${p}`,
    tkDoneTitle: (p, t, lv) => p === t ? `Niveau N${lv} validé ✔` : `${p}/${t} tickets résolus du premier coup`,
    tkToN2: 'Passer au niveau N2 →',
    secretNames3: { support2: 'Support N2 parfait (5/5)' },
    ticketsN2: [
      { from: 'Responsable du 3e étage', prio: 'haute', msg: "Plus personne n’a le réseau au 3e étage, alors que les autres étages fonctionnent.", opts: ['Réinstaller les postes du 3e étage un par un', 'Vérifier le switch du 3e étage et son lien vers la baie principale', 'Changer la box internet'], ok: 1, why: "Toute une zone est touchée : la cause est un équipement commun. On contrôle le switch de l’étage (voyants, alimentation, ports) et son lien montant vers la baie, sans oublier le VLAN." },
      { from: 'Service informatique', prio: 'haute', msg: 'Les nouveaux PC reçoivent une adresse en 169.254.x.x et n’ont pas de réseau.', opts: ['Vérifier le serveur DHCP : service démarré et étendue pas pleine', 'Mettre une adresse IP fixe sur chaque poste', 'Désactiver le pare-feu de tous les postes'], ok: 0, why: "Une adresse 169.254 (APIPA) signifie qu’aucun serveur DHCP n’a répondu. On vérifie que le service tourne et qu’il reste des adresses libres dans l’étendue ; sinon, on l’agrandit ou on réduit la durée des baux." },
      { from: 'Comptabilité', prio: 'haute', msg: 'Le dossier partagé de la comptabilité est ouvert à tout le monde, même aux stagiaires.', opts: ['Supprimer le partage', "Donner un mot de passe commun à l’équipe comptable", "Revoir les droits NTFS et de partage avec un groupe Active Directory « Compta »"], ok: 2, why: "Principe du moindre privilège : chacun n’accède qu’à ce dont il a besoin. On crée un groupe AD, on donne les droits à ce groupe (partage et NTFS) et on retire « Tout le monde »." },
      { from: 'Accueil', prio: 'basse', msg: "Le fond d’écran de l’entreprise, défini par GPO, ne s’applique pas sur mon poste.", opts: ['Recréer toute la stratégie de groupe', "Vérifier l’unité d’organisation du poste, puis gpupdate /force et gpresult /r", 'Sortir le poste du domaine et le remettre'], ok: 1, why: "Une GPO s’applique selon l’unité d’organisation (OU) et le filtrage de sécurité. On vérifie où se trouve le poste, on force la mise à jour, puis gpresult /r montre les stratégies réellement appliquées." },
      { from: 'Équipe commerciale', prio: 'moyenne', msg: "L’intranet ne s’ouvre plus avec son nom, mais il marche avec son adresse IP.", opts: ['Vérifier la résolution DNS avec nslookup (enregistrement et serveur DNS du poste)', 'Redémarrer le serveur web', 'Vider seulement le cache du navigateur'], ok: 0, why: "Si l’adresse IP marche mais pas le nom, le serveur web va bien : c’est la résolution de nom. nslookup montre la réponse du DNS ; on corrige l’enregistrement ou le serveur DNS du poste, puis ipconfig /flushdns." },
      { from: 'Direction', prio: 'haute', msg: 'Le serveur de fichiers est plein à 98 %.', opts: ['Supprimer les fichiers les plus anciens sans prévenir', 'Arrêter les sauvegardes pour libérer de la place', "Analyser ce qui occupe l’espace, archiver avec les équipes, puis prévoir l’extension et des quotas"], ok: 2, why: "On mesure d’abord (outil d’analyse de l’espace disque), on informe les utilisateurs, on archive ou on nettoie avec leur accord, puis on met des quotas et on prévoit plus de stockage. On ne touche jamais aux sauvegardes." }
    ]
  }, [
    { from: 'Logistique', prio: 'moyenne', msg: 'Je ne reçois plus aucun e-mail depuis ce matin.', opts: ['Recréer son compte de messagerie', 'Vérifier si sa boîte est pleine et ses règles de tri, puis tester sur le webmail', 'Installer un autre logiciel de messagerie'], ok: 1, why: "Souvent, la boîte est pleine ou une règle de tri déplace les messages. Tester sur le webmail permet de savoir si le problème vient du poste ou du serveur." },
    { from: 'Atelier', prio: 'moyenne', msg: "Mon écran reste noir, mais l’ordinateur fait du bruit.", opts: ["Vérifier l’alimentation et le câble de l’écran, puis la source (HDMI, DisplayPort)", 'Remplacer la carte mère', 'Réinstaller le pilote graphique à distance'], ok: 0, why: "Le PC démarre : on teste d’abord le plus simple. L’écran est-il allumé, le câble bien branché des deux côtés, la bonne entrée sélectionnée ?" },
    { from: 'Ressources humaines', prio: 'critique', msg: 'Un message dit que mes fichiers sont chiffrés et demande une rançon.', opts: ['Payer la rançon pour récupérer les fichiers', 'Redémarrer pour voir si le message disparaît', 'Débrancher le poste du réseau tout de suite et prévenir la sécurité'], ok: 2, why: "C’est un rançongiciel. On isole le poste du réseau pour éviter la propagation, on ne paie pas, on prévient immédiatement la sécurité, puis on restaure depuis les sauvegardes." }
  ], 'jeu : tickets de support (support n2 : niveau avancé)');
  add('en', {
    pickSupportT: 'IT support, level 1', pickSupportD: 'Beginner: solve 5 user tickets by choosing the right diagnosis.',
    pickSupport2T: 'IT support, level 2', pickSupport2D: 'Advanced: networks, DHCP, Active Directory, DNS, access rights.',
    tkTag: (n, tot, p, lv) => `Ticket ${n}/${tot} · ${lv} · Incident · ${p} priority`,
    tkDoneTitle: (p, t, lv) => p === t ? `Level ${lv} support passed ✔` : `${p}/${t} tickets solved on the first try`,
    tkToN2: 'Go to level 2 →',
    secretNames3: { support2: 'Perfect level 2 support (5/5)' },
    ticketsN2: [
      { from: '3rd-floor manager', prio: 'high', msg: 'Nobody on the 3rd floor has network access, but the other floors are fine.', opts: ['Reinstall the 3rd-floor computers one by one', 'Check the 3rd-floor switch and its uplink to the main rack', 'Replace the internet router'], ok: 1, why: 'A whole area is affected, so the cause is shared equipment. Check the floor switch (lights, power, ports) and its uplink to the rack, and the VLAN.' },
      { from: 'IT department', prio: 'high', msg: 'New PCs get a 169.254.x.x address and have no network.', opts: ['Check the DHCP server: service running and scope not full', 'Set a static IP address on every computer', 'Turn off the firewall on all computers'], ok: 0, why: 'A 169.254 (APIPA) address means no DHCP server answered. Check the service is running and the scope still has free addresses; if not, enlarge it or shorten the lease time.' },
      { from: 'Accounting', prio: 'high', msg: "The accounting shared folder is open to everyone, even interns.", opts: ['Delete the share', 'Give the accounting team a shared password', 'Review the NTFS and share permissions with an Active Directory "Accounting" group'], ok: 2, why: 'Least privilege: everyone only gets what they need. Create an AD group, grant rights to that group (share and NTFS) and remove "Everyone".' },
      { from: 'Reception', prio: 'low', msg: "The company wallpaper, set by GPO, doesn’t apply on my computer.", opts: ['Recreate the whole Group Policy', "Check the computer’s organizational unit, then gpupdate /force and gpresult /r", 'Remove the computer from the domain and rejoin it'], ok: 1, why: 'A GPO applies according to the organizational unit (OU) and security filtering. Check where the computer is, force the update, then gpresult /r shows the policies actually applied.' },
      { from: 'Sales team', prio: 'medium', msg: "The intranet no longer opens by its name, but it works with its IP address.", opts: ["Check name resolution with nslookup (record and the computer’s DNS server)", 'Restart the web server', 'Only clear the browser cache'], ok: 0, why: "If the IP works but not the name, the web server is fine: it’s name resolution. nslookup shows the DNS answer; fix the record or the computer’s DNS server, then ipconfig /flushdns." },
      { from: 'Management', prio: 'high', msg: 'The file server is 98% full.', opts: ['Delete the oldest files without telling anyone', 'Stop backups to free up space', "Analyze what uses the space, archive with the teams, then plan more storage and quotas"], ok: 2, why: 'Measure first (disk usage analysis), inform users, archive or clean up with their agreement, then set quotas and plan more storage. Never touch the backups.' }
    ]
  }, [
    { from: 'Logistics', prio: 'medium', msg: "I haven’t received any email since this morning.", opts: ['Recreate their mail account', 'Check whether the mailbox is full and their mail rules, then test in webmail', 'Install another mail program'], ok: 1, why: 'Often the mailbox is full or a rule moves the messages. Testing in webmail shows whether the problem is the computer or the server.' },
    { from: 'Workshop', prio: 'medium', msg: 'My screen stays black, but the computer is making noise.', opts: ["Check the monitor’s power and cable, then the input (HDMI, DisplayPort)", 'Replace the motherboard', 'Reinstall the graphics driver remotely'], ok: 0, why: 'The PC starts, so test the simplest things first: is the monitor on, the cable plugged in at both ends, the right input selected?' },
    { from: 'Human resources', prio: 'critical', msg: 'A message says my files are encrypted and asks for a ransom.', opts: ['Pay the ransom to get the files back', 'Restart to see if the message goes away', 'Unplug the computer from the network right away and alert security'], ok: 2, why: "It’s ransomware. Isolate the computer from the network to stop it spreading, don’t pay, alert security immediately, then restore from backups." }
  ], 'game: support tickets (support n2: advanced level)');
  add('zh-Hans', {
    pickSupportT: '一线 IT 支持', pickSupportD: '入门：选择正确的诊断，解决 5 个用户工单。',
    pickSupport2T: '二线 IT 支持', pickSupport2D: '进阶：网络、DHCP、Active Directory、DNS、访问权限。',
    tkTag: (n, tot, p, lv) => `工单 ${n}/${tot} · ${lv} · 事件 · 优先级：${p}`,
    tkDoneTitle: (p, t, lv) => p === t ? `${lv === 2 ? '二' : '一'}线支持水平达标 ✔` : `${p}/${t} 个工单一次解决`,
    tkToN2: '进入二线（N2）→',
    secretNames3: { support2: '二线支持满分（5/5）' },
    ticketsN2: [
      { from: '3 楼负责人', prio: '高', msg: '3 楼所有人都没有网络，其他楼层正常。', opts: ['逐台重装 3 楼的电脑', '检查 3 楼的交换机及其到主机柜的上行链路', '更换互联网路由器'], ok: 1, why: '整片区域受影响，原因在公共设备。检查楼层交换机（指示灯、电源、端口）及其到机柜的上行链路，还有 VLAN。' },
      { from: 'IT 部门', prio: '高', msg: '新电脑拿到 169.254.x.x 的地址，没有网络。', opts: ['检查 DHCP 服务器：服务是否运行、作用域是否已满', '给每台电脑设置固定 IP', '关闭所有电脑的防火墙'], ok: 0, why: '169.254（APIPA）地址说明没有 DHCP 服务器应答。确认服务在运行、作用域里还有空闲地址；否则扩大作用域或缩短租期。' },
      { from: '财务部', prio: '高', msg: '财务共享文件夹所有人都能访问，连实习生也可以。', opts: ['删除这个共享', '给财务团队一个共用密码', '用 Active Directory“财务”组重新设置 NTFS 和共享权限'], ok: 2, why: '最小权限原则：每个人只能访问工作所需。创建 AD 组，把权限（共享和 NTFS）授予该组，并移除“Everyone”。' },
      { from: '前台', prio: '低', msg: '公司用 GPO 设置的桌面壁纸在我电脑上没有生效。', opts: ['重新创建整个组策略', '检查电脑所在的组织单位，再运行 gpupdate /force 和 gpresult /r', '把电脑退出域再重新加入'], ok: 1, why: 'GPO 按组织单位（OU）和安全筛选生效。先确认电脑所在位置，强制更新，再用 gpresult /r 查看实际应用的策略。' },
      { from: '销售团队', prio: '中', msg: '内网用名称打不开了，但用 IP 地址可以。', opts: ['用 nslookup 检查域名解析（记录和电脑的 DNS 服务器）', '重启 Web 服务器', '只清除浏览器缓存'], ok: 0, why: 'IP 能用而名称不行，说明 Web 服务器正常，问题在名称解析。nslookup 显示 DNS 应答；修正记录或电脑的 DNS 服务器，再执行 ipconfig /flushdns。' },
      { from: '管理层', prio: '高', msg: '文件服务器已经用了 98%。', opts: ['不通知任何人，直接删掉最旧的文件', '停止备份来腾出空间', '分析空间占用，与各团队一起归档，再规划扩容和配额'], ok: 2, why: '先测量（磁盘空间分析），通知用户，经同意后归档或清理，再设置配额并规划扩容。绝不要动备份。' }
    ]
  }, [
    { from: '物流部', prio: '中', msg: '从今天早上起我收不到任何邮件。', opts: ['重新创建他的邮箱账户', '检查邮箱是否已满和收件规则，再在网页邮箱里测试', '安装另一个邮件软件'], ok: 1, why: '常见原因是邮箱满了，或者某条规则把邮件移走了。在网页邮箱测试，可以判断问题出在电脑还是服务器。' },
    { from: '车间', prio: '中', msg: '我的屏幕一直是黑的，但电脑有声音。', opts: ['检查显示器电源和线缆，再检查输入源（HDMI、DisplayPort）', '更换主板', '远程重装显卡驱动'], ok: 0, why: '电脑能启动：先测最简单的。显示器开了吗？线两头插好了吗？输入源选对了吗？' },
    { from: '人力资源部', prio: '紧急', msg: '一条消息说我的文件被加密了，要求支付赎金。', opts: ['支付赎金取回文件', '重启看看消息会不会消失', '立即断开电脑网络并通知安全团队'], ok: 2, why: '这是勒索软件。先把电脑从网络隔离，防止扩散；不要付钱；立即通知安全团队；再从备份恢复。' }
  ], '游戏：技术支持工单（support n2：进阶）');
  add('zh-Hant', {
    pickSupportT: '第一線 IT 支援', pickSupportD: '入門：選出正確的診斷，解決 5 張使用者工單。',
    pickSupport2T: '第二線 IT 支援', pickSupport2D: '進階：網路、DHCP、Active Directory、DNS、存取權限。',
    tkTag: (n, tot, p, lv) => `工單 ${n}/${tot} · ${lv} · 事件 · 優先順序：${p}`,
    tkDoneTitle: (p, t, lv) => p === t ? `第${lv === 2 ? '二' : '一'}線支援程度達標 ✔` : `${p}/${t} 張工單一次解決`,
    tkToN2: '進入第二線（N2）→',
    secretNames3: { support2: '第二線支援滿分（5/5）' },
    ticketsN2: [
      { from: '3 樓主管', prio: '高', msg: '3 樓所有人都沒有網路，其他樓層正常。', opts: ['逐台重灌 3 樓的電腦', '檢查 3 樓的交換器及其連到主機櫃的上行鏈路', '更換網路路由器'], ok: 1, why: '整個區域受影響，原因在共用設備。檢查樓層交換器（燈號、電源、連接埠）及其連到機櫃的上行鏈路，還有 VLAN。' },
      { from: '資訊部', prio: '高', msg: '新電腦拿到 169.254.x.x 的位址，沒有網路。', opts: ['檢查 DHCP 伺服器：服務是否執行、範圍是否已滿', '為每台電腦設定固定 IP', '關閉所有電腦的防火牆'], ok: 0, why: '169.254（APIPA）位址代表沒有 DHCP 伺服器回應。確認服務正在執行、範圍內還有可用位址；否則擴大範圍或縮短租約時間。' },
      { from: '會計部', prio: '高', msg: '會計的共用資料夾所有人都能存取，連實習生也可以。', opts: ['刪除這個共用', '給會計團隊一組共用密碼', '用 Active Directory「會計」群組重新設定 NTFS 和共用權限'], ok: 2, why: '最小權限原則：每個人只能存取工作所需。建立 AD 群組，把權限（共用和 NTFS）授予該群組，並移除「Everyone」。' },
      { from: '櫃台', prio: '低', msg: '公司用 GPO 設定的桌布在我的電腦上沒有套用。', opts: ['重新建立整個群組原則', '檢查電腦所在的組織單位，再執行 gpupdate /force 和 gpresult /r', '把電腦退出網域再重新加入'], ok: 1, why: 'GPO 依組織單位（OU）和安全性篩選套用。先確認電腦位置，強制更新，再用 gpresult /r 查看實際套用的原則。' },
      { from: '業務團隊', prio: '中', msg: '內部網站用名稱打不開了，但用 IP 位址可以。', opts: ['用 nslookup 檢查名稱解析（紀錄和電腦的 DNS 伺服器）', '重新啟動 Web 伺服器', '只清除瀏覽器快取'], ok: 0, why: 'IP 可用但名稱不行，代表 Web 伺服器正常，問題在名稱解析。nslookup 會顯示 DNS 回應；修正紀錄或電腦的 DNS 伺服器，再執行 ipconfig /flushdns。' },
      { from: '管理層', prio: '高', msg: '檔案伺服器已經用了 98%。', opts: ['不通知任何人，直接刪除最舊的檔案', '停止備份來釋出空間', '分析空間占用，與各團隊一起封存，再規劃擴充和配額'], ok: 2, why: '先量測（磁碟空間分析），通知使用者，經同意後封存或清理，再設定配額並規劃擴充。絕不要動備份。' }
    ]
  }, [
    { from: '物流部', prio: '中', msg: '從今天早上起我收不到任何郵件。', opts: ['重新建立他的郵件帳號', '檢查信箱是否已滿和郵件規則，再用網頁郵件測試', '安裝另一個郵件軟體'], ok: 1, why: '常見原因是信箱滿了，或某條規則把郵件移走了。用網頁郵件測試，可以判斷問題在電腦還是伺服器。' },
    { from: '工廠', prio: '中', msg: '我的螢幕一直是黑的，但電腦有聲音。', opts: ['檢查螢幕電源和線材，再檢查輸入來源（HDMI、DisplayPort）', '更換主機板', '遠端重灌顯示卡驅動程式'], ok: 0, why: '電腦能開機：先測最簡單的。螢幕開了嗎？線兩端插好了嗎？輸入來源選對了嗎？' },
    { from: '人力資源部', prio: '緊急', msg: '一則訊息說我的檔案被加密了，要求支付贖金。', opts: ['支付贖金取回檔案', '重新開機看看訊息會不會消失', '立刻拔掉電腦網路並通知資安團隊'], ok: 2, why: '這是勒索軟體。先把電腦從網路隔離，避免擴散；不要付錢；立刻通知資安團隊；再從備份還原。' }
  ], '遊戲：技術支援工單（support n2：進階）');
  add('yue', {
    pickSupportT: '第一線 IT 支援', pickSupportD: '入門：揀啱診斷方法，解決 5 張用戶工單。',
    pickSupport2T: '第二線 IT 支援', pickSupport2D: '進階：網絡、DHCP、Active Directory、DNS、存取權限。',
    tkTag: (n, tot, p, lv) => `工單 ${n}/${tot} · ${lv} · 事故 · 優先程度：${p}`,
    tkDoneTitle: (p, t, lv) => p === t ? `第${lv === 2 ? '二' : '一'}線支援合格 ✔` : `${p}/${t} 張工單一次過解決`,
    tkToN2: '升上第二線（N2）→',
    secretNames3: { support2: '第二線支援滿分（5/5）' },
    ticketsN2: [
      { from: '3 樓主管', prio: '高', msg: '3 樓個個都冇網，其他樓層就冇事。', opts: ['逐部重裝 3 樓啲電腦', '檢查 3 樓部交換機同佢去主機櫃條上行線', '換過部上網路由器'], ok: 1, why: '成個區域受影響，問題喺共用設備。檢查樓層交換機（燈號、電源、端口）同佢去機櫃條上行線，仲有 VLAN。' },
      { from: 'IT 部', prio: '高', msg: '新電腦攞到 169.254.x.x 嘅地址，冇網。', opts: ['檢查 DHCP 伺服器：服務有冇行緊、範圍滿咗未', '幫每部電腦設定固定 IP', '閂晒所有電腦嘅防火牆'], ok: 0, why: '169.254（APIPA）地址即係冇 DHCP 伺服器回應。確認服務行緊、範圍仲有空地址；唔係就擴大範圍或者縮短租期。' },
      { from: '會計部', prio: '高', msg: '會計個共用資料夾個個都入到，連實習生都得。', opts: ['刪咗個共用', '俾會計團隊一個共用密碼', '用 Active Directory「會計」群組重新設定 NTFS 同共用權限'], ok: 2, why: '最少權限原則：每個人只可以用返工作需要嘅嘢。開一個 AD 群組，將權限（共用同 NTFS）俾呢個群組，再刪走「Everyone」。' },
      { from: '接待處', prio: '低', msg: '公司用 GPO 設定嘅桌布喺我部電腦冇生效。', opts: ['重新整過成個群組原則', '檢查部電腦喺邊個組織單位，再行 gpupdate /force 同 gpresult /r', '將部電腦退出網域再加返入去'], ok: 1, why: 'GPO 係跟組織單位（OU）同安全篩選嚟生效。先睇部電腦喺邊，強制更新，再用 gpresult /r 睇實際套用咗邊啲原則。' },
      { from: '營業團隊', prio: '中', msg: '內聯網用個名打唔開，但用 IP 地址就得。', opts: ['用 nslookup 檢查名稱解析（紀錄同電腦嘅 DNS 伺服器）', '重啟網頁伺服器', '淨係清瀏覽器快取'], ok: 0, why: 'IP 得但個名唔得，即係網頁伺服器冇事，問題喺名稱解析。nslookup 會顯示 DNS 回應；改好紀錄或者電腦嘅 DNS 伺服器，再行 ipconfig /flushdns。' },
      { from: '管理層', prio: '高', msg: '檔案伺服器用咗 98%。', opts: ['唔話俾人知，直接刪走最舊嘅檔案', '停咗備份嚟騰位', '分析邊啲嘢食晒位，同各團隊一齊封存，再計劃擴充同配額'], ok: 2, why: '先量度（磁碟空間分析），通知用戶，經佢哋同意先封存或者清理，再設定配額同計劃擴充。千祈唔好掂備份。' }
    ]
  }, [
    { from: '物流部', prio: '中', msg: '由今朝開始我一封電郵都收唔到。', opts: ['重新開過佢個郵箱戶口', '檢查郵箱爆咗未同郵件規則，再用網頁郵箱試吓', '裝過另一個郵件程式'], ok: 1, why: '通常係郵箱爆咗，或者有條規則將郵件搬走咗。用網頁郵箱試吓，就知問題喺電腦定伺服器。' },
    { from: '工場', prio: '中', msg: '我個螢幕一直黑晒，但部電腦有聲。', opts: ['檢查螢幕電源同條線，再睇輸入來源（HDMI、DisplayPort）', '換過塊主機板', '遙距重裝顯示卡驅動程式'], ok: 0, why: '部電腦開到機：先試最簡單嘅。螢幕開咗未？條線兩頭插好未？輸入來源揀啱未？' },
    { from: '人力資源部', prio: '緊急', msg: '有個訊息話我啲檔案俾人加密咗，要我俾贖金。', opts: ['俾贖金攞返啲檔案', '重啟睇吓個訊息會唔會走', '即刻拔走部電腦條網線，再通知資安團隊'], ok: 2, why: '呢個係勒索軟件。先將部電腦同網絡隔離，避免擴散；唔好俾錢；即刻通知資安團隊；再由備份還原。' }
  ], '遊戲：技術支援工單（support n2：進階）');
  add('ko', {
    pickSupportT: '1선 IT 지원', pickSupportD: '초급: 올바른 진단을 골라 사용자 티켓 5개를 해결하세요.',
    pickSupport2T: '2선 IT 지원', pickSupport2D: '고급: 네트워크, DHCP, Active Directory, DNS, 접근 권한.',
    tkTag: (n, tot, p, lv) => `티켓 ${n}/${tot} · ${lv} · 장애 · 우선순위 ${p}`,
    tkDoneTitle: (p, t, lv) => p === t ? `${lv}선 지원 통과 ✔` : `티켓 ${p}/${t}개를 한 번에 해결`,
    tkToN2: '2선(N2)으로 →',
    secretNames3: { support2: '2선 지원 만점 (5/5)' },
    ticketsN2: [
      { from: '3층 책임자', prio: '높음', msg: '3층 전체가 네트워크가 안 되고, 다른 층은 괜찮아요.', opts: ['3층 PC를 한 대씩 재설치', '3층 스위치와 메인 랙으로 가는 업링크 확인', '인터넷 공유기 교체'], ok: 1, why: '한 구역 전체가 영향을 받으므로 원인은 공용 장비입니다. 층 스위치(표시등, 전원, 포트)와 랙으로 가는 업링크, VLAN을 확인합니다.' },
      { from: 'IT 부서', prio: '높음', msg: '새 PC가 169.254.x.x 주소를 받고 네트워크가 안 돼요.', opts: ['DHCP 서버 확인: 서비스 실행 여부와 범위 포화 여부', '모든 PC에 고정 IP 설정', '모든 PC의 방화벽 끄기'], ok: 0, why: '169.254(APIPA) 주소는 DHCP 서버가 응답하지 않았다는 뜻입니다. 서비스가 실행 중인지, 범위에 남은 주소가 있는지 확인하고, 없으면 범위를 넓히거나 임대 기간을 줄입니다.' },
      { from: '회계팀', prio: '높음', msg: '회계팀 공유 폴더에 인턴까지 모두 접근할 수 있어요.', opts: ['공유 삭제', '회계팀에 공용 비밀번호 제공', 'Active Directory "회계" 그룹으로 NTFS 및 공유 권한 재설정'], ok: 2, why: '최소 권한 원칙: 각자 필요한 것만 접근합니다. AD 그룹을 만들어 그 그룹에 권한(공유, NTFS)을 주고 "Everyone"을 제거합니다.' },
      { from: '안내데스크', prio: '낮음', msg: 'GPO로 설정한 회사 바탕화면이 제 PC에 적용되지 않아요.', opts: ['그룹 정책 전체 다시 만들기', 'PC의 조직 단위를 확인한 뒤 gpupdate /force와 gpresult /r 실행', 'PC를 도메인에서 뺐다가 다시 가입'], ok: 1, why: 'GPO는 조직 단위(OU)와 보안 필터링에 따라 적용됩니다. PC 위치를 확인하고 강제 업데이트한 뒤, gpresult /r로 실제 적용된 정책을 봅니다.' },
      { from: '영업팀', prio: '보통', msg: '인트라넷이 이름으로는 안 열리고 IP 주소로는 열려요.', opts: ['nslookup으로 이름 확인 점검 (레코드와 PC의 DNS 서버)', '웹 서버 재시작', '브라우저 캐시만 삭제'], ok: 0, why: 'IP는 되고 이름이 안 되면 웹 서버는 정상이고 이름 확인이 문제입니다. nslookup으로 DNS 응답을 보고, 레코드나 PC의 DNS 서버를 고친 뒤 ipconfig /flushdns를 실행합니다.' },
      { from: '경영진', prio: '높음', msg: '파일 서버 사용량이 98%예요.', opts: ['알리지 않고 가장 오래된 파일 삭제', '공간 확보를 위해 백업 중단', '공간 사용을 분석하고 팀과 함께 보관한 뒤 증설과 할당량 계획'], ok: 2, why: '먼저 측정(디스크 사용량 분석)하고, 사용자에게 알리고, 동의를 받아 보관하거나 정리한 뒤 할당량을 정하고 증설을 계획합니다. 백업은 절대 건드리지 않습니다.' }
    ]
  }, [
    { from: '물류팀', prio: '보통', msg: '오늘 아침부터 메일이 하나도 안 와요.', opts: ['메일 계정 다시 만들기', '메일함이 꽉 찼는지와 메일 규칙을 확인하고 웹메일에서 테스트', '다른 메일 프로그램 설치'], ok: 1, why: '흔히 메일함이 가득 찼거나 규칙이 메일을 옮깁니다. 웹메일에서 테스트하면 문제가 PC인지 서버인지 알 수 있습니다.' },
    { from: '작업장', prio: '보통', msg: '화면은 까만데 컴퓨터에서는 소리가 나요.', opts: ['모니터 전원과 케이블, 입력 소스(HDMI, DisplayPort) 확인', '메인보드 교체', '원격으로 그래픽 드라이버 재설치'], ok: 0, why: 'PC는 켜집니다. 가장 간단한 것부터: 모니터가 켜져 있는지, 케이블 양쪽이 잘 꽂혔는지, 입력이 맞는지 확인합니다.' },
    { from: '인사팀', prio: '긴급', msg: '파일이 암호화됐다며 몸값을 요구하는 메시지가 떠요.', opts: ['몸값을 내고 파일 복구', '재시작해서 메시지가 사라지는지 보기', '즉시 PC를 네트워크에서 분리하고 보안팀에 알리기'], ok: 2, why: '랜섬웨어입니다. 확산을 막기 위해 네트워크에서 격리하고, 돈을 내지 말고, 즉시 보안팀에 알린 뒤 백업에서 복원합니다.' }
  ], '게임: 지원 티켓 (support n2: 고급)');
  for (const k in L) if (L[k].secretNames && L[k].secretNames3) Object.assign(L[k].secretNames, L[k].secretNames3);
})(window.JG_I18N || {});

/* Lot 5 : notes externes, heure du visiteur, temps de chargement, htop, IP non collectée */
(function (L) {
  const add = (k, o, ipL, secret, help) => { if (!L[k]) return; Object.assign(L[k], o); if (L[k].devLabels) L[k].devLabels.ip = ipL; if (L[k].secretNames) L[k].secretNames.htop = secret; if (L[k].tHelp && !L[k].tHelp.some(h => h[0] === 'htop')) L[k].tHelp.splice(L[k].tHelp.length - 2, 0, ['htop', help]); };
  add('fr', { localTime: (v, c) => `Chez vous : ${v} (${c})`, scoresTitle: 'Notes obtenues le 28 octobre 2026, vérifiables en un clic', extTitle: 'Notes des outils externes', loadedIn: v => `⚡ chargée en ${v} s`, mb: 'Mo',
    htopL: { fps: 'Images/s', nodes: 'Nœuds réseau', packets: 'Paquets', mem: 'Mémoire JS', weight: 'Poids chargé', up: 'Temps sur la page', cpu: 'Cœurs' }, ipNot: 'non collectée, par principe 🔒' }, 'Adresse IP', 'htop découvert', 'moniteur : FPS, mémoire, réseau');
  add('en', { localTime: (v, c) => `Your time: ${v} (${c})`, scoresTitle: 'Grades obtained on 28 October 2026, verifiable in one click', extTitle: 'Grades from external tools', loadedIn: v => `⚡ loaded in ${v} s`, mb: 'MB',
    htopL: { fps: 'Frames/s', nodes: 'Network nodes', packets: 'Packets', mem: 'JS memory', weight: 'Loaded weight', up: 'Time on page', cpu: 'Cores' }, ipNot: 'not collected, on principle 🔒' }, 'IP address', 'htop discovered', 'monitor: FPS, memory, network');
  add('zh-Hans', { localTime: (v, c) => `您的时间：${v}（${c}）`, scoresTitle: '2026 年 10 月 28 日获得的评分，一键即可核实', extTitle: '外部工具评分', loadedIn: v => `⚡ ${v} 秒加载完成`, mb: 'MB',
    htopL: { fps: '帧率', nodes: '网络节点', packets: '数据包', mem: 'JS 内存', weight: '已加载大小', up: '停留时间', cpu: '核心' }, ipNot: '按原则不收集 🔒' }, 'IP 地址', '发现了 htop', '监视器：帧率、内存、网络');
  add('zh-Hant', { localTime: (v, c) => `您的時間：${v}（${c}）`, scoresTitle: '2026 年 10 月 28 日取得的評分，一鍵即可查證', extTitle: '外部工具評分', loadedIn: v => `⚡ ${v} 秒載入完成`, mb: 'MB',
    htopL: { fps: '影格率', nodes: '網路節點', packets: '封包', mem: 'JS 記憶體', weight: '已載入大小', up: '停留時間', cpu: '核心' }, ipNot: '基於原則不收集 🔒' }, 'IP 位址', '發現了 htop', '監視器：影格率、記憶體、網路');
  add('yue', { localTime: (v, c) => `你嗰邊：${v}（${c}）`, scoresTitle: '2026 年 10 月 28 日攞到嘅評分，撳一下就可以核實', extTitle: '外部工具評分', loadedIn: v => `⚡ ${v} 秒載入完`, mb: 'MB',
    htopL: { fps: '幀率', nodes: '網絡節點', packets: '封包', mem: 'JS 記憶體', weight: '載入咗嘅大細', up: '停留時間', cpu: '核心' }, ipNot: '原則上唔收集 🔒' }, 'IP 地址', '發現咗 htop', '監察器：幀率、記憶體、網絡');
  add('ko', { localTime: (v, c) => `현지 시간: ${v} (${c})`, scoresTitle: '2026년 10월 28일 받은 점수, 클릭 한 번으로 확인 가능', extTitle: '외부 도구 점수', loadedIn: v => `⚡ ${v}초 만에 로드`, mb: 'MB',
    htopL: { fps: '초당 프레임', nodes: '네트워크 노드', packets: '패킷', mem: 'JS 메모리', weight: '로드된 용량', up: '머문 시간', cpu: '코어' }, ipNot: '원칙상 수집하지 않음 🔒' }, 'IP 주소', 'htop 발견', '모니터: FPS, 메모리, 네트워크');
})(window.JG_I18N || {});

/* Lot 6 : liens de la supervision (page de statut, code source), lignes CAA et méthodes HTTP */
(function (L) {
  const add = (k, o, caa, methods) => { if (!L[k]) return; Object.assign(L[k], o); if (L[k].supLabels) Object.assign(L[k].supLabels, { caa, methods }); };
  add('fr', { supLiveLink: 'Disponibilité en direct (UptimeRobot) ↗', supCodeLink: 'Code source sur GitHub ↗', supExtNote: 'Liens vers des sites externes, qui ont leurs propres règles de confidentialité.', supReadOnly: 'lecture seule' }, 'Certificats autorisés (CAA)', 'Méthodes HTTP');
  add('en', { supLiveLink: 'Live uptime (UptimeRobot) ↗', supCodeLink: 'Source code on GitHub ↗', supExtNote: 'Links to external sites, which have their own privacy policies.', supReadOnly: 'read-only' }, 'Allowed certificates (CAA)', 'HTTP methods');
  add('zh-Hans', { supLiveLink: '实时可用性（UptimeRobot）↗', supCodeLink: 'GitHub 上的源代码 ↗', supExtNote: '指向外部网站的链接，这些网站有各自的隐私政策。', supReadOnly: '只读' }, '允许的证书（CAA）', 'HTTP 方法');
  add('zh-Hant', { supLiveLink: '即時可用性（UptimeRobot）↗', supCodeLink: 'GitHub 上的原始碼 ↗', supExtNote: '指向外部網站的連結，這些網站有各自的隱私權政策。', supReadOnly: '唯讀' }, '允許的憑證（CAA）', 'HTTP 方法');
  add('yue', { supLiveLink: '即時運作狀態（UptimeRobot）↗', supCodeLink: 'GitHub 上面嘅原始碼 ↗', supExtNote: '連去外部網站，佢哋有自己嘅私隱政策。', supReadOnly: '淨係讀' }, '准許嘅證書（CAA）', 'HTTP 方法');
  add('ko', { supLiveLink: '실시간 가동 상태 (UptimeRobot) ↗', supCodeLink: 'GitHub 소스 코드 ↗', supExtNote: '자체 개인정보 처리방침이 있는 외부 사이트로 연결됩니다.', supReadOnly: '읽기 전용' }, '허용된 인증서 (CAA)', 'HTTP 메서드');
})(window.JG_I18N || {});

/* Lot 7 : titre accessible de la visite guidée */
(function (L) {
  const T = { fr: 'Visite guidée', en: 'Guided tour', 'zh-Hans': '导览', 'zh-Hant': '導覽', yue: '導賞', ko: '둘러보기' };
  for (const k in T) if (L[k]) L[k].tourTitle = T[k];
})(window.JG_I18N || {});

/* Lot 8 : webmails dans « Me contacter », vue recruteur sur une page, impression, accessibilité, nouvelles commandes */
(function (L) {
  const add = (k, o, h) => {
    if (!L[k]) return; Object.assign(L[k], o);
    const H = L[k].tHelp; if (!H) return;
    const set = (cmd, key, desc) => { const e = H.find(x => x[0] === cmd); if (e) { e[0] = key; e[1] = desc; } };
    set('whoami', 'whoami [--long]', h.who); set('contact', 'contact [gmail…]', h.contact);
    const at = H.findIndex(x => x[0] === 'clear');
    H.splice(at < 0 ? H.length : at, 0, ['cv', h.cv], ['print', h.print], ['a11y', h.a11y]);
  };
  add('fr', { wmLabel: 'Écrire en un clic avec :', wmPro: 'Outlook pro', wmNote: "Le message s’ouvre déjà rempli dans votre compte. Rien ne passe par ce site.",
    recProfile: 'Profil', recAreas: 'Domaines', recContactH: 'Contact', recPrint: 'Imprimer ou PDF', recExit: '← Version animée', recPrintNote: 'Version interactive, jeux et démonstrations :', recOpen: 'Vue sur une page',
    tWmOpen: n => `Ouverture de ${n}…`, tWmHint: 'Astuce : contact gmail, contact outlook, contact pro ou contact yahoo ouvre un message prêt.', tRecOpen: 'Ouverture de la vue recruteur…', tPrint: 'Impression de la fiche…', a11yLink: 'Accessibilité' },
    { who: 'qui êtes-vous ? (--long : le profil)', contact: 'e-mail (ajoutez gmail, outlook, pro ou yahoo)', cv: 'fiche recruteur sur une page', print: "imprimer la fiche ou l’enregistrer en PDF", a11y: "déclaration d’accessibilité" });
  add('en', { wmLabel: 'Write in one click with:', wmPro: 'Outlook work', wmNote: 'The message opens pre-filled in your own account. Nothing goes through this site.',
    recProfile: 'Profile', recAreas: 'Areas', recContactH: 'Contact', recPrint: 'Print or PDF', recExit: '← Animated version', recPrintNote: 'Interactive version, games and demos:', recOpen: 'One-page view',
    tWmOpen: n => `Opening ${n}…`, tWmHint: 'Tip: contact gmail, contact outlook, contact pro or contact yahoo opens a ready-made message.', tRecOpen: 'Opening the recruiter view…', tPrint: 'Printing the profile…', a11yLink: 'Accessibility' },
    { who: 'who are you? (--long: profile)', contact: 'email (add gmail, outlook, pro or yahoo)', cv: 'one-page recruiter profile', print: 'print the profile or save it as PDF', a11y: 'accessibility statement' });
  add('zh-Hans', { wmLabel: '一键写信：', wmPro: 'Outlook 工作版', wmNote: '邮件会在您自己的账户中预先填好打开，不经过本网站。',
    recProfile: '简介', recAreas: '领域', recContactH: '联系方式', recPrint: '打印或 PDF', recExit: '← 动画版', recPrintNote: '互动版、游戏和演示：', recOpen: '单页视图',
    tWmOpen: n => `正在打开 ${n}…`, tWmHint: '提示：contact gmail、contact outlook、contact pro 或 contact yahoo 可打开预先填好的邮件。', tRecOpen: '正在打开招聘者视图…', tPrint: '正在打印简介…', a11yLink: '无障碍' },
    { who: '你是谁？（--long：简介）', contact: '电子邮件（可加 gmail、outlook、pro 或 yahoo）', cv: '单页招聘者简介', print: '打印简介或保存为 PDF', a11y: '无障碍声明' });
  add('zh-Hant', { wmLabel: '一鍵寫信：', wmPro: 'Outlook 工作版', wmNote: '郵件會在您自己的帳戶中預先填好開啟，不經過本網站。',
    recProfile: '簡介', recAreas: '領域', recContactH: '聯絡方式', recPrint: '列印或 PDF', recExit: '← 動畫版', recPrintNote: '互動版、遊戲與示範：', recOpen: '單頁檢視',
    tWmOpen: n => `正在開啟 ${n}…`, tWmHint: '提示：contact gmail、contact outlook、contact pro 或 contact yahoo 可開啟預先填好的郵件。', tRecOpen: '正在開啟招募者檢視…', tPrint: '正在列印簡介…', a11yLink: '無障礙' },
    { who: '你是誰？（--long：簡介）', contact: '電子郵件（可加 gmail、outlook、pro 或 yahoo）', cv: '單頁招募者簡介', print: '列印簡介或儲存為 PDF', a11y: '無障礙聲明' });
  add('yue', { wmLabel: '撳一下就寫信：', wmPro: 'Outlook 公司版', wmNote: '封信會喺你自己個戶口度預先填好打開，唔會經過呢個網站。',
    recProfile: '簡介', recAreas: '範疇', recContactH: '聯絡', recPrint: '打印或者 PDF', recExit: '← 動畫版', recPrintNote: '互動版、遊戲同示範：', recOpen: '單頁版',
    tWmOpen: n => `開緊 ${n}…`, tWmHint: '貼士：contact gmail、contact outlook、contact pro 或者 contact yahoo 會打開預先寫好嘅信。', tRecOpen: '開緊招聘版…', tPrint: '打印緊簡介…', a11yLink: '無障礙' },
    { who: '你係邊個？（--long：簡介）', contact: '電郵（可以加 gmail、outlook、pro 或者 yahoo）', cv: '單頁招聘簡介', print: '打印簡介或者存做 PDF', a11y: '無障礙聲明' });
  add('ko', { wmLabel: '클릭 한 번으로 메일 쓰기:', wmPro: 'Outlook 업무용', wmNote: '메시지가 내 계정에서 미리 작성된 상태로 열립니다. 이 사이트를 거치지 않습니다.',
    recProfile: '프로필', recAreas: '분야', recContactH: '연락처', recPrint: '인쇄 또는 PDF', recExit: '← 애니메이션 버전', recPrintNote: '인터랙티브 버전, 게임, 데모:', recOpen: '한 페이지 보기',
    tWmOpen: n => `${n} 여는 중…`, tWmHint: '팁: contact gmail, contact outlook, contact pro, contact yahoo로 미리 작성된 메일을 엽니다.', tRecOpen: '채용 담당자용 보기를 여는 중…', tPrint: '프로필 인쇄 중…', a11yLink: '접근성' },
    { who: '당신은 누구? (--long: 프로필)', contact: '이메일 (gmail, outlook, pro, yahoo 추가 가능)', cv: '한 페이지 채용 프로필', print: '프로필 인쇄 또는 PDF 저장', a11y: '접근성 선언' });
})(window.JG_I18N);

/* Lot 9 : aucune messagerie installée sur l'ordinateur */
(function (L) {
  const T = {"fr": "Aucune messagerie ne s’est ouverte : choisissez Gmail ou Outlook ci-dessus, ou copiez l’adresse.", "en": "No mail app opened: choose Gmail or Outlook above, or copy the address.", "zh-Hans": "没有打开邮件应用：请选择上方的 Gmail 或 Outlook，或复制邮箱地址。", "zh-Hant": "沒有開啟郵件應用程式：請選擇上方的 Gmail 或 Outlook，或複製電郵地址。", "yue": "冇郵件程式打開到：揀上面嘅 Gmail 或者 Outlook，或者複製個地址。", "ko": "메일 앱이 열리지 않았습니다. 위의 Gmail 또는 Outlook을 선택하거나 주소를 복사하세요."};
  for (const k in T) if (L[k]) L[k].mailNone = T[k];
})(window.JG_I18N || {});

/* Lot 11 : secret « terminal rétro » */
(function (L) {
  const T = {
    fr: ['Écran vert phosphore', 'Tapez retro pour revenir aux couleurs normales.', 'Couleurs normales rétablies.'],
    en: ['Green phosphor screen', 'Type retro to go back to normal colours.', 'Normal colours restored.'],
    'zh-Hans': ['绿色荧光屏', '输入 retro 恢复正常颜色。', '已恢复正常颜色。'],
    'zh-Hant': ['綠色螢光螢幕', '輸入 retro 恢復正常顏色。', '已恢復正常顏色。'],
    yue: ['綠色螢光幕', '打 retro 就可以變返正常顏色。', '已經變返正常顏色。'],
    ko: ['녹색 형광 화면', 'retro를 입력하면 원래 색으로 돌아갑니다.', '원래 색으로 돌아왔습니다.']
  };
  for (const k in T) if (L[k]) { if (L[k].secretNames) L[k].secretNames.retro = T[k][0]; L[k].tRetroOn = T[k][1]; L[k].tRetroOff = T[k][2]; }
})(window.JG_I18N || {});

/* Lot 12 : journal « Quoi de neuf » et disponibilité sur 30 jours */
(function (L) {
  const T = {
    fr: { newsLink: 'Nouveautés', newsTitle: 'Quoi de neuf', newsSub: 'Les dernières évolutions du site', newsGh: 'Tout l’historique sur GitHub ↗', newsEmpty: 'Le journal sera disponible à la prochaine mise en ligne.',
      newsTags: { new: 'Nouveau', fix: 'Correction', perf: 'Vitesse', sec: 'Sécurité', misc: 'Amélioration' }, uptime: 'Disponibilité 30 jours',
      supBars30: 'il y a 30 jours', supBarsToday: 'aujourd’hui', supBarsAria: n => `Disponibilité jour par jour, ${n} jours mesurés`, help: 'journal des nouveautés' },
    en: { newsLink: 'What’s new', newsTitle: 'What’s new', newsSub: 'The latest changes to the site', newsGh: 'Full history on GitHub ↗', newsEmpty: 'The log will be available after the next update.',
      newsTags: { new: 'New', fix: 'Fix', perf: 'Speed', sec: 'Security', misc: 'Improvement' }, uptime: 'Uptime, 30 days',
      supBars30: '30 days ago', supBarsToday: 'today', supBarsAria: n => `Day-by-day uptime, ${n} days measured`, help: 'what’s new on the site' },
    'zh-Hans': { newsLink: '更新日志', newsTitle: '最新动态', newsSub: '网站最近的更新', newsGh: '在 GitHub 查看完整历史 ↗', newsEmpty: '下次发布后即可查看更新日志。',
      newsTags: { new: '新增', fix: '修复', perf: '提速', sec: '安全', misc: '改进' }, uptime: '30 天可用率',
      supBars30: '30 天前', supBarsToday: '今天', supBarsAria: n => `每日可用率，已记录 ${n} 天`, help: '更新日志' },
    'zh-Hant': { newsLink: '更新日誌', newsTitle: '最新動態', newsSub: '網站最近的更新', newsGh: '在 GitHub 查看完整歷史 ↗', newsEmpty: '下次發布後即可查看更新日誌。',
      newsTags: { new: '新增', fix: '修正', perf: '加速', sec: '安全', misc: '改進' }, uptime: '30 天可用率',
      supBars30: '30 天前', supBarsToday: '今天', supBarsAria: n => `每日可用率，已記錄 ${n} 天`, help: '更新日誌' },
    yue: { newsLink: '更新紀錄', newsTitle: '最新消息', newsSub: '網站最近嘅更新', newsGh: '喺 GitHub 睇晒所有紀錄 ↗', newsEmpty: '下次更新網站之後就睇到。',
      newsTags: { new: '新功能', fix: '修正', perf: '加快', sec: '安全', misc: '改善' }, uptime: '30 日可用率',
      supBars30: '30 日前', supBarsToday: '今日', supBarsAria: n => `每日可用率，記錄咗 ${n} 日`, help: '更新紀錄' },
    ko: { newsLink: '새 소식', newsTitle: '새 소식', newsSub: '사이트의 최근 변경 사항', newsGh: 'GitHub에서 전체 기록 보기 ↗', newsEmpty: '다음 업데이트 후 기록을 볼 수 있습니다.',
      newsTags: { new: '새 기능', fix: '수정', perf: '속도', sec: '보안', misc: '개선' }, uptime: '30일 가동률',
      supBars30: '30일 전', supBarsToday: '오늘', supBarsAria: n => `일별 가동률, ${n}일 측정됨`, help: '새 소식' }
  };
  for (const k in T) {
    if (!L[k]) continue; const { uptime, help, ...o } = T[k]; Object.assign(L[k], o);
    if (L[k].supLabels) L[k].supLabels.uptime = uptime;
    const H = L[k].tHelp; if (H && !H.some(h => h[0] === 'changelog')) { const at = H.findIndex(x => x[0] === 'print'); H.splice(at < 0 ? H.length : at, 0, ['changelog', help]); }
  }
})(window.JG_I18N || {});
