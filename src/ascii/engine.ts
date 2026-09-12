// =============================================================
//  AsciiEngine. A picture rebuilt as a grid of mono glyphs.
//
//  The source (a still or a video frame) is sampled down to one
//  luminance value per cell, contrast is pushed, and each cell is
//  ordered through a Bayer matrix into a ramp of glyphs of rising
//  density. Glyphs are set in the highlight ink on a ground of the
//  shadow ink. Two ways to paint: `paint` draws a whole grid at once
//  (video runs this every frame); `cascade` reveals a grid top to
//  bottom behind a band of scrambling characters, which is how a
//  still arrives and what a hover replays.
// =============================================================

export interface AsciiOptions {
  dark: string
  light: string
  cell?: number // css px per glyph cell
  contrast?: number
  ramp?: string[]
}

// 8x8 Bayer matrix, normalised to 0..1.
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((r) => r.map((v) => (v + 0.5) / 64))

export const RAMP = [' ', '.', ':', '+', 'x', 'X', '#']
export const FONT = '"Geist Mono", ui-monospace, Menlo, monospace'

export class AsciiEngine {
  cols = 0
  rows = 0
  private cell = 0
  private ctx: CanvasRenderingContext2D
  private off = document.createElement('canvas')
  private offCtx: CanvasRenderingContext2D
  private raf = 0
  private ramp: string[]
  private contrast: number
  private cellCss: number
  animating = false

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: AsciiOptions,
  ) {
    this.ctx = canvas.getContext('2d')!
    this.offCtx = this.off.getContext('2d', { willReadFrequently: true })!
    this.ramp = opts.ramp ?? RAMP
    this.contrast = opts.contrast ?? 1.55
    this.cellCss = opts.cell ?? 7
  }

  // Size the grid to a css box. Returns false if there is nothing to draw.
  size(w: number, h: number) {
    if (!w || !h) return false
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    this.cell = Math.round(this.cellCss * dpr)
    this.cols = Math.ceil((w * dpr) / this.cell)
    this.rows = Math.ceil((h * dpr) / this.cell)
    this.canvas.width = this.cols * this.cell
    this.canvas.height = this.rows * this.cell
    this.off.width = this.cols
    this.off.height = this.rows
    this.ctx.font = `500 ${this.cell * 1.32}px ${FONT}`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    return true
  }

  // One luminance per cell, cover-cropped from the source. Null if the
  // source is cross-origin without CORS (the canvas would be tainted).
  sample(src: CanvasImageSource, sw: number, sh: number): Float32Array | null {
    const { cols, rows } = this
    if (!cols || !rows || !sw || !sh) return null
    const target = cols / rows
    let cw = sw
    let ch = sh
    if (sw / sh > target) cw = sh * target
    else ch = sw / target
    this.offCtx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, cols, rows)
    let data: ImageData
    try {
      data = this.offCtx.getImageData(0, 0, cols, rows)
    } catch {
      return null
    }
    const out = new Float32Array(cols * rows)
    const px = data.data
    const k = this.contrast
    for (let i = 0; i < cols * rows; i++) {
      const l = (0.2126 * px[i * 4]! + 0.7152 * px[i * 4 + 1]! + 0.0722 * px[i * 4 + 2]!) / 255
      out[i] = Math.min(1, Math.max(0, (l - 0.5) * k + 0.5))
    }
    return out
  }

  private step(lum: Float32Array, x: number, y: number) {
    const n = this.ramp.length
    return Math.min(n - 1, Math.floor(lum[y * this.cols + x]! * (n - 1) + BAYER[y & 7]![x & 7]!))
  }

  // Draw rows y0 (inclusive) to y1 (exclusive). `scramble` replaces every
  // lit cell with a random glyph of similar density.
  private drawRows(lum: Float32Array, y0: number, y1: number, scramble = false) {
    const { ctx, cell, cols } = this
    y0 = Math.max(0, y0)
    y1 = Math.min(this.rows, y1)
    if (y1 <= y0) return
    ctx.fillStyle = this.opts.dark
    ctx.fillRect(0, y0 * cell, cols * cell, (y1 - y0) * cell)
    ctx.fillStyle = this.opts.light
    const n = this.ramp.length
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < cols; x++) {
        let s = this.step(lum, x, y)
        if (s === 0) continue
        if (scramble) s = Math.max(1, Math.min(n - 1, s + Math.floor(Math.random() * 3) - 1))
        ctx.fillText(this.ramp[s]!, x * cell + cell / 2, y * cell + cell / 2 + cell * 0.05)
      }
    }
  }

  paint(lum: Float32Array) {
    this.drawRows(lum, 0, this.rows)
  }

  // Reveal top to bottom. A band of `bandRows` scrambling glyphs leads the
  // wavefront; everything above it is settled, everything below is ground.
  // If `over` is set the grid is already on screen and the band sweeps
  // across it instead of revealing it.
  cascade(lum: Float32Array, ms = 1400, over = false, done?: () => void) {
    this.cancel()
    this.animating = true
    const band = Math.max(4, Math.round(this.rows * 0.12))
    const total = this.rows + band
    const t0 = performance.now()
    if (!over) {
      this.ctx.fillStyle = this.opts.dark
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    let settled = 0
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      const e = 1 - Math.pow(1 - p, 2.2)
      const front = Math.floor(e * total)
      // Rows the front has passed are drawn true once and left alone.
      const settleTo = Math.min(this.rows, front - band)
      if (settleTo > settled) {
        this.drawRows(lum, settled, settleTo)
        settled = settleTo
      }
      // The band itself is redrawn scrambled every frame.
      this.drawRows(lum, Math.max(settled, front - band), Math.min(this.rows, front), true)
      if (p < 1) {
        this.raf = requestAnimationFrame(frame)
      } else {
        this.drawRows(lum, settled, this.rows)
        this.animating = false
        this.raf = 0
        done?.()
      }
    }
    this.raf = requestAnimationFrame(frame)
  }

  cancel() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.animating = false
  }
}
