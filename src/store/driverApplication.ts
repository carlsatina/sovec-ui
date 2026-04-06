import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export const useDriverApplicationStore = defineStore('driver-application', () => {
  const applicationId = ref<string | null>(null)
  const status = ref<string>('DRAFT')
  const loading = ref(false)

  async function create(payload: { userId: string; fullName: string; phone: string; email?: string; address: string }) {
    loading.value = true
    try {
      const res = await api.createDriverApplication(payload)
      applicationId.value = res.application.id
      status.value = res.application.status
    } finally {
      loading.value = false
    }
  }

  async function update(payload: { experienceYears?: number; preferredArea?: string; fullName?: string; phone?: string; email?: string; address?: string }) {
    if (!applicationId.value) return
    loading.value = true
    try {
      const res = await api.updateDriverApplication(applicationId.value, payload)
      status.value = res.application.status
    } finally {
      loading.value = false
    }
  }

  async function uploadDocument(type: string, fileUrl: string) {
    if (!applicationId.value) return
    loading.value = true
    try {
      await api.uploadDriverDocument(applicationId.value, { type, fileUrl })
    } finally {
      loading.value = false
    }
  }

  async function setAvailability(payload: { days: string; hours: string; preferredCity: string }) {
    if (!applicationId.value) return
    loading.value = true
    try {
      await api.setDriverAvailability(applicationId.value, payload)
    } finally {
      loading.value = false
    }
  }

  async function submit() {
    if (!applicationId.value) return
    loading.value = true
    try {
      const res = await api.submitDriverApplication(applicationId.value)
      status.value = res.application.status
    } finally {
      loading.value = false
    }
  }

  async function fetchStatus() {
    if (!applicationId.value) return
    const res = await api.getDriverApplication(applicationId.value)
    status.value = res.status
  }

  return { applicationId, status, loading, create, update, uploadDocument, setAvailability, submit, fetchStatus }
})
