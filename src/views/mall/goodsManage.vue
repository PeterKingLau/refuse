<template>
  <div class="goods-manage-page">
    <AForm :model="queryForm" layout="inline" class="search-form">
      <AFormItem label="商品名称">
        <AInput v-model:value="queryForm.name" allow-clear class="search-control" placeholder="请输入商品名称" />
      </AFormItem>
      <AFormItem label="商品类别">
        <ASelect v-model:value="queryForm.parentId" allow-clear :options="goodsTypeOptions" class="search-control" placeholder="请选择商品类别" />
      </AFormItem>
      <AFormItem>
        <ASpace>
          <AButton type="primary" class="icon-button" v-hasPermi="Permission.sec" @click="onQuery">
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

    <ADivider />

    <div class="toolbar">
      <ASpace>
        <AButton type="primary" class="icon-button" v-hasPermi="Permission.add" @click="showAddUi">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新增
        </AButton>
        <AButton danger class="icon-button" :disabled="selectedIds.length === 0" @click="disableBatch">
          <template #icon>
            <Icon icon="ant-design:close-outlined" />
          </template>
          禁用
        </AButton>
        <AButton class="icon-button success-button" :disabled="selectedIds.length === 0" @click="enableBatch">
          <template #icon>
            <Icon icon="ant-design:check-outlined" />
          </template>
          启用
        </AButton>
      </ASpace>
    </div>

    <ATable row-key="id" :columns="columns" :data-source="resultData" :loading="tableLoading" :pagination="false" :row-selection="rowSelection" :scroll="{ x: 1080 }" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <ATag :color="record.status === 1 ? 'success' : 'error'" :bordered="false">
            {{ record.status === 1 ? '正常' : '禁用' }}
          </ATag>
        </template>

        <template v-else-if="column.key === 'pic'">
          <AImage v-if="record.pic" :src="GetImageURL(record.pic)" :width="44" :height="44" class="goods-image" />
          <span v-else class="empty-text">-</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action" @click="showUpdateUi(toGoodsRecord(record))">
              <template #icon>
                <Icon icon="ant-design:edit-outlined" />
              </template>
              编辑
            </AButton>
            <AButton type="link" danger class="table-action" @click="disableRow(record.id)">
              <template #icon>
                <Icon icon="ant-design:stop-outlined" />
              </template>
              禁用
            </AButton>
            <AButton type="link" class="table-action success-link" @click="enableRow(record.id)">
              <template #icon>
                <Icon icon="ant-design:check-circle-outlined" />
              </template>
              启用
            </AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="currentPage"
        v-model:page-size="queryForm.size"
        :disabled="paginationDisabled"
        :page-size-options="['10', '20', '30', '50']"
        :show-size-changer="true"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        :total="total"
        show-quick-jumper
        @change="getGoods"
        @show-size-change="getGoods"
      />
    </div>

    <AModal v-model:open="dialogVisible" :title="isUpdate ? '编辑商品' : '添加商品'" width="520px" :confirm-loading="submitLoading" @ok="addOrUpdate" @cancel="cleanAdd">
      <AForm :model="goodsForm" layout="vertical">
        <AFormItem label="商品类别">
          <ASelect v-model:value="goodsForm.type" allow-clear :options="goodsTypeOptions" placeholder="请选择商品类别" />
        </AFormItem>
        <AFormItem label="商品名称">
          <AInput v-model:value="goodsForm.name" allow-clear placeholder="请输入商品名称" />
        </AFormItem>
        <AFormItem label="商品图片">
          <AUpload class="avatar-uploader" :action="uploadImageUrl" :show-upload-list="false" :before-upload="beforeAvatarUpload" :headers="headObject" @change="handleAvatarSuccess">
            <img v-if="goodsForm.fileName" :src="GetImageURL(goodsForm.fileName)" class="avatar" />
            <div v-else class="upload-placeholder">
              <Icon icon="ant-design:plus-outlined" />
            </div>
          </AUpload>
        </AFormItem>
        <AFormItem label="积分数量">
          <AInputNumber v-model:value="goodsForm.point" class="w-full" :min="0" placeholder="请输入需要兑换的积分数量" />
        </AFormItem>
        <AFormItem label="库存数量">
          <AInputNumber v-model:value="goodsForm.number" class="w-full" :min="0" placeholder="请输入库存数量" />
        </AFormItem>
      </AForm>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Divider as ADivider,
  Form as AForm,
  FormItem as AFormItem,
  Image as AImage,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Pagination as APagination,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tag as ATag,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, TableProps, UploadChangeParam } from 'ant-design-vue'
import qs from 'qs'
import { PATH_URL, service } from '@/config/axios/service'
import { Icon } from '@/components/Icon'
import { GetImageURL } from '@/utils/tools'

interface GoodsTypeRecord {
  id: number
  mal_type_name?: string
  malTypeName?: string
}

interface GoodsRecord {
  id: number
  goodsName: string
  goodsType: number
  point: number
  number: number
  status: number
  pic?: string
}

interface GoodsForm {
  id?: number
  type?: number
  name: string
  fileName?: string
  point?: number
  number?: number
  status?: number
}

const Permission = {
  add: 'mal_typ_add',
  rev: 'mal_typ_rev',
  del: 'mal_typ_del',
  sec: 'mal_typ_sec'
}

const queryForm = reactive({
  size: 10,
  name: '',
  parentId: undefined as number | undefined
})

const currentPage = ref(1)
const total = ref(0)
const tableLoading = ref(false)
const submitLoading = ref(false)
const paginationDisabled = ref(false)
const dialogVisible = ref(false)
const isUpdate = ref(false)
const selectedIds = ref<number[]>([])
const goodsTypeList = ref<GoodsTypeRecord[]>([])
const resultData = ref<GoodsRecord[]>([])

const goodsForm = reactive<GoodsForm>({
  type: undefined,
  name: '',
  fileName: undefined,
  point: undefined,
  number: undefined
})

const columns: TableColumnsType<GoodsRecord> = [
  { title: '记录编号', dataIndex: 'id', key: 'id', width: 110 },
  { title: '商品名称', dataIndex: 'goodsName', key: 'goodsName', width: 180 },
  { title: '兑换积分', dataIndex: 'point', key: 'point', width: 120 },
  { title: '库存数量', dataIndex: 'number', key: 'number', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
  { title: '商品图片', dataIndex: 'pic', key: 'pic', width: 120, align: 'center' },
  { title: '操作', key: 'action', width: 220, fixed: 'right', align: 'center' }
]

const goodsTypeOptions = computed(() =>
  goodsTypeList.value.map((item) => ({
    label: item.mal_type_name || item.malTypeName || '',
    value: item.id
  }))
)

const rowSelection = computed<TableProps['rowSelection']>(() => ({
  selectedRowKeys: selectedIds.value,
  onChange: (keys) => {
    selectedIds.value = keys.map(Number)
  }
}))

const toGoodsRecord = (record: Record<string, any>) => record as GoodsRecord

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const uploadImageUrl = computed(() => PATH_URL + '/Common/upLoadImage')

const resetGoodsForm = () => {
  goodsForm.id = undefined
  goodsForm.type = undefined
  goodsForm.name = ''
  goodsForm.fileName = undefined
  goodsForm.point = undefined
  goodsForm.number = undefined
  goodsForm.status = undefined
}

const handleBatchStatus = async (url: string) => {
  if (selectedIds.value.length === 0) {
    message.warning('请选择商品')
    return
  }

  const res: any = await service.post(
    PATH_URL + url,
    qs.stringify(
      {
        ids: selectedIds.value
      },
      { arrayFormat: 'brackets' }
    )
  )

  message[res.code === 200 ? 'success' : 'error'](res.code === 200 ? '操作成功' : '操作失败')
  selectedIds.value = []
  getGoods()
}

const handleRowStatus = async (id: number, url: string) => {
  const res: any = await service.post(
    PATH_URL + url,
    qs.stringify(
      {
        ids: [id]
      },
      { arrayFormat: 'brackets' }
    )
  )

  message[res.code === 200 ? 'success' : 'error'](res.code === 200 ? '操作成功' : '操作失败')
  getGoods()
}

const disableRow = (id: number) => {
  handleRowStatus(id, '/mal/malGoods/DisableGoods')
}

const enableRow = (id: number) => {
  handleRowStatus(id, '/mal/malGoods/EnableGoods')
}

const disableBatch = () => {
  handleBatchStatus('/mal/malGoods/DisableGoods')
}

const enableBatch = () => {
  handleBatchStatus('/mal/malGoods/EnableGoods')
}

const showAddUi = () => {
  resetGoodsForm()
  isUpdate.value = false
  dialogVisible.value = true
}

const showUpdateUi = (row: GoodsRecord) => {
  goodsForm.id = row.id
  goodsForm.type = row.goodsType
  goodsForm.name = row.goodsName
  goodsForm.fileName = row.pic
  goodsForm.point = row.point
  goodsForm.number = row.number
  goodsForm.status = row.status
  isUpdate.value = true
  dialogVisible.value = true
}

const validateGoodsForm = () => {
  if (!goodsForm.type) {
    message.warning('请选择商品类别')
    return false
  }
  if (!goodsForm.name.trim()) {
    message.warning('请输入商品名称')
    return false
  }
  return true
}

const addOrUpdate = () => {
  if (!validateGoodsForm()) return

  if (isUpdate.value) {
    updateSubmit()
    return
  }

  submitAdd()
}

const updateSubmit = async () => {
  submitLoading.value = true

  try {
    const res: any = await service.post(
      PATH_URL + '/mal/malGoods/UpdateGoods',
      qs.stringify({
        id: goodsForm.id,
        goodsName: goodsForm.name,
        goodsType: goodsForm.type,
        point: goodsForm.point,
        pic: goodsForm.fileName,
        number: goodsForm.number,
        status: goodsForm.status
      })
    )

    message[res.code === 200 ? 'success' : 'error'](res.code === 200 ? '操作成功' : '操作失败')
    dialogVisible.value = false
    getGoods()
  } finally {
    submitLoading.value = false
  }
}

const submitAdd = async () => {
  submitLoading.value = true

  try {
    const res: any = await service.post(
      PATH_URL + '/mal/malGoods/addGoods',
      qs.stringify({
        goodsName: goodsForm.name,
        goodsType: goodsForm.type,
        point: goodsForm.point,
        pic: goodsForm.fileName,
        number: goodsForm.number
      })
    )

    message[res.code === 200 ? 'success' : 'error'](res.code === 200 ? '操作成功' : '操作失败')
    dialogVisible.value = false
    getGoods()
  } finally {
    submitLoading.value = false
  }
}

const cleanAdd = () => {
  dialogVisible.value = false
  submitLoading.value = false
}

const onReset = () => {
  queryForm.name = ''
  queryForm.parentId = undefined
  currentPage.value = 1
  getGoods()
}

const onQuery = () => {
  currentPage.value = 1
  getGoods()
}

const getGoodsType = async () => {
  const res: any = await service.get(PATH_URL + '/mal/malType/GetMalTypeForSelect')
  goodsTypeList.value = res.data || []
}

const getGoods = async () => {
  tableLoading.value = true

  try {
    const res: any = await service.post(
      PATH_URL + '/mal/malGoods/GetGoods',
      qs.stringify({
        page: currentPage.value - 1,
        size: queryForm.size,
        content: queryForm.name,
        parentId: queryForm.parentId
      })
    )

    if (res.code == 200) {
      total.value = res.data?.total || 0
      resultData.value = res.data?.records || []
    }
  } finally {
    tableLoading.value = false
  }
}

const beforeAvatarUpload = () => true

const handleAvatarSuccess = (info: UploadChangeParam) => {
  const response = info.file.response as any

  if (!response) return

  if (response.code == 200) {
    goodsForm.fileName = response.data
    return
  }

  message.error('上传图片出错了')
}

onMounted(() => {
  getGoodsType()
  getGoods()
})
</script>

<style lang="less" scoped>
.goods-manage-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: flex;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  flex-wrap: wrap;
  gap: 12px 16px;

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }
}

.search-control {
  width: 220px;
}

.toolbar {
  display: flex;
  justify-content: flex-start;
}

.icon-button,
.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(.ant-btn-icon),
  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.success-button,
.success-link {
  color: #52c41a;
}

.table-action {
  height: 24px;
  padding: 0;
  gap: 4px;
}

.goods-image {
  object-fit: cover;
  border-radius: 4px;
}

.empty-text {
  color: rgb(0 0 0 / 35%);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.avatar-uploader {
  :deep(.ant-upload) {
    width: 96px;
    height: 96px;
    overflow: hidden;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
  }
}

.avatar {
  width: 96px;
  height: 96px;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  width: 96px;
  height: 96px;
  color: rgb(0 0 0 / 45%);
  background: #fafafa;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.w-full {
  width: 100%;
}
</style>
