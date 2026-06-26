import type { Team } from "./types";

/**
 * The 32 national Teams in Rank order (Rank 1 = strongest), from the FIFA men's
 * ranking snapshot in docs/adr/0001-national-teams-over-clubs.md. Rank decides
 * the Favorite within a Match.
 *
 * England and Wales use Unicode subdivision-flag emoji (tag sequences) that
 * render on most modern mobile devices but not everywhere.
 */
export const TEAMS: readonly Team[] = [
  { rank: 1, name: "Argentina", flag: "🇦🇷" },
  { rank: 2, name: "Spain", flag: "🇪🇸" },
  { rank: 3, name: "France", flag: "🇫🇷" },
  { rank: 4, name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { rank: 5, name: "Brazil", flag: "🇧🇷" },
  { rank: 6, name: "Portugal", flag: "🇵🇹" },
  { rank: 7, name: "Netherlands", flag: "🇳🇱" },
  { rank: 8, name: "Belgium", flag: "🇧🇪" },
  { rank: 9, name: "Italy", flag: "🇮🇹" },
  { rank: 10, name: "Germany", flag: "🇩🇪" },
  { rank: 11, name: "Croatia", flag: "🇭🇷" },
  { rank: 12, name: "Morocco", flag: "🇲🇦" },
  { rank: 13, name: "Colombia", flag: "🇨🇴" },
  { rank: 14, name: "Uruguay", flag: "🇺🇾" },
  { rank: 15, name: "USA", flag: "🇺🇸" },
  { rank: 16, name: "Switzerland", flag: "🇨🇭" },
  { rank: 17, name: "Mexico", flag: "🇲🇽" },
  { rank: 18, name: "Japan", flag: "🇯🇵" },
  { rank: 19, name: "Senegal", flag: "🇸🇳" },
  { rank: 20, name: "Denmark", flag: "🇩🇰" },
  { rank: 21, name: "Iran", flag: "🇮🇷" },
  { rank: 22, name: "South Korea", flag: "🇰🇷" },
  { rank: 23, name: "Austria", flag: "🇦🇹" },
  { rank: 24, name: "Australia", flag: "🇦🇺" },
  { rank: 25, name: "Ukraine", flag: "🇺🇦" },
  { rank: 26, name: "Ecuador", flag: "🇪🇨" },
  { rank: 27, name: "Canada", flag: "🇨🇦" },
  { rank: 28, name: "Egypt", flag: "🇪🇬" },
  { rank: 29, name: "Poland", flag: "🇵🇱" },
  { rank: 30, name: "Serbia", flag: "🇷🇸" },
  { rank: 31, name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { rank: 32, name: "Türkiye", flag: "🇹🇷" },
];
