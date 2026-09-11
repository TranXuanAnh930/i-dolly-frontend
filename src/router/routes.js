import eventsPage from '../pages/EventsPage.vue'
import eventDetailPage from '../pages/EventDetailPage.vue'
import ticketPurchasePage from '../pages/TicketPurchasePage.vue'
import membersPage from '../pages/MembersPage.vue'
import idolDetailPage from '../pages/IdolDetailPage.vue'
import groupsPage from '../pages/GroupsPage.vue'
import groupDetailPage from '../pages/GroupDetailPage.vue'
import storePage from '../pages/StorePage.vue'
import productDetailPage from '../pages/ProductDetailPage.vue'
import cartPage from '../pages/CartPage.vue'
import checkoutPage from '../pages/CheckoutPage.vue'
import historyPage from '../pages/HistoryPage.vue'
import notificationsPage from '../pages/NotificationsPage.vue'
import orderDetailsPage from '../pages/OrderDetailsPage.vue'
import ticketDetailsPage from '../pages/TicketDetailsPage.vue'
import lotteryResultDetailsPage from '../pages/LotteryResultDetailsPage.vue'
import accountSettingsPage from '../pages/AccountSettingsPage.vue'
import guidelinesPage from '../pages/GuidelinesPage.vue'
import aboutPage from '../pages/AboutPage.vue'
import contactPage from '../pages/ContactPage.vue'
import loginPage from '../pages/Login.vue'
import registerPage from '../pages/RegisterPage.vue'
import forgotPasswordPage from '../pages/ForgotPasswordPage.vue'
import resetPasswordPage from '../pages/ResetPasswordPage.vue'
import notFoundPage from '../pages/NotFound.vue'

import managerIdolsPage from '../pages/manager/ManagerIdolsPage.vue'
import managerIdolFormPage from '../pages/manager/ManagerIdolFormPage.vue'
import managerGroupsPage from '../pages/manager/ManagerGroupsPage.vue'
import managerGroupFormPage from '../pages/manager/ManagerGroupFormPage.vue'
import managerEventsPage from '../pages/manager/ManagerEventsPage.vue'
import managerEventFormPage from '../pages/manager/ManagerEventFormPage.vue'
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

import { DOMAIN_TITLE } from '../env'

export const routes = [
  {
    path: '/events',
    alias: '/',
    name: 'events',
    component: eventsPage,
    meta: { title: `${DOMAIN_TITLE} | events` }
  },
  {
    path: '/events/:id',
    name: 'event-detail',
    component: eventDetailPage,
    props: true,
    meta: { title: `${DOMAIN_TITLE} | event` }
  },
  {
    path: '/events/:id/seats',
    name: 'event-tickets',
    component: ticketPurchasePage,
    props: true,
    meta: { isAuth: true, title: `${DOMAIN_TITLE} | tickets` }
  },
  {
    path: '/members',
    name: 'members',
    component: membersPage,
    meta: { title: `${DOMAIN_TITLE} | members` }
  },
  {
    path: '/members/:id',
    name: 'member-detail',
    component: idolDetailPage,
    props: true,
    meta: { title: `${DOMAIN_TITLE} | member` }
  },
  {
    path: '/groups',
    name: 'groups',
    component: groupsPage,
    meta: { title: `${DOMAIN_TITLE} | groups` }
  },
  {
    path: '/groups/:id',
    name: 'group-detail',
    component: groupDetailPage,
    props: true,
    meta: { title: `${DOMAIN_TITLE} | group` }
  },
  {
    path: '/store',
    name: 'store',
    component: storePage,
    meta: { title: `${DOMAIN_TITLE} | store` }
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: productDetailPage,
    props: true,
    meta: { title: `${DOMAIN_TITLE} | product` }
  },
  {
    path: '/cart',
    name: 'cart',
    component: cartPage,
    meta: { title: `${DOMAIN_TITLE} | cart` }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: checkoutPage,
    meta: { isAuth: true, title: `${DOMAIN_TITLE} | checkout` }
  },
  {
    path: '/history',
    name: 'history',
    component: historyPage,
    meta: { isAuth: true, title: `${DOMAIN_TITLE} | history` }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: notificationsPage,
    meta: { isAuth: true, title: `${DOMAIN_TITLE} | notifications` }
  },
  {
    path: '/history/orders/:orderNumber',
    name: 'order-details',
    component: orderDetailsPage,
    props: true,
    meta: { isAuth: true, title: `${DOMAIN_TITLE} | order` }
  },
  {
    path: '/history/tickets/:orderNumber',
    name: 'ticket-details',
    component: ticketDetailsPage,
    props: true,
    meta: { title: `${DOMAIN_TITLE} | ticket` }
  },
  {
    path: '/history/lottery/:orderNumber',
    name: 'lottery-details',
    component: lotteryResultDetailsPage,
    props: true,
    meta: { title: `${DOMAIN_TITLE} | lottery entry` }
  },
  {
    path: '/account',
    name: 'account',
    component: accountSettingsPage,
    meta: { isAuth: true, title: `${DOMAIN_TITLE} | account settings` }
  },
  {
    path: '/guidelines',
    name: 'guidelines',
    component: guidelinesPage,
    meta: { title: `${DOMAIN_TITLE} | guidelines` }
  },
  {
    path: '/about',
    name: 'about',
    component: aboutPage,
    meta: { title: `${DOMAIN_TITLE} | about` }
  },
  {
    path: '/contact',
    name: 'contact',
    component: contactPage,
    meta: { title: `${DOMAIN_TITLE} | contact` }
  },
  {
    path: '/login',
    name: 'login',
    component: loginPage,
    meta: { title: `${DOMAIN_TITLE} | login` }
  },
  {
    path: '/register',
    name: 'register',
    component: registerPage,
    meta: { title: `${DOMAIN_TITLE} | register` }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: forgotPasswordPage,
    meta: { title: `${DOMAIN_TITLE} | forgot password` }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: resetPasswordPage,
    meta: { title: `${DOMAIN_TITLE} | reset password` }
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
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · idols` }
  },
  {
    path: '/manager/idols/new',
    name: 'manager-idols-new',
    component: managerIdolFormPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · add idol` }
  },
  {
    path: '/manager/idols/:id/edit',
    name: 'manager-idols-edit',
    component: managerIdolFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · edit idol` }
  },
  {
    path: '/manager/groups',
    name: 'manager-groups',
    component: managerGroupsPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · groups` }
  },
  {
    path: '/manager/groups/new',
    name: 'manager-groups-new',
    component: managerGroupFormPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · add group` }
  },
  {
    path: '/manager/groups/:id/edit',
    name: 'manager-groups-edit',
    component: managerGroupFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · edit group` }
  },
  {
    path: '/manager/events',
    name: 'manager-events',
    component: managerEventsPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · events` }
  },
  {
    path: '/manager/events/new',
    name: 'manager-events-new',
    component: managerEventFormPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · add event` }
  },
  {
    path: '/manager/events/:id/edit',
    name: 'manager-events-edit',
    component: managerEventFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · edit event` }
  },
  {
    path: '/manager/products',
    name: 'manager-products',
    component: managerProductsPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · products` }
  },
  {
    path: '/manager/products/new',
    name: 'manager-products-new',
    component: managerProductFormPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · add product` }
  },
  {
    path: '/manager/products/:id/edit',
    name: 'manager-products-edit',
    component: managerProductFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · edit product` }
  },
  {
    path: '/manager/products/:id/sales',
    name: 'manager-products-sales',
    component: managerProductSalesPage,
    props: true,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · product sales` }
  },
  {
    path: '/manager/orders',
    name: 'manager-orders',
    component: managerOrdersPage,
    meta: { isAuth: true, roles: ['manager'], title: `${DOMAIN_TITLE} | manager · orders` }
  },

  // --- admin: unscoped, picks a company via the same picker manager
  // pages used to share (see AdminIdolsPage.vue and friends) ---
  {
    path: '/admin/idols',
    name: 'admin-idols',
    component: adminIdolsPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · idols` }
  },
  {
    path: '/admin/idols/new',
    name: 'admin-idols-new',
    component: adminIdolFormPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · add idol` }
  },
  {
    path: '/admin/idols/:id/edit',
    name: 'admin-idols-edit',
    component: adminIdolFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · edit idol` }
  },
  {
    path: '/admin/groups',
    name: 'admin-groups',
    component: adminGroupsPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · groups` }
  },
  {
    path: '/admin/groups/new',
    name: 'admin-groups-new',
    component: adminGroupFormPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · add group` }
  },
  {
    path: '/admin/groups/:id/edit',
    name: 'admin-groups-edit',
    component: adminGroupFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · edit group` }
  },
  {
    path: '/admin/events',
    name: 'admin-events',
    component: adminEventsPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · events` }
  },
  {
    path: '/admin/events/new',
    name: 'admin-events-new',
    component: adminEventFormPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · add event` }
  },
  {
    path: '/admin/events/:id/edit',
    name: 'admin-events-edit',
    component: adminEventFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · edit event` }
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: adminProductsPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · products` }
  },
  {
    path: '/admin/products/new',
    name: 'admin-products-new',
    component: adminProductFormPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · add product` }
  },
  {
    path: '/admin/products/:id/edit',
    name: 'admin-products-edit',
    component: adminProductFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · edit product` }
  },
  {
    path: '/admin/companies',
    name: 'admin-companies',
    component: adminCompaniesPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · companies` }
  },
  {
    path: '/admin/companies/new',
    name: 'admin-companies-new',
    component: adminCompanyFormPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · add company` }
  },
  {
    path: '/admin/companies/:id/edit',
    name: 'admin-companies-edit',
    component: adminCompanyFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · edit company` }
  },
  {
    path: '/admin/companies/:id/managers/new',
    name: 'admin-manager-account-new',
    component: adminManagerAccountFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | admin · add manager account` }
  },
  {
    path: '/:pathMatch(.*)*',
    component: notFoundPage,
    meta: { title: `${DOMAIN_TITLE} | not found` }
  }
]
