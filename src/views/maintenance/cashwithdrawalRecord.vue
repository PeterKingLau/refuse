<template>
  <div class="cash-withdrawal-record-page">
    <AForm v-if="showSearchForm" :model="queryForm" layout="horizontal" class="search-form">
      <AFormItem label="审核状态" class="search-form-item">
        <ASelect v-model:value="queryForm.reviewStatus" :options="reviewStatusOptions" allow-clear placeholder="请选择审核状态" @change="onSearch" />
      </AFormItem>

      <AFormItem label="提现状态" class="search-form-item">
        <ASelect v-model:value="queryForm.orderStatus" :options="withdrawalStatusOptions" allow-clear placeholder="请选择提现状态" @change="onSearch" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="onSearch" v-hasPermi="Permission.pro">
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

    <ADivider />

    <ATable row-key="id" :columns="columns" :data-source="recordData" :pagination="false" :scroll="{ x: 'max-content' }" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'how'">
          {{ getPayWay(record.how) }}
        </template>

        <template v-else-if="column.key === 'Review_status'">
          {{ getProcessStatus(record.Review_status) }}
        </template>

        <template v-else-if="column.key === 'order_status'">
          {{ payStatus(record.order_status) }}
        </template>

        <template v-else-if="column.key === 'create_time'">
          {{ converDateFormat(record.create_time) }}
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Button as AButton, Divider as ADivider, Form as AForm, FormItem as AFormItem, Pagination as APagination, Select as ASelect, Space as ASpace, Table as ATable } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getWithdrawalRecordListApi } from '@/api/maintenance/cashWithdrawal'
import { Icon } from '@/components/Icon'

interface QueryStruct {
  reviewStatus?: number
  orderStatus?: number
}

interface CashWithdrawalRecord {
  [key: string]: any
  id: number
}

const reviewStatusList = [
  { id: 0, label: '待审核' },
  { id: 1, label: '审核通过' },
  { id: 2, label: '审核驳回' }
]

const withdrawalStatusList = [
  { id: 0, label: '待提现' },
  { id: 1, label: '提现中' },
  { id: 2, label: '提现完成' },
  { id: 3, label: '提现失败' }
]

const reviewStatusOptions = computed(() => reviewStatusList.map((item) => ({ label: item.label, value: item.id })))

const withdrawalStatusOptions = computed(() => withdrawalStatusList.map((item) => ({ label: item.label, value: item.id })))

const queryForm = reactive<QueryStruct>({
  reviewStatus: undefined,
  orderStatus: undefined
})
const recordData = ref<CashWithdrawalRecord[]>([])
const showSearchForm = ref(true)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const disabled = ref(false)

const Permission = {
  pro: 'pow_cwl_pro'
}

const columns: TableColumnsType<CashWithdrawalRecord> = [
  { title: '申请用户', dataIndex: 'member_name', key: 'applyMemberName', width: 180 },
  { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 160 },
  { title: '会员名称', dataIndex: 'member_name', key: 'member_name', width: 180 },
  { title: '所属运营商', dataIndex: 'platform_name', key: 'platform_name', width: 180 },
  { title: '提现金额', dataIndex: 'Cash_quantity', key: 'Cash_quantity', width: 140 },
  { title: '提现方式', dataIndex: 'how', key: 'how', width: 120 },
  { title: '审核状态', dataIndex: 'Review_status', key: 'Review_status', width: 120 },
  { title: '提现状态', dataIndex: 'order_status', key: 'order_status', width: 120 },
  { title: '申请时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '操作人员', dataIndex: 'name', key: 'name', width: 160 }
]

onMounted(() => {
  getWithdrawalRecordList()
})

const converDateFormat = (time: string) => {
  return time ? time.replace('T', ' ') : time
}

const getPayWay = (way: number) => {
  return way == 1 ? '微信' : ''
}

const payStatus = (stat: number) => {
  switch (stat) {
    case 0:
      return '待提现'
    case 1:
      return '提现中'
    case 2:
      return '提现完成'
    case 3:
      return '提现失败'
    default:
      return ''
  }
}

const getProcessStatus = (stat: number) => {
  switch (stat) {
    case 0:
      return '待审核'
    case 1:
      return '审核通过'
    case 2:
      return '审核驳回'
    default:
      return '状态异常'
  }
}

const onSearch = () => {
  currentPage.value = 1
  getWithdrawalRecordList()
}

const onReset = () => {
  queryForm.reviewStatus = undefined
  queryForm.orderStatus = undefined
  currentPage.value = 1
  getWithdrawalRecordList()
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getWithdrawalRecordList()
}

const getWithdrawalRecordList = () => {
  getWithdrawalRecordListApi({
    reviewStatus: queryForm.reviewStatus,
    orderStatus: queryForm.orderStatus,
    page: currentPage.value,
    size: pageSize.value
  }).then((res: any) => {
    const data = res.data
    if (Array.isArray(data)) {
      recordData.value = data
      total.value = data.length
      return
    }

    recordData.value = data?.records || data?.list || []
    total.value = data?.total || data?.count || recordData.value.length
  })
}
</script>

<style lang="less" scoped>
.cash-withdrawal-record-page {
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
</style>
