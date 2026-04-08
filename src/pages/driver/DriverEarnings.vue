<template>
  <div class="earnings-screen">

    <!-- Hero header -->
    <div class="hero">
      <button class="back-btn" type="button" @click="router.push('/driver/home')" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="hero-title">Earnings</div>

      <!-- Period selector -->
      <div class="period-tabs">
        <button
          v-for="p in periods"
          :key="p.key"
          class="period-tab"
          :class="{ active: period === p.key }"
          type="button"
          @click="period = p.key"
        >{{ p.label }}</button>
      </div>

      <!-- Big earnings number -->
      <div class="hero-amount">
        <span class="currency">PHP</span>
        <span class="amount">{{ totalEarnings }}</span>
      </div>
      <div class="hero-sub">{{ periodLabel }} earnings</div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Stats row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon teal-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 6v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="stat-val">{{ totalTrips }}</div>
          <div class="stat-label">Trips</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon gold-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          </div>
          <div class="stat-val">{{ totalHours }}h</div>
          <div class="stat-label">Online</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          </div>
          <div class="stat-val">{{ avgRating }}</div>
          <div class="stat-label">Rating</div>
        </div>
      </div>

      <!-- Recent trips -->
      <section>
        <div class="section-row">
          <span class="section-title">Recent Trips</span>
        </div>

        <div v-if="recentTrips.length === 0" class="empty-state">
          <div class="empty-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 6v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="empty-title">No trips yet</div>
          <div class="empty-sub">Go online to start earning with E-Ride Taxi.</div>
        </div>

        <ul v-else class="trip-list">
          <li v-for="trip in recentTrips" :key="trip.id" class="trip-item">
            <div class="trip-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 6v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <div class="trip-info">
              <div class="trip-route">{{ trip.from }} → {{ trip.to }}</div>
              <div class="trip-meta">{{ trip.date }} · {{ trip.distance }}</div>
            </div>
            <div class="trip-fare">PHP {{ trip.fare }}</div>
          </li>
        </ul>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/auth'
import type { DriverEarningsResponse } from '../../services/types'

const router = useRouter()
const auth = useAuthStore()

const periods = [
  { key: 'today',  label: 'Today' },
  { key: 'week',   label: 'Week' },
  { key: 'month',  label: 'Month' },
]

const period = ref('today')
const loading = ref(false)
const earnings = ref<DriverEarningsResponse | null>(null)

const periodLabel = computed(() => periods.find(p => p.key === period.value)?.label ?? '')

const totalEarnings = computed(() => Math.round(earnings.value?.totalEarnings ?? 0))
const totalTrips = computed(() => earnings.value?.totalTrips ?? 0)
const totalHours = computed(() => earnings.value?.totalHours ?? 0)
const avgRating = computed(() => earnings.value?.avgRating ?? '—')
const recentTrips = computed(() =>
  (earnings.value?.recentTrips ?? []).map((trip) => ({
    ...trip,
    date: new Date(trip.date).toLocaleDateString(),
    distance: trip.distanceKm != null ? `${trip.distanceKm.toFixed(1)} km` : '—',
    fare: Math.round(trip.fare).toString()
  }))
)

async function fetchEarnings() {
  const driverId = auth.user?.id
  if (!driverId) return
  loading.value = true
  try {
    earnings.value = await api.driverGetEarnings(driverId, period.value as 'today' | 'week' | 'month')
  } finally {
    loading.value = false
  }
}

onMounted(fetchEarnings)
watch(period, fetchEarnings)
</script>

<style scoped>
.earnings-screen {
  min-height: 100vh;
  display: flex; flex-direction: column;
  background: #f1f5f8;
}

/* Hero */
.hero {
  background: linear-gradient(160deg, #071524 0%, #0c2233 55%, #0d3344 100%);
  padding: 52px 20px 28px;
  display: flex; flex-direction: column; gap: 14px;
}

.back-btn {
  width: 38px; height: 38px; border-radius: 12px; border: none;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; cursor: pointer; align-self: flex-start;
}

.hero-title {
  font-size: 20px; font-weight: 700; color: #fff;
  letter-spacing: -0.02em; margin-top: -4px;
}

.period-tabs {
  display: flex; gap: 6px;
}

.period-tab {
  padding: 7px 16px; border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent; color: rgba(255,255,255,0.5);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}

.period-tab.active {
  background: #00c4bc; border-color: #00c4bc; color: #fff;
  box-shadow: 0 4px 12px rgba(0,196,188,0.35);
}

.hero-amount {
  display: flex; align-items: flex-start; gap: 6px;
  margin-top: 4px;
}

.currency {
  font-size: 20px; font-weight: 700; color: rgba(255,255,255,0.5);
  margin-top: 8px;
}

.amount {
  font-size: 52px; font-weight: 800; color: #fff;
  letter-spacing: -0.04em; line-height: 1;
}

.hero-sub {
  font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 500;
  margin-top: -6px;
}

/* Body */
.body {
  padding: 20px 16px; display: flex; flex-direction: column; gap: 20px;
}

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}

.stat-card {
  background: #fff; border-radius: 18px; padding: 16px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 36px; height: 36px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.teal-icon   { background: rgba(0,196,188,0.1);  color: #00c4bc; }
.gold-icon   { background: rgba(245,166,35,0.1);  color: #f5a623; }
.purple-icon { background: rgba(139,92,246,0.1);  color: #8b5cf6; }

.stat-val   { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
.stat-label { font-size: 11px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

/* Section */
.section-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title { font-size: 16px; font-weight: 700; color: #111827; letter-spacing: -0.01em; }

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 40px 24px; gap: 10px; text-align: center;
}

.empty-icon {
  width: 60px; height: 60px; border-radius: 18px;
  background: rgba(0,196,188,0.08);
  display: flex; align-items: center; justify-content: center;
}

.empty-title { font-size: 16px; font-weight: 700; color: #111827; }
.empty-sub   { font-size: 13px; color: #9ca3af; line-height: 1.5; }

/* Trip list */
.trip-list {
  list-style: none; margin: 0; padding: 0;
  background: #fff; border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.trip-item {
  display: grid; grid-template-columns: 40px minmax(0,1fr) auto;
  gap: 12px; align-items: center;
  padding: 14px 16px; border-bottom: 1px solid #f1f5f8;
}

.trip-item:last-child { border-bottom: none; }

.trip-icon {
  width: 38px; height: 38px; border-radius: 12px;
  background: rgba(0,196,188,0.08);
  display: flex; align-items: center; justify-content: center;
}

.trip-route { font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trip-meta  { font-size: 12px; color: #9ca3af; margin-top: 2px; }
.trip-fare  { font-size: 15px; font-weight: 800; color: #111827; white-space: nowrap; }
</style>
