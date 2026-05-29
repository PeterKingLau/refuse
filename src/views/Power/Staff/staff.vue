<template>
  <div class="staff-page">
    <ALayout class="staff-layout">
      <ALayoutSider width="220" class="staff-sider">
        <AInput v-model:value="filterText" allow-clear placeholder="搜索运营商" class="department-search">
          <template #prefix>
            <Icon icon="ant-design:search-outlined" />
          </template>
        </AInput>

        <ATree :tree-data="filteredDepartmentTree" :selected-keys="selectedDepartmentKeys" default-expand-all block-node class="department-tree" @select="handleDepartmentSelect" />
      </ALayoutSider>

      <ALayoutContent class="staff-content">
        <AForm v-if="showSearchForm" :model="SearchFormData" layout="inline" class="search-form">
          <AFormItem label="用户名称" class="search-form-item">
            <AInput v-model:value="SearchFormData.name" class="search-input" placeholder="请输入用户名称" />
          </AFormItem>

          <AFormItem label="手机号码" class="search-form-item">
            <AInput v-model:value="SearchFormData.phone" class="search-input" placeholder="请输入用户电话" />
          </AFormItem>

          <AFormItem label="状态" class="search-form-item">
            <ASelect v-model:value="SearchFormData.status" :options="options" allow-clear class="search-input" placeholder="用户状态" />
          </AFormItem>

          <AFormItem label="创建时间" class="search-form-item search-form-item--range">
            <ARangePicker v-model:value="dateSelect" value-format="YYYY-MM-DD HH:mm:ss" class="date-range" />
          </AFormItem>

          <AFormItem class="search-form-action">
            <AButton type="primary" class="icon-button" @click="getStaffData" v-hasPermi="Permission.sec">
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
            <AButton type="primary" class="icon-button" @click="onClickAdd" v-hasPermi="Permission.add">
              <template #icon>
                <Icon icon="ant-design:plus-outlined" />
              </template>
              增加
            </AButton>

            <AButton danger class="icon-button" :disabled="EnableDelete" @click="onClickDelete" v-hasPermi="Permission.del">
              <template #icon>
                <Icon icon="ant-design:delete-outlined" />
              </template>
              删除
            </AButton>
          </div>

          <div class="toolbar-right">
            <ATooltip :title="showSearchForm ? '隐藏搜索' : '显示搜索'">
              <AButton shape="circle" @click="showSearchForm = !showSearchForm">
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
            <template v-if="column.key === 'logoPath'">
              <img v-if="record.logoPath" :src="getImageURL(record.logoPath)" class="table-image" />
              <span v-else class="empty-text">暂无</span>
            </template>

            <template v-else-if="column.key === 'characters'">
              <ASpace wrap>
                <ATag v-for="item in record.characters || []" :key="item.id" color="blue">
                  {{ item.name }}
                </ATag>
              </ASpace>
            </template>

            <template v-else-if="column.key === 'status'">
              <ASwitch v-model:checked="record.status" :checked-value="1" :un-checked-value="0" />
            </template>

            <template v-else-if="column.key === 'action'">
              <ASpace>
                <AButton type="link" class="table-action" @click="onClickUpdateDataMode(record)" v-hasPermi="Permission.rev">
                  <template #icon>
                    <Icon icon="ant-design:edit-outlined" />
                  </template>
                  修改
                </AButton>
                <AButton type="link" danger class="table-action" @click="handleRemove(record)" v-hasPermi="Permission.del">
                  <template #icon>
                    <Icon icon="ant-design:delete-outlined" />
                  </template>
                  删除
                </AButton>
                <AButton type="link" class="table-action" @click="openUpdatePwdDialog(record)" v-hasPermi="Permission.ret">
                  <template #icon>
                    <Icon icon="ant-design:key-outlined" />
                  </template>
                  重置
                </AButton>
              </ASpace>
            </template>
          </template>
        </ATable>

        <div class="pagination-wrap">
          <APagination
            v-model:current="currentPage"
            v-model:page-size="pageSize"
            :page-size-options="['5', '10', '15', '20']"
            :show-size-changer="true"
            :total="total"
            :show-total="(totalCount) => `共 ${totalCount} 条`"
            show-quick-jumper
            @change="handleCurrentChange"
            @show-size-change="handleSizeChange"
          />
        </div>
      </ALayoutContent>
    </ALayout>

    <AModal v-model:open="addDialogVisible" :title="addDialogTitle" width="860px" :destroy-on-close="true" @cancel="onCloseAddDialog">
      <AForm :model="addFormData" layout="vertical" class="staff-form">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="用户名称">
              <AInput v-model:value="addFormData.name" placeholder="请输入用户名称" />
            </AFormItem>
          </ACol>
          <ACol :span="12">
            <AFormItem label="角色">
              <ASelect v-model:value="addFormData.character" :options="characterOptions" mode="multiple" placeholder="请选择角色" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="运营商">
              <ATreeSelect
                v-model:value="addFormData.department"
                :tree-data="departmentTreeData"
                allow-clear
                show-search
                tree-default-expand-all
                tree-node-filter-prop="title"
                placeholder="请选择运营商"
              />
            </AFormItem>
          </ACol>
          <ACol :span="12">
            <AFormItem label="岗位">
              <ASelect v-model:value="addFormData.jobs" :options="jobOptions" mode="multiple" placeholder="请选择岗位" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="手机号码">
              <AInput v-model:value="addFormData.phone" placeholder="请输入手机号码" />
            </AFormItem>
          </ACol>
          <ACol :span="12">
            <AFormItem label="邮箱">
              <AInput v-model:value="addFormData.email" placeholder="请输入邮箱" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="固定电话">
              <AInput v-model:value="addFormData.fixedPhone" placeholder="请输入固定电话" />
            </AFormItem>
          </ACol>
          <ACol :span="12">
            <AFormItem label="状态">
              <ARadioGroup v-model:value="addFormData.status">
                <ARadio :value="1">正常</ARadio>
                <ARadio :value="0">停用</ARadio>
              </ARadioGroup>
            </AFormItem>
          </ACol>

          <template v-if="isAddMode">
            <ACol :span="12">
              <AFormItem label="登录账户">
                <AInput v-model:value="addFormData.loginName" placeholder="请输入登录账户" />
              </AFormItem>
            </ACol>
            <ACol :span="12">
              <AFormItem label="密码">
                <AInputPassword v-model:value="addFormData.password" placeholder="请输入密码" />
              </AFormItem>
            </ACol>
          </template>

          <ACol :span="12">
            <AFormItem label="头像">
              <AUpload class="avatar-uploader" :action="UpImageURL" :show-upload-list="false" :before-upload="beforeAvatarUpload" :headers="headObject" @change="handleAvatarUploadChange">
                <img v-if="addFormData.logoPath" :src="getImageURL(addFormData.logoPath)" class="avatar" />
                <div v-else class="upload-placeholder">
                  <Icon icon="ant-design:plus-outlined" :size="24" />
                </div>
              </AUpload>
            </AFormItem>
          </ACol>

          <ACol :span="24">
            <AFormItem label="备注">
              <ATextarea v-model:value="addFormData.remarks" placeholder="请输入备注" :rows="3" />
            </AFormItem>
          </ACol>
        </ARow>
      </AForm>
      <template #footer>
        <ASpace>
          <AButton @click="onCloseAddDialog">取消</AButton>
          <AButton type="primary" @click="onClickAddSubmit">确定</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="UpdatePwdDialogVisible" :title="updatePwdTitle" width="480px">
      <AForm :model="updatePwdFormData" layout="vertical">
        <AFormItem label="新密码">
          <AInputPassword v-model:value="updatePwdFormData.newAdminPwd" placeholder="请输入新密码" />
        </AFormItem>
      </AForm>
      <template #footer>
        <ASpace>
          <AButton @click="onClickClosePwdDialog">取消</AButton>
          <AButton type="primary" @click="onClickRestPwd">确认</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Col as ACol,
  DatePicker as ADatePicker,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputPassword as AInputPassword,
  Layout as ALayout,
  LayoutContent as ALayoutContent,
  LayoutSider as ALayoutSider,
  Modal as AModal,
  Pagination as APagination,
  Radio as ARadio,
  RadioGroup as ARadioGroup,
  Row as ARow,
  Select as ASelect,
  Space as ASpace,
  Switch as ASwitch,
  Table as ATable,
  Tag as ATag,
  Tooltip as ATooltip,
  Tree as ATree,
  TreeSelect as ATreeSelect,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import type { UploadChangeParam } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { PATH_URL, service } from '@/config/axios/service'
import { Icon } from '@/components/Icon'

type TreeKey = string | number
type DateRangeValue = [string, string] | undefined

interface DepartmentNode {
  id: number
  platformName: string
  corporateName?: string
  children?: DepartmentNode[]
}

interface DepartmentTreeDataNode extends DataNode {
  id: number
  value: number
  title: string
  platformName: string
  corporateName?: string
  children?: DepartmentTreeDataNode[]
}

interface StaffData {
  [key: string]: any
  id: number
  admin?: {
    id: number
    username: string
    password: string
  }
  name: string
  department?: {
    id: number
    platformName: string
  }
  logoPath?: string
  characters?: Array<{ id: number; name: string }>
  jobs?: Array<{ id: number; descript: string }>
  phone?: string
  cardId?: string
  status: number
  createTime?: string
  email?: string
  fixedTelephone?: string
  remarks?: string
}

interface AddFormStruct {
  name: string
  character: number[]
  department: number | undefined
  jobs: number[]
  phone: string
  email: string
  fixedPhone: string
  loginName: string
  password: string
  status: number
  logoPath: string
  remarks: string
  id: number
}

const ARangePicker = ADatePicker.RangePicker
const ATextarea = AInput.TextArea

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getStaffData()
}

const showSearchForm = ref(true)

const Permission = ref({
  add: 'pow_stf_add',
  rev: 'pow_stf_rev',
  del: 'pow_stf_del',
  ret: 'pow_stf_ret',
  sec: 'pow_stf_sec'
})

const characters = ref<any[]>([])
const jobs = ref<any[]>([])

const characterOptions = computed(() =>
  characters.value.map((item) => ({
    label: item.name,
    value: item.id
  }))
)

const jobOptions = computed(() =>
  jobs.value.map((item) => ({
    label: item.descript,
    value: item.id
  }))
)

const getJobs = () => {
  service.get(PATH_URL + '/Permission/getJobOfUser').then((res: any) => {
    jobs.value = res.data || []
  })
}

const isAddMode = ref(true)
const addDialogTitle = ref('')

const onClickUpdateDataMode = (record: Record<string, any>) => {
  const data = record as StaffData
  isAddMode.value = false
  addDialogTitle.value = '修改员工信息'

  addFormData.value.id = data.id
  addFormData.value.name = data.name || ''
  addFormData.value.phone = data.phone || ''
  addFormData.value.email = data.email || ''
  addFormData.value.fixedPhone = data.fixedTelephone || ''
  addFormData.value.status = data.status
  addFormData.value.logoPath = data.logoPath || ''
  addFormData.value.remarks = data.remarks || ''
  addFormData.value.department = data.department?.id
  addFormData.value.jobs = (data.jobs || []).map((item) => item.id)
  addFormData.value.character = (data.characters || []).map((item) => item.id)
  addDialogVisible.value = true
}

const handleDepartmentSelect = (_keys: TreeKey[], info: any) => {
  SearchFormData.departmentId = info?.selected ? info.node?.id : undefined
  currentPage.value = 1
  getStaffData()
}

const handleRemove = (record: Record<string, any>) => {
  const data = record as StaffData
  deleteStaff([data.id])
}

const onClickDelete = () => {
  deleteStaff([...DeleteIdArray])
}

const deleteStaff = (ids: number[]) => {
  if (ids.length === 0) {
    message.warning('请选择要删除的员工')
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要删除选中的员工吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const res: any = await service.post(PATH_URL + '/Permission/deleteStaff', ids)
      if (res?.code === 200 || res) {
        message.success('操作成功')
        getStaffData()
      }
    }
  })
}

const UpdatePwdDialogVisible = ref(false)

const updatePwdTitle = ref('')

const openUpdatePwdDialog = (record: Record<string, any>) => {
  const data = record as StaffData
  updatePwdTitle.value = `重置${data.admin?.username || ''}的密码`
  updatePwdFormData.value.adminId = data.admin?.id || 0
  updatePwdFormData.value.adminName = data.admin?.username || ''
  updatePwdFormData.value.adminPwd = data.admin?.password || ''
  updatePwdFormData.value.newAdminPwd = ''
  UpdatePwdDialogVisible.value = true
}

const onClickRestPwd = () => {
  if (!updatePwdFormData.value.newAdminPwd) {
    message.warning('请输入新密码')
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要重置这个用户的密码吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const params = {
        pwd: updatePwdFormData.value.newAdminPwd,
        adminId: updatePwdFormData.value.adminId
      }

      await service.post(PATH_URL + '/Permission/restPwd', params)
      message.success('操作成功')
      onClickClosePwdDialog()
    }
  })
}

const onClickClosePwdDialog = () => {
  UpdatePwdDialogVisible.value = false
}

const updatePwdFormData = ref({
  adminId: 0,
  adminName: '',
  adminPwd: '',
  newAdminPwd: ''
})

const getCharacter = () => {
  service.get(PATH_URL + '/Permission/getPowCharacterForSelect').then((res: any) => {
    characters.value = res.data || []
  })
}

const handleUploadResponse = (response: any) => {
  if (response?.code == 200) {
    addFormData.value.logoPath = response.data
  } else {
    message.error('上传图片出错了')
  }
}

const handleAvatarUploadChange = (info: UploadChangeParam) => {
  if (info.file.status === 'done') {
    handleUploadResponse(info.file.response)
  }
}

const beforeAvatarUpload = () => true

const cleanAddFormData = () => {
  addFormData.value = {
    name: '',
    character: [],
    department: undefined,
    jobs: [],
    phone: '',
    email: '',
    fixedPhone: '',
    loginName: '',
    password: '',
    status: 1,
    logoPath: '',
    remarks: '',
    id: 0
  }
}

const onClickAddSubmit = () => {
  if (!isAddMode.value) {
    onUpdateStaff()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加这个员工吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const res: any = await service.post(PATH_URL + '/Permission/addStaff', addFormData.value)
      if (res?.code === 200 || res) {
        message.success('添加成功')
        onCloseAddDialog()
      }
    }
  })
}

const onUpdateStaff = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这个员工吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await service.post(PATH_URL + '/Permission/updateStaff', addFormData.value)
      message.success('操作成功')
      onCloseAddDialog()
    }
  })
}

const addFormData = ref<AddFormStruct>({
  name: '',
  character: [],
  department: undefined,
  jobs: [],
  phone: '',
  email: '',
  fixedPhone: '',
  loginName: '',
  password: '',
  status: 1,
  logoPath: '',
  remarks: '',
  id: 0
})

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const UpImageURL = computed(() => PATH_URL + '/Common/upLoadImage')

const getImageURL = (imageURL?: string) => {
  return imageURL ? PATH_URL + '/Common/downLoadPic/' + imageURL : ''
}

const addDialogVisible = ref(false)

const onClickAdd = () => {
  cleanAddFormData()
  addDialogTitle.value = '添加员工信息'
  isAddMode.value = true
  addDialogVisible.value = true
}

const onCloseAddDialog = () => {
  cleanAddFormData()
  addDialogVisible.value = false
  getStaffData()
}

const dateSelect = ref<DateRangeValue>()

const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const handleSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getStaffData()
}
const handleCurrentChange = (page = currentPage.value, size = pageSize.value) => {
  currentPage.value = page
  pageSize.value = size
  getStaffData()
}

const columns: TableColumnsType<StaffData> = [
  { title: '登录账户', dataIndex: ['admin', 'username'], key: 'username', width: 120 },
  { title: '用户名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '运营商', dataIndex: ['department', 'platformName'], key: 'department', width: 140 },
  { title: '头像', dataIndex: 'logoPath', key: 'logoPath', width: 110 },
  { title: '角色', dataIndex: 'characters', key: 'characters', width: 160 },
  { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '绑定卡号', dataIndex: 'cardId', key: 'cardId', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

const tableData = ref<StaffData[]>([])

const selectedRowKeys = ref<TreeKey[]>([])
let DeleteIdArray: number[] = []

const EnableDelete = computed(() => selectedRowKeys.value.length === 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TreeKey[], rows: StaffData[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const getStaffData = () => {
  const [startTime = '', endTime = ''] = dateSelect.value || []
  const params = {
    index: currentPage.value,
    size: pageSize.value,
    name: SearchFormData.name,
    phone: SearchFormData.phone,
    status: SearchFormData.status,
    sTime: startTime,
    eTime: endTime,
    departmentId: SearchFormData.departmentId
  }
  service.post(PATH_URL + '/Permission/getStaff', params).then((res: any) => {
    tableData.value = res.data.records
    total.value = res.data.total
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

const onReset = () => {
  SearchFormData.departmentId = undefined
  SearchFormData.name = ''
  SearchFormData.status = undefined
  SearchFormData.phone = ''
  dateSelect.value = undefined
  currentPage.value = 1
  getStaffData()
}

const filterText = ref('')

const normalizeDepartmentTree = (nodes: DepartmentNode[] = []): DepartmentTreeDataNode[] => {
  return nodes.map((item) => ({
    ...item,
    key: item.id,
    value: item.id,
    title: item.platformName,
    children: normalizeDepartmentTree(item.children || [])
  }))
}

const filterDepartmentTree = (nodes: DepartmentTreeDataNode[], keyword: string): DepartmentTreeDataNode[] => {
  if (!keyword) return nodes

  return nodes
    .map((node) => {
      const children = filterDepartmentTree(node.children || [], keyword)
      const title = String(node.title || '')
      const corporateName = node.corporateName || ''
      const matched = title.includes(keyword) || corporateName.includes(keyword)

      if (matched || children.length) {
        return {
          ...node,
          children
        }
      }

      return undefined
    })
    .filter(Boolean) as DepartmentTreeDataNode[]
}

const departmentTreeData = computed(() => normalizeDepartmentTree(treeData.value))

const filteredDepartmentTree = computed(() => filterDepartmentTree(departmentTreeData.value, filterText.value.trim()))

const selectedDepartmentKeys = computed(() => (SearchFormData.departmentId ? [SearchFormData.departmentId] : []))

const options = [
  {
    value: 1,
    label: '正常'
  },
  {
    value: 2,
    label: '停用'
  }
]

const SearchFormData = reactive<{
  name: string
  phone: string
  status?: number
  departmentId?: number
}>({
  name: '',
  phone: '',
  status: undefined,
  departmentId: undefined
})

const treeData = ref<DepartmentNode[]>([])

const getDepartmentTree = () => {
  service.get(PATH_URL + '/Permission/getDepartmentTree').then((res: any) => {
    treeData.value = res.data || []
  })
}

onMounted(() => {
  getDepartmentTree()
  getCharacter()
  getJobs()
  getStaffData()
})
</script>

<style lang="less" scoped>
.staff-page {
  width: 100%;
}

.staff-layout {
  min-height: calc(100vh - var(--top-tool-height) - var(--tags-view-height) - 80px);
  background: transparent;
  gap: 16px;
}

.staff-sider {
  padding: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.staff-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.department-search {
  width: 100%;
}

.department-tree {
  margin-top: 12px;

  :deep(.ant-tree-treenode) {
    width: 100%;
    min-height: 32px;
    padding: 0 0 4px;
    align-items: center;
    position: relative;
  }

  :deep(.ant-tree-indent-unit) {
    width: 16px;
  }

  :deep(.ant-tree-switcher) {
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    display: inline-flex;
    width: 24px;
    height: 24px;
    flex: none;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    line-height: 24px;
    color: #595959;
  }

  :deep(.ant-tree-switcher-icon),
  :deep(.ant-tree-switcher svg) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transform: none;
  }

  :deep(.ant-tree-node-content-wrapper) {
    display: inline-flex;
    min-width: 0;
    height: 32px;
    flex: 1;
    align-items: center;
    padding: 0 8px 0 24px;
    line-height: 32px;
    border-radius: 6px;
    width: 100%;
  }

  :deep(.ant-tree-title) {
    overflow: hidden;
    font-size: 14px;
    line-height: 32px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.ant-tree-node-content-wrapper:hover) {
    background-color: #f0f7ff;
  }

  :deep(.ant-tree-node-selected) {
    background-color: #e6f4ff;

    .ant-tree-title {
      color: var(--app-color-primary);
      font-weight: 500;
    }
  }
}

.search-form {
  display: flex;
  padding: 16px 16px 0;
  background-color: #fff;
  border-radius: 6px;
  flex-wrap: wrap;
  gap: 0 8px;

  :deep(.ant-form-item) {
    margin-right: 0;
    margin-bottom: 16px;
  }
}

.search-form-item {
  flex: 0 1 230px;
}

.search-form-item--range {
  flex-basis: 330px;
}

.search-form-action {
  flex: 0 0 auto;
}

.search-input {
  width: 150px;
}

.date-range {
  width: 240px;
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

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.table-image {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
}

.empty-text {
  color: #8c8c8c;
}

.table-action {
  display: inline-flex;
  height: 24px;
  padding: 0;
  align-items: center;
  gap: 4px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.staff-form {
  :deep(.ant-select),
  :deep(.ant-input),
  :deep(.ant-input-password),
  :deep(.ant-picker) {
    width: 100%;
  }
}

.avatar-uploader {
  :deep(.ant-upload) {
    width: 104px;
    height: 104px;
  }
}

.avatar {
  display: block;
  width: 104px;
  height: 104px;
  object-fit: cover;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.upload-placeholder {
  display: inline-flex;
  width: 104px;
  height: 104px;
  color: #8c8c8c;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s cubic-bezier(0, 0, 1, 1);

  &:hover {
    border-color: #1677ff;
  }
}
</style>
