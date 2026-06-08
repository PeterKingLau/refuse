import { apiPost } from '@/api/request'

export const getMediumListApi = (data: any) => apiPost('/medMedium/getMedium', data)
export const deleteMediumBatchApi = (data: any) => apiPost('/medMedium/deleteBatch', data)
export const reviseMediumApi = (data: any) => apiPost('/medMedium/reviseMedium', data)
export const addMediumApi = (data: any) => apiPost('/medMedium/addMedium', data)
export const publishMediumApi = (data: any) => apiPost('/medMedium/doPublish', data)
export const clearMediumApi = (data: any) => apiPost('/medMedium/doClear', data)
export const getClearDeviceApi = (data: any) => apiPost('/medMedium/getClearDevice', data)
