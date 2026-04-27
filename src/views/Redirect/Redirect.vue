<template>
  <div />
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 重定向到 query 中指定的路径，默认跳转到首页
const redirectPath = (route.query.to as string) || '/admin/dashboard'
router.replace(redirectPath)
</script>

<style scoped></style>
