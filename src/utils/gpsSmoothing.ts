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
 * Recommended: 0.25–0.35 for vehicle tracking — smooth but responsive.
 */
export function smoothPosition(prev: LatLng, curr: LatLng, alpha = 0.3): LatLng {
  return {
    lat: prev.lat + alpha * (curr.lat - prev.lat),
    lng: prev.lng + alpha * (curr.lng - prev.lng),
  }
}

// ─── 3. Snap-to-polyline ─────────────────────────────────────────────────────

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
