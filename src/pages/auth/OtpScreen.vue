<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Verify OTP</template>
      <template #subtitle>We sent a 6-digit code to your phone</template>
    </AppHeader>
    <div class="otp-row">
      <input
        v-for="i in 6"
        :key="i"
        :ref="el => { if (el) inputRefs[i - 1] = el as HTMLInputElement }"
        :value="digits[i - 1]"
        class="input"
        maxlength="1"
        inputmode="numeric"
        @input="onInput(i - 1, $event)"
        @keydown="onKeydown(i - 1, $event)"
        @paste="onPaste"
      />
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
const inputRefs = ref<HTMLInputElement[]>([])
const error = ref('')
const isComplete = computed(() => digits.value.join('').length === 6)

function onInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '').slice(-1)
  digits.value[index] = val
  input.value = val
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    inputRefs.value[index - 1]?.focus()
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text') ?? ''
  const nums = text.replace(/\D/g, '').slice(0, 6).split('')
  nums.forEach((n, i) => { digits.value[i] = n })
  const nextEmpty = nums.length < 6 ? nums.length : 5
  inputRefs.value[nextEmpty]?.focus()
}

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
