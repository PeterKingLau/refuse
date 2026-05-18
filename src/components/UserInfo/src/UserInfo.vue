<script setup lang="ts">
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox, ElMessage } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { useCache } from '@/hooks/web/useCache'
import { resetRouter } from '@/router'
import { useRouter } from 'vue-router'
import { useDesign } from '@/hooks/web/useDesign'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { ref, Ref, onMounted } from 'vue'
import { PATH_URL, service } from '@/config/axios/service'

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
  service.get(PATH_URL + '/Permission/getSelf').then((res: any) => {
    admin.value = res.data
  })
}

const loginOut = () => {
  ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
    confirmButtonText: t('common.ok'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
    .then(async () => {
      wsCache.clear()
      // AxiosStore.setToken(' ')
      localStorage.removeItem('token')
      console.log('remove token')
      tagsViewStore.delAllViews()
      resetRouter() // 重置静态路由表
      replace('/login')
    })
    .catch(() => {})
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
    ElMessage('两次输入的新密码不同')
    return
  }
  if (
    changeData.value.oldpwd == null ||
    changeData.value.oldpwd.lenght == 0 ||
    changeData.value.newpwd1 == null ||
    changeData.value.newpwd1.lenght == 0
  ) {
    ElMessage('密码不能为空')
    return
  }

  let param = {
    username: admin.value.username,
    oldPassword: changeData.value.oldpwd,
    newPassword: changeData.value.newpwd1
  }
  console.log('updatePassword', param)
  service.post(PATH_URL + '/admin/updatePassword', param).then((res: any) => {
    if (res.code == 200) {
      ElMessage('操作成功')
      dialogVisible.value = false
    }
  })
}
</script>

<template>
  <ElDropdown :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <img
        src="@/assets/imgs/avatar.jpg"
        alt=""
        class="w-[calc(var(--logo-height)-25px)] rounded-[50%]"
      />
      <span class="<lg:hidden text-14px pl-[5px] text-[var(--top-header-text-color)]">{{
        admin.username
      }}</span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem divided>
          <div @click="changePassword">修改密码</div>
        </ElDropdownItem>
      </ElDropdownMenu>
      <ElDropdownMenu>
        <ElDropdownItem divided>
          <div @click="loginOut">{{ t('common.loginOut') }}</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>

  <el-dialog v-model="dialogVisible" title="修改密码" width="30%">
    <el-form :inline="true" :model="changeData" class="showColumn">
      <el-form-item label="旧密码">
        <el-input type="password" v-model="changeData.oldpwd" placeholder="请输入旧数据" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input type="password" v-model="changeData.newpwd1" placeholder="请输入新数据" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input type="password" v-model="changeData.newpwd2" placeholder="请再次输入新数据" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doChange"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.showColumn {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
