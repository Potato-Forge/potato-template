<script setup lang="ts">
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  buttonRules,
  cardRules,
  designHeroBadgeStyle,
  iconRules,
  toastRules,
} from '@/views/Help/designGuidelines'

const buttonPreviewMap = {
  'default / primary': { variant: 'default', type: 'primary', label: '保存设置' },
  outline: { variant: 'outline', type: 'primary', label: '取消修改' },
  secondary: { variant: 'secondary', type: 'primary', label: '批量导出' },
  ghost: { variant: 'ghost', type: 'primary', label: '更多操作' },
  link: { variant: 'link', type: 'primary', label: '查看详情' },
} satisfies Record<string, { variant: string, type: string, label: string }>

const toastPreviewMap = {
  success: 'border-success/30 bg-success/12 text-success',
  info: 'border-info/30 bg-info/12 text-info',
  tip: 'border-tip/30 bg-tip/12 text-tip',
  warning: 'border-warning/30 bg-warning/12 text-warning',
  risk: 'border-risk/30 bg-risk/12 text-risk',
  destructive: 'border-destructive/30 bg-destructive/12 text-destructive',
} satisfies Record<string, string>
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 gap-4">
    <section class="rounded-2xl border border-border bg-card px-6 py-5">
      <div class="flex items-start justify-between gap-6">
        <div class="space-y-3">
          <pf-text as="h1" class="text-3xl">组件规范</pf-text>
          <pf-text as="p" class="max-w-3xl text-muted-foreground mb-0">
            这一页只说明现有组件的推荐用法和禁用场景。规则直接对应 Button 变体、Toast 状态色、卡片层级和图标颜色 token。
          </pf-text>
        </div>

        <div
          class="hidden md:flex items-center rounded-full border px-4 py-2 text-sm font-medium"
          :style="designHeroBadgeStyle"
        >
          Component Rules
        </div>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">Button 使用边界</pf-text>
        <div class="space-y-3">
          <div
            v-for="item in buttonRules"
            :key="item.variant"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <pf-text as="h4" class="mb-0">{{ item.variant }}</pf-text>
              <span class="rounded-full border border-border px-2 py-0.5 text-xs text-primary">
                {{ item.emphasis }}
              </span>
            </div>
            <div class="mb-3 rounded-xl border border-dashed border-border/70 bg-card px-4 py-3">
              <PfButton
                :variant="buttonPreviewMap[item.variant].variant"
                :type="buttonPreviewMap[item.variant].type"
              >
                {{ buttonPreviewMap[item.variant].label }}
              </PfButton>
            </div>
            <pf-text as="p" class="mb-1 text-sm text-muted-foreground">推荐：{{ item.scenarios }}</pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">避免：{{ item.avoid }}</pf-text>
          </div>
        </div>
      </PfCard>

      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">操作层级建议</pf-text>
        <div class="space-y-3 text-sm text-muted-foreground">
          <p class="mb-0">同一操作区域只保留一个 default 主按钮，取消、关闭等退路操作优先使用 outline 或 ghost。</p>
          <p class="mb-0">warning、risk、destructive 颜色只用于风险语义，不用于“只是想更显眼”的普通动作。</p>
          <p class="mb-0">图标按钮默认使用 ghost，只有在工具栏或浮层中需要聚焦时才加 secondary 或 outline 背景。</p>
        </div>
      </PfCard>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">Card 颜色层级</pf-text>
        <div class="space-y-3">
          <div
            v-for="item in cardRules"
            :key="item.title"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <pf-text as="h4" class="mb-1">{{ item.title }}</pf-text>
            <div class="mb-2 rounded-md border border-border px-2 py-1 font-mono text-xs text-foreground">
              {{ item.combo }}
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.note }}</pf-text>
          </div>
        </div>
      </PfCard>

      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">Toast 与 Icon 规范</pf-text>
        <div class="space-y-3">
          <div
            v-for="item in toastRules"
            :key="item.type"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <pf-text as="h4" class="mb-0">{{ item.type }}</pf-text>
              <span class="text-xs text-primary">toast</span>
            </div>
            <div class="mb-3 rounded-xl border px-3 py-3" :class="toastPreviewMap[item.type]">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 size-4 rounded-full bg-current/80"></div>
                  <div>
                    <div class="text-sm font-medium">{{ item.type }} 提示</div>
                    <div class="text-xs opacity-80">示例用于展示这一类提示的视觉重量。</div>
                  </div>
                </div>
                <div class="text-xs opacity-70">关闭</div>
              </div>
            </div>
            <div class="mb-2 rounded-md border border-border px-2 py-1 font-mono text-xs text-foreground">
              {{ item.combo }}
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.usage }}</pf-text>
          </div>

          <div
            v-for="item in iconRules"
            :key="item.token"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <pf-text as="h4" class="mb-0">{{ item.token }}</pf-text>
              <span class="text-xs text-primary">icon</span>
            </div>
            <div class="mb-2 flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-xl bg-muted">
                <div class="i-tabler-bolt text-lg" :class="item.className"></div>
              </div>
              <div class="font-mono text-xs text-foreground">{{ item.className }}</div>
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.usage }}</pf-text>
          </div>
        </div>
      </PfCard>
    </section>
  </PageLayout>
</template>

<style scoped></style>