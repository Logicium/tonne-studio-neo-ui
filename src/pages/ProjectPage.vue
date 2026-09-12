<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Plate from '@/components/Plate.vue'
import VideoPlate from '@/components/VideoPlate.vue'
import { useStack } from '@/composables/useStack'
import { projects } from '@/data/site'

// One case. The title starts as a headline over the plate and, as the
// reading section covers the hero, turns on its corner to stand along the
// edge like a spine. The next case waits at the bottom as its own screen.
const route = useRoute()
const project = computed(() => projects.find((p) => p.slug === route.params.slug) ?? projects[0]!)
const index = computed(() => projects.indexOf(project.value))
const next = computed(() => projects[(index.value + 1) % projects.length]!)

const heroStack = ref<HTMLElement | null>(null)
useStack(heroStack)
</script>

<template>
  <article class="project">
    <div ref="heroStack" class="stack">
      <section class="panel hero" :class="`field-${project.field}`">
        <div class="grid-lines"></div>
        <div class="panel-inner hero-inner">
          <p class="meta hero-n">Case 0{{ index + 1 }} / {{ project.client }}</p>
          <div class="hero-plate">
            <Plate :src="project.hero" :alt="project.client" :pair="project.pair" mode="riso" ratio="4 / 5" />
          </div>
          <h1 v-fit class="giant hero-title">{{ project.title }}</h1>
          <dl class="meta hero-facts">
            <div><dt>Sector</dt><dd>{{ project.sector }}</dd></div>
            <div><dt>Year</dt><dd>{{ project.year }}</dd></div>
            <div><dt>Scope</dt><dd>{{ project.services.join(', ') }}</dd></div>
          </dl>
        </div>
      </section>
    </div>

    <section class="read field-ink">
      <div class="read-inner">
        <p v-reveal class="display read-summary">{{ project.summary }}</p>
        <div class="read-grid">
          <div v-reveal class="copy read-body">
            <p v-for="(para, i) in project.body" :key="i">{{ para }}</p>
          </div>
          <dl v-reveal class="read-facts" style="--delay: 0.2s">
            <div v-for="f in project.facts" :key="f.k">
              <dt class="meta">{{ f.k }}</dt>
              <dd>{{ f.v }}</dd>
            </div>
          </dl>
        </div>
        <div class="read-plates">
          <div v-reveal class="rp rp-a">
            <Plate :src="project.images[0]" :alt="project.client" :pair="project.pair" mode="duo" ratio="4 / 5" />
            <p class="meta">Fig. 01 / {{ project.services[0] }}</p>
          </div>
          <div v-reveal class="rp rp-b" style="--delay: 0.15s">
            <VideoPlate :src="project.video" :poster="project.images[1]" :pair="project.pair" ratio="3 / 4" />
            <p class="meta">Fig. 02 / {{ project.services[1] }} / Moving</p>
          </div>
          <p v-reveal class="heading rp-quote">
            <span class="side-mark" aria-hidden="true">“</span>Every surface carries the same two inks.
          </p>
        </div>
      </div>
    </section>

    <router-link :to="`/work/${next.slug}`" class="next" :class="`field-${next.field}`" data-cursor="Next">
      <div class="grid-lines"></div>
      <div class="next-inner">
        <p class="meta">Next case / 0{{ (index + 1) % projects.length + 1 }}</p>
        <h2 v-fit class="giant next-title">{{ next.title }}</h2>
        <p class="lead next-line">{{ next.summary }}</p>
      </div>
    </router-link>
  </article>
</template>

<style scoped lang="scss">
.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'n plate'
    'title plate'
    'facts plate';
  gap: 0 var(--gutter);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
    grid-template-areas:
      'n'
      'plate'
      'title'
      'facts';
  }
}

.hero-n {
  grid-area: n;
  opacity: 0.8;
}

.hero-plate {
  grid-area: plate;
  align-self: center;
  justify-self: end;
  width: 100%;
  max-height: calc(100svh - var(--header-h) - 2 * var(--gutter) - 8px);

  :deep(.plate) {
    max-height: calc(100svh - var(--header-h) - 2 * var(--gutter) - 8px);
    margin-left: auto;
  }

  @media (max-width: 860px) {
    max-height: 46svh;

    :deep(.plate) {
      max-height: 46svh;
      margin: 0 auto;
    }
  }
}

// The turn. Driven by how far the reading section has covered the hero.
.hero-title {
  grid-area: title;
  align-self: end;
  font-size: min(var(--fs-giant), 26vh);
  transform-origin: 0 100%;
  transform: rotate(calc(var(--cover) * -90deg)) translateX(calc(var(--cover) * -6vw));
}

.hero-facts {
  grid-area: facts;
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: start;
  gap: 24px;
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);

  dt {
    opacity: 0.55;
    margin-bottom: 4px;
  }
}

// ---------------------------------------------------------------- read

.read {
  position: relative;
  z-index: 2;
  background: var(--bg);
  color: var(--on);
}

.read-inner {
  padding: clamp(80px, 12vw, 200px) var(--gutter);
  display: flex;
  flex-direction: column;
  gap: clamp(64px, 9vw, 160px);
}

.read-summary {
  max-width: 11em;
  font-size: clamp(36px, 6vw, 112px);
}

.read-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: var(--gutter);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

.read-body {
  font-size: clamp(18px, 1.5vw, 24px);
  max-width: 30em;
}

.read-facts {
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-self: end;
  width: min(100%, 22em);

  div {
    padding-top: 12px;
    border-top: 1px solid color-mix(in srgb, var(--on) 30%, transparent);
  }

  dt {
    opacity: 0.55;
    margin-bottom: 6px;
  }
}

.read-plates {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gutter);
  align-items: start;

  .rp p {
    margin-top: 10px;
    opacity: 0.6;
  }

  .rp-a {
    grid-column: 1 / span 5;
  }

  .rp-b {
    grid-column: 7 / span 6;
    margin-top: 18vh;
  }

  .rp-quote {
    grid-column: 3 / span 8;
    margin-top: 10vh;
    font-size: clamp(28px, 4vw, 72px);
    position: relative;
  }

  .side-mark {
    position: absolute;
    left: -0.6em;
    top: -0.02em;
    font-family: var(--voice);
    opacity: 0.6;
  }

  @media (max-width: 860px) {
    .rp-a,
    .rp-b,
    .rp-quote {
      grid-column: 1 / -1;
      margin-top: 0;
    }
  }
}

// ---------------------------------------------------------------- next

.next {
  position: relative;
  z-index: 2;
  display: block;
  min-height: 100svh;
  background: var(--bg);
  color: var(--on);
  overflow: hidden;
}

.next-inner {
  position: relative;
  min-height: 100svh;
  padding: calc(var(--header-h) + 8px) var(--gutter) var(--gutter);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.next-title {
  align-self: center;
  font-size: min(var(--fs-giant), 34vh);
  transition: translate 1.2s var(--ease-slow);

  .next:hover & {
    translate: 2vw 0;
  }
}

.next-line {
  max-width: 24em;
}
</style>
