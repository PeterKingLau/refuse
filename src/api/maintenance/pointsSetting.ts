import { apiGet, apiPost } from '@/api/request'

export const savePointSwappingRulesApi = (data: any) => apiPost('/mem/memPointSwappingRules/savePointSwappingRules', data)

export const getPointSwappingRulesApi = (departmentId: number | string) => {
  return apiGet(`/mem/memPointSwappingRules/getPointSwappingRules?departmentId=${departmentId}`)
}
