<template>
  <div class="trip-screen">

    <!-- Map -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="18"
        :markers="mapMarkers"
        :path="routePath"
        :follow-driver="isFollowing"
        :map-bearing="driverBearing"
        :tilt="30"
        map-id="driver-trip-map"
        @camera-idle="onCameraIdle"
      />
      <div class="trip-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        {{ etaText }} · {{ distanceText }}
      </div>

      <!-- Recenter button -->
      <button v-if="!isFollowing" class="recenter-btn" type="button" @click="isFollowing = true" aria-label="Recenter on position">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </button>
    </div>

    <!-- Sheet -->
    <section class="sheet">
      <div class="sheet-handle" aria-hidden="true"></div>

      <!-- Progress bar -->
      <div v-if="totalDistanceKm > 0" class="progress-bar-wrap" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="progress-label">{{ progressPercent.toFixed(0) }}% to destination</span>
      </div>

      <!-- Arrival banner (replaces status banner when near dropoff) -->
      <div v-if="nearDropoff" class="arrival-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>You've arrived at the destination</span>
      </div>
      <div v-else class="status-banner">
        <div class="status-dot" aria-hidden="true"></div>
        <span>Trip in progress</span>
      </div>

      <!-- Passenger + drop-off card (merged) -->
      <div class="info-card">
        <div class="info-row">
          <div class="p-avatar" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="p-info">
            <div class="p-name">{{ passengerName }}</div>
          </div>
          <a v-if="passengerPhone" class="call-btn" :href="`tel:${passengerPhone}`" aria-label="Call passenger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
          </a>
          <div v-else class="call-btn call-btn-disabled" aria-label="Passenger phone unavailable">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
          </div>
        </div>
        <div class="card-divider" aria-hidden="true"></div>
        <div class="addr-row">
          <span class="addr-dot dot-gold" aria-hidden="true"></span>
          <div class="addr-body">
            <div class="addr-title">{{ dropoffShort }}</div>
            <div class="addr-sub">{{ driver.currentRide?.dropoffAddress }}</div>
          </div>
        </div>
      </div>

      <!-- Fare & payment -->
      <div class="fare-row">
        <div class="fare-item">
          <div class="fare-val">PHP {{ fareAmount }}</div>
          <div class="fare-label">Fare</div>
        </div>
        <div class="fare-divider" aria-hidden="true"></div>
        <div class="fare-item">
          <div class="fare-val">{{ driver.currentRide?.paymentMethod ?? 'CASH' }}</div>
          <div class="fare-label">Payment</div>
        </div>
        <div class="fare-divider" aria-hidden="true"></div>
        <div class="fare-item">
          <!-- Task 8: warn before leaving app -->
          <button class="maps-link" type="button" @click="showNavWarning = true">Navigate</button>
          <div class="fare-label">Google Maps</div>
        </div>
      </div>

      <!-- End trip -->
      <button class="end-btn" type="button" :disabled="driver.loading" @click="showConfirmEnd = true">
        <svg v-if="driver.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0110 10"/></svg>
        {{ driver.loading ? 'Completing…' : 'End Trip' }}
        <svg v-if="!driver.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
      </button>
    </section>

    <!-- ── Task 2: End trip confirmation modal ── -->
    <div v-if="showConfirmEnd" class="modal-overlay" @click.self="showConfirmEnd = false">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div id="confirm-title" class="modal-title">End this trip?</div>
        <div class="modal-body">Make sure you have reached the passenger's drop-off location before ending.</div>
        <div class="modal-actions">
          <button class="modal-cancel" type="button" @click="showConfirmEnd = false">Not yet</button>
          <button class="modal-confirm" type="button" :disabled="driver.loading" @click="confirmEndTrip">
            {{ driver.loading ? 'Completing…' : 'Yes, end trip' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Task 8: Navigate warning modal ── -->
    <div v-if="showNavWarning" class="modal-overlay" @click.self="showNavWarning = false">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="nav-title">
        <div class="modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div id="nav-title" class="modal-title">Open Google Maps?</div>
        <div class="modal-body">This will open Google Maps and leave the app. Your trip will continue but location sharing may pause.</div>
        <div class="modal-actions">
          <button class="modal-cancel" type="button" @click="showNavWarning = false">Stay here</button>
          <a class="modal-confirm nav-confirm" :href="mapsLink" target="_blank" rel="noopener" @click="showNavWarning = false">Open Maps</a>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import NativeMap from '../../components/NativeMap.vue'
import { useDriverStore } from '../../store/driver'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'
import { decodePolyline } from '../../utils/polyline'
import { computeBearing } from '../../utils/mapIcons'
import { snapToPolyline, lookAheadCenter } from '../../utils/gpsSmoothing'
import { getSocket } from '../../services/socket'

const router = useRouter()
const driver = useDriverStore()
const auth   = useAuthStore()

const routePath        = ref<Array<{ lat: number; lng: number }>>([])
const routeDurationMin = ref<number | null>(null)
const routeDistanceKm  = ref<number | null>(null)
const totalDistanceKm  = ref(0)       // set on first successful route fetch
const carMarkerIcon    = 'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png'

// Navigation mode
const isFollowing       = ref(true)
const driverBearing     = ref(0)
const prevDriverLocation = ref<{ lat: number; lng: number } | null>(null)

// Task 1: arrival detection (~80 m = 0.00072 °)
const ARRIVAL_THRESHOLD = 0.00072
const nearDropoff = ref(false)

// Task 2: end trip confirmation
const showConfirmEnd = ref(false)

// Task 8: navigate warning
const showNavWarning = ref(false)

// Task 6: screen wake lock
let wakeLock: WakeLockSentinel | null = null
async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return
  try {
    wakeLock = await (navigator as any).wakeLock.request('screen')
  } catch { /* non-fatal */ }
}
function releaseWakeLock() {
  wakeLock?.release().catch(() => {})
  wakeLock = null
}

function onCameraIdle(coords: { lat: number; lng: number }) {
  if (!isFollowing.value) return
  const driverPos = driver.driverLocation
  if (!driverPos) return
  // Compare against the expected look-ahead center, not the raw driver position
  const expected = lookAheadCenter(driverPos, driverBearing.value, 100)
  const dist = Math.hypot(coords.lat - expected.lat, coords.lng - expected.lng)
  if (dist > 0.005) isFollowing.value = false
}

function updateDriverBearing(newLoc: { lat: number; lng: number } | null) {
  if (!newLoc) return
  if (prevDriverLocation.value) {
    const dist = Math.hypot(newLoc.lat - prevDriverLocation.value.lat, newLoc.lng - prevDriverLocation.value.lng)
    if (dist > 0.00005) driverBearing.value = computeBearing(prevDriverLocation.value, newLoc)
  }
  prevDriverLocation.value = { ...newLoc }
}

// Task 1: check if driver is within arrival threshold of dropoff
function checkArrival() {
  if (!driver.currentRide || !driver.driverLocation || nearDropoff.value) return
  const dist = Math.hypot(
    driver.driverLocation.lat - driver.currentRide.dropoffLat,
    driver.driverLocation.lng - driver.currentRide.dropoffLng
  )
  if (dist < ARRIVAL_THRESHOLD) nearDropoff.value = true
}

const mapCenter = computed(() => {
  const pos = driver.driverLocation
  if (!pos) return driver.currentRide ? { lat: driver.currentRide.pickupLat, lng: driver.currentRide.pickupLng } : { lat: 14.5995, lng: 120.9842 }
  return lookAheadCenter(pos, driverBearing.value, 100)
})

const mapMarkers = computed(() => {
  if (!driver.currentRide) return []
  const markers: Array<{
    lat: number; lng: number; title?: string
    iconUrl?: string; iconSize?: { width: number; height: number }
    bearing?: number
  }> = []
  if (driver.driverLocation) {
    const snapped = snapToPolyline(driver.driverLocation, routePath.value)
    markers.push({
      lat: snapped.lat,
      lng: snapped.lng,
      title: 'Driver',
      bearing: driverBearing.value,
      iconUrl: carMarkerIcon,
      iconSize: { width: 36, height: 36 }
    })
  }
  markers.push({ lat: driver.currentRide.dropoffLat, lng: driver.currentRide.dropoffLng, title: 'Drop-off' })
  return markers
})

// Task 5: progress computed from total vs remaining distance
const progressPercent = computed(() => {
  if (totalDistanceKm.value <= 0 || routeDistanceKm.value == null) return 0
  const covered = totalDistanceKm.value - routeDistanceKm.value
  return Math.min(100, Math.max(0, (covered / totalDistanceKm.value) * 100))
})

const etaText      = computed(() => routeDurationMin.value != null ? `~${routeDurationMin.value} min` : '…')
const distanceText = computed(() => routeDistanceKm.value != null ? `${routeDistanceKm.value.toFixed(1)} km` : '…')
const dropoffShort = computed(() => driver.currentRide?.dropoffAddress?.split(',')[0] ?? '')
const fareAmount   = computed(() => driver.currentRide ? Math.round(driver.currentRide.fareAmount) : '--')
const passengerName  = computed(() => driver.currentRide?.rider?.name || 'Passenger')
const passengerPhone = computed(() => driver.currentRide?.rider?.phone ?? '')
const mapsLink = computed(() => {
  if (!driver.currentRide) return '#'
  const { dropoffLat: lat, dropoffLng: lng } = driver.currentRide
  if (Capacitor.isNativePlatform()) return `google.navigation:q=${lat},${lng}&mode=d`
  const origin = driver.driverLocation
    ? `&origin=${driver.driverLocation.lat},${driver.driverLocation.lng}`
    : ''
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${lat},${lng}&travelmode=driving`
})

// Route re-fetch — snapped threshold
let routeSeq = 0
let lastFetchSnappedLat = 0
let lastFetchSnappedLng = 0
const ROUTE_REFETCH_THRESHOLD = 0.0003

async function fetchLiveTripMetrics() {
  if (!driver.currentRide || !driver.driverLocation) {
    routeDurationMin.value = null
    routeDistanceKm.value  = null
    return
  }
  const snapped = snapToPolyline(driver.driverLocation, routePath.value)
  const fromLat = snapped.lat
  const fromLng = snapped.lng
  const toLat   = driver.currentRide.dropoffLat
  const toLng   = driver.currentRide.dropoffLng

  const moved = Math.hypot(fromLat - lastFetchSnappedLat, fromLng - lastFetchSnappedLng)
  if (moved < ROUTE_REFETCH_THRESHOLD && routeSeq > 0) return

  const seq = ++routeSeq
  lastFetchSnappedLat = fromLat
  lastFetchSnappedLng = fromLng

  try {
    const route = await api.route(fromLat, fromLng, toLat, toLng)
    if (seq !== routeSeq) return
    routePath.value = route.polyline ? decodePolyline(route.polyline) : [
      { lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }
    ]
    routeDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
    routeDistanceKm.value  = route.distanceMeters / 1000
    // Task 5: capture total distance on first successful fetch
    if (totalDistanceKm.value === 0) totalDistanceKm.value = routeDistanceKm.value
  } catch {
    if (seq !== routeSeq) return
    routeDurationMin.value = null
    routeDistanceKm.value  = null
  }
}

watch(() => driver.driverLocation, (newLoc) => {
  updateDriverBearing(newLoc)
  checkArrival()           // Task 1
  fetchLiveTripMetrics()
})

// Task 3: socket reconnection — re-join ride room after disconnect
let socketReconnectHandler: (() => void) | null = null

onMounted(async () => {
  if (!driver.currentRide) return
  const driverId = auth.user?.id
  if (driverId) driver.ensureLocationTracking(driverId)

  // Task 3: re-join ride room on reconnect
  const socket = getSocket()
  socketReconnectHandler = () => {
    if (driver.currentRide) {
      socket.emit('join', { userId: driverId, rideId: driver.currentRide.id })
      console.log('[Socket] TripActive reconnected — re-joined ride room')
    }
  }
  socket.on('connect', socketReconnectHandler)

  if (driver.driverLocation) prevDriverLocation.value = { ...driver.driverLocation }
  await fetchLiveTripMetrics()
  acquireWakeLock()         // Task 6
})

onUnmounted(() => {
  releaseWakeLock()         // Task 6

  // Task 3: clean up reconnect listener
  if (socketReconnectHandler) {
    const socket = getSocket()
    socket.off('connect', socketReconnectHandler)
    socketReconnectHandler = null
  }
})

// Task 2: confirmed end trip
async function confirmEndTrip() {
  showConfirmEnd.value = false
  const driverId = auth.user?.id
  if (!driverId) return
  await driver.completeTrip(driverId)
  router.replace('/driver/completed')
}

// Keep legacy endTrip in case called elsewhere (now routes through confirm)
async function endTrip() {
  showConfirmEnd.value = true
}
</script>

<style scoped>
.trip-screen {
  height: 100vh; overflow: hidden;
  display: flex; flex-direction: column;
}

.map-area { flex: 1; position: relative; min-height: 0; }
.map-area :deep(.native-map) { border-radius: 0; height: 100%; min-height: 100%; }

.recenter-btn {
  position: absolute; bottom: 16px; right: 16px;
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: #fff; color: #00c4bc;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18); z-index: 10; cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
}
.recenter-btn:active { transform: scale(0.93); box-shadow: 0 2px 8px rgba(0,0,0,0.14); }

.trip-chip {
  position: absolute; top: 52px; left: 50%; transform: translateX(-50%);
  background: rgba(7,21,36,0.8); backdrop-filter: blur(8px);
  border: 1px solid rgba(96,180,90,0.3); border-radius: 999px;
  padding: 8px 16px; font-size: 12px; font-weight: 700; color: #60B45A;
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25); z-index: 5;
}

.sheet {
  background: #f1f5f8; border-radius: 28px 28px 0 0;
  margin-top: -28px; padding: 6px 12px 24px;
  display: flex; flex-direction: column; gap: 8px;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.1);
}

.sheet-handle {
  width: 36px; height: 4px; border-radius: 999px;
  background: #d1d5db; margin: 4px auto 2px;
}

/* Task 5: progress bar */
.progress-bar-wrap {
  display: flex; align-items: center; gap: 10px;
}
.progress-bar-track {
  flex: 1; height: 6px; border-radius: 999px;
  background: #e5e7eb; overflow: hidden;
}
.progress-bar-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #60B45A, #3D7A38);
  transition: width 0.6s ease;
}
.progress-label {
  font-size: 11px; font-weight: 600; color: #9ca3af; white-space: nowrap;
}

/* Task 1: arrival banner */
.arrival-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 14px;
  background: rgba(96,180,90,0.1); border: 1px solid rgba(96,180,90,0.35);
  font-size: 13px; font-weight: 700; color: #3D7A38;
}

.status-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 14px;
  background: rgba(96,180,90,0.08); border: 1px solid rgba(96,180,90,0.22);
  font-size: 13px; font-weight: 700; color: #3D7A38;
}
.status-dot {
  width: 9px; height: 9px; border-radius: 50%; background: #60B45A;
  animation: blink 1.4s ease-in-out infinite; flex-shrink: 0;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* Merged passenger + dropoff card */
.info-card {
  background: #071524; border-radius: 18px; overflow: hidden;
}
.info-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
}
.p-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(0,196,188,0.15); border: 1.5px solid rgba(0,196,188,0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.p-name { font-size: 14px; font-weight: 700; color: #fff; }
.p-info { flex: 1; min-width: 0; }
.call-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(96,180,90,0.15); border: 1px solid rgba(96,180,90,0.28);
  color: #60B45A; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; text-decoration: none;
}
.call-btn-disabled { opacity: 0.4; pointer-events: none; }
.card-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0 14px; }
.addr-row {
  display: grid; grid-template-columns: 20px minmax(0,1fr);
  gap: 10px; align-items: center; padding: 10px 14px;
}
.addr-dot   { width: 11px; height: 11px; flex-shrink: 0; }
.dot-gold   { background: #f5a623; border-radius: 3px; box-shadow: 0 0 0 3px rgba(245,166,35,0.2); }
.addr-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.addr-sub   { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.fare-row {
  display: flex; align-items: center;
  background: #fff; border-radius: 18px; padding: 14px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.fare-item    { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.fare-val     { font-size: 15px; font-weight: 800; color: #111827; }
.fare-label   { font-size: 11px; color: #9ca3af; font-weight: 500; }
.fare-divider { width: 1px; height: 28px; background: #e5e7eb; flex-shrink: 0; }

/* Task 8: Navigate button styled like link */
.maps-link {
  font-size: 14px; font-weight: 700; color: #60B45A;
  background: none; border: none; cursor: pointer; padding: 0; font-family: inherit;
}

.end-btn {
  height: 54px; border-radius: 999px; border: none;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  color: #fff; font-size: 16px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(96,180,90,0.4);
  transition: opacity 0.15s, transform 0.12s;
}
.end-btn:active  { opacity: 0.9; transform: scale(0.98); }
.end-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

/* Tasks 2 & 8: modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0 0 32px;
}
.modal-card {
  background: #fff; border-radius: 28px; padding: 28px 24px 24px;
  width: 100%; max-width: 420px; display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  box-shadow: 0 -4px 40px rgba(0,0,0,0.18);
}
.modal-icon  { display: flex; align-items: center; justify-content: center; }
.modal-title { font-size: 18px; font-weight: 800; color: #111827; text-align: center; letter-spacing: -0.02em; }
.modal-body  { font-size: 14px; color: #6b7280; text-align: center; line-height: 1.5; }
.modal-actions {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin-top: 4px;
}
.modal-cancel {
  height: 48px; border-radius: 14px; border: 1.5px solid #e5e7eb;
  background: #f9fafb; color: #374151; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.modal-confirm {
  height: 48px; border-radius: 14px; border: none;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  color: #fff; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
}
.modal-confirm:disabled { opacity: 0.55; cursor: not-allowed; }
.nav-confirm { background: linear-gradient(145deg, #f59e0b, #d97706); }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
