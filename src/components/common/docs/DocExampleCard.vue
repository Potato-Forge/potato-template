<script setup lang="ts">
import type { Component } from 'vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import DocCodeBlock from './DocCodeBlock.vue'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    tip: string
    code: string
    language?: string
    demo: Component
    defaultOpen?: boolean
  }>(),
  {
    language: 'vue',
    defaultOpen: false,
  },
)
</script>

<template>
  <Collapsible v-slot="{ open }" :default-open="defaultOpen" class="rounded-2xl border border-border bg-card">
    <div class="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-2">
        <pf-text as="h4" class="mb-0">{{ title }}</pf-text>
        <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ description }}</pf-text>
        <div class="rounded-xl border border-tip/35 bg-tip/10 px-3 py-2 text-sm text-tip">
          {{ tip }}
        </div>
      </div>

      <CollapsibleTrigger as-child>
        <pf-button variant="outline" size="sm">
          {{ open ? '隐藏代码' : '查看代码' }}
        </pf-button>
      </CollapsibleTrigger>
    </div>

    <div class="px-5 py-5">
      <div class="rounded-2xl border border-dashed border-border/80 bg-background px-4 py-4">
        <component :is="demo" />
      </div>
    </div>

    <CollapsibleContent>
      <div class="px-5 pb-5">
        <DocCodeBlock :code="code" :language="language" title="示例代码" />
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>