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
  /** Path inside public/. Drop the official transparent PNG/SVG there. */
  logo: string;
  handle: string | null;
};

export const campaign = {
  event: {
    name: "FRIDAY NIGHT VOLLEYBALL SOCIALS",
    nameLines: ["FRIDAY NIGHT", "VOLLEYBALL SOCIALS"],
    kind: "INDOOR VOLLEYBALL SOCIALS",
    day: "EVERY FRIDAY",
    season: "RUNNING ALL SUMMER LONG.",
    venue: "ECU SPORT & FITNESS",
    suburb: "MOUNT LAWLEY",
    venueShort: "ECU MOUNT LAWLEY",
    city: "PERTH",
    timeRange: "7:30 PM – 10:00 PM",
    /** Specific season dates, e.g. "6 DEC – 28 FEB". null = not shown. */
    dates: null as string | null,
    courts: 6,
    mainCourts: 2,
    maxPlayers: 84,
    /** Booking URL shown under "BOOK YOUR SPOT". null = not shown (don't guess). */
    bookingUrl: null as string | null,
    /** Short text CTA, e.g. "LINK IN BIO". */
    bookingCta: "BOOK YOUR SPOT.",
    bookingHint: null as string | null,
    /**
     * Only switch to true once the organisers confirm the claim can be
     * substantiated. false → "ONE OF PERTH'S BIGGEST".
     */
    biggestClaimConfirmed: false,
  },

  /** All three organisers are equal collaborators — order is alphabetical. */
  orgs: [
    {
      id: "chequers",
      name: "Chequers Volleyball Club",
      short: "CHEQUERS",
      logo: "brand/logos/chequers.png",
      handle: null,
    },
    {
      id: "crimson",
      name: "Crimson Volleyball Club",
      short: "CRIMSON",
      logo: "brand/logos/crimson.png",
      handle: "@crimson.vc",
    },
    {
      id: "do",
      name: "DO Volleyball",
      short: "DO VOLLEYBALL",
      logo: "brand/logos/do-volleyball.png",
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
    src: null as string | null, // e.g. "audio/music/summer-track.mp3"
    bpm: 120,
    volume: 0.85,
    /** Volume of the footage's own sound (crowd, squeaks, ball hits). */
    footageVolume: 0.35,
    sfxVolume: 0.7,
  },

  text: {
    hook: ["ONE OF", "PERTH'S", "BIGGEST"],
    hookConfirmed: ["PERTH'S", "BIGGEST"],
    community: ["MORE THAN JUST VOLLEYBALL.", "YOUR FRIDAY NIGHTS. REDEFINED."],
    stats: [
      "6 COURTS.",
      "UP TO 84 PLAYERS.",
      "EVERY FRIDAY.",
      "ONE VOLLEYBALL COMMUNITY.",
    ],
    proudlyRunBy: "PROUDLY RUN BY",
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
      "YOUR FRIDAY NIGHTS.",
      "REDEFINED.",
    ],
    teaser: [
      "PERTH'S FRIDAY NIGHTS.",
      "SIX COURTS.",
      "UP TO 84 PLAYERS.",
      "ALL SUMMER LONG.",
    ],
  },

  /**
   * ⚠ CONFIRM — serving rules as briefed. The exact free-ball / service
   * transfer mechanics are awaiting organiser confirmation.
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
export const hookLines = () =>
  campaign.event.biggestClaimConfirmed
    ? campaign.text.hookConfirmed
    : campaign.text.hook;
