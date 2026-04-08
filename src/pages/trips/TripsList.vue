<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Trips</template>
      <template #subtitle>Your recent rides</template>
    </AppHeader>
    <div v-if="loading" class="card">
      <div class="section-title">Loading trips...</div>
      <p class="text-secondary">Fetching your history</p>
    </div>
    <div v-else-if="error" class="card">
      <div class="section-title">Unable to load trips</div>
      <p class="text-secondary">{{ error }}</p>
    </div>
    <div v-else-if="trips.length === 0" class="card">
      <div class="section-title">No trips yet</div>
      <p class="text-secondary">Your completed and recent rides will appear here.</p>
    </div>
    <div v-else v-for="trip in trips" :key="trip.id" class="card">
      <div class="section-title">{{ trip.title }}</div>
      <p class="text-secondary">{{ trip.meta }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { onMounted, ref } from 'vue'
import { api } from '../../services/api'
import type { RideDetails } from '../../services/types'

const loading = ref(true)
const error = ref('')
const trips = ref<Array<{ id: string; title: string; meta: string }>>([])

function toTripCard(ride: RideDetails) {
  const from = ride.pickupAddress.split(',')[0]?.trim() || ride.pickupAddress
  const to = ride.dropoffAddress.split(',')[0]?.trim() || ride.dropoffAddress
  const when = new Date(ride.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  const amount = Number.isFinite(ride.fareAmount) ? `PHP ${Math.round(ride.fareAmount)}` : 'PHP --'
  return {
    id: ride.id,
    title: `${from} \u2192 ${to}`,
    meta: `${when} \u00b7 ${amount}`
  }
}

onMounted(async () => {
  try {
    const res = await api.meRides(30)
    trips.value = res.items.map(toTripCard)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
})
</script>
