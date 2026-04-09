<template>
  <div class="assigned-screen">

    <!-- Map -->
    <div class="map-area">
      <NativeMap
        :center="mapCenter"
        :zoom="15"
        :markers="mapMarkers"
        :path="routePath"
        map-id="driver-assigned-map"
      />
      <!-- ETA chip -->
      <div v-if="etaText" class="eta-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
        {{ etaText }} away
      </div>
    </div>

    <!-- Sheet -->
    <section class="sheet">
      <div class="sheet-handle" aria-hidden="true"></div>

      <!-- Status banner -->
      <div class="status-banner">
        <div class="status-dot" aria-hidden="true"></div>
        <span>Driver is on the way</span>
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

      <!-- Pickup address -->
      <div class="address-card">
        <span class="addr-dot dot-teal" aria-hidden="true"></span>
        <div class="addr-body">
          <div class="addr-label">Your pickup</div>
          <div class="addr-title">{{ pickupShort }}</div>
          <div class="addr-sub">{{ booking.pickup?.address }}</div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NativeMap from '../../components/NativeMap.vue'
import { useBookingStore } from '../../store/booking'
import { api } from '../../services/api'
import { decodePolyline } from '../../utils/polyline'

const router = useRouter()
const booking = useBookingStore()

const routePath = ref<Array<{ lat: number; lng: number }>>([])
const etaDurationMin = ref<number | null>(null)
const carMarkerIcon = 'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png'

const mapCenter = computed(() =>
  booking.driverLocation
  ?? (booking.pickup ? { lat: booking.pickup.lat, lng: booking.pickup.lng } : { lat: 14.5995, lng: 120.9842 })
)

const mapMarkers = computed(() => {
  const markers: Array<{
    lat: number
    lng: number
    title?: string
    iconUrl?: string
    iconSize?: { width: number; height: number }
  }> = []
  if (booking.driverLocation) {
    markers.push({
      ...booking.driverLocation,
      title: 'Driver',
      iconUrl: carMarkerIcon,
      iconSize: { width: 36, height: 36 }
    })
  }
  if (booking.pickup) markers.push({ lat: booking.pickup.lat, lng: booking.pickup.lng, title: 'Pickup' })
  return markers
})

const etaText = computed(() => etaDurationMin.value != null ? `~${etaDurationMin.value} min` : null)
const pickupShort = computed(() => booking.pickup?.address?.split(',')[0] ?? '')
const driverName = computed(() => booking.assignedDriver?.name || 'Your Driver')
const driverPhone = computed(() => booking.assignedDriver?.phone ?? '')
const driverSubtitle = computed(() => {
  const vehicle = booking.assignedDriver?.vehicle
  if (!vehicle) return 'Driver assigned'
  return `${vehicle.model} · ${vehicle.plateNumber}`
})

async function fetchRoute() {
  if (!booking.driverLocation || !booking.pickup) return
  try {
    const route = await api.route(
      booking.driverLocation.lat, booking.driverLocation.lng,
      booking.pickup.lat, booking.pickup.lng
    )
    routePath.value = route.polyline ? decodePolyline(route.polyline) : []
    etaDurationMin.value = Math.max(1, Math.round(route.durationSeconds / 60))
  } catch {
    routePath.value = []
  }
}

// Re-fetch route whenever driver location updates
watch(() => booking.driverLocation, fetchRoute)

onMounted(() => {
  // Re-subscribe only if handlers were lost (page refresh / direct navigation).
  // During a normal FindingDriver → DriverAssigned transition the subscription
  // is already live; calling resubscribe here would tear down and recreate it,
  // which races with FindingDriver's onBeforeUnmount removing the new handlers.
  if (booking.rideId && !booking.hasActiveSubscription) {
    booking.resubscribeToRideUpdates(booking.rideId)
  }
  if (booking.rideId && !booking.assignedDriver) {
    void booking.refreshRideDetails(booking.rideId)
  }
  fetchRoute()
})

watch(
  () => booking.rideStatus,
  (status) => {
    if (status === 'IN_PROGRESS') router.replace('/booking/in-progress')
    if (status === 'COMPLETED') router.replace('/booking/completed')
  }
)
</script>

<style scoped>
.assigned-screen {
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
.dot-teal { background: #00c4bc; border-radius: 50%; box-shadow: 0 0 0 4px rgba(0,196,188,0.15); }
.addr-label { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.addr-title { font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.addr-sub   { font-size: 12px; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
