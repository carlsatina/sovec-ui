<template>
  <div class="completed-screen">

    <!-- Hero -->
    <div class="hero">
      <div class="check-wrap" aria-hidden="true">
        <svg class="check-svg" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" stroke="rgba(0,196,188,0.2)" stroke-width="2"/>
          <circle
            cx="40" cy="40" r="36"
            stroke="#60B45A" stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="226"
            stroke-dashoffset="0"
            class="check-ring"
          />
          <polyline
            points="24,40 35,51 56,30"
            stroke="#60B45A" stroke-width="3.5"
            stroke-linecap="round" stroke-linejoin="round"
            class="check-mark"
          />
        </svg>
      </div>

      <div class="hero-title">Trip completed!</div>
      <div class="hero-sub">Great work. Your earnings have been recorded.</div>

      <!-- Earnings pill -->
      <div class="fare-pill">
        <span class="fare-currency">PHP</span>
        <span class="fare-amount">{{ fareDisplay }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Trip summary -->
      <div class="summary-card">
        <div class="summary-row">
          <div class="summary-icon teal-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="summary-body">
            <div class="summary-label">Passenger</div>
            <div class="summary-val">{{ passengerName }}</div>
          </div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row">
          <div class="summary-icon gold-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          </div>
          <div class="summary-body">
            <div class="summary-label">Drop-off</div>
            <div class="summary-val">{{ dropoffShort }}</div>
          </div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row">
          <div class="summary-icon purple-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div class="summary-body">
            <div class="summary-label">Payment</div>
            <div class="summary-val">{{ paymentMethod }}</div>
          </div>
        </div>
      </div>

      <!-- EV impact badge -->
      <div class="ev-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#60B45A" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
        <span>You helped save <strong>~{{ co2Display }} kg CO₂</strong> by driving electric</span>
      </div>

      <!-- CTA -->
      <button class="home-btn" type="button" @click="goHome">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20,6 9,17 4,12"/></svg>
        Back to home
      </button>

      <button class="earnings-btn" type="button" @click="router.replace('/driver/earnings')">
        View earnings
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../../store/driver'

const router = useRouter()
const driver = useDriverStore()

const ride = computed(() => driver.lastCompletedRide)

const fareDisplay   = computed(() => ride.value ? Math.round(ride.value.fareAmount).toString() : '0')
const passengerName = computed(() => ride.value?.rider?.name || 'Passenger')
const dropoffShort  = computed(() => ride.value?.dropoffAddress?.split(',')[0] ?? '—')
const paymentMethod = computed(() => ride.value?.paymentMethod ?? 'CASH')

const co2Display = computed(() => {
  if (!ride.value) return '0.00'
  const lat1 = ride.value.pickupLat,  lng1 = ride.value.pickupLng
  const lat2 = ride.value.dropoffLat, lng2 = ride.value.dropoffLng
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return (distKm * 0.12).toFixed(2)
})

function goHome() {
  driver.lastCompletedRide = null
  router.replace('/driver/home')
}
</script>

<style scoped>
.completed-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f8;
}

/* Hero */
.hero {
  background: linear-gradient(160deg, #071524 0%, #0c2233 55%, #0d3344 100%);
  padding: 56px 20px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.check-wrap { width: 80px; height: 80px; position: relative; }
.check-svg  { width: 100%; height: 100%; display: block; }

.check-ring {
  animation: ring-in 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
  stroke-dashoffset: 226;
}
@keyframes ring-in { to { stroke-dashoffset: 0; } }

.check-mark {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: check-in 0.35s 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
}
@keyframes check-in { to { stroke-dashoffset: 0; } }

.hero-title {
  font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.02em;
}
.hero-sub {
  font-size: 13px; color: rgba(255,255,255,0.45);
  text-align: center; line-height: 1.5; max-width: 260px;
}

.fare-pill {
  display: flex; align-items: flex-start; gap: 5px; margin-top: 4px;
  background: rgba(96,180,90,0.15); border: 1px solid rgba(96,180,90,0.3);
  border-radius: 999px; padding: 8px 20px;
}
.fare-currency { font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.5); margin-top: 6px; }
.fare-amount   { font-size: 36px; font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1; }

/* Body */
.body {
  padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 12px;
}

/* Summary card */
.summary-card {
  background: #fff; border-radius: 18px; padding: 4px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.summary-row {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
}
.summary-icon {
  width: 36px; height: 36px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.teal-icon   { background: rgba(96,180,90,0.1);  color: #60B45A; }
.gold-icon   { background: rgba(245,166,35,0.1);  color: #f5a623; }
.purple-icon { background: rgba(139,92,246,0.1);  color: #8b5cf6; }
.summary-body  { flex: 1; min-width: 0; }
.summary-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.summary-val   { font-size: 15px; font-weight: 700; color: #111827; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.summary-divider { height: 1px; background: #f1f5f8; margin: 0 16px; }

/* EV badge */
.ev-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  background: rgba(96,180,90,0.08); border: 1px solid rgba(96,180,90,0.22);
  border-radius: 14px; font-size: 13px; color: #3D7A38; line-height: 1.4;
}
.ev-badge strong { font-weight: 700; }

/* Buttons */
.home-btn {
  height: 54px; border-radius: 999px; border: none;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  color: #fff; font-size: 16px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 8px 24px rgba(96,180,90,0.35);
  transition: opacity 0.15s, transform 0.12s; font-family: inherit;
}
.home-btn:active { opacity: 0.9; transform: scale(0.98); }

.earnings-btn {
  height: 48px; border-radius: 999px;
  border: 1.5px solid #e5e7eb; background: #fff;
  color: #374151; font-size: 15px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; transition: background 0.15s; font-family: inherit;
}
.earnings-btn:active { background: #f9fafb; }
</style>
