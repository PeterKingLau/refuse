<template>
  <div class="cash-withdrawal-page">
    <AForm v-if="showSearchForm" :model="QueryParm" layout="horizontal" class="search-form">
      <AFormItem label="审核状态" class="search-form-item">
        <ASelect v-model:value="QueryParm.status" :options="statusOptions" allow-clear placeholder="请选择审核状态" @change="onchange" />
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

    <ATable row-key="id" :columns="auditColumns" :data-source="auditData" :pagination="false" :scroll="{ x: 2100 }" bordered>
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

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action" @click="Approved(record.id)" v-hasPermi="Permission.pro">审核通过</AButton>
            <AButton type="link" danger class="table-action" @click="reject(record)" v-hasPermi="Permission.rej">审核驳回</AButton>
          </ASpace>
        </template>
      </template>
    </ATable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Button as AButton, Divider as ADivider, Form as AForm, FormItem as AFormItem, Modal as AModal, Select as ASelect, Space as ASpace, Table as ATable, message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { approveCashWithdrawalApi, getCashWithdrawalListApi } from '@/api/maintenance/cashWithdrawal'
import { Icon } from '@/components/Icon'

interface QueryStruct {
  deparmentId?: number
  status?: number
}

interface CashWithdrawalRecord {
  [key: string]: any
  id: number
}

const statusOption = [
  { id: 0, label: '待审核' },
  { id: 1, label: '审核通过' },
  { id: 2, label: '审核驳回' }
]

const statusOptions = computed(() => statusOption.map((item) => ({ label: item.label, value: item.id })))

const QueryParm = reactive<QueryStruct>({
  deparmentId: 0,
  status: 0
})
const auditData = ref<CashWithdrawalRecord[]>([])
const showSearchForm = ref(true)

const Permission = ref({
  pro: 'pow_cwl_pro',
  rej: 'pow_cwl_rej'
})

const baseColumns: TableColumnsType<CashWithdrawalRecord> = [
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

const auditColumns: TableColumnsType<CashWithdrawalRecord> = [...baseColumns, { title: '操作', key: 'action', width: 180, fixed: 'right' }]

onMounted(() => {
  QueryParm.status = 0
  getRecord()
})

const reject = (_row: Record<string, any>) => {}

const Approved = (id: number) => {
  AModal.confirm({
    title: '提示',
    content: '确定通过这条取现申请记录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const res: any = await approveCashWithdrawalApi(id)
      if (res.code == 200 || res.data?.code == 200) {
        message.success('操作成功')
        getRecord()
      }
    }
  })
}

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

const onchange = () => {
  getRecord()
}

const onSearch = () => {
  getRecord()
}

const onReset = () => {
  QueryParm.status = 0
  getRecord()
}

const getRecord = () => {
  getCashWithdrawalListApi({
    status: QueryParm.status
  }).then((res: any) => {
    auditData.value = res.data || []
  })
}
</script>

<style lang="less" scoped>
.cash-withdrawal-page {
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
  gap: 4px;
}
</style>
