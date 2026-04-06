<template>
  <div class="finding-screen">

    <!-- ── Full-screen map ── -->
    <div class="map-container">
      <NativeMap :center="mapCenter" :markers="mapMarkers" :path="routePath" :zoom="15" />

      <!-- Back button -->
      <button class="map-back" type="button" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>

      <!-- Pickup chip -->
      <div class="pickup-chip">
        <span class="pickup-dot" aria-hidden="true"></span>
        {{ pickupLabel }}
      </div>
    </div>

    <!-- ── Draggable bottom sheet ── -->
    <section ref="sheetRef" class="sheet" :style="sheetStyle">

      <!-- Grabber -->
      <div
        class="sheet-grabber"
        @pointerdown="onDragStart"
        @pointermove="onDragMove"
        @pointerup="onDragEnd"
        @pointercancel="onDragEnd"
      >
        <div class="sheet-handle" aria-hidden="true"></div>
      </div>

      <!-- Drag zone with animated search UI -->
      <div
        class="sheet-drag-zone"
        @pointerdown="onDragStart"
        @pointermove="onDragMove"
        @pointerup="onDragEnd"
        @pointercancel="onDragEnd"
      >
        <!-- Radar animation -->
        <div class="radar-wrap" aria-hidden="true">
          <div class="radar-ring radar-ring-3"></div>
          <div class="radar-ring radar-ring-2"></div>
          <div class="radar-ring radar-ring-1"></div>
          <div class="radar-car">
            <svg viewBox="0 0 64 32" fill="none" class="radar-car-svg">
              <rect x="3" y="14" width="58" height="11" rx="3.5" fill="#00c4bc"/>
              <path d="M15 14 C17 8 22 5 32 5 C42 5 47 8 49 14Z" fill="#00908a"/>
              <path d="M20 14 C21 9 24 7 31 7 L31 14Z" fill="rgba(220,255,255,0.55)"/>
              <path d="M33 14 L33 7 C40 7 43 9 44 14Z" fill="rgba(220,255,255,0.55)"/>
              <circle cx="15" cy="26" r="4" fill="#071524"/>
              <circle cx="15" cy="26" r="1.8" fill="#00c4bc"/>
              <circle cx="49" cy="26" r="4" fill="#071524"/>
              <circle cx="49" cy="26" r="1.8" fill="#00c4bc"/>
              <rect x="59" y="16" width="3" height="3" rx="1.5" fill="#fde68a"/>
              <rect x="2"  y="16" width="3" height="3" rx="1.5" fill="#f87171" opacity="0.7"/>
              <path d="M35 6 L32 12 H35 L33 17 L38 11 H35 L37 6Z" fill="#f5a623"/>
            </svg>
          </div>
        </div>

        <h2 class="sheet-title">Finding your driver<br><span class="brand-name">E-Ride Taxi</span></h2>
        <p class="sheet-sub">Connecting you with the nearest EV taxi. Hold tight!</p>

        <!-- Animated driver dots -->
        <div class="driver-dots" aria-hidden="true">
          <span class="driver-dot dot-1"></span>
          <span class="driver-dot dot-2"></span>
          <span class="driver-dot dot-3"></span>
        </div>
      </div>

      <!-- Trip summary card -->
      <button class="trip-card" :class="{ expanded }" type="button" @click="toggleDetails">
        <div class="trip-head">
          <div class="trip-brand">
            <div class="trip-logo" aria-hidden="true">
              <svg viewBox="0 0 64 32" fill="none" class="trip-car-svg">
                <rect x="3" y="14" width="58" height="11" rx="3.5" fill="#00c4bc"/>
                <path d="M15 14 C17 8 22 5 32 5 C42 5 47 8 49 14Z" fill="#00908a"/>
                <circle cx="15" cy="26" r="4" fill="#071524"/>
                <circle cx="15" cy="26" r="1.8" fill="#00c4bc"/>
                <circle cx="49" cy="26" r="4" fill="#071524"/>
                <circle cx="49" cy="26" r="1.8" fill="#00c4bc"/>
                <rect x="59" y="16" width="3" height="3" rx="1.5" fill="#fde68a"/>
                <path d="M35 6 L32 12 H35 L33 17 L38 11 H35 L37 6Z" fill="#f5a623"/>
              </svg>
            </div>
            <div>
              <div class="trip-name">E-Ride Taxi <span class="ev-badge">⚡ EV</span></div>
              <div class="trip-time">{{ bookingTime }}</div>
            </div>
          </div>
          <div class="trip-ref-wrap">
            <div class="trip-ref">{{ plateCode }}</div>
            <span class="trip-expand-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5"><polyline :points="expanded ? '18,15 12,9 6,15' : '6,9 12,15 18,9'"/></svg>
            </span>
          </div>
        </div>

        <!-- Expanded details -->
        <transition name="details">
          <div v-if="expanded" class="trip-details">
            <div class="route-lines">
              <div class="connector-line" aria-hidden="true"></div>
              <div class="location-line">
                <span class="line-dot dot-pickup" aria-hidden="true"></span>
                <div class="line-body">
                  <div class="line-label">Pickup</div>
                  <div class="line-title">{{ pickupLabel }}</div>
                  <div class="line-subtitle">{{ booking.pickup?.address }}</div>
                </div>
              </div>
              <div class="location-line">
                <span class="line-dot dot-dropoff" aria-hidden="true"></span>
                <div class="line-body">
                  <div class="line-label">Drop-off · {{ distanceLabel }}</div>
                  <div class="line-title">{{ dropoffLabel }}</div>
                  <div class="line-subtitle">{{ booking.dropoff?.address }}</div>
                </div>
              </div>
            </div>
            <div class="payment-row">
              <div class="payment-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <span>{{ booking.paymentMethod }}</span>
              </div>
              <strong class="payment-fare">{{ fareRange }}</strong>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
            </div>
          </div>
        </transition>
      </button>

      <!-- Support row -->
      <transition name="details">
        <button v-if="expanded" class="support-row" type="button">
          <span class="support-icon-wrap" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011 1.22 2 2 0 012.92 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </span>
          <span class="support-label">Service &amp; support</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
        </button>
      </transition>

      <!-- Cancel button -->
      <transition name="details">
        <button v-if="expanded" class="cancel-btn" type="button" :disabled="booking.loading" @click="cancelBooking">
          <svg v-if="booking.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0110 10"/></svg>
          {{ booking.loading ? 'Cancelling…' : 'Cancel Booking' }}
        </button>
      </transition>

    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NativeMap from '../../components/NativeMap.vue'
import { useBookingStore } from '../../store/booking'
import { api } from '../../services/api'
import { decodePolyline } from '../../utils/polyline'

const router = useRouter()
const booking = useBookingStore()
const expanded = ref(false)
const routePath = ref<Array<{ lat: number; lng: number }>>([])
const routeDistanceKm = ref<number | null>(null)
const sheetRef = ref<HTMLElement | null>(null)
const sheetOffset = ref(0)
const maxSheetOffset = ref(0)
const snapPoints = ref([0, 0, 0])
const activeSnap = ref(2)
const dragging = ref(false)
const dragPrimed = ref(false)
const pointerId = ref<number | null>(null)
const dragStartY = ref(0)
const dragStartOffset = ref(0)
const lastY = ref(0)
const lastTime = ref(0)
const dragVelocity = ref(0)
const justDraggedUntil = ref(0)
const collapsedPeek = 280
const pendingOffset = ref(0)
const rafId = ref<number | null>(null)

const mapCenter = computed(() => {
  const loc = booking.pickup
  return loc ? { lat: loc.lat, lng: loc.lng } : { lat: 14.5995, lng: 120.9842 }
})
const mapMarkers = computed(() => {
  const markers: Array<{ lat: number; lng: number; title?: string }> = []
  if (booking.pickup) markers.push({ lat: booking.pickup.lat, lng: booking.pickup.lng, title: 'Pickup' })
  if (booking.dropoff) markers.push({ lat: booking.dropoff.lat, lng: booking.dropoff.lng, title: 'Drop-off' })
  return markers
})

const pickupLabel = computed(() => shortLabel(booking.pickup?.address || 'Pickup'))
const dropoffLabel = computed(() => shortLabel(booking.dropoff?.address || 'Drop-off'))
const plateCode = computed(() => booking.rideId ? `REF: ${booking.rideId.slice(0, 8).toUpperCase()}` : 'REF: PENDING…')
const bookingTime = computed(() => {
  const now = new Date()
  const hm = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const dmy = now.toLocaleDateString('en-GB')
  return `${hm} · ${dmy}`
})

const distanceLabel = computed(() => {
  const km = routeDistanceKm.value ?? booking.fareEstimate?.distanceKm
  return km != null ? `${km.toFixed(2)} km` : '-- km'
})

const fareRange = computed(() => {
  if (!booking.fareEstimate) return 'PHP --'
  const low = booking.fareEstimate.total * 0.9
  const high = booking.fareEstimate.total * 1.12
  return `${booking.fareEstimate.currency} ${low.toFixed(2)}–${booking.fareEstimate.currency} ${high.toFixed(2)}`
})

const sheetStyle = computed(() => ({
  transform: `translateY(${sheetOffset.value}px)`,
  transition: dragging.value ? 'none' : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)'
}))

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function recalcSheetBounds() {
  const height = sheetRef.value?.scrollHeight ?? 0
  const peek = window.innerWidth <= 480 ? 220 : collapsedPeek
  maxSheetOffset.value = Math.max(0, height - peek)
  const mid = Math.round(maxSheetOffset.value * 0.5)
  snapPoints.value = [0, mid, maxSheetOffset.value]
  snapTo(activeSnap.value)
}

function setSheetOffset(next: number) {
  pendingOffset.value = next
  if (rafId.value != null) return
  rafId.value = window.requestAnimationFrame(() => {
    sheetOffset.value = pendingOffset.value
    rafId.value = null
  })
}

function nearestSnapIndex(value: number) {
  let best = 0
  let min = Number.POSITIVE_INFINITY
  snapPoints.value.forEach((point, idx) => {
    const distance = Math.abs(point - value)
    if (distance < min) { min = distance; best = idx }
  })
  return best
}

function snapTo(index: number) {
  const clamped = Math.min(snapPoints.value.length - 1, Math.max(0, index))
  activeSnap.value = clamped
  expanded.value = clamped < 2
  setSheetOffset(snapPoints.value[clamped] ?? 0)
}

function onDragStart(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const target = event.currentTarget as HTMLElement | null
  target?.setPointerCapture?.(event.pointerId)
  dragging.value = true
  dragPrimed.value = false
  pointerId.value = event.pointerId
  dragStartY.value = event.clientY
  dragStartOffset.value = sheetOffset.value
  lastY.value = event.clientY
  lastTime.value = event.timeStamp
  dragVelocity.value = 0
}

function onDragMove(event: PointerEvent) {
  if (!dragging.value || pointerId.value !== event.pointerId) return
  const delta = event.clientY - dragStartY.value
  if (!dragPrimed.value && Math.abs(delta) < 8) return
  dragPrimed.value = true
  event.preventDefault()
  const nextOffset = clamp(dragStartOffset.value + delta, 0, maxSheetOffset.value)
  setSheetOffset(nextOffset)
  const dt = Math.max(1, event.timeStamp - lastTime.value)
  const instantVelocity = (event.clientY - lastY.value) / dt
  dragVelocity.value = dragVelocity.value * 0.7 + instantVelocity * 0.3
  lastY.value = event.clientY
  lastTime.value = event.timeStamp
}

function onDragEnd(event: PointerEvent) {
  if (!dragging.value || pointerId.value !== event.pointerId) return
  const target = event.currentTarget as HTMLElement | null
  target?.releasePointerCapture?.(event.pointerId)
  dragging.value = false
  pointerId.value = null
  if (!dragPrimed.value) return
  let targetIndex = nearestSnapIndex(sheetOffset.value)
  if (dragVelocity.value <= -0.45) targetIndex = Math.max(0, targetIndex - 1)
  else if (dragVelocity.value >= 0.45) targetIndex = Math.min(snapPoints.value.length - 1, targetIndex + 1)
  justDraggedUntil.value = Date.now() + 200
  snapTo(targetIndex)
}

function toggleDetails() {
  if (Date.now() < justDraggedUntil.value) return
  snapTo(expanded.value ? 2 : 1)
}

function shortLabel(address: string) {
  return address.split(',')[0]?.trim() || address
}

async function loadRoute() {
  if (!booking.pickup || !booking.dropoff) return
  try {
    const route = await api.route(
      booking.pickup.lat, booking.pickup.lng,
      booking.dropoff.lat, booking.dropoff.lng
    )
    routePath.value = route.polyline ? decodePolyline(route.polyline) : []
    routeDistanceKm.value = route.distanceMeters / 1000
  } catch {
    routePath.value = [
      { lat: booking.pickup.lat, lng: booking.pickup.lng },
      { lat: booking.dropoff.lat, lng: booking.dropoff.lng }
    ]
  }
}

// Navigate as soon as a driver accepts (status → ARRIVING) or any later status
watch(() => booking.rideStatus, (status) => {
  if (status === 'ARRIVING' || status === 'IN_PROGRESS' || status === 'COMPLETED') {
    router.replace('/booking/driver-assigned')
  }
})

onMounted(async () => {
  if (!booking.pickup || !booking.dropoff) {
    router.replace('/booking/destination')
    return
  }

  // Re-subscribe in case this component mounted after createBooking() already ran
  // (e.g. navigated back and forward, or page restored from bfcache)
  if (booking.rideId && booking.rideStatus !== 'CANCELLED') {
    booking.resubscribeToRideUpdates(booking.rideId)
  }

  if (!booking.fareEstimate) await booking.estimateFare()
  await loadRoute()
  await nextTick()
  recalcSheetBounds()
  snapTo(2)
  window.addEventListener('resize', recalcSheetBounds)
})

function goBack() { router.back() }

async function cancelBooking() {
  try {
    await booking.cancelBooking()
  } catch {
    return
  }
  router.back()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', recalcSheetBounds)
  if (rafId.value != null) window.cancelAnimationFrame(rafId.value)
  // Do NOT unsubscribe here — the ride is still active and DriverAssigned
  // needs the same socket handlers. Subscription is cleaned up by cancelBooking()
  // or when the ride completes in TripInProgress.
})
</script>

<style scoped>
/* ── Screen ── */
.finding-screen {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Map ── */
.map-container {
  position: absolute;
  inset: 0;
}

.map-container :deep(.native-map) {
  border-radius: 0;
  min-height: 100vh;
}

/* Back button */
.map-back {
  position: absolute;
  top: 52px;
  left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: rgba(7, 21, 36, 0.72);
  backdrop-filter: blur(8px);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  cursor: pointer;
  transition: background 0.15s;
}

.map-back:active { background: rgba(7, 21, 36, 0.9); }

/* Pickup chip */
.pickup-chip {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(7, 21, 36, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0,196,188,0.25);
  border-radius: 999px;
  padding: 9px 18px 9px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 5;
}

.pickup-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 3px rgba(0,196,188,0.3);
  flex-shrink: 0;
}

/* ── Sheet ── */
.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  border-radius: 28px 28px 0 0;
  padding: 0 16px 32px;
  background: #f1f5f8;
  display: flex;
  flex-direction: column;
  gap: 10px;
  will-change: transform;
  max-height: min(92vh, calc(100vh - 12px));
  overflow-y: auto;
  overscroll-behavior: contain;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.15);
}

.sheet-grabber {
  padding: 10px 0 4px;
  touch-action: none;
  cursor: grab;
}

.sheet-drag-zone {
  touch-action: none;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 4px;
  gap: 8px;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #d1d5db;
  margin: 0 auto;
}

/* ── Radar animation ── */
.radar-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px auto 0;
}

.radar-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(0,196,188,0.35);
  animation: radar-pulse 2.4s ease-out infinite;
}

.radar-ring-1 { width: 60px;  height: 60px;  animation-delay: 0s; }
.radar-ring-2 { width: 90px;  height: 90px;  animation-delay: 0.6s; }
.radar-ring-3 { width: 120px; height: 120px; animation-delay: 1.2s; }

@keyframes radar-pulse {
  0%   { opacity: 0.8; transform: scale(0.6); }
  70%  { opacity: 0.2; }
  100% { opacity: 0;   transform: scale(1); }
}

.radar-car {
  width: 56px;
  height: 28px;
  z-index: 1;
  animation: car-float 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(0,196,188,0.4));
}

.radar-car-svg {
  width: 100%;
  height: auto;
  display: block;
}

@keyframes car-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}

/* Sheet text */
.sheet-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  text-align: center;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.brand-name {
  color: #00c4bc;
}

.sheet-sub {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;
}

/* Animated dots */
.driver-dots {
  display: flex;
  gap: 7px;
  justify-content: center;
  margin: 2px 0 6px;
}

.driver-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00c4bc;
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.dot-1 { animation-delay: 0s; }
.dot-2 { animation-delay: 0.2s; }
.dot-3 { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%            { transform: scale(1.1); opacity: 1; }
}

/* ── Trip card ── */
.trip-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  padding: 14px 14px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.trip-card.expanded {
  border-color: rgba(0,196,188,0.4);
  box-shadow: 0 6px 24px rgba(0,196,188,0.1);
}

.trip-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.trip-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.trip-logo {
  width: 52px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e0fafa, #c7f4f4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px 5px 0;
}

.trip-car-svg {
  width: 100%;
  height: auto;
  display: block;
}

.trip-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.ev-badge {
  background: rgba(0,196,188,0.12);
  color: #007d78;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}

.trip-time {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 2px;
}

.trip-ref-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.trip-ref {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.04em;
}

/* ── Trip expanded details ── */
.trip-details {
  border-top: 1px solid #f1f5f8;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.route-lines {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.connector-line {
  position: absolute;
  left: 5px;
  top: 20px;
  bottom: 30px;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    #00c4bc 0px, #00c4bc 4px,
    transparent 4px, transparent 9px
  );
}

.location-line {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 10px;
  align-items: flex-start;
}

.line-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 10px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.dot-pickup {
  background: #00c4bc;
  box-shadow: 0 0 0 3px rgba(0,196,188,0.15);
}

.dot-dropoff {
  background: #f5a623;
  border-radius: 3px;
  box-shadow: 0 0 0 3px rgba(245,166,35,0.15);
}

.line-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1px;
}

.line-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-subtitle {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-row {
  border-top: 1px solid #f1f5f8;
  padding-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.payment-fare {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

/* ── Support row ── */
.support-row {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 13px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.support-row:active { background: #f8fffe; border-color: #00c4bc; }

.support-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(0,196,188,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* ── Cancel button ── */
.cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 50px;
  border: 2px solid rgba(239,68,68,0.3);
  border-radius: 999px;
  background: rgba(254,242,242,0.8);
  color: #dc2626;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.cancel-btn:active {
  background: #fee2e2;
  border-color: #dc2626;
}

.cancel-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── Transitions ── */
.details-enter-active,
.details-leave-active {
  transition: max-height 220ms ease, opacity 220ms ease, transform 220ms ease;
  overflow: hidden;
}

.details-enter-from,
.details-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

.details-enter-to,
.details-leave-from {
  max-height: 700px;
  opacity: 1;
  transform: translateY(0);
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
