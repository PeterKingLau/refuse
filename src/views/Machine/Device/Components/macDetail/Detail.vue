<template>
  <div class="mainPage">
    <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
      <el-tab-pane label="设备详情" name="detail">
        <el-row>
          <span> 设备名称: {{ pp.name }}</span>
        </el-row>
        <el-row class="cRow marginTop">
          <div class="grid">设备编号</div>
          <div class="grid">{{ pp.serialNumber }}</div>
          <div class="grid">设备名称</div>
          <div class="grid width2">{{ pp.name }}</div>
          <div class="grid">设备型号</div>
          <div class="grid">{{ pp.deviceType.name }}</div>
        </el-row>
        <el-row class="cRow">
          <div class="grid">设备区域</div>
          <div class="grid">{{ pp.area.areaName }}</div>
          <div class="grid">地址</div>
          <div class="grid width2">{{ pp.address }}</div>
          <div class="grid">设备状态</div>
          <div class="grid">{{ ConverStatus(pp.status) }}</div>
        </el-row>
        <el-row class="cRow">
          <div class="grid">设备imei</div>
          <div class="grid">{{ pp.imei }}</div>
          <div class="grid">运营人员</div>
          <div class="grid">{{ currentOperation.name }}</div>
          <div class="grid">维护人员</div>
          <div class="grid">{{ CurrentMaintenance.name }}</div>
          <div class="grid">是否在线</div>
          <div class="grid">{{ pp.isOnline }}</div>
        </el-row>

        <el-row class="cRow">
          <div class="grid">创建时间</div>
          <div class="grid">{{ pp.createTime }}</div>
          <div class="grid">免费时间</div>
          <div class="grid"> - </div>
          <div class="grid">累计发放积分</div>
          <div class="grid">{{ CurrentPoints }}</div>
          <div class="grid">操作人</div>
          <div class="grid">{{ currentCreateStaff.name }}</div>
        </el-row>
        <el-row class="cRow">
          <div class="grid">修改时间</div>
          <div class="grid">{{ pp.updateTime ? pp.updateTime : ' - ' }}</div>
          <div class="grid">运营规则</div>
          <div class="grid"> <el-link @click="doRule" style="color: blue">设置</el-link> </div>
          <div class="grid">清运次数</div>
          <div class="grid">{{ clearNumber }}</div>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="仓位信息" name="channel">
        <el-table ref="areaTableRef" :data="channelData" style="width: 100%">
          <el-table-column label="仓位编号" width="160" property="code" />
          <el-table-column label="垃圾类型" width="160" property="garbage_Name" />
          <el-table-column label="当前重量" width="160" property="weight" />
          <el-table-column label="最大重量" width="160" property="max_weight" />
          <el-table-column label="是否满溢" width="160" v-slot="scope">
            {{ getSpillOverStatus(scope.row.spill_over) }}
          </el-table-column>
          <el-table-column label="是否超重" width="160" v-slot="scope">
            {{ isOver(scope.row.weight, scope.row.max_weight) }}
          </el-table-column>
          <el-table-column label="操作" v-slot="scope">
            <el-link type="primary" @click="doUpdate(scope.row)">修改最大重量</el-link>
            <el-link type="primary" @click="doOpen(scope.row)" style="margin-left: 20px"
              >开启投口</el-link
            >
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="投放列表" name="list">
        <el-table :data="orderLists" style="width: 100%">
          <el-table-column label="记录编号" width="100" property="rid" />
          <el-table-column label="手机号" width="160" property="phone" />
          <el-table-column label="设备名称" width="200" property="name" />
          <el-table-column label="图片" width="100" v-slot="scope">
            <img :src="GetImageURL(scope.row.pic)" v-if="scope.row.pic" />
          </el-table-column>
          <el-table-column label="积分" width="100" property="points" />
          <el-table-column label="投放方式" width="100" property="way" />
          <el-table-column label="投放状态" width="100" property="status" />

          <el-table-column label="会员编号" width="100" property="memberId" />
          <el-table-column label="会员名称" width="100" property="nick_name" />
          <el-table-column label="投放重量(KG)" width="180" property="weight" />
          <el-table-column label="投放时间" width="200" v-slot="scope">
            {{ FormatDate(scope.row.create_time) }}
          </el-table-column>
          <el-table-column label="操作" v-slot="scope">
            <el-link @click="showOrderDetail(scope.row)" style="color: #5f9f9f">显示更多</el-link>
          </el-table-column>
        </el-table>
        <el-row>
          <el-col :span="18">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="size"
              :small="small"
              :disabled="disabled"
              layout="prev, pager, next, jumper"
              :total="total"
              @size-change="GetOrderList"
              @current-change="GetOrderList"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>

  <el-dialog v-model="UpdatedialogVisible" title="修改最大重量" width="40%">
    <el-form :model="currentChannel" label-width="120px">
      <el-form-item label="仓位编码">
        <span>{{ currentChannel.code }}</span>
      </el-form-item>
      <el-form-item label="垃圾类型">
        <span>{{ currentChannel.garbage_Name }}</span>
      </el-form-item>
      <el-form-item label="最大重量">
        <el-input-number v-model="currentChannel.maxWeight" :min="1" :max="1000" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="UpdatedialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doRev"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>

  <el-drawer v-model="detailVisible" title="投递详情" :with-header="false">
    <el-row class="row">
      <el-col :span="10" class="title">垃圾类型</el-col>
      <el-col :span="10" class="content">{{ currentOrder.garbage_Name }}</el-col>
    </el-row>
    <el-row class="row">
      <el-col :span="10" class="title">仓位</el-col>
      <el-col :span="10" class="content">{{ currentOrder.code }}</el-col>
    </el-row>
    <el-row class="row">
      <el-col :span="10" class="title">重量</el-col>
      <el-col :span="10" class="content">{{ currentOrder.weight }}KG</el-col>
    </el-row>
    <el-row class="row">
      <el-col :span="10" class="title">结果</el-col>
      <el-col :span="10" class="content">{{ currentOrder.status }}</el-col>
    </el-row>
  </el-drawer>
  ></template
>

<script setup lang="ts">
import { ref, defineProps, onMounted, Ref, onUpdated } from 'vue'
import { TabsPaneContext } from 'element-plus'
import { toRefs } from 'vue'
import { PATH_URL, service } from '@/config/axios/service'
import { ElMessage } from 'element-plus'
import { GetImageURL, FormatDate } from '@/utils/tools'

const activeName = ref('detail')
const props: any = defineProps({ row: Object })
const emit = defineEmits(['doRule'])
const pp: any = toRefs(props).row
onMounted(() => {
  getMaintenanceStaff(pp.value.maintenanceStaff)
  getOperators(pp.value.operators)
  getCreateStaff(pp.value.createStaff)
  getPoints(pp.value.id)
  getClearCount(pp.value.id)
  getChannelData(pp.value.id)
  GetOrderList()
  //   console.log('prope', pp.value.maintenanceStaff)
})

onUpdated(() => {
  GetOrderList()
  getChannelData(pp.value.id)
  getOperators(pp.value.operators)
  getCreateStaff(pp.value.createStaff)
  getPoints(pp.value.id)
  getClearCount(pp.value.id)
})

let detailVisible = ref(false)

let page = ref(1)
let size = ref(10)
let total = ref(0)
let small = ref(false)
let disabled = ref(false)
let orderLists: Ref<any[]> = ref([])

let currentOrder: Ref<any> = ref({})

const GetOrderList = () => {
  let param = {
    id: pp.value.id,
    page: page.value,
    size: size.value
  }

  service.post(PATH_URL + '/MachineMange/GetOrderListByDevice', param).then((res: any) => {
    console.log('pdd', res)
    orderLists.value = res.data.records
    total.value = res.data.total
  })
}

const handleClick = (tab: TabsPaneContext) => {
  if (tab.props.name == 'list') {
    console.log('')
  }
}

let CurrentPoints: Ref<number> = ref(0)

const getPoints = (id: number) => {
  service.get(PATH_URL + '/MachineMange/getPoints?id=' + id).then((res: any) => {
    if (res.data) CurrentPoints.value = res.data
  })
}

//获取维护人员的信息
const getMaintenanceStaff = (id: number) => {
  if (id == null) {
    return
  }

  service.get(PATH_URL + '/Permission/getPowStaff?id=' + id).then((res: any) => {
    CurrentMaintenance.value = res.data
  })
}
const getOperators = (id: number) => {
  if (id == null) {
    return
  }
  service.get(PATH_URL + '/Permission/getPowStaff?id=' + id).then((res: any) => {
    currentOperation.value = res.data
  })
}

const getCreateStaff = (id: number) => {
  if (id == null) {
    return
  }
  service.get(PATH_URL + '/Permission/getPowStaff?id=' + id).then((res: any) => {
    currentCreateStaff.value = res.data
  })
}

const getClearCount = (id: number) => {
  service.get(PATH_URL + '/MachineMange/getClearCount?id=' + id).then((res: any) => {
    clearNumber.value = res.data
  })
}

const isOver = (current: number | null, max: number | null) => {
  let temp = '未超重'

  if (current && max && current > max) {
    temp = '超重'
  }
  return temp
}

const doRule = () => {
  emit('doRule')
}

let clearNumber: Ref<any> = ref({})

let currentCreateStaff: Ref<any> = ref({})
let currentOperation: Ref<any> = ref({})
let CurrentMaintenance: Ref<any> = ref({})

const ConverStatus = (val) => {
  let temp = ''
  switch (val) {
    case 1:
      temp = '待使用'
      break
    case 2:
      temp = '使用中'
      break
    case 3:
      temp = '已禁用'
      break
    case 4:
      temp = '故障'
      break
    case 5:
      temp = '已欠费'
      break
    default:
      temp = '未知'
      break
  }

  return temp
}

const showOrderDetail = (row: any) => {
  currentOrder.value = row

  detailVisible.value = true
}

//#region  一仓一码

let channelData: Ref<any[]> = ref([])

const getChannelData = (id: number) => {
  service.get(PATH_URL + '/MachineMange/getCheannelMap?id=' + id).then((res: any) => {
    console.log('channel', res)
    channelData.value = res.data
  })
}

const doUpdate = (row: any) => {
  console.log(row)
  currentChannel.value = row
  UpdatedialogVisible.value = true
}

//返回满溢状态
const getSpillOverStatus = (spillOver: number) => {
  if (spillOver == undefined || spillOver == null) {
    return '未满溢'
  }
  return spillOver == 0 ? '未满溢' : '满溢'
}

const doOpen = (row: any) => {
  let parm = {
    deviceId: pp.value.id,
    operationId: 1,
    channelId: row.code
  }
  console.log(parm)
  service.post(PATH_URL + '/MachineMange/sendRTO', parm).then((res: any) => {
    if (res.code == 200) {
      ElMessage('指令发送成功')
    }
  })
}

const doRev = () => {
  let param = {
    channelId: currentChannel.value.id,
    maxWeight: currentChannel.value.maxWeight
  }
  service.post(PATH_URL + '/MachineMange/updateChannelMax', param).then((res: any) => {
    if (res.code == 200) {
      ElMessage('操作成功')
      getChannelData(pp.value.id)
      UpdatedialogVisible.value = false
    }
  })
}

//#endregion

//#region  修改最大重量

let currentChannel: Ref<any> = ref({})

let UpdatedialogVisible = ref(false)

//#endregion
</script>

<style scoped lang="less">
.tabs {
  width: 90%;
}

.mainPage {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.grid {
  width: 140px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #e3e3e3;
}

.width2 {
  width: 420px !important;
}

.cRow {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.title {
  font-size: 30px;
  font-weight: 800;
}

.content {
  font-size: 30px;
}

.row {
  margin-top: 20px;
}

.marginTop {
  margin-top: 20px;
}
</style>
