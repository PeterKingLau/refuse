<template>
  <el-row>
    <el-form :model="Queryparam" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="模块名称：">
        <el-input v-model="Queryparam.module" class="eInput" placeholder="请输入模块名称" />
      </el-form-item>

      <el-form-item label="操作人员：">
        <el-input v-model="Queryparam.user" class="eInput" placeholder="请输入操作人员" />
      </el-form-item>

      <el-form-item label="状态：">
        <el-select v-model="Queryparam.status">
          <el-option
            v-for="item in statusArray"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="操作类型：">
        <el-select v-model="Queryparam.type">
          <el-option
            v-for="item in operationTypeArray"
            :key="item.label"
            :label="item.label"
            :value="item.label"
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
        <el-button type="primary" class="btn" @click="getLogData" v-hasPermi="Permission.sec">
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

      <el-button
        type="danger"
        class="btn"
        :disabled="disableRemove"
        @click="deleteOfDetail"
        v-hasPermi="Permission.del"
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
    <el-table
      ref="areaTableRef"
      :data="logData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="日志编号" width="100" property="oper_id" />

      <el-table-column label="日志模块" width="160" property="oper_module" />
      <el-table-column label="操作类型" width="100" property="oper_type" />
      <el-table-column label="操作人员" width="100" property="oper_user_id" />
      <el-table-column label="操作IP地址" width="160" property="oper_ip" />

      <el-table-column label="操作状态" width="160" v-slot="scope">
        {{ converStatu(scope.row.oper_status) }}
      </el-table-column>
      <el-table-column label="投放时间" width="180" v-slot="scope">
        {{ converDateFormat(scope.row.oper_create_time) }}
      </el-table-column>

      <el-table-column label="操作" v-slot="scope" width="150">
        <div class="buttonOfTables">
          <el-link type="primary" @click="handleDetail(scope.row)">详细</el-link>
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

  <el-dialog v-model="handleShow" title="详细日志" width="50%">
    <el-row class="c-row">
      <el-col :span="5" class="title">模块名称：</el-col>
      <el-col :span="5" class="content">{{ currentRow.oper_module }}</el-col>
      <el-col :span="5" class="title">操作类型：</el-col>
      <el-col :span="5" class="content">{{ currentRow.oper_type }}</el-col>
    </el-row>
    <el-row class="c-row">
      <el-col :span="5" class="title">请求地址：</el-col>
      <el-col :span="5" class="content">{{ currentRow.oper_method }}</el-col>
      <el-col :span="5" class="title">请求结果：</el-col>
      <el-col :span="5" class="content">{{ converStatu(currentRow.oper_status) }}</el-col>
    </el-row>
    <el-row class="c-row">
      <el-col :span="5" class="title">请求IP地址：</el-col>
      <el-col :span="5" class="content">{{ currentRow.oper_ip }}</el-col>
      <el-col :span="5" class="title">操作用户：</el-col>
      <el-col :span="5" class="content">{{ currentRow.oper_user_id }}</el-col>
    </el-row>
    <el-row class="c-row">
      <el-col :span="5" class="title">操作方法：</el-col>
      <el-col :span="15" class="content">{{ currentRow.oper_uri }}</el-col>
    </el-row>

    <el-row class="c-row">
      <el-col :span="5" class="title">操作描述：</el-col>
      <el-col :span="5" class="content">{{ currentRow.oper_desc }}</el-col>
      <el-col :span="5" class="title">操作时间：</el-col>
      <el-col :span="5" class="content">{{ converDateFormat(currentRow.oper_create_time) }}</el-col>
    </el-row>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleShow = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'

import { ElMessage } from 'element-plus'
import { Ref, ref, onMounted, unref, inject } from 'vue'
import qs from 'qs'
const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const Permission = ref({
  del: 'log_sys_del',
  sec: 'log_sys_sec'
})

//#region 数据结构

let currentPage = ref(1)
let pageSize = ref(10)
let small = ref(false)
let disabled = ref(false)
let total = ref(0)

let operationTime = ref([])

let showSearchForm = ref(true)

let statusArray = [
  {
    id: 0,
    label: '成功'
  },
  {
    id: 1,
    label: '失败'
  }
]

let operationTypeArray = [
  {
    label: '新增'
  },
  {
    label: '修改'
  },
  {
    label: '删除'
  },
  {
    label: '授权'
  },
  {
    label: '导出'
  },
  {
    label: '导入'
  },
  {
    label: '强退'
  },
  {
    label: '生成代码'
  }
]

interface LogQueryParam {
  module: string
  type: string
  user: string
  status: number | undefined
  sTime: string
  eTime: string
  page: number
  size: number
}
let currentRow: any = ref({})

let handleShow = ref(false)

let Queryparam: Ref<LogQueryParam> = ref({
  module: '',
  type: '',
  user: '',
  status: undefined,
  sTime: '',
  eTime: '',
  page: 1,
  size: 10
})

interface LogData {
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

let logData: Ref<LogData[]> = ref([])

let disableRemove = ref(true)
let converDateFormat = (time: string) => {
  if (time) {
    return time.replace('T', ' ')
  }
  return time
}
const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}
//#endregion

let DeleteIdArray: any = []

onMounted(() => {
  getLogData()
})

const handleSizeChange = () => {
  getLogData()
}

const getLogData = () => {
  if (operationTime.value) {
    Queryparam.value.sTime = operationTime.value[0]
    Queryparam.value.eTime = operationTime.value[1]
  }
  Queryparam.value.page = currentPage.value
  Queryparam.value.size = pageSize.value
  service.post(PATH_URL + '/MachineMange/getLogData', Queryparam.value).then((res: any) => {
    console.log(res)
    total.value = res.data.total
    logData.value = res.data.records
  })
}
const deleteOfDetail = () => {
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
      console.log(res)
      if (res.code == 200) {
        ElMessage('操作成功')
        DeleteIdArray = []
        getLogData()
      }
    })
}
const onReset = () => {
  Queryparam.value.status = undefined
  Queryparam.value.module = ''
  Queryparam.value.user = ''
  Queryparam.value.type = ''
  operationTime.value = []
}

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

const handleDetail = (row: any) => {
  console.log(row)
  currentRow.value = row
  handleShow.value = true
}

const converStatu = (status: number): string => {
  if (status == 0) {
    return '成功'
  } else if (status == 1) {
    return '失败'
  } else {
    return '未知状态'
  }
}
</script>

<style scoped>
.title {
  font-weight: 700;
}

.c-row {
  margin-top: 30px;
}
</style>
