// Everything editable about the studio lives here.

export type Field = 'vermilion' | 'ultramarine' | 'lime' | 'lilac' | 'ink'

// Duotone pairs are named shadow-highlight. See FilterDefs.vue.
export type Pair =
  | 'ink-vermilion'
  | 'ink-ultramarine'
  | 'ink-lime'
  | 'ink-lilac'
  | 'ultramarine-lilac'
  | 'ultramarine-lime'
  | 'vermilion-lilac'
  | 'vermilion-bone'
  | 'ultramarine-bone'

export const HEX: Record<Field | 'bone', string> = {
  vermilion: '#ff3d1f',
  ultramarine: '#2230ff',
  lime: '#d4ff3a',
  lilac: '#c9b4ff',
  ink: '#0d0c0b',
  bone: '#f2ede3',
}

export const brand = {
  name: 'Tonne',
  domain: 'tonne.studio',
  email: 'hello@tonne.studio',
  line: 'A design studio with weight.',
  founded: 2019,
  issue: 'Issue 01 / Autumn 2027',
  offices: [
    {
      city: 'Copenhagen',
      street: 'Refshalevej 163A',
      post: '1432 København K',
      hours: 'CET 09 to 18',
      maps: 'https://www.google.com/maps/search/?api=1&query=Refshalevej+163A+1432+K%C3%B8benhavn+K',
    },
    {
      city: 'New York',
      street: '55 Water Street, 9F',
      post: 'Brooklyn, NY 11201',
      hours: 'EST 09 to 18',
      maps: 'https://www.google.com/maps/search/?api=1&query=55+Water+Street+Brooklyn+NY+11201',
    },
  ],
  socials: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Are.na', href: 'https://are.na' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
  ],
}

export const nav: { label: string; to: string; field: Field }[] = [
  { label: 'Work', to: '/work', field: 'ultramarine' },
  { label: 'Studio', to: '/studio', field: 'lime' },
  { label: 'Contact', to: '/contact', field: 'lilac' },
]

// Which colour a route's curtain wipes in with.
export const routeField: Record<string, Field> = {
  home: 'vermilion',
  work: 'ultramarine',
  project: 'ink',
  studio: 'lime',
  contact: 'lilac',
}

const u = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`

export interface Project {
  slug: string
  title: string
  client: string
  sector: string
  year: string
  field: Field
  pair: Pair
  // A short clip that stands in for the second figure on the case page,
  // the one place the ascii engine is used. Pexels, free licence.
  video: string
  services: string[]
  summary: string
  body: string[]
  hero: string
  images: [string, string]
  facts: { k: string; v: string }[]
}

export const projects: Project[] = [
  {
    slug: 'halden',
    title: 'Halden',
    client: 'Halden Mobility',
    sector: 'Electric mobility',
    year: '2027',
    field: 'ultramarine',
    pair: 'ultramarine-lilac',
    video: 'https://videos.pexels.com/video-files/5418130/5418130-sd_640_360_24fps.mp4',
    services: ['Identity', 'Digital', 'Motion'],
    summary: 'A car company that sells the quiet. An identity built on mass, restraint and one ultramarine.',
    body: [
      'Halden builds electric cars for people who have stopped caring about cars. The brief asked for an identity that felt like the drive: heavy, silent and certain. We started with the material rather than the logo. One colour, one weight of type and a set of rules for how much empty road to leave on every surface.',
      'The wordmark is cut from a single width of bar. It never appears smaller than a fist. Photography is shot at dusk and printed as a duotone, so every image carries the same two inks whether it lands on a billboard or a key fob.',
      'The configurator was rebuilt as a slow scroll. No tabs, no wizard. The car turns as you move, and the price sits still.',
    ],
    hero: u('1553440569-bcc63803a83d'),
    images: [u('1542362567-b07e54358753'), u('1503376780353-7e6692767b70')],
    facts: [
      { k: 'Scope', v: 'Identity, launch site, configurator, motion system' },
      { k: 'Launch', v: 'Geneva, March 2027' },
      { k: 'Team', v: 'Maja Lindqvist, Ravi Sethi, Ines Okafor' },
    ],
  },
  {
    slug: 'kolm',
    title: 'Kolm',
    client: 'Kolm Records',
    sector: 'Music',
    year: '2026',
    field: 'vermilion',
    pair: 'ink-vermilion',
    video: 'https://videos.pexels.com/video-files/8043121/8043121-sd_640_338_25fps.mp4',
    services: ['Identity', 'Motion', 'Print'],
    summary: 'An independent label with a catalogue that refuses genre. A sleeve system that changes shape with every release.',
    body: [
      'Kolm signs whatever it likes, which is a problem for a brand. We stopped trying to describe the sound and designed the container instead. Every release gets the same vermilion band, the same mono catalogue number and a photograph treated through one halftone screen.',
      'The band moves. On a twelve inch it runs across the spine. On a stream it becomes a progress bar. On the wall of the label in Kreuzberg it is painted floor to ceiling.',
      'Type is set in a single condensed weight and stacked sideways so the artist name reads like a spine on a shelf, which is where Kolm wants to be.',
    ],
    hero: u('1539571696357-5a69c17a67c6'),
    images: [u('1558618666-fcd25c85cd64'), u('1534528741775-53994a69daeb')],
    facts: [
      { k: 'Scope', v: 'Identity, sleeve system, motion idents, merch' },
      { k: 'Releases', v: '41 and counting' },
      { k: 'Team', v: 'Theo Marsh, Ravi Sethi' },
    ],
  },
  {
    slug: 'meridian',
    title: 'Meridian',
    client: 'Meridian Museum of Art',
    sector: 'Culture',
    year: '2026',
    field: 'lilac',
    pair: 'ink-lilac',
    video: 'https://videos.pexels.com/video-files/7986423/7986423-sd_640_360_25fps.mp4',
    services: ['Identity', 'Spatial', 'Digital'],
    summary: 'A two hundred year old collection, a new building and a name that wanted to be said out loud.',
    body: [
      'Meridian holds antiquities in a building that opened last spring. The identity had to let a Roman torso and a light installation sit in the same sentence. We built it around a single line, drawn at the latitude of the museum, that cuts through every composition.',
      'The line becomes signage in the galleries, a rule on the tickets and the divider on the website. Objects are photographed in the round and printed in lilac and ink, which puts marble and neon on the same footing.',
      'Wayfinding uses one condensed weight at one size. Visitors read the building the way they read the posters.',
    ],
    hero: u('1531572753322-ad063cecc140'),
    images: [u('1479839672679-a46483c0e7c8'), u('1487958449943-2429e8be8625')],
    facts: [
      { k: 'Scope', v: 'Identity, wayfinding, exhibition system, website' },
      { k: 'Opening', v: 'April 2026' },
      { k: 'Team', v: 'Maja Lindqvist, Ines Okafor' },
    ],
  },
  {
    slug: 'ochre',
    title: 'Ochre',
    client: 'Ochre Studio',
    sector: 'Fashion',
    year: '2027',
    field: 'lime',
    pair: 'ink-lime',
    video: 'https://videos.pexels.com/video-files/9510022/9510022-sd_640_338_25fps.mp4',
    services: ['Campaign', 'Digital', 'Art direction'],
    summary: 'A fashion house that dresses people who work. A campaign with no location, no set and no retouching.',
    body: [
      'Ochre makes clothes for the studio, the workshop and the site. The campaign puts people in front of a plain wall and lets the clothing carry the picture. We shot forty people in two days and printed every frame through the same lime and ink screen.',
      'The season is announced with a poster that folds into the lookbook. The website is a single vertical scroll where each look arrives as a full screen and leaves as a spine.',
      'The typography is set to look like a garment label: mono, small and honest about the fabric.',
    ],
    hero: u('1531123897727-8f129e1688ce'),
    images: [u('1529626455594-4ff0802cfb7e'), u('1544005313-94ddf0286df2')],
    facts: [
      { k: 'Scope', v: 'Campaign, lookbook, e-commerce, motion' },
      { k: 'Season', v: 'AW27' },
      { k: 'Team', v: 'Ines Okafor, Theo Marsh' },
    ],
  },
  {
    slug: 'lumen',
    title: 'Lumen',
    client: 'Lumen Bank',
    sector: 'Finance',
    year: '2026',
    field: 'ultramarine',
    pair: 'ultramarine-bone',
    video: 'https://videos.pexels.com/video-files/5124202/5124202-sd_640_360_24fps.mp4',
    services: ['Identity', 'Product', 'Motion'],
    summary: 'A bank that wanted to feel like a building rather than an app. We gave it a facade.',
    body: [
      'Lumen is a digital bank with no branches, which its founders felt as a loss. The identity treats the app like architecture: a facade, a lobby and a set of rooms. Every screen starts from a grid of hairlines that behaves like the curtain wall of a tower.',
      'Numbers are the product, so numbers get the display face. Balances are typeset at the size of a headline and animate at the speed of a lift.',
      'The brand film is a slow ascent up the outside of a glass building, shot at dawn and printed in ultramarine and bone.',
    ],
    hero: u('1518005020951-eccb494ad742'),
    images: [u('1487958449943-2429e8be8625'), u('1511818966892-d7d671e672a2')],
    facts: [
      { k: 'Scope', v: 'Identity, design system, app, brand film' },
      { k: 'Users', v: '1.2 million at launch' },
      { k: 'Team', v: 'Theo Marsh, Ravi Sethi, Maja Lindqvist' },
    ],
  },
  {
    slug: 'fjord',
    title: 'Fjord Air',
    client: 'Fjord Air',
    sector: 'Travel',
    year: '2025',
    field: 'vermilion',
    pair: 'vermilion-bone',
    video: 'https://videos.pexels.com/video-files/11282762/11282762-sd_640_360_30fps.mp4',
    services: ['Identity', 'Livery', 'Motion'],
    summary: 'A regional airline with eleven aircraft and one very large idea about the colour red.',
    body: [
      'Fjord flies short hops along the Norwegian coast in weather that grounds everyone else. The identity is built on the one thing you can see from the ground: a vermilion tail against grey sky.',
      'The livery is a single field of colour with the name set sideways along the fuselage, reading from tail to nose. Nothing else. On the ground it becomes the uniform, the boarding pass and the coffee cup.',
      'The safety film is animated in the same two inks and has been watched, voluntarily, four million times.',
    ],
    hero: u('1519681393784-d120267933ba'),
    images: [u('1493397212122-2b85dda8106b'), u('1555169062-013468b47731')],
    facts: [
      { k: 'Scope', v: 'Identity, livery, uniform, safety film' },
      { k: 'Fleet', v: '11 aircraft, 23 routes' },
      { k: 'Team', v: 'Maja Lindqvist, Ravi Sethi' },
    ],
  },
]

// The sea behind the practice list: one clip per discipline, swapped with
// a glitch as the list moves. Small Pexels variants, muted, looped.
export const oceans = [
  'https://videos.pexels.com/video-files/3009225/3009225-sd_640_360_30fps.mp4',
  'https://videos.pexels.com/video-files/10540776/10540776-sd_640_360_30fps.mp4',
  'https://videos.pexels.com/video-files/17086197/17086197-sd_540_960_30fps.mp4',
  'https://videos.pexels.com/video-files/11295300/11295300-sd_540_960_30fps.mp4',
]

export const services = [
  {
    n: '01',
    title: 'Identity',
    line: 'Names, marks, colour, type and the rules that hold them together for a decade.',
    items: ['Naming', 'Wordmarks', 'Colour systems', 'Custom type', 'Guidelines'],
  },
  {
    n: '02',
    title: 'Digital',
    line: 'Websites and products that are built to be scrolled slowly and remembered.',
    items: ['Websites', 'Design systems', 'Product', 'WebGL', 'Prototyping'],
  },
  {
    n: '03',
    title: 'Motion',
    line: 'Brand films, idents and the small movements that make an interface feel alive.',
    items: ['Brand film', 'Idents', 'Interface motion', 'Title sequences', '3D'],
  },
  {
    n: '04',
    title: 'Spatial',
    line: 'Signage, exhibitions and rooms that carry an identity at the scale of a wall.',
    items: ['Wayfinding', 'Exhibitions', 'Retail', 'Environmental type', 'Installations'],
  },
]

export const team: { name: string; role: string; city: string; photo: string; pair: Pair }[] = [
  { name: 'Maja Lindqvist', role: 'Founder, Creative Director', city: 'Copenhagen', photo: u('1534528741775-53994a69daeb', 900), pair: 'ink-lime' },
  { name: 'Theo Marsh', role: 'Partner, Strategy', city: 'New York', photo: u('1472099645785-5658abf4ff4e', 900), pair: 'ink-lilac' },
  { name: 'Ines Okafor', role: 'Design Director', city: 'Copenhagen', photo: u('1494790108377-be9c29b29330', 900), pair: 'ink-vermilion' },
  { name: 'Ravi Sethi', role: 'Head of Motion', city: 'New York', photo: u('1547425260-76bcadfb4f2c', 900), pair: 'ultramarine-lilac' },
]

export const principles = [
  { n: '01', title: 'Weight over noise.', body: 'A brand should be felt before it is read. We design the mass first: colour, scale, silence. The details come after.' },
  { n: '02', title: 'One colour, held.', body: 'Most identities own nothing because they use everything. We give each client one colour and defend it.' },
  { n: '03', title: 'Slow is a feature.', body: 'Every transition we ship is slower than the default. Attention is expensive and we do not spend it on a bounce.' },
  { n: '04', title: 'Print rules, screen follows.', body: 'We design as if it will be printed, because eventually everything is. Halftones, spines, folds and ink.' },
]

export const clients = ['Halden', 'Kolm Records', 'Meridian Museum', 'Ochre', 'Lumen Bank', 'Fjord Air', 'Tate', 'Aesop', 'Bang & Olufsen', 'Rapha', 'Norrøna', 'Vitra']
