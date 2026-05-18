<template>
  <el-form :model="searchFormData" :inline="true" v-if="showSearch">
    <el-row>
      <el-col :span="5">
        <el-form-item label="角色名称:">
          <el-input v-model="searchFormData.name" placeholder="请输入角色名称" />
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="角色状态:">
          <el-select v-model="searchFormData.status">
            <el-option
              v-for="item in selectOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="创建时间:">
          <el-date-picker
            v-model="dateSelect"
            type="daterange"
            range-separator="到"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            size="default"
          />
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
    <el-table
      ref="multipleTableRef"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="记录编号" width="80" property="id" />
      <el-table-column label="角色名称" width="220" property="name" />
      <el-table-column label="显示顺序" width="180" property="sort" />
      <el-table-column label="状态" width="180">
        <template #default="scope">
          <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" />
        </template>
      </el-table-column>
      <el-table-column label="创建人" width="100" property="create_admin" />
      <el-table-column label="创建时间" v-slot="scope">
        {{ FormatDate(scope.row.create_time) }}
      </el-table-column>
      <el-table-column label="操作" v-slot="scope">
        <div class="buttonOfTables">
          <el-link
            type="primary"
            class="bt"
            @click="handleEdit(scope.row)"
            v-hasPermi="Permission.rev"
            >编辑</el-link
          >
          <el-link
            type="primary"
            class="bt"
            @click="onClickUpdateDataMode(scope.row)"
            v-hasPermi="Permission.rev"
            >修改数据权限</el-link
          >
          <el-link
            type="primary"
            class="bt"
            @click="handleRemove(scope.row)"
            v-hasPermi="Permission.del"
            >删除</el-link
          >
        </div>
      </el-table-column>
    </el-table>
  </el-row>

  <el-row style="width: 100%; text-align: right">
    <el-pagination
      v-model:current-page="searchFormData.page"
      v-model:page-size="searchFormData.size"
      :page-sizes="[5, 10, 15, 20]"
      :small="false"
      layout="total, sizes, prev, pager, next, jumper"
      :total="searchFormData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-row>

  <el-dialog v-model="dialogFormVisible" title="添加/修改 角色">
    <el-form :model="addFormData">
      <el-form-item label="角色名称:" label-width="100">
        <el-input v-model="addFormData.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色顺序" label-width="100">
        <el-input-number
          v-model="addFormData.sort"
          :min="1"
          :max="10"
          controls-position="right"
          size="default"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="所属运营商" label-width="100">
        <el-select v-model="addFormData.departmentId" placeholder="请选择运营商">
          <el-option
            v-for="item in DepartmentArray"
            :key="item.id"
            :value="item.id"
            :label="item.platform_name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="角色状态" label-width="100">
        <el-radio-group v-model="addFormData.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="菜单权限" label-width="100">
        <el-row>
          <el-checkbox v-model="isOpen" label="展开/折叠" size="default" @change="openChange" />
          <el-checkbox v-model="isSelectAll" label="全选" size="default" @change="selectAllChang" />
        </el-row>
        <el-row class="test">
          <el-tree
            ref="treeRef"
            :data="data"
            show-checkbox
            node-key="sign"
            :props="props"
            class="tree"
          />
        </el-row>
      </el-form-item>
      <el-form-item label="备注" label-width="100">
        <el-input v-model="addFormData.remarks" :rows="4" type="textarea" placeholder="" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCloseDialog">取消</el-button>
        <el-button type="primary" @click="onClickConfirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog title="选择数据模式" v-model="showSelectDataMode">
    <el-form :model="dataModelFormData">
      <el-form-item label="角色名称：" label-width="100">
        <el-input v-model="dataModelFormData.descript" disabled />
      </el-form-item>
      <el-form-item label="数据选项:" label-width="100">
        <el-select v-model="dataModelFormData.code">
          <el-option
            v-for="item in dataMode"
            :key="item.code"
            :label="item.descript"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onclickUpdateDataModeClose">取消</el-button>
        <el-button type="primary" @click="onClickUpdateDialog"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ElTable, ElTree } from 'element-plus'
import { onMounted, reactive, ref, unref, nextTick, Ref, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AxiosRequestConfig } from 'axios'
import { FormatDate } from '@/utils/tools'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

//#region  修改数据权限

const onClickUpdateDialog = () => {
  ElMessageBox.confirm('确定要修改这个数据权限？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let pars = {
      id: dataModelFormData.id,
      dataPower: dataModelFormData.code
    }
    service.post(PATH_URL + '/Permission/updateDataMode', pars).then(() => {
      ElMessage('操作成功')
      onclickUpdateDataModeClose()
      getCharacter()
    })
  })
}

const Permission = ref({
  add: 'pow_chr_add',
  rev: 'pow_chr_rev',
  del: 'pow_chr_del',
  sec: 'pow_chr_sec'
})

const onclickUpdateDataModeClose = () => {
  showSelectDataMode.value = false
}
//#endregion

//#region 分页

const handleSizeChange = () => {}
const handleCurrentChange = () => {}

//#endregion

//#region 展示表格

const selectItem = ref('')

const onClickUpdateDataMode = (val) => {
  dataModelFormData.id = val.id
  dataModelFormData.descript = val.name
  dataModelFormData.code = val.dataPower
  // selectItem.value = ConverToDataMode(val.dataPower)
  console.log(dataModelFormData)
  selectItem.value = val.dataPower
  showSelectDataMode.value = true
}

interface DataModel {
  id: number
  descript: string
  code: number
}

let dataMode: DataModel[] = reactive([
  {
    id: 0,
    descript: '',
    code: 1
  }
])

const getDataMode = () => {
  service.get(PATH_URL + '/Permission/getDataModel').then((res) => {
    console.log(res)
    dataMode = res.data
  })
}

let dataModelFormData: DataModel = reactive({
  id: 1,
  descript: '',
  code: 1
})

const showSelectDataMode = ref(false)

let tableData = ref([])

let DeleteIdArray = [] as any[]

const multipleTableRef = ref(ElTable)

const DeleteBatch = () => {
  if (DeleteIdArray.length == 0) {
    ElMessage('请选择要删除的角色！')
    return
  }

  ElMessageBox.confirm('确定要删除这些角色？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let pars = {
      ids: DeleteIdArray
    }
    service.post(PATH_URL + '/Permission/deleteCharacter', pars).then(() => {
      ElMessage('操作成功')
      getCharacter()
    })
  })
}

const handleSelectionChange = (val) => {
  if (val.length > 0) {
    EnableDelete.value = false
  } else {
    EnableDelete.value = true
  }
  DeleteIdArray = []
  val.forEach((row) => {
    DeleteIdArray.push(row.id)
  })
}

let DepartmentArray: Ref<any[]> = ref([])

const getDepartmnet = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
    DepartmentArray.value = res.data
    console.log('department', DepartmentArray)
  })
}

const onReset = () => {
  searchFormData.value.name = ''
  searchFormData.value.status = undefined
  dateSelect.value = ''
}

const getCharacter = () => {
  searchFormData.value.sTime = dateSelect.value[0]
  searchFormData.value.eTime = dateSelect.value[1]
  console.log('sss', searchFormData.value)
  service
    .post(PATH_URL + '/Permission/getPowCharacterOfLevel', searchFormData.value)
    .then((res: any) => {
      console.log('ccc', res)
      tableData.value = res.data.records
      searchFormData.value.total = res.data.total
    })
}

//表格中编辑
const handleEdit = (value) => {
  console.log('haha', value)
  let _data = unref(value)
  addFormData.id = _data.id
  addFormData.status = _data.status
  addFormData.name = _data.name
  addFormData.remarks = _data.remarks
  addFormData.sort = _data.sort
  addFormData.departmentId = _data.Department_id
  let temp: AxiosRequestConfig = {}
  temp.params = { CharacterId: _data.id }

  service.get(PATH_URL + '/Permission/getMenuIdOfCharacter', temp).then((res) => {
    dialogFormVisible.value = true
    nextTick(() => {
      treeRef.value!.setCheckedKeys(res.data, false)
    })
  })
}

const handleRemove = (value) => {
  ElMessageBox.confirm('确定要删除这个角色？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let pars = [] as any[]
    pars.push(value.id)
    let ids = {
      ids: pars
    }

    service.post(PATH_URL + '/Permission/deleteCharacter', ids).then(() => {
      ElMessage('操作成功')
      getCharacter()
    })
  })
}
//#endregion

//#region 搜索功能

const searchFormData = ref({
  name: '',
  status: undefined,
  page: 1,
  size: 10,
  total: 0,
  sTime: '',
  eTime: ''
})

const dateSelect = ref('')

const selectOption = [
  {
    value: 1,
    label: ' 正常'
  },
  {
    value: 0,
    label: '禁用'
  }
]

const showSearch = ref(true)
//#endregion

//#region  添加角色 提交| 取消 处理

//关闭 dialog
const onCloseDialog = () => {
  addFormData.remarks = ''
  addFormData.sort = 0
  addFormData.name = ''
  addFormData.status = 1
  addFormData.id = 0
  treeRef.value.setCheckedKeys([])
  dialogFormVisible.value = false
}

const onClickConfirm = () => {
  ElMessageBox.confirm('确定要添加这个角色？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      addFormData.menus = treeRef.value
        .getCheckedKeys(false)
        .concat(treeRef.value.getHalfCheckedKeys())
      console.log(addFormData)
      service.post(PATH_URL + '/Permission/addCharacter', addFormData).then(() => {
        ElMessage('添加记录成功')
        getCharacter()
      })
    })
    .catch(() => {})
    .finally(() => {
      onCloseDialog()
    })
}

const onQuery = () => {
  getCharacter()
}

//#endregion

//#region 挂载 钩子函数
onMounted(() => {
  getCharacter()
  getTreeData()
  getDataMode()
  getDepartmnet()
})

const getTreeData = () => {
  service.get(PATH_URL + '/Permission/getTreeData').then((res) => {
    console.log(res)
    data.value = res.data
  })
}

//#endregion

//#region 树相关

const isOpen = ref(false) //菜单树是否展开

const isSelectAll = ref(false) //菜单树 是否 全选

const openChange = (value: boolean) => {
  for (let i = 0; i < data.value.length; i++) {
    treeRef.value.store.nodesMap[(data.value[i] as any).sign].expanded = value
  }
}

const selectAllChang = (value: boolean) => {
  treeRef.value.setCheckedNodes(value ? data.value : [])
}

const props = {
  label: 'label',
  children: 'children'
}

let data = ref([])
const treeRef = ref(ElTree)

//#endregion

//#region   添加 删除 工具条
const EnableDelete = ref(true)

const OnClickOfShowForm = () => {
  showSearch.value = !showSearch.value
}

const OnClickAdd = () => {
  dialogFormVisible.value = true
}

//#endregion

//#region 添加dialog 界面

//角色顺序变化处理
const handleChange = () => {}

// //树 多选框 选择变化
// const handleCheckChange = () => {}

const addFormData = reactive({
  name: '',
  sort: 0,
  status: 1,
  remarks: '',
  menus: [],
  authority: [],
  id: 0,
  departmentId: undefined
})

const dialogFormVisible = ref(false)

//#endregion
</script>

<style lang="less" scoped>
.fm_center {
  padding-left: 10px;
  text-align: center;
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

.bt {
  margin-left: 20px;
}

.tree {
  width: 100%;
  height: 100%;
  border: 1px solid #e6e6e6;
}

.test {
  width: 100%;
  background-color: aquamarine;
}
</style>
