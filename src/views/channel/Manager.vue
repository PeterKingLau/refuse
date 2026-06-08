<template>
  <div class="channel-manager">
    <AForm v-if="showForm" :model="form" layout="inline" class="search-form">
      <AFormItem label="昵称" class="search-form-item">
        <AInput v-model:value="form.nickName" class="search-input" placeholder="请输入昵称" />
      </AFormItem>

      <AFormItem label="联系人" class="search-form-item">
        <AInput v-model:value="form.contacts" class="search-input" placeholder="请输入联系人" />
      </AFormItem>

      <AFormItem label="公司电话" class="search-form-item">
        <AInput v-model:value="form.fixed_telephone" class="search-input" placeholder="请输入公司电话" />
      </AFormItem>

      <AFormItem class="search-form-action">
        <AButton type="primary" class="icon-button" @click="onSearch" v-hasPermi="Permission.sec">
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

        <AButton class="icon-button" :disabled="disableUpdate" @click="handleSelectedUpdate" v-hasPermi="Permission.rev">
          <template #icon>
            <Icon icon="ant-design:edit-outlined" />
          </template>
          修改
        </AButton>

        <AButton danger class="icon-button" :disabled="disableRemove" @click="BatchDelete" v-hasPermi="Permission.del">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
        </AButton>
      </div>

      <div class="toolbar-right">
        <ATooltip :title="showForm ? '隐藏搜索' : '显示搜索'">
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
        <template v-if="column.key === 'logo_path'">
          <AImage v-if="record.logo_path" :src="getImageURL(record.logo_path)" :width="64" :height="64" class="table-image" />
          <span v-else class="empty-text">暂无</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action action-edit" @click="openEditDialog(record)" v-hasPermi="Permission.rev">
              <template #icon>
                <Icon icon="ant-design:edit-outlined" />
              </template>
              编辑
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
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :page-size-options="['5', '10', '15', '20']"
        :show-size-changer="true"
        :disabled="disabled"
        :total="total"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        show-quick-jumper
        @change="handleCurrentChange"
        @show-size-change="handleSizeChange"
      />
    </div>

    <AModal v-model:open="showDialog" :title="dialogType === 1 ? '添加运营商' : '修改运营商'" width="60%" :destroy-on-close="true">
      <AForm :model="updateForm" :rules="rules" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="昵称" name="nick_name">
              <AInput v-model:value="updateForm.nick_name" placeholder="请输入昵称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="简称" name="abbreviation">
              <AInput v-model:value="updateForm.abbreviation" placeholder="请输入简称" />
            </AFormItem>
          </ACol>
        </ARow>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="联系人">
              <AInput v-model:value="updateForm.contacts" placeholder="请输入联系人" />
            </AFormItem>
          </ACol>
          <ACol :span="12">
            <AFormItem label="联系人号码">
              <AInput v-model:value="updateForm.phone" placeholder="请输入联系人号码" />
            </AFormItem>
          </ACol>
        </ARow>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="公司名称" name="corporate_name">
              <AInput v-model:value="updateForm.corporate_name" placeholder="请输入公司名称" />
            </AFormItem>
          </ACol>
          <ACol :span="12">
            <AFormItem label="公司电话">
              <AInput v-model:value="updateForm.fixed_telephone" placeholder="请输入公司电话" />
            </AFormItem>
          </ACol>
        </ARow>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="公司 Logo">
              <AUpload
                class="avatar-uploader"
                :action="UpImageURL"
                :show-upload-list="false"
                :before-upload="beforeAvatarUpload"
                :headers="headObject"
                :custom-request="uppyUploadRequest"
                @change="handleLogoUploadChange"
              >
                <img v-if="updateForm.logo_path" :src="getImageURL(updateForm.logo_path)" class="avatar" />
                <div v-else class="upload-placeholder">
                  <Icon icon="ant-design:plus-outlined" :size="24" />
                </div>
              </AUpload>
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="Icon">
              <AUpload
                class="avatar-uploader"
                :action="UpImageURL"
                :show-upload-list="false"
                :before-upload="beforeAvatarUpload"
                :headers="headObject"
                :custom-request="uppyUploadRequest"
                @change="handleIconUploadChange"
              >
                <img v-if="updateForm.ico_path" :src="getImageURL(updateForm.ico_path)" class="avatar" />
                <div v-else class="upload-placeholder">
                  <Icon icon="ant-design:plus-outlined" :size="24" />
                </div>
              </AUpload>
            </AFormItem>
          </ACol>
        </ARow>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="平台名称" name="platform_name">
              <AInput v-model:value="updateForm.platform_name" placeholder="请输入平台名称" />
            </AFormItem>
          </ACol>
          <ACol :span="12" />
        </ARow>

        <AFormItem label="备注">
          <ATextarea v-model:value="updateForm.remarks" placeholder="备注" :rows="4" />
        </AFormItem>
      </AForm>
      <template #footer>
        <ASpace>
          <AButton @click="showDialog = false">取消</AButton>
          <AButton type="primary" @click="onClickConfirm">确认</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { addDepartmentApi, deleteDepartmentApi, deleteDepartmentBatchApi, getDepartmentApi } from '@/api/permission'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Col as ACol,
  Form as AForm,
  FormItem as AFormItem,
  Image as AImage,
  Input as AInput,
  Modal as AModal,
  Pagination as APagination,
  Row as ARow,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadChangeParam } from 'ant-design-vue'
import type { AxiosRequestConfig } from 'axios'
import * as requestApi from '@/api/request'
import { uppyUploadRequest } from '@/utils/uppyUpload'
import { Icon } from '@/components/Icon'

const ATextarea = AInput.TextArea

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getDepartmentData()
}

//#region 分页相关

const Permission = ref({
  add: 'cha_wrp_add',
  rev: 'cha_wrp_rev',
  del: 'cha_wrp_del',
  sec: 'cha_wrp_sec'
})

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const disabled = ref(false)

const handleSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getDepartmentData()
}

const handleCurrentChange = (page = currentPage.value, size = pageSize.value) => {
  currentPage.value = page
  pageSize.value = size
  getDepartmentData()
}

//#endregion

//#region  表格中按钮处理

const openEditDialog = (record: Record<string, any>) => {
  const data = record as DepartmentData
  dialogType.value = 2
  Object.keys(updateForm).forEach((key) => {
    updateForm[key] = data[key] ?? ''
  })
  showDialog.value = true
}

const handleRemove = (record: Record<string, any>) => {
  const data = record as DepartmentData

  AModal.confirm({
    title: '提示',
    content: '确定要删除这个运营商？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const temp: AxiosRequestConfig = {
        params: { id: data.id }
      }

      await deleteDepartmentApi(temp)
      message.success('删除记录成功')
      getDepartmentData()
    }
  })
}

//#endregion

//#region  搜索  重置 按钮处理

const onReset = () => {
  form.contacts = ''
  form.fixed_telephone = ''
  form.nickName = ''
  currentPage.value = 1
  getDepartmentData()
}

const onSearch = () => {
  currentPage.value = 1
  getDepartmentData()
}

//#endregion

// 是否显示form
const showForm = ref(true)

const disableUpdate = ref(true)
const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const showDialog = ref(false)

const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<DepartmentData[]>([])
let DeleteIdArray: number[] = []

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[], rows: DepartmentData[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    disableUpdate.value = rows.length !== 1
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

interface DepartmentData {
  [key: string]: any
  id: number
  nick_name: string
  abbreviation: string
  contacts: string
  phone: string
  corporate_name: string
  fixed_telephone: string
  logo_path: string
  ico_path: string
  platform_name: string
  remarks: string
}

const columns = [
  { title: '公司名称', dataIndex: 'corporate_name', key: 'corporate_name', width: 140 },
  { title: '公司Logo', dataIndex: 'logo_path', key: 'logo_path', width: 120 },
  { title: '昵称', dataIndex: 'nick_name', key: 'nick_name', width: 120 },
  { title: '平台名称', dataIndex: 'platform_name', key: 'platform_name', width: 140 },
  { title: '简称', dataIndex: 'abbreviation', key: 'abbreviation', width: 120 },
  { title: '公司电话', dataIndex: 'fixed_telephone', key: 'fixed_telephone', width: 140 },
  { title: '备注', dataIndex: 'remarks', key: 'remarks', width: 160 },
  { title: '操作', key: 'action', width: 150 }
]

const handleSelectedUpdate = () => {
  const selectedRow = selectedRows.value[0]
  if (!selectedRow) return
  openEditDialog(selectedRow)
}

// 标记 dialog 是添加还是修改
const dialogType = ref(1)

const OnClickAdd = () => {
  Object.keys(updateForm).forEach((key) => {
    updateForm[key] = key === 'id' ? 0 : ''
  })

  dialogType.value = 1 // 设置是添加
  showDialog.value = true
}

// 上传图片地址
const UpImageURL = computed(() => requestApi.getUploadImageUrl())

// 获取图片的地址
const getImageURL = computed(() => (imageURL?: string) => {
  return imageURL ? requestApi.getDownloadPicUrl(imageURL) : ''
})

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const rules = reactive<Record<string, Rule[]>>({
  nick_name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  abbreviation: [{ required: true, message: '请输入简称', trigger: 'blur' }],
  corporate_name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  platform_name: [{ required: true, message: '请输入平台名称', trigger: 'blur' }]
})

const OnClickOfShowForm = () => {
  showForm.value = !showForm.value
}

const beforeAvatarUpload = () => true

const handleUploadResponse = (response: any, onSuccess: (path: string) => void) => {
  if (response?.code == 200) {
    onSuccess(response.data)
  } else {
    message.error('上传图片出错了')
  }
}

const handleIconUploadChange = (info: UploadChangeParam) => {
  if (info.file.status === 'done') {
    handleUploadResponse(info.file.response, (path) => {
      updateForm.ico_path = path
    })
  }
}

const handleLogoUploadChange = (info: UploadChangeParam) => {
  if (info.file.status === 'done') {
    handleUploadResponse(info.file.response, (path) => {
      updateForm.logo_path = path
    })
  }
}

const tableData = ref<DepartmentData[]>([])

const getDepartmentData = () => {
  const temp = {
    index: currentPage.value,
    size: pageSize.value,
    nickName: form.nickName,
    contacts: form.contacts,
    phone: form.fixed_telephone
  }

  getDepartmentApi(temp)
    .then((res: any) => {
      console.log('department', res)
      tableData.value = res.data.records
      total.value = res.data.total
      selectedRowKeys.value = []
      selectedRows.value = []
      disableUpdate.value = true
      DeleteIdArray = []
    })
    .catch(() => {})
}

onMounted(() => {
  getDepartmentData()
})

const form = reactive({
  nickName: '',
  contacts: '',
  fixed_telephone: ''
})

const updateForm: DepartmentData = reactive({
  id: 0,
  nick_name: '',
  abbreviation: '',
  contacts: '',
  phone: '',
  corporate_name: '',
  fixed_telephone: '',
  logo_path: '',
  ico_path: '',
  platform_name: '',
  remarks: '',
  createTime: '',
  updateTime: '',
  status: ''
})

//#region  批量删除
const BatchDelete = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要删除这些记录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => doBatchDelete()
  })
}

const doBatchDelete = async () => {
  const id = [...DeleteIdArray]
  await deleteDepartmentBatchApi(id)
  message.success('删除成功')
  getDepartmentData()
}

//#endregion

// 提交新添加的运营商
const onClickConfirm = () => {
  addDepartment()
}

// 添加运营商
const addDepartment = () => {
  let messaget = '是否要添加这个运营商?'
  if (dialogType.value == 2) {
    messaget = '是否要修改这个运营商'
  }

  AModal.confirm({
    title: '提示',
    content: messaget,
    okText: '确定',
    cancelText: '取消',
    onOk: () => doAddDepartment()
  })
}

const doAddDepartment = async () => {
  await addDepartmentApi(updateForm)
  if (dialogType.value == 1) {
    message.success('添加记录成功！')
  } else {
    message.success('修改运营商信息成功')
  }
  showDialog.value = false
  getDepartmentData()
}
</script>

<style lang="less" scoped>
.channel-manager {
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
    display: flex;
    margin-inline-end: 0;
    margin-bottom: 16px;
    align-items: center;
    flex-wrap: nowrap;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 72px;
    padding: 0 10px 0 0;
    line-height: 1;
    text-align: right;
    white-space: nowrap;
  }

  :deep(.ant-form-item-label > label) {
    height: 32px;
    color: var(--app-text-color-regular);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.ant-form-item-control) {
    min-width: 0;
    flex: 1;
  }
}

.search-form-item {
  flex: 0 1 280px;
  min-width: 220px;
}

.search-form-action {
  flex: 0 0 auto;
}

.search-input {
  width: 100%;

  @media (width <= 768px) {
    width: 100%;
  }
}

@media (width <= 768px) {
  .search-form-item,
  .search-form-action {
    flex: 1 1 100%;
  }
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

.table-image {
  width: 64px;
  height: 64px;

  :deep(.ant-image-img) {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }
}

.empty-text {
  color: #8c8c8c;
}

.action-edit {
  color: #52c41a;
}

.table-action {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding-inline: 0;

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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
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
  object-fit: contain;
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
