import type { AxiosRequestConfig, Method, ResponseType } from 'axios'
import { config } from './config'
import { service } from './service'

const { default_headers } = config

interface RequestOption extends AxiosRequestConfig {
  headersType?: string
  method?: Method
  responseType?: ResponseType
}

const request = <T = any>(option: RequestOption) => {
  const { headersType, headers, ...requestOption } = option

  return service({
    ...requestOption,
    headers: {
      'Content-Type': headersType || default_headers,
      ...headers
    }
  }) as Promise<T>
}

export default {
  get: <T = any>(option: RequestOption) => request<T>({ ...option, method: 'get' }),
  post: <T = any>(option: RequestOption) => request<T>({ ...option, method: 'post' }),
  delete: <T = any>(option: RequestOption) => request<T>({ ...option, method: 'delete' }),
  put: <T = any>(option: RequestOption) => request<T>({ ...option, method: 'put' })
}
