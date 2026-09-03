export type getAllPlayersResponse = {
  players: PlayerResponse[];
};

export type PlayerResponse = {
  id: string;
  name: string;
  attended: number;
  scoreTotal: number;
  scoreCurrent: number;
  team: string;
};
