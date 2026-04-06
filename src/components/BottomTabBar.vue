<template>
  <nav class="tab-bar">
    <!-- Left two tabs -->
    <RouterLink to="/home" class="tab-item" :class="{ active: route.path === '/home' }">
      <span class="tab-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      </span>
      <span class="tab-label">Home</span>
    </RouterLink>

    <RouterLink to="/trips" class="tab-item" :class="{ active: route.path === '/trips' }">
      <span class="tab-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2"/>
          <path d="M16 8h4l3 6v4h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </span>
      <span class="tab-label">Trips</span>
    </RouterLink>

    <!-- Center Book FAB -->
    <div class="tab-center">
      <RouterLink to="/booking/destination" class="fab" aria-label="Book a ride">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fab-icon">
          <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
          <rect x="9" y="11" width="14" height="10" rx="2"/>
          <circle cx="12" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <!-- bolt -->
          <path d="M17 7l-2 4h3l-2 4" stroke="#fde68a" stroke-width="1.8"/>
        </svg>
        <span class="fab-label">Book</span>
      </RouterLink>
    </div>

    <!-- Right two tabs -->
    <RouterLink to="/rewards" class="tab-item" :class="{ active: route.path === '/rewards' }">
      <span class="tab-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </span>
      <span class="tab-label">Rewards</span>
    </RouterLink>

    <RouterLink to="/account" class="tab-item" :class="{ active: route.path === '/account' }">
      <span class="tab-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </span>
      <span class="tab-label">Account</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
/* ── Bar ── */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: #071524;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 4px env(safe-area-inset-bottom, 0px);
  border-top: 1px solid rgba(0, 196, 188, 0.12);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.35);
  z-index: 100;
}

/* ── Regular tab items ── */
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0 6px;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  transition: color 0.18s;
  position: relative;
}

.tab-item.active {
  color: #00c4bc;
}

/* Active indicator pill */
.tab-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: #00c4bc;
  box-shadow: 0 0 8px rgba(0, 196, 188, 0.6);
}

.tab-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon svg {
  width: 22px;
  height: 22px;
}

.tab-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* ── Center FAB ── */
.tab-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fab {
  position: absolute;
  bottom: -4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 62px;
  height: 62px;
  border-radius: 20px;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  box-shadow: 0 6px 20px rgba(0, 196, 188, 0.5), 0 0 0 3px rgba(0, 196, 188, 0.15);
  color: #fff;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}

.fab:active {
  transform: scale(0.93);
  box-shadow: 0 4px 12px rgba(0, 196, 188, 0.4);
}

.fab-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.fab-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #fff;
  margin-top: -2px;
}
</style>
