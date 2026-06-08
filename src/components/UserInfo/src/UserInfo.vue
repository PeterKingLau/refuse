<script setup lang="ts">
import { getSelfApi, updatePasswordApi } from '@/api/permission'

import {
  Button as AButton,
  Dropdown as ADropdown,
  Form as AForm,
  FormItem as AFormItem,
  InputPassword as AInputPassword,
  Menu as AMenu,
  MenuItem as AMenuItem,
  Modal as AModal,
  message
} from 'ant-design-vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useCache } from '@/hooks/web/useCache'
import { resetRouter } from '@/router'
import { useRouter } from 'vue-router'
import { useDesign } from '@/hooks/web/useDesign'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { ref, Ref, onMounted } from 'vue'
import * as requestApi from '@/api/request'
import { Icon } from '@/components/Icon'

defineOptions({
  inheritAttrs: false
})

const tagsViewStore = useTagsViewStore()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const { t } = useI18n()

const { wsCache } = useCache()

const { replace } = useRouter()

let admin: Ref<any> = ref({})

onMounted(() => {
  getSelf()
})

const getSelf = () => {
  getSelfApi().then((res: any) => {
    admin.value = res.data
  })
}

const loginOut = () => {
  AModal.confirm({
    title: t('common.reminder'),
    content: t('common.loginOutMessage'),
    okText: t('common.ok'),
    cancelText: t('common.cancel'),
    onOk: async () => {
      wsCache.clear()
      // AxiosStore.setToken(' ')
      localStorage.removeItem('token')
      console.log('remove token')
      tagsViewStore.delAllViews()
      resetRouter() // 重置静态路由表
      replace('/login')
    }
  })
}

let dialogVisible = ref(false)

let changeData: Ref<any> = ref({})

const changePassword = () => {
  changeData.value.oldpwd = undefined
  changeData.value.newpwd1 = undefined
  changeData.value.newpwd2 = undefined
  dialogVisible.value = true
}

const doChange = () => {
  if (changeData.value.newpwd1 != changeData.value.newpwd2) {
    message.warning('两次输入的新密码不同')
    return
  }
  if (changeData.value.oldpwd == null || changeData.value.oldpwd.lenght == 0 || changeData.value.newpwd1 == null || changeData.value.newpwd1.lenght == 0) {
    message.warning('密码不能为空')
    return
  }

  let param = {
    username: admin.value.username,
    oldPassword: changeData.value.oldpwd,
    newPassword: changeData.value.newpwd1
  }
  console.log('updatePassword', param)
  updatePasswordApi(param).then((res: any) => {
    if (res.code == 200) {
      message.success('操作成功')
      dialogVisible.value = false
    }
  })
}
</script>

<template>
  <ADropdown :trigger="['click']" placement="bottomRight" :overlay-class-name="`${prefixCls}-dropdown`">
    <div v-bind="$attrs" :class="prefixCls" class="flex items-center">
      <img src="@/assets/imgs/avatar.jpg" alt="" class="user-avatar" />
      <span class="<lg:hidden user-name text-[var(--top-header-text-color)]">{{ admin.username }}</span>
      <Icon icon="ant-design:down-outlined" :size="12" class="<lg:hidden user-arrow text-[var(--top-header-text-color)]" />
    </div>
    <template #overlay>
      <AMenu>
        <AMenuItem key="change-password" class="user-menu-option" @click="changePassword">
          <span class="user-menu-item">
            <Icon icon="ant-design:lock-outlined" :size="15" class="user-menu-item__icon" />
            <span>修改密码</span>
          </span>
        </AMenuItem>
        <AMenuItem key="logout" class="user-menu-option user-menu-option--danger" @click="loginOut">
          <span class="user-menu-item user-menu-item--danger">
            <Icon icon="ant-design:poweroff-outlined" :size="15" class="user-menu-item__icon" />
            <span>{{ t('common.loginOut') }}</span>
          </span>
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>

  <AModal v-model:open="dialogVisible" title="修改密码" width="30%">
    <AForm :model="changeData" class="showColumn">
      <AFormItem label="旧密码">
        <AInputPassword v-model:value="changeData.oldpwd" placeholder="请输入旧密码" />
      </AFormItem>
      <AFormItem label="新密码">
        <AInputPassword v-model:value="changeData.newpwd1" placeholder="请输入新密码" />
      </AFormItem>
      <AFormItem label="确认密码">
        <AInputPassword v-model:value="changeData.newpwd2" placeholder="请再次输入新密码" />
      </AFormItem>
    </AForm>
    <template #footer>
      <span class="dialog-footer">
        <AButton @click="dialogVisible = false">取消</AButton>
        <AButton type="primary" @click="doChange">确定</AButton>
      </span>
    </template>
  </AModal>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-user-info';

.showColumn {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dialog-footer {
  display: inline-flex;
  gap: 8px;
}

.user-menu-item {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  &__icon {
    flex: none;
  }

  &--danger {
    color: #ff4d4f;
  }
}

.@{prefix-cls} {
  gap: 6px;
  line-height: 1;
  align-items: center;
}

.user-avatar {
  width: calc(var(--logo-height) - 25px);
  height: calc(var(--logo-height) - 25px);
  border-radius: 50%;
  flex: none;
}

.user-name {
  display: inline-flex;
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  align-items: center;
}

.user-arrow {
  display: inline-flex;
  width: 12px;
  height: 12px;
  line-height: 1;
  align-items: center;
  justify-content: center;
}
</style>

<style lang="less">
@prefix-cls: ~'@{namespace}-user-info';

.@{prefix-cls}-dropdown {
  .ant-dropdown-menu {
    min-width: 118px;
    padding: 4px;
    border-radius: 4px;
  }

  .ant-dropdown-menu-item.user-menu-option {
    height: 32px;
    padding: 0 10px;
    line-height: 32px;
    border-radius: 3px;
  }

  .ant-dropdown-menu-item.user-menu-option--danger {
    color: #ff4d4f;

    &:hover {
      color: #ff4d4f;
      background-color: #fff1f0;
    }
  }
}
</style>
