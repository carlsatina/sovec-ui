<template>
  <header class="header">
    <div>
      <div class="title"><slot name="title" /></div>
      <div class="subtitle"><slot name="subtitle" /></div>
    </div>
    <slot name="action" />
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.title {
  font-size: var(--text-h3);
  font-weight: 600;
}
.subtitle {
  font-size: var(--text-secondary);
  color: var(--color-text-secondary);
}
</style>
