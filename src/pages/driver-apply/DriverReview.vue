<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Review</template>
      <template #subtitle>Step 4 of 4 · Confirm details</template>
    </AppHeader>
    <ProgressStepper :steps="steps" :current="4" />
    <div class="card">
      <div class="section-title">Summary</div>
      <p class="text-secondary">Personal info, documents, and schedule.</p>
      <p class="text-secondary">Status: {{ driverApp.status }}</p>
    </div>
    <button class="button button-primary" :disabled="driverApp.loading" @click="submit">Submit application</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import ProgressStepper from '../../components/ProgressStepper.vue'
import { useDriverApplicationStore } from '../../store/driverApplication'
import { useRouter } from 'vue-router'

const steps = ['Info', 'Docs', 'Schedule', 'Review']
const driverApp = useDriverApplicationStore()
const router = useRouter()

async function submit() {
  await driverApp.submit()
  router.push('/driver/submitted')
}
</script>
