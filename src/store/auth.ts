import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<{ id: string; name: string; role?: 'PASSENGER' | 'DRIVER' | 'ADMIN' } | null>(null)
  const loading = ref(false)

  async function sendOtp(phone: string) {
    loading.value = true
    try {
      await api.sendOtp({ phone })
    } finally {
      loading.value = false
    }
  }

  async function verifyOtp(phone: string, code: string) {
    loading.value = true
    try {
      const res = await api.verifyOtp({ phone, code })
      // Fetch profile before committing the token so we never end up
      // with a token but a null user if /users/me fails.
      const me = await api.meWithToken(res.token)
      token.value = res.token
      localStorage.setItem('auth_token', res.token)
      user.value = me
    } finally {
      loading.value = false
    }
  }

  async function register(payload: { name: string; phone: string; email?: string; password?: string }) {
    loading.value = true
    try {
      await api.register(payload)
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  return { token, user, loading, sendOtp, verifyOtp, register, logout }
})
