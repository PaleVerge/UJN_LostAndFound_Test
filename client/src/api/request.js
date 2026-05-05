import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      message.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  (error) => {
    const status = error.response?.status
    const serverMsg = error.response?.data?.msg
    const isAuthEndpoint = error.config?.url?.includes('/auth/')

    if (status === 401) {
      if (isAuthEndpoint) {
        message.error(serverMsg || '登录失败')
      } else {
        localStorage.removeItem('token')
        window.location.href = '/login'
        message.error('登录已过期，请重新登录')
      }
    } else {
      message.error(serverMsg || error.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

export default request
