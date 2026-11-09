/**
 * Who this site is, for search engines and assistants.
 *
 * Tonne is a concept site for a fictional studio, so `indexable` is false:
 * every page carries noindex, the sitemap is empty and robots.txt disallows
 * everything. The rest of the record is kept honest anyway, so flipping that
 * one flag is all a real launch would need. Pure data: the prerender imports
 * it under Node and the app imports it in the browser.
 */
import type { SiteConfig } from '@/seo'
import { brand, services } from '@/data/site'

const offices = brand.offices.map((o) => ({
  '@type': 'Place',
  name: `Tonne ${o.city}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: o.street,
    addressLocality: o.city === 'New York' ? 'Brooklyn' : 'København K',
    addressRegion: o.city === 'New York' ? 'NY' : undefined,
    postalCode: o.city === 'New York' ? '11201' : '1432',
    addressCountry: o.city === 'New York' ? 'US' : 'DK',
  },
  hasMap: o.maps,
}))

export const site: SiteConfig = {
  siteUrl: `https://${brand.domain}`,
  name: brand.name,
  tagline: brand.line.replace(/\.$/, ''),
  description:
    'Tonne is a design studio in Copenhagen and New York for brands that want to be felt. Identity, digital, motion and spatial work, one colour per client.',
  lang: 'en',
  locale: 'en_US',
  image: { url: '/og/default.png', width: 1200, height: 630, alt: 'Tonne, a design studio with weight' },
  entity: {
    type: 'Organization',
    name: brand.name,
    legalName: 'Tonne ApS',
    description:
      'Tonne is a design studio with offices in Copenhagen and New York. Fourteen people across identity, digital, motion and spatial work, taking on eight identities a year and giving each client one colour.',
    image: '/og/default.png',
    email: brand.email,
    foundingDate: String(brand.founded),
    knowsAbout: services.map((s) => s.title),
    // the social links in the data are bare network homepages, so no sameAs
    extra: { location: offices },
  },
  crawlers: { training: 'allow' },
  // the clip picker is a working page, never linked and never indexed
  privatePrefixes: ['/picker'],
  // a concept site: out of the index until it is a real studio
  indexable: false,
  llmsSummary:
    'Tonne is a design studio concept with offices in Copenhagen and New York. Four disciplines, identity, digital, motion and spatial, six case studies and a team of four partners. The site is a design exercise and is not indexed.',
}
