<script setup lang="ts">
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import type { PfUploadFileItem } from '@/components/pf/pf-upload'

const imageDemo = {
  normal:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  fallback:
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80',
}

const uploadFilesA = ref<PfUploadFileItem[]>([])
const uploadFilesB = ref<PfUploadFileItem[]>([])
const uploadFilesC = ref<PfUploadFileItem[]>([])
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 space-y-6">
    <PfCard shadow class="overflow-hidden">
      <template #header>
        <div class="flex flex-col">
          <p class="text-sm font-semibold">pf-img</p>
          <p class="text-xs text-muted-foreground">支持加载态、错误回退、点击预览</p>
        </div>
      </template>

      <div class="grid gap-4 p-4 md:grid-cols-3">
        <div class="space-y-2">
          <p class="text-xs text-muted-foreground">正常加载</p>
          <PfImg :src="imageDemo.normal" class="h-36 w-full" :aspect-ratio="4 / 3" />
        </div>

        <div class="space-y-2">
          <p class="text-xs text-muted-foreground">地址错误 + fallback</p>
          <PfImg
            src="https://example.com/not-found-image.jpg"
            :fallback-src="imageDemo.fallback"
            class="h-36 w-full"
            :aspect-ratio="4 / 3"
          />
        </div>

        <div class="space-y-2">
          <p class="text-xs text-muted-foreground">禁用预览</p>
          <PfImg
            :src="imageDemo.fallback"
            :preview="false"
            class="h-36 w-full"
            :aspect-ratio="4 / 3"
          />
        </div>
      </div>
    </PfCard>

    <PfCard shadow>
      <template #header>
        <div class="flex flex-col">
          <p class="text-sm font-semibold">pf-upload - 按钮触发 + 列表</p>
          <p class="text-xs text-muted-foreground">支持状态、进度、重试、删除、toast 队列</p>
        </div>
      </template>

      <div class="p-4">
        <PfUpload
          v-model="uploadFilesA"
          trigger="button"
          list-type="list"
          accept="image/*,application/pdf,text/*"
          :max-files="10"
        />
      </div>
    </PfCard>

    <PfCard shadow>
      <template #header>
        <div class="flex flex-col">
          <p class="text-sm font-semibold">pf-upload - 拖拽触发 + 列表</p>
          <p class="text-xs text-muted-foreground">拖拽文件到区域内上传，也支持点击选择</p>
        </div>
      </template>

      <div class="p-4">
        <PfUpload
          v-model="uploadFilesB"
          trigger="drag"
          list-type="list"
          accept="image/*,video/*,.zip,.pdf"
          :max-files="12"
        />
      </div>
    </PfCard>

    <PfCard shadow>
      <template #header>
        <div class="flex flex-col">
          <p class="text-sm font-semibold">pf-upload - 画廊触发 + 画廊列表</p>
          <p class="text-xs text-muted-foreground">适用于图片上传场景，hover 可删除，点击可预览</p>
        </div>
      </template>

      <div class="p-4">
        <PfUpload
          v-model="uploadFilesC"
          trigger="gallery"
          list-type="gallery"
          accept="image/*"
          :max-files="16"
        />
      </div>
    </PfCard>
  </PageLayout>
</template>
