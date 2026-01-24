<script lang="ts">
  export const description = 'Potato Forge Login'
</script>

<script setup lang="ts">
  import LoginForm from './components/LoginForm.vue'
  import GlobalLayoutBg from '@/layouts/global-layout/components/global-layout-bg/GlobalLayoutBg.vue'
</script>

<template>
  <div class="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="absolute -z-1 w-full h-full">
      <GlobalLayoutBg></GlobalLayoutBg>
    </div>
    <div class="relative z-1 w-full max-w-sm">
      <LoginForm />
    </div>
  </div>
</template>
