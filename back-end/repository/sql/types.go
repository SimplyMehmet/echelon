package sql

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

type PlayerWithPlacement struct {
	ID        uuid.UUID            `gorm:"type:uuid;primary_key"`
	Name      string               `gorm:"check:length(name) >= 2"`
	Events    []EventWithPlacement `gorm:"many2many:player_event;"`
	Team      *models.Team
	TeamID    *uuid.UUID
	StartGGID string `gorm:"unique"`
}

type EventWithPlacement struct {
	models.Event
	Placement int64
}
