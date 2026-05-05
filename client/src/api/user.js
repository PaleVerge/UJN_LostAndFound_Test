import request from './request'

export function getProfile() {
  return request.get('/users/profile')
}

export function updateProfile(formData) {
  return request.put('/users/profile', formData)
}
