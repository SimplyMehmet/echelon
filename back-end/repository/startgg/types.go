package startgg

import (
	"github.com/Khan/genqlient/graphql"
)

type Repository struct {
	client graphql.Client
}

type TournamentEvent struct {
	Name string
	ID   string
}

type Player struct {
	ID                      string
	Name                    string
	Placements              []PlacementInEvent
	PlacementsCurrentSeason []PlacementInEvent
}

type PlacementInEvent struct {
	EventID   string
	Placement int64
}

type MappedPlayer struct {
	Name       string
	Attended   int64
	ScoreTotal int64
	ScoreCurr  int64
	Team       string
	StartGGID  string
}
