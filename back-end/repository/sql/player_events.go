package sql

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
)

func (r *Repository) GetPLayerEventsByPlayerID(playerID uuid.UUID) ([]models.PlayerEvent, error) {
	var events []models.PlayerEvent
	r.db.Model(&models.PlayerEvent{}).Preload("Event.Season").Where("player_id = ?", playerID).Find(&events)
	if r.db.Error != nil {
		return nil, r.db.Error
	}

	return events, nil
}
