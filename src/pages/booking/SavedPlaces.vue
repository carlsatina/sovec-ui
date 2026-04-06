<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Saved places</template>
      <template #subtitle>Home, work, and favorites</template>
    </AppHeader>
    <div class="card">
      <div class="section-title">Home</div>
      <p class="text-secondary">Makati Avenue, Makati City</p>
    </div>
    <div class="card">
      <div class="section-title">Work</div>
      <p class="text-secondary">BGC, Taguig City</p>
    </div>
    <button class="button button-primary">Add place</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
</script>
