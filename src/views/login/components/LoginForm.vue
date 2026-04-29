<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { supabase } from '@/api'
import { pfToast } from '@/components/pf/pf-toast'
import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
import useGlobalLoadingStore from '@/store/globalLoadingStore'
import useUserStore from '@/store/userStore'
import usePermissionStore from '@/store/permissionStore'

const router = useRouter()
const globalLoadingStore = useGlobalLoadingStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// ---- v-model bindings (emitted to parent for character animations) ----
const isTyping = defineModel<boolean>('isTyping', { default: false })
const showPassword = defineModel<boolean>('showPassword', { default: false })
const passwordModel = defineModel<string>('password', { default: '' })

const rememberMe = ref(false)
const isSubmitting = ref(false)
const serverError = ref('')

const schema = toTypedSchema(
  z.object({
    username: z.string().min(1, '请输入您的账号'),
    password: z.string().min(1, '请输入您的密码'),
  }),
)

const { meta, defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: { username: '', password: '' },
})

const [username, usernameProps] = defineField('username')
const [passwordField, passwordProps] = defineField('password')

// Sync form field value to parent model
watch(passwordField, (val) => {
  passwordModel.value = val
})

const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  isSubmitting.value = true
  globalLoadingStore.start()

  // Store remember-me preference BEFORE sign in
  if (rememberMe.value) {
    localStorage.setItem('potato_remember_me', '1')
  } else {
    localStorage.removeItem('potato_remember_me')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: values.username,
    password: values.password,
  })

  if (error) {
    globalLoadingStore.end()
    isSubmitting.value = false
    serverError.value = error.message
    return
  }

  // Fetch user profile and permissions after successful login
  try {
    await userStore.fetchUser()
    await permissionStore.getUserPermission()
    pfToast.success('登录成功')
    router.push('/')
  } catch (e) {
    console.error('Failed to load user data after login:', e)
    pfToast.error('登录成功但加载用户信息失败，请刷新页面')
    router.push('/')
  } finally {
    globalLoadingStore.end()
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Welcome back!</h1>
      <p class="text-muted-foreground text-sm">请输入您的账号和密码</p>
    </div>

    <!-- Login Form -->
    <form novalidate class="flex flex-col gap-4" @submit="onSubmit">
      <!-- Username -->
      <div class="flex flex-col gap-2">
        <Label for="username" class="text-sm font-medium">账号</Label>
        <Input
          v-model="username"
          v-bind="usernameProps"
          id="username"
          type="text"
          placeholder="anna@gmail.com"
          autocomplete="off"
          class="h-12 border-border/60 focus:border-primary"
          @focus="isTyping = true"
          @blur="isTyping = false"
        />
        <p v-if="errors.username" class="text-xs text-destructive">{{ errors.username }}</p>
      </div>

      <!-- Password -->
      <div class="flex flex-col gap-2">
        <Label for="password" class="text-sm font-medium">密码</Label>
        <div class="relative">
          <Input
            v-model="passwordField"
            v-bind="passwordProps"
            id="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="h-12 pr-10 border-border/60 focus:border-primary"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            @click="showPassword = !showPassword"
          >
            <div v-if="showPassword" class="i-tabler-eye-off size-5" />
            <div v-else class="i-tabler-eye size-5" />
          </button>
        </div>
        <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
      </div>

      <!-- Remember Me + Forgot Password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <PfCheckbox id="remember" v-model="rememberMe" />
          <Label for="remember" class="text-sm font-normal cursor-pointer"> 记住我 </Label>
        </div>
        <a href="#" class="text-sm text-primary hover:underline font-medium"> 忘记密码? </a>
      </div>

      <!-- Server Error -->
      <div
        v-if="serverError"
        class="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
      >
        {{ serverError }}
      </div>

      <!-- Submit Button -->
      <PfButton
        type="submit"
        class="w-full h-12 text-base font-medium"
        :disabled="!meta.touched || isSubmitting"
      >
        {{ isSubmitting ? '登录中...' : '登录' }}
      </PfButton>
    </form>

    <!-- Google Login -->
    <div>
      <Button
        variant="outline"
        class="w-full h-12 bg-background border-border/60 hover:bg-accent"
        type="button"
      >
        <div class="i-tabler-mail mr-2 size-5" />
        Log in with Google
      </Button>
    </div>

    <!-- Sign Up Link -->
    <div class="text-center text-sm text-muted-foreground">
      还没有账号?
      <a href="#" class="text-foreground font-medium hover:underline">注册</a>
    </div>
  </div>
</template>
