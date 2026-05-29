import { Table, TableActionExpose, TableExpose } from '@/components/Table'
import { Modal, message as antMessage } from 'ant-design-vue'
import { ref, reactive, watch, computed, unref, nextTick, Ref } from 'vue'
import { get } from 'lodash-es'
import type { TableProps } from '@/components/Table/src/types'
import { useI18n } from '@/hooks/web/useI18n'
import { TableSetPropsType } from '@/types/table'

const { t } = useI18n()

interface TableResponse<T = any> {
  total: number
  list: T[]
  pageNumber: number
  pageSize: number
}

interface UseTableConfig<T = any> {
  getListApi: (option: any) => Promise<IResponse<TableResponse<T>>>
  delListApi?: (option: any) => Promise<IResponse>
  response: {
    list: string
    total?: string
  }
  props?: TableProps
}

interface TableObject<T = any> {
  pageSize: number
  currentPage: number
  total: number
  tableList: T[]
  params: any
  loading: boolean
  currentRow: Nullable<T>
}

export const useTable = <T = any>(config?: UseTableConfig<T>) => {
  const tableObject = reactive<TableObject<T>>({
    pageSize: 10,
    currentPage: 1,
    total: 10,
    tableList: [],
    params: {},
    loading: true,
    currentRow: null
  })

  const paramsObj = computed(() => {
    return {
      ...tableObject.params,
      pageSize: tableObject.pageSize,
      pageIndex: tableObject.currentPage
    }
  })

  watch(
    () => tableObject.currentPage,
    () => {
      methods.getList()
    }
  )

  watch(
    () => tableObject.pageSize,
    () => {
      if (tableObject.currentPage === 1) {
        methods.getList()
      } else {
        tableObject.currentPage = 1
        methods.getList()
      }
    }
  )

  const tableRef = ref<typeof Table & TableExpose>()

  const elTableRef = ref<TableActionExpose>()

  const register = (ref: typeof Table & TableExpose, elRef: Ref<TableActionExpose>) => {
    tableRef.value = ref
    elTableRef.value = unref(elRef)
  }

  const getTable = async () => {
    await nextTick()
    const table = unref(tableRef)
    if (!table) {
      console.error('The table is not registered. Please use the register method to register')
    }
    return table
  }

  const delData = async (ids: string[] | number[]) => {
    const res = await (config?.delListApi && config?.delListApi(ids))
    if (res) {
      antMessage.success(t('common.delSuccess'))

      const currentPage =
        tableObject.total % tableObject.pageSize === ids.length || tableObject.pageSize === 1
          ? tableObject.currentPage > 1
            ? tableObject.currentPage - 1
            : tableObject.currentPage
          : tableObject.currentPage

      tableObject.currentPage = currentPage
      methods.getList()
    }
  }

  const methods = {
    getList: async () => {
      tableObject.loading = true
      const res = await config?.getListApi(unref(paramsObj)).finally(() => {
        tableObject.loading = false
      })
      if (res) {
        tableObject.tableList = get(res.data || {}, config?.response.list as string)
        tableObject.total = get(res.data || {}, config?.response?.total as string) || 0
      }
    },
    setProps: async (props: TableProps = {}) => {
      const table = await getTable()
      table?.setProps(props)
    },
    setColumn: async (columnProps: TableSetPropsType[]) => {
      const table = await getTable()
      table?.setColumn(columnProps)
    },
    getSelections: async () => {
      const table = await getTable()
      return (table?.selections || []) as T[]
    },
    setSearchParams: (data: Recordable) => {
      tableObject.currentPage = 1
      tableObject.params = Object.assign(tableObject.params, {
        pageSize: tableObject.pageSize,
        pageIndex: tableObject.currentPage,
        ...data
      })
      methods.getList()
    },
    delList: async (ids: string[] | number[], multiple: boolean, message = true) => {
      const tableRef = await getTable()
      if (multiple) {
        if (!tableRef?.selections.length) {
          antMessage.warning(t('common.delNoData'))
          return
        }
      } else {
        if (!tableObject.currentRow) {
          antMessage.warning(t('common.delNoData'))
          return
        }
      }
      if (message) {
        Modal.confirm({
          title: t('common.delWarning'),
          content: t('common.delMessage'),
          okText: t('common.delOk'),
          cancelText: t('common.delCancel'),
          onOk: async () => {
            await delData(ids)
          }
        })
      } else {
        await delData(ids)
      }
    }
  }

  config?.props && methods.setProps(config.props)

  return {
    register,
    elTableRef,
    tableObject,
    methods
  }
}
