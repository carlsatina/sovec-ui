<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Reset password</template>
      <template #subtitle>We'll send a reset link or OTP</template>
    </AppHeader>
    <input class="input" placeholder="Mobile or email" />
    <button class="button button-primary">Send reset</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
</script>
