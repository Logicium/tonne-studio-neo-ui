<script setup lang="ts">
import { ref } from 'vue'
import VideoPlate from '@/components/VideoPlate.vue'
import { projects } from '@/data/site'
import { picks } from '@/data/picker'

// Working page, not linked from the site. For each brand, every candidate
// clip is shown twice: raw, and through the ascii engine in that brand's
// inks, the way it would print as Fig. 02. Click a card to mark it; the
// summary at the top spells out the choice to paste back.
// Choices live in the URL hash (#halden=3&ochre=2) so the address itself
// carries the picks and can be pasted back.
const readHash = () => Object.fromEntries(new URLSearchParams(location.hash.slice(1)).entries())
const chosen = ref<Record<string, string>>(readHash())

const pick = (slug: string, id: string) => {
  const brand = picks.find((b) => b.slug === slug)
  const n = String((brand?.clips.findIndex((c) => c.id === id) ?? -1) + 1)
  const next = { ...chosen.value, [slug]: chosen.value[slug] === n ? '' : n }
  chosen.value = next
  const q = new URLSearchParams(Object.entries(next).filter(([, v]) => v))
  history.replaceState(null, '', `#${q.toString()}`)
}

const isMarked = (slug: string, i: number) => chosen.value[slug] === String(i + 1)

const summary = () =>
  Object.entries(chosen.value)
    .filter(([, n]) => n)
    .map(([slug, n]) => `${slug} ${n}`)
    .join(', ')
</script>

<template>
  <div class="picker field-ink">
    <header class="pick-head">
      <p class="meta">Working page / Fig. 02 clip picker</p>
      <h1 class="heading">Pick one clip per brand.</h1>
      <p class="copy">Left is the raw clip, right is how it prints. Click either to mark it. Kolm is settled and left out.</p>
      <p class="meta chosen">{{ summary() || 'Nothing marked yet' }}</p>
      <p class="meta dim">Your picks are also in this page's address. Copy the URL and paste it back.</p>
    </header>

    <section
      v-for="brand in picks"
      :key="brand.slug"
      class="brand"
      :class="`field-${projects.find((p) => p.slug === brand.slug)?.field}`"
    >
      <div class="brand-head">
        <h2 class="display">{{ brand.title }}</h2>
        <p class="meta">{{ brand.note }}</p>
      </div>
      <ul class="cards">
        <li
          v-for="(c, i) in brand.clips"
          :key="c.id"
          class="card"
          :class="{ marked: isMarked(brand.slug, i), current: c.current }"
          @click="pick(brand.slug, c.id)"
        >
          <div class="pair">
            <video :src="c.src" muted loop playsinline autoplay preload="metadata" class="raw"></video>
            <VideoPlate :src="c.src" :pair="projects.find((p) => p.slug === brand.slug)!.pair" ratio="3 / 4" />
          </div>
          <div class="cap">
            <span class="meta num">{{ brand.slug }} {{ i + 1 }}<template v-if="c.current"> / current</template></span>
            <span class="desc">{{ c.desc }}</span>
            <a :href="`https://www.pexels.com/video/${c.id}/`" target="_blank" rel="noopener" class="meta line-link" @click.stop>Pexels {{ c.id }}</a>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.picker {
  background: var(--bg);
  color: var(--on);
}

.pick-head {
  padding: calc(var(--header-h) + 24px) var(--gutter) 48px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .copy {
    max-width: 40em;
  }
}

.dim {
  opacity: 0.55;
  text-transform: none;
  letter-spacing: 0.04em;
}

.chosen {
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--on) 35%, transparent);
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0.04em;
  user-select: all;
}

.brand {
  background: var(--bg);
  color: var(--on);
  padding: 48px var(--gutter) 64px;
}

.brand-head {
  display: flex;
  align-items: baseline;
  gap: 24px;
  margin-bottom: 24px;

  .display {
    font-size: clamp(40px, 6vw, 96px);
  }
}

.cards {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.card {
  cursor: pointer;
  padding: 10px;
  border: 1.5px solid transparent;
  border-radius: 6px;
  transition: border-color 0.5s var(--ease-slow);

  &:hover {
    border-color: color-mix(in srgb, var(--on) 40%, transparent);
  }

  &.marked {
    border-color: var(--on);
  }
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  .raw {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    background: #000;
  }
}

.cap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;

  .num {
    opacity: 0.7;
  }

  .desc {
    font-size: 14px;
    line-height: 1.35;
  }
}
</style>
