el-form<template>
  <el-row>
    <el-form :model="SearchFormData" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="用户编号：">
        <el-input v-model="SearchFormData.id" class="eInput" placeholder="请输入用户编号" />
      </el-form-item>
      <el-form-item label="运营商：">
        <el-input
          v-model="SearchFormData.departmentName"
          class="eInput"
          placeholder="请输入运营商名称"
        />
      </el-form-item>
      <el-form-item label="手机号码：">
        <el-input v-model="SearchFormData.phone" class="eInput" placeholder="请输入用户手机" />
      </el-form-item>

      <el-form-item label="卡号：">
        <el-input v-model="SearchFormData.cardNo" class="eInput" placeholder="请输入卡号" />
      </el-form-item>
      <el-form-item label="昵称：">
        <el-input v-model="SearchFormData.nickName" class="eInput" placeholder="请输入用户昵称" />
      </el-form-item>

      <el-form-item label="创建时间：">
        <el-date-picker
          v-model="SearchFormData.sTime"
          type="datetimerange"
          range-separator="到"
          start-placeholder="开始日期"
          end-placeholder="截至日期"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="getMemberData" v-hasPermi="Permission.sec">
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
        v-if="false"
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
    <el-table ref="areaTableRef" :data="TableData" style="width: 100%">
      <el-table-column label="用户ID" width="100" property="id" />

      <el-table-column v-slot="scope" label="用户头像" width="200">
        <img :src="getImageURL(scope.row.pic)" class="imgOfTable" />
      </el-table-column>
      <el-table-column label="运营商" width="260" property="department.platformName" />

      <el-table-column label="用户昵称" width="180" property="nickName" />
      <el-table-column label="手机号码" width="200" property="phone" />
      <el-table-column label="积分" width="120" property="points" />
      <el-table-column label="绑定卡号" width="200" property="cardNo" />
      <el-table-column label="创建时间" width="250" property="createTime" />
      <el-table-column label="操作" v-slot="scope">
        <div class="buttonOfTables">
          <el-link
            class="bt"
            type="success"
            @click="addPoints(scope.row)"
            v-hasPermi="Permission.pad"
            >添加积分</el-link
          >
          <el-link
            class="bt"
            type="danger"
            @click="reducePoints(scope.row)"
            v-hasPermi="Permission.pas"
            >扣除积分</el-link
          >

          <el-link
            class="bt"
            type="danger"
            @click="handleDetail(scope.row)"
            v-hasPermi="Permission.bak"
            >拉黑</el-link
          >
          <el-link
            class="bt"
            type="success"
            @click="handleRemove(scope.row)"
            v-hasPermi="Permission.cad"
            >绑定</el-link
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
      @size-change="getMemberData"
      @current-change="getMemberData"
    />
  </el-row>

  <el-dialog v-model="AdddialogFormVisible" title="添加会员">
    <el-form :model="addFormData" label-width="120">
      <el-form-item label="用户昵称：">
        <el-input v-model="addFormData.nickName" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="手机号码：">
        <el-input v-model="addFormData.phone" placeholder="请输入用户手机号码 " />
      </el-form-item>

      <el-form-item label="邮箱：" v-if="false">
        <el-input v-model="addFormData.email" placeholder="请输入用户邮箱 " />
      </el-form-item>

      <el-form-item label="密码：" v-if="false">
        <el-input v-model="addFormData.pwd" placeholder="请输入用户密码 " type="password" />
      </el-form-item>

      <el-form-item label="状态：">
        <el-radio-group v-model="addFormData.status" class="ml-4">
          <el-radio label="1" size="large">正常</el-radio>
          <el-radio label="2" size="large">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="LOGO" label-width="100">
        <el-upload
          class="avatar-uploader"
          :action="UpImageURL"
          :show-file-list="false"
          :on-success="handleUpdateSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="headObject"
        >
          <img v-if="addFormData.pic" :src="getImageURL(addFormData.pic)" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="备注：">
        <el-input
          v-model="addFormData.remark"
          placeholder="请输入备注信息 "
          type="textarea"
          :row="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCloseAddDialog">取消</el-button>
        <el-button type="primary" @click="onConfirm"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="dialogPointVisible" :title="OperationPointsTitle">
    <el-form :model="operationPoints" label-width="120">
      <el-form-item label="积分点数:">
        <el-input v-model="operationPoints.points" placeholder="请输入积分数" />
      </el-form-item>

      <el-form-item label="备注:">
        <el-input v-model="operationPoints.remarks" placeholder="备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClosePointsDialog">取消</el-button>
        <el-button type="primary" @click="doOperationPoint"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="bindCardDialogVisible" title="绑定卡号">
    <el-row>
      <el-form :model="SearchFormData" label-width="100px" :inline="true">
        <el-form-item label="卡号">
          <el-input v-model="getCardNo" placeholder="请输入卡号" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="btn" @click="getCardData">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button class="btn" @click="restCard">
            <el-icon class="el-icon--left"><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row>
      <el-table :data="cardTableData" ref="cardTableRef" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column property="cardNo" label="卡号" width="150" />
        <el-table-column v-slot="scope" label="类型" width="200">
          {{ Convertype(scope.row.type) }}
        </el-table-column>
        <el-table-column v-slot="scope" label="状态">
          {{ ConvertStatus(scope.row.status) }}
        </el-table-column>
      </el-table>
    </el-row>
    <el-row style="margin-top: 5px">
      <el-pagination
        v-model:current-page="cardCurrent"
        v-model:page-size="cardPageSize"
        :page-sizes="[5, 10, 15, 20]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="CardTotal"
        @size-change="getCardData"
        @current-change="getCardData"
      />
    </el-row>
    <el-row style="width: 100%; margin-top: 5px; text-align: right">
      <el-col :span="18" />
      <el-col :span="6">
        <el-button type="primary" @click="bindCard">确定</el-button>
        <el-button type="info" @click="cancelBind">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
import { Ref, ref, computed, onMounted, inject } from 'vue'
import { PATH_URL, service } from '@/config/axios/service'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const Permission = ref({
  add: 'mem_mem_add',
  pad: 'mem_mem_pad',
  pas: 'mem_mem_pas',
  bak: 'mem_mem_bak',
  cad: 'mem_mem_cad',
  sec: 'mem_mem_sec'
})

//#region  数据结构

interface BindCardStruct {
  memberId: number
  cardId: number
}

interface SearchStruct {
  id: number | null
  departmentName: string
  phone: string
  cardNo: string
  nickName: string
  sTime: string
}

interface addFormDataStruct {
  nickName: string
  phone: string
  email: string
  pwd: string
  pic: string
  remark: string
  status: string
}

interface OperationPointStruct {
  MemberId: number
  type: number
  points: number
  remarks: string
}

interface CardStruct {
  id: number
  cardNo: string
  type: number
  status: number
}

//#endregion

let cardTableData: Ref<CardStruct[]> = ref([])

let cardCurrent = ref(1)
let cardPageSize = ref(10)
let CardTotal = ref(0)

const Convertype = (val) => {
  let temp = '会员'
  if (val == 2) {
    temp = '清运'
  }
  return temp
}

const ConvertStatus = (val) => {
  let temp = '未使用'
  if (val === 1) {
    temp = '已使用'
  }
  return temp
}

let cardTableRef = ref(ElTable)

const bindCard = () => {
  ElMessageBox.confirm('您确定要为这个会员绑定会员卡吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/memMember/bindCard', bindCardData.value).then(() => {
      ElMessage('操作成功')
      getMemberData()
      bindCardDialogVisible.value = false
    })
  })
}
const cancelBind = () => {
  bindCardDialogVisible.value = false
  cardTableData.value = []
  getCardNo.value = ''
}

const restCard = () => {
  getCardNo.value = ''
}

let getCardNo = ref('')

const getCardData = () => {
  let parm = {
    cardNo: getCardNo.value,
    type: 1,
    status: '0',
    page: cardCurrent.value,
    size: pageSize.value
  }

  service.post(PATH_URL + '/memMember/getCard', parm).then((res) => {
    console.log(res)
    CardTotal.value = res.data.total
    cardTableData.value = res.data.records
  })
}

let bindCardDialogVisible = ref(false)
let bindCardData: Ref<BindCardStruct> = ref({
  memberId: 0,
  cardId: 0
})
const handleSelectionChange = (selection: any) => {
  if (selection.length > 1) {
    let del_row = selection.shift()
    cardTableRef.value.toggleRowSelection(del_row, false)
  } else {
    bindCardData.value.cardId = selection[0].id
  }
}

const onClosePointsDialog = () => {
  dialogPointVisible.value = false
}

const doOperationPoint = () => {
  ElMessageBox.confirm('您确定要进行这项积分操作吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/memMember/OperationPoints', operationPoints.value).then(() => {
      ElMessage('操作成功')
      onClosePointsDialog()
      getMemberData()
    })
  })
}

let OperationPointsTitle = ref('')

let dialogPointVisible = ref(false)

let operationPoints: Ref<OperationPointStruct> = ref({
  MemberId: 0,
  type: 0,
  points: 0,
  remarks: ''
})

let addFormData: Ref<addFormDataStruct> = ref({
  nickName: '',
  phone: '',
  email: '',
  pwd: '',
  pic: '',
  remark: '',
  status: '1'
})

onMounted(() => {
  getMemberData()
})

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})

const getMemberData = () => {
  let parm = {
    id: SearchFormData.value.id,
    departmentName: SearchFormData.value.departmentName,
    phone: SearchFormData.value.phone,
    cardNo: SearchFormData.value.cardNo,
    nickName: SearchFormData.value.nickName,
    sTime: SearchFormData.value.sTime[0],
    etime: SearchFormData.value.sTime[1],
    current: currentPage.value,
    size: pageSize.value
  }
  service.post(PATH_URL + '/memMember/getMember', parm).then((res) => {
    console.log(res)
    total.value = res.data.total
    TableData.value = res.data.records
  })
}

const handleUpdateSuccess = (respon) => {
  if (respon.code == 200) {
    addFormData.value.pic = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}

const headObject = {
  Authorization: localStorage.getItem('token')
}

const beforeAvatarUpload = () => {}

let SearchFormData: Ref<SearchStruct> = ref({
  id: null,
  departmentName: '',
  phone: '',
  cardNo: '',
  nickName: '',
  sTime: ''
})

let showSearchForm = ref(true)

const onReset = () => {
  SearchFormData.value = {
    id: null,
    departmentName: '',
    phone: '',
    cardNo: '',
    nickName: '',
    sTime: ''
  }
}

const OnClickAdd = () => {
  isUpdate.value = false
  AdddialogFormVisible.value = true
}

let disableUpdate = ref(true)
let disableRemove = ref(true)

const deleteOfDetail = () => {}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

let AdddialogFormVisible = ref(false)

const onCloseAddDialog = () => {
  AdddialogFormVisible.value = false
}

let isUpdate = ref(false)
const onConfirm = () => {
  if (isUpdate.value) {
    doUpdate()
    return
  }

  let title = '你确定要添加这个会员'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/memMember/addMember', addFormData.value).then((res: any) => {
      console.log('res', res)
      if (res.code == 200) {
        ElMessage('操作成功')
        getMemberData()
        AdddialogFormVisible.value = false
      } else {
        ElMessage(res.message)
      }
    })
  })
}

const doUpdate = () => {}

let TableData = ref([])

const handleDetail = (val) => {
  let title = '你确定要拉黑这个会员'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/memMember/ToBlickList', { memberId: val.id }).then(() => {
      ElMessage('操作成功')
      AdddialogFormVisible.value = false
      getMemberData()
    })
  })
}
const handleRemove = (val) => {
  getCardData()
  bindCardData.value.memberId = val.id
  bindCardDialogVisible.value = true
}

const addPoints = (val) => {
  OperationPointsTitle.value = '添加积分'
  operationPoints.value.MemberId = val.id
  operationPoints.value.type = 1
  operationPoints.value.remarks = ''
  operationPoints.value.points = 0
  dialogPointVisible.value = true
}
const reducePoints = (val) => {
  OperationPointsTitle.value = '扣除积分'
  operationPoints.value.MemberId = val.id
  operationPoints.value.type = 0
  operationPoints.value.remarks = ''
  operationPoints.value.points = 0
  dialogPointVisible.value = true
}
</script>

<style scoped>
.avatar-uploader .avatar {
  display: block;
  width: 120px;
  height: 120px;
}
</style>

<style>
.avatar-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  width: 120px;
  height: 120px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}

.buttonOfTables {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-content: center;
}

.bt {
  width: 100px;
  margin-top: 10px;
}
</style>
