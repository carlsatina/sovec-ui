import { createRouter, createWebHistory } from 'vue-router'

const SplashScreen = () => import('../pages/auth/SplashScreen.vue')
const WelcomeCarousel = () => import('../pages/auth/WelcomeCarousel.vue')
const LoginScreen = () => import('../pages/auth/LoginScreen.vue')
const OtpScreen = () => import('../pages/auth/OtpScreen.vue')
const RegisterScreen = () => import('../pages/auth/RegisterScreen.vue')
const ForgotPasswordScreen = () => import('../pages/auth/ForgotPasswordScreen.vue')
const PermissionsScreen = () => import('../pages/auth/PermissionsScreen.vue')

const HomeScreen = () => import('../pages/home/HomeScreen.vue')
const LocationSearch = () => import('../pages/booking/LocationSearch.vue')
const DestinationSearch = () => import('../pages/booking/DestinationSearch.vue')
const LocationConfirm = () => import('../pages/booking/LocationConfirm.vue')
const SavedPlaces = () => import('../pages/booking/SavedPlaces.vue')
const RideOptions = () => import('../pages/booking/RideOptions.vue')
const FareEstimate = () => import('../pages/booking/FareEstimate.vue')
const PromoSelection = () => import('../pages/booking/PromoSelection.vue')
const PaymentMethod = () => import('../pages/booking/PaymentMethod.vue')
const BookingConfirmation = () => import('../pages/booking/BookingConfirmation.vue')
const FindingDriver = () => import('../pages/booking/FindingDriver.vue')
const DriverAssigned = () => import('../pages/booking/DriverAssigned.vue')
const TripInProgress = () => import('../pages/booking/TripInProgress.vue')
const TripCompleted = () => import('../pages/booking/TripCompleted.vue')
const RateRide = () => import('../pages/booking/RateRide.vue')

const TripsList = () => import('../pages/trips/TripsList.vue')
const TripDetails = () => import('../pages/trips/TripDetails.vue')
const RewardsScreen = () => import('../pages/rewards/RewardsScreen.vue')
const NotificationsScreen = () => import('../pages/notifications/NotificationsScreen.vue')
const HelpCenter = () => import('../pages/account/HelpCenter.vue')
const AccountScreen = () => import('../pages/account/AccountScreen.vue')

// Driver app pages
const DriverHome = () => import('../pages/driver/DriverHome.vue')
const IncomingRide = () => import('../pages/driver/IncomingRide.vue')
const NavigateToPickup = () => import('../pages/driver/NavigateToPickup.vue')
const TripActive = () => import('../pages/driver/TripActive.vue')
const DriverEarnings = () => import('../pages/driver/DriverEarnings.vue')

const DriverLanding = () => import('../pages/driver-apply/DriverLanding.vue')
const DriverBenefits = () => import('../pages/driver-apply/DriverBenefits.vue')
const DriverRequirements = () => import('../pages/driver-apply/DriverRequirements.vue')
const DriverForm = () => import('../pages/driver-apply/DriverForm.vue')
const DriverDocuments = () => import('../pages/driver-apply/DriverDocuments.vue')
const DriverAvailability = () => import('../pages/driver-apply/DriverAvailability.vue')
const DriverReview = () => import('../pages/driver-apply/DriverReview.vue')
const DriverSubmitted = () => import('../pages/driver-apply/DriverSubmitted.vue')
const DriverStatus = () => import('../pages/driver-apply/DriverStatus.vue')
const DriverFaq = () => import('../pages/driver-apply/DriverFaq.vue')

const routes = [
  { path: '/', redirect: '/auth/splash' },
  { path: '/auth/splash', component: SplashScreen, meta: { showTabs: false } },
  { path: '/auth/welcome', component: WelcomeCarousel, meta: { showTabs: false } },
  { path: '/auth/login', component: LoginScreen, meta: { showTabs: false } },
  { path: '/auth/otp', component: OtpScreen, meta: { showTabs: false } },
  { path: '/auth/register', component: RegisterScreen, meta: { showTabs: false } },
  { path: '/auth/forgot', component: ForgotPasswordScreen, meta: { showTabs: false } },
  { path: '/auth/permissions', component: PermissionsScreen, meta: { showTabs: false } },

  { path: '/home', component: HomeScreen, meta: { showTabs: true, requiresAuth: true } },
  { path: '/booking/location', component: LocationSearch, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/destination', component: DestinationSearch, meta: { showTabs: false, requiresAuth: true } },
  {
    path: '/booking/confirm-location/:type',
    component: LocationConfirm,
    meta: { showTabs: false, requiresAuth: true }
  },
  { path: '/booking/saved-places', component: SavedPlaces, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/ride-options', component: RideOptions, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/fare', component: FareEstimate, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/promo', component: PromoSelection, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/payment', component: PaymentMethod, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/confirm', component: BookingConfirmation, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/finding', component: FindingDriver, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/driver-assigned', component: DriverAssigned, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/in-progress', component: TripInProgress, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/completed', component: TripCompleted, meta: { showTabs: false, requiresAuth: true } },
  { path: '/booking/rate', component: RateRide, meta: { showTabs: false, requiresAuth: true } },

  { path: '/trips', component: TripsList, meta: { showTabs: true, requiresAuth: true } },
  { path: '/trips/:id', component: TripDetails, meta: { showTabs: false, requiresAuth: true } },
  { path: '/rewards', component: RewardsScreen, meta: { showTabs: true, requiresAuth: true } },
  { path: '/notifications', component: NotificationsScreen, meta: { showTabs: true, requiresAuth: true } },
  { path: '/help', component: HelpCenter, meta: { showTabs: false, requiresAuth: true } },
  { path: '/account', component: AccountScreen, meta: { showTabs: true, requiresAuth: true } },

  // ── Driver app ──────────────────────────────────────────────────────────
  { path: '/driver/home',     component: DriverHome,        meta: { showTabs: false, requiresAuth: true, driverApp: true } },
  { path: '/driver/incoming', component: IncomingRide,      meta: { showTabs: false, requiresAuth: true, driverApp: true } },
  { path: '/driver/pickup',   component: NavigateToPickup,  meta: { showTabs: false, requiresAuth: true, driverApp: true } },
  { path: '/driver/trip',     component: TripActive,        meta: { showTabs: false, requiresAuth: true, driverApp: true } },
  { path: '/driver/earnings', component: DriverEarnings,    meta: { showTabs: false, requiresAuth: true, driverApp: true } },

  // ── Driver application flow ─────────────────────────────────────────────
  { path: '/driver/apply', component: DriverLanding, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/benefits', component: DriverBenefits, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/requirements', component: DriverRequirements, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/form', component: DriverForm, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/documents', component: DriverDocuments, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/availability', component: DriverAvailability, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/review', component: DriverReview, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/submitted', component: DriverSubmitted, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/status', component: DriverStatus, meta: { showTabs: false, requiresAuth: true } },
  { path: '/driver/faq', component: DriverFaq, meta: { showTabs: false, requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const token = localStorage.getItem('auth_token')
  if (!token) return { path: '/auth/login', query: { redirect: to.fullPath } }

  const devRole = localStorage.getItem('solvec_dev_role') ?? 'PASSENGER'
  const isDriver = devRole === 'DRIVER'

  // Drivers trying to access passenger-only pages → redirect to driver home
  if (!to.meta.driverApp && to.path !== '/account' && to.path !== '/help' && isDriver) {
    return { path: '/driver/home' }
  }

  // Passengers trying to access driver-only pages → redirect to home
  if (to.meta.driverApp && !isDriver) {
    return { path: '/home' }
  }

  return true
})

export default router
