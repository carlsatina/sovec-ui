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
        <!-- Car thumbnail -->
        <div class="car-thumb" aria-hidden="true">
          <svg viewBox="0 0 64 32" fill="none">
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
            <!-- bolt -->
            <path d="M35 6 L32 12 H35 L33 17 L38 11 H35 L37 6Z" fill="#f5a623"/>
          </svg>
        </div>

        <!-- Name + meta -->
        <div class="option-body">
          <div class="option-name-row">
            <span class="option-name">E-Ride Taxi</span>
            <span class="ev-badge">⚡ EV</span>
          </div>
          <div class="option-meta-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="option-meta">4 seats</span>
            <span class="meta-dot" aria-hidden="true">·</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            <span class="option-meta">{{ etaText }}</span>
          </div>
        </div>

        <!-- Fare -->
        <div class="fare-block">
          <div class="fare-range">
            <span class="fare-currency">PHP</span>{{ fareLow }}–{{ fareHigh }}
          </div>
          <div class="fare-label">Estimated</div>
        </div>

        <!-- Selected check -->
        <div class="selected-check" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><polyline points="2,7 5.5,10.5 12,3"/></svg>
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5a623"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
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
          <svg v-if="!booking.loading" width="16" height="16" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
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
      booking.dropoff.lat, booking.dropoff.lng
    )
    routePath.value = route.polyline ? decodePolyline(route.polyline) : []
    routeDistanceKm.value = route.distanceMeters / 1000
    routeDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
  } catch (err) {
    routeError.value = err instanceof Error ? err.message : String(err)
    routePath.value = []
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

/* Route chip */
.route-chip {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(7, 21, 36, 0.8);
  backdrop-filter: blur(8px);
  color: #00c4bc;
  border: 1px solid rgba(0,196,188,0.25);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 5;
  letter-spacing: 0.01em;
}

/* Address pills */
.address-pill {
  position: absolute;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  padding: 7px 12px 7px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  max-width: 52%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
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

.pill-dot-teal { background: #00c4bc; }
.pill-dot-gold {
  background: #f5a623;
  border-radius: 2px;
}

/* For other button */
.for-other {
  position: absolute;
  left: 14px;
  bottom: 16px;
  border: none;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  padding: 8px 14px 8px 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  z-index: 5;
  cursor: pointer;
}

.for-other-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(145deg, #8b5cf6, #6d28d9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Sheet ── */
.sheet {
  background: #f1f5f8;
  border-radius: 28px 28px 0 0;
  margin-top: -28px;
  padding: 8px 16px 28px;
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

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  color: #991b1b;
}

/* Section heading */
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.ride-count {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
}

/* ── Option card ── */
.option-card {
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 18px;
  padding: 12px 12px 12px 14px;
  display: grid;
  grid-template-columns: 68px 1fr auto 26px;
  align-items: center;
  gap: 10px;
  transition: border-color 0.15s;
}

.option-card.selected {
  border-color: #00c4bc;
  background: linear-gradient(135deg, #f0fffe 0%, #fff 60%);
  box-shadow: 0 4px 20px rgba(0,196,188,0.14);
}

.car-thumb {
  width: 68px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e0fafa 0%, #c7f4f4 100%);
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

.option-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.option-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.option-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ev-badge {
  background: rgba(0,196,188,0.12);
  color: #007d78;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
}

.option-meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.option-meta {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.meta-dot {
  color: #d1d5db;
  font-size: 14px;
  line-height: 1;
}

.fare-block {
  text-align: right;
  flex-shrink: 0;
}

.fare-range {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.fare-currency {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  margin-right: 1px;
  vertical-align: top;
  line-height: 1.6;
}

.fare-label {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 2px;
}

.selected-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 3px rgba(0,196,188,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  justify-self: center;
}

/* ── Details row ── */
.details-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-pill {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  height: 42px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.detail-pill:active { background: #f8fffe; border-color: #00c4bc; }

.detail-pill.points-pill {
  background: rgba(245,166,35,0.06);
  border-color: rgba(245,166,35,0.3);
  color: #92400e;
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
  background: rgba(0,196,188,0.1);
  color: #00c4bc;
}

.pts-icon {
  background: rgba(245,166,35,0.12);
}

.detail-pill-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-chevron {
  flex-shrink: 0;
  color: #9ca3af;
}

/* ── Invoice row ── */
.invoice-row {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  height: 42px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.invoice-row:active { background: #f8fffe; }

.invoice-chevron { margin-left: auto; flex-shrink: 0; }

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
  height: 52px;
  border-radius: 999px;
  border: 2px solid rgba(7,21,36,0.15);
  background: #fff;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.schedule-btn:active {
  border-color: #00c4bc;
  color: #007d78;
}

.book-btn {
  height: 52px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,196,188,0.4);
  transition: opacity 0.15s, transform 0.12s;
  letter-spacing: -0.01em;
}

.book-btn:active {
  opacity: 0.92;
  transform: scale(0.98);
}

.book-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

@media (max-width: 380px) {
  .option-name   { font-size: 13px; }
  .fare-range    { font-size: 14px; }
  .book-btn      { font-size: 15px; }
  .schedule-btn  { padding: 0 13px; font-size: 13px; }
}
</style>
