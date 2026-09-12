<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Wordmark from '@/components/Wordmark.vue'
import SceneCanvas from '@/components/SceneCanvas.vue'
import Plate from '@/components/Plate.vue'
import Marquee from '@/components/Marquee.vue'
import VideoPlate from '@/components/VideoPlate.vue'
import { useStack } from '@/composables/useStack'
import { useHorizontal } from '@/composables/useHorizontal'
import { app } from '@/composables/useCurtain'
import { brand, clients, oceans, projects, services } from '@/data/site'

// Home. Five fields in order: vermilion (the mark), ink (the claim), an
// ultramarine rail (the work), ink under a lime sea (the practice) and
// lilac (the ask).
const stackA = ref<HTMLElement | null>(null)
const stackB = ref<HTMLElement | null>(null)
const railWrap = ref<HTMLElement | null>(null)
const railTrack = ref<HTMLElement | null>(null)
useStack(stackA)
useStack(stackB)
useHorizontal(railWrap, railTrack)

const featured = projects.slice(0, 5)

// Heavy. The word arrives as a hairline and gains weight as the visitor
// lingers on the claim: the panel holds for an extra screen and a half
// while the variable axis runs from 100 to 700, eased both ends.
const claimWord = ref<HTMLElement | null>(null)
const claimHold = ref<HTMLElement | null>(null)
let weighRaf = 0
const weigh = () => {
  weighRaf = 0
  const hold = claimHold.value
  const word = claimWord.value
  if (!hold || !word) return
  const r = hold.getBoundingClientRect()
  const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / r.height))
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
  word.style.fontVariationSettings = `"wght" ${Math.round(100 + 600 * e)}`
}
const scheduleWeigh = () => {
  if (!weighRaf) weighRaf = requestAnimationFrame(weigh)
}
const openService = ref(0)

// The practice list turns itself while it is on screen and nobody is
// pointing at it: every few seconds the next discipline opens and the sea
// behind it cuts to the next clip.
const practice = ref<HTMLElement | null>(null)
const hovering = ref(false)
let cycle = 0
let practiceIo: IntersectionObserver | null = null
const startCycle = () => {
  stopCycle()
  cycle = window.setInterval(() => {
    if (!hovering.value) openService.value = (openService.value + 1) % services.length
  }, 6500)
}
const stopCycle = () => {
  window.clearInterval(cycle)
  cycle = 0
}

// The rail wrapper is as tall as the track is wide, so a full vertical
// scroll through it moves the track exactly one track width.
const size = () => {
  if (!railWrap.value || !railTrack.value) return
  if (window.innerWidth < 960) {
    railWrap.value.style.height = ''
    return
  }
  railWrap.value.style.height = `${railTrack.value.scrollWidth - window.innerWidth + window.innerHeight}px`
}
onMounted(() => {
  size()
  window.addEventListener('resize', size)
  window.setTimeout(size, 400)
  if (practice.value) {
    practiceIo = new IntersectionObserver(([e]) => (e?.isIntersecting ? startCycle() : stopCycle()), { threshold: 0.4 })
    practiceIo.observe(practice.value)
  }
  window.addEventListener('scroll', scheduleWeigh, { passive: true })
  weigh()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', size)
  window.removeEventListener('scroll', scheduleWeigh)
  cancelAnimationFrame(weighRaf)
  stopCycle()
  practiceIo?.disconnect()
})
</script>

<template>
  <div class="home">
    <div ref="stackA" class="stack">
      <!-- 01 The mark -->
      <section class="panel field-vermilion hero" :class="{ go: app.ready }">
        <div class="grid-lines"></div>
        <SceneCanvas model="ring" field="vermilion" tint="#f0ebe0" scroll="window" class="hero-scene" />
        <div class="panel-inner">
          <p class="meta side edge-l">{{ brand.issue }}</p>
          <p class="meta side-down edge-r">Copenhagen 55.68° N / New York 40.71° N</p>
          <h1 class="hero-mark"><Wordmark title="Tonne" /></h1>
          <div class="hero-foot">
            <p class="lead hero-line">
              <span class="mask"><span>A design studio</span></span>
              <span class="mask"><span>with <em class="voice">weight.</em></span></span>
            </p>
            <p class="meta hero-services">Identity / Digital / Motion / Spatial</p>
            <p class="meta hero-scroll">Scroll <span class="arrow">↓</span></p>
          </div>
        </div>
      </section>

      <!-- 02 The claim -->
      <section class="panel field-ink claim">
        <span ref="claimWord" v-fit.parent="0.86" class="giant condensed side claim-word" aria-hidden="true">Heavy</span>
        <div class="panel-inner claim-inner">
          <p v-reveal v-fit class="display claim-text">
            <span class="mask"><span>Most brands are</span></span>
            <span class="mask"><span>built to be liked.</span></span>
            <span class="mask"><span>We build brands</span></span>
            <span class="mask"><span>to be <em class="voice">felt.</em></span></span>
          </p>
          <ul v-reveal class="claim-facts meta" style="--delay: 0.5s">
            <li><strong>Est. 2019</strong><span>Copenhagen</span></li>
            <li><strong>41</strong><span>Identities shipped</span></li>
            <li><strong>14</strong><span>People, two cities</span></li>
            <li><strong>1</strong><span>Colour per client</span></li>
          </ul>
        </div>
      </section>
      <!-- Room to linger: the claim stays pinned through this while Heavy
           takes on weight. -->
      <div ref="claimHold" class="claim-hold" aria-hidden="true"></div>
    </div>

    <!-- 03 The work, on a rail -->
    <section ref="railWrap" class="rail-wrap field-ultramarine">
      <div class="rail-sticky">
        <div class="grid-lines"></div>
        <div ref="railTrack" class="rail-track">
          <div class="rail-head">
            <p class="meta">Selected work</p>
            <h2 class="giant condensed">Work<br />24–27</h2>
            <router-link to="/work" class="pill">All projects</router-link>
          </div>
          <router-link
            v-for="(p, i) in featured"
            :key="p.slug"
            :to="`/work/${p.slug}`"
            class="rail-item"
            :class="`rail-item-${i % 3}`"
            data-cursor="View"
          >
            <Plate :src="p.hero" :alt="p.client" :pair="p.pair" mode="riso" ratio="4 / 5" />
            <div class="rail-cap">
              <span class="meta">0{{ i + 1 }} / {{ p.sector }}</span>
              <span class="heading">{{ p.title }}</span>
            </div>
          </router-link>
          <router-link to="/work" class="rail-end" data-cursor="Index">
            <span class="giant condensed">+1</span>
            <span class="meta">See the index</span>
          </router-link>
        </div>
      </div>
    </section>

    <div ref="stackB" class="stack">
      <!-- 04 The practice -->
      <section ref="practice" class="panel field-ink practice" @mouseenter="hovering = true" @mouseleave="hovering = false">
        <VideoPlate :src="oceans[openService % oceans.length]!" pair="ink-lime" ratio="auto" :cell="11" class="practice-sea" />
        <div class="panel-inner practice-inner">
          <div class="practice-head">
            <p class="meta">Practice</p>
            <p class="lead">Four disciplines, one studio, no hand-offs. The people who name the brand build the site.</p>
          </div>
          <ul class="service-list">
            <li
              v-for="(s, i) in services"
              :key="s.n"
              class="service"
              :class="{ open: openService === i }"
              @mouseenter="openService = i"
              @click="openService = i"
            >
              <span class="service-n meta">{{ s.n }}</span>
              <span class="service-title display">{{ s.title }}</span>
              <span class="service-line">{{ s.line }}</span>
              <span class="service-items meta">{{ s.items.join(' / ') }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- 05 The ask -->
      <section class="panel field-lilac ask">
        <SceneCanvas model="orb" field="lilac" tint="#efe9ff" :roughness="0.04" :parallax="1.3" class="ask-scene" />
        <div class="panel-inner ask-inner">
          <p class="meta">New work</p>
          <div class="ask-mid">
            <h2 v-reveal v-fit class="giant ask-title">
              <span class="mask"><span>Make</span></span>
              <span class="mask"><span>something</span></span>
              <span class="mask"><span>heavy.</span></span>
            </h2>
          </div>
          <div class="ask-foot">
            <a class="pill solid" :href="`mailto:${brand.email}`">{{ brand.email }}</a>
            <router-link to="/contact" class="pill">Studio details</router-link>
          </div>
        </div>
        <Marquee :items="clients" class="ask-marquee heading" />
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
// ---------------------------------------------------------------- hero

.hero {
  height: 100svh;
}

.hero-scene {
  z-index: 1;
}

.hero .panel-inner {
  z-index: 2;
  display: grid;
  grid-template-rows: 1fr auto;
}

.edge-l,
.edge-r {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  opacity: 0.75;
}

.edge-l {
  left: var(--gutter);
  transform: rotate(180deg) translateX(0);
}

.edge-r {
  right: var(--gutter);

  @media (max-width: 720px) {
    display: none;
  }
}

// The mark fills the width and, as the next panel covers this one,
// turns on its bottom-left corner until it stands along the edge.
.hero-mark {
  align-self: end;
  width: 100%;
  font-size: 1px;
  line-height: 1;
  transform-origin: 0 100%;
  transform: rotate(calc(var(--cover) * -90deg)) translateX(calc(var(--cover) * -8vw));
  transition: none;

  :deep(.wordmark) {
    width: 100%;
    height: auto;
    overflow: hidden;
  }

  :deep(.l) {
    transform-box: fill-box;
    transform: translateY(125%);
    transition: transform 1.5s var(--ease-slow);
  }

  @for $i from 1 through 5 {
    :deep(.l:nth-child(#{$i})) {
      transition-delay: #{0.1 + ($i - 1) * 0.1}s;
    }
  }
}

.go .hero-mark :deep(.l) {
  transform: none;
}

.hero-foot {
  display: grid;
  grid-template-columns: 1.4fr 1fr auto;
  align-items: end;
  gap: 24px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid color-mix(in srgb, var(--on) 40%, transparent);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.hero-line .mask > span {
  transform: translateY(110%);
  transition: transform 1.4s var(--ease-slow) 0.8s;
}

.hero-line .mask:nth-child(2) > span {
  transition-delay: 0.9s;
}

.go .hero-line .mask > span {
  transform: none;
}

.hero-services,
.hero-scroll {
  opacity: 0;
  transition: opacity 1.2s 1.3s;

  .go & {
    opacity: 0.85;
  }
}

.hero-scroll .arrow {
  display: inline-block;
  animation: nod 2.4s var(--ease-in-out) infinite;
}

@keyframes nod {
  50% {
    transform: translateY(4px);
  }
}

// ---------------------------------------------------------------- claim

.claim-word {
  position: absolute;
  left: calc(var(--gutter) - 0.1em);
  bottom: var(--gutter);
  color: var(--lime);
  line-height: 0.72;
  opacity: 0.95;
  // Five letters at roughly 0.55em each: 28vh stands about 77vh tall.
  font-size: min(var(--fs-giant), 28vh);

  @media (max-width: 720px) {
    top: calc(var(--header-h) + 8px);
    bottom: auto;
    font-size: 22vh;
    opacity: 0.5;
  }
}

.claim-hold {
  height: 150vh;

  @media (max-width: 720px) {
    height: 100vh;
  }
}

.claim-inner {
  display: grid;
  grid-template-rows: 1fr auto;
  padding-left: calc(var(--gutter) + min(var(--fs-giant), 28vh) * 0.95);

  @media (max-width: 720px) {
    padding-left: var(--gutter);
  }
}

.claim-text {
  align-self: center;
  font-size: clamp(44px, 8.4vw, 168px);
}

.claim-facts {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--on) 30%, transparent);

  li {
    display: flex;
    flex-direction: column;
    gap: 6px;
    opacity: 0.85;
  }

  strong {
    font-family: var(--display);
    font-size: clamp(22px, 2.4vw, 40px);
    font-weight: 700;
    letter-spacing: -0.03em;
    text-transform: none;
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

// ---------------------------------------------------------------- rail

.rail-wrap {
  position: relative;
  z-index: 2;
  background: var(--bg);
  color: var(--on);
}

.rail-sticky {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}

.rail-track {
  position: relative;
  display: flex;
  align-items: center;
  gap: clamp(32px, 5vw, 96px);
  height: 100%;
  padding: calc(var(--header-h) + 8px) var(--gutter) var(--gutter);
  width: max-content;
  will-change: transform;

  @media (max-width: 959px) {
    width: auto;
    height: auto;
    flex-direction: column;
    align-items: stretch;
  }
}

.rail-head {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  height: 100%;
  min-width: 34vw;

  h2 {
    font-size: min(var(--fs-giant), 32vh);
  }

  @media (max-width: 959px) {
    min-width: 0;
  }
}

.rail-item {
  display: block;
  flex: none;
  width: min(30vw, 62vh);

  &.rail-item-1 {
    width: min(24vw, 52vh);
    translate: 0 -8vh;
  }

  &.rail-item-2 {
    width: min(36vw, 70vh);
    translate: 0 4vh;
  }

  @media (max-width: 959px) {
    width: 100% !important;
    translate: 0 !important;
  }
}

.rail-cap {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);
  margin-top: 12px;

  .heading {
    font-size: clamp(24px, 2.4vw, 44px);
  }
}

.rail-end {
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding-right: var(--gutter);
  min-width: 30vw;

  .giant {
    font-size: min(var(--fs-giant), 40vh);
  }
}

// ---------------------------------------------------------------- practice

.practice {
  height: auto;
  min-height: 100svh;
}

// The sea. Full bleed behind the list, printed in lime on ink, dimmed a
// step so the type on top stays the loudest thing.
.practice-sea {
  position: absolute;
  inset: 0;
  z-index: 0;
  aspect-ratio: auto !important;
  opacity: 0.58;
  background: var(--ink);
}

// Thin text over the sea gets a halo of ink so the glyphs never cut
// through a letter; the big titles need nothing.
.practice-head .lead,
.service-line,
.service-items {
  text-shadow:
    0 0 2px var(--ink),
    0 0 10px var(--ink),
    0 0 22px var(--ink);
}

.practice-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2.2fr);
  gap: var(--gutter);
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    height: auto;
  }
}

.practice-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 22em;
}

.service-list {
  list-style: none;
}

.service {
  display: grid;
  grid-template-columns: 4em 1fr;
  grid-template-areas:
    'n title'
    '. line'
    '. items';
  column-gap: 12px;
  padding: 18px 0;
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);
  cursor: pointer;

  &:last-child {
    border-bottom: 1px solid color-mix(in srgb, var(--on) 35%, transparent);
  }
}

.service-n {
  grid-area: n;
  padding-top: 0.5em;
}

.service-title {
  grid-area: title;
  font-size: clamp(36px, 5.2vw, 92px);
  transition:
    translate 0.9s var(--ease-slow),
    color 0.9s var(--ease-slow);

  .service:hover &,
  .service.open & {
    translate: 0.15em 0;
  }

  .service.open & {
    color: var(--lime);
  }
}

.service-line,
.service-items {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition:
    max-height 1s var(--ease-slow),
    opacity 0.8s var(--ease-slow),
    margin 1s var(--ease-slow);
}

.service-line {
  grid-area: line;
  max-width: 30em;
  font-size: var(--fs-lead);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.service-items {
  grid-area: items;
  opacity: 0.7;
}

.service.open {
  .service-line {
    max-height: 8em;
    opacity: 1;
    margin-top: 14px;
  }

  .service-items {
    max-height: 3em;
    opacity: 0.7;
    margin-top: 10px;
  }
}

// ---------------------------------------------------------------- ask

.ask-scene {
  z-index: 0;
  left: auto;
  right: 0;
  width: 60%;

  @media (max-width: 860px) {
    width: 100%;
    opacity: 0.6;
  }
}

.ask-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding-bottom: calc(var(--gutter) + 1.4em * 2);
}

.ask-mid {
  display: flex;
  align-items: center;
  min-height: 0;

  // Breathing room above the pills once the title stands on end; v-fit
  // reads the padding as part of the box, so the title stays clear of it.
  @media (max-width: 720px) {
    padding: 12px 0 32px;
  }
}

.ask-title {
  font-size: min(var(--fs-giant), 26vh);

  // On a phone the three words stand on end, as tall as the screen allows,
  // instead of shrinking to fit the width.
  @media (max-width: 720px) {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 20svh;
    line-height: 0.82;
  }
}

.ask-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ask-marquee {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  padding: 14px 0;
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);
  font-size: clamp(28px, 4vw, 64px);
}
</style>
