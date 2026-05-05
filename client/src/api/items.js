import request from './request'

export function getItems(params) {
  return request.get('/items', { params })
}

export function getMyItems(params) {
  return request.get('/items/my', { params })
}

export function getItemDetail(id) {
  return request.get(`/items/${id}`)
}

export function createItem(formData) {
  return request.post('/items', formData)
}

export function updateItem(id, formData) {
  return request.put(`/items/${id}`, formData)
}

export function deleteItem(id) {
  return request.delete(`/items/${id}`)
}

export function toggleItemStatus(id) {
  return request.put(`/items/${id}/status`)
}
