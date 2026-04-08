<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Admin Console</template>
      <template #subtitle>Operations and platform controls</template>
    </AppHeader>

    <div class="card">
      <div class="section-title">Driver Operations</div>
      <p class="text-secondary">
        Review applications, approve onboarding, and schedule interviews.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/driver-applications')">
        Open Driver Applications
      </button>
    </div>

    <div class="card">
      <div class="section-title">Trip Monitoring</div>
      <p class="text-secondary">
        View active rides, status changes, and driver-rider assignments in operations view.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/trips')">
        Open Trip Monitoring
      </button>
    </div>

    <div class="card">
      <div class="section-title">Pricing Management</div>
      <p class="text-secondary">
        Configure base fare, per-km, per-minute, and minimum fare values.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/pricing')">
        Open Pricing
      </button>
    </div>

    <div class="card">
      <div class="section-title">Fleet Management</div>
      <p class="text-secondary">
        Register EV vehicles, assign drivers, and control unit availability states.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/fleet')">
        Open Fleet
      </button>
    </div>

    <div class="card">
      <div class="section-title">Next Modules</div>
      <p class="text-secondary">Payments, support workflows, and analytics are next after Fleet MVP.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const router = useRouter()
</script>

<style scoped>
.admin-screen {
  max-width: 980px;
  margin: 0 auto;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
