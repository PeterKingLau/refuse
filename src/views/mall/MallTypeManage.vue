<template>
  <div class="mall-type-page">
    <AForm v-if="showSearch" :model="queryForm" layout="inline" class="search-form">
      <AFormItem label="类别名称">
        <AInput v-model:value="queryForm.content" allow-clear class="search-control" placeholder="请输入类别名称" />
      </AFormItem>
      <AFormItem>
        <ASpace>
          <AButton type="primary" class="icon-button" v-hasPermi="Permission.sec" @click="onQuery">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
            搜索
          </AButton>
          <AButton class="icon-button" @click="onReset">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
            重置
          </AButton>
        </ASpace>
      </AFormItem>
    </AForm>

    <div class="toolbar">
      <ASpace>
        <AButton type="primary" class="icon-button" v-hasPermi="Permission.add" @click="openAddDialog">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新增
        </AButton>
      </ASpace>

      <ASpace>
        <ATooltip :title="showSearch ? '隐藏搜索' : '显示搜索'">
          <AButton shape="circle" class="icon-button" @click="toggleSearch">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
          </AButton>
        </ATooltip>
        <ATooltip title="刷新">
          <AButton shape="circle" class="icon-button" :loading="tableLoading" @click="getGoodsType">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
          </AButton>
        </ATooltip>
      </ASpace>
    </div>

    <ATable row-key="id" :columns="columns" :data-source="resultData" :loading="tableLoading" :pagination="false" :scroll="{ x: 760 }" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <ATag :color="getStatusMeta(record.status).color" :bordered="false">
            {{ getStatusMeta(record.status).label }}
          </ATag>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" danger class="table-action" @click="disableRecord(toMallTypeRecord(record))">
              <template #icon>
                <Icon icon="ant-design:stop-outlined" />
              </template>
              禁用
            </AButton>
            <AButton type="link" class="table-action success-link" @click="enableRecord(toMallTypeRecord(record))">
              <template #icon>
                <Icon icon="ant-design:check-circle-outlined" />
              </template>
              启用
            </AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="currentPage"
        v-model:page-size="queryForm.size"
        :page-size-options="['10', '20', '30', '50']"
        :show-size-changer="true"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        :total="total"
        show-quick-jumper
        @change="getGoodsType"
        @show-size-change="getGoodsType"
      />
    </div>

    <AModal v-model:open="addDialogVisible" title="添加商品类别" width="420px" :confirm-loading="submitLoading" @ok="submitAdd" @cancel="closeAddDialog">
      <AForm :model="addForm" layout="vertical">
        <AFormItem label="记录编号">
          <AInputNumber v-model:value="addForm.id" class="w-full" disabled />
        </AFormItem>
        <AFormItem label="类别名称">
          <AInput v-model:value="addForm.malTypeName" allow-clear placeholder="请输入商品类别名称" />
        </AFormItem>
      </AForm>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  Space as ASpace,
  Table as ATable,
  Tag as ATag,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import qs from 'qs'
import { PATH_URL, service } from '@/config/axios/service'
import { Icon } from '@/components/Icon'

interface MallTypeRecord {
  id: number
  malTypeName: string
  status: number
}

const showSearch = ref(true)
const addDialogVisible = ref(false)
const submitLoading = ref(false)
const tableLoading = ref(false)
const resultData = ref<MallTypeRecord[]>([])
const total = ref(0)
const currentPage = ref(1)

const addForm = reactive({
  id: 0,
  malTypeName: ''
})

const queryForm = reactive({
  size: 10,
  content: ''
})

const Permission = {
  add: 'mal_typ_add',
  rev: 'mal_typ_rev',
  del: 'mal_typ_del',
  sec: 'mal_typ_sec'
}

const columns: TableColumnsType<MallTypeRecord> = [
  { title: '记录编号', dataIndex: 'id', key: 'id', width: 120 },
  { title: '类别名称', dataIndex: 'malTypeName', key: 'malTypeName', width: 220 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120, align: 'center' },
  { title: '操作', key: 'action', width: 180, fixed: 'right', align: 'center' }
]

const getStatusMeta = (status: number) => {
  if (status === 0) return { label: '禁用', color: 'error' }
  if (status === 1) return { label: '正常', color: 'success' }
  return { label: '异常状态', color: 'default' }
}

const toMallTypeRecord = (record: Record<string, any>) => record as MallTypeRecord

const submitAdd = async () => {
  if (!addForm.malTypeName.trim()) {
    message.warning('请输入商品类别名称')
    return
  }

  submitLoading.value = true

  try {
    const res: any = await service.post(
      PATH_URL + '/mal/malType/AddOrUpdateMalType',
      qs.stringify({
        id: addForm.id,
        malTypeName: addForm.malTypeName.trim()
      })
    )

    message[res.code === 200 ? 'success' : 'error'](res.code === 200 ? '操作成功' : '操作失败')
    addDialogVisible.value = false
    getGoodsType()
  } finally {
    submitLoading.value = false
  }
}

const onQuery = () => {
  currentPage.value = 1
  getGoodsType()
}

const onReset = () => {
  queryForm.content = ''
  currentPage.value = 1
  getGoodsType()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const openAddDialog = () => {
  addForm.id = 0
  addForm.malTypeName = ''
  addDialogVisible.value = true
}

const closeAddDialog = () => {
  addDialogVisible.value = false
  submitLoading.value = false
}

const enableRecord = async (row: MallTypeRecord) => {
  const res: any = await service.post(
    PATH_URL + '/mal/malType/EnableRecord',
    qs.stringify({
      id: row.id
    })
  )

  message[res.code === 200 ? 'success' : 'error'](res.code === 200 ? '操作成功' : '操作失败')
  getGoodsType()
}

const disableRecord = async (row: MallTypeRecord) => {
  const res: any = await service.post(
    PATH_URL + '/mal/malType/DisableRecord',
    qs.stringify({
      id: row.id
    })
  )

  message[res.code === 200 ? 'success' : 'error'](res.code === 200 ? '操作成功' : '操作失败')
  getGoodsType()
}

const getGoodsType = async () => {
  tableLoading.value = true

  try {
    const res: any = await service.post(
      PATH_URL + '/mal/malType/GetMalType',
      qs.stringify({
        page: currentPage.value - 1,
        size: queryForm.size,
        content: queryForm.content,
        parentId: 0
      })
    )

    resultData.value = res.data?.records || []
    total.value = res.data?.total || resultData.value.length
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  getGoodsType()
})
</script>

<style lang="less" scoped>
.mall-type-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: flex;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  flex-wrap: wrap;
  gap: 12px 16px;

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }
}

.search-control {
  width: 220px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-button,
.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(.ant-btn-icon),
  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.table-action {
  height: 24px;
  padding: 0;
  gap: 4px;
}

.success-link {
  color: #52c41a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}
</style>
