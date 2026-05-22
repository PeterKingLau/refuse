/// <reference types="vite/client" />
/// <reference types="vite-plugin-svg-icons/client" />
/// <reference types="unplugin-vue-macros/macros-global" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:svg-icons-register'
declare module 'virtual:windi-devtools'

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASEPATH: string
  readonly VITE_BASE_PATH: string
  readonly VITE_DROP_DEBUGGER: string
  readonly VITE_DROP_CONSOLE: string
  readonly VITE_SOURCEMAP: string
  readonly VITE_OUT_DIR: string
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
