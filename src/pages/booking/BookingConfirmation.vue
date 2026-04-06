<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Confirm booking</template>
      <template #subtitle>Review your trip details</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Pickup</div>
      <p class="text-secondary">{{ booking.pickup?.address ?? 'Set pickup' }}</p>
      <div class="section-title">Drop-off</div>
      <p class="text-secondary">{{ booking.dropoff?.address ?? 'Set drop-off' }}</p>
    </div>
    <div class="card">
      <div class="section-title">Estimated fare</div>
      <div class="h2">{{ displayTotal }}</div>
      <p class="text-secondary">{{ booking.rideType }} · {{ booking.paymentMethod }}</p>
    </div>
    <button class="button button-primary" :disabled="booking.loading" @click="bookRide">Book now</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../store/booking'

const booking = useBookingStore()
const router = useRouter()

const displayTotal = computed(() => {
  if (!booking.fareEstimate) return 'PHP --'
  return `${booking.fareEstimate.currency} ${booking.fareEstimate.total.toFixed(2)}`
})

async function bookRide() {
  await booking.createBooking()
  router.push('/booking/finding')
}
</script>
