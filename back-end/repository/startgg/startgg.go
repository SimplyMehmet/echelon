package startgg

import (
	"echelon.com/config"
	"github.com/Khan/genqlient/graphql"
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

func (r *Repository) Start() ([]MappedPlayer, error) {
	combinedMappedPlayers := map[int64]MappedPlayer{}
	for _, season := range Seasons {
		mappedPlayers, err := r.buildLeaderboardForSeason(season)
		if err != nil {
			return nil, err
		}

		// Might need to defer if we want to do season by season
		for _, mappedPlayer := range mappedPlayers {
			combined, exists := combinedMappedPlayers[mappedPlayer.StartGGID]
			if !exists {
				combined = mappedPlayer
			} else {
				combined.ScoreTotal = combined.ScoreTotal + mappedPlayer.ScoreTotal
				combined.ScoreCurr = combined.ScoreCurr + mappedPlayer.ScoreCurr
				combined.Attended = combined.Attended + mappedPlayer.Attended

				if season.CurrentSeason {
					combined.Team = mappedPlayer.Team
				}
			}

			combinedMappedPlayers[mappedPlayer.StartGGID] = combined
		}
	}

	players := make([]MappedPlayer, 0, len(combinedMappedPlayers))

	for _, player := range combinedMappedPlayers {
		players = append(players, player)
	}

	return players, nil
}

func (r *Repository) buildLeaderboardForSeason(season TournamentSeasonConfiguration) ([]MappedPlayer, error) {
	var tournaments []TournamentEvent
	if season.Type == League {
		events, err := r.GetLeagueTournaments(season.StartGGSource)
		if err != nil {
			return nil, err
		}

		tournaments = events
	}

	if season.Type == Tournament {
		events, err := r.GetTournamentEvents(season.StartGGSource)
		if err != nil {
			return nil, err
		}

		tournaments = events
	}

	var AllPlayers []Player
	for _, event := range tournaments {
		players, err := r.GetPlayersOfEvent(event.ID)
		if err != nil {
			return nil, err
		}

		AllPlayers = append(AllPlayers, players...)
	}

	filteredPlayers := map[int64]Player{}
	for _, player := range AllPlayers {
		filteredPlayer, exists := filteredPlayers[player.ID]
		if !exists {
			filteredPlayer = player
		} else {
			filteredPlayer.Placements = append(filteredPlayer.Placements, player.Placements...)
		}

		if season.CurrentSeason {
			filteredPlayer.PlacementsCurrentSeason = append(filteredPlayer.PlacementsCurrentSeason, player.Placements...)
		}

		filteredPlayers[player.ID] = filteredPlayer
	}

	var mappedPlayers []MappedPlayer
	for _, player := range filteredPlayers {
		var totalPoints int64
		var currentPoints int64
		for _, placement := range player.Placements {
			doublePoints, exists := season.DoubleXPEventIDs[placement.EventID]
			points := PointsByPlacement[placement.Placement]
			if exists && doublePoints {
				points += points
			}

			totalPoints += points
		}

		for _, placement := range player.PlacementsCurrentSeason {
			doublePoints, exists := season.DoubleXPEventIDs[placement.EventID]
			points := PointsByPlacement[placement.Placement]
			if exists && doublePoints {
				points += points
			}

			currentPoints += points
		}

		playerEntry := MappedPlayer{
			Name:       player.Name,
			ScoreTotal: totalPoints,
			ScoreCurr:  currentPoints,
			Attended:   int64(len(player.Placements)),
			Team:       season.Teams[player.ID],
			StartGGID:  player.ID,
		}

		mappedPlayers = append(mappedPlayers, playerEntry)
	}

	return mappedPlayers, nil
}
