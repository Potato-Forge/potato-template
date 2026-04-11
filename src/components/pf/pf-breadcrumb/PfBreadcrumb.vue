<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const props = defineProps<{
  list: any[]
  labelKey?: string
  hrefKey?: string
}>()
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in list" :key="item.id ?? item.name ?? index">
        <BreadcrumbItem>
          <BreadcrumbLink v-if="index < list.length - 1" :href="item[props.hrefKey || 'href']">
            {{ item[props.labelKey || 'name'] }}
          </BreadcrumbLink>
          <BreadcrumbPage v-else>
            {{ item[props.labelKey || 'name'] }}
          </BreadcrumbPage>
        </BreadcrumbItem>

        <BreadcrumbSeparator v-if="index < list.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
