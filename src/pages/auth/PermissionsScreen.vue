<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Enable permissions</template>
      <template #subtitle>We use location for accurate pickup and live tracking</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Location access</div>
      <p class="text-secondary">Allow location while using the app for precise pickups.</p>
      <p v-if="locationStatus === 'granted'" class="perm-granted">Location enabled</p>
      <p v-else-if="locationStatus === 'denied'" class="perm-denied">Permission denied — please enable location in your device settings.</p>
      <button v-else class="button button-primary" @click="requestLocation">Enable location</button>
    </div>
    <div class="card">
      <div class="section-title">Notifications</div>
      <p class="text-secondary">Get driver updates and ride alerts in real time.</p>
      <button class="button button-secondary">Enable notifications</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import AppHeader from '../../components/AppHeader.vue'

const locationStatus = ref<'idle' | 'granted' | 'denied'>('idle')

async function requestLocation() {
  const permission = await Geolocation.requestPermissions()
  locationStatus.value = permission.location === 'granted' ? 'granted' : 'denied'
}
</script>

<style scoped>
.perm-granted { color: #3D7A38; font-size: 13px; font-weight: 600; }
.perm-denied  { color: #B91C1C; font-size: 13px; line-height: 1.5; }
</style>
