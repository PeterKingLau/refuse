<template>
  <el-row class="rr">
    <el-form :model="form" label-width="100px" :inline="true" v-if="showForm">
      <el-form-item label="昵称：">
        <el-input v-model="form.nickName" class="eInput" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="联系人：">
        <el-input v-model="form.contacts" class="eInput" placeholder="请输入联系人" />
      </el-form-item>

      <el-form-item label="公司电话">
        <el-input v-model="form.fixed_telephone" class="eInput" placeholder="请输入公司电话" />
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
    <el-col :span="12">
      <el-button type="primary" class="btn" @click="OnClickAdd" v-hasPermi="Permission.add">
        <el-icon><Plus /> </el-icon>
        新增</el-button
      >

      <el-button type="success" class="btn" :disabled="disableUpdate" v-hasPermi="Permission.rev"
        ><el-icon><EditPen /></el-icon>修改</el-button
      >
      <el-button
        type="danger"
        class="btn"
        :disabled="disableRemove"
        @click="BatchDelete"
        v-hasPermi="Permission.del"
        ><el-icon><Close /></el-icon>删除</el-button
      >
    </el-col>

    <el-col :span="12" class="right">
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

  <el-row style="margin-top: 20px">
    <el-table
      ref="multipleTableRef"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" width="60" property="id" />

      <el-table-column property="corporate_name" label="公司名称" width="120" />
      <el-table-column v-slot="scope" label="公司Logo" width="120">
        <img :src="getImageURL(scope.row.logo_path)" class="imgOfTable" />
      </el-table-column>
      <el-table-column property="nick_name" label="昵称" width="120" />
      <el-table-column property="platform_name" label="平台名称" width="120" />
      <el-table-column property="abbreviation" label="简称" width="120" />
      <el-table-column property="fixed_telephone" label="公司电话" width="120" />

      <el-table-column property="remarks" label="备注" width="120" />
      <el-table-column label="操作" v-slot="scope" width="150">
        <div class="buttonOfTables">
          <el-link
            type="success"
            class="bt"
            @click="handleDetail(scope.row)"
            v-hasPermi="Permission.rev"
            >编辑</el-link
          >
          <el-link
            type="danger"
            class="bt"
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
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-row>

  <el-dialog title="添加运营商" width="60%" v-model="showDialog">
    <el-form :model="updateForm" :rules="rules" :inline="true" label-width="auto">
      <el-row>
        <el-col :span="12">
          <el-form-item label="昵称:" prop="nickName">
            <el-input v-model="updateForm.nick_name" placeholder="请输入昵称" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="简称:" prop="abbreviation">
            <el-input v-model="updateForm.abbreviation" placeholder="请输入简称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="联系人:">
            <el-input v-model="updateForm.contacts" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人号码：">
            <el-input v-model="updateForm.phone" placeholder="请输入联系人号码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="公司名称:" prop="corporateName">
            <el-input v-model="updateForm.corporate_name" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公司电话:">
            <el-input v-model="updateForm.fixed_telephone" placeholder="请输入联系人号码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="公司Logo">
            <el-upload
              class="avatar-uploader"
              :action="UpImageURL"
              :show-file-list="false"
              :on-success="handleUpdateSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="headObject"
            >
              <img
                v-if="updateForm.logo_path"
                :src="getImageURL(updateForm.logo_path)"
                class="avatar"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Icon">
            <el-upload
              class="avatar-uploader"
              :action="UpImageURL"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="headObject"
            >
              <img
                v-if="updateForm.ico_path"
                :src="getImageURL(updateForm.ico_path)"
                class="avatar"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="平台名称：" prop="platformName">
            <el-input v-model="updateForm.platform_name" placeholder="请输入平台名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12" />
      </el-row>

      <el-row>
        <el-col :span="3" class="toRight">
          <label> 备注：</label>
        </el-col>
        <el-col :span="18" class="test">
          <el-input type="textarea" v-model="updateForm.remarks" placeholder="备注" :rows="4" />
        </el-col>
      </el-row>

      <el-row class="margeTop">
        <el-col :span="24" class="toRight">
          <button type="button" class="btnConfirm" @click="onClickConfirm">确认</button>

          <button type="button" class="btnCancel" @click="showDialog = false"> 取消</button>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, Ref, inject } from 'vue'
import { ElMessage, FormRules, ElMessageBox } from 'element-plus'

import { service, PATH_URL } from '@/config/axios/service'
import { computed } from 'vue'
import { AxiosRequestConfig } from 'axios'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

//#region 分页相关

const Permission = ref({
  add: 'cha_wrp_add',
  rev: 'cha_wrp_rev',
  del: 'cha_wrp_del',
  sec: 'cha_wrp_sec'
})

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)

const handleSizeChange = () => {
  handleCurrentChange()
}

const handleCurrentChange = () => {
  getDepartmentData()
}

//#endregion

//#region  表格中按钮处理

const handleDetail = (data: DepartmentData) => {
  dialogType.value = 2
  Object.keys(updateForm).forEach((key) => {
    updateForm[key] = data[key]
  })
  showDialog.value = true
}

const handleRemove = (data: DepartmentData) => {
  ElMessageBox.confirm('确定要删除这个运营商？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      let temp: AxiosRequestConfig = {}
      temp.params = { id: data.id }

      service.get(PATH_URL + '/Permission/deletDepartment', temp).then(() => {
        ElMessage('删除记录成功')
        getDepartmentData()
      })
    })
    .catch(() => {})
}

//#endregion

//#region  搜索  重置 按钮处理

const onReset = () => {
  form.contacts = ''
  form.fixed_telephone = ''
  form.nickName = ''
}

const onSearch = () => {
  getDepartmentData()
}

//#endregion

//是否显示form
const showForm = ref(true)

const disableUpdate = ref(true)
const disableRemove = ref(true)

const showDialog = ref(false)

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

interface DepartmentData {
  id: 0
  nick_name: ''
  abbreviation: ''
  contacts: ''
  phone: ''
  corporate_name: ''
  fixed_telephone: ''
  logo_path: ''
  ico_path: ''
  platform_name: ''
  remarks: ''
}

//标记 dialog 是添加还是修改
const dialogType = ref(1)

const OnClickAdd = () => {
  Object.keys(updateForm).forEach((key) => {
    if (key == 'id') {
      updateForm.id = 0
    } else {
      updateForm[key] = ''
    }
  })

  dialogType.value = 1 //设置是添加
  showDialog.value = true
}

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})

const headObject = {
  Authorization: localStorage.getItem('token')
}

const rules = reactive<FormRules>({
  nick_name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  abbreviation: [{ required: true, message: '请输入简称', trigger: 'blur' }],
  corporate_name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  platform_name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }]
})

const OnClickOfShowForm = () => {
  showForm.value = !showForm.value
}

const beforeAvatarUpload = () => {}

const handleAvatarSuccess = (respon) => {
  if (respon.code == 200) {
    updateForm.ico_path = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}

const handleUpdateSuccess = (respon) => {
  if (respon.code == 200) {
    updateForm.logo_path = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}

//const tableData: DepartmentData[] = reactive([])
const tableData: Ref<any[]> = ref([])

const getDepartmentData = () => {
  let config: AxiosRequestConfig = {}
  let temp = {
    index: currentPage.value,
    size: pageSize.value,
    nickName: form.nickName,
    contacts: form.contacts,
    phone: form.fixed_telephone
  }

  config.params = temp
  service
    .post(PATH_URL + '/Permission/getDepartment', temp)
    .then((res: any) => {
      console.log('department', res)
      tableData.value = res.data.records
      total.value = res.data.total
    })

    .catch(() => {})
}

onMounted(() => {
  getDepartmentData()
})

const form = reactive({
  nickName: '',
  contacts: '',
  fixed_telephone: ''
})

const updateForm: DepartmentData = reactive({
  id: 0,
  nick_name: '',
  abbreviation: '',
  contacts: '',
  phone: '',
  corporate_name: '',
  fixed_telephone: '',
  logo_path: '',
  ico_path: '',
  platform_name: '',
  remarks: '',
  createTime: '',
  updateTime: '',
  status: ''
})

//#region  批量删除
const BatchDelete = () => {
  ElMessageBox.confirm('确定要删除这些记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      doBatchDelete()
    })
    .catch(() => {})
}

const doBatchDelete = () => {
  let id: number[] = []
  DeleteIdArray.forEach((row) => {
    id.push(row)
  })
  service
    .post(PATH_URL + '/Permission/deleteDeparmentOfBatch', id)
    .then(() => {
      ElMessage('删除成功')
    })
    .finally(() => {
      getDepartmentData()
    })
}

//#endregion

//提交新添加的  运营商
const onClickConfirm = () => {
  addDepartment()
}

//添加运营商
const addDepartment = () => {
  let messaget = '是否要添加这个运营商?'
  if (dialogType.value == 2) {
    messaget = '是否要修改这个运营商'
  }

  ElMessageBox.confirm(messaget, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      doAddDepartment()
    })
    .catch(() => {})
}

const doAddDepartment = () => {
  service.post('/Permission/addDepartment', updateForm).then(() => {
    if (dialogType.value == 1) {
      ElMessage('添加记录成功！')
    } else {
      ElMessage('修改运营商信息成功')
    }
    showDialog.value = false
    getDepartmentData()
  })
}
</script>

<style lang="less" scoped>
@borderColor: #7b9dc5;
@backColor: #6c6af4;

@import '../../styles/public.less';

.buttonOfTables {
  display: inline;
  padding-right: 5px;
  padding-left: 5px;
}

.imgOfTable {
  width: 100px;
  height: 100px;
}

.margeTop {
  margin-top: 15px;
}

.toRight {
  padding-right: 10px;
  text-align: right;
}

.test {
  background-color: #6c6af4;
  widows: 100%;
}

.test1 {
  background-color: #7b9dc5;
}

.avatar-uploader .avatar {
  display: block;
  width: 100px;
  height: 100px;
}

.right {
  text-align: right;
}

#mb-4 {
  border: 3em solid @borderColor;
}

.rr {
  text-align: left;
}

.btn {
  width: 7rem;
  height: 2rem;
}

.eInput {
  width: 12rem;
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

.bt {
  margin-left: 20px;
}

.el-icon.avatar-uploader-icon {
  width: 178px;
  height: 178px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
</style>
