<template>
  <div class="sys-log-page">
    <AForm v-if="showSearchForm" :model="Queryparam" layout="horizontal" class="search-form">
      <AFormItem label="模块名称" class="search-form-item">
        <AInput v-model:value="Queryparam.module" class="w-full" placeholder="请输入模块名称" />
      </AFormItem>

      <AFormItem label="操作人员" class="search-form-item">
        <AInput v-model:value="Queryparam.user" class="w-full" placeholder="请输入操作人员" />
      </AFormItem>

      <AFormItem label="状态" class="search-form-item">
        <ASelect v-model:value="Queryparam.status" :options="statusOptions" allow-clear class="w-full" placeholder="请选择状态" />
      </AFormItem>

      <AFormItem label="操作类型" class="search-form-item">
        <ASelect v-model:value="Queryparam.type" :options="operationTypeOptions" allow-clear class="w-full" placeholder="请选择操作类型" />
      </AFormItem>

      <AFormItem label="操作时间" class="search-form-item search-form-range">
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

    <ATable row-key="oper_id" :columns="columns" :data-source="logData" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'oper_status'">
          {{ converStatu(record.oper_status) }}
        </template>

        <template v-else-if="column.key === 'oper_create_time'">
          {{ converDateFormat(record.oper_create_time) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <AButton type="link" class="table-action" @click="handleDetail(record)">详细</AButton>
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

    <AModal v-model:open="handleShow" title="详细日志" width="760px" :footer="null">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">模块名称</span>
          <span>{{ currentRow.oper_module }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">操作类型</span>
          <span>{{ currentRow.oper_type }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">请求地址</span>
          <span>{{ currentRow.oper_method }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">请求结果</span>
          <span>{{ converStatu(currentRow.oper_status) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">请求IP地址</span>
          <span>{{ currentRow.oper_ip }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">操作用户</span>
          <span>{{ currentRow.oper_user_id }}</span>
        </div>
        <div class="detail-item detail-wide">
          <span class="detail-label">操作方法</span>
          <span>{{ currentRow.oper_uri }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">操作描述</span>
          <span>{{ currentRow.oper_desc }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">操作时间</span>
          <span>{{ converDateFormat(currentRow.oper_create_time) }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <AButton @click="handleShow = false">关闭</AButton>
      </div>
    </AModal>
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
import { PATH_URL, service } from '@/config/axios/service'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker

type TableKey = string | number
type DateRange = [string, string] | undefined

interface LogQueryParam {
  module: string
  type?: string
  user: string
  status?: number
  sTime?: string
  eTime?: string
  page: number
  size: number
}

interface LogData {
  [key: string]: any
  oper_id?: number
  oper_module?: string
  oper_type?: string
  oper_desc?: string
  oper_requ_param?: string
  oper_reps_param?: string
  oper_user_id?: string
  oper_method?: string
  oper_uri?: string
  oper_ip?: string
  oper_create_time?: string
  oper_status?: number
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
  del: 'log_sys_del',
  sec: 'log_sys_sec'
})

const currentPage = ref(1)
const pageSize = ref(10)
const disabled = ref(false)
const total = ref(0)
const operationTime = ref<DateRange>()
const showSearchForm = ref(true)
const currentRow = ref<LogData>({})
const handleShow = ref(false)
const logData = ref<LogData[]>([])
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const statusArray = [
  { id: 0, label: '成功' },
  { id: 1, label: '失败' }
]

const operationTypeArray = [{ label: '新增' }, { label: '修改' }, { label: '删除' }, { label: '授权' }, { label: '导出' }, { label: '导入' }, { label: '强退' }, { label: '生成代码' }]

const Queryparam = ref<LogQueryParam>({
  module: '',
  type: undefined,
  user: '',
  status: undefined,
  sTime: undefined,
  eTime: undefined,
  page: 1,
  size: 10
})

const statusOptions = computed(() => statusArray.map((item) => ({ label: item.label, value: item.id })))
const operationTypeOptions = computed(() => operationTypeArray.map((item) => ({ label: item.label, value: item.label })))
const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const columns: TableColumnsType<LogData> = [
  { title: '日志模块', dataIndex: 'oper_module', key: 'oper_module', width: 160 },
  { title: '操作类型', dataIndex: 'oper_type', key: 'oper_type', width: 120 },
  { title: '操作人员', dataIndex: 'oper_user_id', key: 'oper_user_id', width: 120 },
  { title: '操作IP地址', dataIndex: 'oper_ip', key: 'oper_ip', width: 160 },
  { title: '操作状态', dataIndex: 'oper_status', key: 'oper_status', width: 120 },
  { title: '投放时间', dataIndex: 'oper_create_time', key: 'oper_create_time', width: 180 },
  { title: '操作', key: 'action', width: 120 }
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: LogData[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.oper_id).filter((id): id is number => id != null)
  }
}))

const converDateFormat = (time?: string) => {
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

  service.post(PATH_URL + '/MachineMange/getLogData', Queryparam.value).then((res: any) => {
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
      PATH_URL + '/MachineMange/deleteLogIds',
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
  Queryparam.value.status = undefined
  Queryparam.value.module = ''
  Queryparam.value.user = ''
  Queryparam.value.type = undefined
  currentPage.value = 1
  operationTime.value = undefined
  getLogData()
}

const handleDetail = (row: Record<string, any>) => {
  currentRow.value = row
  handleShow.value = true
}

const converStatu = (status?: number): string => {
  if (status == 0) {
    return '成功'
  }
  if (status == 1) {
    return '失败'
  }
  return '未知状态'
}
</script>

<style lang="less" scoped>
.sys-log-page {
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

  :deep(.ant-form-item-control-input),
  :deep(.ant-form-item-control-input-content) {
    width: 100%;
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
  grid-template-columns: 108px minmax(0, 1fr);
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
  word-break: break-all;
  align-items: center;
}

.modal-footer {
  margin-top: 16px;
}

.w-full {
  width: 100%;
}
</style>
