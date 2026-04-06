<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Availability</template>
      <template #subtitle>Step 3 of 4 · Schedule</template>
    </AppHeader>
    <ProgressStepper :steps="steps" :current="3" />
    <div class="card">
      <div class="section-title">Preferred city</div>
      <div class="chips">
        <span class="chip">Makati</span>
        <span class="chip">Taguig</span>
        <span class="chip">Quezon City</span>
      </div>
    </div>
    <div class="card">
      <div class="section-title">Working hours</div>
      <p class="text-secondary">Weekdays 7:00 AM – 9:00 PM</p>
      <button class="button button-secondary">Edit schedule</button>
    </div>
    <button class="button button-primary" :disabled="driverApp.loading" @click="next">Next</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import ProgressStepper from '../../components/ProgressStepper.vue'
import { useRouter } from 'vue-router'
import { useDriverApplicationStore } from '../../store/driverApplication'

const steps = ['Info', 'Docs', 'Schedule', 'Review']
const router = useRouter()
const driverApp = useDriverApplicationStore()

async function next() {
  await driverApp.setAvailability({ days: 'Mon-Fri', hours: '07:00-21:00', preferredCity: 'Taguig' })
  router.push('/driver/review')
}
</script>

<style scoped>
.chips {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
