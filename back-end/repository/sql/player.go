package sql

import (
	"errors"

	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"gorm.io/gorm"
)

func (r *Repository) CreatePlayer(model models.Player) error {
	return r.db.Model(&models.Player{}).Create(&model).Error
}

func (r *Repository) GetAllPlayers() ([]models.Player, error) {
	var model []models.Player

	// do not forget should be paginated
	r.db.Model(&models.Player{}).Preload("Team").Limit(1000).Find(&model)
	if r.db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, r.db.Error) {
		return nil, r.db.Error
	}

	return model, nil
}
