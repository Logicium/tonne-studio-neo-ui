<script setup lang="ts">
import { ref } from 'vue'
import SceneCanvas from '@/components/SceneCanvas.vue'
import Plate from '@/components/Plate.vue'
import Marquee from '@/components/Marquee.vue'
import { useStack } from '@/composables/useStack'
import { brand, clients, principles, team } from '@/data/site'

// The studio. Lime for who we are, ink for what we believe, lilac for the
// people, vermilion for the company we keep.
const stack = ref<HTMLElement | null>(null)
useStack(stack)
</script>

<template>
  <div ref="stack" class="stack studio">
    <section class="panel field-lime hero">
      <div class="grid-lines"></div>
      <SceneCanvas model="slabs" field="lime" tint="#1c1a18" :roughness="0.22" class="hero-scene" />
      <div class="panel-inner hero-inner">
        <p class="meta">Studio / Est. {{ brand.founded }}</p>
        <h1 v-reveal v-fit class="display hero-title">
          <span class="mask"><span>Fourteen people</span></span>
          <span class="mask"><span>in two cities who</span></span>
          <span class="mask"><span>think a brand</span></span>
          <span class="mask"><span>should be <em class="voice">felt.</em></span></span>
        </h1>
        <p class="meta side-down hero-edge">Copenhagen / New York</p>
      </div>
    </section>

    <section class="panel field-ink beliefs">
      <span v-fit.parent="0.86" class="giant condensed side beliefs-word" aria-hidden="true">Belief</span>
      <div class="panel-inner beliefs-inner">
        <p class="meta">What we hold</p>
        <ol class="belief-list">
          <li v-for="p in principles" :key="p.n" v-reveal class="belief">
            <span class="belief-n giant condensed">{{ p.n }}</span>
            <span class="belief-body">
              <span class="heading">{{ p.title }}</span>
              <span class="belief-text">{{ p.body }}</span>
            </span>
          </li>
        </ol>
      </div>
    </section>

    <section class="panel field-lilac people">
      <div class="grid-lines"></div>
      <div class="panel-inner people-inner">
        <div class="people-head">
          <p class="meta">People</p>
          <h2 class="heading">Four partners, ten designers, one kitchen table in each office.</h2>
        </div>
        <ul class="people-grid">
          <li v-for="(t, i) in team" :key="t.name" v-reveal class="person" :style="{ '--delay': `${i * 0.1}s` }">
            <Plate :src="t.photo" :alt="t.name" :pair="t.pair" :mode="i % 2 ? 'duo' : 'riso'" ratio="3 / 4" />
            <p class="person-name">{{ t.name }}</p>
            <p class="meta person-role">{{ t.role }} / {{ t.city }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="panel field-vermilion company">
      <div class="panel-inner company-inner">
        <p class="meta">In company with</p>
        <div class="company-stage">
          <div class="company-rows">
            <Marquee :items="clients" class="giant condensed company-row" :seconds="90" />
            <Marquee :items="[...clients].reverse()" class="giant condensed company-row" :seconds="110" reverse />
          </div>
        </div>
        <div class="company-foot">
          <p class="lead">We take on eight identities a year and turn down the rest with a note.</p>
          <router-link to="/contact" class="pill solid">Ask for a slot</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hero-scene {
  left: auto;
  right: 0;
  width: 55%;
  z-index: 0;

  @media (max-width: 860px) {
    width: 100%;
    opacity: 0.5;
  }
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr;
}

.hero-title {
  align-self: end;
  font-size: clamp(40px, 7.4vw, 150px);
  max-width: 8em;
}

.hero-edge {
  position: absolute;
  right: var(--gutter);
  top: 50%;
  translate: 0 -50%;
  opacity: 0.7;
}

// ---------------------------------------------------------------- beliefs

.beliefs-word {
  position: absolute;
  right: calc(var(--gutter) - 0.1em);
  bottom: var(--gutter);
  color: var(--ultramarine);
  filter: brightness(1.5);
  line-height: 0.72;
  font-size: min(var(--fs-giant), 24vh);
  opacity: 0.95;
}

.beliefs-inner {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 24px;
  padding-right: calc(var(--gutter) + min(var(--fs-giant), 24vh) * 0.9);

  @media (max-width: 860px) {
    padding-right: var(--gutter);
  }
}

.belief-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px var(--gutter);
  align-content: center;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.belief {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--on) 30%, transparent);
}

.belief-n {
  font-size: clamp(48px, 6vw, 120px);
  line-height: 0.8;
  opacity: 0.35;
}

.belief-body {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .heading {
    font-size: clamp(24px, 2.6vw, 48px);
  }
}

.belief-text {
  max-width: 28em;
  opacity: 0.85;
}

// ---------------------------------------------------------------- people

.people-inner {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 24px;
}

.people-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--gutter);
  align-items: start;

  .heading {
    font-size: clamp(24px, 3vw, 56px);
    max-width: 16em;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

.people-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--gutter);
  align-items: end;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}

.person {
  :deep(.plate) {
    max-height: 52svh;
  }

  &:nth-child(2),
  &:nth-child(4) {
    translate: 0 -6vh;

    @media (max-width: 860px) {
      translate: 0;
    }
  }
}

.person-name {
  margin-top: 12px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.person-role {
  opacity: 0.6;
  margin-top: 2px;
}

// ---------------------------------------------------------------- company

.company-inner {
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding-left: 0;
  padding-right: 0;

  > .meta,
  .company-foot {
    padding: 0 var(--gutter);
  }
}

// The stage is the middle row of the panel. On a phone the two marquees
// stand on end inside it: the box is as wide as the stage is tall, turned
// a quarter, so the names run up the screen at full size.
.company-stage {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 0;
  container-type: size;
  overflow: hidden;
}

.company-rows {
  display: flex;
  flex-direction: column;
  gap: 0.05em;
  width: 100%;

  @media (max-width: 720px) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100cqh;
    translate: -50% -50%;
    rotate: -90deg;
  }
}

.company-row {
  font-size: min(var(--fs-giant), 22vh);
  line-height: 0.9;

  @media (max-width: 720px) {
    font-size: min(22vh, 34vw);
  }
}

.company-foot {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
  padding-top: 18px !important;
  margin: 0 var(--gutter);
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);

  .lead {
    max-width: 20em;
  }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
