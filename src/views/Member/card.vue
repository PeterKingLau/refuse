<template>
  <div class="member-card-page">
    <AForm v-if="showSearchForm" :model="searchFormData" layout="horizontal" class="search-form">
      <AFormItem label="卡片编号" class="search-form-item">
        <AInput v-model:value="searchFormData.cardNo" placeholder="请输入卡片编号" />
      </AFormItem>

      <AFormItem label="类型" class="search-form-item">
        <ASelect v-model:value="searchFormData.type" :options="cardTypeOptions" allow-clear placeholder="请选择类型" />
      </AFormItem>

      <AFormItem label="状态" class="search-form-item">
        <ASelect v-model:value="searchFormData.status" :options="cardStatusOptions" allow-clear placeholder="请选择状态" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="getCardData" v-hasPermi="Permission.sec">
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
      <div class="toolbar-left">
        <AButton type="primary" class="icon-button" @click="OnClickAdd" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新增
        </AButton>

        <AButton danger class="icon-button" :disabled="disableRemove" @click="deleteOfDetail" v-hasPermi="Permission.del">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
        </AButton>
      </div>

      <div class="toolbar-right">
        <ATooltip :title="showSearchForm ? '隐藏搜索' : '显示搜索'">
          <AButton shape="circle" @click="OnClickOfShowForm">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
          </AButton>
        </ATooltip>
        <ATooltip title="刷新">
          <AButton shape="circle" @click="onPageRest">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
          </AButton>
        </ATooltip>
      </div>
    </div>

    <ATable row-key="id" :columns="columns" :data-source="TableData" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          {{ convertMemberType(record.type) }}
        </template>

        <template v-else-if="column.key === 'status'">
          <ATag :color="record.status === 0 ? 'default' : 'success'">
            {{ convertStatus(record.status) }}
          </ATag>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action action-edit" @click="handleDetail(record)" v-hasPermi="Permission.rev">
              <template #icon>
                <Icon icon="ant-design:edit-outlined" />
              </template>
              编辑
            </AButton>
            <AButton type="link" danger class="table-action" @click="handleRemove(record)" v-hasPermi="Permission.del">
              <template #icon>
                <Icon icon="ant-design:delete-outlined" />
              </template>
              删除
            </AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :page-size-options="['5', '10', '15', '20']"
        :show-size-changer="true"
        :disabled="disabled"
        :total="total"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        show-quick-jumper
        @change="handlePageChange"
        @show-size-change="handlePageChange"
      />
    </div>

    <AModal v-model:open="dialogFormVisible" :title="isUpdate ? '修改卡信息' : '添加卡信息'" width="520px" :destroy-on-close="true" @cancel="onCloseAddDialog">
      <AForm :model="addFormData" layout="vertical">
        <AFormItem label="卡号">
          <AInput v-model:value="addFormData.cardNo" autocomplete="off" placeholder="请输入卡号" />
        </AFormItem>

        <AFormItem label="类型">
          <ASelect v-model:value="addFormData.type" :options="cardTypeOptions" placeholder="请选择类型" />
        </AFormItem>

        <AFormItem v-if="isUpdate" label="状态">
          <ARadioGroup v-model:value="addFormData.status" :options="cardStatusOptions" option-type="button" button-style="solid" class="status-radio-group" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onCloseAddDialog">取消</AButton>
          <AButton type="primary" @click="onClickConfirm">确定</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { addCardApi, deleteCardBatchApi, getCardApi, updateCardApi } from '@/api/member'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  Pagination as APagination,
  RadioGroup as ARadioGroup,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tag as ATag,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import qs from 'qs'
import * as requestApi from '@/api/request'
import { Icon } from '@/components/Icon'

type TableKey = string | number

interface SearchStruct {
  cardNo: string
  type?: string
  status?: string
}

interface TableDataStruct {
  [key: string]: any
  id: number
  cardNo: string
  type: number
  createTime: string
  status: number
  createStaffName: string
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getCardData()
}

const Permission = ref({
  add: 'mem_cad_add',
  rev: 'mem_cad_rev',
  del: 'mem_cad_del',
  sec: 'mem_cad_sec'
})

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const disabled = ref(false)
const TableData = ref<TableDataStruct[]>([])
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const showSearchForm = ref(true)
const disableRemove = computed(() => selectedRowKeys.value.length === 0)
const dialogFormVisible = ref(false)
const isUpdate = ref(false)

const cardTypeOptions = [
  { label: '会员', value: '1' },
  { label: '清运', value: '2' }
]

const cardStatusOptions = [
  { label: '未使用', value: '0' },
  { label: '已使用', value: '1' }
]

const searchFormData = reactive<SearchStruct>({
  cardNo: '',
  type: undefined,
  status: undefined
})

const addFormData = reactive<SearchStruct>({
  cardNo: '',
  type: '1',
  status: '0'
})

const columns: TableColumnsType<TableDataStruct> = [
  { title: '卡号', dataIndex: 'cardNo', key: 'cardNo', width: 180 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 140 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 140 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 200 },
  { title: '创建人', dataIndex: 'createStaffName', key: 'createStaffName', width: 140 },
  { title: '操作', key: 'action', width: 160 }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: TableDataStruct[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const getCardData = () => {
  getCardApi({
    page: currentPage.value,
    size: pageSize.value,
    cardNo: searchFormData.cardNo,
    type: searchFormData.type,
    status: searchFormData.status
  }).then((res: any) => {
    TableData.value = res.data?.records || []
    total.value = res.data?.total || 0
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getCardData()
}

const convertMemberType = (val: number) => {
  return val === 1 ? '会员' : '清运'
}

const convertStatus = (val: number) => {
  return val === 0 ? '未使用' : '已使用'
}

const onReset = () => {
  searchFormData.cardNo = ''
  searchFormData.type = undefined
  searchFormData.status = undefined
  currentPage.value = 1
  getCardData()
}

const OnClickAdd = () => {
  isUpdate.value = false
  addFormData.cardNo = ''
  addFormData.type = '1'
  addFormData.status = '0'
  dialogFormVisible.value = true
}

const deleteOfDetail = () => {
  deleteCards([...DeleteIdArray], '确定要删除这些卡信息吗？')
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const onCloseAddDialog = () => {
  dialogFormVisible.value = false
}

const handleDetail = (record: Record<string, any>) => {
  const val = record as TableDataStruct
  isUpdate.value = true
  addFormData.cardNo = val.cardNo
  addFormData.status = String(val.status)
  addFormData.type = String(val.type)
  dialogFormVisible.value = true
}

const handleRemove = (record: Record<string, any>) => {
  deleteCards([record.id], '确定要删除这个卡信息吗？')
}

const deleteCards = (ids: number[], content: string) => {
  if (ids.length === 0) {
    message.warning('请选择要删除的卡信息')
    return
  }

  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteCardBatchApi(qs.stringify({ ids }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getCardData()
    }
  })
}

const onClickConfirm = () => {
  if (isUpdate.value) {
    doUpdate()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加一个卡信息吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await addCardApi(addFormData)
      message.success('操作成功')
      getCardData()
      dialogFormVisible.value = false
    }
  })
}

const doUpdate = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这个卡信息吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await updateCardApi(addFormData)
      message.success('操作成功')
      getCardData()
      dialogFormVisible.value = false
    }
  })
}

onMounted(() => {
  getCardData()
})
</script>

<style lang="less" scoped>
.member-card-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: grid;
  padding: 16px;
  background-color: #fff;
  border-radius: 6px;
  gap: 14px 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  align-items: end;

  :deep(.ant-form-item) {
    margin-bottom: 0;
    align-items: center;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 72px;
    padding: 0 10px 0 0;
    line-height: 1;
    text-align: right;
  }

  :deep(.ant-form-item-label > label) {
    height: 32px;
    color: #262626;
    font-weight: 500;
  }

  :deep(.ant-form-item-control) {
    min-width: 0;
    flex: 1;
  }

  :deep(.ant-input),
  :deep(.ant-select) {
    width: 100%;
  }
}

.search-form-item,
.search-form-actions {
  min-width: 0;
}

.search-form-actions {
  :deep(.ant-form-item-control-input-content) {
    display: flex;
    align-items: center;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left,
.toolbar-right {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.icon-button,
.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;

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

.action-edit {
  color: #52c41a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.status-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.ant-radio-button-wrapper) {
    height: 32px;
    min-width: 72px;
    padding: 0 14px;
    line-height: 30px;
    text-align: center;
    border-inline-start-width: 1px;
    border-radius: 6px;
  }

  :deep(.ant-radio-button-wrapper::before) {
    display: none;
  }
}
</style>
