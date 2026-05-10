import client from './client'

export const adminApi = {
  getStats: () => client.get('/admin/stats'),
  getUsers: (params) => client.get('/admin/users', { params }),
  updateUserRole: (id, role) => client.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),
  getTrips: (params) => client.get('/admin/trips', { params }),
  getPopularCities: (limit = 10) => client.get('/admin/cities/popular', { params: { limit } }),
}
