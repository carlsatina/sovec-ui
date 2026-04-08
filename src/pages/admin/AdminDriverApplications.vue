<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Driver Applications</template>
      <template #subtitle>Review and update onboarding status</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div class="card filters">
      <div class="filter-row">
        <input v-model.trim="q" class="input" placeholder="Search name, phone, or email" />
        <select v-model="status" class="input select-input">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="filter-row">
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply Filters</button>
        <button class="button button-ghost" type="button" :disabled="loading" @click="resetFilters">Reset</button>
      </div>
    </div>

    <div v-if="error" class="card">
      <div class="section-title">Could not load applications</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading applications...</div>
      <p class="text-secondary">Fetching admin data</p>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="section-title">No matching applications</div>
      <p class="text-secondary">Try a different filter or search query.</p>
    </div>

    <div v-else class="applications">
      <article v-for="item in items" :key="item.id" class="card application-card">
        <div class="application-head">
          <div>
            <div class="section-title">{{ item.fullName || item.user.name || 'Unnamed Applicant' }}</div>
            <p class="text-secondary">{{ item.phone || item.user.phone }} · {{ item.email || item.user.email || 'No email' }}</p>
          </div>
          <span class="chip" :class="statusChipClass(item.status)">{{ item.status }}</span>
        </div>

        <div class="application-meta text-secondary">
          <span>Submitted: {{ formatDate(item.submittedAt) }}</span>
          <span>Updated: {{ formatDate(item.updatedAt) }}</span>
          <span>Docs: {{ item.documents.length }}</span>
        </div>

        <div class="action-row">
          <select v-model="selectedStatus[item.id]" class="input select-input">
            <option v-for="s in actionStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <input
            v-model.trim="reason[item.id]"
            class="input"
            placeholder="Reason (required for REJECTED)"
          />
          <button
            class="button button-primary"
            type="button"
            :disabled="busy[item.id]"
            @click="applyStatus(item)"
          >
            {{ busy[item.id] ? 'Saving...' : 'Update Status' }}
          </button>
        </div>

        <div class="action-row">
          <input v-model="interviewAt[item.id]" class="input" type="datetime-local" />
          <button
            class="button button-ghost"
            type="button"
            :disabled="busy[item.id] || !interviewAt[item.id]"
            @click="scheduleInterview(item.id)"
          >
            Schedule Interview
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
import type { AdminDriverApplication, ApplicationStatus } from '../../services/types'

const router = useRouter()

const statuses: ApplicationStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED']
const actionStatuses: ApplicationStatus[] = ['UNDER_REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED']

const loading = ref(false)
const error = ref('')
const q = ref('')
const status = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const items = ref<AdminDriverApplication[]>([])

const selectedStatus = ref<Record<string, ApplicationStatus>>({})
const reason = ref<Record<string, string>>({})
const interviewAt = ref<Record<string, string>>({})
const busy = ref<Record<string, boolean>>({})

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function statusChipClass(value: ApplicationStatus) {
  if (value === 'APPROVED') return 'chip-ok'
  if (value === 'REJECTED') return 'chip-bad'
  if (value === 'INTERVIEW') return 'chip-warn'
  return ''
}

function initializeRowState(nextItems: AdminDriverApplication[]) {
  const statusMap: Record<string, ApplicationStatus> = {}
  const reasonMap: Record<string, string> = {}
  const interviewMap: Record<string, string> = {}
  for (const item of nextItems) {
    statusMap[item.id] = actionStatuses.includes(item.status) ? item.status : 'UNDER_REVIEW'
    reasonMap[item.id] = ''
    interviewMap[item.id] = ''
  }
  selectedStatus.value = statusMap
  reason.value = reasonMap
  interviewAt.value = interviewMap
}

async function reload(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetDriverApplications({
      q: q.value || undefined,
      status: status.value || undefined,
      page: nextPage,
      limit: 12
    })
    page.value = res.page
    totalPages.value = res.totalPages
    total.value = res.total
    items.value = res.items
    initializeRowState(res.items)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  q.value = ''
  status.value = ''
  reload(1)
}

async function applyStatus(item: AdminDriverApplication) {
  const nextStatus = selectedStatus.value[item.id]
  if (!nextStatus) return
  busy.value[item.id] = true
  error.value = ''
  try {
    await api.adminUpdateDriverApplicationStatus(item.id, nextStatus, reason.value[item.id] || undefined)
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busy.value[item.id] = false
  }
}

async function scheduleInterview(id: string) {
  const value = interviewAt.value[id]
  if (!value) return
  busy.value[id] = true
  error.value = ''
  try {
    const iso = new Date(value).toISOString()
    await api.adminScheduleDriverInterview(id, iso)
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busy.value[id] = false
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

.select-input {
  padding-top: 12px;
  padding-bottom: 12px;
}

.applications {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.application-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.application-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
