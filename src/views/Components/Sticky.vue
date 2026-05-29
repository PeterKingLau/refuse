<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Sticky } from '@/components/Sticky'
import { Affix as AAffix } from 'ant-design-vue'

const { t } = useI18n()
</script>

<template>
  <ContentWrap :title="t('stickyDemo.sticky')">
    <Sticky :offset="90">
      <div style="padding: 10px; background-color: lightblue"> Sticky 距离顶部90px </div>
    </Sticky>

    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>

    <AAffix :offset-top="150">
      <div style="padding: 10px; background-color: lightblue">Affix 距离顶部150px </div>
    </AAffix>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>

    <AAffix :offset-bottom="150">
      <div style="padding: 10px; background-color: lightblue">Affix 距离底部150px </div>
    </AAffix>

    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>

    <Sticky :offset="90" position="bottom">
      <div style="padding: 10px; background-color: lightblue"> Sticky 距离底部90px </div>
    </Sticky>
    <p style="margin: 80px">Content</p>
    <p style="margin: 80px">Content</p>
  </ContentWrap>
</template>
