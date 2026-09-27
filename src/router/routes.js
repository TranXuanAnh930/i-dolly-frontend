import eventsPage from '../pages/events/EventsPage.vue'
import eventDetailPage from '../pages/events/EventDetailPage.vue'
import ticketPurchasePage from '../pages/events/TicketPurchasePage.vue'
import lotteryEntryPage from '../pages/events/LotteryEntryPage.vue'
import membersPage from '../pages/members/MembersPage.vue'
import idolDetailPage from '../pages/members/IdolDetailPage.vue'
import groupsPage from '../pages/members/GroupsPage.vue'
import groupDetailPage from '../pages/members/GroupDetailPage.vue'
import storePage from '../pages/store/StorePage.vue'
import productDetailPage from '../pages/store/ProductDetailPage.vue'
import cartPage from '../pages/store/CartPage.vue'
import checkoutPage from '../pages/store/CheckoutPage.vue'
import paypalReturnPage from '../pages/payment/PaypalReturnPage.vue'
import paypalCancelPage from '../pages/payment/PaypalCancelPage.vue'
import historyPage from '../pages/account/HistoryPage.vue'
import notificationsPage from '../pages/account/NotificationsPage.vue'
import orderDetailsPage from '../pages/account/OrderDetailsPage.vue'
import ticketDetailsPage from '../pages/account/TicketDetailsPage.vue'
import lotteryResultDetailsPage from '../pages/account/LotteryResultDetailsPage.vue'
import lotteryPaymentPage from '../pages/account/LotteryPaymentPage.vue'
import accountSettingsPage from '../pages/account/AccountSettingsPage.vue'
import guidelinesPage from '../pages/static/GuidelinesPage.vue'
import aboutPage from '../pages/static/AboutPage.vue'
import contactPage from '../pages/static/ContactPage.vue'
import loginPage from '../pages/auth/Login.vue'
import registerPage from '../pages/auth/RegisterPage.vue'
import forgotPasswordPage from '../pages/auth/ForgotPasswordPage.vue'
import resetPasswordPage from '../pages/auth/ResetPasswordPage.vue'
import notFoundPage from '../pages/static/NotFound.vue'

import managerIdolsPage from '../pages/manager/ManagerIdolsPage.vue'
import managerIdolFormPage from '../pages/manager/ManagerIdolFormPage.vue'
import managerGroupsPage from '../pages/manager/ManagerGroupsPage.vue'
import managerGroupFormPage from '../pages/manager/ManagerGroupFormPage.vue'
import managerEventsPage from '../pages/manager/ManagerEventsPage.vue'
import managerEventFormPage from '../pages/manager/ManagerEventFormPage.vue'
import managerEventSalesPage from '../pages/manager/ManagerEventSalesPage.vue'
import managerLotteryResultsPage from '../pages/manager/ManagerLotteryResultsPage.vue'
import managerProductsPage from '../pages/manager/ManagerProductsPage.vue'
import managerProductFormPage from '../pages/manager/ManagerProductFormPage.vue'
import managerProductSalesPage from '../pages/manager/ManagerProductSalesPage.vue'
import managerOrdersPage from '../pages/manager/ManagerOrdersPage.vue'

import adminIdolsPage from '../pages/admin/AdminIdolsPage.vue'
import adminIdolFormPage from '../pages/admin/AdminIdolFormPage.vue'
import adminGroupsPage from '../pages/admin/AdminGroupsPage.vue'
import adminGroupFormPage from '../pages/admin/AdminGroupFormPage.vue'
import adminEventsPage from '../pages/admin/AdminEventsPage.vue'
import adminEventFormPage from '../pages/admin/AdminEventFormPage.vue'
import adminProductsPage from '../pages/admin/AdminProductsPage.vue'
import adminProductFormPage from '../pages/admin/AdminProductFormPage.vue'
import adminCompaniesPage from '../pages/admin/AdminCompaniesPage.vue'
import adminCompanyFormPage from '../pages/admin/AdminCompanyFormPage.vue'
import adminManagerAccountFormPage from '../pages/admin/AdminManagerAccountFormPage.vue'

export const routes = [
  {
    path: '/events',
    alias: '/',
    name: 'events',
    component: eventsPage,
    meta: { titleKey: 'pageTitle.events' }
  },
  {
    path: '/events/:id',
    name: 'event-detail',
    component: eventDetailPage,
    props: true,
    meta: { titleKey: 'pageTitle.event' }
  },
  {
    path: '/events/:id/seats',
    name: 'event-tickets',
    component: ticketPurchasePage,
    props: true,
    meta: { isAuth: true, titleKey: 'pageTitle.tickets' }
  },
  {
    path: '/events/:id/lottery',
    name: 'event-lottery-entry',
    component: lotteryEntryPage,
    props: true,
    meta: { isAuth: true, titleKey: 'pageTitle.lotteryEntry' }
  },
  {
    path: '/members',
    name: 'members',
    component: membersPage,
    meta: { titleKey: 'pageTitle.members' }
  },
  {
    path: '/members/:id',
    name: 'member-detail',
    component: idolDetailPage,
    props: true,
    meta: { titleKey: 'pageTitle.member' }
  },
  {
    path: '/groups',
    name: 'groups',
    component: groupsPage,
    meta: { titleKey: 'pageTitle.groups' }
  },
  {
    path: '/groups/:id',
    name: 'group-detail',
    component: groupDetailPage,
    props: true,
    meta: { titleKey: 'pageTitle.group' }
  },
  {
    path: '/store',
    name: 'store',
    component: storePage,
    meta: { titleKey: 'pageTitle.store' }
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: productDetailPage,
    props: true,
    meta: { titleKey: 'pageTitle.product' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: cartPage,
    meta: { titleKey: 'pageTitle.cart' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: checkoutPage,
    meta: { isAuth: true, titleKey: 'pageTitle.checkout' }
  },
  {
    // PayPal's return_url (app/utils/paypal_client.py::create_order) —
    // shared by both order and direct-sale ticket checkouts, see
    // PaypalReturnPage.vue. isAuth so initCurrentUserStateMiddleware
    // restores the session that this full-page redirect wiped before
    // PaymentService.capturePaypal (auth: true) fires.
    path: '/payment/paypal/return',
    name: 'paypal-return',
    component: paypalReturnPage,
    meta: { isAuth: true, titleKey: 'pageTitle.payment' }
  },
  {
    // PayPal's cancel_url — informational only, no capture call.
    path: '/payment/paypal/cancel',
    name: 'paypal-cancel',
    component: paypalCancelPage,
    meta: { isAuth: true, titleKey: 'pageTitle.paymentCancelled' }
  },
  {
    path: '/history',
    name: 'history',
    component: historyPage,
    meta: { isAuth: true, excludeRoles: ['manager', 'admin'], titleKey: 'pageTitle.history' }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: notificationsPage,
    meta: { isAuth: true, titleKey: 'pageTitle.notifications' }
  },
  {
    path: '/history/orders/:orderNumber',
    name: 'order-details',
    component: orderDetailsPage,
    props: true,
    meta: { isAuth: true, titleKey: 'pageTitle.orderDetails' }
  },
  {
    path: '/history/tickets/:orderNumber',
    name: 'ticket-details',
    component: ticketDetailsPage,
    props: true,
    meta: { titleKey: 'pageTitle.ticketDetails' }
  },
  {
    path: '/history/lottery/:id',
    name: 'lottery-details',
    component: lotteryResultDetailsPage,
    props: true,
    meta: { isAuth: true, titleKey: 'pageTitle.lotteryDetails' }
  },
  {
    path: '/history/lottery/:id/pay',
    name: 'lottery-payment',
    component: lotteryPaymentPage,
    props: true,
    meta: { isAuth: true, titleKey: 'pageTitle.lotteryPayment' }
  },
  {
    path: '/account',
    name: 'account',
    component: accountSettingsPage,
    meta: { isAuth: true, titleKey: 'pageTitle.accountSettings' }
  },
  {
    path: '/guidelines',
    name: 'guidelines',
    component: guidelinesPage,
    meta: { titleKey: 'pageTitle.guidelines' }
  },
  {
    path: '/about',
    name: 'about',
    component: aboutPage,
    meta: { excludeRoles: ['manager', 'admin'], titleKey: 'pageTitle.about' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: contactPage,
    meta: { excludeRoles: ['manager', 'admin'], titleKey: 'pageTitle.contact' }
  },
  {
    path: '/login',
    name: 'login',
    component: loginPage,
    meta: { titleKey: 'pageTitle.login' }
  },
  {
    path: '/register',
    name: 'register',
    component: registerPage,
    meta: { titleKey: 'pageTitle.register' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: forgotPasswordPage,
    meta: { titleKey: 'pageTitle.forgotPassword' }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: resetPasswordPage,
    meta: { titleKey: 'pageTitle.resetPassword' }
  },
  {
    // Old shared entry point — role-routed to the right area by
    // redirectSettingsRootMiddleware (needs currentUser.role, which isn't
    // reliably loaded yet at plain `redirect:` resolution time).
    path: '/settings',
    name: 'settings-root',
    meta: { isAuth: true }
  },

  // --- manager: always scoped to the current user's own company (no
  // picker — see ManagerIdolsPage.vue and friends) ---
  {
    path: '/manager/idols',
    name: 'manager-idols',
    component: managerIdolsPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.idols' }
  },
  {
    path: '/manager/idols/new',
    name: 'manager-idols-new',
    component: managerIdolFormPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.addIdol' }
  },
  {
    path: '/manager/idols/:id/edit',
    name: 'manager-idols-edit',
    component: managerIdolFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.editIdol' }
  },
  {
    path: '/manager/groups',
    name: 'manager-groups',
    component: managerGroupsPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.groups' }
  },
  {
    path: '/manager/groups/new',
    name: 'manager-groups-new',
    component: managerGroupFormPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.addGroup' }
  },
  {
    path: '/manager/groups/:id/edit',
    name: 'manager-groups-edit',
    component: managerGroupFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.editGroup' }
  },
  {
    path: '/manager/events',
    name: 'manager-events',
    component: managerEventsPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.events' }
  },
  {
    path: '/manager/events/new',
    name: 'manager-events-new',
    component: managerEventFormPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.addEvent' }
  },
  {
    path: '/manager/events/:id/edit',
    name: 'manager-events-edit',
    component: managerEventFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.editEvent' }
  },
  {
    path: '/manager/events/:id/sales',
    name: 'manager-events-sales',
    component: managerEventSalesPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.eventSales' }
  },
  {
    path: '/manager/events/:id/lottery-results',
    name: 'manager-events-lottery-results',
    component: managerLotteryResultsPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.lotteryResults' }
  },
  {
    path: '/manager/products',
    name: 'manager-products',
    component: managerProductsPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.products' }
  },
  {
    path: '/manager/products/new',
    name: 'manager-products-new',
    component: managerProductFormPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.addProduct' }
  },
  {
    path: '/manager/products/:id/edit',
    name: 'manager-products-edit',
    component: managerProductFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.editProduct' }
  },
  {
    path: '/manager/products/:id/sales',
    name: 'manager-products-sales',
    component: managerProductSalesPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.productSales' }
  },
  {
    path: '/manager/orders',
    name: 'manager-orders',
    component: managerOrdersPage,
    meta: { isAuth: true, roles: ['manager'], titleKey: 'pageTitle.orders' }
  },

  // --- admin: unscoped, picks a company via the same picker manager
  // pages used to share (see AdminIdolsPage.vue and friends) ---
  {
    path: '/admin/idols',
    name: 'admin-idols',
    component: adminIdolsPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.idols' }
  },
  {
    path: '/admin/idols/new',
    name: 'admin-idols-new',
    component: adminIdolFormPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.addIdol' }
  },
  {
    path: '/admin/idols/:id/edit',
    name: 'admin-idols-edit',
    component: adminIdolFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.editIdol' }
  },
  {
    path: '/admin/groups',
    name: 'admin-groups',
    component: adminGroupsPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.groups' }
  },
  {
    path: '/admin/groups/new',
    name: 'admin-groups-new',
    component: adminGroupFormPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.addGroup' }
  },
  {
    path: '/admin/groups/:id/edit',
    name: 'admin-groups-edit',
    component: adminGroupFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.editGroup' }
  },
  {
    path: '/admin/events',
    name: 'admin-events',
    component: adminEventsPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.events' }
  },
  {
    path: '/admin/events/new',
    name: 'admin-events-new',
    component: adminEventFormPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.addEvent' }
  },
  {
    path: '/admin/events/:id/edit',
    name: 'admin-events-edit',
    component: adminEventFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.editEvent' }
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: adminProductsPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.products' }
  },
  {
    path: '/admin/products/new',
    name: 'admin-products-new',
    component: adminProductFormPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.addProduct' }
  },
  {
    path: '/admin/products/:id/edit',
    name: 'admin-products-edit',
    component: adminProductFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.editProduct' }
  },
  {
    path: '/admin/companies',
    name: 'admin-companies',
    component: adminCompaniesPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.companies' }
  },
  {
    path: '/admin/companies/new',
    name: 'admin-companies-new',
    component: adminCompanyFormPage,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.addCompany' }
  },
  {
    path: '/admin/companies/:id/edit',
    name: 'admin-companies-edit',
    component: adminCompanyFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.editCompany' }
  },
  {
    path: '/admin/companies/:id/managers/new',
    name: 'admin-manager-account-new',
    component: adminManagerAccountFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], titleKey: 'pageTitle.addManagerAccount' }
  },
  {
    path: '/:pathMatch(.*)*',
    component: notFoundPage,
    meta: { titleKey: 'pageTitle.notFound' }
  }
]
