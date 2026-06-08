<template>
  <div class="product-page">
    <AForm v-if="showSearchForm" :model="searchFormData" layout="inline" class="search-form">
      <AFormItem label="产品编号" class="search-form-item">
        <AInput v-model:value="searchFormData.id" class="search-input" placeholder="请输入产品编号" />
      </AFormItem>

      <AFormItem label="产品名称" class="search-form-item">
        <AInput v-model:value="searchFormData.name" class="search-input" placeholder="请输入产品名称" />
      </AFormItem>

      <AFormItem class="search-form-action">
        <AButton type="primary" class="icon-button" @click="getProductData" v-hasPermi="Permission.sec">
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

        <AButton danger class="icon-button" :disabled="disableRemove" @click="deleteOfDetail" v-hasPermi="Permission.del">
          <template #icon>
            <Icon icon="ant-design:delete-outlined" />
          </template>
          删除
        </AButton>
      </div>

      <div class="toolbar-right">
        <ATooltip :title="showSearchForm ? '隐藏搜索' : '显示搜索'">
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

    <ATable row-key="id" :columns="columns" :data-source="productTableData" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'pic'">
          <img v-if="record.pic" :src="getImageURL(record.pic)" class="table-image" />
          <span v-else class="empty-text">暂无</span>
        </template>

        <template v-else-if="column.key === 'peripherals'">
          <div v-if="record.peripherals?.length" class="tag-list">
            <ATag v-for="item in record.peripherals" :key="item.id" color="blue">
              {{ item.label }}
            </ATag>
          </div>
          <span v-else class="empty-text">暂无</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action action-view" @click="handleDetail(record)">
              <template #icon>
                <Icon icon="ant-design:eye-outlined" />
              </template>
              查看
            </AButton>
            <AButton type="link" danger class="table-action" @click="handleRemove(record)" v-hasPermi="Permission.emp">
              <template #icon>
                <Icon icon="ant-design:safety-certificate-outlined" />
              </template>
              授权
            </AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination v-model:current="currentPage" v-model:page-size="pageSize" :total="total" :show-total="(totalCount) => `共 ${totalCount} 条`" show-quick-jumper @change="handlePageChange" />
    </div>

    <AModal v-model:open="showDialog" title="添加产品类型" width="680px" :destroy-on-close="true" @cancel="onCloseDialog">
      <AForm :model="updateForm" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="产品名称" name="name">
              <AInput v-model:value="updateForm.name" placeholder="请输入产品名称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="产品规格" name="specifications">
              <AInput v-model:value="updateForm.specifications" placeholder="请输入产品规格" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="产品外设" name="peripheralList">
              <ASelect v-model:value="updateForm.peripheralList" mode="multiple" :options="peripheralOptions" placeholder="请选择产品外设" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="图片">
              <AUpload
                class="avatar-uploader"
                :action="UpImageURL"
                :show-upload-list="false"
                :before-upload="beforeAvatarUpload"
                :headers="headObject"
                :custom-request="uppyUploadRequest"
                @change="handleUploadChange"
              >
                <img v-if="updateForm.pic" :src="getImageURL(updateForm.pic)" class="avatar" />
                <div v-else class="upload-placeholder">
                  <Icon icon="ant-design:plus-outlined" :size="24" />
                </div>
              </AUpload>
            </AFormItem>
          </ACol>
        </ARow>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onCloseDialog">取消</AButton>
          <AButton type="primary" @click="onAddConfirm">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="showCheckDialog" title="查看产品类型" width="640px" :footer="null">
      <ADescriptions bordered size="small" :column="1">
        <ADescriptionsItem label="产品名称">{{ currentData.name || '-' }}</ADescriptionsItem>
        <ADescriptionsItem label="图片">
          <img v-if="currentData.pic" :src="getImageURL(currentData.pic)" class="preview-image" />
          <span v-else class="empty-text">暂无</span>
        </ADescriptionsItem>
        <ADescriptionsItem label="外设">
          <div v-if="currentData.peripherals?.length" class="tag-list">
            <ATag v-for="item in currentData.peripherals" :key="item.id" color="blue">
              {{ item.label }}
            </ATag>
          </div>
          <span v-else class="empty-text">暂无</span>
        </ADescriptionsItem>
        <ADescriptionsItem label="总授权数量">{{ cc.count ?? 0 }} 台</ADescriptionsItem>
        <ADescriptionsItem label="剩余授权数量">{{ cc.cc ?? 0 }} 台</ADescriptionsItem>
        <ADescriptionsItem label="授权人">{{ currentData.authorizer?.name || currentData.authorized?.name || '-' }}</ADescriptionsItem>
        <ADescriptionsItem label="授权时间">{{ currentData.authorizedTime || '-' }}</ADescriptionsItem>
      </ADescriptions>
    </AModal>

    <AModal v-model:open="showAuthorizationDialog" title="授权产品信息" width="560px" :destroy-on-close="true" @cancel="onclostAuthDialog">
      <AForm :model="authData" :rules="rules" layout="vertical">
        <AFormItem label="产品名称" name="name">
          <span>{{ authData.name }}</span>
        </AFormItem>

        <AFormItem label="图片">
          <img v-if="authData.pic" :src="getImageURL(authData.pic)" class="table-image" />
          <span v-else class="empty-text">暂无</span>
        </AFormItem>

        <AFormItem label="授权运营商" name="departmentId">
          <ASelect v-model:value="authData.departmentId" :options="departmentOptions" placeholder="请选择要授权的运营商" />
        </AFormItem>

        <AFormItem label="规格类型" name="type">
          <ASelect v-model:value="authData.type" :options="[{ label: '常规型', value: 1 }]" placeholder="请选择规格类型" />
        </AFormItem>

        <AFormItem label="授权数量" name="numberOfAuth">
          <AInputNumber v-model:value="authData.numberOfAuth" :min="0" class="w-full" placeholder="请输入授权数量" />
        </AFormItem>

        <AFormItem label="收费金额" name="money">
          <AInputNumber v-model:value="authData.money" :min="0" class="w-full" placeholder="请输入收费金额" />
        </AFormItem>

        <AFormItem label="免费时长">
          <AInputNumber v-model:value="authData.free" :min="0" class="w-full" placeholder="请输入免费时长，单位：天/台" />
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onclostAuthDialog">取消</AButton>
          <AButton type="primary" @click="doAuth">确认</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { addProductApi, authorizeProductApi, deleteProductApi, getEmpowerApi, getPeripheralApi, getProductApi } from '@/api/machine'

import { getDepartmentForSelectApi } from '@/api/permission'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Col as ACol,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  Row as ARow,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tag as ATag,
  Tooltip as ATooltip,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, UploadChangeParam } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import qs from 'qs'
import * as requestApi from '@/api/request'
import { uppyUploadRequest } from '@/utils/uppyUpload'
import { Icon } from '@/components/Icon'

type TableKey = string | number

interface PeripheralData {
  id: number
  label: string
}

interface DepartmentStruct {
  id: number | string
  platform_name: string
}

interface ProductRecord {
  [key: string]: any
  id: number
  name: string
  pic: string
  specifications: string
  createTime: string
  authorizedTime?: string
  numberOfAuthorized: number
  money: number
  numberFree: number
  staff?: {
    name?: string
  }
  authorizer?: {
    name?: string
  }
  authorized?: {
    name?: string
  }
  peripherals?: PeripheralData[]
  peripheralList?: number[]
}

interface SearchData {
  id?: number | string
  name: string
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getProductType()
}

const Permission = ref({
  add: 'mac_pro_add',
  rev: 'mac_pro_rev',
  del: 'mac_pro_del',
  emp: 'mac_pro_emp',
  sec: 'mac_pro_sec'
})

const searchFormData = reactive<SearchData>({
  id: undefined,
  name: ''
})

const showSearchForm = ref(true)
const productTableData = ref<ProductRecord[]>([])
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const columns: TableColumnsType<ProductRecord> = [
  { title: '产品名称', dataIndex: 'name', key: 'name', width: 140 },
  { title: '图片', dataIndex: 'pic', key: 'pic', width: 120 },
  { title: '外设', dataIndex: 'peripherals', key: 'peripherals', width: 180 },
  { title: '产品规格', dataIndex: 'specifications', key: 'specifications', width: 140 },
  { title: '创建人', dataIndex: ['staff', 'name'], key: 'staffName', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '授权人', dataIndex: ['authorizer', 'name'], key: 'authorizerName', width: 120 },
  { title: '授权时间', dataIndex: 'authorizedTime', key: 'authorizedTime', width: 180 },
  { title: '操作', key: 'action', width: 160 }
]

const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: ProductRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const onReset = () => {
  searchFormData.id = undefined
  searchFormData.name = ''
  currentPage.value = 1
  getProductType()
}

const getProductData = () => {
  currentPage.value = 1
  getProductType()
}

const getProductType = () => {
  const parm = {
    id: searchFormData.id,
    name: searchFormData.name,
    page: currentPage.value,
    size: pageSize.value
  }

  getProductApi(parm).then((res: any) => {
    const data = res.data
    const records = Array.isArray(data) ? data : data?.records || []
    productTableData.value = records
    total.value = Array.isArray(data) ? data.length : data?.total || records.length
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getProductType()
}

const deleteOfDetail = () => {
  deleteProduct([...DeleteIdArray], '确定要删除这些产品类型吗？')
}

const deleteProduct = (ids: number[], content: string) => {
  if (ids.length === 0) {
    message.warning('请选择要删除的产品类型')
    return
  }

  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await doRemove(ids)
    }
  })
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const showDialog = ref(false)
const isUpdate = ref(false)

const updateForm = reactive<ProductRecord>({
  id: 0,
  name: '',
  pic: '',
  specifications: '',
  numberOfAuthorized: 0,
  money: 0,
  createTime: '',
  numberFree: 0,
  peripheralList: []
})

const resetUpdateForm = () => {
  updateForm.id = 0
  updateForm.name = ''
  updateForm.pic = ''
  updateForm.specifications = ''
  updateForm.numberOfAuthorized = 0
  updateForm.money = 0
  updateForm.createTime = ''
  updateForm.numberFree = 0
  updateForm.peripheralList = []
}

const OnClickAdd = () => {
  isUpdate.value = false
  resetUpdateForm()
  showDialog.value = true
}

const onCloseDialog = () => {
  showDialog.value = false
  isUpdate.value = false
  resetUpdateForm()
}

const onAddConfirm = () => {
  if (isUpdate.value) {
    onUpdate()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加这个产品类别吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await addProductApi(
        qs.stringify(
          {
            name: updateForm.name,
            pic: updateForm.pic,
            spec: updateForm.specifications,
            ids: updateForm.peripheralList
          },
          { arrayFormat: 'brackets' }
        )
      )
      message.success('操作成功')
      onCloseDialog()
      getProductType()
    }
  })
}

const onUpdate = () => {}

const UpImageURL = computed(() => requestApi.getUploadImageUrl())

const getImageURL = (imageURL?: string) => {
  return imageURL ? requestApi.getDownloadPicUrl(imageURL) : ''
}

const beforeAvatarUpload = () => true

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const handleUploadChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const response = info.file.response
  if (response?.code == 200) {
    updateForm.pic = response.data
  } else {
    message.error('上传图片出错了')
  }
}

const PeripheralTreeData = ref<PeripheralData[]>([])

const peripheralOptions = computed(() =>
  PeripheralTreeData.value.map((item) => ({
    label: item.label,
    value: item.id
  }))
)

const getPeripheralData = () => {
  getPeripheralApi().then((res: any) => {
    PeripheralTreeData.value = res.data || []
  })
}

const showCheckDialog = ref(false)
const currentData = ref<Partial<ProductRecord>>({})
const cc = ref<Record<string, number>>({})

const handleDetail = (record: Record<string, any>) => {
  const val = record as ProductRecord
  currentData.value = val
  getEmpowerApi(val.id).then((res: any) => {
    cc.value = res.data || {}
  })

  showCheckDialog.value = true
}

const handleRemove = (record: Record<string, any>) => {
  const val = record as ProductRecord
  authData.id = val.id
  authData.name = val.name
  authData.free = 365
  authData.money = 100
  authData.numberOfAuth = 100
  authData.departmentId = undefined
  authData.pic = val.pic
  authData.type = 1
  showAuthorizationDialog.value = true
}

const authData = reactive({
  id: 0,
  pic: '',
  departmentId: undefined as number | string | undefined,
  numberOfAuth: 0,
  money: 0,
  free: 0,
  name: '',
  type: 1
})

const showAuthorizationDialog = ref(false)
const Departments = ref<DepartmentStruct[]>([])

const departmentOptions = computed(() =>
  Departments.value.map((item) => ({
    label: item.platform_name,
    value: item.id
  }))
)

const getDepartments = () => {
  getDepartmentForSelectApi().then((res: any) => {
    Departments.value = res.data || []
  })
}

const onclostAuthDialog = () => {
  showAuthorizationDialog.value = false
}

const doAuth = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要授权这个产品类别吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await authorizeProductApi(
        qs.stringify(
          {
            productId: authData.id,
            departmentId: authData.departmentId,
            number: authData.numberOfAuth,
            money: authData.money,
            free: authData.free,
            type: authData.type
          },
          { arrayFormat: 'brackets' }
        )
      )
      message.success('操作成功')
      showAuthorizationDialog.value = false
      getProductType()
    }
  })
}

const doRemove = async (ids: number[]) => {
  await deleteProductApi(
    qs.stringify(
      {
        ids
      },
      { arrayFormat: 'brackets' }
    )
  )
  message.success('操作成功')
  getProductType()
}

const rules = reactive<Record<string, Rule[]>>({
  name: [{ required: true, message: '请输入产品类型名称', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择要授权的运营商', trigger: 'change' }],
  numberOfAuth: [{ type: 'number', required: true, message: '请输入要授权的设备数量', trigger: 'change' }],
  money: [{ type: 'number', required: true, message: '请输入收费金额', trigger: 'change' }]
})

onMounted(() => {
  getPeripheralData()
  getProductType()
  getDepartments()
})
</script>

<style lang="less" scoped>
.product-page {
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
  gap: 0 8px;

  :deep(.ant-form-item) {
    margin-right: 0;
    margin-bottom: 16px;
  }
}

.search-form-item {
  flex: 0 1 250px;
}

.search-form-action {
  flex: 0 0 auto;
}

.search-input {
  width: 180px;
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

.table-action {
  height: 24px;
  padding: 0;
  gap: 4px;
}

.action-view {
  color: #52c41a;
}

.table-image {
  display: block;
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 6px;
}

.preview-image {
  display: block;
  max-width: 220px;
  max-height: 180px;
  object-fit: contain;
  border-radius: 6px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.empty-text {
  color: #8c8c8c;
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
