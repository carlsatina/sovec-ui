<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Analytics & Reports</template>
      <template #subtitle>Operational KPIs and ride/revenue trends</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div v-if="error" class="card">
      <div class="section-title">Analytics request failed</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading analytics...</div>
    </div>

    <template v-else-if="overview">
      <section class="kpis">
        <article class="card kpi">
          <div class="kpi-label">Today Rides</div>
          <div class="kpi-value">{{ overview.today.rides }}</div>
          <div class="text-secondary">Completed {{ overview.today.completedRides }} · Cancelled {{ overview.today.cancelledRides }}</div>
        </article>

        <article class="card kpi">
          <div class="kpi-label">Today Revenue</div>
          <div class="kpi-value">PHP {{ formatAmount(overview.today.revenue) }}</div>
          <div class="text-secondary">Paid + verified payments</div>
        </article>

        <article class="card kpi">
          <div class="kpi-label">Active Drivers</div>
          <div class="kpi-value">{{ overview.activeDrivers }}</div>
          <div class="text-secondary">Currently available drivers</div>
        </article>

        <article class="card kpi">
          <div class="kpi-label">30-Day Completion</div>
          <div class="kpi-value">{{ formatRate(overview.rolling30d.completionRate) }}%</div>
          <div class="text-secondary">Cancellation {{ formatRate(overview.rolling30d.cancellationRate) }}%</div>
        </article>
      </section>

      <div class="card trend-controls">
        <div class="section-title">Trend Window</div>
        <div class="row">
          <button class="button" :class="trendDays === 7 ? 'button-primary' : 'button-ghost'" type="button" @click="setTrendDays(7)">Last 7 Days</button>
          <button class="button" :class="trendDays === 30 ? 'button-primary' : 'button-ghost'" type="button" @click="setTrendDays(30)">Last 30 Days</button>
          <button class="button button-ghost" type="button" :disabled="loadingTrends" @click="loadTrends">{{ loadingTrends ? 'Refreshing...' : 'Refresh' }}</button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">Daily Trend</div>
        <p class="text-secondary">Rides and revenue by day.</p>

        <div v-if="trends.length === 0" class="text-secondary">No trend data for selected range.</div>

        <div v-else class="table-wrap">
          <table class="trend-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Rides</th>
                <th>Completed</th>
                <th>Cancelled</th>
                <th>Revenue (PHP)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in trends" :key="item.day">
                <td>{{ formatDay(item.day) }}</td>
                <td>{{ item.rides }}</td>
                <td>{{ item.completedRides }}</td>
                <td>{{ item.cancelledRides }}</td>
                <td>{{ formatAmount(item.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { api } from '../../services/api'
import type { AdminAnalyticsOverview, AdminAnalyticsTrendItem } from '../../services/types'

const router = useRouter()

const loading = ref(false)
const loadingTrends = ref(false)
const error = ref('')
const overview = ref<AdminAnalyticsOverview | null>(null)
const trends = ref<AdminAnalyticsTrendItem[]>([])
const trendDays = ref(7)

function formatAmount(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '--'
}

function formatRate(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00'
}

function formatDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return day
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

async function loadOverview() {
  const res = await api.adminGetAnalyticsOverview()
  overview.value = res
}

async function loadTrends() {
  loadingTrends.value = true
  try {
    const res = await api.adminGetAnalyticsTrends(trendDays.value)
    trends.value = res.items
  } finally {
    loadingTrends.value = false
  }
}

async function setTrendDays(next: number) {
  trendDays.value = next
  error.value = ''
  try {
    await loadTrends()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  }
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    await Promise.all([loadOverview(), loadTrends()])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.admin-screen {
  max-width: 1120px;
  margin: 0 auto;
}

.back-button {
  min-height: 40px;
  padding: 8px 14px;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-label {
  font-size: 0.85rem;
  color: #667085;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #101828;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-wrap {
  overflow-x: auto;
}

.trend-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}

.trend-table th,
.trend-table td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #eaecf0;
  font-size: 0.9rem;
}

.trend-table th {
  color: #475467;
  font-weight: 600;
}

@media (max-width: 960px) {
  .kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .kpis {
    grid-template-columns: 1fr;
  }
}
</style>
