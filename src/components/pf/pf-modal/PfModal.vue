<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    description?: string
    positiveText?: string
    negativeText?: string
    positiveLoading?: boolean
  }>(),
  {
    title: '',
    description: '',
    positiveText: '确认',
    negativeText: '取消',
    positiveLoading: false,
  },
)

const emits = defineEmits<{
  (event: 'positive-click'): void
  (event: 'negative-click'): void
  (event: 'update:open', value: boolean): void
}>()

const slots = useSlots()

const hasTriggerSlot = computed(() => Boolean(slots.trigger))
const hasDescription = computed(() => Boolean(slots.description) || Boolean(props.description))

const handlePositiveClick = () => {
  emits('positive-click')
}

const handleNegativeClick = () => {
  emits('negative-click')
}

const modalOpen = computed({
  get() {
    return props.open || false
  },
  set(v) {
    emits('update:open', v)
  },
})
</script>

<template>
  <Dialog v-model:open="modalOpen" class="text-foreground">
    <DialogTrigger v-if="hasTriggerSlot" as-child>
      <slot name="trigger"></slot>
    </DialogTrigger>

    <DialogContent :aria-describedby="hasDescription ? undefined : 'undefined'">
      <DialogHeader>
        <DialogTitle>
          <slot name="title">
            <pf-text class="text-foreground">{{ props.title }}</pf-text>
          </slot>
        </DialogTitle>
        <DialogDescription v-if="hasDescription">
          <slot name="description"
            ><pf-text class="text-foreground">{{ props.description }}</pf-text></slot
          >
        </DialogDescription>
      </DialogHeader>

      <slot></slot>

      <DialogFooter>
        <slot name="footer">
          <pf-button variant="outline" @click="handleNegativeClick">{{
            props.negativeText
          }}</pf-button>
          <pf-button :disabled="props.positiveLoading" @click="handlePositiveClick">{{
            props.positiveLoading ? '处理中...' : props.positiveText
          }}</pf-button>
        </slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
