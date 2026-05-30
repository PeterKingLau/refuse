import Editor from './src/Editor.vue'
import type { EditorOptions } from '@tiptap/vue-3'

type EditorUpdatePayload = Parameters<NonNullable<EditorOptions['onUpdate']>>[0]
type TiptapEditor = EditorUpdatePayload['editor']

export type RichTextEditor = TiptapEditor & {
  getHtml: () => string
}

export interface EditorExpose {
  getEditorRef: () => Promise<RichTextEditor>
}

export { Editor }
