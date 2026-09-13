package models

import "github.com/google/uuid"

type PlayerEvent struct {
	PlayerID  uuid.UUID `gorm:"primaryKey;type:uuid"`
	EventID   uuid.UUID `gorm:"primaryKey;type:uuid"`
	Placement int64

	Player Player
	Event  Event
}
