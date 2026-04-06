<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Application status</template>
      <template #subtitle>Tracking your progress</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Status</div>
      <p class="text-secondary">{{ driverApp.status }}</p>
    </div>
    <button class="button button-secondary" @click="refresh">Refresh</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { useDriverApplicationStore } from '../../store/driverApplication'

const driverApp = useDriverApplicationStore()

async function refresh() {
  await driverApp.fetchStatus()
}
</script>
