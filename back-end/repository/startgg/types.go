package startgg

import (
	"github.com/Khan/genqlient/graphql"
)

type Repository struct {
	client graphql.Client
}

type TournamentEvent struct {
	Name string
	ID   int64
}

type Player struct {
	ID                      int64
	Name                    string
	Placements              []PlacementInEvent
	PlacementsCurrentSeason []PlacementInEvent
}

type PlacementInEvent struct {
	EventID   int64
	Placement int64
}

type MappedPlayer struct {
	Name       string
	Attended   int64
	ScoreTotal int64
	ScoreCurr  int64
	Team       string
	StartGGID  int64
}
