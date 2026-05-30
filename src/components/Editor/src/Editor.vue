<script setup lang="ts">
import { Button as AButton, Space as ASpace } from 'ant-design-vue'
import { computed, nextTick, onBeforeUnmount, PropType, unref, watch } from 'vue'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor, type EditorOptions } from '@tiptap/vue-3'
import { propTypes } from '@/utils/propTypes'
import { isNumber } from '@/utils/is'

type EditorUpdatePayload = Parameters<NonNullable<EditorOptions['onUpdate']>>[0]
type TiptapEditor = EditorUpdatePayload['editor']

export type RichTextEditor = TiptapEditor & {
  getHtml: () => string
}

type EditorConfig = Partial<EditorOptions> & {
  placeholder?: string
  readOnly?: boolean
}

const props = defineProps({
  editorId: propTypes.string.def('tiptap-editor-1'),
  height: propTypes.oneOfType([Number, String]).def('500px'),
  editorConfig: {
    type: Object as PropType<EditorConfig>,
    default: () => undefined
  },
  modelValue: propTypes.string.def('')
})

const emit = defineEmits<{
  (event: 'change', editor: RichTextEditor): void
  (event: 'update:modelValue', value: string): void
}>()

const createEditorExpose = (editor: TiptapEditor): RichTextEditor => {
  const richTextEditor = editor as RichTextEditor
  richTextEditor.getHtml = () => richTextEditor.getHTML()
  return richTextEditor
}

const editor = useEditor({
  content: props.modelValue,
  editable: !props.editorConfig?.readOnly,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false
    }),
    Image,
    Placeholder.configure({
      placeholder: props.editorConfig?.placeholder || ''
    })
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-editor-content'
    }
  },
  onUpdate: ({ editor }) => {
    const nextHtml = editor.getHTML()
    emit('update:modelValue', nextHtml)
    emit('change', createEditorExpose(editor))
  },
  ...(props.editorConfig || {})
})

watch(
  () => props.modelValue,
  (value) => {
    const instance = unref(editor)
    if (!instance || value === instance.getHTML()) return
    ;(instance.commands.setContent as any)(value || '', false)
  }
)

watch(
  () => props.editorConfig?.readOnly,
  (readOnly) => {
    unref(editor)?.setEditable(!readOnly)
  }
)

const editorStyle = computed(() => {
  return {
    minHeight: isNumber(props.height) ? `${props.height}px` : props.height
  }
})

const isActive = (name: string, attrs?: Record<string, any>) => {
  return !!unref(editor)?.isActive(name, attrs)
}

const runCommand = (command: (editor: TiptapEditor) => void) => {
  const instance = unref(editor)
  if (!instance) return
  command(instance)
}

const setLink = () => {
  runCommand((instance) => {
    const previousUrl = instance.getAttributes('link').href
    const url = window.prompt('URL', previousUrl || '')

    if (url === null) return

    if (!url) {
      instance.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    instance.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  })
}

const setImage = () => {
  runCommand((instance) => {
    const url = window.prompt('Image URL')
    if (!url) return
    instance.chain().focus().setImage({ src: url }).run()
  })
}

onBeforeUnmount(() => {
  unref(editor)?.destroy()
})

const getEditorRef = async (): Promise<RichTextEditor> => {
  await nextTick()
  return createEditorExpose(unref(editor) as TiptapEditor)
}

defineExpose({
  getEditorRef
})
</script>

<template>
  <div :id="editorId" class="tiptap-editor">
    <div class="tiptap-toolbar">
      <ASpace :size="4" wrap>
        <AButton size="small" :class="{ 'is-active': isActive('bold') }" @click="runCommand((item) => item.chain().focus().toggleBold().run())">B</AButton>
        <AButton size="small" :class="{ 'is-active': isActive('italic') }" @click="runCommand((item) => item.chain().focus().toggleItalic().run())">I</AButton>
        <AButton size="small" :class="{ 'is-active': isActive('heading', { level: 1 }) }" @click="runCommand((item) => item.chain().focus().toggleHeading({ level: 1 }).run())"> H1 </AButton>
        <AButton size="small" :class="{ 'is-active': isActive('heading', { level: 2 }) }" @click="runCommand((item) => item.chain().focus().toggleHeading({ level: 2 }).run())"> H2 </AButton>
        <AButton size="small" :class="{ 'is-active': isActive('bulletList') }" @click="runCommand((item) => item.chain().focus().toggleBulletList().run())">UL</AButton>
        <AButton size="small" :class="{ 'is-active': isActive('orderedList') }" @click="runCommand((item) => item.chain().focus().toggleOrderedList().run())">OL</AButton>
        <AButton size="small" :class="{ 'is-active': isActive('blockquote') }" @click="runCommand((item) => item.chain().focus().toggleBlockquote().run())">“”</AButton>
        <AButton size="small" :class="{ 'is-active': isActive('link') }" @click="setLink">Link</AButton>
        <AButton size="small" @click="setImage">Image</AButton>
        <AButton size="small" @click="runCommand((item) => item.chain().focus().undo().run())">Undo</AButton>
        <AButton size="small" @click="runCommand((item) => item.chain().focus().redo().run())">Redo</AButton>
      </ASpace>
    </div>
    <EditorContent :editor="editor" class="tiptap-editor-body" :style="editorStyle" />
  </div>
</template>

<style lang="less" scoped>
.tiptap-editor {
  overflow: hidden;
  border: 1px solid var(--tags-view-border-color);
  border-radius: 4px;
  background: var(--app-content-bg-color);
}

.tiptap-toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--tags-view-border-color);
  background: var(--app-content-bg-color);

  .is-active {
    color: var(--app-color-primary);
    border-color: var(--app-color-primary);
  }
}

.tiptap-editor-body {
  overflow: auto;
}

:deep(.tiptap-editor-content) {
  min-height: inherit;
  padding: 12px;
  outline: none;

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  p.is-editor-empty:first-child::before {
    height: 0;
    color: var(--app-text-color-disabled);
    content: attr(data-placeholder);
    float: left;
    pointer-events: none;
  }

  img {
    max-width: 100%;
  }
}
</style>
