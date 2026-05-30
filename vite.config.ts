import { resolve } from 'path'
import { loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import VueJsx from '@vitejs/plugin-vue-jsx'
import EslintPlugin from 'vite-plugin-eslint'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { createHtmlPlugin } from 'vite-plugin-html'
import VueMarcos from 'unplugin-vue-macros/vite'

// https://vitejs.dev/config/
const root = process.cwd()

function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  let env = {} as any
  const isBuild = command === 'build'
  if (!isBuild) {
    env = loadEnv(process.argv[3] === '--mode' ? process.argv[4] : process.argv[3], root)
  } else {
    env = loadEnv(mode, root)
  }

  const isProductionBuild = isBuild && mode === 'pro'
  const shouldUseTerser = isProductionBuild || env.VITE_BUILD_OBFUSCATE === 'true'
  const shouldDropConsole = env.VITE_DROP_CONSOLE === 'true'

  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      Vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'iconify-icon'
          }
        }
      }),
      VueJsx(),
      WindiCSS(),
      ...(!isBuild
        ? [
            EslintPlugin({
              cache: false,
              include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx'] // 检查的文件
            })
          ]
        : []),
      VueI18n({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__dirname, 'src/locales/**')]
      }),
      createSvgIconsPlugin({
        iconDirs: [pathResolve('src/assets/svgs')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: true
      }),
      VueMarcos({
        betterDefine: {
          exclude: /src\/views\/video\/components\/Cvideo\.vue/
        }
      }),
      createHtmlPlugin({
        inject: {
          data: {
            title: env.VITE_APP_TITLE,
            injectScript: `<script src="./inject.js"></script>`
          }
        }
      })
    ],

    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/variables.module.less";',
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css'],
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
        },
        {
          find: /\@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },
    build: {
      target: 'es2018',
      minify: shouldUseTerser ? 'terser' : 'esbuild',
      outDir: env.VITE_OUT_DIR || 'dist',
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      sourcemap: env.VITE_SOURCEMAP === 'true' ? 'inline' : false,
      // brotliSize: false,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'INVALID_ANNOTATION' && warning.message.includes('@vueuse/core') && warning.message.includes('#__PURE__')) {
            return
          }

          warn(warning)
        },
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
            antd: ['ant-design-vue'],
            charts: ['@antv/g2'],
            editor: ['@tiptap/vue-3', '@tiptap/starter-kit', '@tiptap/extension-link', '@tiptap/extension-image', '@tiptap/extension-placeholder'],
            media: ['video.js', '@videojs/http-streaming', 'qrcode']
          }
        }
      },
      terserOptions: {
        mangle: {
          safari10: true,
          toplevel: true
        },
        compress: {
          passes: 1,
          dead_code: true,
          unused: true,
          drop_debugger: env.VITE_DROP_DEBUGGER === 'true',
          drop_console: shouldDropConsole
        },
        format: {
          comments: false
        }
      }
    },
    server: {
      port: 9527,
      proxy: {
        // 选项写法
        '/api': {
          target: 'http://192.168.100.26:9527',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      hmr: {
        overlay: false
      },
      host: '0.0.0.0'
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'vue-types',
        'ant-design-vue',
        '@antv/g2',
        'iconify-icon',
        '@vueuse/core',
        'axios',
        'qs',
        'intro.js',
        'qrcode',
        '@tiptap/vue-3',
        '@tiptap/starter-kit',
        '@tiptap/extension-link',
        '@tiptap/extension-image',
        '@tiptap/extension-placeholder'
      ]
    }
  }
}
