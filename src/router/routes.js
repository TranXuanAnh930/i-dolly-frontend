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
import notFoundPage from '../pages/NotFound.vue'

import managerIdolsPage from '../pages/manager/ManagerIdolsPage.vue'
import managerIdolFormPage from '../pages/manager/ManagerIdolFormPage.vue'
import managerGroupsPage from '../pages/manager/ManagerGroupsPage.vue'
import managerGroupFormPage from '../pages/manager/ManagerGroupFormPage.vue'
import managerEventsPage from '../pages/manager/ManagerEventsPage.vue'
import managerEventFormPage from '../pages/manager/ManagerEventFormPage.vue'
import managerProductsPage from '../pages/manager/ManagerProductsPage.vue'
import managerProductFormPage from '../pages/manager/ManagerProductFormPage.vue'

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
    path: '/settings',
    redirect: { name: 'manager-idols' }
  },
  {
    path: '/settings/idols',
    name: 'manager-idols',
    component: managerIdolsPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · idols` }
  },
  {
    path: '/settings/idols/new',
    name: 'manager-idols-new',
    component: managerIdolFormPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · add idol` }
  },
  {
    path: '/settings/idols/:id/edit',
    name: 'manager-idols-edit',
    component: managerIdolFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · edit idol` }
  },
  {
    path: '/settings/groups',
    name: 'manager-groups',
    component: managerGroupsPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · groups` }
  },
  {
    path: '/settings/groups/new',
    name: 'manager-groups-new',
    component: managerGroupFormPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · add group` }
  },
  {
    path: '/settings/groups/:id/edit',
    name: 'manager-groups-edit',
    component: managerGroupFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · edit group` }
  },
  {
    path: '/settings/events',
    name: 'manager-events',
    component: managerEventsPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · events` }
  },
  {
    path: '/settings/events/new',
    name: 'manager-events-new',
    component: managerEventFormPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · add event` }
  },
  {
    path: '/settings/events/:id/edit',
    name: 'manager-events-edit',
    component: managerEventFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · edit event` }
  },
  {
    path: '/settings/products',
    name: 'manager-products',
    component: managerProductsPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · products` }
  },
  {
    path: '/settings/products/new',
    name: 'manager-products-new',
    component: managerProductFormPage,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · add product` }
  },
  {
    path: '/settings/products/:id/edit',
    name: 'manager-products-edit',
    component: managerProductFormPage,
    props: true,
    meta: { isAuth: true, roles: ['manager', 'admin'], title: `${DOMAIN_TITLE} | settings · edit product` }
  },
  {
    path: '/settings/companies',
    name: 'admin-companies',
    component: adminCompaniesPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | settings · companies` }
  },
  {
    path: '/settings/companies/new',
    name: 'admin-companies-new',
    component: adminCompanyFormPage,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | settings · add company` }
  },
  {
    path: '/settings/companies/:id/edit',
    name: 'admin-companies-edit',
    component: adminCompanyFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | settings · edit company` }
  },
  {
    path: '/settings/companies/:id/managers/new',
    name: 'admin-manager-account-new',
    component: adminManagerAccountFormPage,
    props: true,
    meta: { isAuth: true, roles: ['admin'], title: `${DOMAIN_TITLE} | settings · add manager account` }
  },
  {
    path: '/:pathMatch(.*)*',
    component: notFoundPage,
    meta: { title: `${DOMAIN_TITLE} | not found` }
  }
]
