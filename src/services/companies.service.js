import { BaseService } from './base.service'

// GET /management_companies/all — public, no auth. Write endpoints
// (POST add, PUT update/{id}, DELETE delete/{id}) are admin-only. See
// docs/api-spec.md in the E-commerce backend repo for the full
// ManagementCompanyRead shape: id, name, description, contact_email.
export class CompaniesService extends BaseService {
  static get entity () {
    return 'management_companies'
  }

  // POST /profile/create-manager — admin-only. Creates a brand new
  // role='manager' user tied to a company in one call (as opposed to
  // /profile/make-admin, which only promotes an already-registered user
  // and has no company concept). Not scoped under /management_companies
  // since it's a Profile/auth-domain endpoint, not a company one.
  static async createManagerAccount ({ name, email, password, company_id }) {
    try {
      const response = await this.request({ auth: true }).post('profile/create-manager', { name, email, password, company_id })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
