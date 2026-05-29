<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableExpose } from '@/components/Table'
import { getTableListApi } from '@/api/table'
import { TableData } from '@/api/table/types'
import { ref, h, reactive, unref } from 'vue'
import { Button as AButton, Tag as ATag } from 'ant-design-vue'
import { useTable } from '@/hooks/web/useTable'
import { Pagination, TableColumn, TableSlotDefault } from '@/types/table'

const { t } = useI18n()

const columns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: t('tableDemo.index'),
    type: 'index'
  },
  {
    field: 'content',
    label: t('tableDemo.header'),
    children: [
      {
        field: 'title',
        label: t('tableDemo.title')
      },
      {
        field: 'author',
        label: t('tableDemo.author')
      },
      {
        field: 'display_time',
        label: t('tableDemo.displayTime')
      },
      {
        field: 'importance',
        label: t('tableDemo.importance'),
        formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
          return h(
            ATag,
            {
              color: cellValue === 1 ? 'success' : cellValue === 2 ? 'warning' : 'error'
            },
            () => (cellValue === 1 ? t('tableDemo.important') : cellValue === 2 ? t('tableDemo.good') : t('tableDemo.commonly'))
          )
        }
      },
      {
        field: 'pageviews',
        label: t('tableDemo.pageviews')
      }
    ]
  },
  {
    field: 'action',
    label: t('tableDemo.action')
  }
])

const { register, tableObject, methods } = useTable<TableData>({
  getListApi: getTableListApi,
  response: {
    list: 'list',
    total: 'total'
  },
  props: {
    columns
  }
})

const { getList } = methods

getList()

const tableRef = ref<TableExpose>()

const actionFn = (data: TableSlotDefault) => {
  console.log(data)
}

const paginationObj = ref<Pagination>()

const showPagination = (show: boolean) => {
  if (show) {
    paginationObj.value = {
      total: tableObject.total
    }
  } else {
    paginationObj.value = undefined
  }
}

const reserveIndex = (custom: boolean) => {
  unref(tableRef)?.setProps({
    reserveIndex: custom
  })
}

const showSelections = (show: boolean) => {
  unref(tableRef)?.setProps({
    selection: show
  })
}

const index = ref(1)

const changeTitle = () => {
  unref(tableRef)?.setColumn([
    {
      field: 'title',
      path: 'label',
      value: `${t('tableDemo.title')}${unref(index)}`
    }
  ])
  index.value++
}

const showExpandedRows = (show: boolean) => {
  unref(tableRef)?.setProps({
    expand: show
  })
}

const selectAllNone = () => {
  unref(tableRef)?.elTableRef?.toggleAllSelection()
}
</script>

<template>
  <ContentWrap :title="`RefTable ${t('tableDemo.operate')}`">
    <AButton @click="showPagination(true)"> {{ t('tableDemo.show') }} {{ t('tableDemo.pagination') }} </AButton>
    <AButton @click="showPagination(false)"> {{ t('tableDemo.hidden') }} {{ t('tableDemo.pagination') }} </AButton>

    <AButton @click="reserveIndex(true)">{{ t('tableDemo.reserveIndex') }}</AButton>
    <AButton @click="reserveIndex(false)">{{ t('tableDemo.restoreIndex') }}</AButton>

    <AButton @click="showSelections(true)">{{ t('tableDemo.showSelections') }}</AButton>
    <AButton @click="showSelections(false)">{{ t('tableDemo.hiddenSelections') }}</AButton>

    <AButton @click="changeTitle">{{ t('tableDemo.changeTitle') }}</AButton>

    <AButton @click="showExpandedRows(true)">{{ t('tableDemo.showExpandedRows') }}</AButton>
    <AButton @click="showExpandedRows(false)">{{ t('tableDemo.hiddenExpandedRows') }}</AButton>

    <AButton @click="selectAllNone">{{ t('tableDemo.selectAllNone') }}</AButton>
  </ContentWrap>
  <ContentWrap :title="`RefTable ${t('tableDemo.example')}`">
    <Table
      ref="tableRef"
      v-model:pageSize="tableObject.pageSize"
      v-model:currentPage="tableObject.currentPage"
      :data="tableObject.tableList"
      :loading="tableObject.loading"
      :pagination="paginationObj"
      @register="register"
    >
      <template #action="data">
        <AButton type="primary" @click="actionFn(data as TableSlotDefault)">
          {{ t('tableDemo.action') }}
        </AButton>
      </template>

      <template #expand="data">
        <div class="ml-30px">
          <div>{{ t('tableDemo.title') }}：{{ data.row.title }}</div>
          <div>{{ t('tableDemo.author') }}：{{ data.row.author }}</div>
          <div>{{ t('tableDemo.displayTime') }}：{{ data.row.display_time }}</div>
        </div>
      </template>
    </Table>
  </ContentWrap>
</template>
