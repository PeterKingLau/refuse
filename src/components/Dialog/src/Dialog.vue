<script setup lang="ts">
import { Modal as AModal } from 'ant-design-vue'
import { propTypes } from '@/utils/propTypes'
import { computed, useAttrs, ref, unref, useSlots, watch, nextTick } from 'vue'
import { isNumber } from '@/utils/is'

const slots = useSlots()

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: propTypes.bool.def(false),
  title: propTypes.string.def('Dialog'),
  fullscreen: propTypes.bool.def(true),
  maxHeight: propTypes.oneOfType([String, Number]).def('500px')
})

const getBindValue = computed(() => {
  const delArr: string[] = ['fullscreen', 'title', 'maxHeight', 'modelValue']
  const attrs = useAttrs()
  const obj = { ...attrs, ...props }
  for (const key in obj) {
    if (delArr.indexOf(key) !== -1) {
      delete obj[key]
    }
  }
  return obj
})

const isFullscreen = ref(false)

const toggleFull = () => {
  isFullscreen.value = !unref(isFullscreen)
}

const dialogHeight = ref(isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight)

watch(
  () => isFullscreen.value,
  async (val: boolean) => {
    await nextTick()
    if (val) {
      const windowHeight = document.documentElement.offsetHeight
      dialogHeight.value = `${windowHeight - 55 - 60 - (slots.footer ? 63 : 0)}px`
    } else {
      dialogHeight.value = isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight
    }
  },
  {
    immediate: true
  }
)

const dialogStyle = computed(() => {
  console.log(unref(dialogHeight))
  return {
    height: unref(dialogHeight)
  }
})
</script>

<template>
  <AModal v-bind="getBindValue" :open="modelValue" :width="isFullscreen ? '100vw' : undefined" destroy-on-close :mask-closable="false" @update:open="emit('update:modelValue', $event)">
    <template #title>
      <div class="flex justify-between">
        <slot name="title">
          {{ title }}
        </slot>
        <Icon
          v-if="fullscreen"
          class="mr-18px cursor-pointer is-hover mt-2px z-10"
          :icon="isFullscreen ? 'zmdi:fullscreen-exit' : 'zmdi:fullscreen'"
          color="var(--app-color-info)"
          @click="toggleFull"
        />
      </div>
    </template>

    <div :style="dialogStyle" class="overflow-auto">
      <slot></slot>
    </div>

    <template v-if="slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </AModal>
</template>

<style lang="less">
.ant-modal-header {
  margin-right: 0 !important;
  border-bottom: 1px solid var(--tags-view-border-color);
}

.ant-modal-footer {
  border-top: 1px solid var(--tags-view-border-color);
}

.is-hover {
  &:hover {
    color: var(--app-color-primary) !important;
  }
}

.dark {
  .ant-modal-header {
    border-bottom: 1px solid var(--app-border-color);
  }

  .ant-modal-footer {
    border-top: 1px solid var(--app-border-color);
  }
}
</style>
