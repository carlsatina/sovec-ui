<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Verify OTP</template>
      <template #subtitle>We sent a 6-digit code to your phone</template>
    </AppHeader>
    <div class="otp-row">
      <input v-for="i in 6" :key="i" v-model="digits[i - 1]" class="input" maxlength="1" />
    </div>
    <button class="button button-primary" :disabled="auth.loading || !isComplete" @click="handleVerify">Verify</button>
    <p v-if="error" class="text-error">{{ error }}</p>
    <p class="text-secondary">Resend in 00:45</p>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuthStore } from '../../store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const digits = ref<string[]>(['', '', '', '', '', ''])
const error = ref('')
const isComplete = computed(() => digits.value.join('').length === 6)

async function handleVerify() {
  const phone = String(route.query.phone ?? '')
  const code = digits.value.join('')
  error.value = ''
  if (!phone) {
    error.value = 'Missing phone number. Go back and request OTP again.'
    return
  }
  if (code.length !== 6) {
    error.value = 'Enter the 6-digit code.'
    return
  }
  try {
    await auth.verifyOtp(phone, code)
    const role = auth.user?.role
    const destination = role === 'ADMIN' ? '/admin' : role === 'DRIVER' ? '/driver/home' : '/home'
    router.push(destination)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'OTP verification failed.'
  }
}
</script>

<style scoped>
.otp-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-2);
}
.otp-row .input { text-align: center; }
</style>
