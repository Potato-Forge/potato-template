<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface AppMenuItem {
  path: string
  title: string
  icon: string
  firstChildPath: string
}

const props = defineProps<{
  items: AppMenuItem[]
  activePath: string
}>()

const router = useRouter()

const handleClick = (item: AppMenuItem) => {
  router.push(item.firstChildPath)
}

const isMobile = () => window.innerWidth < 768

const normalizeIconifyName = (icon?: string) => {
  if (!icon) return ''
  if (icon.includes(':')) return icon
  if (icon.startsWith('i-')) return ''
  return `tabler:${icon}`
}

const tooltipOptions = (content: string) => ({
  content,
  placement: 'right' as const,
  theme: 'pf-tooltip-sidebar',
  touch: isMobile() ? ['hold', 300] : true,
  hideOnClick: isMobile() ? 'toggle' : true,
})
</script>

<template>
  <div class="w-full h-full flex flex-col items-center gap-2">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="flex justify-center items-center w-80% aspect-square rounded-lg transition-all duration-200 hover:(bg-primary/15)"
      :class="[
        item.path === activePath ? 'bg-primary/10 text-primary' : 'text-foreground',
        'active:scale-95',
      ]"
      v-pf-tooltip="tooltipOptions(item.title)"
      @click="handleClick(item)"
    >
      <Icon
        v-if="normalizeIconifyName(item.icon)"
        :icon="normalizeIconifyName(item.icon)"
        class="text-xl"
      />
      <div v-else-if="item.icon" :class="item.icon" class="text-xl"></div>
    </div>
  </div>
</template>

<style scoped></style>
