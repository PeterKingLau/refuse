<template>
  <el-row class="rr">
    <el-form
      :model="SearchFormData"
      label-width="100px"
      :inline="true"
      v-if="showSearchForm"
      class="frame"
    >
      <el-form-item label="设备编号:" label-width="90">
        <el-input v-model="SearchFormData.dNumber" placeholder="请输入设备编号" />
      </el-form-item>

      <el-form-item label="设备名称:" label-width="90">
        <el-input v-model="SearchFormData.dName" placeholder="请输入设备名称" />
      </el-form-item>

      <el-form-item label="设备区域" label-width="90">
        <el-select
          v-model="SearchFormData.dArea"
          placeholder="请选择设备区域"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in deviceAreaArray"
            :key="item.id"
            :label="item.areaName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备型号" label-width="90">
        <el-select
          v-model="SearchFormData.dType"
          placeholder="请选择设备型号"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in deviceTypeArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备状态" label-width="90">
        <el-select
          v-model="SearchFormData.dStatus"
          placeholder="请选择设备状态"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in deviceStatusArray"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="在线状态" label-width="90">
        <el-select
          v-model="SearchFormData.dOnLine"
          placeholder="请选择在线状态"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in OnLineOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
  <el-row>
    <el-col :span="18" />
    <el-col :span="6" style="text-align: right">
      <el-tooltip content="隐藏搜索" placement="top-start">
        <el-button circle @click="showSearchForm = !showSearchForm">
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
    <el-table ref="areaTableRef" :data="TableData" style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column label="设备编号" width="160" property="serialNumber" />
      <el-table-column label="设备名称" width="100" property="name" />

      <el-table-column label="设备地址" width="160" property="address" />
      <el-table-column label="是否在线" width="160" property="isOnline" />
      <el-table-column label="最后在线时间" width="160" property="onlineTime" />
      <el-table-column label="型号名称" width="180" property="deviceType.name" />
      <el-table-column label="设备sn" width="180" property="imei" />

      <el-table-column label="状态" width="180" v-slot="scope">
        {{ ConverStatus(scope.row.status) }}
      </el-table-column>

      <el-table-column label="操作" v-slot="scope" width="150">
        <div class="buttonOfTables">
          <el-link type="primary" @click="channelSet(scope.row)">子设备</el-link>
        </div>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row>
    <el-col :span="18">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :small="small"
        :disabled="disabled"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleSizeChange"
      />
    </el-col>
  </el-row>

  <!-- 操作弹窗-->
  <el-dialog v-model="operationVisible" title="设备操作" width="80%">
    <el-row>
      <el-col :span="5">
        <div class="left">
          <div class="title">仓位</div>
          <div
            class="channleBox"
            v-for="item in currentDeviceChannelList"
            :key="item"
            @click="setBg(item)"
            :class="{ selectSytle: selectItem == item }"
          >
            <span class="channelItem">{{ item }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="19">
        <div class="right">
          <el-tabs v-model="activeName" class="demo-tabs">
            <el-tab-pane label="设备属性" name="first">
              <el-table height="400" :data="currentChannelInfo">
                <el-table-column label="属性名称" width="300" align="center" property="label" />
                <el-table-column label="属性值" width="280" align="center" property="content" />
                <el-table-column label="更新时间" align="center" property="time" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="监控指令" name="second">
              <el-table :data="RTOArray" stripe style="width: 90%" height="400">
                <el-table-column label="指令名称" property="label" width="300" align="center" />

                <el-table-column
                  label="创建时间"
                  property="createTime"
                  width="180"
                  align="center"
                />
                <el-table-column label="操作" v-slot="scope" width="300" align="center">
                  <div class="buttonOfTables">
                    <el-link type="primary" @click="doSend(scope.row)" v-hasPermi="Permission.sen"
                      >发送</el-link
                    >
                    <el-link
                      type="primary"
                      @click="sendRecord(scope.row)"
                      v-hasPermi="Permission.quy"
                      >发送记录</el-link
                    >
                  </div>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="配置外设" name="third">
              <div class="configBox">
                <div class="extearnalUnitBox">
                  <div class="allChecked">
                    <el-checkbox v-model="selectAll" @change="unitSelectAll()"> 全选</el-checkbox>
                  </div>
                  <template v-for="item in ExternalUnitArray" :key="item">
                    <el-checkbox v-model="item.checked">{{ item.label }}</el-checkbox>
                  </template>
                </div>
                <div class="paramrenterBox">
                  <el-row class="paramList">
                    <el-col :span="8">积分配置</el-col>
                    <el-col :span="8"
                      ><el-switch v-model="currentParameter.configurePoints" class="ml-2"
                    /></el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">是否更新参数</el-col>
                    <el-col :span="8"
                      ><el-switch v-model="currentParameter.updateParameter" class="ml-2"
                    /></el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">是否更新设备有效性</el-col>
                    <el-col :span="8"
                      ><el-switch v-model="currentParameter.availability" class="ml-2"
                    /></el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">信息上报周期</el-col>
                    <el-col :span="8">
                      <el-input-number
                        v-model="currentParameter.transmissionPeriod"
                        placeholder="请输入"
                        :min="0"
                        :max="254"
                      />
                    </el-col>
                    <el-col :span="3">秒</el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">烟感上报时间间隔</el-col>
                    <el-col :span="8">
                      <el-input-number v-model="currentParameter.smog" placeholder="请输入" />
                    </el-col>
                    <el-col :span="3">秒</el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">人体感应延时时间</el-col>
                    <el-col :span="8">
                      <el-input-number
                        v-model="currentParameter.deferred"
                        placeholder="请输入"
                        :min="0"
                        :max="254"
                      />
                    </el-col>
                    <el-col :span="3">秒</el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">夹手强制性退出时间</el-col>
                    <el-col :span="8">
                      <el-input-number
                        v-model="currentParameter.gripper"
                        placeholder="请输入"
                        :min="0"
                        :max="254"
                      />
                    </el-col>
                    <el-col :span="3">秒</el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">输入状态检测时间</el-col>
                    <el-col :span="8">
                      <el-input-number
                        v-model="currentParameter.inputCheck"
                        placeholder="请输入"
                        :min="0"
                        :max="254"
                      />
                    </el-col>
                    <el-col :span="3">秒</el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">开关门时间</el-col>
                    <el-col :span="8">
                      <el-input-number v-model="currentParameter.close" placeholder="请输入" />
                    </el-col>
                    <el-col :span="3">秒</el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">推杆保持时间</el-col>
                    <el-col :span="8">
                      <el-input-number
                        v-model="currentParameter.push"
                        placeholder="请输入"
                        :min="0"
                        :max="254"
                      />
                    </el-col>
                    <el-col :span="3">秒</el-col>
                  </el-row>

                  <el-row class="paramList">
                    <el-col :span="8">应用到其他仓位</el-col>
                    <el-col :span="8">
                      <el-switch v-model="currentParameter.isAll" class="ml-2" />
                    </el-col>
                  </el-row>
                </div>
                <div class="buttonBox">
                  <el-button type="primary" @click="doSendParam()" v-hasPermi="Permission.rev"
                    >确定</el-button
                  >
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, inject } from 'vue'
import { PATH_URL, service } from '@/config/axios/service'
import { ElMessage } from 'element-plus'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const Permission = ref({
  sen: 'min_equ_sen',
  rev: 'min_equ_rev',
  quy: 'min_equ_quy',
  sec: 'min_equ_sec'
})

let small = ref(false)
let disabled = ref(false)
let total = ref(0)

let selectItem = ref(1)
let activeName = ref('first')

//#region  数据结构
interface SearchDataStruct {
  dNumber: string | null
  dName: string | null
  dArea: number | null
  dType: number | null
  dImei: number | null
  dStatus: number | null
  dOnLine: number | null
  dProductType: number | null
}

//参数设置 数据结构
interface ParameterStruct {
  id: number
  channel: number
  deferred: number
  smog: number
  gripper: number
  close: number
  push: number
  deviceId: number
  configurePoints: number | boolean
  updateParameter: number | boolean
  availability: number | boolean
  transmissionPeriod: number
  inputCheck: number
  isAll: boolean
}

interface RTOStruct {
  id: number
  label: string
  createTime: string
}

interface DeviceAreaStruct {
  id: number
  areaName: string
}

interface DeviceTypeStrcut {
  id: number
  name: string
}

interface DeviceStatusStruct {
  id: number
  label: string
}

interface ExternalUnitStruct {
  id: number
  label: string
  checked: number | boolean
}

const OnLineOption = [
  {
    value: 0,
    label: '离线'
  },
  {
    value: 1,
    label: '在线'
  }
]

const doSendParam = () => {
  currentParameter.value.channel = selectItem.value
  currentParameter.value.deviceId = currentDevice.id

  if (currentParameter.value.isAll) {
    currentParameter.value.channel = 0
  }

  service
    .post(PATH_URL + '/MachineMange/sendParameter', currentParameter.value)
    .then((res: any) => {
      console.log(res)
      if (res.code == 200) {
        ElMessage('操作成功')
      }
    })
}

const defaultParameter: ParameterStruct = {
  id: 0,
  channel: 0,
  deferred: 0,
  smog: 0,
  gripper: 0,
  close: 0,
  push: 0,
  deviceId: 0,
  configurePoints: false,
  updateParameter: false,
  availability: false,
  transmissionPeriod: 0,
  inputCheck: 0,
  isAll: false
}

const getParameter = () => {
  let parm = {
    deviceId: currentDevice.id,
    channel: selectItem.value
  }

  service.post(PATH_URL + '/MachineMange/getChannelInfo', parm).then((res: any) => {
    console.log('channelInfo', res)
    console.log('channel', res)
    currentChannelInfo.value = []
    let data = res.data

    if (!data) {
      return
    }

    let cm: any[] = []

    let dp = { label: '', content: '', time: '' }

    dp.label = '链接状态'
    dp.content = !data ? '未知' : data.linkStatus == 1 ? '正常' : '异常'
    dp.time = !data ? '未知' : data.updateTime

    cm.push(dp)

    let version = { label: '', content: '', time: '' }
    version.label = '软件版本'
    version.content = !data ? '未知' : data.version
    version.time = !data ? '未知' : data.updateTime
    cm.push(version)

    let spillOver = { label: '', content: '', time: '' }

    spillOver.label = '是否满溢'
    spillOver.content = !data ? '未知' : data.spillOver == 0 ? '未满溢' : '满溢'
    spillOver.time = !data ? '未知' : data.updateTime
    cm.push(spillOver)

    let doorLock = { label: '', content: '', time: '' }
    doorLock.label = '清运门锁'
    doorLock.content = data.doorLock == 0 ? '关闭' : '开启'
    doorLock.time = data.updateTime
    cm.push(doorLock)

    let fireStatus = { label: '', content: '', time: '' }
    fireStatus.label = '灭火器状态'
    fireStatus.content = data.fireStatus == 0 ? '未启用' : '启用'
    fireStatus.time = data.updateTime
    cm.push(fireStatus)

    let ozone = { label: '', content: '', time: '' }
    ozone.label = '臭氧'
    ozone.content = data.ozone == 0 ? '未开启' : '开启'
    ozone.time = data.updateTime
    cm.push(ozone)

    let antiTrap = { label: '', content: '', time: '' }
    antiTrap.label = '防夹手'
    antiTrap.content = data.antiTrap == 0 ? '未开启' : '开启'
    antiTrap.time = data.updateTime
    cm.push(antiTrap)

    let smog = { label: '', content: '', time: '' }
    smog.label = '烟雾'
    smog.content = data.smog == 0 ? '未开启' : '开启'
    smog.time = data.updateTime
    cm.push(smog)

    let humidity = { label: '', content: '', time: '' }
    humidity.label = '湿度'
    humidity.content = data.humidity
    humidity.time = data.updateTime
    cm.push(humidity)

    let temperature = { label: '', content: '', time: '' }
    temperature.label = '温度'
    temperature.content = data.temperature
    temperature.time = data.updateTime
    cm.push(temperature)

    let weight = { label: '', content: '', time: '' }
    weight.label = '重量'
    weight.content = data.weight
    weight.time = data.updateTime
    cm.push(weight)

    currentChannelInfo.value = cm
    console.log('currentChannelInfo', currentChannelInfo)
  })

  service.post(PATH_URL + '/MachineMange/getDeviceParameter', parm).then((res: any) => {
    console.log('getParameter', res.data)
    if (res.data) {
      currentParameter.value = res.data
      if (currentParameter.value.channel == 0) {
        currentParameter.value.isAll = true
      }
    } else {
      currentParameter.value = defaultParameter
    }
    console.log('currentParameter', currentParameter)
  })
}

const setBg = (item: any) => {
  selectItem.value = item
  getParameter()
}

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

let currentChannelInfo: Ref<any[]> = ref([])

const channelSet = (row: any) => {
  operationVisible.value = true
  let count: number = row.deviceType.warehouse
  currentDeviceChannelList.value = []
  for (let i = 1; i <= count; i++) {
    currentDeviceChannelList.value.push(i)
  }
  currentDevice = row
  selectItem.value = 1
  getParameter()
}

//#endregion

// 外部单元列表
let ExternalUnitArray: Ref<ExternalUnitStruct[]> = ref([])
let selectAll = ref(false)
const getExternalUnit = () => {
  service.get(PATH_URL + '/MachineMange/getExternalUnit').then((res: any) => {
    ExternalUnitArray.value = res.data
    console.log('ExtrrnalUnit', ExternalUnitArray.value)
  })
}

//点击了全选
const unitSelectAll = () => {
  ExternalUnitArray.value.forEach((element) => {
    element.checked = selectAll.value
  })
}

let currentParameter: Ref<ParameterStruct> = ref({
  id: 0,
  channel: 0,
  deferred: 0,
  smog: 0,
  gripper: 0,
  close: 0,
  push: 0,
  deviceId: 0,
  configurePoints: false,
  updateParameter: false,
  availability: false,
  transmissionPeriod: 0,
  inputCheck: 0,
  isAll: false
})

let currentDevice: any

let TableData = ref([])

let currentDeviceChannelList: Ref<number[]> = ref([])

let SearchFormData: Ref<SearchDataStruct> = ref({
  dNumber: '',
  dName: '',
  dArea: null,
  dType: null,
  dImei: null,
  dStatus: null,
  dOnLine: null,
  dProductType: null
})
let operationVisible = ref(false)
let RTOArray: Ref<RTOStruct[]> = ref([])

let deviceAreaArray: Ref<DeviceAreaStruct[]> = ref([])
let deviceTypeArray: Ref<DeviceTypeStrcut[]> = ref([])
let deviceStatusArray: Ref<DeviceStatusStruct[]> = ref([])

let showSearchForm = ref(true)
let currentPage = ref(1)
let pageSize = ref(5)

onMounted(() => {
  getDeviceData()
  getDevcieType()
  getDeviceStatus()
  getDeviceArea()
  getRTO()
  getExternalUnit()
})

const doSend = (row: any) => {
  let parm = {
    deviceId: currentDevice.id,
    operationId: row.id,
    channelId: selectItem.value
  }

  service.post(PATH_URL + '/MachineMange/sendRTO', parm).then((res: any) => {
    if (res.code == 200) {
      ElMessage('操作成功')
    }
  })
}

const sendRecord = (row: any) => {
  console.log(row)
}

const handleSizeChange = () => {
  getDeviceData()
}

const onSearch = () => {
  getDeviceData()
}

const onReset = () => {
  SearchFormData.value.dNumber = ''
  SearchFormData.value.dName = ''
  SearchFormData.value.dArea = null
  SearchFormData.value.dType = null

  SearchFormData.value.dStatus = null
  SearchFormData.value.dOnLine = null
}

const getDeviceStatus = () => {
  service.get(PATH_URL + '/MachineMange/getDeviceStatus').then((res) => {
    deviceStatusArray.value = res.data
  })
}

const getDeviceArea = () => {
  service.post(PATH_URL + '/Permission/getDeviceArea').then((res) => {
    deviceAreaArray.value = res.data
  })
}

const getDeviceData = () => {
  let parm = {
    id: SearchFormData.value.dNumber,
    deviceName: SearchFormData.value.dName,
    deviceArea: SearchFormData.value.dArea,
    deviceType: SearchFormData.value.dType,
    onLine: SearchFormData.value.dOnLine,
    status: SearchFormData.value.dStatus,
    page: currentPage.value,
    size: pageSize.value
  }

  service.post(PATH_URL + '/MachineMange/getDevice', parm).then((res) => {
    console.log(res)
    TableData.value = res.data.records
    total.value = res.data.total
  })
}

const getDevcieType = () => {
  service.post(PATH_URL + '/MachineMange/getDeviceType').then((res) => {
    deviceTypeArray.value = res.data
  })
}

const getRTO = () => {
  service.get(PATH_URL + '/MachineMange/getRTO').then((res: any) => {
    console.log(res)
    RTOArray.value = res.data
  })
}
</script>

<style scoped lang="less">
@dialog-width: 100%;
@dialog-height: 60vh;

.paramList {
  width: 100%;
  height: 2rem;
  line-height: 2rem;
}

.configBox {
  display: flex;
  width: 100%;
  height: @dialog-height;
  flex-direction: row;
  justify-content: flex-start;

  .extearnalUnitBox {
    display: flex;

    height: 50vh;
    flex: 2;
    flex-direction: column;
    justify-content: flex-start;
  }

  .paramrenterBox {
    flex: 6;

    height: 50vh;
  }

  .buttonBox {
    flex: 2;

    height: 50vh;
  }
}

.buttonBox {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-content: center;
}

.buttonOfTables {
  .el-link {
    margin-left: 10px;
  }
}

.left {
  display: flex;
  width: @dialog-width;

  height: @dialog-height;
  padding-right: 20px;
  padding-left: 20px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.right {
  width: @dialog-width;

  height: @dialog-height;
  padding-right: 20px;
  padding-left: 20px;
}

.channleBox {
  width: 100%;
  height: 2rem;
  margin-top: 10px;

  text-align: center;
}

.channelItem {
  width: 1rem;
  height: 2rem;
  line-height: 2rem;
  border-radius: 0.4rem;
}

.selectSytle {
  background-color: yellowgreen;
}

.title {
  width: 100%;
  height: 5vh;
  line-height: 5vh;
  text-align: center;
}
</style>
