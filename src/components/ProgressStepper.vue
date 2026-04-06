<template>
  <div class="stepper">
    <div v-for="(step, index) in steps" :key="step" class="step" :class="{ active: index + 1 <= current }">
      <div class="dot"></div>
      <span>{{ step }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ steps: string[]; current: number }>()
</script>

<style scoped>
.stepper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
  font-size: var(--text-caption);
  color: var(--color-text-secondary);
}
.step {
  display: grid;
  gap: 6px;
  align-items: center;
  justify-items: center;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-border);
}
.step.active .dot { background: var(--color-primary); }
.step.active { color: var(--color-primary-dark); font-weight: 600; }
</style>
