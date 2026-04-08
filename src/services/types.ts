export type AuthOtpSendRequest = { phone: string }
export type AuthOtpVerifyRequest = { phone: string; code: string }
export type AuthOtpVerifyResponse = { ok: boolean; token: string }

export type RegisterRequest = { name: string; phone: string; email?: string; password?: string }
export type RegisterResponse = { ok: boolean; userId: string }

export type UserProfile = { id: string; name: string; role?: 'PASSENGER' | 'DRIVER' | 'ADMIN' }

export type RideDetails = {
  id: string
  status: string
  riderId: string
  driverId?: string | null
  rider?: { id: string; name: string; phone: string } | null
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropoffAddress: string
  dropoffLat: number
  dropoffLng: number
  fareAmount: number
  currency: string
  paymentMethod: string
  createdAt: string
  events?: Array<{ id: string; type: string; createdAt: string }>
}

export type FareEstimateRequest = {
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
}

export type FareEstimateResponse = {
  currency: string
  total: number
  distanceKm?: number
  durationMin?: number
  breakdown: {
    base: number
    distance: number
    time: number
  }
}

export type CreateBookingRequest = {
  riderId: string
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropoffAddress: string
  dropoffLat: number
  dropoffLng: number
  paymentMethod: 'CASH' | 'EWALLET' | 'CARD'
}

export type CreateBookingResponse = { ok: boolean; rideId: string; status: string }

export type PlacesAutocompleteResponse = {
  items: Array<{ placeId: string; description: string }>
}

export type PlaceDetailsResponse = {
  placeId: string
  address: string
  name?: string
  lat: number
  lng: number
}

export type ReverseGeocodeResponse = {
  address: string
  placeId?: string
  lat: number
  lng: number
}

export type RouteResponse = {
  polyline: string
  distanceMeters: number
  durationSeconds: number
}

export type DriverApplication = {
  id: string
  status: string
  fullName?: string
  phone?: string
  email?: string
  address?: string
  experienceYears?: number
  preferredArea?: string
  submittedAt?: string
  interviewAt?: string
}

export type DriverApplicationCreate = {
  userId: string
  fullName: string
  phone: string
  email?: string
  address: string
}

export type DriverApplicationUpdate = Partial<{
  fullName: string
  phone: string
  email: string
  address: string
  experienceYears: number
  preferredArea: string
}>

export type DriverDocumentCreate = {
  type: string
  fileUrl: string
}

export type DriverAvailabilityCreate = {
  days: string
  hours: string
  preferredCity: string
}

export type DriverSessionResponse = {
  isOnline: boolean
  location: { lat: number; lng: number; updatedAt: string } | null
  ride: RideDetails | null
}

export type DriverEarningsResponse = {
  period: 'today' | 'week' | 'month' | string
  totalEarnings: number
  totalTrips: number
  totalHours: number
  avgRating: number | null
  recentTrips: Array<{
    id: string
    from: string
    to: string
    date: string
    distanceKm: number | null
    fare: number
  }>
}

export type SubmitRideRatingRequest = {
  riderId: string
  rating: number
  comment?: string
  tags?: string[]
}
