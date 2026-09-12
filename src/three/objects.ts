// =============================================================
//  ObjectScene. One sculptural object per page, lit by the page.
//
//  Chrome only looks like chrome if there is a room to reflect, so
//  each scene builds its own: a sphere the colour of the field the
//  object sits on, with four bone softboxes hung around it. The
//  object then carries the page colour in its body and bone in its
//  highlights, which ties it to the type beside it. Motion is slow:
//  an idle turn, a float, a tilt toward the pointer and a quarter
//  turn over the length of the panel's scroll.
// =============================================================

import {
  ACESFilmicToneMapping,
  BackSide,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export type Model = 'ring' | 'slabs' | 'orb' | 'knot' | 'pill'

export interface ObjectOptions {
  model: Model
  field: string
  tint: string
  reducedMotion?: boolean
  roughness?: number
  // How far the object drifts with the pointer and the scroll, in scene
  // units at full deflection. 0 pins it in place.
  parallax?: number
}

const BONE = new Color('#f2ede3')

function buildRoom(field: Color) {
  const room = new Scene()
  const wall = new Mesh(new SphereGeometry(30, 32, 32), new MeshBasicMaterial({ color: field.clone().multiplyScalar(0.9), side: BackSide }))
  room.add(wall)
  const box = (w: number, h: number, at: Vector3, c: Color, k: number) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: c.clone().multiplyScalar(k), side: DoubleSide }))
    m.position.copy(at)
    m.lookAt(0, 0, 0)
    room.add(m)
  }
  box(9, 4, new Vector3(-7, 6, 4), BONE, 3.2)
  box(4, 12, new Vector3(9, 1, -3), BONE, 2.0)
  box(3, 3, new Vector3(3, 9, 6), BONE, 5)
  box(14, 3, new Vector3(0, -9, 3), field, 1.8)
  box(6, 6, new Vector3(-2, -3, -10), field, 1.2)
  return room
}

function buildObject(model: Model, material: MeshPhysicalMaterial) {
  const g = new Group()
  switch (model) {
    case 'ring':
      g.add(new Mesh(new TorusGeometry(1.15, 0.5, 128, 256), material))
      break
    case 'orb':
      g.add(new Mesh(new SphereGeometry(1.3, 160, 160), material))
      break
    case 'knot':
      g.add(new Mesh(new TorusKnotGeometry(0.82, 0.3, 480, 72, 2, 3), material))
      break
    case 'pill': {
      const geo = new RoundedBoxGeometry(0.9, 2.6, 0.9, 10, 0.45)
      for (let i = 0; i < 3; i++) {
        const m = new Mesh(geo, material)
        m.position.set((i - 1) * 1.15, (i - 1) * -0.35, (i - 1) * -0.3)
        m.rotation.z = -0.35 + i * 0.12
        g.add(m)
      }
      break
    }
    case 'slabs': {
      const geo = new RoundedBoxGeometry(2.7, 0.36, 1.6, 8, 0.1)
      for (let i = 0; i < 3; i++) {
        const m = new Mesh(geo, material)
        m.position.set((i - 1) * 0.55, (i - 1) * 0.62, (i - 1) * -0.25)
        g.add(m)
      }
      g.rotation.set(0.35, -0.5, 0.1)
      break
    }
  }
  return g
}

export class ObjectScene {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera: PerspectiveCamera
  private object: Group
  private material: MeshPhysicalMaterial
  private raf = 0
  private t0 = performance.now()
  private pointer = { x: 0, y: 0 }
  private tilt = { x: 0, y: 0 }
  private scroll = 0
  private inView = true
  private scale = 0
  private drift = { x: 0, y: 0 }
  private parallax: number
  private reduced: boolean
  private ro: ResizeObserver

  constructor(
    private canvas: HTMLCanvasElement,
    opts: ObjectOptions,
  ) {
    this.reduced = !!opts.reducedMotion
    this.parallax = opts.parallax ?? 0.5
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05

    this.camera = new PerspectiveCamera(32, 1, 0.1, 100)
    this.camera.position.set(0, 0, 7)

    const pmrem = new PMREMGenerator(this.renderer)
    const room = buildRoom(new Color(opts.field))
    this.scene.environment = pmrem.fromScene(room, 0.03).texture
    pmrem.dispose()

    this.material = new MeshPhysicalMaterial({
      color: new Color(opts.tint),
      metalness: 1,
      roughness: opts.roughness ?? 0.16,
      envMapIntensity: 1.15,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    })
    this.object = buildObject(opts.model, this.material)
    this.object.userData.base = this.object.rotation.clone()
    this.scene.add(this.object)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas.parentElement ?? canvas)
    this.resize()
    if (this.reduced) this.still()
    else this.loop()
  }

  private resize() {
    const host = this.canvas.parentElement ?? this.canvas
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // Keep the object the same size on screen on tall viewports.
    this.camera.fov = w < h ? 44 : 32
    this.camera.updateProjectionMatrix()
    if (this.reduced) this.still()
  }

  // Reduced motion: one settled frame, no loop.
  private still() {
    const base = this.object.userData.base
    this.object.scale.setScalar(1)
    this.object.rotation.set(base.x + 0.3, base.y + 0.5, base.z)
    this.renderer.render(this.scene, this.camera)
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x
    this.pointer.y = y
  }

  setScroll(p: number) {
    this.scroll = p
  }

  setInView(v: boolean) {
    this.inView = v
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    if (!this.inView && this.scale >= 1) return
    const t = (performance.now() - this.t0) / 1000

    // Entrance. The object grows in over a slow second and a half.
    const e = Math.min(1, t / 1.6)
    this.scale = 1 - Math.pow(1 - e, 3)
    const s = 0.6 + 0.4 * this.scale
    this.object.scale.setScalar(s)

    if (this.reduced) {
      this.object.rotation.set(0.3, 0.5, 0)
      this.renderer.render(this.scene, this.camera)
      return
    }

    this.tilt.x += (this.pointer.y * 0.25 - this.tilt.x) * 0.035
    this.tilt.y += (this.pointer.x * 0.35 - this.tilt.y) * 0.035
    // The object leans toward the pointer and sinks against the scroll,
    // slowly, so it reads as sitting in a deeper layer than the type.
    this.drift.x += (this.pointer.x * this.parallax - this.drift.x) * 0.03
    this.drift.y += (this.pointer.y * this.parallax * 0.6 - this.drift.y) * 0.03

    const base = this.object.userData.base ?? (this.object.userData.base = this.object.rotation.clone())
    this.object.rotation.x = base.x + Math.sin(t * 0.21) * 0.18 + this.tilt.x + this.scroll * 0.9
    this.object.rotation.y = base.y + t * 0.16 + this.tilt.y
    this.object.rotation.z = base.z + Math.sin(t * 0.13) * 0.08
    this.object.position.x = this.drift.x
    this.object.position.y = Math.sin(t * 0.5) * 0.09 + this.drift.y - this.scroll * (0.6 + this.parallax)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.object.traverse((o) => {
      if (o instanceof Mesh) o.geometry.dispose()
    })
    this.material.dispose()
    this.scene.environment?.dispose()
    this.renderer.dispose()
  }
}
