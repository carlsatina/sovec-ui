/**
 * GPS smoothing utilities for live driver tracking.
 *
 * Three-layer approach:
 *   1. Outlier rejection  — discard readings that imply impossible speed
 *   2. Low-pass filter    — blend new reading toward previous to dampen jitter
 *   3. Snap-to-polyline   — clamp displayed marker to nearest road segment
 */

export interface LatLng { lat: number; lng: number }

// 1 degree latitude ≈ 111,320 metres (close enough for small distances)
const METERS_PER_DEG = 111_320

function degToMeters(deg: number): number {
  return deg * METERS_PER_DEG
}

// ─── 1. Outlier rejection ────────────────────────────────────────────────────

/**
 * Returns true if moving from `prev` to `curr` in `timeDeltaMs` milliseconds
 * would require exceeding `maxSpeedKph` (default 150 km/h).
 * Discard the reading when this returns true.
 */
export function isGpsOutlier(
  prev: LatLng,
  curr: LatLng,
  timeDeltaMs: number,
  maxSpeedKph = 150
): boolean {
  if (timeDeltaMs <= 0) return false
  const distM   = degToMeters(Math.hypot(curr.lat - prev.lat, curr.lng - prev.lng))
  const speedKph = (distM / (timeDeltaMs / 1000)) * 3.6
  return speedKph > maxSpeedKph
}

// ─── 2. Low-pass smoothing ───────────────────────────────────────────────────

/**
 * Exponential moving average (low-pass filter).
 * Blends `prev` toward `curr` by `alpha` each tick.
 *
 * alpha = 1.0 → raw GPS (no smoothing)
 * alpha = 0.0 → frozen (never moves)
 * Recommended: 0.5 for vehicle tracking — balances jitter suppression with fast convergence.
 */
export function smoothPosition(prev: LatLng, curr: LatLng, alpha = 0.5): LatLng {
  return {
    lat: prev.lat + alpha * (curr.lat - prev.lat),
    lng: prev.lng + alpha * (curr.lng - prev.lng),
  }
}

// ─── 3. Look-ahead camera center ────────────────────────────────────────────

/**
 * Shifts the camera center `offsetMeters` ahead of `pos` along `bearingDeg`
 * so the driver marker appears at the bottom third of the screen instead of
 * dead-center. 300 m works well at zoom 16 on typical Android screens.
 */
export function lookAheadCenter(
  pos: LatLng,
  bearingDeg: number,
  offsetMeters = 300
): LatLng {
  const rad    = (bearingDeg * Math.PI) / 180
  const cosLat = Math.cos((pos.lat * Math.PI) / 180)
  return {
    lat: pos.lat + (offsetMeters / 111_320) * Math.cos(rad),
    lng: pos.lng + (offsetMeters / (111_320 * cosLat)) * Math.sin(rad),
  }
}

// ─── 4. Snap-to-polyline ─────────────────────────────────────────────────────

/** Nearest point on line segment A→B to point P (clamped to segment). */
function closestPointOnSegment(p: LatLng, a: LatLng, b: LatLng): LatLng {
  const dx = b.lat - a.lat
  const dy = b.lng - a.lng
  if (dx === 0 && dy === 0) return a
  const t = Math.max(0, Math.min(1,
    ((p.lat - a.lat) * dx + (p.lng - a.lng) * dy) / (dx * dx + dy * dy)
  ))
  return { lat: a.lat + t * dx, lng: a.lng + t * dy }
}

/**
 * Computes the forward bearing along `path` from the driver's current `point`,
 * by walking `lookAheadMeters` ahead along the route polyline.
 * This gives a stable camera heading that follows the road direction ahead,
 * independent of the car's instantaneous GPS movement direction.
 */
export function routeForwardBearing(
  point: LatLng,
  path: LatLng[],
  lookAheadMeters = 80
): number {
  if (path.length < 2) return 0

  // Find the closest segment and snapped position on it
  let minDist = Infinity
  let bestSegIdx = 0
  let bestT = 0

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const dx = b.lat - a.lat
    const dy = b.lng - a.lng
    if (dx === 0 && dy === 0) continue
    const t = Math.max(0, Math.min(1,
      ((point.lat - a.lat) * dx + (point.lng - a.lng) * dy) / (dx * dx + dy * dy)
    ))
    const candidate = { lat: a.lat + t * dx, lng: a.lng + t * dy }
    const dist = degToMeters(Math.hypot(candidate.lat - point.lat, candidate.lng - point.lng))
    if (dist < minDist) {
      minDist = dist
      bestSegIdx = i
      bestT = t
    }
  }

  const segA = path[bestSegIdx]
  const segB = path[bestSegIdx + 1]
  const origin: LatLng = {
    lat: segA.lat + bestT * (segB.lat - segA.lat),
    lng: segA.lng + bestT * (segB.lng - segA.lng),
  }

  // Walk forward along the route polyline until lookAheadMeters is covered
  let remaining = lookAheadMeters
  let cursor = origin

  for (let i = bestSegIdx; i < path.length - 1; i++) {
    const segEnd = path[i + 1]
    const segLen = degToMeters(Math.hypot(segEnd.lat - cursor.lat, segEnd.lng - cursor.lng))
    if (segLen === 0) continue

    if (segLen >= remaining) {
      const t2 = remaining / segLen
      const target: LatLng = {
        lat: cursor.lat + t2 * (segEnd.lat - cursor.lat),
        lng: cursor.lng + t2 * (segEnd.lng - cursor.lng),
      }
      return _bearing(origin, target)
    }

    remaining -= segLen
    cursor = segEnd
  }

  // Reached end of route — use bearing of last segment
  return _bearing(path[path.length - 2], path[path.length - 1])
}

function _bearing(from: LatLng, to: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)
  const dLng = toRad(to.lng - from.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/**
 * Snaps `point` to the nearest point on `path`.
 * Only snaps if within `snapThresholdM` metres — beyond that the driver is
 * genuinely off-route and the original position is returned unchanged.
 */
export function snapToPolyline(
  point: LatLng,
  path: LatLng[],
  snapThresholdM = 50
): LatLng {
  if (path.length < 2) return point

  let minDist = Infinity
  let snapped  = point

  for (let i = 0; i < path.length - 1; i++) {
    const candidate = closestPointOnSegment(point, path[i], path[i + 1])
    const dist = degToMeters(Math.hypot(candidate.lat - point.lat, candidate.lng - point.lng))
    if (dist < minDist) {
      minDist = dist
      snapped  = candidate
    }
  }

  return minDist <= snapThresholdM ? snapped : point
}
