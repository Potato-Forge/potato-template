import type { RouteRecordRaw } from 'vue-router'

const manageRoutes: RouteRecordRaw[] = [
  {
    path: 'manage',
    name: 'manage',
    meta: {
      title: '管理中心',
      icon: 'tabler:settings',
    },
    children: [
      {
        path: 'permission',
        name: 'permissionManage',
        meta: {
          title: '权限管理',
          icon: 'tabler:shield',
        },
        component: () => import('@/views/permission/PermissionSettings.vue'),
      },
      {
        path: 'user',
        name: 'userManage',
        meta: {
          title: '用户管理',
          icon: 'tabler:user',
        },
        component: () => import('@/views/user/UserManage.vue'),
      },
      {
        path: 'roles',
        name: 'roleManage',
        meta: {
          title: '角色管理',
          icon: 'tabler:shield-check',
        },
        component: () => import('@/views/roles/RoleSettings.vue'),
      },
    ],
  },
]

export default manageRoutes
