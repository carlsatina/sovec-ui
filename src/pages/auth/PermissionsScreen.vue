<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Enable permissions</template>
      <template #subtitle>We use location for accurate pickup and live tracking</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Location access</div>
      <p class="text-secondary">Allow location while using the app for precise pickups.</p>
      <button class="button button-primary">Enable location</button>
    </div>
    <div class="card">
      <div class="section-title">Notifications</div>
      <p class="text-secondary">Get driver updates and ride alerts in real time.</p>
      <button class="button button-secondary">Enable notifications</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
</script>
