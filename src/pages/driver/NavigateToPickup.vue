<template>
  <div class="nav-screen">
    <!-- Map -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="15"
        :markers="mapMarkers"
        :path="routePath"
        map-id="driver-pickup-map"
      />
      <button class="map-back" type="button" @click="router.push('/driver/home')" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="nav-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        {{ etaText }} to pickup
      </div>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import NativeMap from '../../components/NativeMap.vue'
import { useDriverStore } from '../../store/driver'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'
import { decodePolyline } from '../../utils/polyline'

const router = useRouter()
const driver = useDriverStore()
const auth = useAuthStore()

const routePath = ref<Array<{ lat: number; lng: number }>>([])
const routeDurationMin = ref<number | null>(null)
const carMarkerIcon = 'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png'

const mapCenter = computed(() =>
  driver.driverLocation
    ?? (driver.currentRide ? { lat: driver.currentRide.pickupLat, lng: driver.currentRide.pickupLng } : { lat: 14.5995, lng: 120.9842 })
)

const mapMarkers = computed(() => {
  if (!driver.currentRide) return []
  const markers: Array<{
    lat: number
    lng: number
    title?: string
    iconUrl?: string
    iconSize?: { width: number; height: number }
  }> = []
  if (driver.driverLocation) {
    markers.push({
      lat: driver.driverLocation.lat,
      lng: driver.driverLocation.lng,
      title: 'Driver',
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

onMounted(async () => {
  if (!driver.currentRide || !driver.driverLocation) return
  try {
    const route = await api.route(
      driver.driverLocation.lat, driver.driverLocation.lng,
      driver.currentRide.pickupLat, driver.currentRide.pickupLng
    )
    routePath.value = route.polyline ? decodePolyline(route.polyline) : []
    routeDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
  } catch {
    routePath.value = []
  }
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
  border: 1px solid rgba(0,196,188,0.25);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px; font-weight: 700; color: #00c4bc;
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
  background: rgba(0,196,188,0.15);
  border: 1.5px solid rgba(0,196,188,0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.p-name { font-size: 15px; font-weight: 700; color: #fff; }
.p-sub  { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 1px; }

.p-info { flex: 1; min-width: 0; }

.call-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(0,196,188,0.15);
  border: 1px solid rgba(0,196,188,0.25);
  color: #00c4bc;
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
.dot-teal { background: #00c4bc; box-shadow: 0 0 0 4px rgba(0,196,188,0.15); }
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
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff; font-size: 15px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(0,196,188,0.35);
  transition: opacity 0.15s, transform 0.12s;
}

.arrived-btn:active { opacity: 0.9; transform: scale(0.98); }

/* Arrived state */
.arrived-state { display: flex; flex-direction: column; gap: 10px; }

.arrived-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,196,188,0.08); border: 1px solid rgba(0,196,188,0.25);
  border-radius: 14px; padding: 12px 16px;
  font-size: 13px; font-weight: 600; color: #007d78;
}

.start-btn {
  height: 54px; border-radius: 999px; border: none;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff; font-size: 16px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(0,196,188,0.4);
  transition: opacity 0.15s, transform 0.12s;
}

.start-btn:active { opacity: 0.9; transform: scale(0.98); }
.start-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
