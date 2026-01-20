<template>
  <label class="theme-toggle-vertical" v-bind="$attrs" :style="mergedStyle">
    <input type="checkbox" :checked="modelValue" @change="handleChange" id="toggle" />
    <svg
      viewBox="0 0 44 69.667"
      xmlns="http://www.w3.org/2000/svg"
      :class="{ 'is-checked': modelValue }"
    >
      <g transform="translate(4.5 4.5)">
        <rect id="container" fill="#83cbd8" rx="17.5" height="60.667" width="35"></rect>

        <g id="button" transform="translate(2.333 2.333)">
          <g id="sun">
            <circle fill="#f8e664" r="15.167" cy="15.167" cx="15.167"></circle>
            <path
              fill="rgba(246,254,247,0.29)"
              d="M11.667,0A11.667,11.667,0,1,1,0,11.667,11.667,11.667,0,0,1,11.667,0Z"
              transform="translate(3.5 3.5)"
            ></path>
            <circle fill="#fcf4b9" r="7" cy="15.167" cx="15.167"></circle>
          </g>

          <g id="moon" opacity="0">
            <circle fill="#cce6ee" r="15.167" cy="15.167" cx="15.167"></circle>
            <g fill="#a6cad0" transform="translate(5 5)" id="patches">
              <circle cx="2" cy="2" r="2"></circle>
              <circle cx="15" cy="10" r="2"></circle>
              <circle cx="8" cy="18" r="1.5"></circle>
            </g>
          </g>
        </g>

        <g id="cloud" transform="translate(2, 40) scale(0.8)">
          <path
            fill="#fff"
            d="M11.6,3.8a4.463,4.463,0,0,1,2.243.62.95.95,0,0,1,.72-1.281,4.852,4.852,0,0,1,2.623.519c.034.02-.5-1.968.281-2.716a2.117,2.117,0,0,1,2.829-.274,1.821,1.821,0,0,1,.854,1.858c.063.037,2.594-.049,3.285,1.273s-.865,2.544-.807,2.626a12.192,12.192,0,0,1,2.278.892c.553.448,1.106,1.992-1.62,2.927a7.742,7.742,0,0,1-3.762-.3c-1.28-.49-1.181-2.65-1.137-2.624s-1.417,2.2-2.623,2.2a4.172,4.172,0,0,1-2.394-1.206,3.825,3.825,0,0,1-2.771.774c-3.429-.46-2.333-3.267-2.2-3.55A3.721,3.721,0,0,1,11.6,3.8Z"
          ></path>
        </g>

        <g id="stars" opacity="0" transform="translate(5, 5)">
          <circle fill="#def8ff" cx="5" cy="5" r="1" />
          <circle fill="#def8ff" cx="15" cy="8" r="0.8" />
          <circle fill="#def8ff" cx="22" cy="15" r="1.2" />
          <circle fill="#def8ff" cx="8" cy="22" r="0.6" />
        </g>
      </g>
    </svg>
  </label>
</template>

<script setup lang="ts">
  import { useAttrs, computed } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
  })
  const emit = defineEmits(['update:modelValue'])
  defineOptions({
    inheritAttrs: false,
  })

  const attrs = useAttrs()

  // mergedStyle: prefer external inline style.width -> prefer Tailwind w-* classes (detected in class string) -> fallback to default width
  const mergedStyle = computed(() => {
    // external style may be an object or string; normalize
    const externalStyle: any = attrs.style || {}

    // if external style explicitly has width, keep it
    if (externalStyle && (externalStyle.width || externalStyle['--fancy-switch-width'])) {
      return externalStyle
    }

    // if external classes include a Tailwind width class like 'w-12' or 'w-1/2', don't set default width
    const cls = attrs.class || ''
    if (typeof cls === 'string' && /(^|\s)w-/.test(cls)) {
      // keep other external style props (if any)
      return externalStyle
    }

    // otherwise, merge default width into any external style
    return Object.assign({}, externalStyle || {}, { width: 'var(--fancy-switch-width, 4.5em)' })
  })

  const handleChange = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).checked)
  }
</script>

<style scoped>
  :where(.theme-toggle-vertical) {
    font-size: 17px;
    position: relative;
    display: inline-block;
    /* 默认为宽度驱动，外部可以通过 class (w-*) 或 style 覆盖 */
    width: var(--fancy-switch-width, 2.5em);
    /* 使用 aspect-ratio 保持原始 SVG 比例（viewBox: 44 / 69.667） */
    aspect-ratio: 44 / 69.667;
    cursor: pointer;
    transform-origin: center;
  }

  #toggle {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  #container,
  #button,
  #sun,
  #moon,
  #cloud,
  #stars {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  /* 状态切换逻辑 */

  /* 1. 背景颜色 */
  svg.is-checked #container {
    fill: #2b4360;
  }

  /* 2. 核心移动：从 X 轴移动改为 Y 轴移动 */
  svg.is-checked #button {
    /* 60.667(总高) - 35(按钮高) = 25.667 左右的位移 */
    transform: translate(2.333px, 28px);
  }

  /* 3. 太阳/月亮 显隐 */
  svg.is-checked #sun {
    opacity: 0;
  }
  svg.is-checked #moon {
    opacity: 1;
  }

  /* 4. 云朵/星星 显隐与微调 */
  svg.is-checked #cloud {
    opacity: 0;
    transform: translate(2px, 50px) scale(0.5); /* 消失时向下沉 */
  }
  svg.is-checked #stars {
    opacity: 1;
  }
</style>
