import type { Directive } from 'vue'

// v-fit — keeps a giant line inside its box. The element keeps the size
// its CSS asks for; if the longest line would overrun the available width
// (or height, for sideways type) the font-size is scaled down just enough
// to fit. Re-measured on resize and once the web fonts land.
//
//   v-fit           measure against the element's own width
//   v-fit.parent    measure against the parent's inner box (for shrink-
//                   wrapped or absolutely placed elements)
//   v-fit="0.9"     use only that share of the available room
type El = HTMLElement & { __fit?: () => void; __ro?: ResizeObserver }

const inner = (el: HTMLElement, vertical: boolean) => {
  const cs = getComputedStyle(el)
  return vertical
    ? el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    : el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
}

function fit(el: HTMLElement, useParent: boolean, share: number) {
  el.style.fontSize = ''
  const vertical = getComputedStyle(el).writingMode.startsWith('vertical')
  // The room is the element's own box, capped by its parent's: a grid
  // track sized by content can grow past its container, and then the
  // element's own width is the overflow, not the limit.
  const parent = el.parentElement!
  const own = useParent || vertical ? inner(parent, vertical) : Math.min(inner(el, vertical), inner(parent, vertical))
  const avail = own * share
  if (avail <= 0) return
  const lines = Array.from(el.querySelectorAll<HTMLElement>('.mask > *'))
  const targets = lines.length ? lines : [el]
  // Each line is measured as an unwrapped inline-block: an inline span
  // reports no scroll size at all, and a stretched block reports its box
  // rather than its text, so neither can be read as it stands.
  let need = 0
  for (const t of targets) {
    const prevWs = t.style.whiteSpace
    const prevDisplay = t.style.display
    t.style.whiteSpace = 'nowrap'
    t.style.display = 'inline-block'
    need = Math.max(need, vertical ? t.scrollHeight : t.scrollWidth)
    t.style.whiteSpace = prevWs
    t.style.display = prevDisplay
  }
  if (need > avail) {
    const fs = parseFloat(getComputedStyle(el).fontSize)
    el.style.fontSize = `${Math.floor(fs * (avail / need) * 0.985)}px`
  }
}

export const fitText: Directive<El, number | undefined> = {
  mounted(el, binding) {
    const run = () => fit(el, !!binding.modifiers.parent, binding.value ?? 1)
    el.__fit = run
    run()
    document.fonts?.ready.then(run)
    // A face that starts loading after mount (the display face on a cold
    // cache) lands later than fonts.ready; re-measure when any face lands.
    document.fonts?.addEventListener('loadingdone', run)
    window.setTimeout(run, 300)
    window.setTimeout(run, 1200)
    el.__ro = new ResizeObserver(run)
    el.__ro.observe(el.parentElement ?? el)
    window.addEventListener('resize', run)
  },
  updated(el) {
    el.__fit?.()
  },
  beforeUnmount(el) {
    el.__ro?.disconnect()
    if (el.__fit) {
      window.removeEventListener('resize', el.__fit)
      document.fonts?.removeEventListener('loadingdone', el.__fit)
    }
  },
}
