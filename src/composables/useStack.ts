import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// Stacked panels. Every `.panel` inside `root` is sticky at the top of the
// viewport and the next one scrolls up over it. Each scroll frame sets
// `--cover` (0 to 1) on every panel: how far its follower has covered it.
// The CSS turns that into scale and darkening, and a page can bind its own
// transforms to it (the hero wordmark turns sideways on it). The element
// after the stack counts as the last panel's follower, so the stack hands
// off to whatever section comes next with the same motion.
export function useStack(root: Ref<HTMLElement | null>) {
  const active = ref(0)
  let raf = 0
  let panels: HTMLElement[] = []
  let tail: HTMLElement | null = null

  const update = () => {
    raf = 0
    const el = root.value
    if (!el) return
    const vh = window.innerHeight
    let current = 0
    for (let i = 0; i < panels.length; i++) {
      const p = panels[i]!
      const next = panels[i + 1] ?? tail
      const cover = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh)) : 0
      p.style.setProperty('--cover', cover.toFixed(4))
      p.classList.toggle('covered', cover > 0.002)
      if (p.getBoundingClientRect().top <= vh * 0.5) current = i
    }
    active.value = current
  }

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update)
  }

  onMounted(() => {
    if (!root.value) return
    panels = Array.from(root.value.querySelectorAll<HTMLElement>(':scope > .panel'))
    tail = root.value.nextElementSibling as HTMLElement | null
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
  })

  return { active }
}
