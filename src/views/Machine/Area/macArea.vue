<template>
  <el-row>
    <el-form :model="form" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="区域名称：">
        <el-input v-model="form.area" class="eInput" placeholder="请输入区域名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="getAreaData" v-hasPermi="Permission.sec">
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
    <el-col :span="12">
      <el-button type="primary" class="btn" @click="OnClickAdd" v-hasPermi="Permission.add">
        <el-icon><Plus /> </el-icon>
        新增</el-button
      >

      <el-button
        type="success"
        class="btn"
        :disabled="disableUpdate"
        v-if="false"
        v-hasPermi="Permission.rev"
        ><el-icon><EditPen /></el-icon>修改</el-button
      >
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
      :data="areaTableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" width="60" property="id" />
      <el-table-column label="区域名称" width="100" property="areaName" />
      <el-table-column label="所在地区" width="120" property="fullName" />
      <el-table-column label="创建时间" property="createTime" />
      <el-table-column label="创建者" width="120" property="staff.name" />
      <el-table-column label="操作" v-slot="scope" width="150">
        <div class="buttonOfTables">
          <el-link
            type="primary"
            class="bt"
            @click="handleDetail(scope.row)"
            v-hasPermi="Permission.rev"
            >编辑</el-link
          >
          <el-link
            type="primary"
            class="bt"
            @click="handleRemove(scope.row)"
            v-hasPermi="Permission.del"
            >删除</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>

  <el-dialog v-model="addDialogFormVisible" title="添加设备区域">
    <el-form :model="addFormData">
      <el-form-item label="所在区域" label-width="100">
        <el-tree-select
          v-model="addFormData.areaCode"
          lazy
          ref="treeRef"
          :load="treeLoad"
          :props="{ value: 'code', label: 'name' }"
          value-key="code"
          node-key="code"
          placeholder="请选择省份"
          check-strictly
          highlight-current
          :default-expanded-keys="defaultExpandedNodes"
        />
      </el-form-item>

      <el-form-item label="区域名称" :label-width="100">
        <el-input v-model="addFormData.areaName" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="onAddConfirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
import { ref, onMounted, inject } from 'vue'
import { AxiosRequestConfig } from 'axios'
import qs from 'qs'
const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

//#region 表格相关

const handleDetail = (val) => {
  isUpdate = true
  addFormData.value.id = val.id
  addFormData.value.areaCode = val.areaCode
  addFormData.value.areaName = val.areaName

  addDialogFormVisible.value = true
}

const Permission = ref({
  add: 'mac_are_add',
  rev: 'mac_are_rev',
  del: 'mac_are_del',
  sec: 'mac_are_sec'
})

const deleteOfDetail = () => {
  ElMessageBox.confirm('确定要删除这些设备区域吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      service
        .post(
          PATH_URL + '/Permission/deleteDeviceArea',
          qs.stringify({ ids: DeleteIdArray }, { arrayFormat: 'brackets' })
        )
        .then(() => {
          getAreaData()
          ElMessage('删除记录成功')
        })
    })
    .catch(() => {})
}

const handleRemove = (data) => {
  ElMessageBox.confirm('确定要删除这个设备区域吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      let d: number = data.id
      let ids: number[] = []
      ids.push(d)

      service
        .post(
          PATH_URL + '/Permission/deleteDeviceArea',
          qs.stringify({ ids: ids }, { arrayFormat: 'brackets' })
        )
        .then(() => {
          getAreaData()
          ElMessage('删除记录成功')
        })
    })
    .catch(() => {})
}

let areaTableRef = ref(ElTable)
let areaTableData = ref([])

let DeleteIdArray: number[] = []
let handleSelectionChange = (val) => {
  if (val.length > 0) {
    disableRemove.value = false
  } else {
    disableRemove.value = true
  }

  DeleteIdArray = []
  val.forEach((row) => {
    DeleteIdArray.push(row.id)
  })
}

const getAreaData = () => {
  service
    .post(
      PATH_URL + '/Permission/getDeviceArea',
      qs.stringify({ name: form.value.area }, { arrayFormat: 'brackets' })
    )
    .then((res) => {
      console.log(res.data)
      areaTableData.value = res.data
    })
}

//#endregion

onMounted(() => {
  getAreaData()
})

//#region  搜索相关
const onReset = () => {
  form.value.area = ''
}

let showSearchForm = ref(true)
const form = ref({
  area: ''
})
//#endregion

//#region 添加dialog
let defaultExpandedNodes = ref([])

const treeLoad = (node, resolve) => {
  let pars = {
    pcode: 0
  }
  if (node && node.level == 0) {
    pars.pcode = 0
  } else {
    pars.pcode = node.data.code
  }
  console.log(node.data.code)
  getTreeData(pars, resolve)
}

const getTreeData = (pars, resolve) => {
  let config: AxiosRequestConfig = {}
  config.params = pars
  service.get(PATH_URL + '/MachineManage/getAreaChina', config).then((res) => {
    console.log(res)
    let data = res.data
    resolve(data)
  })
}

let addDialogFormVisible = ref(false)
let addFormData = ref({
  areaCode: '',
  areaName: '',
  id: 0
})

//#endregion

//#region 添加相关
let isUpdate = false
const onAddConfirm = () => {
  console.log(addFormData)
  if (isUpdate) {
    updateDeviceArea()
    return
  }

  ElMessageBox.confirm('确定要添加这个设备区域吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/Permission/addDeviceArea', addFormData.value).then(() => {
      ElMessage('操作成功')
      getAreaData()
      addDialogFormVisible.value = false
    })
  })
}

const updateDeviceArea = () => {
  ElMessageBox.confirm('确定要修改这个设备区域吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let dd = {
      id: addFormData.value.id,
      areaCode: addFormData.value.areaCode,
      areaName: addFormData.value.areaName
    }

    service
      .post(
        PATH_URL + '/Permission/updateDeviceArea',
        qs.stringify(dd, { arrayFormat: 'brackets' })
      )
      .then(() => {
        ElMessage('操作成功')
        getAreaData()
        addDialogFormVisible.value = false
      })
  })
}

const OnClickAdd = () => {
  isUpdate = false
  addFormData.value.areaCode = ''
  addFormData.value.areaName = ''
  addDialogFormVisible.value = true
}

const disableUpdate = ref(false)
const disableRemove = ref(true)

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

//#endregion
</script>

<style lang="less" scoped>
.bt {
  margin-left: 20px;
}
</style>
