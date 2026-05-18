<template>
  <el-form :model="QueryParm" label-width="100px" :inline="true" v-if="showSearchForm">
    <el-select v-model="QueryParm.status" @change="onchange" placeholder="请选择审核状态">
      <el-option v-for="item in statusOption" :key="item.id" :label="item.label" :value="item.id" />
    </el-select>
  </el-form>
  <el-divider />

  <el-row>
    <el-table
      ref="TableRef"
      :data="logData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="记录流水号" width="100" property="id" />
      <el-table-column label="申请用户" width="200" property="member_name" />
      <el-table-column label="用户编号" width="100" property="member_id" />
      <el-table-column label="手机号码" width="200" property="phone" />
      <el-table-column label="会员名称" width="200" property="member_name" />
      <el-table-column label="所属运营商" width="200" property="platform_name" />
      <el-table-column label="提现金额" width="200" property="Cash_quantity" />
      <el-table-column label="提现方式" width="150" v-slot="scope">
        {{ getPayWay(scope.row.how) }}
      </el-table-column>
      <el-table-column label="审核状态" width="150" v-slot="scope">
        {{ getProcessStatus(scope.row.Review_status) }}
      </el-table-column>
      <el-table-column label="提现状态" width="150" v-slot="scope">
        {{ payStatus(scope.row.order_status) }}
      </el-table-column>
      <el-table-column label="申请时间" width="150" v-slot="scope">
        {{ converDateFormat(scope.row.create_time) }}
      </el-table-column>
      <el-table-column label="操作人员" width="200" property="name" />
      <el-table-column label="操作" width="200" v-slot="scope" fixed="right">
        <div class="buttonOfTables">
          <el-button link type="primary" size="small" @click="Approved(scope.row.id)"
            >审核通过</el-button
          >
          <el-button link type="primary" size="small">审核驳回</el-button>
        </div>
      </el-table-column>
    </el-table>
  </el-row>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ref, onMounted, Ref } from 'vue'
import { ElSelect, ElMessageBox, ElMessage } from 'element-plus'
import qs from 'qs'
const statusOption = [
  { id: 0, label: '待审核' },
  { id: 1, label: '审核通过' },
  { id: 2, label: '审核驳回' }
]

interface QueryStruct {
  deparmentId: number | undefined
  status: number | undefined
}

let TableRef = ref({})
let QueryParm: Ref<QueryStruct> = ref({
  deparmentId: 0,
  status: 0
})
let logData: any = ref([])
let showSearchForm = ref(true)
const handleSelectionChange = () => {}

onMounted(() => {
  QueryParm.value.status = 0
  getRecord()
})

//审核驳回
const reject = (row: any) => {}
//审核通过
const Approved = (row: any) => {
  ElMessageBox.confirm('你确定通过这条取现申请记录?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('row', row)
    let url = '/mem/memCashWithdrawal/Approved?id=' + row
    service.get(PATH_URL + url).then((res: any) => {
      if (res.data.code == 200) {
        ElMessage('操作成功')
      }
    })
  })
}

let converDateFormat = (time: string) => {
  if (time) {
    return time.replace('T', ' ')
  }
  return time
}

const getPayWay = (way: any) => {
  if (way == 1) {
    return '微信'
  }
}

const payStatus = (stat: any) => {
  let desc = ''
  switch (stat) {
    case 0:
      desc = '待提现'
      break
    case 1:
      desc = '提现中'
      break
    case 2:
      desc = '提现完成'
      break
    case 3:
      desc = '提现失败'
      break
  }
  return desc
}

const Permission = ref({
  pro: 'pow_cwl_pro',
  rej: 'pow_cwl_rej'
})

const getProcessStatus = (stat: any) => {
  let desc = ''
  switch (stat) {
    case 0:
      desc = '待审核'
      break
    case 1:
      desc = '审核通过'
      break
    case 2:
      desc = '审核驳回'
      break
    default:
      desc = '状态异常'
      break
  }
  return desc
}
const onchange = () => {
  getRecord()
}

const getRecord = () => {
  let url = '/mem/memCashWithdrawal/GetCashWithdrawalList'
  service
    .post(
      PATH_URL + url,
      qs.stringify(
        {
          status: QueryParm.value.status
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res) => {
      console.log('res', res.data)
      logData.value = res.data
    })
}
</script>

<style lang="less" scoped></style>
