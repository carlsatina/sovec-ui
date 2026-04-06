<template>
  <div class="app-shell" :class="{ 'no-tabs': isDriver }">
    <router-view />
    <BottomTabBar v-if="showTabs" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomTabBar from '../components/BottomTabBar.vue'

const route = useRoute()
const isDriver = localStorage.getItem('solvec_dev_role') === 'DRIVER'
const showTabs = computed(() => route.meta.showTabs !== false && !isDriver)
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding-bottom: 72px;
}
.app-shell.no-tabs {
  padding-bottom: 0;
}
</style>
