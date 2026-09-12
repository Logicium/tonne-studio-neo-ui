import { reactive } from 'vue'
import type { Field } from '@/data/site'

// Shared state for the page curtain and the first-load sequence. The router
// asks the curtain to close before a route changes; App.vue opens it once
// the new page is on screen. `ready` flips when the preloader has left, so
// the hero can hold its entrance until there is something to enter onto.
export const app = reactive({
  ready: false,
  menuOpen: false,
  curtain: {
    field: 'vermilion' as Field,
    label: '',
    phase: 'idle' as 'idle' | 'in' | 'hold' | 'out',
  },
})

export const CURTAIN_IN = 1000
export const CURTAIN_HOLD = 160
export const CURTAIN_OUT = 1000

export const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms))
