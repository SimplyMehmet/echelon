package startgg

import (
	"github.com/Khan/genqlient/graphql"
	"time"
)

type Repository struct {
	client graphql.Client
}

type TournamentEvent struct {
	Name string
	ID   string
}

type Player struct {
	ID         string
	Name       string
	Placements []PlacementInEvent
	Team       string
}

type Event struct {
	ID              string
	Name            string
	StartsAt        time.Time
	Entrants        int
	Location        string
	PointMultiplier int
	State           string
	Sets            []Set
}

type Set struct {
	ID          string
	Name        string
	Round       int
	OnStream    bool
	StartedAt   time.Time
	CompletedAt time.Time
	Players     []SetPlayer
}

type SetPlayer struct {
	ID    string
	Name  string
	Score int
}

type MappedSeason struct {
	StartGGSourceSeason string
	Events              []Event
	Current             bool
	Name                string
}

type PlacementInEvent struct {
	EventID   string
	Placement int
}

type MappedPlayer struct {
	Name       string
	Attended   int
	Placements []PlacementInEvent
	Team       string
	StartGGID  string
}
