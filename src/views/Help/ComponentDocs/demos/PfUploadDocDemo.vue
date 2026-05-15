<script setup lang="ts">
import type { PfUploadFileItem } from '@/components/pf/pf-upload'

const files = ref<PfUploadFileItem[]>([])
</script>

<template>
  <div class="space-y-3">
    <PfUpload v-model="files" trigger="button" list-type="list" accept="image/*,.pdf" :max-files="5" />
    <pf-text as="p" class="mb-0 text-sm text-muted-foreground">
      当前示例展示按钮触发和列表态，适合管理后台里的附件与图片上传场景。
    </pf-text>
  </div>
</template>