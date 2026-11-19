package response

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
	"time"
)

type EventResponse struct {
	ID       uuid.UUID          `json:"id"`
	StartsAt time.Time          `json:"startsAt"`
	Entrants int                `json:"entrants"`
	Location string             `json:"location"`
	Name     string             `json:"name"`
	Sets     []EventSetResponse `json:"sets"`
}

type EventSetResponse struct {
	ID          uuid.UUID                `json:"id"`
	Players     []EventSetPlayerResponse `json:"players"`
	Round       int                      `json:"round"`
	StartedAt   *time.Time               `json:"startedAt"`
	CompletedAt *time.Time               `json:"completedAt"`
	OnStream    bool                     `json:"onStream"`
	Name        string                   `json:"name"`
}

type EventSetPlayerResponse struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

func (e *EventResponse) MapModelIntoResponse(model models.Event, modelSetRelations []models.PlayerSet) {
	e.StartsAt = model.StartsAt
	e.Entrants = model.PlayerCount
	e.Location = model.Location
	e.Name = model.Name
	e.ID = model.ID

	mappedPlayers := make(map[uuid.UUID][]EventSetPlayerResponse)
	for _, set := range modelSetRelations {
		mappedPlayers[set.SetID] = append(
			mappedPlayers[set.SetID],
			EventSetPlayerResponse{
				Name:  set.Player.Name,
				Score: set.Score,
			},
		)
	}

	filteredSets := make(map[uuid.UUID]EventSetResponse)
	for _, set := range modelSetRelations {
		filteredSet, ok := filteredSets[set.SetID]
		if !ok {
			filteredSet = EventSetResponse{
				Round:       set.Set.Round,
				ID:          set.SetID,
				Players:     mappedPlayers[set.SetID],
				StartedAt:   set.Set.StartedAt,
				CompletedAt: set.Set.CompletedAt,
				OnStream:    set.Set.OnStream,
				Name:        set.Set.Name,
			}
		}

		filteredSets[set.SetID] = filteredSet
	}

	for _, filteredSet := range filteredSets {
		e.Sets = append(e.Sets, filteredSet)
	}
}
