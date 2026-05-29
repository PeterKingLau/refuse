<script setup lang="ts">
import { ref, watch, computed, unref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouterLinkProps, RouteMeta } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from '@/hooks/web/useI18n'
import { filterAffixTags } from './helper'
import { ContextMenu, ContextMenuExpose } from '@/components/ContextMenu'
import { useDesign } from '@/hooks/web/useDesign'
import { useTemplateRefsList } from '@vueuse/core'
import { useScrollTo } from '@/hooks/event/useScrollTo'
import { Icon } from '@/components/Icon'

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('tags-view')
const { t } = useI18n()
const { currentRoute, push, replace } = useRouter()
const permissionStore = usePermissionStore()
const routers = computed(() => permissionStore.getRouters)
const tagsViewStore = useTagsViewStore()
const visitedViews = computed(() => tagsViewStore.getVisitedViews)
const hasMultipleTags = computed(() => unref(visitedViews).length > 1)
const affixTagArr = ref<RouteLocationNormalizedLoaded[]>([])
const appStore = useAppStore()
const tagsViewIcon = computed(() => appStore.getTagsViewIcon)

const canCloseView = (view?: RouteLocationNormalizedLoaded) => {
  return unref(hasMultipleTags) && !view?.meta?.affix
}

const getTagIcon = (view: RouteLocationNormalizedLoaded) => {
  if (!unref(tagsViewIcon)) return ''

  const metaList = [view.meta, ...((view.matched || []).map((matched) => matched.meta).reverse() as RouteMeta[])]

  const matchedMeta = metaList.find((meta) => meta?.icon)
  return (matchedMeta?.icon as string) || ''
}

const initTags = () => {
  affixTagArr.value = filterAffixTags(unref(routers))
  for (const tag of unref(affixTagArr)) {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  }
}

const selectedTag = ref<RouteLocationNormalizedLoaded>()

const addTags = () => {
  const { name } = unref(currentRoute)
  if (name) {
    selectedTag.value = unref(currentRoute)
    tagsViewStore.addView(unref(currentRoute))
  }
  return false
}

const closeSelectedTag = (view: RouteLocationNormalizedLoaded) => {
  if (view?.meta?.affix) return
  tagsViewStore.delView(view)
  if (isActive(view)) {
    toLastView()
  }
}

const closeAllTags = () => {
  tagsViewStore.delAllViews()
  toLastView()
}

const closeOthersTags = () => {
  tagsViewStore.delOthersViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
}

const refreshSelectedTag = async (view?: RouteLocationNormalizedLoaded) => {
  if (!view) return
  tagsViewStore.delCachedView()
  const { path, query } = view
  await nextTick()
  replace({
    path: '/redirect' + path,
    query: query
  })
}

const closeLeftTags = () => {
  tagsViewStore.delLeftViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
}

const closeRightTags = () => {
  tagsViewStore.delRightViews(unref(selectedTag) as RouteLocationNormalizedLoaded)
}

const toLastView = () => {
  const visitedViewsList = tagsViewStore.getVisitedViews
  const latestView = visitedViewsList.slice(-1)[0]
  if (latestView) {
    push(latestView)
  } else {
    if (unref(currentRoute).path === permissionStore.getAddRouters[0].path || unref(currentRoute).path === permissionStore.getAddRouters[0].redirect) {
      addTags()
      return
    }
    push(permissionStore.getAddRouters[0].path)
  }
}

const moveToCurrentTag = async () => {
  await nextTick()
  for (const v of unref(visitedViews)) {
    if (v.fullPath === unref(currentRoute).path) {
      moveToTarget(v)
      if (v.fullPath !== unref(currentRoute).fullPath) {
        tagsViewStore.updateVisitedView(unref(currentRoute))
      }
      break
    }
  }
}

const tagLinksRefs = useTemplateRefsList<RouterLinkProps>()

const getScrollWrap = () => unref(scrollbarRef)

const getTagFullPath = (tag?: Nullable<RouterLinkProps>) => {
  return (tag?.to as RouteLocationNormalizedLoaded | undefined)?.fullPath
}

const moveToTarget = (currentTag: RouteLocationNormalizedLoaded) => {
  const wrap$ = getScrollWrap()
  if (!wrap$) return

  let firstTag: Nullable<RouterLinkProps> = null
  let lastTag: Nullable<RouterLinkProps> = null

  const tagList = unref(tagLinksRefs)
  if (tagList.length > 0) {
    firstTag = tagList[0]
    lastTag = tagList[tagList.length - 1]
  }
  if (getTagFullPath(firstTag) === currentTag.fullPath) {
    const { start } = useScrollTo({
      el: wrap$!,
      position: 'scrollLeft',
      to: 0,
      duration: 500
    })
    start()
  } else if (getTagFullPath(lastTag) === currentTag.fullPath) {
    const { start } = useScrollTo({
      el: wrap$!,
      position: 'scrollLeft',
      to: wrap$!.scrollWidth - wrap$!.offsetWidth,
      duration: 500
    })
    start()
  } else {
    const currentIndex: number = tagList.findIndex((item) => getTagFullPath(item) === currentTag.fullPath)
    if (currentIndex < 0) return

    const tgsRefs = document.getElementsByClassName(`${prefixCls}__item`)

    const prevTag = tgsRefs[currentIndex - 1] as HTMLElement
    const nextTag = tgsRefs[currentIndex + 1] as HTMLElement
    if (!prevTag || !nextTag) return

    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + 4
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - 4

    if (afterNextTagOffsetLeft > unref(scrollLeftNumber) + wrap$!.offsetWidth) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: 'scrollLeft',
        to: afterNextTagOffsetLeft - wrap$!.offsetWidth,
        duration: 500
      })
      start()
    } else if (beforePrevTagOffsetLeft < unref(scrollLeftNumber)) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: 'scrollLeft',
        to: beforePrevTagOffsetLeft,
        duration: 500
      })
      start()
    }
  }
}

const isActive = (route: RouteLocationNormalizedLoaded): boolean => {
  return route.path === unref(currentRoute).path
}

const itemRefs = useTemplateRefsList<ComponentRef<typeof ContextMenu & ContextMenuExpose>>()

const visibleChange = (visible: boolean, tagItem: RouteLocationNormalizedLoaded) => {
  if (visible) {
    for (const v of unref(itemRefs)) {
      if (tagItem.fullPath !== v.tagItem.fullPath) {
        v.close()
      }
    }
  }
}

const scrollbarRef = ref<HTMLElement>()

const scrollLeftNumber = ref(0)

const scroll = (event: Event) => {
  scrollLeftNumber.value = (event.target as HTMLElement).scrollLeft
}

const move = (to: number) => {
  const wrap$ = getScrollWrap()
  if (!wrap$) return

  const { start } = useScrollTo({
    el: wrap$,
    position: 'scrollLeft',
    to: unref(scrollLeftNumber) + to,
    duration: 500
  })
  start()
}

onMounted(() => {
  initTags()
  addTags()
})

watch(
  () => currentRoute.value,
  () => {
    addTags()
    moveToCurrentTag()
  }
)
</script>

<template>
  <div :id="prefixCls" :class="prefixCls" class="flex w-full relative items-center bg-[#f0f2f5] dark:bg-[#141414]">
    <span :class="`${prefixCls}__tool`" class="w-[var(--tags-view-height)] h-[var(--tags-view-height)] cursor-pointer" @click="move(-200)">
      <Icon icon="ant-design:double-left-outlined" :color="appStore.getIsDark ? 'var(--app-text-color-regular)' : '#595959'" />
    </span>
    <div class="overflow-hidden flex-1 h-full">
      <div ref="scrollbarRef" class="scroll-container h-full overflow-x-auto overflow-y-hidden whitespace-nowrap" @scroll="scroll">
        <div class="flex h-full tags-wrapper items-center">
          <ContextMenu
            :ref="itemRefs.set"
            :schema="[
              {
                icon: 'ant-design:sync-outlined',
                label: t('common.reload'),
                disabled: selectedTag?.fullPath !== item.fullPath,
                command: () => {
                  refreshSelectedTag(item)
                }
              },
              {
                icon: 'ant-design:close-outlined',
                label: t('common.closeTab'),
                disabled: !canCloseView(item),
                command: () => {
                  closeSelectedTag(item)
                }
              },
              {
                divided: true,
                icon: 'ant-design:vertical-right-outlined',
                label: t('common.closeTheLeftTab'),
                disabled: !!visitedViews?.length && (item.fullPath === visitedViews[0].fullPath || selectedTag?.fullPath !== item.fullPath),
                command: () => {
                  closeLeftTags()
                }
              },
              {
                icon: 'ant-design:vertical-left-outlined',
                label: t('common.closeTheRightTab'),
                disabled: !!visitedViews?.length && (item.fullPath === visitedViews[visitedViews.length - 1].fullPath || selectedTag?.fullPath !== item.fullPath),
                command: () => {
                  closeRightTags()
                }
              },
              {
                divided: true,
                icon: 'ant-design:tag-outlined',
                label: t('common.closeOther'),
                disabled: selectedTag?.fullPath !== item.fullPath,
                command: () => {
                  closeOthersTags()
                }
              },
              {
                icon: 'ant-design:line-outlined',
                label: t('common.closeAll'),
                command: () => {
                  closeAllTags()
                }
              }
            ]"
            v-for="item in visitedViews"
            :key="item.fullPath"
            :tag-item="item"
            :class="[
              `${prefixCls}__item`,
              item?.meta?.affix ? `${prefixCls}__item--affix` : '',
              {
                'is-active': isActive(item)
              }
            ]"
            @visible-change="visibleChange"
          >
            <div class="tag-content-wrap">
              <svg class="tag-bg tag-bg-left" width="10" height="100%">
                <path d="M 0 100 A 10 10 0 0 0 10 90 L 10 0 L 10 100 Z" />
              </svg>

              <svg class="tag-bg tag-bg-right" width="10" height="100%">
                <path d="M 10 100 A 10 10 0 0 1 0 90 L 0 0 L 0 100 Z" />
              </svg>

              <div class="tag-divider"></div>

              <router-link :ref="tagLinksRefs.set" :to="{ ...item }" custom v-slot="{ navigate }">
                <div @click="navigate" class="tag-inner">
                  <Icon v-if="getTagIcon(item)" :icon="getTagIcon(item)" :size="14" class="mr-[6px] tag-icon" />
                  <span class="tag-text">{{ t(item?.meta?.title as string) }}</span>
                  <div v-if="canCloseView(item)" :class="`${prefixCls}__item--close`" @click.prevent.stop="closeSelectedTag(item)">
                    <Icon icon="ant-design:close-outlined" :size="12" />
                  </div>
                </div>
              </router-link>
            </div>
          </ContextMenu>
        </div>
      </div>
    </div>
    <span :class="`${prefixCls}__tool`" class="w-[var(--tags-view-height)] h-[var(--tags-view-height)] cursor-pointer" @click="move(200)">
      <Icon icon="ant-design:double-right-outlined" :color="appStore.getIsDark ? 'var(--app-text-color-regular)' : '#595959'" />
    </span>
    <span :class="`${prefixCls}__tool`" class="w-[var(--tags-view-height)] h-[var(--tags-view-height)] cursor-pointer" @click="refreshSelectedTag(selectedTag)">
      <Icon icon="ant-design:reload-outlined" :color="appStore.getIsDark ? 'var(--app-text-color-regular)' : '#595959'" />
    </span>
    <ContextMenu
      trigger="click"
      placement="bottomRight"
      :schema="[
        {
          icon: 'ant-design:sync-outlined',
          label: t('common.reload'),
          command: () => {
            refreshSelectedTag(selectedTag)
          }
        },
        {
          icon: 'ant-design:close-outlined',
          label: t('common.closeTab'),
          disabled: !canCloseView(selectedTag),
          command: () => {
            if (selectedTag) {
              closeSelectedTag(selectedTag)
            }
          }
        },
        {
          divided: true,
          icon: 'ant-design:vertical-right-outlined',
          label: t('common.closeTheLeftTab'),
          disabled: !!visitedViews?.length && selectedTag?.fullPath === visitedViews[0].fullPath,
          command: () => {
            closeLeftTags()
          }
        },
        {
          icon: 'ant-design:vertical-left-outlined',
          label: t('common.closeTheRightTab'),
          disabled: !!visitedViews?.length && selectedTag?.fullPath === visitedViews[visitedViews.length - 1].fullPath,
          command: () => {
            closeRightTags()
          }
        },
        {
          divided: true,
          icon: 'ant-design:tag-outlined',
          label: t('common.closeOther'),
          command: () => {
            closeOthersTags()
          }
        },
        {
          icon: 'ant-design:line-outlined',
          label: t('common.closeAll'),
          command: () => {
            closeAllTags()
          }
        }
      ]"
    >
      <span :class="`${prefixCls}__tool`" class="w-[var(--tags-view-height)] h-[var(--tags-view-height)] cursor-pointer block">
        <Icon icon="ant-design:setting-outlined" :color="appStore.getIsDark ? 'var(--app-text-color-regular)' : '#595959'" />
      </span>
    </ContextMenu>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-tags-view';

.@{prefix-cls} {
  height: var(--tags-view-height);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);

  .scroll-container {
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tags-wrapper {
    padding-left: 10px;
  }

  &__tool {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #595959;
    background-color: transparent;
    transition: all 0.2s;
    z-index: 10;

    :deep(.v-icon),
    :deep(iconify-icon) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    &:hover {
      background-color: #e6f4ff;
      :deep(span) {
        color: var(--app-color-primary) !important;
      }
    }

    &:after {
      position: absolute;
      top: 10%;
      left: 0;
      width: 100%;
      height: 80%;
      border-left: 1px solid #d9d9d9;
      content: '';
    }
  }

  &__item {
    position: relative;
    height: 28px;
    min-width: 120px;
    max-width: 200px;
    flex-shrink: 0;
    cursor: pointer;
    margin-right: 0;
    z-index: 1;

    .tag-content-wrap {
      position: relative;
      height: 100%;
      display: flex;
      padding: 0;
      align-items: stretch;
    }

    .tag-bg {
      position: absolute;
      bottom: 0;
      display: none;
      fill: transparent;
      transition: fill 0.2s cubic-bezier(0, 0, 1, 1);
      z-index: 1;
    }

    .tag-bg-left {
      left: 0;
    }

    .tag-bg-right {
      right: 0;
    }

    .tag-inner {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 12px;
      line-height: 1;
      background-color: transparent;
      border-radius: 8px 8px 0 0;
      transition: background-color 0.2s cubic-bezier(0, 0, 1, 1);
      position: relative;
      z-index: 2;
    }

    .tag-icon {
      color: #8c8c8c;
      line-height: 1;
    }

    .tag-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      line-height: 1;
      color: #595959;
      user-select: none;
    }

    .tag-divider {
      position: absolute;
      right: -1px;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 12px;
      background-color: rgb(0 0 0 / 14%);
      z-index: 3;
      transition: opacity 0.2s;
    }

    &--close {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-left: 4px;
      opacity: 0;
      transition: all 0.2s;
      color: #8c8c8c;
      line-height: 1;

      :deep(.v-icon),
      :deep(iconify-icon) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      &:hover {
        background-color: #f0f0f0;
        color: #262626;
      }
    }

    &:last-child {
      .tag-divider {
        opacity: 0;
      }
    }

    &:not(.is-active):hover {
      z-index: 2;

      .tag-inner {
        background-color: #e6f4ff;
      }
      .tag-bg {
        fill: #e6f4ff;
      }
      .tag-divider {
        opacity: 0;
      }
      & + .@{prefix-cls}__item .tag-divider {
        opacity: 0;
      }
      .@{prefix-cls}__item--close {
        opacity: 1;
      }
    }

    &.is-active {
      z-index: 3;

      .tag-inner {
        background-color: #fff;
      }
      .tag-bg {
        fill: #fff;
      }
      .tag-divider {
        opacity: 0;
      }
      & + .@{prefix-cls}__item .tag-divider {
        opacity: 0;
      }
      .tag-text {
        color: var(--app-color-primary);
        font-weight: 500;
      }
      .tag-icon {
        color: var(--app-color-primary);
      }
      .@{prefix-cls}__item--close {
        opacity: 1;
      }
    }
  }
}

.dark {
  .@{prefix-cls} {
    box-shadow: 0 1px 0 #303030;

    &__tool {
      color: #a6a6a6;

      &:hover {
        background-color: #1f1f1f;
      }

      &:after {
        border-left: 1px solid #303030;
      }
    }

    &__item {
      .tag-divider {
        background-color: rgb(255 255 255 / 16%);
      }

      .tag-icon {
        color: #8c8c8c;
      }

      .tag-text {
        color: #a6a6a6;
      }

      &--close {
        color: #8c8c8c;

        &:hover {
          background-color: #262626;
          color: #d9d9d9;
        }
      }

      &:not(.is-active):hover {
        .tag-inner {
          background-color: #1f1f1f;
        }
        .tag-bg {
          fill: #1f1f1f;
        }
      }

      &.is-active {
        .tag-inner {
          background-color: #141414;
        }
        .tag-bg {
          fill: #141414;
        }
        .tag-text {
          color: var(--app-color-primary);
        }
        .tag-icon {
          color: var(--app-color-primary);
        }
      }
    }
  }
}
</style>
