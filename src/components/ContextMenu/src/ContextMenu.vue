<script setup lang="ts">
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue'
import { PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useDesign } from '@/hooks/web/useDesign'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { contextMenuSchema } from '../../../types/contextMenu'
const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('context-menu')

const { t } = useI18n()

const emit = defineEmits(['visibleChange'])

const props = defineProps({
  schema: {
    type: Array as PropType<contextMenuSchema[]>,
    default: () => []
  },
  trigger: {
    type: String as PropType<'click' | 'hover' | 'focus' | 'contextmenu'>,
    default: 'contextmenu'
  },
  placement: {
    type: String as PropType<'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'>,
    default: 'bottomLeft'
  },
  tagItem: {
    type: Object as PropType<RouteLocationNormalizedLoaded>,
    default: () => ({})
  }
})

const command = (item: contextMenuSchema) => {
  item.command && item.command(item)
}

const handleMenuClick = ({ key }: { key: string | number }) => {
  const item = props.schema[Number(key)]
  if (item) {
    command(item)
  }
  close()
}

const visibleChange = (visible: boolean) => {
  open.value = visible
  emit('visibleChange', visible, props.tagItem)
}

const open = ref(false)

const close = () => {
  open.value = false
}

const elDropdownMenuRef = ref<ComponentRef<typeof ADropdown>>()

defineExpose({
  close,
  elDropdownMenuRef,
  tagItem: props.tagItem
})
</script>

<template>
  <ADropdown
    ref="elDropdownMenuRef"
    :class="prefixCls"
    :open="open"
    :trigger="[trigger === 'focus' ? 'click' : trigger]"
    :placement="placement"
    @open-change="visibleChange"
    overlayClassName="v-context-menu-popper"
    :overlayStyle="{ width: '180px', minWidth: '180px' }"
  >
    <slot></slot>
    <template #overlay>
      <AMenu class="v-context-menu-list" :style="{ width: '180px', minWidth: '180px' }" @click="handleMenuClick">
        <AMenuItem v-for="(item, index) in schema" :key="index" class="v-context-menu-menu-item" :style="{ width: '180px', minWidth: '180px' }" :disabled="item.disabled">
          <span class="v-context-menu-item">
            <Icon :icon="item.icon" class="v-context-menu-item__icon" />
            <span class="v-context-menu-item__label">{{ t(item.label) }}</span>
          </span>
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>
</template>

<style lang="less">
.v-context-menu-popper {
  width: 180px !important;
  min-width: 180px !important;

  .v-context-menu-list,
  .ant-dropdown-menu {
    width: 180px !important;
    min-width: 180px !important;
  }

  .v-context-menu-menu-item,
  .ant-dropdown-menu-item {
    width: 180px !important;
    min-width: 180px !important;
    white-space: nowrap;
  }

  .ant-dropdown-menu-title-content {
    display: block;
    min-width: 0;
  }
}

.v-context-menu-item {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &__icon {
    display: inline-flex;
    width: 16px;
    min-width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  &__label {
    display: block;
    min-width: 0;
    overflow: hidden;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
