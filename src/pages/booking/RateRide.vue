<template>
  <div class="rate-screen">

    <!-- Hero -->
    <div class="hero">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>

      <div class="driver-avatar" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="hero-title">Rate your ride</div>
      <div class="hero-sub">How was your experience with your E-Ride driver?</div>

      <!-- Star selector -->
      <div class="stars-row" role="group" aria-label="Star rating">
        <button
          v-for="n in 5"
          :key="n"
          class="star-btn"
          :class="{ filled: n <= hovered || (hovered === 0 && n <= rating) }"
          type="button"
          :aria-label="`${n} star${n > 1 ? 's' : ''}`"
          @mouseenter="hovered = n"
          @mouseleave="hovered = 0"
          @click="rating = n"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
        </button>
      </div>

      <div class="rating-label">{{ ratingLabel }}</div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Quick tags -->
      <div class="section-title">What went well?</div>
      <div class="tags-row">
        <button
          v-for="tag in tags"
          :key="tag"
          class="tag-btn"
          :class="{ active: selectedTags.includes(tag) }"
          type="button"
          @click="toggleTag(tag)"
        >{{ tag }}</button>
      </div>

      <!-- Comment -->
      <div class="section-title">Add a comment <span class="optional">(optional)</span></div>
      <textarea
        v-model="comment"
        class="comment-box"
        placeholder="Tell us more about your trip…"
        rows="3"
        maxlength="300"
      ></textarea>

      <!-- Submit -->
      <button
        class="submit-btn"
        type="button"
        :disabled="rating === 0 || submitting || !booking.rideId || !auth.user"
        @click="submitRating"
      >
        <svg v-if="submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0110 10"/></svg>
        {{ submitting ? 'Submitting…' : 'Submit rating' }}
        <svg v-if="!submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
      </button>

      <button class="skip-btn" type="button" @click="goHome">Skip for now</button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../store/booking'
import { useAuthStore } from '../../store/auth'
import { api } from '../../services/api'

const router = useRouter()
const booking = useBookingStore()
const auth = useAuthStore()

const rating = ref(0)
const hovered = ref(0)
const comment = ref('')
const submitting = ref(false)
const selectedTags = ref<string[]>([])

const tags = ['Clean vehicle', 'Smooth ride', 'Friendly driver', 'On time', 'Safe driving', 'EV experience']

const ratingLabel = computed(() => {
  const active = hovered.value || rating.value
  if (active === 0) return 'Tap to rate'
  if (active === 1) return 'Poor'
  if (active === 2) return 'Fair'
  if (active === 3) return 'Good'
  if (active === 4) return 'Great'
  return 'Excellent!'
})

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

async function submitRating() {
  if (!booking.rideId || !auth.user) return
  submitting.value = true
  try {
    await api.submitRideRating(booking.rideId, {
      riderId: auth.user.id,
      rating: rating.value,
      comment: comment.value.trim() || undefined,
      tags: selectedTags.value
    })
    goHome()
  } finally {
    submitting.value = false
  }
}

function goHome() {
  booking.resetBooking()
  router.replace('/home')
}
</script>

<style scoped>
.rate-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f8;
}

/* Hero */
.hero {
  background: linear-gradient(160deg, #071524 0%, #0c2233 55%, #0d3344 100%);
  padding: 52px 20px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 52px;
  left: 20px;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.driver-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0,196,188,0.15);
  border: 2px solid rgba(0,196,188,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.hero-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.hero-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  text-align: center;
  line-height: 1.5;
  max-width: 260px;
}

/* Stars */
.stars-row {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.star-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(255,255,255,0.2);
  transition: color 0.1s, transform 0.1s;
  line-height: 0;
}

.star-btn.filled { color: #f5a623; }
.star-btn:active { transform: scale(0.9); }

.rating-label {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  min-height: 20px;
  letter-spacing: 0.01em;
}

/* Body */
.body {
  padding: 20px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  letter-spacing: -0.01em;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
}

/* Tags */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.tag-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.tag-btn.active {
  background: rgba(0,196,188,0.1);
  border-color: #00c4bc;
  color: #007d78;
}

/* Comment */
.comment-box {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  font-size: 14px;
  color: #111827;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
  transition: border-color 0.15s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.comment-box:focus {
  outline: none;
  border-color: #00c4bc;
}

/* Submit */
.submit-btn {
  height: 54px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(145deg, #00c4bc, #00908a);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,196,188,0.35);
  transition: opacity 0.15s, transform 0.12s;
  margin-top: 4px;
}

.submit-btn:active  { opacity: 0.9; transform: scale(0.98); }
.submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

.skip-btn {
  height: 46px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
