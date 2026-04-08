import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
import { getSocket } from '../services/socket'
import type { RideDetails } from '../services/types'

export const useDriverStore = defineStore('driver', () => {
  const isOnline = ref(false)
  const loading = ref(false)
  const currentRide = ref<RideDetails | null>(null)
  // idle | incoming | arriving | in_progress
  const rideStatus = ref<'idle' | 'incoming' | 'arriving' | 'in_progress'>('idle')
  const arrivedAtPickup = ref(false)
  const driverLocation = ref<{ lat: number; lng: number } | null>(null)

  let locationInterval: ReturnType<typeof setInterval> | null = null

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

      // Start location polling every 8s
      startLocationPolling(driverId)
    } finally {
      loading.value = false
    }
  }

  async function goOffline(driverId: string) {
    loading.value = true
    try {
      await api.driverGoOffline(driverId)
      isOnline.value = false
      stopLocationPolling()
    } finally {
      loading.value = false
    }
  }

  // ── Location polling ──────────────────────────────────────────────────────

  function startLocationPolling(driverId: string) {
    stopLocationPolling()
    locationInterval = setInterval(async () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        driverLocation.value = { lat, lng }
        await api.driverUpdateLocation(driverId, lat, lng)

        // Broadcast live position to active ride room so passenger map updates
        if (currentRide.value) {
          const socket = getSocket()
          socket.emit('driver:location_update', { rideId: currentRide.value.id, lat, lng })
        }
      })
    }, 8000)
  }

  function stopLocationPolling() {
    if (locationInterval != null) {
      clearInterval(locationInterval)
      locationInterval = null
    }
  }

  // ── Ride actions ──────────────────────────────────────────────────────────

  async function acceptRide(driverId: string) {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideUpdateStatus(currentRide.value.id, 'ARRIVING', driverId)
      rideStatus.value = 'arriving'
      arrivedAtPickup.value = false
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
    stopLocationPolling()
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
    resumeSession,
  }
})
