package event

import (
	"github.com/SimplyMehmet/echelon/back-end/api/types/response"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/google/uuid"
)

func New(sqlRepository *sql.Repository) *Event {
	return &Event{
		sqlRepository: sqlRepository,
	}
}

func (e *Event) GetEventByID(id uuid.UUID) (response.EventResponse, error) {
	var resp response.EventResponse

	eventModel, err := e.sqlRepository.GetEventByID(id)
	if err != nil {
		return resp, err
	}

	playerSetModelList, err := e.sqlRepository.GetPlayerSetsByEventID(id)
	resp.MapModelIntoResponse(eventModel, playerSetModelList)
	return resp, nil
}
