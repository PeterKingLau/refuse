<script setup lang="ts">
import { Descriptions as ADescriptions, DescriptionsItem as ADescriptionsItem, Tooltip as ATooltip } from 'ant-design-vue'
import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'
import { ref, unref, PropType, computed, useAttrs, useSlots } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { DescriptionsSchema } from '@/types/descriptions'

const appStore = useAppStore()

const mobile = computed(() => appStore.getMobile)

const attrs = useAttrs()

const slots = useSlots()

const props = defineProps({
  title: propTypes.string.def(''),
  message: propTypes.string.def(''),
  collapse: propTypes.bool.def(true),
  schema: {
    type: Array as PropType<DescriptionsSchema[]>,
    default: () => []
  },
  data: {
    type: Object as PropType<Recordable>,
    default: () => ({})
  }
})

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('descriptions')

const getDescriptionsProps = computed(() => {
  const { class: _class, style: _style, ...descriptionProps } = attrs

  return {
    bordered: true,
    column: unref(mobile) ? 1 : 3,
    layout: (unref(mobile) ? 'vertical' : 'horizontal') as 'vertical' | 'horizontal',
    ...descriptionProps
  }
})

const getBindItemValue = (item: DescriptionsSchema) => {
  const { field, ...descriptionItemProps } = item
  return descriptionItemProps
}

// 折叠
const show = ref(true)

const toggleClick = () => {
  if (props.collapse) {
    show.value = !unref(show)
  }
}
</script>

<template>
  <div :class="[prefixCls, 'bg-white dark:(bg-[var(--ant-color-bg-container)] border-[var(--ant-color-border)] border-1px)']">
    <div
      v-if="title"
      :class="[
        `${prefixCls}-header`,
        'h-50px flex justify-between items-center mb-10px border-bottom-1 border-solid border-[var(--tags-view-border-color)] px-10px cursor-pointer dark:border-[var(--ant-color-border)]'
      ]"
      @click="toggleClick"
    >
      <div :class="[`${prefixCls}-header__title`, 'relative font-18px font-bold ml-10px']">
        <div class="flex items-center">
          {{ title }}
          <ATooltip v-if="message" :title="message" placement="right">
            <Icon icon="ant-design:warning-outlined" class="ml-5px" />
          </ATooltip>
        </div>
      </div>
      <Icon v-if="collapse" :icon="show ? 'ant-design:down-outlined' : 'ant-design:up-outlined'" />
    </div>

    <Transition name="description-collapse">
      <div v-show="show" :class="[`${prefixCls}-content`, 'p-10px']">
        <ADescriptions v-bind="getDescriptionsProps">
          <template v-if="slots['extra']" #extra>
            <slot name="extra"></slot>
          </template>
          <ADescriptionsItem v-for="item in schema" :key="item.field" v-bind="getBindItemValue(item)">
            <template #label>
              <slot :name="`${item.field}-label`" :label="item.label">{{ item.label }}</slot>
            </template>

            <template #default>
              <slot :name="item.field" :row="data">{{ data[item.field] }}</slot>
            </template>
          </ADescriptionsItem>
        </ADescriptions>
      </div>
    </Transition>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-descriptions';

.@{prefix-cls}-header {
  &__title {
    &::after {
      position: absolute;
      top: 3px;
      left: -10px;
      width: 4px;
      height: 70%;
      background: #1677ff;
      content: '';
    }
  }
}

.@{prefix-cls}-content {
  :deep(.ant-descriptions-item-content) {
    min-width: 0;
    word-break: break-all;
  }
}

.description-collapse-enter-active,
.description-collapse-leave-active {
  overflow: hidden;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.description-collapse-enter-from,
.description-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
