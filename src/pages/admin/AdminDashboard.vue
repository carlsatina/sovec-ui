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
      <div class="section-title">Payment Operations</div>
      <p class="text-secondary">
        Review transactions, verify settlement, mark failures, and create refund records.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/payments')">
        Open Payments
      </button>
    </div>

    <div class="card">
      <div class="section-title">Support Workflows</div>
      <p class="text-secondary">
        Review passenger complaints, classify incidents, and move tickets through resolution states.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/support')">
        Open Support
      </button>
    </div>

    <div class="card">
      <div class="section-title">Analytics & Reports</div>
      <p class="text-secondary">
        Monitor ride volumes, revenue trends, completion rate, and cancellation performance.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/analytics')">
        Open Analytics
      </button>
    </div>

    <div class="card">
      <div class="section-title">Safety Escalation</div>
      <p class="text-secondary">
        Triage SOS incidents, review critical notes, and resolve cases with documented actions.
      </p>
      <button class="button button-primary" type="button" @click="router.push('/admin/safety')">
        Open Safety
      </button>
    </div>

    <div class="card">
      <div class="section-title">Next Modules</div>
      <p class="text-secondary">Automation rules and payout/reconciliation workflows are next.</p>
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
