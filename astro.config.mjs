import { defineConfig } from 'astro/config';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

/**
 * Submissions arrive as Markdown from strangers, by pull request, and Markdown
 * passes raw HTML straight through by default. Without this a submitted
 * `<script>` — or an `onerror` on an image — runs first-party on the Guild's own
 * origin, which is a far shorter way to own the site than the iframe the
 * two-origin design was built to contain.
 *
 * The default schema is GitHub's: ordinary prose, headings, lists, links,
 * images and code survive; script, style, event handlers and unknown attributes
 * do not. `img` is allowed a couple of sizing attributes so screenshots in a
 * write-up still behave.
 */
const sanitize = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), 'loading', 'width', 'height'],
  },
};

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
  markdown: { rehypePlugins: [[rehypeSanitize, sanitize]] },
  // The floating toolbar sits over the bottom of the page; the hall is easier
  // to judge without it.
  devToolbar: { enabled: false },
});
