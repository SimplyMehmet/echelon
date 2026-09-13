package models

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Player struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key"`
	Name      string    `gorm:"check:length(name) >= 2"`
	Events    []Event   `gorm:"many2many:player_events;"`
	Team      *Team
	TeamID    *uuid.UUID
	StartGGID string `gorm:"unique"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (p *Player) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}

	return nil
}

func (p *Player) MapStartGGDataIntoStruct(data startgg.MappedPlayer, teamID *uuid.UUID) {
	p.StartGGID = data.StartGGID
	p.TeamID = teamID
	p.Name = data.Name
}
