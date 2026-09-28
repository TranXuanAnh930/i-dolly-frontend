<template>
  <!-- lang follows the site language so browsers pick Japanese glyph shapes
       for kanji (without it some render in Chinese forms). -->
  <div class="contact-page" :lang="lang">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('contact.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('contact.title') }}</h1>
        <p class="hero__sub">{{ $t('contact.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <!-- Submitted -->
      <div v-if="submitted" class="confirmation">
        <div class="confirmation__badge">✓</div>
        <h2 class="confirmation__title">{{ $t('contact.successTitle') }}</h2>
        <!-- Deliberately never "we've sent you an email": past a per-address
             limit the server skips the confirmation but still returns 200. -->
        <i18n-t keypath="contact.successMessage" tag="p" class="confirmation__note">
          <template #id><code class="confirmation__reference">{{ submitted.id }}</code></template>
          <template #email>{{ submitted.email }}</template>
        </i18n-t>
        <div class="confirmation__actions">
          <button type="button" class="confirmation__btn" @click="startOver">{{ $t('contact.sendAnother') }}</button>
          <router-link to="/events" class="confirmation__link">{{ $t('contact.backEvents') }}</router-link>
        </div>
      </div>

      <!-- Instant answer solved it — nothing gets submitted -->
      <div v-else-if="helped" class="confirmation">
        <div class="confirmation__badge">✓</div>
        <h2 class="confirmation__title">{{ $t('contact.helpedTitle') }}</h2>
        <p class="confirmation__note">{{ $t('contact.helpedNote') }}</p>
        <div class="confirmation__actions">
          <button type="button" class="confirmation__btn" @click="startOver">{{ $t('contact.askSomethingElse') }}</button>
          <router-link to="/events" class="confirmation__link">{{ $t('contact.backEvents') }}</router-link>
        </div>
      </div>

      <form v-else class="panel" novalidate @submit.prevent="submit">
        <label class="field">
          <span class="field__label">{{ $t('contact.emailLabel') }}</span>
          <input
            type="email"
            inputmode="email"
            v-model="form.email"
            placeholder="you@example.com"
            autocomplete="email"
            @keydown.enter="ignoreImeEnter"
            @blur="validateField('email')"
            :class="{ 'is-invalid': fieldErrors.email }"
            :aria-invalid="!!fieldErrors.email"
            aria-describedby="contact-email-error">
          <span v-if="fieldErrors.email" id="contact-email-error" class="field__error">{{ $t(fieldErrors.email.key, fieldErrors.email.params) }}</span>
        </label>

        <label class="field">
          <span class="field__label">{{ $t('contact.topicLabel') }}</span>
          <select
            v-model="form.topic"
            class="field__select"
            :class="{ 'is-invalid': fieldErrors.topic, 'is-placeholder': !form.topic }"
            @blur="validateField('topic')"
            :aria-invalid="!!fieldErrors.topic"
            aria-describedby="contact-topic-error">
            <option value="" disabled>{{ $t('contact.topicPlaceholder') }}</option>
            <option v-for="topic in topics" :key="topic" :value="topic">{{ $t(`contact.topics.${topic}`) }}</option>
          </select>
          <span v-if="fieldErrors.topic" id="contact-topic-error" class="field__error">{{ $t(fieldErrors.topic.key, fieldErrors.topic.params) }}</span>
        </label>

        <label class="field">
          <span class="field__label-row">
            <span class="field__label">{{ $t('contact.messageLabel') }}</span>
            <span class="field__counter" :class="{ 'is-over': liveLength > maxLength }">{{ $t('contact.counter', { n: liveLength, max: maxLength }) }}</span>
          </span>
          <textarea
            v-model="form.content"
            rows="6"
            @input="liveContent = $event.target.value"
            @blur="validateField('content')"
            :placeholder="$t('contact.messagePlaceholder')"
            :class="{ 'is-invalid': fieldErrors.content }"
            :aria-invalid="!!fieldErrors.content"
            aria-describedby="contact-content-error"></textarea>
          <span v-if="fieldErrors.content" id="contact-content-error" class="field__error">{{ $t(fieldErrors.content.key, fieldErrors.content.params) }}</span>
        </label>

        <!-- Optional instant answer. Never shows an error of its own and
             never blocks Submit — skipping it entirely is always fine. -->
        <div class="instant" aria-live="polite">
          <template v-if="instant.status === 'shown'">
            <div class="instant__box">
              <p class="instant__label">{{ $t('contact.aiLabel') }}</p>
              <!-- Plain-text interpolation only (never v-html): this text
                   comes from an AI model and is treated as untrusted. -->
              <p class="instant__answer">{{ instant.answer }}</p>
            </div>
            <div class="instant__feedback">
              <span>{{ $t('contact.aiHelpfulQuestion') }}</span>
              <div class="instant__feedback-actions">
                <button type="button" class="chip-btn" @click="answerHelped">{{ $t('contact.aiYes') }}</button>
                <button type="button" class="chip-btn" @click="answerDidNotHelp">{{ $t('contact.aiNo') }}</button>
              </div>
            </div>
          </template>

          <template v-else-if="!instant.dismissed">
            <button
              type="button"
              class="check-btn"
              :disabled="!canCheckAnswer"
              @click="checkForAnswer">
              <span v-if="instant.status === 'loading'" class="spinner" aria-hidden="true"></span>
              {{ instant.status === 'loading' ? $t('contact.aiChecking') : $t('contact.aiCheck') }}
            </button>
            <p class="instant__hint">{{ instant.status === 'loading' ? $t('contact.aiLoadingHint') : $t('contact.aiHint') }}</p>
          </template>
        </div>

        <p class="form-error" v-if="submitError" :key="submitError.key">{{ $t(submitError.key) }}</p>

        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? $t('contact.submitting') : $t('contact.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { InquiriesService } from '@/services/support/inquiries.service'
import { UsersService } from '@/services/auth/users.service'

const TOPICS = ['tickets', 'lottery', 'orders', 'payment', 'account', 'other']
const MIN_LENGTH = 5
const MAX_LENGTH = 2000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FIELDS = ['email', 'topic', 'content']

// Counted the way the server counts: Unicode code points of the trimmed
// text. `.length` counts UTF-16 units, so 𠮷 or most emoji would count as 2
// and the counter would disagree with the server right at the limits.
// trim() also strips full-width spaces (U+3000), matching the server, so a
// message of only spaces counts as empty.
function codePointLength (text) {
  return [...text.trim()].length
}

// Full-width letters and ＠ (typed in Japanese input mode) become plain
// ASCII — otherwise the server 422s a perfectly good address. Only ever the
// email: NFKC on the message would rewrite the fan's Japanese (㈱ → (株)).
function normalizeEmail (email) {
  return email.normalize('NFKC').trim()
}

function emptyInstant () {
  // dismissed: the fan said "No" to an answer for the current question —
  // hides the check button until they edit it (the same question would
  // just get the same answer back).
  return { status: 'idle', answer: '', dismissed: false }
}

// Errors are kept as { key, params } and translated at render time, so
// switching the site language re-renders any error already on screen.
function emptyErrors () {
  return { email: null, topic: null, content: null }
}

function err (key, params) {
  return { key, params }
}

export default {
  name: 'ContactPage',

  data () {
    return {
      topics: TOPICS,
      maxLength: MAX_LENGTH,
      form: {
        email: '',
        topic: '',
        content: ''
      },
      // Mirrors the textarea on every input event, including mid-IME
      // conversion, which v-model deliberately skips — so the counter keeps
      // moving while Japanese is still being converted.
      liveContent: '',
      fieldErrors: emptyErrors(),
      instant: emptyInstant(),
      // Bumped whenever the question changes, so an instant answer that
      // lands after an edit (or after Submit won) is dropped, not shown.
      instantRequestId: 0,
      helped: false,
      submitting: false,
      submitError: null,
      submitted: null
    }
  },

  computed: {
    isLoggedIn () {
      return !!this.$currentUser.id
    },
    // Picks which FAQ the instant answer draws on; also the page's lang.
    lang () {
      return this.$i18n.locale === 'ja' ? 'ja' : 'en'
    },
    trimmedContent () {
      return this.form.content.trim()
    },
    contentLength () {
      return codePointLength(this.form.content)
    },
    liveLength () {
      return codePointLength(this.liveContent)
    },
    contentValid () {
      return this.contentLength >= MIN_LENGTH && this.contentLength <= MAX_LENGTH
    },
    canCheckAnswer () {
      return !!this.form.topic && this.contentValid && this.instant.status !== 'loading'
    }
  },

  watch: {
    // Any edit to the question makes a shown (or still-loading) answer
    // stale — it may no longer fit what's being asked. Editing a field also
    // clears that field's error; errors themselves only appear on blur or
    // submit, never mid-typing.
    'form.topic' () {
      this.fieldErrors.topic = null
      this.resetInstant()
    },
    'form.content' (value) {
      this.liveContent = value
      this.fieldErrors.content = null
      this.resetInstant()
    },
    'form.email' () {
      this.fieldErrors.email = null
    }
  },

  created () {
    this.prefillEmail()
  },

  methods: {
    // $currentUser is the GET /profile/me payload, already loaded by the
    // router guard before any page renders; only go back to /profile/me if
    // it somehow arrived without an email. Still just a starting value —
    // the fan can change it.
    async prefillEmail () {
      if (!this.isLoggedIn) return
      if (this.$currentUser.email) {
        this.form.email = this.$currentUser.email
        return
      }
      try {
        const response = await UsersService.getCurrent()
        if (!this.form.email && response.data.email) this.form.email = response.data.email
      } catch {
        // Pre-fill is a convenience — an empty field is fine.
      }
    },
    // Enter that confirms an IME conversion must never submit the form.
    // (keyCode 229 covers browsers that report composition that way.)
    ignoreImeEnter (event) {
      if (event.isComposing || event.keyCode === 229) event.preventDefault()
    },
    resetInstant () {
      if (this.instant.status === 'idle' && !this.instant.dismissed) return
      this.instantRequestId++
      this.instant = emptyInstant()
    },
    fieldError (field) {
      if (field === 'email') {
        const email = normalizeEmail(this.form.email)
        if (!email) return err('contact.errorEmailEmpty')
        if (!EMAIL_PATTERN.test(email)) return err('contact.errorEmailInvalid')
      }
      if (field === 'topic' && !this.form.topic) return err('contact.errorTopic')
      if (field === 'content') {
        if (this.contentLength === 0) return err('contact.errorContentEmpty')
        if (this.contentLength < MIN_LENGTH) return err('contact.errorContentShort', { min: MIN_LENGTH })
        if (this.contentLength > MAX_LENGTH) return err('contact.errorContentLong', { max: MAX_LENGTH })
      }
      return null
    },
    // On blur: only for a field the fan has actually put something in (or
    // already got an error on) — tabbing through an untouched form doesn't
    // light it up red. Submit checks everything regardless.
    validateField (field) {
      const hasValue = field === 'topic' ? !!this.form.topic : !!this.form[field].trim()
      if (!hasValue && !this.fieldErrors[field]) return
      this.fieldErrors[field] = this.fieldError(field)
    },
    validate () {
      const errors = emptyErrors()
      FIELDS.forEach(field => { errors[field] = this.fieldError(field) })
      this.fieldErrors = errors
      return FIELDS.every(field => !errors[field])
    },
    async checkForAnswer () {
      if (!this.canCheckAnswer) return
      const requestId = ++this.instantRequestId
      this.instant = { ...emptyInstant(), status: 'loading' }
      let answer = null
      try {
        const response = await InquiriesService.instantAnswer(
          { topic: this.form.topic, content: this.trimmedContent, lang: this.lang },
          { auth: this.isLoggedIn }
        )
        if (response.data && response.data.answerable && response.data.answer) answer = response.data.answer
      } catch {
        // 422 / 429 / 5xx / network: this step is optional, so it just
        // quietly falls back to the plain form — no error shown.
      }
      if (requestId !== this.instantRequestId) return
      this.instant = answer ? { ...emptyInstant(), status: 'shown', answer } : emptyInstant()
    },
    answerHelped () {
      this.helped = true
    },
    answerDidNotHelp () {
      // Keep everything they typed so they can go straight to Submit.
      this.instant = { ...emptyInstant(), dismissed: true }
    },
    async submit () {
      if (this.submitting) return
      this.submitError = null
      if (!this.validate()) return

      this.submitting = true
      try {
        // Normalized here rather than written back into the input: that
        // would fire the email watcher and clear an error validate() just
        // set. fieldError() validates this same normalized value.
        const email = normalizeEmail(this.form.email)
        const response = await InquiriesService.submit(
          { email, topic: this.form.topic, content: this.trimmedContent },
          { auth: this.isLoggedIn }
        )
        // Drop any instant answer still in flight.
        this.instantRequestId++
        this.submitted = { id: response.data.id, email }
      } catch (error) {
        this.handleSubmitError(error)
      } finally {
        this.submitting = false
      }
    },
    // The server's own 422/429 text is English-only, so it's never shown —
    // each case maps to this page's own (translated) message instead.
    handleSubmitError (error) {
      if (error.status === 422 && Array.isArray(error.detail)) {
        const errors = emptyErrors()
        const serverFieldMessages = {
          email: err('contact.errorEmailInvalid'),
          topic: err('contact.errorTopic'),
          content: err('contact.errorContentShort', { min: MIN_LENGTH })
        }
        let unmatched = false
        error.detail.forEach(item => {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : null
          if (FIELDS.includes(field)) errors[field] = serverFieldMessages[field]
          else unmatched = true
        })
        this.fieldErrors = errors
        if (unmatched) this.submitError = err('contact.errorGeneric')
        return
      }
      if (error.status === 429) {
        this.submitError = err('contact.errorRateLimit')
        return
      }
      // Network error / 5xx / anything unexpected — the form (and what
      // they typed) stays exactly as it was.
      this.submitError = err('contact.errorGeneric')
    },
    startOver () {
      this.form.topic = ''
      this.form.content = ''
      this.fieldErrors = emptyErrors()
      this.instantRequestId++
      this.instant = emptyInstant()
      this.submitError = null
      this.helped = false
      this.submitted = null
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
  gap: 16px;

  @include media_mobile {
    padding: 18px;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.field__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-gray-500;
}

.field__counter {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-400;
  font-variant-numeric: tabular-nums;

  &.is-over {
    color: $color-error;
    font-weight: 700;
  }
}

.field input,
.field__select,
.field textarea {
  width: 100%;
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

  &.is-invalid {
    border-color: $color-error;
  }
}

.field__select.is-placeholder {
  color: $color-gray-400;
}

.field textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.field__error {
  font-family: $font-content;
  font-size: 12.5px;
  font-weight: 700;
  color: $color-error;
}

.instant {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.check-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid $color-brand;
  border-radius: 999px;
  padding: 10px 20px;
  background: $color-white;
  color: $color-brand;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: background .12s ease;

  &:hover:not(:disabled) {
    background: $color-brand-tint;
  }

  &:disabled {
    border-color: $color-line;
    color: $color-gray-400;
    cursor: default;
  }
}

.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.instant__hint {
  font-family: $font-content;
  font-size: 12.5px;
  line-height: 1.5;
  color: $color-gray-500;
}

.instant__box {
  border: 1.5px solid $color-brand-tint;
  background: #fff7fb;
  border-radius: 14px;
  padding: 14px 16px;
}

.instant__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: $color-brand;
  margin-bottom: 6px;
}

.instant__answer {
  font-family: $font-content;
  font-size: 14px;
  line-height: 1.65;
  color: $color-ink;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.instant__feedback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-family: $font-content;
  font-size: 13.5px;
  font-weight: 700;
  color: $color-ink;
}

.instant__feedback-actions {
  display: flex;
  gap: 8px;
}

.chip-btn {
  min-width: 72px;
  border: 1.5px solid $color-line;
  border-radius: 999px;
  padding: 7px 16px;
  background: $color-white;
  color: $color-ink;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: $color-brand;
    color: $color-brand;
  }
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

  &:hover:not(:disabled) {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: .6;
    cursor: default;
  }

  @include media_mobile {
    align-self: stretch;
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

  @include media_mobile {
    padding: 48px 18px;
  }
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
  line-height: 1.6;
  color: $color-font-main;
  max-width: 46ch;
}

// The reference id, inline in the success sentence.
.confirmation__reference {
  padding: 2px 8px;
  border-radius: 6px;
  background: $color-gray-100;
  color: $color-ink;
  font-size: 12.5px;
  overflow-wrap: anywhere;
  user-select: all;
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
