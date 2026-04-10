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
        <input v-model.trim="targetType" class="input" placeholder="Target type (e.g. payment, vehicle)" />
      </div>
      <div class="filter-row">
        <input v-model.trim="actorId" class="input" placeholder="Admin ID (optional)" />
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply Filters</button>
        <button class="button button-ghost" type="button" :disabled="loading" @click="resetFilters">Reset</button>
      </div>
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
          <span class="chip chip-info">{{ item.targetType }}</span>
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
import { onMounted, ref } from 'vue'
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
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const items = ref<AdminAuditLog[]>([])

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
      page: nextPage,
      limit: 15
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

function resetFilters() {
  q.value = ''
  action.value = ''
  targetType.value = ''
  actorId.value = ''
  reload(1)
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

@media (max-width: 720px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
