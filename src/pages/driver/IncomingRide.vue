<template>
  <div class="incoming-overlay">
    <div class="incoming-card">

      <!-- Handle -->
      <div class="sheet-handle" aria-hidden="true"></div>

      <!-- Header -->
      <div class="card-header">
        <div class="request-badge">
          <div class="badge-dot" aria-hidden="true"></div>
          New Ride Request
        </div>
        <!-- Countdown ring -->
        <div class="countdown-wrap" :aria-label="`${timeLeft} seconds to respond`">
          <svg class="countdown-svg" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,196,188,0.15)" stroke-width="3"/>
            <circle
              cx="22" cy="22" r="18"
              fill="none" stroke="#60B45A" stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="`${circumference}`"
              :stroke-dashoffset="`${dashOffset}`"
              transform="rotate(-90 22 22)"
              style="transition: stroke-dashoffset 1s linear"
            />
          </svg>
          <span class="countdown-num">{{ timeLeft }}</span>
        </div>
      </div>

      <!-- Passenger + fare -->
      <div class="passenger-card">
        <div class="passenger-avatar" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="passenger-info">
          <div class="passenger-name">{{ passengerName }}</div>
          <div class="passenger-sub">{{ passengerPhone || 'Phone unavailable' }}</div>
        </div>
        <div class="fare-badge">
          <div class="fare-amount">₱{{ fareEstimate }}</div>
          <div class="fare-label">Est. fare</div>
        </div>
      </div>

      <!-- Route card -->
      <div class="route-card">
        <div class="route-connector" aria-hidden="true"></div>
        <div class="route-row">
          <span class="rdot rdot-green" aria-hidden="true"></span>
          <div class="route-body">
            <div class="route-label">Pickup · {{ distanceToPickup }}</div>
            <div class="route-address">{{ pickupShort }}</div>
          </div>
        </div>
        <div class="route-row">
          <span class="rdot rdot-gold" aria-hidden="true"></span>
          <div class="route-body">
            <div class="route-label">Drop-off · {{ tripDistance }}</div>
            <div class="route-address">{{ dropoffShort }}</div>
          </div>
        </div>
      </div>

      <!-- Call chip -->
      <a v-if="passengerPhone" class="call-chip" :href="`tel:${passengerPhone}`">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
        Call Passenger
      </a>
      <div v-else class="call-chip call-chip-disabled">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81 2 2 0 015 7.07h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 14.91a16 16 0 006 6z"/></svg>
        Phone unavailable
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="decline-btn" type="button" :disabled="driver.loading" @click="decline">
          Decline
        </button>
        <button class="accept-btn" type="button" :disabled="driver.loading" @click="accept">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20,6 9,17 4,12"/></svg>
          {{ driver.loading ? 'Accepting…' : 'Accept Ride' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../../store/driver'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const driver = useDriverStore()
const auth = useAuthStore()

const TIMEOUT = 30
const timeLeft = ref(TIMEOUT)
const circumference = 2 * Math.PI * 18
const dashOffset = computed(() => circumference * (1 - timeLeft.value / TIMEOUT))

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) autoDecline()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function shortLabel(addr: string) {
  return addr?.split(',')[0]?.trim() || addr
}

const pickupShort  = computed(() => shortLabel(driver.currentRide?.pickupAddress  ?? ''))
const dropoffShort = computed(() => shortLabel(driver.currentRide?.dropoffAddress ?? ''))
const fareEstimate = computed(() => driver.currentRide ? Math.round(driver.currentRide.fareAmount) : '--')
const passengerName = computed(() => driver.currentRide?.rider?.name || 'Passenger')
const passengerPhone = computed(() => driver.currentRide?.rider?.phone ?? '')

const distanceToPickup = computed(() => {
  if (!driver.currentRide || !driver.driverLocation) return '—'
  const lat1 = driver.driverLocation.lat, lng1 = driver.driverLocation.lng
  const lat2 = driver.currentRide.pickupLat, lng2 = driver.currentRide.pickupLng
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return `${(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)} km`
})

const tripDistance = computed(() => {
  if (!driver.currentRide) return '--'
  const lat1 = driver.currentRide.pickupLat, lng1 = driver.currentRide.pickupLng
  const lat2 = driver.currentRide.dropoffLat, lng2 = driver.currentRide.dropoffLng
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return `${(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)} km`
})

async function accept() {
  const driverId = auth.user?.id
  if (!driverId) return
  if (timer) { clearInterval(timer); timer = null }
  await driver.acceptRide(driverId)
  router.replace('/driver/pickup')
}

async function decline() {
  const driverId = auth.user?.id
  if (!driverId) return
  if (timer) { clearInterval(timer); timer = null }
  await driver.declineRide(driverId)
  router.replace('/driver/home')
}

async function autoDecline() {
  const driverId = auth.user?.id
  if (!driverId) return
  if (timer) { clearInterval(timer); timer = null }
  await driver.declineRide(driverId)
  router.replace('/driver/home')
}
</script>

<style scoped>
.incoming-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(245,242,238,0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
}

.incoming-card {
  width: 100%;
  background: #fff;
  border-radius: 28px 28px 0 0;
  border-top: 1.5px solid #EDE8E0;
  padding: 6px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 -12px 48px rgba(61,122,56,0.12);
  animation: slide-up 0.35s cubic-bezier(0.22,1,0.36,1) both;
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.sheet-handle {
  width: 36px; height: 4px; border-radius: 999px;
  background: #d1d5db; margin: 4px auto 2px;
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.request-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #3D7A38;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badge-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: #60B45A;
  box-shadow: 0 0 0 3px rgba(96,180,90,0.22);
  animation: blink 1.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

/* Countdown */
.countdown-wrap {
  position: relative; width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
}
.countdown-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.countdown-num { font-size: 14px; font-weight: 800; color: #3D7A38; z-index: 1; }

/* Passenger card */
.passenger-card {
  display: flex; align-items: center; gap: 12px;
  background: #071524; border-radius: 18px; padding: 14px 16px;
}
.passenger-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(96,180,90,0.15); border: 1.5px solid rgba(96,180,90,0.28);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.passenger-info { flex: 1; min-width: 0; }
.passenger-name { font-size: 15px; font-weight: 700; color: #fff; }
.passenger-sub  { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 2px; }

.fare-badge { text-align: right; flex-shrink: 0; }
.fare-amount { font-size: 22px; font-weight: 800; color: #60B45A; letter-spacing: -0.02em; line-height: 1.1; }
.fare-label  { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.04em; }

/* Route card */
.route-card {
  background: #F5F2EE; border: 1.5px solid #EDE8E0;
  border-radius: 18px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 14px;
  position: relative;
}
.route-connector {
  position: absolute; left: 23px; top: 30px; bottom: 30px; width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    #60B45A 0px, #60B45A 4px,
    transparent 4px, transparent 9px
  );
}
.route-row {
  display: grid; grid-template-columns: 20px minmax(0,1fr);
  gap: 10px; align-items: flex-start;
}
.rdot {
  width: 10px; height: 10px; border-radius: 50%;
  margin-top: 4px; flex-shrink: 0; position: relative; z-index: 1;
}
.rdot-green { background: #60B45A; box-shadow: 0 0 0 3px rgba(96,180,90,0.18); }
.rdot-gold  { background: #D4A017; border-radius: 2px; box-shadow: 0 0 0 3px rgba(212,160,23,0.18); }
.route-label   { font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.route-address { font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Call chip */
.call-chip {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  background: rgba(96,180,90,0.08); border: 1.5px solid rgba(96,180,90,0.22);
  border-radius: 999px; font-size: 13px; font-weight: 600; color: #3D7A38;
  align-self: flex-start; text-decoration: none; transition: background 0.15s;
}
.call-chip:active { background: rgba(96,180,90,0.16); }
.call-chip-disabled { color: #9ca3af; background: #F5F2EE; border-color: #EDE8E0; cursor: default; pointer-events: none; }

/* Actions */
.actions { display: grid; grid-template-columns: auto 1fr; gap: 10px; }

.decline-btn {
  height: 54px; padding: 0 24px; border-radius: 999px;
  border: 1.5px solid rgba(197,48,48,0.30); background: #fff;
  color: #C53030; font-size: 15px; font-weight: 700; cursor: pointer;
  transition: background 0.15s; font-family: inherit;
}
.decline-btn:active   { background: #FFF5F5; }
.decline-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.accept-btn {
  height: 54px; border-radius: 999px; border: none;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  color: #fff; font-size: 16px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(96,180,90,0.35);
  transition: opacity 0.15s, transform 0.12s; font-family: inherit;
}
.accept-btn:active  { opacity: 0.92; transform: scale(0.98); }
.accept-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
