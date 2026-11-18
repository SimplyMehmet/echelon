package models

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Set struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;"`
	Name      string
	Round     int
	StartGGID string `gorm:"unique"`

	Players []Player `gorm:"many2many:player_sets;"`
	EventID uuid.UUID
	Event   Event
}

// BeforeCreate will set a UUID rather than numeric ID.
func (s *Set) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}

	return nil
}

func (s *Set) MapStartGGDataIntoStruct(data startgg.Set) {
	s.StartGGID = data.ID
	s.Name = data.Name
	s.Round = int(data.Round)
}
