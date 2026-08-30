package response

import (
	"echelon.com/repository/sql/models"
	"github.com/google/uuid"
)

type GetAllTeamsResponse struct {
	Teams []TeamResponse `json:"teams"`
}

type TeamResponse struct {
	ID      uuid.UUID        `json:"id"`
	Name    string           `json:"name"`
	Players []PlayerResponse `json:"players"`
}

func (r *TeamResponse) MapModelIntoStruct(team models.Team) {
	r.ID = team.ID
	r.Name = team.Name
	for _, player := range team.Players {
		var playerResponse PlayerResponse
		playerResponse.MapModelIntoStruct(player)
		r.Players = append(r.Players, playerResponse)
	}
}
