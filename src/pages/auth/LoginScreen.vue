<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Welcome back</template>
      <template #subtitle>Sign in with your mobile number</template>
    </AppHeader>
    <input v-model="phone" class="input" placeholder="+63 Mobile number" />
    <input class="input" placeholder="Password (optional)" type="password" />
    <button class="button button-primary" :disabled="auth.loading" @click="handleSendOtp">Send OTP</button>
    <button class="button button-ghost">Continue with email</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const auth = useAuthStore()
const phone = ref('')

async function handleSendOtp() {
  if (!phone.value) return
  await auth.sendOtp(phone.value)
  router.push({ path: '/auth/otp', query: { phone: phone.value } })
}
</script>
