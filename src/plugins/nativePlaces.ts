import { registerPlugin } from '@capacitor/core'

type PlacePrediction = { placeId: string; description: string }

type PlaceDetails = {
  placeId: string
  address: string
  name?: string
  lat: number
  lng: number
}

type NativePlacesPlugin = {
  autocomplete(options: { input: string }): Promise<{ items: PlacePrediction[] }>
  details(options: { placeId: string }): Promise<PlaceDetails>
}

export const NativePlaces = registerPlugin<NativePlacesPlugin>('NativePlaces')

export type { PlacePrediction, PlaceDetails }
