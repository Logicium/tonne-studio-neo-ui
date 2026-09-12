<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getLenis, scrollToY } from '@/composables/useLenis'

// The site's own scrollbar. A hairline rail down the right edge with a
// short bar for the thumb and, riding beside it, the page position as a
// three digit percentage set sideways in mono. It takes the ink of the
// field under the header so it always reads. Drag the thumb or click the
// rail to move; the thumb eases with the same scroller as the wheel.
const rail = ref<HTMLElement | null>(null)
const progress = ref(0)
const dragging = ref(false)
const active = ref(false)
let raf = 0
let idle = 0

const update = () => {
  raf = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  active.value = true
  window.clearTimeout(idle)
  idle = window.setTimeout(() => (active.value = false), 1400)
}

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(update)
}

const toY = (clientY: number) => {
  const r = rail.value!.getBoundingClientRect()
  const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height))
  return p * (document.documentElement.scrollHeight - window.innerHeight)
}

const onDown = (e: PointerEvent) => {
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  getLenis()?.scrollTo(toY(e.clientY), { immediate: true, force: true })
}

const onMove = (e: PointerEvent) => {
  if (!dragging.value) return
  const y = toY(e.clientY)
  const l = getLenis()
  if (l) l.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo(0, y)
}

const onUp = () => {
  dragging.value = false
}

const onClick = (e: MouseEvent) => {
  if (dragging.value) return
  scrollToY(toY(e.clientY))
}

onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  update()
  active.value = false
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.clearTimeout(idle)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
})
</script>

<template>
  <div
    ref="rail"
    class="rail"
    :class="{ active, dragging }"
    aria-hidden="true"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @click="onClick"
  >
    <div class="track"></div>
    <div class="thumb" :style="{ top: `calc(${progress} * (100% - var(--thumb)))` }">
      <span class="bar"></span>
      <span class="read">{{ String(Math.round(progress * 100)).padStart(3, '0') }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rail {
  --thumb: 64px;
  position: fixed;
  top: var(--header-h);
  bottom: var(--header-h);
  right: 10px;
  z-index: 66;
  width: 28px;
  color: var(--hdr, var(--bone));
  cursor: pointer;
  transition: color 0.7s var(--ease-slow);

  // Only phones and tablets go without it. A touchscreen laptop reports a
  // coarse primary pointer but can still hover, so it keeps the rail.
  @media (hover: none) and (pointer: coarse) {
    display: none;
  }
}

.track {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 12px;
  width: 1px;
  background: currentColor;
  opacity: 0.25;
  transition: opacity 0.8s var(--ease-slow);

  .rail:hover &,
  .active & {
    opacity: 0.45;
  }
}

.thumb {
  position: absolute;
  right: 0;
  width: 28px;
  height: var(--thumb);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.bar {
  display: block;
  width: 3px;
  height: 100%;
  background: currentColor;
  border-radius: 2px;
  transition: width 0.6s var(--ease-slow);
  margin-right: 11px;

  .rail:hover &,
  .dragging & {
    width: 5px;
    margin-right: 10px;
  }
}

// The readout sits to the left of the bar, sideways, and only shows while
// the page is moving or the rail is under the pointer.
.read {
  position: absolute;
  right: 24px;
  top: 50%;
  translate: 0 -50%;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  opacity: 0;
  transition: opacity 0.8s var(--ease-slow);

  .rail:hover &,
  .active & {
    opacity: 0.85;
  }
}
</style>
