package response

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
)

type GetAllTeamsResponse struct {
	Teams []TeamResponse `json:"teams"`
}

type TeamResponse struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Score int64     `json:"score"`
}

func (r *TeamResponse) MapModelIntoStruct(team models.Team, score int64) {
	r.ID = team.ID
	r.Name = team.Name
	r.Score = score
}
