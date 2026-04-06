import { Geolocation } from '@capacitor/geolocation'
import { api } from '../services/api'

export type CurrentLocationPoint = {
  address: string
  lat: number
  lng: number
}

function fallbackAddress(lat: number, lng: number) {
  return `Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})`
}

export async function getCurrentLocationPoint(): Promise<CurrentLocationPoint> {
  try {
    const permissions = await Geolocation.requestPermissions()
    if (permissions.location === 'denied') {
      throw new Error('Location permission denied')
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    })

    const lat = position.coords.latitude
    const lng = position.coords.longitude

    try {
      const reverse = await api.reverseGeocode(lat, lng)
      return {
        address: reverse.address || fallbackAddress(lat, lng),
        lat,
        lng
      }
    } catch {
      return { address: fallbackAddress(lat, lng), lat, lng }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch current location'
    throw new Error(message)
  }
}
