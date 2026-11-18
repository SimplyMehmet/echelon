package sql

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/google/uuid"
)

func (r *Repository) UpsertStartGGSet(set startgg.Set, eventID uuid.UUID) (models.Set, error) {
	var model models.Set
	// map into model
	model.MapStartGGDataIntoStruct(set)

	r.db.Model(&models.Set{}).
		Where("start_gg_id = ?", set.ID).
		Assign(map[string]interface{}{
			"round":    model.Round,
			"name":     model.Name,
			"event_id": eventID,
		}).FirstOrCreate(&model)

	if r.db.Error != nil {
		return models.Set{}, r.db.Error
	}

	return model, nil
}
