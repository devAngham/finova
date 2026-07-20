import api from './api'

export const demoService = {
  async reset(): Promise<void> {
    await api.post('/demo/reset')
  },

  async getCredentials() {
    const { data } = await api.get('/demo/credentials')
    return data
  },
}
