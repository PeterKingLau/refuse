<template>
  <div class="device-type-page">
    <AForm v-if="showSearchForm" :model="SearchForm" layout="inline" class="search-form">
      <AFormItem label="产品类型" class="search-form-item">
        <ASelect v-model:value="SearchForm.productId" :options="productOptions" allow-clear placeholder="请选择产品类型" />
      </AFormItem>

      <AFormItem label="型号名称" class="search-form-item">
        <AInput v-model:value="SearchForm.deviceTypeName" class="search-input" placeholder="请输入型号名称" />
      </AFormItem>

      <AFormItem label="仓位数量" class="search-form-item">
        <AInputNumber v-model:value="SearchForm.warehouses" :min="0" class="search-input" placeholder="请输入仓位数量" />
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

    <ATable row-key="id" :columns="columns" :data-source="TableData" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'screenModel'">
          {{ converScreenModel(record.screenModel) }}
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action action-edit" @click="handleDetail(record)" v-hasPermi="Permission.rev">
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
          </ASpace>
        </template>
      </template>
    </ATable>

    <AModal v-model:open="addDialogFormVisible" :title="updateTitle" width="680px" :destroy-on-close="true" @cancel="closeDeviceTypeDialog">
      <AForm :model="addFormData" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="产品类型" name="product">
              <span v-if="isUpdate" class="form-text">{{ productDisplayName }}</span>
              <ASelect v-else v-model:value="addFormData.product" :options="productOptions" placeholder="请选择产品类型" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="型号名称" name="name">
              <AInput v-model:value="addFormData.name" placeholder="请输入型号名称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="生产厂家" name="manufacturer">
              <AInput v-model:value="addFormData.manufacturer" placeholder="请输入生产厂家名称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="仓位数量" name="warehouse">
              <AInputNumber v-model:value="addFormData.warehouse" :min="0" class="w-full" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="屏幕模式" name="screenModel">
              <ARadioGroup v-model:value="addFormData.screenModel" @change="screenModelSelect">
                <ARadio :value="1">横屏</ARadio>
                <ARadio :value="2">竖屏</ARadio>
                <ARadio :value="0">无屏</ARadio>
              </ARadioGroup>
            </AFormItem>
          </ACol>

          <ACol v-if="showScreenClassSelect" :span="12">
            <AFormItem label="屏幕尺寸" name="screenClass">
              <ASelect v-model:value="addFormData.screenClass" :options="screenClassOptions" placeholder="请选择屏幕尺寸" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="图片">
              <AUpload class="avatar-uploader" :action="UpImageURL" :show-upload-list="false" :before-upload="beforeAvatarUpload" :headers="headObject" @change="handleUploadChange">
                <img v-if="addFormData.pic" :src="getImageURL(addFormData.pic)" class="avatar" />
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
          <AButton @click="closeDeviceTypeDialog">取消</AButton>
          <AButton type="primary" @click="onAddConfirm">确认</AButton>
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
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Radio as ARadio,
  RadioGroup as ARadioGroup,
  Row as ARow,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, UploadChangeParam } from 'ant-design-vue'
import { PATH_URL, service } from '@/config/axios/service'
import { Icon } from '@/components/Icon'
import qs from 'qs'

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getDeviceTypeData()
}

const Permission = ref({
  add: 'mac_dvt_add',
  rev: 'mac_dvt_rev',
  del: 'mac_dvt_del',
  sec: 'mac_dvt_sec'
})

interface SearchDataStruct {
  productId?: number
  deviceTypeName: string
  warehouses?: number
}

interface ProductTypeStruct {
  id: number
  name: string
}

interface ScreenClassStruct {
  id: number
  label: string
}

interface DeviceTypeStruct {
  [key: string]: any
  id: number
  product:
    | {
        id?: number
        name?: string
      }
    | number
    | null
  name: string
  warehouse: number
  manufacturer: string
  screenClass:
    | {
        id?: number
        label?: string
      }
    | number
    | string
    | null
  screenModel: number
  createTime: string
  staff?: {
    name?: string
  } | null
  updateTime: string
  pic: string
}

interface DeviceTypeFormStruct {
  id: number
  product?: number
  name: string
  warehouse: number
  manufacturer: string
  screenClass?: number | string
  screenModel: number
  createTime: string
  staff?: {
    name?: string
  } | null
  updateTime: string
  pic: string
}

const ScreenClassArray = ref<ScreenClassStruct[]>([])
const PorductTypeArray = ref<ProductTypeStruct[]>([])
const TableData = ref<DeviceTypeStruct[]>([])

const showSearchForm = ref(true)
const SearchForm = reactive<SearchDataStruct>({
  productId: undefined,
  deviceTypeName: '',
  warehouses: undefined
})

const updateTitle = ref('')
const addDialogFormVisible = ref(false)
const isUpdate = ref(false)
const showScreenClassSelect = ref(false)
const editingProductName = ref('')

const addFormData = reactive<DeviceTypeFormStruct>({
  id: 0,
  product: undefined,
  name: '',
  warehouse: 0,
  manufacturer: '',
  screenClass: undefined,
  screenModel: 0,
  createTime: '',
  staff: null,
  updateTime: '',
  pic: ''
})

const columns: TableColumnsType<DeviceTypeStruct> = [
  { title: '产品类型', dataIndex: ['product', 'name'], key: 'productName', width: 140 },
  { title: '型号名称', dataIndex: 'name', key: 'name', width: 140 },
  { title: '仓位数量', dataIndex: 'warehouse', key: 'warehouse', width: 110 },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', width: 140 },
  { title: '屏幕类型', dataIndex: 'screenModel', key: 'screenModel', width: 110 },
  { title: '屏幕尺寸', dataIndex: ['screenClass', 'label'], key: 'screenClassLabel', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '创建人', dataIndex: ['staff', 'name'], key: 'staffName', width: 120 },
  { title: '操作时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
  { title: '操作', key: 'action', width: 150 }
]

const productOptions = computed(() =>
  PorductTypeArray.value.map((item) => ({
    label: item.name,
    value: item.id
  }))
)

const productDisplayName = computed(() => {
  const matchedProduct = PorductTypeArray.value.find((item) => item.id === addFormData.product)
  return matchedProduct?.name || editingProductName.value || '-'
})

const screenClassOptions = computed(() =>
  ScreenClassArray.value.map((item) => ({
    label: item.label,
    value: item.id
  }))
)

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const UpImageURL = computed(() => PATH_URL + '/Common/upLoadImage')

const getImageURL = (imageURL?: string) => {
  return imageURL ? PATH_URL + '/Common/downLoadPic/' + imageURL : ''
}

const getScreenClassData = () => {
  service.get(PATH_URL + '/MachineMange/getScreenClass').then((res: any) => {
    ScreenClassArray.value = res.data || []
  })
}

const getProductTypeData = () => {
  const parm = {
    id: '',
    name: '',
    page: 1,
    size: 99999
  }

  service.post(PATH_URL + '/MachineMange/getProduct', parm).then((res: any) => {
    const data = res.data
    PorductTypeArray.value = Array.isArray(data) ? data : data?.records || []
  })
}

const onSearch = () => {
  getDeviceTypeData()
}

const onReset = () => {
  SearchForm.productId = undefined
  SearchForm.deviceTypeName = ''
  SearchForm.warehouses = undefined
  getDeviceTypeData()
}

const OnClickAdd = () => {
  updateTitle.value = '添加设备类型'
  initAddFormData()
  isUpdate.value = false
  addDialogFormVisible.value = true
}

const initAddFormData = () => {
  addFormData.product = PorductTypeArray.value[0]?.id
  addFormData.name = ''
  addFormData.pic = ''
  addFormData.manufacturer = ''
  addFormData.warehouse = 0
  addFormData.screenModel = 0
  addFormData.screenClass = undefined
  addFormData.id = 0
  editingProductName.value = ''
  showScreenClassSelect.value = false
}

const closeDeviceTypeDialog = () => {
  addDialogFormVisible.value = false
  isUpdate.value = false
  initAddFormData()
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

const onAddConfirm = () => {
  if (isUpdate.value) {
    doUpdateDeviceType('确定要修改这个设备类型吗？')
    return
  }
  doAddDeviceType('确定要添加这个设备类型吗？')
}

const getSelectedProductId = () => {
  return addFormData.product
}

const getSelectedScreenClassId = () => {
  return addFormData.screenClass
}

const doAddDeviceType = (content: string) => {
  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const screenClass = addFormData.screenModel === 0 ? null : getSelectedScreenClassId()
      await service.post(
        PATH_URL + '/MachineMange/addDeviceType',
        qs.stringify(
          {
            product: getSelectedProductId(),
            name: addFormData.name,
            warehouse: addFormData.warehouse,
            manufacturer: addFormData.manufacturer,
            screenClass,
            screenModel: addFormData.screenModel,
            pic: addFormData.pic
          },
          { arrayFormat: 'brackets' }
        )
      )
      message.success('操作成功')
      getDeviceTypeData()
      closeDeviceTypeDialog()
    }
  })
}

const doUpdateDeviceType = (content: string) => {
  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const screenClass = addFormData.screenModel === 0 ? null : getSelectedScreenClassId()
      await service.post(
        PATH_URL + '/MachineMange/updateDeviceType',
        qs.stringify(
          {
            id: addFormData.id,
            name: addFormData.name,
            warehouse: addFormData.warehouse,
            manufacturer: addFormData.manufacturer,
            screenClass,
            screenModel: addFormData.screenModel,
            pic: addFormData.pic
          },
          { arrayFormat: 'brackets' }
        )
      )
      message.success('操作成功')
      getDeviceTypeData()
      closeDeviceTypeDialog()
    }
  })
}

const beforeAvatarUpload = () => true

const handleUploadChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const response = info.file.response
  if (response?.code == 200) {
    addFormData.pic = response.data
  } else {
    message.error('上传图片出错了')
  }
}

const screenModelSelect = () => {
  showScreenClassSelect.value = addFormData.screenModel !== 0
  if (addFormData.screenModel === 0) {
    addFormData.screenClass = undefined
  }
}

const handleDetail = (record: Record<string, any>) => {
  const val = record as DeviceTypeStruct
  isUpdate.value = true
  addFormData.product = typeof val.product === 'object' ? val.product?.id : val.product || undefined
  editingProductName.value = typeof val.product === 'object' ? val.product?.name || '' : ''
  addFormData.name = val.name
  addFormData.pic = val.pic
  addFormData.manufacturer = val.manufacturer
  addFormData.warehouse = val.warehouse
  addFormData.screenModel = val.screenModel
  addFormData.screenClass = typeof val.screenClass === 'object' ? val.screenClass?.id || undefined : val.screenClass || undefined
  addFormData.id = val.id
  updateTitle.value = '修改设备类型'
  addDialogFormVisible.value = true
  showScreenClassSelect.value = addFormData.screenModel !== 0
}

const handleRemove = (record: Record<string, any>) => {
  const val = record as DeviceTypeStruct
  AModal.confirm({
    title: '提示',
    content: '确定要删除这个设备类型吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await service.post(
        PATH_URL + '/MachineMange/deleteDeviceType',
        qs.stringify(
          {
            id: val.id
          },
          { arrayFormat: 'brackets' }
        )
      )
      message.success('操作成功')
      getDeviceTypeData()
      addDialogFormVisible.value = false
    }
  })
}

const converScreenModel = (val: number) => {
  switch (val) {
    case 0:
      return '无屏'
    case 1:
      return '横屏'
    case 2:
      return '竖屏'
    default:
      return '-'
  }
}

const getDeviceTypeData = () => {
  service
    .post(
      PATH_URL + '/MachineMange/getDeviceType',
      qs.stringify(
        {
          productId: SearchForm.productId,
          name: SearchForm.deviceTypeName,
          warehouse: SearchForm.warehouses
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res: any) => {
      TableData.value = res.data || []
    })
}

onMounted(() => {
  getDeviceTypeData()
  getProductTypeData()
  getScreenClassData()
})
</script>

<style lang="less" scoped>
.device-type-page {
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

.form-text {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  color: #262626;
  line-height: 32px;
}

.action-edit {
  color: #52c41a;
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
