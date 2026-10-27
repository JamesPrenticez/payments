<script setup lang="ts" vapor>
import { useModalStore } from '../stores/modal'

const modal = useModalStore()
</script>

<template>
  <div v-if="modal.isOpen" class="backdrop" @click.self="modal.close">
    <div class="dialog" role="dialog" aria-modal="true">
      <p>Opened from HomeView, rendered from App. Both read the same store.</p>
      <button @click="modal.close">Close</button>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 0.5);
}

.dialog {
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
}
</style>
