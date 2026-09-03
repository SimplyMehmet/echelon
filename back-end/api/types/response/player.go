package response

import (
	"echelon.com/repository/sql/models"
	"github.com/google/uuid"
)

type GetAllPlayerResponse struct {
	Players []PlayerResponse `json:"players"`
}

type PlayerResponse struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Attended     int64     `json:"attended"`
	ScoreTotal   int64     `json:"scoreTotal"`
	ScoreCurrent int64     `json:"scoreCurrent"`
	Team 				string			`json:"team"`
}

func (r *PlayerResponse) MapModelIntoStruct(model models.Player) {
	r.ID = model.ID
	r.Name = model.Name
	r.Attended = model.Attended
	r.ScoreTotal = model.ScoreTotal
	r.ScoreCurrent = model.ScoreCurrent
	if model.Team != nil {
		r.Team = model.Team.Name
	}
}
