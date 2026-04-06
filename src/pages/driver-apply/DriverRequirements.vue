<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Requirements</template>
      <template #subtitle>Prepare these before applying</template>
    </AppHeader>
    <div class="card">
      <ul class="list">
        <li>Valid driver’s license</li>
        <li>NBI or police clearance</li>
        <li>Government-issued ID</li>
        <li>Proof of address</li>
      </ul>
    </div>
    <button class="button button-primary">Start application</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
</script>

<style scoped>
.list { margin: 0; padding-left: 18px; color: var(--color-text-secondary); }
</style>
