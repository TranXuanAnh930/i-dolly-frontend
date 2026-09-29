import { BaseService } from '../base.service'
import { ErrorWrapper, ResponseWrapper } from '../util'

// Contact form (お問い合わせ) — docs/api-spec.md §8 in the backend repo.
// Both endpoints are auth-optional: pass `auth: true` when someone's
// logged in so the request carries their bearer token (the inquiry gets
// linked to the account and rate-limited per account instead of per IP),
// and leave it off for guests.
export class InquiriesService extends BaseService {
  static get entity () {
    return 'inquiries'
  }

  // Keeps the raw `detail` alongside the usual message: a 422's detail is a
  // list of { loc, msg, type } the page maps back onto individual fields,
  // and a 429's is the "try again after N seconds" string shown as-is.
  static _error (error) {
    const detail = error.response && error.response.data ? error.response.data.detail : undefined
    const wrapped = new ErrorWrapper(error, typeof detail === 'string' ? detail : undefined)
    wrapped.detail = detail
    return wrapped
  }

  // POST /inquiries/instant-answer — { answerable, answer } drawn only from
  // the site FAQ; nothing is saved. `answerable: false` is a normal answer
  // (FAQ doesn't cover it, feature off, AI call failed), not an error.
  // `lang` ('ja' | 'en', the site language) picks which FAQ is used; the
  // answer itself comes back in the language of the question.
  static async instantAnswer ({ topic, content, lang }, { auth = false } = {}) {
    try {
      const response = await this.request({ auth }).post(`${this.entity}/instant-answer`, { topic, content, lang }, {
        // The backend gives the AI call 15s plus one retry (~30s worst case)
        // before answering "not answerable" itself; this just caps the
        // spinner a little past that if the request hangs anyway. A timeout
        // rejects like any other failure, so the page falls back silently.
        timeout: 35000
      })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw this._error(error)
    }
  }

  // POST /inquiries/submit — saves the inquiry and (usually) emails a
  // confirmation. Resolves with { id, msg }.
  static async submit ({ email, topic, content }, { auth = false } = {}) {
    try {
      const response = await this.request({ auth }).post(`${this.entity}/submit`, { email, topic, content })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw this._error(error)
    }
  }
}
