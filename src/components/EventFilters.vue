<template>
  <div class="event-filters">
    <div class="search-row">
      <div class="search-field">
        <svg class="search-field__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2"/>
          <line x1="13.5" y1="13.5" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          type="text"
          class="search-field__input"
          :placeholder="$t('events.searchPlaceholder')"
          :value="search"
          @input="$emit('update:search', $event.target.value)">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventFilters',

  props: {
    search: { type: String, default: '' }
  },

  emits: ['update:search']
}
</script>

<style lang="scss" scoped>
.event-filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: $color-white;
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: 0 10px 24px -10px rgba($color-ink, .18);
}

.search-row {
  display: flex;
  gap: 10px;

  @include media_mobile {
    flex-direction: column;
  }
}

.search-field {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-field__icon {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: $color-gray-400;
  pointer-events: none;
}

.search-field__input {
  width: 100%;
  border: 1.5px solid $color-line;
  border-radius: 999px;
  padding: 10px 14px 10px 38px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  outline: none;
  transition: border-color .15s ease;

  &::placeholder {
    color: $color-gray-300;
  }

  &:focus {
    border-color: $color-brand;
  }
}

</style>
