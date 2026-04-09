<template>
  <div class="home">

    <!-- ── Hero ── -->
    <div class="hero">
      <!-- Status bar spacer -->
      <div class="safe-top"></div>

      <!-- Top bar -->
      <div class="top-bar">
        <div class="brand-lockup">
          <div class="brand-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z" fill="#60B45A"/>
            </svg>
          </div>
          <div class="greeting">
            <div class="greeting-label">Good morning</div>
            <div class="greeting-name">RC Satina</div>
          </div>
        </div>
        <div class="top-right">
          <button class="notif-btn" type="button" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span class="notif-dot" aria-hidden="true"></span>
          </button>
          <button class="points-chip" type="button">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/>
            </svg>
            <span>15 pts</span>
          </button>
        </div>
      </div>

      <!-- Hero headline -->
      <div class="hero-headline">
        <h1 class="hero-title">Where are you<br><span class="hero-title-accent">going today?</span></h1>
        <p class="hero-sub">100% electric. Zero emissions. Pure comfort.</p>
      </div>

      <!-- Search bar -->
      <button class="search-bar" type="button" @click="goDropoff">
        <div class="search-icon-wrap" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <span class="search-placeholder">Where to?</span>
        <button class="schedule-btn" type="button" @click.stop="goSchedule">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Schedule
        </button>
      </button>

      <!-- Quick actions -->
      <div class="quick-row">
        <button class="quick-pill" type="button" @click="goDropoff">
          <span class="quick-pill-icon pill-car" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="pill-svg" aria-hidden="true">
              <rect x="4" y="34" width="54" height="16" rx="5"/>
              <path d="M16 34 C18 23 24 19 32 19 C40 19 46 23 48 34Z"/>
              <circle cx="16" cy="51" r="7"/><circle cx="48" cy="51" r="7"/>
              <rect x="57" y="37" width="4" height="5" rx="2"/>
              <path d="M34 22 L30 32 H34 L31 41 L38 31 H34 L36 22Z" fill="#FFF9E6"/>
            </svg>
          </span>
          <span class="quick-pill-label">Book Car</span>
        </button>

        <button class="quick-pill" type="button" @click="goRewards">
          <span class="quick-pill-icon pill-member" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="pill-svg" aria-hidden="true">
              <path d="M8 44 L8 28 L20 38 L32 14 L44 38 L56 28 L56 44Z"/>
              <rect x="8" y="44" width="48" height="9" rx="4"/>
            </svg>
          </span>
          <span class="quick-pill-label">Members</span>
        </button>

        <button class="quick-pill" type="button">
          <span class="quick-pill-icon pill-rewards" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="pill-svg" aria-hidden="true">
              <polygon points="32,8 38,24 56,24 42,36 48,52 32,42 16,52 22,36 8,24 26,24"/>
            </svg>
          </span>
          <span class="quick-pill-label">Rewards</span>
        </button>

        <button class="quick-pill" type="button">
          <span class="quick-pill-icon pill-saved" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="pill-svg" aria-hidden="true">
              <path d="M32 8C22 8 14 16 14 26 C14 40 32 56 32 56 C32 56 50 40 50 26 C50 16 42 8 32 8Z"/>
              <circle cx="32" cy="26" r="6" fill-opacity="0.4"/>
            </svg>
          </span>
          <span class="quick-pill-label">Saved</span>
        </button>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="body">

      <!-- Eco impact bar -->
      <div class="eco-bar">
        <div class="eco-leaf-bg" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.06">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" fill="#60B45A"/>
            <path d="M12 12c-2-3-1-7 3-8-1 4 2 6 2 8a5 5 0 01-10 0c0-1 .5-2 1-3 1 2 3 2 4 3z" fill="#60B45A"/>
          </svg>
        </div>
        <div class="eco-stat">
          <div class="eco-icon eco-icon-green">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60B45A" stroke-width="2.5" aria-hidden="true">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
              <path d="M12 12c-2-3-1-7 3-8-1 4 2 6 2 8a5 5 0 01-10 0c0-1 .5-2 1-3 1 2 3 2 4 3z"/>
            </svg>
          </div>
          <div>
            <div class="eco-val">24.3 kg</div>
            <div class="eco-label">CO₂ Saved</div>
          </div>
        </div>
        <div class="eco-divider"></div>
        <div class="eco-stat">
          <div class="eco-icon eco-icon-gold">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4A017" aria-hidden="true">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/>
            </svg>
          </div>
          <div>
            <div class="eco-val">8 rides</div>
            <div class="eco-label">This month</div>
          </div>
        </div>
        <div class="eco-divider"></div>
        <div class="eco-stat">
          <div class="eco-icon eco-icon-red">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#C53030" aria-hidden="true">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          </div>
          <div>
            <div class="eco-val">15 pts</div>
            <div class="eco-label">Green Points</div>
          </div>
        </div>
      </div>

      <!-- Promotions -->
      <section class="section">
        <div class="section-row">
          <span class="section-title">Promotions</span>
          <button class="see-all" type="button">See all</button>
        </div>
        <div class="promo-scroll">

          <!-- Eco Card -->
          <article class="promo-card promo-eco">
            <div class="promo-deco-circle promo-deco-1"></div>
            <div class="promo-deco-circle promo-deco-2"></div>
            <div class="promo-deco-circle promo-deco-3"></div>
            <div class="promo-kicker">
              <span class="kicker-dot kicker-dot-green"></span>
              ECO RIDE
            </div>
            <h3 class="promo-heading">Zero Emissions,<br>Zero Guilt</h3>
            <p class="promo-sub">100% electric. No fumes, no noise.</p>
            <button class="promo-btn btn-green" type="button" @click="goDropoff">Book now →</button>
          </article>

          <!-- Member Card -->
          <article class="promo-card promo-member">
            <div class="promo-deco-circle promo-deco-1"></div>
            <div class="promo-deco-circle promo-deco-2"></div>
            <div class="promo-deco-circle promo-deco-3"></div>
            <div class="promo-kicker">
              <span class="kicker-dot kicker-dot-gold"></span>
              MEMBERSHIP
            </div>
            <h3 class="promo-heading">Unlock Member<br>Pricing</h3>
            <p class="promo-sub">Save up to 30% on every ride.</p>
            <button class="promo-btn btn-gold" type="button" @click="goRewards">Learn more →</button>
          </article>

          <!-- Driver Card -->
          <article class="promo-card promo-driver">
            <div class="promo-deco-circle promo-deco-1"></div>
            <div class="promo-deco-circle promo-deco-2"></div>
            <div class="promo-deco-circle promo-deco-3"></div>
            <div class="promo-kicker">
              <span class="kicker-dot kicker-dot-red"></span>
              DRIVE WITH US
            </div>
            <h3 class="promo-heading">Earn More,<br>Drive Clean</h3>
            <p class="promo-sub">Up to 90% commission, daily pay.</p>
            <button class="promo-btn btn-red" type="button">Apply now →</button>
          </article>

        </div>
      </section>

      <!-- Featured -->
      <section class="section">
        <div class="section-row">
          <span class="section-title">Featured</span>
          <button class="see-all" type="button">See all</button>
        </div>
        <div class="featured-grid">

          <article class="featured-card">
            <div class="featured-media feat-launch">
              <div class="feat-shimmer"></div>
              <div class="feat-badge">New</div>
              <div class="feat-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z" fill="rgba(255,255,255,0.9)"/>
                </svg>
              </div>
            </div>
            <div class="featured-title">E-Ride Taxi Launch</div>
            <div class="featured-sub">Now in your city</div>
          </article>

          <article class="featured-card">
            <div class="featured-media feat-drive">
              <div class="feat-shimmer"></div>
              <div class="feat-badge feat-badge-gold">Hiring</div>
              <div class="feat-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <rect x="4" y="34" width="54" height="16" rx="5" fill="rgba(255,255,255,0.85)"/>
                  <path d="M16 34 C18 23 24 19 32 19 C40 19 46 23 48 34Z" fill="rgba(255,255,255,0.85)"/>
                  <circle cx="16" cy="51" r="7" fill="rgba(255,255,255,0.85)"/>
                  <circle cx="48" cy="51" r="7" fill="rgba(255,255,255,0.85)"/>
                </svg>
              </div>
            </div>
            <div class="featured-title">Drive Your Own EV</div>
            <div class="featured-sub">₱90 per 100 commission</div>
          </article>

          <article class="featured-card">
            <div class="featured-media feat-care">
              <div class="feat-shimmer"></div>
              <div class="feat-icon-wrap">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" fill="rgba(255,255,255,0.85)"/>
                  <path d="M12 12c-2-3-1-7 3-8-1 4 2 6 2 8a5 5 0 01-10 0c0-1 .5-2 1-3 1 2 3 2 4 3z" fill="rgba(255,255,255,0.5)"/>
                </svg>
              </div>
            </div>
            <div class="featured-title">Eco Care Every Trip</div>
            <div class="featured-sub">Plant a tree per ride</div>
          </article>

          <article class="featured-card">
            <div class="featured-media feat-city">
              <div class="feat-shimmer"></div>
              <div class="feat-icon-wrap">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="rgba(255,255,255,0.85)"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" fill="none"/>
                </svg>
              </div>
            </div>
            <div class="featured-title">Explore the City</div>
            <div class="featured-sub">Clean & affordable rides</div>
          </article>

        </div>
      </section>

      <!-- Bottom padding -->
      <div style="height: 12px;"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goDropoff() {
  router.push('/booking/destination')
}

function goSchedule() {
  router.push('/booking/ride-options')
}

function goRewards() {
  router.push('/rewards')
}
</script>

<style scoped>
/* ── Base ── */
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F2EE;
  padding-bottom: 100px;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ══════════════════════════════
   HERO
══════════════════════════════ */
.safe-top { height: 8px; }

.hero {
  background: linear-gradient(155deg, #FFFCF5 0%, #FFF6E0 45%, #FDEFC3 100%);
  padding: 48px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-radius: 0 0 32px 32px;
  position: relative;
  overflow: hidden;
}

/* Decorative radial tints */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 55% 50% at 90% 10%, rgba(96,180,90,0.10) 0%, transparent 65%),
    radial-gradient(ellipse 45% 55% at 5% 90%, rgba(212,160,23,0.08) 0%, transparent 65%);
  pointer-events: none;
}

/* Top bar */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(145deg, #EAF7E9, #D4F0D2);
  border: 1px solid rgba(96,180,90,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.greeting-label {
  font-size: 11px;
  font-weight: 500;
  color: #B09060;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1;
}

.greeting-name {
  font-size: 15px;
  font-weight: 700;
  color: #2D1A06;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.07);
  background: rgba(255,255,255,0.7);
  color: #5C3E1A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.notif-btn:active { background: rgba(255,255,255,0.9); }

.notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #C53030;
  border: 1.5px solid #FFFCF5;
}

.points-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(212,160,23,0.4);
  background: rgba(255,255,255,0.7);
  color: #A07010;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.points-chip:active { background: rgba(255,255,255,0.9); }

/* Hero headline */
.hero-headline {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 26px;
  font-weight: 800;
  color: #2D1A06;
  letter-spacing: -0.03em;
  line-height: 1.18;
  margin: 0 0 6px;
}

.hero-title-accent {
  background: linear-gradient(90deg, #C47F10 0%, #D4A017 50%, #B06A0A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 12px;
  font-weight: 500;
  color: #B09060;
  margin: 0;
  letter-spacing: 0.01em;
}

/* Search bar */
.search-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 0 12px;
  height: 54px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.07);
  background: #FFFFFF;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.search-bar:active {
  border-color: rgba(96,180,90,0.4);
  box-shadow: 0 4px 16px rgba(96,180,90,0.15);
}

.search-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  box-shadow: 0 3px 8px rgba(96,180,90,0.35);
}

.search-placeholder {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #C4BAB0;
}

.schedule-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 13px;
  height: 38px;
  border-radius: 11px;
  border: 1px solid #EDE8E0;
  background: #F7F4EE;
  color: #8C7050;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.schedule-btn:active { background: #EDE8E0; }

/* Quick action pills */
.quick-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s;
}

.quick-pill:active { transform: scale(0.94); }

.quick-pill-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-svg {
  width: 28px;
  height: 28px;
  fill: #fff;
}

.pill-car {
  background: linear-gradient(145deg, #60B45A, #3D7A38);
  box-shadow: 0 5px 14px rgba(96,180,90,0.4);
}

.pill-member {
  background: linear-gradient(145deg, #D4A017, #9A7010);
  box-shadow: 0 5px 14px rgba(212,160,23,0.4);
}

.pill-rewards {
  background: linear-gradient(145deg, #C53030, #8B1A1A);
  box-shadow: 0 5px 14px rgba(197,48,48,0.4);
}

.pill-saved {
  background: linear-gradient(145deg, #FFFFFF, #F5F0E8);
  border: 1px solid #E8E0D4;
  box-shadow: 0 3px 8px rgba(0,0,0,0.06);
}

.quick-pill-label {
  font-size: 11px;
  font-weight: 600;
  color: #8C7050;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

/* ══════════════════════════════
   BODY
══════════════════════════════ */
.body {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* Eco bar */
.eco-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 18px;
  padding: 14px 4px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  position: relative;
  overflow: hidden;
}

.eco-leaf-bg {
  position: absolute;
  right: 12px;
  bottom: -4px;
  pointer-events: none;
}

.eco-stat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.eco-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.eco-icon-green { background: #EBF5EA; }
.eco-icon-gold  { background: #FDF7E6; }
.eco-icon-red   { background: #FEF0F0; }

.eco-val {
  font-size: 13px;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
}

.eco-label {
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 500;
  margin-top: 1px;
}

.eco-divider {
  width: 1px;
  height: 28px;
  background: #F0EDE8;
  flex-shrink: 0;
}

/* Section */
.section { display: flex; flex-direction: column; }

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #1A1008;
  letter-spacing: -0.02em;
}

.see-all {
  font-size: 12px;
  font-weight: 700;
  color: #60B45A;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

/* Promo cards */
.promo-scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 76%;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 4px;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
  -webkit-overflow-scrolling: touch;
}

.promo-scroll::-webkit-scrollbar { display: none; }

.promo-card {
  scroll-snap-align: start;
  border-radius: 22px;
  padding: 20px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  min-height: 160px;
}

/* Eco promo */
.promo-eco {
  background: linear-gradient(140deg, #0B2E0A 0%, #124110 40%, #1B5E18 100%);
}

.promo-eco .promo-deco-1 {
  background: rgba(96,180,90,0.15);
  width: 130px; height: 130px;
  right: -30px; bottom: -30px;
}
.promo-eco .promo-deco-2 {
  background: rgba(96,180,90,0.08);
  width: 80px; height: 80px;
  right: 50px; top: -25px;
}
.promo-eco .promo-deco-3 {
  background: rgba(255,255,255,0.04);
  width: 50px; height: 50px;
  left: -15px; bottom: 20px;
}

/* Member promo */
.promo-member {
  background: linear-gradient(140deg, #1A0C00 0%, #2D1600 40%, #3D2000 100%);
}

.promo-member .promo-deco-1 {
  background: rgba(212,160,23,0.18);
  width: 130px; height: 130px;
  right: -30px; bottom: -30px;
}
.promo-member .promo-deco-2 {
  background: rgba(212,160,23,0.1);
  width: 80px; height: 80px;
  right: 50px; top: -25px;
}
.promo-member .promo-deco-3 {
  background: rgba(255,255,255,0.03);
  width: 50px; height: 50px;
  left: -15px; bottom: 20px;
}

/* Driver promo */
.promo-driver {
  background: linear-gradient(140deg, #2A0000 0%, #4A0505 40%, #6B0C0C 100%);
}

.promo-driver .promo-deco-1 {
  background: rgba(197,48,48,0.2);
  width: 130px; height: 130px;
  right: -30px; bottom: -30px;
}
.promo-driver .promo-deco-2 {
  background: rgba(197,48,48,0.1);
  width: 80px; height: 80px;
  right: 50px; top: -25px;
}
.promo-driver .promo-deco-3 {
  background: rgba(255,255,255,0.03);
  width: 50px; height: 50px;
  left: -15px; bottom: 20px;
}

/* Decorative circles */
.promo-deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

/* Kicker */
.promo-kicker {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kicker-dot-green { background: #60B45A; box-shadow: 0 0 6px rgba(96,180,90,0.8); }
.kicker-dot-gold  { background: #D4A017; box-shadow: 0 0 6px rgba(212,160,23,0.8); }
.kicker-dot-red   { background: #C53030; box-shadow: 0 0 6px rgba(197,48,48,0.8); }

.promo-heading {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin: 0 0 5px;
  position: relative;
  z-index: 1;
}

.promo-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin: 0 0 14px;
  line-height: 1.4;
  position: relative;
  z-index: 1;
}

.promo-btn {
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  z-index: 1;
  position: relative;
  letter-spacing: 0.01em;
  transition: opacity 0.15s;
}

.promo-btn:active { opacity: 0.85; }

.btn-green { background: #60B45A; color: #fff; box-shadow: 0 4px 10px rgba(96,180,90,0.45); }
.btn-gold  { background: #D4A017; color: #fff; box-shadow: 0 4px 10px rgba(212,160,23,0.45); }
.btn-red   { background: #C53030; color: #fff; box-shadow: 0 4px 10px rgba(197,48,48,0.45); }

/* Featured */
.featured-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.featured-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.15s;
}

.featured-card:active { transform: scale(0.97); }

.featured-media {
  height: 112px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feat-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%);
  pointer-events: none;
}

.feat-launch { background: linear-gradient(140deg, #1B5E18, #60B45A); }
.feat-drive  { background: linear-gradient(140deg, #1A0C00, #D4A017); }
.feat-care   { background: linear-gradient(140deg, #3D7A38, #60B45A); }
.feat-city   { background: linear-gradient(140deg, #4A0505, #C53030); }

.feat-icon-wrap {
  position: relative;
  z-index: 1;
}

.feat-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  z-index: 2;
}

.feat-badge-gold {
  background: rgba(212,160,23,0.85);
  color: #fff;
}

.featured-title {
  font-size: 12px;
  font-weight: 700;
  color: #1A1008;
  line-height: 1.3;
  padding: 0 2px;
}

.featured-sub {
  font-size: 11px;
  font-weight: 500;
  color: #9CA3AF;
  padding: 0 2px;
  margin-top: -2px;
}
</style>
