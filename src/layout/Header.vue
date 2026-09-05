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

      <ul class="menu">
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
        <li>
          <NotificationDropdown/>
        </li>
        <li v-if="!isStaff">
          <router-link :to="{ name: 'cart' }" class="cart-link" :aria-label="$t('nav.cart')">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 6.5h10l-.8 8.5a1.5 1.5 0 0 1-1.5 1.4H7.3a1.5 1.5 0 0 1-1.5-1.4L5 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span v-if="cartCount" class="cart-link__badge">{{ cartCount }}</span>
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
        <li>
          <UiHeaderDropdownMenu/>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { AuthService } from '../services/auth.service'

import UiHeaderDropdownMenu from '@/components/UiHeaderDropdownMenu.vue'
import UiToastList from '@/components/UiToastList'
import BowIcon from '@/components/icons/BowIcon.vue'
import NotificationDropdown from '@/components/NotificationDropdown.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useCartStore } from '@/store/cart'

export default {
  name: 'Header',
  components: {
    UiToastList,
    UiHeaderDropdownMenu,
    BowIcon,
    NotificationDropdown,
    LanguageSwitcher
  },
  computed: {
    cartCount () {
      return useCartStore().itemCount
    },
    isStaff () {
      return ['manager', 'admin'].includes(this.$currentUser.role)
    },
    isAdmin () {
      return this.$currentUser.role === 'admin'
    }
  },
  methods: {
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

.menu {
  display: flex;
  align-items: center;
  gap: 22px;

  .is-active {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}

.menu__link {
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;

  &--action:hover {
    opacity: .8;
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
