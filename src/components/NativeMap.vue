<template>
  <div v-if="!isNative" ref="webMapRef" class="native-map"></div>
  <capacitor-google-map v-else ref="mapRef" class="native-map"></capacitor-google-map>
</template>

<script setup lang="ts">
import type { Marker, Polyline } from '@capacitor/google-maps'
import { GoogleMap, LatLngBounds } from '@capacitor/google-maps'
import { Capacitor } from '@capacitor/core'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

const emit = defineEmits<{
  cameraIdle: [coords: { lat: number; lng: number }]
  markerDragEnd: [coords: { lat: number; lng: number }]
}>()

const props = withDefaults(
  defineProps<{
    mapId?: string
    center: { lat: number; lng: number }
    zoom?: number
    markers?: Array<{
      lat: number
      lng: number
      title?: string
      draggable?: boolean
      iconUrl?: string
      iconSize?: { width: number; height: number }
      bearing?: number   // degrees 0-360; native uses Marker.rotation, web uses rotated SymbolPath
    }>
    path?: Array<{ lat: number; lng: number }>
    interactive?: boolean
    followDriver?: boolean  // lock camera to center, skipping fitBounds
    mapBearing?: number     // map heading in degrees (0 = north up); used in navigation mode
    tilt?: number           // camera tilt in degrees 0-67.5; used in navigation mode
    paddingBottom?: number  // pixels of overlay (e.g. bottom sheet) to exclude from fitBounds
  }>(),
  {
    mapId: 'solvec-map',
    zoom: 14,
    markers: () => [],
    path: () => [],
    interactive: true,
    followDriver: false,
    mapBearing: 0,
    tilt: 0,
    paddingBottom: 0
  }
)

const isNative = computed(() => Capacitor.isNativePlatform())

// Suppress cameraIdle events during programmatic follow-mode animations to prevent
// the auto-unfollow check from firing on our own camera moves (e.g. when the map
// animates from the initial fallback position to the driver's actual GPS location).
let suppressIdleUntil = 0
const FOLLOW_ANIM_MS = 400  // animationDuration(300) + small buffer

function suppressIdle() {
  suppressIdleUntil = Date.now() + FOLLOW_ANIM_MS
}

// --- Native (Capacitor) ---
const mapRef = shallowRef<HTMLElement>()
const map = shallowRef<GoogleMap>()
const markerIds = shallowRef<string[]>([])
const polylineIds = shallowRef<string[]>([])
// Prevent concurrent syncOverlays calls from piling up during rapid GPS updates
let isSyncing = false

async function createMap() {
  if (!isNative.value) return
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!mapRef.value) return

  // Native map renders behind the WebView — html/body must be transparent
  // so the map shows through. Restored in onBeforeUnmount.
  document.documentElement.style.backgroundColor = 'transparent'
  document.body.style.backgroundColor = 'transparent'

  try {
    map.value = await GoogleMap.create({
      id: props.mapId,
      element: mapRef.value,
      apiKey: apiKey ?? '',
      config: {
        center: props.center,
        zoom: props.zoom
      }
    })
    if (!props.interactive) {
      await map.value.disableTouch()
    }
    await map.value.setOnCameraIdleListener((data) => {
      if (Date.now() < suppressIdleUntil) return
      emit('cameraIdle', { lat: data.latitude, lng: data.longitude })
    })
    await map.value.setOnMarkerDragEndListener((data) => {
      emit('markerDragEnd', { lat: data.latitude, lng: data.longitude })
    })
    await syncOverlays()
    await moveCameraToData()
  } catch {
    // Map creation failed — component renders nothing, underlying error surfaced by Capacitor
  }
}

async function syncOverlays() {
  if (!map.value) return
  // Skip if the previous sync is still in progress — prevents bridge call pile-up
  // during rapid GPS updates. The camera watch still updates position independently.
  if (isSyncing) return
  isSyncing = true
  try {
    if (markerIds.value.length) {
      await map.value.removeMarkers(markerIds.value)
      markerIds.value = []
    }

    if (polylineIds.value.length) {
      await map.value.removePolylines(polylineIds.value)
      polylineIds.value = []
    }

    if (props.markers.length) {
      const markers: Marker[] = props.markers.map((item) => ({
        coordinate: { lat: item.lat, lng: item.lng },
        title: item.title,
        draggable: item.draggable ?? false,
        iconUrl: item.iconUrl,
        iconSize: item.iconSize,
        rotation: item.bearing ?? 0
      }))
      markerIds.value = await map.value.addMarkers(markers)
    }

    if (props.path.length > 1) {
      const polylines: Polyline[] = [
        {
          path: props.path,
          strokeColor: '#21c7c7',
          strokeOpacity: 1,
          strokeWeight: 6
        }
      ]
      polylineIds.value = await map.value.addPolylines(polylines)
    }
  } finally {
    isSyncing = false
  }
}

async function moveCameraToData() {
  if (!map.value) return

  // Navigation mode: track driver position with heading and tilt
  if (props.followDriver) {
    suppressIdle()
    await map.value.setCamera({
      coordinate: props.center,
      zoom: props.zoom,
      bearing: props.mapBearing,
      angle: props.tilt,
      animate: true,
      animationDuration: 300
    })
    return
  }

  const points = [...props.markers.map((m) => ({ lat: m.lat, lng: m.lng })), ...props.path]
  if (points.length < 2) {
    await map.value.setCamera({
      coordinate: props.center,
      zoom: props.zoom
    })
    return
  }

  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  // Extend the north bound to mirror the bottom-sheet offset so that fitBounds
  // centres the visible content above the overlay rather than behind it.
  // We do this by adding an equal amount of latitude to the north as the sheet
  // covers as a fraction of the total lat span (approximation, sufficient for
  // the small distances involved in a ride pickup/dropoff view).
  const latSpan = maxLat - minLat
  const lngSpan = maxLng - minLng
  // Use a conservative 500 px as the assumed map height when we have no pixel info.
  const sheetFraction = props.paddingBottom > 0 ? props.paddingBottom / 500 : 0
  const adjustedMaxLat = maxLat + latSpan * sheetFraction
  const adjustedMaxLng = maxLng + lngSpan * sheetFraction

  const bounds = new LatLngBounds({
    southwest: { lat: minLat, lng: minLng },
    center: { lat: (minLat + adjustedMaxLat) / 2, lng: (minLng + adjustedMaxLng) / 2 },
    northeast: { lat: adjustedMaxLat, lng: adjustedMaxLng }
  })

  await map.value.fitBounds(bounds, 90)
}

// --- Web (Google Maps JS API) ---
const webMapRef = shallowRef<HTMLElement>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webMap = shallowRef<any>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webMarkers = shallowRef<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webPolyline = shallowRef<any>()

let mapsApiPromise: Promise<void> | null = null

function loadMapsApi(): Promise<void> {
  if (mapsApiPromise) return mapsApiPromise
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google?.maps) {
    mapsApiPromise = Promise.resolve()
    return mapsApiPromise
  }
  mapsApiPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps API'))
    document.head.appendChild(script)
  })
  return mapsApiPromise
}

async function createWebMap() {
  if (isNative.value) return
  if (!webMapRef.value) return

  try {
    await loadMapsApi()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google.maps
    webMap.value = new g.Map(webMapRef.value, {
      center: props.center,
      zoom: props.zoom,
      gestureHandling: props.interactive ? 'auto' : 'none',
      disableDefaultUI: !props.interactive
    })
    syncWebOverlays()
    webMap.value.addListener('idle', () => {
      if (Date.now() < suppressIdleUntil) return
      const center = webMap.value.getCenter()
      if (center) emit('cameraIdle', { lat: center.lat(), lng: center.lng() })
    })
  } catch {
    // Web map creation failed — likely API key issue or network error
  }
}

function syncWebOverlays() {
  if (!webMap.value) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (window as any).google.maps

  webMarkers.value.forEach((m) => m.setMap(null))
  webMarkers.value = props.markers.map((item) => {
    const marker = new g.Marker({
      position: { lat: item.lat, lng: item.lng },
      title: item.title,
      draggable: item.draggable ?? false,
      // Driver markers pass `bearing` → use a built-in Google Maps Symbol with
      // rotation. SymbolPath.FORWARD_CLOSED_ARROW is a native enum value that
      // renders reliably on every browser/Maps version without any image loading.
      // data: URI icons do NOT render reliably in google.maps.Marker on web.
      // Other markers with an HTTPS iconUrl use the standard { url, scaledSize }.
      icon: item.bearing !== undefined
        ? {
            path: g.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#60B45A',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 6,
            rotation: item.bearing,
          }
        : item.iconUrl
          ? { url: item.iconUrl, scaledSize: item.iconSize ? new g.Size(item.iconSize.width, item.iconSize.height) : undefined }
          : undefined,
      map: webMap.value
    })
    if (item.draggable) {
      marker.addListener('dragend', () => {
        const pos = marker.getPosition()
        if (pos) emit('markerDragEnd', { lat: pos.lat(), lng: pos.lng() })
      })
    }
    return marker
  })

  if (webPolyline.value) {
    webPolyline.value.setMap(null)
    webPolyline.value = null
  }

  if (props.path.length > 1) {
    webPolyline.value = new g.Polyline({
      path: props.path,
      strokeColor: '#21c7c7',
      strokeOpacity: 1,
      strokeWeight: 6,
      map: webMap.value
    })
  }
}

function updateWebCamera() {
  if (!webMap.value) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (window as any).google.maps

  // Navigation mode: track driver with heading and tilt
  if (props.followDriver) {
    suppressIdle()
    webMap.value.panTo(props.center)
    webMap.value.setZoom(props.zoom)
    webMap.value.setHeading(props.mapBearing)
    webMap.value.setTilt(props.tilt)
    return
  }

  const points = [...props.markers.map((m) => ({ lat: m.lat, lng: m.lng })), ...props.path]
  if (points.length < 2) {
    webMap.value.setCenter(props.center)
    webMap.value.setZoom(props.zoom)
    return
  }

  const bounds = new g.LatLngBounds()
  points.forEach((p) => bounds.extend(p))
  const edgePad = 60
  webMap.value.fitBounds(bounds, {
    top: edgePad,
    left: edgePad,
    right: edgePad,
    bottom: edgePad + props.paddingBottom
  })
}

// --- Lifecycle ---
onMounted(async () => {
  await nextTick()
  if (isNative.value) {
    createMap()
  } else {
    createWebMap()
  }
})

// Watch 1: overlays — fires when markers or path change (not on every location update)
watch(
  () => [props.markers, props.path, props.interactive],
  async () => {
    if (isNative.value) {
      if (!map.value) return
      if (props.interactive) {
        await map.value.enableTouch()
      } else {
        await map.value.disableTouch()
      }
      await syncOverlays()
      // Only fit-to-bounds when NOT in follow mode (follow mode manages camera separately)
      if (!props.followDriver) await moveCameraToData()
    } else {
      syncWebOverlays()
      if (!props.followDriver) updateWebCamera()
    }
  },
  { deep: true }
)

// Watch 2: camera — fires on every position, zoom, bearing, tilt or follow-mode change
watch(
  () => [props.center.lat, props.center.lng, props.zoom, props.mapBearing, props.tilt, props.followDriver],
  async () => {
    console.log(`[NativeMap:${props.mapId}] camera watch fired — center:(${props.center.lat.toFixed(6)},${props.center.lng.toFixed(6)}) follow:${props.followDriver}`)
    if (isNative.value) {
      if (!map.value) { console.warn(`[NativeMap:${props.mapId}] camera watch fired but map not ready`); return }
      try {
        await moveCameraToData()
        console.log(`[NativeMap:${props.mapId}] setCamera OK`)
      } catch (err) {
        console.error(`[NativeMap:${props.mapId}] setCamera FAILED`, err)
      }
    } else {
      updateWebCamera()
    }
  }
)

onBeforeUnmount(() => {
  // Restore synchronously — async onBeforeUnmount would let the next page's
  // onMounted run before this completes, creating a race that leaves body opaque.
  document.documentElement.style.backgroundColor = ''
  document.body.style.backgroundColor = ''
  if (map.value) {
    map.value.destroy().catch(() => {})
  }
  webMarkers.value.forEach((m) => m.setMap(null))
  if (webPolyline.value) webPolyline.value.setMap(null)
})
</script>

<style scoped>
.native-map {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 280px;
  border-radius: var(--radius-card);
  overflow: hidden;
  background: transparent;
}
</style>
