import type { AxiosRequestConfig } from 'axios'
import { apiGet, apiPost } from '@/api/request'

export const getMenuTreeApi = () => apiGet('/Permission/getMenuTree')
export const getSelfApi = () => apiGet('/Permission/getSelf')
export const updatePasswordApi = (data: any) => apiPost('/admin/updatePassword', data)
export const loginApi = (data: any) => apiPost('/admin/login', data)

export const getDepartmentApi = (data?: any) => apiPost('/Permission/getDepartment', data)
export const deleteDepartmentApi = (config?: AxiosRequestConfig) => apiGet('/Permission/deletDepartment', config)
export const deleteDepartmentBatchApi = (data: any) => apiPost('/Permission/deleteDeparmentOfBatch', data)
export const addDepartmentApi = (data: any) => apiPost('/Permission/addDepartment', data)
export const getDepartmentForSelectApi = () => apiGet('/Permission/getDepartmentForSelect')
export const getDepartmentTreeApi = () => apiGet('/Permission/getDepartmentTree')

export const getDeviceAreaApi = (data?: any) => apiPost('/Permission/getDeviceArea', data)
export const getDeviceAreaForSelectApi = () => apiGet('/Permission/getDeviceAreaForSelect')
export const deleteDeviceAreaApi = (data: any) => apiPost('/Permission/deleteDeviceArea', data)
export const addDeviceAreaApi = (data: any) => apiPost('/Permission/addDeviceArea', data)
export const updateDeviceAreaApi = (data: any) => apiPost('/Permission/updateDeviceArea', data)

export const getJobOfUserApi = () => apiGet('/Permission/getJobOfUser')
export const deleteStaffApi = (data: any) => apiPost('/Permission/deleteStaff', data)
export const resetStaffPasswordApi = (data: any) => apiPost('/Permission/restPwd', data)
export const getPowCharacterForSelectApi = () => apiGet('/Permission/getPowCharacterForSelect')
export const addStaffApi = (data: any) => apiPost('/Permission/addStaff', data)
export const updateStaffApi = (data: any) => apiPost('/Permission/updateStaff', data)
export const getStaffApi = (data: any) => apiPost('/Permission/getStaff', data)
export const getUsableStaffApi = () => apiGet('/Permission/getUsableStaff')

export const updateDataModeApi = (data: any) => apiPost('/Permission/updateDataMode', data)
export const getDataModelApi = () => apiGet('/Permission/getDataModel')
export const deleteCharacterApi = (data: any) => apiPost('/Permission/deleteCharacter', data)
export const getPowCharacterOfLevelApi = (data: any) => apiPost('/Permission/getPowCharacterOfLevel', data)
export const getMenuIdOfCharacterApi = (config?: AxiosRequestConfig) => apiGet('/Permission/getMenuIdOfCharacter', config)
export const addCharacterApi = (data: any) => apiPost('/Permission/addCharacter', data)
export const getTreeDataApi = () => apiGet('/Permission/getTreeData')

export const getLoginLogApi = (data: any) => apiPost('/Permission/getLoginLog', data)
export const deleteLoginLogIdsApi = (data: any) => apiPost('/Permission/deleteLogIds', data)
export const getPowStaffApi = (id: any) => apiGet(`/Permission/getPowStaff?id=${id}`)
