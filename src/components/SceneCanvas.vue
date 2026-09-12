<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { HEX, type Field } from '@/data/site'
import type { Model } from '@/three/objects'

// A WebGL layer holding one object. three.js is lazy-loaded so it never
// blocks first paint. `scroll` picks what drives the scroll-linked turn:
// the window (for a sticky hero, whose own box never moves) or the host's
// position in the viewport.
const props = withDefaults(
  defineProps<{ model: Model; field: Field; tint: string; roughness?: number; parallax?: number; scroll?: 'window' | 'element' }>(),
  { scroll: 'element', roughness: undefined, parallax: undefined },
)

const canvas = ref<HTMLCanvasElement | null>(null)
const host = ref<HTMLElement | null>(null)
let scene: import('@/three/objects').ObjectScene | null = null
let io: IntersectionObserver | null = null

const onScroll = () => {
  if (!scene || !host.value) return
  const vh = window.innerHeight
  if (props.scroll === 'window') {
    scene.setScroll(Math.min(1.5, window.scrollY / vh))
  } else {
    const r = host.value.getBoundingClientRect()
    scene.setScroll(Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / vh)))
  }
}

const onPointer = (e: PointerEvent) => {
  scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
}

onMounted(async () => {
  if (!canvas.value) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const { ObjectScene } = await import('@/three/objects')
  if (!canvas.value) return
  scene = new ObjectScene(canvas.value, {
    model: props.model,
    field: HEX[props.field],
    tint: props.tint,
    roughness: props.roughness,
    parallax: props.parallax,
    reducedMotion,
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  if (!reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true })
  onScroll()
  if (host.value) {
    io = new IntersectionObserver(([e]) => scene?.setInView(!!e?.isIntersecting), { threshold: 0 })
    io.observe(host.value)
  }
})

onBeforeUnmount(() => {
  io?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointer)
  scene?.dispose()
  scene = null
})
</script>

<template>
  <div ref="host" class="scene" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.scene {
  position: absolute;
  inset: 0;
  pointer-events: none;

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
