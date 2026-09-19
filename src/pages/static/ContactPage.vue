<template>
  <div class="contact-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('contact.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('contact.title') }}</h1>
        <p class="hero__sub">{{ $t('contact.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <div v-if="sent" class="confirmation">
        <div class="confirmation__badge">✓</div>
        <h2 class="confirmation__title">{{ $t('contact.successTitle') }}</h2>
        <p class="confirmation__note">{{ $t('contact.successBody') }}</p>
        <div class="confirmation__actions">
          <button type="button" class="confirmation__btn" @click="sendAnother">{{ $t('contact.sendAnother') }}</button>
          <router-link to="/events" class="confirmation__link">{{ $t('contact.backEvents') }}</router-link>
        </div>
      </div>

      <form v-else class="panel" @submit.prevent="submit">
        <div class="field-grid">
          <label class="field">
            <span class="field__label">{{ $t('common.name') }}</span>
            <input type="text" v-model="form.name" :placeholder="$t('common.name')" autocomplete="name">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('common.email') }}</span>
            <input type="text" v-model="form.email" placeholder="you@example.com" autocomplete="email">
          </label>
        </div>

        <label class="field">
          <span class="field__label">{{ $t('contact.subjectLabel') }}</span>
          <select v-model="form.subject" class="field__select">
            <option value="general">{{ $t('contact.subjectGeneral') }}</option>
            <option value="order">{{ $t('contact.subjectOrder') }}</option>
            <option value="lottery">{{ $t('contact.subjectLottery') }}</option>
            <option value="account">{{ $t('contact.subjectAccount') }}</option>
            <option value="other">{{ $t('contact.subjectOther') }}</option>
          </select>
        </label>

        <label class="field">
          <span class="field__label">{{ $t('contact.messageLabel') }}</span>
          <textarea v-model="form.message" rows="5" :placeholder="$t('contact.messagePlaceholder')"></textarea>
        </label>

        <p class="form-error" v-if="error" :key="error">{{ error }}</p>

        <button type="submit" class="submit-btn">{{ $t('contact.submit') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useToastStore } from '@/store/toast'

export default {
  name: 'ContactPage',

  data () {
    return {
      form: {
        name: '',
        email: '',
        subject: 'general',
        message: ''
      },
      error: '',
      sent: false
    }
  },

  created () {
    if (this.$currentUser.name) this.form.name = this.$currentUser.name
    if (this.$currentUser.email) this.form.email = this.$currentUser.email
  },

  methods: {
    submit () {
      if (!this.form.name.trim() || !/^\S+@\S+\.\S+$/.test(this.form.email) || !this.form.message.trim()) {
        this.error = this.$t('contact.errorRequired')
        return
      }
      this.error = ''

      // No real support backend exists yet — mocked, same pattern as
      // Register/Checkout, so the flow can be demoed end to end.
      useToastStore().add({ type: 'success', message: this.$t('contact.successTitle') })
      this.sent = true
    },
    sendAnother () {
      this.form.message = ''
      this.form.subject = 'general'
      this.sent = false
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-page {
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
  margin-top: 8px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
}

.content {
  padding-bottom: 90px;
}

.panel {
  max-width: 720px;
  margin: 0 auto;
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @include media_mobile {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-gray-500;
}

.field input,
.field__select,
.field textarea {
  border: 1.5px solid $color-line;
  border-radius: 12px;
  padding: 11px 14px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
  background: $color-white;

  &::placeholder {
    color: $color-gray-300;
  }

  &:focus {
    border-color: $color-brand;
    box-shadow: 0 0 0 4px $color-brand-tint;
  }
}

.field textarea {
  resize: vertical;
  font-family: $font-content;
}

.form-error {
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
}

.submit-btn {
  margin-top: 4px;
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.confirmation {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  padding: 70px 20px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.confirmation__badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1fa876;
  color: $color-white;
  font-size: 28px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: 28px;
  color: $color-brand;
}

.confirmation__note {
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
  max-width: 42ch;
}

.confirmation__actions {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.confirmation__btn {
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.confirmation__link {
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
