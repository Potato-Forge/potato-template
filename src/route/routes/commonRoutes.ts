import type { RouteRecordRaw } from 'vue-router'
import Login from '@/views/Login/Login.vue'
import NotFound from '@/views/404/NotFound.vue'
import Forbidden from '@/views/403/Forbidden.vue'
import Redirect from '@/views/Redirect/Redirect.vue'
import GlobalLayout from '@/layouts/global-layout/GlobalLayout.vue'

const legacyManageRedirects: RouteRecordRaw[] = [
  {
    path: '/admin/permission',
    redirect: '/manage/access/permission',
  },
  {
    path: '/admin/roles',
    redirect: '/manage/access/roles',
  },
  {
    path: '/admin/user',
    redirect: '/manage/access/user',
  },
  {
    path: '/manage/permission',
    redirect: '/manage/access/permission',
  },
  {
    path: '/manage/roles',
    redirect: '/manage/access/roles',
  },
  {
    path: '/manage/user',
    redirect: '/manage/access/user',
  },
]

const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/redirect',
    component: Redirect,
  },
  ...legacyManageRedirects,
  // 403 无权限页面
  {
    path: '/403',
    component: GlobalLayout,
    children: [
      {
        path: '',
        component: Forbidden,
      },
    ],
  },
  // 404 页面放在 layout 里
  {
    path: '/:pathMatch(.*)*',
    component: GlobalLayout,
    children: [
      {
        path: '',
        component: NotFound,
      },
    ],
  },
]

export default commonRoutes
