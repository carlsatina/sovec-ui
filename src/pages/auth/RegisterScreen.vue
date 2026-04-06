<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Create account</template>
      <template #subtitle>Start booking in minutes</template>
    </AppHeader>
    <input v-model="name" class="input" placeholder="Full name" />
    <input v-model="phone" class="input" placeholder="+63 Mobile number" />
    <input v-model="email" class="input" placeholder="Email (optional)" />
    <input v-model="password" class="input" placeholder="Create password" type="password" />
    <button class="button button-primary" :disabled="auth.loading" @click="handleRegister">Create account</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { ref } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const name = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')

async function handleRegister() {
  if (!name.value || !phone.value) return
  await auth.register({
    name: name.value,
    phone: phone.value,
    email: email.value || undefined,
    password: password.value || undefined
  })
  router.push({ path: '/auth/otp', query: { phone: phone.value } })
}
</script>
