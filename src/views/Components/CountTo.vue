<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { CountTo } from '@/components/CountTo'
import { Button as AButton, Col as ACol, Input as AInput, InputNumber as AInputNumber, Row as ARow } from 'ant-design-vue'
import { ref, unref } from 'vue'

const { t } = useI18n()

const countRef = ref<ComponentRef<typeof CountTo>>()

const startVal = ref(0)

const endVal = ref(1314512)

const duration = ref(3000)

const decimals = ref(0)

const separator = ref(',')

const prefix = ref('楼 ')

const suffix = ref(' rmb')

const autoplay = ref(false)

const start = () => {
  unref(countRef)?.start()
}

const pauseResume = () => {
  unref(countRef)?.pauseResume()
}
</script>

<template>
  <ContentWrap :title="t('countToDemo.countTo')" :message="t('countToDemo.countToDes')">
    <div class="text-center mb-40px">
      <CountTo
        ref="countRef"
        :start-val="startVal"
        :end-val="endVal"
        :duration="duration"
        :decimals="decimals"
        :separator="separator"
        :prefix="prefix"
        :suffix="suffix"
        :autoplay="autoplay"
        class="text-30px font-bold text-[var(--app-color-primary)]"
      />
    </div>
    <ARow :gutter="20" justify="space-between">
      <ACol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
        <div class="flex mb-20px items-center">
          <span class="min-w-90px text-right">{{ t('countToDemo.startVal') }}：</span>
          <AInputNumber v-model:value="startVal" :min="0" />
        </div>
      </ACol>
      <ACol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
        <div class="flex mb-20px items-center">
          <span class="min-w-90px text-right">{{ t('countToDemo.endVal') }}：</span>
          <AInputNumber v-model:value="endVal" :min="1" />
        </div>
      </ACol>
      <ACol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
        <div class="flex mb-20px items-center">
          <span class="min-w-90px text-right">{{ t('countToDemo.duration') }}：</span>
          <AInputNumber v-model:value="duration" :min="1000" />
        </div>
      </ACol>
      <ACol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
        <div class="flex mb-20px items-center">
          <span class="min-w-90px text-right">{{ t('countToDemo.separator') }}：</span>
          <AInput v-model:value="separator" />
        </div>
      </ACol>
      <ACol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
        <div class="flex mb-20px items-center">
          <span class="min-w-90px text-right">{{ t('countToDemo.prefix') }}：</span>
          <AInput v-model:value="prefix" />
        </div>
      </ACol>
      <ACol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
        <div class="flex mb-20px items-center">
          <span class="min-w-90px text-right">{{ t('countToDemo.suffix') }}：</span>
          <AInput v-model:value="suffix" />
        </div>
      </ACol>
      <ACol :span="24">
        <div class="text-center">
          <AButton type="primary" @click="start">{{ t('countToDemo.start') }}</AButton>
          <AButton @click="pauseResume"> {{ t('countToDemo.pause') }}/{{ t('countToDemo.resume') }} </AButton>
        </div>
      </ACol>
    </ARow>
  </ContentWrap>
</template>
