<template>
  <div class="route-screen">

    <!-- ── Map area ── -->
    <div class="map-area">
      <NativeMap
        :map-id="'solvec-route-map'"
        :center="mapCenter"
        :zoom="15"
        :markers="mapMarkers"
        :path="routePath"
      />

      <!-- Back button -->
      <button class="map-back" type="button" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>

      <!-- Route summary chip -->
      <div class="route-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        {{ routeSummary }}
      </div>

      <!-- Address pills -->
      <div class="address-pill pickup-pill">
        <span class="pill-dot pill-dot-teal" aria-hidden="true"></span>
        {{ pickupLabel }}
      </div>
      <div class="address-pill dropoff-pill">
        <span class="pill-dot pill-dot-gold" aria-hidden="true"></span>
        {{ dropoffLabel }}
      </div>

      <!-- For other -->
      <button class="for-other" type="button">
        <span class="for-other-avatar" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </span>
        For other
      </button>
    </div>

    <!-- ── Bottom sheet ── -->
    <section class="sheet">
      <div class="sheet-handle" aria-hidden="true"></div>

      <!-- Error banner -->
      <div v-if="fareError || routeError" class="error-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ fareError || routeError }}</span>
      </div>

      <!-- Section heading -->
      <div class="section-heading">
        <span class="section-title">Choose your ride</span>
        <span class="ride-count">1 option</span>
      </div>

      <!-- ── Ride option card ── -->
      <div class="option-card selected">

        <!-- Top row: car + name/badge + check -->
        <div class="option-top">
          <div class="car-thumb" aria-hidden="true">
            <svg viewBox="0 0 64 32" fill="none">
              <rect x="3" y="14" width="58" height="11" rx="3.5" fill="#60B45A"/>
              <path d="M15 14 C17 8 22 5 32 5 C42 5 47 8 49 14Z" fill="#3D7A38"/>
              <path d="M20 14 C21 9 24 7 31 7 L31 14Z" fill="rgba(235,255,235,0.55)"/>
              <path d="M33 14 L33 7 C40 7 43 9 44 14Z" fill="rgba(235,255,235,0.55)"/>
              <circle cx="15" cy="26" r="4" fill="#2D1A06"/>
              <circle cx="15" cy="26" r="1.8" fill="#60B45A"/>
              <circle cx="49" cy="26" r="4" fill="#2D1A06"/>
              <circle cx="49" cy="26" r="1.8" fill="#60B45A"/>
              <rect x="59" y="16" width="3" height="3" rx="1.5" fill="#FFF9C4"/>
              <rect x="2"  y="16" width="3" height="3" rx="1.5" fill="#f87171" opacity="0.7"/>
              <path d="M35 6 L32 12 H35 L33 17 L38 11 H35 L37 6Z" fill="#D4A017"/>
            </svg>
          </div>
          <div class="option-identity">
            <span class="option-name">E-Ride Taxi</span>
            <span class="ev-badge">⚡ EV</span>
          </div>
          <div class="selected-check" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><polyline points="2,7 5.5,10.5 12,3"/></svg>
          </div>
        </div>

        <!-- Divider -->
        <div class="option-divider" aria-hidden="true"></div>

        <!-- Bottom row: info chips + fare -->
        <div class="option-bottom">
          <div class="info-chips">
            <span class="info-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              4 seats
            </span>
            <span class="info-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              {{ etaText }}
            </span>
          </div>
          <div class="fare-block">
            <div class="fare-range">
              <span class="fare-currency">PHP</span>{{ fareLow }}–{{ fareHigh }}
            </div>
            <div class="fare-label">Estimated</div>
            <div v-if="booking.tollEstimate > 0" class="toll-badge">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              +PHP {{ booking.tollEstimate.toFixed(0) }} toll
            </div>
          </div>
        </div>

      </div>

      <!-- ── Details row (payment + points) ── -->
      <div class="details-row">
        <button class="detail-pill" type="button">
          <span class="detail-pill-icon pay-icon" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </span>
          <span class="detail-pill-label">{{ booking.paymentMethod }}</span>
          <svg class="detail-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>
        </button>

        <button class="detail-pill points-pill" type="button">
          <span class="detail-pill-icon pts-icon" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4A017"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
          </span>
          <span class="detail-pill-label">15 pts available</span>
        </button>
      </div>

      <!-- ── Invoice row ── -->
      <button class="invoice-row" type="button">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>Request invoice &amp; add-ons</span>
        <svg class="invoice-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
      </button>

      <!-- ── Bottom actions ── -->
      <div class="bottom-actions">
        <button class="schedule-btn" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Schedule
        </button>

        <button class="book-btn" :disabled="booking.loading" @click="bookRide">
          <svg v-if="!booking.loading" width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0110 10"/></svg>
          <span>{{ booking.loading ? 'Booking…' : 'Book Now' }}</span>
          <svg v-if="!booking.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NativeMap from '../../components/NativeMap.vue'
import { useBookingStore } from '../../store/booking'
import { api } from '../../services/api'
import { decodePolyline } from '../../utils/polyline'

const router = useRouter()
const booking = useBookingStore()

const pickupAddress = computed(() => booking.pickup?.address || 'No pickup selected')
const dropoffAddress = computed(() => booking.dropoff?.address || 'No destination selected')

const routeDistanceKm = ref<number | null>(null)
const routeDurationMin = ref<number | null>(null)
const routePath = ref<Array<{ lat: number; lng: number }>>([])
const fareError = ref<string | null>(null)
const routeError = ref<string | null>(null)

const mapCenter = computed(() => {
  const loc = booking.pickup
  return loc ? { lat: loc.lat, lng: loc.lng } : { lat: 14.5995, lng: 120.9842 }
})
const mapMarkers = computed(() => {
  const markers: Array<{ lat: number; lng: number; title?: string }> = []
  if (booking.pickup)  markers.push({ lat: booking.pickup.lat,  lng: booking.pickup.lng,  title: 'Pickup' })
  if (booking.dropoff) markers.push({ lat: booking.dropoff.lat, lng: booking.dropoff.lng, title: 'Destination' })
  return markers
})

const routeSummary = computed(() => {
  if (routeDurationMin.value != null && routeDistanceKm.value != null)
    return `${routeDurationMin.value} mins · ${routeDistanceKm.value.toFixed(2)} km`
  if (booking.fareEstimate?.durationMin != null && booking.fareEstimate?.distanceKm != null)
    return `${booking.fareEstimate.durationMin} mins · ${booking.fareEstimate.distanceKm.toFixed(2)} km`
  return 'Calculating route…'
})

const fareLow  = computed(() => booking.fareEstimate ? Math.round(booking.fareEstimate.total * 0.90).toString() : '--')
const fareHigh = computed(() => booking.fareEstimate ? Math.round(booking.fareEstimate.total * 1.12).toString() : '--')
const etaText  = computed(() => {
  const mins = routeDurationMin.value ?? booking.fareEstimate?.durationMin
  return mins != null ? `~${mins} min` : '…'
})

const pickupLabel  = computed(() => pickupAddress.value.split(',')[0]  || pickupAddress.value)
const dropoffLabel = computed(() => dropoffAddress.value.split(',')[0] || dropoffAddress.value)

async function loadRoute() {
  if (!booking.pickup || !booking.dropoff) return
  try {
    const route = await api.route(
      booking.pickup.lat, booking.pickup.lng,
      booking.dropoff.lat, booking.dropoff.lng,
      true
    )
    routePath.value = route.polyline ? decodePolyline(route.polyline) : []
    routeDistanceKm.value = route.distanceMeters / 1000
    routeDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
    booking.setTollEstimate(route.tollEstimate ?? 0)
  } catch (err) {
    routeError.value = err instanceof Error ? err.message : String(err)
    routePath.value = []
    booking.setTollEstimate(0)
  }
}

onMounted(async () => {
  if (!booking.pickup || !booking.dropoff) {
    router.replace('/booking/destination')
    return
  }
  const [fareResult, routeResult] = await Promise.allSettled([booking.estimateFare(), loadRoute()])
  if (fareResult.status === 'rejected')
    fareError.value = fareResult.reason instanceof Error ? fareResult.reason.message : String(fareResult.reason)
  if (routeResult.status === 'rejected')
    routeError.value = routeResult.reason instanceof Error ? routeResult.reason.message : String(routeResult.reason)
})

function goBack() { router.back() }

async function bookRide() {
  await booking.createBooking()
  router.push('/booking/finding')
}
</script>

<style scoped>
/* ── Screen ── */
.route-screen {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Map area ── */
.map-area {
  position: relative;
  flex: 1;
  min-height: 0;
}

.map-area :deep(.native-map) {
  border-radius: 0;
  height: 100%;
  min-height: 100%;
}

/* Back button — white frosted */
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
  z-index: 5;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.14);
  transition: background 0.15s;
}

.map-back:active { background: rgba(255,255,255,0.98); }

/* Route summary chip — white frosted */
.route-chip {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #3D7A38;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 5;
  letter-spacing: 0.01em;
}

/* Address pills */
.address-pill {
  position: absolute;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 999px;
  padding: 7px 12px 7px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #2D1A06;
  max-width: 52%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 5;
}

.pickup-pill  { left: 14px;  bottom: 68px; }
.dropoff-pill { right: 14px; bottom: 68px; }

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pill-dot-teal { background: #60B45A; }
.pill-dot-gold { background: #D4A017; border-radius: 2px; }

/* For other button */
.for-other {
  position: absolute;
  left: 14px;
  bottom: 16px;
  border: 1px solid rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 999px;
  padding: 8px 14px 8px 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #2D1A06;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  z-index: 5;
  cursor: pointer;
}

.for-other-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(145deg, #D4A017, #9A7010);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Bottom sheet ── */
.sheet {
  background: #F5F2EE;
  border-radius: 28px 28px 0 0;
  margin-top: -28px;
  padding: 8px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 -6px 24px rgba(0,0,0,0.08);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #E0D8CC;
  margin: 4px auto 4px;
}

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEF0F0;
  border: 1px solid rgba(197,48,48,0.25);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  color: #8B1A1A;
}

/* Section heading */
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #1A1008;
  letter-spacing: -0.02em;
}

.ride-count {
  font-size: 12px;
  font-weight: 600;
  color: #C4BAB0;
  background: #EDE8E0;
  padding: 3px 10px;
  border-radius: 999px;
}

/* ── Option card ── */
.option-card {
  background: #fff;
  border: 1.5px solid #EDE8E0;
  border-radius: 20px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
  cursor: pointer;
}

.option-card.selected {
  border-color: #60B45A;
  border-width: 2px;
  background: linear-gradient(135deg, rgba(96,180,90,0.04) 0%, #fff 55%);
  box-shadow: 0 4px 20px rgba(96,180,90,0.14);
}

/* Top row */
.option-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Car illustration */
.car-thumb {
  width: 80px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #EBF7EA 0%, #D4F0D2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  padding: 4px 6px 0;
}

.car-thumb svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Name + badge */
.option-identity {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.option-name {
  font-size: 15px;
  font-weight: 800;
  color: #1A1008;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.ev-badge {
  background: rgba(96,180,90,0.12);
  color: #3D7A38;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.selected-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #60B45A;
  box-shadow: 0 0 0 3px rgba(96,180,90,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Divider */
.option-divider {
  height: 1px;
  background: #F0EBE3;
  margin: 12px 0;
}

/* Bottom row */
.option-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

/* Info chips */
.info-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #F5F2EE;
  color: #5C4A30;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.info-chip svg {
  color: #9CA3AF;
  flex-shrink: 0;
}

/* Fare block */
.fare-block {
  text-align: right;
  flex-shrink: 0;
}

.fare-range {
  font-size: 17px;
  font-weight: 800;
  color: #1A1008;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.fare-currency {
  font-size: 10px;
  font-weight: 700;
  color: #B0A898;
  margin-right: 1px;
  vertical-align: top;
  line-height: 1.8;
}

.fare-label {
  font-size: 10px;
  color: #C4BAB0;
  font-weight: 500;
  margin-top: 3px;
}

.toll-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 5px;
  background: rgba(212,160,23,0.1);
  color: #7A5C0A;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ── Details row ── */
.details-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-pill {
  background: #fff;
  border: 1px solid #EDE8E0;
  border-radius: 14px;
  height: 44px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #1A1008;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.detail-pill:active {
  background: #FDFAF4;
  border-color: rgba(96,180,90,0.4);
}

.detail-pill.points-pill {
  background: rgba(212,160,23,0.05);
  border-color: rgba(212,160,23,0.28);
  color: #7A5C0A;
}

.detail-pill-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pay-icon {
  background: rgba(96,180,90,0.1);
  color: #60B45A;
}

.pts-icon { background: rgba(212,160,23,0.12); }

.detail-pill-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-chevron {
  flex-shrink: 0;
  color: #C4BAB0;
}

/* ── Invoice row ── */
.invoice-row {
  background: #fff;
  border: 1px solid #EDE8E0;
  border-radius: 14px;
  height: 44px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8C7050;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
}

.invoice-row:active {
  background: #FDFAF4;
  border-color: rgba(96,180,90,0.3);
}

.invoice-chevron { margin-left: auto; flex-shrink: 0; color: #C4BAB0; }

/* ── Bottom actions ── */
.bottom-actions {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  padding-top: 2px;
}

.schedule-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 18px;
  height: 56px;
  border-radius: 999px;
  border: 1.5px solid #EDE8E0;
  background: #fff;
  font-size: 14px;
  font-weight: 700;
  color: #5C3E1A;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-family: inherit;
}

.schedule-btn:active {
  border-color: #60B45A;
  background: #FDFAF4;
}

.book-btn {
  height: 56px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(96,180,90,0.38);
  transition: opacity 0.15s, transform 0.12s;
  letter-spacing: -0.01em;
  font-family: inherit;
}

.book-btn:active {
  opacity: 0.92;
  transform: scale(0.98);
}

.book-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

@media (max-width: 380px) {
  .option-name  { font-size: 13px; }
  .fare-range   { font-size: 14px; }
  .book-btn     { font-size: 15px; }
  .schedule-btn { padding: 0 13px; font-size: 13px; }
}
</style>
