<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import AnimatedEye from './AnimatedEye.vue'

const props = defineProps<{
  isTyping?: boolean
  showPassword?: boolean
  passwordLength?: number
}>()

const mouseX = ref(0)
const mouseY = ref(0)
const isPurpleBlinking = ref(false)
const isBlackBlinking = ref(false)
const isLookingAtEachOther = ref(false)
const isPurplePeeking = ref(false)

const purpleRef = ref<HTMLDivElement>()
const blackRef = ref<HTMLDivElement>()
const yellowRef = ref<HTMLDivElement>()
const orangeRef = ref<HTMLDivElement>()

// --- mouse tracking ---
function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}
onMounted(() => window.addEventListener('mousemove', onMouseMove))
onUnmounted(() => window.removeEventListener('mousemove', onMouseMove))

// --- blinking effects ---
function useRandomBlink(blinkRef: ReturnType<typeof ref<boolean>>) {
  let timeout: ReturnType<typeof setTimeout>
  function schedule() {
    const interval = Math.random() * 4000 + 3000
    timeout = setTimeout(() => {
      blinkRef.value = true
      setTimeout(() => {
        blinkRef.value = false
        schedule()
      }, 150)
    }, interval)
    return timeout
  }
  onMounted(() => {
    timeout = schedule()
  })
  onUnmounted(() => clearTimeout(timeout))
}
useRandomBlink(isPurpleBlinking)
useRandomBlink(isBlackBlinking)

// --- looking-at-each-other when typing ---
watch(
  () => props.isTyping,
  (typing) => {
    if (typing) {
      isLookingAtEachOther.value = true
      setTimeout(() => {
        isLookingAtEachOther.value = false
      }, 800)
    } else {
      isLookingAtEachOther.value = false
    }
  },
)

// --- purple peeking when password visible & has content ---
let peekTimeout: ReturnType<typeof setTimeout>
watch([() => props.passwordLength, () => props.showPassword], ([len, show]) => {
  if (len > 0 && show) {
    function schedulePeek() {
      peekTimeout = setTimeout(
        () => {
          isPurplePeeking.value = true
          setTimeout(() => {
            isPurplePeeking.value = false
            if (props.passwordLength && props.passwordLength > 0 && props.showPassword) {
              schedulePeek()
            }
          }, 800)
        },
        Math.random() * 3000 + 2000,
      )
    }
    schedulePeek()
  } else {
    isPurplePeeking.value = false
    clearTimeout(peekTimeout)
  }
})
onUnmounted(() => clearTimeout(peekTimeout))

// --- calculate position (faceX, faceY, bodySkew) ---
function calcPos(el: HTMLElement | undefined) {
  if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 }
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX.value - cx
  const dy = mouseY.value - cy
  return {
    faceX: Math.max(-15, Math.min(15, dx / 20)),
    faceY: Math.max(-10, Math.min(10, dy / 30)),
    bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
  }
}

const purplePos = computed(() => calcPos(purpleRef.value))
const blackPos = computed(() => calcPos(blackRef.value))
const orangePos = computed(() => calcPos(orangeRef.value))
const yellowPos = computed(() => calcPos(yellowRef.value))

const showPwd = computed(
  () => props.passwordLength && props.passwordLength > 0 && props.showPassword,
)
const hidePwd = computed(
  () => props.passwordLength && props.passwordLength > 0 && !props.showPassword,
)
</script>

<template>
  <div class="relative" style="width: 550px; height: 400px">
    <!-- ===== Purple (back) ===== -->
    <div
      ref="purpleRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      style="background-color: #6c3ff5; border-radius: 10px 10px 0 0; z-index: 1"
      :style="{
        left: '70px',
        width: '180px',
        height: isTyping || hidePwd ? '440px' : '400px',
        transform: showPwd
          ? 'skewX(0deg)'
          : isTyping || hidePwd
            ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
            : `skewX(${purplePos.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-8 transition-all duration-700 ease-in-out"
        :style="{
          left: showPwd ? '20px' : isLookingAtEachOther ? '55px' : `${45 + purplePos.faceX}px`,
          top: showPwd ? '35px' : isLookingAtEachOther ? '65px' : `${40 + purplePos.faceY}px`,
        }"
      >
        <AnimatedEye
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isPurpleBlinking"
          :force-look-x="
            showPwd ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
          "
          :force-look-y="
            showPwd ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
          "
          show-white
        />
        <AnimatedEye
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isPurpleBlinking"
          :force-look-x="
            showPwd ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined
          "
          :force-look-y="
            showPwd ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
          "
          show-white
        />
      </div>
    </div>

    <!-- ===== Black (middle) ===== -->
    <div
      ref="blackRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      style="background-color: #2d2d2d; border-radius: 8px 8px 0 0; z-index: 2"
      :style="{
        left: '240px',
        width: '120px',
        height: '310px',
        transform: showPwd
          ? 'skewX(0deg)'
          : isLookingAtEachOther
            ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
            : isTyping || hidePwd
              ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
              : `skewX(${blackPos.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-6 transition-all duration-700 ease-in-out"
        :style="{
          left: showPwd ? '10px' : isLookingAtEachOther ? '32px' : `${26 + blackPos.faceX}px`,
          top: showPwd ? '28px' : isLookingAtEachOther ? '12px' : `${32 + blackPos.faceY}px`,
        }"
      >
        <AnimatedEye
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isBlackBlinking"
          :force-look-x="showPwd ? -4 : isLookingAtEachOther ? 0 : undefined"
          :force-look-y="showPwd ? -4 : isLookingAtEachOther ? -4 : undefined"
          show-white
        />
        <AnimatedEye
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isBlackBlinking"
          :force-look-x="showPwd ? -4 : isLookingAtEachOther ? 0 : undefined"
          :force-look-y="showPwd ? -4 : isLookingAtEachOther ? -4 : undefined"
          show-white
        />
      </div>
    </div>

    <!-- ===== Orange (front left) ===== -->
    <div
      ref="orangeRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      style="background-color: #ff9b6b; z-index: 3"
      :style="{
        left: '0px',
        width: '240px',
        height: '200px',
        borderRadius: '120px 120px 0 0',
        transform: showPwd ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-8 transition-all duration-200 ease-out"
        :style="{
          left: showPwd ? '50px' : `${82 + (orangePos.faceX || 0)}px`,
          top: showPwd ? '85px' : `${90 + (orangePos.faceY || 0)}px`,
        }"
      >
        <AnimatedEye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="showPwd ? -5 : undefined"
          :force-look-y="showPwd ? -4 : undefined"
          :show-white="false"
        />
        <AnimatedEye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="showPwd ? -5 : undefined"
          :force-look-y="showPwd ? -4 : undefined"
          :show-white="false"
        />
      </div>
    </div>

    <!-- ===== Yellow (front right) ===== -->
    <div
      ref="yellowRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      style="background-color: #e8d754; z-index: 4"
      :style="{
        left: '310px',
        width: '140px',
        height: '230px',
        borderRadius: '70px 70px 0 0',
        transform: showPwd ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-6 transition-all duration-200 ease-out"
        :style="{
          left: showPwd ? '20px' : `${52 + (yellowPos.faceX || 0)}px`,
          top: showPwd ? '35px' : `${40 + (yellowPos.faceY || 0)}px`,
        }"
      >
        <AnimatedEye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="showPwd ? -5 : undefined"
          :force-look-y="showPwd ? -4 : undefined"
          :show-white="false"
        />
        <AnimatedEye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="showPwd ? -5 : undefined"
          :force-look-y="showPwd ? -4 : undefined"
          :show-white="false"
        />
      </div>
      <!-- mouth line -->
      <div
        class="absolute h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
        :style="{
          width: '80px',
          left: showPwd ? '10px' : `${40 + (yellowPos.faceX || 0)}px`,
          top: showPwd ? '88px' : `${88 + (yellowPos.faceY || 0)}px`,
        }"
      />
    </div>
  </div>
</template>
