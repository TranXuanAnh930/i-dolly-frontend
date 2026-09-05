import eventsPage from '../pages/EventsPage.vue'
import eventDetailPage from '../pages/EventDetailPage.vue'
import ticketPurchasePage from '../pages/TicketPurchasePage.vue'
import membersPage from '../pages/MembersPage.vue'
import idolDetailPage from '../pages/IdolDetailPage.vue'
import storePage from '../pages/StorePage.vue'
import cartPage from '../pages/CartPage.vue'
import checkoutPage from '../pages/CheckoutPage.vue'
import historyPage from '../pages/HistoryPage.vue'
import accountSettingsPage from '../pages/AccountSettingsPage.vue'
import guidelinesPage from '../pages/GuidelinesPage.vue'
import aboutPage from '../pages/AboutPage.vue'
import contactPage from '../pages/ContactPage.vue'
import loginPage from '../pages/Login.vue'
import registerPage from '../pages/RegisterPage.vue'
import notFoundPage from '../pages/NotFound.vue'

import { DOMAIN_TITLE } from '../env'

export const routes = [
  {
    path: '/',
    name: 'index',
    component: eventsPage,
    meta: { title: `${DOMAIN_TITLE} | events` }
  },
  {
    path: '/events',
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
    meta: { title: `${DOMAIN_TITLE} | tickets` }
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
    path: '/store',
    name: 'store',
    component: storePage,
    meta: { title: `${DOMAIN_TITLE} | store` }
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
    meta: { title: `${DOMAIN_TITLE} | checkout` }
  },
  {
    path: '/history',
    name: 'history',
    component: historyPage,
    meta: { title: `${DOMAIN_TITLE} | history` }
  },
  {
    path: '/account',
    name: 'account',
    component: accountSettingsPage,
    meta: { title: `${DOMAIN_TITLE} | account settings` }
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
    path: '/:pathMatch(.*)*',
    component: notFoundPage,
    meta: { title: `${DOMAIN_TITLE} | not found` }
  }
]
