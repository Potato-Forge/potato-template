<template>
  <div class="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-8xl font-bold text-primary">403</h1>
        <p class="mt-2 text-2xl font-semibold text-foreground">无权限访问</p>
      </div>
      <p class="mb-8 text-lg text-muted-foreground">
        抱歉，您暂无权限访问该页面。请联系管理员分配相应权限。
      </p>
      <div class="flex gap-4 justify-center">
        <RouterLink
          to="/admin/dashboard"
          class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          返回首页
        </RouterLink>
        <button
          @click="goBack"
          class="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
        >
          返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped></style>
