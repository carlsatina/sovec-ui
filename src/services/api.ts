import { request, requestText } from './http'
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
  FareConfig,
  AdminVehiclesResponse,
  AdminVehicleHistoryAction,
  AdminVehicleHistoryResponse,
  VehicleStatus,
  AdminAvailableDriversResponse,
  AdminPaymentsResponse,
  AdminPaymentMethod,
  AdminPaymentStatus,
  AdminSupportTicketStatus,
  AdminSupportTicketsResponse,
  AdminAuditLogsResponse,
  AdminAuditDeadLettersResponse,
  AdminAnalyticsOverview,
  AdminAnalyticsTrendsResponse,
  AdminSafetyIncidentStatus,
  AdminSafetyIncidentsResponse,
  AdminSafetyMetricsResponse,
  AdminSafetyTemplateKey,
  AdminSafetyTemplatesResponse,
  AdminSafetyDeliveryLogsResponse,
  AdminSafetyDeliveryStatus,
  AdminSafetyDeliveryChannel
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
  route: (originLat: number, originLng: number, destinationLat: number, destinationLng: number, optimal = false) =>
    request<RouteResponse>(
      `/geo/route?originLat=${encodeURIComponent(String(originLat))}&originLng=${encodeURIComponent(String(originLng))}&destinationLat=${encodeURIComponent(String(destinationLat))}&destinationLng=${encodeURIComponent(String(destinationLng))}${optimal ? '&optimal=true' : ''}`
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
  getRide: (rideId: string) =>
    request<RideDetails>(`/rides/${rideId}`),
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
    request<{ ok: boolean; config: FareConfig }>('/admin/pricing', { method: 'PUT', body: payload }),
  adminGetVehicles: (params: { status?: string; q?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.q) query.set('q', params.q)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminVehiclesResponse>(`/admin/vehicles?${query.toString()}`)
  },
  adminGetVehicleHistory: (vehicleId: string, params: { action?: AdminVehicleHistoryAction; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.action) query.set('action', params.action)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminVehicleHistoryResponse>(`/admin/vehicles/${encodeURIComponent(vehicleId)}/history?${query.toString()}`)
  },
  adminGetAvailableDrivers: (params: {
    q?: string
    availableOnly?: boolean
    unassignedOnly?: boolean
    page?: number
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    query.set('availableOnly', String(params.availableOnly ?? true))
    query.set('unassignedOnly', String(params.unassignedOnly ?? true))
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminAvailableDriversResponse>(`/admin/drivers/available?${query.toString()}`)
  },
  adminCreateVehicle: (payload: {
    plateNumber: string
    model: string
    capacity: number
    color?: string
    status?: VehicleStatus
    batteryCapacityKwh?: number
    batteryLevel?: number
    driverId?: string
  }) => request<{ ok: boolean; vehicle: unknown }>('/admin/vehicles', { method: 'POST', body: payload }),
  adminAssignVehicleDriver: (
    vehicleId: string,
    driverId?: string | null,
    options: { force?: boolean; reason?: string } = {}
  ) =>
    request<{ ok: boolean; vehicle: unknown }>(`/admin/vehicles/${vehicleId}/assign-driver`, {
      method: 'POST',
      body: {
        driverId: driverId ?? null,
        ...(options.force ? { force: true } : {}),
        ...(options.reason ? { reason: options.reason } : {})
      }
    }),
  adminUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus, batteryLevel?: number) =>
    request<{ ok: boolean; vehicle: unknown }>(`/admin/vehicles/${vehicleId}/status`, {
      method: 'POST',
      body: typeof batteryLevel === 'number' ? { status, batteryLevel } : { status }
    }),
  adminGetPayments: (params: {
    status?: AdminPaymentStatus
    method?: AdminPaymentMethod
    q?: string
    page?: number
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.method) query.set('method', params.method)
    if (params.q) query.set('q', params.q)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminPaymentsResponse>(`/admin/payments?${query.toString()}`)
  },
  adminVerifyPayment: (paymentId: string, note?: string) =>
    request<{ ok: boolean; payment: unknown }>(`/admin/payments/${paymentId}/verify`, { method: 'POST', body: { note } }),
  adminFailPayment: (paymentId: string, reason?: string) =>
    request<{ ok: boolean; payment: unknown }>(`/admin/payments/${paymentId}/fail`, { method: 'POST', body: { reason } }),
  adminRefundPayment: (paymentId: string, payload: { reason: string; amount?: number }) =>
    request<{ ok: boolean; payment: unknown }>(`/admin/payments/${paymentId}/refund`, { method: 'POST', body: payload }),
  adminGetSupportTickets: (params: {
    status?: AdminSupportTicketStatus
    category?: string
    q?: string
    page?: number
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.category) query.set('category', params.category)
    if (params.q) query.set('q', params.q)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminSupportTicketsResponse>(`/admin/support/tickets?${query.toString()}`)
  },
  adminUpdateSupportTicketStatus: (ticketId: string, status: AdminSupportTicketStatus, note?: string) =>
    request<{ ok: boolean; ticket: unknown }>(`/admin/support/tickets/${ticketId}/status`, { method: 'POST', body: { status, note } }),
  adminGetAuditLogs: (params: {
    actorId?: string
    action?: string
    targetType?: string
    q?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.actorId) query.set('actorId', params.actorId)
    if (params.action) query.set('action', params.action)
    if (params.targetType) query.set('targetType', params.targetType)
    if (params.q) query.set('q', params.q)
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminAuditLogsResponse>(`/admin/audit-logs?${query.toString()}`)
  },
  adminGetAuditDeadLetters: (params: {
    q?: string
    action?: string
    targetType?: string
    page?: number
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.action) query.set('action', params.action)
    if (params.targetType) query.set('targetType', params.targetType)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminAuditDeadLettersResponse>(`/admin/audit-logs/dead-letters?${query.toString()}`)
  },
  adminReplayAuditDeadLetter: (id: string) =>
    request<{ ok: boolean; replayed: boolean; reason?: string }>(`/admin/audit-logs/dead-letters/${encodeURIComponent(id)}/replay`, { method: 'POST' }),
  adminExportAuditLogsCsv: async (params: {
    actorId?: string
    action?: string
    targetType?: string
    q?: string
    from?: string
    to?: string
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.actorId) query.set('actorId', params.actorId)
    if (params.action) query.set('action', params.action)
    if (params.targetType) query.set('targetType', params.targetType)
    if (params.q) query.set('q', params.q)
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    query.set('limit', String(params.limit ?? 5000))

    const csv = await requestText(`/admin/audit-logs/export.csv?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'text/csv' }
    })
    return new Blob([csv], { type: 'text/csv;charset=utf-8' })
  },
  adminGetAnalyticsOverview: () =>
    request<AdminAnalyticsOverview>('/admin/analytics/overview'),
  adminGetAnalyticsTrends: (days = 7) =>
    request<AdminAnalyticsTrendsResponse>(`/admin/analytics/trends?days=${encodeURIComponent(String(days))}`),
  adminGetSafetyIncidents: (params: {
    status?: AdminSafetyIncidentStatus
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    assigneeId?: string
    overdue?: boolean
    q?: string
    activeOnly?: boolean
    page?: number
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.priority) query.set('priority', params.priority)
    if (params.assigneeId) query.set('assigneeId', params.assigneeId)
    if (typeof params.overdue === 'boolean') query.set('overdue', String(params.overdue))
    if (params.q) query.set('q', params.q)
    query.set('activeOnly', String(params.activeOnly ?? true))
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminSafetyIncidentsResponse>(`/admin/safety/incidents?${query.toString()}`)
  },
  adminGetSafetyMetrics: (days = 7) =>
    request<AdminSafetyMetricsResponse>(`/admin/safety/metrics?days=${encodeURIComponent(String(days))}`),
  adminAcknowledgeSafetyIncident: (incidentId: string, note?: string) =>
    request<{ ok: boolean; incident: unknown }>(`/admin/safety/incidents/${incidentId}/acknowledge`, { method: 'POST', body: { note } }),
  adminAssignSafetyIncident: (incidentId: string, payload: { assigneeId?: string; note?: string } = {}) =>
    request<{ ok: boolean; incident: unknown; assigneeId: string }>(`/admin/safety/incidents/${incidentId}/assign`, { method: 'POST', body: payload }),
  adminEscalateSafetyIncident: (incidentId: string, payload: { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; reason: string }) =>
    request<{ ok: boolean; incident: unknown; priority: string; delivery?: { deadLetters?: number } }>(`/admin/safety/incidents/${incidentId}/escalate`, { method: 'POST', body: payload }),
  adminResolveSafetyIncident: (incidentId: string, payload: { status?: 'RESOLVED' | 'CLOSED'; action: string; note?: string }) =>
    request<{ ok: boolean; incident: unknown; resolution: unknown; delivery?: { deadLetters?: number } }>(`/admin/safety/incidents/${incidentId}/resolve`, { method: 'POST', body: payload }),
  adminGetSafetyTemplates: () =>
    request<AdminSafetyTemplatesResponse>('/admin/safety/templates'),
  adminUpdateSafetyTemplate: (key: AdminSafetyTemplateKey, payload: { subject?: string; body?: string }) =>
    request<{ ok: boolean; template: { key: AdminSafetyTemplateKey; subject: string; body: string } }>(`/admin/safety/templates/${key}`, { method: 'PUT', body: payload }),
  adminGetSafetyDeliveryLogs: (params: {
    incidentId?: string
    status?: AdminSafetyDeliveryStatus
    channel?: AdminSafetyDeliveryChannel
    q?: string
    page?: number
    limit?: number
  } = {}) => {
    const query = new URLSearchParams()
    if (params.incidentId) query.set('incidentId', params.incidentId)
    if (params.status) query.set('status', params.status)
    if (params.channel) query.set('channel', params.channel)
    if (params.q) query.set('q', params.q)
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    return request<AdminSafetyDeliveryLogsResponse>(`/admin/safety/delivery-logs?${query.toString()}`)
  },
  adminRetrySafetyDeliveryLog: (logId: string) =>
    request<{ ok: boolean; retry: { ok: boolean; channel: string; target: string; attempts: number; error?: string } }>(`/admin/safety/delivery-logs/${logId}/retry`, { method: 'POST' })
}
