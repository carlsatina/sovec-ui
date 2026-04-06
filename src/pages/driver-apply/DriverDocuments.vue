<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Upload documents</template>
      <template #subtitle>Step 2 of 4 · Verification</template>
    </AppHeader>
    <ProgressStepper :steps="steps" :current="2" />
    <div class="card upload">
      <div>
        <div class="section-title">Driver's license</div>
        <p class="text-secondary">Front and back, clear image</p>
      </div>
      <button class="button button-secondary" @click="upload('LICENSE')">Upload</button>
    </div>
    <div class="card upload">
      <div>
        <div class="section-title">NBI clearance</div>
        <p class="text-secondary">Valid within 6 months</p>
      </div>
      <button class="button button-secondary" @click="upload('NBI_CLEARANCE')">Upload</button>
    </div>
    <div class="card upload">
      <div>
        <div class="section-title">Government ID</div>
        <p class="text-secondary">UMID, Passport, or PhilSys</p>
      </div>
      <button class="button button-secondary" @click="upload('GOV_ID')">Upload</button>
    </div>
    <button class="button button-primary" :disabled="driverApp.loading" @click="next">Next</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import ProgressStepper from '../../components/ProgressStepper.vue'
import { useRouter } from 'vue-router'
import { useDriverApplicationStore } from '../../store/driverApplication'

const steps = ['Info', 'Docs', 'Schedule', 'Review']
const router = useRouter()
const driverApp = useDriverApplicationStore()

async function upload(type: string) {
  await driverApp.uploadDocument(type, 'https://example.com/doc.jpg')
}

function next() {
  router.push('/driver/availability')
}
</script>

<style scoped>
.upload {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
</style>
