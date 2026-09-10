export default {
  common: {
    save: '保存',
    submit: '送信',
    cancel: 'キャンセル',
    close: '閉じる',
    name: 'お名前',
    email: 'メールアドレス',
    password: 'パスワード',
    confirmPassword: 'パスワード（確認）',
    address: '住所',
    addressLine2: '建物名・部屋番号（任意）',
    city: '市区町村',
    state: '都道府県',
    country: '国',
    postalCode: '郵便番号',
    yourName: 'お名前',
    streetAddress: '番地・建物名',
    showPassword: 'パスワードを表示',
    hidePassword: 'パスワードを隠す',
    decreaseQuantity: '数量を減らす',
    increaseQuantity: '数量を増やす',
    menu: 'メニュー',
    edit: '編集',
    delete: '削除',
    confirmDelete: '{name}を削除しますか？この操作は取り消せません。',
    errorNameRequired: '名前を入力してください。',
    none: 'なし',
    company: '会社',
    selectCompanyPlaceholder: '会社を選択…',
    description: '説明',
    photo: '写真',
    saving: '保存中…',
    loading: '読み込み中…',
    deactivate: '無効化',
    reactivate: '再有効化',
    confirmDeactivate: '{name}を無効化しますか？後で再有効化できます。',
    status: 'ステータス',
    statusActive: '有効',
    statusInactive: '無効'
  },

  nav: {
    events: 'イベント',
    members: 'メンバー',
    groups: 'ユニット',
    store: 'ストア',
    login: 'ログイン',
    logout: 'ログアウト',
    cart: 'カート',
    notifications: '通知'
  },

  notifications: {
    eyebrow: '最新情報、届いています',
    title: '通知',
    sub: 'ご注文の確認、抽選結果、その他お知らせをまとめてチェック。',
    entries: '{count}件の通知',
    markAllRead: 'すべて既読にする',
    empty: '通知はまだありません。',
    emptyHint: 'ご注文の確認や抽選結果はここに表示されます。',
    more: 'もっと見る'
  },

  menu: {
    history: { title: '履歴', desc: 'ご注文・抽選結果' },
    accountSettings: { title: 'アカウント設定', desc: 'プロフィールと設定' },
    contact: { title: 'お問い合わせ', desc: 'ご質問はこちらから' },
    guidelines: { title: 'ご利用ガイド', desc: '抽選や会場について' },
    about: { title: 'I-Dollyについて', desc: 'サービス紹介' }
  },

  footer: {
    tagline: 'モック予約デモ'
  },

  notificationBar: {
    message: '新しいアルバム・シングルがストアに入荷 — 今週の新譜をチェック'
  },

  events: {
    eyebrow: '6ユニット、ひとつのステージ',
    title: '推し活、次のステージへ',
    sub: '先着販売も抽選も、待つのはここだけ。あとはチケットを取るだけ。',
    searchPlaceholder: 'イベント・ユニット・会場を検索…',
    sortSoonest: '開催日が近い順',
    sortPriceAsc: '価格が安い順',
    sortPriceDesc: '価格が高い順',
    resultCount: '{count}件のイベント',
    noResults: '条件に一致するイベントが見つかりません。',
    noResultsHint: '検索条件をリセットするか、別のユニットを選んでみてください。',
    clearFilters: 'フィルターをリセット',
    capacity: '収容人数 {count}人',
    doorsAt: '開場 {time}',
    statusScheduled: '近日公開',
    statusOnSale: '発売中',
    statusSoldOut: '売り切れ',
    statusCompleted: '終了',
    statusCancelled: '中止',
    seatMapStage: 'ステージ',
    seatMapVip: 'VIP',
    seatMapPremium: 'プレミアム',
    seatMapRegular: 'レギュラー',
    seatMapCaption: 'イメージ図です — 実際の座席は会場や公演により異なります。'
  },

  members: {
    eyebrow: '全員集合',
    title: '推しは、この中にいる',
    sub: '18人のアイドル、6ユニット、正解しかない選択。気になる顔をタップしてどうぞ。',
    filterByUnit: 'ユニットで絞り込む',
    resultCount: '{count}人のメンバー',
    noResults: 'そのユニットのメンバーはまだいません。'
  },

  store: {
    eyebrow: '推し活、爆買い注意報',
    title: '音楽もペンライトも、まるごと持ち帰ろう',
    sub: '全ユニットのディスコグラフィーに加え、ペンライトやグッズもレーベルから直接。財布の準備はいいですか。',
    typeLabel: '種類',
    typeAll: 'すべて',
    typeAlbum: 'アルバム',
    typeSingle: 'シングル',
    unitLabel: 'ユニット',
    resultCount: '{count}件のアイテム',
    noResults: '条件に一致するアイテムが見つかりません。',
    addToCart: 'カートに入れる',
    addedToCart: '追加しました ✓',
    viewDetails: '詳細',
    inStock: '在庫あり',
    lowStock: '残り{count}点',
    outOfStock: '在庫切れ',
    taxIncluded: '（税込 ¥{price}）',
    trackCountOne: '{count}曲',
    trackCountOther: '{count}曲'
  },

  cart: {
    eyebrow: '推し活の戦利品',
    title: 'カート',
    orderSummary: 'ご注文内容',
    subtotal: '小計（{count}点）',
    shipping: '送料',
    free: '無料',
    total: '合計',
    checkout: 'レジに進む',
    continueShopping: '買い物を続ける',
    emptyTitle: 'カートは空です。',
    emptyHint: 'ストアをチェックしてお気に入りを見つけよう。',
    goToStore: 'ストアへ',
    unitPrice: '{price}（1点あたり）',
    removeItem: '削除',
    itemAdded: '{name}をカートに追加しました'
  },

  checkout: {
    eyebrow: 'ラスボスはお会計',
    title: 'チェックアウト',
    shippingAddress: 'お届け先',
    editAddress: '住所を編集',
    noAddressHint: '注文する前にアカウント設定でお届け先を保存してください。',
    goToAccount: 'アカウント設定へ',
    paymentMock: 'お支払い（モックゲートウェイ）',
    paymentMockHint: '実際の決済ゲートウェイはまだ接続されていません — カード情報を入力し、このモック決済の結果を選んでください。',
    cardNumber: 'カード番号',
    expiry: '有効期限',
    cvc: 'セキュリティコード',
    errorPayment: 'お支払い情報（モック）を入力してください。',
    simulateSuccess: '決済を承認する',
    simulateFailure: '決済を拒否する',
    orderSummary: 'ご注文内容',
    total: '合計',
    placeOrder: '注文を確定する',
    placingOrder: '注文処理中…',
    orderPlaced: 'ご注文ありがとうございます！',
    orderConfirmed: '注文番号 #{orderNumber} を承りました。これはモックのチェックアウトのため、実際の請求は発生しません。',
    orderDeclinedTitle: '決済が拒否されました',
    orderDeclinedNote: 'このモック決済は拒否されました。今回の注文分のカートは空になっています — ストアからもう一度商品を追加してください。',
    keepShopping: '買い物を続ける',
    backToEvents: 'イベント一覧へ戻る',
    emptyTitle: 'カートは空です。',
    emptyHint: 'チェックアウトする商品がありません。'
  },

  history: {
    eyebrow: '推し活の記録',
    title: '履歴',
    sub: '注文も抽選結果も「あれ、買ったっけ」も、まとめてここに。',
    entries: '{count}件の履歴',
    emptyTitle: 'まだ履歴がありません。',
    emptyHint: '購入や抽選結果はここに表示されます。',
    orderPlacedTitle: '注文完了',
    orderPlacedMessage: '注文番号 #{orderNumber}（¥{amount}）が確定しました。',
    orderCancelledTitle: '注文がキャンセルされました',
    orderCancelledMessage: '注文番号 #{orderNumber}（¥{amount}）はキャンセルされました。',
    ticketPurchasedTitle: 'チケットが確定しました',
    ticketPurchasedMessage: 'チケット #{orderNumber}（¥{amount}）が確定しました。',
    ticketCancelledTitle: 'チケット購入が失敗しました',
    ticketCancelledMessage: 'チケット #{orderNumber}（¥{amount}）は決済できませんでした。'
  },

  account: {
    eyebrow: '舞台裏設定',
    title: '設定',
    profile: 'プロフィール',
    saveChanges: '変更を保存',
    profileSaved: 'プロフィールを更新しました。',
    password: 'パスワード',
    currentPassword: '現在のパスワード',
    newPassword: '新しいパスワード',
    confirmNewPassword: '新しいパスワード（確認）',
    changePassword: 'パスワードを変更',
    passwordChanged: 'パスワードを更新しました。',
    errorCurrentPassword: '現在のパスワードを入力してください。',
    shippingAddress: '配送先住所',
    saveAddress: '住所を保存',
    addressSaved: '配送先住所を保存しました。',
    errorAddress: '住所・市区町村・都道府県・国・郵便番号を入力してください。'
  },

  guidelines: {
    eyebrow: '読まずに後悔する前に',
    title: 'これだけ知っておこう',
    sub: '購入・抽選・当日の流れを、迷わないようにまとめました。',
    directSaleTitle: '先着販売チケット',
    directSaleBody: '「発売中」のイベントは先着順です。イベントページで座席を選んでカートに追加し、そのままチェックアウトへ — お支払いが完了した時点で座席が確保されます。',
    lotteryTitle: '抽選チケット',
    lotteryBody: '人気公演は抽選での販売となります。応募期間中にエントリーしてください（応募時点での費用はかかりません）。当選された方は公演の約2週間前に決済とメール・通知ベルでのお知らせを行います。落選した場合も履歴に結果が表示されますので、ぜひ次の公演にもご応募ください。',
    releasesTitle: 'アルバム＆シングル',
    releasesBody: 'ストアの商品はチケットとは別便で発送されます。チケットと一緒に、またはリリース単体でもカートに追加でき、チェックアウトはまとめて1回で完了します。',
    venueTitle: '会場にて',
    venueItem1: '開場の30分前までにはお越しください。手荷物検査に時間がかかる場合があります。',
    venueItem2: '会場内でのプロ用カメラ・録音機材の使用はご遠慮ください。',
    venueItem3: 'ペンライトの使用は歓迎ですが、バラード中は肩より低い位置でお願いします。',
    venueItem4: '一度退場すると再入場はできません。',
    venueItem5: '入場時にチケットのお名前と写真付き身分証の確認を行います。',
    supportTitle: '返金・サポート',
    supportBody: 'チケットは原則返金不可ですが、I-Dolly側の都合による公演中止・延期の場合は自動的に返金いたします。その他のお困りごとは、履歴のご注文からお問い合わせください。'
  },

  about: {
    eyebrow: '誕生の理由',
    title: 'なぜI-Dollyが生まれたのか',
    sub: 'アカウント1つで、6ユニット分のアプリを行き来する手間ゼロに。',
    intro: 'I-Dollyは、6つの異なるファンクラブ、6つのチケット窓口、6つのリリースカレンダーを一本化するために生まれました。Starlight Ariaのアリーナツアーから、デビューしたばかりのMint Paradeまで、すべてのユニットのチケット購入・抽選応募・アルバム購入を1つのアカウントで行えます。',
    statUnits: 'ユニット',
    statIdols: 'アイドル',
    statShows: '年間公演数',
    statVenues: '会場',
    noteTitle: 'このデモについて',
    noteBody: 'I-Dollyはデモ用の予約サイトです。登場するユニット・アイドル・会場・リリースはすべて架空のもので、チェックアウトもモックのため実際の請求は発生しません。実際のバックエンドと接続しているのはログインのみで、それ以外はすべてお使いのブラウザ内にデータを保存しています。'
  },

  contact: {
    eyebrow: '気になることがあれば',
    title: '何でも聞いてください',
    sub: '注文のトラブルも、抽選のドキドキも、推し活特有の悩みも、まるごと受け止めます。',
    subjectLabel: '件名',
    subjectGeneral: '一般的なご質問',
    subjectOrder: 'ご注文について',
    subjectLottery: '抽選について',
    subjectAccount: 'アカウントについて',
    subjectOther: 'その他',
    messageLabel: 'お問い合わせ内容',
    messagePlaceholder: '内容をご記入ください…',
    submit: '送信する',
    errorRequired: 'お名前・メールアドレス・お問い合わせ内容を入力してください。',
    successTitle: '送信しました！',
    successBody: 'お問い合わせありがとうございます。こちらはモックフォームですが、実際のサイトではメールにてご返信いたします。',
    sendAnother: 'もう一度送信する',
    backEvents: 'イベント一覧へ戻る'
  },

  login: {
    eyebrow: 'アカウント1つで6ユニット分',
    title: 'おかえりなさい',
    subtitle: 'ログインして、座席の確保も抽選応募も、心置きなく。',
    submit: 'ログイン',
    noAccount: 'アカウントをお持ちでない方は',
    register: '新規登録',
    errorUserNotFound: '同じメールアドレスのユーザーが見つかりません'
  },

  register: {
    eyebrow: 'アカウント1つで6ユニット分',
    title: 'ようこそ',
    subtitle: '登録は一度だけ。あとは思う存分、推し活を。',
    submit: 'アカウントを作成',
    haveAccount: 'すでにアカウントをお持ちの方は',
    login: 'ログイン',
    errorName: 'お名前を入力してください。',
    errorEmail: '正しいメールアドレスを入力してください。',
    errorPasswordLength: 'パスワードは6文字以上で入力してください。',
    errorPasswordMatch: 'パスワードが一致しません。',
    successMessage: '{name}さん、ようこそ！アカウントの準備ができました。ログインしてください。',
    passwordPlaceholder: '6文字以上で入力',
    confirmPasswordPlaceholder: 'もう一度入力'
  },

  eventDetail: {
    backToEvents: 'イベント一覧',
    eventDate: '開催日',
    venue: '会場',
    lineup: '出演者',
    tickets: 'チケット',
    lotteryLabel: '抽選',
    directSaleLabel: '先着販売',
    leftSuffix: '残り{count}枚',
    seatMap: '座席表',
    goodToKnow: '知っておきたいこと',
    eventGuidelines: 'イベントガイドライン',
    qa: 'Q&A',
    qaRefundQ: '返金はできますか？',
    qaRefundA: 'チケットは原則返金不可ですが、イベントが中止・延期になった場合は返金いたします。',
    qaTransferQ: 'チケットを他の人に譲渡できますか？',
    qaTransferA: 'I-Dolly経由での譲渡はできません — 入場時にチケットのお名前と来場者のIDが一致している必要があります。',
    qaLotteryQ: '抽選結果はいつわかりますか？',
    qaLotteryA: '当選者には公演の約2週間前にメールでお知らせします。',
    qaAgeQ: '年齢制限はありますか？',
    qaAgeA: 'ほとんどの公演は全年齢対象です。対象外の深夜公演は必ずイベントページに記載されます。',
    notFound: 'そのイベントが見つかりませんでした。',
    statusSoldOut: '売り切れ',
    statusComingSoon: '近日公開',
    statusEnded: '終了',
    statusCancelled: '中止',
    statusNotOnSale: '販売前',
    ctaApply: '応募する →',
    saleNoteSoldOut: 'この公演の座席はすべて完売しました — リセール情報は随時ご確認ください。',
    saleNoteScheduled: '販売情報はまだ発表されていません。しばらくお待ちください。',
    saleNoteCompleted: 'この公演はすでに終了しました。',
    saleNoteCancelled: 'この公演は中止となりました。',
    saleNoteLotteryOnly: 'この公演は抽選での販売です — 次の画面から応募してください。',
    saleNoteDefault: '次の画面から抽選応募または座席の確保ができます。'
  },

  idolDetail: {
    backToMembers: 'メンバー一覧',
    backLink: 'メンバー一覧へ戻る',
    position: 'ポジション',
    unit: 'ユニット',
    hometown: '出身地',
    birthday: '誕生日',
    alsoIn: '{name}の他のメンバー',
    about: '{name}について',
    otherSoloIdols: '他のソロアイドル',
    notFound: 'そのメンバーが見つかりませんでした。'
  },

  ticketPurchase: {
    lotteryEntry: '抽選応募',
    directSaleCheckout: '先着販売チェックアウト',
    getTickets: 'チケットを取得',
    stepTickets: 'チケット',
    stepEntry: '応募',
    stepPayment: 'お支払い',
    stepDone: '完了',
    chooseTier: 'チケット種別を選択',
    tier: '種別',
    quantity: '枚数',
    seatMap: '座席表',
    orderSummary: 'ご注文内容',
    total: '合計',
    applyLottery: '抽選に応募する →',
    continueCheckout: 'チェックアウトへ進む →',
    contactPayment: '連絡先・お支払い',
    fullName: 'お名前',
    paymentMock: 'お支払い（モック）',
    cardNumber: 'カード番号',
    expiry: '有効期限',
    cvc: 'セキュリティコード',
    back: '戻る',
    placeOrder: '注文を確定する',
    appliedTitle: '応募しました！',
    wentTitle: '参加確定！',
    appliedNote: 'エントリー番号 {orderNumber}（{tier} · {title}）を受け付けました。当選者には公演の約2週間前にメールでお知らせします。',
    wentNote: '注文番号 {orderNumber}（{title} · {date}）が確定しました。これはモックのチェックアウトのため、実際の請求は発生しません。',
    declinedTitle: 'お支払いが拒否されました',
    declinedNote: 'このモック決済は拒否されたため、チケットは発行されませんでした。もう一度お試しください。',
    viewHistory: '履歴で見る',
    backToEvents: 'イベント一覧へ戻る',
    backToEvent: 'イベントページへ戻る',
    ineligibleNotFound: 'そのイベントが見つかりませんでした。',
    ineligibleSoldOut: 'この公演は売り切れです。',
    ineligibleCompleted: 'この公演はすでに終了しました。',
    ineligibleCancelled: 'この公演は中止となりました。',
    ineligibleDefault: 'このイベントのチケットはまだ販売されていません。',
    errorContactEmail: 'お名前とメールアドレスを入力してください。',
    errorPayment: 'お支払い情報（モック）を入力してください。',
    notifLotteryTitle: '抽選応募を受け付けました',
    notifLotteryMessage: 'エントリー番号 {orderNumber}（{tier} · {title}）を受け付けました。'
  },

  productDetail: {
    backToStore: 'ストア',
    notFound: 'その商品が見つかりませんでした。',
    recommendations: 'あわせてチェックしたいアイテム'
  },

  orderDetails: {
    backToHistory: '履歴',
    title: 'ご注文内容',
    orderNumber: '注文番号',
    orderTime: '注文日時',
    status: 'ステータス',
    statusConfirmed: '確定',
    statusCancelled: 'キャンセル済み',
    items: '商品',
    unknownProduct: '不明な商品',
    shippingAddress: 'お届け先',
    total: '合計',
    notFound: 'その注文が見つかりませんでした。'
  },

  ticketDetails: {
    backToHistory: '履歴',
    title: 'チケット詳細',
    event: 'イベント',
    tier: '種別',
    total: '合計',
    status: 'ステータス',
    statusReserved: '仮予約',
    statusPendingPayment: '支払い待ち',
    statusPaid: '支払い済み',
    statusCancelled: 'キャンセル済み',
    statusExpired: '期限切れ',
    statusUsed: '使用済み',
    viewEvent: 'イベントを見る',
    notFound: 'そのチケットが見つかりませんでした。'
  },

  lotteryDetails: {
    backToHistory: '履歴',
    title: '抽選応募',
    event: 'イベント',
    tier: '種別',
    quantity: '枚数',
    viewEvent: 'イベントを見る',
    statusPending: '結果待ち',
    statusWon: '当選',
    statusLost: '落選',
    notFound: 'その抽選応募が見つかりませんでした。'
  },

  groupDetail: {
    debut: '{date}デビュー',
    members: 'メンバー',
    events: 'イベント',
    products: 'ストア',
    notFound: 'そのユニットが見つかりませんでした。'
  },

  groupsPage: {
    eyebrow: '推しユニットを選ぼう',
    title: 'どのユニットに沼る?',
    sub: '6ユニット、それぞれの個性。気になるユニットをタップしてメンバー・公演・リリースをチェック。',
    resultCount: '{count}ユニット',
    noResults: 'ユニットはまだありません。'
  },

  notFoundPage: {
    eyebrow: '404エラー',
    title: 'セットリストにないページです',
    sub: 'お探しのページが見つかりませんでした。移動または削除された可能性があります。',
    backHome: 'イベント一覧へ戻る',
    goToStore: 'ストアを見る'
  },

  managerIdols: {
    title: 'アイドル',
    addIdol: '+ アイドルを追加',
    group: 'ユニット',
    selectCompanyPrompt: '上で会社を選択するとアイドルを管理できます。',
    noResults: 'この会社のアイドルはまだいません。'
  },

  managerIdolForm: {
    backToIdols: 'アイドル一覧へ戻る',
    selectCompanyPrompt: '上で会社を選択するとアイドルを追加できます。',
    addTitle: 'アイドルを追加',
    editTitle: 'アイドルを編集',
    dateOfBirth: '生年月日',
    color: 'カラー',
    shortIntro: '簡単な紹介',
    longDescription: '詳しい紹介'
  },

  managerGroups: {
    title: 'ユニット',
    addGroup: '+ ユニットを追加',
    debutDate: 'デビュー日',
    selectCompanyPrompt: '上で会社を選択するとユニットを管理できます。',
    noResults: 'この会社のユニットはまだいません。'
  },

  managerGroupForm: {
    backToGroups: 'ユニット一覧へ戻る',
    selectCompanyPrompt: '上で会社を選択するとユニットを追加できます。',
    addTitle: 'ユニットを追加',
    editTitle: 'ユニットを編集'
  },

  managerEvents: {
    title: 'イベント',
    addEvent: '+ イベントを追加',
    titleLabel: 'タイトル',
    venue: '会場',
    date: '日程',
    status: 'ステータス',
    selectCompanyPrompt: '上で会社を選択するとイベントを管理できます。',
    noResults: 'この会社のイベントはまだありません。',
    confirmDelete: '「{title}」を削除しますか？この操作は取り消せません。'
  },

  managerEventForm: {
    backToEvents: 'イベント一覧へ戻る',
    selectCompanyPrompt: '上で会社を選択するとイベントを追加できます。',
    addTitle: 'イベントを追加',
    editTitle: 'イベントを編集',
    selectVenuePlaceholder: '会場を選択…',
    capacity: '収容人数',
    eventDateTime: '開催日時',
    doorsOpen: '開場時間',
    errorRequired: 'タイトル・会場・開催日は必須です。'
  },

  managerProducts: {
    title: '商品',
    addProduct: '+ 商品を追加',
    category: 'カテゴリー',
    price: '価格',
    quantity: '数量',
    noResults: '商品はまだありません。'
  },

  managerProductForm: {
    backToProducts: '商品一覧へ戻る',
    addTitle: '商品を追加',
    editTitle: '商品を編集',
    selectCategoryPlaceholder: 'カテゴリーを選択…',
    errorRequired: '名前・カテゴリー・説明は必須です。'
  },

  adminCompanies: {
    title: '会社',
    addCompany: '+ 会社を追加',
    contactEmail: '連絡先メールアドレス',
    addManagerAccount: '+ マネージャーアカウント',
    noResults: '会社はまだありません。'
  },

  adminCompanyForm: {
    backToCompanies: '会社一覧へ戻る',
    addTitle: '会社を追加',
    editTitle: '会社を編集'
  },

  adminManagerAccountForm: {
    title: '新しいマネージャーアカウント',
    titleForCompany: '{company}の新しいマネージャーアカウント',
    createAccount: 'アカウントを作成',
    creating: '作成中…',
    errorRequired: '名前・メールアドレス・6文字以上のパスワードが必要です。',
    successMessage: '{email}宛にマネージャーアカウントを作成しました。'
  }
}
