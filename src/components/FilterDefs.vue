<script setup lang="ts">
import { HEX, type Pair } from '@/data/site'

// Print treatments for photography, defined once and referenced by id.
// Every image on the site goes through one of these: the picture is
// desaturated, pushed for contrast, then remapped onto two inks.
//   duo-*   a smooth duotone, shadow ink to highlight ink
//   riso-*  the same pair posterised to five steps, like a risograph pass
const pairs: Pair[] = [
  'ink-vermilion',
  'ink-ultramarine',
  'ink-lime',
  'ink-lilac',
  'ultramarine-lilac',
  'ultramarine-lime',
  'vermilion-lilac',
  'vermilion-bone',
  'ultramarine-bone',
]

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)

const defs = pairs.map((pair) => {
  const [a, b] = pair.split('-') as [keyof typeof HEX, keyof typeof HEX]
  const dark = rgb(HEX[a])
  const light = rgb(HEX[b])
  const smooth = [0, 1, 2].map((c) => `${dark[c]!.toFixed(3)} ${light[c]!.toFixed(3)}`)
  const steps = [0, 1, 2].map((c) =>
    [0, 1, 2, 3, 4].map((i) => (dark[c]! + (light[c]! - dark[c]!) * (i / 4)).toFixed(3)).join(' '),
  )
  return { pair, smooth, steps }
})
</script>

<template>
  <svg class="filter-defs" aria-hidden="true" focusable="false">
    <defs>
      <template v-for="d in defs" :key="d.pair">
        <filter :id="`duo-${d.pair}`" color-interpolation-filters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.25" intercept="-0.1" />
            <feFuncG type="linear" slope="1.25" intercept="-0.1" />
            <feFuncB type="linear" slope="1.25" intercept="-0.1" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="table" :tableValues="d.smooth[0]" />
            <feFuncG type="table" :tableValues="d.smooth[1]" />
            <feFuncB type="table" :tableValues="d.smooth[2]" />
          </feComponentTransfer>
        </filter>
        <filter :id="`riso-${d.pair}`" color-interpolation-filters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.35" intercept="-0.14" />
            <feFuncG type="linear" slope="1.35" intercept="-0.14" />
            <feFuncB type="linear" slope="1.35" intercept="-0.14" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="discrete" :tableValues="d.steps[0]" />
            <feFuncG type="discrete" :tableValues="d.steps[1]" />
            <feFuncB type="discrete" :tableValues="d.steps[2]" />
          </feComponentTransfer>
        </filter>
      </template>
    </defs>
  </svg>
</template>

<style scoped>
.filter-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
