package services

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/services/player"
	"github.com/SimplyMehmet/echelon/back-end/services/season"
	"github.com/SimplyMehmet/echelon/back-end/services/team"
)

func New(sqlRepository *sql.Repository) *Services {
	return &Services{
		PlayerService: player.New(sqlRepository),
		TeamService:   team.New(sqlRepository),
		SeasonService: season.New(sqlRepository),
	}
}
