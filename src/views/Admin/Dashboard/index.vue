<script setup lang="ts">
import { supabase } from '@/api'
import { pfToast } from '@/components/pf/pf-toast'

const pushButton = async () => {
  const { data, error } = await supabase.rpc('get_user_permissions')
  if (error) {
    pfToast.error('Error', {
      description: error.message,
    })
  } else {
    pfToast.success('Success', {
      description: 'User permissions retrieved successfully.',
    })
    console.log(data)
  }
}
</script>

<template>
  <div class="p-12 flex justify-center items-center gap-4">
    <PfButton @click="pushButton">Toast</PfButton>
    <Button @click="pushButton">Toast</Button>
  </div>
</template>

<style scoped></style>
