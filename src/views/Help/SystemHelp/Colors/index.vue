<script setup lang="ts">
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  designHeroBadgeStyle,
  statusRecipes,
  themePresetGuide,
  tokenGroups,
  tokenStyle,
  usageRules,
} from '@/views/Help/designGuidelines'
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 gap-4">
    <section class="rounded-2xl border border-border bg-card px-6 py-5">
      <div class="flex items-start justify-between gap-6">
        <div class="space-y-3">
          <pf-text as="h1" class="text-3xl">色彩规范</pf-text>
          <pf-text as="p" class="max-w-3xl text-muted-foreground mb-0">
            色彩页只说明默认主色、可选预设、语义 token 和状态色的使用边界。做页面时先选语义
            token，再决定具体组件样式。
          </pf-text>
        </div>

        <div
          class="hidden md:flex items-center rounded-full border px-4 py-2 text-sm font-medium"
          :style="designHeroBadgeStyle"
        >
          Color System
        </div>
      </div>
    </section>

    <section>
      <PfCard class="p-5 gap-4">
        <div>
          <pf-text as="h3" class="mb-1">主题主色</pf-text>
          <pf-text as="p" class="mb-0 text-muted-foreground">
            默认 primary 恢复为原有青绿色 #58B19F，对应的 light / dark primary、selected 和 ring
            已同步。其余预设只作为替换方案，不改变 token 语义。
          </pf-text>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="preset in themePresetGuide"
            :key="preset.key"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-3 flex items-center justify-between gap-3">
              <pf-text as="h4" class="mb-0">{{ preset.label }}</pf-text>
              <span
                class="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {{ preset.key }}
              </span>
            </div>
            <div
              class="mb-3 h-12 rounded-xl border border-border"
              :style="{ backgroundColor: preset.hex }"
            ></div>
            <pf-text as="p" class="mb-1 text-sm text-primary">{{ preset.role }}</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ preset.note }}</pf-text>
          </div>
        </div>
      </PfCard>
    </section>

    <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PfCard v-for="group in tokenGroups" :key="group.title" class="p-5 gap-4">
        <div class="space-y-1">
          <pf-text as="h3" class="mb-0">{{ group.title }}</pf-text>
          <pf-text as="p" class="mb-0 text-muted-foreground">{{ group.description }}</pf-text>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="token in group.tokens"
            :key="token.name"
            class="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-4"
          >
            <div
              class="h-12 w-20 shrink-0 rounded-xl border border-border shadow-sm"
              :style="tokenStyle(token.name)"
            ></div>
            <div class="min-w-0">
              <div class="font-mono text-sm text-foreground">{{ token.name }}</div>
              <div class="mt-1 text-sm text-muted-foreground">{{ token.usage }}</div>
            </div>
          </div>
        </div>
      </PfCard>
    </section>

    <section>
      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">状态色配方</pf-text>
        <div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div
            v-for="recipe in statusRecipes"
            :key="recipe.state"
            class="rounded-xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <div class="font-mono text-sm text-foreground">{{ recipe.state }}</div>
              <div class="text-xs text-muted-foreground">{{ recipe.level }}</div>
            </div>
            <div
              class="mb-2 rounded-md border border-border px-2 py-1 font-mono text-xs text-foreground"
            >
              {{ recipe.combo }}
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ recipe.note }}</pf-text>
          </div>
        </div>
      </PfCard>
    </section>

    <section>
      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">使用分类</pf-text>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="(rule, index) in usageRules"
            :key="rule.title"
            class="rounded-xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold"
              >
                {{ index + 1 }}
              </div>
              <pf-text as="h4" class="mb-0">{{ rule.title }}</pf-text>
            </div>
            <pf-text as="p" class="mb-0 text-muted-foreground">{{ rule.body }}</pf-text>
          </div>
        </div>
      </PfCard>
    </section>
  </PageLayout>
</template>

<style scoped></style>
