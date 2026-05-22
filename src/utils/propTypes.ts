import { createTypes, toValidableType, VueTypesInterface, VueTypeValidableDef } from 'vue-types'
import { CSSProperties } from 'vue'

// 自定义扩展vue-types
type StyleValue = CSSProperties | string

type PropTypes = VueTypesInterface & {
  readonly style: VueTypeValidableDef<StyleValue>
}

const propTypes = Object.assign(
  createTypes({
    func: undefined,
    bool: undefined,
    string: undefined,
    number: undefined,
    object: undefined,
    integer: undefined
  }),
  {
    get style() {
      return toValidableType<StyleValue>('style', {
        type: [String, Object] as any,
        default: undefined
      })
    }
  }
) as PropTypes

export { propTypes }
