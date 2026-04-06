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
    <div v-else v-for="trip in trips" :key="trip.id" class="card">
      <div class="section-title">{{ trip.title }}</div>
      <p class="text-secondary">{{ trip.meta }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { onMounted, ref } from 'vue'

const loading = ref(true)
const trips = ref<Array<{ id: string; title: string; meta: string }>>([])

onMounted(() => {
  setTimeout(() => {
    trips.value = [
      { id: 't1', title: 'Makati → BGC', meta: 'Aug 12 · PHP 286' },
      { id: 't2', title: 'Ortigas → MOA', meta: 'Aug 10 · PHP 320' }
    ]
    loading.value = false
  }, 400)
})
</script>
