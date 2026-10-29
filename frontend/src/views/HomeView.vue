<script setup lang="ts" vapor>
import EndPoints from '@/components/Endpoints.vue';
import { useModalStore } from '../stores/modal'

const modal = useModalStore()
</script>

<template>
  <main>
    <button @click="modal.open">Open modal</button>
    <EndPoints />
  </main>
</template>
