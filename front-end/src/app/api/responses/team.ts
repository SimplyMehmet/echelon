import { PlayerResponse } from './player';

export type getAllTeamsResponse = {
  teams: TeamResponse[];
};

export type TeamResponse = {
  id: string;
  name: string;
  players: PlayerResponse[] | null;
};
