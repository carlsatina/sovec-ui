<template>
  <div class="map-frame">
    <div class="map-pin"></div>
    <div class="map-label">Live Map</div>
  </div>
</template>

<style scoped>
.map-label {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 10px;
  border-radius: 10px;
  font-size: var(--text-secondary);
  color: var(--color-text-secondary);
}
</style>
