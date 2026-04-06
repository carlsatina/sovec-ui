<template>
  <div class="app-screen">
    <div class="h1">Ride electric. Ride smarter.</div>
    <p class="text-secondary">Clean, safe, and premium rides across Metro Manila and beyond.</p>
    <div class="card">
      <div class="section-title">Zero-emission trips</div>
      <p class="text-secondary">Every booking helps reduce city pollution and noise.</p>
    </div>
    <div class="card">
      <div class="section-title">Trusted professional drivers</div>
      <p class="text-secondary">Verified drivers with real-time trip safety features.</p>
    </div>
    <button class="button button-primary" @click="router.push('/auth/login')">Get started</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
