<script lang="tsx">
import { Pagination as APagination, Spin as ASpin, Table as ATable } from 'ant-design-vue'
import { computed, defineComponent, onMounted, PropType, ref, unref, watch } from 'vue'
import { get, set } from 'lodash-es'
import { propTypes } from '@/utils/propTypes'
import { setIndex } from './helper'
import { getSlot } from '@/utils/tsxHelper'
import type { TableProps } from './types'
import { Pagination, TableColumn, TableSetPropsType, TableSlotDefault } from '../../../types/table'

type TableKey = string | number

export default defineComponent({
  name: 'Table',
  props: {
    pageSize: propTypes.number.def(10),
    currentPage: propTypes.number.def(1),
    // 是否多选
    selection: propTypes.bool.def(true),
    // 是否所有的超出隐藏，优先级低于 schema 中的 ellipsis
    showOverflowTooltip: propTypes.bool.def(true),
    // 表头
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => []
    },
    // 展开行
    expand: propTypes.bool.def(false),
    // 是否展示分页
    pagination: {
      type: Object as PropType<Pagination>,
      default: (): Pagination | undefined => undefined
    },
    // Antd rowSelection.preserveSelectedRowKeys
    reserveSelection: propTypes.bool.def(false),
    // 加载状态
    loading: propTypes.bool.def(false),
    // 是否叠加索引
    reserveIndex: propTypes.bool.def(false),
    // 对齐方式
    align: propTypes.string.validate((v: string) => ['left', 'center', 'right'].includes(v)).def('left'),
    // 表头对齐方式，Antd Table 无独立 headerAlign，这里保留外部 API
    headerAlign: propTypes.string.validate((v: string) => ['left', 'center', 'right'].includes(v)).def('left'),
    data: {
      type: Array as PropType<Recordable[]>,
      default: () => []
    }
  },
  emits: ['update:pageSize', 'update:currentPage', 'register'],
  setup(props, { attrs, slots, emit, expose }) {
    const tableRef = ref<ComponentRef<typeof ATable>>()

    const pageSizeRef = ref(props.pageSize)

    const currentPageRef = ref(props.currentPage)

    // useTable 传入的 props
    const outsideProps = ref<TableProps>({})

    const mergeProps = ref<TableProps>({})

    const selectedRowKeys = ref<TableKey[]>([])

    const selections = ref<Recordable[]>([])

    const getProps = computed(() => {
      const propsObj = { ...props }
      Object.assign(propsObj, unref(mergeProps))
      return propsObj
    })

    const setProps = (props: TableProps = {}) => {
      mergeProps.value = Object.assign(unref(mergeProps), props)
      outsideProps.value = props
    }

    const setColumn = (columnProps: TableSetPropsType[], columnsChildren?: TableColumn[]) => {
      const { columns } = unref(getProps)
      for (const v of columnsChildren || columns) {
        for (const item of columnProps) {
          if (v.field === item.field) {
            set(v, item.path, item.value)
          } else if (v.children?.length) {
            setColumn(columnProps, v.children)
          }
        }
      }
    }

    const getRowKey = (record: Recordable, index?: number): TableKey => {
      const rowKey = attrs.rowKey || attrs['row-key']

      if (typeof rowKey === 'function') {
        return rowKey(record, index)
      }

      if (typeof rowKey === 'string') {
        return get(record, rowKey) ?? index ?? ''
      }

      return record.key ?? record.id ?? index ?? ''
    }

    const getTableAction = () => ({
      toggleAllSelection: () => {
        const { data } = unref(getProps)
        if (selectedRowKeys.value.length === data.length) {
          selectedRowKeys.value = []
          selections.value = []
          return
        }

        selectedRowKeys.value = data.map((record, index) => getRowKey(record, index))
        selections.value = [...data]
      },
      clearSelection: () => {
        selectedRowKeys.value = []
        selections.value = []
      }
    })

    const tableActionRef = ref(getTableAction())

    // 注册
    onMounted(() => {
      emit('register', tableActionRef.value, tableActionRef)
    })

    expose({
      setProps,
      setColumn,
      selections,
      elTableRef: tableActionRef,
      tableRef,
      ...getTableAction()
    })

    const pagination = computed(() => {
      const paginationProps = Object.assign(
        {
          small: false,
          pageSizes: [10, 20, 30, 40, 50, 100],
          disabled: false,
          hideOnSinglePage: false,
          total: 10
        },
        unref(getProps).pagination
      )

      return {
        ...paginationProps,
        pageSizeOptions: (paginationProps.pageSizes || [10, 20, 30, 40, 50, 100]).map(String)
      }
    })

    watch(
      () => unref(getProps).pageSize,
      (val: number) => {
        pageSizeRef.value = val
      }
    )

    watch(
      () => unref(getProps).currentPage,
      (val: number) => {
        currentPageRef.value = val
      }
    )

    watch(
      () => pageSizeRef.value,
      (val: number) => {
        emit('update:pageSize', val)
      }
    )

    watch(
      () => currentPageRef.value,
      (val: number) => {
        emit('update:currentPage', val)
      }
    )

    watch(
      () => unref(getProps).data,
      () => {
        if (!unref(getProps).reserveSelection) {
          selectedRowKeys.value = []
          selections.value = []
        }
      }
    )

    const getBindValue = computed(() => {
      const bindValue: Recordable = { ...attrs }
      delete bindValue.rowKey
      delete bindValue['row-key']
      return bindValue
    })

    const getTableSlotData = (record: Recordable, column: TableColumn, index: number): TableSlotDefault => {
      return {
        row: record,
        column,
        $index: index
      }
    }

    const renderColumnValue = (column: TableColumn, record: Recordable, index: number) => {
      const slotData = getTableSlotData(record, column, index)
      const slotContent = getSlot(slots, column.field, slotData)

      if (slotContent != null) {
        return slotContent
      }

      const cellValue = get(record, column.field)
      const formatterValue = column.formatter?.(record, column, cellValue, index)

      return formatterValue ?? cellValue
    }

    const renderTableColumns = (columnsChildren?: TableColumn[]) => {
      const { columns, reserveIndex, pageSize, currentPage, align, showOverflowTooltip } = unref(getProps)

      return (columnsChildren || columns).map((column) => {
        if (column.type === 'index') {
          return {
            title: () => getSlot(slots, `${column.field}-header`) || column.label,
            key: column.field,
            dataIndex: column.field,
            align: column.align || align,
            width: column.width || 65,
            customRender: ({ index }: { index: number }) => (column.index ? column.index(index) : setIndex(reserveIndex, index, pageSize, currentPage))
          }
        }

        const { field, label, children, formatter, showOverflowTooltip: columnOverflow, ...columnProps } = column
        const tableColumn: Recordable = {
          ...columnProps,
          title: () => getSlot(slots, `${field}-header`) || label,
          key: field,
          dataIndex: field,
          align: column.align || align,
          ellipsis: column.ellipsis ?? columnOverflow ?? showOverflowTooltip
        }

        if (children?.length) {
          tableColumn.children = renderTableColumns(children)
        } else {
          tableColumn.customRender = ({ record, index }: { record: Recordable; index: number }) => renderColumnValue(column, record, index)
        }

        return tableColumn
      })
    }

    const rowSelection = computed(() => {
      const { selection, reserveSelection } = unref(getProps)

      if (!selection) {
        return undefined
      }

      return {
        selectedRowKeys: selectedRowKeys.value,
        preserveSelectedRowKeys: reserveSelection,
        onChange: (keys: TableKey[], rows: Recordable[]) => {
          selectedRowKeys.value = keys
          selections.value = rows
        }
      }
    })

    const expandable = computed(() => {
      if (!unref(getProps).expand) {
        return undefined
      }

      return {
        expandedRowRender: (record: Recordable, index: number) => getSlot(slots, 'expand', getTableSlotData(record, {} as TableColumn, index))
      }
    })

    const handlePaginationChange = (page: number, size: number) => {
      currentPageRef.value = page
      pageSizeRef.value = size
    }

    return () => (
      <ASpin spinning={unref(getProps).loading}>
        <ATable
          ref={tableRef}
          dataSource={unref(getProps).data}
          columns={renderTableColumns()}
          rowKey={(record: Recordable, index?: number) => getRowKey(record, index)}
          rowSelection={unref(rowSelection)}
          expandable={unref(expandable)}
          pagination={false}
          {...unref(getBindValue)}
        >
          {{
            summary: () => getSlot(slots, 'append')
          }}
        </ATable>

        {unref(getProps).pagination ? (
          <div class="mt-10px flex justify-end">
            <APagination
              current={currentPageRef.value}
              pageSize={pageSizeRef.value}
              total={unref(pagination).total}
              disabled={unref(pagination).disabled}
              hideOnSinglePage={unref(pagination).hideOnSinglePage}
              pageSizeOptions={unref(pagination).pageSizeOptions}
              showSizeChanger
              showQuickJumper
              size={unref(pagination).small ? 'small' : 'default'}
              showTotal={(total: number) => `共 ${total} 条`}
              onChange={handlePaginationChange}
            ></APagination>
          </div>
        ) : undefined}
      </ASpin>
    )
  }
})
</script>
