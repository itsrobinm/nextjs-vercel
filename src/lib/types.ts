export interface TeamData {
  won: number;
  drew: number;
  lost: number;
  points: number;
  goalDifference: number;
  for: number;
  against: number;
  played: number;
}

export type Table = Record<string, TeamData>