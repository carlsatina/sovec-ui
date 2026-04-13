<template>
  <div class="progress-screen">

    <!-- Map -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="16"
        :markers="mapMarkers"
        :path="routePath"
        :follow-driver="isFollowing"
        :map-bearing="0"
        :tilt="0"
        map-id="trip-progress-map"
        @camera-idle="onCameraIdle"
      />
      <div v-if="etaText" class="eta-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        {{ etaText }}{{ distanceText ? ' · ' + distanceText : '' }} to destination
      </div>

      <!-- Recenter button — shown when user has panned away -->
      <button v-if="!isFollowing" class="recenter-btn" type="button" @click="isFollowing = true" aria-label="Recenter on driver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </button>
    </div>

    <!-- Sheet -->
    <section class="sheet">
      <div class="sheet-handle" aria-hidden="true"></div>

      <div class="status-banner">
        <div class="status-dot" aria-hidden="true"></div>
        <span>Trip in progress</span>
      </div>

      <!-- Task 5: Trip progress bar -->
      <div v-if="totalDistanceKm > 0" class="progress-bar-wrap">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="progress-label">{{ progressPercent.toFixed(0) }}% to destination</span>
      </div>

      <!-- Driver + drop-off card (merged) -->
      <div class="info-card">
        <div class="info-row">
          <div class="d-avatar" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="d-info">
            <div class="d-name">{{ driverName }}</div>
            <div class="d-sub">{{ driverSubtitle }}</div>
          </div>
          <a v-if="driverPhone" class="call-btn" :href="`tel:${driverPhone}`" aria-label="Call driver">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
          </a>
          <div v-else class="call-btn call-btn-disabled" aria-label="Driver phone unavailable">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
          </div>
        </div>
        <div class="card-divider" aria-hidden="true"></div>
        <div class="addr-row">
          <span class="addr-dot dot-gold" aria-hidden="true"></span>
          <div class="addr-body">
            <div class="addr-title">{{ dropoffShort }}</div>
            <div class="addr-sub">{{ booking.dropoff?.address }}</div>
          </div>
        </div>
      </div>

      <button class="share-btn" type="button">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Share trip status
      </button>

      <!-- Task 7: Fare-may-vary notice -->
      <p class="fare-notice">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Final fare may vary based on actual route and distance.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NativeMap from '../../components/NativeMap.vue'
import { useBookingStore } from '../../store/booking'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'
import { getSocket } from '../../services/socket'
import { decodePolyline } from '../../utils/polyline'
import { computeBearing } from '../../utils/mapIcons'
import { snapToPolyline } from '../../utils/gpsSmoothing'

const router = useRouter()
const booking = useBookingStore()
const auth = useAuthStore()

const routePath        = ref<Array<{ lat: number; lng: number }>>([])
const etaDurationMin   = ref<number | null>(null)
const distanceKm       = ref<number | null>(null)   // Task 4: remaining distance
const totalDistanceKm  = ref(0)                      // Task 5: for progress bar

// Navigation mode
const isFollowing        = ref(true)
const driverBearing      = ref(0)
const prevDriverLocation = ref<{ lat: number; lng: number } | null>(null)

// Task 6: screen wake lock
let wakeLock: WakeLockSentinel | null = null
async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return
  try { wakeLock = await (navigator as any).wakeLock.request('screen') } catch { /* non-fatal */ }
}
function releaseWakeLock() {
  wakeLock?.release().catch(() => {})
  wakeLock = null
}

function onCameraIdle(coords: { lat: number; lng: number }) {
  if (!isFollowing.value) return
  const driverPos = booking.driverLocation
  if (!driverPos) return
  const dist = Math.hypot(coords.lat - driverPos.lat, coords.lng - driverPos.lng)
  if (dist > 0.005) isFollowing.value = false
}

const mapCenter = computed(() =>
  booking.driverLocation
  ?? (booking.dropoff ? { lat: booking.dropoff.lat, lng: booking.dropoff.lng } : { lat: 14.5995, lng: 120.9842 })
)

const mapMarkers = computed(() => {
  const markers: Array<{
    lat: number
    lng: number
    title?: string
    iconUrl?: string
    iconSize?: { width: number; height: number }
    bearing?: number
  }> = []
  if (booking.driverLocation) {
    const snapped = snapToPolyline(booking.driverLocation, routePath.value)
    markers.push({
      lat: snapped.lat,
      lng: snapped.lng,
      title: 'Driver',
      bearing: driverBearing.value,
      iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png',
      iconSize: { width: 36, height: 36 },
    })
  }
  if (booking.dropoff) markers.push({ lat: booking.dropoff.lat, lng: booking.dropoff.lng, title: 'Drop-off' })
  return markers
})

function updateDriverBearing(newLoc: { lat: number; lng: number } | null | undefined) {
  if (!newLoc) return
  if (prevDriverLocation.value) {
    const dist = Math.hypot(
      newLoc.lat - prevDriverLocation.value.lat,
      newLoc.lng - prevDriverLocation.value.lng
    )
    if (dist > 0.00005) {
      driverBearing.value = computeBearing(prevDriverLocation.value, newLoc)
    }
  }
  prevDriverLocation.value = { ...newLoc }
}

const etaText        = computed(() => etaDurationMin.value != null ? `~${etaDurationMin.value} min` : null)
const distanceText   = computed(() => distanceKm.value != null ? `${distanceKm.value.toFixed(1)} km` : null)
const progressPercent = computed(() => {
  if (totalDistanceKm.value <= 0 || distanceKm.value == null) return 0
  const covered = totalDistanceKm.value - distanceKm.value
  return Math.min(100, Math.max(0, (covered / totalDistanceKm.value) * 100))
})
const dropoffShort = computed(() => booking.dropoff?.address?.split(',')[0] ?? '')
const driverName = computed(() => booking.assignedDriver?.name || 'Your Driver')
const driverPhone = computed(() => booking.assignedDriver?.phone ?? '')
const driverSubtitle = computed(() => {
  const vehicle = booking.assignedDriver?.vehicle
  if (!vehicle) return 'Driver assigned'
  return `${vehicle.model} · ${vehicle.plateNumber}`
})

// Sequence counter + last snapped fetch position
let routeSeq = 0
let lastFetchSnappedLat = 0
let lastFetchSnappedLng = 0
const ROUTE_REFETCH_THRESHOLD = 0.0003  // ~30 m of road progress

// Fetch route from driver's snapped position to dropoff — called on each location update
async function fetchRoute() {
  if (!booking.driverLocation || !booking.dropoff) return

  const snapped = snapToPolyline(booking.driverLocation, routePath.value)
  const fromLat = snapped.lat
  const fromLng = snapped.lng
  const toLat   = booking.dropoff.lat
  const toLng   = booking.dropoff.lng

  const moved = Math.hypot(fromLat - lastFetchSnappedLat, fromLng - lastFetchSnappedLng)
  if (moved < ROUTE_REFETCH_THRESHOLD && routeSeq > 0) return

  const seq = ++routeSeq
  lastFetchSnappedLat = fromLat
  lastFetchSnappedLng = fromLng

  try {
    const route = await api.route(fromLat, fromLng, toLat, toLng)
    if (seq !== routeSeq) return
    routePath.value = route.polyline ? decodePolyline(route.polyline) : [
      { lat: fromLat, lng: fromLng },
      { lat: toLat,   lng: toLng   }
    ]
    etaDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
    distanceKm.value     = route.distanceMeters / 1000
    if (totalDistanceKm.value === 0) totalDistanceKm.value = distanceKm.value
  } catch {
    if (seq !== routeSeq) return
    routePath.value  = [{ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }]
    etaDurationMin.value = null
  }
}

watch(() => booking.driverLocation, (newLoc) => {
  updateDriverBearing(newLoc)
  fetchRoute()
})

onMounted(() => {
  if (booking.rideId) {
    // Always re-emit join so a reconnected socket is back in the ride room
    const socket = getSocket()
    socket.emit('join', { userId: auth.user?.id, rideId: booking.rideId })

    if (!booking.hasActiveSubscription) {
      booking.resubscribeToRideUpdates(booking.rideId)
    }
    if (!booking.assignedDriver) {
      void booking.refreshRideDetails(booking.rideId)
    }
  }
  if (booking.driverLocation) {
    prevDriverLocation.value = { ...booking.driverLocation }
  }
  fetchRoute()
  acquireWakeLock()  // Task 6
})

watch(
  () => booking.rideStatus,
  (status) => {
    if (status === 'COMPLETED') {
      booking.unsubscribeFromRideUpdates()
      router.replace('/booking/completed')
    }
  }
)

onUnmounted(() => {
  releaseWakeLock()  // Task 6
})
</script>

<style scoped>
.progress-screen {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-area {
  flex: 1;
  position: relative;
  min-height: 0;
}

.map-area :deep(.native-map) { border-radius: 0; height: 100%; min-height: 100%; }

.recenter-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #00c4bc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  z-index: 10;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
}
.recenter-btn:active { transform: scale(0.93); box-shadow: 0 2px 8px rgba(0,0,0,0.14); }

.eta-chip {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(7,21,36,0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0,196,188,0.25);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #00c4bc;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 5;
}

.sheet {
  background: #f1f5f8;
  border-radius: 28px 28px 0 0;
  margin-top: -28px;
  padding: 6px 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.1);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #d1d5db;
  margin: 4px auto 2px;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(0,196,188,0.08);
  border: 1px solid rgba(0,196,188,0.2);
  font-size: 13px;
  font-weight: 700;
  color: #007d78;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #00c4bc;
  flex-shrink: 0;
  animation: blink 1.4s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* Merged driver + dropoff card */
.info-card {
  background: #071524;
  border-radius: 18px;
  overflow: hidden;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}
.d-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0,196,188,0.15);
  border: 1.5px solid rgba(0,196,188,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.d-name { font-size: 14px; font-weight: 700; color: #fff; }
.d-sub  { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 1px; }
.d-info { flex: 1; min-width: 0; }
.call-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0,196,188,0.15);
  border: 1px solid rgba(0,196,188,0.25);
  color: #00c4bc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-decoration: none;
}
.call-btn-disabled { opacity: 0.4; pointer-events: none; }
.card-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0 14px; }
.addr-row {
  display: grid;
  grid-template-columns: 20px minmax(0,1fr);
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
}
.addr-dot { width: 11px; height: 11px; flex-shrink: 0; }
.dot-gold { background: #f5a623; border-radius: 3px; box-shadow: 0 0 0 3px rgba(245,166,35,0.2); }
.addr-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.addr-sub   { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.share-btn {
  height: 48px;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

/* Task 5: progress bar */
.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress-bar-track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(0,196,188,0.15);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #00c4bc, #00e5dc);
  transition: width 1.2s ease;
}
.progress-label {
  font-size: 11px;
  font-weight: 600;
  color: #007d78;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Task 7: fare-may-vary notice */
.fare-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  padding: 0 2px;
}
.fare-notice svg { flex-shrink: 0; opacity: 0.7; }
</style>
