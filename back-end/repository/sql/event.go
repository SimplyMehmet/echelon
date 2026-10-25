package sql

import (
	"errors"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
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

func (r *Repository) GetEventsOfToday() ([]models.Event, error) {
	completedStatus := "COMPLETED"
	now := time.Now()
	startOfDay := time.Date(
		now.Year(),
		now.Month(),
		now.Day(),
		0, 0, 0, 0,
		now.Location(),
	)

	endOfDay := startOfDay.Add(24 * time.Hour)

	var model []models.Event
	r.db.Model(&models.Event{}).Where(
		"starts_at >= ? AND starts_at < ? AND status != ?",
		startOfDay,
		endOfDay,
		completedStatus,
	).Preload("Season").Find(&model)

	if r.db.Error != nil && !errors.Is(gorm.ErrRecordNotFound, r.db.Error) {
		return nil, r.db.Error
	}

	return model, nil
}

func (r *Repository) UpdateEvent(event startgg.Event, seasonID uuid.UUID) (models.Event, error) {
	eventModel := models.Event{
		Name:         event.Name,
		SeasonID:     seasonID,
		StartsAt:     event.StartsAt,
		Location:     event.Location,
		StartGGID:    event.ID,
		DoublePoints: event.DoubleXP,
		Status:       event.State,
	}

	r.db.Model(&models.Event{}).
		Where("start_gg_id = ?", eventModel.StartGGID).
		Assign(map[string]interface{}{
			"starts_at":     eventModel.StartsAt,
			"double_points": eventModel.DoublePoints,
			"season_id":     eventModel.SeasonID,
			"location":      eventModel.Location,
			"name":          eventModel.Name,
		}).FirstOrCreate(&eventModel)

	if r.db.Error != nil {
		return models.Event{}, r.db.Error
	}

	return eventModel, nil
}
