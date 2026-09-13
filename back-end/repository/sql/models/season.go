package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Season struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key"`
	Name      string
	Current   bool
	StartGGID string `gorm:"unique"`
	Events    []Event
}

// BeforeCreate will set a UUID rather than numeric ID.
func (s *Season) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}

	return nil
}
