<template>
  <div class="account-screen">

    <!-- Hero -->
    <div class="hero">
      <div class="avatar" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="hero-name">{{ auth.user?.name ?? 'User' }}</div>
      <div class="hero-role-badge" :class="isDriver ? 'badge-driver' : 'badge-passenger'">
        <svg v-if="isDriver" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 6v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {{ isDriver ? 'Driver' : 'Passenger' }}
      </div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Driver-specific section -->
      <template v-if="isDriver">
        <div class="section-label">Driver</div>
        <div class="menu-card">
          <button class="menu-item" type="button" @click="router.push('/driver/home')">
            <div class="menu-icon teal-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 6v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <span class="menu-label">Driver Dashboard</span>
            <svg class="menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item" type="button" @click="router.push('/driver/earnings')">
            <div class="menu-icon gold-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <span class="menu-label">Earnings</span>
            <svg class="menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </template>

      <!-- Passenger-specific section -->
      <template v-else>
        <div class="section-label">Ride</div>
        <div class="menu-card">
          <button class="menu-item" type="button" @click="router.push('/trips')">
            <div class="menu-icon teal-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 6v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <span class="menu-label">My Trips</span>
            <svg class="menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item" type="button" @click="router.push('/rewards')">
            <div class="menu-icon gold-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            </div>
            <span class="menu-label">Rewards</span>
            <svg class="menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item" type="button" @click="router.push('/driver/apply')">
            <div class="menu-icon purple-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <span class="menu-label">Drive with E-Ride</span>
            <svg class="menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </template>

      <!-- General -->
      <div class="section-label">General</div>
      <div class="menu-card">
        <button class="menu-item" type="button" @click="router.push('/help')">
          <div class="menu-icon gray-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <span class="menu-label">Help & Support</span>
          <svg class="menu-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <!-- Dev: Role switcher -->
      <div class="section-label">
        Developer
        <span class="dev-badge">DEV</span>
      </div>
      <div class="menu-card">
        <div class="role-switcher">
          <div class="role-switcher-label">Active role</div>
          <div class="role-tabs">
            <button
              class="role-tab"
              :class="{ active: !isDriver }"
              type="button"
              @click="switchRole('PASSENGER')"
            >Passenger</button>
            <button
              class="role-tab"
              :class="{ active: isDriver }"
              type="button"
              @click="switchRole('DRIVER')"
            >Driver</button>
          </div>
          <div class="role-hint">Switching reloads the app to apply the new role.</div>
        </div>
      </div>

      <!-- Sign out -->
      <button class="signout-btn" type="button" @click="signOut">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign out
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const auth = useAuthStore()

const isDriver = computed(() => {
  const devRole = localStorage.getItem('solvec_dev_role')
  return (devRole ?? auth.user?.role ?? 'PASSENGER') === 'DRIVER'
})

function switchRole(role: 'PASSENGER' | 'DRIVER') {
  localStorage.setItem('solvec_dev_role', role)
  // Reload through splash so it re-fetches /users/me with the new role header
  window.location.href = '/auth/splash'
}

function signOut() {
  auth.logout()
  localStorage.removeItem('solvec_dev_role')
  router.replace('/auth/welcome')
}
</script>

<style scoped>
.account-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f8;
}

/* Hero */
.hero {
  background: linear-gradient(160deg, #071524 0%, #0c2233 55%, #0d3344 100%);
  padding: 56px 20px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0,196,188,0.15);
  border: 2px solid rgba(0,196,188,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-name {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.hero-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge-passenger {
  background: rgba(0,196,188,0.15);
  border: 1px solid rgba(0,196,188,0.3);
  color: #00c4bc;
}

.badge-driver {
  background: rgba(245,166,35,0.15);
  border: 1px solid rgba(245,166,35,0.3);
  color: #f5a623;
}

/* Body */
.body {
  padding: 20px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0 4px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dev-badge {
  background: rgba(139,92,246,0.15);
  border: 1px solid rgba(139,92,246,0.3);
  color: #8b5cf6;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.08em;
}

/* Menu card */
.menu-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 4px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.teal-icon   { background: rgba(0,196,188,0.1);  color: #00c4bc; }
.gold-icon   { background: rgba(245,166,35,0.1);  color: #f5a623; }
.purple-icon { background: rgba(139,92,246,0.1);  color: #8b5cf6; }
.gray-icon   { background: rgba(107,114,128,0.1); color: #6b7280; }

.menu-label {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.menu-chevron { flex-shrink: 0; }

.menu-divider {
  height: 1px;
  background: #f1f5f8;
  margin: 0 16px;
}

/* Role switcher */
.role-switcher {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-switcher-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.role-tabs {
  display: flex;
  gap: 8px;
}

.role-tab {
  flex: 1;
  padding: 9px 0;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.role-tab.active {
  background: #00c4bc;
  border-color: #00c4bc;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,196,188,0.3);
}

.role-hint {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.4;
}

/* Sign out */
.signout-btn {
  margin-top: 8px;
  height: 50px;
  border-radius: 14px;
  border: 1.5px solid rgba(239,68,68,0.25);
  background: rgba(254,242,242,0.8);
  color: #ef4444;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.signout-btn:active { background: rgba(254,226,226,0.9); }
</style>
