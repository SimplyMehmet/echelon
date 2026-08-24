package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Player struct {
	ID   uuid.UUID `gorm:"type:uuid;primary_key"`
	Name string    `gorm:"check:length(name) >= 2"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (p *Player) BeforeCreate(tx *gorm.DB) error {
	p.ID = uuid.New()
	return nil
}
