import { ref, watch } from 'vue'
import { api } from '../services/api'
import { Capacitor } from '@capacitor/core'
import { NativePlaces } from '../plugins/nativePlaces'

type PlacePrediction = { placeId: string; description: string }

type PlaceDetails = {
  placeId: string
  address: string
  name?: string
  lat: number
  lng: number
}

export function usePlacesSearch() {
  const query = ref('')
  const results = ref<PlacePrediction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let timer: number | undefined
  const useNativePlaces = Capacitor.getPlatform() === 'android'

  watch(
    () => query.value,
    (value) => {
      if (timer) window.clearTimeout(timer)
      if (!value || value.length < 3) {
        results.value = []
        return
      }
      timer = window.setTimeout(async () => {
        loading.value = true
        error.value = null
        try {
          const res = useNativePlaces
            ? await NativePlaces.autocomplete({ input: value })
            : await api.placesAutocomplete(value)
          results.value = res.items
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Search failed'
        } finally {
          loading.value = false
        }
      }, 300)
    }
  )

  async function selectPlace(placeId: string): Promise<PlaceDetails | null> {
    loading.value = true
    error.value = null
    try {
      const res = useNativePlaces
        ? await NativePlaces.details({ placeId })
        : await api.placeDetails(placeId)
      return res
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Lookup failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { query, results, loading, error, selectPlace }
}
