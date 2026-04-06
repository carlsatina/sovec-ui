<template>
  <div class="search-screen">

    <!-- ── Dark Hero Header ── -->
    <div class="hero-header">
      <button class="back-btn" type="button" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <span class="hero-title">Set pickup location</span>
    </div>

    <!-- ── Search input card ── -->
    <div class="search-card">
      <!-- Current location pill -->
      <button v-if="!isEditing" class="loc-pill" type="button" @click="startEditing">
        <span class="pulse-dot" :class="{ locating }" aria-hidden="true"></span>
        <span class="loc-pill-text">
          {{ locating ? 'Getting your location…' : (currentLocation?.address || 'Tap to search pickup') }}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>

      <!-- Search input -->
      <div v-else class="search-bar">
        <span class="pickup-dot" aria-hidden="true"></span>
        <input
          ref="inputRef"
          v-model="query"
          class="search-input"
          placeholder="Search pickup location"
          autocomplete="off"
        />
        <button class="clear-btn" type="button" aria-label="Cancel" @click="cancelEditing">
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
        </button>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="body">

      <!-- Searching -->
      <template v-if="isEditing">
        <div v-if="loading" class="status-row">
          <div class="spinner" aria-hidden="true"></div>
          Searching…
        </div>

        <ul v-else-if="results.length" class="place-list">
          <li
            v-for="place in results"
            :key="place.placeId"
            class="place-item"
            @click="pick(place.placeId)"
          >
            <span class="place-icon-wrap" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <div class="place-body">
              <div class="place-title">{{ toTitle(place.description) }}</div>
              <div class="place-subtitle">{{ toSubtitle(place.description) }}</div>
            </div>
          </li>
        </ul>

        <div v-else-if="query.length >= 3" class="status-row">No results found</div>
        <div v-else class="hint-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Type at least 3 characters to search
        </div>
      </template>

      <!-- Current location confirm -->
      <template v-else>
        <div class="loc-info-card">
          <div class="loc-info-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
          </div>
          <div>
            <div class="loc-info-title">Your current location</div>
            <div class="loc-info-sub">{{ currentLocation?.address || 'Location not available' }}</div>
          </div>
        </div>

        <button
          class="confirm-btn"
          type="button"
          :disabled="!currentLocation || locating"
          @click="confirmCurrentLocation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ locating ? 'Getting location…' : 'Use current location' }}
        </button>

        <div class="or-divider"><span>or search below</span></div>

        <button class="manual-search-btn" type="button" @click="startEditing">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search for a location
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../store/booking'
import { usePlacesSearch } from '../../composables/usePlacesSearch'
import { getCurrentLocationPoint } from '../../composables/useCurrentLocation'

const router = useRouter()
const booking = useBookingStore()
const { query, results, loading, selectPlace } = usePlacesSearch()

const currentLocation = ref<{ address: string; lat: number; lng: number } | null>(null)
const locating = ref(false)
const isEditing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function goBack() {
  router.back()
}

function toTitle(description: string) {
  return description.split(',')[0] || description
}

function toSubtitle(description: string) {
  const parts = description.split(',')
  return parts.slice(1).join(',').trim() || description
}

async function startEditing() {
  isEditing.value = true
  await nextTick()
  inputRef.value?.focus()
}

function cancelEditing() {
  isEditing.value = false
  query.value = ''
}

async function pick(placeId: string) {
  const details = await selectPlace(placeId)
  if (!details) return
  booking.setPickup({ address: details.address, lat: details.lat, lng: details.lng })
  router.push('/booking/confirm-location/pickup')
}

function confirmCurrentLocation() {
  if (!currentLocation.value) return
  booking.setPickup(currentLocation.value)
  router.push('/booking/confirm-location/pickup')
}

onMounted(async () => {
  locating.value = true
  try {
    const location = await getCurrentLocationPoint()
    currentLocation.value = location
    booking.setPickup(location)
  } catch {
    isEditing.value = true
    await nextTick()
    inputRef.value?.focus()
  } finally {
    locating.value = false
  }
})
</script>

<style scoped>
.search-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f1f5f8;
}

/* ── Hero header ── */
.hero-header {
  background: linear-gradient(160deg, #071524 0%, #0c2233 55%, #0d3344 100%);
  padding: 52px 20px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.15s;
}

.back-btn:active { background: rgba(255,255,255,0.15); }

.hero-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

/* ── Search card ── */
.search-card {
  margin: -1px 16px 0;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 8px;
  position: relative;
  z-index: 2;
}

.loc-pill {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border: 1.5px solid rgba(0,196,188,0.3);
  border-radius: 14px;
  background: rgba(0,196,188,0.04);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}

.loc-pill:active {
  background: rgba(0,196,188,0.08);
  border-color: #00c4bc;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 3px rgba(0,196,188,0.2);
  flex-shrink: 0;
  transition: background 0.2s;
}

.pulse-dot.locating {
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.75); }
}

.loc-pill-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px solid #00c4bc;
  border-radius: 14px;
  background: #fff;
}

.pickup-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 3px rgba(0,196,188,0.15);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  outline: none;
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.clear-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
  cursor: pointer;
}

/* ── Body ── */
.body {
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Location info card */
.loc-info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.loc-info-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(0,196,188,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.loc-info-title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.loc-info-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.4;
}

/* Confirm button */
.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,196,188,0.35);
  transition: opacity 0.15s, transform 0.15s;
}

.confirm-btn:active { transform: scale(0.98); }
.confirm-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

/* Or divider */
.or-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.or-divider::before,
.or-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

/* Manual search button */
.manual-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.manual-search-btn:active {
  background: #f8fffe;
  border-color: #00c4bc;
}

/* Place list */
.place-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.place-item {
  display: grid;
  grid-template-columns: 40px minmax(0,1fr);
  gap: 12px;
  align-items: center;
  padding: 13px 16px;
  border-bottom: 1px solid #f1f5f8;
  cursor: pointer;
  transition: background 0.12s;
}

.place-item:last-child { border-bottom: none; }
.place-item:active { background: #f8fffe; }

.place-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(0,196,188,0.1);
  color: #00c4bc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.place-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.place-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status rows */
.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  padding: 12px 4px;
}

.hint-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9ca3af;
  padding: 8px 4px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0,196,188,0.25);
  border-top-color: #00c4bc;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
