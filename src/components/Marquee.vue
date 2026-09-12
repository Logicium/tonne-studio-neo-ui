<script setup lang="ts">
import { computed } from 'vue'

// A slow ribbon of words. The track is doubled so the loop is seamless and
// the speed is set from the number of items so long and short ribbons move
// at the same pace.
const props = withDefaults(defineProps<{ items: string[]; seconds?: number; reverse?: boolean }>(), {
  seconds: 0,
  reverse: false,
})
const duration = computed(() => (props.seconds || props.items.length * 5.5) + 's')
</script>

<template>
  <div class="marquee" :class="{ reverse }" aria-hidden="true">
    <div class="track" :style="{ animationDuration: duration }">
      <span v-for="(item, i) in [...items, ...items]" :key="i" class="item">
        <span class="word">{{ item }}</span>
        <span class="dot"></span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.marquee {
  overflow: hidden;
  white-space: nowrap;
}

.track {
  display: inline-flex;
  animation: slide linear infinite;
  will-change: transform;

  .reverse & {
    animation-direction: reverse;
  }
}

.item {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding-right: 0.35em;
}

.dot {
  width: 0.22em;
  height: 0.22em;
  background: currentColor;
  border-radius: 50%;
}

@keyframes slide {
  to {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
