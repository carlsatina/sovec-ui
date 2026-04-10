<template>
  <div class="splash">
    <!-- Decorative background circles -->
    <div class="deco-circle deco-1" aria-hidden="true"></div>
    <div class="deco-circle deco-2" aria-hidden="true"></div>
    <div class="deco-circle deco-3" aria-hidden="true"></div>

    <div class="scene">
      <!-- City skyline silhouette -->
      <svg class="skyline" viewBox="0 0 390 180" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <rect x="0"   y="100" width="30"  height="80"/>
        <rect x="5"   y="72"  width="18"  height="108"/>
        <rect x="28"  y="90"  width="26"  height="90"/>
        <rect x="52"  y="60"  width="22"  height="120"/>
        <rect x="55"  y="48"  width="14"  height="12"/>
        <rect x="61"  y="36"  width="2"   height="14"/>
        <rect x="72"  y="82"  width="32"  height="98"/>
        <rect x="78"  y="68"  width="20"  height="14"/>
        <rect x="102" y="95"  width="24"  height="85"/>
        <rect x="124" y="75"  width="18"  height="105"/>
        <rect x="140" y="55"  width="28"  height="125"/>
        <rect x="146" y="40"  width="16"  height="17"/>
        <rect x="153" y="28"  width="2"   height="14"/>
        <rect x="166" y="88"  width="22"  height="92"/>
        <rect x="186" y="70"  width="30"  height="110"/>
        <rect x="192" y="56"  width="18"  height="14"/>
        <rect x="214" y="92"  width="20"  height="88"/>
        <rect x="232" y="65"  width="26"  height="115"/>
        <rect x="256" y="85"  width="24"  height="95"/>
        <rect x="278" y="50"  width="32"  height="130"/>
        <rect x="284" y="38"  width="20"  height="14"/>
        <rect x="293" y="26"  width="2"   height="14"/>
        <rect x="308" y="80"  width="22"  height="100"/>
        <rect x="328" y="68"  width="28"  height="112"/>
        <rect x="334" y="54"  width="16"  height="16"/>
        <rect x="354" y="90"  width="20"  height="90"/>
        <rect x="372" y="72"  width="18"  height="108"/>
        <!-- Windows -->
        <rect x="10"  y="80"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="10"  y="90"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="57"  y="68"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="64"  y="68"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="80"  y="76"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="88"  y="76"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="80"  y="88"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="142" y="64"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="150" y="64"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="188" y="78"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="196" y="78"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="280" y="58"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="290" y="58"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="330" y="72"  width="4" height="4" fill-opacity="0.6"/>
        <rect x="340" y="72"  width="4" height="4" fill-opacity="0.6"/>
      </svg>

      <!-- Road -->
      <div class="road">
        <div class="road-line"></div>
        <div class="road-line"></div>
        <div class="road-line"></div>
      </div>

      <!-- EV Car -->
      <div class="car-wrap">
        <svg class="car-svg" viewBox="0 0 160 72" fill="none" aria-hidden="true">
          <!-- glow under car -->
          <ellipse cx="80" cy="68" rx="60" ry="5" fill="#60B45A" fill-opacity="0.22"/>
          <!-- body -->
          <rect x="10" y="34" width="140" height="28" rx="8" fill="url(#bodyGrad)"/>
          <!-- cabin -->
          <path d="M38 34 C42 18 56 12 80 12 C104 12 118 18 122 34Z" fill="url(#cabinGrad)"/>
          <!-- windshield -->
          <path d="M52 34 C54 20 62 15 78 15 L78 34Z" fill="rgba(200,240,200,0.55)"/>
          <path d="M82 34 L82 15 C98 15 106 20 108 34Z" fill="rgba(200,240,200,0.55)"/>
          <!-- body stripe -->
          <rect x="10" y="44" width="140" height="3" rx="1" fill="rgba(255,255,255,0.18)"/>
          <!-- front bumper -->
          <rect x="142" y="40" width="12" height="14" rx="4" fill="url(#bodyGrad)"/>
          <!-- rear bumper -->
          <rect x="6"   y="40" width="12" height="14" rx="4" fill="url(#bodyGrad)"/>
          <!-- headlight -->
          <rect x="148" y="42" width="8" height="6" rx="3" fill="#fde68a"/>
          <rect x="148" y="42" width="8" height="6" rx="3" fill="url(#headlightGlow)" fill-opacity="0.8"/>
          <!-- taillight -->
          <rect x="4"   y="42" width="8" height="6" rx="3" fill="#f87171"/>
          <!-- wheels -->
          <circle cx="40"  cy="62" r="10" fill="#2D3A2D"/>
          <circle cx="40"  cy="62" r="5"  fill="#60B45A"/>
          <circle cx="40"  cy="62" r="2"  fill="#E8F5E8"/>
          <circle cx="120" cy="62" r="10" fill="#2D3A2D"/>
          <circle cx="120" cy="62" r="5"  fill="#60B45A"/>
          <circle cx="120" cy="62" r="2"  fill="#E8F5E8"/>
          <!-- ⚡ bolt on door -->
          <path d="M86 20 L80 32 H86 L82 44 L92 30 H86 L90 20Z" fill="#D4A017" fill-opacity="0.95"/>
          <!-- E-RIDE label -->
          <rect x="54" y="8" width="52" height="10" rx="4" fill="#D4A017"/>
          <text x="80" y="16.5" text-anchor="middle" font-size="6" font-weight="800" fill="#1a1a1a" font-family="system-ui">E-RIDE</text>
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#72C46C"/>
              <stop offset="100%" stop-color="#4A9645"/>
            </linearGradient>
            <linearGradient id="cabinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#82CF7C"/>
              <stop offset="100%" stop-color="#60B45A"/>
            </linearGradient>
            <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
              <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
            </radialGradient>
          </defs>
        </svg>
        <!-- headlight beam -->
        <div class="headlight-beam"></div>
      </div>
    </div>

    <!-- Brand overlay -->
    <div class="brand">
      <div class="brand-logo-wrap">
        <div class="brand-icon-ring">
          <span class="brand-bolt">⚡</span>
        </div>
      </div>
      <div class="brand-name">E-Ride</div>
      <div class="brand-tagline">Clean rides. Green future.</div>
    </div>

    <!-- Bottom loader -->
    <div class="bottom-bar">
      <div class="loader-track">
        <div class="loader-fill"></div>
      </div>
      <div class="powered-by">100% Electric · Zero Emissions</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const minDelay = new Promise((resolve) => setTimeout(resolve, 2200))

  const token = localStorage.getItem('auth_token')
  let destination = '/auth/welcome'

  if (token) {
    try {
      const me = await api.me()
      auth.$patch({ token, user: me })
      destination = me.role === 'DRIVER' ? '/driver/home' : '/home'
    } catch {
      localStorage.removeItem('auth_token')
      auth.$patch({ token: null, user: null })
    }
  }

  await minDelay
  router.replace(destination)
})
</script>

<style scoped>
/* ── Base ── */
.splash {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #FFFCF5 0%, #FFF6E0 40%, #FDF0C8 70%, #FAE9AA 100%);
  position: relative;
}

/* ── Decorative circles ── */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.deco-1 {
  width: 320px;
  height: 320px;
  top: -120px;
  right: -80px;
  background: radial-gradient(circle, rgba(96,180,90,0.12) 0%, transparent 70%);
}

.deco-2 {
  width: 220px;
  height: 220px;
  top: 60px;
  left: -60px;
  background: radial-gradient(circle, rgba(212,160,23,0.10) 0%, transparent 70%);
}

.deco-3 {
  width: 180px;
  height: 180px;
  bottom: 100px;
  right: -40px;
  background: radial-gradient(circle, rgba(96,180,90,0.08) 0%, transparent 70%);
}

/* ── Brand ── */
.brand {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 68px;
  gap: 10px;
  animation: brand-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes brand-in {
  from { opacity: 0; transform: translateY(-24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.brand-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon-ring {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: linear-gradient(135deg, #60B45A 0%, #3D7A38 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(96,180,90,0.35), 0 2px 8px rgba(0,0,0,0.08);
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes icon-float {
  0%, 100% { transform: translateY(0); box-shadow: 0 8px 32px rgba(96,180,90,0.35), 0 2px 8px rgba(0,0,0,0.08); }
  50%       { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(96,180,90,0.40), 0 4px 12px rgba(0,0,0,0.10); }
}

.brand-bolt {
  font-size: 34px;
  line-height: 1;
}

.brand-name {
  font-size: 44px;
  font-weight: 800;
  color: #1A2E0F;
  letter-spacing: -0.03em;
  line-height: 1;
}

.brand-tagline {
  font-size: 13px;
  font-weight: 600;
  color: #6B7C60;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Scene ── */
.scene {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ── Skyline ── */
.skyline {
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
  width: 100%;
  fill: rgba(96, 180, 90, 0.10);
  pointer-events: none;
}

/* ── Road ── */
.road {
  height: 80px;
  background: linear-gradient(180deg, #E8F0E6 0%, #D8EAD4 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
}

.road::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(96, 180, 90, 0.20);
}

.road-line {
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    rgba(96,180,90,0.35) 0px,
    rgba(96,180,90,0.35) 40px,
    transparent 40px,
    transparent 80px
  );
  animation: road-scroll 0.7s linear infinite;
}

.road-line:nth-child(2) { opacity: 0.5; }
.road-line:nth-child(3) { opacity: 0.25; }

@keyframes road-scroll {
  from { background-position: 0 0; }
  to   { background-position: -80px 0; }
}

/* ── Car ── */
.car-wrap {
  position: absolute;
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  animation: car-float 3s ease-in-out infinite;
}

.car-svg {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 24px rgba(96, 180, 90, 0.40));
}

.headlight-beam {
  position: absolute;
  right: -60px;
  top: 28px;
  width: 80px;
  height: 28px;
  background: linear-gradient(90deg, rgba(253,230,138,0.40) 0%, transparent 100%);
  clip-path: polygon(0 40%, 100% 0%, 100% 100%, 0 60%);
  animation: beam-pulse 2s ease-in-out infinite;
}

@keyframes car-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(-5px); }
}

@keyframes beam-pulse {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1; }
}

/* ── Bottom bar ── */
.bottom-bar {
  padding: 20px 40px 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: linear-gradient(0deg, rgba(250,233,170,0.6) 0%, transparent 100%);
}

.loader-track {
  width: 120px;
  height: 4px;
  border-radius: 999px;
  background: rgba(96,180,90,0.15);
  overflow: hidden;
}

.loader-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #60B45A, #D4A017);
  animation: load 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes load {
  from { width: 0%; }
  to   { width: 100%; }
}

.powered-by {
  font-size: 11px;
  font-weight: 600;
  color: #8A9E80;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
