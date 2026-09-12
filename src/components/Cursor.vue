<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// A dot and a ring, blended by difference so they read on every field.
// The ring lags the pointer and grows over anything clickable; elements
// with `data-cursor` hand it a word to carry. It switches on at the first
// real mouse movement rather than trusting a media query, because some
// embedded browsers report a coarse pointer for a desktop mouse.
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const label = ref('')
const hot = ref(false)
const on = ref(false)
let raf = 0
let x = -100
let y = -100
let rx = -100
let ry = -100

const activate = () => {
  if (on.value) return
  on.value = true
  document.body.classList.add('no-cursor')
  raf = requestAnimationFrame(tick)
}

const move = (e: PointerEvent) => {
  if (e.pointerType === 'touch') {
    if (on.value) deactivate()
    return
  }
  activate()
  x = e.clientX
  y = e.clientY
  const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('a, button, [data-cursor]')
  hot.value = !!t
  label.value = t?.dataset.cursor ?? ''
}

const deactivate = () => {
  on.value = false
  cancelAnimationFrame(raf)
  document.body.classList.remove('no-cursor')
}

const tick = () => {
  rx += (x - rx) * 0.14
  ry += (y - ry) * 0.14
  if (dot.value) dot.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
  if (ring.value) ring.value.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('pointermove', move, { passive: true })
  if (window.matchMedia('(pointer: fine)').matches) activate()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', move)
  deactivate()
})
</script>

<template>
  <div v-if="on" class="cursor" aria-hidden="true">
    <div ref="dot" class="dot"></div>
    <div ref="ring" class="ring" :class="{ hot, labelled: !!label }">
      <span class="word">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cursor {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  mix-blend-mode: difference;
  color: #fff;
}

.dot,
.ring {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  will-change: transform;
}

.dot {
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  background: currentColor;
}

.ring {
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border: 1.5px solid currentColor;
  display: grid;
  place-items: center;
  transition:
    width 0.6s var(--ease-slow),
    height 0.6s var(--ease-slow),
    margin 0.6s var(--ease-slow),
    background 0.6s var(--ease-slow);

  &.hot {
    width: 64px;
    height: 64px;
    margin: -32px 0 0 -32px;
  }

  &.labelled {
    width: 96px;
    height: 96px;
    margin: -48px 0 0 -48px;
    background: currentColor;
  }
}

.word {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #000;
  opacity: 0;
  transition: opacity 0.4s;

  .labelled & {
    opacity: 1;
  }
}
</style>
