<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Driver FAQ</template>
      <template #subtitle>Recruitment support</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">How long is the review?</div>
      <p class="text-secondary">Typically 3-5 business days.</p>
    </div>
    <div class="card">
      <div class="section-title">Can I choose my city?</div>
      <p class="text-secondary">Yes, pick preferred service areas.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
</script>
