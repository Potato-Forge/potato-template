<template>
  <svg
    class="fry-logo"
    :class="{ 'is-animated': animate }"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <defs>
      <linearGradient id="pf-logo-grad" x1="0" x2="1" y1="0" y2="1">
        <stop :offset="'0%'" :stop-color="gradFrom" />
        <stop :offset="'100%'" :stop-color="gradTo" />
      </linearGradient>
    </defs>

    <!-- 单色（currentColor）图层 -->
    <g class="mono" :style="{ opacity: showGradient ? 0 : 1 }">
      <path
        d="M6,21a1,1,0,0,1-.45-.11l-1.16-.58A6.1,6.1,0,0,1,1,14.83v-3a1,1,0,0,1,2,0v3a4.12,4.12,0,0,0,2,3.54V9.17A4.12,4.12,0,0,0,3,5.63V7.81a1,1,0,0,1-2,0V4a1,1,0,0,1,1.45-.89l1.16.58A6.1,6.1,0,0,1,7,9.17V20a1,1,0,0,1-.47.85A1,1,0,0,1,6,21Z"
      />
      <path
        d="M14,21a1,1,0,0,1-.45-.11l-1.16-.58A6.1,6.1,0,0,1,9,14.83V4a1,1,0,0,1,1.45-.89l1.16.58A6.1,6.1,0,0,1,15,9.17V20a1,1,0,0,1-.47.85A1,1,0,0,1,14,21ZM11,5.63v9.2a4.12,4.12,0,0,0,2,3.54V9.17A4.12,4.12,0,0,0,11,5.63Z"
      />
      <path
        d="M22,21a1,1,0,0,1-.45-.11l-1.16-.58A6.1,6.1,0,0,1,17,14.83V4a1,1,0,0,1,1.45-.89l1.16.58A6.1,6.1,0,0,1,23,9.17v4.21a1,1,0,1,1-2,0V9.17a4.12,4.12,0,0,0-2-3.54v9.2a4.12,4.12,0,0,0,2,3.54v-1a1,1,0,1,1,2,0V20a1,1,0,0,1-.47.85A1,1,0,0,1,22,21Z"
      />
    </g>

    <!-- 渐变图层（位于上方，通过 opacity 过渡） -->
    <g class="grad" :style="{ opacity: showGradient ? 1 : 0 }">
      <path
        fill="url(#pf-logo-grad)"
        d="M6,21a1,1,0,0,1-.45-.11l-1.16-.58A6.1,6.1,0,0,1,1,14.83v-3a1,1,0,0,1,2,0v3a4.12,4.12,0,0,0,2,3.54V9.17A4.12,4.12,0,0,0,3,5.63V7.81a1,1,0,0,1-2,0V4a1,1,0,0,1,1.45-.89l1.16.58A6.1,6.1,0,0,1,7,9.17V20a1,1,0,0,1-.47.85A1,1,0,0,1,6,21Z"
      />
      <path
        fill="url(#pf-logo-grad)"
        d="M14,21a1,1,0,0,1-.45-.11l-1.16-.58A6.1,6.1,0,0,1,9,14.83V4a1,1,0,0,1,1.45-.89l1.16.58A6.1,6.1,0,0,1,15,9.17V20a1,1,0,0,1-.47.85A1,1,0,0,1,14,21ZM11,5.63v9.2a4.12,4.12,0,0,0,2,3.54V9.17A4.12,4.12,0,0,0,11,5.63Z"
      />
      <path
        fill="url(#pf-logo-grad)"
        d="M22,21a1,1,0,0,1-.45-.11l-1.16-.58A6.1,6.1,0,0,1,17,14.83V4a1,1,0,0,1,1.45-.89l1.16.58A6.1,6.1,0,0,1,23,9.17v4.21a1,1,0,1,1-2,0V9.17a4.12,4.12,0,0,0-2-3.54v9.2a4.12,4.12,0,0,0,2,3.54v-1a1,1,0,1,1,2,0V20a1,1,0,0,1-.47.85A1,1,0,0,1,22,21Z"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  const props = defineProps<{
    gradientFrom?: string
    gradientTo?: string
    isHover?: boolean
    animate?: boolean
  }>()

  const hovered = ref(false)

  const onEnter = () => {
    if (props.isHover) hovered.value = true
  }
  const onLeave = () => {
    if (props.isHover) hovered.value = false
  }

  const hasGradient = computed(() => !!(props.gradientFrom && props.gradientTo))
  const showGradient = computed(() => (props.isHover ? hovered.value : hasGradient.value))

  const gradFrom = computed(() => props.gradientFrom || 'var(--pf-g1,#58B19F)')
  const gradTo = computed(() => props.gradientTo || 'var(--pf-g2,#205072)')
</script>

<style scoped>
  .fry-logo {
    width: 2.5rem; /* 你可以在外部用 w-10 覆盖 */
    height: 2.5rem;
    fill: currentColor; /* 支持 text-primary 控制颜色 */
    cursor: pointer;
  }

  /* 增加透明度过渡，使颜色切换平滑 */
  .mono,
  .grad {
    transition: opacity 0.3s ease;
  }

  /* 所有 path 的基础动画属性 */
  .fry-logo path {
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: bottom center;
  }

  /* hover 时依次浮起 */
  .fry-logo.is-animated:hover path:nth-child(1) {
    transform: translateY(-4px);
    transition-delay: 0s;
  }

  .fry-logo.is-animated:hover path:nth-child(2) {
    transform: translateY(-4px);
    transition-delay: 0.1s;
  }

  .fry-logo.is-animated:hover path:nth-child(3) {
    transform: translateY(-4px);
    transition-delay: 0.2s;
  }
</style>
