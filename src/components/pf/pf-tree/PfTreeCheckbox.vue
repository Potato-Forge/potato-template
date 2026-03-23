<script setup lang="ts">
  import PfCheckbox from '../pf-checkbox/PfCheckbox.vue'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean | 0
    }>(),
    {
      modelValue: false,
    },
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean | 0): void
  }>()

  const checked = computed({
    get() {
      if (props.modelValue === 0) return 'indeterminate'
      return props.modelValue
    },
    set(v) {
      if (v === 'indeterminate') {
        emit('update:modelValue', 0)
      } else {
        emit('update:modelValue', v)
      }
    },
  })
</script>

<template>
  <pf-checkbox v-model="checked"></pf-checkbox>
</template>

<style scoped></style>
