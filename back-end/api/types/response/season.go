package response

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
)

type GetAllSeasonsResponse struct {
	Seasons []SeasonResponse `json:"seasons"`
}

type SeasonResponse struct {
	ID            uuid.UUID       `json:"id"`
	Name          string          `json:"name"`
	CurrentSeason bool            `json:"currentSeason"`
	Events        []EventResponse `json:"events"`
}

func (s *SeasonResponse) MapModelIntoResponse(model models.Season) {
	s.ID = model.ID
	s.Name = model.Name
	s.CurrentSeason = model.Current
	for _, event := range model.Events {
		var eventResponse EventResponse
		eventResponse.MapModelIntoResponse(event)
		s.Events = append(s.Events, eventResponse)
	}
}
