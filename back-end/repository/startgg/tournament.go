package startgg

import (
	"context"
	"echelon.com/repository/startgg/client"
)

func (r *Repository) GetTournamentEvents(slug string) ([]TournamentEvent, error) {
	var resp []TournamentEvent
	events, err := client.TournamentEvents(context.Background(), r.client, slug)
	if err != nil {
		return nil, err
	}

	for _, event := range events.Tournament.Events {
		var tournamentEvent TournamentEvent
		tournamentEvent.ID = event.Id
		tournamentEvent.Name = event.Name
		resp = append(resp, tournamentEvent)
	}

	return resp, nil
}

func (r *Repository) GetLeagueTournaments(slug string) ([]TournamentEvent, error) {
	var resp []TournamentEvent
	events, err := client.LeagueEvents(context.Background(), r.client, slug)
	if err != nil {
		return nil, err
	}

	for _, event := range events.League.Events.Nodes {
		var tournamentEvent TournamentEvent
		tournamentEvent.ID = event.Id
		tournamentEvent.Name = event.Tournament.Name
		resp = append(resp, tournamentEvent)
	}

	return resp, nil
}
