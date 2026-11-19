package response

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
)

type GetAllPlayerResponse struct {
	Players []PlayerResponse `json:"players"`
}

type PlayerResponse struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Team         string    `json:"team"`
	Attended     int       `json:"attended"`
	ScoreTotal   int       `json:"scoreTotal"`
	ScoreCurrent int       `json:"scoreCurrent"`
}

func (r *PlayerResponse) MapModelIntoStruct(model models.Player, playerEvents []models.PlayerEvent) {
	r.ID = model.ID
	r.Name = model.Name

	if model.Team != nil {
		r.Team = model.Team.Name
	}

	for _, playerEvent := range playerEvents {
		points := models.PointsByPlacement[playerEvent.Placement] * playerEvent.Event.PointMultiplier
		if playerEvent.Event.Season.Current {
			r.ScoreCurrent += points
		}

		r.Attended++
		r.ScoreTotal += points
	}
}
