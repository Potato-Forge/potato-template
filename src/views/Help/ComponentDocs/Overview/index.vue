<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import { componentDocCategories, componentDocs } from '../componentDocs'

const router = useRouter()

const groupedDocs = computed(() => {
  return componentDocCategories.map((category) => ({
    ...category,
    items: componentDocs.filter((item) => item.category === category.key),
  }))
})
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 gap-4">
    <section class="rounded-2xl border border-border bg-card px-6 py-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-3">
          <pf-text as="h1" class="text-3xl">组件文档</pf-text>
          <pf-text as="p" class="mb-0 max-w-3xl text-muted-foreground">
            这里集中整理 Pf 系列组件的使用边界、API 和最小示例。查阅顺序建议为：先看概述和约束，再看 API，最后对照演示和代码落地。
          </pf-text>
        </div>

        <div class="hidden items-center rounded-full border px-4 py-2 text-sm font-medium text-primary md:flex">
          Pf Components
        </div>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_360px]">
      <PfCard class="gap-4 p-5">
        <pf-text as="h3" class="mb-0">查阅建议</pf-text>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-2xl border border-border bg-background px-4 py-4">
            <pf-text as="h4" class="mb-1">先看边界</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">
              每个组件页都会先说明适用场景和不建议的用法，用来帮你决定是不是该选它。
            </pf-text>
          </div>
          <div class="rounded-2xl border border-border bg-background px-4 py-4">
            <pf-text as="h4" class="mb-1">再看 API</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">
              API 只收录当前项目里最常用、最容易写错的 prop、slot、emit 和 expose。
            </pf-text>
          </div>
          <div class="rounded-2xl border border-border bg-background px-4 py-4">
            <pf-text as="h4" class="mb-1">最后对照示例</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">
              示例只覆盖首版高频组合，目的是让你先跑通，不是把所有边界情况堆在一页里。
            </pf-text>
          </div>
          <div class="rounded-2xl border border-border bg-background px-4 py-4">
            <pf-text as="h4" class="mb-1">代码展示规范</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">
              代码块使用 Shiki，并跟随亮暗模式在 Catppuccin Latte 与 Macchiato 之间切换。
            </pf-text>
          </div>
        </div>
      </PfCard>

      <PfCard class="gap-4 p-5">
        <pf-text as="h3" class="mb-0">当前范围</pf-text>
        <div class="space-y-3 text-sm text-muted-foreground">
          <p class="mb-0">首批先覆盖 10 个高频组件，先把帮助页、文档组件、API 和示例链路跑通。</p>
          <p class="mb-0">后续新增组件时，按同一数据结构补目录和详情，不再单独开一套展示逻辑。</p>
        </div>
      </PfCard>
    </section>

    <section class="space-y-4">
      <PfCard v-for="group in groupedDocs" :key="group.key" class="gap-4 p-5">
        <div class="space-y-1">
          <pf-text as="h3" class="mb-0">{{ group.title }}</pf-text>
          <pf-text as="p" class="mb-0 text-muted-foreground">{{ group.description }}</pf-text>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="rounded-2xl border border-border bg-background px-4 py-4 text-left transition-colors hover:border-primary/35 hover:bg-muted"
            @click="router.push(item.path)"
          >
            <div class="mb-3 flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <div :class="item.icon" class="text-lg"></div>
              </div>
              <div>
                <pf-text as="h4" class="mb-0">{{ item.title }}</pf-text>
                <pf-text as="p" class="mb-0 text-xs text-primary">{{ item.componentName }}</pf-text>
              </div>
            </div>

            <pf-text as="p" class="mb-2 text-sm text-muted-foreground">{{ item.subtitle }}</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-foreground">{{ item.summary }}</pf-text>
          </button>
        </div>
      </PfCard>
    </section>
  </PageLayout>
</template>