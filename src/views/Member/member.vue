<template>
  <div class="member-page">
    <AForm v-if="showSearchForm" :model="SearchFormData" layout="horizontal" class="search-form">
      <AFormItem label="运营商" class="search-form-item">
        <AInput v-model:value="SearchFormData.departmentName" placeholder="请输入运营商名称" />
      </AFormItem>

      <AFormItem label="手机号码" class="search-form-item">
        <AInput v-model:value="SearchFormData.phone" placeholder="请输入用户手机" />
      </AFormItem>

      <AFormItem label="卡号" class="search-form-item">
        <AInput v-model:value="SearchFormData.cardNo" placeholder="请输入卡号" />
      </AFormItem>

      <AFormItem label="昵称" class="search-form-item">
        <AInput v-model:value="SearchFormData.nickName" placeholder="请输入用户昵称" />
      </AFormItem>

      <AFormItem label="创建时间" class="search-form-item search-form-range">
        <ARangePicker v-model:value="SearchFormData.sTime" show-time value-format="YYYY-MM-DD HH:mm:ss" class="w-full" start-placeholder="开始日期" end-placeholder="截至日期" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="getMemberData" v-hasPermi="Permission.sec">
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

    <ATable row-key="id" :columns="columns" :data-source="TableData" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'pic'">
          <img v-if="record.pic" :src="getImageURL(record.pic)" class="table-avatar" />
          <span v-else class="empty-text">暂无</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace wrap>
            <AButton type="link" class="table-action action-add" @click="addPoints(record)" v-hasPermi="Permission.pad">
              <template #icon>
                <Icon icon="ant-design:plus-circle-outlined" />
              </template>
              添加积分
            </AButton>
            <AButton type="link" danger class="table-action" @click="reducePoints(record)" v-hasPermi="Permission.pas">
              <template #icon>
                <Icon icon="ant-design:minus-circle-outlined" />
              </template>
              扣除积分
            </AButton>
            <AButton type="link" danger class="table-action" @click="handleDetail(record)" v-hasPermi="Permission.bak">
              <template #icon>
                <Icon icon="ant-design:user-delete-outlined" />
              </template>
              拉黑
            </AButton>
            <AButton type="link" class="table-action" @click="handleRemove(record)" v-hasPermi="Permission.cad">
              <template #icon>
                <Icon icon="ant-design:credit-card-outlined" />
              </template>
              绑定
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

    <AModal v-model:open="AdddialogFormVisible" title="添加会员" width="560px" :destroy-on-close="true" @cancel="onCloseAddDialog">
      <AForm :model="addFormData" layout="vertical">
        <AFormItem label="用户昵称">
          <AInput v-model:value="addFormData.nickName" placeholder="请输入用户昵称" />
        </AFormItem>

        <AFormItem label="手机号码">
          <AInput v-model:value="addFormData.phone" placeholder="请输入用户手机号码" />
        </AFormItem>

        <AFormItem label="状态">
          <ARadioGroup v-model:value="addFormData.status" :options="memberStatusOptions" option-type="button" button-style="solid" class="status-radio-group" />
        </AFormItem>

        <AFormItem label="LOGO">
          <AUpload
            class="avatar-uploader"
            :action="UpImageURL"
            :show-upload-list="false"
            :before-upload="beforeAvatarUpload"
            :headers="headObject"
            :custom-request="uppyUploadRequest"
            @change="handleUploadChange"
          >
            <img v-if="addFormData.pic" :src="getImageURL(addFormData.pic)" class="avatar" />
            <div v-else class="upload-placeholder">
              <Icon icon="ant-design:plus-outlined" :size="24" />
            </div>
          </AUpload>
        </AFormItem>

        <AFormItem label="备注">
          <ATextarea v-model:value="addFormData.remark" placeholder="请输入备注信息" :rows="3" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onCloseAddDialog">取消</AButton>
          <AButton type="primary" @click="onConfirm">确定</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="dialogPointVisible" :title="OperationPointsTitle" width="480px" @cancel="onClosePointsDialog">
      <AForm :model="operationPoints" layout="vertical">
        <AFormItem label="积分点数">
          <AInputNumber v-model:value="operationPoints.points" :min="0" class="w-full" placeholder="请输入积分数" />
        </AFormItem>

        <AFormItem label="备注">
          <AInput v-model:value="operationPoints.remarks" placeholder="备注" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onClosePointsDialog">取消</AButton>
          <AButton type="primary" @click="doOperationPoint">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="bindCardDialogVisible" title="绑定卡号" width="720px" :destroy-on-close="true" @cancel="cancelBind">
      <AForm :model="cardSearchForm" layout="inline" class="card-search-form">
        <AFormItem label="卡号">
          <AInput v-model:value="getCardNo" placeholder="请输入卡号" />
        </AFormItem>

        <AFormItem>
          <AButton type="primary" class="icon-button" @click="getCardData">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
            搜索
          </AButton>
        </AFormItem>

        <AFormItem>
          <AButton class="icon-button" @click="restCard">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
            重置
          </AButton>
        </AFormItem>
      </AForm>

      <ATable row-key="id" :columns="cardColumns" :data-source="cardTableData" :pagination="false" :row-selection="cardRowSelection" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            {{ ConvertType(record.type) }}
          </template>
          <template v-else-if="column.key === 'status'">
            {{ ConvertStatus(record.status) }}
          </template>
        </template>
      </ATable>

      <div class="pagination-wrap card-pagination">
        <APagination
          v-model:current="cardCurrent"
          v-model:page-size="cardPageSize"
          :page-size-options="['5', '10', '15', '20']"
          :show-size-changer="true"
          :disabled="disabled"
          :total="CardTotal"
          :show-total="(totalCount) => `共 ${totalCount} 条`"
          show-quick-jumper
          @change="handleCardPageChange"
          @show-size-change="handleCardPageChange"
        />
      </div>

      <template #footer>
        <ASpace>
          <AButton @click="cancelBind">取消</AButton>
          <AButton type="primary" @click="bindCard">确定</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { addMemberApi, bindCardApi, getCardApi, getMemberApi, moveMemberToBlackListApi, operationPointsApi } from '@/api/member'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  DatePicker as ADatePicker,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  RadioGroup as ARadioGroup,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, UploadChangeParam } from 'ant-design-vue'
import * as requestApi from '@/api/request'
import { uppyUploadRequest } from '@/utils/uppyUpload'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker
const ATextarea = AInput.TextArea

type TableKey = string | number
type DateRange = [string, string] | undefined

interface BindCardStruct {
  memberId: number
  cardId: number
}

interface SearchStruct {
  departmentName: string
  phone: string
  cardNo: string
  nickName: string
  sTime: DateRange
}

interface AddFormDataStruct {
  nickName: string
  phone: string
  email: string
  pwd: string
  pic: string
  remark: string
  status: string
}

interface OperationPointStruct {
  MemberId: number
  type: number
  points: number
  remarks: string
}

interface CardStruct {
  id: number
  cardNo: string
  type: number
  status: number
}

interface MemberRecord {
  [key: string]: any
  id: number
  pic?: string
  nickName?: string
  phone?: string
  points?: number
  cardNo?: string
  createTime?: string
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getMemberData()
}

const Permission = ref({
  add: 'mem_mem_add',
  pad: 'mem_mem_pad',
  pas: 'mem_mem_pas',
  bak: 'mem_mem_bak',
  cad: 'mem_mem_cad',
  sec: 'mem_mem_sec'
})

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const disabled = ref(false)
const TableData = ref<MemberRecord[]>([])
const showSearchForm = ref(true)
const AdddialogFormVisible = ref(false)
const isUpdate = ref(false)
const dialogPointVisible = ref(false)
const OperationPointsTitle = ref('')
const bindCardDialogVisible = ref(false)
const cardTableData = ref<CardStruct[]>([])
const cardCurrent = ref(1)
const cardPageSize = ref(10)
const CardTotal = ref(0)
const getCardNo = ref('')
const selectedCardRowKeys = ref<TableKey[]>([])

const SearchFormData = reactive<SearchStruct>({
  departmentName: '',
  phone: '',
  cardNo: '',
  nickName: '',
  sTime: undefined
})

const addFormData = reactive<AddFormDataStruct>({
  nickName: '',
  phone: '',
  email: '',
  pwd: '',
  pic: '',
  remark: '',
  status: '1'
})

const operationPoints = reactive<OperationPointStruct>({
  MemberId: 0,
  type: 0,
  points: 0,
  remarks: ''
})

const bindCardData = reactive<BindCardStruct>({
  memberId: 0,
  cardId: 0
})

const cardSearchForm = reactive({
  cardNo: ''
})

const memberStatusOptions = [
  { label: '正常', value: '1' },
  { label: '停用', value: '2' }
]

const columns: TableColumnsType<MemberRecord> = [
  { title: '用户头像', dataIndex: 'pic', key: 'pic', width: 120 },
  { title: '运营商', dataIndex: ['department', 'platformName'], key: 'departmentName', width: 220 },
  { title: '用户昵称', dataIndex: 'nickName', key: 'nickName', width: 160 },
  { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 160 },
  { title: '积分', dataIndex: 'points', key: 'points', width: 100 },
  { title: '绑定卡号', dataIndex: 'cardNo', key: 'cardNo', width: 160 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 200 },
  { title: '操作', key: 'action', width: 300 }
]

const cardColumns: TableColumnsType<CardStruct> = [
  { title: '卡号', dataIndex: 'cardNo', key: 'cardNo', width: 180 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 160 }
]

const cardRowSelection = computed(() => ({
  selectedRowKeys: selectedCardRowKeys.value,
  onChange: (keys: TableKey[], rows: CardStruct[]) => {
    const lastKey = keys.slice(-1)
    const lastRow = rows.slice(-1)[0]
    selectedCardRowKeys.value = lastKey
    bindCardData.cardId = lastRow?.id || 0
  }
}))

const ConvertType = (val: number) => {
  return val == 2 ? '清运' : '会员'
}

const ConvertStatus = (val: number) => {
  return val === 1 ? '已使用' : '未使用'
}

const bindCard = () => {
  if (!bindCardData.cardId) {
    message.warning('请选择要绑定的会员卡')
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要为这个会员绑定会员卡吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await bindCardApi(bindCardData)
      message.success('操作成功')
      getMemberData()
      bindCardDialogVisible.value = false
    }
  })
}

const cancelBind = () => {
  bindCardDialogVisible.value = false
  cardTableData.value = []
  getCardNo.value = ''
  selectedCardRowKeys.value = []
  bindCardData.cardId = 0
}

const restCard = () => {
  getCardNo.value = ''
  cardCurrent.value = 1
  getCardData()
}

const getCardData = () => {
  getCardApi({
    cardNo: getCardNo.value,
    type: 1,
    status: '0',
    page: cardCurrent.value,
    size: cardPageSize.value
  }).then((res: any) => {
    CardTotal.value = res.data?.total || 0
    cardTableData.value = res.data?.records || []
    selectedCardRowKeys.value = []
    bindCardData.cardId = 0
  })
}

const handleCardPageChange = (page: number, size: number) => {
  cardCurrent.value = page
  cardPageSize.value = size
  getCardData()
}

const onClosePointsDialog = () => {
  dialogPointVisible.value = false
}

const doOperationPoint = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要进行这项积分操作吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await operationPointsApi(operationPoints)
      message.success('操作成功')
      onClosePointsDialog()
      getMemberData()
    }
  })
}

onMounted(() => {
  getMemberData()
})

const UpImageURL = computed(() => requestApi.getUploadImageUrl())

const getImageURL = (imageURL?: string) => {
  return imageURL ? requestApi.getDownloadPicUrl(imageURL) : ''
}

const getMemberData = () => {
  getMemberApi({
    departmentName: SearchFormData.departmentName,
    phone: SearchFormData.phone,
    cardNo: SearchFormData.cardNo,
    nickName: SearchFormData.nickName,
    sTime: SearchFormData.sTime?.[0],
    etime: SearchFormData.sTime?.[1],
    current: currentPage.value,
    size: pageSize.value
  }).then((res: any) => {
    total.value = res.data?.total || 0
    TableData.value = res.data?.records || []
  })
}

const handleUploadChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const response = info.file.response
  if (response?.code == 200) {
    addFormData.pic = response.data
  } else {
    message.error('上传图片出错了')
  }
}

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const beforeAvatarUpload = () => true

const onReset = () => {
  SearchFormData.departmentName = ''
  SearchFormData.phone = ''
  SearchFormData.cardNo = ''
  SearchFormData.nickName = ''
  SearchFormData.sTime = undefined
  currentPage.value = 1
  getMemberData()
}

const OnClickAdd = () => {
  isUpdate.value = false
  AdddialogFormVisible.value = true
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const onCloseAddDialog = () => {
  AdddialogFormVisible.value = false
}

const onConfirm = () => {
  if (isUpdate.value) {
    doUpdate()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加这个会员吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const res: any = await addMemberApi(addFormData)
      if (res.code == 200) {
        message.success('操作成功')
        getMemberData()
        AdddialogFormVisible.value = false
      } else {
        message.warning(res.message)
      }
    }
  })
}

const doUpdate = () => {}

const handleDetail = (record: Record<string, any>) => {
  AModal.confirm({
    title: '提示',
    content: '确定要拉黑这个会员吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await moveMemberToBlackListApi({ memberId: record.id })
      message.success('操作成功')
      AdddialogFormVisible.value = false
      getMemberData()
    }
  })
}

const handleRemove = (record: Record<string, any>) => {
  getCardData()
  bindCardData.memberId = record.id
  bindCardDialogVisible.value = true
}

const addPoints = (record: Record<string, any>) => {
  OperationPointsTitle.value = '添加积分'
  operationPoints.MemberId = record.id
  operationPoints.type = 1
  operationPoints.remarks = ''
  operationPoints.points = 0
  dialogPointVisible.value = true
}

const reducePoints = (record: Record<string, any>) => {
  OperationPointsTitle.value = '扣除积分'
  operationPoints.MemberId = record.id
  operationPoints.type = 0
  operationPoints.remarks = ''
  operationPoints.points = 0
  dialogPointVisible.value = true
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getMemberData()
}
</script>

<style lang="less" scoped>
.member-page {
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

  :deep(.ant-picker),
  :deep(.ant-input),
  :deep(.ant-input-number),
  :deep(.ant-select) {
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

.action-add {
  color: #52c41a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.card-search-form {
  margin-bottom: 16px;
}

.card-pagination {
  margin-top: 12px;
}

.table-avatar {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 50%;
}

.empty-text {
  color: #8c8c8c;
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
  object-fit: cover;
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
</style>
