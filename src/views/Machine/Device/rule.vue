<template>
  <el-row>
    <el-form :model="searchFormData" label-width="100px" :inline="true" v-if="showSearchForm">
      <el-form-item label="规则名称">
        <el-input v-model="searchFormData.ruleName" class="eInput" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="产品类型">
        <el-select v-model="searchFormData.productId" placeholder="请选择产品类型">
          <el-option
            v-for="item in productArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备型号">
        <el-input
          v-model="searchFormData.deviceName"
          class="eInput"
          placeholder="请输入设备型号名称"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="btn" @click="onSerach" v-hasPermi="Permission.sec">
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
    <el-col :span="18">
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
        @click="deleteOfBatch"
        v-hasPermi="Permission.del"
        v-if="false"
        ><el-icon><Close /></el-icon>删除</el-button
      >
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

  <el-divider />
  <el-row>
    <el-table ref="TableRef" :data="TableData" style="width: 100%">
      <el-table-column label="记录id" width="100" property="id" />
      <el-table-column label="产品类型" width="180" property="product.name" />

      <el-table-column label="规则名称" width="160" property="label" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          {{ converStatus(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="设备类型" width="180" property="deviceType.name" />

      <el-table-column label="创建时间" width="280" property="createTime" />
      <el-table-column label="创建人" width="200" property="staff.name" />
      <el-table-column label="操作时间" width="260" property="updateTime" />
      <el-table-column label="操作" v-slot="scope">
        <div class="buttonOfTables">
          <el-link
            class="item"
            size="small"
            type="success"
            @click="handleDetail(scope.row)"
            v-hasPermi="Permission.rev"
            >修改</el-link
          >
          <el-link
            class="item"
            size="small"
            type="primary"
            @click="handlePublish(scope.row)"
            v-hasPermi="Permission.puh"
            >发布</el-link
          >
          <el-link
            class="item"
            size="small"
            type="danger"
            @click="handleRemove(scope.row)"
            v-hasPermi="Permission.del"
            >删除</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row style="width: 100%; text-align: right">
    <el-col :span="8" />
    <el-col :span="8" />
    <el-col :span="8" style="text-align: right">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 15, 20]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDeviceRuleTableData"
        @current-change="getDeviceRuleTableData"
      />
    </el-col>
  </el-row>

  <el-dialog v-model="dialogTableVisible" :title="title">
    <el-dialog
      v-model="showImgBox"
      class="imgBox"
      width="40%"
      title="图片选择"
      append-to-body
      top="530px"
    >
      <el-row style="width: 100%">
        <ElImage
          v-for="i in PicArray"
          :src="getImageURL(i.pic)"
          :key="i.id"
          class="imgBoxList"
          @click="PicSelect(i)"
        />
      </el-row>
    </el-dialog>

    <el-form :model="addRuleFormData">
      <el-form-item label="规则名称" label-width="100">
        <el-input v-model="addRuleFormData.ruleName" placeholder="请输入规则名称" />
      </el-form-item>

      <el-form-item label="所属运营商" label-width="100">
        <el-select v-model="addRuleFormData.departmentId" placeholder="请选择运营商">
          <el-option
            v-for="item in DepartmentArray"
            :key="item.id"
            :value="item.id"
            :label="item.platform_name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="产品类型" label-width="100">
        <el-select
          v-model="addRuleFormData.productId"
          placeholder="请选择产品类型"
          @change="productChange"
        >
          <el-option
            v-for="item in productArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备类型" label-width="100">
        <el-select
          v-model="addRuleFormData.deviceId"
          placeholder="请选择设备类型"
          @change="deviceChange"
        >
          <el-option
            v-for="item in deviceTypeArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="仓位设置：" label-width="100">
        <el-scrollbar height="400px" style="width: 80%">
          <div v-for="item in warehouseArray" :key="item.id" class="scrollbar-demo-item">
            <el-row class="test">
              <el-col :span="8">
                <el-row>
                  <el-image
                    style="width: 100px; height: 100px"
                    :src="getImageURL(item.pic)"
                    fit="fill"
                  />
                </el-row>
                <el-row>
                  <el-button
                    type="primary"
                    @click="onClickChange(item)"
                    style="width: 100px; margin-top: 5px"
                  >
                    更改</el-button
                  >
                </el-row>
              </el-col>
              <el-col :span="16">
                <el-row>
                  <el-col :span="8"> 仓位编号: </el-col>
                  <el-col :span="16">
                    {{ item.code }}
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8"> 类型名称: </el-col>
                  <el-col :span="16">
                    <el-select
                      v-model="item.garbageType"
                      class="m-2"
                      placeholder="Select"
                      size="small"
                      clearable
                    >
                      <el-option
                        v-for="gbg in garbageTypeArray"
                        :key="gbg.id"
                        :label="gbg.label"
                        :value="gbg.id"
                      />
                    </el-select>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8"> 投放价格: </el-col>
                  <el-col :span="16">
                    <el-input-number
                      v-model="item.points"
                      placeholder=""
                      controls-position="right"
                      :min="0"
                      :max="9999"
                    />
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>
        </el-scrollbar>
      </el-form-item>

      <div style="width: 100%; margin-top: 10px; text-align: right">
        <span class="dialog-footer">
          <el-button @click="onCloseDialog">取消</el-button>
          <el-button type="primary" @click="onAddConfirm"> 确认 </el-button>
        </span>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { onMounted, Ref, ref, computed, watch, unref, inject } from 'vue'
import qs from 'qs'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}
const Permission = ref({
  add: 'mac_rul_add',
  rev: 'mac_rul_rev',
  del: 'mac_rul_del',
  puh: 'mac_rul_puh',
  sec: 'mac_rul_sec'
})

//#region  分页相关
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)

//#endregion

//#region 数据结构定义

interface PicStruct {
  id: number
  garbageTypeId: number
  pic: string
}

interface GarbageTypeStruct {
  id: number
  label: string
  pic: string
}

interface SearchFormDataStruct {
  productId: number | undefined
  ruleName: string
  deviceName: string
  page: number
  size: number
}

interface SimpleProductTypeStruct {
  id: number
  name: string
}

interface SimpleDeviceTypeStrcut {
  id: number
  name: string
  warehouse: number
}

interface warehouseStruct {
  id?: number
  code: number
  pic: string
  garbageType: number | null
  points: number
}

interface AddRuleStruct {
  id: number
  ruleName: string
  productId: number | undefined
  deviceId: number | undefined
  warehouse?: warehouseStruct[]
  departmentId: number | undefined
}

interface TableDataStruct {
  id: number
  label: string
  status: number
  createTime: string
  staff?: any
  warehouse: any[]
  deviceType: any
  productType: any
}

//#endregion

//#region  钩子函数

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})

onMounted(() => {
  getDeviceRuleTableData()
  getProductType()
  getGarbageType()
  getDepartmnet()
})
//#endregion

//#region 搜索框相关
let showSearchForm = ref(true)
let productArray: Ref<SimpleProductTypeStruct[]> = ref([])
const onSerach = () => {
  getDeviceRuleTableData()
}
const onReset = () => {
  searchFormData.value.productId = undefined
  searchFormData.value.page = 1
  searchFormData.value.deviceName = ''
  searchFormData.value.ruleName = ''
  searchFormData.value.size = 5
}

let searchFormData: Ref<SearchFormDataStruct> = ref({
  productId: undefined,
  ruleName: '',
  deviceName: '',
  page: 1,
  size: 5
})

const getProductType = () => {
  let parm = {
    id: 0,
    name: '',
    page: 1,
    size: 99999
  }
  service.post(PATH_URL + '/MachineMange/getProduct', parm).then((res) => {
    console.log(res)
    productArray.value = res.data
  })
}

//#endregion

//#region  中间按钮处理
let disableUpdate = ref(true)
let disableRemove = ref(true)
let deleteOfBatch = () => {}

const OnClickAdd = () => {
  isUpdate.value = false
  initAddRuleData()
  dialogTableVisible.value = true
}

//#endregion

//#region  dialog 相关

let garbageTypeArray: Ref<GarbageTypeStruct[]> = ref([])

let warehouseArray: Ref<warehouseStruct[]> = ref([])

let deviceTypeArray: Ref<SimpleDeviceTypeStrcut[]> = ref([])
let dialogTableVisible = ref(false)
let title = ref('添加运营规则')
let addRuleFormData: Ref<AddRuleStruct> = ref({
  id: 0,
  ruleName: '',
  productId: undefined,
  deviceId: undefined,
  departmentId: undefined
})

const initAddRuleData = () => {
  addRuleFormData.value.id = 0
  addRuleFormData.value.deviceId = undefined
  addRuleFormData.value.productId = undefined
  addRuleFormData.value.ruleName = ''
  addRuleFormData.value.departmentId = undefined
  addRuleFormData.value.warehouse = []
}

const productChange = (val) => {
  service
    .post(
      PATH_URL + '/MachineMange/getDeviceTypeByProductId',
      qs.stringify({ ProductId: val }, { arrayFormat: 'brackets' })
    )
    .then((res) => {
      addRuleFormData.value.deviceId = undefined
      deviceTypeArray.value = res.data
    })
}

const deviceChange = (val) => {
  deviceTypeArray.value.forEach((element) => {
    if (element.id == val) {
      warehouseFactory(element.warehouse)
    }
  })
}

const warehouseFactory = (val: number) => {
  warehouseArray.value = []
  for (let i = 1; i <= val; i++) {
    warehouseArray.value.push({
      code: i,
      pic: '',
      garbageType: null,
      points: 0
    })
  }
}

const getGarbageType = () => {
  let parm = { typeName: '' }
  service.post(PATH_URL + '/MachineMange/getGarbageType', parm).then((res) => {
    garbageTypeArray.value = res.data
  })
}

watch(
  () => JSON.parse(JSON.stringify(warehouseArray.value)),
  (newdata: warehouseStruct[], olddata: warehouseStruct[]) => {
    for (let i = 0; i < newdata.length; i++) {
      let n = newdata[i]
      let o = olddata[i]

      if (n == undefined || o == undefined) {
        continue
      }

      console.log('oldData', o)
      if (n.garbageType !== o.garbageType) {
        console.log('war', warehouseArray.value[i])
        warehouseArray.value[i].pic = getGarbageTypePic(newdata[i].garbageType)
      }
    }
  },
  { deep: true }
)

const getGarbageTypePic = (id: number | null): string => {
  let temp = ''
  if (id === null) {
    return temp
  }

  console.log('id = ', id)
  garbageTypeArray.value.forEach((item) => {
    if (item.id === id) {
      temp = item.pic
    }
  })
  return temp
}

const onCloseDialog = () => {
  addRuleFormData.value.deviceId = undefined
  addRuleFormData.value.productId = undefined
  addRuleFormData.value.ruleName = ''
  warehouseArray.value = []
  dialogTableVisible.value = false
  showImgBox.value = false
}

const onAddConfirm = () => {
  if (isUpdate.value) {
    onUpdateRule()
    return
  }

  let title = '您确定要添加一个运营规则吗？'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let addRuleParm = {
      ruleName: addRuleFormData.value.ruleName,
      productId: addRuleFormData.value.productId,
      deviceId: addRuleFormData.value.deviceId,
      warehouse: warehouseArray.value,
      departmentId: addRuleFormData.value.departmentId
    }

    addRuleFormData.value.warehouse = unref(warehouseArray)
    console.log('addRuleformData', addRuleFormData)
    service.post(PATH_URL + '/MachineMange/addRule', addRuleParm).then(() => {
      ElMessage('操作成功')
      onCloseDialog()
      getDeviceRuleTableData()
    })
  })
}

const onUpdateRule = () => {
  let title = '您确定要修改这个运营规则吗？'
  ElMessageBox.confirm(title, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('dsdsd', addRuleFormData)
    let addRuleParm = {
      ruleName: addRuleFormData.value.ruleName,
      productId: addRuleFormData.value.productId,
      deviceId: (addRuleFormData.value.deviceId as any).id,
      warehouse: warehouseArray.value,
      id: addRuleFormData.value.id
    }

    addRuleFormData.value.warehouse = unref(warehouseArray)
    console.log(addRuleFormData)
    service.post(PATH_URL + '/MachineMange/updateRule', addRuleParm).then(() => {
      ElMessage('操作成功')
      onCloseDialog()
      getDeviceRuleTableData()
    })
  })
}

let showImgBox = ref(false)

//图片数组
let PicArray: Ref<PicStruct[]> = ref([])

let SelectWarehouse: Ref<warehouseStruct> = ref({
  id: 0,
  pic: '',
  garbageType: null,
  points: 0,
  code: 0
})

const getPicArray = (val: number) => {
  if (val == null) {
    return
  }

  service
    .post(
      PATH_URL + '/MachineMange/getGarbagePic',
      qs.stringify({ garbageId: val }, { arrayFormat: 'brackets' })
    )
    .then((res) => {
      console.log(res)
      PicArray.value = res.data
      showImgBox.value = true
    })
}

const onClickChange = (val) => {
  console.log(val)

  SelectWarehouse.value = val
  getPicArray(val.garbageType)
}

const PicSelect = (val) => {
  console.log(val)
  if (!!SelectWarehouse.value) {
    SelectWarehouse.value.pic = val.pic
  }
  showImgBox.value = false
}

//#endregion

//#region  表格相关
let TableData: Ref<TableDataStruct[]> = ref([])
let isUpdate = ref(false)
let TableRef = ref(ElTable)
let selectTable: TableDataStruct = {
  id: 0,
  label: '',
  status: 0,
  createTime: '',
  deviceType: 0,
  productType: 0,
  warehouse: []
}

const getDeviceRuleTableData = () => {
  searchFormData.value.page = currentPage.value
  searchFormData.value.size = pageSize.value
  console.log(searchFormData.value)
  service.post(PATH_URL + '/MachineMange/getDeviceRule', searchFormData.value).then((res) => {
    console.log(res)
    TableData.value = res.data.records
    total.value = res.data.total
  })
}

let DepartmentArray: Ref<any[]> = ref([])

const getDepartmnet = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
    console.log(res)
    DepartmentArray.value = res.data
  })
}

const handleDetail = (val) => {
  console.log('xiuggai', val)
  isUpdate.value = true
  addRuleFormData.value.id = val.id

  addRuleFormData.value.productId = val.productId
  addRuleFormData.value.departmentId = val.departmentId
  selectTable = val
  updateProductBind(val.productId)
}

const updateProductBind = (val) => {
  service
    .post(
      PATH_URL + '/MachineMange/getDeviceTypeByProductId',
      qs.stringify({ ProductId: val }, { arrayFormat: 'brackets' })
    )
    .then((res) => {
      deviceTypeArray.value = res.data
      addRuleFormData.value.ruleName = selectTable.label
      addRuleFormData.value.deviceId = selectTable.deviceType?.id
      warehouseArray.value = []
      console.log('seletcTable', selectTable)

      for (let i = 0; i < selectTable.warehouse.length; i++) {
        console.log(selectTable.warehouse[i])
        warehouseArray.value.push({
          code: selectTable.warehouse[i].code,
          pic: selectTable.warehouse[i].pic,
          garbageType: selectTable.warehouse[i].garbageType,
          points: selectTable.warehouse[i].points
        })
      }
      console.log('dsds', warehouseArray)
      dialogTableVisible.value = true
    })
}

const handleRemove = (val) => {
  ElMessageBox.confirm('您确定要删除这条运营规则？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/deleteRule',
        qs.stringify({ ruleId: val.id }, { arrayFormat: 'brackets' })
      )
      .then(() => {
        ElMessage('操作成功')
        getDeviceRuleTableData()
      })
  })
}

const converStatus = (val) => {
  let title = '已发布'
  if (val == 0) {
    title = '未发布'
  }
  return title
}

const handlePublish = (val) => {
  ElMessageBox.confirm('您确定要发布这条运营规则？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/publishRule',
        qs.stringify({ ruleId: val.id }, { arrayFormat: 'brackets' })
      )
      .then(() => {
        ElMessage('操作成功')
        getDeviceRuleTableData()
      })
  })
}

//#endregion
</script>

<style lang="less" scoped>
.scrollbar-demo-item {
  display: flex;
  height: 150px;
  margin: 15px;
  color: var(--el-color-primary);
  text-align: center;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  align-items: center;
  justify-content: center;

  .img {
    width: 160px;
    height: 160px;
    background-color: aquamarine;
  }
}

.test {
  width: 80%;
}

.imgBox {
  position: absolute;
  // right: v-bind(cssRight);
  // top: v-bind(cssTop);git
  z-index: 9999;
  width: 500px;
  height: 140px;
  background-color: #8c939d;
}

.imgBoxList {
  width: 100px;
  height: 100px;
  margin-left: 2px;
}

.buttonOfTables {
  padding-left: 10px;
  margin-right: 3px;
  margin-left: 3px;
}

.item {
  margin-left: 10px;
}
</style>
