<template>
  <div class="driver-home" :class="{ online: driver.isOnline }">

    <!-- ── Header ── -->
    <div class="top-bar">
      <div class="top-left">
        <div class="avatar" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div class="driver-greeting">{{ greeting }}</div>
          <div class="driver-name">{{ auth.user?.name ?? 'Driver' }}</div>
        </div>
      </div>
      <div class="top-right">
        <button class="earnings-btn" type="button" @click="router.push('/driver/earnings')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
          <span>Earnings</span>
        </button>
        <button class="account-btn" type="button" @click="router.push('/account')" aria-label="Account">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </div>

    <!-- ── Online toggle card ── -->
    <div class="toggle-card">
      <div class="toggle-info">
        <div class="toggle-status-label">{{ driver.isOnline ? 'You are online' : 'You are offline' }}</div>
        <div class="toggle-status-sub">{{ driver.isOnline ? 'Waiting for ride requests…' : 'Go online to start earning' }}</div>
      </div>
      <button
        class="toggle-btn"
        :class="{ active: driver.isOnline }"
        type="button"
        :disabled="driver.loading || locating"
        @click="toggleOnline"
        :aria-label="driver.isOnline ? 'Go offline' : 'Go online'"
      >
        <span class="toggle-knob"></span>
      </button>
    </div>

    <!-- ── Map (visible when online) ── -->
    <div v-if="driver.isOnline" class="map-wrap">
      <NativeMap
        :center="mapCenter"
        :zoom="15"
        :markers="[]"
        map-id="driver-home-map"
      />
      <!-- Pulsing online indicator over map -->
      <div class="online-pulse" aria-hidden="true">
        <div class="pulse-ring pulse-ring-2"></div>
        <div class="pulse-ring pulse-ring-1"></div>
        <div class="pulse-core"></div>
      </div>
    </div>

    <!-- ── Offline illustration ── -->
    <div v-else class="offline-body">
      <div class="ev-car-wrap" aria-hidden="true">
        <svg viewBox="0 0 160 72" fill="none" class="ev-car-svg">
          <ellipse cx="80" cy="68" rx="58" ry="5" fill="#00c4bc" fill-opacity="0.12"/>
          <rect x="10" y="34" width="140" height="28" rx="8" fill="url(#bodyG)"/>
          <path d="M38 34 C42 18 56 12 80 12 C104 12 118 18 122 34Z" fill="url(#cabinG)"/>
          <path d="M52 34 C54 20 62 15 78 15 L78 34Z" fill="rgba(180,240,248,0.55)"/>
          <path d="M82 34 L82 15 C98 15 106 20 108 34Z" fill="rgba(180,240,248,0.55)"/>
          <rect x="148" y="42" width="8" height="6" rx="3" fill="#fde68a"/>
          <rect x="4"   y="42" width="8" height="6" rx="3" fill="#f87171"/>
          <circle cx="40"  cy="62" r="10" fill="#0d2b2b"/>
          <circle cx="40"  cy="62" r="5"  fill="#00c4bc"/>
          <circle cx="40"  cy="62" r="2"  fill="#e2fafa"/>
          <circle cx="120" cy="62" r="10" fill="#0d2b2b"/>
          <circle cx="120" cy="62" r="5"  fill="#00c4bc"/>
          <circle cx="120" cy="62" r="2"  fill="#e2fafa"/>
          <path d="M86 20 L80 32 H86 L82 44 L92 30 H86 L90 20Z" fill="#f5a623" fill-opacity="0.9"/>
          <rect x="54" y="8" width="52" height="10" rx="4" fill="#f5a623"/>
          <text x="80" y="16.5" text-anchor="middle" font-size="6" font-weight="800" fill="#1a2e2e" font-family="system-ui">E-RIDE</text>
          <defs>
            <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00c4bc"/>
              <stop offset="100%" stop-color="#007d78"/>
            </linearGradient>
            <linearGradient id="cabinG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00d4cc"/>
              <stop offset="100%" stop-color="#00c4bc"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="offline-title">Ready to drive?</div>
      <div class="offline-sub">Toggle online above to start receiving ride requests from passengers nearby.</div>

      <!-- Today's quick stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-val">₱{{ Math.round(todayEarnings) }}</div>
          <div class="stat-label">Today</div>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-card">
          <div class="stat-val">{{ todayTrips }}</div>
          <div class="stat-label">Trips</div>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-card">
          <div class="stat-val">{{ todayHours.toFixed(1) }}h</div>
          <div class="stat-label">Online</div>
        </div>
      </div>
    </div>

    <!-- ── Incoming ride overlay (triggered by socket) ── -->
    <IncomingRideOverlay v-if="driver.rideStatus === 'incoming'" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import NativeMap from '../../components/NativeMap.vue'
import IncomingRideOverlay from './IncomingRide.vue'
import { useDriverStore } from '../../store/driver'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'

const router = useRouter()
const driver = useDriverStore()
const auth = useAuthStore()

const locating = ref(false)
const todayEarnings = ref(0)
const todayTrips = ref(0)
const todayHours = ref(0)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 18) return 'Good afternoon,'
  return 'Good evening,'
})

const mapCenter = computed(() =>
  driver.driverLocation ?? { lat: 14.5995, lng: 120.9842 }
)

async function toggleOnline() {
  const driverId = auth.user?.id
  if (!driverId) return

  if (driver.isOnline) {
    await driver.goOffline(driverId)
    return
  }

  locating.value = true
  try {
    await new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await driver.goOnline(driverId, pos.coords.latitude, pos.coords.longitude)
          resolve()
        },
        reject,
        { timeout: 8000 }
      )
    })
  } catch {
    // GPS unavailable — go online with default location
    await driver.goOnline(driverId, 14.5995, 120.9842)
  } finally {
    locating.value = false
  }
}

onMounted(async () => {
  const driverId = auth.user?.id
  if (!driverId) return
  driver.subscribeToRideEvents(driverId)
  await driver.resumeSession(driverId)

  try {
    const earnings = await api.driverGetEarnings(driverId, 'today')
    todayEarnings.value = earnings.totalEarnings
    todayTrips.value = earnings.totalTrips
    todayHours.value = earnings.totalHours
  } catch {
    todayEarnings.value = 0
    todayTrips.value = 0
    todayHours.value = 0
  }

  // If already mid-trip, navigate to the right screen
  if (driver.rideStatus === 'arriving') router.replace('/driver/pickup')
  if (driver.rideStatus === 'in_progress') router.replace('/driver/trip')
})

onBeforeUnmount(() => {
  driver.unsubscribeFromRideEvents()
})
</script>

<style scoped>
.driver-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #071524;
  transition: background 0.4s;
}

.driver-home.online {
  background: #071524;
}

/* ── Top bar ── */
.top-bar {
  padding: 52px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(0,196,188,0.15);
  border: 1.5px solid rgba(0,196,188,0.3);
  color: #00c4bc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.driver-greeting {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.driver-name {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.earnings-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(245,166,35,0.3);
  background: rgba(245,166,35,0.1);
  color: #fbbf24;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.account-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ── Toggle card ── */
.toggle-card {
  margin: 0 16px;
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle-status-label {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.toggle-status-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin-top: 3px;
}

.toggle-btn {
  width: 58px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: rgba(255,255,255,0.15);
  position: relative;
  cursor: pointer;
  transition: background 0.25s;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: #00c4bc;
  box-shadow: 0 0 14px rgba(0,196,188,0.5);
}

.toggle-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.toggle-knob {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(26px);
}

/* ── Map ── */
.map-wrap {
  flex: 1;
  margin: 16px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  min-height: 300px;
}

.map-wrap :deep(.native-map) {
  height: 100%;
  min-height: 300px;
  border-radius: 24px;
}

.online-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 5;
}

.pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(0,196,188,0.4);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-out 2s ease-out infinite;
}

.pulse-ring-1 { width: 48px; height: 48px; animation-delay: 0s; }
.pulse-ring-2 { width: 72px; height: 72px; animation-delay: 0.6s; }

.pulse-core {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 4px rgba(0,196,188,0.25);
}

@keyframes pulse-out {
  0%   { opacity: 0.8; transform: translate(-50%, -50%) scale(0.5); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(1); }
}

/* ── Offline body ── */
.offline-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 40px;
  gap: 12px;
}

.ev-car-wrap {
  width: 220px;
  filter: drop-shadow(0 12px 32px rgba(0,196,188,0.25));
  animation: car-float 3s ease-in-out infinite;
}

.ev-car-svg { width: 100%; height: auto; display: block; }

@keyframes car-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.offline-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin-top: 8px;
}

.offline-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  text-align: center;
  line-height: 1.5;
  max-width: 280px;
}

/* Stats */
.stats-row {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 16px 0;
  width: 100%;
  margin-top: 8px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.stat-val {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,0.1);
  flex-shrink: 0;
}
</style>
