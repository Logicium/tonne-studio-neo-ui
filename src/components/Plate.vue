<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { HEX, type Pair } from '@/data/site'
import type { AsciiEngine } from '@/ascii/engine'

// A photograph printed in two inks.
//   duo    a smooth duotone (SVG filter)
//   riso   the same pair posterised to five steps (SVG filter)
//   ascii  the picture rebuilt as a grid of mono glyphs by the ascii
//          engine. It arrives as a cascade of scrambling characters that
//          settle row by row, and a hover sends the scramble through again.
// The filtered <img> stays underneath as the fallback and for alt text.
const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    pair: Pair
    mode?: 'duo' | 'riso' | 'ascii'
    ratio?: string
    // Load at once rather than when scrolled to: for plates that arrive by
    // a transform, which the lazy loader cannot see coming.
    eager?: boolean
  }>(),
  { alt: '', mode: 'duo', ratio: '4 / 5', eager: false },
)

const host = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
let engine: AsciiEngine | null = null
let lum: Float32Array | null = null
let image: HTMLImageElement | null = null
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null
let seen = false

const inks = () => {
  const [a, b] = props.pair.split('-') as [keyof typeof HEX, keyof typeof HEX]
  return { dark: HEX[a], light: HEX[b] }
}

const build = () => {
  if (!engine || !host.value || !image) return
  if (!engine.size(host.value.clientWidth, host.value.clientHeight)) return
  lum = engine.sample(image, image.naturalWidth, image.naturalHeight)
}

// First reveal happens when the plate scrolls into view, not on load.
const reveal = () => {
  if (!engine || !lum || seen) return
  seen = true
  ready.value = true
  engine.cascade(lum, 1500)
}

const replay = () => {
  if (engine && lum && seen && !engine.animating) engine.cascade(lum, 1100, true)
}

onMounted(async () => {
  if (props.mode !== 'ascii' || !canvas.value) return
  const { AsciiEngine } = await import('@/ascii/engine')
  if (!canvas.value) return
  engine = new AsciiEngine(canvas.value, inks())
  image = new Image()
  image.crossOrigin = 'anonymous'
  image.decoding = 'async'
  image.onload = async () => {
    await document.fonts.load('500 12px "Geist Mono"').catch(() => undefined)
    build()
    if (!host.value) return
    io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) reveal()
      },
      { threshold: 0.2 },
    )
    io.observe(host.value)
    ro = new ResizeObserver(() => {
      if (!seen) return
      build()
      if (lum && engine) engine.paint(lum)
    })
    ro.observe(host.value)
  }
  image.src = props.src
})

onBeforeUnmount(() => {
  ro?.disconnect()
  io?.disconnect()
  engine?.cancel()
  image = null
})
</script>

<template>
  <figure ref="host" class="plate" :class="[mode, { ready }]" :style="{ aspectRatio: ratio }" @mouseenter="replay">
    <img
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      :style="{ filter: `url(#${mode === 'duo' ? 'duo' : 'riso'}-${pair})` }"
    />
    <canvas v-if="mode === 'ascii'" ref="canvas" class="cells" aria-hidden="true"></canvas>
  </figure>
</template>

<style scoped lang="scss">
.plate {
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
    transform: scale(1.001);
    transition: transform 1.6s var(--ease-slow);
  }

  .cells {
    opacity: 0;
    transition: transform 1.6s var(--ease-slow);
  }

  // The ascii layer switches on the instant the cascade starts, so the
  // glyphs paint over the filtered image rather than fading in.
  &.ready .cells {
    opacity: 1;
  }

  &.ascii.ready img {
    visibility: hidden;
  }

  &:hover img,
  &:hover .cells {
    transform: scale(1.045);
  }
}
</style>
