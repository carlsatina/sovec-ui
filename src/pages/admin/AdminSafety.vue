<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Safety Operations</template>
      <template #subtitle>SOS and safety incident triage queue</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div class="card filters">
      <div class="filter-row">
        <input v-model.trim="q" class="input" placeholder="Search incident id/description/user" />
        <select v-model="status" class="input select-input">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="priority" class="input select-input">
          <option value="">All priorities</option>
          <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div class="filter-row">
        <input v-model.trim="assigneeId" class="input" placeholder="Assignee ID (optional)" />
        <label class="toggle">
          <input v-model="activeOnly" type="checkbox" />
          <span>Active only</span>
        </label>
        <label class="toggle">
          <input v-model="overdueOnly" type="checkbox" />
          <span>Overdue only</span>
        </label>
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply Filters</button>
      </div>
    </div>

    <section class="card templates-card">
      <div class="templates-head">
        <div>
          <div class="section-title">Notification Templates</div>
          <p class="text-secondary">Edit escalation/resolution message templates used by safety automation.</p>
        </div>
        <button class="button button-ghost" type="button" :disabled="templatesLoading" @click="loadTemplates">
          {{ templatesLoading ? 'Refreshing...' : 'Refresh Templates' }}
        </button>
      </div>

      <p v-if="templatesError" class="text-secondary templates-error">{{ templatesError }}</p>

      <div v-if="templatesLoading && templateForms.length === 0" class="text-secondary">Loading templates...</div>
      <div v-else-if="templateForms.length === 0" class="text-secondary">No templates available.</div>

      <div v-else class="templates-grid">
        <article v-for="tpl in templateForms" :key="tpl.key" class="template-item">
          <div class="template-item-head">
            <strong>{{ tpl.key }}</strong>
            <span v-if="templateDirtyByKey[tpl.key]" class="chip chip-warn">Unsaved</span>
          </div>
          <input
            v-model="templateSubjectByKey[tpl.key]"
            class="input"
            placeholder="Template subject"
            @input="markTemplateDirty(tpl.key)"
          />
          <textarea
            v-model="templateBodyByKey[tpl.key]"
            class="input template-body"
            placeholder="Template body"
            rows="5"
            @input="markTemplateDirty(tpl.key)"
          />
          <div class="template-actions">
            <button
              class="button button-ghost"
              type="button"
              :disabled="templateBusyByKey[tpl.key] || !templateDirtyByKey[tpl.key]"
              @click="resetTemplateDraft(tpl.key)"
            >
              Reset
            </button>
            <button
              class="button button-primary"
              type="button"
              :disabled="templateBusyByKey[tpl.key] || !templateDirtyByKey[tpl.key]"
              @click="saveTemplate(tpl.key)"
            >
              {{ templateBusyByKey[tpl.key] ? 'Saving...' : 'Save Template' }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="card templates-card">
      <div class="templates-head">
        <div>
          <div class="section-title">Delivery Logs</div>
          <p class="text-secondary">Track delivery outcomes and retry dead-lettered notifications.</p>
        </div>
        <button class="button button-ghost" type="button" :disabled="logsLoading" @click="loadDeliveryLogs(1)">
          {{ logsLoading ? 'Refreshing...' : 'Refresh Logs' }}
        </button>
      </div>

      <div class="filter-row">
        <input v-model.trim="logQ" class="input" placeholder="Search incident/target/error" />
        <select v-model="logStatus" class="input select-input">
          <option value="">All statuses</option>
          <option value="DEAD_LETTER">DEAD_LETTER</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>
        <select v-model="logChannel" class="input select-input">
          <option value="">All channels</option>
          <option value="sms">sms</option>
          <option value="email">email</option>
          <option value="webhook">webhook</option>
        </select>
        <button class="button button-primary" type="button" :disabled="logsLoading" @click="loadDeliveryLogs(1)">Apply</button>
      </div>

      <p v-if="logsError" class="text-secondary templates-error">{{ logsError }}</p>
      <div v-if="logsLoading && deliveryLogs.length === 0" class="text-secondary">Loading logs...</div>
      <div v-else-if="deliveryLogs.length === 0" class="text-secondary">No delivery logs found.</div>
      <div v-else class="templates-grid">
        <article v-for="log in deliveryLogs" :key="log.id" class="template-item">
          <div class="template-item-head">
            <strong>{{ log.channel.toUpperCase() }} · {{ log.status }}</strong>
            <span class="text-secondary">{{ formatDate(log.createdAt) }}</span>
          </div>
          <p class="text-secondary"><strong>Incident:</strong> {{ shortId(log.incidentId) }} · <strong>Target:</strong> {{ log.target }}</p>
          <p class="text-secondary"><strong>Attempts:</strong> {{ log.attempts }} · <strong>Event:</strong> {{ log.event }}</p>
          <p v-if="log.lastError" class="text-secondary"><strong>Error:</strong> {{ log.lastError }}</p>
          <div class="template-actions">
            <button
              class="button button-ghost"
              type="button"
              :disabled="log.status !== 'DEAD_LETTER' || logBusyById[log.id]"
              @click="retryDelivery(log.id)"
            >
              {{ logBusyById[log.id] ? 'Retrying...' : 'Retry' }}
            </button>
          </div>
        </article>
      </div>

      <div v-if="deliveryLogs.length > 0" class="pagination">
        <button class="button button-ghost" type="button" :disabled="logsLoading || logPage <= 1" @click="loadDeliveryLogs(logPage - 1)">Previous</button>
        <div class="text-secondary">Page {{ logPage }} of {{ logTotalPages }} · {{ logTotal }} total</div>
        <button class="button button-ghost" type="button" :disabled="logsLoading || logPage >= logTotalPages" @click="loadDeliveryLogs(logPage + 1)">Next</button>
      </div>
    </section>

    <div v-if="notice.message" class="card notice-card" :class="notice.kind === 'success' ? 'notice-success' : 'notice-error'">
      {{ notice.message }}
    </div>

    <div v-if="error" class="card">
      <div class="section-title">Safety request failed</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading incidents...</div>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="section-title">No incidents found</div>
      <p class="text-secondary">No incidents match your filters.</p>
    </div>

    <div v-else class="incidents">
      <article v-for="item in items" :key="item.id" class="card incident-card">
        <div class="incident-head">
          <div>
            <div class="section-title">Incident {{ shortId(item.id) }}</div>
            <p class="text-secondary">{{ formatDate(item.createdAt) }} · {{ item.category }}</p>
          </div>
          <span class="chip" :class="chipClass(item.status)">{{ item.status }}</span>
        </div>

        <p class="text-secondary"><strong>Reported by:</strong> {{ item.user.name }} ({{ item.user.phone }}) · {{ item.user.role }}</p>
        <p class="text-secondary"><strong>Details:</strong> {{ item.incidentMeta?.noteText || item.description }}</p>
        <p class="text-secondary"><strong>Priority:</strong> {{ item.incidentMeta?.priority || 'HIGH' }} · <strong>Assignee:</strong> {{ item.incidentMeta?.assigneeId || 'Unassigned' }}</p>
        <p class="text-secondary"><strong>SLA:</strong> Ack {{ formatDuration(item.sla?.ackSeconds) }} · Resolve {{ formatDuration(item.sla?.resolveSeconds) }} · Overdue {{ item.sla?.overdue ? 'Yes' : 'No' }}</p>

        <details class="timeline-box">
          <summary>Timeline ({{ item.timeline?.length ?? 0 }})</summary>
          <ul v-if="item.timeline?.length" class="timeline-list">
            <li v-for="event in item.timeline" :key="event.id">
              {{ formatDate(event.createdAt) }} · {{ event.type }}
            </li>
          </ul>
          <p v-else class="text-secondary">No timeline events yet.</p>
        </details>

        <div class="action-row">
          <button class="button button-ghost" type="button" :disabled="busy[item.id]" @click="acknowledgeIncident(item.id)">
            {{ busy[item.id] ? 'Saving...' : 'Acknowledge' }}
          </button>
          <button class="button button-ghost" type="button" :disabled="busy[item.id]" @click="assignToMe(item.id)">
            {{ busy[item.id] ? 'Saving...' : 'Assign To Me' }}
          </button>
        </div>

        <div class="action-row">
          <select v-model="escalatePriorityByIncident[item.id]" class="input select-input">
            <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
          </select>
          <input v-model.trim="escalateReasonByIncident[item.id]" class="input" placeholder="Escalation reason" />
          <button class="button button-ghost" type="button" :disabled="busy[item.id]" @click="escalateIncident(item.id)">
            {{ busy[item.id] ? 'Saving...' : 'Escalate' }}
          </button>
        </div>

        <div class="action-row">
          <select v-model="nextStatusByIncident[item.id]" class="input select-input">
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <input v-model.trim="actionByIncident[item.id]" class="input" placeholder="Action taken (required)" />
          <input v-model.trim="noteByIncident[item.id]" class="input" placeholder="Resolution note (optional)" />
          <button class="button button-primary" type="button" :disabled="busy[item.id]" @click="resolveIncident(item.id)">
            {{ busy[item.id] ? 'Saving...' : 'Resolve Incident' }}
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
import type {
  AdminSafetyDeliveryChannel,
  AdminSafetyDeliveryLog,
  AdminSafetyDeliveryStatus,
  AdminSafetyIncident,
  AdminSafetyIncidentStatus,
  AdminSafetyTemplate,
  AdminSafetyTemplateKey
} from '../../services/types'

const router = useRouter()
const statuses: AdminSafetyIncidentStatus[] = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

const loading = ref(false)
const error = ref('')
const q = ref('')
const status = ref('')
const priority = ref('')
const assigneeId = ref('')
const activeOnly = ref(true)
const overdueOnly = ref(false)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const items = ref<AdminSafetyIncident[]>([])
const busy = ref<Record<string, boolean>>({})
const templatesLoading = ref(false)
const templatesError = ref('')
const templateForms = ref<AdminSafetyTemplate[]>([])
const templateSubjectByKey = ref<Record<AdminSafetyTemplateKey, string>>({
  ESCALATION_ADMIN: '',
  ESCALATION_REPORTER: '',
  RESOLUTION_REPORTER: ''
})
const templateBodyByKey = ref<Record<AdminSafetyTemplateKey, string>>({
  ESCALATION_ADMIN: '',
  ESCALATION_REPORTER: '',
  RESOLUTION_REPORTER: ''
})
const templateSavedSnapshotByKey = ref<Record<AdminSafetyTemplateKey, { subject: string; body: string }>>({
  ESCALATION_ADMIN: { subject: '', body: '' },
  ESCALATION_REPORTER: { subject: '', body: '' },
  RESOLUTION_REPORTER: { subject: '', body: '' }
})
const templateDirtyByKey = ref<Record<AdminSafetyTemplateKey, boolean>>({
  ESCALATION_ADMIN: false,
  ESCALATION_REPORTER: false,
  RESOLUTION_REPORTER: false
})
const templateBusyByKey = ref<Record<AdminSafetyTemplateKey, boolean>>({
  ESCALATION_ADMIN: false,
  ESCALATION_REPORTER: false,
  RESOLUTION_REPORTER: false
})
const logsLoading = ref(false)
const logsError = ref('')
const logQ = ref('')
const logStatus = ref('')
const logChannel = ref('')
const logPage = ref(1)
const logTotalPages = ref(1)
const logTotal = ref(0)
const deliveryLogs = ref<AdminSafetyDeliveryLog[]>([])
const logBusyById = ref<Record<string, boolean>>({})
const notice = ref<{ kind: 'success' | 'error'; message: string }>({ kind: 'success', message: '' })
let noticeTimer: ReturnType<typeof setTimeout> | null = null
const nextStatusByIncident = ref<Record<string, 'RESOLVED' | 'CLOSED'>>({})
const actionByIncident = ref<Record<string, string>>({})
const noteByIncident = ref<Record<string, string>>({})
const escalatePriorityByIncident = ref<Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>>({})
const escalateReasonByIncident = ref<Record<string, string>>({})

function shortId(value: string) {
  return value.slice(0, 8)
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatDuration(seconds?: number | null) {
  if (typeof seconds !== 'number') return '—'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const rem = seconds % 60
  return `${mins}m ${rem}s`
}

function chipClass(value: AdminSafetyIncidentStatus) {
  if (value === 'OPEN') return 'chip-warn'
  if (value === 'IN_REVIEW') return 'chip-info'
  if (value === 'RESOLVED' || value === 'CLOSED') return 'chip-ok'
  return 'chip-info'
}

function initializeMaps(nextItems: AdminSafetyIncident[]) {
  const nextStatus: Record<string, 'RESOLVED' | 'CLOSED'> = {}
  const nextAction: Record<string, string> = {}
  const nextNote: Record<string, string> = {}
  const nextEscalatePriority: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {}
  const nextEscalateReason: Record<string, string> = {}

  for (const item of nextItems) {
    nextStatus[item.id] = nextStatusByIncident.value[item.id] ?? 'RESOLVED'
    nextAction[item.id] = actionByIncident.value[item.id] ?? ''
    nextNote[item.id] = noteByIncident.value[item.id] ?? ''
    nextEscalatePriority[item.id] = escalatePriorityByIncident.value[item.id] ?? (item.incidentMeta?.priority || 'HIGH') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    nextEscalateReason[item.id] = escalateReasonByIncident.value[item.id] ?? ''
  }

  nextStatusByIncident.value = nextStatus
  actionByIncident.value = nextAction
  noteByIncident.value = nextNote
  escalatePriorityByIncident.value = nextEscalatePriority
  escalateReasonByIncident.value = nextEscalateReason
}

function showNotice(kind: 'success' | 'error', message: string) {
  notice.value = { kind, message }
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value.message = ''
  }, 2500)
}

function hydrateTemplateForms(nextItems: AdminSafetyTemplate[]) {
  templateForms.value = nextItems
  for (const item of nextItems) {
    templateSubjectByKey.value[item.key] = item.subject
    templateBodyByKey.value[item.key] = item.body
    templateSavedSnapshotByKey.value[item.key] = { subject: item.subject, body: item.body }
    templateDirtyByKey.value[item.key] = false
  }
}

function markTemplateDirty(key: AdminSafetyTemplateKey) {
  const snapshot = templateSavedSnapshotByKey.value[key]
  templateDirtyByKey.value[key] =
    templateSubjectByKey.value[key] !== snapshot.subject ||
    templateBodyByKey.value[key] !== snapshot.body
}

function resetTemplateDraft(key: AdminSafetyTemplateKey) {
  const snapshot = templateSavedSnapshotByKey.value[key]
  templateSubjectByKey.value[key] = snapshot.subject
  templateBodyByKey.value[key] = snapshot.body
  templateDirtyByKey.value[key] = false
}

async function loadTemplates() {
  templatesLoading.value = true
  templatesError.value = ''
  try {
    const res = await api.adminGetSafetyTemplates()
    hydrateTemplateForms(res.items)
  } catch (err) {
    templatesError.value = err instanceof Error ? err.message : 'Template request failed'
  } finally {
    templatesLoading.value = false
  }
}

async function saveTemplate(key: AdminSafetyTemplateKey) {
  templateBusyByKey.value[key] = true
  templatesError.value = ''
  try {
    const res = await api.adminUpdateSafetyTemplate(key, {
      subject: templateSubjectByKey.value[key].trim(),
      body: templateBodyByKey.value[key].trim()
    })
    templateSubjectByKey.value[key] = res.template.subject
    templateBodyByKey.value[key] = res.template.body
    templateSavedSnapshotByKey.value[key] = { subject: res.template.subject, body: res.template.body }
    templateDirtyByKey.value[key] = false
    showNotice('success', `Template ${key} saved`)
  } catch (err) {
    templatesError.value = err instanceof Error ? err.message : 'Template update failed'
    showNotice('error', templatesError.value)
  } finally {
    templateBusyByKey.value[key] = false
  }
}

async function loadDeliveryLogs(nextPage = logPage.value) {
  logsLoading.value = true
  logsError.value = ''
  try {
    const res = await api.adminGetSafetyDeliveryLogs({
      q: logQ.value || undefined,
      status: (logStatus.value || undefined) as AdminSafetyDeliveryStatus | undefined,
      channel: (logChannel.value || undefined) as AdminSafetyDeliveryChannel | undefined,
      page: nextPage,
      limit: 10
    })
    deliveryLogs.value = res.items
    logPage.value = res.page
    logTotalPages.value = res.totalPages
    logTotal.value = res.total
  } catch (err) {
    logsError.value = err instanceof Error ? err.message : 'Delivery log request failed'
  } finally {
    logsLoading.value = false
  }
}

async function retryDelivery(logId: string) {
  logBusyById.value[logId] = true
  logsError.value = ''
  try {
    const res = await api.adminRetrySafetyDeliveryLog(logId)
    if (!res.retry.ok) {
      throw new Error(res.retry.error || 'Retry failed')
    }
    showNotice('success', 'Delivery retried')
    await loadDeliveryLogs(logPage.value)
  } catch (err) {
    logsError.value = err instanceof Error ? err.message : 'Retry failed'
    showNotice('error', logsError.value)
  } finally {
    logBusyById.value[logId] = false
  }
}

async function reload(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetSafetyIncidents({
      status: (status.value || undefined) as AdminSafetyIncidentStatus | undefined,
      q: q.value || undefined,
      priority: (priority.value || undefined) as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined,
      assigneeId: assigneeId.value || undefined,
      overdue: overdueOnly.value ? true : undefined,
      activeOnly: activeOnly.value,
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

async function withBusy(incidentId: string, action: () => Promise<void>) {
  busy.value[incidentId] = true
  error.value = ''
  try {
    await action()
    await reload(page.value)
    showNotice('success', 'Incident updated')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
    showNotice('error', error.value)
  } finally {
    busy.value[incidentId] = false
  }
}

async function acknowledgeIncident(incidentId: string) {
  await withBusy(incidentId, async () => {
    await api.adminAcknowledgeSafetyIncident(incidentId, noteByIncident.value[incidentId] || undefined)
  })
}

async function assignToMe(incidentId: string) {
  await withBusy(incidentId, async () => {
    await api.adminAssignSafetyIncident(incidentId, { note: noteByIncident.value[incidentId] || undefined })
  })
}

async function escalateIncident(incidentId: string) {
  const reason = escalateReasonByIncident.value[incidentId]?.trim()
  if (!reason) {
    error.value = 'Escalation reason is required'
    return
  }

  await withBusy(incidentId, async () => {
    await api.adminEscalateSafetyIncident(incidentId, {
      priority: escalatePriorityByIncident.value[incidentId],
      reason
    })
  })
}

async function resolveIncident(incidentId: string) {
  const action = actionByIncident.value[incidentId]?.trim()
  if (!action) {
    error.value = 'Action taken is required'
    return
  }

  await withBusy(incidentId, async () => {
    await api.adminResolveSafetyIncident(incidentId, {
      status: nextStatusByIncident.value[incidentId],
      action,
      note: noteByIncident.value[incidentId] || undefined
    })
  })
}

onMounted(() => {
  reload(1)
  loadTemplates()
  loadDeliveryLogs(1)
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
.incidents,
.templates-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.templates-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.templates-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.templates-error {
  color: #b42318;
}

.notice-card {
  font-weight: 600;
}

.notice-success {
  background: #e6f7ed;
  color: #116b3a;
  border: 1px solid #b7ebc9;
}

.notice-error {
  background: #fff1f0;
  color: #b42318;
  border: 1px solid #f6c7c4;
}

.template-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.template-body {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.template-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
  color: #475467;
}

.incident-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.incident-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.timeline-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
}

.timeline-list {
  margin: 8px 0 0;
  padding: 0 0 0 18px;
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

.chip-ok {
  background: #e6f7ed;
  color: #116b3a;
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
  .templates-head,
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .template-actions {
    justify-content: stretch;
  }

  .template-actions .button {
    flex: 1;
  }
}
</style>
