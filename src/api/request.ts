import type { AxiosRequestConfig } from 'axios'
import { PATH_URL, service } from '@/config/axios/service'

export const apiGet = <T = any>(url: string, config?: AxiosRequestConfig) => {
  return service.get(url, config) as Promise<T>
}

export const apiPost = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return service.post(url, data, config) as Promise<T>
}

export const apiRequest = <T = any>(config: AxiosRequestConfig) => {
  return service.request(config) as Promise<T>
}

export const getApiUrl = (url = '') => {
  if (/^https?:\/\//i.test(url)) return url
  return `${PATH_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export const getUploadImageUrl = () => getApiUrl('/Common/upLoadImage')

export const getUploadHardwareUrl = () => getApiUrl('/Common/upLoadHardware')

export const getUploadExcelUrl = () => getApiUrl('/Common/upLoadExcel')

export const getDownloadPicUrl = (imageURL?: string) => {
  return imageURL ? getApiUrl(`/Common/downLoadPic/${imageURL}`) : ''
}

export const getPlayVideoUrl = (videoURL?: string) => {
  return videoURL ? getApiUrl(`/Common/playVideo?fileName=${videoURL}`) : ''
}
