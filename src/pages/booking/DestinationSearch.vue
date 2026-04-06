<template>
  <div class="search-screen">

    <!-- ── Dark Hero Header ── -->
    <div class="hero-header">
      <button class="back-btn" type="button" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <span class="hero-title">Plan your ride</span>
    </div>

    <!-- ── Route Card ── -->
    <div class="route-card">
      <!-- Connector line between dots -->
      <div class="route-connector" aria-hidden="true"></div>

      <!-- Pickup row -->
      <div class="route-row" @click="activatePickup">
        <span class="route-dot pickup-dot" aria-hidden="true"></span>
        <div class="route-field">
          <div class="route-field-label">Pickup</div>
          <input
            v-if="editingPickup"
            ref="pickupInputRef"
            v-model="pickupSearch.query.value"
            class="route-input"
            placeholder="Search pickup location"
            autocomplete="off"
            @focus="activeField = 'pickup'"
          />
          <span v-else class="route-value" :class="{ muted: locating }">
            {{ locating ? 'Getting your location…' : (booking.pickup?.address || 'Set pickup location') }}
          </span>
        </div>
        <button v-if="!editingPickup" class="edit-btn" type="button" aria-label="Edit pickup" @click.stop="activatePickup">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      <div class="route-sep" aria-hidden="true"></div>

      <!-- Destination row -->
      <div class="route-row">
        <span class="route-dot dest-dot" aria-hidden="true"></span>
        <div class="route-field">
          <div class="route-field-label">Drop-off</div>
          <input
            ref="destInputRef"
            v-model="destSearch.query.value"
            class="route-input"
            placeholder="Where to?"
            autocomplete="off"
            @focus="activeField = 'destination'"
          />
        </div>
        <button
          v-if="destSearch.query.value"
          class="clear-btn"
          type="button"
          aria-label="Clear destination"
          @click="destSearch.query.value = ''"
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
        </button>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="body">

      <!-- Search results when typing -->
      <template v-if="activeField && activeSearch.query.value.length > 0">
        <div v-if="activeSearch.loading.value" class="status-row">
          <div class="spinner" aria-hidden="true"></div>
          Searching…
        </div>

        <ul v-else-if="activeSearch.results.value.length" class="place-list">
          <li
            v-for="place in activeSearch.results.value"
            :key="place.placeId"
            class="place-item"
            @click="pick(place.placeId)"
          >
            <span class="place-icon-wrap search-icon-wrap" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <div class="place-body">
              <div class="place-title">{{ toTitle(place.description) }}</div>
              <div class="place-subtitle">{{ toSubtitle(place.description) }}</div>
            </div>
          </li>
        </ul>

        <div v-else-if="activeSearch.query.value.length >= 3" class="status-row no-results">
          No results found for "{{ activeSearch.query.value }}"
        </div>

        <div v-else class="hint-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Type at least 3 characters to search
        </div>
      </template>

      <!-- Default state: Favorites + Recents -->
      <template v-else>

        <!-- Favorites -->
        <section>
          <div class="section-label">Favorites</div>
          <div class="fav-row">
            <button class="fav-pill" type="button" @click="pickFavorite('home')">
              <span class="fav-icon fav-home" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
              </span>
              <div class="fav-text">
                <div class="fav-title">Home</div>
                <div class="fav-subtitle">{{ homeAddress }}</div>
              </div>
            </button>
            <button class="fav-pill" type="button" @click="pickFavorite('work')">
              <span class="fav-icon fav-work" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
              </span>
              <div class="fav-text">
                <div class="fav-title">Work</div>
                <div class="fav-subtitle">{{ workAddress }}</div>
              </div>
            </button>
          </div>
        </section>

        <!-- Recent searches -->
        <section v-if="recentSearches.length">
          <div class="section-label">Recent</div>
          <ul class="place-list">
            <li
              v-for="(place, i) in recentSearches"
              :key="i"
              class="place-item"
              @click="pickRecent(place)"
            >
              <span class="place-icon-wrap recent-icon-wrap" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              </span>
              <div class="place-body">
                <div class="place-title">{{ place.title }}</div>
                <div class="place-subtitle">{{ place.subtitle }}</div>
              </div>
              <button class="remove-btn" type="button" aria-label="Remove" @click.stop="removeRecent(i)">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
              </button>
            </li>
          </ul>
        </section>

        <!-- Empty state when no recents -->
        <div v-else class="empty-state">
          <div class="empty-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="1.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="empty-title">Where are you headed?</div>
          <div class="empty-sub">Search above or tap a favorite to book your EV ride.</div>
        </div>

      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../store/booking'
import { usePlacesSearch } from '../../composables/usePlacesSearch'
import { getCurrentLocationPoint } from '../../composables/useCurrentLocation'

const RECENTS_KEY = 'solvec_recent_searches'
const MAX_RECENTS = 6

interface RecentPlace {
  title: string
  subtitle: string
  address: string
  lat: number
  lng: number
}

const router = useRouter()
const booking = useBookingStore()

const pickupSearch = usePlacesSearch()
const destSearch = usePlacesSearch()

const locating = ref(false)
const editingPickup = ref(false)
const activeField = ref<'pickup' | 'destination' | null>(null)

const pickupInputRef = ref<HTMLInputElement | null>(null)
const destInputRef = ref<HTMLInputElement | null>(null)

const activeSearch = computed(() =>
  activeField.value === 'pickup' ? pickupSearch : destSearch
)

// ── Favorites (hardcoded placeholder — would come from user profile in prod) ──
const homeAddress = 'Add your home address'
const workAddress = 'Add your work address'

// ── Recent searches (localStorage) ──
const recentSearches = ref<RecentPlace[]>([])

function loadRecents() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    recentSearches.value = raw ? JSON.parse(raw) : []
  } catch {
    recentSearches.value = []
  }
}

function saveRecent(place: RecentPlace) {
  const list = recentSearches.value.filter(r => r.address !== place.address)
  list.unshift(place)
  recentSearches.value = list.slice(0, MAX_RECENTS)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recentSearches.value))
}

function removeRecent(index: number) {
  recentSearches.value.splice(index, 1)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recentSearches.value))
}

// ── Navigation ──
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

async function activatePickup() {
  editingPickup.value = true
  activeField.value = 'pickup'
  await nextTick()
  pickupInputRef.value?.focus()
}

async function pick(placeId: string) {
  const details = await activeSearch.value.selectPlace(placeId)
  if (!details) return

  const location = { address: details.address, lat: details.lat, lng: details.lng }

  if (activeField.value === 'pickup') {
    booking.setPickup(location)
    editingPickup.value = false
    pickupSearch.query.value = ''
    activeField.value = 'destination'
    await nextTick()
    destInputRef.value?.focus()
  } else {
    booking.setDropoff(location)
    saveRecent({
      title: toTitle(details.address),
      subtitle: toSubtitle(details.address),
      address: details.address,
      lat: details.lat,
      lng: details.lng,
    })
    router.push('/booking/confirm-location/pickup')
  }
}

function pickRecent(place: RecentPlace) {
  booking.setDropoff({ address: place.address, lat: place.lat, lng: place.lng })
  // Move to top of recents
  saveRecent(place)
  router.push('/booking/confirm-location/pickup')
}

function pickFavorite(_type: 'home' | 'work') {
  // In production, resolve coordinates from user profile saved addresses.
  // For now, focus the drop-off field so the user can search the address.
  activeField.value = 'destination'
  destInputRef.value?.focus()
}

onMounted(async () => {
  loadRecents()

  locating.value = true
  try {
    const location = await getCurrentLocationPoint()
    booking.setPickup(location)
  } catch {
    // GPS unavailable — let user search manually
  } finally {
    locating.value = false
  }

  await nextTick()
  destInputRef.value?.focus()
})
</script>

<style scoped>
/* ── Screen ── */
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

/* ── Route card ── */
.route-card {
  margin: -1px 16px 0;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 6px 0;
  position: relative;
  z-index: 2;
}

.route-connector {
  position: absolute;
  left: 31px;
  top: 38px;
  bottom: 38px;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    #00c4bc 0px, #00c4bc 4px,
    transparent 4px, transparent 9px
  );
}

.route-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: text;
}

.route-dot {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.pickup-dot {
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 4px rgba(0,196,188,0.15);
}

.dest-dot {
  border-radius: 4px;
  background: #f5a623;
  box-shadow: 0 0 0 4px rgba(245,166,35,0.15);
}

.route-sep {
  height: 1px;
  background: #f1f5f8;
  margin: 0 16px 0 42px;
}

.route-field {
  flex: 1;
  min-width: 0;
}

.route-field-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}

.route-value {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.route-value.muted {
  color: #9ca3af;
  font-weight: 400;
}

.route-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  outline: none;
}

.route-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.edit-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #f1f5f8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
  cursor: pointer;
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
  gap: 20px;
}

/* Section label */
.section-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 10px;
}

/* ── Favorites ── */
.fav-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fav-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: background 0.15s;
}

.fav-pill:active { background: #f8fffe; }

.fav-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fav-home {
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff;
}

.fav-work {
  background: linear-gradient(145deg, #f5a623, #d4820a);
  color: #fff;
}

.fav-text {
  flex: 1;
  min-width: 0;
}

.fav-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.fav-subtitle {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Place list (recents + results) ── */
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
  grid-template-columns: 40px minmax(0,1fr) auto;
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-icon-wrap {
  background: rgba(0,196,188,0.1);
  color: #00c4bc;
}

.recent-icon-wrap {
  background: #f1f5f8;
  color: #6b7280;
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

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  flex-shrink: 0;
}

.remove-btn:active { background: #f1f5f8; }

/* ── Status / hints ── */
.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  padding: 12px 4px;
}

.no-results { color: #9ca3af; }

.hint-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9ca3af;
  padding: 8px 4px;
}

/* Spinner */
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

/* ── Empty state ── */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  gap: 10px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(0,196,188,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.empty-sub {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
}
</style>
