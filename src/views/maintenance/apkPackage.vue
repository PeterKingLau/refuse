<template>
  <div class="apk-package-page">
    <AForm v-if="showSearchForm" :model="searchFormData" layout="horizontal" class="search-form">
      <AFormItem label="设备类型" class="search-form-item">
        <ASelect v-model:value="searchFormData.deviceTypeId" :options="deviceTypeOptions" allow-clear placeholder="请选择设备类型" />
      </AFormItem>

      <AFormItem label="软件类型" class="search-form-item">
        <ASelect v-model:value="searchFormData.parts" :options="packageSearchOptions" allow-clear placeholder="请选择软件类型" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="GetApkPackageData" v-hasPermi="Permission.sec">
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
        <AButton type="primary" class="icon-button" v-hasPermi="Permission.add" @click="onClickAdd">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新增
        </AButton>

        <AButton danger class="icon-button" v-hasPermi="Permission.del" :disabled="disableRemove" @click="DeleteBatch">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
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

    <ATable row-key="id" :columns="columns" :data-source="HardwareLibrary" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'parts'">
          {{ convertPackageType(record.parts) }}
        </template>

        <template v-else-if="column.key === 'create_time'">
          {{ FormatDate(record.create_time) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <AButton type="link" class="table-action" @click="doWork(record)">推送</AButton>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
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

    <AModal v-model:open="AddDialogVisible" title="添加一个软件包" width="720px" :destroy-on-close="true">
      <AForm :model="AddPackageData" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="设备类型">
              <ASelect v-model:value="AddPackageData.deviceTypeId" :options="deviceTypeOptions" placeholder="请选择设备类型" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="软件包类型">
              <ASelect v-model:value="AddPackageData.parts" :options="packageAddOptions" placeholder="请选择软件包类型" />
            </AFormItem>
          </ACol>

          <ACol :span="8">
            <AFormItem label="主版本号">
              <AInput v-model:value="AddPackageData.a" />
            </AFormItem>
          </ACol>

          <ACol :span="8">
            <AFormItem label="次版本号">
              <AInput v-model:value="AddPackageData.b" />
            </AFormItem>
          </ACol>

          <ACol :span="8">
            <AFormItem label="修改号">
              <AInput v-model:value="AddPackageData.c" />
            </AFormItem>
          </ACol>

          <ACol :span="24">
            <AFormItem label="上传文件">
              <AUploadDragger
                v-model:file-list="uploadFileList"
                :action="UpHarwarePackage"
                :headers="headObject"
                :custom-request="uppyUploadRequest"
                :max-count="1"
                @change="handleAvatarSuccess"
                @remove="deleteFile"
              >
                <p class="upload-icon">
                  <Icon icon="ant-design:inbox-outlined" :size="36" />
                </p>
                <p>文件拖入，或者点击选择文件</p>
                <p class="upload-tip">仅限 APK、Bin、hex 文件</p>
              </AUploadDragger>
            </AFormItem>
          </ACol>

          <ACol :span="24">
            <AFormItem label="备注">
              <ATextarea v-model:value="AddPackageData.note" :rows="3" />
            </AFormItem>
          </ACol>
        </ARow>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="AddDialogVisible = false">取消</AButton>
          <AButton type="primary" @click="AddPackage">确定</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="PushdialogVisible" title="推送升级包" width="520px" @cancel="handleClose">
      <AForm :model="PushData" layout="vertical">
        <AFormItem label="下载时间">
          <ADatePicker v-model:value="PushData.currentData" show-time value-format="YYYY-MM-DD HH:mm:ss" class="w-full" placeholder="请选择推送时间" />
        </AFormItem>

        <AFormItem label="推送类别">
          <ARadioGroup v-model:value="PushData.type" :options="pushTypeOptions" option-type="button" button-style="solid" @change="typeChange" />
        </AFormItem>

        <AFormItem label="推送设备">
          <AInput v-model:value="PushData.serialNumber" placeholder="请输入要推送的设备串号" :disabled="signDisabled" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="PushdialogVisible = false">取消</AButton>
          <AButton type="primary" @click="doPush">确定</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { addHardwareLibApi, deleteHardwareLibApi, deleteHardwarePackageApi, getHardwareLibApi, setPushRecordsApi } from '@/api/hardware'

import { getDeviceTypeApi } from '@/api/machine'

import { getDepartmentForSelectApi } from '@/api/permission'

import { computed, inject, onMounted, ref } from 'vue'
import {
  Button as AButton,
  Col as ACol,
  DatePicker as ADatePicker,
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
  Tooltip as ATooltip,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, UploadChangeParam } from 'ant-design-vue'
import qs from 'qs'
import { FormatDate } from '@/utils/tools'
import * as requestApi from '@/api/request'
import { uppyUploadRequest } from '@/utils/uppyUpload'
import { Icon } from '@/components/Icon'

const AUploadDragger = AUpload.Dragger
const ATextarea = AInput.TextArea

type TableKey = string | number

interface SearchFormStruct {
  deviceTypeId?: number
  parts?: number
  page?: number
  size?: number
}

interface AddPackageStruct {
  a?: string
  b?: string
  c?: string
  deviceTypeId?: number
  fileName?: string
  parts?: number
  note?: string
}

interface PushStruct {
  currentData?: string
  serialNumber?: string
  type?: number
  id?: number
}

interface HardwareRecord {
  [key: string]: any
  id: number
}

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const disabled = ref(false)

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  GetApkPackageData()
}

onMounted(() => {
  GetDeviceType()
  GetProduct()
  GetApkPackageData()
})

const GetProduct = () => {
  getDepartmentForSelectApi().then((res: any) => {
    ProductArray.value = res.data || []
  })
}

const GetDeviceType = () => {
  getDeviceTypeApi().then((res: any) => {
    deviceTypeArray.value = res.data || []
  })
}

const packageSearchOptions = [
  { value: 1, label: '安卓升级包' },
  { value: 2, label: '固件升级包' }
]

const packageAddOptions = [
  { value: 1, label: '安卓软件包' },
  { value: 2, label: '硬件固件包' },
  { value: 3, label: 'DTU软件包' },
  { value: 4, label: 'DTU固件包' }
]

const pushTypeOptions = [
  { value: 1, label: '单一设备' },
  { value: 2, label: '全部适合的设备' }
]

const initSearchData = () => {
  searchFormData.value.deviceTypeId = undefined
  searchFormData.value.parts = undefined
}

const convertPackageType = (type: number): string => {
  switch (type) {
    case 1:
      return '安卓升级包'
    case 2:
      return '固件升级包'
    case 3:
      return 'DTU升级包'
    case 4:
      return 'DTU固件包'
    default:
      return '未知类型'
  }
}

const Permission = ref({
  add: 'mac_apk_add',
  rev: 'mac_apk_rev',
  del: 'mac_apk_del',
  emp: 'mac_apk_emp',
  sec: 'mac_apk_sec'
})

const ProductArray = ref<any[]>([])
const deviceTypeArray = ref<any[]>([])
const searchFormData = ref<SearchFormStruct>({})
const showSearchForm = ref(true)
const HardwareLibrary = ref<HardwareRecord[]>([])

const deviceTypeOptions = computed(() => deviceTypeArray.value.map((item) => ({ label: item.name, value: item.id })))

const columns: TableColumnsType<HardwareRecord> = [
  { title: '记录编号', dataIndex: 'id', key: 'id', width: 100 },
  { title: '软件包类型', dataIndex: 'parts', key: 'parts', width: 130 },
  { title: '主版本号', dataIndex: 'A', key: 'A', width: 100 },
  { title: '次版本号', dataIndex: 'B', key: 'B', width: 100 },
  { title: '修改号', dataIndex: 'C', key: 'C', width: 100 },
  { title: '文件名', dataIndex: 'file_name', key: 'file_name', width: 300 },
  { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 220 },
  { title: '操作', key: 'action', width: 120 }
]

const onReset = () => {
  initSearchData()
  currentPage.value = 1
  GetApkPackageData()
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  GetApkPackageData()
}

const GetApkPackageData = () => {
  searchFormData.value.page = currentPage.value
  searchFormData.value.size = pageSize.value
  getHardwareLibApi(searchFormData.value).then((res: any) => {
    HardwareLibrary.value = res.data?.records || []
    total.value = res.data?.total || 0
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

const uploadFileList = ref<any[]>([])
const AddPackageData = ref<AddPackageStruct>({})
const AddDialogVisible = ref(false)

const onClickAdd = () => {
  InitAddPackageData()
  AddDialogVisible.value = true
}

const UpHarwarePackage = computed(() => requestApi.getUploadHardwareUrl())

const InitAddPackageData = () => {
  AddPackageData.value = {
    a: undefined,
    b: undefined,
    c: undefined,
    deviceTypeId: undefined,
    fileName: undefined,
    parts: undefined,
    note: undefined
  }
  uploadFileList.value = []
}

const handleAvatarSuccess = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const res = info.file.response
  if (res?.data == undefined) {
    message.warning(res?.message || '上传失败')
    uploadFileList.value = []
    AddPackageData.value.fileName = undefined
  } else {
    AddPackageData.value.fileName = res.data
  }
}

const deleteFile = (file: any) => {
  deleteHardwarePackageApi(file.name)
  return true
}

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const AddPackage = () => {
  if (AddPackageData.value.fileName == undefined) {
    message.warning('请选择上传文件或等待文件上传完成')
    return
  }

  addHardwareLibApi(AddPackageData.value).then(() => {
    message.success('操作成功')
    uploadFileList.value = []
    GetApkPackageData()
    AddDialogVisible.value = false
  })
}

const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []
const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: HardwareRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const DeleteBatch = () => {
  if (DeleteIdArray.length === 0) {
    message.warning('请选择要删除的软件包')
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要删除这些软件包信息吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteHardwareLibApi(qs.stringify({ ids: DeleteIdArray }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      GetApkPackageData()
    }
  })
}

const PushData = ref<PushStruct>({})
let currentRowId: number | undefined
const PushdialogVisible = ref(false)
const signDisabled = ref(false)

const initPushData = () => {
  PushData.value = {
    currentData: undefined,
    serialNumber: undefined,
    type: 2,
    id: undefined
  }
  signDisabled.value = true
}

const doWork = (row: Record<string, any>) => {
  currentRowId = row.id
  initPushData()
  PushdialogVisible.value = true
}

const handleClose = () => {
  PushdialogVisible.value = false
}

const doPush = () => {
  PushData.value.id = currentRowId
  setPushRecordsApi(PushData.value).then(() => {
    message.success('设置完成')
    PushdialogVisible.value = false
  })
}

const typeChange = () => {
  if (PushData.value.type == 2) {
    PushData.value.serialNumber = undefined
    signDisabled.value = true
  } else {
    signDisabled.value = false
  }
}
</script>

<style lang="less" scoped>
.apk-package-page {
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.upload-icon {
  margin-bottom: 8px;
  color: #8c8c8c;
}

.upload-tip {
  color: #8c8c8c;
}

.w-full {
  width: 100%;
}
</style>
