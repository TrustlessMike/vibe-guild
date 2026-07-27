import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vibe-guild.moneytalkwithmalik.workers.dev',
  // Submissions are static bundles committed under apps/<slug>/ — note that is
  // a top-level folder, deliberately *not* public/. Anything under public/ is
  // copied into dist and would therefore be served from the Guild's own origin,
  // putting a second, same-origin copy of untrusted submissions exactly where
  // the separate apps origin exists to keep them out of.
  //
  // The hall itself builds to plain files and can be hosted anywhere for nothing.
  build: { format: 'directory' },
  server: { port: 4321 },
  // The floating toolbar sits over the bottom of the page; the hall is easier
  // to judge without it.
  devToolbar: { enabled: false },
});
