export type { Team, Match, Bracket } from "./types";
export type { Rng } from "./rng";
export { createSeededRng } from "./rng";
export { TEAMS } from "./teams";
export type { Round } from "./rounds";
export { ROUNDS } from "./rounds";
export { createBracket, pairTeams } from "./bracket";
export type { MatchResult } from "./match";
export {
  FAVORITE_DIE,
  UNDERDOG_DIE,
  resolveMatch,
  resolveRound,
} from "./match";
export type { RoundPlay, TournamentPlay } from "./tournament";
export { advance, playTournament } from "./tournament";
export type {
  MatchPrediction,
  RoundScore,
  ScoredTournament,
  PickStrategy,
} from "./scoring";
export { cpuPicks, scoreRound, scoreTournament } from "./scoring";
export type { Playthrough } from "./play";
export {
  startPlaythrough,
  pick,
  next,
  currentRound,
  currentMatch,
  currentResult,
  currentPlayerPick,
  currentCpuPick,
  isResolved,
  isLastMatch,
  isFinalRound,
  scores,
} from "./play";
