<template>
  <div class="points-page">
    <AForm v-if="showSearchForm" :model="QueryParm" layout="horizontal" class="search-form">
      <AFormItem label="运营商" class="search-form-item">
        <ASelect v-model:value="QueryParm.department" :options="departmentOptions" allow-clear placeholder="请选择运营商" />
      </AFormItem>

      <AFormItem label="设备区域" class="search-form-item">
        <ASelect v-model:value="QueryParm.deviceArea" :options="deviceAreaOptions" allow-clear placeholder="请选择设备区域" />
      </AFormItem>

      <AFormItem label="来源" class="search-form-item">
        <ASelect v-model:value="QueryParm.reason" :options="reasonOptions" allow-clear placeholder="请选择来源" />
      </AFormItem>

      <AFormItem label="设备编号" class="search-form-item">
        <AInput v-model:value="QueryParm.serialNumber" placeholder="请输入设备编号" />
      </AFormItem>

      <AFormItem label="积分类型" class="search-form-item">
        <ASelect v-model:value="QueryParm.type" :options="pointType" allow-clear placeholder="请选择积分类型" />
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
        <AButton danger class="icon-button" @click="exportExcel" :disabled="disableRemove">
          <template #icon>
            <Icon icon="ant-design:export-outlined" />
          </template>
          导出
        </AButton>
        <AButton v-if="false" type="primary" class="icon-button" @click="onOpenSetPointsDialog">
          <template #icon>
            <Icon icon="ant-design:setting-outlined" />
          </template>
          积分比例设置
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

    <ATable row-key="id" :columns="columns" :data-source="logData" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'record_type'">
          {{ convertPointype(record.record_type) }}
        </template>

        <template v-else-if="column.key === 'reason'">
          {{ converReason(record.reason) }}
        </template>

        <template v-else-if="column.key === 'recorded'">
          {{ record.recorded == 1 ? '未入账' : '已入账' }}
        </template>

        <template v-else-if="column.key === 'recorded_time'">
          {{ converDateFormat(record.recorded_time) }}
        </template>

        <template v-else-if="column.key === 'create_time'">
          {{ converDateFormat(record.create_time) }}
        </template>

        <template v-else-if="column.key === 'staff_id'">
          {{ getStaffName(record.staff_id) }}
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

    <AModal v-model:open="setPointsVisible" title="积分比例设置" width="420px">
      <div class="ratio-row">
        <span>积分比例</span>
        <span>1 :</span>
        <AInputNumber v-model:value="PointsRatio" :min="1" :max="100000" />
      </div>
      <template #footer>
        <ASpace>
          <AButton @click="setPointsClose">取消</AButton>
          <AButton type="primary" @click="doSetPoints">确定</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { getPointsRatioApi, updatePointsRatioApi } from '@/api/order'

import { getPointListApi, getPointReasonApi } from '@/api/member'

import { getDepartmentForSelectApi, getDeviceAreaForSelectApi, getStaffApi } from '@/api/permission'

import { computed, inject, onMounted, ref } from 'vue'
import {
  Button as AButton,
  DatePicker as ADatePicker,
  Divider as ADivider,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import qs from 'qs'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker

type TableKey = string | number
type DateRange = [string, string] | undefined

interface QueryParamStruct {
  department?: number
  deviceArea?: number
  reason?: number
  type?: number
  serialNumber: string
  sTime?: string
  eTime?: string
  page: number
  size: number
}

interface PointRecord {
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

const PointsRatio = ref(100)
const setPointsVisible = ref(false)
const operationTime = ref<DateRange>()
const disabled = ref(false)
const total = ref(0)
const departmentArray = ref<any[]>([])
const deviceAreaArray = ref<any[]>([])
const reasonArray = ref<any[]>([])
const staffArray = ref<any[]>([])
const logData = ref<PointRecord[]>([])
const showSearchForm = ref(true)
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const pointType = [
  { value: 1, label: '延时到账' },
  { value: 2, label: '立即到账' }
]

const QueryParm = ref<QueryParamStruct>({
  department: undefined,
  deviceArea: undefined,
  reason: undefined,
  type: undefined,
  serialNumber: '',
  sTime: '',
  eTime: '',
  page: 1,
  size: 10
})

const disableRemove = computed(() => selectedRowKeys.value.length === 0)
const departmentOptions = computed(() => departmentArray.value.map((item) => ({ label: item.platform_name, value: item.id })))
const deviceAreaOptions = computed(() => deviceAreaArray.value.map((item) => ({ label: item.areaName, value: item.id })))
const reasonOptions = computed(() => reasonArray.value.map((item) => ({ label: item.label, value: item.id })))
const staffNameMap = computed(() => {
  const map = new Map<string, string>()

  staffArray.value.forEach((item) => {
    if (item.id != null) map.set(String(item.id), item.name)
    if (item.adminId != null) map.set(String(item.adminId), item.name)
  })

  return map
})

const columns: TableColumnsType<PointRecord> = [
  { title: '积分类型', dataIndex: 'record_type', key: 'record_type', width: 120 },
  { title: '积分数额', dataIndex: 'points', key: 'points', width: 120 },
  { title: '来源', dataIndex: 'reason', key: 'reason', width: 160 },
  { title: '运营商', dataIndex: 'Platform_name', key: 'Platform_name', width: 160 },
  { title: '设备区域', dataIndex: 'area_name', key: 'area_name', width: 160 },
  { title: '设备编号', dataIndex: 'serial_number', key: 'serial_number', width: 160 },
  { title: '是否入账', dataIndex: 'recorded', key: 'recorded', width: 120 },
  { title: '入账时间', dataIndex: 'recorded_time', key: 'recorded_time', width: 180 },
  { title: '描述', dataIndex: 'remarks', key: 'remarks', width: 160 },
  { title: '积分结余', dataIndex: 'current_point', key: 'current_point', width: 160 },
  { title: '操作人', dataIndex: 'staff_id', key: 'staff_id', width: 160 },
  { title: '操作时间', dataIndex: 'create_time', key: 'create_time', width: 180 }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: PointRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.oper_id)
  }
}))

const getPointsRatio = () => {
  getPointsRatioApi().then((res: any) => {
    PointsRatio.value = res.data.ratio
  })
}

const onOpenSetPointsDialog = () => {
  setPointsVisible.value = true
}

const setPointsClose = () => {
  setPointsVisible.value = false
}

const doSetPoints = () => {
  updatePointsRatioApi(qs.stringify({ ratio: PointsRatio.value }, { arrayFormat: 'brackets' })).then(() => {
    message.success('操作成功')
    getPointsRatio()
    setPointsVisible.value = false
  })
}

const convertPointype = (type: number): string => {
  if (type == 1) return '延时到账'
  if (type == 2) return '立即到账'
  return '未知类型'
}

const converReason = (item: any): string => {
  return reasonArray.value.find((element) => item == element.id)?.label || '未知'
}

const getStaffName = (staffId?: string | number) => {
  if (staffId == null || staffId === '') return '-'
  return staffNameMap.value.get(String(staffId)) || String(staffId)
}

onMounted(() => {
  getDepartment()
  getPontsReason()
  getDeviceArea()
  getStaff()
  getTableData()
  getPointsRatio()
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
  getPointListApi(QueryParm.value).then((res: any) => {
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
  QueryParm.value.deviceArea = undefined
  QueryParm.value.reason = undefined
  QueryParm.value.type = undefined
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

const getPontsReason = () => {
  getPointReasonApi().then((res: any) => {
    if (res.code == 200) {
      reasonArray.value = res.data || []
    }
  })
}

const getStaff = () => {
  getStaffApi({ index: 1, size: 99999 }).then((res: any) => {
    if (res.code == 200) {
      staffArray.value = res.data?.records || []
    }
  })
}

const exportExcel = () => {
  console.log(DeleteIdArray)
}
</script>

<style lang="less" scoped>
.points-page {
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
    flex: 0 0 80px;
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

.ratio-row {
  display: grid;
  align-items: center;
  grid-template-columns: 88px 40px 1fr;
  gap: 8px;
  font-size: 16px;
}

.w-full {
  width: 100%;
}
</style>
