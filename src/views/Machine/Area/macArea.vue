<template>
  <div class="mac-area-page">
    <AForm v-if="showSearchForm" :model="form" layout="inline" class="search-form">
      <AFormItem label="区域名称" class="search-form-item">
        <AInput v-model:value="form.area" class="search-input" placeholder="请输入区域名称" />
      </AFormItem>

      <AFormItem class="search-form-action">
        <AButton type="primary" class="icon-button" @click="getAreaData" v-hasPermi="Permission.sec">
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

    <ATable row-key="id" :columns="columns" :data-source="areaTableData" :pagination="false" :row-selection="rowSelection" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" class="table-action" @click="handleDetail(record)" v-hasPermi="Permission.rev">
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

    <AModal v-model:open="addDialogFormVisible" :title="isUpdate ? '修改设备区域' : '添加设备区域'" width="560px" :destroy-on-close="true" @cancel="closeAreaDialog">
      <AForm :model="addFormData" layout="vertical">
        <AFormItem label="所在区域">
          <ATreeSelect
            v-model:value="addFormData.areaCode"
            :tree-data="areaTreeData"
            :load-data="loadAreaChildren"
            allow-clear
            show-search
            tree-node-filter-prop="title"
            placeholder="请选择省份"
            class="w-full"
          />
        </AFormItem>

        <AFormItem label="区域名称">
          <AInput v-model:value="addFormData.areaName" autocomplete="off" placeholder="请输入区域名称" />
        </AFormItem>
      </AForm>
      <template #footer>
        <ASpace>
          <AButton @click="closeAreaDialog">取消</AButton>
          <AButton type="primary" @click="onAddConfirm">确认</AButton>
        </ASpace>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { getAreaChinaApi } from '@/api/machine'

import { addDeviceAreaApi, deleteDeviceAreaApi, getDeviceAreaApi, updateDeviceAreaApi } from '@/api/permission'

import { computed, inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  TreeSelect as ATreeSelect,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import type { AxiosRequestConfig } from 'axios'
import qs from 'qs'
import * as requestApi from '@/api/request'
import { Icon } from '@/components/Icon'

type TreeKey = string | number

interface AreaRecord {
  [key: string]: any
  id: number
  areaCode: string
  areaName: string
  fullName: string
  createTime: string
  staff?: {
    name?: string
  }
}

interface AreaSourceNode {
  code: TreeKey
  name: string
  isLeaf?: boolean
  children?: AreaSourceNode[]
}

interface AreaTreeNode {
  key: TreeKey
  value: TreeKey
  title: string
  code: TreeKey
  isLeaf?: boolean
  children?: AreaTreeNode[]
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getAreaData()
}

//#region 表格相关

const handleDetail = (record: Record<string, any>) => {
  const val = record as AreaRecord
  isUpdate.value = true
  addFormData.id = val.id
  addFormData.areaCode = val.areaCode
  addFormData.areaName = val.areaName

  openAreaDialog(val)
}

const Permission = ref({
  add: 'mac_are_add',
  rev: 'mac_are_rev',
  del: 'mac_are_del',
  sec: 'mac_are_sec'
})

const deleteOfDetail = () => {
  deleteDeviceArea([...DeleteIdArray], '确定要删除这些设备区域吗？')
}

const handleRemove = (record: Record<string, any>) => {
  const data = record as AreaRecord
  deleteDeviceArea([data.id], '确定要删除这个设备区域吗？')
}

const deleteDeviceArea = (ids: number[], content: string) => {
  if (ids.length === 0) {
    message.warning('请选择要删除的设备区域')
    return
  }

  AModal.confirm({
    title: '提示',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteDeviceAreaApi(qs.stringify({ ids }, { arrayFormat: 'brackets' }))
      getAreaData()
      message.success('删除记录成功')
    }
  })
}

const columns: TableColumnsType<AreaRecord> = [
  { title: '区域名称', dataIndex: 'areaName', key: 'areaName', width: 140 },
  { title: '所在地区', dataIndex: 'fullName', key: 'fullName', width: 180 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '创建者', dataIndex: ['staff', 'name'], key: 'staffName', width: 140 },
  { title: '操作', key: 'action', width: 160 }
]

const areaTableData = ref<AreaRecord[]>([])
const selectedRowKeys = ref<TreeKey[]>([])
let DeleteIdArray: number[] = []

const disableRemove = computed(() => selectedRowKeys.value.length === 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: TreeKey[], rows: AreaRecord[]) => {
    selectedRowKeys.value = keys
    DeleteIdArray = rows.map((row) => row.id)
  }
}))

const getAreaData = () => {
  getDeviceAreaApi(qs.stringify({ name: form.area }, { arrayFormat: 'brackets' })).then((res: any) => {
    areaTableData.value = res.data || []
    selectedRowKeys.value = []
    DeleteIdArray = []
  })
}

//#endregion

onMounted(() => {
  getAreaData()
})

//#region  搜索相关
const onReset = () => {
  form.area = ''
  getAreaData()
}

const showSearchForm = ref(true)
const form = reactive({
  area: ''
})
//#endregion

//#region 添加dialog
const areaTreeData = ref<AreaTreeNode[]>([])

const normalizeAreaTree = (nodes: AreaSourceNode[] = []): AreaTreeNode[] => {
  return nodes.map((node) => ({
    key: node.code,
    value: node.code,
    title: node.name,
    code: node.code,
    isLeaf: node.isLeaf,
    children: node.children ? normalizeAreaTree(node.children) : undefined
  }))
}

const updateTreeData = (list: AreaTreeNode[], key: TreeKey, children: AreaTreeNode[]): AreaTreeNode[] => {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
        isLeaf: children.length === 0
      }
    }

    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children)
      }
    }

    return node
  })
}

const findAreaNode = (list: AreaTreeNode[], key: TreeKey): AreaTreeNode | undefined => {
  for (const node of list) {
    if (node.key === key) {
      return node
    }

    const matchedNode = findAreaNode(node.children || [], key)
    if (matchedNode) {
      return matchedNode
    }
  }

  return undefined
}

const ensureSelectedAreaNode = (record?: AreaRecord) => {
  if (!record?.areaCode || !record.fullName || findAreaNode(areaTreeData.value, record.areaCode)) {
    return
  }

  areaTreeData.value = [
    {
      key: record.areaCode,
      value: record.areaCode,
      title: record.fullName,
      code: record.areaCode,
      isLeaf: true
    },
    ...areaTreeData.value
  ]
}

const getAreaChildren = async (pcode: TreeKey) => {
  const config: AxiosRequestConfig = {
    params: {
      pcode
    }
  }
  const res: any = await getAreaChinaApi(config)
  return normalizeAreaTree(res.data || [])
}

const loadRootAreas = async () => {
  if (areaTreeData.value.length > 0) return
  areaTreeData.value = await getAreaChildren(0)
}

const loadAreaChildren = async (treeNode: any) => {
  if (treeNode.children?.length) return
  const children = await getAreaChildren(treeNode.code)
  areaTreeData.value = updateTreeData(areaTreeData.value, treeNode.key, children)
}

const addDialogFormVisible = ref(false)
const addFormData = reactive({
  areaCode: '',
  areaName: '',
  id: 0
})

const resetAreaForm = () => {
  addFormData.areaCode = ''
  addFormData.areaName = ''
  addFormData.id = 0
}

const openAreaDialog = async (record?: AreaRecord) => {
  await loadRootAreas()
  ensureSelectedAreaNode(record)
  addDialogFormVisible.value = true
}

const closeAreaDialog = () => {
  addDialogFormVisible.value = false
  resetAreaForm()
  isUpdate.value = false
}

//#endregion

//#region 添加相关
const isUpdate = ref(false)
const onAddConfirm = () => {
  if (isUpdate.value) {
    updateDeviceArea()
    return
  }

  AModal.confirm({
    title: '提示',
    content: '确定要添加这个设备区域吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await addDeviceAreaApi(addFormData)
      message.success('操作成功')
      getAreaData()
      closeAreaDialog()
    }
  })
}

const updateDeviceArea = () => {
  AModal.confirm({
    title: '提示',
    content: '确定要修改这个设备区域吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const data = {
        id: addFormData.id,
        areaCode: addFormData.areaCode,
        areaName: addFormData.areaName
      }

      await updateDeviceAreaApi(qs.stringify(data, { arrayFormat: 'brackets' }))
      message.success('操作成功')
      getAreaData()
      closeAreaDialog()
    }
  })
}

const OnClickAdd = () => {
  isUpdate.value = false
  resetAreaForm()
  openAreaDialog()
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

//#endregion
</script>

<style lang="less" scoped>
.mac-area-page {
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
</style>
