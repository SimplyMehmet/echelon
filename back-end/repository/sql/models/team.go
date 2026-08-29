package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Team struct {
	ID      uuid.UUID `gorm:"primaryKey;type:uuid;"`
	Name    string    `gorm:"check:length(name) >= 2"`
	Players []Player
}

// BeforeCreate will set a UUID rather than numeric ID.
func (t *Team) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}

	return nil
}
