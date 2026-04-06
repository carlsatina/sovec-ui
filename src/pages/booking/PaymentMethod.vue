<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Payment method</template>
      <template #subtitle>Choose how you want to pay</template>
    </AppHeader>
    <div class="card" :class="{ selected: booking.paymentMethod === 'CASH' }" @click="booking.setPaymentMethod('CASH')">
      <div class="section-title">Cash</div>
      <p class="text-secondary">Pay directly to driver</p>
    </div>
    <div class="card" :class="{ selected: booking.paymentMethod === 'EWALLET' }" @click="booking.setPaymentMethod('EWALLET')">
      <div class="section-title">E-wallet</div>
      <p class="text-secondary">GCash or Maya</p>
    </div>
    <div class="card" :class="{ selected: booking.paymentMethod === 'CARD' }" @click="booking.setPaymentMethod('CARD')">
      <div class="section-title">Card</div>
      <p class="text-secondary">Visa / Mastercard</p>
    </div>
    <button class="button button-primary" @click="goConfirm">Continue</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../store/booking'

const router = useRouter()
const booking = useBookingStore()

function goConfirm() {
  router.push('/booking/confirm')
}
</script>

<style scoped>
.selected {
  outline: 2px solid var(--color-primary);
}
</style>
