<script setup lang="ts">
import { computed, unref } from 'vue'
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue'
import { useLocaleStore } from '@/store/modules/locale'
import { useLocale } from '@/hooks/web/useLocale'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('locale-dropdown')

defineProps({
  color: propTypes.string.def('')
})

const localeStore = useLocaleStore()

const langMap = computed(() => localeStore.getLocaleMap)

const currentLang = computed(() => localeStore.getCurrentLocale)

const setLang = (lang: LocaleType) => {
  if (lang === unref(currentLang).lang) return
  // 需要重新加载页面让整个语言多初始化
  window.location.reload()
  localeStore.setCurrentLocale({
    lang
  })
  const { changeLocale } = useLocale()
  changeLocale(lang)
}

const handleMenuClick = ({ key }: { key: string | number }) => {
  setLang(key as LocaleType)
}
</script>

<template>
  <ADropdown :class="prefixCls" :trigger="['click']">
    <Icon :size="18" icon="ion:language-sharp" class="cursor-pointer" :class="$attrs.class" :color="color" />
    <template #overlay>
      <AMenu @click="handleMenuClick">
        <AMenuItem v-for="item in langMap" :key="item.lang">
          {{ item.name }}
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>
</template>
