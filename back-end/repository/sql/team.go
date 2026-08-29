package sql

import (
	"echelon.com/repository/sql/models"
	"errors"
	"gorm.io/gorm"
)

func (r *Repository) GetAllTeams() ([]models.Team, error) {
	var model []models.Team
	db := r.db.Model(&models.Team{}).Preload("Players").Limit(10).Find(&model)
	if db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, db.Error) {
		return nil, db.Error
	}

	return model, nil
}
