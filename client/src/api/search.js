import client from './client'

export const searchApi = {
  search: (params) => client.get('/search', { params }),
}
