import qs from 'qs'
import { service } from '@/config/axios/service'

export interface CashWithdrawalListParams {
  status?: number
}

export interface WithdrawalRecordListParams {
  reviewStatus?: number
  orderStatus?: number
  page: number
  size: number
}

export const getCashWithdrawalListApi = (params: CashWithdrawalListParams) => {
  return service.post('/mem/memCashWithdrawal/GetCashWithdrawalList', qs.stringify(params, { arrayFormat: 'brackets' }))
}

export const approveCashWithdrawalApi = (id: number) => {
  return service.get('/mem/memCashWithdrawal/Approved', {
    params: {
      id
    }
  })
}

export const getWithdrawalRecordListApi = (params: WithdrawalRecordListParams) => {
  return service.post('/mem/memCashWithdrawal/getWithdrawalRecordList', params)
}
