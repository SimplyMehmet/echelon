package response

import (
	"echelon.com/repository/sql/models"
	"github.com/google/uuid"
)

type GetAllPlayerResponse struct {
	Players []PlayerResponse
}

type PlayerResponse struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func (r *PlayerResponse) MapModelIntoStruct(model models.Player) {
	r.ID = model.ID
	r.Name = model.Name
}
