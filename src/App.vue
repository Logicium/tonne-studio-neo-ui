<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, type RouteLocationNormalized } from 'vue-router'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import FilterDefs from '@/components/FilterDefs.vue'
import Cursor from '@/components/Cursor.vue'
import Preloader from '@/components/Preloader.vue'
import ScrollRail from '@/components/ScrollRail.vue'
import { app, CURTAIN_HOLD, CURTAIN_IN, CURTAIN_OUT, wait } from '@/composables/useCurtain'
import { getLenis, startLenis, stopLenis } from '@/composables/useLenis'
import { projects, routeField } from '@/data/site'

const router = useRouter()
const loading = ref(!sessionStorage.getItem('tonne-seen'))
if (!loading.value) app.ready = true

const labelFor = (to: RouteLocationNormalized) => {
  if (to.name === 'project') return projects.find((p) => p.slug === to.params.slug)?.title ?? 'Work'
  if (to.name === 'home') return 'Tonne'
  return String(to.name ?? '').replace(/^\w/, (c) => c.toUpperCase())
}

// The curtain. Before a route changes, a field of the destination's colour
// rises over the page and holds; the new page mounts behind it at the top;
// then the field lifts away. Two slow seconds, on purpose.
router.beforeEach(async (to, from) => {
  if (!from.name || to.path === from.path) return true
  const c = app.curtain
  c.field = routeField[String(to.name)] ?? 'ink'
  c.label = labelFor(to)
  c.phase = 'in'
  getLenis()?.stop()
  await wait(CURTAIN_IN)
  c.phase = 'hold'
  return true
})

router.afterEach((_to, from) => {
  if (!from.name) return
  nextTick(async () => {
    window.scrollTo(0, 0)
    const l = getLenis()
    l?.start()
    l?.scrollTo(0, { immediate: true, force: true })
    sampleTone()
    await wait(CURTAIN_HOLD)
    app.curtain.phase = 'out'
    await wait(CURTAIN_OUT)
    app.curtain.phase = 'idle'
  })
})

// The header takes the ink of whatever field sits under it. Sampled from
// the element stack at the header's midpoint a few times a second.
let toneTimer = 0
const sampleTone = () => {
  const els = document.elementsFromPoint(window.innerWidth * 0.5, 30)
  for (const el of els) {
    if (el.closest('.header, .menu, .curtain, .cursor, .grain, .loader')) continue
    const field = el.closest<HTMLElement>('[class*="field-"]')
    if (!field) continue
    const cs = getComputedStyle(field)
    document.documentElement.style.setProperty('--hdr', cs.getPropertyValue('--on'))
    document.documentElement.style.setProperty('--hdr-bg', cs.getPropertyValue('--bg'))
    return
  }
}

const onLoaded = () => {
  loading.value = false
  sessionStorage.setItem('tonne-seen', '1')
  getLenis()?.start()
}

onMounted(() => {
  const l = startLenis()
  if (loading.value) l?.stop()
  toneTimer = window.setInterval(sampleTone, 180)
  sampleTone()
})

onBeforeUnmount(() => {
  window.clearInterval(toneTimer)
  stopLenis()
})
</script>

<template>
  <FilterDefs />
  <Preloader v-if="loading" @done="onLoaded" />
  <SiteHeader />
  <main>
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="$route.path" />
    </router-view>
  </main>
  <SiteFooter />
  <div class="curtain" :class="[`field-${app.curtain.field}`, app.curtain.phase]" aria-hidden="true">
    <div class="grid-lines"></div>
    <div class="curtain-inner">
      <p class="meta">Tonne</p>
      <p v-fit.parent class="curtain-label giant">{{ app.curtain.label }}</p>
      <p class="meta">Issue 01 / 2027</p>
    </div>
  </div>
  <ScrollRail />
  <div class="grain" aria-hidden="true"></div>
  <Cursor />
</template>

<style lang="scss">
main {
  position: relative;
  z-index: 1;
}

.curtain {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: var(--bg);
  color: var(--on);
  transform: translateY(101%);
  pointer-events: none;
  overflow: hidden;

  &.in {
    transform: translateY(0);
    transition: transform 1s var(--ease-in-out);
    pointer-events: auto;
  }

  &.hold {
    transform: translateY(0);
    pointer-events: auto;
  }

  &.out {
    transform: translateY(-101%);
    transition: transform 1s var(--ease-in-out);
    pointer-events: auto;
  }
}

.curtain-inner {
  height: 100%;
  padding: var(--gutter);
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: center;
}

// The label moves against the sheet: it arrives from further down and
// leaves further up, so the wipe reads as depth rather than a slide.
.curtain-label {
  justify-self: center;
  font-size: clamp(80px, 20vw, 360px);
  transform: translateY(35vh);
  white-space: nowrap;

  .in & {
    transform: translateY(0);
    transition: transform 1.15s var(--ease-in-out);
  }

  .hold & {
    transform: translateY(0);
  }

  .out & {
    transform: translateY(-35vh);
    transition: transform 1.1s var(--ease-in-out);
  }
}
</style>
