<script setup lang="ts">
import { ref, unref, computed, watch } from 'vue'
import { Input as AInput } from 'ant-design-vue'
import { propTypes } from '@/utils/propTypes'
import { useConfigGlobal } from '@/hooks/web/useConfigGlobal'
import { zxcvbn } from '@zxcvbn-ts/core'
import type { ZxcvbnResult } from '@zxcvbn-ts/core'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('input-password')

const props = defineProps({
  // 是否显示密码强度
  strength: propTypes.bool.def(false),
  modelValue: propTypes.string.def('')
})

watch(
  () => props.modelValue,
  (val: string) => {
    if (val === unref(valueRef)) return
    valueRef.value = val
  }
)

const { configGlobal } = useConfigGlobal()

const emit = defineEmits(['update:modelValue'])

// 设置 input 的 type 属性
const textType = ref<'password' | 'text'>('password')

const changeTextType = () => {
  textType.value = unref(textType) === 'text' ? 'password' : 'text'
}

// 输入框的值
const valueRef = ref(props.modelValue)

// 监听输入值变化
watch(
  () => valueRef.value,
  (val: string) => {
    emit('update:modelValue', val)
  }
)

// 获取密码强度
const getPasswordStrength = computed(() => {
  const value = unref(valueRef)
  const zxcvbnRef = zxcvbn(unref(valueRef)) as ZxcvbnResult
  return value ? zxcvbnRef.score : -1
})

const getIconName = computed(() => (unref(textType) === 'password' ? 'ant-design:eye-invisible-outlined' : 'ant-design:eye-outlined'))
</script>

<template>
  <div :class="[prefixCls, `${prefixCls}--${configGlobal?.size}`]">
    <AInput v-bind="$attrs" v-model:value="valueRef" :type="textType">
      <template #suffix>
        <Icon class="cursor-pointer" :icon="getIconName" @click="changeTextType" />
      </template>
    </AInput>
    <div v-if="strength" :class="`${prefixCls}__bar`" class="relative h-6px mt-10px mb-6px mr-auto ml-auto">
      <div :class="`${prefixCls}__bar--fill`" :data-score="getPasswordStrength"></div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-input-password';

.@{prefix-cls} {
  :deep(.ant-input-clear-icon) {
    margin-left: 5px;
  }

  &__bar {
    background-color: var(--app-text-color-disabled);
    border-radius: var(--app-border-radius-base);

    &::before,
    &::after {
      position: absolute;
      z-index: 10;
      display: block;
      width: 20%;
      height: inherit;
      background-color: transparent;
      border-color: var(--app-color-white);
      border-style: solid;
      border-width: 0 5px 0 5px;
      content: '';
    }

    &::before {
      left: 20%;
    }

    &::after {
      right: 20%;
    }

    &--fill {
      position: absolute;
      width: 0;
      height: inherit;
      background-color: transparent;
      border-radius: inherit;
      transition:
        width 0.5s ease-in-out,
        background 0.25s;

      &[data-score='0'] {
        width: 20%;
        background-color: var(--app-color-danger);
      }

      &[data-score='1'] {
        width: 40%;
        background-color: var(--app-color-danger);
      }

      &[data-score='2'] {
        width: 60%;
        background-color: var(--app-color-warning);
      }

      &[data-score='3'] {
        width: 80%;
        background-color: var(--app-color-success);
      }

      &[data-score='4'] {
        width: 100%;
        background-color: var(--app-color-success);
      }
    }
  }

  &--mini > &__bar {
    border-radius: var(--app-border-radius-small);
  }
}
</style>
