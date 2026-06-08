<template>
  <div class="order-list-page">
    <AForm v-if="showSearchForm" :model="QueryParam" layout="horizontal" class="search-form">
      <AFormItem label="卡号" class="search-form-item">
        <AInput v-model:value="QueryParam.cardNo" placeholder="请输入卡号" />
      </AFormItem>

      <AFormItem label="设备编号" class="search-form-item">
        <AInput v-model:value="QueryParam.serialNumber" placeholder="请输入设备编号" />
      </AFormItem>

      <AFormItem label="审核状态" class="search-form-item">
        <ASelect v-model:value="QueryParam.status" :options="orderStatusOptions" allow-clear placeholder="请选择审核状态" />
      </AFormItem>

      <AFormItem label="投放方式" class="search-form-item">
        <ASelect v-model:value="QueryParam.way" :options="orderModelOptions" allow-clear placeholder="请选择投放方式" />
      </AFormItem>

      <AFormItem label="记录编号" class="search-form-item">
        <AInput v-model:value="QueryParam.id" placeholder="请输入记录编号" />
      </AFormItem>

      <AFormItem label="手机号" class="search-form-item">
        <AInput v-model:value="QueryParam.phone" placeholder="请输入手机号" />
      </AFormItem>

      <AFormItem label="会员编号" class="search-form-item">
        <AInput v-model:value="QueryParam.memberId" placeholder="请输入会员编号" />
      </AFormItem>

      <AFormItem label="会员昵称" class="search-form-item">
        <AInput v-model:value="QueryParam.nickName" placeholder="请输入会员昵称" />
      </AFormItem>

      <AFormItem label="投放时间" class="search-form-item search-form-range">
        <ARangePicker v-model:value="queryTime" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" start-placeholder="开始时间" end-placeholder="结束时间" />
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
        <AButton type="primary" class="icon-button" @click="ExportOrderList">
          <template #icon>
            <Icon icon="ant-design:export-outlined" />
          </template>
          导出
        </AButton>

        <AButton class="icon-button" @click="onOpenSetDelay">
          <template #icon>
            <Icon icon="ant-design:clock-circle-outlined" />
          </template>
          设置积分到账时间
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

    <ATable row-key="id" :columns="columns" :data-source="OrderList" :pagination="false" :scroll="{ x: 'max-content' }" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'createTime'">
          {{ converDateFormat(record.createTime) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action" @click="showDetail(record)" v-hasPermi="Permission.quy">查看详情</AButton>
            <AButton v-if="getStatus(record)" type="link" class="table-action" @click="doWork(record)" v-hasPermi="Permission.exa">审核</AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="QueryParam.page"
        v-model:page-size="QueryParam.size"
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

    <AModal v-model:open="detailShow" title="投放详情" width="760px" :footer="null">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">记录编号</span>
          <span>{{ currentOrderList.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">设备名称</span>
          <span>{{ currentOrderList.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">设备编号</span>
          <span>{{ currentOrderList.serialNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">会员编号</span>
          <span>{{ currentOrderList.memberId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">会员昵称</span>
          <span>{{ currentOrderList.nickName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">投放方式</span>
          <span>{{ currentOrderList.way }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">手机号</span>
          <span>{{ currentOrderList.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">仓位号</span>
          <span>{{ currentOrderList.channel }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">垃圾类型</span>
          <span>{{ currentOrderList.garbageName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">投放重量</span>
          <span>{{ currentOrderList.weight }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">积分</span>
          <span>{{ currentOrderList.points }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">投放状态</span>
          <span>{{ currentOrderList.status }}</span>
        </div>
        <div class="detail-item detail-wide">
          <span class="detail-label">投放时间</span>
          <span>{{ converDateFormat(currentOrderList.createTime) }}</span>
        </div>
        <div class="detail-item detail-wide detail-photo">
          <span class="detail-label">投放照片</span>
          <div class="detail-photo-content">
            <img v-if="currentOrderList.pic && !detailImageLoadFailed" :src="getImageURL(currentOrderList.pic)" class="detail-image" @error="detailImageLoadFailed = true" />
            <span v-else class="photo-empty-text">{{ currentOrderList.pic ? '照片加载失败' : '暂无照片' }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <AButton @click="detailShow = false">关闭</AButton>
      </div>
    </AModal>

    <AModal v-model:open="handleShow" title="审核投放记录" width="420px">
      <ARadioGroup v-model:value="workResult" :options="workResultOptions" option-type="button" button-style="solid" />
      <template #footer>
        <ASpace>
          <AButton @click="handleShow = false">取消</AButton>
          <AButton type="primary" @click="doHandle">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="setDelaydialogVisible" title="设置自动审核时间" width="420px">
      <div class="delay-row">
        <span>延时到账时间</span>
        <AInputNumber v-model:value="delayData" :min="1" :max="9999" />
      </div>
      <template #footer>
        <ASpace>
          <AButton @click="onDelayClose">取消</AButton>
          <AButton type="primary" @click="onSetDelay">确认</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { getOrderDelayApi, updateDelayApi } from '@/api/order'

import { doWorkApi, getOrderListApi } from '@/api/machine'

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
  RadioGroup as ARadioGroup,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import axios from 'axios'
import qs from 'qs'
import * as requestApi from '@/api/request'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker

type DateRange = [string, string] | undefined

interface OrderListStruct {
  [key: string]: any
  id: number
  serialNumber: string
  name: string
  memberId: string
  nickName: string
  way: string
  points: number
  phone: string
  weight: number
  status: string
  channel: number
  garbageName: string
  createTime: string
  pic: string
  ss?: number
}

interface QueryStruct {
  cardNo: string
  serialNumber: string
  status?: number
  way?: number
  id?: number
  phone: string
  memberId: string
  nickName: string
  sTime?: string
  etime?: string
  page: number
  size: number
}

interface OptionStruct {
  id: number
  label: string
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getOrderList()
}

const delayData = ref(168)
const setDelaydialogVisible = ref(false)
const Permission = ref({
  quy: 'ord_ord_quy',
  exa: 'ord_ord_exa',
  sec: 'ord_ord_sec'
})

const total = ref(0)
const disabled = ref(false)
const detailShow = ref(false)
const detailImageLoadFailed = ref(false)
const handleShow = ref(false)
const workId = ref(0)
const workResult = ref(1)
const showSearchForm = ref(true)
const queryTime = ref<DateRange>()
const OrderList = ref<OrderListStruct[]>([])

const currentOrderList = ref<OrderListStruct>({
  id: 0,
  serialNumber: '',
  name: '',
  memberId: '',
  nickName: '',
  way: '',
  points: 0,
  phone: '',
  weight: 0,
  status: '',
  channel: 0,
  garbageName: '',
  createTime: '',
  pic: ''
})

const OrderStatusArray: OptionStruct[] = [
  { id: 0, label: '未审核' },
  { id: 1, label: '已审核' },
  { id: 2, label: '违规' }
]

const orderModelArray: OptionStruct[] = [
  { id: 0, label: '匿名投放' },
  { id: 1, label: '刷卡' },
  { id: 2, label: '扫码' },
  { id: 3, label: '手机' },
  { id: 4, label: '刷脸' }
]

const workResultOptions = [
  { value: 1, label: '成功' },
  { value: 2, label: '违规' }
]

const QueryParam = ref<QueryStruct>({
  cardNo: '',
  serialNumber: '',
  phone: '',
  memberId: '',
  nickName: '',
  way: undefined,
  id: undefined,
  status: undefined,
  page: 1,
  size: 10
})

const orderStatusOptions = computed(() => OrderStatusArray.map((item) => ({ label: item.label, value: item.id })))
const orderModelOptions = computed(() => orderModelArray.map((item) => ({ label: item.label, value: item.id })))

const columns: TableColumnsType<OrderListStruct> = [
  { title: '记录编号', dataIndex: 'id', key: 'id', width: 100 },
  { title: '设备编号', dataIndex: 'serialNumber', key: 'serialNumber', width: 160 },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '会员编号', dataIndex: 'memberId', key: 'memberId', width: 120 },
  { title: '会员昵称', dataIndex: 'nickName', key: 'nickName', width: 160 },
  { title: '投放方式', dataIndex: 'way', key: 'way', width: 140 },
  { title: '积分', dataIndex: 'points', key: 'points', width: 100 },
  { title: '会员手机', dataIndex: 'phone', key: 'phone', width: 160 },
  { title: '投放重量', dataIndex: 'weight', key: 'weight', width: 120 },
  { title: '投放时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '审核状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const onOpenSetDelay = () => {
  setDelaydialogVisible.value = true
}

const onSetDelay = () => {
  updateDelayApi(qs.stringify({ delay: delayData.value }, { arrayFormat: 'brackets' })).then(() => {
    message.success('操作成功')
    getDelay()
    setDelaydialogVisible.value = false
  })
}

const getDelay = () => {
  getOrderDelayApi().then((res: any) => {
    delayData.value = res.data?.delay ?? 168
  })
}

const onDelayClose = () => {
  setDelaydialogVisible.value = false
}

const getImageURL = (imageURL?: string) => {
  return imageURL ? requestApi.getDownloadPicUrl(imageURL) : ''
}

const onSearch = () => {
  QueryParam.value.page = 1
  getOrderList()
}

const showDetail = (row: Record<string, any>) => {
  currentOrderList.value = row as OrderListStruct
  detailImageLoadFailed.value = false
  detailShow.value = true
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const getStatus = (row: Record<string, any>): boolean => {
  return row.ss == 0
}

const doHandle = () => {
  doWorkApi({
    orderId: workId.value,
    result: workResult.value
  }).then((res: any) => {
    if (res.code == 200) {
      message.success('操作成功')
      handleShow.value = false
    }
    getOrderList()
  })
}

const doWork = (row: Record<string, any>) => {
  workId.value = row.id
  workResult.value = 1
  handleShow.value = true
}

const onReset = () => {
  queryTime.value = undefined
  QueryParam.value.cardNo = ''
  QueryParam.value.id = undefined
  QueryParam.value.memberId = ''
  QueryParam.value.nickName = ''
  QueryParam.value.phone = ''
  QueryParam.value.serialNumber = ''
  QueryParam.value.status = undefined
  QueryParam.value.way = undefined
  QueryParam.value.page = 1
  getOrderList()
}

const converDateFormat = (time: string) => {
  return time ? time.replace('T', ' ') : time
}

const setQueryTime = () => {
  QueryParam.value.sTime = queryTime.value?.[0]
  QueryParam.value.etime = queryTime.value?.[1]
}

const handlePageChange = (page: number, size: number) => {
  QueryParam.value.page = page
  QueryParam.value.size = size
  getOrderList()
}

const getOrderList = () => {
  setQueryTime()
  getOrderListApi(QueryParam.value).then((res: any) => {
    OrderList.value = res.data?.records || []
    total.value = res.data?.total || 0
  })
}

const ExportOrderList = () => {
  setQueryTime()

  axios({
    method: 'post',
    url: requestApi.getApiUrl('/MachineMange/ExportOrderList'),
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token')
    },
    data: QueryParam.value
  }).then((response) => {
    const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const body = document.querySelector('body')

    link.href = window.URL.createObjectURL(blob)
    link.download = '导出投放列表.xls'
    link.style.display = 'none'
    body?.appendChild(link)
    link.click()
    body?.removeChild(link)
    window.URL.revokeObjectURL(link.href)
  })
}

onMounted(() => {
  getOrderList()
  getDelay()
})
</script>

<style scoped lang="less">
.order-list-page {
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

.table-action {
  height: 24px;
  padding: 0;
}

.pagination-wrap,
.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #f0f0f0;
  border-left: 1px solid #f0f0f0;
}

.detail-item {
  display: grid;
  min-height: 40px;
  grid-template-columns: 96px minmax(0, 1fr);
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-wide {
  grid-column: span 2;
}

.detail-label {
  display: flex;
  padding: 8px 12px;
  color: #595959;
  background-color: #fafafa;
  align-items: center;
}

.detail-item > span:not(.detail-label) {
  display: flex;
  min-width: 0;
  padding: 8px 12px;
  align-items: center;
}

.detail-photo-content {
  display: flex;
  min-height: 224px;
  padding: 12px;
  align-items: center;
}

.detail-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.photo-empty-text {
  display: flex;
  width: 200px;
  height: 200px;
  color: #8c8c8c;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  margin-top: 16px;
}

.delay-row {
  display: grid;
  align-items: center;
  grid-template-columns: 108px 1fr;
  gap: 12px;
}

.empty-text {
  color: #8c8c8c;
}

.w-full {
  width: 100%;
}
</style>
