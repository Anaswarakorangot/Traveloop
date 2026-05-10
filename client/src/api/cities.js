import client from './client'

export const citiesApi = {
  getAll: (params) => client.get('/cities', { params }),
  getPopular: (limit = 10) => client.get('/cities/popular', { params: { limit } }),
  getSuggestions: (limit = 9) => client.get('/cities/suggestions', { params: { limit } }),
  getById: (id) => client.get(`/cities/${id}`),
  getActivities: (cityId, params) => client.get(`/cities/${cityId}/activities`, { params }),
}
