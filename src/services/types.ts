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
  driver?: {
    id: string
    name: string
    phone: string
    vehicle?: { model: string; plateNumber: string } | null
  } | null
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
  tollEstimate: number   // 0 if no tolls on route
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
  rating: number
  comment?: string
  tags?: string[]
}

export type UserRideHistoryResponse = {
  items: RideDetails[]
}

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'APPROVED' | 'REJECTED'

export type AdminDriverApplicationUser = {
  id: string
  name: string
  phone: string
  email?: string | null
  role: 'PASSENGER' | 'DRIVER' | 'ADMIN'
  createdAt: string
}

export type AdminDriverDocument = {
  id: string
  type: string
  fileUrl: string
  status: string
  createdAt: string
}

export type AdminDriverAvailability = {
  id: string
  days: string
  hours: string
  preferredCity: string
}

export type AdminDriverApplication = {
  id: string
  userId: string
  status: ApplicationStatus
  fullName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  experienceYears?: number | null
  preferredArea?: string | null
  submittedAt?: string | null
  interviewAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  user: AdminDriverApplicationUser
  documents: AdminDriverDocument[]
  availability?: AdminDriverAvailability | null
}

export type AdminDriverApplicationsResponse = {
  items: AdminDriverApplication[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminRide = {
  id: string
  status: string
  riderId: string
  driverId?: string | null
  pickupAddress: string
  dropoffAddress: string
  fareAmount: number
  currency: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  rider?: { id: string; name: string; phone: string } | null
  driver?: { id: string; name: string; phone: string } | null
  events?: Array<{ id: string; type: string; createdAt: string }>
}

export type AdminRidesResponse = {
  items: AdminRide[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type FareConfig = {
  id: string
  baseFare: number
  perKmRate: number
  perMinuteRate: number
  minimumFare: number
  currency: string
  updatedAt: string
}

export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'CHARGING' | 'MAINTENANCE'

export type AdminVehicle = {
  id: string
  plateNumber: string
  model: string
  capacity: number
  color?: string | null
  status: VehicleStatus
  batteryCapacityKwh?: number | null
  batteryLevel?: number | null
  createdAt: string
  updatedAt: string
  driver?: {
    id: string
    name: string
    phone: string
    email?: string | null
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN'
  } | null
}

export type AdminVehiclesResponse = {
  items: AdminVehicle[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminVehicleHistoryAction = 'FLEET_CREATE_VEHICLE' | 'FLEET_ASSIGN_DRIVER' | 'FLEET_UPDATE_STATUS'

export type AdminVehicleHistoryItem = {
  id: string
  adminId: string
  action: AdminVehicleHistoryAction
  targetType: 'VEHICLE'
  targetId: string
  summary?: string | null
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  admin: {
    id: string
    name: string
    phone: string
    email?: string | null
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN'
  }
}

export type AdminVehicleHistoryResponse = {
  items: AdminVehicleHistoryItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminAvailableDriver = {
  id: string
  name: string
  phone: string
  email?: string | null
  role: 'DRIVER'
  createdAt: string
  driverLocation?: {
    isAvailable: boolean
    updatedAt: string
    lat: number
    lng: number
  } | null
  vehicle?: {
    id: string
    plateNumber: string
    status: VehicleStatus
  } | null
}

export type AdminAvailableDriversResponse = {
  items: AdminAvailableDriver[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminPaymentStatus = 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED'
export type AdminPaymentMethod = 'CASH' | 'EWALLET' | 'CARD'

export type AdminPayment = {
  id: string
  rideId: string
  method: AdminPaymentMethod
  amount: number
  status: AdminPaymentStatus
  reference?: string | null
  createdAt: string
  user?: {
    id: string
    name: string
    phone: string
    email?: string | null
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN'
  } | null
  ride?: {
    id: string
    status: string
    pickupAddress: string
    dropoffAddress: string
    rider?: { id: string; name: string; phone: string } | null
    driver?: { id: string; name: string; phone: string } | null
  } | null
}

export type AdminPaymentsResponse = {
  items: AdminPayment[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminSupportTicketStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'

export type AdminSupportTicket = {
  id: string
  userId: string
  category: string
  description: string
  status: AdminSupportTicketStatus
  createdAt: string
  user: {
    id: string
    name: string
    phone: string
    email?: string | null
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN'
  }
}

export type AdminSupportTicketsResponse = {
  items: AdminSupportTicket[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminAuditLog = {
  id: string
  adminId: string
  action: string
  targetType: string
  targetId?: string | null
  summary?: string | null
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  admin: {
    id: string
    name: string
    phone: string
    email?: string | null
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN'
  }
}

export type AdminAuditLogsResponse = {
  items: AdminAuditLog[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminAnalyticsOverview = {
  today: {
    rides: number
    completedRides: number
    cancelledRides: number
    revenue: number
  }
  activeDrivers: number
  rolling30d: {
    rides: number
    completedRides: number
    cancelledRides: number
    revenue: number
    completionRate: number
    cancellationRate: number
  }
}

export type AdminAnalyticsTrendItem = {
  day: string
  rides: number
  completedRides: number
  cancelledRides: number
  revenue: number
}

export type AdminAnalyticsTrendsResponse = {
  days: number
  items: AdminAnalyticsTrendItem[]
}

export type AdminSafetyIncidentStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'

export type AdminSafetyIncident = {
  id: string
  userId: string
  category: string
  description: string
  status: AdminSafetyIncidentStatus
  createdAt: string
  incidentMeta?: {
    rideId?: string | null
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
    reporterRole?: 'PASSENGER' | 'DRIVER' | null
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    assigneeId?: string | null
    acknowledgedAt?: string | null
    resolvedAt?: string | null
    noteText?: string
  }
  timeline?: Array<{
    id: string
    type: string
    createdAt: string
    metadata?: Record<string, unknown> | null
  }>
  sla?: {
    ackSeconds: number | null
    resolveSeconds: number | null
    overdue: boolean
    overdueThresholdMinutes: number
  }
  user: {
    id: string
    name: string
    phone: string
    email?: string | null
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN'
  }
}

export type AdminSafetyIncidentsResponse = {
  items: AdminSafetyIncident[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminSafetyTemplateKey = 'ESCALATION_ADMIN' | 'ESCALATION_REPORTER' | 'RESOLUTION_REPORTER'

export type AdminSafetyTemplate = {
  key: AdminSafetyTemplateKey
  subject: string
  body: string
}

export type AdminSafetyTemplatesResponse = {
  items: AdminSafetyTemplate[]
}

export type AdminSafetyDeliveryStatus = 'DELIVERED' | 'DEAD_LETTER'
export type AdminSafetyDeliveryChannel = 'sms' | 'email' | 'webhook'

export type AdminSafetyDeliveryLog = {
  id: string
  incidentId: string
  event: string
  channel: AdminSafetyDeliveryChannel
  target: string
  status: AdminSafetyDeliveryStatus
  attempts: number
  lastError?: string | null
  payload?: Record<string, unknown> | null
  deliveredAt?: string | null
  deadLetteredAt?: string | null
  createdAt: string
}

export type AdminSafetyDeliveryLogsResponse = {
  items: AdminSafetyDeliveryLog[]
  page: number
  limit: number
  total: number
  totalPages: number
}
