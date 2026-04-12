import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
import { getSocket } from '../services/socket'
import { useAuthStore } from './auth'

export type RideType = 'ECO' | 'COMFORT' | 'XL'
export type PaymentMethod = 'CASH' | 'EWALLET' | 'CARD'

type LocationPoint = {
  address: string
  lat: number
  lng: number
}

type RideStatusPayload = { rideId: string; status: string }
type AssignedDriver = {
  id: string
  name: string
  phone: string
  vehicle?: { model: string; plateNumber: string } | null
}

export const useBookingStore = defineStore('booking', () => {
  const pickup = ref<LocationPoint | null>(null)
  const dropoff = ref<LocationPoint | null>(null)
  const rideType = ref<RideType>('ECO')
  const paymentMethod = ref<PaymentMethod>('CASH')
  const fareEstimate = ref<{ total: number; currency: string; distanceKm?: number; durationMin?: number } | null>(null)
  const rideId = ref<string | null>(null)
  const rideStatus = ref<string | null>(null)
  const assignedDriver = ref<AssignedDriver | null>(null)
  const driverLocation = ref<{ lat: number; lng: number } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Keep references to active socket handlers so we can remove only them
  let rideStatusHandler: ((payload: RideStatusPayload) => void) | null = null
  let driverLocationHandler: ((payload: { lat: number; lng: number }) => void) | null = null
  let rideStatusPoller: ReturnType<typeof setInterval> | null = null
  let socketReconnectHandler: (() => void) | null = null

  // True while both handlers are registered — lets pages avoid redundant resubscription
  const hasActiveSubscription = ref(false)

  function setPickup(data: LocationPoint) {
    pickup.value = data
  }

  function setDropoff(data: LocationPoint) {
    dropoff.value = data
  }

  function setRideType(type: RideType) {
    rideType.value = type
  }

  function setPaymentMethod(method: PaymentMethod) {
    paymentMethod.value = method
  }

  async function estimateFare() {
    if (!pickup.value || !dropoff.value) return
    loading.value = true
    try {
      const res = await api.estimateFare({
        pickupLat: pickup.value.lat,
        pickupLng: pickup.value.lng,
        dropoffLat: dropoff.value.lat,
        dropoffLng: dropoff.value.lng
      })
      fareEstimate.value = { total: res.total, currency: res.currency, distanceKm: res.distanceKm, durationMin: res.durationMin }
    } finally {
      loading.value = false
    }
  }

  async function createBooking() {
    if (!pickup.value || !dropoff.value) return
    const auth = useAuthStore()
    if (!auth.user) throw new Error('Not authenticated')

    loading.value = true
    error.value = null
    try {
      const res = await api.createBooking({
        riderId: auth.user.id,
        pickupAddress: pickup.value.address,
        pickupLat: pickup.value.lat,
        pickupLng: pickup.value.lng,
        dropoffAddress: dropoff.value.address,
        dropoffLat: dropoff.value.lat,
        dropoffLng: dropoff.value.lng,
        paymentMethod: paymentMethod.value
      })
      rideId.value = res.rideId
      rideStatus.value = res.status
      subscribeToRideUpdates(res.rideId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Booking failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelBooking() {
    if (!rideId.value) return
    loading.value = true
    error.value = null
    try {
      await api.cancelBooking(rideId.value)
      rideStatus.value = 'CANCELLED'
      assignedDriver.value = null
      driverLocation.value = null
      unsubscribeFromRideUpdates()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Cancel failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function stopRideStatusPolling() {
    if (rideStatusPoller != null) {
      clearInterval(rideStatusPoller)
      rideStatusPoller = null
    }
  }

  function startRideStatusPolling(id: string) {
    stopRideStatusPolling()
    rideStatusPoller = setInterval(() => {
      void refreshRideDetails(id)
    }, 5000)
  }

  async function refreshRideDetails(id: string) {
    try {
      const ride = await api.getRide(id)
      if (rideId.value !== id) return
      rideStatus.value = ride.status
      assignedDriver.value = ride.driver
        ? {
            id: ride.driver.id,
            name: ride.driver.name,
            phone: ride.driver.phone,
            vehicle: ride.driver.vehicle ?? null
          }
        : null
      if (ride.status === 'CANCELLED' || ride.status === 'COMPLETED') {
        stopRideStatusPolling()
      }
    } catch {
      // Keep existing UI state if the refresh fails.
    }
  }

  function subscribeToRideUpdates(id: string) {
    const socket = getSocket()
    const auth = useAuthStore()
    socket.emit('join', { userId: auth.user?.id, rideId: id })

    // Remove any previously registered handlers before adding new ones
    unsubscribeFromRideUpdates()

    // Re-join the ride room whenever the socket reconnects (mobile network drops).
    // Without this, the socket reconnects silently and the passenger stops receiving
    // driver:location events because they're no longer in the ride room.
    socketReconnectHandler = () => {
      socket.emit('join', { userId: auth.user?.id, rideId: id })
    }
    socket.on('connect', socketReconnectHandler)

    rideStatusHandler = (payload: RideStatusPayload) => {
      if (payload.rideId !== id) return
      rideStatus.value = payload.status
      if (payload.status === 'ASSIGNED' || payload.status === 'ARRIVING' || payload.status === 'IN_PROGRESS') {
        void refreshRideDetails(id)
      }
      if (payload.status === 'CANCELLED' || payload.status === 'COMPLETED') {
        assignedDriver.value = null
        stopRideStatusPolling()
      }
    }
    socket.on('ride:status', rideStatusHandler)

    driverLocationHandler = (payload: { lat: number; lng: number }) => {
      console.log(`[Socket] driver:location received — lat:${payload.lat.toFixed(6)} lng:${payload.lng.toFixed(6)}`)
      driverLocation.value = { lat: payload.lat, lng: payload.lng }
    }
    socket.on('driver:location', driverLocationHandler)
    hasActiveSubscription.value = true
    startRideStatusPolling(id)
    void refreshRideDetails(id)
  }

  function unsubscribeFromRideUpdates() {
    const socket = getSocket()
    if (rideStatusHandler) {
      socket.off('ride:status', rideStatusHandler)
      rideStatusHandler = null
    }
    if (driverLocationHandler) {
      socket.off('driver:location', driverLocationHandler)
      driverLocationHandler = null
    }
    if (socketReconnectHandler) {
      socket.off('connect', socketReconnectHandler)
      socketReconnectHandler = null
    }
    stopRideStatusPolling()
    hasActiveSubscription.value = false
  }

  function resetBooking() {
    unsubscribeFromRideUpdates()
    pickup.value = null
    dropoff.value = null
    rideType.value = 'ECO'
    paymentMethod.value = 'CASH'
    fareEstimate.value = null
    rideId.value = null
    rideStatus.value = null
    assignedDriver.value = null
    driverLocation.value = null
    loading.value = false
    error.value = null
  }

  return {
    pickup,
    dropoff,
    rideType,
    paymentMethod,
    fareEstimate,
    rideId,
    rideStatus,
    assignedDriver,
    driverLocation,
    hasActiveSubscription,
    loading,
    error,
    setPickup,
    setDropoff,
    setRideType,
    setPaymentMethod,
    estimateFare,
    createBooking,
    cancelBooking,
    resetBooking,
    refreshRideDetails,
    resubscribeToRideUpdates: subscribeToRideUpdates,
    unsubscribeFromRideUpdates
  }
})
