import type { App } from 'vue'
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
import './style/themes.css'

export const pfTooltipPlugin = (app: App) => {
  app.use(VueTippy, {
    directive: 'pf-tooltip', // => v-tippy
    component: 'pf-tooltip', // => <tippy/>
    componentSingleton: 'pf-tooltip-singleton', // => <tippy-singleton/>,
    defaultProps: {
      placement: 'top',
      theme: 'pf-tooltip',
      animation: 'shift-away',
      touch: ['hold', 500],
    },
  })
}
