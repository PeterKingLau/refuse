import type { Component } from 'vue'
import {
  AutoComplete as AAutoComplete,
  Cascader as ACascader,
  CheckboxGroup as ACheckboxGroup,
  DatePicker as ADatePicker,
  Divider as ADivider,
  Input as AInput,
  InputNumber as AInputNumber,
  RadioGroup as ARadioGroup,
  Rate as ARate,
  Select as ASelect,
  Slider as ASlider,
  Switch as ASwitch,
  TimePicker as ATimePicker,
  Transfer as ATransfer
} from 'ant-design-vue'
import { InputPassword } from '@/components/InputPassword'
import { Editor } from '@/components/Editor'
import { ComponentName } from '@/types/components'

const componentMap: Recordable<Component, ComponentName> = {
  Radio: ARadioGroup,
  Checkbox: ACheckboxGroup,
  CheckboxButton: ACheckboxGroup,
  Input: AInput,
  Autocomplete: AAutoComplete,
  InputNumber: AInputNumber,
  Select: ASelect,
  Cascader: ACascader,
  Switch: ASwitch,
  Slider: ASlider,
  TimePicker: ATimePicker,
  DatePicker: ADatePicker,
  Rate: ARate,
  ColorPicker: AInput,
  Transfer: ATransfer,
  Divider: ADivider,
  TimeSelect: ATimePicker,
  SelectV2: ASelect,
  RadioButton: ARadioGroup,
  InputPassword: InputPassword,
  Editor: Editor
}

export { componentMap }
