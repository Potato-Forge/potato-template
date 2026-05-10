export type DesignNavItem = {
  title: string
  path: string
  icon: string
  description: string
}

export type TokenItem = {
  name: string
  usage: string
}

export type TokenGroup = {
  title: string
  description: string
  tokens: TokenItem[]
}

export type StatusRecipe = {
  state: string
  level: string
  combo: string
  note: string
}

export type UsageRule = {
  title: string
  body: string
}

export type ThemePresetGuide = {
  key: string
  label: string
  hex: string
  role: string
  note: string
}

export type TypeScaleItem = {
  token: string
  sample: string
  className: string
  usage: string
}

export type SpacingItem = {
  token: string
  size: string
  usage: string
}

export type RadiusItem = {
  token: string
  value: string
  usage: string
}

export type ShadowItem = {
  token: string
  usage: string
  className: string
}

export type ButtonRule = {
  variant: string
  emphasis: string
  scenarios: string
  avoid: string
}

export type IconRule = {
  token: string
  usage: string
  className: string
}

export type ToastRule = {
  type: string
  combo: string
  usage: string
}

export const designNavItems: DesignNavItem[] = [
  {
    title: '总览',
    path: '/help/system',
    icon: 'i-tabler-layout-dashboard',
    description: '说明当前主题的设计思路、适用范围和查阅方式。',
  },
  {
    title: '色彩规范',
    path: '/help/system/colors',
    icon: 'i-tabler-palette',
    description: '查看默认主色、可选预设、语义 token 和状态色用法。',
  },
  {
    title: '排版与空间',
    path: '/help/system/foundation',
    icon: 'i-tabler-spacing-horizontal',
    description: '查看标题层级、正文样式、间距、圆角和阴影建议。',
  },
  {
    title: '组件规范',
    path: '/help/system/components',
    icon: 'i-tabler-components',
    description: '查看按钮、卡片、toast、图标等组件的推荐用法。',
  },
]

export const designPrinciples = [
  {
    title: '主题基线',
    body: '亮色和暗色都沿用 Catppuccin 的色相关系，中性色负责层级，强调色只负责交互与反馈。',
  },
  {
    title: '主色使用',
    body: 'Primary 只用于主按钮、当前态、焦点和关键提示，不用于大面积背景。',
  },
  {
    title: '说明文案要求',
    body: 'subtitle、description、help 文案必须说明用途、限制或建议，不能只是重复标题。',
  },
  {
    title: '实现对齐',
    body: '文档中的 token、variant 和类名要能直接对应 UnoCSS、shadcn 风格类名或 PF 组件 props。',
  },
]

export const catppuccinMapping = [
  {
    palette: 'Latte',
    role: '亮色主题',
    summary: '用于 background、card、popover、muted、border 等中性层级。',
  },
  {
    palette: 'Macchiato',
    role: '暗色主题',
    summary: '用于暗色模式下的背景、内容表面、前景文本和状态色亮度校准。',
  },
  {
    palette: 'Teal / Blue / Yellow / Rosewater 邻近色',
    role: '强调色来源',
    summary: '用于 primary 预设和状态色，尽量保持与 Catppuccin 色板的相对关系。',
  },
]

export const tokenGroups: TokenGroup[] = [
  {
    title: '基础表面',
    description: '页面骨架、主要容器和浮层使用的长期结构色。',
    tokens: [
      { name: 'app-shell', usage: '应用整体背景、全局外层空间底色' },
      { name: 'sidebar-surface', usage: '一级/二级导航容器背景' },
      { name: 'header-surface', usage: '顶部头部容器背景，允许轻透明叠层' },
      { name: 'content-surface', usage: '主内容卡片与 PageLayout 默认背景' },
      { name: 'content-muted', usage: '内容区缓冲层、模块之间的衔接底色' },
      { name: 'background', usage: '页面主背景、大面积底色' },
      { name: 'foreground', usage: '默认正文、主要图标、关键信息' },
      { name: 'card', usage: '卡片、面板、承载内容的主要容器' },
      { name: 'card-foreground', usage: '卡片内部正文与标题' },
      { name: 'popover', usage: '下拉菜单、弹层、悬浮内容表面' },
      { name: 'popover-foreground', usage: '浮层内文字与图标' },
    ],
  },
  {
    title: '次级表面',
    description: '弱化区块、次级容器和交互反馈的常用语义色。',
    tokens: [
      { name: 'muted', usage: '占位背景、说明块、低权重信息容器' },
      { name: 'muted-foreground', usage: '辅助文本、说明文案、placeholder' },
      { name: 'secondary', usage: '次级容器、柔和按钮背景、辅助强调' },
      { name: 'secondary-foreground', usage: 'secondary 背景上的主文字' },
      { name: 'accent', usage: 'hover、focus 前兆、轻交互高亮' },
      { name: 'accent-foreground', usage: 'accent 背景上的文字与图标' },
    ],
  },
  {
    title: '品牌与交互',
    description: '品牌色、操作焦点和输入控件相关 token。',
    tokens: [
      { name: 'primary', usage: '主按钮、品牌强调、关键行动' },
      { name: 'primary-foreground', usage: 'primary 背景上的文字与图标' },
      { name: 'border', usage: '普通边框、分隔线、轮廓边界' },
      { name: 'input', usage: '输入框边界与表单轮廓' },
      { name: 'ring', usage: '键盘焦点、可访问性轮廓和聚焦提示' },
    ],
  },
  {
    title: '状态反馈',
    description: '结果反馈、危险提示以及持久选中状态。',
    tokens: [
      { name: 'success', usage: '成功反馈、通过状态、正向提示' },
      { name: 'success-foreground', usage: 'success 背景上的文字' },
      { name: 'info', usage: '标准信息提示、普通状态说明' },
      { name: 'info-foreground', usage: 'info 背景上的文字' },
      { name: 'tip', usage: '轻提示、辅导型文案、可忽略提醒' },
      { name: 'tip-foreground', usage: 'tip 背景上的文字' },
      { name: 'risk', usage: '低级风险提醒、需要确认但未到警告级' },
      { name: 'risk-foreground', usage: 'risk 背景上的文字' },
      { name: 'warning', usage: '中高风险警告、需要重点关注' },
      { name: 'warning-foreground', usage: 'warning 背景上的文字' },
      { name: 'destructive', usage: '删除、清除、失败、不可逆操作' },
      { name: 'destructive-foreground', usage: 'destructive 背景上的文字' },
      { name: 'selected', usage: '持久选中项、当前激活项、导航当前态' },
      { name: 'selected-foreground', usage: 'selected 背景上的文字' },
    ],
  },
]

export const usageRules: UsageRule[] = [
  {
    title: '结构色优先于状态色',
    body: '大面积背景、容器和分层关系优先使用 background、card、popover、secondary、muted，避免滥用状态色。',
  },
  {
    title: '文本层级清晰',
    body: '主信息使用 foreground，说明信息与补充文案使用 muted-foreground，不新增私有灰阶。',
  },
  {
    title: '交互强调只给关键动作',
    body: '主按钮、激活态和品牌主提示使用 primary，hover 和 focus 使用 accent、ring，而不是直接改造背景体系。',
  },
  {
    title: '状态从轻到重分层',
    body: '推荐层级为 tip < info < risk < warning < destructive；成功结果统一使用 success。',
  },
]

export const statusRecipes: StatusRecipe[] = [
  {
    state: 'tip',
    level: '轻提示 / 非阻断',
    combo: 'bg-tip text-tip-foreground border-tip',
    note: '用于补充说明、引导文案、可忽略提醒。',
  },
  {
    state: 'info',
    level: '信息提示',
    combo: 'bg-info text-info-foreground border-info',
    note: '用于普通信息反馈与系统状态说明。',
  },
  {
    state: 'risk',
    level: '低风险提示',
    combo: 'bg-risk text-risk-foreground border-risk',
    note: '用于轻度风险、建议用户确认。',
  },
  {
    state: 'warning',
    level: '中高风险警告',
    combo: 'bg-warning text-warning-foreground border-warning',
    note: '用于可能导致问题的操作提醒。',
  },
  {
    state: 'destructive',
    level: '危险 / 失败',
    combo: 'bg-destructive text-destructive-foreground border-destructive',
    note: '用于删除、失败、不可逆操作。',
  },
  {
    state: 'success',
    level: '成功反馈',
    combo: 'bg-success text-success-foreground border-success',
    note: '用于保存成功、完成态与正反馈。',
  },
]

export const themePresetGuide: ThemePresetGuide[] = [
  {
    key: 'default',
    label: '湖芯青',
    hex: '#58B19F',
    role: '默认主色',
    note: '用于管理台长期使用场景，适合主按钮、当前态和焦点提示。',
  },
  {
    key: 'ocean',
    label: '海岸蓝',
    hex: '#1D78C1',
    role: '信息型主色',
    note: '适合列表页多、导航层级清晰、信息密度较高的页面。',
  },
  {
    key: 'amber',
    label: '琥珀金',
    hex: '#D99314',
    role: '强调型主色',
    note: '适合运营活动、重点引导和需要更强行动提示的场景。',
  },
  {
    key: 'rose',
    label: '暮光玫瑰',
    hex: '#C43A74',
    role: '品牌型主色',
    note: '适合内容展示或品牌感更强的分支页面。',
  },
  {
    key: 'violet',
    label: '狂歌紫',
    hex: '#6E56CF',
    role: '高识别主色',
    note: '作为补充色使用，适合需要更高辨识度的专题或工具区。',
  },
  {
    key: 'sage',
    label: '雾苔绿',
    hex: '#5F8F6F',
    role: '低刺激主色',
    note: '适合长时间使用的后台页面和弱品牌感场景。',
  },
]

export const typeScale: TypeScaleItem[] = [
  {
    token: 'h1',
    sample: '设计规范总览',
    className: 'font-headline text-4xl md:text-[3.5rem] font-extrabold tracking-tight',
    usage: '页面主标题、重要首屏标题，每页只使用一次。',
  },
  {
    token: 'h2',
    sample: '章节标题',
    className: 'font-headline text-3xl md:text-4xl font-bold',
    usage: '一级章节标题，负责切分页面结构。',
  },
  {
    token: 'h3',
    sample: '区块标题',
    className: 'font-headline text-2xl md:text-[1.75rem] font-bold',
    usage: '卡片组与局部内容块标题。',
  },
  {
    token: 'body',
    sample: '正文用于说明规则、提示限制和补充背景信息。',
    className: 'font-body text-base leading-relaxed',
    usage: '正文、说明、表格外辅助内容。',
  },
  {
    token: 'caption',
    sample: '辅助说明 / Caption',
    className: 'font-body text-xs italic text-muted-foreground',
    usage: '注释、时间、状态说明、帮助性文本。',
  },
]

export const spacingScale: SpacingItem[] = [
  { token: 'space-2', size: '0.5rem', usage: '图标与文字、小型控件内部间距' },
  { token: 'space-3', size: '0.75rem', usage: '紧凑行内操作、表单项局部间距' },
  { token: 'space-4', size: '1rem', usage: '默认组件内边距与栅格基础间距' },
  { token: 'space-5', size: '1.25rem', usage: '卡片主体 padding、模块间常用节奏' },
  { token: 'space-6', size: '1.5rem', usage: '页面大区块间距、Hero 与正文之间的留白' },
  { token: 'space-8', size: '2rem', usage: '首屏模块、大型分组的分隔距离' },
]

export const radiusScale: RadiusItem[] = [
  { token: 'sm', value: 'calc(var(--radius) - 4px)', usage: '标签、输入框、小按钮' },
  { token: 'md', value: 'calc(var(--radius) - 2px)', usage: '默认按钮、toast、基础弹层' },
  { token: 'lg', value: 'var(--radius)', usage: '常规卡片、下拉菜单、弹窗容器' },
  { token: '2xl', value: '1rem ~ 1.5rem', usage: '页面级卡片、帮助页区块、品牌 Hero 卡片' },
  { token: 'full', value: '9999px', usage: '状态点、头像、胶囊标签、圆形图标按钮' },
]

export const shadowScale: ShadowItem[] = [
  {
    token: 'inset-surface',
    usage: '轻表面高光，用于浅色表面层的细微质感。',
    className: 'shadow-[inset_0_1px_0_hsl(var(--foreground)/0.08)]',
  },
  {
    token: 'panel',
    usage: '页面级容器与搜索浮层常用阴影。',
    className: 'shadow-[0_24px_48px_-32px_hsl(var(--foreground)/0.22)]',
  },
  {
    token: 'toast',
    usage: '短时反馈浮层，要求比面板更聚焦但不过分厚重。',
    className: 'shadow-lg',
  },
]

export const buttonRules: ButtonRule[] = [
  {
    variant: 'default / primary',
    emphasis: '最高',
    scenarios: '页面唯一主行动、表单提交、确认继续。',
    avoid: '同一区域内不应出现多个等权 default 主按钮。',
  },
  {
    variant: 'outline',
    emphasis: '中等',
    scenarios: '次要操作、低风险工具按钮、过滤和辅助入口。',
    avoid: '不要承担主转化动作，也不要堆叠过多彩色 outline。',
  },
  {
    variant: 'secondary',
    emphasis: '中低',
    scenarios: '柔和强调、上下文内的推荐操作、状态型快捷操作。',
    avoid: '不要用作页面唯一 CTA，否则权重不够。',
  },
  {
    variant: 'ghost',
    emphasis: '低',
    scenarios: '工具栏操作、图标按钮、局部浮层里的轻操作。',
    avoid: '不要在空白背景上堆叠多个高饱和 ghost 形成视觉噪声。',
  },
  {
    variant: 'link',
    emphasis: '最低',
    scenarios: '阅读流中的跳转、补充信息、轻量跳页入口。',
    avoid: '不要代替真正的按钮提交行为。',
  },
]

export const cardRules = [
  {
    title: '默认内容卡片',
    combo: 'bg-card text-card-foreground border-border',
    note: '用于承载正文、表单、表格与说明信息，是最常见的容器层。',
  },
  {
    title: '页面区块卡片',
    combo: 'bg-content-surface border-border/45 rounded-2xl shadow-panel',
    note: '用于帮助页、搜索面板、管理台主体区块。',
  },
  {
    title: '弱化信息卡片',
    combo: 'bg-muted/35 border-border',
    note: '用于摘要、提示、只读说明，不抢正文优先级。',
  },
]

export const iconRules: IconRule[] = [
  {
    token: 'text-foreground',
    usage: '默认主图标、标题前图标、关键信息图标。',
    className: 'text-foreground',
  },
  {
    token: 'text-muted-foreground',
    usage: '说明型、辅助型、未激活图标。',
    className: 'text-muted-foreground',
  },
  {
    token: 'text-primary',
    usage: '品牌强调、当前步骤、重点入口图标。',
    className: 'text-primary',
  },
  {
    token: 'text-destructive',
    usage: '危险操作、删除、错误状态图标。',
    className: 'text-destructive',
  },
]

export const toastRules: ToastRule[] = [
  {
    type: 'success',
    combo: 'border-success bg-success text-success-foreground',
    usage: '保存成功、完成操作、任务结束。',
  },
  {
    type: 'info',
    combo: 'border-info bg-info text-info-foreground',
    usage: '普通信息反馈、系统消息。',
  },
  {
    type: 'tip',
    combo: 'border-tip bg-tip text-tip-foreground',
    usage: '轻引导、技巧提示、可选建议。',
  },
  {
    type: 'warning',
    combo: 'border-warning bg-warning text-warning-foreground',
    usage: '需要关注的异常状态或即将发生的风险。',
  },
  {
    type: 'risk',
    combo: 'border-risk bg-risk text-risk-foreground',
    usage: '低一级风险提醒，通常先于确认弹窗。',
  },
  {
    type: 'destructive',
    combo: 'border-destructive bg-destructive text-destructive-foreground',
    usage: '失败、删除、不可逆操作结果。',
  },
]

export const designHeroBadgeStyle = {
  backgroundColor: 'hsl(var(--secondary))',
  color: 'hsl(var(--primary))',
  borderColor: 'hsl(var(--primary))',
}

export const tokenStyle = (token: string) => ({
  backgroundColor: `hsl(var(--${token}))`,
})