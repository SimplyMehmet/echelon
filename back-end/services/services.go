package services

import (
	"echelon.com/repository/sql"
	"echelon.com/services/player"
)

func New(sqlRepository *sql.Repository) *Services {
	return &Services{
		PlayerService: player.New(sqlRepository),
	}
}
