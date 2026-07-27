# The Vibe Guild

A guild hall for people who make things. Members post their games and apps to
the board, and anyone can play them right there in the browser — no store, no
launcher, no account.

Free and open source. The Guild takes no cut, runs no adverts and owns nothing
you make.

```bash
npm install
npm run dev      # http://localhost:4321  (also starts the apps origin on :4322)
npm run build
```

## How it works

There is no database and no backend. **The repository is the storage.**

- A member is a markdown file in `src/content/creators/`.
- A commission is a markdown file in `src/content/projects/`.
- The thing itself is a folder of static files in `apps/<slug>/`.

You add yours with a pull request. When it is merged the site rebuilds and your
work is on the board. Everything is checked against a schema at build time, so
a malformed submission fails in CI rather than landing broken.

That also means the whole hall is portable: fork it, and you have your own.

## Two origins, on purpose

Submitted work runs inside an iframe, and that raises a real question — how do
you run somebody else's code on your own site without handing them the site?

Serving apps from the Guild's own origin forces a bad choice. Sandbox without
`allow-same-origin` and the app gets an *opaque* origin: no `localStorage`, and
every ES-module script or `fetch` it makes becomes a blocked cross-origin
request, so most real apps simply will not run. Grant `allow-same-origin` and
arbitrary submitted code can reach into the Guild's page.

So apps are served from **a separate origin**. `allow-same-origin` then refers to
the *app's* origin, not ours — it keeps its own storage and loads its own assets
normally, and still cannot touch anything of the Guild's. This is the same shape
CodePen and JSFiddle use.

- Locally, `tools/serve-apps.mjs` serves `apps` on `:4322`.
- In production set `PUBLIC_APPS_ORIGIN` to a separate host or subdomain
  (`https://apps.example.dev`).
- With it unset, the site falls back to same-origin serving and drops
  `allow-same-origin` — safe, but the app loses its storage.

Note that `apps/` is a top-level folder and **not** `public/apps/`. Anything
under `public/` is copied into `dist` and would be served from the Guild's own
origin — putting a second, same-origin copy of untrusted submissions exactly
where this whole arrangement exists to keep them out of.

## Hosting

Two Cloudflare Workers, one per origin. Being separate Workers is the point:
that is what gives them different hostnames.

| | Worker | Live |
|---|---|---|
| Guild | `vibe-guild` (`wrangler.jsonc`, serves `dist`) | https://vibe-guild.moneytalkwithmalik.workers.dev |
| Apps | `vibe-guild-apps` (`wrangler.apps.jsonc`, serves `apps`) | https://vibe-guild-apps.moneytalkwithmalik.workers.dev |

```bash
npm run deploy        # both, apps first
```

`PUBLIC_APPS_ORIGIN` is read at *build* time, so the apps origin is baked into
the generated HTML — it lives in `.env.production` rather than in any CI
setting. Deploy the apps Worker first when the origin changes, then rebuild.

## Arms

Every member gets a coat of arms generated from their handle. No upload, no
blank avatar, and the same handle always yields the same arms.

It follows the real tincture rule — never metal on metal, nor colour on colour —
which is what makes them read as heraldry instead of as random shapes, and
charges are outlined so they stay legible where they cross a divided field.
Six divisions × thirteen charges × eight tinctures. See `/arms` for the whole
range, and `src/lib/crest.ts` for how it is drawn.

A member who would rather choose can override the field, charge or division in
their own file.

## Layout

```
src/
  content.config.ts   the schemas every submission is checked against
  content/
    creators/         one file per member
    projects/         one file per commission
  lib/crest.ts        generated heraldry
  components/         Crest, Notice
  layouts/Hall.astro  shell, nav, footer
  pages/
    index.astro       the hall
    projects/         the board, and each commission
    creators/         the roster, and each member
    submit.astro      how to post
    arms.astro        heraldry reference sheet
  styles/guild.css    the house style
apps/<slug>/   submitted work, served from its own origin
tools/serve-apps.mjs  that origin, locally
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), or the
[Post a Commission](http://localhost:4321/submit) page, which says the same
thing with the templates filled in.

MIT.
