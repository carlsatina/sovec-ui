<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Fare estimate</template>
      <template #subtitle>Transparent pricing in PHP</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Total</div>
      <div class="h2">{{ displayTotal }}</div>
      <p class="text-secondary">Base fare + distance + time</p>
    </div>
    <div class="card">
      <div class="section-title">Breakdown</div>
      <ul class="list">
        <li>Base fare: PHP 60</li>
        <li>Distance: PHP 146</li>
        <li>Time: PHP 80</li>
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
  return `${booking.fareEstimate.currency} ${booking.fareEstimate.total.toFixed(2)}`
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
</style>
