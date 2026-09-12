package startgg

import (
	"github.com/Khan/genqlient/graphql"
	"github.com/SimplyMehmet/echelon/back-end/config"
	"net/http"
)

type authTransport struct {
	wrapped http.RoundTripper
	token   string
}

func (t *authTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+t.token)
	req.Header.Set("Content-Type", "application/json")
	req.Method = http.MethodPost
	return t.wrapped.RoundTrip(req)
}

func New() *Repository {
	cfg := config.Load()
	httpClient := &http.Client{
		Transport: &authTransport{
			wrapped: http.DefaultTransport,
			token:   cfg.StartGGAPIKey,
		},
	}

	return &Repository{
		client: graphql.NewClient(cfg.StartGGAPIUrl, httpClient),
	}
}

func (r *Repository) ImportStartGGData() ([]MappedPlayer, []MappedSeason, error) {
	combinedMappedPlayers := map[string]MappedPlayer{}
	var allSeason []MappedSeason
	for _, season := range Seasons {
		mappedPlayers, events, err := r.buildLeaderboardForSeason(season)
		if err != nil {
			return nil, nil, err
		}

		// Might need to defer if we want to do season by season
		for _, mappedPlayer := range mappedPlayers {
			combined, exists := combinedMappedPlayers[mappedPlayer.StartGGID]
			if !exists {
				combined = mappedPlayer
			} else {
				combined.Placements = append(combined.Placements, mappedPlayer.Placements...)
				combined.Attended = combined.Attended + mappedPlayer.Attended

				if season.CurrentSeason {
					combined.Team = mappedPlayer.Team
				}
			}

			combinedMappedPlayers[mappedPlayer.StartGGID] = combined
		}

		mappedSeason := MappedSeason{
			StartGGSourceSeason: season.StartGGSource,
			Events:              events,
			Name:                season.Name,
			Current:             season.CurrentSeason,
		}

		allSeason = append(allSeason, mappedSeason)
	}

	players := make([]MappedPlayer, 0, len(combinedMappedPlayers))

	for _, player := range combinedMappedPlayers {
		players = append(players, player)
	}

	return players, allSeason, nil
}

func (r *Repository) buildLeaderboardForSeason(season TournamentSeasonConfiguration) ([]MappedPlayer, []Event, error) {
	var tournaments []TournamentEvent
	if season.Type == League {
		events, err := r.GetLeagueTournaments(season.StartGGSource)
		if err != nil {
			return nil, nil, err
		}

		tournaments = events
	}

	if season.Type == Tournament {
		events, err := r.GetTournamentEvents(season.StartGGSource)
		if err != nil {
			return nil, nil, err
		}

		tournaments = events
	}

	var AllPlayers []Player
	var eventDetailCollection []Event
	for _, event := range tournaments {
		players, eventDetails, err := r.GetEventAndParticipants(event.ID, season.StartGGSource)
		if err != nil {
			return nil, nil, err
		}

		eventDetailCollection = append(eventDetailCollection, eventDetails)
		AllPlayers = append(AllPlayers, players...)
	}

	filteredPlayers := map[string]Player{}
	for _, player := range AllPlayers {
		filteredPlayer, exists := filteredPlayers[player.ID]
		if !exists {
			filteredPlayer = player
		} else {
			filteredPlayer.Placements = append(filteredPlayer.Placements, player.Placements...)
		}

		filteredPlayers[player.ID] = filteredPlayer
	}

	var mappedPlayers []MappedPlayer
	for _, player := range filteredPlayers {
		var totalPoints int64
		for _, placement := range player.Placements {
			doublePoints, exists := season.DoubleXPEventIDs[placement.EventID]
			points := PointsByPlacement[placement.Placement]
			if exists && doublePoints {
				points += points
			}

			totalPoints += points
		}

		playerEntry := MappedPlayer{
			Name:       player.Name,
			Placements: player.Placements,
			Attended:   int64(len(player.Placements)),
			Team:       season.Teams[player.ID],
			StartGGID:  player.ID,
		}

		mappedPlayers = append(mappedPlayers, playerEntry)
	}

	return mappedPlayers, eventDetailCollection, nil
}
