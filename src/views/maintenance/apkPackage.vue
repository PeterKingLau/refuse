<template>
  <!-- 搜索框-->
  <el-row>
    <el-form :model="searchFormData" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="设备类型：">
        <el-select v-model="searchFormData.deviceTypeId" placeholder="请选择设备类型">
          <el-option
            v-for="item in deviceTypeArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="软件类型：">
        <el-select v-model="searchFormData.parts" placeholder="请选择设备类型">
          <el-option :value="1" label="安卓升级包" />
          <el-option :value="2" label="固件升级包" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="btn"
          @click="GetApkPackageData"
          v-hasPermi="Permission.sec"
        >
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
      <el-button type="primary" class="btn" v-hasPermi="Permission.add" @click="onClickAdd">
        <el-icon><Plus /> </el-icon>
        新增</el-button
      >

      <el-button type="success" class="btn" v-hasPermi="Permission.rev" v-if="false"
        ><el-icon><EditPen /></el-icon>修改</el-button
      >
      <el-button
        type="danger"
        class="btn"
        v-hasPermi="Permission.del"
        :disabled="disableRemove"
        @click="DeleteBatch"
        ><el-icon><Close /></el-icon>删除</el-button
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
      :data="HardwareLibrary"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="记录编号" width="100" property="id" />
      <el-table-column label="软件包类型" width="100" v-slot="scope">
        {{ convertPackageType(scope.row.parts) }}
      </el-table-column>
      <el-table-column label="主版本号" width="100" property="A" />
      <el-table-column label="次版本号" width="100" property="B" />
      <el-table-column label="修改号" width="100" property="C" />
      <el-table-column label="文件名" width="300" property="file_name" />
      <el-table-column label="创建时间" width="300" v-slot="scope">
        {{ FormatDate(scope.row.create_time) }}
      </el-table-column>
      <el-table-column label="操作" width="200" v-slot="scope">
        <el-link type="primary" @click="doWork(scope.row)">推送</el-link>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 15, 20, 50, 100]"
      :small="small"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="GetApkPackageData"
      @current-change="GetApkPackageData"
    />
  </el-row>

  <!-- 添加 dialog-->

  <el-dialog v-model="AddDialogVisible" title="添加一个软件包" width="40%">
    <el-form-item label="设备类型" label-width="120px">
      <el-select v-model="AddPackageData.deviceTypeId" placeholder="请选择设备类型">
        <el-option
          v-for="item in deviceTypeArray"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <el-form :model="AddPackageData" label-width="120px">
      <el-form-item label="主版本号">
        <el-input v-model="AddPackageData.a" class="addInput" />
      </el-form-item>
      <el-form-item label="次版本号">
        <el-input v-model="AddPackageData.b" class="addInput" />
      </el-form-item>
      <el-form-item label="修改号">
        <el-input v-model="AddPackageData.c" class="addInput" />
      </el-form-item>

      <el-form-item label="软件包类型">
        <el-select v-model="AddPackageData.parts" placeholder="请选择软件包类型">
          <el-option :value="1" label="安卓软件包" />
          <el-option :value="2" label="硬件固件包" />
          <el-option :value="3" label="DTU软件包" />
          <el-option :value="4" label="DTU固件包" />
        </el-select>
      </el-form-item>

      <el-form-item label="上传文件">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :action="UpHarwarePackage"
          :on-success="handleAvatarSuccess"
          :headers="headObject"
          :limit="1"
          :on-remove="deleteFile"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text"
            >文件拖入 或者 <em>点击选择文件</em><br />仅限APK和Bin ,hex文件
          </div>
          <template #tip>
            <div class="el-upload__tip"> </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="AddPackageData.note" class="addInput" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="AddPackage()"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 推送  -->

  <el-dialog v-model="PushdialogVisible" title="推送升级包" width="30%" :before-close="handleClose">
    <el-form :model="PushData" label-width="120px">
      <el-form-item label="下载时间">
        <el-date-picker
          v-model="PushData.currentData"
          type="datetime"
          placeholder="请选择推送时间"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="推送类别">
        <el-radio-group v-model="PushData.type" class="ml-4" @change="typeChange">
          <el-radio :label="1" size="large">单一设备</el-radio>
          <el-radio :label="2" size="large">全部适合的设备</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="推送设备">
        <el-input
          v-model="PushData.serialNumber"
          placeholder="请输入要推送的设备串号"
          :disabled="signDisabled"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="PushdialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doPush"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, computed, inject } from 'vue'
import { GetInterFaceURL, FormatDate } from '@/utils/tools'
import { service, PATH_URL } from '@/config/axios/service'
import { ElMessage, UploadInstance, ElMessageBox } from 'element-plus'
import qs from 'qs'

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

//#region  页面加载
onMounted(() => {
  GetDeviceType()
  GetProduct()
  GetApkPackageData()
})

const GetProduct = () => {
  service.get(GetInterFaceURL('/Permission/getDepartmentForSelect')).then((res: any) => {
    ProductArray.value = res.data
  })
}

const GetDeviceType = () => {
  service.post(GetInterFaceURL('/MachineMange/getDeviceType')).then((res: any) => {
    deviceTypeArray.value = res.data
  })
}

//#endregion

//#region  搜索相关
const initSearchData = () => {
  searchFormData.value.deviceTypeId = undefined
  searchFormData.value.parts = undefined
}

const convertPackageType = (type: number): string => {
  let desc = '未知类型'
  switch (type) {
    case 1:
      desc = '安卓升级包'
      break
    case 2:
      desc = '固件升级包'
      break
    case 3:
      desc = 'DTU升级包'
      break
    case 4:
      desc = 'DTU固件包'
      break
  }
  return desc
}

//#endregion

//#region 按钮权限

const Permission = ref({
  add: 'mac_apk_add',
  rev: 'mac_apk_rev',
  del: 'mac_apk_del',
  emp: 'mac_apk_emp',
  sec: 'mac_apk_sec'
})

//#endregion

//#region  搜索相关

let ProductArray: Ref<any[]> = ref([])

let deviceTypeArray: Ref<any[]> = ref([])

let searchFormData: Ref<any> = ref({})

let showSearchForm = ref(true)

const onReset = () => {
  initSearchData()
}

const GetApkPackageData = () => {
  searchFormData.value.page = currentPage.value
  searchFormData.value.size = pageSize.value
  service
    .post(PATH_URL + '/HardwareLibrary/GetHardwareLib', searchFormData.value)
    .then((res: any) => {
      console.log('res', res)
      HardwareLibrary.value = res.data.records
      total.value = res.data.total
    })
}

let HardwareLibrary: Ref<any[]> = ref([])

//#endregion

//#region  添加窗口

const uploadRef = ref<UploadInstance>()

let AddPackageData: Ref<any> = ref({})
const onClickAdd = () => {
  InitAddPackageData()
  AddDialogVisible.value = true
}
// 上传图片地址
const UpHarwarePackage = computed(() => {
  return PATH_URL + '/Common/upLoadHardware'
})

const InitAddPackageData = () => {
  AddPackageData.value.a = undefined
  AddPackageData.value.b = undefined
  AddPackageData.value.c = undefined
  AddPackageData.value.deviceTypeId = undefined
  AddPackageData.value.fileName = undefined
  AddPackageData.value.parts = undefined
  AddPackageData.value.note = undefined
}

let AddDialogVisible = ref(false)

const handleAvatarSuccess = (res: any) => {
  console.log('on-success', res.data)

  if (res.data == undefined) {
    ElMessage(res.message)
    uploadRef.value!.clearFiles()
    AddPackageData.value.fileName = undefined
  } else {
    AddPackageData.value.fileName = res.data
  }
}

const deleteFile = (file) => {
  service.get(PATH_URL + '/Common/deleteHardwarePackage?fileName=' + file.name).then((res: any) => {
    console.log(res)
  })
}

const headObject = {
  Authorization: localStorage.getItem('token')
}

const AddPackage = () => {
  console.log('AddPackage', AddPackageData.value)
  if (AddPackageData.value.fileName == undefined) {
    ElMessage('请选择上传文件或等待文件上传完成')
    return
  }

  service.post(PATH_URL + '/HardwareLibrary/AddHardwareLib', AddPackageData.value).then(() => {
    ElMessage('操作成功')
    uploadRef.value!.clearFiles()
    GetApkPackageData()
    AddDialogVisible.value = false
  })
}

//#endregion

//#region 删除相关
let disableRemove = ref(true)

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

const DeleteBatch = () => {
  let title = '你确定要删除这些软件包信息?'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log(DeleteIdArray)
    service
      .post(
        PATH_URL + '/HardwareLibrary/DeleteHardwareLib',
        qs.stringify(
          {
            ids: DeleteIdArray
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        GetApkPackageData()
      })
  })
}

//#endregion

//#region  推送相关

let PushData: Ref<any> = ref({})

const initPushData = () => {
  PushData.value.currentData = new Date()
  PushData.value.serialNumber = undefined
  PushData.value.type = 2
  PushData.value.id = undefined
}

let currentRowId: number | undefined = undefined

const doWork = (row: any) => {
  currentRowId = row.id
  initPushData()
  PushdialogVisible.value = true
}

let PushdialogVisible = ref(false)

const handleClose = () => {
  console.log('close')
  PushdialogVisible.value = false
}

let signDisabled = ref(false)

const doPush = () => {
  PushData.value.id = currentRowId
  console.log('doPush', PushData.value)
  service.post(PATH_URL + '/HardwareLibrary/SetPushRecords', PushData.value).then(() => {
    ElMessage('设置完成')
    PushdialogVisible.value = false
  })
}

const typeChange = () => {
  if (PushData.value.type == 2) {
    PushData.value.serialNumber = undefined
    signDisabled.value = true
  } else {
    signDisabled.value = false
  }
}

//#endregion
</script>

<style lang="less" scoped>
.addInput {
  width: 380px;
}
</style>
