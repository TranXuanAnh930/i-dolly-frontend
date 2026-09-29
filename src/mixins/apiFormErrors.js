import { useToastStore } from '@/store/toast'

// Shared by the manager/admin forms: turns an ApiError (services/apiError.js)
// into what a form shows —
//   - the translated message, returned for the form's own error banner,
//   - `apiErrorDetail`: the server's detail as secondary text, only for the
//     generic bad_request / conflict / rule_violation form checks,
//   - per-field messages next to their inputs, read with fieldError(name):
//     a 422's fieldErrors, plus invalid_image on the image field,
//   - forbidden / fan_only_purchase as a permission toast (a 403 never logs
//     anyone out — only a failed 401 refresh does, see http.init.js).
export default {
  data () {
    return {
      apiFieldErrors: {},
      apiErrorDetail: ''
    }
  },

  methods: {
    fieldError (...names) {
      for (const name of names) {
        if (this.apiFieldErrors[name]) return this.apiFieldErrors[name]
      }
      return ''
    },
    clearApiErrors () {
      this.apiFieldErrors = {}
      this.apiErrorDetail = ''
    },
    applyApiError (error) {
      const fieldErrors = { ...(error.fieldErrors || {}) }
      if (error.code === 'invalid_image') fieldErrors.image = error.message
      this.apiFieldErrors = fieldErrors
      this.apiErrorDetail = error.secondaryText || ''
      if (error.code === 'forbidden' || error.code === 'fan_only_purchase') {
        useToastStore().add({ type: 'error', message: error.message })
      }
      return error.message
    }
  }
}
