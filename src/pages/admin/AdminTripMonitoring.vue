<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Trip Monitoring</template>
      <template #subtitle>Live operations view for active and recent rides</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div class="card filters">
      <div class="filter-row">
        <input v-model.trim="q" class="input" placeholder="Search ride ID, rider, driver, pickup, dropoff" />
        <select v-model="status" class="input select-input">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="filter-row">
        <label class="toggle">
          <input v-model="activeOnly" type="checkbox" />
          <span>Active only</span>
        </label>
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply Filters</button>
      </div>
      <p class="text-secondary">Auto-refresh every 10 seconds</p>
    </div>

    <div v-if="error" class="card">
      <div class="section-title">Could not load rides</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading rides...</div>
      <p class="text-secondary">Fetching live operations feed</p>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="section-title">No rides found</div>
      <p class="text-secondary">No rides match your current filter set.</p>
    </div>

    <div v-else class="rides">
      <article v-for="ride in items" :key="ride.id" class="card ride-card">
        <div class="ride-head">
          <div>
            <div class="section-title">Ride {{ shortId(ride.id) }}</div>
            <p class="text-secondary">{{ formatDate(ride.createdAt) }}</p>
          </div>
          <span class="chip" :class="chipClass(ride.status)">{{ ride.status }}</span>
        </div>
        <div class="text-secondary">Rider: {{ ride.rider?.name || '—' }} ({{ ride.rider?.phone || '—' }})</div>
        <div class="text-secondary">Driver: {{ ride.driver?.name || 'Unassigned' }} {{ ride.driver?.phone ? `(${ride.driver.phone})` : '' }}</div>
        <div class="route">
          <div><strong>From:</strong> {{ ride.pickupAddress }}</div>
          <div><strong>To:</strong> {{ ride.dropoffAddress }}</div>
        </div>
        <div class="text-secondary">Fare: {{ ride.currency }} {{ formatFare(ride.fareAmount) }} · {{ ride.paymentMethod }}</div>
        <div class="action-row">
          <input
            v-model.trim="reasonByRide[ride.id]"
            class="input"
            placeholder="Operator note / reason"
          />
          <input
            v-model.trim="preferredDriverByRide[ride.id]"
            class="input"
            placeholder="Preferred driver ID (optional)"
          />
        </div>
        <div class="action-row">
          <button
            class="button button-ghost"
            type="button"
            :disabled="busyByRide[ride.id]"
            @click="reassignRide(ride.id)"
          >
            {{ busyByRide[ride.id] ? 'Working...' : 'Reassign Driver' }}
          </button>
          <button
            class="button button-primary danger-button"
            type="button"
            :disabled="busyByRide[ride.id]"
            @click="forceCancelRide(ride.id)"
          >
            {{ busyByRide[ride.id] ? 'Working...' : 'Force Cancel' }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="items.length > 0" class="card pagination">
      <button class="button button-ghost" type="button" :disabled="loading || page <= 1" @click="reload(page - 1)">Previous</button>
      <div class="text-secondary">Page {{ page }} of {{ totalPages }} · {{ total }} total</div>
      <button class="button button-ghost" type="button" :disabled="loading || page >= totalPages" @click="reload(page + 1)">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { api } from '../../services/api'
import type { AdminRide } from '../../services/types'

const router = useRouter()
const statuses = ['REQUESTED', 'FINDING_DRIVER', 'ASSIGNED', 'ARRIVING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const

const q = ref('')
const status = ref('')
const activeOnly = ref(true)
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const items = ref<AdminRide[]>([])
const reasonByRide = ref<Record<string, string>>({})
const preferredDriverByRide = ref<Record<string, string>>({})
const busyByRide = ref<Record<string, boolean>>({})
let timer: ReturnType<typeof setInterval> | null = null

function shortId(value: string) {
  return value.slice(0, 8)
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatFare(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '--'
}

function chipClass(value: string) {
  if (value === 'IN_PROGRESS' || value === 'ARRIVING') return 'chip-warn'
  if (value === 'ASSIGNED' || value === 'FINDING_DRIVER' || value === 'REQUESTED') return 'chip-info'
  if (value === 'COMPLETED') return 'chip-ok'
  if (value === 'CANCELLED') return 'chip-bad'
  return ''
}

async function reload(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetRides({
      q: q.value || undefined,
      status: status.value || undefined,
      activeOnly: activeOnly.value,
      page: nextPage,
      limit: 12
    })
    items.value = res.items
    const reasonMap: Record<string, string> = {}
    const preferredMap: Record<string, string> = {}
    for (const item of res.items) {
      reasonMap[item.id] = reasonByRide.value[item.id] ?? ''
      preferredMap[item.id] = preferredDriverByRide.value[item.id] ?? ''
    }
    reasonByRide.value = reasonMap
    preferredDriverByRide.value = preferredMap
    page.value = res.page
    totalPages.value = res.totalPages
    total.value = res.total
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

async function forceCancelRide(rideId: string) {
  busyByRide.value[rideId] = true
  error.value = ''
  try {
    await api.adminForceCancelRide(rideId, reasonByRide.value[rideId] || undefined)
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busyByRide.value[rideId] = false
  }
}

async function reassignRide(rideId: string) {
  busyByRide.value[rideId] = true
  error.value = ''
  try {
    await api.adminReassignRide(rideId, {
      reason: reasonByRide.value[rideId] || undefined,
      preferredDriverId: preferredDriverByRide.value[rideId] || undefined
    })
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busyByRide.value[rideId] = false
  }
}

onMounted(() => {
  reload(1)
  timer = setInterval(() => {
    reload(page.value)
  }, 10_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
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

.filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-row > * {
  flex: 1;
  min-width: 180px;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: #fff;
}

.select-input {
  padding-top: 12px;
  padding-bottom: 12px;
}

.rides {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ride-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ride-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.route {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-row > * {
  flex: 1;
  min-width: 180px;
}

.danger-button {
  background: #b02222;
}

.chip-ok {
  background: #e6f7ed;
  color: #116b3a;
}

.chip-bad {
  background: #ffecec;
  color: #8b1d1d;
}

.chip-warn {
  background: #fff8e6;
  color: #8b5a00;
}

.chip-info {
  background: #eaf2ff;
  color: #1f4d8f;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

@media (max-width: 720px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
