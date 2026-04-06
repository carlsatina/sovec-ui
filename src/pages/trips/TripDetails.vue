<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Trip details</template>
      <template #subtitle>Receipt and route</template>
    </AppHeader>
    <div class="map-wrapper">
      <NativeMap :center="center" />
    </div>
    <div class="card">
      <div class="section-title">Fare</div>
      <p class="text-secondary">PHP 286 · Cash</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import NativeMap from '../../components/NativeMap.vue'

const center = { lat: 14.5995, lng: 120.9842 }
</script>

<style scoped>
.map-wrapper { height: 260px; }
</style>
