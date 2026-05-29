<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

interface Props {
  videoUrl: string
  videoCover?: string
  width?: number
  height?: number
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'auto' | 'metadata' | 'none' | string
  showPlay?: boolean
  playWidth?: number
  zoom?: string
}

const props = withDefaults(defineProps<Props>(), {
  videoUrl: '',
  videoCover: '',
  width: 800,
  height: 450,
  autoplay: false,
  controls: true,
  loop: false,
  muted: false,
  preload: 'auto',
  showPlay: true,
  playWidth: 96,
  zoom: 'none'
})

const videoRef = ref<HTMLVideoElement | null>(null)
const player = ref<Player | null>(null)

const normalizedObjectFit = computed(() => {
  if (props.zoom === 'cotain') return 'contain'
  return props.zoom || 'none'
})

const wrapperStyle = computed<CSSProperties>(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  '--video-object-fit': normalizedObjectFit.value,
  '--video-play-size': `${props.playWidth}px`
}))

const getSourceType = (url: string) => {
  const cleanUrl = url.split('?')[0].toLowerCase()

  if (cleanUrl.endsWith('.m3u8')) return 'application/x-mpegURL'
  if (cleanUrl.endsWith('.mpd')) return 'application/dash+xml'
  if (cleanUrl.endsWith('.webm')) return 'video/webm'
  if (cleanUrl.endsWith('.ogv') || cleanUrl.endsWith('.ogg')) return 'video/ogg'
  return 'video/mp4'
}

const getPreload = () => {
  if (props.preload === 'metadata' || props.preload === 'none') return props.preload
  return 'auto'
}

const setSource = () => {
  if (!player.value) return

  if (!props.videoUrl) {
    player.value.src([])
    return
  }

  player.value.src({
    src: props.videoUrl,
    type: getSourceType(props.videoUrl)
  })
}

const syncPlayerOptions = () => {
  if (!player.value) return

  player.value.poster(props.videoCover || '')
  player.value.autoplay(props.autoplay)
  player.value.controls(props.controls)
  player.value.loop(props.loop)
  player.value.muted(props.autoplay || props.muted)
  player.value.preload(getPreload())
  player.value.width(props.width)
  player.value.height(props.height)

  if (props.showPlay) {
    player.value.addClass('has-big-play')
    player.value.removeClass('hide-big-play')
  } else {
    player.value.addClass('hide-big-play')
    player.value.removeClass('has-big-play')
  }
}

const initPlayer = async () => {
  await nextTick()
  if (!videoRef.value || player.value) return

  player.value = videojs(videoRef.value, {
    autoplay: props.autoplay,
    controls: props.controls,
    loop: props.loop,
    muted: props.autoplay || props.muted,
    preload: getPreload(),
    poster: props.videoCover,
    width: props.width,
    height: props.height,
    fluid: false,
    responsive: false,
    bigPlayButton: props.showPlay,
    controlBar: {
      pictureInPictureToggle: false
    },
    html5: {
      vhs: {
        overrideNative: true
      }
    }
  })

  syncPlayerOptions()
  setSource()
}

watch(
  () => props.videoUrl,
  () => {
    setSource()
  }
)

watch(
  () => [props.videoCover, props.autoplay, props.controls, props.loop, props.muted, props.preload, props.width, props.height, props.showPlay],
  () => {
    syncPlayerOptions()
  }
)

onMounted(() => {
  initPlayer()
})

onUnmounted(() => {
  if (player.value) {
    player.value.dispose()
    player.value = null
  }
})
</script>

<template>
  <div class="m-video" :style="wrapperStyle">
    <video ref="videoRef" class="video-js vjs-default-skin vjs-big-play-centered" playsinline> 您的浏览器不支持 video 标签。 </video>
  </div>
</template>

<style lang="less" scoped>
.m-video {
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  background: #000;

  :deep(.video-js) {
    width: 100%;
    height: 100%;
  }

  :deep(.vjs-tech) {
    object-fit: var(--video-object-fit);
  }

  :deep(.vjs-big-play-button) {
    width: var(--video-play-size);
    height: var(--video-play-size);
    margin-top: calc(var(--video-play-size) / -2);
    margin-left: calc(var(--video-play-size) / -2);
    line-height: var(--video-play-size);
    border-radius: 50%;
  }

  :deep(.hide-big-play .vjs-big-play-button) {
    display: none;
  }
}
</style>
