<script setup lang="ts">
import { Image as AImage, ImagePreviewGroup as AImagePreviewGroup } from 'ant-design-vue'
import { computed, ref, watch, PropType } from 'vue'
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  urlList: {
    type: Array as PropType<string[]>,
    default: (): string[] => []
  },
  zIndex: propTypes.number.def(200),
  initialIndex: propTypes.number.def(0),
  infinite: propTypes.bool.def(true),
  hideOnClickModal: propTypes.bool.def(false),
  appendToBody: propTypes.bool.def(false),
  show: propTypes.bool.def(false)
})

const show = ref(props.show)
const current = ref(props.initialIndex)

const preview = computed(() => ({
  visible: show.value,
  current: current.value,
  zIndex: props.zIndex,
  maskClosable: props.hideOnClickModal,
  getContainer: props.appendToBody ? undefined : false,
  onVisibleChange: (visible: boolean) => {
    show.value = visible
  }
}))

watch(
  () => props.show,
  (visible) => {
    show.value = visible
    if (visible) {
      current.value = props.initialIndex
    }
  }
)

watch(
  () => props.initialIndex,
  (index) => {
    current.value = index
  }
)

const close = () => {
  show.value = false
}

defineExpose({
  close
})
</script>

<template>
  <AImagePreviewGroup :preview="preview">
    <span class="image-viewer-source">
      <AImage v-for="url in urlList" :key="url" :src="url" />
    </span>
  </AImagePreviewGroup>
</template>

<style lang="less" scoped>
.image-viewer-source {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
}
</style>
