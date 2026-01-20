export interface SidebarItem {
  title: string
  url?: string
  icon?: string
  isActive?: boolean
  items?: SidebarItem[]
}

export { default as PfSidebar } from './PfSidebar.vue'
export { default as PfSidebarProvider } from './PfSidebarProvider.vue'
