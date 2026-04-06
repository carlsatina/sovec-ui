<template>
  <div class="confirm-screen">

    <!-- ── Map area ── -->
    <div class="map-container">
      <NativeMap
        :center="mapCenter"
        :zoom="17"
        :map-id="mapId"
        :markers="noMarkers"
        :interactive="true"
        @camera-idle="onCameraIdle"
      />

      <!-- Back button -->
      <button class="map-back" type="button" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>

      <!-- Type label chip -->
      <div class="type-chip">
        <span class="type-dot" :class="type === 'pickup' ? 'dot-teal' : 'dot-gold'" aria-hidden="true"></span>
        {{ type === 'pickup' ? 'Set Pickup' : 'Set Drop-off' }}
      </div>

      <!-- CSS pin fixed at map center -->
      <div class="map-pin-wrap" aria-hidden="true">
        <div class="map-pin-head" :class="{ geocoding }">
          <svg v-if="!geocoding" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="none"/></svg>
          <div v-else class="pin-spinner" aria-hidden="true"></div>
        </div>
        <div class="map-pin-stem" aria-hidden="true"></div>
        <div class="map-pin-shadow" aria-hidden="true"></div>
      </div>
    </div>

    <!-- ── Bottom sheet ── -->
    <section class="sheet">
      <div class="sheet-handle" aria-hidden="true"></div>

      <!-- Geocoding chip -->
      <div class="chip-row">
        <div class="status-chip" :class="{ loading: geocoding }">
          <div v-if="geocoding" class="chip-spinner" aria-hidden="true"></div>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>{{ chipLabel }}</span>
        </div>
      </div>

      <!-- Address card -->
      <div class="address-card">
        <div class="address-dot-wrap" aria-hidden="true">
          <span class="address-dot" :class="type === 'pickup' ? 'dot-teal' : 'dot-gold'"></span>
        </div>
        <div class="address-body">
          <div class="address-label">{{ type === 'pickup' ? 'Pickup location' : 'Drop-off location' }}</div>
          <div class="address-title">{{ titleText }}</div>
          <div class="address-subtitle">{{ subtitleText }}</div>
        </div>
        <button class="address-edit" type="button" aria-label="Edit location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      <!-- Note row -->
      <button class="note-row" type="button">
        <span class="note-icon-wrap" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f6ad8" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </span>
        <span class="note-text">Add a note for driver</span>
        <svg class="note-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
      </button>

      <!-- Confirm button -->
      <button class="confirm-btn" type="button" @click="confirmLocation">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
        {{ confirmLabel }}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NativeMap from '../../components/NativeMap.vue'
import { useBookingStore } from '../../store/booking'
import { api } from '../../services/api'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()

const type = computed(() => (route.params.type === 'dropoff' ? 'dropoff' : 'pickup'))
const current = computed(() => (type.value === 'pickup' ? booking.pickup : booking.dropoff))

const mapCenter = ref(
  current.value
    ? { lat: current.value.lat, lng: current.value.lng }
    : { lat: 14.5995, lng: 120.9842 }
)
const mapId = computed(() => `solvec-map-${type.value}`)
const noMarkers: Array<{ lat: number; lng: number }> = []

const resolvedAddress = ref(current.value?.address ?? '')
const geocoding = ref(false)

const confirmLabel = computed(() => type.value === 'pickup' ? 'Confirm Pickup' : 'Confirm Drop-off')

const chipLabel = computed(() =>
  geocoding.value
    ? 'Finding address…'
    : resolvedAddress.value
      ? `Near ${resolvedAddress.value.split(',')[0]}`
      : 'Move map to select location'
)
const titleText = computed(() =>
  geocoding.value ? '…' : resolvedAddress.value.split(',')[0] || 'Select location'
)
const subtitleText = computed(() =>
  geocoding.value ? '' : resolvedAddress.value || 'Drag the map to pin your location'
)

const latestCoords = ref({ lat: mapCenter.value.lat, lng: mapCenter.value.lng })
let geocodeTimer: ReturnType<typeof setTimeout> | null = null

function onCameraIdle(coords: { lat: number; lng: number }) {
  latestCoords.value = coords
  if (geocodeTimer) clearTimeout(geocodeTimer)
  geocodeTimer = setTimeout(async () => {
    geocoding.value = true
    try {
      const result = await api.reverseGeocode(coords.lat, coords.lng)
      resolvedAddress.value = result.address
      const location = { address: result.address, lat: coords.lat, lng: coords.lng }
      if (type.value === 'pickup') booking.setPickup(location)
      else booking.setDropoff(location)
    } catch {
      // keep existing address on error
    } finally {
      geocoding.value = false
    }
  }, 600)
}

function goBack() {
  router.back()
}

function confirmLocation() {
  if (geocodeTimer) {
    clearTimeout(geocodeTimer)
    geocodeTimer = null
    const location = { address: resolvedAddress.value, lat: latestCoords.value.lat, lng: latestCoords.value.lng }
    if (type.value === 'pickup') booking.setPickup(location)
    else booking.setDropoff(location)
  }

  if (type.value === 'pickup') {
    if (booking.dropoff) {
      router.push('/booking/ride-options')
      return
    }
    router.push('/booking/destination')
    return
  }
  router.push('/booking/ride-options')
}
</script>

<style scoped>
/* ── Screen ── */
.confirm-screen {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Map area ── */
.map-container {
  flex: 1;
  position: relative;
  min-height: 0;
}

.map-container :deep(.native-map) {
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

/* Type chip */
.type-chip {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(7, 21, 36, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 5;
  letter-spacing: 0.01em;
}

.type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-teal { background: #00c4bc; box-shadow: 0 0 0 3px rgba(0,196,188,0.3); }
.dot-gold { background: #f5a623; border-radius: 2px; box-shadow: 0 0 0 3px rgba(245,166,35,0.3); }

/* ── Center pin ── */
.map-pin-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-pin-head {
  width: 44px;
  height: 44px;
  border-radius: 50% 50% 50% 4px;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  transform: rotate(-45deg);
  box-shadow: 0 6px 20px rgba(0,196,188,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, box-shadow 0.2s;
  position: relative;
}

.map-pin-head > svg {
  transform: rotate(45deg);
  flex-shrink: 0;
}

.map-pin-head.geocoding {
  background: linear-gradient(145deg, #6b7280, #4b5563);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.pin-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  transform: rotate(45deg);
}

.map-pin-stem {
  width: 3px;
  height: 10px;
  background: linear-gradient(to bottom, #00908a, transparent);
  margin-top: -2px;
}

.map-pin-shadow {
  width: 14px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  margin-top: 1px;
}

/* ── Sheet ── */
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

/* Status chip */
.chip-row {
  display: flex;
  justify-content: center;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.status-chip.loading {
  border-color: rgba(0,196,188,0.3);
  color: #007d78;
}

.chip-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0,196,188,0.25);
  border-top-color: #00c4bc;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* Address card */
.address-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 14px 14px 16px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  border: 1.5px solid #e5e7eb;
}

.address-dot-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
}

.address-dot {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  display: block;
}

.address-dot.dot-teal {
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 4px rgba(0,196,188,0.15);
}

.address-dot.dot-gold {
  border-radius: 3px;
  background: #f5a623;
  box-shadow: 0 0 0 4px rgba(245,166,35,0.15);
}

.address-body {
  min-width: 0;
}

.address-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 3px;
}

.address-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.address-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.address-edit {
  width: 34px;
  height: 34px;
  border: none;
  background: #f1f5f8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.15s;
}

.address-edit:active { background: #e5e7eb; }

/* Note row */
.note-row {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  height: 44px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.note-row:active { background: #f8fffe; border-color: #00c4bc; }

.note-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(31,106,216,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.note-text {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-align: left;
}

.note-chevron { flex-shrink: 0; }

/* Confirm button */
.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,196,188,0.4);
  transition: opacity 0.15s, transform 0.12s;
  letter-spacing: -0.01em;
}

.confirm-btn:active {
  opacity: 0.92;
  transform: scale(0.98);
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
