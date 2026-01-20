<template>
  <div class="hamburger-container" v-bind="$attrs">
    <input
      class="label-check"
      :id="uuid"
      type="checkbox"
      :checked="modelValue"
      @change="handleChange"
    />
    <label :for="uuid" class="toggle">
      <div class="bars" id="bar1"></div>
      <div class="bars" id="bar2"></div>
      <div class="bars" id="bar3"></div>
    </label>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits(['update:modelValue'])

  const uuid = `tg-${Math.random().toString(36).slice(2, 9)}`

  const handleChange = (event: any) => {
    emit('update:modelValue', event.target.checked)
  }
</script>

<style scoped>
  .hamburger-container {
    display: inline-block;
    font-size: 20px; /* 默认大小，可通过外部 class="text-xl" 或 style="font-size: 20px" 调整 */
    width: 1em;
    height: 1em;
    line-height: 0;
    --hamburger-color: currentColor;
  }

  .label-check {
    display: none;
  }

  .toggle {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25em; /* 10px / 40px */
    transition-duration: 0.3s;
  }

  .bars {
    width: 100%;
    height: 0.1em; /* 4px / 40px */
    background-color: var(--hamburger-color);
    border-radius: 0.125em; /* 5px / 40px */
    transition-duration: 0.3s;
  }

  /* 选中状态：变为左箭头 */
  .label-check:checked + .toggle {
    transform: rotate(-90deg); /* 90deg是右，-90deg是左 */
  }

  .label-check:checked + .toggle #bar2 {
    transform: translateY(0.35em) rotate(60deg); /* 14px / 40px */
    margin-left: 0;
    transform-origin: right;
    transition-duration: 0.3s;
    z-index: 2;
  }

  .label-check:checked + .toggle #bar1 {
    transform: translateY(0.7em) rotate(-60deg); /* 28px / 40px */
    transition-duration: 0.3s;
    transform-origin: left;
    z-index: 1;
  }
</style>
