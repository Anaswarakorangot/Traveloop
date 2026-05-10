import client from './client'

export const adminApi = {
  getStats: () => client.get('/admin/stats'),
  getUsers: (params) => client.get('/admin/users', { params }),
  updateUserRole: (id, role) => client.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),
  banUser: (id) => client.patch(`/admin/users/${id}/ban`),
  getTrips: (params) => client.get('/admin/trips', { params }),
  getPopularCities: (limit = 10) => client.get('/admin/cities/popular', { params: { limit } }),
  deletePost: (id) => client.delete(`/admin/posts/${id}`),
  exportUsers: () => client.get('/admin/export/users', { responseType: 'blob' }),
  exportTrips: () => client.get('/admin/export/trips', { responseType: 'blob' }),
}
