<template>
  <div class="main">
    <div class="title"><img src="../../assets/imgs/名称@2x.png" /></div>
    <div class="longWindow">
      <div class="item b">
        <img src="../../assets/imgs/yonghuming@2x.png" class="icon" alt="" />
        <input class="input" type="text" v-model="userName" />
      </div>

      <div class="item b">
        <img src="../../assets/imgs/ai-password@2x.png" class="icon" alt="" />
        <input class="input" type="password" v-model="password" />
      </div>
      <div class="item">
        <el-checkbox label="记住我" />
      </div>
      <div class="item btn" @click="signIn()"> 登 录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { ElCheckbox } from 'element-plus'
// import { useForm } from '@/hooks/web/useForm'
// import { loginApi, getTestRoleApi, getAdminRoleApi } from '@/api/login'

import { useCache } from '@/hooks/web/useCache'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
// import { UserType } from '@/api/login/types'

import { service } from '@/config/axios/service'
import { MyCustomRouteRaw } from '@/utils/routerHelper'

// const emit = defineEmits(['to-register'])
let userName = ref('')
let password = ref('')
const appStore = useAppStore()

const permissionStore = usePermissionStore()

const { currentRoute, addRoute, push } = useRouter()

const { wsCache } = useCache()

// const myRouter = useRouter()

// const { t } = useI18n()

// const rules = {
//   username: [required()],
//   password: [required()]
// }

// const schema = reactive<FormSchema[]>([
//   {
//     field: 'title',
//     colProps: {
//       span: 24
//     }
//   },
//   {
//     field: 'username',
//     label: t('login.username'),
//     value: 'admin',
//     component: 'Input',
//     colProps: {
//       span: 24
//     },
//     componentProps: {
//       placeholder: t('login.usernamePlaceholder')
//     }
//   },
//   {
//     field: 'password',
//     label: t('login.password'),
//     value: 'admin',
//     component: 'InputPassword',
//     colProps: {
//       span: 24
//     },
//     componentProps: {
//       style: {
//         width: '100%'
//       },
//       placeholder: t('login.passwordPlaceholder')
//     }
//   },
//   {
//     field: 'tool',
//     colProps: {
//       span: 24
//     }
//   },
//   {
//     field: 'login',
//     colProps: {
//       span: 24
//     }
//   },
//   {
//     field: 'other',
//     component: 'Divider',
//     label: t('login.otherLogin'),
//     componentProps: {
//       contentPosition: 'center'
//     }
//   },
//   {
//     field: 'otherIcon',
//     colProps: {
//       span: 24
//     }
//   }
// ])

// const iconSize = 30

// const remember = ref(false)

// const { elFormRef, methods } = useForm()

// onMounted(() => {
//   document.addEventListener('keydown', keyEvent)
// })

// let delay = true

// const keyEvent = (e: any) => {
//   let key = window.event ? e.keyCode : e.which
//   console.log('key', key)
//   if (key === 13) {
//     if (delay) {
//       delay = false
//       signIn()
//     }
//   } else {
//     return
//   }
// }

const loading = ref(false)

// const iconColor = '#999'

const redirect = ref<string>('')

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

// 登录
const signIn = async () => {
  //   const formRef = unref(elFormRef)
  //   await formRef?.validate(async (isValid) => {
  //     if (isValid) {
  //       loading.value = true
  //       const { getFormData } = methods
  //       const formData = await getFormData<UserType>()

  //       console.log(formData)
  let param = {
    userName: userName.value,
    password: password.value
  }

  try {
    service
      .post('/admin/simpleLogin', param)
      .then((res: any) => {
        //  AxiosStore.setToken(res.data?.tokenHead + ' ' + res.data?.token)
        console.log('res', res)

        if (res.code != 200) {
          return
        }
        localStorage.setItem('token', res.data.tokenHead + ' ' + res.data.token)
        wsCache.set(appStore.getUserInfo, res.data)
        getRole()
      })
      .catch((error) => {
        console.log(error)
      })

    // if (res) {
    //   wsCache.set(appStore.getUserInfo, res.data)
    //   // 是否使用动态路由

    //   if (appStore.getDynamicRouter) {
    //     getRole()
    //   } else {
    //     await permissionStore.generateRoutes('admin').catch(() => {})
    //     permissionStore.getAddRouters.forEach((route) => {
    //       addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
    //     })
    //     permissionStore.setIsAddRouters(true)

    //     push({ path: redirect.value || permissionStore.addRouters[0].path })
    //   }
    // }
  } finally {
    loading.value = false
  }
}

// 获取角色信息
const getRole = async () => {
  // const { getFormData } = methods
  // const formData = await getFormData<UserType>()
  // const params = {
  //   roleName: formData.username
  // }
  // // admin - 模拟后端过滤菜单
  // // test - 模拟前端过滤菜单
  const res = await service.get('/Permission/getMenuTree')

  //   formData.username === 'admin' ? await getAdminRoleApi(params) : await getTestRoleApi(params)
  if (res) {
    const { wsCache } = useCache()
    const routers = res.data || []
    wsCache.set('roleRouters', routers)

    // formData.username === 'admin'
    //   ? await permissionStore.generateRoutes('admin', routers).catch(() => {})
    //   : await permissionStore.generateRoutes('test', routers).catch(() => {})
    await permissionStore.generateRoutes(routers as MyCustomRouteRaw[])

    permissionStore.getAddRouters.forEach((route) => {
      addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
    })
    permissionStore.setIsAddRouters(true)

    push({ path: redirect.value || permissionStore.addRouters[0].path })
  }
}
</script>

<style lang="less" scoped>
.main {
  display: flex;
  width: 100%;
  height: 100vh;
  font-size: large;
  color: #ffff;
  background-attachment: fixed;
  background-image: url('../../assets/imgs/bg@2x.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .longWindow {
    display: flex;
    width: 560px;
    height: 470px;
    margin-top: 20px;
    background-image: url('../../assets/imgs/框@2x.png');
    background-repeat: no-repeat;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .b {
    display: flex;
    margin-top: 20px;
    line-height: 40px;
    background-color: #1c5ea2;
    border: 2px solid #1e8de6;
    border-radius: 6px;
    flex-direction: row;
    justify-items: flex-start;
  }

  .item {
    width: 260px;
    height: 40px;
  }

  .icon {
    width: 20px;
    height: 20px;
    margin-top: 10px;
    margin-left: 10px;
  }

  .input {
    width: 200px;
    height: 36px;
    margin-top: 0;
    margin-left: 10px;
    background-color: #1c5ea2;
    border: 0;
    outline: none;
  }

  .btn {
    line-height: 40px;
    text-align: center;
    background-color: #219cfc;
    border-radius: 6px;
  }
}
</style>
