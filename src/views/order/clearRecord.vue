<template>
  <el-row>
    <el-form :model="QueryParm" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="运营商：">
        <el-select v-model="QueryParm.department">
          <el-option
            v-for="item in departmentArray"
            :key="item.id"
            :label="item.platform_name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备区域：">
        <el-select v-model="QueryParm.deviceArea">
          <el-option
            v-for="item in deviceAreaArray"
            :key="item.id"
            :label="item.areaName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="清运员卡号：">
        <el-input v-model="QueryParm.cardId" class="eInput" placeholder="请输入卡号" />
      </el-form-item>

      <el-form-item label="设备编号：">
        <el-input v-model="QueryParm.serialNumber" class="eInput" placeholder="请输入设备编号" />
      </el-form-item>

      <el-form-item label="记录编号：">
        <el-input v-model="QueryParm.id" class="eInput" placeholder="请输入记录编号" />
      </el-form-item>

      <el-form-item label="手机号：">
        <el-input v-model="QueryParm.phone" class="eInput" placeholder="请输入清运员手机号" />
      </el-form-item>

      <el-form-item label="操作时间:">
        <el-date-picker
          v-model="operationTime"
          type="daterange"
          range-separator="到"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="default"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="getTableData">
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
      <!-- <el-button type="primary" class="btn" @click="OnClickAdd" v-if="false">
          <el-icon><Plus /> </el-icon>
          新增</el-button
        > -->

      <el-button type="danger" class="btn" @click="exportExcel" :disabled="disableRemove"
        ><el-icon><Close /></el-icon>导出</el-button
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
    <el-table
      ref="areaTableRef"
      :data="logData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="记录编号" width="100" property="id" />

      <el-table-column label="清运员卡号" width="160" property="card_id" />
      <el-table-column label="运营商" width="160" property="Platform_name" />
      <el-table-column label="设备区域" width="160" property="area_name" />

      <el-table-column label="设备名称" width="100" property="name" />
      <el-table-column label="设备编号" width="160" property="serial_number" />

      <el-table-column label="清运状态" width="180" v-slot="scope">
        {{ scope.row.status == 1 ? '已清运' : '未清运' }}
      </el-table-column>
      <el-table-column label="仓位" width="60" property="channel" />
      <el-table-column label="垃圾类型" width="160" property="garbage_name" />
      <el-table-column label="重量" width="60" property="weight" />
      <el-table-column label="清运时间" v-slot="scope">
        {{ converDateFormat(scope.row.create_time) }}
      </el-table-column>
    </el-table>
  </el-row>
  <el-row>
    <el-col :span="18">
      <el-pagination
        v-model:current-page="QueryParm.page"
        v-model:page-size="QueryParm.size"
        :small="small"
        :disabled="disabled"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ref, Ref, onMounted, unref, inject } from 'vue'
const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

let operationTime = ref([])

let disableRemove = ref(true)

let small = ref(false)
let disabled = ref(false)
let total = ref(0)

let departmentArray: any = ref([])
let deviceAreaArray: any = ref([])

onMounted(() => {
  getDepartment()

  getDeviceArea()
  getTableData()
})

let logData: any = ref([])

let showSearchForm = ref(true)

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

interface QueryParamStruct {
  department: number | undefined
  deviceArea: number | undefined
  cardId?: string
  id: string | undefined
  serialNumber: string
  phone: string
  sTime: string
  eTime: string
  page: number | undefined
  size: number | undefined
}

let QueryParm: Ref<QueryParamStruct> = ref({
  department: undefined,
  deviceArea: undefined,
  cardId: '',
  id: undefined,
  phone: '',
  serialNumber: '',
  sTime: '',
  eTime: '',
  page: 1,
  size: 10
})

let converDateFormat = (time: string) => {
  if (time) {
    return time.replace('T', ' ')
  }
  return time
}

let DeleteIdArray: any = []

const handleSelectionChange = (val: any) => {
  if (val.length > 0) {
    disableRemove.value = false
  } else {
    disableRemove.value = true
  }

  DeleteIdArray = []
  let tt = unref(val)
  tt.forEach((row: any) => {
    console.log(row)
    DeleteIdArray.push(row.oper_id)
  })
}

const getTableData = () => {
  QueryParm.value.sTime = operationTime.value[0]
  QueryParm.value.eTime = operationTime.value[1]

  service.post(PATH_URL + '/ordClearRecord/getClearRecord', QueryParm.value).then((res: any) => {
    console.log('points', res)
    if (res.code == 200) {
      logData.value = res.data.records
      total.value = res.data.total
    }
  })
}

const onReset = () => {
  QueryParm.value.department = undefined
  QueryParm.value.cardId = ''
  QueryParm.value.deviceArea = undefined
  QueryParm.value.id = ''
  QueryParm.value.phone = ''
  QueryParm.value.serialNumber = ''
  operationTime.value = []
}

const getDepartment = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
    if (res.code == 200) {
      departmentArray.value = res.data
    }
  })
}

const getDeviceArea = () => {
  service.get(PATH_URL + '/Permission/getDeviceAreaForSelect').then((res: any) => {
    if (res.code == 200) {
      deviceAreaArray.value = res.data
    }
  })
}

const exportExcel = () => {}
</script>

<style lang="less" scoped></style>
