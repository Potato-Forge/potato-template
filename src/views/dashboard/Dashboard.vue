<script setup lang="ts">
  import { usePfToast } from '@/components/pf/pf-toast'

  const { toast } = usePfToast()
  const pushButton = () => {
    toast.success('123')
  }
</script>

<template>
  <div class="p-12 flex justify-center items-center gap-4">
    <button @click="pushButton">Toast</button>
  </div>
</template>

<style scoped></style>
