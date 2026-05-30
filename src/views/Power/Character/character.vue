<template>
  <div class="character-page">
    <AForm v-if="showSearch" :model="searchFormData" layout="inline" class="search-form">
      <AFormItem label="角色名称" class="search-form-item">
        <AInput v-model:value="searchFormData.name" placeholder="请输入角色名称" />
      </AFormItem>

      <AFormItem label="角色状态" class="search-form-item">
        <ASelect v-model:value="searchFormData.status" :options="selectOption" allow-clear placeholder="请选择角色状态" />
      </AFormItem>

      <AFormItem label="创建时间" class="search-form-item search-form-item--range">
        <ARangePicker v-model:value="dateSelect" value-format="YYYY-MM-DD HH:mm:ss" class="date-range" />
      </AFormItem>

      <AFormItem class="search-form-action">
        <AButton type="primary" class="icon-button" v-hasPermi="Permission.sec" @click="onQuery">
          <template #icon>
            <Icon icon="ant-design:search-outlined" />
          </template>
          搜索
        </AButton>
      </AFormItem>

      <AFormItem class="search-form-action">
        <AButton class="icon-button" @click="onReset">
          <template #icon>
            <Icon icon="ant-design:reload-outlined" />
          </template>
          重置
        </AButton>
      </AFormItem>
    </AForm>

    <div class="toolbar">
      <div class="toolbar-left">
        <AButton type="primary" class="icon-button" @click="OnClickAdd" v-hasPermi="Permission.add">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新增
        </AButton>

        <AButton danger class="icon-button" :disabled="EnableDelete" @click="DeleteBatch" v-hasPermi="Permission.del">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
        </AButton>
      </div>

      <div class="toolbar-right">
        <ATooltip :title="showSearch ? '隐藏搜索' : '显示搜索'">
          <AButton shape="circle" @click="OnClickOfShowForm">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
          </AButton>
        </ATooltip>
        <ATooltip title="刷新">
          <AButton shape="circle" @click="onPageRest">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
          </AButton>
        </ATooltip>
      </div>
    </div>

    <ATable row-key="id" :columns="columns" :data-source="tableData" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <ASwitch v-model:checked="record.status" :checked-value="1" :un-checked-value="0" />
        </template>

        <template v-else-if="column.key === 'create_time'">
          {{ FormatDate(record.create_time) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action" @click="handleEdit(record)" v-hasPermi="Permission.rev">
              <template #icon>
                <Icon icon="ant-design:edit-outlined" />
              </template>
              编辑
            </AButton>
            <AButton type="link" class="table-action" @click="onClickUpdateDataMode(record)" v-hasPermi="Permission.rev">
              <template #icon>
                <Icon icon="ant-design:safety-certificate-outlined" />
              </template>
              修改数据权限
            </AButton>
            <AButton type="link" danger class="table-action" @click="handleRemove(record)" v-hasPermi="Permission.del">
              <template #icon>
                <Icon icon="ant-design:delete-outlined" />
              </template>
              删除
            </AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="searchFormData.page"
        v-model:page-size="searchFormData.size"
        :page-size-options="['5', '10', '15', '20']"
        :show-size-changer="true"
        :total="searchFormData.total"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        show-quick-jumper
        @change="handleCurrentChange"
        @show-size-change="handleSizeChange"
      />
    </div>

    <AModal v-model:open="dialogFormVisible" :title="addFormData.id ? '修改角色' : '添加角色'" width="900px" wrap-class-name="role-modal" :destroy-on-close="true" centered @cancel="onCloseDialog">
      <AForm :model="addFormData" layout="vertical" class="role-form">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="角色名称">
              <AInput v-model:value="addFormData.name" placeholder="请输入角色名称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="角色顺序">
              <AInputNumber v-model:value="addFormData.sort" :min="1" :max="10" class="w-full" controls-position="right" @change="handleChange" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="所属运营商">
              <ASelect v-model:value="addFormData.departmentId" :options="departmentOptions" placeholder="请选择运营商" allow-clear />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="角色状态">
              <ARadioGroup v-model:value="addFormData.status" class="role-status">
                <ARadio :value="1">正常</ARadio>
                <ARadio :value="0">停用</ARadio>
              </ARadioGroup>
            </AFormItem>
          </ACol>
        </ARow>

        <div class="role-permission">
          <div class="permission-header">
            <span class="permission-title">菜单权限</span>
            <div class="tree-actions">
              <ACheckbox v-model:checked="isOpen" @change="openChange">展开/折叠</ACheckbox>
              <ACheckbox v-model:checked="isSelectAll" @change="selectAllChang">全选</ACheckbox>
            </div>
          </div>
          <div class="tree-wrap">
            <ATree v-model:checkedKeys="checkedMenuKeys" v-model:expandedKeys="expandedMenuKeys" :tree-data="data" checkable block-node @check="handleTreeCheck" />
          </div>
        </div>

        <AFormItem label="备注" class="role-remark">
          <ATextarea v-model:value="addFormData.remarks" :rows="2" placeholder="请输入备注" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onCloseDialog">取消</AButton>
          <AButton type="primary" @click="onClickConfirm">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="showSelectDataMode" title="选择数据模式" :destroy-on-close="true">
      <AForm :model="dataModelFormData" layout="vertical">
        <AFormItem label="角色名称">
          <AInput v-model:value="dataModelFormData.descript" disabled />
        </AFormItem>

        <AFormItem label="数据选项">
          <ASelect v-model:value="dataModelFormData.code" :options="dataModeOptions" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onclickUpdateDataModeClose">取消</AButton>
          <AButton type="primary" @click="onClickUpdateDialog">确认</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { computed, inject, onMounted, reactive, ref, unref } from 'vue'
import {
  Button as AButton,
  Checkbox as ACheckbox,
  DatePicker as ADatePicker,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  Radio as ARadio,
  RadioGroup as ARadioGroup,
  Select as ASelect,
  Space as ASpace,
  Switch as ASwitch,
  Table as ATable,
  Tooltip as ATooltip,
  Tree as ATree,
  message
} from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import type { AxiosRequestConfig } from 'axios'
import { FormatDate } from '@/utils/tools'
import { Icon } from '@/components/Icon'

type TreeKey = string | number
type DateRangeValue = [string, string] | undefined

interface RoleData {
  [key: string]: any
  id: number
  name: string
  sort: number
  status: number
  create_admin: string
  create_time: string
  dataPower: number
  Department_id?: number
  remarks?: string
}

interface DataModel {
  id: number
  descript: string
  code: number
}

interface SourceMenuTreeNode {
  sign: TreeKey
  label: string
  children?: SourceMenuTreeNode[]
}

const ARangePicker = ADatePicker.RangePicker
const ATextarea = AInput.TextArea

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getCharacter()
}

//#region  修改数据权限

const onClickUpdateDialog = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这个数据权限？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const pars = {
        id: dataModelFormData.id,
        dataPower: dataModelFormData.code
      }
      await service.post(PATH_URL + '/Permission/updateDataMode', pars)
      message.success('操作成功')
      onclickUpdateDataModeClose()
      getCharacter()
    }
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

const handleSizeChange = (_current: number, size: number) => {
  searchFormData.size = size
  searchFormData.page = 1
  getCharacter()
}

const handleCurrentChange = (page = searchFormData.page, size = searchFormData.size) => {
  searchFormData.page = page
  searchFormData.size = size
  getCharacter()
}

//#endregion

//#region 展示表格

const selectItem = ref('')

const onClickUpdateDataMode = (record: Record<string, any>) => {
  const val = record as RoleData
  dataModelFormData.id = val.id
  dataModelFormData.descript = val.name
  dataModelFormData.code = val.dataPower
  selectItem.value = String(val.dataPower)
  showSelectDataMode.value = true
}

const dataMode = ref<DataModel[]>([])

const dataModeOptions = computed(() =>
  dataMode.value.map((item) => ({
    label: item.descript,
    value: item.id
  }))
)

const getDataMode = () => {
  service.get(PATH_URL + '/Permission/getDataModel').then((res: any) => {
    dataMode.value = res.data || []
  })
}

const dataModelFormData: DataModel = reactive({
  id: 1,
  descript: '',
  code: 1
})

const showSelectDataMode = ref(false)

const tableData = ref<RoleData[]>([])

const selectedRowKeys = ref<TreeKey[]>([])
let DeleteIdArray: number[] = []

const EnableDelete = computed(() => selectedRowKeys.value.length === 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TreeKey[], rows: RoleData[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const columns = [
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '显示顺序', dataIndex: 'sort', key: 'sort', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '创建人', dataIndex: 'create_admin', key: 'create_admin', width: 120 },
  { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '操作', key: 'action', width: 260 }
]

const DeleteBatch = () => {
  if (DeleteIdArray.length == 0) {
    message.warning('请选择要删除的角色！')
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要删除这些角色？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const pars = {
        ids: DeleteIdArray
      }
      await service.post(PATH_URL + '/Permission/deleteCharacter', pars)
      message.success('操作成功')
      getCharacter()
    }
  })
}

const DepartmentArray = ref<any[]>([])

const departmentOptions = computed(() =>
  DepartmentArray.value.map((item) => ({
    label: item.platform_name,
    value: item.id
  }))
)

const getDepartmnet = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
    DepartmentArray.value = res.data || []
  })
}

const onReset = () => {
  searchFormData.name = ''
  searchFormData.status = undefined
  dateSelect.value = undefined
  searchFormData.page = 1
  getCharacter()
}

const getCharacter = () => {
  const [startTime = '', endTime = ''] = dateSelect.value || []
  searchFormData.sTime = startTime || ''
  searchFormData.eTime = endTime || ''
  service.post(PATH_URL + '/Permission/getPowCharacterOfLevel', searchFormData).then((res: any) => {
    tableData.value = res.data.records
    searchFormData.total = res.data.total
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

// 表格中编辑
const handleEdit = (record: Record<string, any>) => {
  const value = record as RoleData
  const _data = unref(value)
  addFormData.id = _data.id
  addFormData.status = _data.status
  addFormData.name = _data.name
  addFormData.remarks = _data.remarks || ''
  addFormData.sort = _data.sort
  addFormData.departmentId = _data.Department_id
  const temp: AxiosRequestConfig = {
    params: { CharacterId: _data.id }
  }

  service.get(PATH_URL + '/Permission/getMenuIdOfCharacter', temp).then((res: any) => {
    checkedMenuKeys.value = res.data || []
    halfCheckedMenuKeys.value = []
    dialogFormVisible.value = true
  })
}

const handleRemove = (record: Record<string, any>) => {
  const value = record as RoleData
  AModal.confirm({
    title: '提示',
    content: '确定要删除这个角色？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const ids = {
        ids: [value.id]
      }

      await service.post(PATH_URL + '/Permission/deleteCharacter', ids)
      message.success('操作成功')
      getCharacter()
    }
  })
}
//#endregion

//#region 搜索功能

const searchFormData = reactive<{
  name: string
  status?: number
  page: number
  size: number
  total: number
  sTime: string
  eTime: string
}>({
  name: '',
  status: undefined,
  page: 1,
  size: 10,
  total: 0,
  sTime: '',
  eTime: ''
})

const dateSelect = ref<DateRangeValue>()

const selectOption = [
  {
    value: 1,
    label: '正常'
  },
  {
    value: 0,
    label: '禁用'
  }
]

const showSearch = ref(true)
//#endregion

//#region  添加角色 提交| 取消 处理

// 关闭 dialog
const resetRoleDialogState = () => {
  addFormData.remarks = ''
  addFormData.sort = 1
  addFormData.name = ''
  addFormData.status = 1
  addFormData.id = 0
  addFormData.departmentId = undefined
  checkedMenuKeys.value = []
  halfCheckedMenuKeys.value = []
  isOpen.value = false
  isSelectAll.value = false
}

const onCloseDialog = () => {
  resetRoleDialogState()
  dialogFormVisible.value = false
}

const onClickConfirm = () => {
  AModal.confirm({
    title: '提示',
    content: addFormData.id ? '确定要修改这个角色？' : '确定要添加这个角色？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      addFormData.menus = [...checkedMenuKeys.value, ...halfCheckedMenuKeys.value]
      await service.post(PATH_URL + '/Permission/addCharacter', addFormData)
      message.success(addFormData.id ? '修改记录成功' : '添加记录成功')
      getCharacter()
      onCloseDialog()
    }
  })
}

const onQuery = () => {
  searchFormData.page = 1
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
  service.get(PATH_URL + '/Permission/getTreeData').then((res: any) => {
    data.value = normalizeTreeData(res.data || [])
  })
}

//#endregion

//#region 树相关

const isOpen = ref(false) // 菜单树是否展开

const isSelectAll = ref(false) // 菜单树是否全选

const normalizeTreeData = (nodes: SourceMenuTreeNode[]): DataNode[] => {
  return nodes.map((node) => ({
    key: node.sign,
    title: node.label,
    children: normalizeTreeData(node.children || [])
  }))
}

const collectTreeKeys = (nodes: DataNode[]): TreeKey[] => {
  return nodes.flatMap((node) => [node.key as TreeKey, ...collectTreeKeys((node.children || []) as DataNode[])])
}

const openChange = (event: any) => {
  const checked = event.target.checked
  isOpen.value = checked
  expandedMenuKeys.value = checked ? collectTreeKeys(data.value) : []
}

const selectAllChang = (event: any) => {
  const checked = event.target.checked
  isSelectAll.value = checked
  checkedMenuKeys.value = checked ? collectTreeKeys(data.value) : []
  halfCheckedMenuKeys.value = []
}

const handleTreeCheck = (keys: any, info: any) => {
  checkedMenuKeys.value = Array.isArray(keys) ? keys : keys.checked || []
  halfCheckedMenuKeys.value = info?.halfCheckedKeys || keys?.halfChecked || []
}

const data = ref<DataNode[]>([])
const checkedMenuKeys = ref<TreeKey[]>([])
const halfCheckedMenuKeys = ref<TreeKey[]>([])
const expandedMenuKeys = ref<TreeKey[]>([])

//#endregion

//#region   添加 删除 工具条
const OnClickOfShowForm = () => {
  showSearch.value = !showSearch.value
}

const OnClickAdd = () => {
  resetRoleDialogState()
  dialogFormVisible.value = true
}

//#endregion

//#region 添加dialog 界面

// 角色顺序变化处理
const handleChange = () => {}

// //树 多选框 选择变化
// const handleCheckChange = () => {}

const addFormData = reactive<{
  [key: string]: any
  name: string
  sort: number
  status: number
  remarks: string
  menus: TreeKey[]
  authority: TreeKey[]
  id: number
  departmentId?: number
}>({
  name: '',
  sort: 1,
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
.character-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: flex;
  padding: 16px 16px 0;
  background-color: #fff;
  border-radius: 6px;
  flex-wrap: wrap;
  column-gap: 16px;
  row-gap: 12px;
  align-items: flex-start;

  :deep(.ant-form-item) {
    margin-inline-end: 0;
    margin-bottom: 16px;
  }
}

.search-form-item {
  flex: 0 1 260px;
  min-width: 220px;

  :deep(.ant-picker),
  :deep(.ant-select),
  :deep(.ant-input) {
    width: 100%;
  }

  &--range {
    flex-basis: 360px;
  }
}

.search-form-action {
  flex: 0 0 auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left,
.toolbar-right {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.icon-button,
.table-action {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;

  :deep(.ant-btn-icon) {
    display: inline-flex;
    line-height: 1;
    align-items: center;
  }

  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    line-height: 1;
    align-items: center;
    justify-content: center;
  }
}

.table-action {
  padding-inline: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.role-form {
  max-width: 100%;

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  :deep(.ant-row) {
    margin-right: 0 !important;
    margin-left: 0 !important;
    row-gap: 2px;
  }

  :deep(.ant-col) {
    padding-right: 8px !important;
    padding-left: 8px !important;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 6px;
  }

  :deep(.ant-form-item-label > label) {
    height: 20px;
    color: rgb(0 0 0 / 72%);
    font-weight: 500;
  }

  :deep(.ant-input),
  :deep(.ant-input-number),
  :deep(.ant-select-selector),
  :deep(.ant-input-affix-wrapper) {
    min-height: 34px;
  }
}

.role-status {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
}

.role-permission {
  margin-top: 4px;
  padding: 14px 16px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: #fafafa;
}

.permission-header {
  display: flex;
  margin-bottom: 10px;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.permission-title {
  color: rgb(0 0 0 / 88%);
  font-size: 14px;
  font-weight: 600;
}

.tree-actions {
  display: flex;
  gap: 18px;
  align-items: center;
  white-space: nowrap;
}

.tree-wrap {
  height: 300px;
  padding: 10px 12px;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background-color: #fff;

  :deep(.ant-tree) {
    min-width: 0;
    background: transparent;
  }

  :deep(.ant-tree-node-content-wrapper) {
    min-width: 0;
  }

  :deep(.ant-tree-title) {
    overflow-wrap: anywhere;
  }
}

.role-remark {
  margin-top: 16px;

  :deep(.ant-input) {
    resize: vertical;
  }
}

.date-range {
  width: 100%;
}

.w-full {
  width: 100%;
}

@media (width <= 768px) {
  .search-form-item,
  .search-form-action {
    flex: 1 1 100%;
  }

  .role-form {
    :deep(.ant-col) {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }

  .permission-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tree-actions {
    align-items: flex-start;
  }
}
</style>

<style lang="less">
.role-modal {
  .ant-modal {
    max-width: calc(100vw - 32px);
  }

  .ant-modal-content {
    overflow: hidden;
    border-radius: 10px;
  }

  .ant-modal-header {
    padding: 22px 24px 10px;
    margin-bottom: 0;
  }

  .ant-modal-title {
    color: rgb(0 0 0 / 88%);
    font-size: 16px;
    font-weight: 600;
  }

  .ant-modal-body {
    max-height: calc(100vh - 220px);
    padding: 12px 24px 16px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .ant-modal-footer {
    padding: 14px 24px 18px;
    margin-top: 0;
    border-top: 1px solid #f0f0f0;
  }

  .ant-modal-footer .ant-space {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
