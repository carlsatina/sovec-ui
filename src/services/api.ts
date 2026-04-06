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
  RideDetails
} from './types'

export const api = {
  sendOtp: (payload: AuthOtpSendRequest) => request<{ ok: boolean; message: string }>('/auth/otp/send', { method: 'POST', body: payload }),
  verifyOtp: (payload: AuthOtpVerifyRequest) => request<AuthOtpVerifyResponse>('/auth/otp/verify', { method: 'POST', body: payload }),
  register: (payload: RegisterRequest) => request<RegisterResponse>('/auth/register', { method: 'POST', body: payload }),
  me: () => request<UserProfile>('/users/me'),
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
  driverGetActiveRide: (driverId: string) =>
    request<{ ride: RideDetails | null }>(`/rides/driver/${driverId}/active`),
  rideUpdateStatus: (rideId: string, status: string) =>
    request<{ id: string; status: string }>(`/rides/${rideId}/status`, { method: 'POST', body: { status } }),
  rideCancel: (rideId: string) =>
    request<{ ok: boolean }>(`/bookings/${rideId}/cancel`, { method: 'POST' })
}
