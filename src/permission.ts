import router from './router'
import { useAppStoreWithOut } from '@/store/modules/app'
import { useCache } from '@/hooks/web/useCache'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { refreshMenuRoutes } from '@/utils/permissionRoutes'

const permissionStore = usePermissionStoreWithOut()
const appStore = useAppStoreWithOut()
const { wsCache } = useCache()
const { start, done } = useNProgress()
const { loadStart, loadDone } = usePageLoading()

const whiteList = ['/login']

router.beforeEach(async (to) => {
  start()
  loadStart()

  if (wsCache.get(appStore.getUserInfo)) {
    if (to.path === '/login') {
      return { path: '/' }
    }

    if (permissionStore.getIsAddRouters) {
      return true
    }

    await refreshMenuRoutes()
    return { ...to, replace: true }
  }

  if (whiteList.includes(to.path)) {
    return true
  }

  return `/login?redirect=${to.path}`
})

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done()
  loadDone()
})
