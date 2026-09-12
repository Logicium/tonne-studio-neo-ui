<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Wordmark from '@/components/Wordmark.vue'
import { app, wait } from '@/composables/useCurtain'

// First arrival. Ink, a counter, the five letters rising one at a time,
// then the four colours of the house sweep up in order and the whole sheet
// lifts away. Once per session; after that the site opens straight in.
const emit = defineEmits<{ done: [] }>()
const phase = ref<'count' | 'sweep' | 'leave'>('count')
const n = ref(0)

onMounted(async () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const t0 = performance.now()
  const dur = reduced ? 300 : 1500
  await new Promise<void>((resolve) => {
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / dur)
      n.value = Math.round((1 - Math.pow(1 - p, 3)) * 100)
      if (p < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
  await wait(reduced ? 100 : 350)
  phase.value = 'sweep'
  await wait(reduced ? 100 : 1050)
  phase.value = 'leave'
  app.ready = true
  await wait(reduced ? 100 : 1100)
  emit('done')
})
</script>

<template>
  <div class="loader" :class="phase" aria-hidden="true">
    <div class="sheet">
      <p class="meta issue">Tonne / Issue 01</p>
      <div class="mark"><Wordmark /></div>
      <p class="count">{{ String(n).padStart(3, '0') }}</p>
    </div>
    <div class="bars">
      <i class="field-vermilion"></i>
      <i class="field-ultramarine"></i>
      <i class="field-lime"></i>
      <i class="field-lilac"></i>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loader {
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow: hidden;
  transition: transform 1.1s var(--ease-in-out);

  &.leave {
    transform: translateY(-101%);
  }
}

.sheet {
  position: absolute;
  inset: 0;
  background: var(--ink);
  color: var(--bone);
  padding: var(--gutter);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.issue {
  opacity: 0.6;
}

.mark {
  align-self: center;
  font-size: min(18vw, 40vh);
  overflow: hidden;
  padding-bottom: 0.04em;

  :deep(.wordmark) {
    width: 100%;
    height: auto;
  }

  :deep(.l) {
    transform-box: fill-box;
    transform: translateY(125%);
    animation: rise 1.3s var(--ease-slow) forwards;
  }

  @for $i from 1 through 5 {
    :deep(.l:nth-child(#{$i})) {
      animation-delay: #{0.15 + ($i - 1) * 0.09}s;
    }
  }
}

.count {
  font-family: var(--display);
  font-weight: 700;
  font-size: clamp(56px, 9vw, 140px);
  letter-spacing: -0.03em;
  line-height: 0.8;
  justify-self: end;
  font-variant-numeric: tabular-nums;
}

// Four bars, each a colour of the house, each sliding up a beat after the
// last so the sheet is painted in four strokes.
.bars {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  i {
    display: block;
    background: var(--bg);
    transform: translateY(101%);
    transition: transform 0.95s var(--ease-in-out);
  }

  @for $i from 1 through 4 {
    i:nth-child(#{$i}) {
      transition-delay: #{($i - 1) * 0.11}s;
    }
  }
}

.sweep .bars i,
.leave .bars i {
  transform: none;
}

@keyframes rise {
  to {
    transform: none;
  }
}
</style>
