import { getMenuTreeApi } from '@/api/permission'
import router from '@/router'
import * as requestApi from '@/api/request'
import { useCache } from '@/hooks/web/useCache'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import type { RouteRecordRaw } from 'vue-router'
import type { MyCustomRouteRaw } from './routerHelper'

const { wsCache } = useCache()

let removeRouteList: Array<() => void> = []

const getRoutePath = (route?: AppRouteRecordRaw): string => {
  const redirect = route?.redirect

  if (typeof redirect === 'string') {
    return redirect
  }

  return route?.path || '/'
}

const isAvailableRoute = (path: string) => {
  const resolvedRoute = router.resolve(path)
  return resolvedRoute.matched.some((route) => route.name !== '404Page')
}

const isExternalPath = (path: string) => /^[a-z][a-z\d+\-.]*:\/\//i.test(path)

const normalizeTopLevelPath = (path: string) => {
  if (!path || path.startsWith('/') || isExternalPath(path)) {
    return path
  }

  return `/${path}`
}

const normalizeMenuRoutes = (routes: MyCustomRouteRaw[], isRoot = true): MyCustomRouteRaw[] => {
  return routes.map((route) => ({
    ...route,
    path: isRoot ? normalizeTopLevelPath(route.path) : route.path,
    children: route.children?.length ? normalizeMenuRoutes(route.children, false) : route.children
  }))
}

export const removeDynamicRoutes = () => {
  removeRouteList.forEach((removeRoute) => removeRoute())
  removeRouteList = []
}

export const fetchMenuRoutes = async () => {
  const res = await getMenuTreeApi()
  return normalizeMenuRoutes((res?.data || []) as MyCustomRouteRaw[])
}

export const refreshMenuRoutes = async (options: { keepCurrent?: boolean; targetPath?: string } = {}) => {
  const permissionStore = usePermissionStoreWithOut()
  const currentFullPath = options.targetPath || router.currentRoute.value.fullPath
  const menuRoutes = await fetchMenuRoutes()

  wsCache.set('roleRouters', menuRoutes)
  removeDynamicRoutes()
  permissionStore.setIsAddRouters(false)
  await permissionStore.generateRoutes(menuRoutes)

  permissionStore.getAddRouters.forEach((route) => {
    removeRouteList.push(router.addRoute(route as unknown as RouteRecordRaw))
  })

  permissionStore.setIsAddRouters(true)

  if (options.keepCurrent) {
    const nextPath = isAvailableRoute(currentFullPath) ? currentFullPath : getRoutePath(permissionStore.addRouters[0])
    if (nextPath !== router.currentRoute.value.fullPath) {
      await router.replace(nextPath)
    }
  }

  return {
    menuRoutes,
    firstRoutePath: getRoutePath(permissionStore.addRouters[0])
  }
}
