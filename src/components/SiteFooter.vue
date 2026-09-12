<script setup lang="ts">
import Wordmark from '@/components/Wordmark.vue'
import { brand, nav } from '@/data/site'
import { scrollToY } from '@/composables/useLenis'

// The footer is one quiet line and the mark. Every destination, both
// addresses and the socials sit in a single row of mono, centred, with air
// above and below, so the giant wordmark beneath does all the talking.
// Addresses open the map; the cursor says so.
</script>

<template>
  <footer class="footer field-ink">
    <p class="foot-line meta">
      <span class="foot-group">
        <router-link v-for="l in nav" :key="l.to" :to="l.to" class="line-link">{{ l.label }}</router-link>
        <a :href="`mailto:${brand.email}`" class="line-link">{{ brand.email }}</a>
      </span>
      <span class="foot-group dim">
        <a v-for="o in brand.offices" :key="o.city" :href="o.maps" target="_blank" rel="noopener" class="line-link" data-cursor="Visit">
          {{ o.city }}, {{ o.street }}
        </a>
      </span>
      <span class="foot-group dim">
        <a v-for="s in brand.socials" :key="s.label" :href="s.href" target="_blank" rel="noopener" class="line-link">{{ s.label }}</a>
      </span>
    </p>

    <div class="mark-row" aria-hidden="true">
      <Wordmark />
    </div>
    <div class="legal meta">
      <span>© 2027 Tonne ApS</span>
      <span>Est. {{ brand.founded }}, Copenhagen</span>
      <button class="line-link" @click="scrollToY(0)">Back to top</button>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  position: relative;
  z-index: 2;
  background: var(--bg);
  color: var(--on);
  padding: clamp(96px, 14vw, 220px) var(--gutter) 24px;
}

.foot-line {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px 48px;
}

.foot-group {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 22px;
}

.dim {
  opacity: 0.6;
}

.mark-row {
  margin-top: clamp(72px, 11vw, 180px);
  font-size: 18.5vw;
  line-height: 1;

  :deep(.wordmark) {
    width: 100%;
    height: auto;
  }
}

.legal {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--on) 25%, transparent);
  opacity: 0.6;
}
</style>
