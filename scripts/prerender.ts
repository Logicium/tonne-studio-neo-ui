/**
 * Post-build: one HTML file per public route, sitemap.xml, robots.txt,
 * llms.txt and 404.html, from the route table and site config.
 *
 *   npm run build        runs this through the postbuild hook
 *   npx vite-node scripts/prerender.ts
 *
 * Every page carries its own body, built from src/data/site.ts. The site is
 * marked not indexable in seo.site.ts, so every page is noindex, the sitemap
 * is empty and robots.txt disallows everything.
 * The Apotome Labs SEO + AEO Standard, section 13.
 */
import { prerender } from '../src/seo/node'
import { publicRoutes } from '../src/routes'
import { site } from '../src/seo.site'

await prerender({
  site,
  routes: publicRoutes,
  root: new URL('..', import.meta.url),
})
