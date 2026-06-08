import { apiGet, apiPost } from '@/api/request'

export const getBlackListApi = (data: any) => apiPost('/memMember/getBlackList', data)
export const recoveryBlackListApi = (data: any) => apiPost('/memMember/recoveryBlacList', data)

export const getCardApi = (data: any) => apiPost('/memMember/getCard', data)
export const deleteCardBatchApi = (data: any) => apiPost('/memMember/deleteCardBatch', data)
export const addCardApi = (data: any) => apiPost('/memMember/addCard', data)
export const updateCardApi = (data: any) => apiPost('/memMember/updateCard', data)

export const getMemberApi = (data: any) => apiPost('/memMember/getMember', data)
export const addMemberApi = (data: any) => apiPost('/memMember/addMember', data)
export const bindCardApi = (data: any) => apiPost('/memMember/bindCard', data)
export const operationPointsApi = (data: any) => apiPost('/memMember/OperationPoints', data)
export const moveMemberToBlackListApi = (data: any) => apiPost('/memMember/ToBlickList', data)

export const getPointListApi = (data: any) => apiPost('/memMember/getPointList', data)
export const getPointReasonApi = () => apiGet('/memMember/getPointReason')
