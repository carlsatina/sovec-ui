<template>
  <div class="card booking-card">
    <div class="pickup">
      <span class="chip">Pickup</span>
      <input class="input" placeholder="Enter pickup location" @focus="goPickup" />
    </div>
    <div class="dropoff">
      <span class="chip">Drop-off</span>
      <input class="input" placeholder="Where to?" @focus="goDropoff" />
    </div>
    <div class="actions">
      <button class="button button-secondary">Schedule</button>
      <button class="button button-primary" @click="goRideOptions">Book now</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goPickup() {
  router.push('/booking/location')
}

function goDropoff() {
  router.push('/booking/destination')
}

function goRideOptions() {
  router.push('/booking/ride-options')
}
</script>

<style scoped>
.booking-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
</style>
