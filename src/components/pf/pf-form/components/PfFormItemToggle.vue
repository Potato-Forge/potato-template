<script setup lang="ts">
import PfCheckbox from '../../pf-checkbox/PfCheckbox.vue'
import PfSwitch from '../../pf-switch/PfSwitch.vue'
const props = withDefaults(
  defineProps<{
    label?: string
    modelValue?: boolean
    trueValue?: any
    falseValue?: any
    type?: 'switch' | 'checkbox'
    disabled?: boolean
  }>(),
  {
    trueValue: true,
    falseValue: false,
    type: 'checkbox',
  },
)

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const toggleValue = () => {
  const newValue = props.modelValue === props.trueValue ? props.falseValue : props.trueValue
  emits('update:modelValue', newValue)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <pf-checkbox
      v-if="props.type === 'checkbox'"
      :model-value="props.modelValue"
      @update:model-value="toggleValue"
      :disabled="props.disabled"
    ></pf-checkbox>
    <pf-switch
      v-else-if="props.type === 'switch'"
      :model-value="props.modelValue"
      @update:model-value="toggleValue"
      :disabled="props.disabled"
    ></pf-switch>
  </div>
</template>

<style scoped></style>
