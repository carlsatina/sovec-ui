<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Admin Audit Logs</template>
      <template #subtitle>Track privileged actions across operations modules</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div class="card filters">
      <div class="filter-row">
        <input v-model.trim="q" class="input" placeholder="Search id/summary/action/target/admin" />
        <input v-model.trim="action" class="input" placeholder="Action (e.g. PAYMENT_VERIFY)" />
        <input v-model.trim="targetType" class="input" placeholder="Target type (e.g. PAYMENT, VEHICLE)" />
      </div>
      <div class="filter-row">
        <label class="date-filter">
          <span class="text-secondary">From</span>
          <input v-model="fromDate" class="input" type="date" />
        </label>
        <label class="date-filter">
          <span class="text-secondary">To</span>
          <input v-model="toDate" class="input" type="date" />
        </label>
      </div>
      <div class="filter-row">
        <input v-model.trim="actorId" class="input" placeholder="Admin ID (optional)" />
        <select v-model.number="limit" class="input select-input">
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="50">50 / page</option>
        </select>
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply Filters</button>
        <button class="button button-ghost" type="button" :disabled="loading" @click="resetFilters">Reset</button>
        <button class="button button-ghost" type="button" :disabled="loading" @click="reload(page)">Refresh</button>
        <button class="button button-ghost" type="button" :disabled="loading || items.length === 0" @click="exportCurrentViewCsv">
          Export Page CSV
        </button>
        <button class="button button-ghost" type="button" :disabled="loading || exportBusy" @click="exportAllFilteredCsv">
          {{ exportBusy ? 'Exporting...' : 'Export All Filtered' }}
        </button>
      </div>
      <div class="chip-row">
        <button
          v-for="preset in actionPresets"
          :key="preset"
          class="chip filter-chip"
          :class="{ 'filter-chip-active': action === preset }"
          type="button"
          @click="applyActionPreset(preset)"
        >
          {{ preset }}
        </button>
      </div>
    </div>

    <div v-if="notice.message" class="card notice-card" :class="notice.kind === 'success' ? 'notice-success' : 'notice-error'">
      {{ notice.message }}
    </div>

    <div v-if="error" class="card">
      <div class="section-title">Audit log request failed</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading audit logs...</div>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="section-title">No logs found</div>
      <p class="text-secondary">No audit records match your filters.</p>
    </div>

    <div v-else class="logs">
      <article v-for="item in items" :key="item.id" class="card log-card">
        <div class="log-head">
          <div>
            <div class="section-title">{{ item.action }}</div>
            <p class="text-secondary">{{ formatDate(item.createdAt) }}</p>
          </div>
          <div class="head-chips">
            <span class="chip chip-info">{{ item.targetType }}</span>
            <button class="button button-ghost tiny-button" type="button" @click="copyLog(item)">
              Copy JSON
            </button>
          </div>
        </div>

        <p class="text-secondary">
          <strong>Admin:</strong> {{ item.admin.name }} ({{ item.admin.phone }}) · {{ item.admin.role }} · {{ shortId(item.admin.id) }}
        </p>
        <p class="text-secondary">
          <strong>Target:</strong> {{ item.targetId || 'N/A' }}
        </p>
        <p class="text-secondary">
          <strong>Summary:</strong> {{ item.summary || '—' }}
        </p>

        <details v-if="item.before || item.after || item.metadata" class="json-box">
          <summary>Payload Details</summary>
          <div v-if="item.before" class="json-section">
            <strong>Before</strong>
            <pre>{{ formatJson(item.before) }}</pre>
          </div>
          <div v-if="item.after" class="json-section">
            <strong>After</strong>
            <pre>{{ formatJson(item.after) }}</pre>
          </div>
          <div v-if="item.metadata" class="json-section">
            <strong>Metadata</strong>
            <pre>{{ formatJson(item.metadata) }}</pre>
          </div>
        </details>
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
import type { AdminAuditLog } from '../../services/types'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const q = ref('')
const action = ref('')
const targetType = ref('')
const actorId = ref('')
const fromDate = ref('')
const toDate = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const limit = ref(20)
const items = ref<AdminAuditLog[]>([])
const notice = ref<{ kind: 'success' | 'error'; message: string }>({ kind: 'success', message: '' })
const exportBusy = ref(false)
let noticeTimer: ReturnType<typeof setTimeout> | null = null
const actionPresets = [
  'FLEET_CREATE_VEHICLE',
  'FLEET_ASSIGN_DRIVER',
  'RIDE_FORCE_CANCEL',
  'PAYMENT_VERIFY',
  'SUPPORT_TICKET_STATUS_UPDATE',
  'SAFETY_ESCALATE'
]

function setNotice(kind: 'success' | 'error', message: string) {
  notice.value = { kind, message }
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value.message = ''
  }, 3200)
}

function shortId(value: string) {
  return value.slice(0, 8)
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

async function reload(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetAuditLogs({
      q: q.value || undefined,
      action: action.value || undefined,
      targetType: targetType.value || undefined,
      actorId: actorId.value || undefined,
      from: fromDate.value || undefined,
      to: toDate.value || undefined,
      page: nextPage,
      limit: limit.value
    })
    items.value = res.items
    page.value = res.page
    totalPages.value = res.totalPages
    total.value = res.total
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

function applyActionPreset(value: string) {
  action.value = action.value === value ? '' : value
  reload(1)
}

function toCsvCell(value: unknown) {
  const text = typeof value === 'string' ? value : value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function exportCurrentViewCsv() {
  const headers = ['id', 'createdAt', 'action', 'targetType', 'targetId', 'adminId', 'adminName', 'adminPhone', 'summary']
  const rows = items.value.map((item) => [
    item.id,
    item.createdAt,
    item.action,
    item.targetType,
    item.targetId ?? '',
    item.admin.id,
    item.admin.name,
    item.admin.phone,
    item.summary ?? ''
  ])
  const csv = [headers, ...rows].map((row) => row.map((cell) => toCsvCell(cell)).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const filename = `admin-audit-logs-page-${page.value}.csv`

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    setNotice('error', 'CSV export is unavailable in this environment')
    return
  }
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(href)
  setNotice('success', `Exported ${items.value.length} logs to ${filename}`)
}

async function copyLog(item: AdminAuditLog) {
  const payload = JSON.stringify(item, null, 2)
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload)
      setNotice('success', `Copied log ${shortId(item.id)} to clipboard`)
      return
    }
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea')
      textArea.value = payload
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setNotice('success', `Copied log ${shortId(item.id)} to clipboard`)
      return
    }
    setNotice('error', 'Clipboard is unavailable in this environment')
  } catch {
    setNotice('error', 'Failed to copy log JSON')
  }
}

async function exportAllFilteredCsv() {
  exportBusy.value = true
  try {
    const blob = await api.adminExportAuditLogsCsv({
      q: q.value || undefined,
      action: action.value || undefined,
      targetType: targetType.value || undefined,
      actorId: actorId.value || undefined,
      from: fromDate.value || undefined,
      to: toDate.value || undefined,
      limit: 5000
    })

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setNotice('error', 'CSV export is unavailable in this environment')
      return
    }
    const href = URL.createObjectURL(blob)
    const filename = `admin-audit-logs-filtered-${new Date().toISOString().slice(0, 10)}.csv`
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(href)
    setNotice('success', `Exported full filtered audit logs to ${filename}`)
  } catch (err) {
    setNotice('error', err instanceof Error ? err.message : 'Failed to export filtered audit logs')
  } finally {
    exportBusy.value = false
  }
}

function resetFilters() {
  q.value = ''
  action.value = ''
  targetType.value = ''
  actorId.value = ''
  fromDate.value = ''
  toDate.value = ''
  reload(1)
}

onMounted(() => {
  reload(1)
})

onUnmounted(() => {
  if (noticeTimer) clearTimeout(noticeTimer)
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
.logs {
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

.date-filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1e3a8a;
  cursor: pointer;
}

.filter-chip-active {
  background: #1e3a8a;
  color: #f8fafc;
}

.log-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.chip-info {
  background: #eaf2ff;
  color: #1f4d8f;
}

.head-chips {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tiny-button {
  min-height: 32px;
  padding: 6px 10px;
}

.json-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
}

.json-section {
  margin-top: 10px;
}

.json-section pre {
  margin: 8px 0 0;
  padding: 10px;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.notice-card {
  border-width: 1px;
  border-style: solid;
}

.notice-success {
  border-color: #0f766e;
  background: #f0fdfa;
  color: #115e59;
}

.notice-error {
  border-color: #9f1239;
  background: #fff1f2;
  color: #881337;
}

@media (max-width: 720px) {
  .log-head {
    flex-direction: column;
    align-items: stretch;
  }

  .head-chips {
    justify-content: space-between;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
