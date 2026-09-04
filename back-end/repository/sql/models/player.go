package models

import (
	"echelon.com/repository/startgg"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Player struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key"`
	Name         string    `gorm:"check:length(name) >= 2"`
	Attended     int64
	ScoreTotal   int64
	ScoreCurrent int64
	Team         *Team
	TeamID       *uuid.UUID
	StartGGID    int64 `gorm:"unique"`
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
	p.Attended = data.Attended
	p.ScoreTotal = data.ScoreTotal
	p.ScoreCurrent = data.ScoreCurr
}
