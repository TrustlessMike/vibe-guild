/**
 * Heraldry, generated.
 *
 * Every member gets a coat of arms derived from their handle — no upload, no
 * blank avatar, and the same handle always yields the same arms. It follows
 * the real tincture rule (never metal on metal, nor colour on colour), which
 * is why these read as arms rather than as random shapes.
 */

export type Tincture = { name: string; hex: string; metal: boolean };

const COLOURS: Tincture[] = [
  { name: 'gules', hex: '#8f2f22', metal: false },
  { name: 'azure', hex: '#2a4a7a', metal: false },
  { name: 'vert', hex: '#2f6640', metal: false },
  { name: 'purpure', hex: '#5a2a63', metal: false },
  { name: 'sable', hex: '#1c1712', metal: false },
  { name: 'tenné', hex: '#8a4a1e', metal: false },
];

const METALS: Tincture[] = [
  { name: 'or', hex: '#c2913f', metal: true },
  { name: 'argent', hex: '#cbc2b0', metal: true },
];

export const DIVISIONS = [
  'plain', 'per pale', 'per fess', 'per bend', 'quarterly', 'per chevron',
] as const;
export type Division = (typeof DIVISIONS)[number];

/** Charges are SVG fragments so the fiddlier ones can use several shapes. */
export const CHARGES: Record<string, string> = {
  sword:
    '<path d="M50 18 L55 31 V59 H68 V65 H55 V79 H58 V85 H42 V79 H45 V65 H32 V59 H45 V31 Z"/>',
  tower:
    '<path d="M28 90 V44 H36 V34 H45 V44 H55 V34 H64 V44 H72 V90 Z"/>' +
    '<path d="M44 90 V72 a6 6 0 0 1 12 0 V90 Z" fill="rgba(0,0,0,.42)"/>' +
    '<rect x="45" y="52" width="10" height="12" rx="5" fill="rgba(0,0,0,.42)"/>',
  mullet:
    '<path d="M50 20 L57.9 44.6 L83.6 44.6 L62.8 59.8 L70.7 84.4 L50 69.2 L29.3 84.4 L37.2 59.8 L16.4 44.6 L42.1 44.6 Z"/>',
  flame:
    '<path d="M50 17 C59 32 67 39 67 54 C67 69 59 79 50 86 C41 79 33 69 33 54 C33 39 41 32 50 17 Z"/>' +
    '<path d="M50 40 C55 49 58 53 58 60 C58 68 54 74 50 78 C46 74 42 68 42 60 C42 53 45 49 50 40 Z" fill="rgba(0,0,0,.3)"/>',
  chalice:
    '<path d="M35 28 H65 C65 45 56 52 53 55 V72 H63 V79 H37 V72 H47 V55 C44 52 35 45 35 28 Z"/>',
  anvil:
    '<path d="M28 45 H72 L64 57 H57 V67 H70 V76 H30 V67 H43 V57 H36 Z"/>',
  key:
    '<circle cx="50" cy="32" r="13"/><circle cx="50" cy="32" r="5.5" fill="rgba(0,0,0,.4)"/>' +
    '<path d="M46 44 H54 V84 H46 Z M54 62 H66 V69 H54 Z M54 74 H63 V81 H54 Z"/>',
  crescent:
    '<path d="M50 18 A31 31 0 1 0 50 86 A24 24 0 1 1 50 18 Z"/>',
  bolt:
    '<path d="M56 17 L33 57 H46 L41 87 L68 46 H53 Z"/>',
  'oak leaf':
    '<path d="M50 17 C60 30 70 38 70 52 C70 66 60 76 52 82 V88 H48 V82 C40 76 30 66 30 52 C30 38 40 30 50 17 Z"/>' +
    '<path d="M49 34 h2 v48 h-2 Z" fill="rgba(0,0,0,.3)"/>',
  raven:
    '<path d="M28 52 C34 40 46 34 58 36 L72 27 L68 41 C74 48 74 60 66 68 C58 76 44 78 34 72 L22 76 L30 66 C26 62 26 56 28 52 Z"/>' +
    '<circle cx="60" cy="44" r="2.6" fill="rgba(0,0,0,.55)"/>',
  compass:
    '<circle cx="50" cy="52" r="30" fill="none" stroke="currentColor" stroke-width="6"/>' +
    '<path d="M50 30 L58 52 L50 74 L42 52 Z"/>',
  // A slim crossbar over a stem just reads as the letter T. Giving the head
  // real mass, and the handle real length, is what makes it a hammer.
  hammer:
    '<path d="M26 27 L31 23 H69 L74 27 V47 L69 51 H55 V92 H45 V51 H31 L26 47 Z"/>' +
    '<rect x="43" y="51" width="14" height="5" fill="rgba(0,0,0,.4)"/>',
};

export const CHARGE_NAMES = Object.keys(CHARGES);

/** FNV-1a — small, fast, and stable across runs and platforms. */
export function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Successive draws from one seed, so each choice is independent. */
function* rolls(seed: number): Generator<number> {
  let s = seed || 1;
  while (true) {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    yield s;
  }
}

export type Blazon = {
  field: Tincture;
  second: Tincture;
  division: Division;
  charge: string;
  chargeTincture: Tincture;
  bordure: boolean;
  /** Plain-language description, for alt text and the member's page. */
  text: string;
};

export function blazon(handle: string, overrides: Partial<{
  field: string; charge: string; division: string;
}> = {}): Blazon {
  const r = rolls(hash(handle.toLowerCase()));
  const pick = <T>(arr: T[]): T => arr[r.next().value % arr.length];

  const division =
    (overrides.division as Division) ?? pick([...DIVISIONS]);

  // Field first; the second tincture and the charge must both contrast it.
  let field = pick([...COLOURS, ...METALS]);
  if (overrides.field) {
    field = [...COLOURS, ...METALS].find((t) => t.name === overrides.field) ?? field;
  }
  const opposing = field.metal ? COLOURS : METALS;
  const second = pick(opposing);
  /**
   * On a divided shield the charge is *counterchanged*: it takes the opposite
   * tincture on each half, so it contrasts on both by construction.
   *
   * Picking a third tincture here instead — which is what this did — draws it
   * from the same set `second` came from, so the charge either landed in its
   * own tincture and vanished, or put metal on metal. Both violate the rule the
   * site's own copy claims to keep, and the fat black keyline in Crest.astro
   * existed to paper over it. Counterchange makes the keyline unnecessary.
   */
  const chargeTincture = second;

  const charge = overrides.charge && CHARGES[overrides.charge]
    ? overrides.charge
    : pick(CHARGE_NAMES);

  const bordure = r.next().value % 4 === 0;

  const divisionText = division === 'plain' ? '' : `${division} `;
  // A counterchanged charge is blazoned as such rather than by tincture — naming
  // one would be wrong, since it wears both. The bordure follows the same rule;
  // hardcoding "or" put a gold border on gold fields, on the very page built to
  // demonstrate that metal never sits on metal.
  // "a anvil", "a oak leaf" — the charge list has vowels in it.
  const article = /^[aeiou]/.test(charge) ? 'an' : 'a';
  const chargeText = division === 'plain'
    ? `${article} ${charge} ${chargeTincture.name}`
    : `${article} ${charge} counterchanged`;
  const bordureText = !bordure
    ? ''
    : `, within a bordure ${division === 'plain' ? second.name : 'counterchanged'}`;
  const text =
    `${divisionText}${field.name}${division === 'plain' ? '' : ` and ${second.name}`}` +
    `, ${chargeText}${bordureText}`;

  return { field, second, division, charge, chargeTincture, bordure, text };
}

/** The two halves of a divided field, as clip paths over the shield. */
export function divisionPaths(d: Division): [string, string] | null {
  switch (d) {
    case 'per pale': return ['M0 0 H50 V116 H0 Z', 'M50 0 H100 V116 H50 Z'];
    case 'per fess': return ['M0 0 H100 V52 H0 Z', 'M0 52 H100 V116 H0 Z'];
    case 'per bend': return ['M0 0 H100 L0 116 Z', 'M100 0 V116 L0 116 Z'];
    case 'quarterly': return [
      'M0 0 H50 V52 H0 Z M50 52 H100 V116 H50 Z',
      'M50 0 H100 V52 H50 Z M0 52 H50 V116 H0 Z',
    ];
    case 'per chevron': return [
      'M0 0 H100 V44 L50 84 L0 44 Z',
      'M0 44 L50 84 L100 44 V116 H0 Z',
    ];
    default: return null;
  }
}

/** Rank is earned by posting, not granted. */
export function rankFor(count: number): string {
  if (count >= 8) return 'Guildmaster';
  if (count >= 4) return 'Master';
  if (count >= 2) return 'Journeyman';
  if (count >= 1) return 'Artisan';
  return 'Apprentice';
}
