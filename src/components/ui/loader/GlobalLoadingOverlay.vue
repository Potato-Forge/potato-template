<script setup lang="ts">
import useGlobalLoadingStore from '@/store/globalLoadingStore'

const loadingStore = useGlobalLoadingStore()
const letters = 'LOADING'.split('')
</script>

<template>
  <Transition name="global-loading-fade">
    <div
      v-if="loadingStore.isLoading"
      class="global-loading-overlay"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="wrapper-grid" role="status" aria-label="正在加载中">
        <div v-for="(letter, index) in letters" :key="`${letter}-${index}`" class="cube">
          <div class="face face-front">{{ letter }}</div>
          <div class="face face-back"></div>
          <div class="face face-right"></div>
          <div class="face face-left"></div>
          <div class="face face-top"></div>
          <div class="face face-bottom"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.global-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  backdrop-filter: blur(4px);
  background: hsl(var(--background) / 0.82);
  transition: background-color 0.3s ease;
}

.dark .global-loading-overlay {
  background: hsl(var(--background) / 0.96);
}
</style>

<style scoped>
.global-loading-fade-enter-active,
.global-loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.global-loading-fade-enter-from,
.global-loading-fade-leave-to {
  opacity: 0;
}
</style>
