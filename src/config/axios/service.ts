import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import qs from 'qs'
import { message } from 'ant-design-vue'
import { config } from './config'

const { result_code, base_url } = config

const requestBaseUrl = base_url[import.meta.env.VITE_API_BASEPATH]

export const PATH_URL = requestBaseUrl

const isSameBaseUrl = (url: string, baseURL: string) => {
  return url === baseURL || url.startsWith(`${baseURL}/`)
}

const removeBaseUrlPrefix = (url: string, baseURL?: string) => {
  if (!baseURL || !isSameBaseUrl(url, baseURL)) return url

  const nextUrl = url.slice(baseURL.length)
  return nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`
}

const getContentType = (headers?: InternalAxiosRequestConfig['headers']) => {
  if (!headers) return ''

  if (headers instanceof AxiosHeaders) {
    return headers.get('Content-Type') || ''
  }

  return headers['Content-Type'] || headers['content-type'] || ''
}

const setAuthorization = (headers: InternalAxiosRequestConfig['headers'], token: string) => {
  if (headers instanceof AxiosHeaders) {
    headers.set('Authorization', token)
    return
  }

  ;(headers as AxiosRequestHeaders).Authorization = token
}

const service: AxiosInstance = axios.create({
  baseURL: requestBaseUrl,
  timeout: config.request_timeout,
  headers: {
    'Content-Type': config.default_headers
  },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true })
})

service.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    requestConfig.url = removeBaseUrlPrefix(requestConfig.url || '', requestConfig.baseURL)

    const contentType = String(getContentType(requestConfig.headers))

    if (requestConfig.method === 'post' && contentType.includes('application/x-www-form-urlencoded') && requestConfig.data && !(requestConfig.data instanceof FormData)) {
      requestConfig.data = qs.stringify(requestConfig.data)
    }

    const token = localStorage.getItem('token')
    if (token) {
      setAuthorization(requestConfig.headers, token)
    }

    return requestConfig
  },
  (error: AxiosError) => Promise.reject(error)
)

service.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    if (response.config.responseType === 'blob') {
      return response
    }

    const responseData = response.data

    if (responseData?.code === result_code) {
      return responseData
    }

    message.error(responseData?.message || '请求失败')
    return Promise.reject(responseData)
  },
  (error: AxiosError<any>) => {
    const errorMessage = error.response?.data?.message || error.message || '请求失败'
    message.error(errorMessage)
    return Promise.reject(error)
  }
)

export { service }
