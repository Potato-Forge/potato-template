import type { RouteRecordRaw } from 'vue-router'
import systemRoutes from './systemRoutes'

export const staticAppRoutes: RouteRecordRaw[] = [...systemRoutes]

export const combineAppRoutes = (dynamicRoutes: RouteRecordRaw[]): RouteRecordRaw[] => {
  return [...dynamicRoutes, ...staticAppRoutes]
}