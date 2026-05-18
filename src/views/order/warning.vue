<template>
  <el-row>
    <el-form :model="QueryParm" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="异常记录编号">
        <el-input v-model="QueryParm.id" class="eInput" placeholder="请输入记录编号" />
      </el-form-item>

      <el-form-item label="设备编号">
        <el-input v-model="QueryParm.serialNumber" class="eInput" placeholder="请输入设备编号" />
      </el-form-item>

      <el-form-item label="设备名称">
        <el-input v-model="QueryParm.deviceName" class="eInput" placeholder="请输入设备名称" />
      </el-form-item>

      <el-form-item label="故障类型：">
        <el-select v-model="QueryParm.warningModel">
          <el-option :value="1" label="运维" key="1" />
          <el-option :value="2" label="清运" key="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="设备状态">
        <el-select v-model="QueryParm.Processed">
          <el-option :value="1" label="未处理" key="1" />
          <el-option :value="2" label="暂不处理" key="2" />
          <el-option :value="3" label="已处理" key="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="产品类型">
        <el-select v-model="QueryParm.deviceType">
          <el-option
            v-for="item in deviceTypeArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="运营商：">
        <el-select v-model="QueryParm.departmentId">
          <el-option
            v-for="item in departmentArray"
            :key="item.id"
            :label="item.platform_name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="上报时间:">
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
        <el-button type="primary" class="btn" @click="getTableData" v-hasPermi="Permission.sec">
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

      <el-button type="danger" class="btn" @click="exportExcel"
        ><el-icon><Close /></el-icon>导出</el-button
      >
      <el-button
        type="primary"
        class="btn"
        @click="doWorkBatch"
        :disabled="ProcessBatch"
        v-hasPermi="Permission.han"
        ><el-icon><Close /></el-icon>批量处理</el-button
      >
    </el-col>

    <el-col :span="12" style="text-align: right">
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
    <el-table
      ref="areaTableRef"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="异常编号" width="100" property="id" />

      <el-table-column label="故障描述" width="160" property="warningLabel" />
      <el-table-column label="所属运营商" width="100" property="Platform_name" />
      <el-table-column label="设备名称" width="100" property="device_name" />
      <el-table-column label="产品类型" width="100" property="type_name" />
      <el-table-column label="设备编号" width="100" property="serial_number" />
      <el-table-column label="仓位名称" width="100" property="garbage_Name" />
      <el-table-column label="仓位" width="60" property="code" />
      <el-table-column label="设备地址" width="200" property="address" />
      <el-table-column label="处理描述" width="80" property="processed_descript" />
      <el-table-column label="故障类型" width="80" v-slot="scope">
        {{ scope.row.warning_model == 1 ? '运维' : '清运' }}
      </el-table-column>
      <el-table-column label="处理状态" width="100" v-slot="scope">
        {{ ConvertStatus(scope.row.Processed) }}
      </el-table-column>
      <el-table-column label="上报时间" width="200" v-slot="scope">
        {{ FormatDate(scope.row.create_time) }}
      </el-table-column>

      <el-table-column label="操作" width="200" v-slot="scope">
        <el-link type="primary" @click="doWork(scope.row)" v-hasPermi="Permission.han"
          >处理</el-link
        >
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
        :total="QueryParm.total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </el-col>
  </el-row>

  <el-dialog v-model="ProcessDialogVisible" title="报警处理" width="40%">
    <el-form :model="ProcessData" label-width="120px">
      <el-form-item label="处理描述">
        <el-input v-model="ProcessData.desc" type="textarea" rows="3" />
      </el-form-item>
    </el-form>
    <el-form-item label="设备状态" label-width="120px">
      <el-radio-group v-model="ProcessData.type">
        <el-radio :label="1"> 未处理</el-radio>
        <el-radio :label="2"> 暂不处理</el-radio>
        <el-radio :label="3"> 已处理</el-radio>
      </el-radio-group>
    </el-form-item>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="ProcessDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="toDo"> 确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { FormatDate } from '@/utils/tools'
import { ElMessage } from 'element-plus'
import { inject } from 'vue'
import { ref, Ref, onMounted, unref } from 'vue'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const Permission = ref({
  han: 'ord_war_han',
  sec: 'ord_war_sec'
})

let small = ref(false)
let disabled = ref(false)

let ProcessDialogVisible = ref(false)

let QueryParm = ref({
  id: undefined,
  serialNumber: '',
  deviceName: '',
  warningModel: undefined,
  Processed: undefined,
  deviceType: undefined,
  departmentId: undefined,
  sTime: '',
  eTime: '',
  page: 1,
  size: 10,
  total: 0
})

let ProcessBatch = ref(true)

const ConvertStatus = (type: number): string => {
  let temp = ''
  switch (type) {
    case 1:
      temp = '未处理'
      break
    case 2:
      temp = '暂不处理'
      break
    case 3:
      temp = '已处理'
      break
    default:
      temp = '未知'
  }
  return temp
}

const doWorkBatch = () => {
  ProcessData.value.ids = []
  selectIdArray.forEach((item) => {
    ProcessData.value.ids.push(item)
  })

  ProcessData.value.ids = selectIdArray
  ProcessData.value.desc = ''
  ProcessData.value.type = 1

  ProcessDialogVisible.value = true
}

let selectIdArray: any[] = []

let tableData: Ref<any[]> = ref([])

const handleSelectionChange = (val: any) => {
  if (val.length > 0) {
    ProcessBatch.value = false
  } else {
    ProcessBatch.value = true
  }

  selectIdArray = []
  let tt = unref(val)
  tt.forEach((row: any) => {
    selectIdArray.push(row.id)
  })

  console.log(selectIdArray)
}
const exportExcel = () => {}
onMounted(() => {
  getProduct()
  getDepartment()
  getTableData()
})
const getTableData = () => {
  QueryParm.value.sTime = operationTime.value[0]
  QueryParm.value.eTime = operationTime.value[1]

  service.post(PATH_URL + '/MachineMange/getWarningList', QueryParm.value).then((res: any) => {
    console.log(res)
    tableData.value = res.data.records
    QueryParm.value.total = res.data.total
  })
}
const doWork = (row: any) => {
  ProcessData.value.ids = []
  ProcessData.value.ids.push(row.id)
  ProcessData.value.desc = ''
  ProcessData.value.type = 1

  ProcessDialogVisible.value = true
}

interface ProcessStruct {
  ids: number[]
  type: number
  desc: string
}

let ProcessData: Ref<ProcessStruct> = ref({
  ids: [] as number[],
  type: 1,
  desc: ''
})

const onReset = () => {
  QueryParm.value = {
    id: undefined,
    serialNumber: '',
    deviceName: '',
    warningModel: undefined,
    Processed: undefined,
    deviceType: undefined,
    departmentId: undefined,
    sTime: '',
    eTime: '',
    page: 1,
    size: 10,
    total: 0
  }
}

const getProduct = () => {
  let param = {
    page: 1,
    size: 100
  }

  service.post(PATH_URL + '/MachineMange/getProduct', param).then((res: any) => {
    deviceTypeArray.value = res.data
  })
}

const getDepartment = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
    departmentArray.value = res.data
  })
}

let showSearchForm = ref(true)

let departmentArray: Ref<any[]> = ref([])

let deviceTypeArray: Ref<any[]> = ref([])
let operationTime: Ref<any[]> = ref([])

const toDo = () => {
  console.log(ProcessData.value)

  if (ProcessData.value.desc == '' || ProcessData.value.desc.trim().length == 0) {
    ElMessage('请填写 处理描述 ')
    return
  }

  service.post(PATH_URL + '/MachineMange/setWarningProcess', ProcessData.value).then((res: any) => {
    console.log(res)
    if (res.code == 200) {
      ElMessage('操作成功')
      getTableData()
      ProcessDialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="less"></style>
