<template>
  <div class="black-list-page">
    <AForm v-if="showSearchForm" :model="searchFormData" layout="horizontal" class="search-form">
      <AFormItem label="OPENID" class="search-form-item">
        <AInput v-model:value="searchFormData.openId" placeholder="请输入 OPENID" />
      </AFormItem>

      <AFormItem label="手机号码" class="search-form-item">
        <AInput v-model:value="searchFormData.phone" placeholder="请输入手机号码" />
      </AFormItem>

      <AFormItem label="用户昵称" class="search-form-item">
        <AInput v-model:value="searchFormData.nickName" placeholder="请输入用户昵称" />
      </AFormItem>

      <AFormItem label="创建时间" class="search-form-item search-form-range">
        <ARangePicker v-model:value="searchFormData.time" show-time value-format="YYYY-MM-DD HH:mm:ss" class="w-full" start-placeholder="开始时间" end-placeholder="截止时间" />
      </AFormItem>

      <AFormItem class="search-form-actions">
        <ASpace>
          <AButton type="primary" class="icon-button" @click="onSearch" v-hasPermi="Permission.sec">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
            搜索
          </AButton>
          <AButton class="icon-button" @click="onReset">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
            重置
          </AButton>
        </ASpace>
      </AFormItem>
    </AForm>

    <div class="toolbar">
      <div></div>
      <div class="toolbar-right">
        <ATooltip :title="showSearchForm ? '隐藏搜索' : '显示搜索'">
          <AButton shape="circle" @click="showSearchForm = !showSearchForm">
            <template #icon>
              <Icon icon="ant-design:search-outlined" />
            </template>
          </AButton>
        </ATooltip>
        <ATooltip title="刷新">
          <AButton shape="circle" @click="onPageRest">
            <template #icon>
              <Icon icon="ant-design:reload-outlined" />
            </template>
          </AButton>
        </ATooltip>
      </div>
    </div>

    <ATable row-key="id" :columns="columns" :data-source="tableData" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'pic'">
          <img v-if="record.pic" :src="getImageURL(record.pic)" class="table-avatar" />
          <span v-else class="empty-text">暂无</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <AButton type="link" class="table-action action-recover" @click="handleDetail(record)" v-hasPermi="Permission.rev">
            <template #icon>
              <Icon icon="ant-design:rollback-outlined" />
            </template>
            还原
          </AButton>
        </template>
      </template>
    </ATable>

    <div class="pagination-wrap">
      <APagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :page-size-options="['5', '10', '15', '20']"
        :show-size-changer="true"
        :disabled="disabled"
        :total="total"
        :show-total="(totalCount) => `共 ${totalCount} 条`"
        show-quick-jumper
        @change="handlePageChange"
        @show-size-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  DatePicker as ADatePicker,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  Pagination as APagination,
  Space as ASpace,
  Table as ATable,
  Tooltip as ATooltip,
  message
} from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { PATH_URL, service } from '@/config/axios/service'
import { Icon } from '@/components/Icon'

const ARangePicker = ADatePicker.RangePicker

type DateRange = [string, string] | undefined

interface SearchStruct {
  openId: string
  phone: string
  nickName: string
  time: DateRange
}

interface BlackListStruct {
  [key: string]: any
  id: number
  pic?: string
  openId: string
  nickName?: string
  phone: string
  cardNo?: string
  createTime?: string
}

const reload = inject<() => void>('reload')

const onPageRest = () => {
  if (reload) {
    reload()
    return
  }
  getBlackList()
}

const Permission = ref({
  rev: 'mem_bak_rev',
  sec: 'mem_bak_sec'
})

const showSearchForm = ref(true)
const searchFormData = reactive<SearchStruct>({
  openId: '',
  phone: '',
  nickName: '',
  time: undefined
})
const tableData = ref<BlackListStruct[]>([])
const currentPage = ref(1)
const pageSize = ref(5)
const disabled = ref(false)
const total = ref(0)

const columns: TableColumnsType<BlackListStruct> = [
  { title: '用户头像', dataIndex: 'pic', key: 'pic', width: 120 },
  { title: 'OPENID', dataIndex: 'openId', key: 'openId', width: 180 },
  { title: '用户昵称', dataIndex: 'nickName', key: 'nickName', width: 160 },
  { title: '手机号码', dataIndex: 'phone', key: 'phone', width: 160 },
  { title: '绑定卡号', dataIndex: 'cardNo', key: 'cardNo', width: 160 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 200 },
  { title: '操作', key: 'action', width: 120 }
]

const getImageURL = (imageURL?: string) => {
  return imageURL ? PATH_URL + '/Common/downLoadPic/' + imageURL : ''
}

const getBlackList = () => {
  service
    .post(PATH_URL + '/memMember/getBlackList', {
      openId: searchFormData.openId,
      phone: searchFormData.phone,
      nickName: searchFormData.nickName,
      sTime: searchFormData.time?.[0],
      eTime: searchFormData.time?.[1],
      page: currentPage.value,
      size: pageSize.value
    })
    .then((res: any) => {
      tableData.value = res.data?.records || []
      total.value = res.data?.total || 0
    })
}

const onSearch = () => {
  currentPage.value = 1
  getBlackList()
}

const onReset = () => {
  searchFormData.nickName = ''
  searchFormData.openId = ''
  searchFormData.phone = ''
  searchFormData.time = undefined
  currentPage.value = 1
  getBlackList()
}

const handleDetail = (record: Record<string, any>) => {
  AModal.confirm({
    title: '提示',
    content: '确定要恢复这个黑名单吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await service.post(PATH_URL + '/memMember/recoveryBlacList', { id: record.id })
      message.success('操作成功')
      getBlackList()
    }
  })
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  getBlackList()
}

onMounted(() => {
  getBlackList()
})
</script>

<style lang="less" scoped>
.black-list-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: grid;
  padding: 16px;
  background-color: #fff;
  border-radius: 6px;
  gap: 14px 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  align-items: end;

  :deep(.ant-form-item) {
    margin-bottom: 0;
    align-items: center;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 72px;
    padding: 0 10px 0 0;
    line-height: 1;
    text-align: right;
  }

  :deep(.ant-form-item-label > label) {
    height: 32px;
    color: #262626;
    font-weight: 500;
  }

  :deep(.ant-form-item-control) {
    min-width: 0;
    flex: 1;
  }

  :deep(.ant-picker),
  :deep(.ant-input) {
    width: 100%;
  }
}

.search-form-item,
.search-form-actions {
  min-width: 0;
}

.search-form-range {
  grid-column: span 2;
}

.search-form-actions {
  :deep(.ant-form-item-control-input-content) {
    display: flex;
    align-items: center;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-right {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.icon-button,
.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

.table-action {
  height: 24px;
  padding: 0;
  gap: 4px;
}

.action-recover {
  color: #52c41a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
}

.table-avatar {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 50%;
}

.empty-text {
  color: #8c8c8c;
}
</style>
