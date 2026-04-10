/**
 * Bearing + directional car-icon utilities for live driver tracking.
 *
 * Icons are rendered to PNG via an offscreen <canvas> — universally supported
 * by Google Maps JS API (web) and Capacitor Google Maps (native/Android).
 */

// ─── Bearing ────────────────────────────────────────────────────────────────

/** Compute compass bearing (0–360°, 0 = north) between two GPS coordinates. */
export function computeBearing(
  from: { lat: number; lng: number },
  to:   { lat: number; lng: number }
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const lat1  = toRad(from.lat)
  const lat2  = toRad(to.lat)
  const dLng  = toRad(to.lng - from.lng)

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

// ─── Icon generation ─────────────────────────────────────────────────────────

/** Cache so we never redraw the same angle twice. */
const _cache = new Map<number, string>()

/**
 * Return a PNG data-URL of a top-down car icon rotated to face `bearing`.
 * Bearing is snapped to the nearest 5° to keep cache small.
 */
export function createRotatedCarIcon(bearing: number): string {
  const angle = Math.round(bearing / 5) * 5
  if (_cache.has(angle)) return _cache.get(angle)!

  const url = _drawCarIcon(angle)
  _cache.set(angle, url)
  return url
}

/** Car icon with no rotation (north-facing). Resolved lazily so DOM is ready. */
export function getDefaultCarIcon(): string {
  return createRotatedCarIcon(0)
}

// ─── Canvas drawing ───────────────────────────────────────────────────────────

function _drawCarIcon(angleDeg: number): string {
  const SIZE = 64          // canvas px — sharp on retina
  const CX   = SIZE / 2
  const CY   = SIZE / 2

  const canvas = document.createElement('canvas')
  canvas.width  = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Rotate everything around canvas center
  ctx.save()
  ctx.translate(CX, CY)
  ctx.rotate((angleDeg * Math.PI) / 180)
  ctx.translate(-CX, -CY)

  // ── Drop shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.20)'
  _ellipse(ctx, CX, CY + 5, 13, 6)

  // ── Car body ──
  ctx.fillStyle = '#60B45A'
  _rrect(ctx, 18, 10, 28, 38, 8)

  // ── Windshield ──
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  _rrect(ctx, 20, 14, 24, 14, 3.5)

  // ── Rear window ──
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  _rrect(ctx, 20, 32, 24, 9, 3)

  // ── Front-left tyre ──
  ctx.fillStyle = '#1A1008'
  _rrect(ctx, 12, 15, 7, 12, 3.5)
  // ── Front-right tyre ──
  _rrect(ctx, 45, 15, 7, 12, 3.5)
  // ── Rear-left tyre ──
  _rrect(ctx, 12, 32, 7, 12, 3.5)
  // ── Rear-right tyre ──
  _rrect(ctx, 45, 32, 7, 12, 3.5)

  // ── Headlights (front = top at 0°) ──
  ctx.fillStyle = '#FFF9C4'
  _rrect(ctx, 19, 7,  10, 5, 2.5)
  _rrect(ctx, 35, 7,  10, 5, 2.5)

  // ── Tail lights ──
  ctx.fillStyle = 'rgba(239,68,68,0.85)'
  _rrect(ctx, 19, 51, 10, 5, 2.5)
  _rrect(ctx, 35, 51, 10, 5, 2.5)

  // ── Direction arrow (white triangle pointing toward front / top) ──
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.moveTo(CX,     3)
  ctx.lineTo(CX + 5, 10)
  ctx.lineTo(CX - 5, 10)
  ctx.closePath()
  ctx.fill()

  ctx.restore()

  return canvas.toDataURL('image/png')
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

/** Filled rounded rectangle. */
function _rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
  ctx.fill()
}

/** Filled ellipse. */
function _ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}
