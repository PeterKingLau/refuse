<script setup lang="ts">
import { Chart, type G2Spec } from '@antv/g2'
import { debounce } from 'lodash-es'
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, PropType, ref, unref, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { isString } from '@/utils/is'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({
  name: 'G2Chart'
})

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('g2-chart')

const appStore = useAppStore()

const props = defineProps({
  options: {
    type: Object as PropType<G2Spec>,
    required: true
  },
  width: {
    type: [Number, String],
    default: ''
  },
  height: {
    type: [Number, String],
    default: '500px'
  },
  autoFit: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  chartReady: [chart: G2ChartInstance]
  rendered: [chart: G2ChartInstance]
}>()

type G2ChartInstance = InstanceType<typeof Chart>

const isDark = computed(() => appStore.getIsDark)

const currentTheme = computed(() => props.theme || (unref(isDark) ? 'classicDark' : 'classic'))

const chartOptions = computed<G2Spec>(() => {
  return {
    ...props.options,
    autoFit: props.autoFit,
    theme: unref(currentTheme)
  } as G2Spec
})

const styles = computed(() => {
  const width = isString(props.width) ? props.width : `${props.width}px`
  const height = isString(props.height) ? props.height : `${props.height}px`

  return {
    width,
    height
  }
})

const elRef = ref<HTMLElement>()
const contentEl = ref<Element>()

let chartRef: Nullable<G2ChartInstance> = null

const renderChart = async () => {
  if (!chartRef) return

  chartRef.options(unref(chartOptions))
  await chartRef.render()
  emit('rendered', chartRef)
}

const initChart = async () => {
  await nextTick()
  const el = unref(elRef)
  if (!el || chartRef) return

  chartRef = new Chart({
    container: el,
    autoFit: props.autoFit
  })

  emit('chartReady', chartRef)
  await renderChart()
}

const resizeChart = async () => {
  if (!chartRef) return

  await chartRef.forceFit()
}

const resizeHandler = debounce(() => {
  void resizeChart()
}, 100)

const contentResizeHandler = (event: TransitionEvent) => {
  if (event.propertyName === 'width') {
    resizeHandler()
  }
}

watch(
  () => chartOptions.value,
  () => {
    void renderChart()
  },
  {
    deep: true
  }
)

onMounted(() => {
  void initChart()

  window.addEventListener('resize', resizeHandler)

  contentEl.value = document.getElementsByClassName(`${variables.namespace}-layout-content`)[0]
  unref(contentEl)?.addEventListener('transitionend', contentResizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  unref(contentEl)?.removeEventListener('transitionend', contentResizeHandler)
  resizeHandler.cancel()

  chartRef?.destroy()
  chartRef = null
})

onActivated(() => {
  void resizeChart()
})

defineExpose({
  getChart: () => chartRef,
  renderChart,
  resizeChart
})
</script>

<template>
  <div ref="elRef" :class="[$attrs.class, prefixCls]" :style="styles"></div>
</template>
