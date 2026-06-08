<template>
  <div class="medium-page">
    <AForm v-if="showSearchForm" :model="Queryparam" layout="horizontal" class="search-form">
      <AFormItem label="媒体名称" class="search-form-item">
        <AInput v-model:value="Queryparam.name" class="w-full" placeholder="请输入媒体名称" />
      </AFormItem>

      <AFormItem label="类型" class="search-form-item">
        <ASelect v-model:value="Queryparam.screenType" :options="screenTypeOptions" allow-clear class="w-full" placeholder="请选择屏幕类型" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="onClickSearch" v-hasPermi="Permission.sec">
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
        <AButton type="primary" class="icon-button" @click="onClickAdd" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          增加
        </AButton>

        <AButton danger class="icon-button" :disabled="EnableDelete" @click="onClickDelete" v-hasPermi="Permission.del">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
        </AButton>

        <AButton class="icon-button" :disabled="EnableDelete">
          <template #icon>
            <Icon icon="ant-design:export-outlined" />
          </template>
          导出
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

    <ATable row-key="id" :columns="mediumColumns" :data-source="tableData" :pagination="false" :row-selection="mediumRowSelection" :scroll="{ x: 'max-content' }" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'media'">
          <div v-if="record.file_type == 1" class="media-image-frame">
            <img v-if="record.file_name && !hasMediaImageFailed(record)" :src="GetImageURL(record.file_name)" class="media-image" @error="markMediaImageFailed(record)" />
            <span v-else class="media-image-empty">{{ record.file_name ? '图片加载失败' : '暂无图片' }}</span>
          </div>
          <Cvideo
            v-else-if="record.file_type == 2"
            :video-url="GetVideoURL(record.file_name)"
            :width="200"
            :height="200"
            :autoplay="false"
            :controls="true"
            :loop="false"
            :muted="false"
            preload="auto"
            :show-play="true"
            :play-width="48"
            zoom="contain"
          />
          <span v-else class="empty-text">暂无</span>
        </template>

        <template v-else-if="column.key === 'file_type'">
          {{ record.file_type == 1 ? '图片' : '视频' }}
        </template>

        <template v-else-if="column.key === 'screen_type'">
          {{ convertScreenType(record.screen_type) }}
        </template>

        <template v-else-if="column.key === 'create_time'">
          {{ FormatDate(record.create_time) }}
        </template>

        <template v-else-if="column.key === 'update_time'">
          {{ FormatDate(record.update_time) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action action-edit" @click="onRevise(record)" v-hasPermi="Permission.rev">修改</AButton>
            <AButton type="link" danger class="table-action" @click="onPublish(record)" v-hasPermi="Permission.puh">发布</AButton>
            <AButton type="link" danger class="table-action" @click="onCancel(record)" v-hasPermi="Permission.cbk">撤回</AButton>
            <AButton type="link" class="table-action action-edit" @click="onRemove(record)" v-hasPermi="Permission.del">删除</AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="Queryparam.page"
        v-model:page-size="Queryparam.size"
        :page-size-options="['5', '10', '15', '20']"
        :show-size-changer="true"
        :total="total"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        show-quick-jumper
        @change="handlePageChange"
        @show-size-change="handlePageChange"
      />
    </div>

    <AModal v-model:open="addDialogVisible" :title="ruleForm.id == 0 ? '添加媒体' : '修改媒体'" width="720px" :destroy-on-close="true">
      <AForm :model="ruleForm" layout="horizontal" class="modal-form">
        <AFormItem label="媒体名称" required>
          <AInput v-model:value="ruleForm.name" class="w-full" placeholder="请输入媒体名称" />
        </AFormItem>

        <AFormItem label="媒体链接" required>
          <AUpload
            class="media-uploader"
            :action="UpImageURL"
            :show-upload-list="false"
            :before-upload="beforeAvatarUpload"
            :headers="headObject"
            :custom-request="uppyUploadRequest"
            @change="handleAvatarSuccess"
          >
            <div v-if="showImage" class="avatar-frame">
              <img v-if="!uploadImageFailed" :src="GetImageURL(ruleForm.fileName)" class="avatar" @error="uploadImageFailed = true" />
              <span v-else class="avatar-empty">图片加载失败</span>
            </div>
            <Cvideo
              v-else-if="showVideo"
              :video-url="GetVideoURL(ruleForm.fileName)"
              :width="104"
              :height="104"
              :autoplay="true"
              :controls="true"
              :loop="false"
              :muted="false"
              preload="auto"
              :show-play="true"
              :play-width="48"
              zoom="contain"
            />
            <div v-else class="upload-placeholder">
              <Icon icon="ant-design:plus-outlined" :size="24" />
            </div>
          </AUpload>
        </AFormItem>

        <AFormItem label="媒体类型" required>
          <ARadioGroup v-model:value="ruleForm.fileType" :options="mediaTypeOptions" option-type="button" button-style="solid" />
        </AFormItem>

        <AFormItem label="适用屏幕" required>
          <ARadioGroup v-model:value="ruleForm.screenType" :options="screenTypeOptions" option-type="button" button-style="solid" />
        </AFormItem>

        <AFormItem label="屏幕尺寸">
          <ASelect v-model:value="ruleForm.screenSize" :options="screenSizeOptions" class="w-full" placeholder="请选择屏幕尺寸" />
        </AFormItem>

        <AFormItem label="描述">
          <ATextarea v-model:value="ruleForm.remarks" :rows="3" class="w-full" placeholder="请输入描述" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="addDialogVisible = false">取消</AButton>
          <AButton type="primary" @click="submitForm">确定</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="publishDialogVisible" title="媒体发布" width="80%">
      <AForm :model="QueryDeviceParam" layout="horizontal" class="dialog-search-form">
        <AFormItem label="设备编号" class="search-form-item">
          <AInput v-model:value="QueryDeviceParam.serialNumber" class="w-full" placeholder="请输入设备编号" />
        </AFormItem>

        <AFormItem label="设备名称" class="search-form-item">
          <AInput v-model:value="QueryDeviceParam.name" class="w-full" placeholder="请输入设备名称" />
        </AFormItem>

        <AFormItem label="屏幕模式" class="search-form-item">
          <ASelect v-model:value="QueryDeviceParam.screenModel" :options="screenModelOptions" allow-clear class="w-full" placeholder="请选择屏幕模式" />
        </AFormItem>

        <AFormItem label="屏幕尺寸" class="search-form-item">
          <ASelect v-model:value="QueryDeviceParam.screenSize" :options="screenSizeOptions" allow-clear class="w-full" placeholder="请选择屏幕尺寸" />
        </AFormItem>

        <AFormItem class="search-form-actions">
          <ASpace>
            <AButton type="primary" class="icon-button" @click="onClickPublish">
              <template #icon>
                <Icon icon="ant-design:search-outlined" />
              </template>
              搜索
            </AButton>
            <AButton class="icon-button" @click="onPublishReset">
              <template #icon>
                <Icon icon="ant-design:reload-outlined" />
              </template>
              重置
            </AButton>
          </ASpace>
        </AFormItem>
      </AForm>

      <ATable row-key="id" :columns="publishColumns" :data-source="deviceData" :pagination="false" :row-selection="publishRowSelection" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'screen_model'">
            {{ ConvertScreenModel(record.screen_model) }}
          </template>

          <template v-else-if="column.key === 'status'">
            {{ ConvertDeviceStatus(record.status) }}
          </template>
        </template>
      </ATable>

      <div class="pagination-wrap">
        <APagination
          v-model:current="QueryDeviceParam.page"
          v-model:page-size="QueryDeviceParam.size"
          :page-size-options="['5', '10', '15', '20']"
          :show-size-changer="true"
          :total="QueryDeviceParam.total"
          :show-total="(totalCount) => `共 ${totalCount} 条`"
          show-quick-jumper
          @change="handlePublishPageChange"
          @show-size-change="handlePublishPageChange"
        />
      </div>

      <template #footer>
        <div class="modal-footer-row">
          <ASelect v-model:value="pushLocation" :options="pushLocationOptions" class="push-location-select" placeholder="请选择投放位置" />
          <ASpace>
            <AButton @click="publishDialogVisible = false">关闭</AButton>
            <AButton type="primary" @click="DoPublish">发布</AButton>
          </ASpace>
        </div>
      </template>
    </AModal>

    <AModal v-model:open="clearDialogVisible" title="撤回媒体" width="80%">
      <AForm :model="QueryClearDevice" layout="horizontal" class="dialog-search-form">
        <AFormItem label="设备编号" class="search-form-item">
          <AInput v-model:value="QueryClearDevice.serialNumber" class="w-full" placeholder="请输入设备编号" />
        </AFormItem>

        <AFormItem label="设备名称" class="search-form-item">
          <AInput v-model:value="QueryClearDevice.name" class="w-full" placeholder="请输入设备名称" />
        </AFormItem>

        <AFormItem label="投放位置" class="search-form-item">
          <ASelect v-model:value="QueryClearDevice.location" :options="pushLocationOptions" allow-clear class="w-full" placeholder="请选择投放位置" />
        </AFormItem>

        <AFormItem class="search-form-actions">
          <ASpace>
            <AButton type="primary" class="icon-button" @click="onClearClick">
              <template #icon>
                <Icon icon="ant-design:search-outlined" />
              </template>
              搜索
            </AButton>
            <AButton class="icon-button" @click="onClearReset">
              <template #icon>
                <Icon icon="ant-design:reload-outlined" />
              </template>
              重置
            </AButton>
          </ASpace>
        </AFormItem>
      </AForm>

      <ATable row-key="id" :columns="clearColumns" :data-source="ClearData" :pagination="false" :row-selection="clearRowSelection" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'create_time'">
            {{ FormatDate(record.create_time) }}
          </template>

          <template v-else-if="column.key === 'location'">
            {{ record.location == 1 ? '首页' : '待机' }}
          </template>

          <template v-else-if="column.key === 'status'">
            {{ ConvertDeviceStatus(record.status) }}
          </template>
        </template>
      </ATable>

      <div class="pagination-wrap">
        <APagination
          v-model:current="QueryClearDevice.page"
          v-model:page-size="QueryClearDevice.size"
          :page-size-options="['5', '10', '15', '20']"
          :show-size-changer="true"
          :total="QueryClearDevice.total"
          :show-total="(totalCount) => `共 ${totalCount} 条`"
          show-quick-jumper
          @change="handleClearPageChange"
          @show-size-change="handleClearPageChange"
        />
      </div>

      <template #footer>
        <ASpace>
          <AButton @click="clearDialogVisible = false">取消</AButton>
          <AButton type="primary" @click="DoClear">撤回</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { addMediumApi, clearMediumApi, deleteMediumBatchApi, getClearDeviceApi, getMediumListApi, publishMediumApi, reviseMediumApi } from '@/api/video'

import { getDeviceForMediumApi, getScreenClassApi } from '@/api/machine'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
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
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, UploadChangeParam } from 'ant-design-vue'
import qs from 'qs'
import { FormatDate, GetImageURL, GetVideoURL } from '@/utils/tools'
import * as requestApi from '@/api/request'
import { uppyUploadRequest } from '@/utils/uppyUpload'
import { Icon } from '@/components/Icon'
import { Cvideo } from './components'

const ATextarea = AInput.TextArea

type TableKey = string | number

interface QueryStruct {
  name: string
  screenType?: number
  page: number
  size: number
}

interface PublishStruct {
  id?: number
  serialNumber: string
  name: string
  deviceType?: number
  screenModel?: number
  screenSize?: number
  status?: number
  page: number
  size: number
  total: number
}

interface MediumRecord {
  [key: string]: any
  id: number
}

interface DeviceRecord {
  [key: string]: any
  id: number
}

interface ClearQueryStruct {
  mediumId: number
  serialNumber: string
  name: string
  location?: number
  page: number
  size: number
  total: number
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
  add: 'med_vid_add',
  rev: 'med_vid_rev',
  del: 'med_vid_del',
  puh: 'med_vid_puh',
  cbk: 'med_vid_cbk',
  sec: 'med_vid_sec'
})

const screenTypeArray = [
  { id: 1, label: '横屏' },
  { id: 2, label: '竖屏' }
]

const screenModelOptions = [
  { value: 0, label: '无屏' },
  { value: 1, label: '横屏' },
  { value: 2, label: '竖屏' }
]

const mediaTypeOptions = [
  { value: 1, label: '图片' },
  { value: 2, label: '视频' }
]

const pushLocationOptions = [
  { value: 1, label: '首页' },
  { value: 2, label: '待机' }
]

const Queryparam = ref<QueryStruct>({
  name: '',
  screenType: undefined,
  page: 1,
  size: 10
})
const total = ref(0)
const tableData = ref<MediumRecord[]>([])
const showSearchForm = ref(true)
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const QueryDeviceParam = ref<PublishStruct>({
  id: 0,
  serialNumber: '',
  deviceType: undefined,
  screenModel: undefined,
  screenSize: undefined,
  status: undefined,
  name: '',
  page: 1,
  size: 10,
  total: 0
})
const publishDialogVisible = ref(false)
const deviceData = ref<DeviceRecord[]>([])
const publishSelectedRowKeys = ref<TableKey[]>([])
let deviceSelectArray: number[] = []
const pushLocation = ref<number>()

const clearDialogVisible = ref(false)
const QueryClearDevice = ref<ClearQueryStruct>({
  mediumId: 0,
  serialNumber: '',
  name: '',
  location: undefined,
  page: 1,
  size: 10,
  total: 0
})
const ClearData = ref<DeviceRecord[]>([])
const clearSelectedRowKeys = ref<TableKey[]>([])
let clearIds: number[] = []

const addDialogVisible = ref(false)
const ruleForm = reactive({
  id: 0,
  name: '',
  fileName: '',
  fileType: 1,
  screenType: 1,
  screenSize: 1,
  remarks: ''
})

const screenSizeArray = ref<any[]>([])
const screenTypeOptions = computed(() => screenTypeArray.map((item) => ({ label: item.label, value: item.id })))
const screenSizeOptions = computed(() => screenSizeArray.value.map((item) => ({ label: item.label, value: item.id })))
const EnableDelete = computed(() => selectedRowKeys.value.length === 0)
const UpImageURL = computed(() => requestApi.getUploadImageUrl())
const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const mediumColumns: TableColumnsType<MediumRecord> = [
  { title: '媒体名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '媒体链接', key: 'media', width: 240 },
  { title: '类型', dataIndex: 'file_type', key: 'file_type', width: 100 },
  { title: '适用屏幕', dataIndex: 'screen_type', key: 'screen_type', width: 120 },
  { title: '视频屏幕尺寸', dataIndex: 'screenSize', key: 'screenSize', width: 160 },
  { title: '描述', dataIndex: 'remarks', key: 'remarks', width: 160 },
  { title: '创建者', dataIndex: 'aName', key: 'aName', width: 120 },
  { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '修改者', dataIndex: 'a2Name', key: 'a2Name', width: 120 },
  { title: '修改时间', dataIndex: 'update_time', key: 'update_time', width: 180 },
  { title: '操作', key: 'action', width: 240, fixed: 'right' }
]

const publishColumns: TableColumnsType<DeviceRecord> = [
  { title: '设备编号', dataIndex: 'serial_number', key: 'serial_number', width: 150 },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '型号名称', dataIndex: 'typeName', key: 'typeName', width: 150 },
  { title: '屏幕类型', dataIndex: 'screen_model', key: 'screen_model', width: 120 },
  { title: '屏幕尺寸', dataIndex: 'label', key: 'label', width: 120 },
  { title: '设备SN', dataIndex: 'imei', key: 'imei', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 }
]

const clearColumns: TableColumnsType<DeviceRecord> = [
  { title: '设备编号', dataIndex: 'serial_number', key: 'serial_number', width: 150 },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 160 },
  { title: '型号名称', dataIndex: 'typeName', key: 'typeName', width: 150 },
  { title: '设备SN', dataIndex: 'imei', key: 'imei', width: 160 },
  { title: '发布时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '投放位置', dataIndex: 'location', key: 'location', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 }
]

const mediumRowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: MediumRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const publishRowSelection = computed(() => ({
  selectedRowKeys: publishSelectedRowKeys.value,
  onChange: (keys: TableKey[], rows: DeviceRecord[]) => {
    publishSelectedRowKeys.value = keys
    deviceSelectArray = rows.map((row) => row.id)
  }
}))

const clearRowSelection = computed(() => ({
  selectedRowKeys: clearSelectedRowKeys.value,
  onChange: (keys: TableKey[], rows: DeviceRecord[]) => {
    clearSelectedRowKeys.value = keys
    clearIds = rows.map((row) => row.id)
  }
}))

const convertScreenType = (type: number): string => {
  if (type == 1) return '横屏'
  if (type == 2) return '竖屏'
  return '未知'
}

const onClickSearch = () => {
  Queryparam.value.page = 1
  getTableData()
}

const onReset = () => {
  Queryparam.value.name = ''
  Queryparam.value.screenType = undefined
  Queryparam.value.page = 1
  getTableData()
}

const handlePageChange = (page: number, size: number) => {
  Queryparam.value.page = page
  Queryparam.value.size = size
  getTableData()
}

const failedMediaImages = ref<Set<string | number>>(new Set())
const uploadImageFailed = ref(false)

const getMediaImageKey = (record: Record<string, any>) => {
  return record.id ?? record.file_name ?? ''
}

const hasMediaImageFailed = (record: Record<string, any>) => {
  return failedMediaImages.value.has(getMediaImageKey(record))
}

const markMediaImageFailed = (record: Record<string, any>) => {
  failedMediaImages.value = new Set([...failedMediaImages.value, getMediaImageKey(record)])
}

const getTableData = () => {
  getMediumListApi(Queryparam.value).then((res: any) => {
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
    selectedRowKeys.value = []
    DeleteIdArray = []
    failedMediaImages.value = new Set()
  })
}

const resetRuleForm = () => {
  ruleForm.fileName = ''
  ruleForm.name = ''
  ruleForm.fileType = 1
  ruleForm.screenSize = 1
  ruleForm.screenType = 1
  ruleForm.remarks = ''
  ruleForm.id = 0
  uploadImageFailed.value = false
}

const onClickAdd = () => {
  resetRuleForm()
  addDialogVisible.value = true
}

const deleteMediumBatch = (ids: number[], content: string) => {
  if (ids.length === 0) {
    message.warning('请选择要删除的媒体')
    return
  }

  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteMediumBatchApi(qs.stringify({ ids }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getTableData()
    }
  })
}

const onClickDelete = () => {
  deleteMediumBatch([...DeleteIdArray], '确定要删除这些媒体记录吗？')
}

const onRemove = (row: Record<string, any>) => {
  deleteMediumBatch([row.id], '确定要删除这个记录吗？')
}

const onRevise = (row: Record<string, any>) => {
  ruleForm.fileName = row.file_name
  ruleForm.fileType = row.file_type
  ruleForm.id = row.id
  ruleForm.name = row.name
  ruleForm.remarks = row.remarks
  ruleForm.screenType = row.screen_type
  ruleForm.screenSize = row.screen_size
  uploadImageFailed.value = false
  addDialogVisible.value = true
}

const onPublish = (row: Record<string, any>) => {
  QueryDeviceParam.value = {
    id: row.id,
    serialNumber: '',
    deviceType: undefined,
    screenModel: undefined,
    screenSize: undefined,
    status: undefined,
    name: '',
    page: 1,
    size: 10,
    total: 0
  }
  publishSelectedRowKeys.value = []
  deviceSelectArray = []
  pushLocation.value = undefined
  publishDialogVisible.value = true
  getPublishDevice()
}

const onCancel = (row: Record<string, any>) => {
  QueryClearDevice.value = {
    mediumId: row.id,
    serialNumber: '',
    name: '',
    location: undefined,
    page: 1,
    size: 10,
    total: 0
  }
  clearSelectedRowKeys.value = []
  clearIds = []
  clearDialogVisible.value = true
  getClearData()
}

const beforeAvatarUpload = () => true

const handleAvatarSuccess = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const response = info.file.response
  if (response?.code == 200) {
    ruleForm.fileName = response.data
    uploadImageFailed.value = false
  } else {
    message.error(response?.message || '上传文件出错了')
  }
}

const submitForm = () => {
  if (!ruleForm.name?.trim()) {
    message.warning('请输入媒体名称')
    return
  }
  if (!ruleForm.fileName) {
    message.warning('请上传媒体文件')
    return
  }

  const content = ruleForm.id == 0 ? '确定要添加这个媒体库吗？' : '确定要修改这个媒体库吗？'

  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      if (ruleForm.id == 0) {
        await addMedium()
      } else {
        await updateMedium()
      }
    }
  })
}

const updateMedium = async () => {
  await reviseMediumApi(ruleForm)
  message.success('操作成功')
  getTableData()
  addDialogVisible.value = false
}

const addMedium = async () => {
  await addMediumApi(ruleForm)
  message.success('操作成功')
  getTableData()
  addDialogVisible.value = false
}

const isVideoFile = (fileName: string) => {
  const cleanName = fileName.split('?')[0].toLowerCase()
  return ['mp4', 'm3u8', 'webm', 'ogg', 'ogv'].some((suffix) => cleanName.endsWith('.' + suffix))
}

const isImageFile = (fileName: string) => {
  const cleanName = fileName.split('?')[0].toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].some((suffix) => cleanName.endsWith('.' + suffix))
}

const showImage = computed(() => !!ruleForm.fileName && isImageFile(ruleForm.fileName))
const showVideo = computed(() => !!ruleForm.fileName && isVideoFile(ruleForm.fileName))

const handlePublishPageChange = (page: number, size: number) => {
  QueryDeviceParam.value.page = page
  QueryDeviceParam.value.size = size
  getPublishDevice()
}

const onClickPublish = () => {
  QueryDeviceParam.value.page = 1
  getPublishDevice()
}

const onPublishReset = () => {
  QueryDeviceParam.value.serialNumber = ''
  QueryDeviceParam.value.name = ''
  QueryDeviceParam.value.deviceType = undefined
  QueryDeviceParam.value.screenModel = undefined
  QueryDeviceParam.value.screenSize = undefined
  QueryDeviceParam.value.status = undefined
  QueryDeviceParam.value.page = 1
  getPublishDevice()
}

const getPublishDevice = () => {
  getDeviceForMediumApi(QueryDeviceParam.value).then((res: any) => {
    deviceData.value = res.data?.records || []
    QueryDeviceParam.value.total = res.data?.total || 0
    publishSelectedRowKeys.value = []
    deviceSelectArray = []
  })
}

const ConvertScreenModel = (model: number) => {
  switch (model) {
    case 1:
      return '横屏'
    case 2:
      return '竖屏'
    case 0:
      return '无屏'
    default:
      return '未知'
  }
}

const ConvertDeviceStatus = (status: number): string => {
  switch (status) {
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
    case 6:
      return '未激活'
    default:
      return '未知'
  }
}

const DoPublish = () => {
  if (!(pushLocation.value == 1 || pushLocation.value == 2)) {
    message.warning('请选择投放位置')
    return
  }
  if (deviceSelectArray.length === 0) {
    message.warning('请选择要发布的设备')
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要发布媒体到这些设备吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await publishMediumApi({
        location: pushLocation.value,
        mediumId: QueryDeviceParam.value.id,
        ids: deviceSelectArray
      })
      message.success('操作成功')
    }
  })
}

const handleClearPageChange = (page: number, size: number) => {
  QueryClearDevice.value.page = page
  QueryClearDevice.value.size = size
  getClearData()
}

const onClearClick = () => {
  QueryClearDevice.value.page = 1
  getClearData()
}

const onClearReset = () => {
  QueryClearDevice.value.location = undefined
  QueryClearDevice.value.name = ''
  QueryClearDevice.value.page = 1
  QueryClearDevice.value.size = 10
  QueryClearDevice.value.serialNumber = ''
  getClearData()
}

const DoClear = () => {
  if (clearIds.length === 0) {
    message.warning('请选择要撤回的设备')
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要撤销这些设备吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await clearMediumApi(qs.stringify({ ids: clearIds }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getClearData()
    }
  })
}

const getClearData = () => {
  getClearDeviceApi(QueryClearDevice.value).then((res: any) => {
    ClearData.value = res.data?.records || []
    QueryClearDevice.value.total = res.data?.total || 0
    clearSelectedRowKeys.value = []
    clearIds = []
  })
}

const getScreenSize = () => {
  getScreenClassApi().then((res: any) => {
    screenSizeArray.value = res.data || []
  })
}

onMounted(() => {
  getScreenSize()
  getTableData()
})
</script>

<style lang="less" scoped>
.medium-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.search-form,
.dialog-search-form {
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

  :deep(.ant-form-item-control-input),
  :deep(.ant-form-item-control-input-content) {
    width: 100%;
  }
}

.dialog-search-form {
  padding: 0 0 16px;
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

.action-edit {
  color: #52c41a;
}

.pagination-wrap {
  display: flex;
  margin-top: 12px;
  justify-content: flex-end;
}

.modal-form {
  :deep(.ant-form-item-label) {
    width: 96px;
    text-align: right;
  }
}

.media-image-frame,
.media-image-empty {
  display: flex;
  width: 200px;
  height: 200px;
  color: #8c8c8c;
  background-color: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
}

.media-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.media-uploader {
  display: inline-block;

  :deep(.ant-upload) {
    display: inline-flex;
    width: 104px;
    height: 104px;
    overflow: hidden;
    align-items: center;
    justify-content: center;
  }
}

.avatar-frame,
.avatar-empty {
  display: flex;
  width: 104px;
  height: 104px;
  color: #8c8c8c;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
}

.avatar {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.upload-placeholder {
  display: flex;
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

.modal-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.push-location-select {
  width: 220px;
}

.empty-text {
  color: #8c8c8c;
}

.w-full {
  width: 100%;
}
</style>
