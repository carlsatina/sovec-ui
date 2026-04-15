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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4A017" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
          <span>Earnings</span>
        </button>
        <button class="account-btn" type="button" @click="router.push('/account')" aria-label="Account">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </div>

    <!-- ── Online toggle card ── -->
    <div class="toggle-card" :class="{ 'toggle-card-online': driver.isOnline }">
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

    <!-- ── Location error ── -->
    <div v-if="locationError" class="location-error">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ locationError }}
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
      <!-- Online status badge -->
      <div class="map-status-badge">
        <span class="map-status-dot"></span>
        Online · Looking for rides
      </div>
    </div>

    <!-- ── Offline body ── -->
    <div v-else class="offline-body">
      <div class="ev-car-wrap" aria-hidden="true">
        <svg viewBox="0 0 160 72" fill="none" class="ev-car-svg">
          <ellipse cx="80" cy="68" rx="58" ry="5" fill="#60B45A" fill-opacity="0.18"/>
          <rect x="10" y="34" width="140" height="28" rx="8" fill="url(#bodyG)"/>
          <path d="M38 34 C42 18 56 12 80 12 C104 12 118 18 122 34Z" fill="url(#cabinG)"/>
          <path d="M52 34 C54 20 62 15 78 15 L78 34Z" fill="rgba(200,240,200,0.55)"/>
          <path d="M82 34 L82 15 C98 15 106 20 108 34Z" fill="rgba(200,240,200,0.55)"/>
          <rect x="148" y="42" width="8" height="6" rx="3" fill="#fde68a"/>
          <rect x="4"   y="42" width="8" height="6" rx="3" fill="#f87171"/>
          <circle cx="40"  cy="62" r="10" fill="#2D3A2D"/>
          <circle cx="40"  cy="62" r="5"  fill="#60B45A"/>
          <circle cx="40"  cy="62" r="2"  fill="#E8F5E8"/>
          <circle cx="120" cy="62" r="10" fill="#2D3A2D"/>
          <circle cx="120" cy="62" r="5"  fill="#60B45A"/>
          <circle cx="120" cy="62" r="2"  fill="#E8F5E8"/>
          <path d="M86 20 L80 32 H86 L82 44 L92 30 H86 L90 20Z" fill="#D4A017" fill-opacity="0.95"/>
          <rect x="54" y="8" width="52" height="10" rx="4" fill="#D4A017"/>
          <text x="80" y="16.5" text-anchor="middle" font-size="6" font-weight="800" fill="#1a1a1a" font-family="system-ui">E-RIDE</text>
          <defs>
            <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#72C46C"/>
              <stop offset="100%" stop-color="#4A9645"/>
            </linearGradient>
            <linearGradient id="cabinG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#82CF7C"/>
              <stop offset="100%" stop-color="#60B45A"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div class="offline-title">Ready to drive?</div>
      <div class="offline-sub">Toggle online above to start receiving ride requests from passengers nearby.</div>

      <!-- Today's quick stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon stat-icon-gold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <div class="stat-val">₱{{ Math.round(todayEarnings) }}</div>
          <div class="stat-label">Earnings</div>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div class="stat-val">{{ todayTrips }}</div>
          <div class="stat-label">Trips</div>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-amber">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          </div>
          <div class="stat-val">{{ todayHours.toFixed(1) }}h</div>
          <div class="stat-label">Online</div>
        </div>
      </div>

      <!-- Tips card -->
      <div class="tips-card">
        <div class="tips-icon">💡</div>
        <div class="tips-text">Peak hours are <strong>7–9 AM</strong> and <strong>5–8 PM</strong>. Go online now to maximize earnings!</div>
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
import { Geolocation } from '@capacitor/geolocation'
import NativeMap from '../../components/NativeMap.vue'
import IncomingRideOverlay from './IncomingRide.vue'
import { useDriverStore } from '../../store/driver'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'

const router = useRouter()
const driver = useDriverStore()
const auth = useAuthStore()

const locating = ref(false)
const locationError = ref('')
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
    locationError.value = ''
    await driver.goOffline(driverId)
    return
  }

  locating.value = true
  locationError.value = ''
  try {
    const permission = await Geolocation.requestPermissions()
    if (permission.location === 'denied') {
      locationError.value = 'Location access is required to go online. Please enable it in your device settings.'
      return
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })

    await driver.goOnline(driverId, position.coords.latitude, position.coords.longitude)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.toLowerCase().includes('denied')) {
      locationError.value = 'Location access is required to go online. Please enable it in your device settings.'
    } else {
      locationError.value = 'Could not get your location. Make sure GPS is enabled and try again.'
    }
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
/* ── Base ── */
.driver-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #FFFCF5 0%, #FFF6E0 50%, #F5F2EE 100%);
  transition: background 0.4s;
}

.driver-home.online {
  background: #F5F2EE;
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
  background: rgba(96,180,90,0.12);
  border: 1.5px solid rgba(96,180,90,0.25);
  color: #3D7A38;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.driver-greeting {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.driver-name {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
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
  border: 1.5px solid rgba(212,160,23,0.3);
  background: rgba(212,160,23,0.08);
  color: #92700A;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.account-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1.5px solid #EDE8E0;
  background: #fff;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ── Toggle card ── */
.toggle-card {
  margin: 0 16px;
  background: #fff;
  border: 1.5px solid #EDE8E0;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.toggle-card-online {
  border-color: rgba(96,180,90,0.35);
  box-shadow: 0 2px 16px rgba(96,180,90,0.12);
  background: linear-gradient(135deg, #fff 0%, #F4FBF3 100%);
}

.toggle-status-label {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.toggle-status-sub {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 3px;
}

.toggle-btn {
  width: 58px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: #E5E7EB;
  position: relative;
  cursor: pointer;
  transition: background 0.25s, box-shadow 0.25s;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: #60B45A;
  box-shadow: 0 0 14px rgba(96,180,90,0.45);
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.18);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(26px);
}

/* ── Location error ── */
.location-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 10px 16px 0;
  padding: 12px 14px;
  background: #FEF2F2;
  border: 1.5px solid rgba(239,68,68,0.25);
  border-radius: 14px;
  font-size: 13px;
  color: #B91C1C;
  line-height: 1.5;
}

.location-error svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: #EF4444;
}

/* ── Map ── */
.map-wrap {
  flex: 1;
  margin: 16px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  min-height: 300px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
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
  border: 2px solid rgba(96,180,90,0.45);
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
  background: #60B45A;
  box-shadow: 0 0 0 4px rgba(96,180,90,0.25);
}

@keyframes pulse-out {
  0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(0.5); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(1); }
}

.map-status-badge {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(96,180,90,0.25);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #3D7A38;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  z-index: 6;
}

.map-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #60B45A;
  flex-shrink: 0;
  animation: blink 1.4s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* ── Offline body ── */
.offline-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px 40px;
  gap: 12px;
}

.ev-car-wrap {
  width: 220px;
  filter: drop-shadow(0 12px 32px rgba(96,180,90,0.30));
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
  color: #111827;
  letter-spacing: -0.02em;
  margin-top: 4px;
}

.offline-sub {
  font-size: 13px;
  color: #6B7280;
  text-align: center;
  line-height: 1.6;
  max-width: 280px;
}

/* ── Stats ── */
.stats-row {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1.5px solid #EDE8E0;
  border-radius: 20px;
  padding: 18px 0;
  width: 100%;
  margin-top: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.stat-icon-gold  { background: rgba(212,160,23,0.12); color: #D4A017; }
.stat-icon-green { background: rgba(96,180,90,0.12);  color: #3D7A38; }
.stat-icon-amber { background: rgba(245,158,11,0.12); color: #B45309; }

.stat-val {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  background: #EDE8E0;
  flex-shrink: 0;
  margin: 4px 0;
}

/* ── Tips card ── */
.tips-card {
  width: 100%;
  background: #FFFBEB;
  border: 1.5px solid rgba(212,160,23,0.25);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.tips-icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 1px;
}

.tips-text {
  font-size: 12px;
  color: #78350F;
  line-height: 1.55;
}

.tips-text strong {
  font-weight: 700;
  color: #92400E;
}
</style>
