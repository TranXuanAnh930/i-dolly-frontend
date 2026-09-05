<template>
  <div class="guidelines-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('guidelines.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('guidelines.title') }}</h1>
        <p class="hero__sub">{{ $t('guidelines.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <section class="panel">
        <h2 class="panel__title">{{ $t('guidelines.directSaleTitle') }}</h2>
        <div class="section-rule"></div>
        <p class="panel__text">{{ $t('guidelines.directSaleBody') }}</p>
      </section>

      <section class="panel">
        <h2 class="panel__title">{{ $t('guidelines.lotteryTitle') }}</h2>
        <div class="section-rule"></div>
        <p class="panel__text">{{ $t('guidelines.lotteryBody') }}</p>
      </section>

      <section class="panel">
        <h2 class="panel__title">{{ $t('guidelines.releasesTitle') }}</h2>
        <div class="section-rule"></div>
        <p class="panel__text">{{ $t('guidelines.releasesBody') }}</p>
      </section>

      <section class="panel">
        <h2 class="panel__title">{{ $t('guidelines.venueTitle') }}</h2>
        <div class="section-rule"></div>
        <ul class="panel__list">
          <li>{{ $t('guidelines.venueItem1') }}</li>
          <li>{{ $t('guidelines.venueItem2') }}</li>
          <li>{{ $t('guidelines.venueItem3') }}</li>
          <li>{{ $t('guidelines.venueItem4') }}</li>
          <li>{{ $t('guidelines.venueItem5') }}</li>
        </ul>
      </section>

      <section class="panel">
        <h2 class="panel__title">{{ $t('guidelines.supportTitle') }}</h2>
        <div class="section-rule"></div>
        <p class="panel__text">{{ $t('guidelines.supportBody') }}</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuidelinesPage'
}
</script>

<style lang="scss" scoped>
.guidelines-page {
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
  font-size: clamp(34px, 6vw, 48px);
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

.panel__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 20px;
  list-style: disc;

  li {
    font-family: $font-content;
    font-size: 14px;
    line-height: 1.5;
    color: $color-font-main;
  }
}
</style>
