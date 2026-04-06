<template>
  <div class="incoming-overlay">
    <div class="incoming-card">
      <!-- Header -->
      <div class="card-header">
        <div class="request-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
          New Ride Request
        </div>
        <!-- Countdown ring -->
        <div class="countdown-wrap" aria-label="`${timeLeft} seconds to respond`">
          <svg class="countdown-svg" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
            <circle
              cx="22" cy="22" r="18"
              fill="none" stroke="#00c4bc" stroke-width="3"
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

      <!-- Passenger info -->
      <div class="passenger-row">
        <div class="passenger-avatar" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div class="passenger-name">Passenger</div>
          <div class="passenger-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            4.8 · 42 trips
          </div>
        </div>
        <div class="fare-badge">
          <div class="fare-amount">PHP {{ fareEstimate }}</div>
          <div class="fare-label">Estimated</div>
        </div>
      </div>

      <!-- Route -->
      <div class="route-card">
        <div class="connector-line" aria-hidden="true"></div>
        <div class="route-row">
          <span class="rdot rdot-teal" aria-hidden="true"></span>
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

      <!-- Payment chip -->
      <div class="payment-chip">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        {{ driver.currentRide?.paymentMethod ?? 'CASH' }}
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

const router = useRouter()
const driver = useDriverStore()

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

const distanceToPickup = computed(() => '~2 km') // would come from driver GPS vs pickup coords
const tripDistance = computed(() => {
  if (!driver.currentRide) return '--'
  const lat1 = driver.currentRide.pickupLat, lng1 = driver.currentRide.pickupLng
  const lat2 = driver.currentRide.dropoffLat, lng2 = driver.currentRide.dropoffLng
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return `${km.toFixed(1)} km`
})

async function accept() {
  if (timer) { clearInterval(timer); timer = null }
  await driver.acceptRide()
  router.replace('/driver/pickup')
}

async function decline() {
  if (timer) { clearInterval(timer); timer = null }
  await driver.declineRide()
  router.replace('/driver/home')
}

async function autoDecline() {
  if (timer) { clearInterval(timer); timer = null }
  await driver.declineRide()
  router.replace('/driver/home')
}
</script>

<style scoped>
.incoming-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(7,21,36,0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  padding: 0;
}

.incoming-card {
  width: 100%;
  background: #0c2233;
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 36px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 -12px 48px rgba(0,196,188,0.15);
  border-top: 1px solid rgba(0,196,188,0.2);
  animation: slide-up 0.35s cubic-bezier(0.22,1,0.36,1) both;
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.request-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #f5a623;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Countdown */
.countdown-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.countdown-num {
  font-size: 14px;
  font-weight: 800;
  color: #00c4bc;
  z-index: 1;
}

/* Passenger */
.passenger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.passenger-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0,196,188,0.12);
  border: 1.5px solid rgba(0,196,188,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.passenger-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.passenger-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
}

.fare-badge {
  margin-left: auto;
  text-align: right;
}

.fare-amount {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.fare-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
}

/* Route card */
.route-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}

.connector-line {
  position: absolute;
  left: 23px;
  top: 30px;
  bottom: 30px;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    #00c4bc 0px, #00c4bc 4px,
    transparent 4px, transparent 9px
  );
}

.route-row {
  display: grid;
  grid-template-columns: 20px minmax(0,1fr);
  gap: 10px;
  align-items: flex-start;
}

.rdot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.rdot-teal { background: #00c4bc; box-shadow: 0 0 0 3px rgba(0,196,188,0.2); }
.rdot-gold { background: #f5a623; border-radius: 2px; box-shadow: 0 0 0 3px rgba(245,166,35,0.2); }

.route-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1px;
}

.route-address {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Payment chip */
.payment-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  align-self: flex-start;
}

/* Actions */
.actions {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
}

.decline-btn {
  height: 54px;
  padding: 0 24px;
  border-radius: 999px;
  border: 2px solid rgba(239,68,68,0.35);
  background: rgba(254,242,242,0.06);
  color: #f87171;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.decline-btn:active { background: rgba(239,68,68,0.12); }
.decline-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.accept-btn {
  height: 54px;
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
  box-shadow: 0 8px 24px rgba(0,196,188,0.35);
  transition: opacity 0.15s, transform 0.12s;
}

.accept-btn:active { opacity: 0.9; transform: scale(0.98); }
.accept-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
