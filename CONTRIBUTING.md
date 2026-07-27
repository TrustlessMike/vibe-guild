# Posting to the board

There is no sign-up, because there are no accounts. You add yourself and your
work with a pull request.

## 1. Claim your arms

Add `src/content/creators/<yourhandle>.md`. The filename is your handle, and it
is also the seed for your coat of arms — you get a unique one automatically.

```yaml
---
name: Your Name
title: Maker of small strange things    # optional
joined: 2026-07-24
location: Anywhere                      # optional
bio: >
  Say whatever you like. The Guild does not prescribe
  what a profile should contain.
links:
  - { label: GitHub,  url: https://github.com/yourhandle }
  - { label: Website, url: https://your.site }
---

Anything below the dashes is your page. Markdown.
```

Prefer to pick your own arms? Add a `crest:` block with any of `field`,
`charge` or `division` — see `src/lib/crest.ts` for the options.

## 2. Bring the thing itself

Build your project to static files and commit the output as
`apps/<slug>/`, with an `index.html` at its root.

- Under **25 MB**. Compress textures and audio.
- **Relative paths** — it is served from a subfolder.
- It is served from a separate origin and framed with `allow-scripts` and
  `allow-same-origin`. It keeps its own `localStorage`; it cannot reach the
  Guild.
- Needs a server of its own? Use `play.url` to embed it from where it already
  lives instead.
- It must be yours to publish, and it must not be hostile to whoever runs it.

## 3. Pin it to the board

Add `src/content/projects/<slug>.md`:

```yaml
---
title: Your Thing
kind: game            # or: app
tagline: One line, under 140 characters.
by: [yourhandle]
posted: 2026-07-24
tags: [three-js, roguelike]
cover: ../../assets/your-thing/cover.png    # optional
play:
  bundle: your-thing  # the folder under apps/
  aspect: 16 / 9
source: https://github.com/you/your-thing   # optional
license: MIT
---

## What it is

Markdown. Tell people what they are looking at.
```

## 4. Check it, then open the PR

```bash
npm install
npm run dev      # look at it
npm run build    # the schemas are enforced here
```

If it builds, it works. Merged means published — and you can take it down again
whenever you like.
