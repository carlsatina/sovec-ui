import { request } from './http'
import type {
  AuthOtpSendRequest,
  AuthOtpVerifyRequest,
  AuthOtpVerifyResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  FareEstimateRequest,
  FareEstimateResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  PlacesAutocompleteResponse,
  PlaceDetailsResponse,
  ReverseGeocodeResponse,
  RouteResponse,
  DriverApplication,
  DriverApplicationCreate,
  DriverApplicationUpdate,
  DriverDocumentCreate,
  DriverAvailabilityCreate,
  RideDetails,
  DriverSessionResponse,
  DriverEarningsResponse,
  SubmitRideRatingRequest,
  UserRideHistoryResponse,
  AdminDriverApplicationsResponse,
  ApplicationStatus,
  AdminRidesResponse,
  FareConfig
} from './types'

export const api = {
  sendOtp: (payload: AuthOtpSendRequest) => request<{ ok: boolean; message: string }>('/auth/otp/send', { method: 'POST', body: payload }),
  verifyOtp: (payload: AuthOtpVerifyRequest) => request<AuthOtpVerifyResponse>('/auth/otp/verify', { method: 'POST', body: payload }),
  register: (payload: RegisterRequest) => request<RegisterResponse>('/auth/register', { method: 'POST', body: payload }),
  me: () => request<UserProfile>('/users/me'),
  meRides: (limit = 20) => request<UserRideHistoryResponse>(`/users/me/rides?limit=${encodeURIComponent(String(limit))}`),
  meWithToken: (token: string) => request<UserProfile>('/users/me', { headers: { Authorization: `Bearer ${token}` } }),
  estimateFare: (payload: FareEstimateRequest) => request<FareEstimateResponse>('/bookings/estimate', { method: 'POST', body: payload }),
  createBooking: (payload: CreateBookingRequest) => request<CreateBookingResponse>('/bookings', { method: 'POST', body: payload }),
  cancelBooking: (rideId: string) => request<{ ok: boolean }>(`/bookings/${rideId}/cancel`, { method: 'POST' }),
  placesAutocomplete: (input: string) => request<PlacesAutocompleteResponse>(`/geo/autocomplete?input=${encodeURIComponent(input)}`),
  placeDetails: (placeId: string) => request<PlaceDetailsResponse>(`/geo/details?placeId=${encodeURIComponent(placeId)}`),
  reverseGeocode: (lat: number, lng: number) =>
    request<ReverseGeocodeResponse>(`/geo/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`),
  route: (originLat: number, originLng: number, destinationLat: number, destinationLng: number) =>
    request<RouteResponse>(
      `/geo/route?originLat=${encodeURIComponent(String(originLat))}&originLng=${encodeURIComponent(String(originLng))}&destinationLat=${encodeURIComponent(String(destinationLat))}&destinationLng=${encodeURIComponent(String(destinationLng))}`
    ),
  createDriverApplication: (payload: DriverApplicationCreate) =>
    request<{ ok: boolean; application: DriverApplication }>('/driver-applications', { method: 'POST', body: payload }),
  updateDriverApplication: (id: string, payload: DriverApplicationUpdate) =>
    request<{ ok: boolean; application: DriverApplication }>(`/driver-applications/${id}`, { method: 'PUT', body: payload }),
  submitDriverApplication: (id: string) =>
    request<{ ok: boolean; application: DriverApplication }>(`/driver-applications/${id}/submit`, { method: 'POST' }),
  uploadDriverDocument: (id: string, payload: DriverDocumentCreate) =>
    request<{ ok: boolean }>(`/driver-applications/${id}/documents`, { method: 'POST', body: payload }),
  setDriverAvailability: (id: string, payload: DriverAvailabilityCreate) =>
    request<{ ok: boolean }>(`/driver-applications/${id}/availability`, { method: 'POST', body: payload }),
  getDriverApplication: (id: string) => request<DriverApplication>(`/driver-applications/${id}`),

  // Driver operations
  driverGoOnline: (driverId: string, lat: number, lng: number) =>
    request<{ ok: boolean }>('/drivers/location', { method: 'POST', body: { driverId, lat, lng, isAvailable: true } }),
  driverGoOffline: (driverId: string) =>
    request<{ ok: boolean }>(`/drivers/${driverId}/availability`, { method: 'POST', body: { isAvailable: false } }),
  driverUpdateLocation: (driverId: string, lat: number, lng: number) =>
    request<{ ok: boolean }>('/drivers/location', { method: 'POST', body: { driverId, lat, lng } }),
  driverGetSession: (driverId: string) =>
    request<DriverSessionResponse>(`/drivers/${driverId}/session`),
  driverGetEarnings: (driverId: string, period: 'today' | 'week' | 'month') =>
    request<DriverEarningsResponse>(`/drivers/${driverId}/earnings?period=${encodeURIComponent(period)}`),
  driverGetActiveRide: (driverId: string) =>
    request<{ ride: RideDetails | null }>(`/rides/driver/${driverId}/active`),
  rideUpdateStatus: (rideId: string, status: string, driverId?: string) =>
    request<{ id: string; status: string }>(`/rides/${rideId}/status`, { method: 'POST', body: { status, driverId } }),
  rideDecline: (rideId: string, driverId: string) =>
    request<{ ok: boolean }>(`/rides/${rideId}/decline`, { method: 'POST', body: { driverId } }),
  submitRideRating: (rideId: string, payload: SubmitRideRatingRequest) =>
    request<{ ok: boolean; id: string }>(`/rides/${rideId}/rate`, { method: 'POST', body: payload }),
  rideAddEvent: (rideId: string, type: string, metadata?: Record<string, unknown>) =>
    request<{ id: string; event: string }>(`/rides/${rideId}/events`, { method: 'POST', body: { type, metadata } }),
  rideCancel: (rideId: string) =>
    request<{ ok: boolean }>(`/bookings/${rideId}/cancel`, { method: 'POST' }),

  // Admin operations
  adminGetDriverApplications: (params: { status?: string; q?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.q) query.set('q', params.q)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminDriverApplicationsResponse>(`/admin/driver-applications?${query.toString()}`)
  },
  adminUpdateDriverApplicationStatus: (id: string, status: ApplicationStatus, reason?: string) =>
    request<{ ok: boolean; application: unknown }>(`/admin/driver-applications/${id}/status`, { method: 'POST', body: { status, reason } }),
  adminScheduleDriverInterview: (id: string, interviewAt: string) =>
    request<{ ok: boolean; application: unknown }>(`/admin/driver-applications/${id}/interview`, { method: 'POST', body: { interviewAt } }),
  adminGetRides: (params: { status?: string; q?: string; page?: number; limit?: number; activeOnly?: boolean } = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.q) query.set('q', params.q)
    query.set('activeOnly', String(params.activeOnly ?? true))
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminRidesResponse>(`/admin/rides?${query.toString()}`)
  },
  adminForceCancelRide: (id: string, reason?: string) =>
    request<{ ok: boolean; id: string; status: string }>(`/admin/rides/${id}/force-cancel`, { method: 'POST', body: { reason } }),
  adminReassignRide: (id: string, payload: { reason?: string; preferredDriverId?: string }) =>
    request<{ ok: boolean; id: string; status: string; driverId?: string | null }>(`/admin/rides/${id}/reassign`, { method: 'POST', body: payload }),
  adminGetPricing: () => request<{ config: FareConfig }>('/admin/pricing'),
  adminUpdatePricing: (payload: Pick<FareConfig, 'baseFare' | 'perKmRate' | 'perMinuteRate' | 'minimumFare' | 'currency'>) =>
    request<{ ok: boolean; config: FareConfig }>('/admin/pricing', { method: 'PUT', body: payload })
}
