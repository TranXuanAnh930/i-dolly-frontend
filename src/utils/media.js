import { API_URL } from '@/env'

/**
 * Uploaded idol/product images come back as a relative `/uploads/...` path
 * (local storage backend) or an already-absolute S3/CDN URL, depending on
 * backend deploy config — either way this returns something usable in an
 * <img src>. Returns null (not a broken-image path) when there's nothing
 * to show, so callers can fall back to a placeholder.
 */
export function resolveMediaUrl (path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
}
