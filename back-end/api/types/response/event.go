package response

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
	"time"
)

type EventResponse struct {
	ID       uuid.UUID `json:"id"`
	StartsAt time.Time `json:"startsAt"`
	Entrants int64     `json:"entrants"`
	Location string    `json:"location"`
	Name     string    `json:"name"`
}

func (e *EventResponse) MapModelIntoResponse(model models.Event) {
	e.StartsAt = model.StartsAt
	e.Entrants = int64(len(model.Players))
	e.Location = model.Location
	e.Name = model.Name
	e.ID = model.ID
}
