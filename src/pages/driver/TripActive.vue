<template>
  <div class="trip-screen">
    <!-- Map -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="17"
        :markers="mapMarkers"
        :path="routePath"
        :follow-driver="isFollowing"
        :map-bearing="driverBearing"
        :tilt="45"
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

      <!-- Status banner -->
      <div class="status-banner">
        <div class="status-dot" aria-hidden="true"></div>
        <span>Trip in progress</span>
      </div>

      <!-- Passenger card -->
      <div class="passenger-card">
        <div class="p-avatar" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="p-info">
          <div class="p-name">{{ passengerName }}</div>
          <div class="p-sub">{{ dropoffShort }}</div>
        </div>
        <a v-if="passengerPhone" class="call-btn" :href="`tel:${passengerPhone}`" aria-label="Call passenger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
        </a>
        <div v-else class="call-btn call-btn-disabled" aria-label="Passenger phone unavailable">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
        </div>
      </div>

      <!-- Drop-off address -->
      <div class="address-card">
        <span class="addr-dot dot-gold" aria-hidden="true"></span>
        <div class="addr-body">
          <div class="addr-label">Drop-off location</div>
          <div class="addr-title">{{ dropoffShort }}</div>
          <div class="addr-sub">{{ driver.currentRide?.dropoffAddress }}</div>
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
          <a class="maps-link" :href="mapsLink" target="_blank" rel="noopener">Navigate</a>
          <div class="fare-label">Google Maps</div>
        </div>
      </div>

      <!-- End trip -->
      <button class="end-btn" type="button" :disabled="driver.loading" @click="endTrip">
        <svg v-if="driver.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0110 10"/></svg>
        {{ driver.loading ? 'Completing…' : 'End Trip' }}
        <svg v-if="!driver.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import NativeMap from '../../components/NativeMap.vue'
import { useDriverStore } from '../../store/driver'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'
import { decodePolyline } from '../../utils/polyline'
import { computeBearing } from '../../utils/mapIcons'

const router = useRouter()
const driver = useDriverStore()
const auth = useAuthStore()

const routePath = ref<Array<{ lat: number; lng: number }>>([])
const routeDurationMin = ref<number | null>(null)
const routeDistanceKm = ref<number | null>(null)
const carMarkerIcon = 'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png'

// Navigation mode
const isFollowing = ref(true)
const driverBearing = ref(0)
const prevDriverLocation = ref<{ lat: number; lng: number } | null>(null)

function onCameraIdle(coords: { lat: number; lng: number }) {
  if (!isFollowing.value) return
  const driverPos = driver.driverLocation
  if (!driverPos) return
  const dist = Math.hypot(coords.lat - driverPos.lat, coords.lng - driverPos.lng)
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

const mapCenter = computed(() =>
  driver.driverLocation
    ?? (driver.currentRide ? { lat: driver.currentRide.pickupLat, lng: driver.currentRide.pickupLng } : { lat: 14.5995, lng: 120.9842 })
)

const mapMarkers = computed(() => {
  if (!driver.currentRide) return []
  const markers: Array<{
    lat: number; lng: number; title?: string
    iconUrl?: string; iconSize?: { width: number; height: number }
    bearing?: number
  }> = []
  if (driver.driverLocation) {
    markers.push({
      lat: driver.driverLocation.lat,
      lng: driver.driverLocation.lng,
      title: 'Driver',
      bearing: driverBearing.value,
      iconUrl: carMarkerIcon,
      iconSize: { width: 36, height: 36 }
    })
  }
  markers.push({ lat: driver.currentRide.dropoffLat, lng: driver.currentRide.dropoffLng, title: 'Drop-off' })
  return markers
})

const etaText = computed(() => routeDurationMin.value != null ? `~${routeDurationMin.value} min` : '…')
const distanceText = computed(() => routeDistanceKm.value != null ? `${routeDistanceKm.value.toFixed(1)} km` : '…')
const dropoffShort = computed(() => driver.currentRide?.dropoffAddress?.split(',')[0] ?? '')
const fareAmount = computed(() => driver.currentRide ? Math.round(driver.currentRide.fareAmount) : '--')
const passengerName = computed(() => driver.currentRide?.rider?.name || 'Passenger')
const passengerPhone = computed(() => driver.currentRide?.rider?.phone ?? '')
const mapsLink = computed(() => {
  if (!driver.currentRide) return '#'
  const { dropoffLat: lat, dropoffLng: lng } = driver.currentRide
  if (Capacitor.isNativePlatform()) {
    return `google.navigation:q=${lat},${lng}&mode=d`
  }
  const origin = driver.driverLocation
    ? `&origin=${driver.driverLocation.lat},${driver.driverLocation.lng}`
    : ''
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${lat},${lng}&travelmode=driving`
})


// Sequence counter + last-fetch position — avoids stale responses and excessive API calls
let routeSeq = 0
let lastRouteFetchLat = 0
let lastRouteFetchLng = 0
// Minimum distance (degrees ~30 m) the driver must move before re-fetching the route
const ROUTE_REFETCH_THRESHOLD = 0.0003

// Fetch route from driver's current position to dropoff — updates polyline + ETA + distance
async function fetchLiveTripMetrics() {
  if (!driver.currentRide || !driver.driverLocation) {
    routeDurationMin.value = null
    routeDistanceKm.value = null
    return
  }
  const fromLat = driver.driverLocation.lat
  const fromLng = driver.driverLocation.lng
  const toLat   = driver.currentRide.dropoffLat
  const toLng   = driver.currentRide.dropoffLng

  // Skip if driver hasn't moved far enough since last fetch
  const moved = Math.hypot(fromLat - lastRouteFetchLat, fromLng - lastRouteFetchLng)
  if (moved < ROUTE_REFETCH_THRESHOLD && routeSeq > 0) return

  const seq = ++routeSeq
  lastRouteFetchLat = fromLat
  lastRouteFetchLng = fromLng

  try {
    const route = await api.route(fromLat, fromLng, toLat, toLng)
    if (seq !== routeSeq) return
    routePath.value = route.polyline ? decodePolyline(route.polyline) : [
      { lat: fromLat, lng: fromLng },
      { lat: toLat,   lng: toLng   }
    ]
    routeDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
    routeDistanceKm.value = route.distanceMeters / 1000
  } catch {
    if (seq !== routeSeq) return
    routeDurationMin.value = null
    routeDistanceKm.value = null
  }
}

watch(() => driver.driverLocation, (newLoc) => {
  updateDriverBearing(newLoc)
  fetchLiveTripMetrics()
})

onMounted(async () => {
  if (!driver.currentRide) return
  // Restart GPS if it was stopped (e.g. by navigating away from DriverHome).
  // This is the safety net for the root-cause fix in driver.ts.
  const driverId = auth.user?.id
  if (driverId) driver.ensureLocationTracking(driverId)

  if (driver.driverLocation) prevDriverLocation.value = { ...driver.driverLocation }
  await fetchLiveTripMetrics()
})

async function endTrip() {
  const driverId = auth.user?.id
  if (!driverId) return
  await driver.completeTrip(driverId)
  router.replace('/driver/home')
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
  position: absolute;
  bottom: 16px; right: 16px;
  width: 44px; height: 44px;
  border-radius: 50%; border: none;
  background: #fff; color: #00c4bc;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  z-index: 10; cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
}
.recenter-btn:active { transform: scale(0.93); box-shadow: 0 2px 8px rgba(0,0,0,0.14); }

.trip-chip {
  position: absolute; top: 52px; left: 50%; transform: translateX(-50%);
  background: rgba(7,21,36,0.8); backdrop-filter: blur(8px);
  border: 1px solid rgba(0,196,188,0.25); border-radius: 999px;
  padding: 8px 16px; font-size: 12px; font-weight: 700; color: #00c4bc;
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25); z-index: 5;
}

.sheet {
  background: #f1f5f8; border-radius: 28px 28px 0 0;
  margin-top: -28px; padding: 8px 16px 32px;
  display: flex; flex-direction: column; gap: 10px;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.1);
}

.sheet-handle {
  width: 36px; height: 4px; border-radius: 999px;
  background: #d1d5db; margin: 4px auto 2px;
}

.status-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 14px;
  background: rgba(0,196,188,0.08); border: 1px solid rgba(0,196,188,0.2);
  font-size: 13px; font-weight: 700; color: #007d78;
}

.status-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: #00c4bc;
  animation: blink 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.passenger-card {
  display: flex; align-items: center; gap: 12px;
  background: #071524; border-radius: 18px; padding: 14px 16px;
}

.p-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(0,196,188,0.15); border: 1.5px solid rgba(0,196,188,0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.p-name { font-size: 15px; font-weight: 700; color: #fff; }
.p-sub  { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-info { flex: 1; min-width: 0; }

.call-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(0,196,188,0.15); border: 1px solid rgba(0,196,188,0.25);
  color: #00c4bc;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  text-decoration: none;
}

.call-btn-disabled {
  opacity: 0.4;
  pointer-events: none;
}

.address-card {
  background: #fff; border-radius: 18px; padding: 14px 16px;
  display: grid; grid-template-columns: 20px minmax(0,1fr); gap: 12px; align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.addr-dot { width: 12px; height: 12px; flex-shrink: 0; }
.dot-gold { background: #f5a623; border-radius: 3px; box-shadow: 0 0 0 4px rgba(245,166,35,0.15); }
.addr-label { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.addr-title { font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.addr-sub   { font-size: 12px; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.fare-row {
  display: flex; align-items: center;
  background: #fff; border-radius: 18px; padding: 14px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.fare-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.fare-val  { font-size: 15px; font-weight: 800; color: #111827; }
.fare-label{ font-size: 11px; color: #9ca3af; font-weight: 500; }
.fare-divider { width: 1px; height: 28px; background: #e5e7eb; flex-shrink: 0; }

.maps-link {
  font-size: 14px; font-weight: 700; color: #00c4bc;
  text-decoration: none;
}

.end-btn {
  height: 54px; border-radius: 999px; border: none;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff; font-size: 16px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(0,196,188,0.4);
  transition: opacity 0.15s, transform 0.12s;
}

.end-btn:active { opacity: 0.9; transform: scale(0.98); }
.end-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
