package sql

import (
	"errors"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"gorm.io/gorm"
)

func (r *Repository) GetAllTeams() ([]models.Team, error) {
	var model []models.Team
	r.db.Model(&models.Team{}).Preload("Players").Limit(10).Find(&model)
	if r.db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, r.db.Error) {
		return nil, r.db.Error
	}

	return model, nil
}
