<template>
  <div class="main">
    <div class="title"><img src="../../assets/imgs/login-title@2x.png" /></div>

    <AForm class="longWindow" :model="loginForm" :rules="loginRules" @finish="signIn" @finish-failed="handleFinishFailed">
      <AFormItem name="userName" class="login-form-item">
        <div class="item b">
          <AInput v-model:value="loginForm.userName" class="login-input" :bordered="false" allow-clear placeholder="请输入用户名">
            <template #prefix>
              <img src="../../assets/imgs/yonghuming@2x.png" class="icon" alt="" />
            </template>
          </AInput>
        </div>
      </AFormItem>

      <AFormItem name="password" class="login-form-item">
        <div class="item b">
          <AInputPassword v-model:value="loginForm.password" class="login-input" :bordered="false" allow-clear placeholder="请输入密码">
            <template #prefix>
              <img src="../../assets/imgs/ai-password@2x.png" class="icon" alt="" />
            </template>
          </AInputPassword>
        </div>
      </AFormItem>

      <AFormItem name="remember" class="login-form-item login-remember-item">
        <div class="item">
          <ACheckbox v-model:checked="loginForm.remember">记住我</ACheckbox>
        </div>
      </AFormItem>

      <AButton class="item btn" type="primary" html-type="submit" :loading="loading">登录</AButton>
    </AForm>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { Button as AButton, Checkbox as ACheckbox, Form as AForm, FormItem as AFormItem, Input as AInput, InputPassword as AInputPassword, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { useCache } from '@/hooks/web/useCache'
import { useAppStore } from '@/store/modules/app'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { simpleLoginApi } from '@/api/login'
import { refreshMenuRoutes } from '@/utils/permissionRoutes'

const loginForm = reactive({
  userName: '',
  password: '',
  remember: false
})

const loginRules: Record<string, Rule[]> = {
  userName: [{ required: true, type: 'string', message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, type: 'string', message: '请输入密码', trigger: 'blur' }]
}

const appStore = useAppStore()
const { currentRoute, push } = useRouter()
const { wsCache } = useCache()
const loading = ref(false)
const redirect = ref<string>('')
const loginRememberKey = 'refuse-login-remember'

type LoginRememberInfo = {
  remember: boolean
  userName: string
}

const restoreRememberInfo = () => {
  try {
    const rememberInfo = localStorage.getItem(loginRememberKey)
    if (!rememberInfo) return

    const parsedInfo = JSON.parse(rememberInfo) as Partial<LoginRememberInfo>
    loginForm.remember = !!parsedInfo.remember
    loginForm.userName = parsedInfo.userName || ''
  } catch {
    localStorage.removeItem(loginRememberKey)
  }
}

const saveRememberInfo = () => {
  const trimmedUserName = loginForm.userName.trim()

  if (!loginForm.remember) {
    localStorage.removeItem(loginRememberKey)
    return
  }

  localStorage.setItem(
    loginRememberKey,
    JSON.stringify({
      remember: true,
      userName: trimmedUserName
    })
  )
}

const getLoginErrorMessage = (error: any) => {
  return error?.message || error?.data?.message || error?.response?.data?.message || '登录失败'
}

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

const handleFinishFailed = ({ errorFields }: { errorFields?: { errors?: string[] }[] }) => {
  const firstError = errorFields?.[0]?.errors?.[0]
  if (firstError) {
    message.error(firstError)
  }
}

const getRole = async () => {
  const { firstRoutePath } = await refreshMenuRoutes()
  push({ path: redirect.value || firstRoutePath })
}

const signIn = async () => {
  if (loading.value) return

  loginForm.userName = loginForm.userName.trim()
  loading.value = true

  try {
    const params = {
      userName: loginForm.userName,
      password: loginForm.password
    }

    const res: any = await simpleLoginApi(params)

    if (res.code !== 200) {
      message.error(res.message || '登录失败')
      return
    }

    localStorage.setItem('token', `${res.data.tokenHead} ${res.data.token}`)
    wsCache.set(appStore.getUserInfo, res.data)
    saveRememberInfo()
    await getRole()
    message.success('登录成功')
  } catch (error: any) {
    message.error(getLoginErrorMessage(error))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  restoreRememberInfo()
})
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
    background-image: url('../../assets/imgs/login-panel@2x.png');
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
    margin-right: 10px;
  }

  .login-input {
    width: 100%;
    height: 36px;
    color: #fff;
    background-color: transparent;

    :deep(.ant-input),
    :deep(.ant-input-password),
    :deep(.ant-input-affix-wrapper),
    :deep(.ant-input-password .ant-input) {
      color: #fff;
      background-color: transparent;
      box-shadow: none;
    }

    :deep(.ant-input-prefix) {
      margin-inline-end: 0;
    }

    :deep(.ant-input-password-icon) {
      color: rgb(255 255 255 / 75%);
    }

    :deep(.ant-input-clear-icon) {
      color: rgb(255 255 255 / 65%);

      &:hover {
        color: #fff;
      }
    }

    :deep(.ant-input::placeholder) {
      color: rgb(255 255 255 / 62%);
    }
  }

  .btn {
    display: flex;
    line-height: 1;
    text-align: center;
    background-color: #219cfc;
    border: 0;
    border-radius: 6px;
    align-items: center;
    justify-content: center;
  }

  :deep(.ant-checkbox-wrapper) {
    color: #fff;
  }

  :deep(.login-form-item) {
    margin-bottom: 12px;
  }

  :deep(.login-remember-item) {
    margin-bottom: 8px;
  }

  :deep(.ant-form-item-has-error .b) {
    border-color: #ff4d4f;
    box-shadow: 0 0 0 2px rgb(255 77 79 / 18%);
  }

  :deep(.ant-form-item-explain-error) {
    margin-top: 4px;
    color: #ffccc7;
    font-size: 12px;
    line-height: 18px;
  }
}
</style>
