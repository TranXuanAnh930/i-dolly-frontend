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

      <div class="stats">
        <div class="stat">
          <span class="stat__value">6</span>
          <span class="stat__label">{{ $t('about.statUnits') }}</span>
        </div>
        <div class="stat">
          <span class="stat__value">18</span>
          <span class="stat__label">{{ $t('about.statIdols') }}</span>
        </div>
        <div class="stat">
          <span class="stat__value">12+</span>
          <span class="stat__label">{{ $t('about.statShows') }}</span>
        </div>
        <div class="stat">
          <span class="stat__value">7</span>
          <span class="stat__label">{{ $t('about.statVenues') }}</span>
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

.stats {
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

.stat {
  background: $color-white;
  padding: 22px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.stat__value {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: 30px;
  color: $color-brand;
}

.stat__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: $color-gray-500;
}
</style>
