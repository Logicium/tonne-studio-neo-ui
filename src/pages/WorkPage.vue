<script setup lang="ts">
import { ref } from 'vue'
import Plate from '@/components/Plate.vue'
import { useSlides } from '@/composables/useSlides'
import { projects } from '@/data/site'

// The index as one long sheet. An ultramarine cover, then one full screen
// per project in its own colour, laid side by side and pulled past the
// viewport as the page scrolls. Inside each screen the parts travel at
// their own speeds: the plate leads, the title lags, the facts drift by.
const wrap = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const { progress, index, count } = useSlides(wrap, track)
</script>

<template>
  <div ref="wrap" class="work">
    <div class="view">
      <div ref="track" class="track">
        <section class="slide field-ultramarine cover">
          <div class="grid-lines"></div>
          <div class="panel-inner cover-inner">
            <p class="meta">Index / 2025 to 2027</p>
            <h1 v-reveal v-fit class="giant cover-title">
              <span class="mask"><span>Six</span></span>
              <span class="mask"><span>brands,</span></span>
              <span class="mask"><span>six <em class="voice">colours.</em></span></span>
            </h1>
            <div class="cover-foot">
              <ul class="cover-list meta">
                <li v-for="(p, i) in projects" :key="p.slug">
                  <span>0{{ i + 1 }}</span><span>{{ p.title }}</span><span>{{ p.year }}</span>
                </li>
              </ul>
              <p class="meta cover-hint">Scroll to travel <span aria-hidden="true">→</span></p>
            </div>
          </div>
        </section>

        <router-link
          v-for="(p, i) in projects"
          :key="p.slug"
          :to="`/work/${p.slug}`"
          class="slide entry"
          :class="[`field-${p.field}`, { flip: i % 2 === 1 }]"
          data-cursor="Open"
        >
          <div class="grid-lines"></div>
          <div class="panel-inner entry-inner">
            <span class="entry-n meta">0{{ i + 1 }} / 06</span>
            <h2 v-fit class="giant condensed side entry-title" :style="{ '--chars': p.title.length }">{{ p.title }}</h2>
            <div class="entry-plate">
              <Plate :src="p.hero" :alt="p.client" :pair="p.pair" mode="riso" ratio="4 / 5" eager />
            </div>
            <div class="entry-meta">
              <p class="lead entry-summary">{{ p.summary }}</p>
              <dl class="meta entry-facts">
                <div><dt>Client</dt><dd>{{ p.client }}</dd></div>
                <div><dt>Sector</dt><dd>{{ p.sector }}</dd></div>
                <div><dt>Year</dt><dd>{{ p.year }}</dd></div>
                <div><dt>Scope</dt><dd>{{ p.services.join(', ') }}</dd></div>
              </dl>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Where you are on the sheet: a hairline that fills as you travel. -->
      <div class="rail-foot meta" aria-hidden="true">
        <span class="rail-count">{{ String(index).padStart(2, '0') }} / {{ String(count - 1).padStart(2, '0') }}</span>
        <span class="rail-line"><span class="rail-fill" :style="{ transform: `scaleX(${progress})` }"></span></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// ---------------------------------------------------------------- rail

.work {
  position: relative;
  // Height is set from JS on desktop; on small screens the slides stack.
}

.view {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}

.track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.slide {
  --x: 0;
  position: relative;
  flex: none;
  width: 100vw;
  height: 100svh;
  overflow: hidden;
  background: var(--bg);
  color: var(--on);
}

.rail-foot {
  position: absolute;
  left: var(--gutter);
  right: var(--gutter);
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--hdr, var(--bone));
  mix-blend-mode: normal;
  pointer-events: none;
  transition: color 0.7s var(--ease-slow);
}

.rail-count {
  opacity: 0.8;
}

.rail-line {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, currentColor 30%, transparent);
  position: relative;
}

.rail-fill {
  position: absolute;
  inset: 0;
  background: currentColor;
  transform-origin: 0 50%;
}

// ---------------------------------------------------------------- cover

.cover-inner {
  display: grid;
  grid-template-rows: auto 1fr auto;

  // Room under the list for the travel line on a phone.
  @media (max-width: 860px) {
    padding-bottom: 56px;
  }
}

.cover-title {
  align-self: center;
  font-size: min(var(--fs-giant), 24vh);
  // The title lags the sheet a little, so the cover seems to hold on.
  transform: translate3d(calc(var(--x) * -14vw), 0, 0);
}

.cover-foot {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--gutter);
  align-items: end;
  transform: translate3d(calc(var(--x) * 10vw), 0, 0);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 16px;

    .cover-hint {
      order: -1;
    }
  }
}

.cover-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);
  opacity: 0.85;

  li {
    display: flex;
    gap: 10px;

    span:nth-child(2) {
      flex: 1;
    }
  }

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.cover-hint {
  opacity: 0.8;
  white-space: nowrap;
}

// ---------------------------------------------------------------- entries

// Each entry: the title stands along one edge, the plate takes the middle,
// the facts sit in the far column. Odd entries mirror. As the sheet moves,
// the plate leads (it is nearest), the title lags (it is the wall), and
// the facts float between.
.entry {
  display: block;
}

.entry-inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1.1fr) minmax(0, 1fr);
  grid-template-areas: 'title plate meta';
  gap: var(--gutter);
  align-items: end;

  .flip & {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr) auto;
    grid-template-areas: 'meta plate title';
  }

  @media (max-width: 860px) {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-areas:
      'title plate'
      'title meta';
    align-items: start;
    gap: 16px;
    padding-top: calc(var(--header-h) + 28px);
    padding-bottom: 56px;

    .flip & {
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-areas:
        'title plate'
        'title meta';
    }
  }
}

.entry-n {
  position: absolute;
  top: calc(var(--header-h) + 8px);
  left: var(--gutter);
  opacity: 0.8;
  transform: translate3d(calc(var(--x) * 16vw), 0, 0);
}

.entry-title {
  grid-area: title;
  // Sized from the letter count so every title stands about 80vh tall.
  font-size: min(var(--fs-giant), calc(150vh / var(--chars, 6)));
  line-height: 0.8;
  justify-self: start;
  // Lags the sheet by a fifth of a screen: the slowest thing on the wall.
  // (Inside the 180° turn a positive x-translate moves left on screen.)
  transform: rotate(180deg) translate3d(calc(var(--x) * 18vw), 0, 0);
  transition: translate 1.2s var(--ease-slow);

  .flip & {
    justify-self: end;
  }

  .entry:hover & {
    translate: 0 -1.5vh;
  }

  @media (max-width: 860px) {
    align-self: end;
    font-size: min(var(--fs-giant), calc(120vh / var(--chars, 6)));
  }
}

.entry-plate {
  grid-area: plate;
  max-height: calc(100svh - var(--header-h) - 2 * var(--gutter) - 8px);
  align-self: center;
  // Leads the sheet, and settles in from a hair smaller.
  transform: translate3d(calc(var(--x) * 22vw), 0, 0) scale(calc(1 - min(1, max(var(--x), -1 * var(--x))) * 0.08));
  transform-origin: 50% 50%;

  :deep(.plate) {
    max-height: calc(100svh - var(--header-h) - 2 * var(--gutter) - 8px);
    margin: 0 auto;
  }

  @media (max-width: 860px) {
    align-self: start;
    max-height: 44svh;

    :deep(.plate) {
      max-height: 44svh;
      margin: 0 0 0 auto;
    }
  }

  // The picture inside slides against its frame, a second layer of depth.
  :deep(.plate img) {
    transform: translate3d(calc(var(--x) * 6%), 0, 0) scale(1.12);
  }
}

.entry-meta {
  grid-area: meta;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transform: translate3d(calc(var(--x) * 9vw), 0, 0);
  opacity: calc(1 - min(1, max(var(--x), -1 * var(--x))) * 0.6);
}

.entry-summary {
  max-width: 18em;
  font-size: clamp(18px, 1.7vw, 30px);

  @media (max-width: 860px) {
    font-size: 16px;
    max-width: none;
  }
}

.entry-facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 24px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--on) 35%, transparent);

  dt {
    opacity: 0.55;
    margin-bottom: 4px;
  }

  @media (max-width: 860px) {
    gap: 8px 16px;
    padding-top: 10px;

    // Scope is the one fact that runs long; the summary already says it.
    div:last-child {
      display: none;
    }
  }
}

</style>
