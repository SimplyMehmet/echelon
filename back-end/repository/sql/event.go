package sql

import (
	"errors"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"gorm.io/gorm"
)

func (r *Repository) GetEvents() ([]models.Event, error) {
	var model []models.Event
	// do not forget should be paginated
	r.db.Model(&models.Event{}).Preload("Player").Preload("Season").Limit(1000).Find(&model)
	if r.db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, r.db.Error) {
		return nil, r.db.Error
	}

	return model, nil
}
