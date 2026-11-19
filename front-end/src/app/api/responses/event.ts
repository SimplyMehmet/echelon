export type GetEventResponse = {
  id: string;
  name: string;
  location: string;
  entrants: number;
  startsAt: string;
  sets: GetEventSetsResponse[];
};

export type GetEventSetsResponse = {
  players: GetEventSetsPlayerResponse[];
  round: number;
  id: string;
  startedAt: string | null;
  completedAt: string | null;
  onStream: boolean;
  name: string;
};

export type GetEventSetsPlayerResponse = {
  name: string;
  score: number;
};
