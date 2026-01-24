<script setup lang="ts">
  const { meta, defineField, handleSubmit } = useForm()

  const [username, usernameProps] = defineField('username')
  const [password, passwordProps] = defineField('password')

  const onSubmit = handleSubmit(() => {
    console.log('Submitting form with:', {
      username: username.value,
      password: password.value,
    })
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
              <FieldLabel for="username"> 账号 </FieldLabel>
              <Input
                v-model="username"
                v-bind="usernameProps"
                id="username"
                type="text"
                placeholder="输入您的账号"
              />
            </Field>

            <Field name="password" type="password">
              <div class="flex items-center">
                <FieldLabel for="password"> 密码 </FieldLabel>
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
