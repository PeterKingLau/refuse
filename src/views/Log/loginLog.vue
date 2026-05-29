<template>
  <div class="login-log-page">
    <AForm v-if="showSearchForm" :model="Queryparam" layout="horizontal" class="search-form">
      <AFormItem label="登录地址" class="search-form-item">
        <AInput v-model:value="Queryparam.ip" placeholder="请输入登录地址" />
      </AFormItem>

      <AFormItem label="用户名称" class="search-form-item">
        <AInput v-model:value="Queryparam.user" placeholder="请输入用户名称" />
      </AFormItem>

      <AFormItem label="状态" class="search-form-item">
        <ASelect v-model:value="Queryparam.status" :options="statusOptions" allow-clear placeholder="请选择状态" />
      </AFormItem>

      <AFormItem label="登录时间" class="search-form-item search-form-range">
        <ARangePicker v-model:value="operationTime" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" start-placeholder="开始时间" end-placeholder="结束时间" />
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
        <AButton danger class="icon-button" :disabled="disableRemove" @click="deleteOfDetail" v-hasPermi="Permission.del">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
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
        <template v-if="column.key === 'statusText'">
          {{ record.status == 0 ? '成功' : '失败' }}
        </template>

        <template v-else-if="column.key === 'message'">
          {{ converStatu(record.status) }}
        </template>

        <template v-else-if="column.key === 'createTime'">
          {{ converDateFormat(record.createTime) }}
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
  </div>
</template>

<script setup lang="ts">
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
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import qs from 'qs'
import { PATH_URL, service } from '@/config/axios/service'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker

type TableKey = string | number
type DateRange = [string, string] | undefined

interface LogQueryParam {
  ip: string
  user: string
  status?: number
  sTime?: string
  eTime?: string
  page: number
  size: number
}

interface LoginLogRecord {
  [key: string]: any
  id: number
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getLogData()
}

const Permission = ref({
  del: 'log_lgi_del',
  sec: 'log_lgi_sec'
})

const currentPage = ref(1)
const pageSize = ref(10)
const disabled = ref(false)
const total = ref(0)
const operationTime = ref<DateRange>()
const showSearchForm = ref(true)
const logData = ref<LoginLogRecord[]>([])
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const statusArray = [
  { id: 0, label: '成功' },
  { id: 1, label: '失败' }
]

const Queryparam = ref<LogQueryParam>({
  ip: '',
  user: '',
  status: undefined,
  sTime: undefined,
  eTime: undefined,
  page: 1,
  size: 10
})

const statusOptions = computed(() => statusArray.map((item) => ({ label: item.label, value: item.id })))
const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const columns: TableColumnsType<LoginLogRecord> = [
  { title: '用户名称', dataIndex: 'userName', key: 'userName', width: 220 },
  { title: '登录IP', dataIndex: 'ip', key: 'ip', width: 220 },
  { title: '登录状态', dataIndex: 'status', key: 'statusText', width: 120 },
  { title: '登录信息', dataIndex: 'status', key: 'message', width: 220 },
  { title: '登录时间', dataIndex: 'createTime', key: 'createTime', width: 220 }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: LoginLogRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const converDateFormat = (time: string) => {
  return time ? time.replace('T', ' ') : time
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

onMounted(() => {
  getLogData()
})

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getLogData()
}

const onSearch = () => {
  currentPage.value = 1
  getLogData()
}

const getLogData = () => {
  Queryparam.value.sTime = operationTime.value?.[0]
  Queryparam.value.eTime = operationTime.value?.[1]
  Queryparam.value.page = currentPage.value
  Queryparam.value.size = pageSize.value

  service.post(PATH_URL + '/Permission/getLoginLog', Queryparam.value).then((res: any) => {
    total.value = res.data?.total || 0
    logData.value = res.data?.records || []
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

const deleteOfDetail = () => {
  if (DeleteIdArray.length === 0) {
    message.warning('请选择要删除的日志')
    return
  }

  service
    .post(
      PATH_URL + '/Permission/deleteLogIds',
      qs.stringify(
        {
          ids: DeleteIdArray
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res: any) => {
      if (res.code == 200) {
        message.success('操作成功')
        DeleteIdArray = []
        getLogData()
      }
    })
}

const onReset = () => {
  Queryparam.value.eTime = undefined
  Queryparam.value.sTime = undefined
  Queryparam.value.ip = ''
  Queryparam.value.status = undefined
  Queryparam.value.user = ''
  currentPage.value = 1
  operationTime.value = undefined
  getLogData()
}

const converStatu = (status: number): string => {
  if (status == 0) {
    return '登录成功'
  }
  if (status == 1) {
    return '用户名或密码错误'
  }
  if (status == 2) {
    return '账户禁用'
  }
  return '未知状态'
}
</script>

<style lang="less" scoped>
.login-log-page {
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

.icon-button {
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
