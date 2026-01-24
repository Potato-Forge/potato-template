import type { RouteRecordRaw } from 'vue-router'
import Login from '@/views/login/Login.vue'

const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: Login,
  },
]

export default commonRoutes
