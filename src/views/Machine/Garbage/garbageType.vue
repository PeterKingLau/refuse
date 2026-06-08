<template>
  <div class="garbage-type-page">
    <AForm v-if="showForm" :model="form" layout="inline" class="search-form">
      <AFormItem label="垃圾类型" class="search-form-item">
        <AInput v-model:value="form.typeName" class="search-input" placeholder="请输入垃圾类型" />
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

        <AButton danger class="icon-button" :disabled="disableRemove" @click="deleteOfDetail" v-hasPermi="Permission.del">
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

    <ATable row-key="id" :columns="columns" :data-source="garbageTypeData" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'pic'">
          <img v-if="record.pic" :src="getImageURL(record.pic)" class="table-image" />
          <span v-else class="empty-text">暂无</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action action-edit" @click="handleDetail(record)" v-hasPermi="Permission.rev">
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

    <AModal v-model:open="showDialog" :title="isUpdate ? '修改垃圾类别' : '添加垃圾类别'" width="680px" :destroy-on-close="true" @cancel="onCloseDialog">
      <AForm :model="updateForm" layout="vertical">
        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="类型名称" name="label">
              <AInput v-model:value="updateForm.label" placeholder="请输入类型名称" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="积分数量" name="points">
              <AInputNumber v-model:value="updateForm.points" :min="0" :max="9999" class="w-full" />
            </AFormItem>
          </ACol>

          <ACol :span="12">
            <AFormItem label="积分赠送模式" name="pointsMode">
              <ASelect v-model:value="updateForm.pointsMode" :options="pointTypeOptions" placeholder="请选择积分赠送模式" />
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
  </div>
</template>

<script setup lang="ts">
import { addPointsTypeApi, deleteGarbageTypeApi, getGarbageTypeApi, getPointsTypeApi, updatePointsTypeApi } from '@/api/machine'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Col as ACol,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Row as ARow,
  Select as ASelect,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  Upload as AUpload,
  message
} from 'ant-design-vue'
import type { TableColumnsType, UploadChangeParam } from 'ant-design-vue'
import qs from 'qs'
import * as requestApi from '@/api/request'
import { uppyUploadRequest } from '@/utils/uppyUpload'
import { Icon } from '@/components/Icon'

type TableKey = string | number

interface PointsType {
  id: number
  label: string
  code: string
}

interface GarbageTypeRecord {
  [key: string]: any
  id: number
  label: string
  pic: string
  points: number
  pointsMode: string
  pointsType?: {
    label?: string
  }
  createTime: string
  staff?: {
    name?: string
  }
}

interface UpdateData {
  id: number
  label: string
  pic: string
  points: number
  pointsMode: string
  createTime: string
  staff: any
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getGarbageType()
}

const Permission = ref({
  add: 'mac_gag_add',
  rev: 'mac_gag_rev',
  del: 'mac_gag_del',
  sec: 'mac_gag_sec'
})

const showForm = ref(true)
const form = reactive({
  typeName: ''
})

const getGarbageType = () => {
  getGarbageTypeApi(qs.stringify({ typeName: form.typeName }, { arrayFormat: 'brackets' })).then((res: any) => {
    garbageTypeData.value = res.data || []
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

onMounted(() => {
  getPointsTypeData()
  getGarbageType()
})

const handleDetail = (record: Record<string, any>) => {
  const data = record as GarbageTypeRecord
  isUpdate.value = true
  updateForm.id = data.id
  updateForm.label = data.label
  updateForm.pic = data.pic
  updateForm.points = data.points
  updateForm.pointsMode = data.pointsMode
  showDialog.value = true
}

const handleRemove = (record: Record<string, any>) => {
  const data = record as GarbageTypeRecord
  deleteGarbageType([data.id], '确定要删除这个垃圾类别吗？')
}

const pointTypeData = ref<PointsType[]>([])

const pointTypeOptions = computed(() =>
  pointTypeData.value.map((item) => ({
    label: item.label,
    value: item.code
  }))
)

const getPointsTypeData = () => {
  getPointsTypeApi().then((res: any) => {
    pointTypeData.value = res.data || []
  })
}

//#region 添加 dialog

const showDialog = ref(false)
const isUpdate = ref(false)

const updateForm = reactive<UpdateData>({
  id: 0,
  label: '',
  pic: '',
  points: 0,
  pointsMode: 'wei',
  createTime: '',
  staff: ''
})

const initUpdateForm = () => {
  updateForm.createTime = ''
  updateForm.id = 0
  updateForm.label = ''
  updateForm.pic = ''
  updateForm.points = 10
  updateForm.pointsMode = 'wei'
  updateForm.staff = ''
}

const onCloseDialog = () => {
  showDialog.value = false
  isUpdate.value = false
  initUpdateForm()
}

const onAddConfirm = () => {
  if (isUpdate.value) {
    onUpdate()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加这个垃圾类别吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await addPointsTypeApi(
        qs.stringify(
          {
            points: updateForm.points,
            pointsMode: updateForm.pointsMode,
            label: updateForm.label,
            pic: updateForm.pic
          },
          { arrayFormat: 'brackets' }
        )
      )
      message.success('操作成功')
      getGarbageType()
      onCloseDialog()
    }
  })
}

const onUpdate = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这个垃圾类别吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await updatePointsTypeApi(
        qs.stringify(
          {
            points: updateForm.points,
            pointsMode: updateForm.pointsMode,
            label: updateForm.label,
            pic: updateForm.pic,
            id: updateForm.id
          },
          { arrayFormat: 'brackets' }
        )
      )
      message.success('操作成功')
      getGarbageType()
      onCloseDialog()
    }
  })
}

//#endregion

//#region 表格相关

const columns: TableColumnsType<GarbageTypeRecord> = [
  { title: '类别名称', dataIndex: 'label', key: 'label', width: 140 },
  { title: '图片', dataIndex: 'pic', key: 'pic', width: 120 },
  { title: '积分数量', dataIndex: 'points', key: 'points', width: 100 },
  { title: '积分赠送模式', dataIndex: ['pointsType', 'label'], key: 'pointsType', width: 150 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '创建人', dataIndex: ['staff', 'name'], key: 'staffName', width: 120 },
  { title: '操作', key: 'action', width: 160 }
]

const garbageTypeData = ref<GarbageTypeRecord[]>([])
const selectedRowKeys = ref<TableKey[]>([])
let DeleteIdArray: number[] = []

const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TableKey[], rows: GarbageTypeRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const deleteGarbageType = (ids: number[], content: string) => {
  if (ids.length === 0) {
    message.warning('请选择要删除的垃圾类别')
    return
  }

  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteGarbageTypeApi(qs.stringify({ ids }, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getGarbageType()
    }
  })
}

const beforeAvatarUpload = () => true

const handleUploadChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'done') return

  const response = info.file.response
  if (response?.code == 200) {
    updateForm.pic = response.data
  } else {
    message.error('上传图片出错了')
  }
}

const headObject = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const UpImageURL = computed(() => requestApi.getUploadImageUrl())

const getImageURL = (imageURL?: string) => {
  return imageURL ? requestApi.getDownloadPicUrl(imageURL) : ''
}

//#endregion

const onSearch = () => {
  getGarbageType()
}

const onReset = () => {
  form.typeName = ''
  getGarbageType()
}

const OnClickAdd = () => {
  initUpdateForm()
  isUpdate.value = false
  showDialog.value = true
}

const deleteOfDetail = () => {
  deleteGarbageType([...DeleteIdArray], '确定要删除这些垃圾类别吗？')
}

const OnClickOfShowForm = () => {
  showForm.value = !showForm.value
}
</script>

<style lang="less" scoped>
.garbage-type-page {
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

.action-edit {
  color: #52c41a;
}

.table-image {
  display: block;
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 6px;
}

.empty-text {
  color: #8c8c8c;
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
