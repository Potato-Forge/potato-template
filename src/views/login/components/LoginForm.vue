<script setup lang="ts">
  import { z } from 'zod'
  import { toTypedSchema } from '@vee-validate/zod'
  import { supabase } from '@/api'
  import { usePfToast } from '@/components/pf/pf-toast'

  const { toast } = usePfToast()

  const schema = toTypedSchema(
    z.object({
      username: z.string().min(1, '请输入您的账号'),
      password: z.string().min(1, '请输入您的密码'),
    }),
  )

  const { meta, defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

  const [username, usernameProps] = defineField('username')
  const [password, passwordProps] = defineField('password')

  const onSubmit = handleSubmit(async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.username,
      password: values.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('登录成功')
    window.location.reload()
  })
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>登录</CardTitle>
        <CardDescription>输入账号密码以登录</CardDescription>
      </CardHeader>
      <CardContent>
        <form novalidate class="flex flex-col gap-4" @submit="onSubmit">
          <FieldGroup>
            <Field name="username" type="username">
              <div class="flex items-center justify-between">
                <FieldLabel for="username"> 账号 </FieldLabel>
                <FieldError v-if="errors.username"> {{ errors.username }} </FieldError>
              </div>
              <Input
                v-model="username"
                v-bind="usernameProps"
                id="username"
                type="text"
                placeholder="输入您的账号"
              />
            </Field>

            <Field name="password" type="password">
              <div class="flex items-center justify-between">
                <FieldLabel for="password"> 密码 </FieldLabel>
                <FieldError v-if="errors.password"> {{ errors.password }} </FieldError>
              </div>
              <Input
                v-model="password"
                v-bind="passwordProps"
                id="password"
                type="password"
                required
              />
            </Field>

            <Field class="flex flex-col gap-2">
              <PfButton :disabled="!meta.touched" type="submit"> 登录 </PfButton>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
