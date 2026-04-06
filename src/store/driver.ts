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

  async function acceptRide() {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideUpdateStatus(currentRide.value.id, 'ARRIVING')
      rideStatus.value = 'arriving'
    } finally {
      loading.value = false
    }
  }

  async function declineRide() {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideCancel(currentRide.value.id)
      currentRide.value = null
      rideStatus.value = 'idle'
    } finally {
      loading.value = false
    }
  }

  async function markArrived() {
    if (!currentRide.value) return
    loading.value = true
    try {
      // Stay on ARRIVING status — UI shows "Start Trip" button
      // No status change needed; just a UI state update
      rideStatus.value = 'arriving'
    } finally {
      loading.value = false
    }
  }

  async function startTrip() {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideUpdateStatus(currentRide.value.id, 'IN_PROGRESS')
      rideStatus.value = 'in_progress'
    } finally {
      loading.value = false
    }
  }

  async function completeTrip() {
    if (!currentRide.value) return
    loading.value = true
    try {
      await api.rideUpdateStatus(currentRide.value.id, 'COMPLETED')
      currentRide.value = null
      rideStatus.value = 'idle'
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
          }
        })
      } else if (data.status === 'CANCELLED') {
        currentRide.value = null
        rideStatus.value = 'idle'
      }
    })
  }

  function unsubscribeFromRideEvents() {
    const socket = getSocket()
    socket.off('ride:status')
    stopLocationPolling()
  }

  // ── Resume active ride on app open ────────────────────────────────────────

  async function resumeActiveRide(driverId: string) {
    const { ride } = await api.driverGetActiveRide(driverId)
    if (!ride) return

    currentRide.value = ride
    if (ride.status === 'ASSIGNED')    rideStatus.value = 'incoming'
    if (ride.status === 'ARRIVING')    rideStatus.value = 'arriving'
    if (ride.status === 'IN_PROGRESS') rideStatus.value = 'in_progress'
  }

  return {
    isOnline,
    loading,
    currentRide,
    rideStatus,
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
    resumeActiveRide,
  }
})
