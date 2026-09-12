<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Wordmark from '@/components/Wordmark.vue'
import { brand, nav, type Field } from '@/data/site'
import { app } from '@/composables/useCurtain'
import { getLenis } from '@/composables/useLenis'

// The bar is only ever three things: the mark, the menu, the contact pill.
// Its ink follows the panel under it (App.vue sets `--hdr` on the root).
// The menu is a full field of ink that takes the colour of whichever link
// the pointer rests on.
const router = useRouter()
const route = useRoute()
const hover = ref<Field | null>(null)

const links = [{ label: 'Home', to: '/', field: 'vermilion' as Field }, ...nav]

const toggle = (v = !app.menuOpen) => {
  app.menuOpen = v
  document.body.classList.toggle('locked', v)
  if (v) getLenis()?.stop()
  else getLenis()?.start()
  if (!v) hover.value = null
}

const go = (to: string) => {
  toggle(false)
  if (to !== route.path) router.push(to)
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && app.menuOpen) toggle(false)
}
window.addEventListener('keydown', onKey)
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(
  () => route.path,
  () => app.menuOpen && toggle(false),
)
</script>

<template>
  <header class="header" :class="{ open: app.menuOpen }">
    <router-link to="/" class="mark" aria-label="Tonne, home" @click="toggle(false)">
      <Wordmark />
    </router-link>
    <div class="right">
      <router-link to="/contact" class="pill contact">Contact</router-link>
      <button class="pill menu-btn" :aria-expanded="app.menuOpen" @click="toggle()">
        <span class="lines" aria-hidden="true"><i></i><i></i></span>
        <span class="txt">{{ app.menuOpen ? 'Close' : 'Menu' }}</span>
      </button>
    </div>
  </header>

  <nav class="menu" :class="[{ open: app.menuOpen }, hover ? `field-${hover}` : 'field-ink']" aria-label="Site">
    <div class="menu-inner">
      <p class="meta menu-meta">{{ brand.issue }}</p>
      <ul class="menu-list">
        <li v-for="(l, i) in links" :key="l.to" :style="{ '--i': i }">
          <a
            v-fit
            :href="l.to"
            class="menu-link giant"
            :class="{ current: route.path === l.to }"
            @mouseenter="hover = l.field"
            @mouseleave="hover = null"
            @click.prevent="go(l.to)"
          >
            <span class="num meta">0{{ i + 1 }}</span>
            <span class="mask">
              <span class="swap">
                <span class="pair">
                  <span class="up">{{ l.label }}</span>
                  <span class="it" aria-hidden="true">{{ l.label }}</span>
                </span>
              </span>
            </span>
          </a>
        </li>
      </ul>
      <div class="menu-foot">
        <p class="meta">{{ brand.offices[0]!.city }} / {{ brand.offices[1]!.city }}</p>
        <a class="meta line-link" :href="`mailto:${brand.email}`">{{ brand.email }}</a>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 70;
  height: var(--header-h);
  padding: 0 var(--gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--hdr, var(--bone));
  --on: var(--hdr, var(--bone));
  --bg: var(--hdr-bg, var(--ink));
  transition: color 0.7s var(--ease-slow);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  &.open {
    color: var(--bone);
    --on: var(--bone);
    --bg: var(--ink);
  }
}

.mark {
  display: block;
  font-size: 18px;
  transition: transform 0.9s var(--ease-slow);

  &:hover {
    transform: translateX(4px);
  }
}

.right {
  display: flex;
  gap: 10px;
}

.contact {
  @media (max-width: 640px) {
    display: none;
  }
}

.menu-btn {
  .lines {
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
    width: 16px;

    i {
      display: block;
      height: 1.5px;
      background: currentColor;
      transition: transform 0.7s var(--ease-slow);
    }
  }

  .open & .lines {
    i:first-child {
      transform: translateY(2.75px) rotate(45deg);
    }
    i:last-child {
      transform: translateY(-2.75px) rotate(-45deg);
    }
  }
}

// The menu. Closed, it is clipped to nothing at the top. Opening drops the
// field over the page; the links then rise out of their masks.
.menu {
  position: fixed;
  inset: 0;
  z-index: 65;
  background: var(--bg);
  color: var(--on);
  clip-path: inset(0 0 100% 0);
  transition:
    clip-path 1.1s var(--ease-in-out),
    background 1.8s var(--ease-slow),
    color 1.8s var(--ease-slow);
  pointer-events: none;

  &.open {
    clip-path: inset(0 0 0 0);
    pointer-events: auto;
  }
}

.menu-inner {
  height: 100%;
  padding: calc(var(--header-h) + 8px) var(--gutter) var(--gutter);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.menu-meta {
  opacity: 0;
  transition: opacity 0.8s 0.9s;

  .open & {
    opacity: 0.7;
  }
}

.menu-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.02em;
}

.menu-link {
  display: flex;
  align-items: baseline;
  gap: 0.15em;
  // Capped against the viewport height so four lines always fit.
  font-size: min(clamp(56px, 13.5vw, 200px), 16.5vh);
  line-height: 0.9;
  transition: opacity 1.3s var(--ease-slow);

  .num {
    opacity: 0.6;
    translate: 0 -1.6em;
  }

  // The mask here gets its descender room from the line box rather than
  // padding, so the italic twin waiting below cannot peek through.
  .mask {
    padding: 0 0.06em 0 0.04em;
    margin: 0 -0.06em 0 -0.04em;
    line-height: 1.08;
  }

  // Entrance: the whole line rises out of its mask.
  .swap {
    display: block;
    transform: translateY(105%);
    transition: transform 1.2s var(--ease-slow);
    transition-delay: calc(0.35s + var(--i) * 0.08s);
  }

  .open & .swap {
    transform: none;
  }

  // Hover: the upright word slides up and out while its italic twin
  // slides in from below, one slow movement rather than a style switch.
  .pair {
    position: relative;
    display: block;
    transition: translate 1.3s var(--ease-slow);
  }

  .up,
  .it {
    display: block;
  }

  .it {
    position: absolute;
    top: 100%;
    left: 0;
    font-style: italic;
  }

  &:hover .pair {
    translate: 0 -100%;
  }

  .menu-list:hover &:not(:hover) {
    opacity: 0.35;
  }

  &.current {
    opacity: 0.35;
  }
}

.menu-foot {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  opacity: 0;
  transition: opacity 0.8s 1s;

  .open & {
    opacity: 1;
  }
}
</style>
