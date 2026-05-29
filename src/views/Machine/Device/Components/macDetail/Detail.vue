<template>
  <div class="device-detail-page">
    <ATabs v-model:activeKey="activeName" class="detail-tabs" @change="handleTabChange">
      <ATabPane key="detail" tab="设备详情">
        <div class="device-title">设备名称：{{ pp.name || '-' }}</div>

        <ADescriptions bordered size="small" :column="3">
          <ADescriptionsItem label="设备编号">{{ pp.serialNumber || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="设备名称">{{ pp.name || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="设备型号">{{ pp.deviceType?.name || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="设备区域">{{ pp.area?.areaName || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="地址">{{ pp.address || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="设备状态">{{ ConverStatus(pp.status) }}</ADescriptionsItem>
          <ADescriptionsItem label="设备 imei">{{ pp.imei || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="运营人员">{{ currentOperation.name || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="维护人员">{{ CurrentMaintenance.name || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="是否在线">{{ pp.isOnline ?? '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="创建时间">{{ pp.createTime || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="免费时间">-</ADescriptionsItem>
          <ADescriptionsItem label="累计发放积分">{{ CurrentPoints }}</ADescriptionsItem>
          <ADescriptionsItem label="操作人">{{ currentCreateStaff.name || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="修改时间">{{ pp.updateTime || '-' }}</ADescriptionsItem>
          <ADescriptionsItem label="运营规则">
            <AButton type="link" class="inline-action" @click="doRule">设置</AButton>
          </ADescriptionsItem>
          <ADescriptionsItem label="清运次数">{{ clearNumber || 0 }}</ADescriptionsItem>
        </ADescriptions>
      </ATabPane>

      <ATabPane key="channel" tab="仓位信息">
        <ATable row-key="id" :columns="channelColumns" :data-source="channelData" :pagination="false" :scroll="{ x: 1180 }" bordered>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'spill_over'">
              {{ getSpillOverStatus(record.spill_over) }}
            </template>

            <template v-else-if="column.key === 'isOver'">
              {{ isOver(record.weight, record.max_weight) }}
            </template>

            <template v-else-if="column.key === 'action'">
              <ASpace>
                <AButton type="link" class="table-action" @click="doUpdate(record)">
                  <template #icon>
                    <Icon icon="ant-design:edit-outlined" />
                  </template>
                  修改最大重量
                </AButton>
                <AButton type="link" class="table-action" @click="doOpen(record)">
                  <template #icon>
                    <Icon icon="ant-design:unlock-outlined" />
                  </template>
                  开启投口
                </AButton>
              </ASpace>
            </template>
          </template>
        </ATable>
      </ATabPane>

      <ATabPane key="list" tab="投放列表">
        <ATable row-key="rid" :columns="orderColumns" :data-source="orderLists" :pagination="false" :scroll="{ x: 1540 }" bordered>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'pic'">
              <img v-if="record.pic" :src="GetImageURL(record.pic)" class="table-image" />
              <span v-else class="empty-text">暂无</span>
            </template>

            <template v-else-if="column.key === 'create_time'">
              {{ FormatDate(record.create_time) }}
            </template>

            <template v-else-if="column.key === 'action'">
              <AButton type="link" class="table-action action-detail" @click="showOrderDetail(record)">
                <template #icon>
                  <Icon icon="ant-design:eye-outlined" />
                </template>
                显示更多
              </AButton>
            </template>
          </template>
        </ATable>

        <div class="pagination-wrap">
          <APagination
            v-model:current="page"
            v-model:page-size="size"
            :disabled="disabled"
            :total="total"
            :show-total="(totalCount) => `共 ${totalCount} 条`"
            show-quick-jumper
            @change="handleOrderPageChange"
          />
        </div>
      </ATabPane>
    </ATabs>

    <AModal v-model:open="UpdatedialogVisible" title="修改最大重量" width="480px">
      <AForm :model="currentChannel" layout="vertical">
        <AFormItem label="仓位编码">
          <span>{{ currentChannel.code || '-' }}</span>
        </AFormItem>
        <AFormItem label="垃圾类型">
          <span>{{ currentChannel.garbage_Name || '-' }}</span>
        </AFormItem>
        <AFormItem label="最大重量">
          <AInputNumber v-model:value="currentChannel.maxWeight" :min="1" :max="1000" class="w-full" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="UpdatedialogVisible = false">取消</AButton>
          <AButton type="primary" @click="doRev">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <ADrawer v-model:open="detailVisible" title="投递详情" placement="right" width="360px">
      <ADescriptions bordered size="small" :column="1">
        <ADescriptionsItem label="垃圾类型">{{ currentOrder.garbage_Name || '-' }}</ADescriptionsItem>
        <ADescriptionsItem label="仓位">{{ currentOrder.code || '-' }}</ADescriptionsItem>
        <ADescriptionsItem label="重量">{{ currentOrder.weight ?? '-' }} KG</ADescriptionsItem>
        <ADescriptionsItem label="结果">{{ currentOrder.status || '-' }}</ADescriptionsItem>
      </ADescriptions>
    </ADrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Button as AButton,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Drawer as ADrawer,
  Form as AForm,
  FormItem as AFormItem,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  Space as ASpace,
  Table as ATable,
  TabPane as ATabPane,
  Tabs as ATabs,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { PATH_URL, service } from '@/config/axios/service'
import { GetImageURL, FormatDate } from '@/utils/tools'
import { Icon } from '@/components/Icon'

interface DeviceRow {
  [key: string]: any
}

interface ChannelRecord {
  [key: string]: any
  id?: number
  code?: string
  garbage_Name?: string
  weight?: number | null
  max_weight?: number | null
  maxWeight?: number
  spill_over?: number | null
}

interface OrderRecord {
  [key: string]: any
  rid?: number | string
  phone?: string
  name?: string
  pic?: string
  points?: number
  way?: string
  status?: string
  memberId?: number | string
  nick_name?: string
  weight?: number
  create_time?: string
}

const props = defineProps<{
  row?: DeviceRow
}>()

const emit = defineEmits<{
  (event: 'doRule'): void
}>()

const pp = computed(() => props.row || {})
const activeName = ref('detail')
const detailVisible = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)
const disabled = ref(false)
const orderLists = ref<OrderRecord[]>([])
const currentOrder = ref<OrderRecord>({})
const CurrentPoints = ref(0)
const clearNumber = ref(0)
const currentCreateStaff = ref<Record<string, any>>({})
const currentOperation = ref<Record<string, any>>({})
const CurrentMaintenance = ref<Record<string, any>>({})
const channelData = ref<ChannelRecord[]>([])
const currentChannel = ref<ChannelRecord>({})
const UpdatedialogVisible = ref(false)

const channelColumns: TableColumnsType<ChannelRecord> = [
  { title: '仓位编号', dataIndex: 'code', key: 'code', width: 160 },
  { title: '垃圾类型', dataIndex: 'garbage_Name', key: 'garbage_Name', width: 160 },
  { title: '当前重量', dataIndex: 'weight', key: 'weight', width: 160 },
  { title: '最大重量', dataIndex: 'max_weight', key: 'max_weight', width: 160 },
  { title: '是否满溢', dataIndex: 'spill_over', key: 'spill_over', width: 160 },
  { title: '是否超重', key: 'isOver', width: 160 },
  { title: '操作', key: 'action', width: 220 }
]

const orderColumns: TableColumnsType<OrderRecord> = [
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 160 },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '图片', dataIndex: 'pic', key: 'pic', width: 100 },
  { title: '积分', dataIndex: 'points', key: 'points', width: 100 },
  { title: '投放方式', dataIndex: 'way', key: 'way', width: 120 },
  { title: '投放状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '会员编号', dataIndex: 'memberId', key: 'memberId', width: 120 },
  { title: '会员名称', dataIndex: 'nick_name', key: 'nick_name', width: 120 },
  { title: '投放重量(KG)', dataIndex: 'weight', key: 'weight', width: 150 },
  { title: '投放时间', dataIndex: 'create_time', key: 'create_time', width: 200 },
  { title: '操作', key: 'action', width: 140 }
]

const loadDeviceDetail = () => {
  const row = pp.value
  if (!row?.id) return

  getMaintenanceStaff(row.maintenanceStaff)
  getOperators(row.operators)
  getCreateStaff(row.createStaff)
  getPoints(row.id)
  getClearCount(row.id)
  getChannelData(row.id)
  GetOrderList()
}

onMounted(() => {
  loadDeviceDetail()
})

watch(
  () => props.row?.id,
  () => {
    page.value = 1
    loadDeviceDetail()
  }
)

const GetOrderList = () => {
  if (!pp.value?.id) return

  const param = {
    id: pp.value.id,
    page: page.value,
    size: size.value
  }

  service.post(PATH_URL + '/MachineMange/GetOrderListByDevice', param).then((res: any) => {
    orderLists.value = res.data?.records || []
    total.value = res.data?.total || 0
  })
}

const handleTabChange = (key: string | number) => {
  if (key === 'list') {
    GetOrderList()
  }
}

const handleOrderPageChange = (current: number, currentSize: number) => {
  page.value = current
  size.value = currentSize
  GetOrderList()
}

const getPoints = (id: number) => {
  service.get(PATH_URL + '/MachineMange/getPoints?id=' + id).then((res: any) => {
    CurrentPoints.value = res.data || 0
  })
}

const getMaintenanceStaff = (id?: number) => {
  if (id == null) return

  service.get(PATH_URL + '/Permission/getPowStaff?id=' + id).then((res: any) => {
    CurrentMaintenance.value = res.data || {}
  })
}

const getOperators = (id?: number) => {
  if (id == null) return

  service.get(PATH_URL + '/Permission/getPowStaff?id=' + id).then((res: any) => {
    currentOperation.value = res.data || {}
  })
}

const getCreateStaff = (id?: number) => {
  if (id == null) return

  service.get(PATH_URL + '/Permission/getPowStaff?id=' + id).then((res: any) => {
    currentCreateStaff.value = res.data || {}
  })
}

const getClearCount = (id: number) => {
  service.get(PATH_URL + '/MachineMange/getClearCount?id=' + id).then((res: any) => {
    clearNumber.value = res.data || 0
  })
}

const isOver = (current?: number | null, max?: number | null) => {
  if (current != null && max != null && current > max) {
    return '超重'
  }
  return '未超重'
}

const doRule = () => {
  emit('doRule')
}

const ConverStatus = (val?: number) => {
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

const showOrderDetail = (row: OrderRecord) => {
  currentOrder.value = row
  detailVisible.value = true
}

const getChannelData = (id: number) => {
  service.get(PATH_URL + '/MachineMange/getCheannelMap?id=' + id).then((res: any) => {
    channelData.value = res.data || []
  })
}

const doUpdate = (row: ChannelRecord) => {
  currentChannel.value = {
    ...row,
    maxWeight: row.maxWeight ?? row.max_weight ?? 1
  }
  UpdatedialogVisible.value = true
}

const getSpillOverStatus = (spillOver?: number | null) => {
  if (spillOver == null) return '未满溢'
  return spillOver === 0 ? '未满溢' : '满溢'
}

const doOpen = (row: ChannelRecord) => {
  const parm = {
    deviceId: pp.value.id,
    operationId: 1,
    channelId: row.code
  }

  service.post(PATH_URL + '/MachineMange/sendRTO', parm).then((res: any) => {
    if (res.code == 200) {
      message.success('指令发送成功')
    }
  })
}

const doRev = () => {
  const param = {
    channelId: currentChannel.value.id,
    maxWeight: currentChannel.value.maxWeight
  }

  service.post(PATH_URL + '/MachineMange/updateChannelMax', param).then((res: any) => {
    if (res.code == 200) {
      message.success('操作成功')
      getChannelData(pp.value.id)
      UpdatedialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="less">
.device-detail-page {
  width: 100%;
}

.detail-tabs {
  width: 100%;

  :deep(.ant-tabs-content-holder) {
    overflow: visible;
  }

  :deep(.ant-table-wrapper) {
    min-width: 0;
  }
}

.device-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.inline-action,
.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0;
  gap: 4px;

  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.action-detail {
  color: #52c41a;
}

.table-image {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 6px;
}

.empty-text {
  color: #8c8c8c;
}

.pagination-wrap {
  display: flex;
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
