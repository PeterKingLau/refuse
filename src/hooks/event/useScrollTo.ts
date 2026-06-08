export type ScrollPosition = 'scrollLeft' | 'scrollTop'

export interface ScrollToParams {
  el: HTMLElement
  to: number
  position?: ScrollPosition
  duration?: number
  callback?: () => void
}

const easeInOutQuad = (progress: number) => {
  if (progress < 0.5) {
    return 2 * progress * progress
  }

  return 1 - Math.pow(-2 * progress + 2, 2) / 2
}

const getMaxScroll = (el: HTMLElement, position: ScrollPosition) => {
  if (position === 'scrollLeft') {
    return Math.max(0, el.scrollWidth - el.clientWidth)
  }

  return Math.max(0, el.scrollHeight - el.clientHeight)
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

export function useScrollTo({ el, position = 'scrollLeft', to, duration = 500, callback }: ScrollToParams) {
  let animationFrameId = 0
  let startTime = 0
  let startPosition = 0
  let targetPosition = 0
  let isActive = false

  const stop = () => {
    isActive = false

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
  }

  const scrollTo = (amount: number) => {
    el[position] = amount
  }

  const animateScroll = (timestamp: number) => {
    if (!isActive) return

    if (!startTime) {
      startTime = timestamp
    }

    const elapsed = timestamp - startTime
    const progress = duration <= 0 ? 1 : clamp(elapsed / duration, 0, 1)
    const nextPosition = startPosition + (targetPosition - startPosition) * easeInOutQuad(progress)

    scrollTo(nextPosition)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animateScroll)
      return
    }

    stop()
    callback?.()
  }

  const start = () => {
    stop()

    startPosition = el[position]
    targetPosition = clamp(to, 0, getMaxScroll(el, position))

    if (startPosition === targetPosition || duration <= 0) {
      scrollTo(targetPosition)
      callback?.()
      return
    }

    isActive = true
    startTime = 0
    animationFrameId = requestAnimationFrame(animateScroll)
  }

  return { start, stop }
}
