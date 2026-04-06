<template>
  <div class="app-screen">
    <AppHeader>
      <template #title>Notifications</template>
      <template #subtitle>Trip updates and promos</template>
    </AppHeader>
    <div v-if="loading" class="card">
      <div class="section-title">Loading notifications...</div>
      <p class="text-secondary">Checking updates</p>
    </div>
    <div v-else v-for="note in notes" :key="note.id" class="card">
      <div class="section-title">{{ note.title }}</div>
      <p class="text-secondary">{{ note.body }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../../components/AppHeader.vue'
import { onMounted, ref } from 'vue'

const loading = ref(true)
const notes = ref<Array<{ id: string; title: string; body: string }>>([])

onMounted(() => {
  setTimeout(() => {
    notes.value = [
      { id: 'n1', title: 'Driver assigned', body: 'Juan D. is 3 minutes away.' },
      { id: 'n2', title: 'Promo unlocked', body: 'Use GREEN50 on your next ride.' }
    ]
    loading.value = false
  }, 350)
})
</script>
