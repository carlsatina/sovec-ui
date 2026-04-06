<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Application</template>
      <template #subtitle>Step 1 of 4 · Personal info</template>
    </AppHeader>
    <ProgressStepper :steps="steps" :current="1" />
    <input v-model="fullName" class="input" placeholder="Full name" />
    <input v-model="phone" class="input" placeholder="+63 Mobile number" />
    <input v-model="email" class="input" placeholder="Email (optional)" />
    <input v-model="address" class="input" placeholder="Home address" />
    <button class="button button-primary" :disabled="driverApp.loading" @click="next">Next</button>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import ProgressStepper from '../../components/ProgressStepper.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverApplicationStore } from '../../store/driverApplication'

const steps = ['Info', 'Docs', 'Schedule', 'Review']
const router = useRouter()
const driverApp = useDriverApplicationStore()

const fullName = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')

async function next() {
  await driverApp.update({
    fullName: fullName.value,
    phone: phone.value,
    email: email.value,
    address: address.value
  })
  router.push('/driver/documents')
}
</script>
