/**
 * The sitemap, built from the collections themselves.
 *
 * Deliberately generated rather than hand-written or pulled in as an
 * integration: the board grows every time someone's pull request lands, and a
 * static list is one more thing a contributor would have to remember to update
 * — so it would be wrong within a week of launch.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://vibe-guild.moneytalkwithmalik.workers.dev';

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL(SITE)).origin;

  const projects = await getCollection('projects');
  const creators = await getCollection('creators');

  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/projects/', priority: '0.9' },
    { loc: '/creators/', priority: '0.7' },
    { loc: '/submit/', priority: '0.6' },
    { loc: '/arms/', priority: '0.3' },
    ...projects.map((p) => ({
      loc: `/projects/${p.id}/`,
      priority: '0.8',
      lastmod: p.data.posted instanceof Date ? p.data.posted.toISOString().slice(0, 10) : undefined,
    })),
    ...creators.map((c) => ({ loc: `/creators/${c.id}/`, priority: '0.5' })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${base}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
