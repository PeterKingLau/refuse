<template>
  <el-row>
    <el-form :model="searchFormData" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="产品编号：">
        <el-input v-model="searchFormData.id" class="eInput" placeholder="请输入产品编号" />
      </el-form-item>
      <el-form-item label="产品名称：">
        <el-input v-model="searchFormData.name" class="eInput" placeholder="请输入产品名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="getProductData" v-hasPermi="Permission.sec">
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
      :data="productTableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" width="60" property="id" />
      <el-table-column label="产品名称" width="100" property="name" />
      <el-table-column v-slot="scope" label="图片" width="120">
        <img :src="getImageURL(scope.row.pic)" class="imgOfTable" />
      </el-table-column>

      <el-table-column label="外设" width="120">
        <template #default="scope">
          <div v-for="item in scope.row.peripherals" :key="item.id">
            <div class="depInTable">{{ item.label }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="产品规格" width="100" property="specifications" />
      <el-table-column label="创建人" width="100" property="staff.name" />
      <el-table-column label="创建时间" width="180" property="createTime" />
      <el-table-column label="授权人" width="100" property="authorizer.name" />
      <el-table-column label="授权时间" width="180" property="authorizedTime" />
      <el-table-column label="操作" v-slot="scope" width="150">
        <div class="buttonOfTables">
          <el-link class="bt" type="success" @click="handleDetail(scope.row)">查看</el-link>
          <el-link
            class="bt"
            type="danger"
            @click="handleRemove(scope.row)"
            v-hasPermi="Permission.emp"
            >授权</el-link
          >
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
        layout="prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleSizeChange"
      />
    </el-col>
  </el-row>

  <el-dialog title="添加产品类型" width="60%" v-model="showDialog">
    <el-form :model="updateForm" :inline="true" label-width="auto" class="frame">
      <el-row>
        <el-col :span="12">
          <el-form-item label="产品名称：" label-width="100">
            <el-input v-model="updateForm.name" placeholder="请输入类型名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品规格：" label-width="100">
            <el-input v-model="updateForm.specifications" placeholder="请输入类型规格" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="图片" label-width="100">
            <el-upload
              class="avatar-uploader"
              :action="UpImageURL"
              :show-file-list="false"
              :on-success="handleUpdateSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="headObject"
            >
              <img v-if="updateForm.pic" :src="getImageURL(updateForm.pic)" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品外设：" label-width="100">
            <el-select
              v-model="updateForm.peripheralList"
              multiple
              placeholder="请选择产品外设"
              style="width: 240px"
            >
              <el-option
                v-for="item in PeripheralTreeData"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row class="margeTop">
        <el-col :span="24" style="text-align: right">
          <el-button @click="onCloseDialog">取消</el-button>
          <el-button type="primary" @click="onAddConfirm"> 确认 </el-button>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>

  <el-dialog title="查看产品类型" width="40%" v-model="showCheckDialog">
    <el-form :model="currentData" label-width="100">
      <el-form-item label="产品名称">
        {{ currentData.name }}
      </el-form-item>
      <el-form-item label="图片">
        <img :src="getImageURL(currentData.pic)" class="pic" />
      </el-form-item>
    </el-form>
    <el-form-item label="外设" label-width="100">
      <div class="vv">
        <div class="bb" v-for="item in currentData.peripherals" :key="item.id">{{
          item.label
        }}</div>
      </div>
    </el-form-item>
    <el-form-item label="总授权数量" label-width="100"> {{ cc.count }}台 </el-form-item>
    <el-form-item label="剩余授权数量" label-width="100"> {{ cc.cc }}台 </el-form-item>
    <el-form-item label="创建人" label-width="100">
      {{ currentData.authorizer.name }}
    </el-form-item>
    <el-form-item label="创建时间" label-width="100">
      {{ currentData.authorizedTime }}
    </el-form-item>
  </el-dialog>

  <el-dialog title="授权产品信息" width="40%" v-model="showAuthorizationDialog">
    <el-form :model="authData" :inline="true" label-width="auto" class="frame" :rules="rules">
      <el-row>
        <el-form-item label="产品名称:" label-width="120" prop="name">
          <span>{{ authData.name }}</span>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="图片:" label-width="120">
          <img v-if="authData.pic" :src="getImageURL(authData.pic)" class="imgOfTable" />
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="授权运营商:" label-width="120" prop="region">
          <el-select
            v-model="authData.departmentId"
            placeholder="请选择要授权的运营商"
            ref="pointTpteSelectRef"
          >
            <el-option
              v-for="item in Departments"
              :key="item.id"
              :label="item.platform_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="规格类型:" label-width="120" prop="region">
          <el-select v-model="authData.type" placeholder="请选择规格类型">
            <el-option label="常规型" :value="1" />
          </el-select>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="授权数量:" label-width="120" prop="numberOfAuth">
          <el-input v-model="authData.numberOfAuth" placeholder="请输入授权数量" />
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="收费金额:" label-width="120" prop="money">
          <el-input v-model="authData.money" placeholder="请输入收费的金额" />
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="免费时长:" label-width="120" prop="free">
          <el-input v-model="authData.free" placeholder="请输入免费时长： 单位：(天/台)" />
        </el-form-item>
      </el-row>

      <el-row class="margeTop">
        <el-col :span="24" style="margin-top: 5px; text-align: right">
          <el-button @click="onclostAuthDialog">取消</el-button>
          <el-button type="primary" @click="doAuth"> 确认 </el-button>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, Ref, computed, onMounted, reactive, inject } from 'vue'
import { PATH_URL, service } from '@/config/axios/service'

import { ElSelect, ElMessage, ElMessageBox, FormRules } from 'element-plus'
import qs from 'qs'
const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const Permission = ref({
  add: 'mac_pro_add',
  rev: 'mac_pro_rev',
  del: 'mac_pro_del',
  emp: 'mac_pro_emp',
  sec: 'mac_pro_sec'
})

onMounted(() => {
  getPeripheralData()
  getProductType()
  getDepartments()
})
interface tableData {
  id: number | undefined
  name: string
  pic: string
  specifications: string
  createTime: string
  numberOfAuthorized: number
  money: number
  numberFree: number
  staff?: any
  authorized?: any
  toDepartment?: any
  department?: any
  peripheralList?: []
}

interface SearchData {
  id: number | undefined | string
  name: string
}

let updateForm: Ref<tableData> = ref({
  id: 0,
  name: '',
  pic: '',
  specifications: '',
  numberOfAuthorized: 0,
  money: 0,
  createTime: '',
  numberFree: 0
})

let productTableData: Ref<tableData[]> = ref([])

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

let searchFormData: Ref<SearchData> = ref({ id: undefined, name: '' })
const onReset = () => {
  searchFormData.value.id = undefined
  searchFormData.value.name = ''
}

let showSearchForm = ref(true)
const getProductData = () => {
  getProductType()
}

//#region  添加按钮相关

const OnClickAdd = () => {
  showDialog.value = true
}

let disableUpdate = ref(true)
let disableRemove = ref(true)

const deleteOfDetail = () => {
  let title = '你确定要删除这些产品类型吗？'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    doRemove(DeleteIdArray)
  })
}
const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

//#endregion

//#region  添加dialog 相关
let showDialog = ref(false)

const onCloseDialog = () => {
  showDialog.value = false
}
let isUpdate = false
const onAddConfirm = () => {
  if (isUpdate) {
    onUpdate()
    return
  }

  let title = '你确定要添加这个产品类别'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/addProduct',
        qs.stringify(
          {
            name: updateForm.value.name,
            pic: updateForm.value.pic,
            spec: updateForm.value.specifications,
            ids: updateForm.value.peripheralList
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        showDialog.value = false
        getProductType()
      })
  })
}

const onUpdate = () => {}

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})

const handleUpdateSuccess = (respon) => {
  if (respon.code == 200) {
    updateForm.value.pic = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}

const beforeAvatarUpload = () => {}
const headObject = {
  Authorization: localStorage.getItem('token')
}

interface PeripheralData {
  id: number
  label: string
}

let PeripheralTreeData: Ref<PeripheralData[]> = ref([])
const getPeripheralData = () => {
  service.get(PATH_URL + '/MachineMange/getPeripheral').then((res) => {
    console.log(res)
    PeripheralTreeData.value = res.data
  })
}

let currentPage = ref(1)
let pageSize = ref(10)
let small = ref(false)
let total = ref(0)
let handleSizeChange = () => {}

const getProductType = () => {
  let parm = {
    id: searchFormData.value.id,
    name: searchFormData.value.name,
    page: currentPage.value,
    size: pageSize.value
  }
  service.post(PATH_URL + '/MachineMange/getProduct', parm).then((res) => {
    console.log(res)
    productTableData.value = res.data
  })
}

let showCheckDialog = ref(false)
let currentData: Ref<any> = ref({})
let cc: Ref<any> = ref({})
const handleDetail = (val) => {
  currentData.value = val
  service.get(PATH_URL + '/MachineMange/getEmpower?productId=' + val.id).then((res: any) => {
    console.log('rr', res)
    cc.value = res.data
    console.log('reflect', cc)
  })

  showCheckDialog.value = true
  console.log('currentData', currentData.value)
}

const handleRemove = (val) => {
  showAuthorizationDialog.value = true
  console.log('hahsh', val)
  authData.value.id = val.id
  authData.value.name = val.name
  authData.value.free = 365
  authData.value.money = 100
  authData.value.numberOfAuth = 100
  authData.value.departmentId = ''
  authData.value.pic = val.pic
  authData.value.type = 1
}
//#endregion

//#region 授权 dialog

let authData = ref({
  id: 0,
  pic: '',
  departmentId: {},
  numberOfAuth: 0,
  money: 0,
  free: 0,
  name: '',
  type: 1
})

let showAuthorizationDialog = ref(false)

interface DepartmentStruct {
  id: number | string
  platform_name: string
}

let Departments: Ref<DepartmentStruct[]> = ref([])

const getDepartments = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res) => {
    console.log(res)
    Departments.value = res.data
  })
}

const onclostAuthDialog = () => {
  showAuthorizationDialog.value = false
}
const doAuth = () => {
  let title = '你确定要授权这个产品类别'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/AuthorizeThePorduct',
        qs.stringify(
          {
            productId: authData.value.id,
            departmentId: authData.value.departmentId,
            number: authData.value.numberOfAuth,
            money: authData.value.money,
            free: authData.value.free,
            type: authData.value.type
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        showAuthorizationDialog.value = false
        getProductType()
      })
  })
}

const doRemove = (ids: number[]) => {
  service
    .post(
      PATH_URL + '/MachineMange/deletrProduct',
      qs.stringify(
        {
          ids: ids
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then(() => {
      ElMessage('操作成功')
      getProductType()
    })
}

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入产品类型名称', trigger: 'blur' }],
  region: [
    {
      required: true,
      message: '请选择要授权的运营商',
      trigger: 'blur'
    }
  ],
  numberOfAuth: [
    {
      type: 'number',
      required: true,
      message: '请输入要授权的设备数量',
      trigger: 'blur'
    }
  ],
  money: [
    {
      required: true,
      message: '请输入收费金额',
      trigger: 'blur'
    }
  ],
  free: [
    {
      required: true,
      message: '请输入免费时长',
      trigger: 'blur'
    }
  ]
})

//#endregion
</script>

<style scoped>
.imgOfTable {
  width: 100px;
  height: 100px;
}

.pic {
  width: 200px;
  height: auto;
}

.bt {
  margin-left: 20px;
}

.depInTable {
  margin: 2px;
  background-color: rgb(210, 240, 230);
}
</style>
