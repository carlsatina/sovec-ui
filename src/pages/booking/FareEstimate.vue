<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Fare estimate</template>
      <template #subtitle>Transparent pricing in PHP</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Total</div>
      <div class="h2">{{ displayTotal }}</div>
      <p class="text-secondary">Base fare + distance + time{{ booking.tollEstimate > 0 ? ' + toll' : '' }}</p>
    </div>
    <div class="card">
      <div class="section-title">Breakdown</div>
      <ul class="list">
        <li v-if="booking.fareEstimate?.breakdown?.base">Base fare: PHP {{ booking.fareEstimate.breakdown.base.toFixed(2) }}</li>
        <li v-else>Base fare: PHP --</li>
        <li v-if="booking.fareEstimate?.breakdown?.distance">Distance: PHP {{ booking.fareEstimate.breakdown.distance.toFixed(2) }}</li>
        <li v-else>Distance: PHP --</li>
        <li v-if="booking.fareEstimate?.breakdown?.time">Time: PHP {{ booking.fareEstimate.breakdown.time.toFixed(2) }}</li>
        <li v-else>Time: PHP --</li>
        <li v-if="booking.tollEstimate > 0" class="toll-item">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Toll fee (passenger): PHP {{ booking.tollEstimate.toFixed(2) }}
        </li>
      </ul>
    </div>
    <button class="button button-primary" :disabled="booking.loading" @click="goPayment">Confirm fare</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../store/booking'

const booking = useBookingStore()
const router = useRouter()

const displayTotal = computed(() => {
  if (!booking.fareEstimate) return 'PHP --'
  const total = booking.fareEstimate.total + booking.tollEstimate
  return `${booking.fareEstimate.currency} ${total.toFixed(2)}`
})

onMounted(() => {
  booking.estimateFare()
})

function goPayment() {
  router.push('/booking/payment')
}
</script>

<style scoped>
.list { margin: 0; padding-left: 18px; color: var(--color-text-secondary); }
.toll-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7A5C0A;
  font-weight: 600;
}
</style>
