package services

import (
	"echelon.com/repository/sql"
	"echelon.com/services/player"
	"echelon.com/services/team"
)

func New(sqlRepository *sql.Repository) *Services {
	return &Services{
		PlayerService: player.New(sqlRepository),
		TeamService:   team.New(sqlRepository),
	}
}
