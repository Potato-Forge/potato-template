<script lang="ts">
export const description = 'Potato Forge Login'
</script>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './components/LoginForm.vue'
import LoginCharacters from './components/LoginCharacters.vue'
import PfLogo from '@/layouts/modules/PfLogo.vue'

const isTyping = ref(false)
const showPassword = ref(false)
const passwordModel = ref('')
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- ===== Left: Brand & Characters ===== -->
    <div
      class="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground overflow-hidden"
    >
      <!-- Logo -->
      <div class="relative z-20">
        <PfLogo />
      </div>

      <!-- Characters -->
      <div class="relative z-20 flex items-end justify-center h-[500px]">
        <LoginCharacters
          :is-typing="isTyping"
          :show-password="showPassword"
          :password-length="passwordModel.length"
        />
      </div>

      <!-- Footer links -->
      <div class="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
        <a href="#" class="hover:text-primary-foreground transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-primary-foreground transition-colors">Terms of Service</a>
        <a href="#" class="hover:text-primary-foreground transition-colors">Contact</a>
      </div>

      <!-- Decorative elements -->
      <div
        class="absolute inset-0"
        style="
          background-image: radial-gradient(
            circle,
            hsl(var(--primary-foreground) / 0.05) 1px,
            transparent 1px
          );
          background-size: 20px 20px;
        "
      />
      <div
        class="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl"
      />
      <div
        class="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl"
      />
    </div>

    <!-- ===== Right: Login Form ===== -->
    <div class="flex items-center justify-center p-8 bg-background text-foreground">
      <div class="w-full max-w-[420px]">
        <!-- Mobile logo -->
        <div class="lg:hidden flex justify-center mb-12">
          <PfLogo />
        </div>
        <LoginForm
          v-model:is-typing="isTyping"
          v-model:show-password="showPassword"
          v-model:password="passwordModel"
        />
      </div>
    </div>
  </div>
</template>
