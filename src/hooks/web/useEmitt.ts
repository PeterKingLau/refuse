import Emittery from 'emittery'
import { onBeforeUnmount } from 'vue'

type EventMap = Record<string, unknown>

interface Option<T = unknown> {
  name: string
  callback: (eventData: T) => void | Promise<void>
}

const emitter = new Emittery<EventMap>()

export const useEmitt = <T = unknown>(option?: Option<T>) => {
  if (option) {
    const unsubscribe = emitter.on(option.name, option.callback as (eventData: unknown) => void | Promise<void>)

    onBeforeUnmount(() => {
      unsubscribe()
    })
  }

  return {
    emitter
  }
}
