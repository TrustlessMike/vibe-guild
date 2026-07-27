import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The Guild's records.
 *
 * Every member and every commission is a file in this repository — that is the
 * whole storage layer. A pull request that does not satisfy these schemas fails
 * the build, so a malformed submission can never reach the board.
 */

/**
 * A URL that is safe to put in an href or an iframe src.
 *
 * `z.string().url()` is NOT that check — it accepts `javascript:`, `data:` and
 * `vbscript:` quite happily. That matters most for `play.url`, which is written
 * straight into a frame carrying `allow-same-origin`: a `javascript:` URL
 * inherits the *embedding* document's origin, so such a submission would run on
 * the Guild's own origin and step clean out of the two-origin sandbox.
 *
 * Restricting the scheme here rather than at each use keeps the schema the one
 * gate a submission has to pass, which is what the note above promises.
 */
const safeUrl = z
  .string()
  .url()
  .refine((u) => {
    try {
      return new URL(u).protocol === 'https:';
    } catch {
      return false;
    }
  }, { message: 'Must be an https: URL' });

const link = z.object({
  label: z.string(),
  url: safeUrl,
});

const creators = defineCollection({
  loader: glob({ base: './src/content/creators', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      /** The handle is the filename, and the seed for the member's crest. */
      name: z.string(),
      title: z.string().optional(),
      bio: z.string().max(600).optional(),
      joined: z.coerce.date(),
      location: z.string().optional(),
      avatar: image().optional(),
      /** Anything they like — the Guild does not prescribe which sites count. */
      links: z.array(link).default([]),
      /** Overrides the generated crest if a member would rather draw their own. */
      crest: z
        .object({
          field: z.string().optional(),
          charge: z.string().optional(),
          division: z.string().optional(),
        })
        .optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Games and apps sit on the same board but are badged differently. */
      kind: z.enum(['game', 'app']),
      tagline: z.string().max(140),
      by: z.array(reference('creators')).nonempty(),
      posted: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      shots: z.array(image()).default([]),

      /**
       * How the thing runs. `bundle` is a folder committed under
       * apps/<slug>/ and served from this site; `url` embeds something
       * hosted elsewhere. Either way it runs inside a sandboxed frame.
       */
      play: z
        .object({
          // Interpolated into the apps-origin URL, so hold it to a plain slug
          // rather than letting a submission steer the path it is served from.
          bundle: z.string().regex(/^[a-z0-9][a-z0-9-]*$/,
            'bundle must be a lowercase slug, matching its folder under apps/').optional(),
          url: safeUrl.optional(),
          /** Frames default to 16:9; pick another if the work needs it. */
          aspect: z.string().default('16 / 9'),
          /** Some works want the whole viewport rather than a card. */
          fullscreen: z.boolean().default(true),
          /**
           * Set when the work needs a keyboard or mouse. Most traffic from a
           * shared link is a phone, and a submission that cannot be played
           * there should say so rather than present a frame that does nothing.
           */
          desktopOnly: z.boolean().default(false),
        })
        .refine((p) => !!p.bundle !== !!p.url, {
          message: 'Give exactly one of play.bundle or play.url',
        }),

      source: safeUrl.optional(),
      license: z.string().default('MIT'),
      featured: z.boolean().default(false),
    }),
});

export const collections = { creators, projects };
