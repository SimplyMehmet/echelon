package sql

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

func (r *Repository) GetPLayerEventsByPlayerID(playerID uuid.UUID) ([]models.PlayerEvent, error) {
	var events []models.PlayerEvent
	r.db.Model(&models.PlayerEvent{}).Preload("Event.Season").Where("player_id = ?", playerID).Find(&events)
	if r.db.Error != nil {
		return nil, r.db.Error
	}

	return events, nil
}

func (r *Repository) CreatePlayerEventRelations(
	placements []startgg.PlacementInEvent,
	playerModel models.Player,
	events []models.Event,
) error {
	db := r.db
	attendedStartGGEvents := map[string]int64{}
	for _, placement := range placements {
		attendedStartGGEvents[placement.EventID] = placement.Placement
	}

	if len(attendedStartGGEvents) > 0 {
		for _, event := range events {
			if _, eventExists := attendedStartGGEvents[event.StartGGID]; eventExists {
				var playerEventModel models.PlayerEvent
				playerEventModel.PlayerID = playerModel.ID
				playerEventModel.EventID = event.ID
				playerEventModel.Placement = attendedStartGGEvents[event.StartGGID]

				db.Model(&models.PlayerEvent{}).Clauses(clause.OnConflict{
					Columns: []clause.Column{{Name: "player_id"}, {Name: "event_id"}},
					DoUpdates: clause.AssignmentColumns([]string{
						"placement",
					}),
				}).Create(&playerEventModel)
				if db.Error != nil {
					return db.Error
				}
			}
		}
	}

	return nil
}
