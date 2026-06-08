<template>
  <div class="maintenance-equipment-page">
    <AForm v-if="showSearchForm" :model="SearchFormData" layout="horizontal" class="search-form">
      <AFormItem label="设备编号" class="search-form-item">
        <AInput v-model:value="SearchFormData.dNumber" placeholder="请输入设备编号" />
      </AFormItem>

      <AFormItem label="设备名称" class="search-form-item">
        <AInput v-model:value="SearchFormData.dName" placeholder="请输入设备名称" />
      </AFormItem>

      <AFormItem label="设备区域" class="search-form-item">
        <ASelect v-model:value="SearchFormData.dArea" :options="deviceAreaOptions" allow-clear placeholder="请选择设备区域" />
      </AFormItem>

      <AFormItem label="设备型号" class="search-form-item">
        <ASelect v-model:value="SearchFormData.dType" :options="deviceTypeOptions" allow-clear placeholder="请选择设备型号" />
      </AFormItem>

      <AFormItem label="设备状态" class="search-form-item">
        <ASelect v-model:value="SearchFormData.dStatus" :options="deviceStatusOptions" allow-clear placeholder="请选择设备状态" />
      </AFormItem>

      <AFormItem label="在线状态" class="search-form-item">
        <ASelect v-model:value="SearchFormData.dOnLine" :options="OnLineOption" allow-clear placeholder="请选择在线状态" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="onSearch" v-hasPermi="Permission.sec">
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
      <div></div>
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

    <ATable row-key="id" :columns="columns" :data-source="TableData" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          {{ ConverStatus(record.status) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <AButton type="link" class="table-action" @click="channelSet(record)">子设备</AButton>
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

    <AModal v-model:open="operationVisible" title="设备操作" width="80%" :footer="null" centered>
      <ARow :gutter="16" class="operation-layout">
        <ACol :span="5">
          <div class="channel-panel">
            <div class="channel-title">仓位</div>
            <button v-for="item in currentDeviceChannelList" :key="item" type="button" class="channel-box" :class="{ 'channel-box-active': selectItem == item }" @click="setBg(item)">
              {{ item }}
            </button>
          </div>
        </ACol>

        <ACol :span="19">
          <ATabs v-model:activeKey="activeName" class="operation-tabs">
            <ATabPane key="first" tab="设备属性">
              <ATable row-key="label" size="small" :columns="channelInfoColumns" :data-source="currentChannelInfo" :pagination="false" :scroll="{ y: 400 }" bordered />
            </ATabPane>

            <ATabPane key="second" tab="监控指令">
              <ATable row-key="id" size="small" :columns="rtoColumns" :data-source="RTOArray" :pagination="false" :scroll="{ y: 400 }" bordered>
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'action'">
                    <ASpace>
                      <AButton type="link" class="table-action" @click="doSend(record)" v-hasPermi="Permission.sen">发送</AButton>
                      <AButton type="link" class="table-action" @click="sendRecord(record)" v-hasPermi="Permission.quy">发送记录</AButton>
                    </ASpace>
                  </template>
                </template>
              </ATable>
            </ATabPane>

            <ATabPane key="third" tab="配置外设">
              <div class="config-box">
                <div class="external-unit-box">
                  <ACheckbox v-model:checked="selectAll" @change="unitSelectAll">全选</ACheckbox>
                  <ACheckbox v-for="item in ExternalUnitArray" :key="item.id" :checked="Boolean(item.checked)" @change="(event) => setExternalUnitChecked(item, event)">
                    {{ item.label }}
                  </ACheckbox>
                </div>

                <div class="parameter-box">
                  <div class="param-list">
                    <span>积分配置</span>
                    <ASwitch v-model:checked="currentParameter.configurePoints" />
                  </div>

                  <div class="param-list">
                    <span>是否更新参数</span>
                    <ASwitch v-model:checked="currentParameter.updateParameter" />
                  </div>

                  <div class="param-list">
                    <span>是否更新设备有效性</span>
                    <ASwitch v-model:checked="currentParameter.availability" />
                  </div>

                  <div class="param-list">
                    <span>信息上报周期</span>
                    <AInputNumber v-model:value="currentParameter.transmissionPeriod" :min="0" :max="254" />
                    <span class="unit-text">秒</span>
                  </div>

                  <div class="param-list">
                    <span>烟感上报时间间隔</span>
                    <AInputNumber v-model:value="currentParameter.smog" :min="0" />
                    <span class="unit-text">秒</span>
                  </div>

                  <div class="param-list">
                    <span>人体感应延时时间</span>
                    <AInputNumber v-model:value="currentParameter.deferred" :min="0" :max="254" />
                    <span class="unit-text">秒</span>
                  </div>

                  <div class="param-list">
                    <span>夹手强制性退出时间</span>
                    <AInputNumber v-model:value="currentParameter.gripper" :min="0" :max="254" />
                    <span class="unit-text">秒</span>
                  </div>

                  <div class="param-list">
                    <span>输入状态检测时间</span>
                    <AInputNumber v-model:value="currentParameter.inputCheck" :min="0" :max="254" />
                    <span class="unit-text">秒</span>
                  </div>

                  <div class="param-list">
                    <span>开关门时间</span>
                    <AInputNumber v-model:value="currentParameter.close" :min="0" />
                    <span class="unit-text">秒</span>
                  </div>

                  <div class="param-list">
                    <span>推杆保持时间</span>
                    <AInputNumber v-model:value="currentParameter.push" :min="0" :max="254" />
                    <span class="unit-text">秒</span>
                  </div>

                  <div class="param-list">
                    <span>应用到其他仓位</span>
                    <ASwitch v-model:checked="currentParameter.isAll" />
                  </div>
                </div>

                <div class="operation-button-box">
                  <AButton type="primary" @click="doSendParam" v-hasPermi="Permission.rev">确定</AButton>
                </div>
              </div>
            </ATabPane>
          </ATabs>
        </ACol>
      </ARow>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { getChannelInfoApi, getDeviceApi, getDeviceParameterApi, getDeviceStatusApi, getDeviceTypeApi, getExternalUnitApi, getRTOApi, sendParameterApi, sendRTOApi } from '@/api/machine'

import { getDeviceAreaApi } from '@/api/permission'

import { computed, inject, onMounted, Ref, ref } from 'vue'
import {
  Button as AButton,
  Checkbox as ACheckbox,
  Col as ACol,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  Row as ARow,
  Select as ASelect,
  Space as ASpace,
  Switch as ASwitch,
  Table as ATable,
  TabPane as ATabPane,
  Tabs as ATabs,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import * as requestApi from '@/api/request'
import { Icon } from '@/components/Icon'

interface SearchDataStruct {
  dNumber?: string
  dName?: string
  dArea?: number
  dType?: number
  dImei?: number
  dStatus?: number
  dOnLine?: number
  dProductType?: number
}

interface ParameterStruct {
  id: number
  channel: number
  deferred: number
  smog: number
  gripper: number
  close: number
  push: number
  deviceId: number
  configurePoints: number | boolean
  updateParameter: number | boolean
  availability: number | boolean
  transmissionPeriod: number
  inputCheck: number
  isAll: boolean
}

interface RTOStruct {
  id: number
  label: string
  createTime: string
}

interface DeviceAreaStruct {
  id: number
  areaName: string
}

interface DeviceTypeStruct {
  id: number
  name: string
}

interface DeviceStatusStruct {
  id: number
  label: string
}

interface ExternalUnitStruct {
  id: number
  label: string
  checked: number | boolean
}

interface DeviceRecord {
  [key: string]: any
  id: number
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getDeviceData()
}

const Permission = ref({
  sen: 'min_equ_sen',
  rev: 'min_equ_rev',
  quy: 'min_equ_quy',
  sec: 'min_equ_sec'
})

const disabled = ref(false)
const total = ref(0)
const selectItem = ref(1)
const activeName = ref('first')
const showSearchForm = ref(true)
const currentPage = ref(1)
const pageSize = ref(5)
const operationVisible = ref(false)

const OnLineOption = [
  { value: 0, label: '离线' },
  { value: 1, label: '在线' }
]

const defaultParameter: ParameterStruct = {
  id: 0,
  channel: 0,
  deferred: 0,
  smog: 0,
  gripper: 0,
  close: 0,
  push: 0,
  deviceId: 0,
  configurePoints: false,
  updateParameter: false,
  availability: false,
  transmissionPeriod: 0,
  inputCheck: 0,
  isAll: false
}

const currentChannelInfo: Ref<any[]> = ref([])
const ExternalUnitArray: Ref<ExternalUnitStruct[]> = ref([])
const selectAll = ref(false)
const currentParameter: Ref<ParameterStruct> = ref({ ...defaultParameter })
const TableData = ref<Record<string, any>[]>([])
const currentDeviceChannelList: Ref<number[]> = ref([])
const SearchFormData: Ref<SearchDataStruct> = ref({
  dNumber: '',
  dName: '',
  dArea: undefined,
  dType: undefined,
  dImei: undefined,
  dStatus: undefined,
  dOnLine: undefined,
  dProductType: undefined
})
const RTOArray: Ref<RTOStruct[]> = ref([])
const deviceAreaArray: Ref<DeviceAreaStruct[]> = ref([])
const deviceTypeArray: Ref<DeviceTypeStruct[]> = ref([])
const deviceStatusArray: Ref<DeviceStatusStruct[]> = ref([])

let currentDevice: Record<string, any> | undefined

const deviceAreaOptions = computed(() => deviceAreaArray.value.map((item) => ({ label: item.areaName, value: item.id })))
const deviceTypeOptions = computed(() => deviceTypeArray.value.map((item) => ({ label: item.name, value: item.id })))
const deviceStatusOptions = computed(() => deviceStatusArray.value.map((item) => ({ label: item.label, value: item.id })))

const columns: TableColumnsType<Record<string, any>> = [
  { title: '设备编号', dataIndex: 'serialNumber', key: 'serialNumber', width: 160 },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '设备地址', dataIndex: 'address', key: 'address', width: 180 },
  { title: '是否在线', dataIndex: 'isOnline', key: 'isOnline', width: 120 },
  { title: '最后在线时间', dataIndex: 'onlineTime', key: 'onlineTime', width: 180 },
  { title: '型号名称', dataIndex: ['deviceType', 'name'], key: 'deviceTypeName', width: 160 },
  { title: '设备sn', dataIndex: 'imei', key: 'imei', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 120 }
]

const channelInfoColumns: TableColumnsType<any> = [
  { title: '属性名称', dataIndex: 'label', key: 'label', width: 240, align: 'center' },
  { title: '属性值', dataIndex: 'content', key: 'content', width: 220, align: 'center' },
  { title: '更新时间', dataIndex: 'time', key: 'time', align: 'center' }
]

const rtoColumns: TableColumnsType<RTOStruct> = [
  { title: '指令名称', dataIndex: 'label', key: 'label', width: 260, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 220, align: 'center' }
]

const doSendParam = () => {
  if (!currentDevice) return

  currentParameter.value.channel = currentParameter.value.isAll ? 0 : selectItem.value
  currentParameter.value.deviceId = currentDevice.id

  sendParameterApi(currentParameter.value).then((res: any) => {
    if (res.code == 200) {
      message.success('操作成功')
    }
  })
}

const getParameter = () => {
  if (!currentDevice) return

  const parm = {
    deviceId: currentDevice.id,
    channel: selectItem.value
  }

  getChannelInfoApi(parm).then((res: any) => {
    const data = res.data
    currentChannelInfo.value = []

    if (!data) return

    currentChannelInfo.value = [
      {
        label: '链接状态',
        content: data.linkStatus == 1 ? '正常' : '异常',
        time: data.updateTime
      },
      {
        label: '软件版本',
        content: data.version,
        time: data.updateTime
      },
      {
        label: '是否满溢',
        content: data.spillOver == 0 ? '未满溢' : '满溢',
        time: data.updateTime
      },
      {
        label: '清运门锁',
        content: data.doorLock == 0 ? '关闭' : '开启',
        time: data.updateTime
      },
      {
        label: '灭火器状态',
        content: data.fireStatus == 0 ? '未启用' : '启用',
        time: data.updateTime
      },
      {
        label: '臭氧',
        content: data.ozone == 0 ? '未开启' : '开启',
        time: data.updateTime
      },
      {
        label: '防夹手',
        content: data.antiTrap == 0 ? '未开启' : '开启',
        time: data.updateTime
      },
      {
        label: '烟雾',
        content: data.smog == 0 ? '未开启' : '开启',
        time: data.updateTime
      },
      {
        label: '湿度',
        content: data.humidity,
        time: data.updateTime
      },
      {
        label: '温度',
        content: data.temperature,
        time: data.updateTime
      },
      {
        label: '重量',
        content: data.weight,
        time: data.updateTime
      }
    ]
  })

  getDeviceParameterApi(parm).then((res: any) => {
    if (res.data) {
      currentParameter.value = {
        ...res.data,
        isAll: res.data.channel == 0
      }
    } else {
      currentParameter.value = { ...defaultParameter }
    }
  })
}

const setBg = (item: number) => {
  selectItem.value = item
  getParameter()
}

const ConverStatus = (val: number) => {
  switch (val) {
    case 1:
      return '待使用'
    case 2:
      return '使用中'
    case 3:
      return '已禁用'
    case 4:
      return '故障'
    case 5:
      return '已欠费'
    default:
      return '未知'
  }
}

const channelSet = (row: Record<string, any>) => {
  operationVisible.value = true
  const count: number = row.deviceType?.warehouse || 0
  currentDeviceChannelList.value = []
  for (let i = 1; i <= count; i++) {
    currentDeviceChannelList.value.push(i)
  }
  currentDevice = row
  selectItem.value = 1
  activeName.value = 'first'
  getParameter()
}

const getExternalUnit = () => {
  getExternalUnitApi().then((res: any) => {
    ExternalUnitArray.value = res.data || []
  })
}

const unitSelectAll = () => {
  ExternalUnitArray.value.forEach((element) => {
    element.checked = selectAll.value
  })
}

const setExternalUnitChecked = (item: ExternalUnitStruct, event: any) => {
  item.checked = event.target.checked
}

onMounted(() => {
  getDeviceData()
  getDevcieType()
  getDeviceStatus()
  getDeviceArea()
  getRTO()
  getExternalUnit()
})

const doSend = (row: Record<string, any>) => {
  if (!currentDevice) return

  sendRTOApi({
    deviceId: currentDevice.id,
    operationId: row.id,
    channelId: selectItem.value
  }).then((res: any) => {
    if (res.code == 200) {
      message.success('操作成功')
    }
  })
}

const sendRecord = (row: Record<string, any>) => {
  console.log(row)
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getDeviceData()
}

const onSearch = () => {
  currentPage.value = 1
  getDeviceData()
}

const onReset = () => {
  SearchFormData.value.dNumber = ''
  SearchFormData.value.dName = ''
  SearchFormData.value.dArea = undefined
  SearchFormData.value.dType = undefined
  SearchFormData.value.dStatus = undefined
  SearchFormData.value.dOnLine = undefined
  currentPage.value = 1
  getDeviceData()
}

const getDeviceStatus = () => {
  getDeviceStatusApi().then((res: any) => {
    deviceStatusArray.value = res.data || []
  })
}

const getDeviceArea = () => {
  getDeviceAreaApi().then((res: any) => {
    deviceAreaArray.value = res.data || []
  })
}

const getDeviceData = () => {
  getDeviceApi({
    id: SearchFormData.value.dNumber,
    deviceName: SearchFormData.value.dName,
    deviceArea: SearchFormData.value.dArea,
    deviceType: SearchFormData.value.dType,
    onLine: SearchFormData.value.dOnLine,
    status: SearchFormData.value.dStatus,
    page: currentPage.value,
    size: pageSize.value
  }).then((res: any) => {
    TableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  })
}

const getDevcieType = () => {
  getDeviceTypeApi().then((res: any) => {
    deviceTypeArray.value = res.data || []
  })
}

const getRTO = () => {
  getRTOApi().then((res: any) => {
    RTOArray.value = res.data || []
  })
}
</script>

<style scoped lang="less">
.maintenance-equipment-page {
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.operation-layout {
  min-height: 560px;
}

.channel-panel {
  display: flex;
  min-height: 560px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.channel-title {
  height: 32px;
  color: #262626;
  font-weight: 600;
  line-height: 32px;
  text-align: center;
}

.channel-box {
  height: 34px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0, 0, 1, 1);

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}

.channel-box-active {
  color: #fff;
  background: #1677ff;
  border-color: #1677ff;
}

.operation-tabs {
  min-height: 560px;
}

.config-box {
  display: grid;
  min-height: 480px;
  grid-template-columns: 180px minmax(0, 1fr) 120px;
  gap: 16px;
}

.external-unit-box {
  display: flex;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  flex-direction: column;
  gap: 10px;
}

.parameter-box {
  display: grid;
  align-content: start;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 12px 16px;
}

.param-list {
  display: grid;
  height: 32px;
  align-items: center;
  grid-template-columns: 150px 120px 32px;
  gap: 8px;
}

.unit-text {
  color: #595959;
}

.operation-button-box {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
</style>
