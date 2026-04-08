<template>
  <div class="app-screen admin-screen">
    <AppHeader>
      <template #title>Pricing Management</template>
      <template #subtitle>Control fare computation in real-time</template>
      <template #action>
        <button class="button button-ghost back-button" type="button" @click="router.push('/admin')">Back</button>
      </template>
    </AppHeader>

    <div v-if="error" class="card">
      <div class="section-title">Unable to load/save pricing</div>
      <p class="text-secondary">{{ error }}</p>
    </div>

    <form class="card form" @submit.prevent="save">
      <label class="field">
        <span class="label">Currency</span>
        <input v-model.trim="currency" class="input" maxlength="3" placeholder="PHP" />
      </label>
      <label class="field">
        <span class="label">Base Fare</span>
        <input v-model.number="baseFare" class="input" type="number" min="0" step="0.01" />
      </label>
      <label class="field">
        <span class="label">Per KM Rate</span>
        <input v-model.number="perKmRate" class="input" type="number" min="0" step="0.01" />
      </label>
      <label class="field">
        <span class="label">Per Minute Rate</span>
        <input v-model.number="perMinuteRate" class="input" type="number" min="0" step="0.01" />
      </label>
      <label class="field">
        <span class="label">Minimum Fare</span>
        <input v-model.number="minimumFare" class="input" type="number" min="0" step="0.01" />
      </label>

      <div class="row">
        <button class="button button-primary" type="submit" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save Pricing' }}
        </button>
        <button class="button button-ghost" type="button" :disabled="loading" @click="load">
          Reload
        </button>
      </div>
      <p class="text-secondary">Last updated: {{ updatedAtLabel }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { api } from '../../services/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const currency = ref('PHP')
const baseFare = ref(55)
const perKmRate = ref(15)
const perMinuteRate = ref(2.8)
const minimumFare = ref(55)
const updatedAt = ref<string | null>(null)

const updatedAtLabel = computed(() => {
  if (!updatedAt.value) return '—'
  const d = new Date(updatedAt.value)
  if (Number.isNaN(d.getTime())) return updatedAt.value
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminGetPricing()
    currency.value = res.config.currency
    baseFare.value = res.config.baseFare
    perKmRate.value = res.config.perKmRate
    perMinuteRate.value = res.config.perMinuteRate
    minimumFare.value = res.config.minimumFare
    updatedAt.value = res.config.updatedAt
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

async function save() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.adminUpdatePricing({
      currency: (currency.value || 'PHP').toUpperCase(),
      baseFare: Number(baseFare.value),
      perKmRate: Number(perKmRate.value),
      perMinuteRate: Number(perMinuteRate.value),
      minimumFare: Number(minimumFare.value)
    })
    currency.value = res.config.currency
    baseFare.value = res.config.baseFare
    perKmRate.value = res.config.perKmRate
    perMinuteRate.value = res.config.perMinuteRate
    minimumFare.value = res.config.minimumFare
    updatedAt.value = res.config.updatedAt
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.admin-screen {
  max-width: 860px;
  margin: 0 auto;
}

.back-button {
  min-height: 40px;
  padding: 8px 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  font-weight: 600;
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.row > * {
  flex: 1;
  min-width: 160px;
}
</style>
