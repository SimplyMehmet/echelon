package sql

import "github.com/SimplyMehmet/echelon/back-end/repository/sql/models"

func (r *Repository) GetAllSeasons() ([]models.Season, error) {
	var model []models.Season
	r.db.Model(&models.Season{}).Preload("Events.Players").Find(&model)
	if r.db.Error != nil {
		return nil, r.db.Error
	}

	return model, nil
}
