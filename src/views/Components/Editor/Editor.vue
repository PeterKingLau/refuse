<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { Editor, type EditorExpose, type RichTextEditor } from '@/components/Editor'
import { useI18n } from '@/hooks/web/useI18n'
import { onBeforeUnmount, ref } from 'vue'

const { t } = useI18n()

const change = (editor: RichTextEditor) => {
  editor.getHtml()
}

const editorRef = ref<typeof Editor & EditorExpose>()

const defaultHtml = ref('')

const defaultHtmlTimer = window.setTimeout(() => {
  defaultHtml.value = '<p>hello <strong>world</strong></p>'
}, 3000)

onBeforeUnmount(() => {
  window.clearTimeout(defaultHtmlTimer)
})
</script>

<template>
  <ContentWrap :title="t('richText.richText')" :message="t('richText.richTextDes')">
    <Editor v-model="defaultHtml" ref="editorRef" @change="change" />
  </ContentWrap>
</template>
