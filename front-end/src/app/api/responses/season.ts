import { GetEventResponse } from './event';

export type GetAllSeasonsResponse = {
  seasons: GetSeasonResponse[];
};

export type GetSeasonResponse = {
  id: string;
  name: string;
  currentSeason: boolean;
  events: GetEventResponse[];
};
