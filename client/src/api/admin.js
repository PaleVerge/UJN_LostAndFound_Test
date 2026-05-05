import request from './request'

// Items
export function getAdminItems(params) {
  return request.get('/admin/items', { params })
}

export function getAdminItemDetail(id) {
  return request.get(`/admin/items/${id}`)
}

export function adminCreateItem(formData) {
  return request.post('/admin/items', formData)
}

export function adminUpdateItem(id, formData) {
  return request.put(`/admin/items/${id}`, formData)
}

export function adminDeleteItem(id) {
  return request.delete(`/admin/items/${id}`)
}

// Users
export function getAdminUsers(params) {
  return request.get('/admin/users', { params })
}

export function getAdminUserDetail(id) {
  return request.get(`/admin/users/${id}`)
}

export function adminCreateUser(data) {
  return request.post('/admin/users', data)
}

export function adminUpdateUser(id, data) {
  return request.put(`/admin/users/${id}`, data)
}

export function adminDeleteUser(id) {
  return request.delete(`/admin/users/${id}`)
}
