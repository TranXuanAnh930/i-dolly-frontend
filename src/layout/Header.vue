<template>
  <div class="header">
    <UiToastList/>

    <div class="wrapper header__inner">
      <router-link :to="{ name: 'index' }" class="brand">
        <span class="brand__badge">
          <BowIcon/>
        </span>
        <span class="brand__word">I-Dolly</span>
        <svg class="brand__spark" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z"/>
        </svg>
      </router-link>

      <UiOnClickOutside :do="closeMobile">
        <div class="mobile-nav">
          <button
            type="button"
            class="burger"
            :class="{ 'is-open': mobileOpen }"
            :aria-label="$t('common.menu')"
            :aria-expanded="mobileOpen"
            @click="toggleMobile">
            <span></span><span></span><span></span>
          </button>

          <ul class="menu" :class="{ 'is-open': mobileOpen }">
            <template v-if="isStaff">
              <li>
                <router-link :to="{ name: 'manager-idols' }" class="menu__link">Idols</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'manager-groups' }" class="menu__link">Groups</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'manager-events' }" class="menu__link">Events</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'manager-products' }" class="menu__link">Products</router-link>
              </li>
              <li v-if="isAdmin">
                <router-link :to="{ name: 'admin-companies' }" class="menu__link">Companies</router-link>
              </li>
            </template>
            <template v-else>
              <li>
                <router-link :to="{ name: 'events' }" class="menu__link">{{ $t('nav.events') }}</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'members' }" class="menu__link">{{ $t('nav.members') }}</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'store' }" class="menu__link">{{ $t('nav.store') }}</router-link>
              </li>
            </template>
            <li class="menu-item--desktop">
              <NotificationDropdown/>
            </li>
            <li class="menu-item--mobile">
              <router-link to="/history" class="menu__link">
                {{ $t('nav.notifications') }}<span v-if="unreadCount" class="menu__count">{{ unreadCount }}</span>
              </router-link>
            </li>

            <li v-if="!isStaff" class="menu-item--desktop">
              <router-link :to="{ name: 'cart' }" class="cart-link" :aria-label="$t('nav.cart')">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 6.5h10l-.8 8.5a1.5 1.5 0 0 1-1.5 1.4H7.3a1.5 1.5 0 0 1-1.5-1.4L5 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span v-if="cartCount" class="cart-link__badge">{{ cartCount }}</span>
              </router-link>
            </li>
            <li v-if="!isStaff" class="menu-item--mobile">
              <router-link :to="{ name: 'cart' }" class="menu__link">
                {{ $t('nav.cart') }}<span v-if="cartCount" class="menu__count">{{ cartCount }}</span>
              </router-link>
            </li>

            <li v-if="!$currentUser.id">
              <router-link :to="{ name: 'login' }" class="menu__link">{{ $t('nav.login') }}</router-link>
            </li>
            <li v-if="$currentUser.id">
              <span class="menu__link menu__link--action" @click="logout()">{{ $t('nav.logout') }}</span>
            </li>
            <li>
              <LanguageSwitcher/>
            </li>

            <li class="menu-item--desktop">
              <UiHeaderDropdownMenu/>
            </li>
            <li class="menu-item--mobile">
              <router-link to="/account" class="menu__link">{{ $t('menu.accountSettings.title') }}</router-link>
            </li>
            <li class="menu-item--mobile">
              <router-link to="/contact" class="menu__link">{{ $t('menu.contact.title') }}</router-link>
            </li>
            <li class="menu-item--mobile">
              <router-link to="/guidelines" class="menu__link">{{ $t('menu.guidelines.title') }}</router-link>
            </li>
            <li class="menu-item--mobile">
              <router-link to="/about" class="menu__link">{{ $t('menu.about.title') }}</router-link>
            </li>
          </ul>
        </div>
      </UiOnClickOutside>
    </div>
  </div>
</template>

<script>
import { AuthService } from '../services/auth.service'

import UiHeaderDropdownMenu from '@/components/UiHeaderDropdownMenu.vue'
import UiToastList from '@/components/UiToastList'
import UiOnClickOutside from '@/components/UiOnClickOutside.vue'
import BowIcon from '@/components/icons/BowIcon.vue'
import NotificationDropdown from '@/components/NotificationDropdown.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useCartStore } from '@/store/cart'
import { useNotificationStore } from '@/store/notifications'

export default {
  name: 'Header',
  components: {
    UiToastList,
    UiHeaderDropdownMenu,
    UiOnClickOutside,
    BowIcon,
    NotificationDropdown,
    LanguageSwitcher
  },
  data () {
    return {
      mobileOpen: false
    }
  },
  computed: {
    cartCount () {
      return useCartStore().itemCount
    },
    unreadCount () {
      return useNotificationStore().unreadCount
    },
    isStaff () {
      return ['manager', 'admin'].includes(this.$currentUser.role)
    },
    isAdmin () {
      return this.$currentUser.role === 'admin'
    }
  },
  watch: {
    $route () {
      this.closeMobile()
    }
  },
  methods: {
    toggleMobile () {
      this.mobileOpen = !this.mobileOpen
    },
    closeMobile () {
      this.mobileOpen = false
    },
    async logout () {
      // session is cleared and redirect happens in makeLogout regardless
      // of whether the API call succeeds, so a failed request can be ignored here
      await AuthService.makeLogout().catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  z-index: 2;
  background: $color-brand;
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 10px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.brand__badge {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $color-white;
  color: $color-brand;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba($color-ink, .25);

  svg {
    width: 18px;
    height: 18px;
  }
}

.brand__word {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: 21px;
  letter-spacing: .01em;
  color: $color-white;
  transform: rotate(-2deg);
}

.brand__spark {
  flex: none;
  width: 12px;
  height: 12px;
  color: #ffd54f;
  transform: rotate(12deg);
  margin-left: -2px;
  align-self: flex-start;
  margin-top: 2px;
}

.mobile-nav {
  display: flex;
  align-items: center;
}

.burger {
  display: none;
  flex: none;
  width: 34px;
  height: 34px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;

  span {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 2px;
    background: $color-white;
    transition: transform .2s ease, opacity .2s ease;
  }

  &.is-open {
    span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }

  @include media_mobile {
    display: flex;
  }
}

.menu {
  display: flex;
  align-items: center;
  gap: 22px;

  .is-active {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  @include media_mobile {
    display: none;
    position: absolute;
    top: calc(100% + 16px);
    left: -10px;
    right: -10px;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    background: $color-brand;
    padding: 8px 10px 18px;
    box-shadow: 0 20px 30px -12px rgba($color-ink, .35);
    max-height: calc(100vh - 80px);
    overflow-y: auto;

    &.is-open {
      display: flex;
    }

    li {
      width: 100%;

      &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, .15);
      }
    }

    :deep(.lang-switch) {
      display: inline-flex;
      margin: 10px 0;
    }
  }
}

.menu-item--mobile {
  display: none;
}

@include media_mobile {
  .menu-item--desktop {
    display: none;
  }

  .menu-item--mobile {
    display: block;
  }
}

.menu__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 8px;
  border-radius: 999px;
  background: #f2b705;
  color: $color-ink;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  vertical-align: middle;
}

.menu__link {
  display: block;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;

  &--action:hover {
    opacity: .8;
  }

  @include media_mobile {
    padding: 12px 8px;
  }
}

.cart-link {
  position: relative;
  display: flex;
  color: $color-white;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    opacity: .8;
  }
}

.cart-link__badge {
  position: absolute;
  top: -7px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 999px;
  background: #f2b705;
  color: $color-ink;
  font-family: $font-content;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
}
</style>
