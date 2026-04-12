<template>
  <div class="assigned-screen">

    <!-- ── Map (fills all space behind the sheet) ── -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="19"
        :markers="mapMarkers"
        :path="routePath"
        :follow-driver="isFollowing"
        :map-bearing="driverBearing"
        :tilt="0"
        map-id="driver-assigned-map"
        @camera-idle="onCameraIdle"
      />

      <!-- Back -->
      <button class="map-back" type="button" @click="router.back()" aria-label="Go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <!-- ETA + pickup address bubble (like reference Image 1) -->
      <div v-if="etaText" class="map-eta-bubble">
        <div class="map-eta-badge">{{ etaText }}</div>
        <div class="map-pickup-label">{{ pickupShort }}</div>
      </div>

      <!-- Recenter button — shown when user has panned away -->
      <button v-if="!isFollowing" class="recenter-btn" type="button" @click="isFollowing = true" aria-label="Recenter on driver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </button>
    </div>

    <!-- ── Draggable bottom sheet ── -->
    <div
      class="sheet-wrapper"
      :class="{ expanded: isExpanded }"
      :style="dragStyle"
    >
      <!-- Drag handle — tap or drag to toggle -->
      <div
        class="sheet"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend.passive="onTouchEnd"
      >
        <div class="sheet-handle-wrap" @click="toggleSheet">
          <div class="sheet-handle" aria-hidden="true"></div>
        </div>

        <!-- ── ALWAYS VISIBLE: hero + driver card ── -->

        <!-- Hero headline -->
        <div class="hero-section">
          <div class="live-dot" aria-hidden="true"></div>
          <div class="hero-text-block">
            <h2 class="hero-title">
              <span class="hero-driver-name">{{ driverName }}</span>
              will pick you up in
              <span class="hero-eta">{{ etaText ?? '…' }}</span>
            </h2>
            <p class="hero-sub">Hold on! Your driver is on the way to you.</p>
          </div>
        </div>

        <!-- Driver card -->
        <div class="card driver-card">

          <!-- Identity -->
          <div class="driver-identity">
            <div class="d-avatar" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="d-info">
              <div class="d-name-row">
                <span class="d-name">{{ driverName }}</span>
                <div class="d-rating">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#D4A017" aria-hidden="true">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  <span>{{ driverRating }}</span>
                </div>
              </div>
              <div class="d-vehicle-row">
                <span class="d-plate-badge">{{ plateNumber }}</span>
                <span class="d-vehicle-meta">{{ vehicleMeta }}</span>
              </div>
            </div>
          </div>

          <div class="card-divider"></div>

          <!-- Comm actions -->
          <div class="comm-row">
            <button class="msg-btn" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0A898" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <span class="msg-placeholder">Message the driver…</span>
            </button>
            <a v-if="driverPhone" class="icon-action-btn" :href="`tel:${driverPhone}`" aria-label="Call driver">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/>
              </svg>
            </a>
            <button v-else class="icon-action-btn" type="button" disabled aria-label="Call driver">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/>
              </svg>
            </button>
            <button class="icon-action-btn" type="button" aria-label="Safety options">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </button>
          </div>

          <div class="card-divider"></div>

          <!-- Share -->
          <button class="share-row" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8C7050" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span class="share-label">Share ride details</span>
            <span class="share-action">Share</span>
          </button>
        </div>

        <!-- ── EXPANDED ONLY: trip details + support + cancel ── -->
        <div class="expandable-section">

          <!-- Trip detail card -->
          <div class="card trip-card">

            <!-- Booking ref + time -->
            <div class="trip-meta-row">
              <div class="trip-meta-col">
                <span class="trip-meta-label">Booking ref</span>
                <div class="trip-ref-row">
                  <span class="trip-ref">{{ bookingRef }}</span>
                  <button class="copy-btn" type="button" aria-label="Copy booking reference">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="trip-meta-col trip-meta-right">
                <span class="trip-meta-label">Time</span>
                <span class="trip-meta-val">{{ bookingTime }}</span>
              </div>
            </div>

            <div class="card-divider"></div>

            <!-- Route display -->
            <div class="route-display">
              <div class="route-line-wrap" aria-hidden="true">
                <div class="route-dot route-dot-green"></div>
                <div class="route-connector-line"></div>
                <div class="route-dot route-dot-gold"></div>
              </div>
              <div class="route-stops">
                <div class="route-stop">
                  <div class="route-stop-title">{{ pickupShort }}</div>
                  <div class="route-stop-sub">{{ booking.pickup?.address }}</div>
                </div>
                <div class="route-stop">
                  <div class="route-stop-title">{{ dropoffShort }}</div>
                  <div class="route-stop-sub">
                    <span v-if="distanceText" class="distance-badge">{{ distanceText }}</span>
                    {{ booking.dropoff?.address }}
                  </div>
                </div>
              </div>
            </div>

            <div class="card-divider"></div>

            <!-- Payment + fare -->
            <div class="payment-row">
              <div class="payment-icon-wrap" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8C7050" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <span class="payment-method">{{ booking.paymentMethod }}</span>
              <span class="fare-range">{{ fareDisplay }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4BAB0" stroke-width="2.5">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </div>

            <!-- Fare notice -->
            <div class="fare-notice">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8C7050" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>This is an estimated fare only. Final fare will be determined by the taxi meter.</span>
            </div>
          </div>

          <!-- Support -->
          <button class="card support-row" type="button">
            <div class="support-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60B45A" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <span class="support-label">Service information &amp; support</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4BAB0" stroke-width="2.5">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>

          <!-- Cancel -->
          <button class="cancel-btn" type="button" @click="cancelRide">
            Cancel Booking
          </button>

          <div style="height: 24px;"></div>
        </div>

      </div><!-- .sheet -->
    </div><!-- .sheet-wrapper -->

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

// ── Sheet drag state ──
const COLLAPSED_TRANSLATE = 'calc(100% - 340px)'   // show 340px from bottom
const isExpanded = ref(false)
let touchStartY = 0
let dragDeltaY  = 0
const isDragging = ref(false)
const liveTranslate = ref<string | null>(null)

const dragStyle = computed(() => {
  if (isDragging.value && liveTranslate.value != null) {
    return { transform: `translateY(${liveTranslate.value})`, transition: 'none' }
  }
  return {}
})

function toggleSheet() {
  isExpanded.value = !isExpanded.value
}

function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
  dragDeltaY  = 0
  isDragging.value = false
  liveTranslate.value = null
}

function onTouchMove(e: TouchEvent) {
  const dy = e.touches[0].clientY - touchStartY
  dragDeltaY = dy
  isDragging.value = true
  // Clamp: can't drag below collapsed position or above 0
  const clampedDy = isExpanded.value
    ? Math.max(0, dy)                // expanded → can only drag down
    : Math.min(0, dy)                // collapsed → can only drag up
  liveTranslate.value = isExpanded.value
    ? `${clampedDy}px`
    : `calc(100% - 340px + ${clampedDy}px)`
}

function onTouchEnd(_e: TouchEvent) {
  isDragging.value = false
  liveTranslate.value = null
  const threshold = 60
  if (!isExpanded.value && dragDeltaY < -threshold) {
    isExpanded.value = true
  } else if (isExpanded.value && dragDeltaY > threshold) {
    isExpanded.value = false
  }
}

// ── Map / route ──
const routePath = ref<Array<{ lat: number; lng: number }>>([])
const etaDurationMin = ref<number | null>(null)
const routeDistanceKm = ref<number | null>(null)

// Navigation mode — lock camera to driver; disable when user pans away
const isFollowing = ref(true)

// Directional car icon — bearing tracked for web Symbol rotation and map heading
const driverBearing = ref(0)
const prevDriverLocation = ref<{ lat: number; lng: number } | null>(null)

function onCameraIdle(coords: { lat: number; lng: number }) {
  if (!isFollowing.value) return
  const driverPos = booking.driverLocation
  if (!driverPos) return
  // If camera center drifted far from driver position, user must have panned manually
  const dist = Math.hypot(coords.lat - driverPos.lat, coords.lng - driverPos.lng)
  if (dist > 0.005) isFollowing.value = false
}

const mapCenter = computed(() =>
  booking.driverLocation
  ?? (booking.pickup ? { lat: booking.pickup.lat, lng: booking.pickup.lng } : { lat: 14.5995, lng: 120.9842 })
)

const mapMarkers = computed(() => {
  const markers: Array<{
    lat: number; lng: number; title?: string
    iconUrl?: string; iconSize?: { width: number; height: number }
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
  if (booking.pickup) markers.push({ lat: booking.pickup.lat, lng: booking.pickup.lng, title: 'Pickup' })
  return markers
})

// ── Computed display values ──
const etaText      = computed(() => etaDurationMin.value != null ? `${etaDurationMin.value} mins` : null)
const pickupShort  = computed(() => booking.pickup?.address?.split(',')[0] ?? 'Pickup')
const dropoffShort = computed(() => booking.dropoff?.address?.split(',')[0] ?? 'Drop-off')
const driverName   = computed(() => booking.assignedDriver?.name || 'Your Driver')
const driverPhone  = computed(() => booking.assignedDriver?.phone ?? '')
const driverRating = computed(() => (booking.assignedDriver as any)?.rating?.toFixed(1) ?? '–')
const plateNumber  = computed(() => booking.assignedDriver?.vehicle?.plateNumber ?? '–––')
const vehicleMeta  = computed(() => {
  const v = booking.assignedDriver?.vehicle
  if (!v) return 'E-Ride EV Taxi'
  return `${v.model}${(v as any).color ? ' · ' + (v as any).color : ''}`
})
const distanceText = computed(() =>
  routeDistanceKm.value != null ? `${routeDistanceKm.value.toFixed(2)} km` : null
)
const fareDisplay  = computed(() => {
  if (!booking.fareEstimate) return '–'
  const low  = Math.round(booking.fareEstimate.total * 0.90)
  const high = Math.round(booking.fareEstimate.total * 1.12)
  return `₱${low} – ₱${high}`
})
const bookingRef   = computed(() => {
  const id = booking.rideId ?? ''
  return id.length > 14 ? id.slice(0, 14) + '…' : id || '–'
})
const bookingTime  = computed(() => {
  const now = new Date()
  const t = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const d = now.toLocaleDateString('en-PH', { month: '2-digit', day: '2-digit', year: 'numeric' })
  return `${t} · ${d}`
})

async function fetchRoute() {
  if (!booking.driverLocation || !booking.pickup) return
  try {
    const route = await api.route(
      booking.driverLocation.lat, booking.driverLocation.lng,
      booking.pickup.lat, booking.pickup.lng,
      true
    )
    routePath.value       = route.polyline ? decodePolyline(route.polyline) : []
    etaDurationMin.value  = Math.max(1, Math.round(route.durationSeconds / 60))
    routeDistanceKm.value = route.distanceMeters / 1000
  } catch {
    routePath.value = []
  }
}

/** Update the car icon rotation whenever the driver moves. */
function updateDriverBearing(newLoc: { lat: number; lng: number } | null | undefined) {
  if (!newLoc) return
  if (prevDriverLocation.value) {
    const dist = Math.hypot(
      newLoc.lat - prevDriverLocation.value.lat,
      newLoc.lng - prevDriverLocation.value.lng
    )
    // Only update bearing if the car actually moved (avoids jitter on tiny GPS noise)
    if (dist > 0.00005) {
      driverBearing.value = computeBearing(prevDriverLocation.value, newLoc)
    }
  }
  prevDriverLocation.value = { ...newLoc }
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
  // Seed the previous location so the first real update computes a bearing
  if (booking.driverLocation) {
    prevDriverLocation.value = { ...booking.driverLocation }
  }
  fetchRoute()
})

watch(
  () => booking.rideStatus,
  (status) => {
    if (status === 'IN_PROGRESS') router.replace('/booking/in-progress')
    if (status === 'COMPLETED')   router.replace('/booking/completed')
  }
)

function cancelRide() {
  // TODO: trigger cancellation flow
}
</script>

<style scoped>
/* ── Screen ── */
.assigned-screen {
  height: 100vh;
  overflow: hidden;
  position: relative;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Map: fills the entire screen behind the sheet ── */
.map-area {
  position: absolute;
  inset: 0;
}

.map-area :deep(.native-map) {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  border-radius: 0;
}

/* Back button */
.map-back {
  position: absolute;
  top: 52px;
  left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #2D1A06;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.14);
  transition: background 0.15s;
}
.map-back:active { background: #fff; }

/* Recenter button — bottom-right, appears when user pans away */
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

/* ETA + pickup label bubble (top-left, below back button) */
.map-eta-bubble {
  position: absolute;
  top: 104px;
  left: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-eta-badge {
  display: inline-flex;
  align-self: flex-start;
  background: #FDF7E6;
  border: 1px solid rgba(212,160,23,0.35);
  color: #7A5C0A;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  letter-spacing: 0.01em;
}

.map-pickup-label {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.7);
  color: #1A1008;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.10);
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Sheet wrapper: slides up/down ── */
.sheet-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* push most content off-screen when collapsed, revealing ~340px */
  transform: translateY(calc(100% - 340px));
  transition: transform 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  z-index: 20;
}

.sheet-wrapper.expanded {
  transform: translateY(0);
}

/* ── Sheet itself ── */
.sheet {
  background: #F5F2EE;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -6px 32px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px;
  /* allow scrolling when expanded */
  max-height: 92vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sheet::-webkit-scrollbar { display: none; }

/* Handle */
.sheet-handle-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #E0D8CC;
}

/* ── Hero section ── */
.hero-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 2px 0 4px;
  flex-shrink: 0;
}

.live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #60B45A;
  flex-shrink: 0;
  margin-top: 5px;
  box-shadow: 0 0 0 3px rgba(96,180,90,0.22);
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(96,180,90,0.22); }
  50%       { box-shadow: 0 0 0 7px rgba(96,180,90,0.06); }
}

.hero-text-block { flex: 1; min-width: 0; }

.hero-title {
  font-size: 18px;
  font-weight: 800;
  color: #1A1008;
  line-height: 1.35;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}

.hero-driver-name { color: #3D7A38; font-weight: 900; }
.hero-eta         { color: #60B45A; font-weight: 900; }

.hero-sub {
  font-size: 13px;
  color: #B0A898;
  margin: 0;
  font-weight: 500;
}

/* ── Generic card ── */
.card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #EDE8E0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  overflow: hidden;
  flex-shrink: 0;
}

.card-divider {
  height: 1px;
  background: #F5F0E8;
}

/* ── Driver card ── */
.driver-card { display: flex; flex-direction: column; }

.driver-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 14px;
}

.d-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(96,180,90,0.3);
}

.d-info { flex: 1; min-width: 0; }

.d-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.d-name {
  font-size: 15px;
  font-weight: 800;
  color: #1A1008;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.d-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 700;
  color: #8C7050;
  flex-shrink: 0;
}

.d-vehicle-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.d-plate-badge {
  background: #1A1008;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.d-vehicle-meta {
  font-size: 12px;
  color: #B0A898;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Comm row */
.comm-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
}

.msg-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F5F0E8;
  border: none;
  border-radius: 12px;
  height: 42px;
  padding: 0 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.msg-btn:active { background: #EDE8E0; }

.msg-placeholder {
  font-size: 13px;
  color: #C4BAB0;
  font-weight: 500;
}

.icon-action-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #F5F0E8;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5C3E1A;
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none;
  transition: background 0.15s;
}
.icon-action-btn:active { background: #EDE8E0; }
.icon-action-btn[disabled] { opacity: 0.38; pointer-events: none; }

/* Share row */
.share-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
}
.share-row:active { background: #FDFAF4; }
.share-label { flex: 1; font-size: 13px; font-weight: 600; color: #5C3E1A; }
.share-action { font-size: 13px; font-weight: 700; color: #60B45A; }

/* ── Expandable section ── */
.expandable-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Trip card ── */
.trip-card { display: flex; flex-direction: column; }

.trip-meta-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 16px;
  gap: 8px;
}

.trip-meta-col { display: flex; flex-direction: column; gap: 2px; }
.trip-meta-right { align-items: flex-end; }

.trip-meta-label {
  font-size: 10px;
  font-weight: 700;
  color: #C4BAB0;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.trip-ref-row { display: flex; align-items: center; gap: 6px; }

.trip-ref {
  font-size: 13px;
  font-weight: 700;
  color: #1A1008;
  font-family: 'Courier New', monospace;
}

.copy-btn {
  background: #F5F0E8;
  border: none;
  border-radius: 6px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8C7050;
  cursor: pointer;
}

.trip-meta-val {
  font-size: 13px;
  font-weight: 600;
  color: #5C3E1A;
}

/* Route display */
.route-display {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 0 10px;
  padding: 16px;
}

.route-line-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 3px;
}

.route-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  flex-shrink: 0;
}

.route-dot-green {
  background: #60B45A;
  box-shadow: 0 0 0 3px rgba(96,180,90,0.2);
}

.route-dot-gold {
  background: #D4A017;
  border-radius: 3px;
  box-shadow: 0 0 0 3px rgba(212,160,23,0.2);
}

.route-connector-line {
  flex: 1;
  width: 2px;
  min-height: 24px;
  margin: 4px 0;
  background: repeating-linear-gradient(
    to bottom,
    #E0D8CC 0px, #E0D8CC 4px,
    transparent 4px, transparent 9px
  );
}

.route-stops { display: flex; flex-direction: column; gap: 20px; }

.route-stop-title {
  font-size: 14px;
  font-weight: 700;
  color: #1A1008;
  letter-spacing: -0.01em;
}

.route-stop-sub {
  font-size: 12px;
  color: #B0A898;
  margin-top: 2px;
  line-height: 1.4;
}

.distance-badge {
  display: inline-block;
  background: #EBF5EA;
  color: #3D7A38;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  margin-right: 4px;
}

/* Payment row */
.payment-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
}

.payment-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #F5F0E8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-method { flex: 1; font-size: 14px; font-weight: 600; color: #1A1008; }

.fare-range {
  font-size: 14px;
  font-weight: 800;
  color: #1A1008;
  letter-spacing: -0.02em;
}

/* Fare notice */
.fare-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 12px 14px;
  background: #FDF7E6;
  border: 1px solid rgba(212,160,23,0.2);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  color: #7A5C0A;
  line-height: 1.5;
  font-weight: 500;
}
.fare-notice svg { flex-shrink: 0; margin-top: 1px; }

/* Support row */
.support-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  background: #fff;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
}
.support-row:active { background: #FDFAF4; }

.support-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #EBF5EA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support-label { flex: 1; font-size: 14px; font-weight: 600; color: #1A1008; }

/* Cancel */
.cancel-btn {
  background: transparent;
  border: none;
  color: #C53030;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 0;
  text-align: center;
  letter-spacing: 0.01em;
  transition: opacity 0.15s;
  font-family: inherit;
  flex-shrink: 0;
}
.cancel-btn:active { opacity: 0.7; }
</style>
