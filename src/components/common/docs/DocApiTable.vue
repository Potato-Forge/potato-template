<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export type DocApiRow = {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}

const props = withDefaults(
  defineProps<{
    title: string
    rows: DocApiRow[]
    defaultOpen?: boolean
  }>(),
  {
    defaultOpen: false,
  },
)
</script>

<template>
  <Collapsible v-slot="{ open }" :default-open="defaultOpen" class="rounded-2xl border border-border bg-background">
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <pf-text as="h4" class="mb-0">{{ title }}</pf-text>
        <pf-text as="p" class="mb-0 text-sm text-muted-foreground">
          {{ rows.length }} 项，按当前组件实现整理。
        </pf-text>
      </div>

      <CollapsibleTrigger as-child>
        <pf-button variant="outline" size="sm">
          {{ open ? '收起' : '展开' }}
        </pf-button>
      </CollapsibleTrigger>
    </div>

    <CollapsibleContent>
      <div class="overflow-x-auto border-t border-border">
        <table class="min-w-full border-collapse text-sm">
          <thead class="bg-muted/55 text-left text-muted-foreground">
            <tr>
              <th class="px-4 py-3 font-medium">名称</th>
              <th class="px-4 py-3 font-medium">类型</th>
              <th class="px-4 py-3 font-medium">默认值</th>
              <th class="px-4 py-3 font-medium">必填</th>
              <th class="px-4 py-3 font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.name" class="border-t border-border/70 align-top">
              <td class="pf-code-font px-4 py-3 text-foreground">{{ row.name }}</td>
              <td class="pf-code-font px-4 py-3 text-muted-foreground">{{ row.type }}</td>
              <td class="pf-code-font px-4 py-3 text-muted-foreground">{{ row.default || '-' }}</td>
              <td class="px-4 py-3 text-muted-foreground">{{ row.required ? '是' : '否' }}</td>
              <td class="px-4 py-3 text-muted-foreground">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>