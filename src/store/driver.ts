import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
import { getSocket } from '../services/socket'
import type { RideDetails } from '../services/types'
import { isGpsOutlier, smoothPosition } from '../utils/gpsSmoothing'

export const useDriverStore = defineStore('driver', () => {
  const isOnline = ref(false)
  const loading = ref(false)
  const currentRide = ref<RideDetails | null>(null)
  // idle | incoming | arriving | in_progress
  const rideStatus = ref<'idle' | 'incoming' | 'arriving' | 'in_progress'>('idle')
  const arrivedAtPickup = ref(false)
  const driverLocation = ref<{ lat: number; lng: number } | null>(null)

  // watchPosition handles — null when not tracking
  let locationWatchId: number | null = null         // high-accuracy GPS watch
  let locationFallbackId: number | null = null      // low-accuracy network fallback watch
  // Timestamp of last server/socket emission — throttled to avoid API spam
  let lastEmitMs = 0
  // Minimum ms between server emissions (3 s keeps passengers smooth without hammering the API)
  const EMIT_INTERVAL_MS = 3000
  // GPS smoothing state
  let lastAcceptedMs = 0
  let smoothedLocation: { lat: number; lng: number } | null = null
  // Socket reconnect handler reference (stored so it can be removed on cleanup)
  let driverReconnectHandler: (() => void) | null = null

  // ── Online / Offline ──────────────────────────────────────────────────────

  async function goOnline(driverId: string, lat: number, lng: number) {
    loading.value = true
    try {
      await api.driverGoOnline(driverId, lat, lng)
      isOnline.value = true
      driverLocation.value = { lat, lng }

      // Join socket room so this driver receives ride:status events
      const socket = getSocket()
      socket.emit('driver:online', { driverId })

      startLocationTracking(driverId)
    } finally {
      loading.value = false
    }
  }

  async function goOffline(driverId: string) {
    loading.value = true
    try {
      await api.driverGoOffline(driverId)
      isOnline.value = false
      stopLocationTracking()
    } finally {
      loading.value = false
    }
  }

  // ── Continuous GPS tracking ───────────────────────────────────────────────
  //
  // Uses a dual-watch strategy to guarantee location updates on Android:
  //
  //   Watch 1 (high accuracy) — uses GPS satellite; accurate but can time out when
  //     the device is indoors or GPS hasn't locked yet. If it times out, the null
  //     error callback silently swallows the failure — so Watch 2 is essential.
  //
  //   Watch 2 (low accuracy fallback) — uses network/WiFi location; always fires
  //     even when GPS is unavailable. Less precise (~50 m) but guarantees the app
  //     always has a recent position and the maps always move.
  //
  // driverLocation is updated immediately on EVERY callback from either watch.
  // Server/socket emissions are throttled to EMIT_INTERVAL_MS so we don't hammer
  // the backend or flood the passenger with redundant events.

  async function handlePosition(driverId: string, pos: GeolocationPosition) {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords
    const now = Date.now()
    const raw = { lat, lng }

    // ── Layer 1: outlier rejection ──────────────────────────────────────────
    if (smoothedLocation && isGpsOutlier(smoothedLocation, raw, now - lastAcceptedMs)) {
      console.warn(`[GPS] outlier discarded — lat:${lat.toFixed(6)} lng:${lng.toFixed(6)}`)
      return
    }

    // ── Layer 2: low-pass smoothing ─────────────────────────────────────────
    smoothedLocation = smoothedLocation
      ? smoothPosition(smoothedLocation, raw)
      : raw
    lastAcceptedMs = now

    const { lat: sLat, lng: sLng } = smoothedLocation

    // Update the driver's own reactive location with the smoothed position
    driverLocation.value = { lat: sLat, lng: sLng }

    console.log(`[GPS] fix — lat:${lat.toFixed(6)} lng:${lng.toFixed(6)} accuracy:${accuracy?.toFixed(0)}m`)

    // Throttle: only push to server/passenger every EMIT_INTERVAL_MS
    if (now - lastEmitMs < EMIT_INTERVAL_MS) return
    lastEmitMs = now

    try {
      await api.driverUpdateLocation(driverId, sLat, sLng)
    } catch {
      // Non-fatal — location update failure should not crash the ride
    }

    if (currentRide.value) {
      const socket = getSocket()
      socket.emit('driver:location_update', { rideId: currentRide.value.id, lat: sLat, lng: sLng })
      console.log(`[GPS] emitted driver:location_update for ride ${currentRide.value.id}`)
    }
  }

  function startLocationTracking(driverId: string) {
    stopLocationTracking()
    if (!navigator.geolocation) return

    const onPosition = (pos: GeolocationPosition) => { void handlePosition(driverId, pos) }

    // Immediate low-accuracy fix so the map isn't blank while GPS warms up
    navigator.geolocation.getCurrentPosition(onPosition, null, {
      enableHighAccuracy: false,
      maximumAge: 5000,
      timeout: 10000,
    })

    // Watch 1: high-accuracy GPS (most precise; may be slow to lock or time out indoors)
    locationWatchId = navigator.geolocation.watchPosition(onPosition, (err) => {
      console.warn(`[GPS] high-accuracy watch error — code:${err.code} msg:${err.message}`)
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    })

    // Watch 2: low-accuracy network/WiFi fallback (always fires, even without GPS lock)
    // This guarantees the map keeps moving even when Watch 1 can't get a satellite fix.
    locationFallbackId = navigator.geolocation.watchPosition(onPosition, (err) => {
      console.warn(`[GPS] low-accuracy watch error — code:${err.code} msg:${err.message}`)
    }, {
      enableHighAccuracy: false,
      maximumAge: 3000,
      timeout: 10000,
    })

    console.log(`[GPS] tracking started — watchId:${locationWatchId} fallbackId:${locationFallbackId}`)
  }

  function stopLocationTracking() {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId)
      locationWatchId = null
    }
    if (locationFallbackId !== null) {
      navigator.geolocation.clearWatch(locationFallbackId)
      locationFallbackId = null
    }
    smoothedLocation = null
    lastAcceptedMs   = 0
    lastEmitMs = 0
  }

  // Start tracking only if not already running — safe to call from any page as a safety net
  function ensureLocationTracking(driverId: string) {
    if (locationWatchId !== null || locationFallbackId !== null) return
    startLocationTracking(driverId)
  }

  // Keep old names as aliases so nothing else in the codebase breaks
  const startLocationPolling = startLocationTracking
  const stopLocationPolling  = stopLocationTracking

  // ── Ride actions ──────────────────────────────────────────────────────────

  async function acceptRide(driverId: string) {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideUpdateStatus(currentRide.value.id, 'ARRIVING', driverId)
      rideStatus.value = 'arriving'
      arrivedAtPickup.value = false
      // Immediately push current location so passenger sees car icon without waiting for next poll
      if (driverLocation.value) {
        const socket = getSocket()
        socket.emit('driver:location_update', { rideId: currentRide.value.id, ...driverLocation.value })
      }
    } finally {
      loading.value = false
    }
  }

  async function declineRide(driverId: string) {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideDecline(currentRide.value.id, driverId)
      currentRide.value = null
      rideStatus.value = 'idle'
      arrivedAtPickup.value = false
    } finally {
      loading.value = false
    }
  }

  async function markArrived(driverId: string) {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideAddEvent(currentRide.value.id, 'ARRIVED_AT_PICKUP', { driverId })
      rideStatus.value = 'arriving'
      arrivedAtPickup.value = true
    } finally {
      loading.value = false
    }
  }

  async function startTrip(driverId: string) {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideUpdateStatus(currentRide.value.id, 'IN_PROGRESS', driverId)
      rideStatus.value = 'in_progress'
      arrivedAtPickup.value = false
    } finally {
      loading.value = false
    }
  }

  async function completeTrip(driverId: string) {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideUpdateStatus(currentRide.value.id, 'COMPLETED', driverId)
      currentRide.value = null
      rideStatus.value = 'idle'
      arrivedAtPickup.value = false
    } finally {
      loading.value = false
    }
  }

  // ── Socket subscription ───────────────────────────────────────────────────

  function subscribeToRideEvents(driverId: string) {
    const socket = getSocket()
    socket.emit('join', { userId: driverId })

    // Re-join user room on socket reconnect (mobile network drops/resumes)
    if (driverReconnectHandler) socket.off('connect', driverReconnectHandler)
    driverReconnectHandler = () => {
      socket.emit('join', { userId: driverId })
      // Immediately push location to passengers so they don't have to wait for next GPS tick
      if (currentRide.value && driverLocation.value) {
        socket.emit('driver:location_update', {
          rideId: currentRide.value.id,
          lat: driverLocation.value.lat,
          lng: driverLocation.value.lng,
        })
      }
    }
    socket.on('connect', driverReconnectHandler)

    socket.on('ride:status', (data: { rideId: string; status: string; riderId?: string }) => {
      if (data.status === 'ASSIGNED') {
        // Fetch full ride details and show incoming request
        api.driverGetActiveRide(driverId).then(({ ride }) => {
          if (ride) {
            currentRide.value = ride
            rideStatus.value = 'incoming'
            arrivedAtPickup.value = false
          }
        })
      } else if (data.status === 'CANCELLED') {
        currentRide.value = null
        rideStatus.value = 'idle'
        arrivedAtPickup.value = false
      }
    })
  }

  function unsubscribeFromRideEvents() {
    const socket = getSocket()
    socket.off('ride:status')
    if (driverReconnectHandler) {
      socket.off('connect', driverReconnectHandler)
      driverReconnectHandler = null
    }
    // NOTE: do NOT stop location tracking here — the driver is still online and
    // may have an active ride. Tracking is stopped only by goOffline() or when
    // the app closes. Stopping it here was the root cause of map freezing after
    // the driver navigated away from DriverHome.
  }

  // ── Resume active ride on app open ────────────────────────────────────────

  function syncRideState(ride: RideDetails | null) {
    currentRide.value = ride
    if (!ride) {
      rideStatus.value = 'idle'
      arrivedAtPickup.value = false
      return
    }
    if (ride.status === 'ASSIGNED') rideStatus.value = 'incoming'
    if (ride.status === 'ARRIVING') rideStatus.value = 'arriving'
    if (ride.status === 'IN_PROGRESS') rideStatus.value = 'in_progress'
    arrivedAtPickup.value = Boolean(ride.events?.some((event) => event.type === 'ARRIVED_AT_PICKUP'))
  }

  async function resumeSession(driverId: string) {
    const session = await api.driverGetSession(driverId)
    isOnline.value = session.isOnline
    driverLocation.value = session.location ? { lat: session.location.lat, lng: session.location.lng } : null
    syncRideState(session.ride)
    if (session.isOnline) startLocationPolling(driverId)
  }

  return {
    isOnline,
    loading,
    currentRide,
    rideStatus,
    arrivedAtPickup,
    driverLocation,
    goOnline,
    goOffline,
    acceptRide,
    declineRide,
    markArrived,
    startTrip,
    completeTrip,
    subscribeToRideEvents,
    unsubscribeFromRideEvents,
    ensureLocationTracking,
    resumeSession,
  }
})
