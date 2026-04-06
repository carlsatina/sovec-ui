<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Help Center</template>
      <template #subtitle>How can we help?</template>
    </AppHeader>
    <input class="input" placeholder="Search help topics" />
    <div class="card">
      <div class="section-title">Payment issues</div>
      <p class="text-secondary">Refunds, overcharges, and receipts</p>
    </div>
    <div class="card">
      <div class="section-title">Safety</div>
      <p class="text-secondary">Emergency support and reports</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
</script>
