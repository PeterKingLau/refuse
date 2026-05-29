import { service } from '@/config/axios/service'

export interface UmsMenuMeta {
  id?: number
  menuId?: number
  alwaysShow?: boolean
  icon?: string
  title?: string
  status?: boolean | string | number
}

export interface UmsMenuDynamic {
  id: number
  path: string
  name: string
  component: string
  redirect?: string
  parentId?: number | null
  soft?: number
  sign?: string
  status?: boolean | string | number
  label?: string
  meta?: UmsMenuMeta
  children?: UmsMenuDynamic[]
}

export interface CommonResultListUmsMenuDynamic {
  code: number
  message?: string
  data: UmsMenuDynamic[]
}

export interface CommonResultUmsMenuDynamic {
  code: number
  message?: string
  data: UmsMenuDynamic
}

export interface CommonResult<T = any> {
  code: number
  message?: string
  data?: T
}

export interface MenuDynamicListParams {
  parentId: number
  keyword?: string
}

export const getMenuDynamicTreeList = () => {
  return service.get('/ums/umsMenuDynamic/treeList') as unknown as Promise<CommonResultListUmsMenuDynamic>
}

export const getMenuDynamicList = (params: MenuDynamicListParams) => {
  return service.get('/ums/umsMenuDynamic/list', { params }) as unknown as Promise<CommonResultListUmsMenuDynamic>
}

export const createMenuDynamic = (data: UmsMenuDynamic) => {
  return service.post('/ums/umsMenuDynamic/create', data) as unknown as Promise<CommonResult>
}

export const updateMenuDynamic = (id: number, data: UmsMenuDynamic) => {
  return service.post(`/ums/umsMenuDynamic/update/${id}`, data) as unknown as Promise<CommonResult>
}

export const deleteMenuDynamic = (id: number) => {
  return service.post(`/ums/umsMenuDynamic/delete/${id}`) as unknown as Promise<CommonResult>
}

export const updateMenuDynamicStatus = (id: number, status: boolean) => {
  return service.post(`/ums/umsMenuDynamic/updateStatus/${id}`, undefined, { params: { status } }) as unknown as Promise<CommonResult>
}

export const batchUpdateMenuDynamicSort = (data: UmsMenuDynamic[]) => {
  return service.post('/ums/umsMenuDynamic/batchUpdateSort', data) as unknown as Promise<CommonResult>
}

export const getMenuDynamicDetail = (id: number) => {
  return service.get(`/ums/umsMenuDynamic/${id}`) as unknown as Promise<CommonResultUmsMenuDynamic>
}
