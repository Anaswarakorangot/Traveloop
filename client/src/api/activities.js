import client from './client'

export const activitiesApi = {
  getAll: (params) => client.get('/activities', { params }),
  getById: (id) => client.get(`/activities/${id}`),
}
