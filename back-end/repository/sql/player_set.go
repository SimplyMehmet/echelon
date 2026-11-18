package sql

import (
	"fmt"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

func (r *Repository) UpsertPlayerSetRelation(playerSetModel models.PlayerSet) (models.PlayerSet, error) {
	r.db.Model(&models.PlayerSet{}).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "player_id"}, {Name: "set_id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"score",
		}),
	}).Create(&playerSetModel)
	if r.db.Error != nil {
		return models.PlayerSet{}, fmt.Errorf("could not UpsertPlayerSetRelation err: %v", r.db.Error)
	}

	return playerSetModel, nil
}

func (r *Repository) GetPlayerSetsByEventID(eventID uuid.UUID) ([]models.PlayerSet, error) {
	var playerSets []models.PlayerSet
	r.db.Joins("Set").Where("Set.event_id = ?", eventID).Preload("Player").Find(&playerSets)
	if r.db.Error != nil {
		return nil, fmt.Errorf("could not GetPlayerSetsByEventID err: %v", r.db.Error)
	}

	return playerSets, nil
}
