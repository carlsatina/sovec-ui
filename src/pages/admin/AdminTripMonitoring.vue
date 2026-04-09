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
      <div class="filter-row">
        <input v-model.trim="driverQuery" class="input" placeholder="Search available drivers" />
        <button class="button button-ghost" type="button" :disabled="loadingDrivers" @click="loadAvailableDrivers">
          {{ loadingDrivers ? 'Loading drivers...' : 'Refresh Driver List' }}
        </button>
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
          <select v-model="preferredDriverByRide[ride.id]" class="input select-input">
            <option value="">Auto-assign nearest available driver</option>
            <option v-for="driver in availableDrivers" :key="driver.id" :value="driver.id">
              {{ driver.name }} ({{ driver.phone }})
            </option>
          </select>
        </div>
        <div v-if="preferredDriverRisk(ride.id)" class="warning-note">
          Warning: {{ preferredDriverRisk(ride.id) }}
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

    <div v-if="confirmReassign" class="modal-backdrop" @click="confirmReassign = null">
      <div
        ref="modalCardRef"
        class="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-reassign-title"
        tabindex="-1"
        @click.stop
      >
        <div id="confirm-reassign-title" class="section-title">Confirm Reassign</div>
        <p class="text-secondary">{{ confirmReassign.risk }}</p>
        <p class="text-secondary">Do you want to continue with this reassign operation?</p>
        <div class="modal-actions">
          <button class="button button-ghost" type="button" @click="confirmReassign = null">Cancel</button>
          <button class="button button-primary" type="button" @click="confirmAndReassign">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { api } from '../../services/api'
import type { AdminAvailableDriver, AdminRide } from '../../services/types'

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
const availableDrivers = ref<AdminAvailableDriver[]>([])
const driverDirectory = ref<AdminAvailableDriver[]>([])
const loadingDrivers = ref(false)
const driverQuery = ref('')
const confirmReassign = ref<{ rideId: string; risk: string } | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null
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

async function loadAvailableDrivers() {
  loadingDrivers.value = true
  error.value = ''
  try {
    const res = await api.adminGetAvailableDrivers({
      q: driverQuery.value || undefined,
      availableOnly: true,
      unassignedOnly: true,
      page: 1,
      limit: 100
    })
    availableDrivers.value = res.items
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loadingDrivers.value = false
  }
}

async function loadDriverDirectory() {
  try {
    const res = await api.adminGetAvailableDrivers({
      availableOnly: false,
      unassignedOnly: false,
      page: 1,
      limit: 100
    })
    driverDirectory.value = res.items
  } catch {
    // Keep the page working even if the extended directory fails to load.
  }
}

const resolvedPreferredDriverByRide = computed<Record<string, AdminAvailableDriver | null>>(() => {
  const byId = new Map<string, AdminAvailableDriver>()
  for (const driver of driverDirectory.value) byId.set(driver.id, driver)
  for (const driver of availableDrivers.value) {
    if (!byId.has(driver.id)) byId.set(driver.id, driver)
  }
  const result: Record<string, AdminAvailableDriver | null> = {}
  for (const [rideId, selectedDriverId] of Object.entries(preferredDriverByRide.value)) {
    result[rideId] = selectedDriverId ? (byId.get(selectedDriverId) ?? null) : null
  }
  return result
})

function preferredDriverRisk(rideId: string) {
  const selected = resolvedPreferredDriverByRide.value[rideId]
  if (!selected) return ''

  const flags: string[] = []
  if (!selected.driverLocation?.isAvailable) {
    flags.push('Selected driver is currently unavailable/offline')
  }
  if (selected.vehicle && (selected.vehicle.status === 'CHARGING' || selected.vehicle.status === 'MAINTENANCE')) {
    flags.push(`Assigned vehicle is in ${selected.vehicle.status}`)
  }
  return flags.join(' · ')
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
  const risk = preferredDriverRisk(rideId)
  if (risk) {
    confirmReassign.value = { rideId, risk }
    return
  }

  await applyReassignRide(rideId)
}

async function applyReassignRide(rideId: string) {
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

async function confirmAndReassign() {
  const pending = confirmReassign.value
  if (!pending) return
  confirmReassign.value = null
  await applyReassignRide(pending.rideId)
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && confirmReassign.value) {
    confirmReassign.value = null
  }
}

watch(confirmReassign, async (value) => {
  if (value) {
    previousFocus = (document.activeElement as HTMLElement | null) ?? null
    await nextTick()
    modalCardRef.value?.focus()
    return
  }
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus()
  }
})

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
  Promise.all([reload(1), loadAvailableDrivers(), loadDriverDirectory()])
  timer = setInterval(() => {
    reload(page.value)
  }, 10_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('keydown', onGlobalKeydown)
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

.warning-note {
  border: 1px solid #f2cd8f;
  background: #fff4df;
  color: #8b5a00;
  border-radius: var(--radius-card);
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
  word-break: break-word;
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1200;
}

.modal-card {
  width: min(520px, 100%);
  border-radius: var(--radius-card);
  background: #fff;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-actions > * {
  flex: 1;
  min-width: 120px;
}

@media (max-width: 720px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
