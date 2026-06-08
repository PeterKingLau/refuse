<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { Collapse } from '@/components/Collapse'
// import { LocaleDropdown } from '@/components/LocaleDropdown'
import { SizeDropdown } from '@/components/SizeDropdown'
import { UserInfo } from '@/components/UserInfo'
import { Screenfull } from '@/components/Screenfull'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Setting } from '@/components/Setting'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标，暂不启用
// const locale = computed(() => appStore.getLocale)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[prefixCls, 'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between bg-[var(--top-header-bg-color)]', 'dark:bg-[var(--app-bg-color)]']}
      >
        {layout.value !== 'top' ? (
          <div class="h-full flex items-center min-w-0">
            {hamburger.value && layout.value !== 'cutMenu' ? <Collapse class="hover-trigger" color="var(--top-header-text-color)"></Collapse> : undefined}
            {breadcrumb.value ? <Breadcrumb class="<md:hidden"></Breadcrumb> : undefined}
          </div>
        ) : undefined}
        <div class="tool-actions">
          {screenfull.value ? <Screenfull class="hover-trigger" color="var(--top-header-text-color)"></Screenfull> : undefined}
          {size.value ? <SizeDropdown class="hover-trigger" color="var(--top-header-text-color)"></SizeDropdown> : undefined}
          {/*
          {locale.value ? (
            <LocaleDropdown
              class="hover-trigger"
              color="var(--top-header-text-color)"
            ></LocaleDropdown>
          ) : undefined}
          */}
          <UserInfo class="hover-trigger"></UserInfo>
          <Setting class="hover-trigger" inline iconColor="var(--top-header-text-color)"></Setting>
        </div>
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-tool-header';

.@{prefix-cls} {
  transition: left var(--transition-time-02);

  :deep(.hover-trigger) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    padding: 0 9px;
    color: var(--top-header-text-color);
    border-radius: 6px;
    cursor: pointer;
    line-height: 1;
    transition:
      background-color 0.2s cubic-bezier(0, 0, 1, 1),
      color 0.2s cubic-bezier(0, 0, 1, 1);
  }

  :deep(.hover-trigger:hover) {
    background-color: var(--top-header-hover-color, rgba(0, 0, 0, 0.04));
  }

  :deep(.hover-trigger .v-icon),
  :deep(.hover-trigger iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .tool-actions {
    display: inline-flex;
    height: 100%;
    flex: none;
    gap: 6px;
    align-items: center;
  }
}
</style>
