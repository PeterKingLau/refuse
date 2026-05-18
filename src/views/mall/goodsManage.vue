<template>
  <el-form :model="QueryParm" :inline="true">
    <el-row>
      <el-col :span="8">
        <el-form-item label="商品名称" label-width="200">
          <el-input v-model="QueryParm.name" placeholder="请输入商品名称" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="商品类别" label-width="200">
          <el-select v-model="QueryParm.parentId" clearable placeholder="请选择商品类别">
            <el-option
              v-for="item in malTypeList"
              :key="item.id"
              :label="item.mal_type_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="5" style="text-align: right">
        <el-button type="primary" v-hasPermi="Permission.sec" @click="onQuery">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button type="default" @click="onReset">
          <el-icon class="el-icon--left"><RefreshRight /></el-icon>重置
        </el-button>
      </el-col>
    </el-row>
  </el-form>
  <el-divider />

  <el-row>
    <el-col :span="12">
      <el-button type="primary" class="btn" @click="showAddUi">
        <el-icon><Plus /> </el-icon>新增</el-button
      >
      <el-button type="danger" class="btn" @click="disableBatch">
        <el-icon><Close /></el-icon>禁用</el-button
      >
      <el-button type="success" class="btn" @click="enableBatch">
        <el-icon><EditPen /></el-icon>启用</el-button
      >
    </el-col>
  </el-row>
  <el-divider />
  <el-row>
    <el-table
      :data="ResultData"
      ref="TableRef"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="记录编号" property="id" />
      <el-table-column label="商品名称" property="goodsName" />
      <el-table-column label="兑换积分" property="point" />
      <el-table-column label="库存数量" property="number" />
      <el-table-column label="状态" v-slot="scope">
        {{ scope.row.status == 1 ? '正常' : '禁用' }}
      </el-table-column>
      <el-table-column label="商品图片" v-slot="scope">
        <img :src="GetImageURL(scope.row.pic)" class="image" />
      </el-table-column>
      <el-table-column label="操作" v-slot="scope">
        <el-link type="primary" @click="showUpdateUi(scope.row)">编辑</el-link>
        <el-link type="warning" @click="disableRow(scope.row.id)">禁用</el-link>
        <el-link type="success" @click="enableRow(scope.row.id)">启用</el-link>
      </el-table-column>
    </el-table>
  </el-row>

  <el-row>
    <el-col :span="18">
      <el-pagination
        v-model:current-page="QueryParm.page"
        v-model:page-size="QueryParm.size"
        :small="small"
        :disabled="disabled"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="GetGoods"
        @current-change="GetGoods"
      />
    </el-col>
  </el-row>

  <el-dialog title="添加商品" v-model="showAdd" style="width: 30%">
    <el-form :model="addParm">
      <el-form-item label="商品类别">
        <el-select v-model="addParm.type" placeholder="请选择商品类别">
          <el-option
            v-for="item in malTypeList"
            :key="item.id"
            :label="item.mal_type_name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品名称">
        <el-input v-model="addParm.name" placeholder="请输入商品名称" />
      </el-form-item>

      <el-form-item label="商品图片">
        <el-upload
          class="avatar-uploader"
          :action="UpImageURL"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="headObject"
        >
          <img v-if="showImage" :src="GetImageURL(addParm.fileName)" class="avatar" />

          <el-icon v-if="showPlus" class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="积分数量">
        <el-input v-model="addParm.point" placeholder="请输入需要兑换的积分数量" />
      </el-form-item>

      <el-form-item label="库存数量">
        <el-input v-model="addParm.number" placeholder="请输入库存数量" />
      </el-form-item>
      <el-divider />
      <el-row>
        <el-col :span="24" style="text-align: right">
          <el-button type="primary" :loading="loading" @click="addOradd">提交</el-button>
          <el-button type="default" @click="cleanAdd">取消</el-button>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ref, onMounted, computed, Ref } from 'vue'
import qs from 'qs'
import { ElMessage } from 'element-plus'
import { GetImageURL } from '@/utils/tools'
const Permission = ref({
  add: 'mal_typ_add',
  rev: 'mal_typ_rev',
  del: 'mal_typ_del',
  sec: 'mal_typ_sec'
})
let TableRef: any = ref({})
let malTypeList: any = ref([])
let showPlus = ref(true)
let showImage = ref(false)
let loading = ref(false)
let total: Ref<number> = ref(0)
let disabled = ref(false)
let small = ref(false)
let isUpdate = false

let QueryParm: any = ref({
  page: 0,
  size: 10,
  name: '',
  parentId: undefined
})

let showAdd: Ref<boolean> = ref(false)
let addParm: any = ref({})

const disableRow = (id: number) => {
  let temp: number[] = []
  temp.push(id)
  service
    .post(
      PATH_URL + '/mal/malGoods/DisableGoods',
      qs.stringify(
        {
          ids: temp
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res: any) => {
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      ElMessage(message)
      GetGoods()
    })
}

const enableRow = (id: number) => {
  let temp: number[] = []
  temp.push(id)
  service
    .post(
      PATH_URL + '/mal/malGoods/EnableGoods',
      qs.stringify(
        {
          ids: temp
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res: any) => {
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      ElMessage(message)
      GetGoods()
    })
}

const showAddUi = () => {
  addParm.value.type = undefined
  addParm.value.name = ''
  addParm.value.fileName = undefined
  showImage.value = false
  showPlus.value = true
  showAdd.value = true
  isUpdate = false
}

const addOradd = () => {
  if (isUpdate) {
    updateSubmit()
  } else {
    submitAdd()
  }
}

const showUpdateUi = (row: any) => {
  console.log('row', row)
  addParm.value.type = row.goodsType
  addParm.value.name = row.goodsName
  addParm.value.fileName = row.pic
  addParm.value.point = row.point
  addParm.value.number = row.number
  addParm.value.id = row.id
  addParm.value.status = row.status
  showImage.value = true
  showPlus.value = false
  showAdd.value = true
  isUpdate = false
}

const updateSubmit = () => {
  service
    .post(
      PATH_URL + '/mal/malGoods/UpdateGoods',
      qs.stringify({
        goodsName: addParm.value.name,
        goodsType: addParm.value.type,
        point: addParm.value.point,
        pic: addParm.value.fileName,
        number: addParm.value.number,
        status: addParm.value.status
      })
    )
    .then((res: any) => {
      loading.value = false
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      showAdd.value = false
      ElMessage(message)
      GetGoods()
    })
}

const submitAdd = () => {
  loading.value = true
  service
    .post(
      PATH_URL + '/mal/malGoods/addGoods',
      qs.stringify({
        goodsName: addParm.value.name,
        goodsType: addParm.value.type,
        point: addParm.value.point,
        pic: addParm.value.fileName,
        number: addParm.value.number
      })
    )
    .then((res: any) => {
      loading.value = false
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      showAdd.value = false
      ElMessage(message)
      GetGoods()
    })
}

const cleanAdd = () => {
  showAdd.value = false
  loading.value = false
}

let ResultData: any = ref([])
const onReset = () => {
  QueryParm.value.name = ''
  QueryParm.value.parentId = undefined
}
const onQuery = () => {
  GetGoods()
}

onMounted(() => {
  GetGoodsType()
  GetGoods()
})

const GetGoodsType = () => {
  service.get(PATH_URL + '/mal/malType/GetMalTypeForSelect').then((res: any) => {
    malTypeList.value = res.data
  })
}

const GetGoods = () => {
  service
    .post(
      PATH_URL + '/mal/malGoods/GetGoods',
      qs.stringify({
        page: QueryParm.value.page,
        size: QueryParm.value.size,
        content: QueryParm.value.name,
        parentId: QueryParm.value.parentId
      })
    )
    .then((res: any) => {
      if (res.code == 200) {
        total.value = res.data.total
        ResultData.value = res.data.records
      }
    })
}

const headObject = {
  Authorization: localStorage.getItem('token')
}
const beforeAvatarUpload = () => {}
const handleAvatarSuccess = (respon) => {
  if (respon.code == 200) {
    console.log('update', respon)
    addParm.value.fileName = respon.data
    showImage.value = true
    showPlus.value = false
  } else {
    ElMessage('上传图片出错了')
  }
}

const disableBatch = () => {
  service
    .post(
      PATH_URL + '/mal/malGoods/DisableGoods',
      qs.stringify(
        {
          ids: SelectIds
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res: any) => {
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      ElMessage(message)
      GetGoods()
    })
}

const enableBatch = () => {
  service
    .post(
      PATH_URL + '/mal/malGoods/EnableGoods',
      qs.stringify(
        {
          ids: SelectIds
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res: any) => {
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      ElMessage(message)
      GetGoods()
    })
}

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})
let SelectIds: number[] = []
const handleSelectionChange = (val: any) => {
  SelectIds = []
  val.forEach((row) => {
    SelectIds.push(row.id)
  })
}
</script>

<style lang="less" scoped>
.btn {
  width: 80px;
  padding-left: 20px;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.avatar {
  width: 50%;
  text-align: left;
}
.image {
  width: 40px;
  height: 40px;
}
.el-link {
  padding-left: 20px;
}
</style>
