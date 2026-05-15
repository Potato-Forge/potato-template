<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <PfModal v-model:open="open" title="确认同步权限" description="提交后会重新计算当前角色的菜单可见范围。">
    <template #trigger>
      <PfButton>打开弹窗</PfButton>
    </template>

    <div class="space-y-3 text-sm text-muted-foreground">
      <p class="mb-0">示例用于展示标题、说明和底部操作区的基础布局。</p>
      <p class="mb-0">涉及高风险操作时，description 应明确说明影响范围和不可逆结果。</p>
    </div>
  </PfModal>
</template>