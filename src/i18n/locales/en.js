export default {
  common: {
    save: 'Save',
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    address: 'Address',
    addressLine2: 'Apartment, suite, etc. (optional)',
    city: 'City',
    state: 'State / prefecture',
    country: 'Country',
    postalCode: 'Postal code',
    yourName: 'Your name',
    streetAddress: 'Street address',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    decreaseQuantity: 'Decrease quantity',
    increaseQuantity: 'Increase quantity',
    menu: 'Menu',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Delete {name}? This can\'t be undone.',
    errorNameRequired: 'Name is required.',
    none: 'None',
    company: 'Company',
    selectCompanyPlaceholder: 'Select a company…',
    description: 'Description',
    photo: 'Photo',
    saving: 'Saving…',
    loading: 'Loading…',
    deactivate: 'Deactivate',
    reactivate: 'Reactivate',
    confirmDeactivate: 'Deactivate {name}? You can reactivate it later.',
    status: 'Status',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    previous: 'Previous',
    next: 'Next',
    pageLabel: 'Page {page}'
  },

  nav: {
    events: 'Events',
    members: 'Members',
    groups: 'Groups',
    store: 'Store',
    login: 'Login',
    logout: 'Logout',
    cart: 'Cart',
    notifications: 'Notifications',
    loggedOut: 'You\'ve been logged out.'
  },

  notifications: {
    eyebrow: 'Tea, served fresh',
    title: 'Notifications',
    sub: 'Order confirmations, lottery results, and whatever else deserves a little ding.',
    entries: '{count} notifications',
    markAllRead: 'Mark all read',
    empty: 'No notifications yet.',
    emptyHint: 'Order confirmations and lottery results will show up here as they happen.',
    more: 'More'
  },

  menu: {
    history: { title: 'History', desc: 'Orders & lottery results' },
    accountSettings: { title: 'Account Settings', desc: 'Profile & preferences' },
    contact: { title: 'Contact', desc: 'Send us your questions' },
    guidelines: { title: 'Guidelines', desc: 'How lotteries & venues work' },
    about: { title: 'About', desc: 'What I-Dolly is' }
  },

  footer: {
    tagline: 'a mock booking demo'
  },

  notificationBar: {
    message: 'New albums & singles are in the Store — shop this week\'s releases'
  },

  events: {
    eyebrow: 'Six units, one stage',
    title: 'Your next bias era starts here',
    sub: 'Grab direct-sale seats or shoot your shot in the lottery — no waiting rooms, just tickets.',
    searchPlaceholder: 'Search events, units, venues…',
    sortSoonest: 'Soonest first',
    sortPriceAsc: 'Price: low to high',
    sortPriceDesc: 'Price: high to low',
    resultCount: '{count} events',
    noResults: 'No events match those filters.',
    noResultsHint: 'Try clearing the search or picking a different unit.',
    clearFilters: 'Clear filters',
    capacity: '{count} capacity',
    doorsAt: 'Doors {time}',
    statusScheduled: 'Coming Soon',
    statusOnSale: 'On Sale',
    statusSoldOut: 'Sold Out',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    seatMapStage: 'STAGE',
    seatMapVip: 'VIP',
    seatMapPremium: 'Premium',
    seatMapRegular: 'Regular',
    seatMapCaption: 'Illustrative only — actual seating varies by venue and show.'
  },

  members: {
    eyebrow: 'The full roster',
    title: 'Meet your next bias',
    sub: 'Eighteen idols, six units, zero wrong answers. Tap a face and fall down the rabbit hole.',
    filterByUnit: 'Filter by unit',
    resultCount: '{count} members',
    noResults: 'No members in that unit yet.'
  },

  store: {
    eyebrow: 'Retail therapy, idol edition',
    title: 'Take the music (and the lightstick) home',
    sub: 'Every unit\'s discography, plus lightsticks and merch, straight from the label. Your wallet has been warned.',
    typeLabel: 'Type',
    typeAll: 'All',
    typeAlbum: 'Album',
    typeSingle: 'Single',
    unitLabel: 'Unit',
    resultCount: '{count} items',
    noResults: 'No items match those filters.',
    addToCart: 'Add to Cart',
    addedToCart: 'Added ✓',
    viewDetails: 'Details',
    inStock: 'In stock',
    lowStock: 'Only {count} left',
    outOfStock: 'Out of stock',
    taxIncluded: '(tax incl. ¥{price})',
    trackCountOne: '{count} track',
    trackCountOther: '{count} tracks',
    resaleCapLabel: 'Limit {count} per customer',
    resaleCapReached: 'Purchase limit reached',
    resaleCapReachedHint: 'You\'ve already bought the maximum allowed of this item.',
    resaleCapLimitReached: 'You can\'t add more — limit {count} per customer.'
  },

  cart: {
    eyebrow: 'Shopping bag, activated',
    title: 'Cart',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal ({count} items)',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue shopping',
    emptyTitle: 'Your cart is empty.',
    emptyHint: 'Browse the store to find your next favorite album.',
    goToStore: 'Go to Store',
    unitPrice: '{price} each',
    removeItem: 'Remove item',
    itemAdded: '{name} added to cart'
  },

  checkout: {
    eyebrow: 'The final boss: payment',
    title: 'Checkout',
    shippingAddress: 'Shipping address',
    editAddress: 'Edit address',
    noAddressHint: 'Save a shipping address in Account Settings before placing an order.',
    goToAccount: 'Go to Account Settings',
    paymentMock: 'Payment (mock gateway)',
    paymentMockHint: 'No real payment gateway is connected yet — enter any card details and choose how the mock payment should behave.',
    cardNumber: 'Card number',
    expiry: 'Expiry',
    cvc: 'CVC',
    errorPayment: 'Enter mock payment details to continue.',
    simulateSuccess: 'Approve payment',
    simulateFailure: 'Decline payment',
    orderSummary: 'Order Summary',
    total: 'Total',
    placeOrder: 'Place Order',
    placingOrder: 'Placing order…',
    orderPlaced: 'Order placed!',
    orderConfirmed: 'Order #{orderNumber} is confirmed. This is a mock checkout, so nothing was actually charged.',
    orderDeclinedTitle: 'Payment declined',
    orderDeclinedNote: 'This mock payment was declined. Your cart for this order has been cleared — head back to the store to add your items again.',
    keepShopping: 'Keep shopping',
    backToEvents: 'Back to events',
    emptyTitle: 'Your cart is empty.',
    emptyHint: 'There\'s nothing to check out yet.'
  },

  history: {
    eyebrow: 'Your paper trail',
    title: 'History',
    sub: 'Every order, entry, and "did I really just buy that" moment, in one place.',
    entries: '{count} entries',
    emptyTitle: 'Nothing here yet.',
    emptyHint: 'Purchases and lottery results will show up here as they happen.',
    orderPlacedTitle: 'Order placed',
    orderPlacedMessage: 'Order #{orderNumber} (¥{amount}) was placed successfully.',
    orderCancelledTitle: 'Order cancelled',
    orderCancelledMessage: 'Order #{orderNumber} (¥{amount}) was cancelled.',
    ticketPurchasedTitle: 'Ticket confirmed',
    ticketPurchasedMessage: 'Ticket #{orderNumber} (¥{amount}) is confirmed.',
    ticketCancelledTitle: 'Ticket purchase declined',
    ticketCancelledMessage: 'Ticket #{orderNumber} (¥{amount}) was declined.'
  },

  account: {
    eyebrow: 'Behind the scenes',
    title: 'Settings',
    profile: 'Profile',
    saveChanges: 'Save changes',
    profileSaved: 'Profile updated.',
    password: 'Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmNewPassword: 'Confirm new password',
    changePassword: 'Change password',
    passwordChanged: 'Password updated.',
    errorCurrentPassword: 'Enter your current password.',
    shippingAddress: 'Shipping Address',
    saveAddress: 'Save address',
    addressSaved: 'Shipping address saved.',
    errorAddress: 'Fill in your address, city, state, country, and postal code.'
  },

  guidelines: {
    eyebrow: 'Read before you regret it',
    title: 'How this all works',
    sub: 'The need-to-know on buying, lotteries, and show day — so you\'re never caught off guard.',
    directSaleTitle: 'Direct sale tickets',
    directSaleBody: 'Events marked "On Sale" are first-come, first-served. Pick your seats on the event page, add them to your cart, and check out — your seats are yours the moment payment goes through.',
    lotteryTitle: 'Lottery tickets',
    lotteryBody: 'High-demand shows sell through a lottery instead. Submit an entry before the window closes — entering costs nothing up front. Winners are charged and notified by email (and in your notification bell) about two weeks before the show. If you\'re not selected, you\'ll see that in your History too, and you\'re welcome to try the next show.',
    releasesTitle: 'Albums & singles',
    releasesBody: 'Everything in the Store ships separately from tickets. Add releases to your cart alongside — or instead of — tickets; checkout handles both in one order.',
    venueTitle: 'At the venue',
    venueItem1: 'Arrive at least 30 minutes before doors open — bag checks can take a while.',
    venueItem2: 'Professional cameras and recording equipment aren\'t allowed inside the venue.',
    venueItem3: 'Light sticks are welcome; keep them below shoulder height during ballads.',
    venueItem4: 'Re-entry isn\'t permitted once you\'ve left the venue.',
    venueItem5: 'The name on your ticket must match a photo ID at entry.',
    supportTitle: 'Refunds & support',
    supportBody: 'Tickets are non-refundable except when I-Dolly cancels or reschedules a show — in that case you\'ll be refunded automatically. For anything else, reach out from your order in History and we\'ll take it from there.'
  },

  about: {
    eyebrow: 'The origin story',
    title: 'Why I-Dolly exists',
    sub: 'One login, six units, zero juggling six different fan club apps.',
    intro: 'I-Dolly started as a way to stop juggling six different fan clubs, six different ticket queues, and six different release calendars. Now every unit — from Starlight Aria\'s arena tours to Mint Parade\'s first steps — sells tickets, runs lotteries, and ships albums through one account.',
    statUnits: 'Units',
    statIdols: 'Idols',
    statShows: 'Shows a year',
    statVenues: 'Venues',
    noteTitle: 'A note on this build',
    noteBody: 'I-Dolly is a demo booking site — the units, idols, venues, and releases are all fictional, and checkout is mocked (nothing is ever actually charged). Login is the one connection to a real backend; everything else runs on data stored right in your browser.'
  },

  contact: {
    eyebrow: 'Got a question?',
    title: 'We\'re all ears',
    sub: 'Order mix-ups, lottery nerves, and every other idol-related crisis — send it our way.',
    subjectLabel: 'Subject',
    subjectGeneral: 'General question',
    subjectOrder: 'Order issue',
    subjectLottery: 'Lottery question',
    subjectAccount: 'Account help',
    subjectOther: 'Other',
    messageLabel: 'Message',
    messagePlaceholder: 'Tell us what\'s up…',
    submit: 'Send message',
    errorRequired: 'Fill in your name, email, and message.',
    successTitle: 'Message sent!',
    successBody: 'Thanks for reaching out — this is a mock form, but on a real site we\'d get back to you by email.',
    sendAnother: 'Send another message',
    backEvents: 'Back to events'
  },

  login: {
    eyebrow: 'One account, six fandoms',
    title: 'Welcome back',
    subtitle: 'Log in and let the chaos — tickets, lotteries, all of it — begin.',
    submit: 'Log in',
    noAccount: 'Don\'t have an account?',
    register: 'Register',
    errorUserNotFound: 'User with same email not found',
    forgotPassword: 'Forgot password?',
    successMessage: 'Welcome back, {name}!'
  },

  forgotPassword: {
    eyebrow: 'One account, six fandoms',
    title: 'Reset your password',
    subtitle: 'Enter your email and we\'ll send you a reset token.',
    submit: 'Send reset token',
    sentMessage: 'If {email} is registered, a reset token has been sent — it\'s valid for 15 minutes.',
    haveToken: 'I have a token',
    backToLogin: 'Back to login'
  },

  resetPassword: {
    eyebrow: 'One account, six fandoms',
    title: 'Choose a new password',
    subtitle: 'Paste the token from your email and set a new password.',
    token: 'Reset token',
    tokenPlaceholder: 'Paste the token from your email',
    newPassword: 'New password',
    submit: 'Reset password',
    errorTokenRequired: 'Enter the reset token from your email.',
    errorInvalidToken: 'That token is invalid or has expired. Request a new one.',
    successMessage: 'Your password has been reset. You can now log in with your new password.',
    successToast: 'Password updated — you can log in with it now.',
    goToLogin: 'Go to login',
    noToken: 'Don\'t have a token?',
    requestOne: 'Request one'
  },

  register: {
    eyebrow: 'One account, six fandoms',
    title: 'Join the club',
    subtitle: 'Sign up once, stan responsibly forever.',
    submit: 'Create account',
    haveAccount: 'Already have an account?',
    login: 'Log in',
    errorName: 'Enter your name.',
    errorEmail: 'Enter a valid email address.',
    errorPasswordLength: 'Password must be at least 6 characters.',
    errorPasswordMatch: 'Passwords don\'t match.',
    successMessage: 'Welcome, {name}! Your account is ready — log in to continue.',
    passwordPlaceholder: 'At least 6 characters',
    confirmPasswordPlaceholder: 'Type it again'
  },

  eventDetail: {
    backToEvents: 'All events',
    eventDate: 'Event Date',
    venue: 'Venue',
    lineup: 'Lineup',
    tickets: 'Tickets',
    lotteryLabel: 'Lottery',
    directSaleLabel: 'Direct sale',
    leftSuffix: '{count} left',
    seatMap: 'Seat map',
    goodToKnow: 'Good to know',
    eventGuidelines: 'Event guidelines',
    qa: 'Q&A',
    qaRefundQ: 'Can I get a refund?',
    qaRefundA: 'Tickets are non-refundable, except if the event is cancelled or rescheduled.',
    qaTransferQ: 'Can I transfer my ticket to someone else?',
    qaTransferA: 'Not through I-Dolly directly — the name on the ticket must match the attendee\'s ID at entry.',
    qaLotteryQ: 'When will I know if I won the lottery?',
    qaLotteryA: 'Winners are notified by email roughly two weeks before the show.',
    qaAgeQ: 'Is there an age restriction?',
    qaAgeA: 'Most shows are all-ages. Late-night sets that aren\'t are always noted on the event page.',
    notFound: 'We couldn\'t find that event.',
    statusSoldOut: 'Sold Out',
    statusComingSoon: 'Coming Soon',
    statusEnded: 'Event Ended',
    statusCancelled: 'Cancelled',
    statusNotOnSale: 'Not On Sale',
    ctaApply: 'Apply →',
    saleNoteSoldOut: 'All seats for this show are gone — check back for resale.',
    saleNoteScheduled: 'Sale details haven\'t been announced yet. Check back soon.',
    saleNoteCompleted: 'This show has already happened.',
    saleNoteCancelled: 'This show was cancelled.',
    saleNoteLotteryOnly: 'This show sells through a lottery — apply on the next screen.',
    saleNoteDefault: 'Apply for the lottery or reserve seats directly on the next screen.'
  },

  idolDetail: {
    backToMembers: 'All members',
    backLink: 'Back to all members',
    position: 'Position',
    unit: 'Unit',
    hometown: 'Hometown',
    birthday: 'Birthday',
    alsoIn: 'Also in {name}',
    about: 'About {name}',
    otherSoloIdols: 'Other solo idols',
    notFound: 'We couldn\'t find that idol.'
  },

  ticketPurchase: {
    lotteryEntry: 'Lottery entry',
    directSaleCheckout: 'Direct sale checkout',
    getTickets: 'Get tickets',
    stepTickets: 'Tickets',
    stepEntry: 'Entry',
    stepPayment: 'Payment',
    stepDone: 'Done',
    chooseTier: 'Choose a ticket tier',
    tier: 'Tier',
    quantity: 'Quantity',
    seatMap: 'Seat map',
    orderSummary: 'Order Summary',
    total: 'Total',
    applyLottery: 'Apply for Lottery →',
    continueCheckout: 'Continue to Checkout →',
    contactPayment: 'Contact & payment',
    fullName: 'Full name',
    paymentMock: 'Payment (mock)',
    cardNumber: 'Card number',
    expiry: 'Expiry',
    cvc: 'CVC',
    back: 'Back',
    placeOrder: 'Place Order',
    appliedTitle: 'You applied!',
    wentTitle: 'You\'re going!',
    appliedNote: 'Entry {orderNumber} for {tier} · {title} is in. Winners are notified by email roughly two weeks before the show.',
    wentNote: 'Order {orderNumber} is confirmed for {title} · {date}. This is a mock checkout, so nothing was actually charged.',
    declinedTitle: 'Payment declined',
    declinedNote: 'This mock payment was declined, so no ticket was issued — head back and try again.',
    viewHistory: 'View in History',
    backToEvents: 'Back to events',
    backToEvent: 'Back to event',
    ineligibleNotFound: 'We couldn\'t find that event.',
    ineligibleSoldOut: 'This show is sold out.',
    ineligibleCompleted: 'This show has already happened.',
    ineligibleCancelled: 'This show was cancelled.',
    ineligibleDefault: 'Tickets for this show aren\'t on sale yet.',
    errorContactEmail: 'Fill in your name and email.',
    errorPayment: 'Enter mock payment details to continue.',
    notifLotteryTitle: 'Lottery entry submitted',
    notifLotteryMessage: 'Entry {orderNumber} for {tier} · {title} is in.'
  },

  productDetail: {
    backToStore: 'Store',
    notFound: 'We couldn\'t find that item.',
    recommendations: 'You might also like',
    qa: 'Q&A',
    qaShippingQ: 'When will my order ship?',
    qaShippingA: 'Orders ship within a few business days of purchase. This is a mock checkout, so no real shipment ever goes out.',
    qaReturnQ: 'Can I return or exchange this item?',
    qaReturnA: 'Unopened items can be returned within 14 days of delivery. Reach out from your order in History and we\'ll take it from there.',
    qaCapQ: 'Why is there a purchase limit on this item?',
    qaCapA: 'High-demand releases are capped per customer to keep them available for more fans instead of being bought up for resale.',
    qaConditionQ: 'Is this item new and official?',
    qaConditionA: 'Every item ships brand new, sealed, and sourced directly from the label — no used or third-party stock.'
  },

  orderDetails: {
    backToHistory: 'History',
    title: 'Order details',
    orderNumber: 'Order number',
    orderTime: 'Order time',
    status: 'Status',
    statusConfirmed: 'Confirmed',
    statusCancelled: 'Cancelled',
    items: 'Items',
    unknownProduct: 'Unknown product',
    shippingAddress: 'Shipping address',
    total: 'Total',
    notFound: 'We couldn\'t find that order.'
  },

  ticketDetails: {
    backToHistory: 'History',
    title: 'Ticket details',
    event: 'Event',
    tier: 'Tier',
    total: 'Total',
    status: 'Status',
    statusReserved: 'Reserved',
    statusPendingPayment: 'Pending payment',
    statusPaid: 'Paid',
    statusCancelled: 'Cancelled',
    statusExpired: 'Expired',
    statusUsed: 'Used',
    viewEvent: 'View event',
    notFound: 'We couldn\'t find that ticket.'
  },

  lotteryDetails: {
    backToHistory: 'History',
    title: 'Lottery entry',
    event: 'Event',
    tier: 'Tier',
    quantity: 'Quantity',
    viewEvent: 'View event',
    statusPending: 'Awaiting results',
    statusWon: 'Won',
    statusLost: 'Not selected',
    notFound: 'We couldn\'t find that lottery entry.'
  },

  groupDetail: {
    debut: 'Debuted {date}',
    members: 'Members',
    events: 'Events',
    products: 'Store',
    notFound: 'We couldn\'t find that group.'
  },

  groupsPage: {
    eyebrow: 'Pick your favorite chaos',
    title: 'Which unit are you falling for?',
    sub: 'Six units, six personalities. Tap one to see its members, shows, and releases.',
    resultCount: '{count} units',
    noResults: 'No units yet.'
  },

  notFoundPage: {
    eyebrow: '404 Error',
    title: 'Off the Setlist',
    sub: 'We couldn\'t find the page you were looking for. It may have been moved, renamed, or never existed.',
    backHome: 'Back to Events',
    goToStore: 'Browse the Store'
  },

  managerIdols: {
    title: 'Idols',
    addIdol: '+ Add idol',
    group: 'Group',
    selectCompanyPrompt: 'Select a company above to manage its idols.',
    noResults: 'No idols yet for this company.'
  },

  managerIdolForm: {
    backToIdols: 'Back to idols',
    selectCompanyPrompt: 'Select a company above to add an idol.',
    addTitle: 'Add idol',
    editTitle: 'Edit idol',
    dateOfBirth: 'Date of birth',
    color: 'Color',
    shortIntro: 'Short intro',
    longDescription: 'Long description'
  },

  managerGroups: {
    title: 'Groups',
    addGroup: '+ Add group',
    debutDate: 'Debut date',
    selectCompanyPrompt: 'Select a company above to manage its groups.',
    noResults: 'No groups yet for this company.'
  },

  managerGroupForm: {
    backToGroups: 'Back to groups',
    selectCompanyPrompt: 'Select a company above to add a group.',
    addTitle: 'Add group',
    editTitle: 'Edit group'
  },

  managerEvents: {
    title: 'Events',
    addEvent: '+ Add event',
    titleLabel: 'Title',
    venue: 'Venue',
    date: 'Date',
    status: 'Status',
    selectCompanyPrompt: 'Select a company above to manage its events.',
    noResults: 'No events yet for this company.',
    cancelEvent: 'Cancel event',
    confirmCancel: 'Cancel "{title}"? Ticket holders won\'t be notified automatically — you can change its status back from Edit.'
  },

  managerEventForm: {
    backToEvents: 'Back to events',
    selectCompanyPrompt: 'Select a company above to add an event.',
    addTitle: 'Add event',
    editTitle: 'Edit event',
    selectVenuePlaceholder: 'Select a venue…',
    capacity: 'Capacity',
    eventDateTime: 'Event date & time',
    doorsOpen: 'Doors open',
    errorRequired: 'Title, venue and event date are required.',
    dateLockedHint: 'This event is already on sale — cancel it first (set status to Cancelled and save), then edit the date/doors-open time/capacity in a separate edit.'
  },

  managerProducts: {
    title: 'Products',
    addProduct: '+ Add product',
    category: 'Category',
    price: 'Price',
    quantity: 'Quantity',
    noResults: 'No products yet.',
    viewSales: 'Sales'
  },

  managerProductForm: {
    backToProducts: 'Back to products',
    addTitle: 'Add product',
    editTitle: 'Edit product',
    selectCategoryPlaceholder: 'Select a category…',
    errorRequired: 'Name, category and description are required.',
    priceLocked: 'Price can only be set when a product is created — ask an admin to change it.'
  },

  managerProductSales: {
    backToProducts: 'Back to products',
    title: 'Sales — {name}',
    date: 'Date',
    order: 'Order',
    quantity: 'Quantity',
    unitPrice: 'Unit price',
    total: 'Total',
    noResults: 'No sales yet for this product.'
  },

  managerOrders: {
    title: 'Orders',
    date: 'Date',
    buyer: 'Buyer',
    items: 'Items',
    total: 'Total',
    status: 'Status',
    noResults: 'No orders yet for this company.',
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusCancelled: 'Cancelled'
  },

  adminCompanies: {
    title: 'Companies',
    addCompany: '+ Add company',
    contactEmail: 'Contact email',
    addManagerAccount: '+ Manager account',
    noResults: 'No companies yet.'
  },

  adminCompanyForm: {
    backToCompanies: 'Back to companies',
    addTitle: 'Add company',
    editTitle: 'Edit company'
  },

  adminManagerAccountForm: {
    title: 'New manager account',
    titleForCompany: 'New manager account for {company}',
    createAccount: 'Create account',
    creating: 'Creating…',
    errorRequired: 'Name, email and a password of at least 6 characters are required.',
    successMessage: 'Manager account created for {email}.'
  }
}
