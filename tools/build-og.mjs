/**
 * Renders the social share card to public/og.png.
 *
 * Without an og:image every link to the Guild — on X, Discord, Slack, LinkedIn,
 * iMessage — unfurls as a bare line of text. That is the difference between a
 * link people click and a link people scroll past, so it matters more at launch
 * than almost anything else on the page.
 *
 * Drawn as SVG and rasterised with sharp, which Astro already depends on, so
 * this costs no new dependency. Run `npm run og` after changing the wording;
 * the PNG is committed, because rebuilding it on every deploy would mean the
 * card silently changing whenever a font on the build machine did.
 */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const W = 1200;
const H = 630;

// Vertical boards, matching the timber wall the site is built on.
const boards = Array.from({ length: 40 }, (_, i) => {
  const x = i * (W / 40);
  const shade = i % 2 ? 0.055 : 0.02;
  return `<rect x="${x}" y="0" width="${W / 40}" height="${H}" fill="rgba(0,0,0,${shade})"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="timber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2a1b"/>
      <stop offset="55%" stop-color="#241a11"/>
      <stop offset="100%" stop-color="#140e09"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="18%" r="70%">
      <stop offset="0%" stop-color="#ffc670" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#ffc670" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#timber)"/>
  ${boards}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- carved beam, top and bottom -->
  <rect x="0" y="0" width="${W}" height="10" fill="#c2913f" opacity="0.55"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="#c2913f" opacity="0.55"/>

  <!-- the guild's arms -->
  <g transform="translate(96, 196) scale(2.05)">
    <path d="M3 3H97v53c0 31-24 49-47 57C27 105 3 87 3 56Z"
          fill="#8f2f22" stroke="#c2913f" stroke-width="6"/>
    <path d="M50 18l8 25h26L63 58l8 25-21-15-21 15 8-25-21-15h26z" fill="#c2913f"/>
  </g>

  <text x="360" y="258" font-family="Georgia, 'Times New Roman', serif"
        font-size="86" font-weight="700" fill="#f6ecd8" letter-spacing="1.5">The Vibe Guild</text>

  <text x="362" y="322" font-family="Georgia, 'Times New Roman', serif"
        font-size="34" fill="#d8c49a">A hall for people who make things.</text>

  <text x="362" y="382" font-family="Georgia, 'Times New Roman', serif"
        font-size="29" fill="#a89370">Games and apps by independent creators —</text>
  <text x="362" y="424" font-family="Georgia, 'Times New Roman', serif"
        font-size="29" fill="#a89370">free, open source, and playable right here.</text>

  <text x="362" y="500" font-family="'Courier New', monospace"
        font-size="23" fill="#c2913f" letter-spacing="4.5">NO STORE · NO LAUNCHER · NO ACCOUNT</text>
</svg>`;

const out = 'public/og.png';
await sharp(Buffer.from(svg)).png().toFile(out);
const { size } = await sharp(out).metadata().then(async (m) => ({
  size: (await import('node:fs')).statSync(out).size, ...m,
}));
console.log(`  ${out}  ${W}x${H}  ${(size / 1024).toFixed(0)}KB`);
