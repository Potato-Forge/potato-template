<script setup lang="ts">
  import type { usePermissionManager } from '../usePermissionManager'

  const manager = inject('permissionManager')
  const { choosenId, choosenPath, choosenPermission } = manager as ReturnType<
    typeof usePermissionManager
  >

  // form mode
  const formMode = computed(() => {
    if (!choosenId.value) {
      return 'empty'
    }

    return 'edit'
  })
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <!-- Empty State -->
    <pf-empty
      v-if="formMode === 'empty'"
      class="flex-1"
      title="权限编辑"
      description="请在左侧选择或新建开始编辑"
    ></pf-empty>

    <!-- Edit Form -->
    <div v-else class="flex-1 flex flex-col gap-4">
      <!-- Form header -->
      <pf-card class="p-4 flex">
        <div class="flex items-center justify-between">
          <!-- title -->
          <div class="flex flex-col gap-2">
            <!-- permission breadcrumb -->
            <pf-breadcrumb :list="choosenPath" labelKey="name"></pf-breadcrumb>
            <!-- permission name -->
            <pf-text as="h2" size="2xl" weight="bold"
              >{{ formMode === 'edit' ? '编辑' : '新建'
              }}{{ choosenPath[choosenPath.length - 1]?.name || '权限详情' }}</pf-text
            >
          </div>

          <!-- actions -->
          <div class="flex items-center gap-2">
            <pf-button variant="ghost">取消</pf-button>
            <pf-button type="primary">保存</pf-button>
          </div>
        </div>
      </pf-card>

      <!-- Form Content -->
      <pf-card class="p-4 flex-1">
        <pf-form></pf-form>
      </pf-card>
    </div>
  </div>
</template>

<style scoped></style>
