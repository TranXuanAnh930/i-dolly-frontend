import { describe, it, expect, beforeEach } from 'vitest'

import i18n from '@/i18n'
import { ApiError, toApiError } from '../apiError'

// Shape of an axios error that got an HTTP response.
function httpError (status, data) {
  return { message: `Request failed with status code ${status}`, response: { status, data } }
}

describe('toApiError', () => {
  beforeEach(() => {
    i18n.global.locale = 'en'
  })

  // One documented status/code pair per case (docs/api-spec.md §0).
  it.each([
    [400, 'insufficient_stock', 'Not enough stock'],
    [401, 'invalid_credentials', 'Incorrect email or password'],
    [403, 'fan_only_purchase', 'Only fan accounts can purchase'],
    [404, 'not_found', 'Not Found'],
    [405, 'method_not_allowed', 'Method Not Allowed'],
    [409, 'duplicate_idempotency_key', 'Already processed'],
    [429, 'rate_limited', 'Too many requests. Please try again after 312 seconds.'],
    [500, 'internal_error', 'Internal Server Error']
  ])('maps a %i %s response', (status, code, detail) => {
    const error = toApiError(httpError(status, { detail, code }))
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(status)
    expect(error.code).toBe(code)
    expect(error.detail).toBe(detail)
    expect(error.fieldErrors).toEqual({})
    expect(error.message).toBe(i18n.global.t(`errors.${code}`, { seconds: error.retryAfter }))
    expect(error).not.toHaveProperty('success')
    expect(error).not.toHaveProperty('meta')
  })

  it('reads retryAfter from a 429 detail and puts it in the message', () => {
    const error = toApiError(httpError(429, { detail: 'Too many requests. Please try again after 312 seconds.', code: 'rate_limited' }))
    expect(error.retryAfter).toBe(312)
    expect(error.message).toBe('Too many attempts. Try again in 312 s.')
  })

  it('falls back to a generic rate-limit message when a 429 gives no seconds', () => {
    const error = toApiError(httpError(429, { detail: 'Slow down', code: 'rate_limited' }))
    expect(error.retryAfter).toBeNull()
    expect(error.message).toBe(i18n.global.t('errors.rate_limited_generic'))
  })

  it('treats no response as a network error (offline, timeout, cold start)', () => {
    const error = toApiError({ message: 'Network Error', code: 'ERR_NETWORK' })
    expect(error.status).toBe(0)
    expect(error.code).toBe('network_error')
    expect(error.isNetworkError).toBe(true)
    expect(error.message).toBe("Couldn't reach the server. Check your connection and try again.")
  })

  it('treats an axios timeout the same way', () => {
    const error = toApiError({ message: 'timeout of 20000ms exceeded', code: 'ECONNABORTED' })
    expect(error.status).toBe(0)
    expect(error.code).toBe('network_error')
  })

  it('builds fieldErrors from a 422 list, keyed by the last loc entry', () => {
    const error = toApiError(httpError(422, {
      code: 'validation_error',
      detail: [
        { loc: ['body', 'email'], msg: 'value is not a valid email address', type: 'value_error' },
        { loc: ['body', 'detail', 'track_count'], msg: 'Input should be greater than 0', type: 'greater_than' },
        { loc: ['body', 'email'], msg: 'second email error is ignored', type: 'x' },
        { loc: ['query', 0], msg: 'numeric loc', type: 'x' }
      ]
    }))
    expect(error.status).toBe(422)
    expect(error.code).toBe('validation_error')
    expect(error.fieldErrors).toEqual({
      email: 'value is not a valid email address',
      track_count: 'Input should be greater than 0',
      0: 'numeric loc'
    })
    expect(Array.isArray(error.detail)).toBe(true)
  })

  it('handles a 422 with a malformed detail without throwing', () => {
    const error = toApiError(httpError(422, { code: 'validation_error', detail: [null, { msg: 'no loc' }] }))
    expect(error.fieldErrors).toEqual({})
  })

  it.each([
    [400, 'bad_request'],
    [401, 'not_authenticated'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [409, 'conflict'],
    [422, 'validation_error'],
    [429, 'rate_limited'],
    [500, 'internal_error'],
    [502, 'internal_error'],
    [503, 'internal_error']
  ])('derives a code from status %i when the body has none', (status, code) => {
    const error = toApiError(httpError(status, '<html>Bad Gateway</html>'))
    expect(error.code).toBe(code)
    expect(error.status).toBe(status)
  })

  it('uses the generic message for its status when the code is not in the catalog', () => {
    const error = toApiError(httpError(400, { detail: 'Some new rule', code: 'brand_new_code' }))
    expect(error.code).toBe('brand_new_code')
    expect(error.message).toBe(i18n.global.t('errors.bad_request'))
  })

  it('shows detail as secondary text only for bad_request / conflict / rule_violation', () => {
    expect(toApiError(httpError(400, { detail: 'End date before start', code: 'rule_violation' })).secondaryText).toBe('End date before start')
    expect(toApiError(httpError(409, { detail: 'Name already used', code: 'conflict' })).secondaryText).toBe('Name already used')
    expect(toApiError(httpError(400, { detail: 'Not enough stock', code: 'insufficient_stock' })).secondaryText).toBe('')
  })

  it('translates on read, so the message follows a language switch', () => {
    const error = toApiError(httpError(401, { detail: 'Incorrect email or password', code: 'invalid_credentials' }))
    expect(error.message).toBe('Email or password is incorrect.')
    i18n.global.locale = 'ja'
    expect(error.message).toBe('メールアドレスまたはパスワードが正しくありません。')
  })

  it('passes an existing ApiError straight through', () => {
    const original = new ApiError({ status: 404, code: 'not_found', detail: 'x' })
    expect(toApiError(original)).toBe(original)
  })

  it('is() matches any of the given codes', () => {
    const error = toApiError(httpError(400, { detail: 'x', code: 'sold_out' }))
    expect(error.is('not_on_sale', 'sold_out')).toBe(true)
    expect(error.is('not_on_sale')).toBe(false)
  })
})
