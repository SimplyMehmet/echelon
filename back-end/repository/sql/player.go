package sql

import (
	"errors"

	"echelon.com/repository/sql/models"
	"gorm.io/gorm"
)

func (r *Repository) CreatePlayer(model models.Player) error {
	db := r.db.Model(&models.Player{}).Create(&model)
	return db.Error
}

func (r *Repository) GetAllPlayers() ([]models.Player, error) {
	var model []models.Player
	// do not forget should be paginated
	db := r.db.Model(&models.Player{}).Preload("Team").Limit(1000).Find(&model)
	if db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, db.Error) {
		return nil, db.Error
	}

	return model, nil
}
