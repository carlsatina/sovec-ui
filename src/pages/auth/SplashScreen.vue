<template>
  <div class="splash">
    <!-- Animated city road scene -->
    <div class="scene">
      <!-- Sky gradient handled by .splash background -->

      <!-- Stars -->
      <div class="stars">
        <span v-for="s in stars" :key="s.id" class="star" :style="s.style"></span>
      </div>

      <!-- City skyline silhouette -->
      <svg class="skyline" viewBox="0 0 390 180" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <!-- Buildings -->
        <rect x="0"   y="100" width="30"  height="80"/>
        <rect x="5"   y="72"  width="18"  height="108"/>
        <rect x="28"  y="90"  width="26"  height="90"/>
        <rect x="52"  y="60"  width="22"  height="120"/>
        <rect x="55"  y="48"  width="14"  height="12"/>
        <!-- antenna -->
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
        <!-- Windows (lighter) -->
        <rect x="10"  y="80"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="10"  y="90"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="57"  y="68"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="64"  y="68"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="80"  y="76"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="88"  y="76"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="80"  y="88"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="142" y="64"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="150" y="64"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="188" y="78"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="196" y="78"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="280" y="58"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="290" y="58"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="330" y="72"  width="4" height="4" fill-opacity="0.5"/>
        <rect x="340" y="72"  width="4" height="4" fill-opacity="0.5"/>
      </svg>

      <!-- Road -->
      <div class="road">
        <div class="road-line"></div>
        <div class="road-line"></div>
        <div class="road-line"></div>
      </div>

      <!-- EV car -->
      <div class="car-wrap">
        <svg class="car-svg" viewBox="0 0 160 72" fill="none" aria-hidden="true">
          <!-- glow under car -->
          <ellipse cx="80" cy="68" rx="60" ry="5" fill="#37c6c5" fill-opacity="0.25"/>
          <!-- body -->
          <rect x="10" y="34" width="140" height="28" rx="8" fill="url(#bodyGrad)"/>
          <!-- cabin -->
          <path d="M38 34 C42 18 56 12 80 12 C104 12 118 18 122 34Z" fill="url(#cabinGrad)"/>
          <!-- windshield -->
          <path d="M52 34 C54 20 62 15 78 15 L78 34Z" fill="rgba(180,240,248,0.55)"/>
          <path d="M82 34 L82 15 C98 15 106 20 108 34Z" fill="rgba(180,240,248,0.55)"/>
          <!-- body stripe -->
          <rect x="10" y="44" width="140" height="3" rx="1" fill="rgba(255,255,255,0.12)"/>
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
          <circle cx="40"  cy="62" r="10" fill="#1a2e2e"/>
          <circle cx="40"  cy="62" r="5"  fill="#37c6c5"/>
          <circle cx="40"  cy="62" r="2"  fill="#e2fafa"/>
          <circle cx="120" cy="62" r="10" fill="#1a2e2e"/>
          <circle cx="120" cy="62" r="5"  fill="#37c6c5"/>
          <circle cx="120" cy="62" r="2"  fill="#e2fafa"/>
          <!-- ⚡ bolt on door -->
          <path d="M86 20 L80 32 H86 L82 44 L92 30 H86 L90 20Z" fill="#fde68a" fill-opacity="0.9"/>
          <!-- TAXI label -->
          <rect x="54" y="8" width="52" height="10" rx="4" fill="#fde68a"/>
          <text x="80" y="16.5" text-anchor="middle" font-size="6" font-weight="800" fill="#1a2e2e" font-family="system-ui">E-RIDE</text>
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4dd9d8"/>
              <stop offset="100%" stop-color="#1fb8b7"/>
            </linearGradient>
            <linearGradient id="cabinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#5de3e2"/>
              <stop offset="100%" stop-color="#37c6c5"/>
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
      <div class="brand-logo">
        <span class="brand-bolt">⚡</span>
        <span class="brand-name">E-Ride</span>
      </div>
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

// Generate random stars once
const stars = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  style: {
    top: `${Math.random() * 55}%`,
    left: `${Math.random() * 100}%`,
    width: `${1 + Math.random() * 2}px`,
    height: `${1 + Math.random() * 2}px`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 2}s`
  }
}))

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
  background: linear-gradient(175deg, #050f1a 0%, #0a1f2e 35%, #0c3540 65%, #0d4a4a 100%);
  position: relative;
}

/* ── Stars ── */
.stars { position: absolute; inset: 0; pointer-events: none; }

.star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  opacity: 0.7;
  animation: twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.4); }
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
  fill: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

/* ── Road ── */
.road {
  height: 80px;
  background: linear-gradient(180deg, #0f2a2a 0%, #0a1f1f 100%);
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
  background: rgba(255, 255, 255, 0.08);
}

.road-line {
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    rgba(255,255,255,0.18) 0px,
    rgba(255,255,255,0.18) 40px,
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
  filter: drop-shadow(0 8px 24px rgba(55, 198, 197, 0.5));
}

.headlight-beam {
  position: absolute;
  right: -60px;
  top: 28px;
  width: 80px;
  height: 28px;
  background: linear-gradient(90deg, rgba(253,230,138,0.35) 0%, transparent 100%);
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

/* ── Brand ── */
.brand {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 72px;
  gap: 10px;
  animation: brand-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes brand-in {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-bolt {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 0 12px rgba(253, 230, 138, 0.8));
  animation: bolt-glow 2s ease-in-out infinite;
}

@keyframes bolt-glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(253,230,138,0.6)); }
  50%       { filter: drop-shadow(0 0 20px rgba(253,230,138,1)); }
}

.brand-name {
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 20px rgba(55, 198, 197, 0.5);
}

.brand-tagline {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Bottom bar ── */
.bottom-bar {
  padding: 20px 40px 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: linear-gradient(0deg, rgba(5,15,26,0.9) 0%, transparent 100%);
}

.loader-track {
  width: 120px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.loader-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #37c6c5, #fde68a);
  animation: load 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes load {
  from { width: 0%; }
  to   { width: 100%; }
}

.powered-by {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
