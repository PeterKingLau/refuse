<template>
  <el-form :model="QueryParm" :inline="true" v-if="showSearch">
    <el-row>
      <el-col :span="5">
        <el-form-item label="类别名称">
          <el-input v-model="QueryParm.content" placeholder="请输入类别名称" />
        </el-form-item>
      </el-col>
      <el-col :span="8" class="fm_center">
        <el-button type="primary" v-hasPermi="Permission.sec" @click="onQuery">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button type="default" @click="onReset">
          <el-icon class="el-icon--left"><RefreshRight /></el-icon>重置
        </el-button>
      </el-col>
    </el-row>
  </el-form>

  <el-row class="toolbar">
    <el-col :span="12" class="button_left">
      <el-button type="primary" @click="OnClickAdd" v-hasPermi="Permission.add">
        <el-icon><Plus /> </el-icon>新增
      </el-button>

      <el-button
        v-if="false"
        type="danger"
        :disabled="EnableDelete"
        @click="DeleteBatch"
        v-hasPermi="Permission.del"
      >
        <el-icon><Close /></el-icon>删除
      </el-button>
    </el-col>

    <el-col :span="12" class="button_right">
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
    <el-table :data="ResultData" style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column label="记录编号" property="id" />
      <el-table-column label="类别名称" property="malTypeName" />
      <el-table-column label="状态" v-slot="scope">
        {{ ConverStatus(scope.row.status) }}
      </el-table-column>
      <el-table-column label="操作" v-slot="scope" width="200" fixed="right">
        <div class="buttonOfTables">
          <el-link type="primary" @click="DisabledRecord(scope.row)">禁用</el-link>
          <el-link type="primary" @click="recovery(scope.row)">启用</el-link>
        </div>
      </el-table-column>
    </el-table>
  </el-row>

  <el-dialog v-model="addShow" title="添加商品类别" width="20%">
    <el-form :model="AddParm">
      <el-row>
        <el-form-item label="记录编号">
          <el-input v-model="AddParm.id" disabled />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="类别名称">
          <el-input v-model="AddParm.malTypeName" placeholder="请输入商品类别名称" />
        </el-form-item>
      </el-row>

      <el-footer>
        <el-button type="primary" :loading="Loading" @click="onSubmitAdd">提交</el-button>
        <el-button type="cancel">取消</el-button>
      </el-footer>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ref, onMounted, reactive, inject } from 'vue'
import qs from 'qs'
import { ElMessage } from 'element-plus'
let showSearch = ref(true)
let EnableDelete = ref(false)
let addShow: any = ref(false)
let Loading: any = ref(false)

let AddParm = reactive({
  id: 0,
  malTypeName: ''
})

let QueryParm: any = ref({
  page: 0,
  size: 10,
  content: ''
})

onMounted(() => {
  GetGoodsType()
})

const ConverStatus = (da: number) => {
  console.log('da', da)
  if (da == 0) {
    return '禁用'
  }

  if (da == 1) {
    return '正常'
  }
  return '异常状态'
}

const onSubmitAdd = () => {
  Loading.value = true
  service
    .post(
      PATH_URL + '/mal/malType/AddOrUpdateMalType',
      qs.stringify({
        id: AddParm.id,
        malTypeName: AddParm.malTypeName
      })
    )
    .then((res: any) => {
      console.log('rrrr', res)
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      ElMessage(message)
      Loading.value = false
      addShow.value = false
      GetGoodsType()
    })
}

const reload: any = inject('reload')

const onQuery = () => {
  GetGoodsType()
}

const Permission = ref({
  add: 'mal_typ_add',
  rev: 'mal_typ_rev',
  del: 'mal_typ_del',
  sec: 'mal_typ_sec'
})

const onReset = () => {
  QueryParm.value.content = ''
}
let ResultData: any = ref([])
const onPageRest = () => {
  reload()
}
const OnClickOfShowForm = () => {
  showSearch.value = !showSearch.value
}
const OnClickAdd = () => {
  AddParm.id = 0
  AddParm.malTypeName = ''
  addShow.value = true
}

const recovery = (row: any) => {
  service
    .post(
      PATH_URL + '/mal/malType/EnableRecord',
      qs.stringify({
        id: row.id
      })
    )
    .then((res: any) => {
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      ElMessage(message)
      GetGoodsType()
    })
}

const DisabledRecord = (row: any) => {
  service
    .post(
      PATH_URL + '/mal/malType/DisableRecord',
      qs.stringify({
        id: row.id
      })
    )
    .then((res: any) => {
      let message = '操作失败'
      if (res.code == 200) {
        message = '操作成功'
      }
      ElMessage(message)
      GetGoodsType()
    })
}

const DeleteBatch = () => {}

const GetGoodsType = () => {
  service
    .post(
      PATH_URL + '/mal/malType/GetMalType',
      qs.stringify({
        page: QueryParm.value.page,
        size: QueryParm.value.size,
        content: QueryParm.value.content,
        parentId: 0
      })
    )
    .then((res: any) => {
      ResultData.value = res.data.records
    })
}
</script>

<style lang="less" scoped>
.buttonOfTables {
  .el-link {
    margin-left: 10px;
  }
}

.toolbar {
  margin-top: 10px;

  .button_left {
    text-align: left;
  }

  .button_right {
    text-align: right;
  }
}
.fm_center {
  padding-left: 10px;
  text-align: center;
}
</style>
