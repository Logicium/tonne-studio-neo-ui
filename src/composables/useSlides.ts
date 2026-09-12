import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// Full-screen slides on a horizontal rail, driven by vertical scroll.
// `root` is a tall wrapper (one viewport height plus one viewport width per
// slide after the first); its child stays sticky and `track` slides left
// through it. Every `.slide` inside the track is given `--x`: where it
// stands relative to the viewport in viewport widths, 0 when it fills the
// screen, +1 one screen to the right, -1 one screen to the left. The CSS
// turns that into parallax: things nearer the eye travel further.
// The same rail on every screen size; a phone just gets narrower slides.
// Reduced motion does not disable it: nothing here animates on its own,
// the sheet only moves as far as the visitor scrolls.
export function useSlides(root: Ref<HTMLElement | null>, track: Ref<HTMLElement | null>) {
  const progress = ref(0)
  const index = ref(0)
  const count = ref(0)
  let raf = 0
  let slides: HTMLElement[] = []

  const isRail = () => true

  // Height so that one viewport of scroll moves the track one slide.
  const size = () => {
    const el = root.value
    if (!el) return
    if (!isRail()) {
      el.style.height = ''
      return
    }
    el.style.height = `${window.innerHeight + Math.max(0, slides.length - 1) * window.innerWidth}px`
  }

  const update = () => {
    raf = 0
    const el = root.value
    const t = track.value
    if (!el || !t) return
    if (!isRail()) {
      t.style.transform = ''
      for (const s of slides) s.style.setProperty('--x', '0')
      return
    }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const r = el.getBoundingClientRect()
    const total = el.offsetHeight - vh
    const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
    const steps = Math.max(0, slides.length - 1)
    const pos = p * steps
    t.style.transform = `translate3d(${(-pos * vw).toFixed(1)}px, 0, 0)`
    for (let i = 0; i < slides.length; i++) {
      const x = Math.max(-1.5, Math.min(1.5, i - pos))
      slides[i]!.style.setProperty('--x', x.toFixed(4))
    }
    progress.value = p
    index.value = Math.round(pos)
  }

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update)
  }

  const resize = () => {
    size()
    schedule()
  }

  onMounted(() => {
    slides = Array.from(track.value?.querySelectorAll<HTMLElement>('.slide') ?? [])
    count.value = slides.length
    size()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', resize)
    update()
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', resize)
  })

  return { progress, index, count }
}
