<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { HEX, type Pair } from '@/data/site'
import type { AsciiEngine } from '@/ascii/engine'

// A moving picture printed in two inks. The video plays muted and hidden;
// every frame is sampled by the ascii engine and repainted as glyphs, so
// the motion reads as characters flickering in and out. Coarser cells than
// a still keep the per-frame cost low. It only runs while on screen, and
// the first frame arrives as a cascade like the stills do. Changing `src`
// keeps the last picture on screen until the new clip has a frame, then
// sweeps the band of scrambling glyphs across it: a cut with a glitch.
const props = withDefaults(
  defineProps<{
    src: string
    poster?: string
    pair: Pair
    ratio?: string
    cell?: number
  }>(),
  { poster: '', ratio: '3 / 4', cell: 9 },
)

const host = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const ready = ref(false)
let engine: AsciiEngine | null = null
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null
let raf = 0
let live = false
let inView = false
let started = false

const inks = () => {
  const [a, b] = props.pair.split('-') as [keyof typeof HEX, keyof typeof HEX]
  return { dark: HEX[a], light: HEX[b] }
}

const size = () => {
  if (engine && host.value) engine.size(host.value.clientWidth, host.value.clientHeight)
}

const frame = () => {
  raf = 0
  if (!live || !engine || !video.value) return
  const v = video.value
  if (v.readyState >= 2) {
    const lum = engine.sample(v, v.videoWidth, v.videoHeight)
    if (lum) engine.paint(lum)
  }
  raf = requestAnimationFrame(frame)
}

const start = () => {
  const v = video.value
  if (!v || !engine || started) return
  started = true
  v.play().catch(() => undefined)
  const first = () => {
    if (!engine || v.readyState < 2) {
      window.setTimeout(first, 80)
      return
    }
    const lum = engine.sample(v, v.videoWidth, v.videoHeight)
    if (!lum) return
    ready.value = true
    engine.cascade(lum, 1500, false, () => {
      live = true
      if (!raf) raf = requestAnimationFrame(frame)
    })
  }
  first()
}

const resume = () => {
  if (!started || !video.value) return
  video.value.play().catch(() => undefined)
  live = true
  if (!raf) raf = requestAnimationFrame(frame)
}

// A new clip. Hold the old frame, wait for the first new one, then sweep.
let swapping = 0
const swap = () => {
  const v = video.value
  if (!v || !engine || !started) return
  const token = ++swapping
  live = false
  cancelAnimationFrame(raf)
  raf = 0
  const onFrame = () => {
    if (token !== swapping || !engine) return
    if (v.readyState < 2) {
      window.setTimeout(onFrame, 80)
      return
    }
    const lum = engine.sample(v, v.videoWidth, v.videoHeight)
    if (!lum) return
    engine.cascade(lum, 1100, true, () => {
      if (token !== swapping) return
      live = inView
      if (live && !raf) raf = requestAnimationFrame(frame)
    })
  }
  v.load()
  v.play().catch(() => undefined)
  onFrame()
}
watch(() => props.src, () => window.setTimeout(swap, 0))

const pause = () => {
  live = false
  cancelAnimationFrame(raf)
  raf = 0
  video.value?.pause()
}

onMounted(async () => {
  if (!canvas.value) return
  const { AsciiEngine } = await import('@/ascii/engine')
  if (!canvas.value || !host.value) return
  engine = new AsciiEngine(canvas.value, { ...inks(), cell: props.cell, contrast: 1.6 })
  await document.fonts.load('500 12px "Geist Mono"').catch(() => undefined)
  size()
  ro = new ResizeObserver(size)
  ro.observe(host.value)
  io = new IntersectionObserver(
    ([e]) => {
      inView = !!e?.isIntersecting
      if (inView) (started ? resume : start)()
      else pause()
    },
    { threshold: 0.15 },
  )
  io.observe(host.value)
})

onBeforeUnmount(() => {
  pause()
  ro?.disconnect()
  io?.disconnect()
  engine?.cancel()
})
</script>

<template>
  <figure ref="host" class="video-plate" :class="{ ready }" :style="{ aspectRatio: ratio }">
    <img v-if="poster" :src="poster" alt="" loading="lazy" :style="{ filter: `url(#riso-${pair})` }" />
    <video ref="video" :src="src" muted loop playsinline preload="metadata" crossorigin="anonymous" aria-hidden="true"></video>
    <canvas ref="canvas" class="cells" aria-hidden="true"></canvas>
  </figure>
</template>

<style scoped lang="scss">
.video-plate {
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--on) 10%, var(--bg));

  img,
  .cells {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // The source stays in the document so it decodes, but off the picture.
  video {
    position: absolute;
    width: 2px;
    height: 2px;
    opacity: 0.01;
    pointer-events: none;
  }

  .cells {
    opacity: 0;
  }

  &.ready .cells {
    opacity: 1;
  }

  &.ready img {
    visibility: hidden;
  }
}
</style>
