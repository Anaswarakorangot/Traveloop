import client from './client'

export const communityApi = {
  getPosts: (params) => client.get('/community/posts', { params }),
  getPost: (id) => client.get(`/community/posts/${id}`),
  createPost: (data) => client.post('/community/posts', data),
  deletePost: (id) => client.delete(`/community/posts/${id}`),
  likePost: (id) => client.post(`/community/posts/${id}/like`),
  unlikePost: (id) => client.delete(`/community/posts/${id}/like`),
  getComments: (postId) => client.get(`/community/posts/${postId}/comments`),
  addComment: (postId, content) => client.post(`/community/posts/${postId}/comments`, { content }),
  deleteComment: (postId, commentId) => client.delete(`/community/posts/${postId}/comments/${commentId}`),
}
