import client from './client'

export const searchApi = {
  search: (params) => client.get('/search', { params }),
  trending: () => client.get('/search/trending'),
}
