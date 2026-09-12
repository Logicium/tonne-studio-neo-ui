<script setup lang="ts">
// The wordmark. Five letters cut on a 100 unit grid: bars of one width,
// an O that is a true circle, and Ns whose diagonals are hairlines so the
// stems carry all the weight. Each letter is its own group so the hero
// can raise them one at a time.
defineProps<{ title?: string }>()
</script>

<template>
  <svg class="wordmark" viewBox="0 0 486 100" fill="currentColor" role="img" :aria-label="title ?? 'Tonne'">
    <g class="l l-t"><path d="M0 0h80v18H49v82H31V18H0z" /></g>
    <g class="l l-o" fill-rule="evenodd">
      <path d="M94 50a50 50 0 1 0 100 0a50 50 0 1 0-100 0zm23 0a27 27 0 1 1 54 0a27 27 0 1 1-54 0z" />
    </g>
    <g class="l l-n1">
      <path d="M208 0h18v100h-18zM278 0h18v100h-18z" />
      <path d="M223 2L281 98" stroke="currentColor" stroke-width="4" fill="none" />
    </g>
    <g class="l l-n2">
      <path d="M310 0h18v100h-18zM380 0h18v100h-18z" />
      <path d="M325 2L383 98" stroke="currentColor" stroke-width="4" fill="none" />
    </g>
    <g class="l l-e"><path d="M412 0h74v18h-56v22h48v17h-48v25h56v18h-74z" /></g>
  </svg>
</template>

<style scoped>
.wordmark {
  display: block;
  height: 1em;
  width: auto;
  overflow: visible;
}
</style>
