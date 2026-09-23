<template>
  <div class="about-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('about.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('about.title') }}</h1>
        <p class="hero__sub">{{ $t('about.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <div class="panel">
        <p class="panel__text">{{ $t('about.intro') }}</p>
      </div>

      <div class="features">
        <div class="feature">
          <span class="feature__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 6.5h10l-.8 8.5a1.5 1.5 0 0 1-1.5 1.4H7.3a1.5 1.5 0 0 1-1.5-1.4L5 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <h3 class="feature__title">{{ $t('about.featureMarketplaceTitle') }}</h3>
          <p class="feature__body">{{ $t('about.featureMarketplaceBody') }}</p>
        </div>
        <div class="feature">
          <span class="feature__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 17 6v1.5a1.5 1.5 0 0 0 0 3V14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14v-3.5a1.5 1.5 0 0 0 0-3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M11 5v10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1.6 1.6" stroke-linecap="round"/>
            </svg>
          </span>
          <h3 class="feature__title">{{ $t('about.featureTicketsTitle') }}</h3>
          <p class="feature__body">{{ $t('about.featureTicketsBody') }}</p>
        </div>
        <div class="feature">
          <span class="feature__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 8.5h16" stroke="currentColor" stroke-width="1.5"/>
              <path d="M5 12.5h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <h3 class="feature__title">{{ $t('about.featurePaypalTitle') }}</h3>
          <p class="feature__body">{{ $t('about.featurePaypalBody') }}</p>
        </div>
        <div class="feature">
          <span class="feature__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="4.5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2.5 5.5 10 11 17.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <h3 class="feature__title">{{ $t('about.featureEmailTitle') }}</h3>
          <p class="feature__body">{{ $t('about.featureEmailBody') }}</p>
        </div>
      </div>

      <div class="panel">
        <h2 class="panel__title">{{ $t('about.noteTitle') }}</h2>
        <div class="section-rule"></div>
        <p class="panel__text">{{ $t('about.noteBody') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style lang="scss" scoped>
.about-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 40px 0 40px;
}

.hero__eyebrow {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: $color-brand;
  margin-bottom: 8px;
}

.hero__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(30px, 5vw, 44px);
  color: $color-brand;
}

.hero__sub {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
}

.content {
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
}

.panel__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
}

.section-rule {
  margin-top: 8px;
  margin-bottom: 16px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, $color-brand, #f2b705, #1f8fd6, #b6379c, #1fa876);
}

.panel__text {
  font-family: $font-content;
  font-size: 14px;
  line-height: 1.6;
  color: $color-font-main;
}

.features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: $color-line;
  border: 1px solid $color-line;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);

  @include media_mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.feature {
  background: $color-white;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.feature__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $color-brand-tint;
  color: $color-brand;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

.feature__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-ink;
}

.feature__body {
  font-family: $font-content;
  font-size: 12px;
  line-height: 1.5;
  color: $color-gray-500;
}
</style>
