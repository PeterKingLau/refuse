import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import qs from 'qs'
import { message } from 'ant-design-vue'
import { config } from './config'

declare module 'axios' {
  export interface AxiosRequestConfig {
    showErrorMessage?: boolean
  }
}

const { result_code, base_url } = config

type ResponseData<T = unknown> = {
  code?: number | string
  message?: string
  data?: T
  [key: string]: unknown
}

const requestBaseUrl = base_url[import.meta.env.VITE_API_BASEPATH] || base_url.base

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

const shouldShowErrorMessage = (requestConfig?: AxiosRequestConfig) => {
  return requestConfig?.showErrorMessage !== false
}

const getToken = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem('token') || ''
}

const isSuccessCode = (code?: number | string) => {
  return String(code) === String(result_code)
}

const isFormData = (data: unknown) => {
  return typeof FormData !== 'undefined' && data instanceof FormData
}

const isUrlencodedRequest = (requestConfig: InternalAxiosRequestConfig) => {
  const contentType = String(getContentType(requestConfig.headers)).toLowerCase()
  return requestConfig.method === 'post' && contentType.includes('application/x-www-form-urlencoded')
}

const showErrorMessage = (content: string, requestConfig?: AxiosRequestConfig) => {
  if (!shouldShowErrorMessage(requestConfig)) return
  message.error(content)
}

const getResponseErrorMessage = (responseData?: ResponseData) => {
  return responseData?.message || '请求失败'
}

const getAxiosErrorMessage = (error: AxiosError<ResponseData>) => {
  return error.response?.data?.message || error.message || '请求失败'
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

    if (isUrlencodedRequest(requestConfig) && requestConfig.data && !isFormData(requestConfig.data)) {
      requestConfig.data = qs.stringify(requestConfig.data)
    }

    const token = getToken()
    if (token) {
      setAuthorization(requestConfig.headers, token)
    }

    return requestConfig
  },
  (error: AxiosError) => Promise.reject(error)
)

service.interceptors.response.use(
  (response: AxiosResponse<any>): any => {
    if (response.config.responseType === 'blob') {
      return response
    }

    const responseData = response.data as ResponseData

    if (isSuccessCode(responseData?.code)) {
      return responseData
    }

    showErrorMessage(getResponseErrorMessage(responseData), response.config)
    return Promise.reject(responseData)
  },
  (error: AxiosError<ResponseData>) => {
    showErrorMessage(getAxiosErrorMessage(error), error.config)
    return Promise.reject(error)
  }
)

export { service }
