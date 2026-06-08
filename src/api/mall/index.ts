import { apiGet, apiPost } from '@/api/request'

export const addOrUpdateMallTypeApi = (data: any) => apiPost('/mal/malType/AddOrUpdateMalType', data)
export const enableMallTypeApi = (data: any) => apiPost('/mal/malType/EnableRecord', data)
export const disableMallTypeApi = (data: any) => apiPost('/mal/malType/DisableRecord', data)
export const getMallTypeApi = (data: any) => apiPost('/mal/malType/GetMalType', data)
export const getMallTypeForSelectApi = () => apiGet('/mal/malType/GetMalTypeForSelect')

export const updateGoodsApi = (data: any) => apiPost('/mal/malGoods/UpdateGoods', data)
export const addGoodsApi = (data: any) => apiPost('/mal/malGoods/addGoods', data)
export const getGoodsApi = (data: any) => apiPost('/mal/malGoods/GetGoods', data)
export const updateGoodsStatusApi = (url: string, data: any) => apiPost(url, data)
