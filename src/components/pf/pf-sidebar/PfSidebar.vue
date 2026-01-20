<script setup lang="ts">
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

  const items: SidebarItem[] = [
    {
      title: 'Home',
      url: '#',
      icon: 'i-tabler-home',
    },
    {
      title: 'Inbox',
      url: '#',
      icon: 'i-tabler-inbox',
    },
    {
      title: 'Calendar',
      url: '#',
      icon: 'i-tabler-calendar',
      isActive: true,
      items: [
        {
          title: 'Sub Calendar 1',
          url: '#',
          isActive: true,
          items: [
            {
              title: 'third Calendar 1',
              url: '#',
            },
            {
              title: 'third Calendar 2',
              url: '#',
              isActive: true,
            },
          ],
        },
        {
          title: 'Sub Calendar 2',
          url: '#',
        },
      ],
    },
    {
      title: 'Search',
      url: '#',
      icon: 'i-tabler-search',
    },
    {
      title: 'Settings',
      url: '#',
      icon: 'i-tabler-settings',
    },
  ]

  const isHightlight = (item: SidebarItem) => {
    const isEndLeaf = !item.items || item.items.length === 0
    if (item.isActive) {
      const defaultActiveClass = 'text-primary font-semibold'
      const endLeafActiveClass = 'text-primary-foreground font-semibold bg-primary/80'
      return isEndLeaf ? endLeafActiveClass : defaultActiveClass
    } else {
      return ''
    }
  }
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel class="h-12 text-primary text-lg font-bold whitespace-nowrap"
      >Potato Forge</SidebarGroupLabel
    >
    <SidebarMenu class="text-secondary-foreground">
      <template v-for="item in items" :key="item.title">
        <!-- First layer -->
        <Collapsible
          v-if="item.items?.length"
          as-child
          :default-open="item.isActive"
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <!-- First layer Button -->
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :class="isHightlight(item)" :tooltip="item.title">
                <div v-if="item.icon" :class="item.icon" class="shrink-0" />
                <span>{{ item.title }}</span>
                <div
                  class="i-tabler-chevron-right ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <!-- Secondd layer -->
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                  <!-- Third layer -->
                  <Collapsible
                    v-if="subItem.items?.length"
                    as-child
                    :default-open="subItem.isActive"
                    class="group/collapsible"
                  >
                    <SidebarMenuSubItem>
                      <CollapsibleTrigger as-child>
                        <!-- Second layer Button -->
                        <SidebarMenuSubButton
                          :class="isHightlight(subItem)"
                          :tooltip="subItem.title"
                        >
                          <div v-if="subItem.icon" :class="subItem.icon" class="shrink-0" />
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
                            <!-- Third layer Button -->
                            <SidebarMenuSubButton
                              :class="isHightlight(thirdItem)"
                              as-child
                              :is-active="thirdItem.isActive"
                            >
                              <a :href="thirdItem.url">
                                <span
                                  v-if="thirdItem.icon"
                                  :class="thirdItem.icon"
                                  class="shrink-0"
                                />
                                <span>{{ thirdItem.title }}</span>
                              </a>
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
                      :is-active="subItem.isActive"
                      :tooltip="subItem.title"
                    >
                      <a :href="subItem.url">
                        <div v-if="subItem.icon" :class="subItem.icon" class="shrink-0" />
                        <span>{{ subItem.title }}</span>
                      </a>
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
            as-child
            :is-active="item.isActive"
            :tooltip="item.title"
          >
            <a :href="item.url">
              <div v-if="item.icon" :class="item.icon" class="shrink-0" />
              <span>{{ item.title }}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
