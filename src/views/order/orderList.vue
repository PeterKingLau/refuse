<template>
  <el-row class="rr">
    <el-form
      :model="QueryParam"
      label-width="100px"
      :inline="true"
      v-if="showSearchForm"
      class="frame"
    >
      <el-form-item label="卡号:" label-width="90">
        <el-input v-model="QueryParam.cardNo" placeholder="请输入卡号" />
      </el-form-item>

      <el-form-item label="设备编号:" label-width="90">
        <el-input v-model="QueryParam.serialNumber" placeholder="请输入设备编号" />
      </el-form-item>

      <el-form-item label="审核状态" label-width="90">
        <el-select
          v-model="QueryParam.status"
          placeholder="请选择审核状态"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in OrderStatusArray"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="投放方式" label-width="90">
        <el-select v-model="QueryParam.way" placeholder="请选择投放方式" ref="pointTpteSelectRef">
          <el-option
            v-for="item in orderModelArray"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="记录编号" label-width="90">
        <el-input v-model="QueryParam.id" placeholder="请输入记录编号" />
      </el-form-item>
      <el-form-item label="手机号" label-width="90">
        <el-input v-model="QueryParam.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="会员编号" label-width="90">
        <el-input v-model="QueryParam.memberId" placeholder="请输入会员编号" />
      </el-form-item>
      <el-form-item label="会员昵称" label-width="90">
        <el-input v-model="QueryParam.nickName" placeholder="请输入会员昵称" />
      </el-form-item>

      <el-form-item label="投放时间" label-width="90">
        <el-date-picker
          v-model="queryTime"
          type="daterange"
          unlink-panels
          range-separator="到"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="default"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="onSearch" v-hasPermi="Permission.sec">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="btn" @click="onReset">
          <el-icon class="el-icon--left"><RefreshRight /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-row>

  <!-- 操作按钮-->
  <el-row>
    <el-col :span="12">
      <el-button type="primary" class="btn" @click="ExportOrderList">
        <el-icon><Plus /> </el-icon>
        导出</el-button
      >

      <el-button type="success" class="btn" @click="onOpenSetDelay"
        ><el-icon><EditPen /></el-icon>设置积分到账时间</el-button
      >
      <el-button type="danger" class="btn" v-if="false"
        ><el-icon><Close /></el-icon>删除</el-button
      >
    </el-col>

    <el-col :span="12" style="text-align: right">
      <el-tooltip content="隐藏搜索" placement="top-start">
        <el-button circle @click="OnClickOfShowForm">
          <el-icon><Search /></el-icon
        ></el-button>
      </el-tooltip>
      <el-tooltip content="刷新" placement="top-start">
        <el-button circle @click="onPageRest">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </el-tooltip>
    </el-col>
  </el-row>

  <el-divider />

  <el-row>
    <el-table ref="areaTableRef" :data="OrderList" style="width: 100%">
      <el-table-column label="记录编号" width="100" property="id" />

      <el-table-column label="设备编号" width="160" property="serialNumber" />
      <el-table-column label="设备名称" width="100" property="name" />
      <el-table-column label="会员编号" width="100" property="memberId" />
      <el-table-column label="会员昵称" width="160" property="nickName" />
      <el-table-column label="投放方式" width="160" property="way" />

      <el-table-column label="积分" width="180" property="points" />
      <el-table-column label="会员手机" width="180" property="phone" />
      <el-table-column label="投放重量" width="180" property="weight" />
      <el-table-column label="投放时间" width="180" v-slot="scope">
        {{ converDateFormat(scope.row.createTime) }}
      </el-table-column>
      <el-table-column label="审核状态" width="180" property="status" />

      <el-table-column label="操作" v-slot="scope" width="150">
        <div class="buttonOfTables">
          <el-link type="primary" @click="showDetail(scope.row)" v-hasPermi="Permission.quy"
            >查看详情</el-link
          >

          <el-link
            type="primary"
            @click="doWork(scope.row)"
            v-if="getStatus(scope.row)"
            v-hasPermi="Permission.exa"
            >审核</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row>
    <el-col :span="18">
      <el-pagination
        v-model:current-page="QueryParam.page"
        v-model:page-size="QueryParam.size"
        :small="small"
        :disabled="disabled"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="onSearch"
        @current-change="onSearch"
      />
    </el-col>
  </el-row>

  <el-dialog v-model="detailShow" title="投放详情" width="50%">
    <el-row class="recordRow">
      <el-col :span="8">
        <span>记录编号:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.id }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>设备名称:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.name }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>设备编号:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.serialNumber }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>会员编号:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.memberId }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>会员昵称:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.nickName }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>投放方式:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.way }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>手机号:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.phone }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>仓位号:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.channel }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>垃圾类型:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.garbageName }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>投放重量:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.weight }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>积分:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.points }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>投放状态:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ currentOrderList.status }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>投放时间:</span>
      </el-col>
      <el-col :span="8"
        ><span>{{ converDateFormat(currentOrderList.createTime) }}</span>
      </el-col>
    </el-row>

    <el-row class="recordRow">
      <el-col :span="8">
        <span>投放照片:</span>
      </el-col>
      <el-col :span="8"> <img :src="getImageURL(currentOrderList.pic)" class="img" /> </el-col>
    </el-row>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="detailShow = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="handleShow" title="审核投放记录" width="30%">
    <el-radio-group v-model="workResult" class="ml-4">
      <el-radio :label="1" size="large">成功</el-radio>
      <el-radio :label="2" size="large">违规</el-radio>
    </el-radio-group>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleShow = false">取消</el-button>
        <el-button type="primary" @click="doHandle()"> 确认</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="setDelaydialogVisible" title="设置自动审核时间" width="30%">
    <el-row class="content">
      <el-col :span="8">延时到账时间：</el-col>
      <el-col :span="16">
        <el-input-number v-model="delayData" :min="1" :max="9999" />
      </el-col>
    </el-row>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onDelayClose">取消</el-button>
        <el-button type="primary" @click="onSetDelay"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { Ref, ref, onMounted, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import axios from 'axios'

let onOpenSetDelay = () => {
  setDelaydialogVisible.value = true
}

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}
let delayData: Ref<number> = ref(168)
const onSetDelay = () => {
  service
    .post(
      PATH_URL + '/sysSetting/updateDelay',
      qs.stringify({ delay: delayData.value }, { arrayFormat: 'brackets' })
    )
    .then(() => {
      ElMessage('操作成功')
      getDelay()

      setDelaydialogVisible.value = false
    })
}

const getDelay = () => {
  service.get(PATH_URL + '/sysSetting/getOrderDelay').then((res: any) => {
    delayData.value = res.data.delay
  })
}

const onDelayClose = () => {
  setDelaydialogVisible.value = false
}

let setDelaydialogVisible = ref(false)

//#region  数据结构定义

const Permission = ref({
  quy: 'ord_ord_quy',
  exa: 'ord_ord_exa',
  sec: 'ord_ord_sec'
})

let total = ref(0)
let small = ref(false)
let disabled = ref(false)
let detailShow = ref(false)
let handleShow = ref(false)

let workId = ref(0) //要审核的记录id
let workResult = ref(0) //审核结果

let currentOrderList: Ref<OrderListStruct> = ref({
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

interface OrderListStruct {
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

interface orderStatusStruct {
  id: number
  label: string
}

let showSearchForm = ref(true)

//#endregion

//#region 变量定义

let OrderStatusArray: orderStatusStruct[] = [
  {
    id: 0,
    label: '未审核'
  },
  {
    id: 1,
    label: '已审核'
  },
  {
    id: 2,
    label: '违规'
  }
]

let orderModelArray: orderStatusStruct[] = [
  {
    id: 0,
    label: '匿名投放'
  },
  {
    id: 1,
    label: '刷卡'
  },
  {
    id: 2,
    label: '扫码'
  },
  {
    id: 3,
    label: '手机'
  },
  {
    id: 4,
    label: '刷脸'
  }
]

let QueryParam: Ref<QueryStruct> = ref({
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

const queryTime = ref('')

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})
const onSearch = () => {
  getOrderList()
}

const showDetail = (row: OrderListStruct) => {
  console.log('row', row)
  currentOrderList.value = row
  detailShow.value = true
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const getStatus = (row: any): boolean => {
  return row.ss == 0
}

//处理审核
const doHandle = () => {
  let param = {
    orderId: workId.value,
    result: workResult.value
  }

  service.post(PATH_URL + '/MachineMange/doWork', param).then((res: any) => {
    if (res.code == 200) {
      ElMessage('操作成功')
      handleShow.value = false
    }
    getOrderList()
  })
}

const doWork = (row: any) => {
  workId.value = row.id
  workResult.value = 1

  handleShow.value = true
}

const onReset = () => {
  queryTime.value = ''
  QueryParam.value.cardNo = ''
  QueryParam.value.id = undefined
  QueryParam.value.memberId = ''
  QueryParam.value.nickName = ''
  QueryParam.value.phone = ''
  QueryParam.value.serialNumber = ''
  QueryParam.value.status = undefined
  QueryParam.value.way = undefined
}

let converDateFormat = (time: string) => {
  if (time) {
    return time.replace('T', ' ')
  }
  return time
}

let OrderList: Ref<OrderListStruct[]> = ref([])

//#endregion

//#region  获取记录列表
const getOrderList = () => {
  QueryParam.value.sTime = queryTime.value[0]
  QueryParam.value.etime = queryTime.value[1]
  console.log('QueryParam', QueryParam)
  service.post(PATH_URL + '/MachineMange/getOrderList', QueryParam.value).then((res: any) => {
    OrderList.value = res.data.records
    total.value = res.data.total
  })
}

//#endregion

//#region onMounted
onMounted(() => {
  getOrderList()
  getDelay()
})

const ExportOrderList = () => {
  QueryParam.value.sTime = queryTime.value[0]
  QueryParam.value.etime = queryTime.value[1]

  axios({
    method: 'post',
    url: PATH_URL + '/MachineMange/ExportOrderList',
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token')
    },
    data: QueryParam.value
  }).then((response) => {
    var blob = new Blob([response.data], { type: 'application/vnd.ms-excel' }) //根据实际情况设置type
    var link = document.createElement('a')
    var body = document.querySelector('body')

    link.href = window.URL.createObjectURL(blob)
    link.download = '导出投放列表.xls'

    // fix Firefox
    link.style.display = 'none'
    body?.appendChild(link)

    link.click()
    body?.removeChild(link)

    window.URL.revokeObjectURL(link.href)
  })
}

//#endregion
</script>

<style scoped lang="less">
.buttonOfTables {
  .el-link {
    margin-left: 10px;
  }
}

.img {
  width: 200px;
  height: 200px;
}

.content {
  font-size: 18px;
}
</style>
