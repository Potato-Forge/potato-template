<script setup lang="ts">
  import type { Component, Ref } from 'vue'
  import type { SidebarMenuButtonProps } from './SidebarMenuButtonChild.vue'
  import { reactiveOmit } from '@vueuse/core'
  import SidebarMenuButtonChild from './SidebarMenuButtonChild.vue'
  import { useSidebar } from './utils'
  import { ref } from 'vue'

  defineOptions({
    inheritAttrs: false,
  })

  const props = withDefaults(
    defineProps<
      SidebarMenuButtonProps & {
        tooltip?: string | Component
      }
    >(),
    {
      as: 'button',
      variant: 'default',
      size: 'default',
    },
  )

  let isMobile: Ref<boolean>, state: Ref<string>
  try {
    const sidebar = useSidebar()
    isMobile = sidebar.isMobile
    state = sidebar.state
  } catch {
    isMobile = ref(false)
    state = ref('collapsed')
  }

  const delegatedProps = reactiveOmit(props, 'tooltip')
</script>

<template>
  <SidebarMenuButtonChild v-if="!tooltip" v-bind="{ ...delegatedProps, ...$attrs }">
    <slot />
  </SidebarMenuButtonChild>

  <PfTooltip v-else placement="right" :disabled="state !== 'collapsed' || isMobile">
    <SidebarMenuButtonChild v-bind="{ ...delegatedProps, ...$attrs }">
      <slot />
    </SidebarMenuButtonChild>

    <template #content>
      <template v-if="typeof tooltip === 'string'">
        {{ tooltip }}
      </template>
      <component :is="tooltip" v-else />
    </template>
  </PfTooltip>
</template>
