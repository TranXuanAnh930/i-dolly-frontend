<template>
  <div class="not-found-page">
    <div class="wrapper content">
      <span class="content__code" aria-hidden="true">404</span>
      <p class="content__eyebrow">{{ $t('notFoundPage.eyebrow') }}</p>
      <h1 class="content__title">{{ $t('notFoundPage.title') }}</h1>
      <p class="content__sub">{{ $t('notFoundPage.sub') }}</p>

      <div class="content__actions">
        <router-link to="/" class="content__btn">{{ $t('notFoundPage.backHome') }}</router-link>
        <router-link to="/store" class="content__link">{{ $t('notFoundPage.goToStore') }} &rarr;</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style lang="scss" scoped>
.not-found-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px 100px;
  overflow: hidden;
}

.content__code {
  position: absolute;
  top: 6%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(140px, 32vw, 280px);
  line-height: 1;
  color: $color-brand;
  opacity: .1;
  user-select: none;
}

.content__eyebrow {
  position: relative;
  z-index: 1;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: $color-brand;
}

.content__title {
  position: relative;
  z-index: 1;
  margin-top: 6px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(32px, 6vw, 56px);
  line-height: 1.1;
  color: $color-ink;
}

.content__sub {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  max-width: 42ch;
  font-family: $font-content;
  font-size: 15px;
  line-height: 1.6;
  color: $color-font-main;
}

.content__actions {
  position: relative;
  z-index: 1;
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.content__btn {
  border: none;
  border-radius: 999px;
  padding: 14px 32px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.content__link {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
  text-decoration: none;

  &:hover {
    color: $color-brand;
  }
}
</style>
