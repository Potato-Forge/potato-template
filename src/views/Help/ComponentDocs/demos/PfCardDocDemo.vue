<template>
  <PfCard shadow class="overflow-hidden">
    <template #header>
      <div>
        <pf-text as="h4" class="mb-0">审批摘要</pf-text>
        <pf-text as="p" class="mb-0 text-sm text-muted-foreground">
          头部放摘要，正文放主要内容，避免把说明塞进 footer。
        </pf-text>
      </div>
    </template>

    <div class="px-4 py-4 text-sm text-muted-foreground">
      当前卡片演示了最常用的 header、body、footer 三段式布局。
    </div>

    <template #footer>
      <div class="flex w-full justify-end gap-2 border-t border-border px-4 py-3">
        <PfButton variant="outline">关闭</PfButton>
        <PfButton>继续处理</PfButton>
      </div>
    </template>
  </PfCard>
</template>