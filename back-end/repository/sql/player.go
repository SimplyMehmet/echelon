package sql

import (
	"echelon.com/repository/sql/models"
	"errors"
	"gorm.io/gorm"
)

func (r *Repository) CreatePlayer(model models.Player) error {
	db := r.db.Model(&models.Player{}).Create(&model)
	return db.Error
}

func (r *Repository) GetAllPlayers() ([]models.Player, error) {
	var model []models.Player
	db := r.db.Model(&models.Player{}).Limit(10).Find(&model)
	if db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, db.Error) {
		return nil, db.Error
	}

	return model, nil
}
