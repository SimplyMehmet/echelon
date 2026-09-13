package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type Event struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key"`
	Name         string
	StartsAt     time.Time
	Location     string
	DoublePoints bool
	StartGGID    string   `gorm:"unique"`
	Players      []Player `gorm:"many2many:player_events;"`
	Season       Season
	SeasonID     uuid.UUID
}

// BeforeCreate will set a UUID rather than numeric ID.
func (e *Event) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}

	return nil
}
