<template>
  <div class="progress-screen">

    <!-- Map -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="19"
        :markers="mapMarkers"
        :path="routePath"
        :follow-driver="isFollowing"
        :map-bearing="driverBearing"
        :tilt="0"
        map-id="trip-progress-map"
        @camera-idle="onCameraIdle"
      />
      <div v-if="etaText" class="eta-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        {{ etaText }} to destination
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

      <!-- Driver card -->
      <div class="driver-card">
        <div class="d-avatar" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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

      <!-- Drop-off address -->
      <div class="address-card">
        <span class="addr-dot dot-gold" aria-hidden="true"></span>
        <div class="addr-body">
          <div class="addr-label">Drop-off</div>
          <div class="addr-title">{{ dropoffShort }}</div>
          <div class="addr-sub">{{ booking.dropoff?.address }}</div>
        </div>
      </div>

      <button class="share-btn" type="button">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Share trip status
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NativeMap from '../../components/NativeMap.vue'
import { useBookingStore } from '../../store/booking'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'
import { getSocket } from '../../services/socket'
import { decodePolyline } from '../../utils/polyline'
import { computeBearing } from '../../utils/mapIcons'

const router = useRouter()
const booking = useBookingStore()
const auth = useAuthStore()

const routePath = ref<Array<{ lat: number; lng: number }>>([])
const etaDurationMin = ref<number | null>(null)

// Navigation mode
const isFollowing = ref(true)
const driverBearing = ref(0)
const prevDriverLocation = ref<{ lat: number; lng: number } | null>(null)

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
    markers.push({
      ...booking.driverLocation,
      title: 'Driver',
      // bearing → web map uses SVG Symbol with rotation (reliable on JS API)
      // iconUrl → native Capacitor plugin; must be an HTTPS URL (data: URIs not supported)
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

const etaText = computed(() => etaDurationMin.value != null ? `~${etaDurationMin.value} min` : null)
const dropoffShort = computed(() => booking.dropoff?.address?.split(',')[0] ?? '')
const driverName = computed(() => booking.assignedDriver?.name || 'Your Driver')
const driverPhone = computed(() => booking.assignedDriver?.phone ?? '')
const driverSubtitle = computed(() => {
  const vehicle = booking.assignedDriver?.vehicle
  if (!vehicle) return 'Driver assigned'
  return `${vehicle.model} · ${vehicle.plateNumber}`
})

// Sequence counter — discard responses that arrive out of order
let routeSeq = 0

// Fetch route from driver's CURRENT position to dropoff — called on each location update
async function fetchRoute() {
  if (!booking.driverLocation || !booking.dropoff) return
  const seq = ++routeSeq
  const fromLat = booking.driverLocation.lat
  const fromLng = booking.driverLocation.lng
  const toLat   = booking.dropoff.lat
  const toLng   = booking.dropoff.lng
  try {
    const route = await api.route(fromLat, fromLng, toLat, toLng)
    if (seq !== routeSeq) return  // a newer call already resolved, discard this one
    routePath.value = route.polyline ? decodePolyline(route.polyline) : [
      { lat: fromLat, lng: fromLng },
      { lat: toLat,   lng: toLng   }
    ]
    etaDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
  } catch {
    if (seq !== routeSeq) return
    routePath.value = [{ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }]
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
  padding: 8px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.driver-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #071524;
  border-radius: 18px;
  padding: 14px 16px;
}

.d-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0,196,188,0.15);
  border: 1.5px solid rgba(0,196,188,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.d-name { font-size: 15px; font-weight: 700; color: #fff; }
.d-sub  { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 1px; }
.d-info { flex: 1; min-width: 0; }

.call-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0,196,188,0.15);
  border: 1px solid rgba(0,196,188,0.25);
  color: #00c4bc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-decoration: none;
}

.call-btn-disabled {
  opacity: 0.4;
  pointer-events: none;
}

.address-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 20px minmax(0,1fr);
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.addr-dot { width: 12px; height: 12px; flex-shrink: 0; }
.dot-gold { background: #f5a623; border-radius: 3px; box-shadow: 0 0 0 4px rgba(245,166,35,0.15); }
.addr-label { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.addr-title { font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.addr-sub   { font-size: 12px; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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
</style>
