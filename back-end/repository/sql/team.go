package sql

import (
	"errors"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (r *Repository) FindOrCreateTeam(teamName string) (models.Team, error) {
	model := models.Team{
		Name: teamName,
	}

	r.db.FirstOrCreate(&model, models.Team{Name: teamName})
	if r.db.Error != nil {
		return model, r.db.Error
	}

	return model, nil
}

func (r *Repository) GetAllTeams() ([]models.Team, error) {
	var model []models.Team
	r.db.Model(&models.Team{}).Preload(clause.Associations).Limit(10).Find(&model)
	if r.db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, r.db.Error) {
		return nil, r.db.Error
	}

	return model, nil
}
