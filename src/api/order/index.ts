import { apiGet, apiPost } from '@/api/request'

export const getPointsRatioApi = () => apiGet('/sysSetting/getPointsRatio')
export const updatePointsRatioApi = (data: any) => apiPost('/sysSetting/updatePointsRatio', data)
export const getOrderDelayApi = () => apiGet('/sysSetting/getOrderDelay')
export const updateDelayApi = (data: any) => apiPost('/sysSetting/updateDelay', data)

export const getClearRecordApi = (data: any) => apiPost('/ordClearRecord/getClearRecord', data)
