<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useI18n } from '@/hooks/web/useI18n'
import { Button as AButton, Tag as ATag } from 'ant-design-vue'
import { Table } from '@/components/Table'
import { getTableListApi, delTableListApi } from '@/api/table'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { h, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEmitt } from '@/hooks/web/useEmitt'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { TableColumn } from '@/types/table'

defineOptions({
  name: 'ExamplePage'
})

const { push } = useRouter()

const { register, tableObject, methods } = useTable<TableData>({
  getListApi: getTableListApi,
  delListApi: delTableListApi,
  response: {
    list: 'list',
    total: 'total'
  }
})

const { getList, setSearchParams } = methods

getList()

useEmitt({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      tableObject.currentPage = 1
    }
    getList()
  }
})

const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'index',
    label: t('tableDemo.index'),
    type: 'index'
  },
  {
    field: 'title',
    label: t('tableDemo.title'),
    search: {
      show: true
    }
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
  },
  {
    field: 'content',
    label: t('exampleDemo.content'),
    table: {
      show: false
    }
  },
  {
    field: 'action',
    width: '260px',
    label: t('tableDemo.action')
  }
])

const { allSchemas } = useCrudSchemas(crudSchemas)

const AddAction = () => {
  push('/example/example-add')
}

const delLoading = ref(false)

const delData = async (row: TableData | null, multiple: boolean) => {
  tableObject.currentRow = row
  const { delList, getSelections } = methods
  const selections = await getSelections()
  delLoading.value = true
  await delList(multiple ? selections.map((v) => v.id) : [tableObject.currentRow?.id as string], multiple).finally(() => {
    delLoading.value = false
  })
}

const action = (row: TableData, type: string) => {
  push(`/example/example-${type}?id=${row.id}`)
}
</script>

<template>
  <ContentWrap>
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <AButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</AButton>
      <AButton :loading="delLoading" danger @click="delData(null, true)">
        {{ t('exampleDemo.del') }}
      </AButton>
    </div>

    <Table
      v-model:pageSize="tableObject.pageSize"
      v-model:currentPage="tableObject.currentPage"
      :columns="allSchemas.tableColumns"
      :data="tableObject.tableList"
      :loading="tableObject.loading"
      :pagination="{
        total: tableObject.total
      }"
      @register="register"
    >
      <template #action="{ row }">
        <AButton type="primary" @click="action(row, 'edit')">
          {{ t('exampleDemo.edit') }}
        </AButton>
        <AButton type="primary" ghost @click="action(row, 'detail')">
          {{ t('exampleDemo.detail') }}
        </AButton>
        <AButton danger @click="delData(row, false)">
          {{ t('exampleDemo.del') }}
        </AButton>
      </template>
    </Table>
  </ContentWrap>
</template>
