<template>
  <UiOnClickOutside :do="close">
    <div class="row-actions" :class="{ 'is-open': open }" @keydown.esc="close">
      <button
        type="button"
        class="row-actions__toggle"
        :aria-label="$t('common.actions')"
        aria-haspopup="true"
        :aria-expanded="open ? 'true' : 'false'"
        @click="toggle"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="4" cy="10" r="1.7"/>
          <circle cx="10" cy="10" r="1.7"/>
          <circle cx="16" cy="10" r="1.7"/>
        </svg>
      </button>

      <!-- Same slotted links/buttons either way: laid out inline on desktop,
           collapsed behind the toggle above as a dropdown on phones. Any
           click inside (i.e. picking an action) closes the menu. -->
      <div class="row-actions__list" @click="close">
        <slot />
      </div>
    </div>
  </UiOnClickOutside>
</template>

<script>
import UiOnClickOutside from './UiOnClickOutside.vue'

export default {
  name: 'UiRowActions',

  components: { UiOnClickOutside },

  data () {
    return {
      open: false
    }
  },

  methods: {
    toggle () {
      this.open = !this.open
    },
    close () {
      this.open = false
    }
  }
}
</script>

<style lang="scss" scoped>
.row-actions {
  position: relative;
}

.row-actions__toggle {
  display: none;
}

.row-actions__list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@include media_mobile {
  .row-actions {
    display: flex;
    justify-content: flex-end;
  }

  .row-actions__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1.5px solid $color-line;
    border-radius: 10px;
    background: $color-white;
    color: $color-ink;
    cursor: pointer;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .row-actions.is-open .row-actions__toggle {
    border-color: $color-brand;
    color: $color-brand;
  }

  .row-actions__list {
    display: none;
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 10;
    min-width: 160px;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 6px;
    background: $color-white;
    border-radius: 12px;
    box-shadow: 0 16px 32px -12px rgba($color-ink, .35), 0 0 1px 1px rgba($color-gray-500, .08);
  }

  .row-actions.is-open .row-actions__list {
    display: flex;
  }

  // Selector deliberately heavier than a page's own ".actions a/button"
  // button styling, which the slotted items also carry — as menu rows they
  // should read as plain list items, not a stack of bordered buttons.
  .row-actions .row-actions__list :slotted(a),
  .row-actions .row-actions__list :slotted(button) {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    background: none;
    font-size: 13.5px;
    text-align: left;
    white-space: nowrap;

    &:hover {
      background: $color-gray-50;
    }
  }

  .row-actions .row-actions__list :slotted(.danger) {
    color: $color-error;
  }
}
</style>
