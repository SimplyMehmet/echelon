package models

import (
	"github.com/google/uuid"
)

type PlayerSet struct {
	PlayerID uuid.UUID `gorm:"primaryKey"`
	SetID    uuid.UUID `gorm:"primaryKey"`
	Score    int

	Player Player
	Set    Set
}
