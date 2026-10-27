<script setup lang="ts" vapor>
import TheWelcome from '../components/TheWelcome.vue'
import { useModalStore } from '../stores/modal'

const modal = useModalStore()
</script>

<template>
  <main>
    <button @click="modal.open">Open modal</button>
    <TheWelcome />
  </main>
</template>
