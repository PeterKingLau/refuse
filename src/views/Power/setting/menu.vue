<template>
  <div class="menu-manage-page">
    <AForm :model="searchForm" layout="inline" class="search-form">
      <AFormItem label="父级菜单" class="search-form-item">
        <ATreeSelect
          v-model:value="searchForm.parentId"
          :dropdown-style="{ maxHeight: '360px', overflow: 'auto' }"
          :tree-data="searchParentMenuTreeData"
          class="search-control"
          placeholder="请选择父级菜单"
          show-search
          tree-default-expand-all
          tree-node-filter-prop="title"
        />
      </AFormItem>
      <AFormItem label="关键字" class="search-form-item">
        <AInput v-model:value="searchForm.keyword" allow-clear class="search-control" placeholder="名称、路径或组件名" />
      </AFormItem>
      <AFormItem class="search-form-action">
        <AButton type="primary" class="icon-button" @click="searchMenuList">
          <template #icon><Icon icon="ant-design:search-outlined" /></template>
          搜索
        </AButton>
      </AFormItem>
      <AFormItem class="search-form-action">
        <AButton class="icon-button" @click="resetSearchForm">
          <template #icon><Icon icon="ant-design:reload-outlined" /></template>
          重置
        </AButton>
      </AFormItem>
      <AFormItem class="mapping-tips">
        <ASpace :size="8" wrap>
          <ATag color="blue" :bordered="false"># = Layout</ATag>
          <ATag color="purple" :bordered="false">## = ParentLayout</ATag>
          <ATag color="cyan" :bordered="false">views/xxx = 组件路径</ATag>
        </ASpace>
      </AFormItem>
    </AForm>

    <div class="toolbar">
      <div class="toolbar-left">
        <AButton type="primary" class="icon-button" @click="openCreateDialog">
          <template #icon><Icon icon="ant-design:plus-outlined" /></template>
          新增菜单
        </AButton>

        <AButton class="icon-button" :disabled="!hasSortChanges" :loading="sortSaving" @click="saveMenuSort">
          <template #icon><Icon icon="ant-design:save-outlined" /></template>
          保存排序
        </AButton>
      </div>

      <div class="toolbar-right">
        <ATooltip title="刷新">
          <AButton shape="circle" :loading="loading" @click="getMenuList">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
          </AButton>
        </ATooltip>
      </div>
    </div>

    <div class="table-container">
      <ATable
        row-key="id"
        :columns="columns"
        :data-source="menuTree"
        :expanded-row-keys="expandedRowKeys"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 1410 }"
        class="menu-table"
        @expand="handleTableExpand"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <span class="menu-title-text">{{ getMenuTitle(record) }}</span>
          </template>

          <template v-else-if="column.key === 'path'">
            <span class="path-text">{{ record.path || '-' }}</span>
          </template>

          <template v-else-if="column.key === 'metaTitle'">
            <span class="meta-title-text">{{ record.meta?.title || '-' }}</span>
          </template>

          <template v-else-if="column.key === 'component'">
            <ATooltip :title="getComponentDescription(record.component)">
              <ATag :color="getComponentTagColor(record.component)" :bordered="false" class="component-tag">
                {{ record.component || '-' }}
              </ATag>
            </ATooltip>
          </template>

          <template v-else-if="column.key === 'soft'">
            <AInputNumber :value="record.soft ?? 0" class="sort-input" size="small" :min="0" :controls="false" @change="(value) => handleSortChange(record, value)" />
          </template>

          <template v-else-if="column.key === 'status'">
            <ASwitch :checked="isMenuEnabled(record.status)" :loading="isStatusUpdating(record)" size="small" @change="(checked) => handleStatusChange(record, checked)" />
          </template>

          <template v-else-if="column.key === 'icon'">
            <span v-if="getMenuIcon(record)" class="icon-cell" :title="getMenuIcon(record)">
              <Icon :icon="getMenuIcon(record)" class="menu-icon" />
            </span>
            <span v-else class="empty-text">-</span>
          </template>

          <template v-else-if="column.key === 'action'">
            <ASpace size="middle" class="action-links">
              <span class="text-btn view" @click="openDetailDialog(record)">
                <Icon icon="ant-design:eye-outlined" />
                查看
              </span>
              <span class="text-btn edit" @click="openUpdateDialog(record)">
                <Icon icon="ant-design:edit-outlined" />
                修改
              </span>
              <span class="text-btn danger" @click="confirmDeleteMenu(record)">
                <Icon icon="ant-design:delete-outlined" />
                删除
              </span>
            </ASpace>
          </template>
        </template>
      </ATable>
    </div>

    <AModal v-model:open="createDialogVisible" :title="formDialogTitle" width="1040px" :confirm-loading="submitLoading" @ok="submitMenuForm" centered class="modern-modal menu-form-modal">
      <AForm :model="createForm" layout="vertical" class="modern-form">
        <div class="form-grid">
          <AFormItem label="菜单名称" :name="['meta', 'title']">
            <AInput v-model:value="createForm.meta.title" allow-clear placeholder="请输入菜单显示名称" />
          </AFormItem>
          <AFormItem label="路由路径" name="path">
            <AInput v-model:value="createForm.path" allow-clear placeholder="例如 /system 或 menu" />
          </AFormItem>
          <AFormItem label="组件名称" name="name">
            <AInput v-model:value="createForm.name" allow-clear placeholder="例如 SystemMenu" />
          </AFormItem>
          <AFormItem label="组件路径" name="component">
            <AInput v-model:value="createForm.component" allow-clear placeholder="# / ## / views/Power/Setting/menu" />
          </AFormItem>
          <AFormItem label="父级菜单">
            <ATreeSelect
              v-model:value="createForm.parentId"
              :dropdown-style="{ maxHeight: '360px', overflow: 'auto' }"
              :tree-data="formParentMenuTreeData"
              placeholder="请选择父级菜单"
              show-search
              tree-default-expand-all
              tree-node-filter-prop="title"
            />
          </AFormItem>
          <AFormItem label="重定向路径">
            <AInput v-model:value="createForm.redirect" allow-clear placeholder="例如 /system/menu" />
          </AFormItem>
          <AFormItem label="前端标志">
            <AInput v-model:value="createForm.sign" allow-clear placeholder="请输入前端标志" />
          </AFormItem>
          <AFormItem label="角色分配显示名称">
            <AInput v-model:value="createForm.label" allow-clear placeholder="默认使用菜单名称" />
          </AFormItem>
          <AFormItem label="排序值">
            <AInputNumber v-model:value="createForm.soft" class="w-full" :min="0" />
          </AFormItem>
          <AFormItem label="菜单状态">
            <ASwitch v-model:checked="createForm.status" :checked-value="0" :un-checked-value="1" checked-children="启用" un-checked-children="禁用" />
          </AFormItem>
          <AFormItem label="Meta 状态">
            <ASwitch v-model:checked="createForm.meta.status" :checked-value="0" :un-checked-value="1" checked-children="启用" un-checked-children="禁用" />
          </AFormItem>
          <AFormItem label="始终显示父级">
            <ASwitch v-model:checked="createForm.meta.alwaysShow" />
          </AFormItem>
          <AFormItem label="菜单图标" class="col-span-2">
            <div class="icon-picker-panel">
              <AInput v-model:value="iconSearchKeyword" allow-clear class="icon-search-input" placeholder="搜索图标，如 user、home、edit">
                <template #prefix>
                  <Icon icon="ant-design:search-outlined" />
                </template>
              </AInput>

              <div class="icon-tabs">
                <button v-for="tab in iconTabs" :key="tab.prefix" type="button" :class="['icon-tab', { 'is-active': activeIconSet === tab.prefix }]" @click="activeIconSet = tab.prefix">
                  {{ tab.name }}
                </button>
              </div>

              <ASpin :spinning="iconPickerLoading">
                <div class="icon-grid">
                  <button
                    v-for="item in iconGridItems"
                    :key="item.fullName"
                    type="button"
                    :class="['icon-grid-item', { 'is-active': createForm.meta.icon === item.fullName }]"
                    :title="item.fullName"
                    @click="selectIcon(item.fullName)"
                  >
                    <Icon :icon="item.fullName" :size="24" />
                    <span>{{ item.name }}</span>
                  </button>
                  <div v-if="!iconPickerLoading && iconGridItems.length === 0" class="icon-empty">
                    {{ activeIconSet === 'remote' && !iconSearchKeyword.trim() ? '请输入关键词搜索远程图标' : '暂无匹配图标' }}
                  </div>
                </div>
              </ASpin>

              <div v-if="createForm.meta.icon" class="selected-icon">
                <span class="selected-icon-preview">
                  <Icon :icon="createForm.meta.icon" />
                </span>
                <span class="selected-icon-name">{{ createForm.meta.icon }}</span>
                <AButton type="link" size="small" class="selected-icon-clear" @click="selectIcon('')">清除</AButton>
              </div>
            </div>
            <div class="form-hint">支持 public/iconify 本地图标集，也可切换到远程搜索 Iconify 图标库</div>
          </AFormItem>
        </div>
      </AForm>
    </AModal>

    <AModal v-model:open="detailDialogVisible" title="菜单详情" width="680px" :footer="null" centered class="modern-modal">
      <ASpin :spinning="detailLoading">
        <div v-if="currentMenuDetail" class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">菜单名称</span>
            <span class="detail-value">{{ getMenuTitle(currentMenuDetail) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">组件名称</span>
            <span class="detail-value">{{ currentMenuDetail.name || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">路由路径</span>
            <span class="detail-value font-mono">{{ currentMenuDetail.path || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">组件路径</span>
            <span class="detail-value">
              <ATag :color="getComponentTagColor(currentMenuDetail.component)" :bordered="false" class="component-tag">
                {{ currentMenuDetail.component || '-' }}
              </ATag>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">父级ID</span>
            <span class="detail-value">{{ currentMenuDetail.parentId ?? 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">重定向</span>
            <span class="detail-value font-mono">{{ currentMenuDetail.redirect || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">前端标志</span>
            <span class="detail-value">{{ currentMenuDetail.sign || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">排序值</span>
            <span class="detail-value">{{ currentMenuDetail.soft ?? '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span class="detail-value">
              <span :class="['status-dot', getStatusMeta(currentMenuDetail.status).color]"></span>
              {{ getStatusMeta(currentMenuDetail.status).label }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">角色显示</span>
            <span class="detail-value">{{ currentMenuDetail.label || '-' }}</span>
          </div>
          <div class="detail-item col-span-2">
            <span class="detail-label">图标</span>
            <span class="detail-value flex items-center gap-2">
              <Icon v-if="getMenuIcon(currentMenuDetail)" :icon="getMenuIcon(currentMenuDetail)" class="text-lg" />
              {{ getMenuIcon(currentMenuDetail) || '-' }}
            </span>
          </div>
        </div>
        <div v-else class="detail-empty">数据加载异常</div>
      </ASpin>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  Button as AButton,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Modal as AModal,
  Space as ASpace,
  Spin as ASpin,
  Switch as ASwitch,
  Table as ATable,
  Tag as ATag,
  Tooltip as ATooltip,
  TreeSelect as ATreeSelect,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import {
  batchUpdateMenuDynamicSort,
  createMenuDynamic,
  deleteMenuDynamic,
  getMenuDynamicDetail,
  getMenuDynamicList,
  getMenuDynamicTreeList,
  UmsMenuDynamic,
  updateMenuDynamic,
  updateMenuDynamicStatus
} from '@/api/system/menu'
import { Icon } from '@/components/Icon'
import { loadLocalIconSets, LocalIconSet, normalizeIconName, registerIconNames, searchRemoteIconNames } from '@/utils/iconifyIcons'
import { refreshMenuRoutes } from '@/utils/permissionRoutes'

type TableKey = string | number

const loading = ref(false)
const submitLoading = ref(false)
const detailLoading = ref(false)
const sortSaving = ref(false)
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentMenuDetail = ref<UmsMenuDynamic>()
const menuTree = ref<UmsMenuDynamic[]>([])
const parentMenuTree = ref<UmsMenuDynamic[]>([])
const expandedRowKeys = ref<TableKey[]>([])
const statusUpdatingIds = ref<number[]>([])
const sortChangeMap = ref<Record<number, number>>({})
const formMode = ref<'create' | 'update'>('create')
const searchForm = reactive({
  parentId: 0,
  keyword: ''
})
const iconLoading = ref(false)
const remoteIconLoading = ref(false)
const iconSets = ref<LocalIconSet[]>([])
const activeIconSet = ref('all')
const iconSearchKeyword = ref('')
const iconVisibleLimit = 600
const remoteIconVisibleLimit = 180
const remoteIconNames = ref<string[]>([])
let remoteIconSearchTimer: ReturnType<typeof setTimeout> | undefined

interface MenuCreateForm extends Omit<UmsMenuDynamic, 'meta' | 'parentId' | 'soft' | 'status'> {
  parentId: number
  soft: number
  status: number
  meta: {
    alwaysShow: boolean
    icon: string
    title: string
    status: number
    id?: number
    menuId?: number
  }
}

interface ParentMenuTreeSelectNode {
  title: string
  value: number
  key: number
  children?: ParentMenuTreeSelectNode[]
}

interface IconGridItem {
  setName: string
  prefix: string
  name: string
  fullName: string
}

const createDefaultForm = (): MenuCreateForm => ({
  id: 0,
  path: '',
  name: '',
  component: '#',
  redirect: '',
  parentId: 0,
  soft: 0,
  sign: '',
  status: 0,
  label: '',
  meta: {
    alwaysShow: true,
    icon: '',
    title: '',
    status: 0
  }
})

const createForm = reactive<MenuCreateForm>(createDefaultForm())

const formDialogTitle = computed(() => {
  return formMode.value === 'create' ? '新增系统菜单' : '编辑系统菜单'
})

const hasSortChanges = computed(() => Object.keys(sortChangeMap.value).length > 0)

const columns: TableColumnsType<UmsMenuDynamic> = [
  { title: '菜单名称', key: 'title', width: 200 },
  { title: '路由路径', dataIndex: 'path', key: 'path', width: 180 },
  { title: '组件映射', dataIndex: 'component', key: 'component', width: 240 },
  { title: '重定向', dataIndex: 'redirect', key: 'redirect', width: 160 },
  { title: '排序', dataIndex: 'soft', key: 'soft', width: 100, align: 'center' },
  { title: '图标', key: 'icon', width: 90, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
  { title: '操作', key: 'action', width: 210, fixed: 'right', align: 'center' }
]

const buildParentMenuTreeSelectNodes = (nodes: UmsMenuDynamic[], excludeCurrent = false): ParentMenuTreeSelectNode[] => {
  return nodes
    .map((node) => {
      if (excludeCurrent && node.id === createForm.id) {
        return undefined
      }

      const children = buildParentMenuTreeSelectNodes(node.children || [], excludeCurrent)

      return {
        title: getMenuTitle(node),
        value: node.id,
        key: node.id,
        ...(children.length ? { children } : {})
      }
    })
    .filter(Boolean) as ParentMenuTreeSelectNode[]
}

const createRootMenuTreeSelectNode = (children: ParentMenuTreeSelectNode[]): ParentMenuTreeSelectNode => ({
  title: '根级菜单 (Root)',
  value: 0,
  key: 0,
  ...(children.length ? { children } : {})
})

const searchParentMenuTreeData = computed(() => [createRootMenuTreeSelectNode(buildParentMenuTreeSelectNodes(parentMenuTree.value))])

const formParentMenuTreeData = computed(() => [createRootMenuTreeSelectNode(buildParentMenuTreeSelectNodes(parentMenuTree.value, formMode.value === 'update'))])

const iconTabs = computed(() => [
  {
    name: '全部',
    prefix: 'all'
  },
  {
    name: '远程搜索',
    prefix: 'remote'
  },
  ...iconSets.value.map((item) => ({
    name: item.name,
    prefix: item.prefix
  }))
])

const iconPickerLoading = computed(() => iconLoading.value || remoteIconLoading.value)

const iconGridItems = computed<IconGridItem[]>(() => {
  const keyword = iconSearchKeyword.value.trim().toLowerCase()

  if (activeIconSet.value === 'remote') {
    return remoteIconNames.value
      .map((icon) => {
        const [prefix, name] = icon.split(':')
        return {
          setName: 'Iconify',
          prefix,
          name,
          fullName: icon
        }
      })
      .filter((item) => item.prefix && item.name)
      .slice(0, remoteIconVisibleLimit)
  }

  const sourceIconSets = activeIconSet.value === 'all' ? iconSets.value : iconSets.value.filter((item) => item.prefix === activeIconSet.value)

  return sourceIconSets
    .flatMap((set) =>
      set.icons.map((icon) => ({
        setName: set.name,
        prefix: set.prefix,
        name: icon,
        fullName: `${set.prefix}:${icon}`
      }))
    )
    .filter((item) => {
      if (!keyword) return true
      return item.name.toLowerCase().includes(keyword) || item.fullName.toLowerCase().includes(keyword)
    })
    .slice(0, iconVisibleLimit)
})

const searchRemoteIcons = async () => {
  const keyword = iconSearchKeyword.value.trim()

  if (activeIconSet.value !== 'remote' || !keyword) {
    remoteIconNames.value = []
    return
  }

  remoteIconLoading.value = true

  try {
    remoteIconNames.value = await searchRemoteIconNames(keyword, remoteIconVisibleLimit)
  } finally {
    remoteIconLoading.value = false
  }
}

const loadIconPickerSets = async () => {
  if (iconSets.value.length > 0) return

  iconLoading.value = true

  try {
    iconSets.value = await loadLocalIconSets()
  } finally {
    iconLoading.value = false
  }
}

const selectIcon = (icon: string) => {
  const normalizedIcon = normalizeIconName(icon)

  if (normalizedIcon) {
    registerIconNames([normalizedIcon])
  }

  createForm.meta.icon = normalizedIcon
}

watch(
  iconGridItems,
  (items) => {
    registerIconNames(items.map((item) => item.fullName))
  },
  {
    immediate: true
  }
)

watch([activeIconSet, iconSearchKeyword], () => {
  if (remoteIconSearchTimer) {
    clearTimeout(remoteIconSearchTimer)
  }

  remoteIconSearchTimer = setTimeout(() => {
    searchRemoteIcons()
  }, 300)
})

const normalizeResponseList = (response: any): UmsMenuDynamic[] => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.rows)) return response.rows
  if (Array.isArray(response?.data?.records)) return response.data.records
  if (Array.isArray(response?.data?.rows)) return response.data.rows
  return []
}

const normalizeResponseDetail = (response: any): UmsMenuDynamic | undefined => {
  if (response?.data) return response.data
  if (response?.id) return response
  return undefined
}

const cloneMenuNode = (node: UmsMenuDynamic): UmsMenuDynamic => {
  const clonedNode: UmsMenuDynamic = {
    ...node,
    meta: node.meta ? { ...node.meta } : undefined
  }

  if (Array.isArray(node.children) && node.children.length > 0) {
    clonedNode.children = node.children.map(cloneMenuNode).sort(sortMenuNode)
  } else {
    delete clonedNode.children
  }

  return clonedNode
}

const sortMenuNode = (a: UmsMenuDynamic, b: UmsMenuDynamic) => {
  return Number(a.soft ?? 0) - Number(b.soft ?? 0)
}

const hasTreeChildren = (list: UmsMenuDynamic[]) => {
  return list.some((item) => Array.isArray(item.children) && item.children.length > 0)
}

const buildMenuTree = (list: UmsMenuDynamic[]) => {
  if (list.length === 0) return []

  if (hasTreeChildren(list)) {
    return list.map(cloneMenuNode).sort(sortMenuNode)
  }

  const nodeMap = new Map<number, UmsMenuDynamic>()
  const roots: UmsMenuDynamic[] = []

  list.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      meta: item.meta ? { ...item.meta } : undefined,
      children: []
    })
  })

  nodeMap.forEach((node) => {
    const parentId = node.parentId
    const parentNode = parentId == null || parentId === 0 ? undefined : nodeMap.get(parentId)

    if (parentNode) {
      parentNode.children = parentNode.children || []
      parentNode.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortTree = (nodes: UmsMenuDynamic[]) => {
    nodes.sort(sortMenuNode)
    nodes.forEach((node) => {
      if (node.children?.length) {
        sortTree(node.children)
      } else {
        delete node.children
      }
    })
  }

  sortTree(roots)
  return roots
}

const flattenMenuList = (nodes: UmsMenuDynamic[]): UmsMenuDynamic[] => {
  return nodes.flatMap((node) => [node, ...flattenMenuList(node.children || [])])
}

const getMenuTitle = (record: Partial<UmsMenuDynamic>) => {
  return record.label || record.meta?.title || record.name || '-'
}

const getMenuIcon = (record: Partial<UmsMenuDynamic> & Record<string, any>) => {
  return normalizeIconName(record.meta?.icon || record.icon || '')
}

const getComponentDescription = (component?: string) => {
  if (component === '#') return 'Layout: 基础骨架'
  if (component === '##') return 'ParentLayout: 嵌套路由骨架'
  if (component?.startsWith('views/')) return '常规页面组件'
  return component || '-'
}

const getComponentTagColor = (component?: string) => {
  if (component === '#') return 'blue'
  if (component === '##') return 'purple'
  if (component?.startsWith('views/')) return 'cyan'
  return 'default'
}

const enabledStatusValues = ['false', '0', 'enable', 'enabled', 'normal', '启用', '正常']
const disabledStatusValues = ['true', '1', 'disable', 'disabled', 'abnormal', '禁用', '异常']

const getStatusMeta = (status?: boolean | string | number) => {
  const normalizedStatus = String(status).toLowerCase()

  if (enabledStatusValues.includes(normalizedStatus)) {
    return { color: 'success', label: '已启用' }
  }

  if (disabledStatusValues.includes(normalizedStatus)) {
    return { color: 'error', label: '已禁用' }
  }

  return { color: 'default', label: status == null ? '未知' : String(status) }
}

const getFormStatusValue = (status?: boolean | string | number) => {
  const normalizedStatus = String(status).toLowerCase()
  return disabledStatusValues.includes(normalizedStatus) ? 1 : 0
}

const isMenuEnabled = (status?: boolean | string | number) => {
  return getFormStatusValue(status) === 0
}

const isStatusUpdating = (record: Record<string, any>) => {
  return statusUpdatingIds.value.includes(Number(record.id))
}

const updateMenuSoftById = (nodes: UmsMenuDynamic[], id: number, soft: number): UmsMenuDynamic[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return {
        ...node,
        soft
      }
    }

    if (!node.children?.length) {
      return node
    }

    return {
      ...node,
      children: updateMenuSoftById(node.children, id, soft)
    }
  })
}

const handleStatusChange = async (record: Record<string, any>, checked: string | number | boolean) => {
  const id = Number(record.id)
  const nextStatus = !checked

  statusUpdatingIds.value = [...statusUpdatingIds.value, id]

  try {
    await updateMenuDynamicStatus(id, nextStatus)
    record.status = nextStatus
    await refreshMenuDataAndRoutes()
    message.success('状态已更新')
  } catch (error: any) {
    message.error(error?.message || '状态更新失败')
  } finally {
    statusUpdatingIds.value = statusUpdatingIds.value.filter((item) => item !== id)
  }
}

const refreshMenuDataAndRoutes = async () => {
  await refreshMenuRoutes({ keepCurrent: true })
  await Promise.all([getParentMenuTree(), getMenuList()])
}

const handleSortChange = (record: Record<string, any>, value: string | number | null) => {
  const id = Number(record.id)
  const nextSoft = Number(value ?? 0)

  menuTree.value = updateMenuSoftById(menuTree.value, id, nextSoft)
  sortChangeMap.value = {
    ...sortChangeMap.value,
    [id]: nextSoft
  }
}

const saveMenuSort = async () => {
  const changedIds = Object.keys(sortChangeMap.value).map(Number)

  if (changedIds.length === 0) {
    return
  }

  const menuMap = new Map(flattenMenuList(menuTree.value).map((item) => [item.id, item]))
  const payload = changedIds
    .map((id) => {
      const menu = menuMap.get(id)
      if (!menu) return undefined
      const { children, ...rest } = menu
      return {
        ...rest,
        soft: sortChangeMap.value[id]
      }
    })
    .filter(Boolean) as UmsMenuDynamic[]

  sortSaving.value = true

  try {
    await batchUpdateMenuDynamicSort(payload)
    await refreshMenuDataAndRoutes()
    message.success('菜单排序已保存')
    sortChangeMap.value = {}
  } catch (error: any) {
    message.error(error?.message || '保存排序失败')
  } finally {
    sortSaving.value = false
  }
}

const openDetailDialog = async (record: Record<string, any>) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  currentMenuDetail.value = undefined

  try {
    const res = await getMenuDynamicDetail(Number(record.id))
    currentMenuDetail.value = normalizeResponseDetail(res)
  } catch (error: any) {
    message.error('获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleTableExpand = (expanded: boolean, record: Record<string, any>) => {
  const id = Number(record.id)

  if (expanded) {
    expandedRowKeys.value = Array.from(new Set([...expandedRowKeys.value, id]))
    return
  }

  expandedRowKeys.value = expandedRowKeys.value.filter((key) => key !== id)
}

const setTableData = (list: UmsMenuDynamic[]) => {
  menuTree.value = buildMenuTree(list)
  expandedRowKeys.value = []
  sortChangeMap.value = {}
}

const resetCreateForm = () => {
  Object.assign(createForm, createDefaultForm())
}

const openCreateDialog = () => {
  resetCreateForm()
  iconSearchKeyword.value = ''
  activeIconSet.value = 'all'
  remoteIconNames.value = []
  formMode.value = 'create'
  createDialogVisible.value = true
  loadIconPickerSets()
}

const fillFormByMenu = (menu: UmsMenuDynamic) => {
  Object.assign(createForm, {
    id: menu.id || 0,
    path: menu.path || '',
    name: menu.name || '',
    component: menu.component || '#',
    redirect: menu.redirect || '',
    parentId: menu.parentId ?? 0,
    soft: Number(menu.soft ?? 0),
    sign: menu.sign || '',
    status: getFormStatusValue(menu.status),
    label: menu.label || '',
    meta: {
      id: menu.meta?.id,
      menuId: menu.meta?.menuId,
      alwaysShow: !!menu.meta?.alwaysShow,
      icon: normalizeIconName(menu.meta?.icon),
      title: getMenuTitle(menu),
      status: getFormStatusValue(menu.meta?.status)
    }
  })
}

const openUpdateDialog = (record: Record<string, any>) => {
  openUpdateDialogByApi(record)
}

const openUpdateDialogByApi = async (record: Record<string, any>) => {
  submitLoading.value = true

  try {
    const res = await getMenuDynamicDetail(Number(record.id))
    const detail = normalizeResponseDetail(res)

    if (!detail) {
      message.warning('数据不存在')
      return
    }

    formMode.value = 'update'
    fillFormByMenu(detail)
    iconSearchKeyword.value = ''
    activeIconSet.value = 'all'
    remoteIconNames.value = []
    createDialogVisible.value = true
    loadIconPickerSets()
  } catch (error: any) {
    message.error('获取信息失败')
  } finally {
    submitLoading.value = false
  }
}

const confirmDeleteMenu = (record: Record<string, any>) => {
  AModal.confirm({
    title: '确认删除',
    content: `确定要删除菜单 "${getMenuTitle(record)}" 吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      await deleteMenuDynamic(Number(record.id))
      await refreshMenuDataAndRoutes()
      message.success('删除成功')
    }
  })
}

const validateCreateForm = () => {
  const path = createForm.path.trim()

  if (!createForm.meta.title.trim()) {
    message.warning('请输入菜单名称')
    return false
  }
  if (!path) {
    message.warning('请输入路由路径')
    return false
  }
  if (createForm.parentId === 0 && !path.startsWith('/')) {
    message.warning('根级菜单路由路径必须以 / 开头')
    return false
  }
  if (createForm.parentId !== 0 && path.startsWith('/')) {
    message.warning('子级菜单路由路径不能以 / 开头')
    return false
  }
  if (!createForm.name.trim()) {
    message.warning('请输入组件名称')
    return false
  }
  if (!createForm.component.trim()) {
    message.warning('请输入组件路径')
    return false
  }
  return true
}

const normalizeCreatePayload = (): UmsMenuDynamic => {
  const title = createForm.meta?.title?.trim() || ''

  return {
    ...createForm,
    path: createForm.path.trim(),
    name: createForm.name.trim(),
    component: createForm.component.trim(),
    redirect: createForm.redirect?.trim(),
    sign: createForm.sign?.trim(),
    status: createForm.status === 1,
    label: createForm.label?.trim() || title,
    meta: {
      ...createForm.meta,
      title,
      icon: normalizeIconName(createForm.meta?.icon?.trim()),
      status: createForm.meta.status === 1
    }
  }
}

const submitMenuForm = async () => {
  if (!validateCreateForm()) return

  submitLoading.value = true

  try {
    const payload = normalizeCreatePayload()

    if (formMode.value === 'update') {
      await updateMenuDynamic(createForm.id, payload)
      message.success('菜单已更新')
    } else {
      await createMenuDynamic(payload)
      message.success('菜单已创建')
    }

    createDialogVisible.value = false
    await refreshMenuDataAndRoutes()
  } catch (error: any) {
    message.error(error?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

const getMenuList = async () => {
  loading.value = true

  try {
    const res = await getMenuDynamicTreeList()
    const list = normalizeResponseList(res)
    setTableData(list)
  } catch (error: any) {
    message.error('列表加载失败')
  } finally {
    loading.value = false
  }
}

const getParentMenuTree = async () => {
  try {
    const res = await getMenuDynamicTreeList()
    const list = normalizeResponseList(res)
    parentMenuTree.value = buildMenuTree(list)
  } catch (error: any) {
    console.warn('获取父级结构失败', error)
  }
}

const searchMenuList = async () => {
  loading.value = true

  try {
    const res = await getMenuDynamicList({
      parentId: searchForm.parentId,
      keyword: searchForm.keyword.trim() || undefined
    })
    const list = normalizeResponseList(res)
    setTableData(list)
  } catch (error: any) {
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const resetSearchForm = () => {
  searchForm.parentId = 0
  searchForm.keyword = ''
  getMenuList()
}

onMounted(() => {
  getParentMenuTree()
  getMenuList()
})

onBeforeUnmount(() => {
  if (remoteIconSearchTimer) {
    clearTimeout(remoteIconSearchTimer)
  }
})
</script>

<style lang="less" scoped>
.menu-manage-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  width: 100%;
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
  flex: 0 1 280px;
}

.search-form-action {
  flex: 0 0 auto;
}

.search-control {
  width: 180px;
}

.mapping-tips {
  flex: 1 1 360px;
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

.table-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.menu-table {
  :deep(.ant-table) {
    background: var(--color-bg-2, #fff);
  }

  :deep(.ant-table-thead > tr > th) {
    background-color: var(--color-fill-2, #fafafa);
    color: var(--color-text-2, rgb(0 0 0 / 65%));
    font-weight: 600;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-2, #f0f0f0);
  }

  :deep(.ant-table-tbody > tr > td) {
    background-color: var(--color-bg-2, #fff);
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-1, #f0f0f0);
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background-color: var(--color-fill-1, #f5faff);
  }

  :deep(.ant-table-thead > tr > th.ant-table-cell-fix-right) {
    z-index: 5;
    background-color: var(--color-fill-2, #fafafa);
  }

  :deep(.ant-table-tbody > tr > td.ant-table-cell-fix-right) {
    z-index: 4;
    background-color: var(--color-bg-2, #fff);
  }

  :deep(.ant-table-tbody > tr:hover > td.ant-table-cell-fix-right) {
    background-color: var(--color-fill-1, #f5faff);
  }

  :deep(.ant-table-cell-fix-right-first::after) {
    box-shadow: inset -8px 0 8px -8px rgb(0 0 0 / 12%);
  }
}

.menu-title-text {
  font-weight: 500;
  color: var(--color-text-1);
}

.path-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--color-text-2);
  font-size: 13px;
}

.meta-title-text {
  color: var(--color-text-2);
}

.component-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.sort-input {
  width: 72px;
}

.icon-cell {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
  border-radius: 4px;
  background-color: var(--color-fill-1);

  .menu-icon {
    font-size: 18px;
    color: var(--color-text-1);
  }
}

.empty-text {
  color: var(--color-text-4);
}

.action-links {
  white-space: nowrap;
}

.text-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    color 0.2s,
    opacity 0.2s;

  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
  }

  &.view {
    color: #1677ff;
  }

  &.edit,
  &.primary {
    color: #13c2c2;
  }

  &.danger {
    color: #ff4d4f;
  }

  &:hover {
    opacity: 0.82;
  }
}

/* Modal Styles */
.modern-modal {
  :deep(.ant-modal-content) {
    padding: 0;
    overflow: hidden;
    border-radius: 12px;
  }
  :deep(.ant-modal-header) {
    padding: 20px 24px;
    margin: 0;
    border-bottom: 1px solid var(--color-border-1);
    background: var(--color-bg-1);
  }
  :deep(.ant-modal-title) {
    font-weight: 600;
  }
  :deep(.ant-modal-body) {
    padding: 24px;
    background: var(--color-bg-1);
  }
  :deep(.ant-modal-footer) {
    padding: 16px 24px;
    margin: 0;
    border-top: 1px solid var(--color-border-1);
    background: var(--color-bg-2);
  }
}

.modern-form {
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
  }

  .col-span-2 {
    grid-column: span 2;
  }

  :deep(.ant-form-item-label > label) {
    color: var(--color-text-2);
    font-size: 13px;
  }
}

.menu-form-modal {
  :deep(.ant-modal) {
    max-width: calc(100vw - 32px);
  }

  :deep(.ant-modal-content) {
    display: flex;
    max-height: calc(100vh - 40px);
    flex-direction: column;
  }

  :deep(.ant-modal-header) {
    padding: 14px 24px;
  }

  :deep(.ant-modal-body) {
    flex: 1;
    min-height: 0;
    padding: 12px 24px 8px;
    overflow-y: auto;
  }

  :deep(.ant-modal-footer) {
    padding: 10px 24px;
  }

  .modern-form {
    .form-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0 18px;
    }

    .col-span-2 {
      grid-column: 1 / -1;
    }

    :deep(.ant-form-item) {
      margin-bottom: 10px;
    }

    :deep(.ant-form-item-label) {
      padding-bottom: 4px;
    }

    :deep(.ant-form-item-label > label) {
      height: 20px;
      font-size: 12px;
    }

    :deep(.ant-input),
    :deep(.ant-input-number),
    :deep(.ant-select-selector),
    :deep(.ant-input-affix-wrapper) {
      min-height: 32px;
    }
  }
}

.icon-picker-panel {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-1, #f0f0f0);
  border-radius: 6px;
  background: var(--color-bg-2, #fff);
}

.icon-search-input {
  width: 100%;
}

.icon-tabs {
  display: flex;
  margin-top: 8px;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border-1, #f0f0f0);
  gap: 16px;
}

.icon-tab {
  height: 28px;
  padding: 0;
  color: var(--color-text-2, rgb(0 0 0 / 65%));
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s,
    border-color 0.2s;

  &.is-active {
    color: #1677ff;
    border-bottom-color: #1677ff;
  }
}

.icon-grid {
  display: grid;
  max-height: 196px;
  margin-top: 8px;
  overflow-y: auto;
  border-top: 1px solid var(--color-border-1, #f0f0f0);
  border-left: 1px solid var(--color-border-1, #f0f0f0);
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.icon-grid-item {
  display: grid;
  min-width: 0;
  height: 64px;
  padding: 7px 8px;
  color: var(--color-text-2, rgb(0 0 0 / 65%));
  cursor: pointer;
  background: var(--color-bg-2, #fff);
  border: 0;
  border-right: 1px solid var(--color-border-1, #f0f0f0);
  border-bottom: 1px solid var(--color-border-1, #f0f0f0);
  grid-template-rows: 24px 18px;
  align-items: center;
  justify-items: center;
  gap: 4px;
  transition:
    color 0.2s,
    background-color 0.2s;

  span:last-child {
    display: block;
    width: 100%;
    overflow: hidden;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    text-overflow: ellipsis;
    overflow-wrap: anywhere;
    white-space: nowrap;
  }

  &:hover,
  &.is-active {
    color: #1677ff;
    background-color: #e6f4ff;
  }
}

.icon-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
  color: var(--color-text-4, #8c8c8c);
  text-align: center;
}

.selected-icon {
  display: flex;
  margin-top: 6px;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.selected-icon-preview {
  display: inline-flex;
  width: 28px;
  height: 28px;
  color: var(--color-text-1, rgb(0 0 0 / 88%));
  background: var(--color-fill-2, #fafafa);
  border-radius: 6px;
  align-items: center;
  justify-content: center;
}

.selected-icon-name {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-2, rgb(0 0 0 / 65%));
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-icon-clear {
  flex: none;
  padding: 0;
}

@media (width <= 1100px) {
  .menu-form-modal {
    .modern-form {
      .form-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }

  .icon-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-4);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  background: var(--color-fill-1);
  border-radius: 8px;

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &.col-span-2 {
      grid-column: span 2;
    }
  }

  .detail-label {
    font-size: 12px;
    color: var(--color-text-3);
  }

  .detail-value {
    font-size: 14px;
    color: var(--color-text-1);
    min-height: 22px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    &.success {
      background-color: rgb(var(--success-6));
    }
    &.error {
      background-color: rgb(var(--danger-6));
    }
    &.default {
      background-color: var(--color-text-4);
    }
  }
}

.detail-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text-3);
}
</style>
