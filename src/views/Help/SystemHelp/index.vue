<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  catppuccinMapping,
  designHeroBadgeStyle,
  designNavItems,
  designPrinciples,
} from '@/views/Help/designGuidelines'

const router = useRouter()
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 gap-4">
    <section class="rounded-2xl border border-border bg-card px-6 py-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-3">
          <pf-text as="h1" class="text-3xl">设计规范</pf-text>
          <pf-text as="p" class="max-w-3xl text-muted-foreground mb-0">
            这里集中说明当前主题的设计思路、使用要求和实现入口。做页面时先看总览，再按色彩、排版与空间、组件规范分别查阅。
          </pf-text>
        </div>

        <div
          class="hidden md:flex items-center rounded-full border px-4 py-2 text-sm font-medium"
          :style="designHeroBadgeStyle"
        >
          Design System
        </div>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_360px]">
      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">系统原则</pf-text>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="(item, index) in designPrinciples"
            :key="item.title"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-3 flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                {{ index + 1 }}
              </div>
              <pf-text as="h4" class="mb-0">{{ item.title }}</pf-text>
            </div>
            <pf-text as="p" class="mb-0 text-muted-foreground">{{ item.body }}</pf-text>
          </div>
        </div>
      </PfCard>

      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">Catppuccin 基线</pf-text>
        <div class="space-y-3">
          <div
            v-for="item in catppuccinMapping"
            :key="item.palette"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <pf-text as="h4" class="mb-1">{{ item.palette }}</pf-text>
            <pf-text as="p" class="mb-1 text-sm text-primary">{{ item.role }}</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.summary }}</pf-text>
          </div>
        </div>
      </PfCard>
    </section>

    <section>
      <PfCard class="p-5 gap-4">
        <div class="flex items-end justify-between gap-4">
          <div>
            <pf-text as="h3" class="mb-1">规范目录</pf-text>
            <pf-text as="p" class="mb-0 text-muted-foreground">
              设计规范按“先基础、后组件”的顺序组织，便于从 token 直接落到页面实现。
            </pf-text>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button
            v-for="item in designNavItems"
            :key="item.path"
            type="button"
            class="rounded-2xl border border-border bg-background px-4 py-4 text-left transition-colors hover:border-primary/35 hover:bg-muted"
            @click="router.push(item.path)"
          >
            <div class="mb-3 flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <div :class="item.icon" class="text-lg"></div>
              </div>
              <pf-text as="h4" class="mb-0">{{ item.title }}</pf-text>
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.description }}</pf-text>
          </button>
        </div>
      </PfCard>
    </section>
  </PageLayout>
</template>

<style scoped></style>
