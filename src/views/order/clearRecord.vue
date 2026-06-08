<template>
  <div class="clear-record-page">
    <AForm v-if="showSearchForm" :model="QueryParm" layout="horizontal" class="search-form">
      <AFormItem label="运营商" class="search-form-item">
        <ASelect v-model:value="QueryParm.department" :options="departmentOptions" allow-clear placeholder="请选择运营商" />
      </AFormItem>

      <AFormItem label="设备区域" class="search-form-item">
        <ASelect v-model:value="QueryParm.deviceArea" :options="deviceAreaOptions" allow-clear placeholder="请选择设备区域" />
      </AFormItem>

      <AFormItem label="清运员卡号" class="search-form-item">
        <AInput v-model:value="QueryParm.cardId" placeholder="请输入卡号" />
      </AFormItem>

      <AFormItem label="设备编号" class="search-form-item">
        <AInput v-model:value="QueryParm.serialNumber" placeholder="请输入设备编号" />
      </AFormItem>

      <AFormItem label="记录编号" class="search-form-item">
        <AInput v-model:value="QueryParm.id" placeholder="请输入记录编号" />
      </AFormItem>

      <AFormItem label="手机号" class="search-form-item">
        <AInput v-model:value="QueryParm.phone" placeholder="请输入清运员手机号" />
      </AFormItem>

      <AFormItem label="操作时间" class="search-form-item search-form-range">
        <ARangePicker v-model:value="operationTime" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" start-placeholder="开始时间" end-placeholder="结束时间" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="getTableData">
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
        <AButton danger class="icon-button" :disabled="disableRemove" @click="exportExcel">
          <template #icon>
            <Icon icon="ant-design:export-outlined" />
          </template>
          导出
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

    <ADivider />

    <ATable row-key="id" :columns="columns" :data-source="logData" :pagination="false" :row-selection="rowSelection" :scroll="{ x: 'max-content' }" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          {{ record.status == 1 ? '已清运' : '未清运' }}
        </template>

        <template v-else-if="column.key === 'create_time'">
          {{ converDateFormat(record.create_time) }}
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="QueryParm.page"
        v-model:page-size="QueryParm.size"
        :page-size-options="['5', '10', '15', '20', '50', '100']"
        :show-size-changer="true"
        :disabled="disabled"
        :total="total"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        show-quick-jumper
        @change="handlePageChange"
        @show-size-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getClearRecordApi } from '@/api/order'

import { getDepartmentForSelectApi, getDeviceAreaForSelectApi } from '@/api/permission'

import { computed, inject, onMounted, ref } from 'vue'
import {
  Button as AButton,
  DatePicker as ADatePicker,
  Divider as ADivider,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Pagination as APagination,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import * as requestApi from '@/api/request'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker

type TableKey = string | number
type DateRange = [string, string] | undefined

interface QueryParamStruct {
  department?: number
  deviceArea?: number
  cardId?: string
  id?: string
  serialNumber: string
  phone: string
  sTime?: string
  eTime?: string
  page: number
  size: number
}

interface ClearRecordStruct {
  [key: string]: any
  id: number
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getTableData()
}

const operationTime = ref<DateRange>()
const disabled = ref(false)
const total = ref(0)
const departmentArray = ref<any[]>([])
const deviceAreaArray = ref<any[]>([])
const logData = ref<ClearRecordStruct[]>([])
const showSearchForm = ref(true)
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const QueryParm = ref<QueryParamStruct>({
  department: undefined,
  deviceArea: undefined,
  cardId: '',
  id: undefined,
  phone: '',
  serialNumber: '',
  sTime: '',
  eTime: '',
  page: 1,
  size: 10
})

const departmentOptions = computed(() => departmentArray.value.map((item) => ({ label: item.platform_name, value: item.id })))
const deviceAreaOptions = computed(() => deviceAreaArray.value.map((item) => ({ label: item.areaName, value: item.id })))

const columns: TableColumnsType<ClearRecordStruct> = [
  { title: '记录编号', dataIndex: 'id', key: 'id', width: 100 },
  { title: '清运员卡号', dataIndex: 'card_id', key: 'card_id', width: 160 },
  { title: '运营商', dataIndex: 'Platform_name', key: 'Platform_name', width: 160 },
  { title: '设备区域', dataIndex: 'area_name', key: 'area_name', width: 160 },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '设备编号', dataIndex: 'serial_number', key: 'serial_number', width: 160 },
  { title: '清运状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '仓位', dataIndex: 'channel', key: 'channel', width: 80 },
  { title: '垃圾类型', dataIndex: 'garbage_name', key: 'garbage_name', width: 160 },
  { title: '重量', dataIndex: 'weight', key: 'weight', width: 80 },
  { title: '清运时间', dataIndex: 'create_time', key: 'create_time', width: 220 }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: ClearRecordStruct[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.oper_id)
  }
}))

onMounted(() => {
  getDepartment()
  getDeviceArea()
  getTableData()
})

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const converDateFormat = (time: string) => {
  return time ? time.replace('T', ' ') : time
}

const handlePageChange = (page: number, size: number) => {
  QueryParm.value.page = page
  QueryParm.value.size = size
  getTableData()
}

const getTableData = () => {
  QueryParm.value.sTime = operationTime.value?.[0] || ''
  QueryParm.value.eTime = operationTime.value?.[1] || ''

  getClearRecordApi(QueryParm.value).then((res: any) => {
    if (res.code == 200) {
      logData.value = res.data?.records || []
      total.value = res.data?.total || 0
      selectedRowKeys.value = []
      DeleteIdArray = []
    }
  })
}

const onReset = () => {
  QueryParm.value.department = undefined
  QueryParm.value.cardId = ''
  QueryParm.value.deviceArea = undefined
  QueryParm.value.id = ''
  QueryParm.value.phone = ''
  QueryParm.value.serialNumber = ''
  QueryParm.value.page = 1
  operationTime.value = undefined
  getTableData()
}

const getDepartment = () => {
  getDepartmentForSelectApi().then((res: any) => {
    if (res.code == 200) {
      departmentArray.value = res.data || []
    }
  })
}

const getDeviceArea = () => {
  getDeviceAreaForSelectApi().then((res: any) => {
    if (res.code == 200) {
      deviceAreaArray.value = res.data || []
    }
  })
}

const exportExcel = () => {
  console.log(DeleteIdArray)
}
</script>

<style lang="less" scoped>
.clear-record-page {
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  align-items: end;

  :deep(.ant-form-item) {
    display: flex;
    margin-bottom: 0;
    align-items: center;
    flex-wrap: nowrap;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 92px;
    padding: 0 10px 0 0;
    line-height: 1;
    text-align: right;
    white-space: nowrap;
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
  :deep(.ant-select),
  :deep(.ant-picker) {
    width: 100%;
  }
}

.search-form-item,
.search-form-actions {
  min-width: 0;
}

.search-form-range {
  grid-column: span 2;
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

  :deep(.ant-btn-icon),
  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}
</style>
