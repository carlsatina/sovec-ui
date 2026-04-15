<template>
  <div class="nav-screen">
    <!-- Map -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="18"
        :markers="mapMarkers"
        :path="routePath"
        :follow-driver="isFollowing"
        :map-bearing="driverBearing"
        :tilt="45"
        :padding-bottom="280"
        map-id="driver-pickup-map"
        @camera-idle="onCameraIdle"
      />
      <button class="map-back" type="button" @click="router.push('/driver/home')" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="nav-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        {{ etaText }} to pickup
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

      <div class="passenger-bar">
        <div class="p-avatar" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="p-info">
          <div class="p-name">{{ passengerName }}</div>
          <div class="p-sub">Waiting at pickup</div>
        </div>
        <a v-if="passengerPhone" class="call-btn" :href="`tel:${passengerPhone}`" aria-label="Call passenger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
        </a>
        <div v-else class="call-btn call-btn-disabled" aria-label="Passenger phone unavailable">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
        </div>
      </div>

      <!-- Pickup address -->
      <div class="address-card">
        <span class="addr-dot dot-teal" aria-hidden="true"></span>
        <div class="addr-body">
          <div class="addr-label">Pickup location</div>
          <div class="addr-title">{{ pickupShort }}</div>
          <div class="addr-sub">{{ driver.currentRide?.pickupAddress }}</div>
        </div>
      </div>

      <!-- Arrived toggle vs Navigate CTA -->
      <div v-if="!driver.arrivedAtPickup" class="action-row">
        <a class="nav-btn" :href="mapsLink" target="_blank" rel="noopener">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polygon points="3,11 22,2 13,21 11,13 3,11"/></svg>
          Navigate
        </a>
        <button class="arrived-btn" type="button" @click="markArrived">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20,6 9,17 4,12"/></svg>
          I've Arrived
        </button>
      </div>

      <!-- Start trip (shown after arriving) -->
      <div v-else class="arrived-state">
        <div class="arrived-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20,6 9,17 4,12"/></svg>
          You've arrived at the pickup point
        </div>
        <button class="start-btn" type="button" :disabled="driver.loading" @click="startTrip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
          {{ driver.loading ? 'Starting…' : 'Start Trip' }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
        </button>
      </div>
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
import { snapToPolyline, lookAheadCenter } from '../../utils/gpsSmoothing'

const router = useRouter()
const driver = useDriverStore()
const auth = useAuthStore()

const routePath = ref<Array<{ lat: number; lng: number }>>([])
const routeDurationMin = ref<number | null>(null)
const carMarkerIcon = 'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png'

// Navigation mode
const isFollowing = ref(true)
const driverBearing = ref(0)
const prevDriverLocation = ref<{ lat: number; lng: number } | null>(null)

function onCameraIdle(coords: { lat: number; lng: number }) {
  if (!isFollowing.value) return
  const driverPos = driver.driverLocation
  if (!driverPos) return
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

const mapCenter = computed(() => {
  const pos = driver.driverLocation
  if (!pos) return driver.currentRide ? { lat: driver.currentRide.pickupLat, lng: driver.currentRide.pickupLng } : { lat: 14.5995, lng: 120.9842 }
  // 75 m: zoom-18 equivalent of the 300 m default (which targets zoom 16, 4× less zoomed).
  // Keeps the driver marker visible above the bottom sheet at this zoom level.
  return lookAheadCenter(pos, driverBearing.value, 75)
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
  markers.push({ lat: driver.currentRide.pickupLat, lng: driver.currentRide.pickupLng, title: 'Pickup' })
  return markers
})

const etaText = computed(() => routeDurationMin.value != null ? `~${routeDurationMin.value} min` : '…')
const pickupShort = computed(() => driver.currentRide?.pickupAddress?.split(',')[0] ?? '')
const passengerName = computed(() => driver.currentRide?.rider?.name || 'Passenger')
const passengerPhone = computed(() => driver.currentRide?.rider?.phone ?? '')
const mapsLink = computed(() => {
  if (!driver.currentRide) return '#'
  const { pickupLat: lat, pickupLng: lng } = driver.currentRide
  // On native Android, google.navigation: launches directly into turn-by-turn GPS.
  // On web/browser it falls back to the maps/dir URL which shows a route preview.
  if (Capacitor.isNativePlatform()) {
    return `google.navigation:q=${lat},${lng}&mode=d`
  }
  const origin = driver.driverLocation
    ? `&origin=${driver.driverLocation.lat},${driver.driverLocation.lng}`
    : ''
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${lat},${lng}&travelmode=driving`
})

let routeSeq = 0
let lastFetchSnappedLat = 0
let lastFetchSnappedLng = 0
const ROUTE_REFETCH_THRESHOLD = 0.0003  // ~30 m of road progress

async function fetchRouteToPickup() {
  if (!driver.currentRide || !driver.driverLocation) {
    routeDurationMin.value = null
    return
  }

  const snapped = snapToPolyline(driver.driverLocation, routePath.value)
  const fromLat = snapped.lat
  const fromLng = snapped.lng
  const toLat   = driver.currentRide.pickupLat
  const toLng   = driver.currentRide.pickupLng

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
    routeDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
  } catch {
    if (seq !== routeSeq) return
    routePath.value = [{ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }]
    routeDurationMin.value = null
  }
}

watch(() => driver.driverLocation, (newLoc) => {
  updateDriverBearing(newLoc)
  fetchRouteToPickup()
})

onMounted(async () => {
  // Restart GPS if it was stopped (e.g. by navigating away from DriverHome).
  // This is the safety net for the root-cause fix in driver.ts.
  const driverId = auth.user?.id
  if (driverId) driver.ensureLocationTracking(driverId)

  if (driver.driverLocation) prevDriverLocation.value = { ...driver.driverLocation }
  await fetchRouteToPickup()
})

function markArrived() {
  const driverId = auth.user?.id
  if (!driverId) return
  driver.markArrived(driverId)
}

async function startTrip() {
  const driverId = auth.user?.id
  if (!driverId) return
  await driver.startTrip(driverId)
  router.replace('/driver/trip')
}
</script>

<style scoped>
.nav-screen {
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
  color: #3D7A38;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  z-index: 10;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
}
.recenter-btn:active { transform: scale(0.93); box-shadow: 0 2px 8px rgba(0,0,0,0.14); }

.map-back {
  position: absolute;
  top: 52px; left: 16px;
  width: 40px; height: 40px;
  border-radius: 12px; border: none;
  background: rgba(7,21,36,0.72);
  backdrop-filter: blur(8px);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  z-index: 5; cursor: pointer;
}

.nav-chip {
  position: absolute;
  top: 52px; left: 50%; transform: translateX(-50%);
  background: rgba(7,21,36,0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(96,180,90,0.3);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px; font-weight: 700; color: #60B45A;
  display: flex; align-items: center; gap: 6px;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 5;
}

/* Sheet */
.sheet {
  background: #f1f5f8;
  border-radius: 28px 28px 0 0;
  margin-top: -28px;
  padding: 8px 16px 32px;
  display: flex; flex-direction: column; gap: 10px;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.1);
}

.sheet-handle {
  width: 36px; height: 4px; border-radius: 999px;
  background: #d1d5db; margin: 4px auto 2px;
}

/* Passenger bar */
.passenger-bar {
  display: flex; align-items: center; gap: 12px;
  background: #071524;
  border-radius: 18px; padding: 14px 16px;
}

.p-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(96,180,90,0.15);
  border: 1.5px solid rgba(96,180,90,0.28);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.p-name { font-size: 15px; font-weight: 700; color: #fff; }
.p-sub  { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 1px; }

.p-info { flex: 1; min-width: 0; }

.call-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(96,180,90,0.15);
  border: 1px solid rgba(96,180,90,0.28);
  color: #60B45A;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  text-decoration: none;
}

.call-btn-disabled {
  opacity: 0.4;
  pointer-events: none;
}

/* Address card */
.address-card {
  background: #fff; border-radius: 18px; padding: 14px 16px;
  display: grid; grid-template-columns: 20px minmax(0,1fr); gap: 12px; align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.addr-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.dot-teal { background: #60B45A; box-shadow: 0 0 0 4px rgba(96,180,90,0.18); }
.addr-label { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.addr-title { font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.addr-sub   { font-size: 12px; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Actions */
.action-row {
  display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;
}

.nav-btn {
  height: 52px; padding: 0 20px; border-radius: 999px;
  border: 2px solid rgba(7,21,36,0.15); background: #fff;
  font-size: 14px; font-weight: 700; color: #374151;
  display: flex; align-items: center; gap: 7px; text-decoration: none;
  white-space: nowrap;
}

.arrived-btn {
  height: 52px; border-radius: 999px; border: none;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  color: #fff; font-size: 15px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(96,180,90,0.35);
  transition: opacity 0.15s, transform 0.12s;
}

.arrived-btn:active { opacity: 0.9; transform: scale(0.98); }

/* Arrived state */
.arrived-state { display: flex; flex-direction: column; gap: 10px; }

.arrived-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(96,180,90,0.08); border: 1px solid rgba(96,180,90,0.25);
  border-radius: 14px; padding: 12px 16px;
  font-size: 13px; font-weight: 600; color: #3D7A38;
}

.start-btn {
  height: 54px; border-radius: 999px; border: none;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  color: #fff; font-size: 16px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(96,180,90,0.4);
  transition: opacity 0.15s, transform 0.12s;
}

.start-btn:active { opacity: 0.9; transform: scale(0.98); }
.start-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
