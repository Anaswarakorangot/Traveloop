import client from './client'

export const authApi = {
  login: (data) => client.post('/auth/login', data),
  loginCheck: (email) => client.post('/auth/login/check', { email }),
  register: (data) => client.post('/auth/register', data),
  logout: () => client.post('/auth/logout'),
  refreshToken: (refreshToken) => client.post('/auth/refresh-token', { refreshToken }),
  getMe: () => client.get('/auth/me'),
  checkEmail: (email) => client.post('/auth/check-email', { email }),

  // Forgot password flow
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  verifyResetCode: (email, code) => client.post('/auth/forgot-password/verify', { email, code }),
  resetPassword: (email, code, newPassword) =>
    client.post('/auth/forgot-password/reset', { email, code, newPassword }),
}
