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

const isIconifyName = (icon?: string) => Boolean(icon && icon.includes(':'))

const isHightlight = (item: SidebarItem) => {
  const isEndLeaf = !item.items || item.items.length === 0
  if (item.isActive) {
    const defaultActiveClass = 'text-primary font-semibold'
    const endLeafActiveClass = 'text-primary-foreground font-semibold bg-primary/80'
    return isEndLeaf ? endLeafActiveClass : defaultActiveClass
  }
  return ''
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
                  v-if="isIconifyName(item.icon)"
                  :icon="item.icon!"
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
                            v-if="isIconifyName(subItem.icon)"
                            :icon="subItem.icon!"
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
                            <SidebarMenuSubButton :class="isHightlight(thirdItem)" as-child>
                              <router-link :to="thirdItem.url || '/'">
                                <Icon
                                  v-if="isIconifyName(thirdItem.icon)"
                                  :icon="thirdItem.icon!"
                                  class="text-base shrink-0"
                                />
                                <span
                                  v-else-if="thirdItem.icon"
                                  :class="thirdItem.icon"
                                  class="shrink-0"
                                />
                                <span>{{ thirdItem.title }}</span>
                              </router-link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuSubItem>
                  </Collapsible>

                  <SidebarMenuItem v-else>
                    <SidebarMenuButton
                      :class="isHightlight(subItem)"
                      as-child
                      :tooltip="subItem.title"
                    >
                      <router-link :to="subItem.url || '/'">
                        <Icon
                          v-if="isIconifyName(subItem.icon)"
                          :icon="subItem.icon!"
                          class="text-base shrink-0"
                        />
                        <div v-else-if="subItem.icon" :class="subItem.icon" class="shrink-0" />
                        <span>{{ subItem.title }}</span>
                      </router-link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem v-else>
          <SidebarMenuButton :class="isHightlight(item)" as-child :tooltip="item.title">
            <router-link :to="item.url || '/'">
              <Icon v-if="isIconifyName(item.icon)" :icon="item.icon!" class="text-base shrink-0" />
              <div v-else-if="item.icon" :class="item.icon" class="shrink-0" />
              <span>{{ item.title }}</span>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
