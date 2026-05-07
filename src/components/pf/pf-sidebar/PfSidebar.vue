<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { SidebarItem } from '.'

const props = withDefaults(
  defineProps<{
    items?: SidebarItem[]
  }>(),
  {
    items: () => [],
  },
)

const router = useRouter()

const normalizeIconifyName = (icon?: string) => {
  if (!icon) return ''
  if (icon.includes(':')) return icon
  if (icon.startsWith('i-')) return ''
  return `tabler:${icon}`
}

const isHightlight = (item: SidebarItem) => {
  const isEndLeaf = !item.items || item.items.length === 0
  if (item.isActive) {
    const defaultActiveClass = 'text-primary font-semibold'
    const endLeafActiveClass = 'text-primary-foreground font-semibold bg-primary/80'
    return isEndLeaf ? endLeafActiveClass : defaultActiveClass
  }
  return ''
}

const navigateTo = async (url?: string) => {
  if (!url) return
  if (router.currentRoute.value.path === url) return
  await router.push(url)
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel class="h-12 text-primary text-lg font-bold whitespace-nowrap"
      >Potato Forge</SidebarGroupLabel
    >
    <SidebarMenu class="text-secondary-foreground">
      <template v-for="item in items" :key="item.title">
        <Collapsible
          v-if="item.items?.length"
          as-child
          :default-open="item.isActive"
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :class="isHightlight(item)" :tooltip="item.title">
                <Icon
                  v-if="normalizeIconifyName(item.icon)"
                  :icon="normalizeIconifyName(item.icon)"
                  class="text-base shrink-0"
                />
                <div v-else-if="item.icon" :class="item.icon" class="shrink-0" />
                <span>{{ item.title }}</span>
                <div
                  class="i-tabler-chevron-right ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                  <Collapsible
                    v-if="subItem.items?.length"
                    as-child
                    :default-open="subItem.isActive"
                    class="group/collapsible"
                  >
                    <SidebarMenuSubItem>
                      <CollapsibleTrigger as-child>
                        <SidebarMenuSubButton
                          :class="isHightlight(subItem)"
                          :tooltip="subItem.title"
                        >
                          <Icon
                            v-if="normalizeIconifyName(subItem.icon)"
                            :icon="normalizeIconifyName(subItem.icon)"
                            class="text-base shrink-0"
                          />
                          <div v-else-if="subItem.icon" :class="subItem.icon" class="shrink-0" />
                          <span>{{ subItem.title }}</span>
                          <div
                            class="i-tabler-chevron-right ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                          />
                        </SidebarMenuSubButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem
                            v-for="thirdItem in subItem.items"
                            :key="thirdItem.title"
                          >
                            <SidebarMenuSubButton
                              :class="isHightlight(thirdItem)"
                              @click="navigateTo(thirdItem.url)"
                            >
                              <Icon
                                v-if="normalizeIconifyName(thirdItem.icon)"
                                :icon="normalizeIconifyName(thirdItem.icon)"
                                class="text-base shrink-0"
                              />
                              <span
                                v-else-if="thirdItem.icon"
                                :class="thirdItem.icon"
                                class="shrink-0"
                              />
                              <span>{{ thirdItem.title }}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuSubItem>
                  </Collapsible>

                  <SidebarMenuItem v-else>
                    <SidebarMenuButton
                      :class="isHightlight(subItem)"
                      :tooltip="subItem.title"
                      @click="navigateTo(subItem.url)"
                    >
                      <Icon
                        v-if="normalizeIconifyName(subItem.icon)"
                        :icon="normalizeIconifyName(subItem.icon)"
                        class="text-base shrink-0"
                      />
                      <div v-else-if="subItem.icon" :class="subItem.icon" class="shrink-0" />
                      <span>{{ subItem.title }}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem v-else>
          <SidebarMenuButton
            :class="isHightlight(item)"
            :tooltip="item.title"
            @click="navigateTo(item.url)"
          >
            <Icon
              v-if="normalizeIconifyName(item.icon)"
              :icon="normalizeIconifyName(item.icon)"
              class="text-base shrink-0"
            />
            <div v-else-if="item.icon" :class="item.icon" class="shrink-0" />
            <span>{{ item.title }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
