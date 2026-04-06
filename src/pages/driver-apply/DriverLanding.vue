<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Drive with E-Ride</template>
      <template #subtitle>Earn with a premium EV fleet</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Why drivers choose us</div>
      <p class="text-secondary">Stable bookings, EV training, and city‑wide demand.</p>
    </div>
    <div class="card">
      <div class="section-title">Estimated weekly earnings</div>
      <p class="text-secondary">PHP 18,000 – 28,000 depending on hours.</p>
    </div>
    <button class="button button-primary" @click="start">Apply now</button>
    <button class="button button-ghost" @click="goRequirements">View requirements</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { useRouter } from 'vue-router'
import { useDriverApplicationStore } from '../../store/driverApplication'

const router = useRouter()
const driverApp = useDriverApplicationStore()

async function start() {
  await driverApp.create({
    userId: 'demo-user',
    fullName: 'Juan Dela Cruz',
    phone: '+639171234567',
    email: 'juan@example.com',
    address: 'Taguig City, Metro Manila'
  })
  router.push('/driver/form')
}

function goRequirements() {
  router.push('/driver/requirements')
}
</script>
