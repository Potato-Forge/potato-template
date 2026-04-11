<script setup lang="ts">
import PfModal from './PfModal.vue'
import {
  runModalNegative,
  runModalPositive,
  setModalOpen,
  resolveModal,
  useModalState,
} from './modal.store'

const modalState = useModalState()

const handleOpenChange = (id: number, open: boolean) => {
  if (open) {
    setModalOpen(id, true)
    return
  }
  resolveModal(id, false)
}
</script>

<template>
  <Teleport to="body">
    <template v-for="modal in modalState.modals" :key="modal.id">
      <PfModal
        :open="modal.open"
        :title="modal.title"
        :description="modal.description"
        :positive-text="modal.positiveText"
        :negative-text="modal.negativeText"
        :positive-loading="modal.positiveLoading"
        @update:open="(value) => handleOpenChange(modal.id, value)"
        @positive-click="runModalPositive(modal.id)"
        @negative-click="runModalNegative(modal.id)"
      />
    </template>
  </Teleport>
</template>
