<template>
  <el-row class="rr">
    <el-form :model="SearchForm" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="产品类型" label-width="90">
        <el-select
          v-model="SearchForm.productId"
          placeholder="请选择产品类型"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in PorductTypeArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="型号名称：" label-width="90">
        <el-input v-model="SearchForm.deviceTypeName" class="eInput" placeholder="请输入型号名称" />
      </el-form-item>
      <el-form-item label="仓位数量：" label-width="90">
        <el-input v-model="SearchForm.warehouses" class="eInput" placeholder="请输入仓位数量" />
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

      <el-link
        type="success"
        class="btn"
        :disabled="disableUpdate"
        v-if="false"
        v-hasPermi="Permission.rev"
        ><el-icon><EditPen /></el-icon>修改</el-link
      >
      <el-button
        type="danger"
        v-if="false"
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
      :data="TableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="记录编号" width="100" property="id" />
      <el-table-column label="产品类型" width="100" property="product.name" />

      <el-table-column label="型号名称" width="100" property="name" />
      <el-table-column label="仓位数量" width="100" property="warehouse" />
      <el-table-column label="生产厂家" width="100" property="manufacturer" />
      <el-table-column label="屏幕类型" width="100">
        <template #default="scope">
          <span>{{ converScreenModel(scope.row.screenModel) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="屏幕尺寸" width="100" property="screenClass.label" />
      <el-table-column label="创建时间" width="180" property="createTime" />
      <el-table-column label="创建人" width="100" property="staff.name" />
      <el-table-column label="操作时间" width="180" property="updateTime" />
      <el-table-column label="操作" v-slot="scope" width="150">
        <div class="buttonOfTables">
          <el-link
            class="bt"
            type="success"
            @click="handleDetail(scope.row)"
            v-hasPermi="Permission.del"
            >修改</el-link
          >
          <el-link
            class="bt"
            type="danger"
            @click="handleRemove(scope.row)"
            v-hasPermi="Permission.del"
            >删除</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>

  <el-dialog v-model="addDialogFormVisible" :title="updateTitle">
    <el-form :model="addFormData" label-width="100">
      <el-row>
        <el-form-item label="产品类型:" label-width=" 100">
          <el-select
            v-model="addFormData.product"
            placeholder="Select"
            ref="pointTpteSelectRef"
            :disabled="isUpdate"
          >
            <el-option
              v-for="item in PorductTypeArray"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="型号名称:" label-width="100">
          <el-input v-model="addFormData.name" placeholder="请输入型号名称" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="图片" label-width="100">
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
      </el-row>
      <el-row>
        <el-form-item label="生产厂家:" label-width="100">
          <el-input v-model="addFormData.manufacturer" placeholder="请输入生产厂家名称" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="仓位数量:" label-width="100">
          <el-input-number v-model="addFormData.warehouse" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="屏幕模式:" label-width="100">
          <el-radio-group v-model="addFormData.screenModel" @change="screenModelSelect">
            <el-radio :label="1">横屏</el-radio>
            <el-radio :label="2">竖屏</el-radio>
            <el-radio :label="0">无屏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="屏幕尺寸:" label-width=" 100" v-if="showScreenClassSelect">
          <el-select
            v-model="addFormData.screenClass"
            placeholder="请选择屏幕尺寸"
            ref="pointTpteSelectRef"
          >
            <el-option
              v-for="item in ScreenClassArray"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-row>
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
import { ref, Ref, onMounted, computed, inject } from 'vue'

import { ElSelect, ElMessage, ElMessageBox, ElTable } from 'element-plus'
import qs from 'qs'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const Permission = ref({
  add: 'mac_dvt_add',
  rev: 'mac_dvt_rev',
  del: 'mac_dvt_del',
  sec: 'mac_dvt_sec'
})

//#region 数据结构
interface SearchDataStruct {
  productId: number | undefined
  deviceTypeName: string
  warehouses: number | undefined
}

interface ProductTypeStruct {
  id: number
  name: string
}

interface DeviceTypeStrcut {
  id: number
  product: any
  name: string
  warehouse: number
  manufacturer: string
  screenClass: any
  screenModel: number
  createTime: string
  staff: any
  updateTime: string
  pic: string
}

interface ScreenClassStruct {
  id: number
  label: string
}

//#endregion

//#region  初始化
let ScreenClassArray: Ref<ScreenClassStruct[]> = ref([])
const getScreenClassData = () => {
  service.get(PATH_URL + '/MachineMange/getScreenClass').then((res) => {
    ScreenClassArray.value = res.data
  })
}

onMounted(() => {
  getDeviceTypeData()
  getProductTypeData()
  getScreenClassData()
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

const getProductTypeData = () => {
  let parm = {
    id: '',
    name: '',
    page: 1,
    size: 99999
  }
  service.post(PATH_URL + '/MachineMange/getProduct', parm).then((res) => {
    console.log(res)
    PorductTypeArray.value = res.data
  })
}

//#endregion
//#region 搜索框

let PorductTypeArray: Ref<ProductTypeStruct[]> = ref([])

let showSearchForm = ref(true)
let SearchForm: Ref<SearchDataStruct> = ref({
  productId: undefined,
  deviceTypeName: '',
  warehouses: undefined
})

const onSearch = () => {
  getDeviceTypeData()
}
const onReset = () => {
  SearchForm.value = {
    productId: undefined,
    deviceTypeName: '',
    warehouses: undefined
  }
}

//#endregion

//#region  中间添加按钮
let disableUpdate = ref(true)
let disableRemove = ref(true)
const OnClickAdd = () => {
  updateTitle.value = '添加设备类型'
  iniaddFormData()
  addDialogFormVisible.value = true
  isUpdate.value = false
}

const iniaddFormData = () => {
  addFormData.value.product = 1
  addFormData.value.name = ''
  addFormData.value.pic = ''
  addFormData.value.manufacturer = ''
  addFormData.value.warehouse = 0
  addFormData.value.screenModel = 0
  addFormData.value.screenClass = ''
  addFormData.value.id = 0
}

const deleteOfDetail = () => {}
const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}
//#endregion

//#region 添加dialog
let updateTitle = ref('')
let addDialogFormVisible = ref(false)

let addFormData: Ref<DeviceTypeStrcut> = ref({
  id: 0,
  product: null,
  name: '',
  warehouse: 0,
  manufacturer: '',
  screenClass: null,
  screenModel: 0,
  createTime: '',
  staff: null,
  updateTime: '',
  pic: ''
})

let isUpdate = ref(false)

let onAddConfirm = () => {
  let title = ''
  if (isUpdate.value) {
    title = '你确定要修改这个设备类型'
    doUpdataDeviceType(title)
    return
  } else {
    title = '你确定要添加这个设备类型'
    doAddDeviceType(title)
  }
}

const doAddDeviceType = (title) => {
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let mode = null
    if (addFormData.value.screenModel != 0) {
      mode = addFormData.value.screenClass
    }
    service
      .post(
        PATH_URL + '/MachineMange/addDeviceType',
        qs.stringify(
          {
            product: addFormData.value.product,
            name: addFormData.value.name,
            warehouse: addFormData.value.warehouse,
            manufacturer: addFormData.value.manufacturer,
            screenClass: mode,
            screenModel: addFormData.value.screenModel,
            pic: addFormData.value.pic
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getDeviceTypeData()
        addDialogFormVisible.value = false
      })
  })
}

const doUpdataDeviceType = (title) => {
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let model = null
    if (addFormData.value.screenModel != 0) {
      model = addFormData.value.screenClass
    }
    service
      .post(
        PATH_URL + '/MachineMange/updateDeviceType',
        qs.stringify(
          {
            id: addFormData.value.id,
            name: addFormData.value.name,
            warehouse: addFormData.value.warehouse,
            manufacturer: addFormData.value.manufacturer,
            screenClass: model,
            screenModel: addFormData.value.screenModel,
            pic: addFormData.value.pic
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getDeviceTypeData()
        addDialogFormVisible.value = false
      })
  })
}

const handleUpdateSuccess = (respon) => {
  if (respon.code == 200) {
    addFormData.value.pic = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}
const beforeAvatarUpload = () => {}
let showScreenClassSelect = ref(false)

const screenModelSelect = (val) => {
  console.log('screenModel', val)
  if (val == 0) {
    showScreenClassSelect.value = false
  } else {
    showScreenClassSelect.value = true
  }
}

//#endregion

//#region  表格相关
let areaTableRef = ref(ElTable)
let TableData: Ref<DeviceTypeStrcut[]> = ref([])
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

const handleDetail = (val: DeviceTypeStrcut) => {
  console.log('val', val)
  isUpdate.value = true
  addFormData.value.product = val.product.id
  addFormData.value.name = val.name
  addFormData.value.pic = val.pic
  addFormData.value.manufacturer = val.manufacturer
  addFormData.value.warehouse = val.warehouse
  addFormData.value.screenModel = val.screenModel
  addFormData.value.screenClass = val.screenClass?.id
  addFormData.value.id = val.id
  updateTitle.value = '修改设备类型'
  addDialogFormVisible.value = true
  screenModelSelect(addFormData.value.screenModel)
}

const handleRemove = (val) => {
  ElMessageBox.confirm('你确定要删除这个设备类型?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/deleteDeviceType',
        qs.stringify(
          {
            id: val.id
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getDeviceTypeData()
        addDialogFormVisible.value = false
      })
  })
}

//获取图片的地址
const converScreenModel = computed(() => (val: number) => {
  let temp = ''
  switch (val) {
    case 0:
      temp = '无屏'
      break
    case 1:
      temp = '横屏'
      break
    case 2:
      temp = '竖屏'
      break
  }
  return temp
})

const getDeviceTypeData = () => {
  service
    .post(
      PATH_URL + '/MachineMange/getDeviceType',
      qs.stringify(
        {
          productId: SearchForm.value.productId,
          name: SearchForm.value.deviceTypeName,
          warehouse: SearchForm.value.warehouses
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res) => {
      console.log('deviceType', res)
      TableData.value = res.data
    })
}

//#endregion
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

.bt {
  margin-left: 20px;
}

.el-icon.avatar-uploader-icon {
  width: 120px;
  height: 120px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
</style>
