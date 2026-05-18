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

      <el-form-item label="会员id：">
        <el-input v-model="QueryParm.admin" class="eInput" placeholder="请输入用户id" />
      </el-form-item>

      <el-form-item label="来源：">
        <el-select v-model="QueryParm.reason">
          <el-option
            v-for="item in reasonArray"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备编号：">
        <el-input v-model="QueryParm.serialNumber" class="eInput" placeholder="请输入设备编号" />
      </el-form-item>

      <el-form-item label="积分类型：">
        <el-select v-model="QueryParm.type">
          <el-option
            v-for="item in pointType"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
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
      <el-button v-if="false" type="primary" class="btn" @click="onOpenSetPointsDialog"
        ><el-icon><editor /></el-icon>积分比例设置</el-button
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
      <el-table-column label="日志编号" width="100" property="id" />

      <el-table-column label="用户编号" width="160" property="member_id" />
      <el-table-column label="积分类型" width="100" v-slot="scope">
        {{ convertPointype(scope.row.record_type) }}
      </el-table-column>
      <el-table-column label="积分数额" width="100" property="points" />
      <el-table-column label="来源" width="160" v-slot="scope">
        {{ converReason(scope.row.reason) }}
      </el-table-column>
      <el-table-column label="运营商" width="160" property="Platform_name" />
      <el-table-column label="设备区域" width="160" property="area_name" />
      <el-table-column label="设备编号" width="160" property="serial_number" />
      <el-table-column label="是否入账" width="160" v-slot="scope">
        {{ scope.row.recorded == 1 ? '未入账' : '已入账' }}
      </el-table-column>
      <el-table-column label="入账时间" width="180" v-slot="scope">
        {{ converDateFormat(scope.row.recorded_time) }}
      </el-table-column>

      <el-table-column label="描述" width="160" property="remarks" />
      <el-table-column label="积分结余" width="160" property="current_point" />
      <el-table-column label="操作人" width="160" property="staff_id" />
      <el-table-column label="操作时间" width="180" v-slot="scope">
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

  <el-dialog v-model="setPointsVisible" title="积分比例设置" width="40%">
    <el-row class="content">
      <el-col :span="4"> 积分比例: </el-col>
      <el-col :span="2">1:</el-col>
      <el-col :span="18">
        <el-input-number v-model="PointsRatio" :min="1" :max="100000" />
      </el-col>
    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setPointsClose">取消</el-button>
        <el-button type="primary" @click="doSetPoints"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ElMessage } from 'element-plus'
import { ref, Ref, onMounted, unref, inject } from 'vue'
import qs from 'qs'
const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const getPointsRatio = () => {
  service.get(PATH_URL + '/sysSetting/getPointsRatio').then((res: any) => {
    console.log('res', res)
    PointsRatio.value = res.data.ratio
  })
}

const onOpenSetPointsDialog = () => {
  setPointsVisible.value = true
}

const setPointsClose = () => {
  setPointsVisible.value = false
}

const doSetPoints = () => {
  service
    .post(
      PATH_URL + '/sysSetting/updatePointsRatio',
      qs.stringify(
        {
          ratio: PointsRatio.value
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then(() => {
      ElMessage('操作成功')
      getPointsRatio()
      setPointsVisible.value = false
    })
}

let PointsRatio: Ref<number> = ref(100)

let setPointsVisible = ref(false)

let operationTime = ref([])

let disableRemove = ref(true)

let small = ref(false)
let disabled = ref(false)
let total = ref(0)

let departmentArray: any = ref([])
let deviceAreaArray: any = ref([])
let reasonArray: any = ref([])
let pointType = [
  {
    id: 1,
    label: '延时到账'
  },
  {
    id: 2,
    label: '立即到账'
  }
]

const convertPointype = (type: number): string => {
  if (type == 1) {
    return '延时到账'
  } else if (type == 2) {
    return '立即到账'
  } else {
    return '未知类型'
  }
}

const converReason = (item: any): string => {
  // let temp = unref(reasonArray)
  let temp = '未知'
  reasonArray.value.forEach((element: any) => {
    if (item == element['id']) {
      temp = element.label
    }
  })

  return temp
}

onMounted(() => {
  getDepartment()
  getPontsReason()
  getDeviceArea()
  getTableData()
  getPointsRatio()
})

let logData: any = ref([])

let showSearchForm = ref(true)

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

interface QueryParamStruct {
  department: number | undefined
  deviceArea: number | undefined
  admin?: string
  reason: number | undefined
  type: number | undefined
  serialNumber: string
  sTime: string
  eTime: string
  page: number | undefined
  size: number | undefined
}

let QueryParm: Ref<QueryParamStruct> = ref({
  department: undefined,
  deviceArea: undefined,
  admin: '',
  reason: undefined,
  type: undefined,
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
  console.log('points', QueryParm.value)
  service.post(PATH_URL + '/memMember/getPointList', QueryParm.value).then((res: any) => {
    if (res.code == 200) {
      logData.value = res.data.records
      total.value = res.data.total
    }
  })
}

const onReset = () => {
  QueryParm.value.department = undefined
  QueryParm.value.admin = ''
  QueryParm.value.deviceArea = undefined
  QueryParm.value.reason = undefined
  QueryParm.value.type = undefined
  QueryParm.value.serialNumber = ''
  operationTime.value = []
}

const getDepartment = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
    console.log('dsd', res)
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

const getPontsReason = () => {
  service.get(PATH_URL + '/memMember/getPointReason').then((res: any) => {
    if (res.code == 200) {
      reasonArray.value = res.data
    }
  })
}

const exportExcel = () => {}
</script>

<style lang="less" scoped>
.content {
  font-size: 18px;
}
</style>
