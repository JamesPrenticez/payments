<script setup lang="ts" vapor>
import { ref, onMounted } from 'vue'

interface Forecast {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string | null
}

const forecasts = ref<Forecast[]>([])
const error = ref('')

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3001/weatherforecast')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    forecasts.value = await res.json()
  } catch (e) {
    error.value = (e as Error).message
  }
})
</script>

<template>
  <p v-if="error">Failed to load: {{ error }}</p>
  <ul v-else>
    <li v-for="f in forecasts" :key="f.date">
      {{ f.date }}: {{ f.temperatureC }}°C / {{ f.temperatureF }}°F — {{ f.summary }}
    </li>
  </ul>
</template>
