package sql

import (
	"fmt"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"gorm.io/gorm/clause"
)

func (r *Repository) UpsertStartGGSeason(season startgg.MappedSeason) (models.Season, error) {
	seasonModel := models.Season{
		Name:      season.Name,
		StartGGID: season.StartGGSourceSeason,
		Current:   season.Current,
	}

	r.db.Model(&models.Season{}).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "start_gg_id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"name",
		}),
	}).FirstOrCreate(&seasonModel, models.Season{Name: season.Name})

	if r.db.Error != nil {
		return seasonModel, fmt.Errorf("could not create Season %s err: %v", season.Name, r.db.Error)
	}

	return seasonModel, nil
}
func (r *Repository) GetAllSeasons() ([]models.Season, error) {
	var model []models.Season
	r.db.Model(&models.Season{}).Preload("Events.Players").Find(&model)
	if r.db.Error != nil {
		return nil, r.db.Error
	}

	return model, nil
}
