/**
 * Builds a FormData instance from a plain object, skipping null/undefined
 * values. Used for the two write endpoints (idols/add, products/add_product)
 * that take multipart/form-data instead of JSON — axios sets the
 * Content-Type/boundary header automatically for a FormData body.
 */
export function toFormData (fields = {}) {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    formData.append(key, value)
  })

  return formData
}
