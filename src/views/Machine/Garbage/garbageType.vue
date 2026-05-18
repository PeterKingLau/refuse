<template>
  <el-row class="rr">
    <el-form :model="form" label-width="100px" :inline="true" v-if="showForm">
      <el-form-item label="垃圾类型：">
        <el-input v-model="form.typeName" class="eInput" placeholder="请输入垃圾类型" />
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
      :data="garbageTypeData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" width="60" property="id" />
      <el-table-column label="类别名称" width="100" property="label" />
      <el-table-column v-slot="scope" label="图片" width="120">
        <img :src="getImageURL(scope.row.pic)" class="imgOfTable" />
      </el-table-column>
      <el-table-column label="积分数量" width="80" property="points" />
      <el-table-column label="积分赠送模式" width="130" property="pointsType.label" />
      <el-table-column label="创建时间" property="createTime" />
      <el-table-column label="创建人" width="100" property="staff.name" />
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

  <el-dialog title="添加垃圾类别" width="60%" v-model="showDialog">
    <el-form :model="updateForm" :inline="true" label-width="auto" class="frame">
      <el-row>
        <el-col :span="12">
          <el-form-item label="类型名称:" prop="label">
            <el-input v-model="updateForm.label" placeholder="请输入类型名称" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="图片">
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
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="积分数量">
            <el-input-number v-model="updateForm.points" :min="0" :max="9999" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="积分赠送模式">
            <el-select
              v-model="updateForm.pointsMode"
              class="m-2"
              placeholder="Select"
              size="large"
              ref="pointTpteSelectRef"
            >
              <el-option
                v-for="item in pointTypeData"
                :key="item.code"
                :label="item.label"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row class="margeTop">
        <el-col :span="24" class="toRight">
          <el-button @click="onCloseDialog">取消</el-button>
          <el-button type="primary" @click="onAddConfirm"> 确认 </el-button>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, Ref, computed, onMounted, inject } from 'vue'
import { PATH_URL, service } from '@/config/axios/service'

import { ElSelect, ElMessage, ElMessageBox } from 'element-plus'
import qs from 'qs'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const getGarbageType = () => {
  service
    .post(
      PATH_URL + '/MachineMange/getGarbageType',
      qs.stringify({ typeName: form.value.typeName }, { arrayFormat: 'brackets' })
    )
    .then((res) => {
      console.log(res)
      garbageTypeData.value = res.data
    })
}

onMounted(() => {
  getPointsTypeData()
  getGarbageType()
})

const handleDetail = (data) => {
  console.log(data)
  isUpdate = true
  updateForm.value.id = data.id
  updateForm.value.label = data.label
  updateForm.value.pic = data.pic
  updateForm.value.points = data.points
  updateForm.value.pointsMode = data.pointsMode
  showDialog.value = true
}

const handleRemove = (data) => {
  let title = '你确定要删除这个垃圾类别'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let deleteArrry: number[] = []
    deleteArrry.push(data.id)
    service
      .post(
        PATH_URL + '/MachineMange/deleteGarbageType',
        qs.stringify(
          {
            ids: deleteArrry
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getGarbageType()
      })
  })
  console.log(data)
}

let isUpdate = false

let pointTpteSelectRef = ref(ElSelect)

interface PointsType {
  id: number
  label: string
  code: string
}

let pointTypeData: PointsType[] = []
const getPointsTypeData = () => {
  service.get(PATH_URL + '/MachineMange/getPointsType').then((res) => {
    pointTypeData = res.data
  })
}

//#region 添加 dialog

const onCloseDialog = () => {
  showDialog.value = false
}

const onAddConfirm = () => {
  if (isUpdate) {
    onUpdate()
    return
  }

  let title = '你确定要添加这个垃圾类别'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/addPointsType',
        qs.stringify(
          {
            points: updateForm.value.points,
            pointsMode: updateForm.value.pointsMode,
            label: updateForm.value.label,
            pic: updateForm.value.pic
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getGarbageType()
      })
  })

  showDialog.value = false
}

const onUpdate = () => {
  let title = '你确定要修改这个垃圾类别'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/updatePointsType',
        qs.stringify(
          {
            points: updateForm.value.points,
            pointsMode: updateForm.value.pointsMode,
            label: updateForm.value.label,
            pic: updateForm.value.pic,
            id: updateForm.value.id
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        showDialog.value = false
        getGarbageType()
      })
  })
}

interface updateData {
  id: number
  label: string
  pic: string
  points: number
  pointsMode: any
  createTime: string
  staff: any
}
let showDialog = ref(false)

const initUpdateForm = () => {
  updateForm.value.createTime = ''
  updateForm.value.id = 0
  updateForm.value.label = ''
  updateForm.value.pic = ''
  updateForm.value.points = 10
  updateForm.value.pointsMode = 'wei'
  updateForm.value.staff = 0
}

let updateForm: Ref<updateData> = ref({
  id: 0,
  label: '',
  pic: '',
  points: 0,
  pointsMode: 'wei',
  createTime: '',
  staff: ''
})

//#endregion

//#region 表格相关

const beforeAvatarUpload = () => {}
const handleUpdateSuccess = (respon) => {
  if (respon.code == 200) {
    updateForm.value.pic = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}

const headObject = {
  Authorization: localStorage.getItem('token')
}
const garbageTypeData = ref([])

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

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})

//#endregion

const Permission = ref({
  add: 'mac_gag_add',
  rev: 'mac_gag_rev',
  del: 'mac_gag_del',
  sec: 'mac_gag_sec'
})

//#region 搜索相关
let showForm = ref(true)

const form = ref({
  typeName: ''
})

const onSearch = () => {
  getGarbageType()
}

const onReset = () => {
  form.value.typeName = ''
}

//#endregion

//#region 中间按钮
const OnClickAdd = () => {
  initUpdateForm()
  isUpdate = false
  showDialog.value = true
}
const deleteOfDetail = () => {
  let title = '你确定要删除这些垃圾类别'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log(DeleteIdArray)
    service
      .post(
        PATH_URL + '/MachineMange/deleteGarbageType',
        qs.stringify(
          {
            ids: DeleteIdArray
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getGarbageType()
      })
  })
}

const OnClickOfShowForm = () => {
  showForm.value = !showForm.value
}

let disableUpdate = ref(true)
let disableRemove = ref(true)

//#endregion
</script>

<style lang="less" scoped>
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
  width: 178px;
  height: 178px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}

.bt {
  margin-left: 20px;
}

.toRight {
  text-align: right;
}

.avatar-uploader .avatar {
  display: block;
  width: 178px;
  height: 178px;
}

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
</style>
