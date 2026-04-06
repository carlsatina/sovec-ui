<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Promos</template>
      <template #subtitle>Apply discount codes</template>
    </AppHeader>
    <input class="input" placeholder="Enter promo code" />
    <div class="card">
      <div class="section-title">Available</div>
      <div class="promo">
        <div>
          <div class="section-title">GREEN50</div>
          <p class="text-secondary">PHP 50 off your next ride</p>
        </div>
        <button class="button button-secondary">Apply</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
</script>

<style scoped>
.promo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
</style>
