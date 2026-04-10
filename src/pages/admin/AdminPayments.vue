<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Payment Operations</template>
      <template #subtitle>Verify, fail, and refund payment records</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div class="card filters">
      <div class="filter-row">
        <input v-model.trim="q" class="input" placeholder="Search payment/ride/reference/rider/driver" />
        <select v-model="status" class="input select-input">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="method" class="input select-input">
          <option value="">All methods</option>
          <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div class="filter-row">
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply Filters</button>
      </div>
    </div>

    <div v-if="error" class="card">
      <div class="section-title">Payment request failed</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading payments...</div>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="section-title">No payments found</div>
      <p class="text-secondary">Try updating filters.</p>
    </div>

    <div v-else class="payments">
      <article v-for="payment in items" :key="payment.id" class="card payment-card">
        <div class="payment-head">
          <div>
            <div class="section-title">Payment {{ shortId(payment.id) }}</div>
            <p class="text-secondary">
              {{ formatDate(payment.createdAt) }} · {{ payment.method }} · PHP {{ formatAmount(payment.amount) }}
            </p>
          </div>
          <span class="chip" :class="chipClass(payment.status)">{{ payment.status }}</span>
        </div>

        <div class="text-secondary">
          Ride: {{ shortId(payment.rideId) }} · {{ payment.ride?.status || '—' }}
        </div>
        <div class="text-secondary">
          Rider: {{ payment.ride?.rider?.name || payment.user?.name || '—' }} {{ payment.ride?.rider?.phone ? `(${payment.ride.rider.phone})` : '' }}
        </div>
        <div class="text-secondary">
          Driver: {{ payment.ride?.driver?.name || 'Unassigned' }} {{ payment.ride?.driver?.phone ? `(${payment.ride.driver.phone})` : '' }}
        </div>
        <div class="text-secondary">
          Route: {{ payment.ride?.pickupAddress || '—' }} → {{ payment.ride?.dropoffAddress || '—' }}
        </div>
        <div class="text-secondary">
          Ref: {{ payment.reference || 'N/A' }}
        </div>

        <div class="action-row">
          <input
            v-model.trim="noteByPayment[payment.id]"
            class="input"
            placeholder="Note / reason"
          />
          <input
            v-model.number="refundAmountByPayment[payment.id]"
            class="input"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Refund amount (optional)"
          />
        </div>
        <div class="action-row">
          <button
            class="button button-primary"
            type="button"
            :disabled="busyByPayment[payment.id] || payment.status === 'REFUNDED' || payment.status === 'REFUND_PENDING'"
            @click="verifyPayment(payment.id)"
          >
            {{ busyByPayment[payment.id] ? 'Working...' : 'Mark Verified' }}
          </button>
          <button
            class="button button-ghost"
            type="button"
            :disabled="busyByPayment[payment.id] || payment.status === 'REFUNDED'"
            @click="failPayment(payment.id)"
          >
            {{ busyByPayment[payment.id] ? 'Working...' : 'Mark Failed' }}
          </button>
          <button
            class="button button-ghost refund-button"
            type="button"
            :disabled="busyByPayment[payment.id] || payment.status === 'REFUNDED' || payment.status === 'REFUND_PENDING'"
            @click="refundPayment(payment.id)"
          >
            {{ busyByPayment[payment.id] ? 'Working...' : 'Request Refund' }}
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { api } from '../../services/api'
import type { AdminPayment, AdminPaymentMethod, AdminPaymentStatus } from '../../services/types'

const router = useRouter()
const statuses: AdminPaymentStatus[] = ['PENDING', 'PAID', 'VERIFIED', 'FAILED', 'REFUND_PENDING', 'REFUNDED']
const methods: AdminPaymentMethod[] = ['CASH', 'EWALLET', 'CARD']

const loading = ref(false)
const error = ref('')
const q = ref('')
const status = ref('')
const method = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const items = ref<AdminPayment[]>([])
const busyByPayment = ref<Record<string, boolean>>({})
const noteByPayment = ref<Record<string, string>>({})
const refundAmountByPayment = ref<Record<string, number | undefined>>({})

function shortId(value: string) {
  return value.slice(0, 8)
}

function formatAmount(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '--'
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function chipClass(value: AdminPaymentStatus) {
  if (value === 'VERIFIED' || value === 'PAID') return 'chip-ok'
  if (value === 'REFUND_PENDING') return 'chip-warn'
  if (value === 'REFUNDED' || value === 'FAILED') return 'chip-bad'
  return 'chip-info'
}

function initializeMaps(nextItems: AdminPayment[]) {
  const nextNotes: Record<string, string> = {}
  const nextRefunds: Record<string, number | undefined> = {}
  for (const item of nextItems) {
    nextNotes[item.id] = noteByPayment.value[item.id] ?? ''
    nextRefunds[item.id] = refundAmountByPayment.value[item.id]
  }
  noteByPayment.value = nextNotes
  refundAmountByPayment.value = nextRefunds
}

async function reload(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetPayments({
      q: q.value || undefined,
      status: (status.value || undefined) as AdminPaymentStatus | undefined,
      method: (method.value || undefined) as AdminPaymentMethod | undefined,
      page: nextPage,
      limit: 12
    })
    items.value = res.items
    page.value = res.page
    totalPages.value = res.totalPages
    total.value = res.total
    initializeMaps(res.items)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

async function verifyPayment(id: string) {
  busyByPayment.value[id] = true
  error.value = ''
  try {
    await api.adminVerifyPayment(id, noteByPayment.value[id] || undefined)
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busyByPayment.value[id] = false
  }
}

async function failPayment(id: string) {
  busyByPayment.value[id] = true
  error.value = ''
  try {
    await api.adminFailPayment(id, noteByPayment.value[id] || undefined)
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busyByPayment.value[id] = false
  }
}

async function refundPayment(id: string) {
  const reason = noteByPayment.value[id]?.trim()
  if (!reason) {
    error.value = 'Refund reason is required'
    return
  }

  busyByPayment.value[id] = true
  error.value = ''
  try {
    const amount = refundAmountByPayment.value[id]
    await api.adminRefundPayment(id, {
      reason,
      amount: typeof amount === 'number' && Number.isFinite(amount) ? amount : undefined
    })
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busyByPayment.value[id] = false
  }
}

onMounted(() => {
  reload(1)
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

.filters,
.payments {
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

.payment-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-row > * {
  flex: 1;
  min-width: 160px;
}

.refund-button {
  color: #8b5a00;
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
