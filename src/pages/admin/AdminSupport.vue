<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Support Operations</template>
      <template #subtitle>Review incidents, complaints, and ticket resolution</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div class="card filters">
      <div class="filter-row">
        <input v-model.trim="q" class="input" placeholder="Search ticket/category/description/user" />
        <input v-model.trim="category" class="input" placeholder="Category (optional)" />
        <select v-model="status" class="input select-input">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="filter-row">
        <button class="button button-primary" type="button" :disabled="loading" @click="reload(1)">Apply Filters</button>
      </div>
    </div>

    <div v-if="error" class="card">
      <div class="section-title">Support request failed</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <div v-if="loading" class="card">
      <div class="section-title">Loading tickets...</div>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="section-title">No support tickets found</div>
      <p class="text-secondary">Try updating the filters.</p>
    </div>

    <div v-else class="tickets">
      <article v-for="item in items" :key="item.id" class="card ticket-card">
        <div class="ticket-head">
          <div>
            <div class="section-title">Ticket {{ shortId(item.id) }}</div>
            <p class="text-secondary">{{ formatDate(item.createdAt) }} · {{ item.category }}</p>
          </div>
          <span class="chip" :class="chipClass(item.status)">{{ item.status }}</span>
        </div>

        <p class="text-secondary"><strong>User:</strong> {{ item.user.name }} ({{ item.user.phone }}) · {{ item.user.role }}</p>
        <p class="text-secondary"><strong>Description:</strong> {{ item.description }}</p>

        <div class="action-row">
          <select v-model="statusByTicket[item.id]" class="input select-input">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <input
            v-model.trim="noteByTicket[item.id]"
            class="input"
            placeholder="Resolution note (optional)"
          />
        </div>

        <div class="action-row">
          <button class="button button-primary" type="button" :disabled="busy[item.id]" @click="updateStatus(item.id)">
            {{ busy[item.id] ? 'Saving...' : 'Update Ticket' }}
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
import type { AdminSupportTicket, AdminSupportTicketStatus } from '../../services/types'

const router = useRouter()
const statuses: AdminSupportTicketStatus[] = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']

const loading = ref(false)
const error = ref('')
const q = ref('')
const category = ref('')
const status = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const items = ref<AdminSupportTicket[]>([])
const busy = ref<Record<string, boolean>>({})
const statusByTicket = ref<Record<string, AdminSupportTicketStatus>>({})
const noteByTicket = ref<Record<string, string>>({})

function shortId(value: string) {
  return value.slice(0, 8)
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function chipClass(value: AdminSupportTicketStatus) {
  if (value === 'OPEN') return 'chip-warn'
  if (value === 'IN_REVIEW') return 'chip-info'
  if (value === 'RESOLVED' || value === 'CLOSED') return 'chip-ok'
  return 'chip-info'
}

function initializeState(nextItems: AdminSupportTicket[]) {
  const nextStatus: Record<string, AdminSupportTicketStatus> = {}
  const nextNotes: Record<string, string> = {}
  for (const item of nextItems) {
    nextStatus[item.id] = statusByTicket.value[item.id] ?? item.status
    nextNotes[item.id] = noteByTicket.value[item.id] ?? ''
  }
  statusByTicket.value = nextStatus
  noteByTicket.value = nextNotes
}

async function reload(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetSupportTickets({
      status: (status.value || undefined) as AdminSupportTicketStatus | undefined,
      category: category.value || undefined,
      q: q.value || undefined,
      page: nextPage,
      limit: 12
    })
    items.value = res.items
    page.value = res.page
    totalPages.value = res.totalPages
    total.value = res.total
    initializeState(res.items)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

async function updateStatus(ticketId: string) {
  busy.value[ticketId] = true
  error.value = ''
  try {
    await api.adminUpdateSupportTicketStatus(ticketId, statusByTicket.value[ticketId], noteByTicket.value[ticketId] || undefined)
    await reload(page.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    busy.value[ticketId] = false
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
.tickets {
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

.ticket-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ticket-head {
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
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
