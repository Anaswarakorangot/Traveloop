import client from './client'

export const usersApi = {
  getProfile: (id) => client.get(`/users/${id}`),
  updateProfile: (id, data) => client.put(`/users/${id}`, data),
  deleteAccount: (id) => client.delete(`/users/${id}`),
  uploadAvatar: (id, avatar) => client.post(`/users/${id}/avatar`, { avatar }),
  getStats: (id) => client.get(`/users/${id}/stats`),
  updatePrivacy: (id, isPublicProfile) => client.patch(`/users/${id}/privacy`, { isPublicProfile }),
  getSavedDestinations: (id) => client.get(`/users/${id}/saved-destinations`),
  saveDestination: (userId, cityId) => client.post(`/users/${userId}/saved-destinations/${cityId}`),
  unsaveDestination: (userId, cityId) => client.delete(`/users/${userId}/saved-destinations/${cityId}`),
}
