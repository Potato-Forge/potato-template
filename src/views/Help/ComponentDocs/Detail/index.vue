<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import DocApiTable from '@/components/common/docs/DocApiTable.vue'
import DocExampleCard from '@/components/common/docs/DocExampleCard.vue'
import { componentDocCategories, findComponentDocByPath } from '../componentDocs'

const route = useRoute()
const router = useRouter()

const doc = computed(() => findComponentDocByPath(route.path))

const categoryLabel = computed(() => {
  const category = componentDocCategories.find((item) => item.key === doc.value?.category)
  return category?.title ?? '组件文档'
})

const apiSections = computed(() => {
  if (!doc.value) return []

  return [
    { key: 'props', title: 'Props', rows: doc.value.api.props ?? [], defaultOpen: true },
    { key: 'slots', title: 'Slots', rows: doc.value.api.slots ?? [], defaultOpen: false },
    { key: 'emits', title: 'Emits', rows: doc.value.api.emits ?? [], defaultOpen: false },
    { key: 'expose', title: 'Expose', rows: doc.value.api.expose ?? [], defaultOpen: false },
  ].filter((item) => item.rows.length > 0)
})
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 gap-4">
    <template v-if="doc">
      <section class="rounded-2xl border border-border bg-card px-6 py-6">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <pf-text as="p" class="mb-0 text-sm text-primary">{{ categoryLabel }}</pf-text>
            <pf-text as="h1" class="text-3xl">{{ doc.title }}</pf-text>
            <pf-text as="p" class="mb-0 max-w-3xl text-muted-foreground">{{ doc.subtitle }}</pf-text>
            <pf-text as="p" class="mb-0 max-w-3xl text-foreground">{{ doc.summary }}</pf-text>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden rounded-full border px-4 py-2 text-sm font-medium text-primary md:flex">
              {{ doc.componentName }}
            </div>
            <pf-button variant="outline" @click="router.push('/help/components/overview')">返回目录</pf-button>
          </div>
        </div>
      </section>

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <PfCard class="gap-4 p-5">
          <pf-text as="h3" class="mb-0">适用场景</pf-text>
          <div class="space-y-3">
            <div v-for="item in doc.whenToUse" :key="item" class="rounded-2xl border border-border bg-background px-4 py-4">
              <pf-text as="p" class="mb-0 text-muted-foreground">{{ item }}</pf-text>
            </div>
          </div>
        </PfCard>

        <PfCard class="gap-4 p-5">
          <pf-text as="h3" class="mb-0">使用约束</pf-text>
          <div class="space-y-3">
            <div v-for="item in doc.constraints" :key="item" class="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-4 text-sm text-warning">
              {{ item }}
            </div>
          </div>
        </PfCard>
      </section>

      <section>
        <PfCard class="gap-4 p-5">
          <div>
            <pf-text as="h3" class="mb-1">API</pf-text>
            <pf-text as="p" class="mb-0 text-muted-foreground">
              这里只列出当前项目里最常用的输入面。遇到复杂扩展时，先回到组件源码核对实际行为。
            </pf-text>
          </div>

          <div class="space-y-3">
            <DocApiTable
              v-for="section in apiSections"
              :key="section.key"
              :title="section.title"
              :rows="section.rows"
              :default-open="section.defaultOpen"
            />
          </div>
        </PfCard>
      </section>

      <section>
        <PfCard class="gap-4 p-5">
          <div>
            <pf-text as="h3" class="mb-1">示例与演示</pf-text>
            <pf-text as="p" class="mb-0 text-muted-foreground">
              每个示例只覆盖一个明确目标，先保证你能复制最小用法，再根据业务场景扩展。
            </pf-text>
          </div>

          <div class="space-y-4">
            <DocExampleCard
              v-for="example in doc.examples"
              :key="example.id"
              :title="example.title"
              :description="example.description"
              :tip="example.tip"
              :code="example.code"
              :language="example.language"
              :demo="example.demo"
              :default-open="example.defaultOpen"
            />
          </div>
        </PfCard>
      </section>
    </template>

    <template v-else>
      <section class="rounded-2xl border border-border bg-card px-6 py-6">
        <pf-text as="h1" class="text-3xl">未找到组件文档</pf-text>
        <pf-text as="p" class="mb-0 mt-3 text-muted-foreground">
          当前路径还没有对应的组件文档数据。先回到目录页确认路由是否已接入，再补充文档定义。
        </pf-text>
      </section>
    </template>
  </PageLayout>
</template>