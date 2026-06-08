<template>
  <div class="warning-page">
    <AForm v-if="showSearchForm" :model="QueryParm" layout="horizontal" class="search-form">
      <AFormItem label="异常记录编号" class="search-form-item">
        <AInput v-model:value="QueryParm.id" placeholder="请输入记录编号" />
      </AFormItem>

      <AFormItem label="设备编号" class="search-form-item">
        <AInput v-model:value="QueryParm.serialNumber" placeholder="请输入设备编号" />
      </AFormItem>

      <AFormItem label="设备名称" class="search-form-item">
        <AInput v-model:value="QueryParm.deviceName" placeholder="请输入设备名称" />
      </AFormItem>

      <AFormItem label="故障类型" class="search-form-item">
        <ASelect v-model:value="QueryParm.warningModel" :options="warningModelOptions" allow-clear placeholder="请选择故障类型" />
      </AFormItem>

      <AFormItem label="设备状态" class="search-form-item">
        <ASelect v-model:value="QueryParm.Processed" :options="processOptions" allow-clear placeholder="请选择设备状态" />
      </AFormItem>

      <AFormItem label="产品类型" class="search-form-item">
        <ASelect v-model:value="QueryParm.deviceType" :options="deviceTypeOptions" allow-clear placeholder="请选择产品类型" />
      </AFormItem>

      <AFormItem label="运营商" class="search-form-item">
        <ASelect v-model:value="QueryParm.departmentId" :options="departmentOptions" allow-clear placeholder="请选择运营商" />
      </AFormItem>

      <AFormItem label="上报时间" class="search-form-item search-form-range">
        <ARangePicker v-model:value="operationTime" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" start-placeholder="开始时间" end-placeholder="结束时间" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="getTableData" v-hasPermi="Permission.sec">
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
        <AButton danger class="icon-button" @click="exportExcel">
          <template #icon>
            <Icon icon="ant-design:export-outlined" />
          </template>
          导出
        </AButton>
        <AButton type="primary" class="icon-button" :disabled="ProcessBatch" @click="doWorkBatch" v-hasPermi="Permission.han">
          <template #icon>
            <Icon icon="ant-design:tool-outlined" />
          </template>
          批量处理
        </AButton>
      </div>

      <div class="toolbar-right">
        <ATooltip :title="showSearchForm ? '隐藏搜索' : '显示搜索'">
          <AButton shape="circle" @click="showSearchForm = !showSearchForm">
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

    <ATable row-key="id" :columns="columns" :data-source="tableData" :pagination="false" :row-selection="rowSelection" :scroll="{ x: 'max-content' }" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'warning_model'">
          {{ record.warning_model == 1 ? '运维' : '清运' }}
        </template>

        <template v-else-if="column.key === 'Processed'">
          {{ ConvertStatus(record.Processed) }}
        </template>

        <template v-else-if="column.key === 'create_time'">
          {{ FormatDate(record.create_time) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <AButton type="link" class="table-action" @click="doWork(record)" v-hasPermi="Permission.han">处理</AButton>
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
        :total="QueryParm.total"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        show-quick-jumper
        @change="handlePageChange"
        @show-size-change="handlePageChange"
      />
    </div>

    <AModal v-model:open="ProcessDialogVisible" title="报警处理" width="520px">
      <AForm :model="ProcessData" layout="vertical">
        <AFormItem label="处理描述">
          <ATextarea v-model:value="ProcessData.desc" :rows="3" />
        </AFormItem>

        <AFormItem label="设备状态">
          <ARadioGroup v-model:value="ProcessData.type" :options="processOptions" option-type="button" button-style="solid" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="ProcessDialogVisible = false">取消</AButton>
          <AButton type="primary" @click="toDo">确认</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { getProductApi, getWarningListApi, setWarningProcessApi } from '@/api/machine'

import { getDepartmentForSelectApi } from '@/api/permission'

import { computed, inject, onMounted, ref } from 'vue'
import {
  Button as AButton,
  DatePicker as ADatePicker,
  Divider as ADivider,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  Pagination as APagination,
  RadioGroup as ARadioGroup,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import * as requestApi from '@/api/request'
import { FormatDate } from '@/utils/tools'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker
const ATextarea = AInput.TextArea

type TableKey = string | number
type DateRange = [string, string] | undefined

interface WarningQueryStruct {
  id?: number
  serialNumber: string
  deviceName: string
  warningModel?: number
  Processed?: number
  deviceType?: number
  departmentId?: number
  sTime: string
  eTime: string
  page: number
  size: number
  total: number
}

interface ProcessStruct {
  ids: number[]
  type: number
  desc: string
}

interface WarningRecord {
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

const Permission = ref({
  han: 'ord_war_han',
  sec: 'ord_war_sec'
})

const disabled = ref(false)
const ProcessDialogVisible = ref(false)
const QueryParm = ref<WarningQueryStruct>({
  id: undefined,
  serialNumber: '',
  deviceName: '',
  warningModel: undefined,
  Processed: undefined,
  deviceType: undefined,
  departmentId: undefined,
  sTime: '',
  eTime: '',
  page: 1,
  size: 10,
  total: 0
})

const selectedRowKeys = ref<TableKey[]>([])
const ProcessBatch = computed(() => selectedRowKeys.value.length === 0)
const tableData = ref<WarningRecord[]>([])
const showSearchForm = ref(true)
const departmentArray = ref<any[]>([])
const deviceTypeArray = ref<any[]>([])
const operationTime = ref<DateRange>()
let selectIdArray: number[] = []

const ProcessData = ref<ProcessStruct>({
  ids: [],
  type: 1,
  desc: ''
})

const warningModelOptions = [
  { value: 1, label: '运维' },
  { value: 2, label: '清运' }
]

const processOptions = [
  { value: 1, label: '未处理' },
  { value: 2, label: '暂不处理' },
  { value: 3, label: '已处理' }
]

const departmentOptions = computed(() => departmentArray.value.map((item) => ({ label: item.platform_name, value: item.id })))
const deviceTypeOptions = computed(() => deviceTypeArray.value.map((item) => ({ label: item.name, value: item.id })))

const columns: TableColumnsType<WarningRecord> = [
  { title: '异常编号', dataIndex: 'id', key: 'id', width: 100 },
  { title: '故障描述', dataIndex: 'warningLabel', key: 'warningLabel', width: 160 },
  { title: '所属运营商', dataIndex: 'Platform_name', key: 'Platform_name', width: 140 },
  { title: '设备名称', dataIndex: 'device_name', key: 'device_name', width: 120 },
  { title: '产品类型', dataIndex: 'type_name', key: 'type_name', width: 120 },
  { title: '设备编号', dataIndex: 'serial_number', key: 'serial_number', width: 140 },
  { title: '仓位名称', dataIndex: 'garbage_Name', key: 'garbage_Name', width: 120 },
  { title: '仓位', dataIndex: 'code', key: 'code', width: 80 },
  { title: '设备地址', dataIndex: 'address', key: 'address', width: 220 },
  { title: '处理描述', dataIndex: 'processed_descript', key: 'processed_descript', width: 120 },
  { title: '故障类型', dataIndex: 'warning_model', key: 'warning_model', width: 100 },
  { title: '处理状态', dataIndex: 'Processed', key: 'Processed', width: 120 },
  { title: '上报时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: WarningRecord[]) => {
    selectedRowKeys.value = keys
    selectIdArray = rows.map((row) => row.id)
  }
}))

const ConvertStatus = (type: number): string => {
  switch (type) {
    case 1:
      return '未处理'
    case 2:
      return '暂不处理'
    case 3:
      return '已处理'
    default:
      return '未知'
  }
}

const doWorkBatch = () => {
  ProcessData.value.ids = [...selectIdArray]
  ProcessData.value.desc = ''
  ProcessData.value.type = 1
  ProcessDialogVisible.value = true
}

const exportExcel = () => {}

onMounted(() => {
  getProduct()
  getDepartment()
  getTableData()
})

const handlePageChange = (page: number, size: number) => {
  QueryParm.value.page = page
  QueryParm.value.size = size
  getTableData()
}

const getTableData = () => {
  QueryParm.value.sTime = operationTime.value?.[0] || ''
  QueryParm.value.eTime = operationTime.value?.[1] || ''

  getWarningListApi(QueryParm.value).then((res: any) => {
    tableData.value = res.data?.records || []
    QueryParm.value.total = res.data?.total || 0
    selectedRowKeys.value = []
    selectIdArray = []
  })
}

const doWork = (row: Record<string, any>) => {
  ProcessData.value.ids = [row.id]
  ProcessData.value.desc = ''
  ProcessData.value.type = 1
  ProcessDialogVisible.value = true
}

const onReset = () => {
  QueryParm.value = {
    id: undefined,
    serialNumber: '',
    deviceName: '',
    warningModel: undefined,
    Processed: undefined,
    deviceType: undefined,
    departmentId: undefined,
    sTime: '',
    eTime: '',
    page: 1,
    size: 10,
    total: 0
  }
  operationTime.value = undefined
  getTableData()
}

const getProduct = () => {
  getProductApi({
    page: 1,
    size: 100
  }).then((res: any) => {
    deviceTypeArray.value = res.data || []
  })
}

const getDepartment = () => {
  getDepartmentForSelectApi().then((res: any) => {
    departmentArray.value = res.data || []
  })
}

const toDo = () => {
  if (ProcessData.value.desc == '' || ProcessData.value.desc.trim().length == 0) {
    message.warning('请填写处理描述')
    return
  }

  setWarningProcessApi(ProcessData.value).then((res: any) => {
    if (res.code == 200) {
      message.success('操作成功')
      getTableData()
      ProcessDialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="less">
.warning-page {
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
    flex: 0 0 96px;
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

.table-action {
  height: 24px;
  padding: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}
</style>
