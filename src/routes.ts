/**
 * The public route table, with each page's SEO record.
 *
 * This is the only list of public routes. The router spreads it; the
 * prerender (scripts/prerender.ts) walks it to write one HTML file per page,
 * the sitemap, robots.txt and llms.txt; the runtime applies the same records
 * on navigation. The clip picker stays in the router under a private prefix.
 * No browser dependency here: the prerender imports this under Node.
 */
import type { RouteRecordRaw } from 'vue-router'
import { creativeWorkNode, esc, itemListNode, personNode, serviceNode, truncate, type RouteSeo } from '@/seo'
import { brand, clients, nav, principles, projects, services, team, type Project } from '@/data/site'

const navHtml = () =>
  `<nav aria-label="Site"><ul>${nav.map((l) => `<li><a href="${esc(l.to)}">${esc(l.label)}</a></li>`).join('')}</ul></nav>`

const footHtml = () =>
  `<footer><p><a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a></p><ul>${brand.offices
    .map((o) => `<li>${esc(o.city)}: ${esc(o.street)}, ${esc(o.post)}. ${esc(o.hours)}.</li>`)
    .join('')}</ul><p>Tonne ApS. Est. ${brand.founded}, Copenhagen.</p></footer>`

const projectList = (list: Project[]) =>
  `<ul>${list
    .map((p) => `<li><a href="/work/${esc(p.slug)}">${esc(p.title)}</a>: ${esc(p.sector)}, ${esc(p.year)}. ${esc(p.summary)}</li>`)
    .join('')}</ul>`

/* ------------------------------ work ------------------------------ */

const projectSeo: RouteSeo<Project> = {
  expand: () => projects.map((p) => ({ params: { slug: p.slug }, data: p })),
  title: ({ data }) => `${data.title}: ${data.sector}`,
  description: ({ data }) => truncate(`${data.summary} ${data.services.join(', ')} for ${data.client}, ${data.year}.`, 160),
  image: ({ data }) => ({ url: data.hero, alt: `${data.title}, ${data.client}` }),
  breadcrumb: ({ data }) => [{ name: 'Work', path: '/work' }, { name: data.title }],
  schema: ({ site, path, data }) =>
    creativeWorkNode(site, {
      path,
      name: `${data.title} for ${data.client}`,
      description: data.summary,
      image: data.hero,
      dateCreated: data.year,
      genre: data.sector,
      extra: { keywords: data.services.join(', ') },
    }),
  body: ({ data }) => {
    const i = projects.indexOf(data)
    const next = projects[(i + 1) % projects.length]!
    return `<main>${navHtml()}<article><p>Case 0${i + 1} / ${esc(data.client)}</p><h1>${esc(data.title)}</h1><dl><dt>Sector</dt><dd>${esc(data.sector)}</dd><dt>Year</dt><dd>${esc(data.year)}</dd><dt>Scope</dt><dd>${esc(data.services.join(', '))}</dd></dl><p>${esc(data.summary)}</p>${data.body
      .map((p) => `<p>${esc(p)}</p>`)
      .join('')}<dl>${data.facts.map((f) => `<dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd>`).join('')}</dl><p>Next case: <a href="/work/${esc(next.slug)}">${esc(next.title)}</a>. ${esc(next.summary)}</p><p><a href="/work">All work</a></p></article>${footHtml()}</main>`
  },
}

/* ------------------------------ the table ------------------------------ */

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: {
      seo: {
        description:
          'Tonne is a design studio in Copenhagen and New York for brands that want to be felt. Identity, digital, motion and spatial work, one colour per client.',
        schema: ({ site }) => services.map((s) => serviceNode(site, { name: s.title, description: s.line, type: 'Design' })),
        body: () =>
          `<main>${navHtml()}<h1>Tonne</h1><p>${esc(brand.line)}</p><p>Identity / Digital / Motion / Spatial. Copenhagen and New York.</p><h2>Most brands are built to be liked. We build brands to be felt.</h2><ul><li>Est. ${brand.founded}, Copenhagen</li><li>41 identities shipped</li><li>14 people, two cities</li><li>One colour per client</li></ul><h2>Selected work</h2>${projectList(projects.slice(0, 5))}<p><a href="/work">All projects</a></p><h2>Practice</h2><p>Four disciplines, one studio, no hand-offs. The people who name the brand build the site.</p><ul>${services
            .map((s) => `<li><strong>${esc(s.title)}</strong>: ${esc(s.line)} ${esc(s.items.join(' / '))}</li>`)
            .join('')}</ul><p><a href="/contact">Studio details</a></p>${footHtml()}</main>`,
      },
    },
  },
  {
    path: '/work',
    name: 'work',
    component: () => import('@/pages/WorkPage.vue'),
    meta: {
      seo: {
        title: 'Work',
        description: 'Six brands, six colours: the Tonne index of identity, digital, motion and spatial case studies from 2025 to 2027, from an airline livery to a museum.',
        schema: ({ site, path }) =>
          itemListNode(
            site,
            path,
            'Work by Tonne',
            projects.map((p) => ({ name: p.title, path: `/work/${p.slug}`, image: p.hero })),
          ),
        body: () => `<main>${navHtml()}<p>Index / 2025 to 2027</p><h1>Six brands, six colours.</h1>${projectList(projects)}${footHtml()}</main>`,
      },
    },
  },
  { path: '/work/:slug', name: 'project', component: () => import('@/pages/ProjectPage.vue'), meta: { seo: projectSeo } },
  {
    path: '/studio',
    name: 'studio',
    component: () => import('@/pages/StudioPage.vue'),
    meta: {
      seo: {
        title: 'Studio',
        description: `The Tonne studio: fourteen people in Copenhagen and New York, four principles, four partners and the clients they keep company with. Est. ${brand.founded}.`,
        schema: ({ site }) => team.map((t) => personNode(site, { path: '/studio', name: t.name, jobTitle: t.role, image: t.photo })),
        body: () =>
          `<main>${navHtml()}<p>Studio / Est. ${brand.founded}</p><h1>Fourteen people in two cities who think a brand should be felt.</h1><h2>What we hold</h2><ol>${principles
            .map((p) => `<li><strong>${esc(p.title)}</strong> ${esc(p.body)}</li>`)
            .join('')}</ol><h2>Four partners, ten designers, one kitchen table in each office.</h2><ul>${team
            .map((t) => `<li>${esc(t.name)}, ${esc(t.role)}, ${esc(t.city)}</li>`)
            .join('')}</ul><h2>In company with</h2><p>${clients.map(esc).join(', ')}</p><p>We take on eight identities a year and turn down the rest with a note. <a href="/contact">Ask for a slot</a>.</p>${footHtml()}</main>`,
      },
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/pages/ContactPage.vue'),
    meta: {
      seo: {
        title: 'Contact',
        description: `Write to ${brand.email} with what it is, when it needs to exist and what it should weigh. Tonne replies within two working days from Copenhagen or New York.`,
        body: () =>
          `<main>${navHtml()}<p>Start here</p><h1><a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a></h1><p>Tell us what it is, when it needs to exist and what it should weigh. We reply within two working days.</p><h2>Offices</h2>${brand.offices
            .map(
              (o, i) =>
                `<h3>${esc(o.city)}</h3><p>0${i + 1} / ${esc(o.hours)}</p><p><a href="${esc(o.maps)}" rel="noopener">${esc(o.street)}, ${esc(o.post)}</a></p><p>${i === 0 ? 'Studio, workshop and print room' : 'Studio and screening room'}</p>`,
            )
            .join('')}${footHtml()}</main>`,
      },
    },
  },
]

/** The catch-all: a real not-found page, noindex, never a redirect home. */
export const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('@/pages/NotFoundPage.vue'),
  meta: { seo: { title: 'Page not found', description: `That page is not on ${brand.domain}.`, noindex: true } },
}
