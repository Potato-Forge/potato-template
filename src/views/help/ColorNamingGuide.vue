<script setup lang="ts">
import PageLayoutSingle from '@/layouts/page-layout/PageLayoutSingle.vue'

const tokenStyle = (token: string) => ({
  backgroundColor: `hsl(var(--${token}))`,
})

const tokenGroups = [
  {
    title: '基础表面',
    description: '页面骨架、主要容器和浮层使用的长期结构色。',
    tokens: [
      {
        name: 'background',
        usage: '应用主背景、大页面底色',
      },
      {
        name: 'foreground',
        usage: '默认正文、主图标、主要信息',
      },
      {
        name: 'card',
        usage: '卡片、面板、内容容器表面',
      },
      {
        name: 'card-foreground',
        usage: '卡片内部正文与主信息',
      },
      {
        name: 'popover',
        usage: '下拉菜单、浮层、弹出内容表面',
      },
      {
        name: 'popover-foreground',
        usage: '浮层内文字与图标',
      },
    ],
  },
  {
    title: '次级表面',
    description: '弱化区块、次级容器和交互反馈的常用语义色。',
    tokens: [
      {
        name: 'muted',
        usage: '占位背景、弱化内容区、说明块背景',
      },
      {
        name: 'muted-foreground',
        usage: '辅助文本、说明文案、placeholder',
      },
      {
        name: 'secondary',
        usage: '次级容器、辅助按钮背景',
      },
      {
        name: 'secondary-foreground',
        usage: '次级容器中的主文字',
      },
      {
        name: 'accent',
        usage: 'hover、focus、激活前的交互高亮',
      },
      {
        name: 'accent-foreground',
        usage: 'accent 背景上的文字与图标',
      },
    ],
  },
  {
    title: '品牌与交互',
    description: '品牌色、操作焦点和输入控件相关 token。',
    tokens: [
      {
        name: 'primary',
        usage: '主按钮、关键动作、品牌强调',
      },
      {
        name: 'primary-foreground',
        usage: 'primary 背景上的主文字',
      },
      {
        name: 'border',
        usage: '普通边框、分隔线、轮廓边界',
      },
      {
        name: 'input',
        usage: '输入框边界与表单轮廓',
      },
      {
        name: 'ring',
        usage: '焦点态、键盘导航和强调轮廓',
      },
    ],
  },
  {
    title: '状态反馈',
    description: '结果反馈、危险提示以及持久选中状态。',
    tokens: [
      {
        name: 'success',
        usage: '成功反馈、通过状态、正向提示',
      },
      {
        name: 'success-foreground',
        usage: 'success 背景上的文字',
      },
      {
        name: 'info',
        usage: '信息提示、普通状态说明',
      },
      {
        name: 'info-foreground',
        usage: 'info 背景上的文字',
      },
      {
        name: 'warning',
        usage: '风险提醒、需注意但非危险操作',
      },
      {
        name: 'warning-foreground',
        usage: 'warning 背景上的文字',
      },
      {
        name: 'destructive',
        usage: '删除、清除、危险操作',
      },
      {
        name: 'destructive-foreground',
        usage: 'destructive 背景上的文字',
      },
      {
        name: 'selected',
        usage: '持久选中项、当前激活内容区',
      },
      {
        name: 'selected-foreground',
        usage: 'selected 背景上的文字',
      },
    ],
  },
]

const usageRules = [
  {
    title: '结构色',
    body: '先决定这是不是页面结构本身。结构优先用 background、card、popover、secondary、muted。',
  },
  {
    title: '信息层级',
    body: '主信息用 foreground，辅助说明和次要信息用 muted-foreground。',
  },
  {
    title: '交互色',
    body: '主动作和品牌强调用 primary，hover 和 focus 用 accent、ring。',
  },
  {
    title: '状态色',
    body: '成功、信息、警告、危险和持久选中分别使用 success、info、warning、destructive、selected。',
  },
]

const heroBadgeStyle = {
  backgroundColor: 'hsl(var(--secondary))',
  color: 'hsl(var(--primary))',
  borderColor: 'hsl(var(--primary))',
}
</script>

<template>
  <PageLayoutSingle class="min-h-0 gap-4 overflow-y-auto">
    <section class="rounded-2xl border border-border bg-card px-6 py-5">
      <div class="flex items-start justify-between gap-6">
        <div class="space-y-3">
          <pf-text as="h1" class="text-3xl">颜色命名规范</pf-text>
          <pf-text as="p" class="max-w-3xl text-muted-foreground mb-0">
            这里直接展示当前主题系统的全部颜色
            token、所属分类以及推荐用途，方便在页面和组件里快速选色。
          </pf-text>
        </div>

        <div
          class="hidden md:flex items-center rounded-full border px-4 py-2 text-sm font-medium"
          :style="heroBadgeStyle"
        >
          Theme Help
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <pf-card v-for="group in tokenGroups" :key="group.title" class="p-5 gap-4">
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
      </pf-card>
    </section>

    <section>
      <pf-card class="p-5 gap-4">
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
      </pf-card>
    </section>
  </PageLayoutSingle>
</template>

<style scoped></style>
