<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Rewards</template>
      <template #subtitle>Green points and vouchers</template>
    </AppHeader>
    <div v-if="loading" class="card">
      <div class="section-title">Loading rewards...</div>
      <p class="text-secondary">Calculating your points</p>
    </div>
    <div v-else class="card">
      <div class="section-title">Green Points</div>
      <div class="h2">{{ points }} pts</div>
      <p class="text-secondary">Redeem for discounts</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { onMounted, ref } from 'vue'

const loading = ref(true)
const points = ref(0)

onMounted(() => {
  setTimeout(() => {
    points.value = 1240
    loading.value = false
  }, 300)
})
</script>
