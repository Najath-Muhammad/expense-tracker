import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
};

export const walletApi = {
  create: (data) => api.post('/wallets', data),
  getAll: () => api.get('/wallets'),
  getById: (id) => api.get(`/wallets/${id}`),
  update: (id, data) => api.patch(`/wallets/${id}`, data),
  delete: (id) => api.delete(`/wallets/${id}`),
  generateInvite: (id) => api.post(`/wallets/${id}/invite`),
  join: (inviteCode) => api.post('/wallets/join', { inviteCode }),
  removeMember: (id, memberId) => api.delete(`/wallets/${id}/members/${memberId}`),
  updateMemberRole: (id, memberId, role) => api.patch(`/wallets/${id}/members/${memberId}/role`, { role }),
  transferOwnership: (id, newOwnerId) => api.patch(`/wallets/${id}/transfer-ownership`, { newOwnerId }),
  setActive: (id) => api.patch(`/wallets/${id}/set-active`),
};

export const expenseApi = {
  add: (walletId, data) => api.post(`/wallets/${walletId}/expenses`, data),
  getAll: (walletId, params) => api.get(`/wallets/${walletId}/expenses`, { params }),
  getById: (id) => api.get(`/wallets/expenses/${id}`),
  update: (id, data) => api.patch(`/wallets/expenses/${id}`, data),
  delete: (id) => api.delete(`/wallets/expenses/${id}`),
  getDashboard: (walletId) => api.get(`/wallets/${walletId}/expenses/dashboard`),
};

export const incomeApi = {
  add: (walletId, data) => api.post(`/wallets/${walletId}/income`, data),
  getAll: (walletId, params) => api.get(`/wallets/${walletId}/income`, { params }),
  getById: (id) => api.get(`/wallets/income/${id}`),
  update: (id, data) => api.patch(`/wallets/income/${id}`, data),
  delete: (id) => api.delete(`/wallets/income/${id}`),
  getBalance: (walletId) => api.get(`/wallets/${walletId}/income/balance`),
};

export const reportApi = {
  getDashboard: (walletId) => api.get(`/wallets/${walletId}/reports/dashboard`),
  getWidget: (walletId) => api.get(`/wallets/${walletId}/reports/widget`),
  getMonthly: (walletId, params) => api.get(`/wallets/${walletId}/reports/monthly`, { params }),
  getYearly: (walletId, params) => api.get(`/wallets/${walletId}/reports/yearly`, { params }),
};
