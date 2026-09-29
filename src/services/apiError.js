import i18n from '@/i18n'

// One error type for every API call — see docs/api-spec.md §0 in the
// backend repo. Every error body there is {"detail": ..., "code": "<snake>"}:
// branch on `code` (stable), and treat `detail` as English secondary text at
// most. A request that got no response at all (offline, timeout, a Render
// cold start that never answered) has status 0 and code "network_error".

// Codes whose `detail` carries the only useful specifics (mostly manager/
// admin form checks), so pages show it under the translated message.
const DETAIL_AS_SECONDARY = new Set(['bad_request', 'conflict', 'rule_violation'])

// For a code with no translation of its own (one added server-side later),
// fall back to a generic message for its status.
export function fallbackCodeForStatus (status) {
  if (!status) return 'network_error'
  if (status === 401) return 'not_authenticated'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 422) return 'validation_error'
  if (status === 429) return 'rate_limited'
  if (status >= 500) return 'internal_error'
  if (status >= 400) return 'bad_request'
  return 'unknown'
}

// "Too many requests. Please try again after 312 seconds." → 312
function parseRetryAfter (detail) {
  if (typeof detail !== 'string') return null
  const match = /(\d+)\s*second/i.exec(detail)
  return match ? Number(match[1]) : null
}

// A 422's detail is FastAPI's [{loc, msg, type}]; the field is loc's last
// entry. First message per field wins.
function parseFieldErrors (detail) {
  const fieldErrors = {}
  if (!Array.isArray(detail)) return fieldErrors
  detail.forEach(item => {
    const loc = item && Array.isArray(item.loc) ? item.loc : []
    const field = loc[loc.length - 1]
    if (field !== undefined && !(field in fieldErrors)) fieldErrors[field] = item.msg
  })
  return fieldErrors
}

export class ApiError extends Error {
  constructor ({ status = 0, code = 'network_error', detail = null } = {}) {
    super()
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
    this.fieldErrors = status === 422 ? parseFieldErrors(detail) : {}
    this.retryAfter = status === 429 ? parseRetryAfter(detail) : null
  }

  // Translated on read rather than frozen at construction, so a message
  // shown after a language switch comes out in the new language. Falls back
  // to a generic message for the status when the code has no translation.
  get message () {
    const t = i18n.global
    const code = t.te(`errors.${this.code}`) ? this.code : fallbackCodeForStatus(this.status)
    if (code === 'rate_limited' && this.retryAfter == null) return t.t('errors.rate_limited_generic')
    return t.t(`errors.${code}`, { seconds: this.retryAfter })
  }

  // The server's English detail, only for the codes where it's the only
  // useful specifics (see DETAIL_AS_SECONDARY) — '' otherwise.
  get secondaryText () {
    return DETAIL_AS_SECONDARY.has(this.code) && typeof this.detail === 'string' ? this.detail : ''
  }

  is (...codes) {
    return codes.includes(this.code)
  }

  get isNetworkError () {
    return this.status === 0
  }
}

// The one place an axios error becomes an ApiError. Anything that already
// is one (e.g. rethrown from the auth interceptor) passes straight through.
export function toApiError (error) {
  if (error instanceof ApiError) return error
  const response = error && error.response
  if (!response) {
    return new ApiError({ status: 0, code: 'network_error', detail: error && error.message ? error.message : null })
  }

  const data = response.data && typeof response.data === 'object' ? response.data : {}
  const status = response.status || 0
  const code = typeof data.code === 'string' && data.code ? data.code : fallbackCodeForStatus(status)
  let detail = null
  if (data.detail !== undefined) detail = data.detail
  else if (typeof response.data === 'string' && response.data) detail = response.data
  return new ApiError({ status, code, detail })
}
