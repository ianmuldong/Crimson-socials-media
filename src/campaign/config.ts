/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FRIDAY NIGHT VOLLEYBALL SOCIALS — CENTRAL CAMPAIGN CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Change anything here and every campaign video updates.
 * Values marked  ⚠ CONFIRM  are assumptions waiting for organiser approval.
 * Values set to null are intentionally left blank: nothing is invented.
 */

export type Org = {
  id: "chequers" | "crimson" | "do";
  name: string;
  short: string;
  /** Path inside public/. The official file, used unmodified. */
  logo: string;
  /**
   * Where the artwork sits inside the image file, as fractions [left, top, right, bottom].
   * Used only to size the three logos to equal visual weight (empty margins are
   * cropped in the display, the file itself is never changed). Re-measure if you
   * replace a logo; [0, 0, 1, 1] = use the whole image.
   */
  artBox: [number, number, number, number];
  handle: string | null;
};

export const campaign = {
  event: {
    name: "FRIDAY NIGHT VOLLEYBALL SOCIALS",
    nameLines: ["FRIDAY NIGHT", "VOLLEYBALL SOCIALS"],
    kind: "INDOOR VOLLEYBALL SOCIALS",
    /** Evergreen: the socials are established and running. No season, start date or "coming soon". */
    day: "EVERY FRIDAY NIGHT",
    signOff: "SEE YOU ON THE COURT.",
    welcome: "ALL SKILL LEVELS WELCOME.",
    venue: "ECU SPORT & FITNESS",
    suburb: "MOUNT LAWLEY",
    venueShort: "ECU MOUNT LAWLEY",
    city: "PERTH",
    timeRange: "7:30 PM – 10:00 PM",
    courts: 6,
    mainCourts: 2,
    maxPlayers: 84,
    /** Booking URL shown under "BOOK YOUR SPOT". null = not shown (don't guess). */
    bookingUrl: null as string | null,
    /** Short text CTA, e.g. "LINK IN BIO". */
    bookingCta: "BOOK YOUR SPOT.",
    /** Shown under the CTA while there is no booking URL. */
    bookingHint: "CHECK OUR INSTAGRAM FOR BOOKING DETAILS." as string | null,
    /**
     * Only switch to true once the organisers confirm the claim can be
     * substantiated. false → "PERTH'S FRIDAY NIGHT VOLLEYBALL SOCIALS".
     */
    biggestClaimConfirmed: false,
  },

  /** All three organisers are equal collaborators — order is alphabetical. */
  // Official files supplied 26 Nov 2026: Chequers + DO as JPEG on black
  // (no transparency), Crimson as a transparent PNG. Used unmodified.
  orgs: [
    {
      id: "chequers",
      name: "Chequers Volleyball Club",
      short: "CHEQUERS",
      logo: "brand/logos/chequers.jpg",
      artBox: [0, 0, 1, 1],
      handle: null,
    },
    {
      id: "crimson",
      name: "Crimson Volleyball Club",
      short: "CRIMSON",
      logo: "brand/logos/crimson.png",
      artBox: [0.066, 0, 0.909, 0.994],
      handle: "@crimson.vc",
    },
    {
      id: "do",
      name: "DO Volleyball",
      short: "DO VOLLEYBALL",
      logo: "brand/logos/do-volleyball.jpg",
      artBox: [0.176, 0.086, 0.824, 0.908],
      handle: null,
    },
  ] satisfies Org[],

  session: {
    warmup: "7:30 PM",
    firstGame: "7:45 PM",
    gameMinutes: 15,
    breakAfterGame: 4,
    breakMinutes: 10,
    finish: "10:00 PM",
    /** Leave null until organisers confirm the exact number of games. */
    totalGames: null as number | null,
  },

  /** Neutral premium identity: black/white foundation, subtle accents. */
  colors: {
    black: "#060606",
    ink: "#0E0E0F",
    graphite: "#1A1A1C",
    steel: "#2A2A2E",
    white: "#FFFFFF",
    bone: "#EDEAE4",
    mute: "#8D8A86",
    accent: "#C8102E", // crimson
    accentDeep: "#5A0A16", // maroon
    accent2: "#D9D2C3", // warm neutral highlight
    stationary: "#E8B23A", // ⚠ stands out from all brand colours on purpose
    rotating: "#FFFFFF",
    success: "#3DDC84",
    fail: "#FF4D4D",
  },

  social: {
    instagram: ["@crimson.vc"] as string[], // add the other organisers' handles when known
    hashtags: [
      "#FridayNightVolleyball",
      "#PerthVolleyball",
      "#IndoorVolleyball",
      "#VolleyballSocials",
      "#PerthSport",
    ],
  },

  /** Beat grid used to time cuts. Set to your licensed track's BPM. */
  music: {
    src: null as string | null, // e.g. "audio/music/friday-track.mp3"
    bpm: 120,
    volume: 0.85,
    /** Volume of the footage's own sound (crowd, squeaks, ball hits). */
    // Kept at 0 by owner decision (26 Nov): the compilation's own music stays muted;
    // exports carry the generated SFX only and music is added in Instagram/TikTok.
    footageVolume: 0,
    sfxVolume: 0.7,
  },

  text: {
    // Hook + reveal read as one line: "(ONE OF) PERTH'S BIGGEST · FRIDAY NIGHT INDOOR VOLLEYBALL SOCIALS"
    // Headline = hook (0–3 s) + reveal (3–6 s), read as one line.
    // Verified:   "PERTH'S BIGGEST · FRIDAY NIGHT · INDOOR VOLLEYBALL SOCIALS"
    // Unverified: "PERTH'S · FRIDAY NIGHT · VOLLEYBALL SOCIALS"   (current)
    headline: {
      hook: ["PERTH'S", "FRIDAY", "NIGHT"],
      reveal: ["VOLLEYBALL", "SOCIALS."],
      revealKicker: "EVERY FRIDAY NIGHT",
    },
    headlineVerified: {
      hook: ["PERTH'S", "BIGGEST"],
      reveal: ["FRIDAY", "NIGHT"],
      revealKicker: "INDOOR VOLLEYBALL SOCIALS",
    },
    community: ["GOOD VOLLEYBALL.", "GREAT COMPANY."],
    stats: [
      "6 COURTS.",
      "UP TO 84 PLAYERS.",
      "ALL SKILL LEVELS WELCOME.",
      "15-MINUTE GAMES.",
    ],
    proudlyRunBy: "PROUDLY HOSTED BY",
    orgLine: "CHEQUERS × CRIMSON × DO VOLLEYBALL",
    newHere: ["NEW TO FRIDAY SOCIALS?", "HERE'S HOW IT WORKS."],
    newHereRotate: ["NEW TO FRIDAY SOCIALS?", "HERE'S HOW TO ROTATE."],
    rotationCaptions: [
      "ONE TEAM STAYS.",
      "EVERYONE ELSE ROTATES CLOCKWISE.",
      "NEW GAME. NEW OPPONENTS.",
    ],
    explainerOutro: [
      "NOW YOU KNOW HOW IT WORKS.",
      "IT'S YOUR TURN.",
      "GOOD VOLLEYBALL. GREAT COMPANY.",
      "SEE YOU ON THE COURT.",
    ],
    teaser: [
      "PERTH'S FRIDAY NIGHTS.",
      "SIX COURTS.",
      "UP TO 84 PLAYERS.",
      "ALL SKILL LEVELS WELCOME.",
    ],
  },

  /**
   * Serving rules — confirmed and animation approved on 26 Nov 2026:
   * 1st miss → same player serves again; 2nd miss → free ball to the
   * opposition; service then transfers to the opposing team.
   */
  serving: [
    {
      title: ["FIRST SERVE MISSED?", "YOU GET A SECOND ATTEMPT."],
      outcome: "retry",
    },
    {
      title: ["SECOND SERVE MISSED?", "FREE BALL TO THE OPPOSITION."],
      outcome: "freeball",
    },
    {
      title: ["TWO MISSED SERVES.", "SERVICE PASSES TO THE OTHER TEAM."],
      outcome: "transfer",
    },
  ] as const,
} as const;

export type Campaign = typeof campaign;
/** Headline copy, switching on whether the "biggest" claim has been verified. */
export const headline = () =>
  campaign.event.biggestClaimConfirmed
    ? campaign.text.headlineVerified
    : campaign.text.headline;
