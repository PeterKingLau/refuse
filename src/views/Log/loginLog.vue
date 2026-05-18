<template>
  <el-row>
    <el-form :model="Queryparam" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="登录地址：">
        <el-input v-model="Queryparam.ip" class="eInput" placeholder="请输入登录地址" />
      </el-form-item>

      <el-form-item label="用户名称">
        <el-input v-model="Queryparam.user" class="eInput" placeholder="请输入用户名称" />
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

      <el-form-item label="登录时间:">
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
      <el-table-column label="日志编号" width="80" property="id" />

      <el-table-column label="用户名称" width="260" property="userName" />
      <el-table-column label="登录IP" width="280" property="ip" />
      <el-table-column label="登录状态" width="80" v-slot="scope">
        {{ scope.row.status == 0 ? '成功' : '失败' }}
      </el-table-column>

      <el-table-column label="登录信息" width="260" v-slot="scope">
        {{ converStatu(scope.row.status) }}
      </el-table-column>
      <el-table-column label="登录时间" width="280" v-slot="scope">
        {{ converDateFormat(scope.row.createTime) }}
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
  del: 'log_lgi_del',
  sec: 'log_lgi_sec'
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

interface LogQueryParam {
  ip: string
  user: string
  status: number | undefined
  sTime: string
  eTime: string
  page: number
  size: number
}

let Queryparam: Ref<LogQueryParam> = ref({
  ip: '',
  user: '',
  status: undefined,
  sTime: '',
  eTime: '',
  page: 1,
  size: 10
})

let logData: any = ref([])

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
  service.post(PATH_URL + '/Permission/getLoginLog', Queryparam.value).then((res: any) => {
    console.log(res)
    total.value = res.data.total

    logData.value = res.data.records
  })
}
const deleteOfDetail = () => {
  service
    .post(
      PATH_URL + '/Permission/deleteLogIds',
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
  Queryparam.value.eTime = ''
  Queryparam.value.sTime = ''
  Queryparam.value.ip = ''
  Queryparam.value.status = undefined
  Queryparam.value.user = ''
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
    DeleteIdArray.push(row.id)
  })
}

const converStatu = (status: number): string => {
  if (status == 0) {
    return '登录成功'
  } else if (status == 1) {
    return '用户名或密码错误'
  } else if (status == 2) {
    return '账户禁用'
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
