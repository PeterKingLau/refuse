<template>
  <el-row>
    <el-form :model="searchFormData" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="卡片编号">
        <el-input v-model="searchFormData.cardNo" class="eInput" placeholder="请输入卡片编号" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchFormData.type" clearable placeholder="请选择类型">
          <el-option label="会员" value="1" />
          <el-option label="清运" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchFormData.status" clearable placeholder="请选择状态">
          <el-option label="待使用" value="0" />
          <el-option label="已使用" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="getCardData" v-hasPermi="Permission.sec">
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

      <el-button type="success" class="btn" :disabled="disableUpdate" v-if="false"
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

  <el-row>
    <el-table
      ref="areaTableRef"
      :data="TableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" width="60" property="id" />
      <el-table-column label="卡号" width="180" property="cardNo" />
      <el-table-column v-slot="scope" label="类型" width="160">
        {{ CovertMemberType(scope.row.type) }}
      </el-table-column>
      <el-table-column v-slot="scope" label="类型" width="160">
        {{ ConvertStatus(scope.row.status) }}
      </el-table-column>

      <el-table-column label="创建时间" property="createTime" width="200" />
      <el-table-column label="创建人" width="100" property="createStaffName" />
      <el-table-column label="操作" v-slot="scope">
        <div class="buttonOfTables">
          <el-link
            type="success"
            class="bt"
            @click="handleDetail(scope.row)"
            v-hasPermi="Permission.rev"
            >编辑</el-link
          >
          <el-link
            class="bt"
            size="small"
            type="danger"
            @click="handleRemove(scope.row)"
            v-hasPermi="Permission.del"
            >删除</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 15, 20]"
      :small="small"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getCardData"
      @current-change="getCardData"
    />
  </el-row>

  <el-dialog v-model="dialogFormVisible" title="添加卡信息">
    <el-form :model="addFormData" label-width="120">
      <el-form-item label="卡号">
        <el-input v-model="addFormData.cardNo" autocomplete="off" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="addFormData.type">
          <el-option label="会员" value="1" />
          <el-option label="清运" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" v-if="isUpdate">
        <el-select v-model="addFormData.status">
          <el-option label="未使用" :value="0" />
          <el-option label="已使用" :value="1" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCloseAddDialog">取消</el-button>
        <el-button type="primary" @click="onClickConfirm"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, inject } from 'vue'
import { ElSelect, ElMessage, ElMessageBox } from 'element-plus'
import { PATH_URL, service } from '@/config/axios/service'
import qs from 'qs'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}
const Permission = ref({
  add: 'mem_cad_add',
  rev: 'mem_cad_rev',
  del: 'mem_cad_del',
  sec: 'mem_cad_sec'
})

onMounted(() => {
  getCardData()
})

const getCardData = () => {
  let parm = {
    page: currentPage.value,
    size: pageSize.value,
    cardNo: searchFormData.value.cardNo,
    type: searchFormData.value.type,
    status: searchFormData.value.status
  }

  service.post(PATH_URL + '/memMember/getCard', parm).then((res) => {
    console.log(res)
    TableData.value = res.data.records
    total.value = res.data.total
  })
}

//#region  数据结构
interface SearchStruct {
  cardNo: string
  type: string
  status: string
}

interface TableDataStruct {
  id: number
  cardNo: string
  type: number
  createTime: string
  status: number
  createStaffName: string
}

//#endregion

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)

let TableData: Ref<TableDataStruct[]> = ref([])

let DeleteIdArray: number[] = []
const handleSelectionChange = (val) => {
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

const CovertMemberType = (val) => {
  if (val === 1) {
    return '会员'
  } else {
    return '清运'
  }
}

const ConvertStatus = (val) => {
  if (val === 0) {
    return '未使用'
  } else {
    return '已使用'
  }
}

let addFormData: Ref<SearchStruct> = ref({
  cardNo: '',
  type: '1',
  status: '0'
})

const onReset = () => {
  searchFormData.value.cardNo = ''
  searchFormData.value.type = '1'
  searchFormData.value.status = '0'
}

let showSearchForm = ref(true)
let disableRemove = ref(true)

let searchFormData: Ref<SearchStruct> = ref({
  cardNo: '',
  type: '',
  status: ''
})

let dialogFormVisible = ref(false)

let disableUpdate = ref(true)
let isUpdate = ref(false)
const OnClickAdd = () => {
  isUpdate.value = false

  dialogFormVisible.value = true
}

const deleteOfDetail = () => {
  let title = '你确定要删除这些卡信息?'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log(DeleteIdArray)
    service
      .post(
        PATH_URL + '/memMember/deleteCardBatch',
        qs.stringify(
          {
            ids: DeleteIdArray
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getCardData()
      })
  })
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const onCloseAddDialog = () => {
  dialogFormVisible.value = false
}

const handleDetail = (val) => {
  console.log('edit', val)
  isUpdate.value = true
  addFormData.value.cardNo = val.cardNo
  addFormData.value.status = val.status
  addFormData.value.type = String(val.type)
  dialogFormVisible.value = true
}

const handleRemove = (val) => {
  let title = '你确定要删除这个卡信息？'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let deleteArrry: number[] = []
    deleteArrry.push(val.id)
    service
      .post(
        PATH_URL + '/memMember/deleteCardBatch',
        qs.stringify(
          {
            ids: deleteArrry
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getCardData()
      })
  })
}

const onClickConfirm = () => {
  if (isUpdate.value) {
    doUpdate()
    return
  }

  let title = '你确定要添加一个卡信息'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/memMember/addCard', addFormData.value).then(() => {
      ElMessage('操作成功')
      getCardData()
      dialogFormVisible.value = false
    })
  })
}

const doUpdate = () => {
  let title = '你确定要修改一个卡信息'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/memMember/updateCard', addFormData.value).then(() => {
      ElMessage('操作成功')
      getCardData()
      dialogFormVisible.value = false
    })
  })
}
</script>

<style scoped>
.bt {
  margin-left: 20px;
}
</style>
