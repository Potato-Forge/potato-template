import { markRaw, type Component } from 'vue'
import type { DocApiRow } from '@/components/common/docs/DocApiTable.vue'
import PfButtonDocDemo from './demos/PfButtonDocDemo.vue'
import PfFormDocDemo from './demos/PfFormDocDemo.vue'
import PfDataTableDocDemo from './demos/PfDataTableDocDemo.vue'
import PfModalDocDemo from './demos/PfModalDocDemo.vue'
import PfUploadDocDemo from './demos/PfUploadDocDemo.vue'
import PfTreeDocDemo from './demos/PfTreeDocDemo.vue'
import PfCardDocDemo from './demos/PfCardDocDemo.vue'
import PfTextDocDemo from './demos/PfTextDocDemo.vue'
import PfSwitchDocDemo from './demos/PfSwitchDocDemo.vue'
import PfCheckboxDocDemo from './demos/PfCheckboxDocDemo.vue'

export type ComponentDocCategory = 'form' | 'feedback' | 'display' | 'data'

export type ComponentDocExample = {
  id: string
  title: string
  description: string
  tip: string
  language: string
  code: string
  demo: Component
  defaultOpen?: boolean
}

export type ComponentDocItem = {
  key: string
  title: string
  componentName: string
  category: ComponentDocCategory
  path: string
  icon: string
  subtitle: string
  summary: string
  whenToUse: string[]
  constraints: string[]
  api: {
    props?: DocApiRow[]
    slots?: DocApiRow[]
    emits?: DocApiRow[]
    expose?: DocApiRow[]
  }
  examples: ComponentDocExample[]
}

export const componentDocCategories: Array<{
  key: ComponentDocCategory
  title: string
  description: string
}> = [
  {
    key: 'form',
    title: '表单录入',
    description: '适合承载输入、切换和提交动作，重点关注字段边界与交互反馈。',
  },
  {
    key: 'feedback',
    title: '反馈与浮层',
    description: '适合承载上传、弹窗等短时反馈流程，说明文案必须写清影响范围。',
  },
  {
    key: 'display',
    title: '展示与排版',
    description: '适合承载文本、容器和视觉层级，重点在信息组织而不是交互复杂度。',
  },
  {
    key: 'data',
    title: '数据与结构',
    description: '适合承载表格和树形层级，优先说明结构约束和可操作范围。',
  },
]

const docs: ComponentDocItem[] = [
  {
    key: 'pf-button',
    title: 'PfButton',
    componentName: 'PfButton',
    category: 'form',
    path: '/help/components/pf-button',
    icon: 'i-tabler-pointer',
    subtitle: '按钮用于承载单个清晰动作，variant 决定视觉层级，type 决定语义色。',
    summary: '优先只保留一个主按钮，其余动作降级为 outline、secondary 或 ghost。',
    whenToUse: [
      '页面主动作需要明确引导时使用 default 主按钮。',
      '工具栏或表格行内动作需要减弱视觉重量时使用 outline 或 ghost。',
    ],
    constraints: [
      '不要在同一区域放多个等权重主按钮。',
      'warning、error 这类语义色只服务风险动作，不用于普通强调。',
    ],
    api: {
      props: [
        { name: 'variant', type: "'default' | 'outline' | 'secondary' | 'ghost' | 'link'", default: 'default', description: '控制按钮的视觉层级。' },
        { name: 'type', type: "'primary' | 'success' | 'info' | 'warning' | 'error' | 'button' | 'submit' | 'reset'", default: 'primary', description: '语义色或原生按钮类型。' },
        { name: 'size', type: "'default' | 'sm' | 'lg' | 'icon'", default: 'default', description: '控制按钮尺寸。' },
        { name: 'icon', type: 'string', default: '-', description: '传入 UnoCSS / Iconify 类名，用于前置图标。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '禁用后不可触发交互。' },
      ],
      slots: [
        { name: 'default', type: 'VNode', description: '按钮文案或内容。' },
        { name: 'prefix', type: 'VNode', description: '自定义前置图标区域。' },
        { name: 'suffix', type: 'VNode', description: '自定义尾部扩展内容。' },
      ],
    },
    examples: [
      {
        id: 'button-basic',
        title: '常见层级组合',
        description: '同一操作区同时放主动作、退路动作和带图标动作时，优先先拉开视觉层级。',
        tip: '如果按钮文案不能单独解释动作结果，就需要在附近补一段帮助文案，而不是继续堆颜色。',
        language: 'vue',
        code: `<template>\n  <div class="flex flex-wrap items-center gap-3">\n    <PfButton>保存设置</PfButton>\n    <PfButton variant="outline">取消修改</PfButton>\n    <PfButton variant="secondary">批量导出</PfButton>\n    <PfButton icon="i-tabler-plus">新增成员</PfButton>\n  </div>\n</template>`,
        demo: markRaw(PfButtonDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-form',
    title: 'PfForm',
    componentName: 'PfForm',
    category: 'form',
    path: '/help/components/pf-form',
    icon: 'i-tabler-forms',
    subtitle: 'PfForm 通过配置项渲染字段，适合管理后台里规则明确、布局稳定的录入场景。',
    summary: '先把字段约束放进 formConfig 和 formRules，再决定布局列数和帮助文案。',
    whenToUse: [
      '后台表单字段固定、需要统一校验和帮助文案时使用。',
      '新增/编辑共用一套字段配置时使用 formMode 控制可见范围。',
    ],
    constraints: [
      '不要把复杂的跨字段流程说明塞进单个字段 help。',
      '如果字段是否可见依赖其他值，必须配 visibleIf，而不是只在 UI 上隐藏。',
    ],
    api: {
      props: [
        { name: 'formConfig', type: 'PfFormConfigItem[]', required: true, description: '字段配置数组，是表单渲染的核心输入。' },
        { name: 'formData', type: 'Record<string, any> | null', default: '{}', description: '表单初始值。' },
        { name: 'formMode', type: "'create' | 'edit'", default: '-', description: '按 create / edit 条件筛选字段。' },
        { name: 'columnsPerRow', type: 'number', default: '1', description: '控制每行展示的字段数量。' },
        { name: 'formRules', type: 'PfFormRules<Record<string, any>>', default: '-', description: '表单级校验规则，支持 schema、onBlur、onSubmit。' },
        { name: 'onSubmit', type: '(data) => Promise<void> | void', default: '-', description: '提交时触发的业务处理。' },
        { name: 'onChange', type: '(data) => void', default: '-', description: '表单值变化时的回调。' },
      ],
    },
    examples: [
      {
        id: 'form-config',
        title: '基础配置表单',
        description: '通过 formConfig 组合文本、开关和选项字段，展示字段说明、默认值和列布局。',
        tip: '字段 help 要说明“什么时候填、为什么填、受什么限制”，不能只重复标签。',
        language: 'vue',
        code: `<script setup lang="ts">\nconst formValue = ref({\n  name: '产品后台',\n  enabled: true,\n  level: 'standard',\n})\n\nconst formConfig = [\n  { key: 'name', name: '名称', type: 'text', rules: { required: '请填写名称' } },\n  { key: 'enabled', name: '启用状态', type: 'toggle' },\n  {\n    key: 'level',\n    name: '权限等级',\n    type: 'options',\n    config: {\n      options: [\n        { label: '标准权限', value: 'standard' },\n        { label: '高级权限', value: 'advanced' },\n      ],\n    },\n  },\n]\n</script>\n\n<template>\n  <PfForm :form-config="formConfig" :form-data="formValue" :columns-per-row="2" />\n</template>`,
        demo: markRaw(PfFormDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-data-table',
    title: 'PfDataTable',
    componentName: 'PfDataTable',
    category: 'data',
    path: '/help/components/pf-data-table',
    icon: 'i-tabler-table',
    subtitle: 'PfDataTable 把查询、表格、详情和编辑容器放到同一套配置里，适合标准后台 CRUD。',
    summary: '先定义 columns，再决定查询项、详情、编辑和远程数据行为。',
    whenToUse: [
      '列表、详情、增改删流程都比较标准时使用。',
      '需要把查询表单和数据表格绑定到同一字段配置时使用。',
    ],
    constraints: [
      '查询字段默认不应该沿用必填校验，否则会把搜索表单做成录入表单。',
      '复杂的自定义展示尽量通过 render 或 detail.render 局部扩展，不要直接绕开整套配置。',
    ],
    api: {
      props: [
        { name: 'columns', type: 'PfDataTableItem[]', required: true, description: '表格、查询和详情的统一字段配置。' },
        { name: 'rowKey', type: 'string', default: 'id', description: '每行数据的唯一键字段。' },
        { name: 'containerMode', type: "'drawer' | 'modal'", default: 'drawer', description: '详情/表单容器的展示方式。' },
        { name: 'defaultQuery', type: 'Record<string, any>', default: '{}', description: '查询表单初始值。' },
        { name: 'tableData', type: 'Record<string, any>[]', default: '[]', description: '本地数据模式下的表格数据。' },
        { name: 'listQuery', type: '(query) => Promise<Record<string, any>[]>', default: '-', description: '远程查询函数。' },
        { name: 'detail / create / update / delete', type: 'Function', default: '-', description: '详情、创建、更新、删除的业务回调。' },
      ],
    },
    examples: [
      {
        id: 'data-table-basic',
        title: '静态列表展示',
        description: '先用最小 columns + tableData 验证字段展示，再逐步接远程查询和编辑流程。',
        tip: '首屏先确认列定义、宽度和文案是否合理，再继续扩展查询、详情和弹层，不要一开始就塞全功能。',
        language: 'vue',
        code: `<script setup lang="ts">\nconst rows = [\n  { id: 1, name: '系统公告', owner: '平台运营', status: '已发布' },\n  { id: 2, name: '角色同步', owner: '系统管理', status: '草稿' },\n]\n\nconst columns = [\n  { key: 'name', name: '名称', type: 'text', table: { show: true } },\n  { key: 'owner', name: '负责人', type: 'text', table: { show: true } },\n  { key: 'status', name: '状态', type: 'text', table: { show: true } },\n]\n</script>\n\n<template>\n  <PfDataTable :columns="columns" :table-data="rows" :hide-create="true" :hide-delete="true" />\n</template>`,
        demo: markRaw(PfDataTableDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-modal',
    title: 'PfModal',
    componentName: 'PfModal',
    category: 'feedback',
    path: '/help/components/pf-modal',
    icon: 'i-tabler-window-maximize',
    subtitle: 'PfModal 适合承载需要用户确认或补充信息的短流程，不适合大段说明文档。',
    summary: 'title 负责结论，description 负责影响范围和操作后果。',
    whenToUse: [
      '删除、同步、发布等需要二次确认的操作。',
      '简短补录或确认型流程。',
    ],
    constraints: [
      '不要把长篇背景说明塞进 modal。',
      '如果操作会影响多条数据，description 必须写清范围。',
    ],
    api: {
      props: [
        { name: 'open', type: 'boolean', default: 'false', description: '通过 v-model:open 控制弹窗开关。' },
        { name: 'title', type: 'string', default: "''", description: '弹窗标题。' },
        { name: 'description', type: 'string', default: "''", description: '说明影响范围、风险和下一步。' },
        { name: 'positiveText / negativeText', type: 'string', default: '确认 / 取消', description: '底部操作按钮文案。' },
        { name: 'positiveLoading', type: 'boolean', default: 'false', description: '确认中时锁定正向按钮。' },
      ],
      slots: [
        { name: 'trigger', type: 'VNode', description: '自定义打开弹窗的触发器。' },
        { name: 'default', type: 'VNode', description: '弹窗主要内容区域。' },
        { name: 'footer', type: 'VNode', description: '自定义底部操作区。' },
      ],
      emits: [
        { name: 'update:open', type: '(value: boolean) => void', description: '弹窗开关变化。' },
        { name: 'positive-click', type: '() => void', description: '点击确认按钮时触发。' },
        { name: 'negative-click', type: '() => void', description: '点击取消按钮时触发。' },
      ],
    },
    examples: [
      {
        id: 'modal-basic',
        title: '确认型弹窗',
        description: '适合解释单个动作的影响范围，并在底部留出明确退路。',
        tip: '如果用户必须先理解后果才能继续，description 不要省略。',
        language: 'vue',
        code: `<script setup lang="ts">\nconst open = ref(false)\n</script>\n\n<template>\n  <PfModal\n    v-model:open="open"\n    title="确认同步权限"\n    description="提交后会重新计算当前角色的菜单可见范围。"\n  >\n    <template #trigger>\n      <PfButton>打开弹窗</PfButton>\n    </template>\n\n    <div class="text-sm text-muted-foreground">这里放需要用户确认的补充说明。</div>\n  </PfModal>\n</template>`,
        demo: markRaw(PfModalDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-upload',
    title: 'PfUpload',
    componentName: 'PfUpload',
    category: 'feedback',
    path: '/help/components/pf-upload',
    icon: 'i-tabler-upload',
    subtitle: 'PfUpload 用于文件采集和上传反馈，触发方式和列表方式应与业务场景一致。',
    summary: '先确定 trigger、accept 和数量上限，再决定是否接自定义 uploadHandler。',
    whenToUse: [
      '后台附件、图片、证据材料上传。',
      '需要向用户展示进度、失败原因和重试入口时。',
    ],
    constraints: [
      'accept 和 maxSize 必须写清，不要让用户试错。',
      '如果是图片场景，优先选择 gallery 或带预览的列表。',
    ],
    api: {
      props: [
        { name: 'modelValue', type: 'PfUploadFileItem[]', default: '[]', description: '当前文件列表。' },
        { name: 'trigger', type: "'button' | 'drag' | 'gallery'", default: 'button', description: '上传触发方式。' },
        { name: 'listType', type: "'list' | 'gallery'", default: 'list', description: '文件列表展示方式。' },
        { name: 'accept', type: 'string', default: "''", description: '限制文件类型。' },
        { name: 'multiple', type: 'boolean', default: 'true', description: '是否支持多选。' },
        { name: 'maxFiles / maxSize', type: 'number', default: '12 / 20971520', description: '限制文件数量和文件大小。' },
        { name: 'uploadHandler', type: 'PfUploadHandler', default: '-', description: '自定义上传实现。' },
      ],
      emits: [
        { name: 'update:modelValue', type: '(value: PfUploadFileItem[]) => void', description: '文件列表变化。' },
        { name: 'change', type: '(value: PfUploadFileItem[]) => void', description: '列表更新时触发。' },
        { name: 'remove', type: '(file: PfUploadFileItem) => void', description: '移除文件时触发。' },
        { name: 'error', type: '(payload) => void', description: '上传校验或上传过程出错时触发。' },
      ],
    },
    examples: [
      {
        id: 'upload-button',
        title: '按钮触发上传',
        description: '适合表单区或侧栏里空间有限、需要保持布局稳定的上传入口。',
        tip: '上传区附近要写清允许格式、数量和用途，避免用户点开后才发现限制。',
        language: 'vue',
        code: `<script setup lang="ts">\nimport type { PfUploadFileItem } from '@/components/pf/pf-upload'\n\nconst files = ref<PfUploadFileItem[]>([])\n</script>\n\n<template>\n  <PfUpload\n    v-model="files"\n    trigger="button"\n    list-type="list"\n    accept="image/*,.pdf"\n    :max-files="5"\n  />\n</template>`,
        demo: markRaw(PfUploadDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-tree',
    title: 'PfTree',
    componentName: 'PfTree',
    category: 'data',
    path: '/help/components/pf-tree',
    icon: 'i-tabler-hierarchy-2',
    subtitle: 'PfTree 适合承载层级关系、勾选范围和拖拽排序，重点在节点结构和可操作范围。',
    summary: '先定义 id / parent_id / children 等关键字段，再决定是否允许勾选或拖拽。',
    whenToUse: [
      '菜单树、部门树、分类树等有稳定父子关系的场景。',
      '需要在同一结构上提供勾选或排序能力时。',
    ],
    constraints: [
      '节点标识必须稳定，否则勾选和高亮状态会丢失。',
      '拖拽排序应只在用户能理解层级后果的场景开放。',
    ],
    api: {
      props: [
        { name: 'modelValue', type: 'PfTreeNode[]', required: true, description: '树节点数据。' },
        { name: 'labelKey / valueKey / childrenKey / disabledKey', type: 'string', default: 'name / id / children / disabled', description: '节点字段映射。' },
        { name: 'chooseable', type: 'boolean', default: 'true', description: '是否允许节点选中高亮。' },
        { name: 'checkable', type: 'boolean', default: 'true', description: '是否允许勾选。' },
        { name: 'draggable', type: 'boolean', default: 'false', description: '是否允许拖拽排序。' },
        { name: 'choosen', type: 'string | number | null', default: 'null', description: '当前选中的节点键值。' },
      ],
      emits: [
        { name: 'update:modelValue', type: '(value: PfTreeNode[]) => void', description: '树结构变化时触发。' },
        { name: 'update:choosen', type: '(value: string | number | null) => void', description: '当前选中节点变化。' },
      ],
      expose: [
        { name: 'getTreeData', type: '() => PfTreeNode[]', description: '获取当前树数据。' },
        { name: 'getCheckedKeys', type: '() => Array<string | number>', description: '获取当前勾选节点。' },
        { name: 'setCheckedByKeys', type: '(keys) => void', description: '按键值设置勾选状态。' },
      ],
    },
    examples: [
      {
        id: 'tree-basic',
        title: '菜单树展示',
        description: '通过最小节点结构演示选择和勾选能力，适合先验证层级展示再接业务数据。',
        tip: '树节点显示文案要优先保证辨识度，别把状态信息全塞进节点文本。',
        language: 'vue',
        code: `<script setup lang="ts">\nconst treeData = ref([\n  {\n    id: '1',\n    parent_id: null,\n    name: '系统帮助',\n    children: [\n      { id: '1-1', parent_id: '1', name: '设计规范' },\n      { id: '1-2', parent_id: '1', name: '组件文档' },\n    ],\n  },\n])\n\nconst choosen = ref('1-2')\n</script>\n\n<template>\n  <PfTree v-model="treeData" v-model:choosen="choosen" />\n</template>`,
        demo: markRaw(PfTreeDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-card',
    title: 'PfCard',
    componentName: 'PfCard',
    category: 'display',
    path: '/help/components/pf-card',
    icon: 'i-tabler-cards',
    subtitle: 'PfCard 负责内容承载和层级分隔，适合把相关信息收进同一视觉容器。',
    summary: 'header 放摘要，body 放主内容，footer 放行动，不要把三个区块混成一段。',
    whenToUse: [
      '模块摘要、面板、信息组合块。',
      '需要用边框和背景把内容块从页面流中分离出来时。',
    ],
    constraints: [
      '不要在 header 塞入大段正文。',
      '如果 footer 只有说明文案，优先把它并回正文，而不是硬留 footer。',
    ],
    api: {
      props: [
        { name: 'shadow', type: 'boolean', default: 'false', description: '是否添加阴影。' },
        { name: 'border', type: 'boolean', default: 'true', description: '是否展示边框。' },
        { name: 'class', type: 'HTMLAttributes["class"]', default: "''", description: '附加容器样式。' },
      ],
      slots: [
        { name: 'header', type: 'VNode', description: '头部区域。' },
        { name: 'header-action', type: 'VNode', description: '头部右侧操作区。' },
        { name: 'default', type: 'VNode', description: '卡片主体内容。' },
        { name: 'footer', type: 'VNode', description: '卡片底部区域。' },
      ],
    },
    examples: [
      {
        id: 'card-layout',
        title: '三段式卡片',
        description: '最适合后台面板的常见布局：头部摘要、正文说明、底部动作。',
        tip: '如果卡片里同时放很多不相关操作，应该拆卡片而不是继续堆按钮。',
        language: 'vue',
        code: `<template>\n  <PfCard shadow class="overflow-hidden">\n    <template #header>\n      <div>\n        <pf-text as="h4" class="mb-0">审批摘要</pf-text>\n        <pf-text as="p" class="mb-0 text-sm text-muted-foreground">\n          头部放摘要，正文放主要内容，避免把说明塞进 footer。\n        </pf-text>\n      </div>\n    </template>\n\n    <div class="px-4 py-4 text-sm text-muted-foreground">\n      当前卡片演示了最常用的 header、body、footer 三段式布局。\n    </div>\n\n    <template #footer>\n      <div class="flex w-full justify-end gap-2 border-t border-border px-4 py-3">\n        <PfButton variant="outline">关闭</PfButton>\n        <PfButton>继续处理</PfButton>\n      </div>\n    </template>\n  </PfCard>\n</template>`,
        demo: markRaw(PfCardDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-text',
    title: 'PfText',
    componentName: 'PfText',
    category: 'display',
    path: '/help/components/pf-text',
    icon: 'i-tabler-typography',
    subtitle: 'PfText 负责标题、正文、caption、链接和代码样式的一致输出。',
    summary: '先选语义层级，再选展示样式，不要用 class 临时拼一套新的文本体系。',
    whenToUse: [
      '页面标题、模块标题、正文说明和补充提示。',
      '需要统一文字层级和字体风格的页面。',
    ],
    constraints: [
      '不要把所有文本都写成 h3 再靠样式调整。',
      'caption 只适合次级信息，不能替代正文。',
    ],
    api: {
      props: [
        { name: 'as', type: "'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'a' | 'div' | 'blockquote' | 'kbd' | 'code'", default: 'div', description: '实际渲染的标签。' },
        { name: 'variant', type: "'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'link' | 'code' | 'kbd'", default: '按 as 推导', description: '文本视觉样式。' },
        { name: 'href', type: 'string', default: '-', description: '当 as 为 a 时的链接地址。' },
        { name: 'truncate', type: 'boolean | number', default: 'false', description: '单行或多行截断。' },
        { name: 'weight', type: "'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'", default: '-', description: '额外字体权重覆盖。' },
        { name: 'dimmed / prefixLine', type: 'boolean', default: 'false', description: '弱化文本或显示前缀线。' },
      ],
    },
    examples: [
      {
        id: 'text-basic',
        title: '常用文本层级',
        description: '把标题、正文、caption 和代码片段统一在一套组件里，有利于帮助页保持一致。',
        tip: '文档页里的 description 和 help 文案必须写边界和建议，不能只做占位句。',
        language: 'vue',
        code: `<template>\n  <div class="space-y-2">\n    <PfText as="h2" class="mb-0">组件文档标题</PfText>\n    <PfText as="p" class="mb-0 text-muted-foreground">\n      正文用于解释当前区域的约束、推荐做法和实现入口，不重复标题本身。\n    </PfText>\n    <PfText as="p" variant="caption" class="mb-0">caption 适合补充说明和次级状态。</PfText>\n    <PfText as="code">const visible = true</PfText>\n  </div>\n</template>`,
        demo: markRaw(PfTextDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-switch',
    title: 'PfSwitch',
    componentName: 'PfSwitch',
    category: 'form',
    path: '/help/components/pf-switch',
    icon: 'i-tabler-toggle-left',
    subtitle: 'PfSwitch 适合开关型布尔状态，前提是开启和关闭的含义都足够明确。',
    summary: '开关旁边必须写清当前状态的业务含义，不要只写“开启/关闭”。',
    whenToUse: [
      '布尔值开关，如启用、同步、公开。',
      '切换后结果即时生效的简单状态。',
    ],
    constraints: [
      '不要用开关承载多态枚举。',
      '高风险状态切换应增加确认或额外说明。',
    ],
    api: {
      props: [
        { name: 'modelValue', type: 'boolean', default: 'false', description: '当前开关状态。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '禁用交互。' },
        { name: 'name / required / value', type: 'string | boolean', default: '-', description: '继承自底层 SwitchRoot 的表单属性。' },
      ],
    },
    examples: [
      {
        id: 'switch-basic',
        title: '状态开关',
        description: '用开关直接表达一个明确的布尔状态，并在旁边同步展示业务结果。',
        tip: '如果用户看不懂切换后的影响，就不要只给一个开关。',
        language: 'vue',
        code: `<script setup lang="ts">\nconst enabled = ref(true)\n</script>\n\n<template>\n  <label class="inline-flex items-center gap-3">\n    <PfSwitch v-model="enabled" />\n    <span>{{ enabled ? '当前已启用' : '当前已停用' }}</span>\n  </label>\n</template>`,
        demo: markRaw(PfSwitchDocDemo),
        defaultOpen: true,
      },
    ],
  },
  {
    key: 'pf-checkbox',
    title: 'PfCheckbox',
    componentName: 'PfCheckbox',
    category: 'form',
    path: '/help/components/pf-checkbox',
    icon: 'i-tabler-checkbox',
    subtitle: 'PfCheckbox 适合用户显式确认某项条件或参与多选，不适合代替总开关。',
    summary: '勾选项文案必须能单独成立，用户不需要回看标题也知道自己在确认什么。',
    whenToUse: [
      '协议确认、附加项选择、多选列表。',
      '需要明确表示用户已经阅读或选择某项内容。',
    ],
    constraints: [
      '不要把 checkbox 用成切换主状态的唯一入口。',
      '多选项之间如果有互斥关系，应使用 options / radio 而不是 checkbox。',
    ],
    api: {
      props: [
        { name: 'modelValue', type: 'boolean | "indeterminate"', default: 'false', description: '当前勾选状态。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '禁用交互。' },
        { name: 'name / required / value', type: 'string | boolean', default: '-', description: '继承自底层 CheckboxRoot 的表单属性。' },
      ],
    },
    examples: [
      {
        id: 'checkbox-basic',
        title: '确认型复选框',
        description: '让用户显式选择某项附加行为时，checkbox 比隐藏默认开启更安全。',
        tip: '勾选项要写成完整动作，例如“同步展示到帮助导航”，不要只写“启用”。',
        language: 'vue',
        code: `<script setup lang="ts">\nconst checked = ref(true)\n</script>\n\n<template>\n  <label class="inline-flex items-center gap-3">\n    <PfCheckbox v-model="checked" />\n    <span>同步展示到帮助导航</span>\n  </label>\n</template>`,
        demo: markRaw(PfCheckboxDocDemo),
        defaultOpen: true,
      },
    ],
  },
]

export const componentDocs = docs

export const componentDocMap = Object.fromEntries(docs.map((item) => [item.key, item])) as Record<
  string,
  ComponentDocItem
>

export const findComponentDocByPath = (path: string) => {
  return componentDocs.find((item) => item.path === path)
}