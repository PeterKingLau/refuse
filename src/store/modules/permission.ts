import { defineStore } from 'pinia'
import { constantRouterMap } from '@/router'
import { generateRoutesFn2, flatMultiLevelRoutes, MyCustomRouteRaw } from '@/utils/routerHelper'
import { store } from '../index'
import { cloneDeep } from 'lodash-es'
import { RouteMeta } from 'vue-router'

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  isAddRouters: boolean
  menuTabRouters: AppRouteRecordRaw[]
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    isAddRouters: false,
    menuTabRouters: []
  }),
  getters: {
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    getAddRouters(): AppRouteRecordRaw[] {
      return flatMultiLevelRoutes(cloneDeep(this.addRouters))
    },
    getIsAddRouters(): boolean {
      return this.isAddRouters
    },
    getMenuTabRouters(): AppRouteRecordRaw[] {
      return this.menuTabRouters
    }
  },
  actions: {
    generateRoutes(routers?: MyCustomRouteRaw[]): Promise<unknown> {
      return new Promise<void>((resolve) => {
        let routerMap: AppRouteRecordRaw[] = []

        // const meta1: AppCustomRouteRecordRaw = {
        //   path: '/dashboard',
        //   name: 'Dashboard',
        //   redirect: '/dashboard/analysis',
        //   component: '#',
        //   meta: {
        //     alwaysShow: true,
        //     icon: 'ant-design:dashboard-filled',
        //     title: 'router.dashboard'
        //   },
        //   children: [
        //     {
        //       component: 'views/Dashboard/Analysis',
        //       name: 'Analysis',
        //       path: 'analysis',
        //       redirect: '',
        //       meta: {
        //         title: 'router.analysis',
        //         noCache: true
        //       }
        //     },
        //     {
        //       // component: 'views/Dashboard/Workplace',
        //       component: 'views/channel/channelManager',
        //       name: 'Workplace',
        //       path: 'workplace',
        //       redirect: '',
        //       meta: {
        //         noCache: true,
        //         title: 'router.workplace'
        //       }
        //     }
        //   ]
        // }

        // const temp1: AppCustomRouteRecordRaw[] = []
        // temp1.push(meta1)
        // routerMap = generateRoutesFn2(temp1)
        // console.log('dddsss')
        // console.log(routerMap)
        // if (type === 'admin') {
        //   // 模拟后端过滤菜单

        //   routerMap = generateRoutesFn2(routers as AppCustomRouteRecordRaw[])
        // } else if (type === 'test') {
        //   // 模拟前端过滤菜单
        //   routerMap = generateRoutesFn1(cloneDeep(asyncRouterMap), routers as string[])
        // } else {
        //   // 直接读取静态路由表
        //   routerMap = cloneDeep(asyncRouterMap)
        // }
        // if (type) routerMap = generateRoutesFn3(routers as MyCustomRouteRaw[])
        // routerMap = generateRoutesFn2(temp1)

        const app: AppCustomRouteRecordRaw[] = this.ConvertFormat(routers as MyCustomRouteRaw[])

        routerMap = generateRoutesFn2(app)

        // 动态路由，404一定要放到最后面
        this.addRouters = routerMap.concat([
          // {
          //   path: '/detail',
          //   component: () => import('@/views/Machine/Device/deviceDetail.vue'),
          //   name: 'Detail',
          //   meta: {
          //     hidden: true,
          //     title: '设备详情',
          //     noTagsView: true
          //   }
          // },

          {
            path: '/:path(.*)*',
            redirect: '/404',
            name: '404Page',
            meta: {
              hidden: true,
              breadcrumb: false
            }
          }
        ])
        // 渲染菜单的所有路由
        this.routers = cloneDeep(constantRouterMap).concat(routerMap)
        resolve()
      })
    },

    ConvertFormat(routers: MyCustomRouteRaw[]): AppCustomRouteRecordRaw[] {
      const records: AppCustomRouteRecordRaw[] = []
      for (const rec of routers) {
        const item: AppCustomRouteRecordRaw = {
          path: '',
          name: '',
          component: '',
          meta: undefined,
          redirect: ''
        }
        item.path = rec.path
        item.name = rec.name
        item.component = rec.component
        let redirect = ''
        if (rec.redirect != null) {
          redirect = rec.redirect
        }
        item.redirect = redirect
        const meta1: RouteMeta = {}
        meta1.alwaysShow = rec.meta.alwaysShow

        meta1.icon = rec.meta.icon
        meta1.title = rec.meta.title
        meta1.hidden = false
        item.meta = meta1

        if (rec.children && rec.children.length > 0) {
          const _chilren: AppCustomRouteRecordRaw[] = []
          for (const c1 of rec.children) {
            const _item: AppCustomRouteRecordRaw = {
              path: '',
              name: '',
              component: '',
              meta: undefined,
              redirect: ''
            }
            _item.path = c1.path
            _item.name = c1.name
            _item.component = c1.component
            let rr = ''
            if (c1.redirect != null && c1.redirect != undefined) {
              rr = c1.redirect
            }
            _item.redirect = rr
            const meta2: RouteMeta = {}

            meta2.title = c1.meta.title
            meta2.noCache = true
            _item.meta = meta2
            _chilren.push(_item)
          }
          item.children = _chilren
        }
        records.push(item)
      }
      return records
    },

    setIsAddRouters(state: boolean): void {
      this.isAddRouters = state
    },
    setMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.menuTabRouters = routers
    }
  }
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
