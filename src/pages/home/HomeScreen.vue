<template>
  <div class="home">

    <!-- ── Dark Hero ── -->
    <div class="hero">
      <!-- Top bar -->
      <div class="top-bar">
        <div class="greeting">
          <div class="greeting-label">Good morning</div>
          <div class="greeting-name">RC Satina 👋</div>
        </div>
        <div class="top-right">
          <button class="notif-btn" type="button" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span class="notif-dot" aria-hidden="true"></span>
          </button>
          <button class="points-chip" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"/></svg>
            <span>15 pts</span>
          </button>
        </div>
      </div>

      <!-- Search bar -->
      <button class="search-bar" type="button" @click="goDropoff">
        <div class="search-icon-wrap" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <span class="search-placeholder">Where to?</span>
        <button class="schedule-btn" type="button" @click.stop="goSchedule">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Schedule
        </button>
      </button>

      <!-- Quick actions -->
      <div class="quick-row">
        <button class="quick-pill" type="button" @click="goDropoff">
          <span class="quick-pill-icon car-pill" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="pill-svg" aria-hidden="true">
              <rect x="4" y="34" width="54" height="16" rx="5"/>
              <path d="M16 34 C18 23 24 19 32 19 C40 19 46 23 48 34Z"/>
              <path d="M22 34 C23 26 27 22 32 22 L32 34Z" fill-opacity="0.35"/>
              <path d="M32 34 L32 22 C37 22 41 26 42 34Z" fill-opacity="0.35"/>
              <circle cx="16" cy="51" r="7"/>
              <circle cx="48" cy="51" r="7"/>
              <rect x="57" y="37" width="4" height="5" rx="2"/>
              <path d="M34 22 L30 32 H34 L31 41 L38 31 H34 L36 22Z" style="fill:#fde68a"/>
            </svg>
          </span>
          <span class="quick-pill-label">Book Car</span>
        </button>

        <button class="quick-pill" type="button" @click="goRewards">
          <span class="quick-pill-icon subs-pill" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="pill-svg" aria-hidden="true">
              <path d="M8 44 L8 28 L20 38 L32 14 L44 38 L56 28 L56 44Z"/>
              <rect x="8" y="44" width="48" height="9" rx="4"/>
              <circle cx="20" cy="48" r="3" fill-opacity="0.4"/>
              <circle cx="32" cy="48" r="3" fill-opacity="0.4"/>
              <circle cx="44" cy="48" r="3" fill-opacity="0.4"/>
            </svg>
          </span>
          <span class="quick-pill-label">Members</span>
        </button>

        <button class="quick-pill" type="button">
          <span class="quick-pill-icon rewards-pill" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="pill-svg" aria-hidden="true">
              <polygon points="32,8 38,24 56,24 42,36 48,52 32,42 16,52 22,36 8,24 26,24"/>
            </svg>
          </span>
          <span class="quick-pill-label">Rewards</span>
        </button>

        <button class="quick-pill" type="button">
          <span class="quick-pill-icon saved-pill" aria-hidden="true">
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
        <div class="eco-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" aria-hidden="true"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 12c-2-3-1-7 3-8-1 4 2 6 2 8a5 5 0 01-10 0c0-1 .5-2 1-3 1 2 3 2 4 3z"/></svg>
          <div>
            <div class="eco-val">24.3 kg</div>
            <div class="eco-label">CO₂ Saved</div>
          </div>
        </div>
        <div class="eco-divider"></div>
        <div class="eco-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00c4bc" stroke-width="2" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z" fill="#00c4bc"/></svg>
          <div>
            <div class="eco-val">8 rides</div>
            <div class="eco-label">This month</div>
          </div>
        </div>
        <div class="eco-divider"></div>
        <div class="eco-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          <div>
            <div class="eco-val">15 pts</div>
            <div class="eco-label">Green Points</div>
          </div>
        </div>
      </div>

      <!-- Promos -->
      <section>
        <div class="section-row">
          <span class="section-title">Promotions</span>
          <button class="see-all" type="button">See all</button>
        </div>
        <div class="promo-scroll">
          <article class="promo-card promo-eco">
            <div class="promo-kicker">🌱 ECO RIDE</div>
            <h3 class="promo-heading">Zero Emissions,<br>Zero Guilt</h3>
            <p class="promo-sub">100% electric. No fumes, no noise.</p>
            <button class="promo-btn" type="button" @click="goDropoff">Book now</button>
            <div class="promo-orb promo-orb-1"></div>
            <div class="promo-orb promo-orb-2"></div>
          </article>
          <article class="promo-card promo-member">
            <div class="promo-kicker">👑 MEMBERSHIP</div>
            <h3 class="promo-heading">Unlock Member<br>Pricing</h3>
            <p class="promo-sub">Save up to 30% on every ride.</p>
            <button class="promo-btn promo-btn-gold" type="button" @click="goRewards">Learn more</button>
            <div class="promo-orb promo-orb-1"></div>
            <div class="promo-orb promo-orb-2"></div>
          </article>
          <article class="promo-card promo-driver">
            <div class="promo-kicker">🚗 DRIVE WITH US</div>
            <h3 class="promo-heading">Earn More,<br>Drive Clean</h3>
            <p class="promo-sub">Up to 90% commission, daily pay.</p>
            <button class="promo-btn promo-btn-dark" type="button">Apply now</button>
            <div class="promo-orb promo-orb-1"></div>
            <div class="promo-orb promo-orb-2"></div>
          </article>
        </div>
      </section>

      <!-- Featured -->
      <section>
        <div class="section-row">
          <span class="section-title">Featured</span>
          <button class="see-all" type="button">See all</button>
        </div>
        <div class="featured-grid">
          <article class="featured-card">
            <div class="featured-media feat-launch">
              <div class="feat-badge">New</div>
            </div>
            <div class="featured-title">E-Ride Taxi Launch</div>
          </article>
          <article class="featured-card">
            <div class="featured-media feat-drive">
              <div class="feat-badge">Hiring</div>
            </div>
            <div class="featured-title">Drive Your Own EV</div>
          </article>
          <article class="featured-card">
            <div class="featured-media feat-care"></div>
            <div class="featured-title">Eco Care Every Trip</div>
          </article>
          <article class="featured-card">
            <div class="featured-media feat-city"></div>
            <div class="featured-title">Explore the City Clean</div>
          </article>
        </div>
      </section>

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
  background: #f1f5f8;
  padding-bottom: 100px;
}

/* ══════════════════════════════
   HERO
══════════════════════════════ */
.hero {
  background: linear-gradient(160deg, #071524 0%, #0c2233 55%, #0d3344 100%);
  padding: 52px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 0 0 28px 28px;
}

/* Top bar */
.top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.greeting-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.greeting-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notif-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f5a623;
  border: 2px solid #0c2233;
}

.points-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(245,166,35,0.35);
  background: rgba(245,166,35,0.12);
  color: #fbbf24;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Search bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 0 14px;
  height: 52px;
  border-radius: 16px;
  border: 1.5px solid rgba(0,196,188,0.3);
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(8px);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}

.search-bar:active {
  background: rgba(255,255,255,0.11);
  border-color: rgba(0,196,188,0.6);
}

.search-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: #00c4bc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.search-placeholder {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
}

.schedule-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.schedule-btn:active { background: rgba(255,255,255,0.18); }

/* Quick action pills */
.quick-row {
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
}

.quick-pill-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-svg {
  width: 30px;
  height: 30px;
  fill: #fff;
}

.car-pill    { background: linear-gradient(145deg, #00c4bc, #00908a); box-shadow: 0 6px 16px rgba(0,196,188,0.35); }
.subs-pill   { background: linear-gradient(145deg, #f5a623, #d4820a); box-shadow: 0 6px 16px rgba(245,166,35,0.35); }
.rewards-pill{ background: linear-gradient(145deg, #8b5cf6, #6d28d9); box-shadow: 0 6px 16px rgba(139,92,246,0.35); }
.saved-pill  { background: linear-gradient(145deg, #3b82f6, #1d4ed8); box-shadow: 0 6px 16px rgba(59,130,246,0.35); }

.quick-pill-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
}

/* ══════════════════════════════
   BODY
══════════════════════════════ */
.body {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Eco stats */
.eco-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 14px 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.eco-stat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.eco-val {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  line-height: 1.1;
}

.eco-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  margin-top: 1px;
}

.eco-divider {
  width: 1px;
  height: 28px;
  background: #e5e7eb;
  flex-shrink: 0;
}

/* Section header */
.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.see-all {
  font-size: 13px;
  font-weight: 600;
  color: #00c4bc;
  border: none;
  background: transparent;
  cursor: pointer;
}

/* Promo cards */
.promo-scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 78%;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 4px;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.promo-scroll::-webkit-scrollbar { display: none; }

.promo-card {
  scroll-snap-align: start;
  border-radius: 20px;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  min-height: 150px;
}

.promo-eco    { background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%); }
.promo-member { background: linear-gradient(135deg, #1c1405 0%, #3b1c00 40%, #78350f 100%); }
.promo-driver { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); }

.promo-kicker {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.promo-heading {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}

.promo-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.55);
  margin: 0 0 10px;
  line-height: 1.4;
}

.promo-btn {
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 700;
  background: #00c4bc;
  color: #fff;
  cursor: pointer;
  z-index: 1;
}

.promo-btn-gold { background: #f5a623; color: #1c1405; }
.promo-btn-dark { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25); }

/* Decorative orbs */
.promo-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.promo-orb-1 {
  width: 120px; height: 120px;
  right: -30px; bottom: -30px;
  background: rgba(255,255,255,0.06);
}
.promo-orb-2 {
  width: 70px; height: 70px;
  right: 40px; top: -20px;
  background: rgba(255,255,255,0.04);
}

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
}

.featured-media {
  height: 110px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}

.feat-launch { background: linear-gradient(135deg, #00c4bc 0%, #4ade80 100%); }
.feat-drive  { background: linear-gradient(135deg, #0c1a2e 0%, #1d4ed8 100%); }
.feat-care   { background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%); }
.feat-city   { background: linear-gradient(135deg, #f5a623 0%, #ef4444 100%); }

.featured-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(255,255,255,0.2) 0%, transparent 60%);
}

.feat-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  z-index: 1;
}

.featured-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  line-height: 1.3;
}
</style>
