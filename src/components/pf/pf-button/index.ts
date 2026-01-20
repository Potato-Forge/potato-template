import type { ExtractPublicPropTypes } from 'vue'
import type { Props as ButtonProps } from '@/components/ui/button/Button.vue'

export { default as PfButton } from './PfButton.vue'

export interface PfButtonProps extends ExtractPublicPropTypes<ButtonProps> {}
