<template>
  <div>
    <el-container>
      <el-aside width="160px">
        <el-input v-model="filterText" placeholder="搜索" />

        <el-tree
          ref="treeRef"
          class="filter-tree"
          :data="treeData"
          :props="defaultProps"
          highlight-current
          :expand-on-click-node="false"
          default-expand-all
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        />
      </el-aside>
      <el-main>
        <el-row>
          <el-form :model="Search" :inline="true" class="frame" v-if="showSearchForm">
            <el-form-item label="用户名称：" label-width="100">
              <el-input v-model="SearchFormData.name" placeholder="请输入用户名称" />
            </el-form-item>

            <el-form-item label="手机号码：" label-width="100">
              <el-input v-model="SearchFormData.phone" placeholder="请输入用户电话" />
            </el-form-item>

            <el-form-item label="状态：" label-width="60">
              <el-select v-model="SearchFormData.status" placeholder="用户状态">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间:">
              <el-date-picker
                v-model="dateSelect"
                type="daterange"
                range-separator="到"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                size="default"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="getStaffData" v-hasPermi="Permission.sec">
                <el-icon><Search /></el-icon>
                搜索</el-button
              >
              <el-button class="btn" @click="onReset">
                <el-icon class="el-icon--left"><RefreshRight /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-row>
        <el-row class="buttons">
          <el-col :span="18">
            <el-button type="primary" @click="onClickAdd" v-hasPermi="Permission.add"
              >增加</el-button
            >
            <el-button type="success" v-if="false" v-hasPermi="Permission.rev">修改</el-button>
            <el-button
              type="danger"
              :disabled="EnableDelete"
              @click="onClickDelete"
              v-hasPermi="Permission.del"
              >删除</el-button
            >
            <el-button type="warning">导出</el-button>
          </el-col>
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

        <el-row style="margin-top: 10px">
          <el-table
            ref="tableRef"
            width="100%"
            :data="tableData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="记录编号" width="80" property="id" />
            <el-table-column label="登录账户" width="100" property="admin.username" />
            <el-table-column label="用户名称" width="100" property="name" />
            <el-table-column label="运营商" width="100" property="department.platformName" />
            <el-table-column v-slot="scope" label="头像" width="120">
              <img :src="getImageURL(scope.row.logoPath)" class="imgOfTable" />
            </el-table-column>

            <el-table-column label="角色" width="120">
              <template #default="scope">
                <div v-for="item in scope.row.characters" :key="item.id">
                  <div class="depInTable">{{ item.name }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="手机号" width="100" property="phone" />
            <el-table-column label="绑定卡号" width="150" property="cardId" />
            <el-table-column label="状态" width="180">
              <template #default="scope">
                <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="100" property="createTime" />
            <el-table-column label="操作" v-slot="scope" width="180">
              <div class="buttonOfTables">
                <el-link
                  type="primary"
                  class="bt"
                  @click="onClickUpdateDataMode(scope.row)"
                  v-hasPermi="Permission.rev"
                  >修改</el-link
                >
                <el-link
                  class="bt"
                  type="primary"
                  @click="handleRemove(scope.row)"
                  v-hasPermi="Permission.del"
                  >删除</el-link
                >
                <el-link
                  class="bt"
                  type="primary"
                  @click="openUpdatePwdDialog(scope.row)"
                  v-hasPermi="Permission.ret"
                  >重置</el-link
                >
              </div>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row style="width: 100%; text-align: right">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 15, 20]"
            :small="false"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-row>
      </el-main>
    </el-container>
  </div>

  <!--添加界面 dialog-->
  <el-dialog v-model="addDialogVisible" title="添加/修改员工信息" width="50%">
    <template #footer>
      <el-form :model="addFormData" class="frame">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名称" label-width="100">
              <el-input v-model="addFormData.name" placeholder="请输入用户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" label-width="80">
              <el-select v-model="addFormData.character" placeholder="" multiple>
                <el-option
                  v-for="item in characters"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="运营商" label-width="100">
              <el-tree-select
                v-model="addFormData.department"
                :data="treeData"
                :render-after-expand="false"
                :props="defaultProps"
                :expand-on-click-node="false"
                :check-strictly="true"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" label-width="80">
              <el-select v-model="addFormData.jobs" placeholder="" multiple>
                <el-option
                  v-for="item in jobs"
                  :key="item.id"
                  :label="item.descript"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" label-width="100">
              <el-input v-model="addFormData.phone" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" label-width="80">
              <el-input v-model="addFormData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="固定电话" label-width="100">
              <el-input v-model="addFormData.fixedPhone" placeholder="请输入固定电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12" />
        </el-row>

        <el-row v-if="isAddMode">
          <el-col :span="12">
            <el-form-item label="登录账户" label-width="100">
              <el-input v-model="addFormData.loginName" placeholder="请输入用户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" label-width="80">
              <el-input v-model="addFormData.password" placeholder="" type="password" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" label-width="100">
              <el-radio-group v-model="addFormData.status" class="ml-4">
                <el-radio :label="1" size="large">正常</el-radio>
                <el-radio :label="0" size="large">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="LOGO" label-width="100">
              <el-upload
                class="avatar-uploader"
                :action="UpImageURL"
                :show-file-list="false"
                :on-success="handleUpdateSuccess"
                :before-upload="beforeAvatarUpload"
                :headers="headObject"
              >
                <img
                  v-if="addFormData.logoPath"
                  :src="getImageURL(addFormData.logoPath)"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="备注" label-width="100">
            <el-input
              v-model="addFormData.remarks"
              placeholder=""
              type="textarea"
              row="4"
              style="width: 100%"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <el-button @click="onCloseAddDialog">取消</el-button>
      <el-button type="primary" @click="onClickAddSubmit"> 确定 </el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="UpdatePwdDialogVisible" :title="updatePwdTitle" width="40%">
    <el-form :model="updatePwdFormData" :inline="true" class="frame">
      <el-form-item label="新密码" label-width="100">
        <el-input v-model="updatePwdFormData.newAdminPwd" placeholder="请输入新密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClickClosePwdDialog">取消</el-button>
        <el-button type="primary" @click="onClickRestPwd"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch, computed, Ref, inject } from 'vue'
import { Search } from '@element-plus/icons-vue'

import { PATH_URL, service } from '@/config/axios/service'
import { ElTree, ElMessageBox, ElMessage, ElTable } from 'element-plus'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

let showSearchForm = ref(true)

const Permission = ref({
  add: 'pow_stf_add',
  rev: 'pow_stf_rev',
  del: 'pow_stf_del',
  ret: 'pow_stf_ret',
  sec: 'pow_stf_sec'
})

let characters: Ref<any[]> = ref([])

let jobs: Ref<any[]> = ref([])

const getJobs = () => {
  service.get(PATH_URL + '/Permission/getJobOfUser').then((res) => {
    console.log(res)
    jobs.value = res.data
  })
}

//#region 修改资料
let isAddMode = ref(true)
let addDialogTitle = ref('')

const onClickUpdateDataMode = (data) => {
  isAddMode.value = false
  addDialogTitle.value = '修改员工信息'

  addFormData.value.id = data.id
  addFormData.value.name = data.name
  addFormData.value.phone = data.phone
  addFormData.value.email = data.email
  addFormData.value.fixedPhone = data.fixedTelephone
  addFormData.value.status = data.status
  addFormData.value.logoPath = data.logoPath
  addFormData.value.remarks = data.remarks
  addFormData.value.department = data.department.id

  let jj = data.jobs.map((item) => {
    console.log('item', item)
    return item.id
  })

  console.log('characters', data.jobs)
  let cc = data.characters.map((item) => {
    return item.id
  })

  addFormData.value.jobs = jj
  addFormData.value.character = cc
  console.log('addFormData', addFormData)
  addDialogVisible.value = true
}
//#endregion

//#region 删除

const handleNodeClick = (data: any) => {
  console.log(data)
  SearchFormData.departmentId = data.id
  getStaffData()
}

const handleRemove = (val: any) => {
  console.log(val)
  let d: any[] = []
  d.push(val.id)
  deleteStaff(d)
}

const onClickDelete = () => {
  let d: any[] = []
  DeleteIdArray.forEach((item) => {
    d.push(item)
  })
  deleteStaff(d)
}

const deleteStaff = (data) => {
  ElMessageBox.confirm('确定要重置这个用户的密码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/Permission/deleteStaff', data).then((res: any) => {
      if (res.code == 200) {
        ElMessage('操作成功')
        getStaffData()
      }
    })
  })
}

//#endregion

//#region 修改密码 dialog
const UpdatePwdDialogVisible = ref(false)

let updatePwdTitle = ref('')

const openUpdatePwdDialog = (data) => {
  updatePwdTitle.value = '重置' + data.admin.username + '的密码'
  updatePwdFormData.value.adminId = data.admin.id
  updatePwdFormData.value.adminName = data.admin.username
  updatePwdFormData.value.adminPwd = data.admin.password
  updatePwdFormData.value.newAdminPwd = ''
  UpdatePwdDialogVisible.value = true
  console.log(data)
}

const onClickRestPwd = () => {
  ElMessageBox.confirm('确定要重置这个用户的密码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let dd = {
      pwd: updatePwdFormData.value.newAdminPwd,
      adminId: updatePwdFormData.value.adminId
    }

    service.post(PATH_URL + '/Permission/restPwd', dd).then(() => {
      onClickClosePwdDialog()
    })
  })
}

const onClickClosePwdDialog = () => {
  UpdatePwdDialogVisible.value = false
}

const updatePwdFormData = ref({
  adminId: 0,
  adminName: '',
  adminPwd: '',
  newAdminPwd: ''
})
//#endregion

//获取可用的角色列表
const getCharacter = () => {
  service.get(PATH_URL + '/Permission/getPowCharacterForSelect').then((res) => {
    characters.value = res.data
  })
}

//#region 添加dialog 相关

const handleUpdateSuccess = (respon) => {
  if (respon.code == 200) {
    addFormData.value.logoPath = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}
const beforeAvatarUpload = () => {}

const cleanAddFormData = () => {
  addFormData.value = {
    name: '',
    character: [],
    department: 0,
    jobs: [],
    phone: '',
    email: '',
    fixedPhone: '',
    loginName: '',
    password: '',
    status: 1,
    logoPath: '',
    remarks: '',
    id: 0
  }
}

const onClickAddSubmit = () => {
  console.log('addFormData', addFormData)
  if (!isAddMode.value) {
    onUpdateStaff()
    return
  }

  if (isAddMode.value)
    ElMessageBox.confirm('确定要添加这个员工？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      service.post(PATH_URL + '/Permission/addStaff', addFormData.value).then((res: any) => {
        if (res.code == 200) onCloseAddDialog()
      })
    })
}

const onUpdateStaff = () => {
  ElMessageBox.confirm('确定要修改这个员工？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/Permission/updateStaff', addFormData.value).then(() => {
      ElMessage('操作成功')
      onCloseAddDialog()
    })
  })
}

interface AddFormStruct {
  name: string
  character: any[]
  department: number | undefined
  jobs: any[]
  phone: string
  email: string
  fixedPhone: string
  loginName: string
  password: string
  status: number | undefined
  logoPath: string
  remarks: string
  id: number | undefined
}

const addFormData: Ref<AddFormStruct> = ref({
  name: '',
  character: [],
  department: undefined,
  jobs: [],
  phone: '',
  email: '',
  fixedPhone: '',
  loginName: '',
  password: '',
  status: undefined,
  logoPath: '',
  remarks: '',
  id: undefined
})

const headObject = {
  Authorization: localStorage.getItem('token')
}

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})

const addDialogVisible = ref(false)

const onClickAdd = () => {
  addDialogTitle.value = '添加员工信息'
  isAddMode.value = true
  addDialogVisible.value = true
}

const onCloseAddDialog = () => {
  cleanAddFormData()
  addDialogVisible.value = false
  getStaffData()
}
//#endregion

//#region 表格相关

//#region  分页

const dateSelect = ref([])

const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const handleSizeChange = () => {
  handleCurrentChange()
}
const handleCurrentChange = () => {
  getStaffData()
}
//#endregion

const tableRef = ref(ElTable)

const getStaffData = () => {
  let parms = {
    index: currentPage.value,
    size: pageSize.value,
    name: SearchFormData.name,
    phone: SearchFormData.phone,
    status: SearchFormData.status,
    sTime: dateSelect.value[0],
    eTime: dateSelect.value[1],
    departmentId: SearchFormData.departmentId
  }
  service.post(PATH_URL + '/Permission/getStaff', parms).then((res) => {
    console.log('ssssss', res)
    tableData.value = res.data.records
    total.value = res.data.total
    console.log(tableData)
  })
}

let DeleteIdArray: any[] = []

let EnableDelete = ref(true)

const tableData = ref([])
const handleSelectionChange = (val) => {
  if (val.length > 0) {
    EnableDelete.value = false
  } else {
    EnableDelete.value = true
  }
  DeleteIdArray = []
  val.forEach((row: any) => {
    DeleteIdArray.push(row.id)
  })
}
//#endregion

//#region 搜索相关

const onReset = () => {
  SearchFormData.departmentId = undefined
  SearchFormData.name = ''
  SearchFormData.status = undefined
  SearchFormData.phone = ''
  dateSelect.value = []
}

//#endregion

//#region  左侧树 相关
const filterText = ref('')
const treeRef = ref(ElTree)

watch(filterText, (val) => {
  treeRef.value.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.corporateName.includes(value)
}

const defaultProps = {
  children: 'children',
  label: 'platformName',
  value: 'id'
}

const options = [
  {
    value: 1,
    label: '正常'
  },
  {
    value: 2,
    label: '停用'
  }
]

const SearchFormData = reactive({
  name: '',
  phone: '',
  status: undefined,
  departmentId: undefined
})

let treeData: Ref<any[]> = ref([])

const getDepartmentTree = () => {
  service.get(PATH_URL + '/Permission/getDepartmentTree').then((res) => {
    treeData.value = res.data
    console.log('treeData', treeData)
  })
}

//#endregion
//#region  挂载钩子函数
onMounted(() => {
  getDepartmentTree()
  getCharacter()
  getJobs()
  getStaffData()
})
//#endregion
</script>

<style lang="less" scoped>
.imgOfTable {
  width: 100px;
  height: 100px;
}

.frame {
  .el-form-item {
    .el-input {
      width: 150px;
    }

    .el-select {
      width: 150px;
    }
  }
}

.test {
  background-color: rgb(154, 169, 164);
}

.bt {
  margin-left: 20px;
}

.tree {
  width: 100%;
}

.depInTable {
  margin: 2px;
  background-color: rgb(210, 240, 230);
}

.filter-tree {
  margin-top: 10px;
}

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
  width: 80px;
  height: 80px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
</style>
