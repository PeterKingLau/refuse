<template>
  <div class="device-distribution-page">
    <AForm v-if="showSearchForm" :model="SearchFormData" layout="horizontal" class="search-form">
      <AFormItem label="设备编号" class="search-form-item">
        <AInput v-model:value="SearchFormData.deviceNumber" placeholder="请输入设备编号" />
      </AFormItem>

      <AFormItem label="设备名称" class="search-form-item">
        <AInput v-model:value="SearchFormData.deviceName" placeholder="请输入设备名称" />
      </AFormItem>

      <AFormItem label="设备区域" class="search-form-item">
        <ASelect v-model:value="SearchFormData.deviceArea" :options="deviceAreaOptions" allow-clear placeholder="请选择设备区域" />
      </AFormItem>

      <AFormItem label="设备型号" class="search-form-item">
        <ASelect v-model:value="SearchFormData.deviceType" :options="deviceTypeOptions" allow-clear placeholder="请选择设备型号" />
      </AFormItem>

      <AFormItem label="运营商" class="search-form-item">
        <ASelect v-model:value="SearchFormData.departmentId" :options="departmentOptions" allow-clear placeholder="请选择运营商" />
      </AFormItem>

      <AFormItem label="设备状态" class="search-form-item">
        <ASelect v-model:value="SearchFormData.deviceStatus" :options="deviceStatusOptions" allow-clear placeholder="请选择设备状态" />
      </AFormItem>

      <AFormItem label="在线状态" class="search-form-item">
        <ASelect v-model:value="SearchFormData.deviceOnLine" :options="OnLineOption" allow-clear placeholder="请选择在线状态" />
      </AFormItem>

      <AFormItem label="激活" class="search-form-item">
        <ASelect v-model:value="SearchFormData.deviceAtivation" :options="Activation" allow-clear placeholder="请选择设备激活状态" />
      </AFormItem>

      <AFormItem label="IMEI" class="search-form-item">
        <AInput v-model:value="SearchFormData.IMEI" placeholder="请输入设备 IMEI" />
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
      <div class="toolbar-left">
        <AButton type="primary" class="icon-button" @click="OnClickAdd" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新增
        </AButton>

        <AButton type="primary" class="icon-button" @click="addBatch" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:import-outlined" />
          </template>
          批量导入
        </AButton>

        <AButton class="icon-button" :disabled="disableLed" @click="setLedBatch" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:highlight-outlined" />
          </template>
          批量设置走字灯
        </AButton>

        <AButton type="primary" class="icon-button" :disabled="setBatchStatusDisable" @click="setStatusBatch" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:setting-outlined" />
          </template>
          批量设置状态
        </AButton>

        <AButton class="icon-button" :disabled="setBatchStatusDisable" @click="doSetRuleBatch" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:deployment-unit-outlined" />
          </template>
          批量设置运营规则
        </AButton>

        <AButton class="icon-button" :disabled="disableUpdate" @click="doSetNotActive" v-hasPermi="Permission.rev">
          <template #icon>
            <Icon icon="ant-design:stop-outlined" />
          </template>
          批量设置未激活
        </AButton>

        <AButton danger class="icon-button" :disabled="disableRemove" @click="deleteOfDetail" v-hasPermi="Permission.del">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
        </AButton>

        <AButton class="icon-button" @click="onClickExport" v-hasPermi="Permission.rev">
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

    <ATable row-key="id" :columns="deviceColumns" :data-source="TableData" :pagination="false" :row-selection="rowSelection" :scroll="{ x: 'max-content' }" bordered>
      <template #bodyCell="{ column: deviceColumn, record: deviceRecord }">
        <template v-if="deviceColumn.key === 'onlineTime'">
          {{ FormatDate(deviceRecord.onlineTime) }}
        </template>

        <template v-else-if="deviceColumn.key === 'correct'">
          <AButton type="link" class="table-action" @click="onCorrect(deviceRecord)">
            {{ ConvertCorrect(deviceRecord.correct) }}
          </AButton>
        </template>

        <template v-else-if="deviceColumn.key === 'screen'">
          <AButton type="link" class="table-action">数据大屏</AButton>
        </template>

        <template v-else-if="deviceColumn.key === 'activation'">
          {{ deviceRecord.activation == 0 ? '未激活' : '激活' }}
        </template>

        <template v-else-if="deviceColumn.key === 'status'">
          {{ ConverStatus(deviceRecord.status) }}
        </template>

        <template v-else-if="deviceColumn.key === 'action'">
          <ASpace wrap>
            <AButton type="link" class="table-action action-edit" @click="handleDetail(deviceRecord)" v-hasPermi="Permission.rev"> 修改 </AButton>
            <AButton type="link" danger class="table-action" @click="handleRemove(deviceRecord)" v-hasPermi="Permission.del"> 删除 </AButton>
            <AButton type="link" class="table-action" @click="setRule(deviceRecord)" v-hasPermi="Permission.rul"> 运营规则 </AButton>
            <AButton type="link" class="table-action" @click="setNoWork(deviceRecord)" v-hasPermi="Permission.reg"> 设置为未激活 </AButton>
            <AButton type="link" class="table-action" @click="toDetail(deviceRecord)">详情</AButton>
            <AButton type="link" class="table-action" @click="showMedium(deviceRecord)">广告媒体</AButton>
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

    <AModal v-model:open="dialogTableVisible" :title="dialogTitle" width="720px" :destroy-on-close="true">
      <AForm :model="AddDataForm" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="设备型号">
              <ASelect v-model:value="AddDataForm.deviceType" :options="deviceTypeOptions" placeholder="请选择设备型号" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="设备编号">
              <AInput v-model:value="AddDataForm.SerialNumber" placeholder="请输入串号" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="DTU固件编号">
              <AInput v-model:value="AddDataForm.userSerial" placeholder="请输入DTU固件编号(全智能安卓可不填写)" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="设备名称">
              <AInput v-model:value="AddDataForm.name" placeholder="请输入设备名称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="设备区域">
              <ASelect v-model:value="AddDataForm.deviceArea" :options="deviceAreaOptions" placeholder="请选择设备区域" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="运维人员">
              <ASelect v-model:value="AddDataForm.mStaff" :options="staffOptions" placeholder="请选择运维人员" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="运营人员">
              <ASelect v-model:value="AddDataForm.wStaff" :options="staffOptions" placeholder="请选择运营人员" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="设备状态">
              <ARadioGroup v-model:value="AddDataForm.status" :options="statusOptions" option-type="button" button-style="solid" class="status-radio-group" />
            </AFormItem>
          </ACol>

          <ACol :span="24">
            <AFormItem label="登录方式">
              <ASpace wrap>
                <ACheckbox v-model:checked="AddDataForm.face">人脸认证</ACheckbox>
                <ACheckbox v-model:checked="AddDataForm.phone">手机认证</ACheckbox>
                <ACheckbox v-model:checked="AddDataForm.qcode">二维码认证</ACheckbox>
                <ACheckbox v-model:checked="AddDataForm.card">刷卡认证</ACheckbox>
              </ASpace>
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="LOGO">
              <AUpload
                class="avatar-uploader"
                :action="UpImageURL"
                :show-upload-list="false"
                :before-upload="beforeAvatarUpload"
                :headers="headObject"
                :custom-request="uppyUploadRequest"
                @change="handleDeviceUploadChange"
              >
                <img v-if="AddDataForm.pic" :src="getImageURL(AddDataForm.pic)" class="avatar" />
                <div v-else class="upload-placeholder">
                  <Icon icon="ant-design:plus-outlined" :size="24" />
                </div>
              </AUpload>
            </AFormItem>
          </ACol>
        </ARow>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onCloseDialog">取消</AButton>
          <AButton type="primary" @click="onAddConfirm">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="MapdialogVisible" title="校准" width="70%" @cancel="onCloseMapDialog">
      <div id="container" class="map"></div>
      <div class="map-search">
        <AInput v-model:value="markerAddr" class="address-input" />
        <AButton @click="doAddressToCoordinate">
          <template #icon>
            <Icon icon="ant-design:search-outlined" />
          </template>
        </AButton>
      </div>
      <template #footer>
        <ASpace>
          <AButton @click="onCloseMapDialog">取消</AButton>
          <AButton type="primary" @click="DoCorrect">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="ruleDialogVisible" title="运营规则" width="720px" @cancel="onRuleDialogClose">
      <AForm :model="ruleData" layout="vertical">
        <AFormItem label="规则名称">
          <ASelect v-model:value="ruleData.ruleId" :options="ruleOptions" placeholder="请选择运营规则" @change="onRuleSelect" />
        </AFormItem>

        <div class="rule-scroll">
          <div v-for="item in warehouseRef" :key="item.id" class="warehouse-rule-item">
            <img :src="getImageURL(item.pic)" class="warehouse-rule-image" />
            <div class="warehouse-rule-info">
              <div>仓位编号：{{ item.code }}</div>
              <div>类型名称：{{ item.macGarbageType?.label }}</div>
              <div>投放价格：{{ item.points }}</div>
            </div>
          </div>
        </div>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onRuleDialogClose">取消</AButton>
          <AButton type="primary" @click="onRuleDialogConfirm">设置</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="mediumvisible" title="广告媒体" width="80%" :footer="null">
      <ATabs v-model:activeKey="mediumActiveName" type="card" @change="handleMediumTabChange">
        <ATabPane key="1" tab="待机">
          <ATable row-key="md_id" :columns="mediumColumns" :data-source="awaitTableData" :pagination="false" bordered>
            <template #bodyCell="slotProps">
              <MediaBodyCell v-bind="slotProps" />
            </template>
          </ATable>
        </ATabPane>

        <ATabPane key="2" tab="首页">
          <ATable row-key="md_id" :columns="mediumColumns" :data-source="HomePageTableData" :pagination="false" bordered>
            <template #bodyCell="slotProps">
              <MediaBodyCell v-bind="slotProps" />
            </template>
          </ATable>
        </ATabPane>

        <ATabPane key="3" tab="走字灯">
          <div class="led-list">
            <ARow v-for="item in ledContenData" :key="item.index" :gutter="12" class="led-row">
              <ACol :span="12">
                <AInput v-model:value="item.content" placeholder="请输入显示的内容" />
              </ACol>
              <ACol :span="8">
                <ASpace>
                  <AButton type="primary" @click="ledAddRecord">+</AButton>
                  <AButton v-if="item.id != 0" danger @click="delItem(item)">-</AButton>
                </ASpace>
              </ACol>
              <ACol :span="4">
                <AButton type="primary" @click="pushOne(item)">推送</AButton>
              </ACol>
            </ARow>
          </div>
        </ATabPane>
      </ATabs>
    </AModal>

    <AModal v-model:open="DetaildialogVisible" title="设备详细信息" width="1200px" wrap-class-name="device-detail-modal-wrap" :destroy-on-close="true" centered>
      <MacDetail :row="currentDetailData" @do-rule="doEvent" />
      <template #footer>
        <AButton type="primary" @click="DetaildialogVisible = false">关闭</AButton>
      </template>
    </AModal>

    <ADrawer v-model:open="showDrawer" title="批量导入" placement="right" width="420px" @close="DrawerhandleClose">
      <div class="drawer-content">
        <AUploadDragger
          v-model:file-list="batchUploadFileList"
          :action="GetUpLoadExcelURL()"
          :max-count="1"
          :headers="headObject"
          :custom-request="uppyUploadRequest"
          @remove="deleteFile"
          @change="handleAvatarSuccess"
        >
          <p class="upload-icon">
            <Icon icon="ant-design:inbox-outlined" :size="36" />
          </p>
          <p>拖放文件到这里，或者点击这里上传</p>
          <p class="upload-tip">仅限 .xls 和 .xlsx 文件</p>
        </AUploadDragger>
        <AButton type="primary" class="drawer-submit" @click="doAddBatch">确定</AButton>
      </div>
    </ADrawer>

    <ADrawer v-model:open="showLedDrawer" title="批量设置走字灯" placement="right" width="420px" @close="LedDrawerhandleClose">
      <AForm :model="BatcLedContent" layout="vertical">
        <AFormItem label="走字灯内容">
          <AInput v-model:value="BatcLedContent.content" />
        </AFormItem>
        <AFormItem>
          <AButton type="primary" @click="onBatchLed">一键推送</AButton>
        </AFormItem>
      </AForm>
    </ADrawer>

    <AModal v-model:open="BatchRulesdialogVisible" title="批量设置规则" width="420px">
      <AForm :model="BatcLedContent" layout="vertical">
        <AFormItem label="运营规则">
          <ASelect v-model:value="batchRuleSelect" :options="batchRuleOptions" placeholder="请选择运营规则" />
        </AFormItem>
      </AForm>
      <template #footer>
        <ASpace>
          <AButton @click="BatchRulesdialogVisible = false">取消</AButton>
          <AButton type="primary" @click="doSetBatchRules">确定</AButton>
        </ASpace>
      </template>
    </AModal>

    <ADrawer v-model:open="setBatchStatusVisiable" title="批量设置状态" placement="right" width="480px" @close="statusDrawerHandleClose">
      <AForm :model="BatchStatusData" layout="vertical">
        <AFormItem label="设备状态">
          <ARadioGroup v-model:value="BatchStatusData.status" :options="statusOptions" option-type="button" button-style="solid" class="status-radio-group" />
        </AFormItem>

        <AFormItem label="运维人员">
          <ASelect v-model:value="BatchStatusData.maintenanceStaff" :options="staffOptions" placeholder="请选择运维人员" />
        </AFormItem>

        <AFormItem label="运营人员">
          <ASelect v-model:value="BatchStatusData.operation" :options="staffOptions" placeholder="请选择运营人员" />
        </AFormItem>

        <AFormItem label="LOGO">
          <AUpload
            class="avatar-uploader"
            :action="UpImageURL"
            :show-upload-list="false"
            :before-upload="beforeAvatarUpload"
            :headers="headObject"
            :custom-request="uppyUploadRequest"
            @change="BatchHandleUploadChange"
          >
            <img v-if="BatchStatusData.pic" :src="getImageURL(BatchStatusData.pic)" class="avatar" />
            <div v-else class="upload-placeholder">
              <Icon icon="ant-design:plus-outlined" :size="24" />
            </div>
          </AUpload>
        </AFormItem>

        <AFormItem label="登录方式">
          <div class="checkbox-group">
            <ACheckbox :checked="BatchStatusData.face === '1'" @change="setBatchAuth('face', $event)">人脸认证</ACheckbox>
            <ACheckbox :checked="BatchStatusData.phone === '1'" @change="setBatchAuth('phone', $event)">手机认证</ACheckbox>
            <ACheckbox :checked="BatchStatusData.qcode === '1'" @change="setBatchAuth('qcode', $event)">二维码认证</ACheckbox>
            <ACheckbox :checked="BatchStatusData.card === '1'" @change="setBatchAuth('card', $event)">刷卡认证</ACheckbox>
          </div>
        </AFormItem>

        <AFormItem label="设备区域">
          <ASelect v-model:value="BatchStatusData.deviceArea" :options="deviceAreaOptions" placeholder="请选择设备区域" />
        </AFormItem>

        <AFormItem>
          <AButton type="primary" @click="doBatchSetStatus">确定</AButton>
        </AFormItem>
      </AForm>
    </ADrawer>
  </div>
</template>

<script setup lang="tsx">
import { deleteHardwarePackageApi } from '@/api/hardware'

import {
  addDeviceApi,
  addDeviceBatchApi,
  addDeviceLedContentApi,
  calibrationAddressOfDeviceApi,
  deleteDeviceApi,
  deleteDeviceLedContentApi,
  deleteMediumApi,
  getDeviceApi,
  getDeviceStatusApi,
  getDeviceTypeApi,
  getLedContentApi,
  getMediumApi,
  getRulesForDepartmentApi,
  getWorkableDeviceRuleApi,
  setBatchRulesApi,
  setDeviceNoWorkApi,
  setLedContentApi,
  setNotActiveBatchApi,
  setRuleApi,
  setStatusWithBatchApi,
  updateDeviceApi
} from '@/api/machine'

import { getDepartmentForSelectApi, getDeviceAreaApi, getUsableStaffApi } from '@/api/permission'

import { computed, defineComponent, inject, nextTick, onMounted, reactive, ref, shallowRef } from 'vue'
import {
  Button as AButton,
  Checkbox as ACheckbox,
  Col as ACol,
  Drawer as ADrawer,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  Pagination as APagination,
  RadioGroup as ARadioGroup,
  Row as ARow,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  TabPane as ATabPane,
  Tabs as ATabs,
  Tooltip as ATooltip,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, UploadChangeParam } from 'ant-design-vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import axios from 'axios'
import qs from 'qs'
import * as requestApi from '@/api/request'
import { uppyUploadRequest } from '@/utils/uppyUpload'
import { FormatDate, GetImageURL, GetVideoURL, GetUpLoadExcelURL } from '@/utils/tools'
import { Cvideo } from '@/views/video/components'
import { MacDetail } from './Components'
import { Icon } from '@/components/Icon'

const AUploadDragger = AUpload.Dragger

type TableKey = string | number

interface SearchDataStruct {
  deviceNumber: string
  deviceName: string
  deviceArea?: number
  deviceType?: number
  departmentId?: number
  deviceStatus?: number
  deviceOnLine?: number
  deviceAtivation?: number
  IMEI?: string
}

interface DeviceAreaStruct {
  id: number
  areaName: string
}

interface DeviceTypeStruct {
  id: number
  name: string
}

interface DepartmentStruct {
  id: number
  platform_name: string
}

interface DeviceStatusStruct {
  id: number
  label: string
}

interface StaffStruct {
  id: number
  name: string
}

interface RuleDataStruct {
  id: number
  label: string
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
  add: 'mac_dvp_add',
  rev: 'mac_dvp_rev',
  del: 'mac_dvp_del',
  rul: 'mac_dvp_rul',
  reg: 'mac_dvp_reg',
  sec: 'mac_dvp_sec'
})

let currentDeviceId = 0
const hp_page = ref(1)
const hp_size = ref(5)
const awaitTableData = ref<any[]>([])
const HomePageTableData = ref<any[]>([])
const ledContenData = ref<any[]>([])
const mediumvisible = ref(false)
const mediumActiveName = ref('2')

const ConvertMediumType = (type: number): string => {
  switch (type) {
    case 1:
      return '图片'
    case 2:
      return '视频'
    default:
      return '未知'
  }
}

const deleteMedium = (row: any) => {
  deleteMediumApi({ id: row.md_id }).then((res: any) => {
    message.success(res.message || '操作成功')
    GetMediumOfHomePage()
    GetMediumOfAwait()
  })
}

const MediaBodyCell = defineComponent({
  props: {
    column: {
      type: Object,
      required: true
    },
    record: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    return () => {
      const column = props.column as any
      const record = props.record as any

      if (column.key === 'media') {
        if (record.file_type == 1) {
          return <img src={GetImageURL(record.file_name)} class="media-image" />
        }
        if (record.file_type == 2) {
          return (
            <Cvideo
              videoUrl={GetVideoURL(record.file_name)}
              width={200}
              height={200}
              autoplay={false}
              controls={true}
              loop={false}
              muted={false}
              preload="auto"
              showPlay={true}
              playWidth={96}
              zoom="cotain"
            />
          )
        }
        return <span class="empty-text">暂无</span>
      }

      if (column.key === 'file_type') {
        return ConvertMediumType(record.file_type)
      }

      if (column.key === 'create_time') {
        return FormatDate(record.create_time)
      }

      if (column.key === 'action') {
        return (
          <AButton type="link" danger class="table-action" onClick={() => deleteMedium(record)}>
            删除
          </AButton>
        )
      }

      return record[column.dataIndex]
    }
  }
})

const mediumColumns: TableColumnsType<any> = [
  { title: '媒体链接', key: 'media', width: 240 },
  { title: '类型', dataIndex: 'file_type', key: 'file_type', width: 120 },
  { title: '发布时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '操作员', dataIndex: 'username', key: 'username', width: 120 },
  { title: '操作', key: 'action', width: 100 }
]

const handleMediumTabChange = (pageSign: string | number) => {
  switch (pageSign) {
    case '1':
      GetMediumOfAwait()
      break
    case '2':
      GetMediumOfHomePage()
      break
    case '3':
      GetLedContent()
      break
  }
}

const GetMediumOfHomePage = () => {
  getMediumApi({
    deviceId: currentDeviceId,
    location: 1,
    page: hp_page.value,
    size: hp_size.value
  }).then((res: any) => {
    HomePageTableData.value = res.data?.records || []
  })
}

const GetMediumOfAwait = () => {
  getMediumApi({
    deviceId: currentDeviceId,
    location: 2,
    page: hp_page.value,
    size: hp_size.value
  }).then((res: any) => {
    awaitTableData.value = res.data?.records || []
  })
}

const delItem = (row: any) => {
  deleteDeviceLedContentApi({ id: row.id }).then(() => {
    message.success('操作成功')
    GetLedContent()
  })
}

const GetLedContent = () => {
  getLedContentApi({ deviceId: currentDeviceId }).then((res: any) => {
    const temp = res.data

    if (!temp || temp.length === 0) {
      ledContenData.value = []
      ledAddRecord()
      return
    }

    ledContenData.value = temp.map((element, index) => ({
      id: element.id,
      content: element.content,
      index
    }))
  })
}

const ledAddRecord = () => {
  ledContenData.value.push({
    content: '',
    id: 0,
    index: ledContenData.value.length
  })
}

const showMedium = (row: any) => {
  currentDeviceId = row.id
  mediumActiveName.value = '2'
  GetMediumOfHomePage()
  mediumvisible.value = true
}

const pushOne = (row: any) => {
  const content = row.content?.trim()
  if (!content) {
    message.warning('发送内容不能为空')
    return
  }

  addDeviceLedContentApi({
    deviceId: currentDeviceId,
    content,
    id: row.id
  }).then(() => {
    message.success('推送成功')
  })
}

const getAddr = 'https://restapi.amap.com/v3/geocode/regeo'
const Activation = [
  { value: 0, label: '未激活' },
  { value: 1, label: '激活' }
]

const OnLineOption = [
  { value: 0, label: '离线' },
  { value: 1, label: '在线' }
]

const statusList = [
  { label: '待使用', id: '1' },
  { label: '使用中', id: '2' },
  { label: '已禁用', id: '3' },
  { label: '故障', id: '4' },
  { label: '已欠费', id: '5' }
]

const statusOptions = computed(() => statusList.map((item) => ({ label: item.label, value: item.id })))

let idOfCorrent = 0
const map = shallowRef<any>(null)
const currentPage = ref(1)
const pageSize = ref(5)
const disabled = ref(false)
const total = ref(0)
let marker: any
const markerAddr = ref('')
let _AMap: any

const onCorrect = (val: any) => {
  idOfCorrent = val.id
  markerAddr.value = ''
  MapdialogVisible.value = true
  nextTick(() => initMap(val.lat, val.lng))
}

const ConvertCorrect = (val: number) => {
  return val === 0 ? '未校准' : '已校准'
}

const ConverStatus = (val: number | string) => {
  switch (Number(val)) {
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

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getDeviceData()
}

const initMap = (lat: number, lng: number) => {
  if (lat == null || lng == null) {
    lat = 30.572269
    lng = 104.066541
  }

  AMapLoader.load({
    key: '1fbe431a5c04fd4df2364411a8c8415b',
    version: '2.0',
    plugins: ['AMap.ToolBar', 'AMap.Driving']
  })
    .then((AMap: any) => {
      _AMap = AMap
      map.value = new AMap.Map('container', {
        viewMode: '3D',
        zoom: 10,
        zooms: [2, 22],
        center: [lng, lat]
      })

      marker = new AMap.Marker({
        position: new AMap.LngLat(lng, lat),
        title: '自定义',
        draggable: true
      })
      map.value.add(marker)
      marker.on('dragend', () => {
        getMapAddress()
      })
      getMapAddress()
    })
    .catch((e) => {
      console.log(e)
    })
}

const getMapAddress = () => {
  const url = getAddr + '?key=2ad12f130081a5e44748c8bd3da23d07&location=' + marker.getPosition().lng + ',' + marker.getPosition().lat
  axios.get(url).then((res) => {
    markerAddr.value = res.data.regeocode.formatted_address
  })
}

const doAddressToCoordinate = () => {
  addressToCoordinate(markerAddr.value)
}

const addressToCoordinate = (addr: string) => {
  const url = 'https://restapi.amap.com/v3/geocode/geo' + '?key=2ad12f130081a5e44748c8bd3da23d07&address=' + addr

  axios.get(url).then((res: any) => {
    if (map.value != null) {
      const temp = res.data.geocodes[0].location.split(',')
      const lng = temp[0]
      const lat = temp[1]
      map.value.setCenter([lng, lat])
      const position = new _AMap.LngLat(lng, lat)
      if (marker == undefined) {
        marker = new _AMap.Marker({
          position,
          draggable: true,
          title: '自定义'
        })
        marker.on('dragend', () => {
          getMapAddress()
        })
        map.value.add(marker)
      } else {
        marker.setPosition(position)
      }
      marker.setPosition([lng, lat])
    }
  })
}

const deviceAreaArray = ref<DeviceAreaStruct[]>([])
const deviceTypeArray = ref<DeviceTypeStruct[]>([])
const departmentArray = ref<DepartmentStruct[]>([])
const deviceStatusArray = ref<DeviceStatusStruct[]>([])
const staffArray = ref<StaffStruct[]>([])
const showSearchForm = ref(true)

const SearchFormData = reactive<SearchDataStruct>({
  deviceNumber: '',
  deviceName: '',
  deviceArea: undefined,
  deviceType: undefined,
  departmentId: undefined,
  deviceStatus: undefined,
  deviceOnLine: undefined,
  deviceAtivation: undefined,
  IMEI: undefined
})

const deviceAreaOptions = computed(() => deviceAreaArray.value.map((item) => ({ label: item.areaName, value: item.id })))
const deviceTypeOptions = computed(() => deviceTypeArray.value.map((item) => ({ label: item.name, value: item.id })))
const departmentOptions = computed(() => departmentArray.value.map((item) => ({ label: item.platform_name, value: item.id })))
const deviceStatusOptions = computed(() => deviceStatusArray.value.map((item) => ({ label: item.label, value: item.id })))
const staffOptions = computed(() => staffArray.value.map((item) => ({ label: item.name, value: item.id })))

const getDeviceData = () => {
  const parm = {
    id: SearchFormData.deviceNumber,
    deviceName: SearchFormData.deviceName,
    deviceArea: SearchFormData.deviceArea,
    deviceType: SearchFormData.deviceType,
    departmentId: SearchFormData.departmentId,
    status: SearchFormData.deviceStatus,
    onLine: SearchFormData.deviceOnLine,
    activation: SearchFormData.deviceAtivation,
    page: currentPage.value,
    size: pageSize.value,
    imei: SearchFormData.IMEI
  }

  getDeviceApi(parm).then((res: any) => {
    TableData.value = res.data?.records || []
    total.value = res.data?.total || 0
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

const onSearch = () => {
  currentPage.value = 1
  getDeviceData()
}

const onReset = () => {
  SearchFormData.deviceNumber = ''
  SearchFormData.deviceName = ''
  SearchFormData.deviceArea = undefined
  SearchFormData.deviceType = undefined
  SearchFormData.departmentId = undefined
  SearchFormData.deviceStatus = undefined
  SearchFormData.deviceOnLine = undefined
  SearchFormData.deviceAtivation = undefined
  SearchFormData.IMEI = undefined
  currentPage.value = 1
  getDeviceData()
}

const getStaff = () => {
  getUsableStaffApi().then((res: any) => {
    staffArray.value = res.data || []
  })
}

const getDevcieType = () => {
  getDeviceTypeApi().then((res: any) => {
    deviceTypeArray.value = res.data || []
  })
}

const getDeviceStatus = () => {
  getDeviceStatusApi().then((res: any) => {
    deviceStatusArray.value = res.data || []
  })
}

const getDepartment = () => {
  getDepartmentForSelectApi().then((res: any) => {
    departmentArray.value = res.data || []
  })
}

const getDeviceArea = () => {
  getDeviceAreaApi().then((res: any) => {
    deviceAreaArray.value = res.data || []
  })
}

const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const disableRemove = computed(() => selectedRowKeys.value.length === 0)
const disableLed = computed(() => selectedRowKeys.value.length === 0)
const setBatchStatusDisable = computed(() => selectedRowKeys.value.length === 0)
const disableUpdate = computed(() => selectedRowKeys.value.length === 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: DeviceRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const OnClickAdd = () => {
  isUpdate.value = false
  dialogTitle.value = '添加设备'
  initAddDeviceData()
  dialogTableVisible.value = true
}

const initAddDeviceData = () => {
  AddDataForm.deviceType = undefined
  AddDataForm.SerialNumber = ''
  AddDataForm.name = ''
  AddDataForm.pic = ''
  AddDataForm.face = false
  AddDataForm.phone = false
  AddDataForm.qcode = false
  AddDataForm.card = false
  AddDataForm.deviceArea = undefined
  AddDataForm.mStaff = undefined
  AddDataForm.wStaff = undefined
  AddDataForm.status = '1'
  AddDataForm.sNumber = ''
  AddDataForm.userSerial = ''
  AddDataForm.id = 0
}

const deleteOfDetail = () => {
  deleteDevice([...DeleteIdArray], '确定要删除这些设备吗？')
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const TableData = ref<DeviceRecord[]>([])

const deviceColumns: TableColumnsType<DeviceRecord> = [
  { title: '运营商', dataIndex: ['department', 'platformName'], key: 'departmentName', width: 120 },
  { title: '设备编号', dataIndex: 'serialNumber', key: 'serialNumber', width: 160 },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '设备区域', dataIndex: ['area', 'areaName'], key: 'areaName', width: 120 },
  { title: '设备地址', dataIndex: 'address', key: 'address', width: 180 },
  { title: '是否在线', dataIndex: 'isOnline', key: 'isOnline', width: 120 },
  { title: 'IMEI', dataIndex: 'imei', key: 'imei', width: 160 },
  { title: '在线时间', dataIndex: 'onlineTime', key: 'onlineTime', width: 180 },
  { title: '是否校准', dataIndex: 'correct', key: 'correct', width: 120 },
  { title: '型号名称', dataIndex: ['deviceType', 'name'], key: 'deviceTypeName', width: 160 },
  { title: '数据大屏', key: 'screen', width: 120 },
  { title: '是否激活', dataIndex: 'activation', key: 'activation', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '修改时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
  { title: 'DTU固件编号', dataIndex: 'userSerial', key: 'userSerial', width: 180 },
  { title: '固件版本', dataIndex: 'version', key: 'version', width: 140 },
  { title: '操作', key: 'action', width: 360, fixed: 'right' }
]

const handleDetail = (val: any) => {
  initAddDeviceData()
  isUpdate.value = true
  AddDataForm.deviceType = val.deviceType?.id
  AddDataForm.SerialNumber = val.serialNumber
  AddDataForm.name = val.name
  AddDataForm.pic = val.pic
  AddDataForm.face = val.face == 1
  AddDataForm.card = val.card == 1
  AddDataForm.phone = val.phone == 1
  AddDataForm.qcode = val.qrcode == 1
  AddDataForm.status = val.status + ''
  AddDataForm.deviceArea = val.area?.id
  AddDataForm.mStaff = val.maintenanceStaff
  AddDataForm.wStaff = val.operators
  AddDataForm.id = val.id
  AddDataForm.userSerial = val.userSerial
  dialogTitle.value = '修改设备'
  dialogTableVisible.value = true
}

const handleRemove = (val: any) => {
  deleteDevice([val.id], '确定要删除这台设备吗？')
}

const deleteDevice = (ids: number[], content: string) => {
  if (ids.length === 0) {
    message.warning('请选择要删除的设备')
    return
  }

  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteDeviceApi(qs.stringify({ ids }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getDeviceData()
    }
  })
}

const isUpdate = ref(false)
const dialogTitle = ref('')
const dialogTableVisible = ref(false)

const AddDataForm = reactive({
  deviceType: undefined as number | undefined,
  SerialNumber: '',
  name: '',
  pic: '',
  face: false,
  phone: false,
  qcode: false,
  card: false,
  deviceArea: undefined as number | undefined,
  mStaff: undefined as number | undefined,
  wStaff: undefined as number | undefined,
  status: '1',
  sNumber: '',
  id: 0,
  userSerial: ''
})

const onCloseDialog = () => {
  dialogTableVisible.value = false
}

const UpImageURL = computed(() => requestApi.getUploadImageUrl())

const getImageURL = (imageURL?: string) => {
  return imageURL ? requestApi.getDownloadPicUrl(imageURL) : ''
}

const handleDeviceUploadChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return
  const response = info.file.response
  if (response?.code == 200) {
    AddDataForm.pic = response.data
  } else {
    message.error('上传图片出错了')
  }
}

const beforeAvatarUpload = () => true

const onAddConfirm = () => {
  if (isUpdate.value) {
    updateDevice()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加这台设备吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      AddDataForm.sNumber = AddDataForm.SerialNumber
      const res: any = await addDeviceApi(AddDataForm)
      message.success(res.message || '操作成功')
      getDeviceData()
      onCloseDialog()
    }
  })
}

const updateDevice = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这台设备吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      AddDataForm.sNumber = AddDataForm.SerialNumber
      await updateDeviceApi(AddDataForm)
      message.success('操作成功')
      getDeviceData()
      onCloseDialog()
    }
  })
}

const MapdialogVisible = ref(false)
const ruleData = ref<Record<string, any>>({})
const ruleDialogVisible = ref(false)
const RuleArray = ref<RuleDataStruct[]>([])
const warehouseRef = ref<any[]>([])

const onCloseMapDialog = () => {
  MapdialogVisible.value = false
  idOfCorrent = 0
  markerAddr.value = ''
}

const DoCorrect = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要校准这台设备吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await calibrationAddressOfDeviceApi({
        id: idOfCorrent,
        lat: marker.getPosition().lat,
        lng: marker.getPosition().lng,
        addr: markerAddr.value
      })
      message.success('操作成功')
      getDeviceData()
      onCloseMapDialog()
    }
  })
}

const ruleOptions = computed(() => RuleArray.value.map((item) => ({ label: item.label, value: item.id })))

const setRule = (val: any) => {
  ruleData.value.DeviceId = val.id
  getWorkableDeviceRuleApi({ deviceTypeId: val.deviceType.id }).then((res: any) => {
    RuleArray.value = res.data || []
    if (RuleArray.value.length > 0) {
      ruleData.value.ruleId = val.ruleId || (RuleArray.value[0] as any).id
      onRuleSelect(ruleData.value.ruleId)
    }
    ruleDialogVisible.value = true
  })
}

const onRuleSelect = (val: any) => {
  const matchedRule = RuleArray.value.find((item) => item.id == val)
  warehouseRef.value = (matchedRule as any)?.warehouse || []
}

const onRuleDialogClose = () => {
  ruleDialogVisible.value = false
}

const onRuleDialogConfirm = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这台设备的运营规则吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await setRuleApi({
        deviceId: ruleData.value.DeviceId,
        ruleId: ruleData.value.ruleId
      })
      message.success('操作成功')
      getDeviceData()
      onRuleDialogClose()
    }
  })
}

const setNoWork = (val: any) => {
  AModal.confirm({
    title: '提示',
    content: '确定要把这台设备设置为未激活吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await setDeviceNoWorkApi({ deviceId: val.id })
      message.success('操作成功')
      getDeviceData()
    }
  })
}

const toDetail = (row: any) => {
  currentDetailData.value = row
  DetaildialogVisible.value = true
}

const DetaildialogVisible = ref(false)
const currentDetailData = ref<any>({})

const doEvent = () => {
  setRule(currentDetailData.value)
}

const addBatch = () => {
  showDrawer.value = true
}

const DrawerhandleClose = () => {
  showDrawer.value = false
}

const showDrawer = ref(false)
const batchUploadFileList = ref<any[]>([])
let fileName: string | undefined = ''

const doAddBatch = () => {
  addDeviceBatchApi(fileName).then(() => {
    getDeviceData()
    showDrawer.value = false
    batchUploadFileList.value = []
    message.success('导入成功')
  })
}

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const deleteFile = (file: any) => {
  deleteHardwarePackageApi(file.name)
  return true
}

const handleAvatarSuccess = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const res = info.file.response
  if (res?.data == undefined) {
    message.warning(res?.message || '上传失败')
    batchUploadFileList.value = []
    fileName = undefined
  } else {
    fileName = res.data
  }
}

const showLedDrawer = ref(false)
const setLedBatch = () => {
  BatcLedContent.value.content = ''
  showLedDrawer.value = true
}

const LedDrawerhandleClose = () => {
  showLedDrawer.value = false
}

const BatchStatusData = ref<Record<string, any>>({})
const setBatchStatusVisiable = ref(false)
const setStatusBatch = () => {
  setBatchStatusVisiable.value = true
  BatchStatusData.value = {}
}

const statusDrawerHandleClose = () => {
  setBatchStatusVisiable.value = false
}

const doBatchSetStatus = () => {
  setStatusWithBatchApi({
    ids: DeleteIdArray,
    param: BatchStatusData.value
  }).then(() => {
    message.success('操作成功')
    getDeviceData()
    setBatchStatusVisiable.value = false
  })
}

const BatchHandleUploadChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const response = info.file.response
  if (response?.code == 200) {
    BatchStatusData.value.pic = response.data
  } else {
    message.error('上传图片出错了')
  }
}

const setBatchAuth = (field: string, event: any) => {
  BatchStatusData.value[field] = event.target.checked ? '1' : '0'
}

const BatcLedContent = ref<Record<string, any>>({})
const onBatchLed = () => {
  setLedContentApi({
    ids: DeleteIdArray,
    content: BatcLedContent.value.content
  }).then(() => {
    message.success('操作成功')
    showLedDrawer.value = false
  })
}

const onClickExport = () => {
  const parm = {
    id: SearchFormData.deviceNumber,
    deviceName: SearchFormData.deviceName,
    deviceArea: SearchFormData.deviceArea,
    deviceType: SearchFormData.deviceType,
    departmentId: SearchFormData.departmentId,
    status: SearchFormData.deviceStatus,
    page: currentPage.value,
    size: pageSize.value
  }

  axios({
    method: 'post',
    url: requestApi.getApiUrl('/MachineMange/exportExcelForMacDevice'),
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token')
    },
    data: parm
  }).then((response) => {
    const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const body = document.querySelector('body')

    link.href = window.URL.createObjectURL(blob)
    link.download = '导出设备列表.xls'
    link.style.display = 'none'
    body?.appendChild(link)
    link.click()
    body?.removeChild(link)
    window.URL.revokeObjectURL(link.href)
  })
}

const BatchRulesdialogVisible = ref(false)
const doSetRuleBatch = () => {
  BatchRulesdialogVisible.value = true
}
const batchRuleSelect = ref()
const rules = ref<any[]>([])
const batchRuleOptions = computed(() => rules.value.map((item) => ({ label: item.label, value: item.id })))

const getRules = () => {
  getRulesForDepartmentApi().then((res: any) => {
    rules.value = res.data || []
  })
}

const doSetBatchRules = () => {
  setBatchRulesApi({
    ids: DeleteIdArray,
    rules: batchRuleSelect.value
  }).then(() => {
    message.success('操作成功')
    BatchRulesdialogVisible.value = false
    getDeviceData()
  })
}

const doSetNotActive = () => {
  setNotActiveBatchApi(qs.stringify({ ids: DeleteIdArray }, { arrayFormat: 'brackets' })).then(() => {
    message.success('操作成功')
    getDeviceData()
  })
}

onMounted(() => {
  getDeviceData()
  getDevcieType()
  getDeviceStatus()
  getDepartment()
  getDeviceArea()
  getStaff()
  getRules()
})
</script>

<style lang="less" scoped>
.device-distribution-page {
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

.search-form-item {
  min-width: 0;
}

.search-form-actions {
  min-width: 0;

  :deep(.ant-form-item-control-input-content) {
    display: flex;
    align-items: center;
  }
}

.toolbar {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: flex-start;
}

.toolbar-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.toolbar-right {
  display: inline-flex;
  flex: none;
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

.map {
  width: 100%;
  height: 400px;
}

.map-search {
  display: flex;
  margin-top: 12px;
  gap: 8px;
}

.address-input {
  flex: 1;
}

.rule-scroll {
  width: 100%;
  max-height: 400px;
  overflow: auto;
}

.warehouse-rule-item {
  display: flex;
  min-height: 150px;
  padding: 12px;
  margin-bottom: 12px;
  color: #1677ff;
  background: #e6f4ff;
  border-radius: 6px;
  align-items: center;
  gap: 16px;
}

.warehouse-rule-image {
  width: 240px;
  height: 120px;
  object-fit: contain;
  background-color: #fff;
  border-radius: 4px;
}

.warehouse-rule-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.media-image {
  display: block;
  width: 160px;
  height: 120px;
  object-fit: contain;
  border-radius: 6px;
}

.led-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.led-row {
  align-items: center;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-submit {
  align-self: flex-start;
}

.upload-icon {
  margin-bottom: 8px;
  color: #8c8c8c;
}

.upload-tip,
.empty-text {
  color: #8c8c8c;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
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

.avatar-uploader {
  :deep(.ant-upload) {
    width: 104px;
    height: 104px;
  }
}

.avatar {
  display: block;
  width: 104px;
  height: 104px;
  object-fit: contain;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.upload-placeholder {
  display: inline-flex;
  width: 104px;
  height: 104px;
  color: #8c8c8c;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s cubic-bezier(0, 0, 1, 1);

  &:hover {
    border-color: #1677ff;
  }
}

:global(.device-detail-modal-wrap .ant-modal) {
  max-width: calc(100vw - 48px);
}
</style>
