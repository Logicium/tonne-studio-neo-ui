<script setup lang="ts">
import { ref } from 'vue'
import SceneCanvas from '@/components/SceneCanvas.vue'
import { useStack } from '@/composables/useStack'
import { brand } from '@/data/site'

// Contact. No form. An address written large enough to be the design, a
// chrome pill set for the pointer to play with, and two office spines.
const stack = ref<HTMLElement | null>(null)
useStack(stack)
</script>

<template>
  <div ref="stack" class="stack contact">
    <section class="panel field-lilac hero">
      <div class="grid-lines"></div>
      <SceneCanvas model="pill" field="lilac" tint="#ece6ff" :roughness="0.1" class="hero-scene" />
      <div class="panel-inner hero-inner">
        <p class="meta">Start here</p>
        <a v-reveal v-fit class="giant hero-mail" :href="`mailto:${brand.email}`" data-cursor="Write">
          <span class="mask"><span>hello@</span></span>
          <span class="mask"><span>tonne</span></span>
          <span class="mask"><span>.studio</span></span>
        </a>
        <div class="hero-foot">
          <p class="lead">Tell us what it is, when it needs to exist and what it should weigh. We reply within two working days.</p>
          <ul class="meta hero-links">
            <li v-for="s in brand.socials" :key="s.label">
              <a :href="s.href" target="_blank" rel="noopener" class="line-link">{{ s.label }}</a>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="panel field-ink offices">
      <div class="panel-inner offices-inner">
        <div v-for="(o, i) in brand.offices" :key="o.city" v-reveal class="office" :style="{ '--delay': `${i * 0.15}s` }">
          <span v-fit.parent class="giant condensed side office-city">{{ o.city }}</span>
          <div class="office-body">
            <p class="meta office-n">0{{ i + 1 }} / {{ o.hours }}</p>
            <a class="lead office-addr" :href="o.maps" target="_blank" rel="noopener" data-cursor="Visit">{{ o.street }}<br />{{ o.post }}</a>
            <p class="meta office-note">{{ i === 0 ? 'Studio, workshop and print room' : 'Studio and screening room' }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hero-scene {
  z-index: 0;
  left: auto;
  right: 0;
  width: 58%;

  @media (max-width: 860px) {
    width: 100%;
    opacity: 0.55;
  }
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.hero-mail {
  align-self: center;
  display: block;
  font-size: min(var(--fs-giant), 24vh);
  line-height: 0.82;

  .mask > span {
    transition: translate 0.9s var(--ease-slow);
  }

  &:hover .mask:nth-child(2) > span {
    translate: 0.2em 0;
  }
}

.hero-foot {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: var(--gutter);
  align-items: end;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);

  .lead {
    max-width: 22em;
    font-size: clamp(18px, 1.8vw, 30px);
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.hero-links {
  list-style: none;
  display: flex;
  gap: 20px;
  justify-content: flex-end;

  @media (max-width: 720px) {
    justify-content: flex-start;
  }
}

// ---------------------------------------------------------------- offices

.offices-inner {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--gutter);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100svh;
  }
}

.office {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 24px;
  align-items: end;
  padding-left: 24px;
  border-left: 1px solid color-mix(in srgb, var(--on) 35%, transparent);
}

// Sized to the longest city name so the spine fits the panel top to bottom.
.office-city {
  font-size: min(var(--fs-giant), 14.5vh);
  line-height: 0.78;
  justify-self: start;

  @media (max-width: 860px) {
    font-size: min(var(--fs-giant), 7vh);
  }
}

.office-addr {
  display: block;
  transition: translate 0.9s var(--ease-slow);

  &:hover {
    translate: 0.2em 0;
  }
}

.office-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 0.4em;
}

.office-n,
.office-note {
  opacity: 0.6;
}
</style>
