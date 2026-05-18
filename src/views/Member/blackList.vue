<template>
  <el-row>
    <el-form :model="searchFormData" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="OPENID">
        <el-input v-model="searchFormData.openId" placeholder="请输入OPENID" />
      </el-form-item>

      <el-form-item label="手机号码">
        <el-input v-model="searchFormData.phone" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="用户昵称">
        <el-input v-model="searchFormData.nickName" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="searchFormData.time"
          type="datetimerange"
          range-separator="到"
          start-placeholder="开始时间"
          end-placeholder="截止时间"
        />
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
    <el-col :span="12" />
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
  <el-row style="margin-top: 10px">
    <el-table
      ref="areaTableRef"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="ID" width="60" property="id" />
      <el-table-column label="用户头像" width="180" v-slot="scope">
        <img :src="getImageURL(scope.row.pic)" class="imgOfTable" />
      </el-table-column>
      <el-table-column property="openId" label="类型" width="160" />

      <el-table-column property="nickName" label="用户昵称" width="160" />

      <el-table-column label="手机号码" property="phone" width="200" />
      <el-table-column label="绑定卡号" width="100" property="cardNo" />
      <el-table-column label="创建时间" width="130" property="createTime" />
      <el-table-column label="操作" v-slot="scope">
        <div class="buttonOfTables">
          <el-link
            size="small"
            type="success"
            @click="handleDetail(scope.row)"
            v-hasPermi="Permission.rev"
            >还原</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row>
    <el-col :span="18">
      <el-pagination
        v-model:current-page="currentPage3"
        v-model:page-size="pageSize3"
        :small="small"
        :disabled="disabled"
        layout="prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Ref, ref, onMounted, computed, inject } from 'vue'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

const Permission = ref({
  rev: 'mem_bak_rev',
  sec: 'mem_bak_sec'
})

onMounted(() => {
  getBlackList()
})

//#region  数据结构

interface SearchStruct {
  openId: string
  phone: string
  nickName: string
  time?: any
}

interface BlackListStruct {
  id: number
  pic: string
  openId: string
  nikcName: string
  phone: string
}

//#endregion

//#region 搜索相关

let showSearchForm = ref(true)
let searchFormData: Ref<SearchStruct> = ref({
  openId: '',
  phone: '',
  nickName: '',
  time: []
})

let tableData: Ref<BlackListStruct[]> = ref([])
//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})
const getBlackList = () => {
  let parm = {
    openId: searchFormData.value.openId,
    phone: searchFormData.value.phone,
    nickName: searchFormData.value.nickName,
    sTime: searchFormData.value.time[0],
    eTime: searchFormData.value.time[1],
    page: currentPage3.value,
    size: pageSize3.value
  }

  service.post(PATH_URL + '/memMember/getBlackList', parm).then((res) => {
    console.log(res)
    tableData.value = res.data.records
  })
}

const onSearch = () => {
  getBlackList()
}

const onReset = () => {
  searchFormData.value.nickName = ''
  searchFormData.value.openId = ''
  searchFormData.value.phone = ''
  searchFormData.value.time = []
}
//#endregion

let handleSelectionChange = () => {}
let handleDetail = (val) => {
  console.log(val)
  ElMessageBox.confirm('你确定要恢复这个黑名单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service.post(PATH_URL + '/memMember/recoveryBlacList', { id: val.id }).then(() => {
      ElMessage('操作成功')
      getBlackList()
    })
  })
}

let currentPage3 = ref(1)
let pageSize3 = ref(5)
let small = ref(false)
let disabled = ref(false)
let total = ref(0)

const handleSizeChange = () => {}
const handleCurrentChange = () => {}
</script>

<style scoped></style>
