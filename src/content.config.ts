import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The Guild's records.
 *
 * Every member and every commission is a file in this repository — that is the
 * whole storage layer. A pull request that does not satisfy these schemas fails
 * the build, so a malformed submission can never reach the board.
 */

const link = z.object({
  label: z.string(),
  url: z.string().url(),
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
          bundle: z.string().optional(),
          url: z.string().url().optional(),
          /** Frames default to 16:9; pick another if the work needs it. */
          aspect: z.string().default('16 / 9'),
          /** Some works want the whole viewport rather than a card. */
          fullscreen: z.boolean().default(true),
        })
        .refine((p) => !!p.bundle !== !!p.url, {
          message: 'Give exactly one of play.bundle or play.url',
        }),

      source: z.string().url().optional(),
      license: z.string().default('MIT'),
      featured: z.boolean().default(false),
    }),
});

export const collections = { creators, projects };
