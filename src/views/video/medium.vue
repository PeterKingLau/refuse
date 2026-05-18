<template>
  <el-row>
    <el-form :model="Queryparam" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="媒体名称">
        <el-input v-model="Queryparam.name" class="eInput" placeholder="请输入媒体名称" />
      </el-form-item>

      <el-form-item label="类型" label-width="60">
        <el-select v-model="Queryparam.screenType" placeholder="屏幕类型">
          <el-option
            v-for="item in screenTypeArray"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="onClickSearch" v-hasPermi="Permission.sec">
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

  <el-row class="buttons">
    <el-col :span="12">
      <el-button type="primary" @click="onClickAdd" v-hasPermi="Permission.add">增加</el-button>

      <el-button
        type="danger"
        :disabled="EnableDelete"
        @click="onClickDelete"
        v-hasPermi="Permission.del"
        >删除</el-button
      >
      <el-button type="warning" :disabled="EnableDelete">导出</el-button>
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

  <el-row style="margin-top: 10px">
    <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="媒体名称" width="100" property="name" />

      <el-table-column label="媒体链接" width="300" v-slot="scope">
        <img
          :src="GetImageURL(scope.row.file_name)"
          class="image"
          v-if="scope.row.file_type == 1"
        />
        <Cvideo
          v-show="true"
          :videoUrl="GetVideoURL(scope.row.file_name)"
          :width="200"
          :height="200"
          :autoplay="false"
          :controls="true"
          :loop="false"
          :muted="false"
          preload="auto"
          :showPlay="true"
          :playWidth="96"
          zoom="cotain"
          v-if="scope.row.file_type == 2"
        />
      </el-table-column>
      <el-table-column label="类型" width="100" v-slot="scope">
        {{ scope.row.file_type == 1 ? '图片' : '视频' }}
      </el-table-column>
      <el-table-column label="适用屏幕" width="150" v-slot="scope">
        {{ consvertScreenType(scope.row.screen_type) }}
      </el-table-column>
      <el-table-column label="视频屏幕尺寸" width="200" property="screenSize" />
      <el-table-column label="描述" width="160" property="remarks" />
      <el-table-column label="创建者" width="100" property="aName" />

      <el-table-column label="创建时间" width="160" v-slot="scope">
        {{ FormatDate(scope.row.create_time) }}
      </el-table-column>

      <el-table-column label="修改者" width="160" property="a2Name" />
      <el-table-column label="修改时间" width="160" v-slot="scope">
        {{ FormatDate(scope.row.update_time) }}
      </el-table-column>
      <el-table-column label="操作" v-slot="scope">
        <div class="buttonOfTables">
          <el-link
            class="bt"
            type="success"
            @click="onRevise(scope.row)"
            v-hasPermi="Permission.rev"
            >修改</el-link
          >
          <el-link
            class="bt"
            type="danger"
            @click="onPublish(scope.row)"
            v-hasPermi="Permission.puh"
            >发布</el-link
          >

          <el-link class="bt" type="danger" @click="onCancel(scope.row)" v-hasPermi="Permission.cbk"
            >撤回</el-link
          >
          <el-link
            class="bt"
            type="success"
            @click="onRemove(scope.row)"
            v-hasPermi="Permission.del"
            >删除</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row style="width: 100%; text-align: right">
    <el-pagination
      v-model:current-page="Queryparam.page"
      v-model:page-size="Queryparam.size"
      :page-sizes="[5, 10, 15, 20]"
      :small="small"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-row>

  <el-dialog v-model="addDialogVisible" title="添加媒体" width="40%">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
      size="default"
      status-icon
    >
      <el-form-item label="媒体名称" prop="name" label-width="100">
        <el-input v-model="ruleForm.name" />
      </el-form-item>

      <el-form-item label="媒体链接" prop="link" label-width="100">
        <el-upload
          class="avatar-uploader"
          :action="UpImageURL"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="headObject"
        >
          <img v-if="showImage" :src="GetImageURL(ruleForm.fileName)" class="avatar" />
          <Cvideo
            v-if="showVideo"
            v-show="true"
            :videoUrl="GetVideoURL(ruleForm.fileName)"
            :width="100"
            :height="100"
            :autoplay="true"
            :controls="true"
            :loop="false"
            :muted="false"
            preload="auto"
            :showPlay="true"
            :playWidth="96"
            zoom="cotain"
          />
          <el-icon v-if="showPlus" class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="媒体类型" prop="fileType" label-width="100">
        <el-radio-group v-model="ruleForm.fileType">
          <el-radio :label="1"> 图片</el-radio>
          <el-radio :label="2">视频 </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="适用屏幕" prop="screenType" label-width="100">
        <el-radio-group v-model="ruleForm.screenType">
          <el-radio :label="1"> 横屏</el-radio>
          <el-radio :label="2">竖屏</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="屏幕尺寸" prop="region" label-width="100">
        <el-select v-model="ruleForm.screenSize" placeholder="屏幕尺寸">
          <el-option
            v-for="item in screenSizeArray"
            :key="item.label"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="desc" label-width="100">
        <el-input v-model="ruleForm.remarks" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>

  <!---  发布 dialog  -->
  <el-dialog v-model="publishDialogVisible" title="媒体发布" width="70%">
    <el-row>
      <el-form-item label="设备编号">
        <el-input
          v-model="QueryDeviceParam.serialNumber"
          class="eInput"
          placeholder="请输入设备编号"
        />
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input v-model="QueryDeviceParam.name" class="eInput" placeholder="请输入设备名称" />
      </el-form-item>

      <el-form-item label="屏幕模式">
        <el-select v-model="QueryDeviceParam.screenModel" placeholder="屏幕尺寸">
          <el-option
            v-for="item in screenTypeArray"
            :key="item.label"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="屏幕尺寸" prop="region">
        <el-select v-model="ruleForm.screenSize" placeholder="屏幕尺寸">
          <el-option
            v-for="item in screenSizeArray"
            :key="item.label"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="onClickPublish">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="btn" @click="onPublishReset">
          <el-icon class="el-icon--left"><RefreshRight /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-row>

    <el-row>
      <el-table
        :data="deviceData"
        style="width: 100%"
        @selection-change="DevicehandleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="设备编号" width="150" property="serial_number" />
        <el-table-column label="设备名称" property="name" />
        <el-table-column label="型号名称" width="150" property="typeName" />
        <el-table-column label="屏幕类型" width="100" v-slot="scope">
          {{ ConvertScreenModel(scope.row.screen_model) }}
        </el-table-column>
        <el-table-column label="屏幕尺寸" width="80" property="label" />
        <el-table-column label="设备sn" width="150" property="imei" />
        <el-table-column label="屏幕类型" width="150" v-slot="scope">
          {{ ConvertDeviceStatus(scope.row.status) }}
        </el-table-column>
      </el-table>
    </el-row>
    <el-row style="width: 100%; text-align: right">
      <el-pagination
        v-model:current-page="QueryDeviceParam.page"
        v-model:page-size="QueryDeviceParam.size"
        :page-sizes="[5, 10, 15, 20]"
        :small="small"
        layout="total, sizes, prev, pager, next, jumper"
        :total="QueryDeviceParam.total"
        @size-change="PulishSizeChange"
        @current-change="PulishSizeChange"
      />
    </el-row>
    <template #footer>
      <div class="footer">
        <div class="ss">
          <el-form-item label="投放位置" prop="region">
            <el-select v-model="pushLocation" placeholder="请选择投放位置">
              <el-option :value="1" label="首页" />
              <el-option :value="2" label="待机" />
            </el-select>
          </el-form-item>
        </div>
        <span class="dialog-footer">
          <el-button @click="publishDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="DoPublish()"> 发布 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>

  <!-- 撤回 -->

  <el-dialog v-model="clearDialogVisible" title="撤回媒体" width="70%">
    <el-row>
      <el-form-item label="设备编号" class="form-item">
        <el-input
          v-model="QueryClearDevice.serialNumber"
          class="eInput"
          placeholder="请输入设备编号"
        />
      </el-form-item>
      <el-form-item label="设备名称" class="form-item">
        <el-input v-model="QueryClearDevice.name" class="eInput" placeholder="请输入设备名称" />
      </el-form-item>

      <el-form-item label="投放位置" class="form-item">
        <el-select v-model="QueryClearDevice.location" placeholder="投放位置">
          <el-option :value="1" label="首页" />
          <el-option :value="2" label="待机" />
        </el-select>
      </el-form-item>

      <el-form-item class="form-item">
        <el-button type="primary" class="btn" @click="onClearClick">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </el-form-item>

      <el-form-item class="form-item">
        <el-button class="btn" @click="onClearReset">
          <el-icon class="el-icon--left"><RefreshRight /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-row>

    <el-row>
      <el-table
        :data="ClearData"
        style="width: 100%"
        @selection-change="ClearhandleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="设备编号" width="150" property="serial_number" />
        <el-table-column label="设备名称" property="deviceName" />
        <el-table-column label="型号名称" width="150" property="typeName" />

        <el-table-column label="设备sn" width="150" property="imei" />
        <el-table-column label="发布时间" width="200" v-slot="scope">
          {{ FormatDate(scope.row.create_time) }}
        </el-table-column>
        <el-table-column label="投放位置" width="80" v-slot="scope">
          {{ scope.row.location == 1 ? '首页' : '待机' }}
        </el-table-column>
        <el-table-column label="状态" width="80" v-slot="scope">
          {{ ConvertDeviceStatus(scope.row.status) }}
        </el-table-column>
      </el-table>
    </el-row>
    <el-row style="width: 100%; text-align: right">
      <el-pagination
        v-model:current-page="QueryClearDevice.page"
        v-model:page-size="QueryClearDevice.size"
        :page-sizes="[5, 10, 15, 20]"
        :small="small"
        layout="total, sizes, prev, pager, next, jumper"
        :total="QueryClearDevice.total"
        @size-change="ClearSizeChange"
        @current-change="ClearSizeChange"
      />
    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="clearDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="DoClear()"> 撤回 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, Ref, unref, onMounted, reactive, computed, inject } from 'vue'
import { FormatDate, GetImageURL, GetVideoURL } from '@/utils/tools'
import { PATH_URL, service } from '@/config/axios/service'
import { FormRules, ElMessage, FormInstance, ElMessageBox } from 'element-plus'
import qs from 'qs'
import { Cvideo } from './components'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}
const Permission = ref({
  add: 'med_vid_add',
  rev: 'med_vid_rev',
  del: 'med_vid_del',
  puh: 'med_vid_puh',
  cbk: 'med_vid_cbk',
  sec: 'med_vid_sec'
})

//#region 页面显示

interface QueryStruct {
  name: string
  screenType: number | undefined
  page: number
  size: number
}

interface publishStruct {
  id?: number
  serialNumber: string
  name: string
  deviceType: number | undefined
  screenModel: number | undefined
  screenSize: number | undefined
  status: number | undefined
  page: number
  size: number
  total: number
}

let QueryDeviceParam: Ref<publishStruct> = ref({
  id: 0,
  serialNumber: '',
  deviceType: undefined,
  screenModel: undefined,
  screenSize: undefined,
  status: undefined,
  name: '',
  page: 1,
  size: 10,
  total: 0
})

const consvertScreenType = (type: number): string => {
  let desc = '未知'
  if (type == 1) {
    desc = '横屏'
  }
  if (type == 2) {
    desc = '竖屏'
  }
  return desc
}

const total = ref(0)
let small = ref(false)
const handleSizeChange = () => {
  handleCurrentChange()
}
const handleCurrentChange = () => {
  getTableData()
}

let screenTypeArray = [
  {
    id: 1,
    label: '横屏'
  },
  {
    id: 2,
    label: '竖屏'
  }
]

let DeleteIdArray: any[] = []
const handleSelectionChange = (val: any) => {
  if (val.length > 0) {
    EnableDelete.value = false
  } else {
    EnableDelete.value = true
  }

  DeleteIdArray = []
  let tt = unref(val)
  tt.forEach((row: any) => {
    console.log(row)
    DeleteIdArray.push(row.id)
  })
}

let showSearchForm = ref(true)

let onClickSearch = () => {
  Queryparam.value.page = 1
  getTableData()
}
let onReset = () => {
  Queryparam.value.name = ''
  Queryparam.value.screenType = undefined
}

const getTableData = () => {
  service.post(PATH_URL + '/medMedium/getMedium', Queryparam.value).then((res: any) => {
    console.log(res.data)
    tableData.value = res.data.records
    total.value = res.data.total
  })
}

let Queryparam: Ref<QueryStruct> = ref({
  name: '',
  screenType: undefined,
  page: 1,
  size: 10
})

let tableData: any = ref([])

const onClickAdd = () => {
  ruleForm.fileName = ''
  ruleForm.name = ''
  ruleForm.fileType = 1
  ruleForm.screenSize = 1
  ruleForm.screenType = 1
  ruleForm.remarks = ''
  ruleForm.id = 0
  isVideo(ruleForm.fileName)
  addDialogVisible.value = true
}

const onClickDelete = () => {}

let EnableDelete = ref(true)

const onRemove = (row: any) => {
  console.log(row)

  ElMessageBox.confirm('你确定要删除这个记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      let ids: number[] = []
      ids.push(row.id)

      service
        .post(
          PATH_URL + '/medMedium/deleteBatch',
          qs.stringify(
            {
              ids: ids
            },
            { arrayFormat: 'brackets' }
          )
        )
        .then((res: any) => {
          if (res.code == 200) {
            ElMessage('操作成功')
            getTableData()
          }
        })
    })
    .catch(() => {})
}

const onRevise = (row: any) => {
  console.log(row)

  ruleForm.fileName = row.file_name
  ruleForm.fileType = row.file_type
  ruleForm.id = row.id
  ruleForm.name = row.name
  ruleForm.remarks = row.remarks
  ruleForm.screenType = row.screen_type
  ruleForm.screenSize = row.screen_size
  isVideo(ruleForm.fileName)
  addDialogVisible.value = true
}

const onPublish = (row: any) => {
  QueryDeviceParam.value.id = row.id
  QueryDeviceParam.value.deviceType = undefined
  QueryDeviceParam.value.name = ''
  QueryDeviceParam.value.page = 1
  QueryDeviceParam.value.size = 10
  QueryDeviceParam.value.screenModel = undefined
  QueryDeviceParam.value.screenSize = undefined
  QueryDeviceParam.value.serialNumber = ''
  QueryDeviceParam.value.status = undefined
  QueryDeviceParam.value.total = 0
  publishDialogVisible.value = true
  pushLocation.value = undefined
  getPublishDevice()
}

const onCancel = (row: any) => {
  QueryClearDevice.value.location = undefined
  QueryClearDevice.value.mediumId = row.id
  QueryClearDevice.value.name = ''
  QueryClearDevice.value.page = 1
  QueryClearDevice.value.size = 10
  QueryClearDevice.value.serialNumber = ''
  QueryClearDevice.value.total = 0
  getClearData()
  clearDialogVisible.value = true
}

//#endregion

//#region  添加媒体

let ruleForm = reactive({
  id: 0,
  name: '232',
  fileName: '',
  fileType: 1,
  screenType: 1,
  screenSize: 2,
  remarks: ''
})
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入媒体库名称', trigger: 'blur' },
    { min: 1, max: 20, message: '字符长度为 1 到 20', trigger: 'blur' }
  ],
  fileType: [
    {
      required: true,
      message: '请选择文件类型',
      trigger: 'change'
    }
  ],
  region: [
    {
      type: 'number',
      required: false,
      message: '屏幕尺寸',
      trigger: 'change'
    }
  ]
})

const headObject = {
  Authorization: localStorage.getItem('token')
}

const screenSizeArray: Ref<any[]> = ref([])

const getScreenSize = () => {
  service.get(PATH_URL + '/MachineMange/getScreenClass').then((res: any) => {
    console.log('screen', res.data)
    screenSizeArray.value = res.data
  })
}

const beforeAvatarUpload = () => {}
onMounted(() => {
  getScreenSize()
  getTableData()
})

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})

const handleAvatarSuccess = (respon) => {
  if (respon.code == 200) {
    ruleForm.fileName = respon.data
    isVideo(ruleForm.fileName)
  } else {
    ElMessage('上传图片出错了')
  }
}

let addDialogVisible = ref(false)

const submitForm = async (formEl: FormInstance | undefined) => {
  console.log(ruleForm)

  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let message = '你是否确定要修改这个媒体库'
      if (ruleForm.id == 0) {
        message = '你是否确定要添加这个媒体库'
      }

      ElMessageBox.confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (ruleForm.id == 0) {
            addMedium()
          } else {
            updateMedium()
          }
        })
        .catch(() => {})
    } else {
      console.log('填写错误', fields)
    }
  })
}

const updateMedium = () => {
  service.post(PATH_URL + '/medMedium/reviseMedium', ruleForm).then((res: any) => {
    console.log(res)
    if (res.code == 200) {
      ElMessage('操作成功')
      getTableData()
      addDialogVisible.value = false
    }
  })
}

const addMedium = () => {
  service.post(PATH_URL + '/medMedium/addMedium', ruleForm).then((res: any) => {
    console.log(res)
    if (res.code == 200) {
      ElMessage('操作成功')
      getTableData()
      addDialogVisible.value = false
    }
  })
}

let showImage = ref(false)
let showVideo = ref(false)
let showPlus = ref(true)

const isVideo = (fileName: string) => {
  if (!fileName) {
    showImage.value = false
    showVideo.value = false
    showPlus.value = true
    return
  }
  console.log('filename', fileName)
  let ll = fileName.split('.')
  let ending = ll[ll.length - 1]
  debugger
  console.log(ending)
  if (ending === 'mp4') {
    showImage.value = false
    showVideo.value = true
    showPlus.value = false
    return
  }
  if (ending === 'jpg' || ending === 'png') {
    console.log('jjj')
    showImage.value = true
    showVideo.value = false
    showPlus.value = false
    return
  }
  showImage.value = false
  showVideo.value = false
  showPlus.value = true
}

//#endregion

//#region  发布媒体

let publishDialogVisible = ref(false)
const onClickPublish = () => {
  QueryDeviceParam.value.page = 1
  getPublishDevice()
}
const onPublishReset = () => {}

const PulishSizeChange = () => {
  getPublishDevice()
}

const getPublishDevice = () => {
  service
    .post(PATH_URL + '/MachineMange/getDeviceForMedium', QueryDeviceParam.value)
    .then((res: any) => {
      console.log(res)
      if (res.code == 200) {
        deviceData.value = res.data.records
        QueryDeviceParam.value.total = res.data.total
      }
    })
}

let deviceData = ref([])
let deviceSelectArray: any[] = []

const ConvertScreenModel = (model: number) => {
  let desc = ''
  switch (model) {
    case 1:
      desc = '横屏'
      break
    case 2:
      desc = '竖屏'
      break
    case 0:
      desc = '无屏'
      break
    default:
      desc = '未知'
  }
  return desc
}

const ConvertDeviceStatus = (status: number): string => {
  let desc = ''
  switch (status) {
    case 1:
      desc = '待使用'
      break
    case 2:
      desc = '使用中'
      break
    case 3:
      desc = '已禁用'
      break
    case 4:
      desc = '故障'
      break
    case 5:
      desc = '已欠费'
      break
    case 6:
      desc = '未激活'
      break
    default:
      desc = '未知'
      break
  }
  return desc
}
let pushLocation: Ref<number | undefined> = ref(undefined)

const DevicehandleSelectionChange = (val: any) => {
  deviceSelectArray = []
  let tt = unref(val)
  tt.forEach((row: any) => {
    deviceSelectArray.push(row.id)
  })
}

const DoPublish = () => {
  if (!(pushLocation.value == 1 || pushLocation.value == 2)) {
    ElMessage('请选择投放位置')
    return
  }

  ElMessageBox.confirm('您确定要发布媒体到这些设备？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/medMedium/doPublish',

        {
          location: pushLocation.value,
          mediumId: QueryDeviceParam.value.id,
          ids: deviceSelectArray
        }
      )
      .then(() => {
        ElMessage('操作成功')
      })
  })
}

//#endregion

//#region  撤回媒体

let clearDialogVisible = ref(false)

const onClearClick = () => {
  QueryClearDevice.value.page = 1
  getClearData()
}

const onClearReset = () => {
  QueryClearDevice.value.location = undefined
  QueryClearDevice.value.mediumId = 0
  QueryClearDevice.value.name = ''
  QueryClearDevice.value.page = 1
  QueryClearDevice.value.size = 10
  QueryClearDevice.value.serialNumber = ''
  QueryClearDevice.value.total = 0
}

const DoClear = () => {
  ElMessageBox.confirm('您确定要撤销这些设备？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/medMedium/doClear',
        qs.stringify(
          {
            ids: clearIds
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then((res: any) => {
        if (res.code == 200) {
          ElMessage('操作成功')
          getClearData()
        }
      })
  })
}

let QueryClearDevice = ref({
  mediumId: 0,
  serialNumber: '',
  name: '',
  location: undefined,
  page: 1,
  size: 10,
  total: 0
})

let clearIds: number[] = []

const ClearhandleSelectionChange = (val: any) => {
  clearIds = []
  let tt = unref(val)
  tt.forEach((row: any) => {
    clearIds.push(row.id)
  })
}

const ClearSizeChange = () => {}
let ClearData: Ref<any[]> = ref([])
const getClearData = () => {
  service.post(PATH_URL + '/medMedium/getClearDevice', QueryClearDevice.value).then((res: any) => {
    console.log(res)
    ClearData.value = res.data.records
    QueryClearDevice.value.total = res.data.total
  })
}

//#endregion
</script>

<style lang="less" scoped>
.avatar-uploader .avatar {
  display: block;
  width: 100px;
  height: 100px;
}

.avatar-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed #8c939d;
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);
}

.bt {
  margin-left: 20px;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  width: 178px;
  height: 178px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}

.image {
  width: 200px;
  height: 200px;
}

.footer {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

.form-item {
  margin-left: 20px;
}
</style>
