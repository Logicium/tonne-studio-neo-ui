<script setup lang="ts">
/**
 * The 404. A real page with a real status in the prerendered 404.html, never
 * a redirect home: a broken link should show up as one, and a visitor should
 * land somewhere useful.
 */
import { brand, nav } from '@/data/site'
</script>

<template>
  <div class="stack not-found">
    <section class="panel field-ink nf">
      <div class="grid-lines"></div>
      <div class="panel-inner nf-inner">
        <p class="meta">404</p>
        <h1 v-fit class="giant nf-title">Not here.</h1>
        <p class="lead nf-line">That page is not on {{ brand.domain }}. It may have moved, or the link may have a typo.</p>
        <nav aria-label="Main pages" class="nf-links meta">
          <router-link v-for="l in nav" :key="l.to" :to="l.to" class="line-link">{{ l.label }}</router-link>
        </nav>
        <router-link to="/" class="pill">Back to the start</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.nf {
  min-height: 100svh;
}

.nf-inner {
  display: grid;
  align-content: center;
  gap: clamp(20px, 3vh, 40px);
  min-height: 100svh;
  padding-top: var(--header-h);
}

.nf-line {
  max-width: 28ch;
}

.nf-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.pill {
  justify-self: start;
}
</style>
