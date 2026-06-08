import { apiGet, apiPost } from '@/api/request'

export const getHardwareLibApi = (data: any) => apiPost('/HardwareLibrary/GetHardwareLib', data)
export const addHardwareLibApi = (data: any) => apiPost('/HardwareLibrary/AddHardwareLib', data)
export const deleteHardwareLibApi = (data: any) => apiPost('/HardwareLibrary/DeleteHardwareLib', data)
export const setPushRecordsApi = (data: any) => apiPost('/HardwareLibrary/SetPushRecords', data)
export const deleteHardwarePackageApi = (fileName: string) => apiGet(`/Common/deleteHardwarePackage?fileName=${fileName}`)
