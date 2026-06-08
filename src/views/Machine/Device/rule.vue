<template>
  <div class="device-rule-page">
    <AForm v-if="showSearchForm" :model="searchFormData" layout="horizontal" class="search-form">
      <AFormItem label="规则名称" class="search-form-item">
        <AInput v-model:value="searchFormData.ruleName" placeholder="请输入规则名称" />
      </AFormItem>

      <AFormItem label="产品类型" class="search-form-item">
        <ASelect v-model:value="searchFormData.productId" :options="productOptions" allow-clear placeholder="请选择产品类型" />
      </AFormItem>

      <AFormItem label="设备型号" class="search-form-item">
        <AInput v-model:value="searchFormData.deviceName" placeholder="请输入设备型号名称" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="onSearch" v-hasPermi="Permission.sec">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
            搜索
          </AButton>
          <AButton class="icon-button" @click="onReset">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
            重置
          </AButton>
        </ASpace>
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

    <ATable row-key="id" :columns="columns" :data-source="TableData" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <ATag :color="record.status == 0 ? 'default' : 'success'">
            {{ convertStatus(record.status) }}
          </ATag>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action action-edit" @click="handleDetail(record)" v-hasPermi="Permission.rev">
              <template #icon>
                <Icon icon="ant-design:edit-outlined" />
              </template>
              修改
            </AButton>
            <AButton type="link" class="table-action" @click="handlePublish(record)" v-hasPermi="Permission.puh">
              <template #icon>
                <Icon icon="ant-design:cloud-upload-outlined" />
              </template>
              发布
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
        @change="handlePageChange"
        @show-size-change="handlePageChange"
      />
    </div>

    <AModal v-model:open="dialogTableVisible" :title="title" width="820px" :destroy-on-close="true" @cancel="onCloseDialog">
      <AForm :model="addRuleFormData" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="规则名称">
              <AInput v-model:value="addRuleFormData.ruleName" placeholder="请输入规则名称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="所属运营商">
              <ASelect v-model:value="addRuleFormData.departmentId" :options="departmentOptions" placeholder="请选择运营商" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="产品类型">
              <ASelect v-model:value="addRuleFormData.productId" :options="productOptions" placeholder="请选择产品类型" @change="productChange" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="设备类型">
              <ASelect v-model:value="addRuleFormData.deviceId" :options="deviceTypeOptions" placeholder="请选择设备类型" @change="deviceChange" />
            </AFormItem>
          </ACol>
        </ARow>

        <AFormItem label="仓位设置">
          <div class="warehouse-list">
            <div v-for="item in warehouseArray" :key="item.code" class="warehouse-item">
              <div class="warehouse-media">
                <img v-if="item.pic" :src="getImageURL(item.pic)" class="warehouse-image" />
                <div v-else class="warehouse-empty">暂无图片</div>
                <AButton type="primary" class="change-image-button" @click="onClickChange(item)">更改</AButton>
              </div>

              <div class="warehouse-info">
                <div class="warehouse-line">
                  <span class="warehouse-label">仓位编号</span>
                  <span>{{ item.code }}</span>
                </div>

                <div class="warehouse-line">
                  <span class="warehouse-label">类型名称</span>
                  <ASelect
                    :value="item.garbageType ?? undefined"
                    :options="garbageTypeOptions"
                    allow-clear
                    placeholder="请选择垃圾类型"
                    class="warehouse-control"
                    @change="(value) => handleWarehouseGarbageChange(item, value as number | undefined)"
                  />
                </div>

                <div class="warehouse-line">
                  <span class="warehouse-label">投放价格</span>
                  <AInputNumber v-model:value="item.points" :min="0" :max="9999" class="warehouse-control" />
                </div>
              </div>
            </div>
          </div>
        </AFormItem>
      </AForm>

      <template #footer>
        <ASpace>
          <AButton @click="onCloseDialog">取消</AButton>
          <AButton type="primary" @click="onAddConfirm">确认</AButton>
        </ASpace>
      </template>
    </AModal>

    <AModal v-model:open="showImgBox" title="图片选择" width="560px" :footer="null">
      <div class="image-picker">
        <img v-for="item in PicArray" :key="item.id" :src="getImageURL(item.pic)" class="image-picker-item" @click="PicSelect(item)" />
        <AEmpty v-if="PicArray.length === 0" description="暂无图片" />
      </div>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { addRuleApi, deleteRuleApi, getDeviceRuleApi, getDeviceTypeByProductIdApi, getGarbagePicApi, getGarbageTypeApi, getProductApi, publishRuleApi, updateRuleApi } from '@/api/machine'

import { getDepartmentForSelectApi } from '@/api/permission'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Col as ACol,
  Empty as AEmpty,
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
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import qs from 'qs'
import * as requestApi from '@/api/request'
import { Icon } from '@/components/Icon'

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
  productId?: number
  ruleName: string
  deviceName: string
  page: number
  size: number
}

interface SimpleProductTypeStruct {
  id: number
  name: string
}

interface SimpleDeviceTypeStruct {
  id: number
  name: string
  warehouse: number
}

interface WarehouseStruct {
  id?: number
  code: number
  pic: string
  garbageType: number | null
  points: number
}

interface AddRuleStruct {
  id: number
  ruleName: string
  productId?: number
  deviceId?: number
  warehouse?: WarehouseStruct[]
  departmentId?: number
}

interface TableDataStruct {
  [key: string]: any
  id: number
  label: string
  status: number
  createTime: string
  staff?: any
  warehouse: any[]
  deviceType: any
  productType: any
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getDeviceRuleTableData()
}

const Permission = ref({
  add: 'mac_rul_add',
  rev: 'mac_rul_rev',
  del: 'mac_rul_del',
  puh: 'mac_rul_puh',
  sec: 'mac_rul_sec'
})

const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(5)
const disabled = ref(false)

const showSearchForm = ref(true)
const productArray = ref<SimpleProductTypeStruct[]>([])
const garbageTypeArray = ref<GarbageTypeStruct[]>([])
const warehouseArray = ref<WarehouseStruct[]>([])
const deviceTypeArray = ref<SimpleDeviceTypeStruct[]>([])
const dialogTableVisible = ref(false)
const title = ref('添加运营规则')
const isUpdate = ref(false)
const TableData = ref<TableDataStruct[]>([])
const DepartmentArray = ref<any[]>([])
const showImgBox = ref(false)
const PicArray = ref<PicStruct[]>([])
const SelectWarehouse = ref<WarehouseStruct>({
  id: 0,
  pic: '',
  garbageType: null,
  points: 0,
  code: 0
})

let selectedTable: TableDataStruct | undefined

const searchFormData = reactive<SearchFormDataStruct>({
  productId: undefined,
  ruleName: '',
  deviceName: '',
  page: 1,
  size: 5
})

const addRuleFormData = reactive<AddRuleStruct>({
  id: 0,
  ruleName: '',
  productId: undefined,
  deviceId: undefined,
  departmentId: undefined,
  warehouse: []
})

const columns: TableColumnsType<TableDataStruct> = [
  { title: '产品类型', dataIndex: ['product', 'name'], key: 'productName', width: 180 },
  { title: '规则名称', dataIndex: 'label', key: 'label', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '设备类型', dataIndex: ['deviceType', 'name'], key: 'deviceTypeName', width: 180 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 220 },
  { title: '创建人', dataIndex: ['staff', 'name'], key: 'staffName', width: 160 },
  { title: '操作时间', dataIndex: 'updateTime', key: 'updateTime', width: 220 },
  { title: '操作', key: 'action', width: 220 }
]

const productOptions = computed(() => productArray.value.map((item) => ({ label: item.name, value: item.id })))
const deviceTypeOptions = computed(() => deviceTypeArray.value.map((item) => ({ label: item.name, value: item.id })))
const garbageTypeOptions = computed(() => garbageTypeArray.value.map((item) => ({ label: item.label, value: item.id })))
const departmentOptions = computed(() => DepartmentArray.value.map((item) => ({ label: item.platform_name, value: item.id })))

const getImageURL = (imageURL?: string) => {
  return imageURL ? requestApi.getDownloadPicUrl(imageURL) : ''
}

const onSearch = () => {
  currentPage.value = 1
  getDeviceRuleTableData()
}

const onReset = () => {
  searchFormData.productId = undefined
  searchFormData.page = 1
  searchFormData.deviceName = ''
  searchFormData.ruleName = ''
  searchFormData.size = 5
  currentPage.value = 1
  pageSize.value = 5
  getDeviceRuleTableData()
}

const getProductType = () => {
  getProductApi({
    id: 0,
    name: '',
    page: 1,
    size: 99999
  }).then((res: any) => {
    productArray.value = res.data || []
  })
}

const OnClickAdd = () => {
  isUpdate.value = false
  title.value = '添加运营规则'
  initAddRuleData()
  dialogTableVisible.value = true
}

const initAddRuleData = () => {
  addRuleFormData.id = 0
  addRuleFormData.deviceId = undefined
  addRuleFormData.productId = undefined
  addRuleFormData.ruleName = ''
  addRuleFormData.departmentId = undefined
  addRuleFormData.warehouse = []
  warehouseArray.value = []
  deviceTypeArray.value = []
}

const productChange = (val: number) => {
  getDeviceTypeByProductIdApi(qs.stringify({ ProductId: val }, { arrayFormat: 'brackets' })).then((res: any) => {
    addRuleFormData.deviceId = undefined
    warehouseArray.value = []
    deviceTypeArray.value = res.data || []
  })
}

const deviceChange = (val: number) => {
  const matchedDevice = deviceTypeArray.value.find((item) => item.id === val)
  if (matchedDevice) {
    warehouseFactory(matchedDevice.warehouse)
  }
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
  getGarbageTypeApi({ typeName: '' }).then((res: any) => {
    garbageTypeArray.value = res.data || []
  })
}

const getGarbageTypePic = (id?: number | null) => {
  if (id == null) return ''
  return garbageTypeArray.value.find((item) => item.id === id)?.pic || ''
}

const handleWarehouseGarbageChange = (warehouse: WarehouseStruct, value?: number) => {
  warehouse.garbageType = value ?? null
  warehouse.pic = getGarbageTypePic(warehouse.garbageType)
}

const onCloseDialog = () => {
  initAddRuleData()
  dialogTableVisible.value = false
  showImgBox.value = false
}

const onAddConfirm = () => {
  if (isUpdate.value) {
    onUpdateRule()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加一个运营规则吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await addRuleApi({
        ruleName: addRuleFormData.ruleName,
        productId: addRuleFormData.productId,
        deviceId: addRuleFormData.deviceId,
        warehouse: warehouseArray.value,
        departmentId: addRuleFormData.departmentId
      })
      message.success('操作成功')
      onCloseDialog()
      getDeviceRuleTableData()
    }
  })
}

const onUpdateRule = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这个运营规则吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await updateRuleApi({
        ruleName: addRuleFormData.ruleName,
        productId: addRuleFormData.productId,
        deviceId: addRuleFormData.deviceId,
        warehouse: warehouseArray.value,
        id: addRuleFormData.id
      })
      message.success('操作成功')
      onCloseDialog()
      getDeviceRuleTableData()
    }
  })
}

const getPicArray = (val?: number | null) => {
  if (val == null) {
    message.warning('请先选择垃圾类型')
    return
  }

  getGarbagePicApi(qs.stringify({ garbageId: val }, { arrayFormat: 'brackets' })).then((res: any) => {
    PicArray.value = res.data || []
    showImgBox.value = true
  })
}

const onClickChange = (val: WarehouseStruct) => {
  SelectWarehouse.value = val
  getPicArray(val.garbageType)
}

const PicSelect = (val: PicStruct) => {
  SelectWarehouse.value.pic = val.pic
  showImgBox.value = false
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getDeviceRuleTableData()
}

const getDeviceRuleTableData = () => {
  searchFormData.page = currentPage.value
  searchFormData.size = pageSize.value
  getDeviceRuleApi(searchFormData).then((res: any) => {
    TableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  })
}

const getDepartment = () => {
  getDepartmentForSelectApi().then((res: any) => {
    DepartmentArray.value = res.data || []
  })
}

const handleDetail = (record: Record<string, any>) => {
  const val = record as TableDataStruct
  isUpdate.value = true
  title.value = '修改运营规则'
  addRuleFormData.id = val.id
  addRuleFormData.productId = val.productId
  addRuleFormData.departmentId = val.departmentId
  selectedTable = val
  updateProductBind(val.productId)
}

const updateProductBind = (val: number) => {
  getDeviceTypeByProductIdApi(qs.stringify({ ProductId: val }, { arrayFormat: 'brackets' })).then((res: any) => {
    if (!selectedTable) return

    deviceTypeArray.value = res.data || []
    addRuleFormData.ruleName = selectedTable.label
    addRuleFormData.deviceId = selectedTable.deviceType?.id
    warehouseArray.value = selectedTable.warehouse.map((item) => ({
      code: item.code,
      pic: item.pic,
      garbageType: item.garbageType,
      points: item.points
    }))
    dialogTableVisible.value = true
  })
}

const handleRemove = (record: Record<string, any>) => {
  const val = record as TableDataStruct
  AModal.confirm({
    title: '提示',
    content: '确定要删除这条运营规则吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteRuleApi(qs.stringify({ ruleId: val.id }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getDeviceRuleTableData()
    }
  })
}

const convertStatus = (val: number) => {
  return val == 0 ? '未发布' : '已发布'
}

const handlePublish = (record: Record<string, any>) => {
  const val = record as TableDataStruct
  AModal.confirm({
    title: '提示',
    content: '确定要发布这条运营规则吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await publishRuleApi(qs.stringify({ ruleId: val.id }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getDeviceRuleTableData()
    }
  })
}

onMounted(() => {
  getDeviceRuleTableData()
  getProductType()
  getGarbageType()
  getDepartment()
})
</script>

<style lang="less" scoped>
.device-rule-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: grid;
  padding: 16px;
  background-color: #fff;
  border-radius: 6px;
  gap: 14px 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  align-items: end;

  :deep(.ant-form-item) {
    display: flex;
    margin-bottom: 0;
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
    color: #262626;
    font-weight: 500;
  }

  :deep(.ant-form-item-control) {
    min-width: 0;
    flex: 1;
  }

  :deep(.ant-input),
  :deep(.ant-select) {
    width: 100%;
  }
}

.search-form-item,
.search-form-actions {
  min-width: 0;
}

.search-form-actions {
  :deep(.ant-form-item-control-input-content) {
    display: flex;
    align-items: center;
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

.action-edit {
  color: #52c41a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.warehouse-list {
  display: flex;
  max-height: 420px;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.warehouse-item {
  display: grid;
  min-height: 132px;
  padding: 12px;
  background-color: #f5fbff;
  border: 1px solid #e6f4ff;
  border-radius: 6px;
  grid-template-columns: 120px 1fr;
  gap: 16px;
}

.warehouse-media {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.warehouse-image,
.warehouse-empty {
  width: 100px;
  height: 100px;
  border-radius: 6px;
}

.warehouse-image {
  display: block;
  object-fit: contain;
  background-color: #fff;
  border: 1px solid #e5e7eb;
}

.warehouse-empty {
  display: flex;
  color: #8c8c8c;
  background-color: #fff;
  border: 1px dashed #d9d9d9;
  align-items: center;
  justify-content: center;
}

.change-image-button {
  width: 100px;
}

.warehouse-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.warehouse-line {
  display: grid;
  align-items: center;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
}

.warehouse-label {
  color: #595959;
}

.warehouse-control {
  width: 240px;
  max-width: 100%;
}

.image-picker {
  display: grid;
  max-height: 360px;
  overflow-y: auto;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 12px;
}

.image-picker-item {
  width: 104px;
  height: 104px;
  object-fit: contain;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: border-color 0.2s cubic-bezier(0, 0, 1, 1);

  &:hover {
    border-color: #1677ff;
  }
}
</style>
