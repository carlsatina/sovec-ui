<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Fleet Management</template>
      <template #subtitle>Manage EV units, assignments, and status</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <form class="card form" @submit.prevent="createVehicle">
      <div class="section-title">Register Vehicle</div>
      <div class="grid">
        <input v-model.trim="newVehicle.plateNumber" class="input" placeholder="Plate Number" required />
        <input v-model.trim="newVehicle.model" class="input" placeholder="Model" required />
        <input v-model.number="newVehicle.capacity" class="input" type="number" min="1" max="24" placeholder="Capacity" required />
        <input v-model.trim="newVehicle.color" class="input" placeholder="Color (optional)" />
        <input v-model.number="newVehicle.batteryCapacityKwh" class="input" type="number" min="0" step="0.1" placeholder="Battery Capacity kWh (optional)" />
        <input v-model.number="newVehicle.batteryLevel" class="input" type="number" min="0" max="100" placeholder="Battery % (optional)" />
      </div>
      <div class="row">
        <button class="button button-primary" type="submit" :disabled="loading">{{ loading ? 'Saving...' : 'Add Vehicle' }}</button>
      </div>
    </form>

    <div class="card filters">
      <div class="filter-row">
        <input v-model.trim="q" class="input" placeholder="Search plate, model, driver name/phone" />
        <select v-model="status" class="input select-input">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply</button>
      </div>
      <div class="filter-row">
        <input v-model.trim="driverQuery" class="input" placeholder="Search available drivers" />
        <button class="button button-ghost" type="button" :disabled="loadingDrivers" @click="loadAvailableDrivers">
          {{ loadingDrivers ? 'Loading drivers...' : 'Refresh Driver List' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="card">
      <div class="section-title">Fleet request failed</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading fleet...</div>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="section-title">No vehicles found</div>
    </div>

    <div v-else class="vehicles">
      <article v-for="item in items" :key="item.id" class="card vehicle-card">
        <div class="vehicle-head">
          <div>
            <div class="section-title">{{ item.plateNumber }} · {{ item.model }}</div>
            <p class="text-secondary">
              Cap {{ item.capacity }} · {{ item.color || 'No color' }} · Battery {{ item.batteryLevel ?? '—' }}%
            </p>
          </div>
          <span class="chip" :class="chipClass(item.status)">{{ item.status }}</span>
        </div>
        <p class="text-secondary">
          Driver: {{ item.driver?.name || 'Unassigned' }} {{ item.driver?.phone ? `(${item.driver.phone})` : '' }}
        </p>
        <div class="row">
          <select v-model="driverByVehicle[item.id]" class="input select-input">
            <option value="">Unassigned</option>
            <option
              v-if="item.driver && !hasDriverOption(item.driver.id)"
              :value="item.driver.id"
            >
              {{ item.driver.name }} ({{ item.driver.phone }}) · Current
            </option>
            <option v-for="driver in availableDrivers" :key="driver.id" :value="driver.id">
              {{ driver.name }} ({{ driver.phone }})
            </option>
          </select>
          <button class="button button-ghost" type="button" :disabled="busy[item.id]" @click="assignDriver(item.id)">
            {{ busy[item.id] ? 'Saving...' : 'Apply Driver' }}
          </button>
        </div>
        <div class="driver-panel">
          <template v-if="resolvedDriverByVehicle[item.id]">
            <div><strong>Selected:</strong> {{ resolvedDriverByVehicle[item.id]?.name }} ({{ resolvedDriverByVehicle[item.id]?.phone }})</div>
            <div><strong>Assignment:</strong> {{ assignmentLabel(item.id) }}</div>
            <div><strong>Availability:</strong> {{ resolvedDriverByVehicle[item.id]?.driverLocation?.isAvailable ? 'Available' : 'Unavailable / offline' }}</div>
            <div v-if="driverRisk(item.id)" class="warning-badge">
              Warning: {{ driverRisk(item.id) }}
            </div>
            <div><strong>Last location update:</strong> {{ formatDateTime(resolvedDriverByVehicle[item.id]?.driverLocation?.updatedAt) }}</div>
            <div v-if="resolvedDriverByVehicle[item.id]?.driverLocation">
              <strong>Last coordinates:</strong>
              {{ resolvedDriverByVehicle[item.id]?.driverLocation?.lat }}, {{ resolvedDriverByVehicle[item.id]?.driverLocation?.lng }}
            </div>
          </template>
          <template v-else>
            <div class="text-secondary">No driver selected.</div>
          </template>
        </div>
        <div class="row">
          <select v-model="statusByVehicle[item.id]" class="input select-input">
            <option v-for="s in statusOptions(item.status)" :key="s" :value="s">{{ s }}</option>
          </select>
          <input v-model.number="batteryByVehicle[item.id]" class="input" type="number" min="0" max="100" placeholder="Battery %" />
          <button class="button button-primary" type="button" :disabled="busy[item.id]" @click="updateStatus(item.id)">
            {{ busy[item.id] ? 'Saving...' : 'Update Status' }}
          </button>
        </div>
        <div class="fleet-note text-secondary">
          IN_USE requires assigned driver and battery ≥15%. CHARGING requires explicit battery value &lt;100%.
        </div>
        <div class="row">
          <button
            class="button button-ghost"
            type="button"
            :disabled="historyLoading[item.id]"
            @click="toggleHistory(item.id)"
          >
            {{ historyOpen[item.id] ? 'Hide History' : 'Show History' }}
          </button>
        </div>
        <div v-if="historyOpen[item.id]" class="history-panel">
          <p v-if="historyLoading[item.id]" class="text-secondary">Loading history...</p>
          <p v-else-if="historyError[item.id]" class="text-secondary">{{ historyError[item.id] }}</p>
          <p v-else-if="(historyByVehicle[item.id] || []).length === 0" class="text-secondary">No history entries yet.</p>
          <ul v-else class="history-list">
            <li v-for="entry in historyByVehicle[item.id]" :key="entry.id" class="history-item">
              <div class="history-head">
                <strong>{{ entry.action }}</strong>
                <span>{{ formatDateTime(entry.createdAt) }}</span>
              </div>
              <div class="text-secondary">{{ entry.summary || 'No summary' }}</div>
              <div class="text-secondary">Admin: {{ entry.admin.name }} ({{ entry.admin.phone }})</div>
              <div class="text-secondary">{{ formatHistoryDiff(entry.before, entry.after) }}</div>
            </li>
          </ul>
        </div>
      </article>
    </div>

    <div v-if="items.length > 0" class="card pagination">
      <button class="button button-ghost" type="button" :disabled="loading || page <= 1" @click="reload(page - 1)">Previous</button>
      <div class="text-secondary">Page {{ page }} of {{ totalPages }} · {{ total }} total</div>
      <button class="button button-ghost" type="button" :disabled="loading || page >= totalPages" @click="reload(page + 1)">Next</button>
    </div>

    <div v-if="confirmAssign" class="modal-backdrop" @click="confirmAssign = null">
      <div
        ref="modalCardRef"
        class="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-assign-title"
        tabindex="-1"
        @click.stop
      >
        <div id="confirm-assign-title" class="section-title">Confirm Driver Assignment</div>
        <p class="text-secondary">{{ confirmAssign.risk }}</p>
        <textarea
          v-if="confirmAssign.requireReason"
          v-model.trim="confirmAssign.reason"
          class="input"
          rows="3"
          placeholder="Override reason (required)"
        />
        <p v-if="confirmAssignError" class="modal-error">{{ confirmAssignError }}</p>
        <p class="text-secondary">Do you want to apply assignment anyway?</p>
        <div class="modal-actions">
          <button class="button button-ghost" type="button" @click="confirmAssign = null">Cancel</button>
          <button class="button button-primary" type="button" @click="confirmAndAssign">Confirm</button>
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
import type { AdminAvailableDriver, AdminVehicle, AdminVehicleHistoryItem, VehicleStatus } from '../../services/types'

const router = useRouter()
const statuses: VehicleStatus[] = ['AVAILABLE', 'IN_USE', 'CHARGING', 'MAINTENANCE']

const loading = ref(false)
const error = ref('')
const q = ref('')
const status = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const items = ref<AdminVehicle[]>([])
const busy = ref<Record<string, boolean>>({})
const driverByVehicle = ref<Record<string, string>>({})
const statusByVehicle = ref<Record<string, VehicleStatus>>({})
const batteryByVehicle = ref<Record<string, number | undefined>>({})
const availableDrivers = ref<AdminAvailableDriver[]>([])
const driverDirectory = ref<AdminAvailableDriver[]>([])
const loadingDrivers = ref(false)
const driverQuery = ref('')
const confirmAssign = ref<{ vehicleId: string; risk: string; requireReason: boolean; reason: string } | null>(null)
const confirmAssignError = ref('')
const historyOpen = ref<Record<string, boolean>>({})
const historyLoading = ref<Record<string, boolean>>({})
const historyError = ref<Record<string, string>>({})
const historyByVehicle = ref<Record<string, AdminVehicleHistoryItem[]>>({})
const modalCardRef = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

type DriverRisk = {
  message: string
  canOverride: boolean
  requireReason: boolean
}

const newVehicle = ref({
  plateNumber: '',
  model: '',
  capacity: 4,
  color: '',
  batteryCapacityKwh: undefined as number | undefined,
  batteryLevel: undefined as number | undefined
})

function chipClass(value: VehicleStatus) {
  if (value === 'AVAILABLE') return 'chip-ok'
  if (value === 'IN_USE') return 'chip-info'
  if (value === 'CHARGING') return 'chip-warn'
  return 'chip-bad'
}

function hasDriverOption(driverId: string) {
  return availableDrivers.value.some((driver) => driver.id === driverId)
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const resolvedDriverByVehicle = computed<Record<string, AdminAvailableDriver | null>>(() => {
  const byId = new Map<string, AdminAvailableDriver>()
  for (const driver of driverDirectory.value) byId.set(driver.id, driver)
  for (const driver of availableDrivers.value) {
    if (!byId.has(driver.id)) byId.set(driver.id, driver)
  }

  const result: Record<string, AdminAvailableDriver | null> = {}
  for (const [vehicleId, selectedDriverId] of Object.entries(driverByVehicle.value)) {
    result[vehicleId] = selectedDriverId ? (byId.get(selectedDriverId) ?? null) : null
  }
  return result
})

function assignmentLabel(vehicleId: string) {
  const details = resolvedDriverByVehicle.value[vehicleId]
  if (!details) return 'Unassigned'
  if (!details.vehicle) return 'Unassigned'

  const vehicle = items.value.find((item) => item.id === vehicleId)
  if (!vehicle) return `Assigned to ${details.vehicle.plateNumber}`
  if (details.vehicle.id === vehicle.id) return `Assigned to this vehicle (${details.vehicle.plateNumber})`
  return `Assigned to another vehicle (${details.vehicle.plateNumber})`
}

function driverRisk(vehicleId: string) {
  const flags = driverRiskFlags(vehicleId)
  return flags.map((flag) => flag.message).join(' · ')
}

function driverRiskFlags(vehicleId: string): DriverRisk[] {
  const details = resolvedDriverByVehicle.value[vehicleId]
  if (!details) return []

  const vehicle = items.value.find((item) => item.id === vehicleId)
  const flags: DriverRisk[] = []
  if (!details.driverLocation?.isAvailable) {
    flags.push({
      message: 'Driver is currently unavailable/offline',
      canOverride: true,
      requireReason: true
    })
  }
  if (details.vehicle && vehicle && details.vehicle.id !== vehicle.id) {
    flags.push({
      message: `Driver is assigned to ${details.vehicle.plateNumber}`,
      canOverride: false,
      requireReason: false
    })
  }
  return flags
}

function statusOptions(currentStatus: VehicleStatus) {
  if (currentStatus === 'IN_USE') return ['IN_USE', 'AVAILABLE'] as VehicleStatus[]
  if (currentStatus === 'CHARGING') return ['CHARGING', 'AVAILABLE'] as VehicleStatus[]
  if (currentStatus === 'MAINTENANCE') return ['MAINTENANCE', 'AVAILABLE'] as VehicleStatus[]
  return statuses
}

function formatHistoryDiff(before?: Record<string, unknown> | null, after?: Record<string, unknown> | null) {
  const prevStatus = typeof before?.status === 'string' ? before.status : null
  const nextStatus = typeof after?.status === 'string' ? after.status : null
  const prevBattery = typeof before?.batteryLevel === 'number' ? before.batteryLevel : null
  const nextBattery = typeof after?.batteryLevel === 'number' ? after.batteryLevel : null

  const parts: string[] = []
  if (prevStatus || nextStatus) {
    parts.push(`Status: ${prevStatus ?? '—'} → ${nextStatus ?? '—'}`)
  }
  if (prevBattery !== null || nextBattery !== null) {
    parts.push(`Battery: ${prevBattery ?? '—'}% → ${nextBattery ?? '—'}%`)
  }
  return parts.join(' · ') || 'No before/after diff'
}

function initializeMaps(next: AdminVehicle[]) {
  const driverMap: Record<string, string> = {}
  const statusMap: Record<string, VehicleStatus> = {}
  const batteryMap: Record<string, number | undefined> = {}
  for (const v of next) {
    driverMap[v.id] = v.driver?.id ?? ''
    statusMap[v.id] = v.status
    batteryMap[v.id] = typeof v.batteryLevel === 'number' ? v.batteryLevel : undefined
  }
  driverByVehicle.value = driverMap
  statusByVehicle.value = statusMap
  batteryByVehicle.value = batteryMap
}

async function loadVehicleHistory(vehicleId: string) {
  historyLoading.value[vehicleId] = true
  historyError.value[vehicleId] = ''
  try {
    const res = await api.adminGetVehicleHistory(vehicleId, { page: 1, limit: 8 })
    historyByVehicle.value[vehicleId] = res.items
  } catch (err) {
    historyError.value[vehicleId] = err instanceof Error ? err.message : 'History request failed'
  } finally {
    historyLoading.value[vehicleId] = false
  }
}

async function toggleHistory(vehicleId: string) {
  const next = !historyOpen.value[vehicleId]
  historyOpen.value[vehicleId] = next
  if (!next) return
  if (historyByVehicle.value[vehicleId]) return
  await loadVehicleHistory(vehicleId)
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
    // Keep UI functional even if directory hydration fails.
  }
}

async function reload(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetVehicles({
      q: q.value || undefined,
      status: status.value || undefined,
      page: nextPage,
      limit: 12
    })
    items.value = res.items
    page.value = res.page
    totalPages.value = res.totalPages
    total.value = res.total
    initializeMaps(res.items)
    await Promise.all([loadAvailableDrivers(), loadDriverDirectory()])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

async function createVehicle() {
  loading.value = true
  error.value = ''
  try {
    await api.adminCreateVehicle({
      plateNumber: newVehicle.value.plateNumber,
      model: newVehicle.value.model,
      capacity: Number(newVehicle.value.capacity),
      color: newVehicle.value.color || undefined,
      batteryCapacityKwh: newVehicle.value.batteryCapacityKwh,
      batteryLevel: newVehicle.value.batteryLevel
    })
    newVehicle.value = {
      plateNumber: '',
      model: '',
      capacity: 4,
      color: '',
      batteryCapacityKwh: undefined,
      batteryLevel: undefined
    }
    await reload(1)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

async function assignDriver(vehicleId: string) {
  const riskFlags = driverRiskFlags(vehicleId)
  const blocking = riskFlags.find((flag) => !flag.canOverride)
  if (blocking) {
    error.value = `${blocking.message}. Unassign the driver from the current vehicle first.`
    return
  }

  if (riskFlags.length > 0) {
    confirmAssign.value = {
      vehicleId,
      risk: riskFlags.map((flag) => flag.message).join(' · '),
      requireReason: riskFlags.some((flag) => flag.requireReason),
      reason: ''
    }
    confirmAssignError.value = ''
    return
  }

  await applyDriverAssignment(vehicleId, {})
}

async function applyDriverAssignment(vehicleId: string, options: { force?: boolean; reason?: string }) {
  busy.value[vehicleId] = true
  error.value = ''
  try {
    const value = driverByVehicle.value[vehicleId]?.trim()
    await api.adminAssignVehicleDriver(vehicleId, value ? value : null, options)
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busy.value[vehicleId] = false
  }
}

async function confirmAndAssign() {
  const pending = confirmAssign.value
  if (!pending) return
  if (pending.requireReason && !pending.reason.trim()) {
    confirmAssignError.value = 'Override reason is required for offline/unavailable drivers.'
    return
  }
  confirmAssign.value = null
  confirmAssignError.value = ''
  await applyDriverAssignment(pending.vehicleId, {
    force: pending.requireReason,
    reason: pending.requireReason ? pending.reason.trim() : undefined
  })
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && confirmAssign.value) {
    confirmAssign.value = null
  }
}

watch(confirmAssign, async (value) => {
  if (value) {
    confirmAssignError.value = ''
    previousFocus = (document.activeElement as HTMLElement | null) ?? null
    await nextTick()
    modalCardRef.value?.focus()
    return
  }
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus()
  }
})

async function updateStatus(vehicleId: string) {
  const nextStatus = statusByVehicle.value[vehicleId]
  if (!nextStatus) return
  busy.value[vehicleId] = true
  error.value = ''
  try {
    const level = batteryByVehicle.value[vehicleId]
    await api.adminUpdateVehicleStatus(vehicleId, nextStatus, typeof level === 'number' ? level : undefined)
    await reload(page.value)
    if (historyOpen.value[vehicleId]) {
      await loadVehicleHistory(vehicleId)
    } else {
      delete historyByVehicle.value[vehicleId]
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busy.value[vehicleId] = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
  reload(1)
})

onUnmounted(() => {
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

.form,
.filters,
.vehicles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.row > * {
  flex: 1;
  min-width: 180px;
}

.vehicle-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fleet-note {
  font-size: 12px;
}

.driver-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: #f8fafc;
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.warning-badge {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  background: #fff4df;
  color: #8b5a00;
  border: 1px solid #f2cd8f;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.history-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: #f8fafc;
  padding: 10px 12px;
}

.history-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 10px;
  background: #ffffff;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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

.modal-error {
  color: #b42318;
  font-size: 13px;
}

.vehicle-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.chip-ok {
  background: #e6f7ed;
  color: #116b3a;
}

.chip-info {
  background: #eaf2ff;
  color: #1f4d8f;
}

.chip-warn {
  background: #fff8e6;
  color: #8b5a00;
}

.chip-bad {
  background: #ffecec;
  color: #8b1d1d;
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
